"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAdminAuth } from "../../../hooks/use-admin-auth";
import {
  getAccountStats,
  getTransactionStats,
  getReceivablePayableSummary,
  getPersonnelSummary,
  formatCurrency,
  CURRENCY,
} from "../../../lib/services/finance";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowUpCircle,
  ArrowDownCircle,
  Users,
  AlertTriangle,
  Clock,
  CheckCircle,
  ArrowRight,
  RefreshCw,
  DollarSign,
  PiggyBank,
  CreditCard,
  HandCoins,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Skeleton } from "../../../components/ui/skeleton";
import { cn } from "../../../lib/utils";

export default function FinanceDashboard() {
  const { user } = useAdminAuth();
  const [loading, setLoading] = useState(true);
  const [accountStats, setAccountStats] = useState(null);
  const [transactionStats, setTransactionStats] = useState(null);
  const [receivablePayableStats, setReceivablePayableStats] = useState(null);
  const [personnelStats, setPersonnelStats] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [accounts, transactions, receivablePayable, personnel] =
        await Promise.all([
          getAccountStats(),
          getTransactionStats(),
          getReceivablePayableSummary(),
          getPersonnelSummary(),
        ]);

      if (accounts.success) setAccountStats(accounts.data);
      if (transactions.success) setTransactionStats(transactions.data);
      if (receivablePayable.success)
        setReceivablePayableStats(receivablePayable.data);
      if (personnel.success) setPersonnelStats(personnel.data);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const StatCard = ({
    title,
    value,
    subtitle,
    icon: Icon,
    trend,
    trendValue,
    color = "blue",
    href,
  }) => (
    <Card className="bg-white border-slate-200 hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
            {subtitle && (
              <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
            )}
            {trend && (
              <div
                className={cn(
                  "flex items-center gap-1 mt-2 text-xs font-medium",
                  trend === "up" ? "text-emerald-600" : "text-red-600",
                )}
              >
                {trend === "up" ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                <span>{trendValue}</span>
              </div>
            )}
          </div>
          <div
            className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center",
              color === "emerald" && "bg-emerald-100",
              color === "blue" && "bg-blue-100",
              color === "red" && "bg-red-100",
              color === "amber" && "bg-amber-100",
              color === "purple" && "bg-purple-100",
            )}
          >
            <Icon
              className={cn(
                "w-6 h-6",
                color === "emerald" && "text-emerald-600",
                color === "blue" && "text-blue-600",
                color === "red" && "text-red-600",
                color === "amber" && "text-amber-600",
                color === "purple" && "text-purple-600",
              )}
            />
          </div>
        </div>
        {href && (
          <Link
            href={href}
            className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 mt-4"
          >
            <span>Detaylar</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        )}
      </CardContent>
    </Card>
  );

  const QuickAction = ({
    title,
    description,
    icon: Icon,
    href,
    color = "blue",
  }) => (
    <Link href={href} className="block">
      <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 bg-white hover:shadow-md hover:border-slate-300 transition-all cursor-pointer">
        <div
          className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
            color === "emerald" && "bg-emerald-100",
            color === "blue" && "bg-blue-100",
            color === "red" && "bg-red-100",
            color === "amber" && "bg-amber-100",
            color === "purple" && "bg-purple-100",
          )}
        >
          <Icon
            className={cn(
              "w-5 h-5",
              color === "emerald" && "text-emerald-600",
              color === "blue" && "text-blue-600",
              color === "red" && "text-red-600",
              color === "amber" && "text-amber-600",
              color === "purple" && "text-purple-600",
            )}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-slate-800 text-sm truncate">{title}</p>
          <p className="text-xs text-slate-500 truncate">{description}</p>
        </div>
        <ArrowRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
      </div>
    </Link>
  );

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-36" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  const tryBalance = accountStats?.totalBalances?.[CURRENCY.TRY] || 0;
  const usdBalance = accountStats?.totalBalances?.[CURRENCY.USD] || 0;
  const eurBalance = accountStats?.totalBalances?.[CURRENCY.EUR] || 0;

  const thisMonthIncome =
    transactionStats?.thisMonth?.totalIncome?.[CURRENCY.TRY] || 0;
  const thisMonthExpense =
    transactionStats?.thisMonth?.totalExpense?.[CURRENCY.TRY] || 0;
  const thisMonthNet = thisMonthIncome - thisMonthExpense;

  const pendingReceivables =
    receivablePayableStats?.receivables?.pending?.[CURRENCY.TRY] || 0;
  const pendingPayables =
    receivablePayableStats?.payables?.pending?.[CURRENCY.TRY] || 0;
  const overdueReceivables =
    receivablePayableStats?.receivables?.overdue?.[CURRENCY.TRY] || 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Finans Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Genel finansal durum özeti
          </p>
        </div>
        <Button onClick={loadData} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Yenile
        </Button>
      </div>

      {/* Ana Metrikler */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Toplam Bakiye (TRY)"
          value={formatCurrency(tryBalance, CURRENCY.TRY)}
          subtitle={
            usdBalance > 0
              ? `+ ${formatCurrency(usdBalance, CURRENCY.USD)}`
              : undefined
          }
          icon={Wallet}
          color="blue"
          href="/admin/finance/accounts"
        />
        <StatCard
          title="Bu Ay Gelir"
          value={formatCurrency(thisMonthIncome, CURRENCY.TRY)}
          icon={ArrowUpCircle}
          color="emerald"
          href="/admin/finance/income"
        />
        <StatCard
          title="Bu Ay Gider"
          value={formatCurrency(thisMonthExpense, CURRENCY.TRY)}
          icon={ArrowDownCircle}
          color="red"
          href="/admin/finance/expenses"
        />
        <StatCard
          title="Net Kar/Zarar"
          value={formatCurrency(Math.abs(thisMonthNet), CURRENCY.TRY)}
          subtitle={thisMonthNet >= 0 ? "Kar" : "Zarar"}
          icon={thisMonthNet >= 0 ? TrendingUp : TrendingDown}
          color={thisMonthNet >= 0 ? "emerald" : "red"}
          href="/admin/finance/reports"
        />
      </div>

      {/* İkinci Satır Metrikler */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Bekleyen Alacaklar"
          value={formatCurrency(pendingReceivables, CURRENCY.TRY)}
          subtitle={
            overdueReceivables > 0
              ? `${formatCurrency(overdueReceivables)} vadesi geçmiş`
              : undefined
          }
          icon={TrendingUp}
          color="amber"
          href="/admin/finance/receivables"
        />
        <StatCard
          title="Bekleyen Borçlar"
          value={formatCurrency(pendingPayables, CURRENCY.TRY)}
          icon={TrendingDown}
          color="purple"
          href="/admin/finance/payables"
        />
        <StatCard
          title="Aktif Personel"
          value={personnelStats?.personnel?.active || 0}
          subtitle={`Toplam: ${personnelStats?.personnel?.total || 0}`}
          icon={Users}
          color="blue"
          href="/admin/finance/personnel"
        />
        <StatCard
          title="Bekleyen Avanslar"
          value={formatCurrency(
            personnelStats?.advances?.pendingAmount?.[CURRENCY.TRY] || 0,
            CURRENCY.TRY,
          )}
          subtitle={`${personnelStats?.advances?.paid || 0} adet ödenmemiş`}
          icon={HandCoins}
          color="amber"
          href="/admin/finance/personnel/advances"
        />
      </div>

      {/* Alt Bölüm */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hızlı İşlemler */}
        <Card className="bg-white border-slate-200 lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-slate-800">
              Hızlı İşlemler
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <QuickAction
              title="Gelir Ekle"
              description="Yeni gelir kaydı oluştur"
              icon={ArrowUpCircle}
              href="/admin/finance/income/new"
              color="emerald"
            />
            <QuickAction
              title="Gider Ekle"
              description="Yeni gider kaydı oluştur"
              icon={ArrowDownCircle}
              href="/admin/finance/expenses/new"
              color="red"
            />
            <QuickAction
              title="Hesap Ekle"
              description="Yeni hesap tanımla"
              icon={Wallet}
              href="/admin/finance/accounts/new"
              color="blue"
            />
            <QuickAction
              title="Avans Ver"
              description="Personele avans ödemesi"
              icon={HandCoins}
              href="/admin/finance/personnel/advances/new"
              color="amber"
            />
          </CardContent>
        </Card>

        {/* Hesap Özeti */}
        <Card className="bg-white border-slate-200 lg:col-span-2">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold text-slate-800">
              Hesap Bakiyeleri
            </CardTitle>
            <Link href="/admin/finance/accounts">
              <Button variant="ghost" size="sm">
                Tümünü Gör
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* TRY */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <span className="text-lg font-bold text-blue-600">₺</span>
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">Türk Lirası</p>
                    <p className="text-xs text-slate-500">
                      {accountStats?.byCurrency?.[CURRENCY.TRY] || 0} hesap
                    </p>
                  </div>
                </div>
                <p className="text-xl font-bold text-slate-900">
                  {formatCurrency(tryBalance, CURRENCY.TRY)}
                </p>
              </div>

              {/* USD */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <span className="text-lg font-bold text-emerald-600">
                      $
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">
                      Amerikan Doları
                    </p>
                    <p className="text-xs text-slate-500">
                      {accountStats?.byCurrency?.[CURRENCY.USD] || 0} hesap
                    </p>
                  </div>
                </div>
                <p className="text-xl font-bold text-slate-900">
                  {formatCurrency(usdBalance, CURRENCY.USD)}
                </p>
              </div>

              {/* EUR */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                    <span className="text-lg font-bold text-purple-600">€</span>
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">Euro</p>
                    <p className="text-xs text-slate-500">
                      {accountStats?.byCurrency?.[CURRENCY.EUR] || 0} hesap
                    </p>
                  </div>
                </div>
                <p className="text-xl font-bold text-slate-900">
                  {formatCurrency(eurBalance, CURRENCY.EUR)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Uyarılar */}
      {(overdueReceivables > 0 ||
        (receivablePayableStats?.payables?.overdue?.[CURRENCY.TRY] || 0) >
          0) && (
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-800">
                  Dikkat Edilmesi Gerekenler
                </p>
                <ul className="mt-2 space-y-1 text-sm text-amber-700">
                  {overdueReceivables > 0 && (
                    <li>
                      • {formatCurrency(overdueReceivables)} vadesi geçmiş
                      alacak bulunuyor
                    </li>
                  )}
                  {(receivablePayableStats?.payables?.overdue?.[CURRENCY.TRY] ||
                    0) > 0 && (
                    <li>
                      •{" "}
                      {formatCurrency(
                        receivablePayableStats?.payables?.overdue?.[
                          CURRENCY.TRY
                        ],
                      )}{" "}
                      vadesi geçmiş borç bulunuyor
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
