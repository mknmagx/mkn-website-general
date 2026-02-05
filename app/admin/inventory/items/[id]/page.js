"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "../../../../../hooks/use-toast";
import { useAdminAuth } from "../../../../../hooks/use-admin-auth";
import { useCompanies } from "../../../../../hooks/use-company";
import {
  useInventoryItem,
  useItemTransactions,
  useWarehouses,
  useSuppliers,
  useInventoryOperations,
} from "../../../../../hooks/use-inventory";
import {
  ITEM_CATEGORY_LABELS,
  OWNERSHIP_TYPE,
  OWNERSHIP_TYPE_LABELS,
  ITEM_STATUS,
  ITEM_STATUS_LABELS,
  UNIT_LABELS,
  TRANSACTION_TYPE_LABELS,
  TRANSACTION_SUBTYPE_LABELS,
  inventoryItemService,
} from "../../../../../lib/services/inventory-service";
import { formatDistanceToNow, format } from "date-fns";
import { tr } from "date-fns/locale";

// UI Components
import { Button } from "../../../../../components/ui/button";
import { Input } from "../../../../../components/ui/input";
import { Label } from "../../../../../components/ui/label";
import { Textarea } from "../../../../../components/ui/textarea";
import { Badge } from "../../../../../components/ui/badge";
import { Skeleton } from "../../../../../components/ui/skeleton";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../../../../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../../../components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../../../components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../../../components/ui/alert-dialog";

// Icons
import {
  ArrowLeft,
  Edit,
  Trash2,
  Package,
  ArrowDownToLine,
  ArrowUpFromLine,
  Activity,
  Building2,
  Warehouse,
  AlertTriangle,
  Save,
  X,
  Calendar,
  User,
  DollarSign,
  Hash,
} from "lucide-react";

export default function ItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAdminAuth();
  const { toast } = useToast();

  const { item, loading, refresh } = useInventoryItem(params.id);
  const { transactions, loading: transactionsLoading } = useItemTransactions(params.id);
  const { warehouses } = useWarehouses();
  const { suppliers } = useSuppliers();
  const { companies } = useCompanies();
  const { updateItem, deleteItem, hardDeleteItem, loading: operationLoading } = useInventoryOperations();

  const [isEditing, setIsEditing] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, type: 'soft', transactionCount: 0 });
  const [editData, setEditData] = useState({});

  useEffect(() => {
    if (item) {
      setEditData({
        name: item.name || "",
        description: item.description || "",
        minStockLevel: item.stock?.minStockLevel || 0,
        location: item.location || "",
        notes: item.notes || "",
        // Pricing
        costPrice: item.pricing?.costPrice || 0,
        salePrice: item.pricing?.salePrice || 0,
        currency: item.pricing?.currency || "TRY",
        // Ownership
        ownershipType: item.ownership?.type || OWNERSHIP_TYPE.MKN,
        companyId: item.ownership?.companyId || "",
        companyName: item.ownership?.companyName || "",
        // Supplier
        supplierId: item.supplierId || "",
        supplierName: item.supplierName || "",
        // Warehouse
        warehouseId: item.warehouseId || "",
      });
    }
  }, [item]);

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

  const handleSave = async () => {
    try {
      await updateItem(params.id, {
        name: editData.name,
        description: editData.description,
        stock: {
          minStockLevel: Number(editData.minStockLevel) || 0,
        },
        location: editData.location,
        notes: editData.notes,
        // Pricing
        pricing: {
          costPrice: Number(editData.costPrice) || 0,
          salePrice: Number(editData.salePrice) || 0,
          currency: editData.currency || "TRY",
        },
        // Ownership
        ownership: {
          type: editData.ownershipType,
          companyId: editData.ownershipType === OWNERSHIP_TYPE.CUSTOMER ? editData.companyId : null,
          companyName: editData.ownershipType === OWNERSHIP_TYPE.CUSTOMER ? editData.companyName : null,
        },
        // Supplier
        supplierId: editData.supplierId || null,
        supplierName: editData.supplierName || null,
        // Warehouse
        warehouseId: editData.warehouseId || null,
      }, user);
      toast({
        title: "Başarılı",
        description: "Ürün bilgileri güncellendi.",
      });
      setIsEditing(false);
      refresh();
    } catch (error) {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCompanySelect = (companyId) => {
    if (companyId === "none") {
      setEditData({ ...editData, companyId: "", companyName: "" });
    } else {
      const company = companies.find((c) => c.id === companyId);
      setEditData({
        ...editData,
        companyId: company?.id || "",
        companyName: company?.name || "",
      });
    }
  };

  const handleSupplierSelect = (supplierId) => {
    if (supplierId === "none") {
      setEditData({ ...editData, supplierId: "", supplierName: "" });
    } else {
      const sup = suppliers.find((s) => s.id === supplierId);
      setEditData({
        ...editData,
        supplierId: sup?.id || "",
        supplierName: sup?.name || "",
      });
    }
  };

  const handleWarehouseSelect = (warehouseId) => {
    if (warehouseId === "none") {
      setEditData({ ...editData, warehouseId: "" });
    } else {
      setEditData({ ...editData, warehouseId });
    }
  };

  const handleOpenDeleteDialog = async (type = 'soft') => {
    const transactionCount = await inventoryItemService.getTransactionCount(params.id);
    setDeleteDialog({ open: true, type, transactionCount });
  };

  const handleDelete = async () => {
    try {
      if (deleteDialog.type === 'hard') {
        await hardDeleteItem(params.id, true);
        toast({
          title: "Başarılı",
          description: "Ürün ve ilgili tüm kayıtlar kalıcı olarak silindi.",
        });
      } else {
        await deleteItem(params.id);
        toast({
          title: "Başarılı",
          description: "Ürün pasif duruma alındı.",
        });
      }
      router.push("/admin/inventory/items");
    } catch (error) {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDeleteDialog({ open: false, type: 'soft', transactionCount: 0 });
    }
  };

  const warehouse = useMemo(() => {
    return warehouses.find((w) => w.id === item?.warehouseId);
  }, [warehouses, item?.warehouseId]);

  const supplier = useMemo(() => {
    return suppliers.find((s) => s.id === item?.supplierId);
  }, [suppliers, item?.supplierId]);

  const isLowStock = item?.stock?.quantity > 0 && item?.stock?.quantity <= item?.stock?.minStockLevel;
  const isOutOfStock = item?.stock?.quantity === 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="space-y-6 max-w-6xl mx-auto">
          <Skeleton className="h-8 w-48 bg-slate-200" />
          <Skeleton className="h-64 bg-slate-200" />
          <Skeleton className="h-96 bg-slate-200" />
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-6xl mx-auto text-center py-12">
          <Package className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            Ürün Bulunamadı
          </h2>
          <p className="text-slate-600 mb-4">
            İstediğiniz ürün mevcut değil veya silinmiş olabilir.
          </p>
          <Button asChild variant="outline" className="border-slate-300">
            <Link href="/admin/inventory/items">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Ürünlere Dön
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button asChild variant="ghost" size="sm">
                <Link href="/admin/inventory/items">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Geri
                </Link>
              </Button>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-slate-900">{item.name}</h1>
                  <Badge variant="outline" className="border-slate-300">
                    {item.sku}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={
                      item.status === ITEM_STATUS.ACTIVE
                        ? "border-green-300 text-green-700 bg-green-50"
                        : item.status === ITEM_STATUS.INACTIVE
                        ? "border-yellow-300 text-yellow-700 bg-yellow-50"
                        : "border-red-300 text-red-700 bg-red-50"
                    }
                  >
                    {ITEM_STATUS_LABELS[item.status]}
                  </Badge>
                </div>
                <p className="text-sm text-slate-600 mt-1">
                  {ITEM_CATEGORY_LABELS[item.category]} • {OWNERSHIP_TYPE_LABELS[item.ownership?.type]}
                  {item.ownership?.companyName && ` • ${item.ownership.companyName}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {isEditing ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                    className="border-slate-300"
                  >
                    <X className="h-4 w-4 mr-2" />
                    İptal
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={operationLoading}
                    className="bg-slate-900 hover:bg-slate-800"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Kaydet
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                    className="border-slate-300"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Düzenle
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="border-green-300 text-green-700"
                  >
                    <Link href={`/admin/inventory/inbound?itemId=${item.id}`}>
                      <ArrowDownToLine className="h-4 w-4 mr-2" />
                      Giriş
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="border-red-300 text-red-700"
                  >
                    <Link href={`/admin/inventory/outbound?itemId=${item.id}`}>
                      <ArrowUpFromLine className="h-4 w-4 mr-2" />
                      Çıkış
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleOpenDeleteDialog('soft')}
                    className="border-yellow-500 text-yellow-700 hover:bg-yellow-50"
                    title="Pasif Yap"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleOpenDeleteDialog('hard')}
                    className="border-red-500 text-red-700 hover:bg-red-50"
                    title="Kalıcı Sil"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="ml-1 text-xs">!</span>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Stock Alert */}
          {(isLowStock || isOutOfStock) && (
            <Card className={`border-2 ${isOutOfStock ? "border-red-300 bg-red-50" : "border-yellow-300 bg-yellow-50"}`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className={`h-5 w-5 ${isOutOfStock ? "text-red-600" : "text-yellow-600"}`} />
                  <div>
                    <p className={`font-medium ${isOutOfStock ? "text-red-800" : "text-yellow-800"}`}>
                      {isOutOfStock ? "Stok Tükendi!" : "Düşük Stok Uyarısı!"}
                    </p>
                    <p className={`text-sm ${isOutOfStock ? "text-red-600" : "text-yellow-600"}`}>
                      Mevcut: {formatNumber(item.stock?.quantity)} {UNIT_LABELS[item.stock?.unit]} • 
                      Minimum: {formatNumber(item.stock?.minStockLevel)} {UNIT_LABELS[item.stock?.unit]}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Details */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-white border-slate-200">
                <CardHeader>
                  <CardTitle>Ürün Bilgileri</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isEditing ? (
                    <>
                      <div className="space-y-2">
                        <Label>Ürün Adı</Label>
                        <Input
                          value={editData.name}
                          onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                          className="border-slate-300"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Açıklama</Label>
                        <Textarea
                          value={editData.description}
                          onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                          className="border-slate-300"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Minimum Stok Seviyesi</Label>
                          <Input
                            type="number"
                            value={editData.minStockLevel}
                            onChange={(e) => setEditData({ ...editData, minStockLevel: e.target.value })}
                            className="border-slate-300"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Raf/Konum</Label>
                          <Input
                            value={editData.location}
                            onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                            className="border-slate-300"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Notlar</Label>
                        <Textarea
                          value={editData.notes}
                          onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                          className="border-slate-300"
                        />
                      </div>

                      {/* Pricing Section */}
                      <div className="pt-4 border-t border-slate-200">
                        <h4 className="font-medium text-slate-900 mb-3">Fiyatlandırma</h4>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label>Maliyet Fiyatı</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={editData.costPrice}
                              onChange={(e) => setEditData({ ...editData, costPrice: e.target.value })}
                              className="border-slate-300"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Satış Fiyatı</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={editData.salePrice}
                              onChange={(e) => setEditData({ ...editData, salePrice: e.target.value })}
                              className="border-slate-300"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Para Birimi</Label>
                            <Select
                              value={editData.currency}
                              onValueChange={(value) => setEditData({ ...editData, currency: value })}
                            >
                              <SelectTrigger className="border-slate-300">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="TRY">TRY (₺)</SelectItem>
                                <SelectItem value="USD">USD ($)</SelectItem>
                                <SelectItem value="EUR">EUR (€)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      {/* Ownership Section */}
                      <div className="pt-4 border-t border-slate-200">
                        <h4 className="font-medium text-slate-900 mb-3">Sahiplik</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Sahiplik Tipi</Label>
                            <Select
                              value={editData.ownershipType}
                              onValueChange={(value) => setEditData({ 
                                ...editData, 
                                ownershipType: value,
                                companyId: value === OWNERSHIP_TYPE.MKN ? "" : editData.companyId,
                                companyName: value === OWNERSHIP_TYPE.MKN ? "" : editData.companyName,
                              })}
                            >
                              <SelectTrigger className="border-slate-300">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value={OWNERSHIP_TYPE.MKN}>
                                  {OWNERSHIP_TYPE_LABELS[OWNERSHIP_TYPE.MKN]}
                                </SelectItem>
                                <SelectItem value={OWNERSHIP_TYPE.CUSTOMER}>
                                  {OWNERSHIP_TYPE_LABELS[OWNERSHIP_TYPE.CUSTOMER]}
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          {editData.ownershipType === OWNERSHIP_TYPE.CUSTOMER && (
                            <div className="space-y-2">
                              <Label>Firma</Label>
                              <Select
                                value={editData.companyId || "none"}
                                onValueChange={handleCompanySelect}
                              >
                                <SelectTrigger className="border-slate-300">
                                  <SelectValue placeholder="Firma seçin" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">Seçilmedi</SelectItem>
                                  {companies.map((company) => (
                                    <SelectItem key={company.id} value={company.id}>
                                      {company.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Supplier Section */}
                      <div className="pt-4 border-t border-slate-200">
                        <h4 className="font-medium text-slate-900 mb-3">Tedarikçi</h4>
                        <div className="space-y-2">
                          <Label>Tedarikçi Seçimi</Label>
                          <Select
                            value={editData.supplierId || "none"}
                            onValueChange={handleSupplierSelect}
                          >
                            <SelectTrigger className="border-slate-300">
                              <SelectValue placeholder="Tedarikçi seçin" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">Seçilmedi</SelectItem>
                              {suppliers.map((sup) => (
                                <SelectItem key={sup.id} value={sup.id}>
                                  {sup.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Warehouse Section */}
                      <div className="pt-4 border-t border-slate-200">
                        <h4 className="font-medium text-slate-900 mb-3">Depo</h4>
                        <div className="space-y-2">
                          <Label>Depo Seçimi</Label>
                          <Select
                            value={editData.warehouseId || "none"}
                            onValueChange={handleWarehouseSelect}
                          >
                            <SelectTrigger className="border-slate-300">
                              <SelectValue placeholder="Depo seçin" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">Seçilmedi</SelectItem>
                              {warehouses.map((wh) => (
                                <SelectItem key={wh.id} value={wh.id}>
                                  {wh.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm text-slate-500">SKU</p>
                        <p className="font-medium">{item.sku}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Kategori</p>
                        <p className="font-medium">{ITEM_CATEGORY_LABELS[item.category]}</p>
                      </div>
                      {item.description && (
                        <div className="col-span-2">
                          <p className="text-sm text-slate-500">Açıklama</p>
                          <p className="font-medium">{item.description}</p>
                        </div>
                      )}
                      {item.location && (
                        <div>
                          <p className="text-sm text-slate-500">Raf/Konum</p>
                          <p className="font-medium">{item.location}</p>
                        </div>
                      )}
                      {item.notes && (
                        <div className="col-span-2">
                          <p className="text-sm text-slate-500">Notlar</p>
                          <p className="font-medium">{item.notes}</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Transactions */}
              <Card className="bg-white border-slate-200">
                <CardHeader>
                  <CardTitle>Stok Hareketleri</CardTitle>
                  <CardDescription>
                    Son 20 işlem
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-200 bg-slate-50">
                        <TableHead className="text-slate-700">Tarih</TableHead>
                        <TableHead className="text-slate-700">Tip</TableHead>
                        <TableHead className="text-slate-700">Firma</TableHead>
                        <TableHead className="text-slate-700 text-right">Miktar</TableHead>
                        <TableHead className="text-slate-700 text-right">Stok</TableHead>
                        <TableHead className="text-slate-700">Kullanıcı</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.slice(0, 20).map((t) => (
                        <TableRow key={t.id} className="border-slate-200">
                          <TableCell>
                            {t.createdAt?.seconds
                              ? format(
                                  new Date(t.createdAt.seconds * 1000),
                                  "dd MMM HH:mm",
                                  { locale: tr }
                                )
                              : "-"}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="border-slate-200">
                              {TRANSACTION_SUBTYPE_LABELS[t.subtype]}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-slate-600">
                              {t.companyName || "-"}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <span className={t.quantity > 0 ? "text-green-600" : "text-red-600"}>
                              {t.quantity > 0 ? "+" : ""}
                              {formatNumber(t.quantity)}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            {formatNumber(t.newStock)}
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-slate-500">
                              {t.createdBy?.name || "-"}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                      {transactions.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                            Henüz işlem yok.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Stats */}
            <div className="space-y-6">
              {/* Stock Card */}
              <Card className="bg-white border-slate-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-slate-500" />
                    Stok Durumu
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center py-4">
                    <p className="text-4xl font-bold text-slate-900">
                      {formatNumber(item.stock?.quantity || 0)}
                    </p>
                    <p className="text-sm text-slate-500">
                      {UNIT_LABELS[item.stock?.unit]}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                    <div className="text-center">
                      <p className="text-lg font-semibold text-green-600">
                        {formatNumber(item.stock?.quantity || 0)}
                      </p>
                      <p className="text-xs text-slate-500">Mevcut Stok</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-yellow-600">
                        {formatNumber(item.stock?.reservedQuantity || 0)}
                      </p>
                      <p className="text-xs text-slate-500">Rezerve</p>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-slate-200">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Min Stok</span>
                      <span className="font-medium">{formatNumber(item.stock?.minStockLevel || 0)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Pricing Card */}
              <Card className="bg-white border-slate-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-slate-500" />
                    Fiyatlandırma
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Maliyet</span>
                    <span className="font-medium">
                      {formatCurrency(item.pricing?.costPrice, item.pricing?.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Satış Fiyatı</span>
                    <span className="font-medium">
                      {formatCurrency(item.pricing?.salePrice, item.pricing?.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-slate-200">
                    <span className="text-slate-500">Toplam Değer</span>
                    <span className="font-semibold text-slate-900">
                      {formatCurrency(
                        (item.stock?.quantity || 0) * (item.pricing?.costPrice || 0),
                        item.pricing?.currency
                      )}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Warehouse Card */}
              <Card className="bg-white border-slate-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Warehouse className="h-5 w-5 text-slate-500" />
                    Depo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {warehouse ? (
                    <div>
                      <p className="font-medium">{warehouse.name}</p>
                      <p className="text-sm text-slate-500">{warehouse.location}</p>
                    </div>
                  ) : (
                    <p className="text-slate-500">Belirtilmemiş</p>
                  )}
                </CardContent>
              </Card>

              {/* Supplier Card */}
              {supplier && (
                <Card className="bg-white border-slate-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-slate-500" />
                      Tedarikçi
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="font-medium">{supplier.name}</p>
                    {supplier.phone && (
                      <p className="text-sm text-slate-500">{supplier.phone}</p>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Tracking Card */}
              {(item.tracking?.hasLotTracking || item.tracking?.hasSerialTracking) && (
                <Card className="bg-white border-slate-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Hash className="h-5 w-5 text-slate-500" />
                      İzleme
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {item.tracking?.lotNumber && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Lot No</span>
                        <span className="font-medium">{item.tracking.lotNumber}</span>
                      </div>
                    )}
                    {item.tracking?.serialNumber && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Seri No</span>
                        <span className="font-medium">{item.tracking.serialNumber}</span>
                      </div>
                    )}
                    {item.tracking?.expiryDate && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">SKT</span>
                        <span className="font-medium">{item.tracking.expiryDate}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Meta Card */}
              <Card className="bg-white border-slate-200">
                <CardHeader>
                  <CardTitle className="text-sm text-slate-500">Bilgiler</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Oluşturulma:{" "}
                      {item.createdAt?.seconds
                        ? format(
                            new Date(item.createdAt.seconds * 1000),
                            "dd MMM yyyy HH:mm",
                            { locale: tr }
                          )
                        : "-"}
                    </span>
                  </div>
                  {item.createdBy && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <User className="h-4 w-4" />
                      <span>Oluşturan: {item.createdBy.name}</span>
                    </div>
                  )}
                  {item.lastModifiedBy && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <User className="h-4 w-4" />
                      <span>Düzenleyen: {item.lastModifiedBy.name}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Dialog */}
      <AlertDialog 
        open={deleteDialog.open} 
        onOpenChange={(open) => !open && setDeleteDialog({ open: false, type: 'soft', transactionCount: 0 })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className={deleteDialog.type === 'hard' ? 'text-red-600' : 'text-yellow-600'}>
              {deleteDialog.type === 'hard' ? '⚠️ Kalıcı Silme' : 'Ürünü Pasif Yap'}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>
                  <strong>{item.name}</strong> ürününü {deleteDialog.type === 'hard' ? 'kalıcı olarak silmek' : 'pasif yapmak'} istediğinize emin misiniz?
                </p>
                {deleteDialog.type === 'hard' ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-2">
                    <p className="text-red-800 font-medium">
                      Bu işlem geri alınamaz!
                    </p>
                    {deleteDialog.transactionCount > 0 && (
                      <p className="text-red-700">
                        Bu ürüne ait <strong>{deleteDialog.transactionCount}</strong> adet stok hareketi kaydı da silinecektir.
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-slate-600">
                    Bu işlem ürünü "Üretimden Kalktı" durumuna çevirecektir. Stok hareketleri korunacaktır.
                  </p>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Vazgeç</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className={deleteDialog.type === 'hard' ? 'bg-red-600 hover:bg-red-700' : 'bg-yellow-600 hover:bg-yellow-700'}
              disabled={operationLoading}
            >
              {operationLoading ? "İşleniyor..." : deleteDialog.type === 'hard' ? 'Kalıcı Sil' : 'Pasif Yap'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
