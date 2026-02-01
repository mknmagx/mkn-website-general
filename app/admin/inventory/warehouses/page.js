"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useToast } from "../../../../hooks/use-toast";
import { useAdminAuth } from "../../../../hooks/use-admin-auth";
import { useWarehouses, useInventoryItems } from "../../../../hooks/use-inventory";
import { warehouseService } from "../../../../lib/services/inventory-service";

// UI Components
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { Textarea } from "../../../../components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../../../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../../../components/ui/dialog";
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
import { Switch } from "../../../../components/ui/switch";
import { Badge } from "../../../../components/ui/badge";
import { Skeleton } from "../../../../components/ui/skeleton";

// Icons
import {
  Warehouse,
  Plus,
  RefreshCw,
  Edit,
  Trash2,
  MapPin,
  Star,
  Package,
  User,
  Calendar,
  X,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

export default function WarehousesPage() {
  const { user } = useAdminAuth();
  const { toast } = useToast();

  const { warehouses, loading, refresh } = useWarehouses();
  const { items: allItems, loading: itemsLoading } = useInventoryItems();

  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formDialog, setFormDialog] = useState({ open: false, warehouse: null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, warehouse: null });

  // Calculate warehouse stats
  const warehouseStats = useMemo(() => {
    const stats = {};
    warehouses.forEach((w) => {
      const warehouseItems = allItems.filter((item) => item.warehouseId === w.id);
      const itemCount = warehouseItems.length;
      const totalStock = warehouseItems.reduce((sum, item) => sum + (item.stock?.quantity || 0), 0);
      
      // Calculate values by currency
      const valuesByCurrency = {};
      warehouseItems.forEach((item) => {
        const qty = item.stock?.quantity || 0;
        const price = item.pricing?.costPrice || 0;
        const currency = item.pricing?.currency || "TRY";
        const value = qty * price;
        
        if (value > 0) {
          if (!valuesByCurrency[currency]) {
            valuesByCurrency[currency] = 0;
          }
          valuesByCurrency[currency] += value;
        }
      });
      
      stats[w.id] = {
        itemCount,
        totalStock,
        valuesByCurrency,
      };
    });
    return stats;
  }, [warehouses, allItems]);

  const formatCurrencyValue = (value, currency = "TRY") => {
    const symbols = { TRY: "₺", USD: "$", EUR: "€", GBP: "£" };
    const symbol = symbols[currency] || currency + " ";
    return symbol + new Intl.NumberFormat("tr-TR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Format multiple currencies
  const formatMultiCurrency = (valuesByCurrency) => {
    const currencies = Object.keys(valuesByCurrency);
    if (currencies.length === 0) return "₺0";
    
    return currencies
      .filter(currency => valuesByCurrency[currency] > 0)
      .map(currency => formatCurrencyValue(valuesByCurrency[currency], currency))
      .join(" + ");
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat("tr-TR").format(value);
  };

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    location: "",
    address: "",
    description: "",
    isDefault: false,
    isActive: true,
  });

  useEffect(() => {
    if (formDialog.warehouse) {
      setFormData({
        name: formDialog.warehouse.name || "",
        code: formDialog.warehouse.code || "",
        location: formDialog.warehouse.location || "",
        address: formDialog.warehouse.address || "",
        description: formDialog.warehouse.description || "",
        isDefault: formDialog.warehouse.isDefault || false,
        isActive: formDialog.warehouse.isActive !== false,
      });
    } else {
      setFormData({
        name: "",
        code: "",
        location: "",
        address: "",
        description: "",
        isDefault: false,
        isActive: true,
      });
    }
  }, [formDialog]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.code.trim()) {
      toast({
        title: "Hata",
        description: "Depo adı ve kodu zorunludur.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      if (formDialog.warehouse) {
        await warehouseService.update(formDialog.warehouse.id, formData, user);
        toast({
          title: "Başarılı",
          description: "Depo güncellendi.",
        });
      } else {
        await warehouseService.create(formData, user);
        toast({
          title: "Başarılı",
          description: "Depo oluşturuldu.",
        });
      }
      setFormDialog({ open: false, warehouse: null });
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

  const handleDelete = async () => {
    if (!deleteDialog.warehouse) return;

    setSaving(true);
    try {
      await warehouseService.delete(deleteDialog.warehouse.id);
      toast({
        title: "Başarılı",
        description: "Depo silindi.",
      });
      setDeleteDialog({ open: false, warehouse: null });
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

  const handleSetDefault = async (warehouse) => {
    try {
      await warehouseService.setDefault(warehouse.id);
      toast({
        title: "Başarılı",
        description: `${warehouse.name} varsayılan depo olarak ayarlandı.`,
      });
      refresh();
    } catch (error) {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading && !refreshing) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="space-y-6">
          <Skeleton className="h-10 w-64 bg-slate-200" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-56 bg-slate-200" />
            ))}
          </div>
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
            <h1 className="text-2xl font-bold text-slate-900">Depolar</h1>
            <p className="text-sm text-slate-600 mt-1">
              Toplam {warehouses.length} depo
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            </Button>
            <Button
              onClick={() => setFormDialog({ open: true, warehouse: null })}
              className="bg-slate-900 hover:bg-slate-800"
            >
              <Plus className="h-4 w-4 mr-2" />
              Yeni Depo
            </Button>
          </div>
        </div>
      </div>

      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {warehouses.map((warehouse) => (
            <Card
              key={warehouse.id}
              className="bg-white border-slate-200 hover:shadow-md transition-shadow"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center">
                      <Warehouse className="h-5 w-5 text-slate-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                        {warehouse.name}
                        {warehouse.isDefault && (
                          <Badge variant="outline" className="border-yellow-300 text-yellow-700 bg-yellow-50">
                            <Star className="h-3 w-3 mr-1" />
                            Varsayılan
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="text-slate-500">
                        <code className="bg-slate-100 px-2 py-0.5 rounded text-xs">
                          {warehouse.code}
                        </code>
                      </CardDescription>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      warehouse.isActive
                        ? "border-green-300 text-green-700 bg-green-50"
                        : "border-red-300 text-red-700 bg-red-50"
                    }
                  >
                    {warehouse.isActive ? "Aktif" : "Pasif"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-blue-50 rounded-lg p-3 text-center">
                    <p className="text-lg font-bold text-blue-700">
                      {warehouseStats[warehouse.id]?.itemCount || 0}
                    </p>
                    <p className="text-xs text-blue-600">Ürün Çeşidi</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 text-center">
                    <p className="text-lg font-bold text-green-700">
                      {formatNumber(warehouseStats[warehouse.id]?.totalStock || 0)}
                    </p>
                    <p className="text-xs text-green-600">Toplam Stok</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3 text-center">
                    <p className="text-sm font-bold text-purple-700 leading-tight">
                      {warehouseStats[warehouse.id]?.valuesByCurrency && 
                       Object.keys(warehouseStats[warehouse.id].valuesByCurrency).length > 0
                        ? formatMultiCurrency(warehouseStats[warehouse.id].valuesByCurrency)
                        : "₺0"}
                    </p>
                    <p className="text-xs text-purple-600">Değer</p>
                  </div>
                </div>

                {warehouse.location && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    {warehouse.location}
                  </div>
                )}
                {warehouse.address && (
                  <p className="text-sm text-slate-500">{warehouse.address}</p>
                )}
                {warehouse.description && (
                  <p className="text-sm text-slate-500 border-t pt-3 border-slate-100">
                    {warehouse.description}
                  </p>
                )}

                {warehouse.createdAt?.seconds && (
                  <div className="flex items-center gap-1 text-xs text-slate-400 pt-2 border-t border-slate-100">
                    <Calendar className="h-3 w-3" />
                    Oluşturulma: {format(
                      new Date(warehouse.createdAt.seconds * 1000),
                      "dd MMM yyyy",
                      { locale: tr }
                    )}
                  </div>
                )}

                <div className="flex items-center gap-2 pt-2">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="flex-1 border-slate-300"
                  >
                    <Link href={`/admin/inventory/items?warehouse=${warehouse.id}`}>
                      <Package className="h-3 w-3 mr-1" />
                      Ürünleri Gör
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-slate-300"
                    onClick={() => setFormDialog({ open: true, warehouse })}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  {!warehouse.isDefault && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                        onClick={() => handleSetDefault(warehouse)}
                      >
                        <Star className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-red-300 text-red-700 hover:bg-red-50"
                        onClick={() => setDeleteDialog({ open: true, warehouse })}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {warehouses.length === 0 && (
            <div className="col-span-full">
              <Card className="bg-white border-slate-200">
                <CardContent className="p-12 text-center">
                  <Warehouse className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    Henüz depo yok
                  </h3>
                  <p className="text-sm text-slate-600 mb-4">
                    İlk deponuzu oluşturarak stok yönetimini başlatın.
                  </p>
                  <Button
                    onClick={() => setFormDialog({ open: true, warehouse: null })}
                    className="bg-slate-900 hover:bg-slate-800"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Yeni Depo
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Form Dialog */}
      <Dialog
        open={formDialog.open}
        onOpenChange={(open) => !open && setFormDialog({ open: false, warehouse: null })}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {formDialog.warehouse ? "Depo Düzenle" : "Yeni Depo Oluştur"}
            </DialogTitle>
            <DialogDescription>
              {formDialog.warehouse
                ? "Depo bilgilerini güncelleyin."
                : "Yeni depo için gerekli bilgileri girin."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Depo Adı *</Label>
                <Input
                  placeholder="Ana Depo"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="border-slate-300"
                />
              </div>
              <div className="space-y-2">
                <Label>Depo Kodu *</Label>
                <Input
                  placeholder="DEPO-001"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value.toUpperCase() })
                  }
                  className="border-slate-300"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Lokasyon</Label>
              <Input
                placeholder="İstanbul, Türkiye"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="border-slate-300"
              />
            </div>

            <div className="space-y-2">
              <Label>Adres</Label>
              <Textarea
                placeholder="Tam adres..."
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="border-slate-300 min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <Label>Açıklama</Label>
              <Textarea
                placeholder="Depo hakkında ek bilgiler..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="border-slate-300 min-h-[60px]"
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="space-y-1">
                <Label>Varsayılan Depo</Label>
                <p className="text-xs text-slate-500">
                  Yeni ürünler bu depoya atanır
                </p>
              </div>
              <Switch
                checked={formData.isDefault}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isDefault: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="space-y-1">
                <Label>Aktif</Label>
                <p className="text-xs text-slate-500">
                  Deaktif depolar işlemlerde görünmez
                </p>
              </div>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isActive: checked })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setFormDialog({ open: false, warehouse: null })}
              className="border-slate-300"
            >
              İptal
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={saving}
              className="bg-slate-900 hover:bg-slate-800"
            >
              {saving ? "Kaydediliyor..." : formDialog.warehouse ? "Güncelle" : "Oluştur"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) => !open && setDeleteDialog({ open: false, warehouse: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Depoyu Sil</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{deleteDialog.warehouse?.name}</strong> deposunu silmek
              istediğinize emin misiniz? Bu depoyla ilişkili ürünler varsa silme işlemi
              başarısız olacaktır.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Vazgeç</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={saving}
            >
              {saving ? "Siliniyor..." : "Sil"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
