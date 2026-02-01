"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import {
  getPersonnelById,
  getPersonnelFinanceSummary,
  getSalariesByPersonnel,
  getAdvancesByPersonnel,
  getTransactions,
  PERSONNEL_STATUS,
  SALARY_STATUS,
  ADVANCE_STATUS,
  TRANSACTION_TYPE,
  EXPENSE_CATEGORY,
  CURRENCY,
  formatCurrency,
} from "@/lib/services/finance";
import {
  ArrowLeft,
  Pencil,
  User,
  Building,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  CreditCard,
  MapPin,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Banknote,
  TrendingUp,
  TrendingDown,
  Plus,
  FileText,
  RefreshCw,
  Link2,
  UserCircle,
  Wallet,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const statusConfig = {
  [PERSONNEL_STATUS.ACTIVE]: { 
    label: "Aktif", 
    color: "bg-emerald-100 text-emerald-700 border-emerald-200" 
  },
  [PERSONNEL_STATUS.ON_LEAVE]: { 
    label: "İzinli", 
    color: "bg-amber-100 text-amber-700 border-amber-200" 
  },
  [PERSONNEL_STATUS.TERMINATED]: { 
    label: "İşten Ayrılmış", 
    color: "bg-red-100 text-red-700 border-red-200" 
  },
};

const salaryStatusConfig = {
  [SALARY_STATUS.PENDING]: { 
    label: "Beklemede", 
    color: "bg-amber-100 text-amber-700", 
    icon: Clock 
  },
  [SALARY_STATUS.PAID]: { 
    label: "Ödendi", 
    color: "bg-emerald-100 text-emerald-700", 
    icon: CheckCircle2 
  },
  [SALARY_STATUS.CANCELLED]: { 
    label: "İptal", 
    color: "bg-red-100 text-red-700", 
    icon: XCircle 
  },
};

const advanceStatusConfig = {
  [ADVANCE_STATUS.PENDING]: { 
    label: "Beklemede", 
    color: "bg-amber-100 text-amber-700", 
    icon: Clock 
  },
  [ADVANCE_STATUS.APPROVED]: { 
    label: "Onaylandı", 
    color: "bg-blue-100 text-blue-700", 
    icon: CheckCircle2 
  },
  [ADVANCE_STATUS.PAID]: { 
    label: "Ödendi", 
    color: "bg-emerald-100 text-emerald-700", 
    icon: Banknote 
  },
  [ADVANCE_STATUS.REJECTED]: { 
    label: "Reddedildi", 
    color: "bg-red-100 text-red-700", 
    icon: XCircle 
  },
};

export default function PersonnelDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAdminAuth();

  const [personnel, setPersonnel] = useState(null);
  const [salaries, setSalaries] = useState([]);
  const [advances, setAdvances] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingFinance, setLoadingFinance] = useState(true);

  useEffect(() => {
    loadPersonnel();
    loadFinanceData();
  }, [params.id]);

  const loadPersonnel = async () => {
    setLoading(true);
    try {
      const result = await getPersonnelById(params.id);
      if (result.success) {
        setPersonnel(result.data);
      } else {
        toast.error("Personel bulunamadı");
        router.push("/admin/finance/personnel");
      }
    } catch (error) {
      toast.error("Personel yüklenirken hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const loadFinanceData = async () => {
    setLoadingFinance(true);
    try {
      // Maaş kayıtlarını yükle
      const salaryResult = await getSalariesByPersonnel(params.id);
      if (salaryResult.success) {
        setSalaries(salaryResult.data || []);
      }
      
      // Avans kayıtlarını yükle
      const advanceResult = await getAdvancesByPersonnel(params.id);
      if (advanceResult.success) {
        setAdvances(advanceResult.data || []);
      }
      
      // Personel ile ilişkili işlemleri yükle (giderler, gelirler vb.)
      const txResult = await getTransactions({ personnelId: params.id }, { limit: 50 });
      if (txResult.success) {
        setTransactions(txResult.data || []);
      }
    } catch (error) {
      // Silent fail - finance data is optional
    } finally {
      setLoadingFinance(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "-";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat("tr-TR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  const formatMonthYear = (timestamp) => {
    if (!timestamp) return "-";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat("tr-TR", {
      month: "long",
      year: "numeric",
    }).format(date);
  };

  // Toplam hesaplamalar
  const calculateTotals = () => {
    // Maaş kayıtlarından
    const paidSalariesFromRecords = salaries
      .filter(s => s.status === SALARY_STATUS.PAID)
      .reduce((sum, s) => sum + (s.netSalary || s.baseSalary || 0), 0);
    
    const pendingSalariesFromRecords = salaries
      .filter(s => s.status === SALARY_STATUS.PENDING)
      .reduce((sum, s) => sum + (s.netSalary || s.baseSalary || 0), 0);
    
    // Gider işlemlerinden maaş kategorisi
    const salaryFromTransactions = transactions
      .filter(t => t.type === TRANSACTION_TYPE.EXPENSE && t.category === EXPENSE_CATEGORY.SALARY)
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    
    // Avans kayıtlarından
    const paidAdvancesFromRecords = advances
      .filter(a => a.status === ADVANCE_STATUS.PAID)
      .reduce((sum, a) => sum + (a.amount || 0), 0);
    
    const pendingAdvancesFromRecords = advances
      .filter(a => a.status === ADVANCE_STATUS.PENDING || a.status === ADVANCE_STATUS.APPROVED)
      .reduce((sum, a) => sum + (a.amount || 0), 0);
    
    // Gider işlemlerinden avans kategorisi
    const advanceFromTransactions = transactions
      .filter(t => t.type === TRANSACTION_TYPE.EXPENSE && t.category === EXPENSE_CATEGORY.ADVANCE)
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    // Toplam maaş (kayıtlar + gider işlemleri)
    const paidSalaries = paidSalariesFromRecords + salaryFromTransactions;
    const pendingSalaries = pendingSalariesFromRecords;
    
    // Toplam avans (kayıtlar + gider işlemleri)
    const paidAdvances = paidAdvancesFromRecords + advanceFromTransactions;
    const pendingAdvances = pendingAdvancesFromRecords;

    // İşlemlerden toplam gider ve gelir (maaş ve avans hariç - çünkü onlar ayrı gösteriliyor)
    const otherExpenses = transactions
      .filter(t => t.type === TRANSACTION_TYPE.EXPENSE && 
                   t.category !== EXPENSE_CATEGORY.SALARY && 
                   t.category !== EXPENSE_CATEGORY.ADVANCE)
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    
    const totalExpenses = transactions
      .filter(t => t.type === TRANSACTION_TYPE.EXPENSE)
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    
    const totalIncome = transactions
      .filter(t => t.type === TRANSACTION_TYPE.INCOME)
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    return { paidSalaries, pendingSalaries, paidAdvances, pendingAdvances, totalExpenses, totalIncome, otherExpenses };
  };

  const totals = calculateTotals();
  const currency = personnel?.salaryCurrency || personnel?.currency || CURRENCY.TRY;

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-96" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
        </div>
      </div>
    );
  }

  if (!personnel) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <Card className="bg-white border-slate-200">
          <CardContent className="p-12 text-center">
            <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">Personel Bulunamadı</h3>
            <p className="text-slate-500 mb-4">İstenen personel kaydı bulunamadı.</p>
            <Link href="/admin/finance/personnel">
              <Button variant="outline">Personel Listesine Dön</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusInfo = statusConfig[personnel.status] || statusConfig[PERSONNEL_STATUS.ACTIVE];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/finance/personnel">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-purple-100 text-purple-700 text-lg">
                {personnel.firstName?.[0]}{personnel.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900">
                  {personnel.firstName} {personnel.lastName}
                </h1>
                <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
              </div>
              <p className="text-sm text-slate-500">
                {personnel.personnelNumber} • {personnel.position || "Pozisyon belirtilmemiş"}
              </p>
            </div>
          </div>
        </div>
        <Link href={`/admin/finance/personnel/${params.id}/edit`}>
          <Button variant="outline" className="border-slate-300">
            <Pencil className="w-4 h-4 mr-2" />
            Düzenle
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-white border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Ödenen Maaş</p>
                <p className="text-lg font-bold text-emerald-600">
                  {formatCurrency(totals.paidSalaries, currency)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Bekleyen Maaş</p>
                <p className="text-lg font-bold text-amber-600">
                  {formatCurrency(totals.pendingSalaries, currency)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Banknote className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Ödenen Avans</p>
                <p className="text-lg font-bold text-blue-600">
                  {formatCurrency(totals.paidAdvances, currency)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Wallet className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Bekleyen Avans</p>
                <p className="text-lg font-bold text-purple-600">
                  {formatCurrency(totals.pendingAdvances, currency)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <TrendingDown className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Toplam Gider</p>
                <p className="text-lg font-bold text-red-600">
                  {formatCurrency(totals.totalExpenses, currency)}
                </p>
                <p className="text-xs text-slate-400">{transactions.filter(t => t.type === TRANSACTION_TYPE.EXPENSE).length} işlem</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sol Panel - Ana Bilgiler ve İşlem Geçmişi */}
        <div className="lg:col-span-2 space-y-6">
          {/* Kişisel Bilgiler */}
          <Card className="bg-white border-slate-200">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-5 h-5 text-purple-600" />
                Kişisel Bilgiler
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Mail className="w-4 h-4 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-slate-500">E-posta</p>
                      <p className="text-sm font-medium text-slate-900">
                        {personnel.email || "-"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="w-4 h-4 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-slate-500">Telefon</p>
                      <p className="text-sm font-medium text-slate-900">
                        {personnel.phone || "-"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-slate-500">Adres</p>
                      <p className="text-sm font-medium text-slate-900">
                        {personnel.address || "-"}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Building className="w-4 h-4 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-slate-500">Departman</p>
                      <p className="text-sm font-medium text-slate-900">
                        {personnel.department || "-"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="w-4 h-4 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-slate-500">İşe Başlama</p>
                      <p className="text-sm font-medium text-slate-900">
                        {formatDate(personnel.startDate)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-4 h-4 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-slate-500">Acil İletişim</p>
                      <p className="text-sm font-medium text-slate-900">
                        {personnel.emergencyContact || "-"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {personnel.linkedUserId && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Link2 className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-700">
                      Sistem kullanıcısına bağlı
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Maaş ve Avans Geçmişi */}
          <Tabs defaultValue="transactions" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-slate-100">
              <TabsTrigger value="transactions">İşlemler</TabsTrigger>
              <TabsTrigger value="salaries">Maaş Geçmişi</TabsTrigger>
              <TabsTrigger value="advances">Avans Geçmişi</TabsTrigger>
            </TabsList>
            
            {/* İşlemler Tab */}
            <TabsContent value="transactions" className="mt-4">
              <Card className="bg-white border-slate-200">
                <CardHeader className="border-b border-slate-100 pb-4 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="w-5 h-5 text-blue-600" />
                      Personel İşlemleri
                    </CardTitle>
                    <CardDescription>Bu personel ile ilişkili tüm gelir/gider işlemleri</CardDescription>
                  </div>
                  <Link href={`/admin/finance/expenses/new?personnelId=${params.id}`}>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="w-4 h-4 mr-1" />
                      Gider Ekle
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent className="p-0">
                  {loadingFinance ? (
                    <div className="p-8 text-center">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto text-slate-400" />
                    </div>
                  ) : transactions.length === 0 ? (
                    <div className="p-8 text-center">
                      <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm text-slate-500">İşlem kaydı bulunamadı</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50">
                          <TableHead>Tarih</TableHead>
                          <TableHead>Açıklama</TableHead>
                          <TableHead>Tür</TableHead>
                          <TableHead className="text-right">Tutar</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {transactions.slice(0, 15).map((tx) => (
                          <TableRow key={tx.id} className="hover:bg-slate-50">
                            <TableCell className="text-sm text-slate-500">
                              {formatDate(tx.transactionDate)}
                            </TableCell>
                            <TableCell className="font-medium">
                              {tx.description || tx.transactionNumber}
                            </TableCell>
                            <TableCell>
                              <Badge className={
                                tx.type === TRANSACTION_TYPE.INCOME 
                                  ? "bg-emerald-100 text-emerald-700" 
                                  : tx.type === TRANSACTION_TYPE.EXPENSE 
                                  ? "bg-red-100 text-red-700"
                                  : "bg-slate-100 text-slate-700"
                              }>
                                {tx.type === TRANSACTION_TYPE.INCOME ? "Gelir" : 
                                 tx.type === TRANSACTION_TYPE.EXPENSE ? "Gider" : tx.type}
                              </Badge>
                            </TableCell>
                            <TableCell className={`text-right font-medium ${
                              tx.type === TRANSACTION_TYPE.INCOME ? "text-emerald-600" : "text-red-600"
                            }`}>
                              {tx.type === TRANSACTION_TYPE.INCOME ? "+" : "-"}
                              {formatCurrency(tx.amount, tx.currency || CURRENCY.TRY)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="salaries" className="mt-4">
              <Card className="bg-white border-slate-200">
                <CardHeader className="border-b border-slate-100 pb-4 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-purple-600" />
                      Maaş Kayıtları
                    </CardTitle>
                    <CardDescription>Son ödenen maaşlar</CardDescription>
                  </div>
                  <Link href="/admin/finance/salaries/new">
                    <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                      <Plus className="w-4 h-4 mr-1" />
                      Maaş Ekle
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent className="p-0">
                  {loadingFinance ? (
                    <div className="p-8 text-center">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto text-slate-400" />
                    </div>
                  ) : (() => {
                    // Maaş kayıtlarını ve maaş kategorisindeki gider işlemlerini birleştir
                    const salaryTransactions = transactions.filter(
                      t => t.type === TRANSACTION_TYPE.EXPENSE && t.category === EXPENSE_CATEGORY.SALARY
                    );
                    
                    // Birleştirilmiş liste oluştur
                    const allSalaries = [
                      // Resmi maaş kayıtları
                      ...salaries.map(s => ({
                        id: s.id,
                        type: 'salary_record',
                        date: s.paymentDate || s.periodStart,
                        period: s.periodStart,
                        amount: s.netSalary || s.baseSalary,
                        currency: s.currency || currency,
                        status: s.status,
                        description: formatMonthYear(s.periodStart),
                        source: 'Maaş Kaydı'
                      })),
                      // Gider olarak eklenen maaşlar
                      ...salaryTransactions.map(t => ({
                        id: t.id,
                        type: 'transaction',
                        date: t.transactionDate,
                        period: t.transactionDate,
                        amount: t.amount,
                        currency: t.currency || currency,
                        status: 'PAID',
                        description: t.description || t.transactionNumber,
                        source: 'Gider İşlemi'
                      }))
                    ].sort((a, b) => {
                      const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date);
                      const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date);
                      return dateB - dateA;
                    });
                    
                    if (allSalaries.length === 0) {
                      return (
                        <div className="p-8 text-center">
                          <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                          <p className="text-sm text-slate-500">Maaş kaydı bulunamadı</p>
                        </div>
                      );
                    }
                    
                    return (
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-slate-50">
                            <TableHead>Tarih/Dönem</TableHead>
                            <TableHead className="text-right">Tutar</TableHead>
                            <TableHead className="text-center">Durum</TableHead>
                            <TableHead>Açıklama</TableHead>
                            <TableHead>Kaynak</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {allSalaries.slice(0, 15).map((item) => {
                            const statusConf = item.type === 'salary_record' 
                              ? (salaryStatusConfig[item.status] || salaryStatusConfig[SALARY_STATUS.PENDING])
                              : { label: 'Ödendi', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 };
                            const StatusIcon = statusConf.icon;
                            return (
                              <TableRow key={`${item.type}-${item.id}`} className="hover:bg-slate-50">
                                <TableCell className="font-medium">
                                  {item.type === 'salary_record' ? formatMonthYear(item.period) : formatDate(item.date)}
                                </TableCell>
                                <TableCell className="text-right font-semibold text-red-600">
                                  -{formatCurrency(item.amount, item.currency)}
                                </TableCell>
                                <TableCell className="text-center">
                                  <Badge className={statusConf.color}>
                                    <StatusIcon className="w-3 h-3 mr-1" />
                                    {statusConf.label}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-slate-500 text-sm max-w-[200px] truncate">
                                  {item.description}
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="text-xs">
                                    {item.source}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    );
                  })()}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="advances" className="mt-4">
              <Card className="bg-white border-slate-200">
                <CardHeader className="border-b border-slate-100 pb-4 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Banknote className="w-5 h-5 text-purple-600" />
                      Avans Kayıtları
                    </CardTitle>
                    <CardDescription>Avans talepleri ve ödemeleri</CardDescription>
                  </div>
                  <Link href="/admin/finance/advances/new">
                    <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                      <Plus className="w-4 h-4 mr-1" />
                      Avans Ekle
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent className="p-0">
                  {loadingFinance ? (
                    <div className="p-8 text-center">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto text-slate-400" />
                    </div>
                  ) : (() => {
                    // Avans kayıtlarını ve avans kategorisindeki gider işlemlerini birleştir
                    const advanceTransactions = transactions.filter(
                      t => t.type === TRANSACTION_TYPE.EXPENSE && t.category === EXPENSE_CATEGORY.ADVANCE
                    );
                    
                    // Birleştirilmiş liste oluştur
                    const allAdvances = [
                      // Resmi avans kayıtları
                      ...advances.map(a => ({
                        id: a.id,
                        type: 'advance_record',
                        date: a.requestDate,
                        amount: a.amount,
                        currency: a.currency || currency,
                        status: a.status,
                        description: a.reason || 'Avans talebi',
                        source: 'Avans Kaydı'
                      })),
                      // Gider olarak eklenen avanslar
                      ...advanceTransactions.map(t => ({
                        id: t.id,
                        type: 'transaction',
                        date: t.transactionDate,
                        amount: t.amount,
                        currency: t.currency || currency,
                        status: 'PAID', // Gider olarak eklenmiş = ödenmiş
                        description: t.description || t.transactionNumber,
                        source: 'Gider İşlemi'
                      }))
                    ].sort((a, b) => {
                      const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date);
                      const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date);
                      return dateB - dateA;
                    });
                    
                    if (allAdvances.length === 0) {
                      return (
                        <div className="p-8 text-center">
                          <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                          <p className="text-sm text-slate-500">Avans kaydı bulunamadı</p>
                        </div>
                      );
                    }
                    
                    return (
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-slate-50">
                            <TableHead>Tarih</TableHead>
                            <TableHead className="text-right">Tutar</TableHead>
                            <TableHead className="text-center">Durum</TableHead>
                            <TableHead>Açıklama</TableHead>
                            <TableHead>Kaynak</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {allAdvances.slice(0, 15).map((item) => {
                            const statusConf = item.type === 'advance_record' 
                              ? (advanceStatusConfig[item.status] || advanceStatusConfig[ADVANCE_STATUS.PENDING])
                              : { label: 'Ödendi', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 };
                            const StatusIcon = statusConf.icon;
                            return (
                              <TableRow key={`${item.type}-${item.id}`} className="hover:bg-slate-50">
                                <TableCell className="font-medium">
                                  {formatDate(item.date)}
                                </TableCell>
                                <TableCell className="text-right font-semibold text-red-600">
                                  -{formatCurrency(item.amount, item.currency)}
                                </TableCell>
                                <TableCell className="text-center">
                                  <Badge className={statusConf.color}>
                                    <StatusIcon className="w-3 h-3 mr-1" />
                                    {statusConf.label}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-slate-500 text-sm max-w-[200px] truncate">
                                  {item.description}
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="text-xs">
                                    {item.source}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    );
                  })()}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sağ Panel - Yan Bilgiler */}
        <div className="space-y-6">
          {/* Maaş Bilgileri */}
          <Card className="bg-white border-slate-200">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-purple-600" />
                Maaş Bilgisi
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="p-4 bg-purple-50 border border-purple-100 rounded-lg text-center">
                <p className="text-xs text-purple-600 mb-1">Mevcut Maaş</p>
                <p className="text-2xl font-bold text-purple-700">
                  {formatCurrency(personnel.baseSalary || 0, currency)}
                </p>
              </div>
              <div className="text-center text-sm text-slate-500">
                Para Birimi: <span className="font-medium">{currency}</span>
              </div>
            </CardContent>
          </Card>

          {/* Banka Bilgileri */}
          <Card className="bg-white border-slate-200">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-purple-600" />
                Banka Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <div>
                <p className="text-xs text-slate-500">Banka</p>
                <p className="text-sm font-medium text-slate-900">
                  {personnel.bankName || "-"}
                </p>
              </div>
              <Separator />
              <div>
                <p className="text-xs text-slate-500">IBAN</p>
                <p className="text-sm font-medium text-slate-900 break-all">
                  {personnel.iban || "-"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Notlar */}
          {personnel.notes && (
            <Card className="bg-white border-slate-200">
              <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-600" />
                  Notlar
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm text-slate-600 whitespace-pre-wrap">
                  {personnel.notes}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Hızlı İşlemler */}
          <Card className="bg-white border-slate-200">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-base">Hızlı İşlemler</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-2">
              <Link href={`/admin/finance/salaries/new?personnelId=${params.id}`} className="block">
                <Button variant="outline" className="w-full justify-start border-slate-200">
                  <DollarSign className="w-4 h-4 mr-2 text-emerald-600" />
                  Maaş Ödemesi Ekle
                </Button>
              </Link>
              <Link href={`/admin/finance/advances/new?personnelId=${params.id}`} className="block">
                <Button variant="outline" className="w-full justify-start border-slate-200">
                  <Banknote className="w-4 h-4 mr-2 text-blue-600" />
                  Avans Talebi Ekle
                </Button>
              </Link>
              <Link href={`/admin/finance/expenses/new?category=SALARY&personnelId=${params.id}`} className="block">
                <Button variant="outline" className="w-full justify-start border-slate-200">
                  <TrendingDown className="w-4 h-4 mr-2 text-red-600" />
                  Gider Kaydı Oluştur
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
