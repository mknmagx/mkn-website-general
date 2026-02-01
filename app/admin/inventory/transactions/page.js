"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "../../../../hooks/use-admin-auth";
import { useToast } from "../../../../hooks/use-toast";
import {
  useTransactions,
  useInventoryOperations,
} from "../../../../hooks/use-inventory";
import {
  TRANSACTION_TYPE,
  TRANSACTION_TYPE_LABELS,
  TRANSACTION_SUBTYPE_LABELS,
  UNIT_LABELS,
  transactionService,
} from "../../../../lib/services/inventory-service";
import { DeliveryService } from "../../../../lib/services/delivery-service";
import { formatDistanceToNow, format } from "date-fns";
import { tr } from "date-fns/locale";

// UI Components
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Badge } from "../../../../components/ui/badge";
import {
  Card,
  CardContent,
} from "../../../../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";
import { Skeleton } from "../../../../components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../../components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../../components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../../components/ui/dropdown-menu";

// Icons
import {
  Search,
  RefreshCw,
  ArrowDownToLine,
  ArrowUpFromLine,
  Activity,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  XCircle,
  Building2,
  User,
  MoreVertical,
  FileText,
  Link as LinkIcon,
  Loader2,
  Edit,
  Save,
  XSquare,
} from "lucide-react";

export default function TransactionsPage() {
  const { user } = useAdminAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [cancelDialog, setCancelDialog] = useState({ open: false, transaction: null });
  const [creatingDelivery, setCreatingDelivery] = useState(null);
  
  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedQuantities, setEditedQuantities] = useState({});
  const [saving, setSaving] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  const { transactions, loading, refresh } = useTransactions();
  const { cancelTransaction, loading: cancelling } = useInventoryOperations();

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    let result = [...transactions];

    // Type filter
    if (typeFilter !== "all") {
      result = result.filter((t) => t.type === typeFilter);
    }

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (t) =>
          t.transactionNumber?.toLowerCase().includes(term) ||
          t.itemSnapshot?.name?.toLowerCase().includes(term) ||
          t.itemSnapshot?.sku?.toLowerCase().includes(term) ||
          t.companyName?.toLowerCase().includes(term) ||
          t.notes?.toLowerCase().includes(term)
      );
    }

    return result;
  }, [transactions, typeFilter, searchTerm]);

  // Paginated transactions
  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredTransactions.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTransactions, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  // Edit mode functions
  const handleEnterEditMode = () => {
    setIsEditMode(true);
    setEditedQuantities({});
  };

  const handleCancelEditMode = () => {
    setIsEditMode(false);
    setEditedQuantities({});
  };

  const handleQuantityChange = (transactionId, value) => {
    setEditedQuantities(prev => ({
      ...prev,
      [transactionId]: value
    }));
  };

  const handleSaveChanges = async () => {
    const changedEntries = Object.entries(editedQuantities).filter(([id, qty]) => {
      const original = transactions.find(t => t.id === id);
      return original && Number(qty) !== original.quantity;
    });

    if (changedEntries.length === 0) {
      toast({
        title: "Bilgi",
        description: "Değişiklik yapılmadı.",
      });
      return;
    }

    setSaving(true);
    try {
      const updates = changedEntries.map(([id, quantity]) => ({
        id,
        quantity: Number(quantity)
      }));

      const result = await transactionService.batchUpdateQuantities(updates, user);

      toast({
        title: "Başarılı",
        description: `${result.transactionCount} işlem ve ${result.itemsUpdated} ürün stoğu güncellendi.`,
      });

      setIsEditMode(false);
      setEditedQuantities({});
      refresh();
    } catch (error) {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const getEditedCount = () => {
    return Object.entries(editedQuantities).filter(([id, qty]) => {
      const original = transactions.find(t => t.id === id);
      return original && Number(qty) !== original.quantity;
    }).length;
  };

  const handleCancel = async () => {
    if (!cancelDialog.transaction) return;

    try {
      await cancelTransaction(cancelDialog.transaction.id, user);
      toast({
        title: "Başarılı",
        description: "İşlem iptal edildi.",
      });
      refresh();
    } catch (error) {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setCancelDialog({ open: false, transaction: null });
    }
  };

  const formatCurrency = (value, currency = "TRY") => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
    }).format(value || 0);
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat("tr-TR").format(value || 0);
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case TRANSACTION_TYPE.INBOUND:
        return <ArrowDownToLine className="h-4 w-4 text-green-600" />;
      case TRANSACTION_TYPE.OUTBOUND:
        return <ArrowUpFromLine className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4 text-slate-600" />;
    }
  };

  const getTypeBadge = (type) => {
    const colors = {
      [TRANSACTION_TYPE.INBOUND]: "bg-green-50 text-green-700 border-green-200",
      [TRANSACTION_TYPE.OUTBOUND]: "bg-red-50 text-red-700 border-red-200",
      [TRANSACTION_TYPE.ADJUSTMENT]: "bg-yellow-50 text-yellow-700 border-yellow-200",
      [TRANSACTION_TYPE.TRANSFER]: "bg-blue-50 text-blue-700 border-blue-200",
    };
    return colors[type] || "bg-slate-50 text-slate-700 border-slate-200";
  };

  // Check if transaction can have delivery
  const canCreateDelivery = (transaction) => {
    return (
      (transaction.type === TRANSACTION_TYPE.INBOUND ||
        transaction.type === TRANSACTION_TYPE.OUTBOUND) &&
      transaction.status !== "cancelled" &&
      !transaction.linkedDeliveryId
    );
  };

  // Create delivery from transaction
  const handleCreateDelivery = async (transaction) => {
    setCreatingDelivery(transaction.id);
    try {
      const result = await DeliveryService.createFromTransaction(transaction, {
        createdBy: user,
      });

      if (result.success) {
        toast({
          title: "Başarılı",
          description: `İrsaliye oluşturuldu: ${result.deliveryNumber}`,
        });
        router.push(`/admin/deliveries/${result.id}`);
      } else {
        toast({
          title: "Hata",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setCreatingDelivery(null);
    }
  };

  if (loading && !refreshing) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="space-y-6">
          <Skeleton className="h-10 w-64 bg-slate-200" />
          <Skeleton className="h-16 w-full bg-slate-200" />
          <Skeleton className="h-96 w-full bg-slate-200" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Stok Hareketleri</h1>
            <p className="text-sm text-slate-600 mt-1">
              Toplam {formatNumber(filteredTransactions.length)} işlem
              {isEditMode && getEditedCount() > 0 && (
                <span className="text-amber-600 ml-2">
                  ({getEditedCount()} değişiklik)
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {isEditMode ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancelEditMode}
                  disabled={saving}
                  className="border-slate-300"
                >
                  <XSquare className="h-4 w-4 mr-2" />
                  İptal
                </Button>
                <Button
                  onClick={handleSaveChanges}
                  disabled={saving || getEditedCount() === 0}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Kaydediliyor...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Değişiklikleri Kaydet
                    </>
                  )}
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={refreshing}
                >
                  <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEnterEditMode}
                  className="border-amber-300 text-amber-700 hover:bg-amber-50"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Miktar Düzenle
                </Button>
                <Button asChild variant="outline" className="border-green-300 text-green-700">
                  <Link href="/admin/inventory/inbound">
                    <ArrowDownToLine className="h-4 w-4 mr-2" />
                    Giriş
                  </Link>
                </Button>
                <Button asChild variant="outline" className="border-red-300 text-red-700">
                  <Link href="/admin/inventory/outbound">
                    <ArrowUpFromLine className="h-4 w-4 mr-2" />
                    Çıkış
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="p-8 space-y-6">
        {/* Filters */}
        <Card className="bg-white border-slate-200">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative flex-1 min-w-[200px] max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="İşlem no, ürün adı veya firma ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-slate-300"
                />
              </div>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[150px] border-slate-300">
                  <SelectValue placeholder="İşlem Tipi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm İşlemler</SelectItem>
                  {Object.entries(TRANSACTION_TYPE_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {(searchTerm || typeFilter !== "all") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchTerm("");
                    setTypeFilter("all");
                  }}
                  className="text-slate-500"
                >
                  <X className="h-4 w-4 mr-1" />
                  Temizle
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="bg-white border-slate-200">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-200 bg-slate-50">
                  <TableHead className="text-slate-700 font-semibold">Tarih</TableHead>
                  <TableHead className="text-slate-700 font-semibold">İşlem No</TableHead>
                  <TableHead className="text-slate-700 font-semibold">Tip</TableHead>
                  <TableHead className="text-slate-700 font-semibold">Ürün</TableHead>
                  <TableHead className="text-slate-700 font-semibold text-right">Miktar</TableHead>
                  <TableHead className="text-slate-700 font-semibold text-right">Değer</TableHead>
                  <TableHead className="text-slate-700 font-semibold">Firma</TableHead>
                  <TableHead className="text-slate-700 font-semibold">Durum</TableHead>
                  <TableHead className="text-slate-700 font-semibold text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedTransactions.length > 0 ? (
                  paginatedTransactions.map((transaction) => (
                    <TableRow
                      key={transaction.id}
                      className="border-slate-200 hover:bg-slate-50 transition-colors"
                    >
                      <TableCell>
                        <div className="space-y-1">
                          <p className="text-sm text-slate-900">
                            {transaction.createdAt?.seconds
                              ? format(
                                  new Date(transaction.createdAt.seconds * 1000),
                                  "dd MMM yyyy",
                                  { locale: tr }
                                )
                              : "-"}
                          </p>
                          <p className="text-xs text-slate-500">
                            {transaction.createdAt?.seconds
                              ? format(
                                  new Date(transaction.createdAt.seconds * 1000),
                                  "HH:mm"
                                )
                              : ""}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-slate-100 px-2 py-1 rounded">
                          {transaction.transactionNumber}
                        </code>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTypeIcon(transaction.type)}
                          <Badge variant="outline" className={getTypeBadge(transaction.type)}>
                            {TRANSACTION_TYPE_LABELS[transaction.type]}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          {TRANSACTION_SUBTYPE_LABELS[transaction.subtype]}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/admin/inventory/items/${transaction.itemId}`}
                          className="hover:text-blue-600"
                        >
                          <p className="font-medium text-slate-900">
                            {transaction.itemSnapshot?.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {transaction.itemSnapshot?.sku}
                          </p>
                        </Link>
                      </TableCell>
                      <TableCell className="text-right">
                        {isEditMode && transaction.status !== "cancelled" ? (
                          <div className="flex items-center justify-end gap-2">
                            <Input
                              type="number"
                              value={editedQuantities[transaction.id] ?? transaction.quantity}
                              onChange={(e) => handleQuantityChange(transaction.id, e.target.value)}
                              className={`w-24 h-8 text-right text-sm ${
                                editedQuantities[transaction.id] !== undefined && 
                                Number(editedQuantities[transaction.id]) !== transaction.quantity
                                  ? "border-amber-400 bg-amber-50"
                                  : "border-slate-300"
                              }`}
                            />
                            <span className="text-xs text-slate-500">
                              {UNIT_LABELS[transaction.unit]}
                            </span>
                          </div>
                        ) : (
                          <>
                            <span
                              className={`font-semibold ${
                                transaction.quantity > 0 ? "text-green-600" : "text-red-600"
                              }`}
                            >
                              {transaction.quantity > 0 ? "+" : ""}
                              {formatNumber(transaction.quantity)}
                            </span>
                            <span className="text-xs text-slate-500 ml-1">
                              {UNIT_LABELS[transaction.unit]}
                            </span>
                            <p className="text-xs text-slate-500">
                              {transaction.previousStock} → {transaction.newStock}
                            </p>
                          </>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(transaction.totalValue, transaction.currency)}
                      </TableCell>
                      <TableCell>
                        {transaction.companyName ? (
                          <div className="flex items-center gap-1 text-sm">
                            <Building2 className="h-3 w-3 text-slate-400" />
                            {transaction.companyName}
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {transaction.status === "cancelled" ? (
                          <Badge variant="outline" className="border-red-300 text-red-700 bg-red-50">
                            İptal
                          </Badge>
                        ) : transaction.linkedDeliveryId ? (
                          <Link
                            href={`/admin/deliveries/${transaction.linkedDeliveryId}`}
                            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                          >
                            <LinkIcon className="h-3 w-3" />
                            İrsaliye
                          </Link>
                        ) : (
                          <Badge variant="outline" className="border-green-300 text-green-700 bg-green-50">
                            Tamamlandı
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            {canCreateDelivery(transaction) && (
                              <>
                                <DropdownMenuItem
                                  onClick={() => handleCreateDelivery(transaction)}
                                  disabled={creatingDelivery === transaction.id}
                                >
                                  {creatingDelivery === transaction.id ? (
                                    <>
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                      Oluşturuluyor...
                                    </>
                                  ) : (
                                    <>
                                      <FileText className="h-4 w-4 mr-2" />
                                      İrsaliye Oluştur
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                              </>
                            )}
                            {transaction.linkedDeliveryId && (
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/deliveries/${transaction.linkedDeliveryId}`}>
                                  <FileText className="h-4 w-4 mr-2" />
                                  İrsaliyeyi Görüntüle
                                </Link>
                              </DropdownMenuItem>
                            )}
                            {transaction.status !== "cancelled" && (
                              <DropdownMenuItem
                                onClick={() => setCancelDialog({ open: true, transaction })}
                                className="text-red-600 focus:text-red-600"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                İptal Et
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="h-32 text-center text-slate-500">
                      Henüz işlem bulunmuyor.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <span>Sayfa başına:</span>
                <Select
                  value={itemsPerPage.toString()}
                  onValueChange={(v) => {
                    setItemsPerPage(Number(v));
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-[70px] h-8 border-slate-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="h-8 w-8 p-0 border-slate-300"
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="h-8 w-8 p-0 border-slate-300"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="px-3 text-sm text-slate-600">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="h-8 w-8 p-0 border-slate-300"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="h-8 w-8 p-0 border-slate-300"
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>

              <div className="text-sm text-slate-600">
                {(currentPage - 1) * itemsPerPage + 1} -{" "}
                {Math.min(currentPage * itemsPerPage, filteredTransactions.length)} /{" "}
                {filteredTransactions.length}
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Cancel Dialog */}
      <AlertDialog
        open={cancelDialog.open}
        onOpenChange={(open) => !open && setCancelDialog({ open: false, transaction: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>İşlemi İptal Et</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{cancelDialog.transaction?.transactionNumber}</strong> numaralı işlemi iptal
              etmek istediğinize emin misiniz? Stok miktarı geri alınacak.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Vazgeç</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              className="bg-red-600 hover:bg-red-700"
              disabled={cancelling}
            >
              {cancelling ? "İptal Ediliyor..." : "İptal Et"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
