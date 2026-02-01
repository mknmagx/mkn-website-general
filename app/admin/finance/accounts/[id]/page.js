"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import {
  getAccount,
  getTransactions,
  TRANSACTION_TYPE,
  TRANSACTION_STATUS,
  ACCOUNT_MODE,
  ALL_CURRENCIES,
  formatCurrency,
  getCurrencyLabel,
  getCurrencySymbol,
  getAccountTypeLabel,
  getTransactionTypeLabel,
} from "@/lib/services/finance";
import {
  ArrowLeft,
  Pencil,
  Wallet,
  Building2,
  Globe,
  Coins,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowRightLeft,
  RefreshCw,
  Calendar,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Plus,
  FileText,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const getTypeIcon = (type) => {
  switch (type) {
    case TRANSACTION_TYPE.INCOME:
      return <ArrowDownLeft className="w-4 h-4 text-emerald-600" />;
    case TRANSACTION_TYPE.EXPENSE:
      return <ArrowUpRight className="w-4 h-4 text-red-600" />;
    case TRANSACTION_TYPE.TRANSFER:
      return <ArrowRightLeft className="w-4 h-4 text-blue-600" />;
    case TRANSACTION_TYPE.EXCHANGE:
      return <RefreshCw className="w-4 h-4 text-purple-600" />;
    default:
      return <FileText className="w-4 h-4 text-slate-600" />;
  }
};

export default function AccountDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAdminAuth();

  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingTransactions, setLoadingTransactions] = useState(true);

  useEffect(() => {
    loadAccount();
    loadTransactions();
  }, [params.id]);

  const loadAccount = async () => {
    setLoading(true);
    try {
      const result = await getAccount(params.id);
      if (result.success) {
        setAccount(result.data);
      } else {
        toast.error("Hesap bulunamadı");
        router.push("/admin/finance/accounts");
      }
    } catch (error) {
      toast.error("Hesap yüklenirken hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async () => {
    setLoadingTransactions(true);
    try {
      const result = await getTransactions({ accountId: params.id }, { limit: 20 });
      if (result.success) {
        setTransactions(result.data);
      }
    } catch (error) {
      // Silent fail - transactions are optional
    } finally {
      setLoadingTransactions(false);
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

  // Calculate totals from transactions
  const calculateTotals = () => {
    const totals = { income: {}, expense: {} };
    
    transactions.forEach(tx => {
      if (tx.status !== TRANSACTION_STATUS.COMPLETED) return;
      
      const currency = tx.currency || 'TRY';
      
      if (tx.type === TRANSACTION_TYPE.INCOME) {
        totals.income[currency] = (totals.income[currency] || 0) + tx.amount;
      } else if (tx.type === TRANSACTION_TYPE.EXPENSE) {
        totals.expense[currency] = (totals.expense[currency] || 0) + tx.amount;
      }
    });
    
    return totals;
  };

  const totals = calculateTotals();

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!account) {
    return null;
  }

  const isMultiCurrency = account.mode === ACCOUNT_MODE.MULTI;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/finance/accounts">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">{account.name}</h1>
              {isMultiCurrency && (
                <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
                  <Globe className="w-3 h-3 mr-1" />
                  Çoklu Döviz
                </Badge>
              )}
            </div>
            <p className="text-sm text-slate-500">
              {getAccountTypeLabel(account.type)}
              {account.bankName && ` • ${account.bankName}`}
            </p>
          </div>
        </div>
        <Link href={`/admin/finance/accounts/${params.id}/edit`}>
          <Button variant="outline">
            <Pencil className="w-4 h-4 mr-2" />
            Düzenle
          </Button>
        </Link>
      </div>

      {/* Balance Cards */}
      {isMultiCurrency && account.balances ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {ALL_CURRENCIES.map((currency) => {
            const balance = account.balances[currency] || 0;
            const isSupported = account.supportedCurrencies?.includes(currency);
            if (!isSupported && balance === 0) return null;

            return (
              <Card key={currency} className={`${balance !== 0 ? 'bg-white' : 'bg-slate-50'} border-slate-200`}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="font-mono">
                      {getCurrencySymbol(currency)}
                    </Badge>
                    <span className="text-sm text-slate-500">{getCurrencyLabel(currency)}</span>
                  </div>
                  <p className={`text-2xl font-bold ${
                    balance > 0 ? 'text-emerald-700' : 
                    balance < 0 ? 'text-red-600' : 'text-slate-400'
                  }`}>
                    {formatCurrency(balance, currency)}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-emerald-50 border-emerald-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-emerald-700">Güncel Bakiye</p>
                  <p className="text-3xl font-bold text-emerald-800">
                    {formatCurrency(account.currentBalance, account.currency)}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Toplam Gelir</p>
                  <p className="text-2xl font-bold text-emerald-600">
                    {formatCurrency(totals.income[account.currency] || 0, account.currency)}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Toplam Gider</p>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(totals.expense[account.currency] || 0, account.currency)}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                  <TrendingDown className="w-5 h-5 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Account Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-white border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="w-5 h-5 text-slate-600" />
              Hesap Bilgileri
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Hesap Türü</span>
              <span className="font-medium">{getAccountTypeLabel(account.type)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Ana Para Birimi</span>
              <Badge variant="outline">{getCurrencyLabel(account.currency)}</Badge>
            </div>
            {account.bankName && (
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Banka</span>
                <span className="font-medium">{account.bankName}</span>
              </div>
            )}
            {account.iban && (
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">IBAN</span>
                <span className="font-mono text-sm">{account.iban}</span>
              </div>
            )}
            {account.accountNumber && (
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Hesap No</span>
                <span className="font-mono">{account.accountNumber}</span>
              </div>
            )}
            {account.description && (
              <div className="pt-2">
                <span className="text-slate-500 text-sm">Açıklama</span>
                <p className="text-slate-700 mt-1">{account.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-white border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg">Hızlı İşlemler</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href={`/admin/finance/income/new?accountId=${account.id}`}>
              <Button variant="outline" className="w-full justify-start text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50">
                <Plus className="w-4 h-4 mr-2" />
                Gelir Ekle
              </Button>
            </Link>
            <Link href={`/admin/finance/expenses/new?accountId=${account.id}`}>
              <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50">
                <Plus className="w-4 h-4 mr-2" />
                Gider Ekle
              </Button>
            </Link>
            <Link href={`/admin/finance/transfer?fromAccountId=${account.id}`}>
              <Button variant="outline" className="w-full justify-start text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                <ArrowRightLeft className="w-4 h-4 mr-2" />
                Hesaba Transfer
              </Button>
            </Link>
            {isMultiCurrency && (
              <Link href={`/admin/finance/exchange?accountId=${account.id}`}>
                <Button variant="outline" className="w-full justify-start text-purple-600 hover:text-purple-700 hover:bg-purple-50">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Döviz Çevir
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="bg-white border-slate-200">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5 text-slate-600" />
            Son İşlemler
          </CardTitle>
          <Link href={`/admin/finance?accountId=${account.id}`}>
            <Button variant="ghost" size="sm" className="text-slate-500">
              Tümünü Gör
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {loadingTransactions ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <FileText className="w-10 h-10 mx-auto text-slate-300 mb-3" />
              <p>Henüz işlem yok</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tarih</TableHead>
                  <TableHead>Açıklama</TableHead>
                  <TableHead>Tür</TableHead>
                  <TableHead className="text-right">Tutar</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.slice(0, 10).map((tx) => (
                  <TableRow key={tx.id} className="hover:bg-slate-50">
                    <TableCell className="text-sm text-slate-500">
                      {formatDate(tx.transactionDate)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getTypeIcon(tx.type)}
                        <span className="text-sm font-medium truncate max-w-[200px]">
                          {tx.description || tx.transactionNumber}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {tx.type === TRANSACTION_TYPE.TRANSFER 
                          ? (tx.transferDirection === 'IN' ? 'Transfer Giriş' : 'Transfer Çıkış')
                          : getTransactionTypeLabel(tx.type)
                        }
                      </Badge>
                    </TableCell>
                    <TableCell className={`text-right font-medium ${
                      tx.type === TRANSACTION_TYPE.INCOME ? 'text-emerald-600' : 
                      tx.type === TRANSACTION_TYPE.EXPENSE ? 'text-red-600' : 
                      tx.type === TRANSACTION_TYPE.TRANSFER ? (tx.transferDirection === 'IN' ? 'text-emerald-600' : 'text-red-600') : 'text-slate-700'
                    }`}>
                      {tx.type === TRANSACTION_TYPE.INCOME && "+"}
                      {tx.type === TRANSACTION_TYPE.EXPENSE && "-"}
                      {tx.type === TRANSACTION_TYPE.TRANSFER && (tx.transferDirection === 'IN' ? "+" : "-")}
                      {formatCurrency(tx.amount, tx.currency)}
                    </TableCell>
                    <TableCell>
                      <Link href={`/admin/finance/transactions/${tx.id}`}>
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
