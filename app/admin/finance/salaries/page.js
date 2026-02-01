"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, getDocs, where } from "firebase/firestore";
import {
  formatCurrency,
  formatDate,
  getSalaryStatusLabel,
  getSalaryStatusColor,
  getPersonnelList,
  SALARY_STATUS,
  CURRENCY,
} from "@/lib/services/finance";
import {
  Plus,
  Search,
  MoreHorizontal,
  Wallet,
  RefreshCw,
  Eye,
  CheckCircle,
  Clock,
  Calendar,
  User,
  Filter,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

const MONTHS = [
  { value: "1", label: "Ocak" },
  { value: "2", label: "Şubat" },
  { value: "3", label: "Mart" },
  { value: "4", label: "Nisan" },
  { value: "5", label: "Mayıs" },
  { value: "6", label: "Haziran" },
  { value: "7", label: "Temmuz" },
  { value: "8", label: "Ağustos" },
  { value: "9", label: "Eylül" },
  { value: "10", label: "Ekim" },
  { value: "11", label: "Kasım" },
  { value: "12", label: "Aralık" },
];

export default function SalariesPage() {
  const router = useRouter();
  const { user } = useAdminAuth();
  
  const [salaries, setSalaries] = useState([]);
  const [personnel, setPersonnel] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState(String(new Date().getMonth() + 1));
  const [yearFilter, setYearFilter] = useState(String(new Date().getFullYear()));

  const loadData = async () => {
    setLoading(true);
    try {
      // Personel listesini yükle
      const personnelResult = await getPersonnelList();
      if (personnelResult.success) {
        setPersonnel(personnelResult.data);
      }

      // Maaş kayıtlarını yükle
      let q = query(
        collection(db, "finance_salaries"),
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(q);
      let salaryData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Filtreleme
      if (monthFilter !== "all") {
        salaryData = salaryData.filter(s => s.month === parseInt(monthFilter));
      }
      if (yearFilter !== "all") {
        salaryData = salaryData.filter(s => s.year === parseInt(yearFilter));
      }
      if (statusFilter !== "all") {
        salaryData = salaryData.filter(s => s.status === statusFilter);
      }

      setSalaries(salaryData);
    } catch (error) {
      toast({
        title: "Hata",
        description: "Veriler yüklenirken bir hata oluştu",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter, monthFilter, yearFilter]);

  const filteredSalaries = salaries.filter((item) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        item.personnelName?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  // Özet hesaplamalar
  const summary = {
    total: filteredSalaries.length,
    pending: filteredSalaries.filter(s => s.status === SALARY_STATUS.PENDING).length,
    approved: filteredSalaries.filter(s => s.status === SALARY_STATUS.APPROVED).length,
    paid: filteredSalaries.filter(s => s.status === SALARY_STATUS.PAID).length,
    totalAmount: filteredSalaries.reduce((acc, s) => {
      if (!acc[s.currency]) acc[s.currency] = 0;
      acc[s.currency] += s.netSalary || 0;
      return acc;
    }, {}),
    paidAmount: filteredSalaries.filter(s => s.status === SALARY_STATUS.PAID).reduce((acc, s) => {
      if (!acc[s.currency]) acc[s.currency] = 0;
      acc[s.currency] += s.netSalary || 0;
      return acc;
    }, {}),
  };

  // Yıl listesi (son 5 yıl)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Maaşlar</h1>
          <p className="text-sm text-slate-500 mt-1">
            {MONTHS.find(m => m.value === monthFilter)?.label || "Tüm"} {yearFilter} - {salaries.length} maaş kaydı
          </p>
        </div>
        <Link href="/admin/finance/salaries/new">
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="w-4 h-4 mr-2" />
            Maaş Oluştur
          </Button>
        </Link>
      </div>

      {/* Özet Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Toplam Maaş</p>
                <div className="space-y-1 mt-1">
                  {Object.entries(summary.totalAmount).map(([curr, amount]) => (
                    <p key={curr} className="text-lg font-bold text-slate-900">
                      {formatCurrency(amount, curr)}
                    </p>
                  ))}
                  {Object.keys(summary.totalAmount).length === 0 && (
                    <p className="text-lg font-bold text-slate-400">-</p>
                  )}
                </div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-slate-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-700">Bekleyen</p>
                <p className="text-2xl font-bold text-amber-800 mt-1">
                  {summary.pending}
                </p>
                <p className="text-xs text-amber-600 mt-1">onay bekliyor</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700">Onaylanan</p>
                <p className="text-2xl font-bold text-blue-800 mt-1">
                  {summary.approved}
                </p>
                <p className="text-xs text-blue-600 mt-1">ödeme bekliyor</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-emerald-50 border-emerald-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-700">Ödenen</p>
                <div className="space-y-1 mt-1">
                  {Object.entries(summary.paidAmount).map(([curr, amount]) => (
                    <p key={curr} className="text-lg font-bold text-emerald-800">
                      {formatCurrency(amount, curr)}
                    </p>
                  ))}
                  {Object.keys(summary.paidAmount).length === 0 && (
                    <p className="text-lg font-bold text-emerald-400">-</p>
                  )}
                </div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtreler */}
      <Card className="bg-white border-slate-200">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Personel ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={monthFilter} onValueChange={setMonthFilter}>
              <SelectTrigger className="w-full md:w-36">
                <SelectValue placeholder="Ay" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Aylar</SelectItem>
                {MONTHS.map((month) => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger className="w-full md:w-28">
                <SelectValue placeholder="Yıl" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Yıllar</SelectItem>
                {years.map((year) => (
                  <SelectItem key={year} value={String(year)}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Durum" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Durumlar</SelectItem>
                {Object.values(SALARY_STATUS).map((status) => (
                  <SelectItem key={status} value={status}>
                    {getSalaryStatusLabel(status)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={loadData}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Liste */}
      <Card className="bg-white border-slate-200">
        <CardContent className="p-0">
          {filteredSalaries.length === 0 ? (
            <div className="p-12 text-center">
              <Wallet className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900">Maaş Kaydı Bulunamadı</h3>
              <p className="text-sm text-slate-500 mt-1">
                Henüz maaş kaydı yok veya arama kriterlerine uygun kayıt bulunamadı
              </p>
              <Link href="/admin/finance/salaries/new">
                <Button className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Maaş Oluştur
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="font-semibold w-[180px]">Personel</TableHead>
                    <TableHead className="font-semibold w-[120px]">Dönem</TableHead>
                    <TableHead className="font-semibold w-[120px] text-right">Brüt Maaş</TableHead>
                    <TableHead className="font-semibold w-[110px] text-right">Kesintiler</TableHead>
                    <TableHead className="font-semibold w-[120px] text-right">Net Maaş</TableHead>
                    <TableHead className="font-semibold w-[110px]">Ödeme Tarihi</TableHead>
                    <TableHead className="font-semibold w-[100px]">Durum</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSalaries.map((salary) => (
                    <TableRow key={salary.id} className="hover:bg-slate-50 group">
                      <TableCell>
                        <Link 
                          href={`/admin/finance/salaries/${salary.id}`}
                          className="flex items-center gap-2 hover:bg-slate-100 rounded p-1 -m-1 transition-colors"
                        >
                          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4 text-indigo-600" />
                          </div>
                          <span className="font-medium text-slate-900 hover:text-blue-600">{salary.personnelName}</span>
                        </Link>
                      </TableCell>
                      <TableCell className="text-slate-600 text-sm">
                        {MONTHS.find(m => m.value === String(salary.month))?.label} {salary.year}
                      </TableCell>
                      <TableCell className="text-right font-medium whitespace-nowrap">
                        {formatCurrency(salary.grossSalary || 0, salary.currency)}
                      </TableCell>
                      <TableCell className="text-right text-red-600 whitespace-nowrap">
                        -{formatCurrency(salary.totalDeductions || 0, salary.currency)}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-semibold text-emerald-600 whitespace-nowrap">
                          {formatCurrency(salary.netSalary || 0, salary.currency)}
                        </span>
                      </TableCell>
                      <TableCell className="text-slate-600 text-sm">
                        {salary.paidDate ? formatDate(salary.paidDate) : "-"}
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("text-xs whitespace-nowrap", getSalaryStatusColor(salary.status))}>
                          {getSalaryStatusLabel(salary.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => router.push(`/admin/finance/salaries/${salary.id}`)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Detay
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
