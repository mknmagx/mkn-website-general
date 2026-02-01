"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAdminAuth } from "../../../../../hooks/use-admin-auth";
import { useToast } from "../../../../../hooks/use-toast";
import {
  useWarehouses,
  useSuppliers,
  useInventoryOperations,
} from "../../../../../hooks/use-inventory";
import {
  ITEM_CATEGORY,
  ITEM_CATEGORY_LABELS,
  OWNERSHIP_TYPE,
  OWNERSHIP_TYPE_LABELS,
  UNIT,
  UNIT_LABELS,
  generateSKU,
} from "../../../../../lib/services/inventory-service";
import { getDocuments } from "../../../../../lib/firestore";

// UI Components
import { Button } from "../../../../../components/ui/button";
import { Input } from "../../../../../components/ui/input";
import { Label } from "../../../../../components/ui/label";
import { Textarea } from "../../../../../components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../../../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../../components/ui/select";
import { Switch } from "../../../../../components/ui/switch";
import { Skeleton } from "../../../../../components/ui/skeleton";

// Icons
import {
  ArrowLeft,
  Save,
  Package,
  Building2,
  Warehouse,
  Tag,
  DollarSign,
  Hash,
  FileText,
  Truck,
  BarChart3,
  Loader2,
} from "lucide-react";

export default function NewInventoryItemPage() {
  const router = useRouter();
  const { user } = useAdminAuth();
  const { toast } = useToast();

  const { warehouses, loading: warehousesLoading } = useWarehouses();
  const { suppliers, loading: suppliersLoading } = useSuppliers();
  const { createItem, loading: saving } = useInventoryOperations();

  const [companies, setCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    description: "",
    category: ITEM_CATEGORY.PACKAGING,
    subcategory: "",
    ownershipType: OWNERSHIP_TYPE.MKN,
    companyId: "",
    companyName: "",
    warehouseId: "",
    location: "",
    initialQuantity: 0,
    unit: UNIT.PIECE,
    minStockLevel: 0,
    maxStockLevel: "",
    costPrice: 0,
    salePrice: 0,
    currency: "TRY",
    hasLotTracking: false,
    hasSerialTracking: false,
    lotNumber: "",
    serialNumber: "",
    productionDate: "",
    expiryDate: "",
    supplierId: "",
    supplierName: "",
    notes: "",
  });

  // Load companies
  useEffect(() => {
    const loadCompanies = async () => {
      try {
        const data = await getDocuments("companies");
        setCompanies(data || []);
      } catch (error) {
        // Silent fail - companies list is optional
      } finally {
        setLoadingCompanies(false);
      }
    };
    loadCompanies();
  }, []);

  // Set default warehouse
  useEffect(() => {
    if (warehouses.length > 0 && !formData.warehouseId) {
      const defaultWarehouse = warehouses.find((w) => w.isDefault) || warehouses[0];
      setFormData((prev) => ({ ...prev, warehouseId: defaultWarehouse.id }));
    }
  }, [warehouses, formData.warehouseId]);

  // Auto generate SKU
  useEffect(() => {
    if (formData.name && !formData.sku) {
      setFormData((prev) => ({
        ...prev,
        sku: generateSKU(prev.category, prev.name),
      }));
    }
  }, [formData.name, formData.category]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCompanyChange = (companyId) => {
    const company = companies.find((c) => c.id === companyId);
    setFormData((prev) => ({
      ...prev,
      companyId,
      companyName: company?.name || "",
    }));
  };

  const handleSupplierChange = (supplierId) => {
    const supplier = suppliers.find((s) => s.id === supplierId);
    setFormData((prev) => ({
      ...prev,
      supplierId,
      supplierName: supplier?.name || "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name) {
      toast({
        title: "Hata",
        description: "Ürün adı gereklidir.",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await createItem(formData, user);
      toast({
        title: "Başarılı",
        description: "Ürün başarıyla oluşturuldu.",
      });
      router.push(`/admin/inventory/items/${result.id}`);
    } catch (error) {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const loading = warehousesLoading || suppliersLoading || loadingCompanies;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="space-y-6 max-w-4xl mx-auto">
          <Skeleton className="h-10 w-64 bg-slate-200" />
          <Skeleton className="h-96 w-full bg-slate-200" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/inventory/items">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Yeni Stok Kalemi</h1>
              <p className="text-sm text-slate-600 mt-1">
                Envantere yeni ürün ekleyin
              </p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Basic Info */}
          <Card className="bg-white border-slate-200">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <Package className="h-5 w-5 text-slate-600" />
                Temel Bilgiler
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Ürün Adı *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="Örn: 50ml Airless Pompa"
                    className="border-slate-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU (Stok Kodu)</Label>
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => handleChange("sku", e.target.value)}
                    placeholder="Otomatik oluşturulur"
                    className="border-slate-300 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Açıklama</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Ürün açıklaması..."
                  rows={3}
                  className="border-slate-300"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Kategori</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(v) => handleChange("category", v)}
                  >
                    <SelectTrigger className="border-slate-300">
                      <SelectValue placeholder="Kategori seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(ITEM_CATEGORY_LABELS).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subcategory">Alt Kategori</Label>
                  <Input
                    id="subcategory"
                    value={formData.subcategory}
                    onChange={(e) => handleChange("subcategory", e.target.value)}
                    placeholder="Örn: Airless, Spray, vs."
                    className="border-slate-300"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ownership */}
          <Card className="bg-white border-slate-200">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <Building2 className="h-5 w-5 text-slate-600" />
                Sahiplik
              </CardTitle>
              <CardDescription className="text-slate-500">
                Ürün MKN'ye mi yoksa bir müşteriye mi ait?
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ownershipType">Sahiplik Tipi</Label>
                  <Select
                    value={formData.ownershipType}
                    onValueChange={(v) => handleChange("ownershipType", v)}
                  >
                    <SelectTrigger className="border-slate-300">
                      <SelectValue placeholder="Sahiplik tipi seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(OWNERSHIP_TYPE_LABELS).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {formData.ownershipType === OWNERSHIP_TYPE.CUSTOMER && (
                  <div className="space-y-2">
                    <Label htmlFor="company">Firma</Label>
                    <Select
                      value={formData.companyId}
                      onValueChange={handleCompanyChange}
                    >
                      <SelectTrigger className="border-slate-300">
                        <SelectValue placeholder="Firma seçin" />
                      </SelectTrigger>
                      <SelectContent>
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
            </CardContent>
          </Card>

          {/* Stock Info */}
          <Card className="bg-white border-slate-200">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <BarChart3 className="h-5 w-5 text-slate-600" />
                Stok Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="initialQuantity">Başlangıç Miktarı</Label>
                  <Input
                    id="initialQuantity"
                    type="number"
                    min="0"
                    value={formData.initialQuantity}
                    onChange={(e) => handleChange("initialQuantity", Number(e.target.value))}
                    className="border-slate-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Birim</Label>
                  <Select
                    value={formData.unit}
                    onValueChange={(v) => handleChange("unit", v)}
                  >
                    <SelectTrigger className="border-slate-300">
                      <SelectValue placeholder="Birim seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(UNIT_LABELS).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minStockLevel">Minimum Stok Seviyesi</Label>
                  <Input
                    id="minStockLevel"
                    type="number"
                    min="0"
                    value={formData.minStockLevel}
                    onChange={(e) => handleChange("minStockLevel", Number(e.target.value))}
                    className="border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="warehouse">Depo</Label>
                  <Select
                    value={formData.warehouseId}
                    onValueChange={(v) => handleChange("warehouseId", v)}
                  >
                    <SelectTrigger className="border-slate-300">
                      <SelectValue placeholder="Depo seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {warehouses.map((warehouse) => (
                        <SelectItem key={warehouse.id} value={warehouse.id}>
                          {warehouse.name}
                          {warehouse.isDefault && " (Varsayılan)"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Lokasyon (Raf/Konum)</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleChange("location", e.target.value)}
                    placeholder="Örn: Raf A-12"
                    className="border-slate-300"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card className="bg-white border-slate-200">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <DollarSign className="h-5 w-5 text-slate-600" />
                Fiyatlandırma
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="costPrice">Maliyet Fiyatı</Label>
                  <Input
                    id="costPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.costPrice}
                    onChange={(e) => handleChange("costPrice", Number(e.target.value))}
                    className="border-slate-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salePrice">Satış Fiyatı</Label>
                  <Input
                    id="salePrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.salePrice}
                    onChange={(e) => handleChange("salePrice", Number(e.target.value))}
                    className="border-slate-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Para Birimi</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(v) => handleChange("currency", v)}
                  >
                    <SelectTrigger className="border-slate-300">
                      <SelectValue placeholder="Para birimi" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TRY">TRY (₺)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tracking */}
          <Card className="bg-white border-slate-200">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <Hash className="h-5 w-5 text-slate-600" />
                Lot/Seri Takibi
              </CardTitle>
              <CardDescription className="text-slate-500">
                Ürün için lot veya seri numarası takibi yapılsın mı?
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-3">
                  <Switch
                    id="hasLotTracking"
                    checked={formData.hasLotTracking}
                    onCheckedChange={(v) => handleChange("hasLotTracking", v)}
                  />
                  <Label htmlFor="hasLotTracking">Lot Takibi</Label>
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    id="hasSerialTracking"
                    checked={formData.hasSerialTracking}
                    onCheckedChange={(v) => handleChange("hasSerialTracking", v)}
                  />
                  <Label htmlFor="hasSerialTracking">Seri No Takibi</Label>
                </div>
              </div>

              {(formData.hasLotTracking || formData.hasSerialTracking) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                  {formData.hasLotTracking && (
                    <div className="space-y-2">
                      <Label htmlFor="lotNumber">Lot Numarası</Label>
                      <Input
                        id="lotNumber"
                        value={formData.lotNumber}
                        onChange={(e) => handleChange("lotNumber", e.target.value)}
                        className="border-slate-300"
                      />
                    </div>
                  )}
                  {formData.hasSerialTracking && (
                    <div className="space-y-2">
                      <Label htmlFor="serialNumber">Seri Numarası</Label>
                      <Input
                        id="serialNumber"
                        value={formData.serialNumber}
                        onChange={(e) => handleChange("serialNumber", e.target.value)}
                        className="border-slate-300"
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="productionDate">Üretim Tarihi</Label>
                    <Input
                      id="productionDate"
                      type="date"
                      value={formData.productionDate}
                      onChange={(e) => handleChange("productionDate", e.target.value)}
                      className="border-slate-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expiryDate">Son Kullanma Tarihi</Label>
                    <Input
                      id="expiryDate"
                      type="date"
                      value={formData.expiryDate}
                      onChange={(e) => handleChange("expiryDate", e.target.value)}
                      className="border-slate-300"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Supplier */}
          <Card className="bg-white border-slate-200">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <Truck className="h-5 w-5 text-slate-600" />
                Tedarikçi
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="supplier">Tedarikçi</Label>
                <Select
                  value={formData.supplierId}
                  onValueChange={handleSupplierChange}
                >
                  <SelectTrigger className="border-slate-300">
                    <SelectValue placeholder="Tedarikçi seçin (opsiyonel)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Seçilmedi</SelectItem>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card className="bg-white border-slate-200">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <FileText className="h-5 w-5 text-slate-600" />
                Notlar
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <Textarea
                value={formData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                placeholder="Ek notlar..."
                rows={3}
                className="border-slate-300"
              />
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="border-slate-300"
            >
              İptal
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Kaydet
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
