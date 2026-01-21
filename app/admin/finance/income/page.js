"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import {
  getTransactions,
  deleteTransaction,
  getAccounts,
  formatCurrency,
  formatDate,
  getTransactionTypeLabel,
  getTransactionTypeColor,
  getIncomeCategoryLabel,
  getTransactionStatusLabel,
  getTransactionStatusColor,
  TRANSACTION_TYPE,
  TRANSACTION_STATUS,
  INCOME_CATEGORY,
  CURRENCY,
} from "@/lib/services/finance";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Pencil,
  Trash2,
  ArrowUpCircle,
  RefreshCw,
  Calendar,
  FileText,
  Download,
  Eye,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import { cn } from "@/lib/utils";

export default function IncomePage() {
  const router = useRouter();
  const { user } = useAdminAuth();
  
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [accountFilter, setAccountFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteDialog, setDeleteDialog] = useState({ open: false, transaction: null });

  const loadData = async () => {
    setLoading(true);
    try {
      const filters = {
        type: TRANSACTION_TYPE.INCOME,
      };
      if (categoryFilter !== "all") filters.category = categoryFilter;
      if (accountFilter !== "all") filters.accountId = accountFilter;
      if (statusFilter !== "all") filters.status = statusFilter;
      
      const [txResult, accResult] = await Promise.all([
        getTransactions(filters),
        getAccounts(),
      ]);

      if (txResult.success) setTransactions(txResult.data);
      if (accResult.success) setAccounts(accResult.data);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Veriler yüklenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [categoryFilter, accountFilter, statusFilter]);

  const handleDelete = async () => {
    if (!deleteDialog.transaction) return;
    
    try {
      const result = await deleteTransaction(deleteDialog.transaction.id, user?.uid);
      if (result.success) {
        toast.success("Gelir kaydı silindi");
        loadData();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setDeleteDialog({ open: false, transaction: null });
    }
  };

  const filteredTransactions = transactions.filter((tx) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        tx.description?.toLowerCase().includes(query) ||
        tx.transactionNumber?.toLowerCase().includes(query) ||
        tx.customerName?.toLowerCase().includes(query) ||
        tx.reference?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  // Toplam gelir hesapla
  const totalIncome = filteredTransactions.reduce((acc, tx) => {
    if (tx.status === TRANSACTION_STATUS.COMPLETED) {
      if (!acc[tx.currency]) acc[tx.currency] = 0;
      acc[tx.currency] += tx.amount;
    }
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-20" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gelirler</h1>
          <p className="text-sm text-slate-500 mt-1">
            {transactions.length} gelir kaydı
          </p>
        </div>
        <Link href="/admin/finance/income/new">
          <Button className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="w-4 h-4 mr-2" />
            Yeni Gelir
          </Button>
        </Link>
      </div>

      {/* Toplam */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(totalIncome).map(([currency, total]) => (
          <Card key={currency} className="bg-emerald-50 border-emerald-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-emerald-700">Toplam Gelir ({currency})</p>
                  <p className="text-2xl font-bold text-emerald-800">
                    {formatCurrency(total, currency)}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <ArrowUpCircle className="w-5 h-5 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {Object.keys(totalIncome).length === 0 && (
          <Card className="bg-slate-50 border-slate-200 md:col-span-3">
            <CardContent className="p-4 text-center text-slate-500">
              Henüz gelir kaydı bulunmuyor
            </CardContent>
          </Card>
        )}
      </div>

      {/* Filtreler */}
      <Card className="bg-white border-slate-200">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Gelir ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Kategoriler</SelectItem>
                {Object.values(INCOME_CATEGORY).map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {getIncomeCategoryLabel(cat)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={accountFilter} onValueChange={setAccountFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Hesap" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Hesaplar</SelectItem>
                {accounts.map((acc) => (
                  <SelectItem key={acc.id} value={acc.id}>
                    {acc.name}
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
                {Object.values(TRANSACTION_STATUS).map((status) => (
                  <SelectItem key={status} value={status}>
                    {getTransactionStatusLabel(status)}
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
          {filteredTransactions.length === 0 ? (
            <div className="p-12 text-center">
              <ArrowUpCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900">Gelir Bulunamadı</h3>
              <p className="text-sm text-slate-500 mt-1">
                Henüz gelir kaydı yok veya arama kriterlerine uygun kayıt bulunamadı
              </p>
              <Link href="/admin/finance/income/new">
                <Button className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  İlk Geliri Ekle
                </Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="font-semibold">İşlem No</TableHead>
                  <TableHead className="font-semibold">Tarih</TableHead>
                  <TableHead className="font-semibold">Açıklama</TableHead>
                  <TableHead className="font-semibold">Kategori</TableHead>
                  <TableHead className="font-semibold">Hesap</TableHead>
                  <TableHead className="font-semibold text-right">Tutar</TableHead>
                  <TableHead className="font-semibold">Durum</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((tx) => (
                  <TableRow key={tx.id} className="hover:bg-slate-50">
                    <TableCell className="font-mono text-sm text-slate-600">
                      {tx.transactionNumber}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {formatDate(tx.transactionDate)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-slate-900 line-clamp-1">
                          {tx.description || "-"}
                        </p>
                        {tx.customerName && (
                          <p className="text-xs text-slate-500">{tx.customerName}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {getIncomeCategoryLabel(tx.category) || "-"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {tx.accountName || "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="font-semibold text-emerald-600">
                        +{formatCurrency(tx.amount, tx.currency)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn("text-xs", getTransactionStatusColor(tx.status))}>
                        {getTransactionStatusLabel(tx.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => router.push(`/admin/finance/income/${tx.id}`)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Görüntüle
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => router.push(`/admin/finance/income/${tx.id}/edit`)}
                          >
                            <Pencil className="w-4 h-4 mr-2" />
                            Düzenle
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => setDeleteDialog({ open: true, transaction: tx })}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Sil
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Silme Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Gelir Kaydını Sil</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{deleteDialog.transaction?.transactionNumber}</strong> numaralı gelir kaydını silmek istediğinize emin misiniz?
              Bu işlem geri alınamaz ve hesap bakiyesi otomatik olarak güncellenecektir.
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
