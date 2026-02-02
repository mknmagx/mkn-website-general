"use client";

import { useState } from "react";
import Link from "next/link";
import { useToast } from "../../../../hooks/use-toast";
import { useAdminAuth } from "../../../../hooks/use-admin-auth";
import {
  useWarehouses,
  useInventoryItems,
} from "../../../../hooks/use-inventory";
import { migrationService } from "../../../../lib/services/inventory-service";

// UI Components
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../../../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";
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
import { Progress } from "../../../../components/ui/progress";
import { Badge } from "../../../../components/ui/badge";
import { Skeleton } from "../../../../components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "../../../../components/ui/alert";
import { Checkbox } from "../../../../components/ui/checkbox";

// Icons
import {
  Database,
  ArrowRight,
  Package,
  Warehouse,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  RefreshCw,
  ArrowLeft,
  Play,
  XCircle,
  Trash2,
} from "lucide-react";

export default function MigratePage() {
  const { user } = useAdminAuth();
  const { toast } = useToast();

  const { warehouses, loading: warehousesLoading } = useWarehouses();
  const { items: existingItems, loading: itemsLoading, refresh: refreshItems } = useInventoryItems();

  const [warehouseId, setWarehouseId] = useState("");
  const [defaultQuantity, setDefaultQuantity] = useState(10000);
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [clearFirst, setClearFirst] = useState(false);
  const [clearing, setClearing] = useState(false);

  const [migrating, setMigrating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  
  // Reset system states
  const [resetDialog, setResetDialog] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetResult, setResetResult] = useState(null);
  
  // Fix currency states
  const [fixingCurrency, setFixingCurrency] = useState(false);
  const [currencyFixResult, setCurrencyFixResult] = useState(null);

  const defaultWarehouse = warehouses.find((w) => w.isDefault);
  const selectedWarehouse =
    warehouses.find((w) => w.id === warehouseId) || defaultWarehouse;

  const handleMigrate = async () => {
    if (!selectedWarehouse) {
      toast({
        title: "Hata",
        description: "Lütfen bir depo seçin.",
        variant: "destructive",
      });
      return;
    }

    setConfirmDialog(false);
    setMigrating(true);
    setProgress(0);
    setResult(null);

    try {
      // If clearFirst is checked, clear all items first
      if (clearFirst) {
        setClearing(true);
        await migrationService.clearAllItems();
        setClearing(false);
      }

      // Simulate progress - real progress would need streaming
      const progressInterval = setInterval(() => {
        setProgress((p) => Math.min(p + 10, 90));
      }, 500);

      const migrationResult = await migrationService.migratePackagingProducts({
        warehouseId: selectedWarehouse.id,
        defaultQuantity: Number(defaultQuantity),
        createdBy: user,
      });

      clearInterval(progressInterval);
      setProgress(100);

      setResult({
        success: true,
        ...migrationResult,
      });

      // Refresh items list
      refreshItems();

      toast({
        title: "Başarılı",
        description: `${migrationResult.success} ürün başarıyla taşındı.`,
      });
    } catch (error) {
      setResult({
        success: false,
        error: error.message,
      });

      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setMigrating(false);
      setClearing(false);
    }
  };

  // Reset all inventory data handler
  const handleResetAllData = async () => {
    setResetDialog(false);
    setResetting(true);
    setResetResult(null);

    try {
      const result = await migrationService.resetAllInventoryData();
      
      setResetResult(result);
      
      // Refresh items list
      refreshItems();

      toast({
        title: "Başarılı",
        description: `Sistem sıfırlandı. ${result.deletedItems} ürün, ${result.deletedTransactions} hareket, ${result.deletedWarehouses} depo silindi.`,
      });
    } catch (error) {
      setResetResult({
        success: false,
        error: error.message,
      });

      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setResetting(false);
    }
  };

  // Fix outbound currency handler
  const handleFixOutboundCurrency = async () => {
    setFixingCurrency(true);
    setCurrencyFixResult(null);

    try {
      const result = await migrationService.fixOutboundCurrency("TRY");
      
      setCurrencyFixResult(result);

      toast({
        title: "Başarılı",
        description: result.message,
      });
    } catch (error) {
      setCurrencyFixResult({
        success: false,
        error: error.message,
      });

      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setFixingCurrency(false);
    }
  };

  if (warehousesLoading || itemsLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="space-y-6 max-w-3xl mx-auto">
          <Skeleton className="h-10 w-64 bg-slate-200" />
          <Skeleton className="h-48 bg-slate-200" />
          <Skeleton className="h-32 bg-slate-200" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-6">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/inventory">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Geri
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Veri Taşıma</h1>
              <p className="text-sm text-slate-600 mt-1">
                Ambalaj ürünlerini envanter sistemine aktar
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Info Card */}
          <Card className="bg-white border-slate-200">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Database className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Ambalaj Ürünleri Migrasyonu</CardTitle>
                  <CardDescription>
                    Mevcut packaging_products koleksiyonundan envantere tek seferlik taşıma
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-slate-500" />
                  <span className="font-medium">packaging_products</span>
                </div>
                <ArrowRight className="h-5 w-5 text-slate-400" />
                <div className="flex items-center gap-2">
                  <Warehouse className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-700">inventory_items</span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-600">Mevcut Envanter Ürünleri</p>
                  <p className="text-2xl font-bold text-slate-900">{existingItems.length}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-600">Aktif Depolar</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {warehouses.filter((w) => w.isActive).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Warning */}
          {existingItems.length > 0 && (
            <Alert className="border-yellow-300 bg-yellow-50">
              <AlertTriangle className="h-4 w-4 text-yellow-700" />
              <AlertTitle className="text-yellow-800">Dikkat!</AlertTitle>
              <AlertDescription className="text-yellow-700">
                Envanter sisteminde zaten {existingItems.length} ürün bulunuyor.
                Migrasyon sırasında aynı SKU'ya sahip ürünler atlanacaktır.
              </AlertDescription>
            </Alert>
          )}

          {/* Configuration */}
          {!result && (
            <Card className="bg-white border-slate-200">
              <CardHeader>
                <CardTitle className="text-lg">Migrasyon Ayarları</CardTitle>
                <CardDescription>
                  Taşıma işlemi için gerekli parametreleri belirleyin
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Hedef Depo *</Label>
                  <Select
                    value={warehouseId || defaultWarehouse?.id || ""}
                    onValueChange={setWarehouseId}
                    disabled={migrating}
                  >
                    <SelectTrigger className="border-slate-300">
                      <SelectValue placeholder="Depo seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {warehouses
                        .filter((w) => w.isActive)
                        .map((warehouse) => (
                          <SelectItem key={warehouse.id} value={warehouse.id}>
                            {warehouse.name}
                            {warehouse.isDefault && " (Varsayılan)"}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-slate-500">
                    Tüm ürünler bu depoya aktarılacak
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Varsayılan Stok Miktarı</Label>
                  <Input
                    type="number"
                    value={defaultQuantity}
                    onChange={(e) => setDefaultQuantity(e.target.value)}
                    className="border-slate-300 max-w-[200px]"
                    disabled={migrating}
                  />
                  <p className="text-xs text-slate-500">
                    Her ürün için atanacak başlangıç stok miktarı
                  </p>
                </div>

                {/* Clear Existing Option */}
                {existingItems.length > 0 && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg space-y-3">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="clearFirst"
                        checked={clearFirst}
                        onCheckedChange={setClearFirst}
                        disabled={migrating}
                      />
                      <div className="space-y-1">
                        <label htmlFor="clearFirst" className="text-sm font-medium text-yellow-800 cursor-pointer">
                          Önce mevcut envanter ürünlerini temizle
                        </label>
                        <p className="text-xs text-yellow-700">
                          Bu seçenek işaretlenirse mevcut <strong>{existingItems.length}</strong> envanter ürünü
                          ve ilgili tüm stok hareketleri silinecektir.
                        </p>
                      </div>
                    </div>
                    {clearFirst && (
                      <div className="flex items-center gap-2 text-red-600 text-sm">
                        <AlertTriangle className="h-4 w-4" />
                        <span>Bu işlem geri alınamaz!</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Progress */}
                {migrating && (
                  <div className="space-y-2 pt-4 border-t">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">
                        {clearing ? "Mevcut veriler temizleniyor..." : "Migrasyon devam ediyor..."}
                      </span>
                      <span className="font-medium">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <p className="text-xs text-slate-500">
                      Lütfen bu sayfadan ayrılmayın
                    </p>
                  </div>
                )}

                {/* Action */}
                <div className="pt-4 border-t flex justify-end gap-3">
                  <Button
                    asChild
                    variant="outline"
                    className="border-slate-300"
                    disabled={migrating}
                  >
                    <Link href="/admin/inventory">İptal</Link>
                  </Button>
                  <Button
                    onClick={() => setConfirmDialog(true)}
                    disabled={migrating || !selectedWarehouse}
                    className={clearFirst ? "bg-red-600 hover:bg-red-700" : "bg-slate-900 hover:bg-slate-800"}
                  >
                    {migrating ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        İşleniyor...
                      </>
                    ) : clearFirst ? (
                      <>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Temizle ve Migrate Et
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Migrasyonu Başlat
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Result */}
          {result && (
            <Card
              className={`bg-white border-2 ${
                result.success ? "border-green-300" : "border-red-300"
              }`}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  {result.success ? (
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                  ) : (
                    <XCircle className="h-8 w-8 text-red-600" />
                  )}
                  <div>
                    <CardTitle
                      className={result.success ? "text-green-700" : "text-red-700"}
                    >
                      {result.success ? "Migrasyon Tamamlandı" : "Migrasyon Başarısız"}
                    </CardTitle>
                    <CardDescription>
                      {result.success
                        ? `${result.success} ürün başarıyla aktarıldı`
                        : result.error}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              {result.success !== undefined && (
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-green-50 rounded-lg text-center">
                      <p className="text-2xl font-bold text-green-700">{result.success}</p>
                      <p className="text-sm text-green-600">Başarılı</p>
                    </div>
                    <div className="p-4 bg-yellow-50 rounded-lg text-center">
                      <p className="text-2xl font-bold text-yellow-700">{result.skipped}</p>
                      <p className="text-sm text-yellow-600">Atlanan</p>
                    </div>
                    <div className="p-4 bg-red-50 rounded-lg text-center">
                      <p className="text-2xl font-bold text-red-700">{result.failed}</p>
                      <p className="text-sm text-red-600">Başarısız</p>
                    </div>
                  </div>

                  {/* Skipped Items Details */}
                  {result.skippedItems && result.skippedItems.length > 0 && (
                    <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                      <p className="font-medium text-yellow-700 mb-2">
                        Atlanan Ürünler ({result.skippedItems.length}):
                      </p>
                      <div className="max-h-48 overflow-y-auto">
                        <ul className="text-sm text-yellow-600 space-y-1">
                          {result.skippedItems.map((item, i) => (
                            <li key={i} className="flex justify-between items-start gap-2 py-1 border-b border-yellow-200 last:border-0">
                              <span className="font-medium">{item.productName}</span>
                              <span className="text-xs text-yellow-500">{item.reason}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {result.errors && result.errors.length > 0 && (
                    <div className="mt-4 p-4 bg-red-50 rounded-lg">
                      <p className="font-medium text-red-700 mb-2">Hatalar ({result.errors.length}):</p>
                      <div className="max-h-48 overflow-y-auto">
                        <ul className="text-sm text-red-600 space-y-1">
                          {result.errors.map((err, i) => (
                            <li key={i} className="py-1 border-b border-red-200 last:border-0">
                              <span className="font-medium">{err.productName || err}</span>
                              {err.error && <span className="text-xs text-red-500 ml-2">- {err.error}</span>}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  <div className="mt-6 flex justify-center gap-3">
                    <Button asChild className="bg-slate-900 hover:bg-slate-800">
                      <Link href="/admin/inventory/items">
                        <Package className="h-4 w-4 mr-2" />
                        Ürünleri Görüntüle
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="border-slate-300">
                      <Link href="/admin/inventory">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Dashboard'a Dön
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>
          )}

          {/* Currency Fix Card */}
          <Card className="bg-white border-yellow-200 border-2">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                  <RefreshCw className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <CardTitle className="text-lg text-yellow-700">Currency Düzeltme</CardTitle>
                  <CardDescription>
                    Outbound transaction'lardaki yanlış currency değerlerini TRY olarak düzelt
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Alert className="border-yellow-300 bg-yellow-50 mb-4">
                <AlertCircle className="h-4 w-4 text-yellow-700" />
                <AlertTitle className="text-yellow-800">Bilgi</AlertTitle>
                <AlertDescription className="text-yellow-700">
                  Bu işlem tüm outbound (çıkış) transaction'larının currency değerini TRY olarak güncelleyecektir.
                </AlertDescription>
              </Alert>
              
              {currencyFixResult && (
                <div className={`p-4 rounded-lg mb-4 ${currencyFixResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  {currencyFixResult.success ? (
                    <div className="text-green-700">
                      <p className="font-medium flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        Currency değerleri güncellendi!
                      </p>
                      <ul className="text-sm mt-2 space-y-1">
                        <li>• {currencyFixResult.updatedCount} transaction güncellendi</li>
                        <li>• Toplam {currencyFixResult.totalOutbound} outbound transaction mevcut</li>
                      </ul>
                    </div>
                  ) : (
                    <p className="text-red-700 flex items-center gap-2">
                      <XCircle className="h-4 w-4" />
                      Hata: {currencyFixResult.error}
                    </p>
                  )}
                </div>
              )}

              <div className="flex justify-end">
                <Button
                  onClick={handleFixOutboundCurrency}
                  disabled={fixingCurrency}
                  variant="outline"
                  className="border-yellow-500 text-yellow-700 hover:bg-yellow-50"
                >
                  {fixingCurrency ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Düzeltiliyor...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Outbound Currency'leri Düzelt (TRY)
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* System Reset Card - Test Amaçlı */}
          <Card className="bg-white border-red-200 border-2">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <CardTitle className="text-lg text-red-700">Sistemi Sıfırla (Test)</CardTitle>
                  <CardDescription>
                    Test sonrası tüm envanter verilerini temizlemek için kullanın
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Alert className="border-red-300 bg-red-50 mb-4">
                <AlertCircle className="h-4 w-4 text-red-700" />
                <AlertTitle className="text-red-800">Dikkat!</AlertTitle>
                <AlertDescription className="text-red-700">
                  Bu buton tüm ürünleri, stok hareketlerini ve depoları kalıcı olarak siler.
                  Sadece test amaçlı kullanın!
                </AlertDescription>
              </Alert>
              
              {resetResult && (
                <div className={`p-4 rounded-lg mb-4 ${resetResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  {resetResult.success ? (
                    <div className="text-green-700">
                      <p className="font-medium flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        Sistem başarıyla sıfırlandı!
                      </p>
                      <ul className="text-sm mt-2 space-y-1">
                        <li>• {resetResult.deletedItems} ürün silindi</li>
                        <li>• {resetResult.deletedTransactions} stok hareketi silindi</li>
                        <li>• {resetResult.deletedWarehouses} depo silindi</li>
                      </ul>
                    </div>
                  ) : (
                    <p className="text-red-700 flex items-center gap-2">
                      <XCircle className="h-4 w-4" />
                      Hata: {resetResult.error}
                    </p>
                  )}
                </div>
              )}

              <div className="flex justify-end">
                <Button
                  onClick={() => setResetDialog(true)}
                  disabled={resetting}
                  variant="destructive"
                  className="bg-red-600 hover:bg-red-700"
                >
                  {resetting ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Sıfırlanıyor...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Tüm Veriyi Sıfırla
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confirm Dialog */}
      <AlertDialog open={confirmDialog} onOpenChange={setConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className={clearFirst ? "text-red-600" : ""}>
              {clearFirst ? "⚠️ Temizle ve Migrate Et" : "Migrasyonu Başlat"}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-sm text-muted-foreground">
                {clearFirst && (
                  <div className="bg-red-50 border border-red-200 p-3 rounded-lg mb-4">
                    <p className="text-red-700 font-medium">
                      Dikkat! Mevcut {existingItems.length} envanter ürünü ve tüm stok hareketleri silinecek!
                    </p>
                  </div>
                )}
                <p>
                  packaging_products koleksiyonundaki tüm ürünler envanter sistemine
                  aktarılacak.
                </p>
                <ul className="text-sm space-y-1 mt-4">
                  <li>
                    • Hedef Depo: <strong>{selectedWarehouse?.name}</strong>
                  </li>
                  <li>
                    • Varsayılan Miktar: <strong>{defaultQuantity}</strong>
                  </li>
                  <li>
                    • Sahiplik: <strong>MKN (Biz)</strong>
                  </li>
                  <li>
                    • Kategori: <strong>Ambalaj</strong>
                  </li>
                </ul>
                <p className="text-yellow-600 mt-4">
                  Bu işlem geri alınamaz. Devam etmek istiyor musunuz?
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Vazgeç</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleMigrate}
              className={clearFirst ? "bg-red-600 hover:bg-red-700" : "bg-slate-900 hover:bg-slate-800"}
            >
              {clearFirst ? "Temizle ve Başlat" : "Başlat"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset System Dialog */}
      <AlertDialog open={resetDialog} onOpenChange={setResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">
              ⚠️ Sistemi Tamamen Sıfırla
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                  <p className="text-red-700 font-medium">
                    DİKKAT! Bu işlem aşağıdaki tüm verileri silecektir:
                  </p>
                </div>
                <ul className="space-y-2 mt-4">
                  <li className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-red-500" />
                    <span><strong>Ürünler</strong> (inventory_items) - {existingItems.length} kayıt</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 text-red-500" />
                    <span><strong>Stok Hareketleri</strong> (inventory_transactions)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Warehouse className="h-4 w-4 text-red-500" />
                    <span><strong>Depolar</strong> (inventory_warehouses) - {warehouses.length} kayıt</span>
                  </li>
                </ul>
                <p className="text-red-600 font-medium mt-4">
                  Bu işlem GERİ ALINAMAZ! Sadece test amaçlı kullanın.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Vazgeç</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleResetAllData}
              className="bg-red-600 hover:bg-red-700"
            >
              Evet, Sıfırla
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
