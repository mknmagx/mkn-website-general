"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import {
  createReceivable,
  CURRENCY,
} from "@/lib/services/finance";
import {
  ArrowLeft,
  Save,
  Calendar,
  DollarSign,
  FileText,
  Building2,
  User,
  ClipboardList,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function NewReceivablePage() {
  const router = useRouter();
  const { user } = useAdminAuth();

  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    customerName: "",
    customerId: "",
    description: "",
    totalAmount: "",
    currency: CURRENCY.TRY,
    issueDate: new Date().toISOString().split("T")[0],
    dueDate: "",
    relatedOrderId: "",
    relatedProformaId: "",
    notes: "",
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validasyon
    if (!formData.customerName.trim()) {
      toast.error("Müşteri adı zorunludur");
      return;
    }
    if (!formData.totalAmount || parseFloat(formData.totalAmount) <= 0) {
      toast.error("Geçerli bir tutar giriniz");
      return;
    }

    setSaving(true);
    try {
      const receivableData = {
        customerName: formData.customerName,
        customerId: formData.customerId || null,
        description: formData.description,
        totalAmount: parseFloat(formData.totalAmount),
        currency: formData.currency,
        issueDate: new Date(formData.issueDate),
        dueDate: formData.dueDate ? new Date(formData.dueDate) : null,
        relatedOrderId: formData.relatedOrderId || null,
        relatedProformaId: formData.relatedProformaId || null,
        notes: formData.notes,
      };

      const result = await createReceivable(receivableData, user?.uid);
      
      if (result.success) {
        toast.success("Alacak kaydı oluşturuldu");
        router.push("/admin/finance/receivables");
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast.error(error.message || "Alacak oluşturulurken bir hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  // Varsayılan vade tarihi: 30 gün sonra
  useEffect(() => {
    if (!formData.dueDate && formData.issueDate) {
      const issueDate = new Date(formData.issueDate);
      issueDate.setDate(issueDate.getDate() + 30);
      setFormData(prev => ({ 
        ...prev, 
        dueDate: issueDate.toISOString().split("T")[0] 
      }));
    }
  }, [formData.issueDate]);

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/finance/receivables">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Yeni Alacak</h1>
          <p className="text-sm text-slate-500">Yeni alacak kaydı oluşturun</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Müşteri Bilgileri */}
        <Card className="bg-white border-slate-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Müşteri Bilgileri
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">Müşteri Adı *</Label>
                <Input
                  id="customerName"
                  value={formData.customerName}
                  onChange={(e) => handleChange("customerName", e.target.value)}
                  placeholder="Müşteri veya firma adı"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="customerId">Müşteri ID</Label>
                <Input
                  id="customerId"
                  value={formData.customerId}
                  onChange={(e) => handleChange("customerId", e.target.value)}
                  placeholder="CRM müşteri ID (opsiyonel)"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Açıklama</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Alacak açıklaması"
              />
            </div>
          </CardContent>
        </Card>

        {/* Tutar Bilgileri */}
        <Card className="bg-white border-slate-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-blue-600" />
              Tutar ve Vade
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="totalAmount">Toplam Tutar *</Label>
                <Input
                  id="totalAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.totalAmount}
                  onChange={(e) => handleChange("totalAmount", e.target.value)}
                  placeholder="0.00"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="currency">Para Birimi *</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) => handleChange("currency", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(CURRENCY).map((curr) => (
                      <SelectItem key={curr} value={curr}>
                        {curr}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="issueDate">Düzenleme Tarihi</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="issueDate"
                    type="date"
                    value={formData.issueDate}
                    onChange={(e) => handleChange("issueDate", e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dueDate">Vade Tarihi</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => handleChange("dueDate", e.target.value)}
                    className="pl-9"
                  />
                </div>
                <p className="text-xs text-slate-500">Varsayılan: 30 gün sonra</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* İlişkili Kayıtlar */}
        <Card className="bg-white border-slate-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-blue-600" />
              İlişkili Kayıtlar
            </CardTitle>
            <CardDescription>Opsiyonel: Sipariş veya proforma ile ilişkilendir</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="relatedOrderId">Sipariş ID</Label>
                <Input
                  id="relatedOrderId"
                  value={formData.relatedOrderId}
                  onChange={(e) => handleChange("relatedOrderId", e.target.value)}
                  placeholder="İlişkili sipariş numarası"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="relatedProformaId">Proforma ID</Label>
                <Input
                  id="relatedProformaId"
                  value={formData.relatedProformaId}
                  onChange={(e) => handleChange("relatedProformaId", e.target.value)}
                  placeholder="İlişkili proforma numarası"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notlar */}
        <Card className="bg-white border-slate-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Ek Notlar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              placeholder="Alacak ile ilgili ek notlar..."
              rows={4}
            />
          </CardContent>
        </Card>

        {/* Buttons */}
        <div className="flex items-center gap-4">
          <Button
            type="submit"
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {saving ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Kaydediliyor...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Alacak Kaydet
              </>
            )}
          </Button>
          <Link href="/admin/finance/receivables">
            <Button type="button" variant="outline">
              İptal
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
