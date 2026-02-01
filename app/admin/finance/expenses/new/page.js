"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import {
  createTransaction,
  getAccounts,
  getPersonnelList,
  getExpenseCategoryLabel,
  TRANSACTION_TYPE,
  EXPENSE_CATEGORY,
  EXPENSE_CATEGORY_GROUPS,
  CURRENCY,
} from "@/lib/services/finance";
import {
  ArrowLeft,
  Save,
  Calendar,
  DollarSign,
  FileText,
  Building2,
  Tag,
  CreditCard,
  User,
  RefreshCw,
  Users,
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
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";

// Personel ile ilgili kategoriler
const PERSONNEL_CATEGORIES = [
  EXPENSE_CATEGORY.SALARY,
  EXPENSE_CATEGORY.ADVANCE,
  EXPENSE_CATEGORY.BONUS,
  EXPENSE_CATEGORY.SSK,
];

export default function NewExpensePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAdminAuth();

  const [accounts, setAccounts] = useState([]);
  const [personnelList, setPersonnelList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // URL'den gelen parametreleri al
  const initialCategory = searchParams.get('category') || '';
  const initialPersonnelId = searchParams.get('personnelId') || '';
  
  const [formData, setFormData] = useState({
    category: initialCategory,
    description: "",
    amount: "",
    currency: CURRENCY.TRY,
    accountId: "",
    transactionDate: new Date().toISOString().split("T")[0],
    supplierName: "",
    personnelId: initialPersonnelId,
    personnelName: "",
    reference: "",
    notes: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Hesapları yükle
      const accountResult = await getAccounts({ isActive: true });
      if (accountResult.success) {
        setAccounts(accountResult.data);
        // İlk aktif hesabı varsayılan olarak seç
        if (accountResult.data.length > 0) {
          setFormData(prev => ({ ...prev, accountId: accountResult.data[0].id }));
        }
      }
      
      // Personelleri yükle
      const personnelResult = await getPersonnelList();
      if (personnelResult.success) {
        setPersonnelList(personnelResult.data || []);
        
        // URL'den gelen personnelId varsa personel adını ayarla
        if (initialPersonnelId) {
          const selectedPersonnel = personnelResult.data?.find(p => p.id === initialPersonnelId);
          if (selectedPersonnel) {
            setFormData(prev => ({
              ...prev,
              personnelName: `${selectedPersonnel.firstName} ${selectedPersonnel.lastName}`,
            }));
          }
        }
      }
    } catch (error) {
      // Silent fail - dropdowns will be empty
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Kategori değiştiğinde ve personel kategorisi değilse personel bilgilerini temizle
      if (field === 'category' && !PERSONNEL_CATEGORIES.includes(value)) {
        updated.personnelId = '';
        updated.personnelName = '';
      }
      
      return updated;
    });
  };

  // Personel seçildiğinde personel adını da güncelle
  const handlePersonnelSelect = (personnelId) => {
    const selectedPersonnel = personnelList.find(p => p.id === personnelId);
    setFormData(prev => ({
      ...prev,
      personnelId,
      personnelName: selectedPersonnel ? `${selectedPersonnel.firstName} ${selectedPersonnel.lastName}` : '',
    }));
  };

  // Personel kategorisi mi kontrol et
  const isPersonnelCategory = PERSONNEL_CATEGORIES.includes(formData.category);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validasyon
    if (!formData.category) {
      toast.error("Kategori seçiniz");
      return;
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error("Geçerli bir tutar giriniz");
      return;
    }
    if (!formData.accountId) {
      toast.error("Hesap seçiniz");
      return;
    }

    setSaving(true);
    try {
      const selectedAccount = accounts.find(a => a.id === formData.accountId);
      
      const transactionData = {
        type: TRANSACTION_TYPE.EXPENSE,
        category: formData.category,
        description: formData.description,
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        accountId: formData.accountId,
        accountName: selectedAccount?.name || "",
        transactionDate: new Date(formData.transactionDate),
        supplierName: formData.supplierName,
        personnelId: formData.personnelId || null,
        personnelName: formData.personnelName,
        reference: formData.reference,
        notes: formData.notes,
      };

      const result = await createTransaction(transactionData, user?.uid);
      
      if (result.success) {
        toast.success("Gider kaydı oluşturuldu");
        router.push("/admin/finance/expenses");
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast.error(error.message || "Gider oluşturulurken bir hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6 max-w-3xl">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[600px]" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/finance/expenses">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Yeni Gider</h1>
          <p className="text-sm text-slate-500">Yeni gider kaydı oluşturun</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Kategori ve Tarih */}
        <Card className="bg-white border-slate-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Tag className="w-5 h-5 text-red-600" />
              Gider Bilgileri
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
                    <SelectValue placeholder="Kategori seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPENSE_CATEGORY_GROUPS.map((group) => (
                      <SelectGroup key={group.id}>
                        <SelectLabel>{group.label}</SelectLabel>
                        {group.categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {getExpenseCategoryLabel(cat)}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="transactionDate">İşlem Tarihi *</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="transactionDate"
                    type="date"
                    value={formData.transactionDate}
                    onChange={(e) => handleChange("transactionDate", e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Açıklama</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Gider açıklaması"
              />
            </div>
          </CardContent>
        </Card>

        {/* Tutar ve Hesap */}
        <Card className="bg-white border-slate-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-red-600" />
              Tutar Bilgileri
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
                <Label htmlFor="accountId">Hesap *</Label>
                <Select
                  value={formData.accountId}
                  onValueChange={(value) => handleChange("accountId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Hesap seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name} ({account.currency})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tedarikçi / Personel */}
        <Card className="bg-white border-slate-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              {isPersonnelCategory ? (
                <Users className="w-5 h-5 text-red-600" />
              ) : (
                <Building2 className="w-5 h-5 text-red-600" />
              )}
              İlişkili Bilgiler
            </CardTitle>
            <CardDescription>
              {isPersonnelCategory 
                ? "Personel gideri için personel seçimi yapın" 
                : "Opsiyonel: Tedarikçi veya personel bilgisi"
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Personel kategorisi seçiliyse personel dropdown */}
            {isPersonnelCategory && (
              <div className="space-y-2">
                <Label htmlFor="personnelId">Personel *</Label>
                <Select
                  value={formData.personnelId}
                  onValueChange={handlePersonnelSelect}
                >
                  <SelectTrigger className="border-slate-300">
                    <SelectValue placeholder="Personel seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {personnelList.map((person) => (
                      <SelectItem key={person.id} value={person.id}>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-slate-400" />
                          <span>{person.firstName} {person.lastName}</span>
                          {person.department && (
                            <span className="text-xs text-slate-500">({person.department})</span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                    {personnelList.length === 0 && (
                      <div className="p-2 text-sm text-slate-500 text-center">
                        Personel bulunamadı
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Personel kategorisi değilse tedarikçi ve personel alanları */}
            {!isPersonnelCategory && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="supplierName">Tedarikçi / Firma</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="supplierName"
                      value={formData.supplierName}
                      onChange={(e) => handleChange("supplierName", e.target.value)}
                      placeholder="Tedarikçi adı"
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="personnelName">Personel</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="personnelName"
                      value={formData.personnelName}
                      onChange={(e) => handleChange("personnelName", e.target.value)}
                      placeholder="Personel adı"
                      className="pl-9"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="reference">Referans / Fatura No</Label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  id="reference"
                  value={formData.reference}
                  onChange={(e) => handleChange("reference", e.target.value)}
                  placeholder="Fatura numarası veya referans"
                  className="pl-9"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notlar */}
        <Card className="bg-white border-slate-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5 text-red-600" />
              Ek Notlar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              placeholder="Gider ile ilgili ek notlar..."
              rows={4}
            />
          </CardContent>
        </Card>

        {/* Buttons */}
        <div className="flex items-center gap-4">
          <Button
            type="submit"
            disabled={saving}
            className="bg-red-600 hover:bg-red-700"
          >
            {saving ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Kaydediliyor...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Gider Kaydet
              </>
            )}
          </Button>
          <Link href="/admin/finance/expenses">
            <Button type="button" variant="outline">
              İptal
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
