"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import {
  createAccount,
  ACCOUNT_TYPE,
  CURRENCY,
  getAccountTypeLabel,
  getCurrencyLabel,
} from "@/lib/services/finance";
import {
  ArrowLeft,
  Save,
  Wallet,
  Building2,
  CreditCard,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function NewAccountPage() {
  const router = useRouter();
  const { user } = useAdminAuth();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: ACCOUNT_TYPE.BANK,
    currency: CURRENCY.TRY,
    bankName: "",
    iban: "",
    accountNumber: "",
    branchCode: "",
    initialBalance: "",
    isDefault: false,
    description: "",
    notes: "",
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast.error("Hesap adı zorunludur");
      return;
    }

    setLoading(true);
    try {
      const result = await createAccount(
        {
          ...formData,
          initialBalance: parseFloat(formData.initialBalance) || 0,
        },
        user?.uid
      );

      if (result.success) {
        toast.success("Hesap oluşturuldu");
        router.push("/admin/finance/accounts");
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const showBankFields = [ACCOUNT_TYPE.BANK, ACCOUNT_TYPE.CREDIT_CARD].includes(formData.type);

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/finance/accounts">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Yeni Hesap</h1>
          <p className="text-sm text-slate-500">
            Yeni bir finansal hesap tanımlayın
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Temel Bilgiler */}
        <Card className="bg-white border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Wallet className="w-5 h-5 text-emerald-600" />
              Temel Bilgiler
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Hesap Adı *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Örn: Ana Kasa, İş Bankası TL"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Hesap Türü</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleChange("type", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(ACCOUNT_TYPE).map((type) => (
                      <SelectItem key={type} value={type}>
                        {getAccountTypeLabel(type)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currency">Para Birimi</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) => handleChange("currency", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(CURRENCY).map((currency) => (
                      <SelectItem key={currency} value={currency}>
                        {getCurrencyLabel(currency)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="initialBalance">Açılış Bakiyesi</Label>
                <Input
                  id="initialBalance"
                  type="number"
                  step="0.01"
                  value={formData.initialBalance}
                  onChange={(e) => handleChange("initialBalance", e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <Label htmlFor="isDefault" className="font-medium">Varsayılan Hesap</Label>
                <p className="text-xs text-slate-500 mt-1">
                  Bu para birimi için varsayılan hesap olarak ayarla
                </p>
              </div>
              <Switch
                id="isDefault"
                checked={formData.isDefault}
                onCheckedChange={(checked) => handleChange("isDefault", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Banka Bilgileri */}
        {showBankFields && (
          <Card className="bg-white border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                Banka Bilgileri
              </CardTitle>
              <CardDescription>
                Banka hesabı veya kredi kartı için ek bilgiler
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bankName">Banka Adı</Label>
                  <Input
                    id="bankName"
                    value={formData.bankName}
                    onChange={(e) => handleChange("bankName", e.target.value)}
                    placeholder="Örn: Türkiye İş Bankası"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="branchCode">Şube Kodu</Label>
                  <Input
                    id="branchCode"
                    value={formData.branchCode}
                    onChange={(e) => handleChange("branchCode", e.target.value)}
                    placeholder="Örn: 1234"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="iban">IBAN</Label>
                <Input
                  id="iban"
                  value={formData.iban}
                  onChange={(e) => handleChange("iban", e.target.value.toUpperCase())}
                  placeholder="TR00 0000 0000 0000 0000 0000 00"
                  className="font-mono"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountNumber">Hesap Numarası</Label>
                <Input
                  id="accountNumber"
                  value={formData.accountNumber}
                  onChange={(e) => handleChange("accountNumber", e.target.value)}
                  placeholder="Hesap numarası"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notlar */}
        <Card className="bg-white border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg">Açıklama & Notlar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">Açıklama</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Kısa açıklama"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notlar</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                placeholder="Ek notlar..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Kaydet */}
        <div className="flex items-center justify-end gap-3">
          <Link href="/admin/finance/accounts">
            <Button type="button" variant="outline">
              İptal
            </Button>
          </Link>
          <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700">
            <Save className="w-4 h-4 mr-2" />
            {loading ? "Kaydediliyor..." : "Kaydet"}
          </Button>
        </div>
      </form>
    </div>
  );
}
