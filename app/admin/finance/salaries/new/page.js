"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import {
  createSalary,
  getPersonnelList,
  getAccounts,
  formatCurrency,
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
  Calculator,
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

const MONTHS = [
  { value: 1, label: "Ocak" },
  { value: 2, label: "Şubat" },
  { value: 3, label: "Mart" },
  { value: 4, label: "Nisan" },
  { value: 5, label: "Mayıs" },
  { value: 6, label: "Haziran" },
  { value: 7, label: "Temmuz" },
  { value: 8, label: "Ağustos" },
  { value: 9, label: "Eylül" },
  { value: 10, label: "Ekim" },
  { value: 11, label: "Kasım" },
  { value: 12, label: "Aralık" },
];

export default function NewSalaryPage() {
  const router = useRouter();
  const { user } = useAdminAuth();

  const [personnel, setPersonnel] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const currentDate = new Date();
  const [formData, setFormData] = useState({
    personnelId: "",
    month: currentDate.getMonth() + 1,
    year: currentDate.getFullYear(),
    grossSalary: "",
    deductions: {
      sgk: "",
      tax: "",
      advance: "",
      other: "",
    },
    bonuses: {
      performance: "",
      overtime: "",
      other: "",
    },
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
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDeductionChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      deductions: { ...prev.deductions, [field]: value }
    }));
  };

  const handleBonusChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      bonuses: { ...prev.bonuses, [field]: value }
    }));
  };

  // Personel seçildiğinde maaşı otomatik doldur
  const handlePersonnelSelect = (personnelId) => {
    handleChange("personnelId", personnelId);
    const selected = personnel.find(p => p.id === personnelId);
    if (selected?.baseSalary) {
      handleChange("grossSalary", String(selected.baseSalary));
    }
  };

  // Hesaplamalar
  const calculations = {
    grossSalary: parseFloat(formData.grossSalary) || 0,
    totalDeductions: 
      (parseFloat(formData.deductions.sgk) || 0) +
      (parseFloat(formData.deductions.tax) || 0) +
      (parseFloat(formData.deductions.advance) || 0) +
      (parseFloat(formData.deductions.other) || 0),
    totalBonuses:
      (parseFloat(formData.bonuses.performance) || 0) +
      (parseFloat(formData.bonuses.overtime) || 0) +
      (parseFloat(formData.bonuses.other) || 0),
  };
  calculations.netSalary = calculations.grossSalary - calculations.totalDeductions + calculations.totalBonuses;

  const selectedPersonnel = personnel.find(p => p.id === formData.personnelId);
  const currency = selectedPersonnel?.salaryCurrency || CURRENCY.TRY;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validasyon
    if (!formData.personnelId) {
      toast.error("Personel seçiniz");
      return;
    }
    if (!formData.grossSalary || parseFloat(formData.grossSalary) <= 0) {
      toast.error("Geçerli bir maaş giriniz");
      return;
    }

    setSaving(true);
    try {
      const salaryData = {
        personnelId: formData.personnelId,
        personnelName: selectedPersonnel ? `${selectedPersonnel.firstName} ${selectedPersonnel.lastName}` : "",
        month: formData.month,
        year: formData.year,
        grossSalary: parseFloat(formData.grossSalary),
        currency: currency,
        deductions: {
          sgk: parseFloat(formData.deductions.sgk) || 0,
          tax: parseFloat(formData.deductions.tax) || 0,
          advance: parseFloat(formData.deductions.advance) || 0,
          other: parseFloat(formData.deductions.other) || 0,
        },
        bonuses: {
          performance: parseFloat(formData.bonuses.performance) || 0,
          overtime: parseFloat(formData.bonuses.overtime) || 0,
          other: parseFloat(formData.bonuses.other) || 0,
        },
        totalDeductions: calculations.totalDeductions,
        totalBonuses: calculations.totalBonuses,
        netSalary: calculations.netSalary,
        accountId: formData.accountId || null,
        notes: formData.notes,
      };

      const result = await createSalary(salaryData, user?.uid);
      
      if (result.success) {
        toast.success("Maaş kaydı oluşturuldu");
        router.push("/admin/finance/salaries");
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast.error(error.message || "Maaş oluşturulurken bir hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  // Yıl listesi
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 3 }, (_, i) => currentYear - i + 1);

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
        <Link href="/admin/finance/salaries">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Yeni Maaş</h1>
          <p className="text-sm text-slate-500">Maaş kaydı oluşturun</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personel ve Dönem */}
        <Card className="bg-white border-slate-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-600" />
              Personel ve Dönem
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="personnelId">Personel *</Label>
              <Select
                value={formData.personnelId}
                onValueChange={handlePersonnelSelect}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Personel seçin" />
                </SelectTrigger>
                <SelectContent>
                  {personnel.map((person) => (
                    <SelectItem key={person.id} value={person.id}>
                      {person.firstName} {person.lastName} - {person.position || "Pozisyon yok"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="month">Ay *</Label>
                <Select
                  value={String(formData.month)}
                  onValueChange={(value) => handleChange("month", parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((month) => (
                      <SelectItem key={month.value} value={String(month.value)}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="year">Yıl *</Label>
                <Select
                  value={String(formData.year)}
                  onValueChange={(value) => handleChange("year", parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={String(year)}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Maaş */}
        <Card className="bg-white border-slate-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-indigo-600" />
              Brüt Maaş
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="grossSalary">Brüt Maaş ({currency}) *</Label>
              <Input
                id="grossSalary"
                type="number"
                step="0.01"
                min="0"
                value={formData.grossSalary}
                onChange={(e) => handleChange("grossSalary", e.target.value)}
                placeholder="0.00"
              />
            </div>
          </CardContent>
        </Card>

        {/* Kesintiler */}
        <Card className="bg-white border-slate-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2 text-red-600">
              <Calculator className="w-5 h-5" />
              Kesintiler
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sgk">SGK Primi</Label>
                <Input
                  id="sgk"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.deductions.sgk}
                  onChange={(e) => handleDeductionChange("sgk", e.target.value)}
                  placeholder="0.00"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tax">Gelir Vergisi</Label>
                <Input
                  id="tax"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.deductions.tax}
                  onChange={(e) => handleDeductionChange("tax", e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="advance">Avans Kesintisi</Label>
                <Input
                  id="advance"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.deductions.advance}
                  onChange={(e) => handleDeductionChange("advance", e.target.value)}
                  placeholder="0.00"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="otherDeduction">Diğer Kesintiler</Label>
                <Input
                  id="otherDeduction"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.deductions.other}
                  onChange={(e) => handleDeductionChange("other", e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ek Ödemeler */}
        <Card className="bg-white border-slate-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2 text-emerald-600">
              <Calculator className="w-5 h-5" />
              Ek Ödemeler
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="performance">Performans Primi</Label>
                <Input
                  id="performance"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.bonuses.performance}
                  onChange={(e) => handleBonusChange("performance", e.target.value)}
                  placeholder="0.00"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="overtime">Fazla Mesai</Label>
                <Input
                  id="overtime"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.bonuses.overtime}
                  onChange={(e) => handleBonusChange("overtime", e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="otherBonus">Diğer</Label>
                <Input
                  id="otherBonus"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.bonuses.other}
                  onChange={(e) => handleBonusChange("other", e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Hesap Özeti */}
        <Card className="bg-indigo-50 border-indigo-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-indigo-800">Hesap Özeti</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Brüt Maaş</span>
                <span className="font-medium">{formatCurrency(calculations.grossSalary, currency)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-red-600">Kesintiler (-)</span>
                <span className="font-medium text-red-600">-{formatCurrency(calculations.totalDeductions, currency)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-emerald-600">Ek Ödemeler (+)</span>
                <span className="font-medium text-emerald-600">+{formatCurrency(calculations.totalBonuses, currency)}</span>
              </div>
              <hr className="border-indigo-200" />
              <div className="flex justify-between text-lg font-bold">
                <span className="text-indigo-800">Net Maaş</span>
                <span className="text-indigo-800">{formatCurrency(calculations.netSalary, currency)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ödeme Hesabı */}
        <Card className="bg-white border-slate-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-indigo-600" />
              Ödeme Bilgileri
            </CardTitle>
            <CardDescription>Ödemenin yapılacağı hesap (opsiyonel)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="accountId">Ödeme Hesabı</Label>
              <Select
                value={formData.accountId}
                onValueChange={(value) => handleChange("accountId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Hesap seçin (opsiyonel)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Seçilmedi</SelectItem>
                  {accounts.map((account) => (
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
              <FileText className="w-5 h-5 text-indigo-600" />
              Ek Notlar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              placeholder="Maaş ile ilgili ek notlar..."
              rows={3}
            />
          </CardContent>
        </Card>

        {/* Buttons */}
        <div className="flex items-center gap-4">
          <Button
            type="submit"
            disabled={saving}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {saving ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Kaydediliyor...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Maaş Kaydet
              </>
            )}
          </Button>
          <Link href="/admin/finance/salaries">
            <Button type="button" variant="outline">
              İptal
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
