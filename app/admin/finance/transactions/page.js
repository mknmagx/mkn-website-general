"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import {
  getTransactions,
  getAccounts,
  formatCurrency,
  formatDate,
  updateTransaction,
  TRANSACTION_TYPE,
  TRANSACTION_STATUS,
  INCOME_CATEGORY,
  EXPENSE_CATEGORY,
  getCurrencySymbol,
  getTransactionTypeLabel,
  getCategoryLabel,
} from "@/lib/services/finance";
import {
  ArrowUpCircle,
  ArrowDownCircle,
  ArrowLeftRight,
  RefreshCw,
  Search,
  Filter,
  Calendar,
  Download,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Trash2,
  Eye,
  Edit,
  Save,
  Loader2,
  Building2,
  User,
  FileText,
  X,
  ArrowLeft,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 20;

export default function TransactionsListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAdminAuth();
  
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [allTransactions, setAllTransactions] = useState([]); // Tüm işlemler (filtrelenmiş)
  const [accounts, setAccounts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Edit dialog state
  const [editDialog, setEditDialog] = useState({ open: false, transaction: null });
  const [editFormData, setEditFormData] = useState({
    amount: "",
    description: "",
    notes: "",
  });
  const [editSaving, setEditSaving] = useState(false);
  
  // Filtreler
  const [filters, setFilters] = useState({
    type: searchParams.get("type") || "",
    accountId: searchParams.get("accountId") || "",
    status: searchParams.get("status") || "",
    category: searchParams.get("category") || "",
    startDate: searchParams.get("startDate") || "",
    endDate: searchParams.get("endDate") || "",
    search: searchParams.get("search") || "",
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Build filter object
      const filterObj = {};
      if (filters.type && filters.type !== 'all') filterObj.type = filters.type;
      if (filters.accountId && filters.accountId !== 'all') filterObj.accountId = filters.accountId;
      if (filters.status && filters.status !== 'all') filterObj.status = filters.status;
      if (filters.category) filterObj.category = filters.category;
      if (filters.startDate) filterObj.startDate = filters.startDate;
      if (filters.endDate) filterObj.endDate = filters.endDate;
      
      const [txResult, accResult] = await Promise.all([
        getTransactions(filterObj, { limit: 1000 }), // Tüm veriyi çek, client-side pagination yapacağız
        getAccounts({ isActive: true }),
      ]);
      
      if (txResult.success) {
        let data = txResult.data;
        
        // Client-side search filter
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          data = data.filter(tx => 
            tx.transactionNumber?.toLowerCase().includes(searchLower) ||
            tx.description?.toLowerCase().includes(searchLower) ||
            tx.accountName?.toLowerCase().includes(searchLower) ||
            tx.customerName?.toLowerCase().includes(searchLower) ||
            tx.companyName?.toLowerCase().includes(searchLower) ||
            tx.personnelName?.toLowerCase().includes(searchLower)
          );
        }
        
        // Tarihe göre yeniden eskiye sırala (en yeni en üstte)
        data.sort((a, b) => {
          // transactionDate'i timestamp'e çevir
          let dateA, dateB;
          
          // a için tarih
          if (a.transactionDate?.toDate) {
            dateA = a.transactionDate.toDate().getTime();
          } else if (a.transactionDate?.seconds) {
            dateA = a.transactionDate.seconds * 1000;
          } else if (a.transactionDate) {
            dateA = new Date(a.transactionDate).getTime();
          } else if (a.createdAt?.toDate) {
            dateA = a.createdAt.toDate().getTime();
          } else if (a.createdAt?.seconds) {
            dateA = a.createdAt.seconds * 1000;
          } else {
            dateA = 0;
          }
          
          // b için tarih
          if (b.transactionDate?.toDate) {
            dateB = b.transactionDate.toDate().getTime();
          } else if (b.transactionDate?.seconds) {
            dateB = b.transactionDate.seconds * 1000;
          } else if (b.transactionDate) {
            dateB = new Date(b.transactionDate).getTime();
          } else if (b.createdAt?.toDate) {
            dateB = b.createdAt.toDate().getTime();
          } else if (b.createdAt?.seconds) {
            dateB = b.createdAt.seconds * 1000;
          } else {
            dateB = 0;
          }
          
          return dateB - dateA; // Descending (yeniden eskiye)
        });
        
        setAllTransactions(data);
        setTotalCount(data.length);
        setTotalPages(Math.ceil(data.length / PAGE_SIZE));
        
        // Mevcut sayfanın verilerini al
        const startIndex = (currentPage - 1) * PAGE_SIZE;
        const endIndex = startIndex + PAGE_SIZE;
        setTransactions(data.slice(startIndex, endIndex));
      }
      
      if (accResult.success) {
        setAccounts(accResult.data);
      }
    } catch (error) {
      toast.error("İşlemler yüklenirken hata oluştu");
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      type: "",
      accountId: "",
      status: "",
      category: "",
      startDate: "",
      endDate: "",
      search: "",
    });
    setCurrentPage(1);
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== "");

  // Open edit dialog
  const handleOpenEditDialog = (transaction) => {
    setEditFormData({
      amount: transaction.amount || 0,
      description: transaction.description || "",
      notes: transaction.notes || "",
    });
    setEditDialog({ open: true, transaction });
  };

  // Save edit - updates finance transaction and account balance
  const handleSaveEdit = async () => {
    if (!editDialog.transaction) return;

    const tx = editDialog.transaction;
    const newAmount = Number(editFormData.amount);

    if (isNaN(newAmount) || newAmount < 0) {
      toast.error("Geçerli bir tutar girin");
      return;
    }

    setEditSaving(true);
    try {
      const result = await updateTransaction(
        tx.id,
        {
          amount: newAmount,
          description: editFormData.description,
          notes: editFormData.notes,
        },
        user?.uid
      );

      if (result.success) {
        toast.success("İşlem başarıyla güncellendi. Hesap bakiyesi de düzeltildi.");
        setEditDialog({ open: false, transaction: null });
        loadData(); // Refresh list
      } else {
        toast.error(result.error || "Güncelleme başarısız");
      }
    } catch (error) {
      toast.error(error.message || "Bir hata oluştu");
    } finally {
      setEditSaving(false);
    }
  };

  const getTypeIcon = (type, direction) => {
    if (type === TRANSACTION_TYPE.TRANSFER) {
      if (direction === 'IN') {
        return <ArrowDownCircle className="w-4 h-4 text-emerald-600" />;
      } else if (direction === 'OUT') {
        return <ArrowUpCircle className="w-4 h-4 text-red-600" />;
      }
      return <ArrowLeftRight className="w-4 h-4 text-blue-600" />;
    }
    if (type === TRANSACTION_TYPE.INCOME) {
      return <ArrowDownCircle className="w-4 h-4 text-emerald-600" />;
    }
    if (type === TRANSACTION_TYPE.EXPENSE) {
      return <ArrowUpCircle className="w-4 h-4 text-red-600" />;
    }
    if (type === TRANSACTION_TYPE.EXCHANGE) {
      return <RefreshCw className="w-4 h-4 text-purple-600" />;
    }
    return <FileText className="w-4 h-4 text-slate-500" />;
  };

  const getTypeColor = (type, direction) => {
    if (type === TRANSACTION_TYPE.TRANSFER) {
      if (direction === 'IN') return "text-emerald-600";
      if (direction === 'OUT') return "text-red-600";
      return "text-blue-600";
    }
    if (type === TRANSACTION_TYPE.INCOME) return "text-emerald-600";
    if (type === TRANSACTION_TYPE.EXPENSE) return "text-red-600";
    if (type === TRANSACTION_TYPE.EXCHANGE) return "text-purple-600";
    return "text-slate-600";
  };

  const getAmountPrefix = (type, direction) => {
    if (type === TRANSACTION_TYPE.TRANSFER) {
      if (direction === 'IN') return "+";
      if (direction === 'OUT') return "-";
      return "";
    }
    if (type === TRANSACTION_TYPE.INCOME) return "+";
    if (type === TRANSACTION_TYPE.EXPENSE) return "-";
    return "";
  };

  const getTypeBadge = (type, direction) => {
    if (type === TRANSACTION_TYPE.TRANSFER) {
      if (direction === 'IN') {
        return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Transfer Giriş</Badge>;
      } else if (direction === 'OUT') {
        return <Badge className="bg-red-100 text-red-700 border-red-200">Transfer Çıkış</Badge>;
      }
      return <Badge className="bg-blue-100 text-blue-700 border-blue-200">Transfer</Badge>;
    }
    if (type === TRANSACTION_TYPE.INCOME) {
      return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Gelir</Badge>;
    }
    if (type === TRANSACTION_TYPE.EXPENSE) {
      return <Badge className="bg-red-100 text-red-700 border-red-200">Gider</Badge>;
    }
    if (type === TRANSACTION_TYPE.EXCHANGE) {
      return <Badge className="bg-purple-100 text-purple-700 border-purple-200">Döviz</Badge>;
    }
    return <Badge variant="outline">{type}</Badge>;
  };

  const getStatusBadge = (status) => {
    if (status === TRANSACTION_STATUS.COMPLETED) {
      return <Badge className="bg-green-100 text-green-700 border-green-200">Tamamlandı</Badge>;
    }
    if (status === TRANSACTION_STATUS.PENDING) {
      return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Bekliyor</Badge>;
    }
    if (status === TRANSACTION_STATUS.CANCELLED) {
      return <Badge className="bg-slate-100 text-slate-700 border-slate-200">İptal</Badge>;
    }
    return <Badge variant="outline">{status}</Badge>;
  };

  // Pagination değiştiğinde sadece gösterilen veriyi güncelle
  useEffect(() => {
    if (allTransactions.length > 0) {
      const startIndex = (currentPage - 1) * PAGE_SIZE;
      const endIndex = startIndex + PAGE_SIZE;
      setTransactions(allTransactions.slice(startIndex, endIndex));
    }
  }, [currentPage, allTransactions]);

  // Sayfa değiştirme
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Statistics - tüm veriden hesapla
  const stats = {
    total: allTransactions.length,
    income: allTransactions.filter(t => t.type === TRANSACTION_TYPE.INCOME).length,
    expense: allTransactions.filter(t => t.type === TRANSACTION_TYPE.EXPENSE).length,
    transfer: allTransactions.filter(t => t.type === TRANSACTION_TYPE.TRANSFER).length,
  };

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/finance">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Tüm İşlemler</h1>
            <p className="text-sm text-slate-500">
              Gelir, gider, transfer ve döviz işlemlerinin listesi
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={loadData}>
            <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
            Yenile
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-white border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-100">
                <FileText className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Toplam</p>
                <p className="text-xl font-bold text-slate-900">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-100">
                <ArrowDownCircle className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Gelir</p>
                <p className="text-xl font-bold text-emerald-600">{stats.income}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100">
                <ArrowUpCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Gider</p>
                <p className="text-xl font-bold text-red-600">{stats.expense}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <ArrowLeftRight className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Transfer</p>
                <p className="text-xl font-bold text-blue-600">{stats.transfer}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-white border-slate-200">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="İşlem no, açıklama, hesap ara..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Type Filter */}
            <Select
              value={filters.type}
              onValueChange={(value) => handleFilterChange("type", value)}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Tür" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                <SelectItem value={TRANSACTION_TYPE.INCOME}>Gelir</SelectItem>
                <SelectItem value={TRANSACTION_TYPE.EXPENSE}>Gider</SelectItem>
                <SelectItem value={TRANSACTION_TYPE.TRANSFER}>Transfer</SelectItem>
                <SelectItem value={TRANSACTION_TYPE.EXCHANGE}>Döviz</SelectItem>
              </SelectContent>
            </Select>

            {/* Account Filter */}
            <Select
              value={filters.accountId}
              onValueChange={(value) => handleFilterChange("accountId", value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Hesap" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Hesaplar</SelectItem>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select
              value={filters.status}
              onValueChange={(value) => handleFilterChange("status", value)}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Durum" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                <SelectItem value={TRANSACTION_STATUS.COMPLETED}>Tamamlandı</SelectItem>
                <SelectItem value={TRANSACTION_STATUS.PENDING}>Bekliyor</SelectItem>
                <SelectItem value={TRANSACTION_STATUS.CANCELLED}>İptal</SelectItem>
              </SelectContent>
            </Select>

            {/* Date Filters */}
            <Input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange("startDate", e.target.value)}
              className="w-[140px]"
              placeholder="Başlangıç"
            />
            <Input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange("endDate", e.target.value)}
              className="w-[140px]"
              placeholder="Bitiş"
            />

            {/* Clear Filters */}
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="w-4 h-4 mr-1" />
                Temizle
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card className="bg-white border-slate-200">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <FileText className="w-12 h-12 mx-auto text-slate-300 mb-4" />
              <p className="font-medium">İşlem bulunamadı</p>
              <p className="text-sm mt-1">Filtreleri değiştirmeyi deneyin</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Tarih</TableHead>
                  <TableHead className="w-[140px]">İşlem No</TableHead>
                  <TableHead>Açıklama</TableHead>
                  <TableHead>Hesap</TableHead>
                  <TableHead className="w-[120px]">Tür</TableHead>
                  <TableHead className="w-[100px]">Durum</TableHead>
                  <TableHead className="text-right w-[140px]">Tutar</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => (
                  <TableRow key={tx.id} className="hover:bg-slate-50">
                    <TableCell className="text-sm text-slate-500">
                      {formatDate(tx.transactionDate)}
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm">{tx.transactionNumber}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getTypeIcon(tx.type, tx.transferDirection)}
                        <div className="flex flex-col">
                          <span className="text-sm font-medium truncate max-w-[250px]">
                            {tx.description || "-"}
                          </span>
                          {(tx.customerName || tx.companyName || tx.personnelName) && (
                            <span className="text-xs text-slate-400">
                              {tx.customerName || tx.companyName || tx.personnelName}
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{tx.accountName || "-"}</span>
                      {tx.type === TRANSACTION_TYPE.TRANSFER && tx.toAccountName && (
                        <span className="text-xs text-slate-400 block">
                          {tx.transferDirection === 'OUT' ? `→ ${tx.toAccountName}` : `← ${tx.toAccountName}`}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {getTypeBadge(tx.type, tx.transferDirection)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(tx.status)}
                    </TableCell>
                    <TableCell className={cn(
                      "text-right font-medium",
                      getTypeColor(tx.type, tx.transferDirection)
                    )}>
                      {getAmountPrefix(tx.type, tx.transferDirection)}
                      {formatCurrency(tx.amount, tx.currency)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {/* Edit button - only for non-cancelled transactions */}
                        {tx.status !== TRANSACTION_STATUS.CANCELLED && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleOpenEditDialog(tx)}
                            title="Düzenle"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        )}
                        <Link href={`/admin/finance/transactions/${tx.id}`}>
                          <Button variant="ghost" size="sm" title="Detay">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {!loading && totalCount > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Toplam {totalCount} işlemden {((currentPage - 1) * PAGE_SIZE) + 1} - {Math.min(currentPage * PAGE_SIZE, totalCount)} arası gösteriliyor
          </p>
          
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              {/* İlk Sayfa */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
                <ChevronLeft className="w-4 h-4 -ml-2" />
              </Button>
              
              {/* Önceki Sayfa */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              {/* Sayfa Numaraları */}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => goToPage(pageNum)}
                      className="w-9 h-9"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              
              {/* Sonraki Sayfa */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              
              {/* Son Sayfa */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
                <ChevronRight className="w-4 h-4 -ml-2" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog
        open={editDialog.open}
        onOpenChange={(open) => !open && setEditDialog({ open: false, transaction: null })}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Finans İşlemi Düzenleme</DialogTitle>
            <DialogDescription>
              <strong>{editDialog.transaction?.transactionNumber}</strong> numaralı işlemi düzenleyin.
              Tutar değişikliği hesap bakiyesini otomatik güncelleyecektir.
            </DialogDescription>
          </DialogHeader>
          
          {editDialog.transaction && (
            <div className="space-y-4 py-4">
              {/* Current Info */}
              <div className="bg-slate-50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">İşlem Türü:</span>
                  <span className="font-medium">
                    {getTransactionTypeLabel(editDialog.transaction.type)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Hesap:</span>
                  <span className="font-medium">{editDialog.transaction.accountName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Mevcut Tutar:</span>
                  <span className={cn(
                    "font-medium",
                    editDialog.transaction.type === TRANSACTION_TYPE.INCOME ? "text-emerald-600" : "text-red-600"
                  )}>
                    {formatCurrency(editDialog.transaction.amount, editDialog.transaction.currency)}
                  </span>
                </div>
                {editDialog.transaction.inventoryTransactionId && (
                  <div className="flex justify-between text-blue-600">
                    <span>Envanter Bağlantısı:</span>
                    <span className="font-medium">Bağlantılı ✓</span>
                  </div>
                )}
              </div>

              {/* Edit Form */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="editAmount">Yeni Tutar ({getCurrencySymbol(editDialog.transaction.currency)}) *</Label>
                  <Input
                    id="editAmount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={editFormData.amount}
                    onChange={(e) => setEditFormData({ ...editFormData, amount: e.target.value })}
                    className="border-slate-300"
                  />
                </div>

                {/* Preview */}
                {editFormData.amount && Number(editFormData.amount) !== editDialog.transaction.amount && (
                  <div className="bg-blue-50 rounded-lg p-4 space-y-2 text-sm">
                    <p className="font-medium text-blue-800">Değişiklik Önizleme:</p>
                    <div className="flex justify-between">
                      <span className="text-blue-600">Tutar Farkı:</span>
                      <span className={cn(
                        "font-medium",
                        Number(editFormData.amount) > editDialog.transaction.amount ? "text-emerald-600" : "text-red-600"
                      )}>
                        {Number(editFormData.amount) > editDialog.transaction.amount ? "+" : ""}
                        {formatCurrency(
                          Number(editFormData.amount) - editDialog.transaction.amount,
                          editDialog.transaction.currency
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-600">Hesap Bakiye Etkisi:</span>
                      <span className="font-medium">
                        {editDialog.transaction.type === TRANSACTION_TYPE.INCOME ? (
                          Number(editFormData.amount) > editDialog.transaction.amount
                            ? `+${formatCurrency(Number(editFormData.amount) - editDialog.transaction.amount, editDialog.transaction.currency)} (artacak)`
                            : `${formatCurrency(Number(editFormData.amount) - editDialog.transaction.amount, editDialog.transaction.currency)} (azalacak)`
                        ) : (
                          Number(editFormData.amount) > editDialog.transaction.amount
                            ? `${formatCurrency(editDialog.transaction.amount - Number(editFormData.amount), editDialog.transaction.currency)} (daha az para kalacak)`
                            : `+${formatCurrency(editDialog.transaction.amount - Number(editFormData.amount), editDialog.transaction.currency)} (daha çok para kalacak)`
                        )}
                      </span>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="editDescription">Açıklama</Label>
                  <Input
                    id="editDescription"
                    value={editFormData.description}
                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                    className="border-slate-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="editNotes">Notlar</Label>
                  <Textarea
                    id="editNotes"
                    value={editFormData.notes}
                    onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                    className="border-slate-300"
                    rows={2}
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialog({ open: false, transaction: null })}
              disabled={editSaving}
            >
              İptal
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={editSaving}
              className="bg-slate-900 hover:bg-slate-800"
            >
              {editSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Kaydet
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
