"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { getDocuments } from "@/lib/firestore";
import {
  createTransaction,
  getAccounts,
  TRANSACTION_TYPE,
  TRANSACTION_STATUS,
  INCOME_CATEGORY,
  CURRENCY,
  getIncomeCategoryLabel,
  getCurrencyLabel,
} from "@/lib/services/finance";
import {
  ArrowLeft,
  Save,
  ArrowUpCircle,
  Calendar,
  User,
  Building2,
  FileText,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

export default function NewIncomePage() {
  const router = useRouter();
  const { user } = useAdminAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [useCustomerSelect, setUseCustomerSelect] = useState(true);
  const [formData, setFormData] = useState({
    category: INCOME_CATEGORY.SALES,
    amount: "",
    currency: CURRENCY.TRY,
    accountId: "",
    transactionDate: new Date().toISOString().split("T")[0],
    description: "",
    customerName: "",
    companyName: "",
    reference: "",
    notes: "",
    status: TRANSACTION_STATUS.COMPLETED,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Hesapları yükle
      const result = await getAccounts();
      if (result.success) {
        setAccounts(result.data);
        // Varsayılan hesabı seç
        const defaultAcc = result.data.find((a) => a.isDefault && a.currency === CURRENCY.TRY);
        if (defaultAcc) {
          setFormData((prev) => ({ ...prev, accountId: defaultAcc.id }));
        } else if (result.data.length > 0) {
          setFormData((prev) => ({ ...prev, accountId: result.data[0].id }));
        }
      }

      // Müşterileri yükle
      try {
        const customersData = await getDocuments("crm_customers");
        setCustomers(customersData || []);
      } catch (error) {
        // Silent fail - customers optional
      }
    } catch (error) {
      // Silent fail - will show empty dropdown
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    // Para birimi değişince hesap listesini filtrele
    if (field === "currency") {
      const matchingAccount = accounts.find((a) => a.currency === value && a.isDefault);
      if (matchingAccount) {
        setFormData((prev) => ({ ...prev, [field]: value, accountId: matchingAccount.id }));
      }
    }
  };

  // Müşteri seçildiğinde müşteri adını güncelle
  const handleCustomerSelect = (customerId) => {
    if (customerId === "manual") {
      setUseCustomerSelect(false);
      setFormData(prev => ({ ...prev, customerName: "", companyName: "" }));
    } else if (customerId === "none") {
      setFormData(prev => ({ ...prev, customerName: "", companyName: "" }));
    } else {
      const selectedCustomer = customers.find(c => c.id === customerId);
      if (selectedCustomer) {
        setFormData(prev => ({
          ...prev,
          customerName: selectedCustomer.name || '',
          companyName: selectedCustomer.company || '',
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error("Geçerli bir tutar giriniz");
      return;
    }

    if (!formData.accountId) {
      toast.error("Lütfen bir hesap seçiniz");
      return;
    }

    setSaving(true);
    try {
      const selectedAccount = accounts.find((a) => a.id === formData.accountId);
      
      const result = await createTransaction(
        {
          type: TRANSACTION_TYPE.INCOME,
          ...formData,
          amount: parseFloat(formData.amount),
          accountName: selectedAccount?.name || "",
          transactionDate: new Date(formData.transactionDate),
        },
        user?.uid
      );

      if (result.success) {
        toast.success(`Gelir kaydı oluşturuldu: ${result.transactionNumber}`);
        router.push("/admin/finance/income");
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  // Seçilen para birimine göre hesapları filtrele
  const filteredAccounts = accounts.filter((a) => a.currency === formData.currency);

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
      <div className="flex items-center gap-4">
        <Link href="/admin/finance/income">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Yeni Gelir</h1>
          <p className="text-sm text-slate-500">
            Yeni bir gelir kaydı oluşturun
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Temel Bilgiler */}
        <Card className="bg-white border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ArrowUpCircle className="w-5 h-5 text-emerald-600" />
              Gelir Bilgileri
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Kategori *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleChange("category", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(INCOME_CATEGORY).map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {getIncomeCategoryLabel(cat)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="transactionDate">Tarih *</Label>
                <Input
                  id="transactionDate"
                  type="date"
                  value={formData.transactionDate}
                  onChange={(e) => handleChange("transactionDate", e.target.value)}
                />
              </div>
            </div>

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
                <Label htmlFor="accountId">Hesap *</Label>
                <Select
                  value={formData.accountId}
                  onValueChange={(value) => handleChange("accountId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Hesap seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredAccounts.map((acc) => (
                      <SelectItem key={acc.id} value={acc.id}>
                        {acc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {filteredAccounts.length === 0 && (
                  <p className="text-xs text-red-500">
                    Bu para birimi için hesap bulunamadı
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Açıklama</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Gelir açıklaması"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Durum</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TRANSACTION_STATUS.COMPLETED}>Tamamlandı</SelectItem>
                  <SelectItem value={TRANSACTION_STATUS.PENDING}>Beklemede</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* İlişkili Bilgiler */}
        <Card className="bg-white border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Müşteri / Kaynak Bilgileri
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="customerName">Müşteri / Kişi Adı</Label>
                  {!useCustomerSelect && customers.length > 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setUseCustomerSelect(true)}
                      className="h-6 text-xs text-blue-600"
                    >
                      <User className="w-3 h-3 mr-1" />
                      Listeden Seç
                    </Button>
                  )}
                </div>
                {useCustomerSelect && customers.length > 0 ? (
                  <Select
                    value={formData.customerName ? customers.find(c => c.name === formData.customerName)?.id || "none" : "none"}
                    onValueChange={handleCustomerSelect}
                  >
                    <SelectTrigger className="border-slate-300">
                      <SelectValue placeholder="Müşteri seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Seçilmedi</SelectItem>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name}{customer.company ? ` - ${customer.company}` : ''}
                        </SelectItem>
                      ))}
                      <SelectItem value="manual" className="text-blue-600">
                        Manuel Giriş Yap
                      </SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id="customerName"
                    value={formData.customerName}
                    onChange={(e) => handleChange("customerName", e.target.value)}
                    placeholder="Müşteri adı"
                  />
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyName">Firma Adı</Label>
                {useCustomerSelect && customers.length > 0 ? (
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    readOnly
                    placeholder="Müşteri seçince otomatik dolar"
                    className="bg-slate-50"
                  />
                ) : (
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => handleChange("companyName", e.target.value)}
                    placeholder="Firma adı"
                  />
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reference">Referans No</Label>
              <Input
                id="reference"
                value={formData.reference}
                onChange={(e) => handleChange("reference", e.target.value)}
                placeholder="Fatura no, sipariş no vb."
              />
            </div>
          </CardContent>
        </Card>

        {/* Notlar */}
        <Card className="bg-white border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg">Notlar</CardTitle>
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

        {/* Kaydet */}
        <div className="flex items-center justify-end gap-3">
          <Link href="/admin/finance/income">
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
    </div>
  );
}
