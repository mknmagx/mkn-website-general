"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import {
  getAccount,
  updateAccount,
  deleteAccount,
  ACCOUNT_TYPE,
  ACCOUNT_MODE,
  CURRENCY,
  ALL_CURRENCIES,
  getAccountTypeLabel,
  getCurrencyLabel,
  getCurrencySymbol,
  formatCurrency,
} from "@/lib/services/finance";
import {
  ArrowLeft,
  Save,
  Wallet,
  Building2,
  Trash2,
  Globe,
  Coins,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function EditAccountPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAdminAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [accountData, setAccountData] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    type: ACCOUNT_TYPE.BANK,
    mode: ACCOUNT_MODE.SINGLE,
    currency: CURRENCY.TRY,
    supportedCurrencies: [],
    bankName: "",
    iban: "",
    accountNumber: "",
    branchCode: "",
    currentBalance: 0,
    balances: {},
    isDefault: false,
    description: "",
    notes: "",
  });

  useEffect(() => {
    loadAccount();
  }, [params.id]);

  const loadAccount = async () => {
    setLoading(true);
    try {
      const result = await getAccount(params.id);
      if (result.success) {
        setAccountData(result.data);
        setFormData({
          name: result.data.name || "",
          type: result.data.type || ACCOUNT_TYPE.BANK,
          mode: result.data.mode || ACCOUNT_MODE.SINGLE,
          currency: result.data.currency || CURRENCY.TRY,
          supportedCurrencies: result.data.supportedCurrencies || [result.data.currency || CURRENCY.TRY],
          bankName: result.data.bankName || "",
          iban: result.data.iban || "",
          accountNumber: result.data.accountNumber || "",
          branchCode: result.data.branchCode || "",
          currentBalance: result.data.currentBalance || 0,
          balances: result.data.balances || {},
          isDefault: result.data.isDefault || false,
          description: result.data.description || "",
          notes: result.data.notes || "",
        });
      } else {
        toast.error("Hesap bulunamadı");
        router.push("/admin/finance/accounts");
      }
    } catch (error) {
      toast.error("Hesap yüklenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast.error("Hesap adı zorunludur");
      return;
    }

    setSaving(true);
    try {
      const { currentBalance, ...updateData } = formData;
      const result = await updateAccount(params.id, updateData, user?.uid);

      if (result.success) {
        toast.success("Hesap güncellendi");
        router.push(`/admin/finance/accounts/${params.id}`);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      const result = await deleteAccount(params.id, user?.uid);
      if (result.success) {
        toast.success("Hesap silindi");
        router.push("/admin/finance/accounts");
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast.error(error.message);
    }
    setDeleteDialogOpen(false);
  };

  const showBankFields = [ACCOUNT_TYPE.BANK, ACCOUNT_TYPE.CREDIT_CARD].includes(formData.type);

  if (loading) {
    return (
      <div className="p-6 max-w-3xl mx-auto space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/admin/finance/accounts/${params.id}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Hesap Düzenle</h1>
            <p className="text-sm text-slate-500">{formData.name}</p>
          </div>
        </div>
        <Button
          variant="outline"
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={() => setDeleteDialogOpen(true)}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Sil
        </Button>
      </div>

      {/* Güncel Bakiye */}
      {formData.mode === ACCOUNT_MODE.MULTI && Object.keys(formData.balances).length > 0 ? (
        <Card className="bg-gradient-to-r from-emerald-50 to-blue-50 border-emerald-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-emerald-600" />
                <p className="text-sm font-medium text-emerald-700">Çoklu Döviz Bakiyeleri</p>
              </div>
              <Badge variant="outline" className="bg-white">
                {formData.supportedCurrencies?.length || 0} döviz
              </Badge>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {ALL_CURRENCIES.map((currency) => {
                const balance = formData.balances[currency] || 0;
                const isSupported = formData.supportedCurrencies?.includes(currency);
                if (!isSupported && balance === 0) return null;
                
                return (
                  <div 
                    key={currency} 
                    className={`p-3 rounded-lg ${
                      balance !== 0 ? 'bg-white' : 'bg-slate-50'
                    }`}
                  >
                    <p className="text-xs text-slate-500 mb-1">{getCurrencyLabel(currency)}</p>
                    <p className={`text-lg font-bold ${
                      balance > 0 ? 'text-emerald-700' : 
                      balance < 0 ? 'text-red-600' : 'text-slate-400'
                    }`}>
                      {formatCurrency(balance, currency)}
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-emerald-50 border-emerald-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-700">Güncel Bakiye</p>
                <p className="text-3xl font-bold text-emerald-800">
                  {formatCurrency(formData.currentBalance, formData.currency)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                <Wallet className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
            {/* Hesap Modu Gösterimi */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              {formData.mode === ACCOUNT_MODE.MULTI ? (
                <>
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Globe className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Çoklu Döviz Hesabı</p>
                    <p className="text-xs text-slate-500">
                      {formData.supportedCurrencies?.length || 0} para birimi destekleniyor
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <Coins className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Tek Döviz Hesabı</p>
                    <p className="text-xs text-slate-500">
                      {getCurrencyLabel(formData.currency)}
                    </p>
                  </div>
                </>
              )}
            </div>

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
                  disabled
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
                <p className="text-xs text-slate-500">
                  Para birimi değiştirilemez
                </p>
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
          <Link href={`/admin/finance/accounts/${params.id}`}>
            <Button type="button" variant="outline">
              İptal
            </Button>
          </Link>
          <Button type="submit" disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Kaydediliyor..." : "Kaydet"}
          </Button>
        </div>
      </form>

      {/* Silme Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hesabı Sil</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{formData.name}</strong> hesabını silmek istediğinize emin misiniz?
              Bu işlem geri alınamaz ve mevcut bakiye: <strong>{formatCurrency(formData.currentBalance, formData.currency)}</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
