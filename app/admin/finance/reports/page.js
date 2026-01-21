"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import {
  getIncomeExpenseSummary,
  getReceivablePayableSummary,
  getPersonnelSummary,
  getTotalBalance,
  getMonthlyTrend,
  formatCurrency,
  CURRENCY,
} from "@/lib/services/finance";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Users,
  RefreshCw,
  Calendar,
  BarChart3,
  PieChart,
  Download,
  FileSpreadsheet,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

export default function ReportsPage() {
  const { user } = useAdminAuth();
  
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    balances: {},
    incomeSummary: null,
    receivablePayable: null,
    personnelSummary: null,
    monthlyTrend: [],
  });
  
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(String(currentDate.getFullYear()));
  const [selectedMonth, setSelectedMonth] = useState(String(currentDate.getMonth() + 1));

  const loadData = async () => {
    setLoading(true);
    try {
      const startDate = new Date(parseInt(selectedYear), parseInt(selectedMonth) - 1, 1);
      const endDate = new Date(parseInt(selectedYear), parseInt(selectedMonth), 0, 23, 59, 59);

      const [balances, incomeSummary, receivablePayable, personnelSummary, monthlyTrend] = await Promise.all([
        getTotalBalance(),
        getIncomeExpenseSummary(startDate, endDate),
        getReceivablePayableSummary(),
        getPersonnelSummary(),
        getMonthlyTrend(parseInt(selectedYear)),
      ]);

      setData({
        balances: balances.success ? balances.data : {},
        incomeSummary: incomeSummary.success ? incomeSummary.data : null,
        receivablePayable: receivablePayable.success ? receivablePayable.data : null,
        personnelSummary: personnelSummary.success ? personnelSummary.data : null,
        monthlyTrend: monthlyTrend.success ? monthlyTrend.data : [],
      });
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Rapor verileri yüklenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedYear, selectedMonth]);

  // Yıl listesi
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-64" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32" />)}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  const { balances, incomeSummary, receivablePayable, personnelSummary, monthlyTrend } = data;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Finansal Raporlar</h1>
          <p className="text-sm text-slate-500 mt-1">
            Gelir, gider, alacak, borç ve personel özet raporları
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((month) => (
                <SelectItem key={month.value} value={month.value}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-24">
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
          <Button variant="outline" onClick={loadData}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Hesap Bakiyeleri */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Wallet className="w-5 h-5 text-emerald-600" />
          Hesap Bakiyeleri
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Object.entries(balances).map(([currency, balance]) => (
            <Card key={currency} className={cn(
              "border-2",
              balance >= 0 ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"
            )}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">{currency}</p>
                    <p className={cn(
                      "text-2xl font-bold mt-1",
                      balance >= 0 ? "text-emerald-700" : "text-red-700"
                    )}>
                      {formatCurrency(balance, currency)}
                    </p>
                  </div>
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    balance >= 0 ? "bg-emerald-100" : "bg-red-100"
                  )}>
                    {balance >= 0 ? (
                      <TrendingUp className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {Object.keys(balances).length === 0 && (
            <Card className="bg-slate-50 border-slate-200 md:col-span-4">
              <CardContent className="p-8 text-center text-slate-500">
                Henüz hesap bakiyesi bulunmuyor
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Aylık Gelir/Gider */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-white border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-600" />
              {MONTHS.find(m => m.value === selectedMonth)?.label} {selectedYear} Gelir
            </CardTitle>
          </CardHeader>
          <CardContent>
            {incomeSummary?.totalIncome && Object.keys(incomeSummary.totalIncome).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(incomeSummary.totalIncome).map(([currency, total]) => (
                  <div key={currency} className="p-4 bg-emerald-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-emerald-700">Toplam ({currency})</p>
                        <p className="text-2xl font-bold text-emerald-800">
                          {formatCurrency(total || 0, currency)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400">
                Bu dönemde gelir kaydı yok
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-red-600" />
              {MONTHS.find(m => m.value === selectedMonth)?.label} {selectedYear} Gider
            </CardTitle>
          </CardHeader>
          <CardContent>
            {incomeSummary?.totalExpense && Object.keys(incomeSummary.totalExpense).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(incomeSummary.totalExpense).map(([currency, total]) => (
                  <div key={currency} className="p-4 bg-red-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-red-700">Toplam ({currency})</p>
                        <p className="text-2xl font-bold text-red-800">
                          {formatCurrency(total || 0, currency)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400">
                Bu dönemde gider kaydı yok
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Alacak/Borç Özeti */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-white border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ArrowUpRight className="w-5 h-5 text-blue-600" />
              Alacak Özeti
            </CardTitle>
          </CardHeader>
          <CardContent>
            {receivablePayable?.receivables && receivablePayable.receivables.count > 0 ? (
              <div className="space-y-4">
                <div className="p-3 bg-slate-50 rounded-lg text-center">
                  <p className="text-xs text-slate-500">Toplam Kayıt</p>
                  <p className="text-lg font-bold text-slate-900">{receivablePayable.receivables.count || 0}</p>
                </div>
                {Object.entries(receivablePayable.receivables.total || {}).map(([curr, amount]) => (
                  <div key={curr} className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-600">Toplam Alacak ({curr})</p>
                    <p className="text-xl font-bold text-blue-700">{formatCurrency(amount, curr)}</p>
                  </div>
                ))}
                {Object.entries(receivablePayable.receivables.pending || {}).map(([curr, amount]) => (
                  <div key={`pending-${curr}`} className="p-3 bg-amber-50 rounded-lg">
                    <p className="text-sm text-amber-600">Bekleyen ({curr})</p>
                    <p className="text-xl font-bold text-amber-700">{formatCurrency(amount, curr)}</p>
                  </div>
                ))}
                {Object.entries(receivablePayable.receivables.overdue || {}).map(([curr, amount]) => (
                  <div key={`overdue-${curr}`} className="p-3 bg-red-50 rounded-lg">
                    <p className="text-sm text-red-600">Gecikmiş ({curr})</p>
                    <p className="text-xl font-bold text-red-700">{formatCurrency(amount, curr)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400">
                Alacak verisi yok
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ArrowDownLeft className="w-5 h-5 text-orange-600" />
              Borç Özeti
            </CardTitle>
          </CardHeader>
          <CardContent>
            {receivablePayable?.payables && receivablePayable.payables.count > 0 ? (
              <div className="space-y-4">
                <div className="p-3 bg-slate-50 rounded-lg text-center">
                  <p className="text-xs text-slate-500">Toplam Kayıt</p>
                  <p className="text-lg font-bold text-slate-900">{receivablePayable.payables.count || 0}</p>
                </div>
                {Object.entries(receivablePayable.payables.total || {}).map(([curr, amount]) => (
                  <div key={curr} className="p-3 bg-orange-50 rounded-lg">
                    <p className="text-sm text-orange-600">Toplam Borç ({curr})</p>
                    <p className="text-xl font-bold text-orange-700">{formatCurrency(amount, curr)}</p>
                  </div>
                ))}
                {Object.entries(receivablePayable.payables.pending || {}).map(([curr, amount]) => (
                  <div key={`pending-${curr}`} className="p-3 bg-amber-50 rounded-lg">
                    <p className="text-sm text-amber-600">Bekleyen ({curr})</p>
                    <p className="text-xl font-bold text-amber-700">{formatCurrency(amount, curr)}</p>
                  </div>
                ))}
                {Object.entries(receivablePayable.payables.overdue || {}).map(([curr, amount]) => (
                  <div key={`overdue-${curr}`} className="p-3 bg-red-50 rounded-lg">
                    <p className="text-sm text-red-600">Gecikmiş ({curr})</p>
                    <p className="text-xl font-bold text-red-700">{formatCurrency(amount, curr)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400">
                Borç verisi yok
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Personel Özeti */}
      <Card className="bg-white border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            Personel Özeti
          </CardTitle>
        </CardHeader>
        <CardContent>
          {personnelSummary ? (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="p-4 bg-slate-50 rounded-lg text-center">
                <p className="text-sm text-slate-500">Toplam Personel</p>
                <p className="text-2xl font-bold text-slate-900">{personnelSummary.total || 0}</p>
              </div>
              <div className="p-4 bg-emerald-50 rounded-lg text-center">
                <p className="text-sm text-emerald-600">Aktif</p>
                <p className="text-2xl font-bold text-emerald-700">{personnelSummary.active || 0}</p>
              </div>
              <div className="p-4 bg-amber-50 rounded-lg text-center">
                <p className="text-sm text-amber-600">İzinli</p>
                <p className="text-2xl font-bold text-amber-700">{personnelSummary.onLeave || 0}</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg text-center col-span-2">
                <p className="text-sm text-purple-600">Toplam Maaş Gideri</p>
                <div className="space-y-1 mt-1">
                  {Object.entries(personnelSummary.totalSalary || {}).map(([curr, amount]) => (
                    <p key={curr} className="text-xl font-bold text-purple-700">
                      {formatCurrency(amount, curr)}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400">
              Personel verisi yok
            </div>
          )}
        </CardContent>
      </Card>

      {/* Yıllık Trend */}
      <Card className="bg-white border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            {selectedYear} Yıllık Trend
          </CardTitle>
          <CardDescription>Aylık gelir ve gider karşılaştırması</CardDescription>
        </CardHeader>
        <CardContent>
          {monthlyTrend && monthlyTrend.length > 0 ? (
            <div className="space-y-4">
              {monthlyTrend.map((item, index) => {
                const maxValue = Math.max(item.income || 0, item.expense || 0, 1);
                const incomeWidth = ((item.income || 0) / maxValue) * 100;
                const expenseWidth = ((item.expense || 0) / maxValue) * 100;
                
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-700">
                        {MONTHS.find(m => m.value === String(item.month))?.label}
                      </span>
                      <div className="flex gap-4 text-xs">
                        <span className="text-emerald-600">Gelir: {formatCurrency(item.income || 0, CURRENCY.TRY)}</span>
                        <span className="text-red-600">Gider: {formatCurrency(item.expense || 0, CURRENCY.TRY)}</span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <div 
                        className="h-6 bg-emerald-500 rounded-l transition-all"
                        style={{ width: `${incomeWidth}%` }}
                      />
                      <div 
                        className="h-6 bg-red-500 rounded-r transition-all"
                        style={{ width: `${expenseWidth}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400">
              Bu yıl için veri bulunamadı
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
