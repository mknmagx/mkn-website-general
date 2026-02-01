"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import {
  getTransaction,
  deleteTransaction,
  TRANSACTION_TYPE,
  TRANSACTION_STATUS,
  formatCurrency,
  getCurrencyLabel,
  getCurrencySymbol,
  getTransactionTypeLabel,
  getIncomeCategoryLabel,
  getExpenseCategoryLabel,
} from "@/lib/services/finance";
import {
  ArrowLeft,
  Trash2,
  Pencil,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowRightLeft,
  RefreshCw,
  Building2,
  Calendar,
  FileText,
  Hash,
  User,
  Wallet,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
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

const getTypeIcon = (type) => {
  switch (type) {
    case TRANSACTION_TYPE.INCOME:
      return <ArrowDownLeft className="w-5 h-5" />;
    case TRANSACTION_TYPE.EXPENSE:
      return <ArrowUpRight className="w-5 h-5" />;
    case TRANSACTION_TYPE.TRANSFER:
      return <ArrowRightLeft className="w-5 h-5" />;
    case TRANSACTION_TYPE.EXCHANGE:
      return <RefreshCw className="w-5 h-5" />;
    default:
      return <FileText className="w-5 h-5" />;
  }
};

const getTypeColor = (type) => {
  switch (type) {
    case TRANSACTION_TYPE.INCOME:
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case TRANSACTION_TYPE.EXPENSE:
      return "bg-red-100 text-red-700 border-red-200";
    case TRANSACTION_TYPE.TRANSFER:
      return "bg-blue-100 text-blue-700 border-blue-200";
    case TRANSACTION_TYPE.EXCHANGE:
      return "bg-purple-100 text-purple-700 border-purple-200";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
};

const getStatusBadge = (status) => {
  switch (status) {
    case TRANSACTION_STATUS.COMPLETED:
      return <Badge className="bg-emerald-100 text-emerald-700">Tamamlandı</Badge>;
    case TRANSACTION_STATUS.PENDING:
      return <Badge className="bg-amber-100 text-amber-700">Beklemede</Badge>;
    case TRANSACTION_STATUS.CANCELLED:
      return <Badge className="bg-red-100 text-red-700">İptal</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export default function TransactionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAdminAuth();

  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadTransaction();
  }, [params.id]);

  const loadTransaction = async () => {
    setLoading(true);
    try {
      const result = await getTransaction(params.id);
      if (result.success) {
        setTransaction(result.data);
      } else {
        toast.error("İşlem bulunamadı");
        router.push("/admin/finance");
      }
    } catch (error) {
      toast.error("İşlem yüklenirken hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const result = await deleteTransaction(params.id, user?.uid);
      if (result.success) {
        toast.success("İşlem silindi");
        // İşlem türüne göre doğru sayfaya yönlendir
        if (transaction.type === TRANSACTION_TYPE.INCOME) {
          router.push("/admin/finance/income");
        } else if (transaction.type === TRANSACTION_TYPE.EXPENSE) {
          router.push("/admin/finance/expenses");
        } else {
          router.push("/admin/finance");
        }
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "-";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat("tr-TR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-32" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!transaction) {
    return null;
  }

  const getCategoryLabel = (type, category) => {
    if (type === TRANSACTION_TYPE.INCOME) {
      return getIncomeCategoryLabel(category);
    } else if (type === TRANSACTION_TYPE.EXPENSE) {
      return getExpenseCategoryLabel(category);
    }
    return category || "-";
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">
                {transaction.transactionNumber}
              </h1>
              {getStatusBadge(transaction.status)}
            </div>
            <p className="text-sm text-slate-500">
              {formatDate(transaction.transactionDate)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Sil
          </Button>
        </div>
      </div>

      {/* Amount Card */}
      <Card className={`border-2 ${getTypeColor(transaction.type)}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${getTypeColor(transaction.type)}`}>
                {getTypeIcon(transaction.type)}
              </div>
              <div>
                <p className="text-sm text-slate-600">
                  {transaction.type === TRANSACTION_TYPE.TRANSFER 
                    ? (transaction.transferDirection === 'IN' ? 'Transfer Giriş' : 'Transfer Çıkış')
                    : getTransactionTypeLabel(transaction.type)
                  }
                </p>
                <p className="text-3xl font-bold">
                  {transaction.type === TRANSACTION_TYPE.INCOME && "+"}
                  {transaction.type === TRANSACTION_TYPE.EXPENSE && "-"}
                  {transaction.type === TRANSACTION_TYPE.TRANSFER && (transaction.transferDirection === 'IN' ? "+" : "-")}
                  {formatCurrency(transaction.amount, transaction.currency)}
                </p>
                {transaction.type === TRANSACTION_TYPE.EXCHANGE && (
                  <p className="text-sm text-slate-500 mt-1">
                    {transaction.fromAmount} {transaction.fromCurrency} → {transaction.toAmount} {transaction.toCurrency}
                  </p>
                )}
                {transaction.type === TRANSACTION_TYPE.TRANSFER && transaction.toAccountName && (
                  <p className="text-sm text-slate-500 mt-1">
                    {transaction.transferDirection === 'IN' 
                      ? `${transaction.toAccountName}'dan gelen` 
                      : `${transaction.toAccountName}'a giden`
                    }
                  </p>
                )}
              </div>
            </div>
            <div className="text-right">
              <Badge variant="outline" className="text-lg px-3 py-1">
                {getCurrencySymbol(transaction.currency)} {getCurrencyLabel(transaction.currency)}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sol Kolon */}
        <Card className="bg-white border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5 text-slate-600" />
              İşlem Detayları
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-500">İşlem No</span>
              <span className="font-mono font-medium">{transaction.transactionNumber}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-500">Tür</span>
              <span className="font-medium">
                {transaction.type === TRANSACTION_TYPE.TRANSFER 
                  ? (transaction.transferDirection === 'IN' ? 'Transfer Giriş' : 'Transfer Çıkış')
                  : getTransactionTypeLabel(transaction.type)
                }
              </span>
            </div>
            {transaction.category && (
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-500">Kategori</span>
                <span className="font-medium">
                  {getCategoryLabel(transaction.type, transaction.category)}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-500">Tarih</span>
              <span className="font-medium">{formatDate(transaction.transactionDate)}</span>
            </div>
            {transaction.reference && (
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-500">Referans</span>
                <span className="font-mono">{transaction.reference}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sağ Kolon */}
        <Card className="bg-white border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Wallet className="w-5 h-5 text-slate-600" />
              Hesap Bilgileri
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-500">Hesap</span>
              <Link 
                href={`/admin/finance/accounts/${transaction.accountId}`}
                className="font-medium text-emerald-600 hover:underline flex items-center gap-1"
              >
                {transaction.accountName || "Hesap"}
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
            {transaction.type === TRANSACTION_TYPE.TRANSFER && transaction.toAccountName && (
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-500">Hedef Hesap</span>
                <Link 
                  href={`/admin/finance/accounts/${transaction.toAccountId}`}
                  className="font-medium text-blue-600 hover:underline flex items-center gap-1"
                >
                  {transaction.toAccountName}
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            )}
            {transaction.companyName && (
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-500">Firma</span>
                <span className="font-medium">{transaction.companyName}</span>
              </div>
            )}
            {transaction.customerName && (
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-500">Müşteri</span>
                <span className="font-medium">{transaction.customerName}</span>
              </div>
            )}
            {transaction.personnelName && (
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-500">Personel</span>
                <span className="font-medium">{transaction.personnelName}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Description & Notes */}
      {(transaction.description || transaction.notes) && (
        <Card className="bg-white border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg">Açıklama & Notlar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {transaction.description && (
              <div>
                <p className="text-sm text-slate-500 mb-1">Açıklama</p>
                <p className="text-slate-900">{transaction.description}</p>
              </div>
            )}
            {transaction.notes && (
              <div>
                <p className="text-sm text-slate-500 mb-1">Notlar</p>
                <p className="text-slate-700">{transaction.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Exchange Details */}
      {transaction.type === TRANSACTION_TYPE.EXCHANGE && (
        <Card className="bg-purple-50 border-purple-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-purple-800">
              <RefreshCw className="w-5 h-5" />
              Döviz Çevirme Detayları
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-center">
                <p className="text-sm text-purple-600">Kaynak</p>
                <p className="text-2xl font-bold text-purple-800">
                  {formatCurrency(transaction.fromAmount, transaction.fromCurrency)}
                </p>
              </div>
              <div className="flex flex-col items-center px-6">
                <ArrowRightLeft className="w-6 h-6 text-purple-500" />
                <p className="text-xs text-purple-600 mt-1">
                  Kur: {transaction.exchangeRate}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-purple-600">Hedef</p>
                <p className="text-2xl font-bold text-purple-800">
                  {formatCurrency(transaction.toAmount, transaction.toCurrency)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transfer Details */}
      {transaction.type === TRANSACTION_TYPE.TRANSFER && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-blue-800">
              <ArrowRightLeft className="w-5 h-5" />
              Transfer Detayları
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-center flex-1">
                <p className="text-sm text-blue-600">Kaynak Hesap</p>
                <p className="text-lg font-bold text-blue-800">
                  {transaction.accountName || "Hesap"}
                </p>
                <p className="text-xl font-bold text-red-600">
                  -{formatCurrency(transaction.fromAmount || transaction.amount, transaction.fromCurrency || transaction.currency)}
                </p>
              </div>
              <div className="flex flex-col items-center px-6">
                <ArrowRightLeft className="w-6 h-6 text-blue-500" />
                {transaction.exchangeRate && transaction.fromCurrency !== transaction.toCurrency && (
                  <p className="text-xs text-blue-600 mt-1">
                    Kur: {transaction.exchangeRate}
                  </p>
                )}
              </div>
              <div className="text-center flex-1">
                <p className="text-sm text-blue-600">Hedef Hesap</p>
                <p className="text-lg font-bold text-blue-800">
                  {transaction.toAccountName || "Hedef"}
                </p>
                <p className="text-xl font-bold text-green-600">
                  +{formatCurrency(transaction.toAmount || transaction.amount, transaction.toCurrency || transaction.currency)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Meta Info */}
      <Card className="bg-slate-50 border-slate-200">
        <CardContent className="py-4">
          <div className="flex items-center justify-between text-sm text-slate-500">
            <div>
              <span>Oluşturulma: </span>
              <span className="text-slate-700">{formatDate(transaction.createdAt)}</span>
            </div>
            {transaction.updatedAt && (
              <div>
                <span>Son Güncelleme: </span>
                <span className="text-slate-700">{formatDate(transaction.updatedAt)}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="w-5 h-5" />
              İşlemi Sil
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>
                  <strong>{transaction.transactionNumber}</strong> numaralı işlemi silmek istediğinize emin misiniz?
                </p>
                
                {/* İşlem Özeti */}
                <div className={`rounded-lg p-3 space-y-2 ${
                  transaction.type === TRANSACTION_TYPE.INCOME 
                    ? 'bg-red-50 border border-red-200' 
                    : transaction.type === TRANSACTION_TYPE.EXPENSE
                    ? 'bg-emerald-50 border border-emerald-200'
                    : transaction.type === TRANSACTION_TYPE.EXCHANGE
                    ? 'bg-purple-50 border border-purple-200'
                    : 'bg-blue-50 border border-blue-200'
                }`}>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">İşlem Türü:</span>
                    <span className="font-medium">
                      {transaction.type === TRANSACTION_TYPE.TRANSFER 
                        ? (transaction.transferDirection === 'IN' ? 'Transfer Giriş' : 'Transfer Çıkış')
                        : getTransactionTypeLabel(transaction.type)
                      }
                    </span>
                  </div>
                  
                  {transaction.type === TRANSACTION_TYPE.EXCHANGE ? (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Kaynak:</span>
                        <span className="font-semibold text-purple-600">
                          +{formatCurrency(transaction.exchange?.fromAmount || transaction.amount, transaction.exchange?.fromCurrency || transaction.currency)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Hedef:</span>
                        <span className="font-semibold text-purple-600">
                          -{formatCurrency(transaction.exchange?.toAmount || 0, transaction.exchange?.toCurrency || transaction.currency)}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Tutar:</span>
                      <span className={`font-semibold ${
                        transaction.type === TRANSACTION_TYPE.INCOME ? 'text-red-600' : 'text-emerald-600'
                      }`}>
                        {transaction.type === TRANSACTION_TYPE.INCOME ? '-' : '+'}
                        {formatCurrency(transaction.amount, transaction.currency)}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Hesap:</span>
                    <span className="font-medium">{transaction.accountName || "-"}</span>
                  </div>
                  
                  {transaction.type === TRANSACTION_TYPE.TRANSFER && transaction.toAccountName && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Hedef Hesap:</span>
                      <span className="font-medium">{transaction.toAccountName}</span>
                    </div>
                  )}
                </div>

                <p className="text-amber-600 text-sm flex items-center gap-1">
                  ⚠️ Bu işlem geri alınamaz. Hesap bakiye(ler)i otomatik olarak güncellenecektir.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? "Siliniyor..." : "Sil ve Bakiyeyi Güncelle"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
