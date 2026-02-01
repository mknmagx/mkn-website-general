"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import {
  createAdvance,
  getPersonnelList,
  getAccounts,
  PERSONNEL_STATUS,
  CURRENCY,
} from "@/lib/services/finance";
import {
  ArrowLeft,
  Save,
  Calendar,
  DollarSign,
  User,
  FileText,
  CreditCard,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function NewAdvancePage() {
  const router = useRouter();
  const { user } = useAdminAuth();

  const [personnel, setPersonnel] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    personnelId: "",
    amount: "",
    currency: CURRENCY.TRY,
    requestDate: new Date().toISOString().split("T")[0],
    reason: "",
    accountId: "",
    notes: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [personnelResult, accountsResult] = await Promise.all([
        getPersonnelList({ status: PERSONNEL_STATUS.ACTIVE }),
        getAccounts({ isActive: true }),
      ]);

      if (personnelResult.success) {
        setPersonnel(personnelResult.data);
      }
      if (accountsResult.success) {
        setAccounts(accountsResult.data);
      }
    } catch (error) {
      // Silent fail - dropdowns will be empty
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Personel seçildiğinde para birimini otomatik ayarla
  const handlePersonnelSelect = (personnelId) => {
    handleChange("personnelId", personnelId);
    const selected = personnel.find(p => p.id === personnelId);
    if (selected?.salaryCurrency) {
      handleChange("currency", selected.salaryCurrency);
    }
  };

  const selectedPersonnel = personnel.find(p => p.id === formData.personnelId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validasyon
    if (!formData.personnelId) {
      toast.error("Personel seçiniz");
      return;
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error("Geçerli bir tutar giriniz");
      return;
    }

    setSaving(true);
    try {
      const advanceData = {
        personnelId: formData.personnelId,
        personnelName: selectedPersonnel ? `${selectedPersonnel.firstName} ${selectedPersonnel.lastName}` : "",
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        requestDate: new Date(formData.requestDate),
        reason: formData.reason,
        accountId: formData.accountId || null,
        notes: formData.notes,
      };

      const result = await createAdvance(advanceData, user?.uid);
      
      if (result.success) {
        toast.success("Avans talebi oluşturuldu");
        router.push("/admin/finance/advances");
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast.error(error.message || "Avans oluşturulurken bir hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6 max-w-3xl">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/finance/advances">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Yeni Avans</h1>
          <p className="text-sm text-slate-500">Personel avans talebi oluşturun</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personel */}
        <Card className="bg-white border-slate-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="w-5 h-5 text-cyan-600" />
              Personel
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="personnelId">Personel Seçin *</Label>
              <Select
                value={formData.personnelId || ""}
                onValueChange={handlePersonnelSelect}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Personel seçin" />
                </SelectTrigger>
                <SelectContent>
                  {personnel.filter(person => person.id).map((person) => (
                    <SelectItem key={person.id} value={person.id}>
                      {person.firstName} {person.lastName} - {person.position || "Pozisyon yok"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tutar */}
        <Card className="bg-white border-slate-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-cyan-600" />
              Avans Tutarı
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Tutar *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => handleChange("amount", e.target.value)}
                  placeholder="0.00"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="currency">Para Birimi *</Label>
                <Select
                  value={formData.currency || CURRENCY.TRY}
                  onValueChange={(value) => handleChange("currency", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(CURRENCY).filter(curr => curr).map((curr) => (
                      <SelectItem key={curr} value={curr}>
                        {curr}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="requestDate">Talep Tarihi *</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="requestDate"
                    type="date"
                    value={formData.requestDate}
                    onChange={(e) => handleChange("requestDate", e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sebep */}
        <Card className="bg-white border-slate-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5 text-cyan-600" />
              Avans Sebebi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="reason">Sebep</Label>
              <Textarea
                id="reason"
                value={formData.reason}
                onChange={(e) => handleChange("reason", e.target.value)}
                placeholder="Avans talep sebebi..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Ödeme Hesabı */}
        <Card className="bg-white border-slate-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-cyan-600" />
              Ödeme Bilgileri
            </CardTitle>
            <CardDescription>Ödemenin yapılacağı hesap (opsiyonel)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="accountId">Ödeme Hesabı</Label>
              <Select
                value={formData.accountId || "none"}
                onValueChange={(value) => handleChange("accountId", value === "none" ? "" : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Hesap seçin (opsiyonel)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Seçilmedi</SelectItem>
                  {accounts.filter(account => account.id).map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name} ({account.currency})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Notlar */}
        <Card className="bg-white border-slate-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5 text-cyan-600" />
              Ek Notlar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              placeholder="Ek notlar..."
              rows={3}
            />
          </CardContent>
        </Card>

        {/* Buttons */}
        <div className="flex items-center gap-4">
          <Button
            type="submit"
            disabled={saving}
            className="bg-cyan-600 hover:bg-cyan-700"
          >
            {saving ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Kaydediliyor...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Avans Kaydet
              </>
            )}
          </Button>
          <Link href="/admin/finance/advances">
            <Button type="button" variant="outline">
              İptal
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
