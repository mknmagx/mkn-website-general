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
import { createTransaction } from "../../../../../lib/services/finance/transaction-service";
import {
  TRANSACTION_TYPE,
  EXPENSE_CATEGORY,
  TRANSACTION_STATUS,
} from "../../../../../lib/services/finance/schema";

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
  const [financeAccounts, setFinanceAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);

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
    // Finans kaydı (başlangıç stoğu için)
    createFinanceRecord: false,
    paymentStatus: "paid",
    paymentAmount: "",
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: "bank_transfer",
    financeAccountId: "",
    invoiceNumber: "",
    financeNotes: "",
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

  // Load finance accounts
  useEffect(() => {
    const loadAccounts = async () => {
      try {
        const data = await getDocuments("finance_accounts");
        setFinanceAccounts(data || []);
        if (data && data.length > 0) {
          const defaultAccount = data.find(acc => acc.isDefault) || data[0];
          setFormData(prev => ({ ...prev, financeAccountId: defaultAccount.id }));
        }
      } catch (error) {
        // Silent fail
      } finally {
        setLoadingAccounts(false);
      }
    };
    loadAccounts();
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
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };
      
      // Ödeme tutarını otomatik hesapla
      if ((field === "initialQuantity" || field === "costPrice") && prev.createFinanceRecord) {
        const qty = field === "initialQuantity" ? value : prev.initialQuantity;
        const price = field === "costPrice" ? value : prev.costPrice;
        if (qty && price && Number(qty) > 0 && Number(price) > 0) {
          newData.paymentAmount = (Number(qty) * Number(price)).toString();
        }
      }
      
      return newData;
    });
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

    // Finans kaydı kontrolü
    if (formData.createFinanceRecord && formData.initialQuantity > 0) {
      if (!formData.financeAccountId) {
        toast({
          title: "Hata",
          description: "Lütfen bir hesap seçin.",
          variant: "destructive",
        });
        return;
      }
      if (!formData.paymentAmount || Number(formData.paymentAmount) <= 0) {
        toast({
          title: "Hata",
          description: "Geçerli bir ödeme tutarı girin.",
          variant: "destructive",
        });
        return;
      }
    }

    try {
      const result = await createItem(formData, user);

      // Finans kaydı oluştur (eğer başlangıç stoğu varsa)
      if (formData.createFinanceRecord && formData.initialQuantity > 0 && result) {
        try {
          // Kategoriyi belirle
          let category = EXPENSE_CATEGORY.RAW_MATERIAL;
          if (formData.category === "packaging") {
            category = EXPENSE_CATEGORY.PACKAGING;
          } else if (formData.category === "finished_product" || formData.category === "semi_finished") {
            category = EXPENSE_CATEGORY.PRODUCTION_COST;
          }

          const selectedAccount = financeAccounts.find(acc => acc.id === formData.financeAccountId);
          
          const financeData = {
            type: TRANSACTION_TYPE.EXPENSE,
            status: formData.paymentStatus === "paid" ? TRANSACTION_STATUS.COMPLETED : TRANSACTION_STATUS.PENDING,
            category: category,
            amount: Number(formData.paymentAmount),
            currency: selectedAccount?.currency || formData.currency || "TRY",
            accountId: formData.financeAccountId,
            accountName: selectedAccount?.name || "",
            companyId: formData.companyId || null,
            companyName: formData.companyName || null,
            description: `Başlangıç stoğu: ${formData.name} (${formData.initialQuantity} ${UNIT_LABELS[formData.unit]})`,
            notes: formData.financeNotes || `Yeni ürün kaydı: ${formData.sku}`,
            reference: formData.invoiceNumber || "",
            transactionDate: formData.paymentDate ? new Date(formData.paymentDate) : new Date(),
            inventoryItemId: result.id,
            inventoryItemName: formData.name,
            inventoryItemSku: result.sku || formData.sku,
          };

          const financeResult = await createTransaction(financeData, user.uid);
          
          if (!financeResult.success) {
            toast({
              title: "Uyarı",
              description: "Ürün oluşturuldu ancak finans kaydı oluşturulamadı: " + financeResult.error,
              variant: "destructive",
            });
            router.push(`/admin/inventory/items/${result.id}`);
            return;
          }
        } catch (financeError) {
          console.error("Finance record error:", financeError);
          toast({
            title: "Uyarı",
            description: "Ürün oluşturuldu ancak finans kaydı oluşturulamadı.",
            variant: "destructive",
          });
        }
      }

      toast({
        title: "Başarılı",
        description: formData.createFinanceRecord && formData.initialQuantity > 0
          ? "Ürün başarıyla oluşturuldu ve finans kaydı eklendi."
          : "Ürün başarıyla oluşturuldu.",
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

  const loading = warehousesLoading || suppliersLoading || loadingCompanies || loadingAccounts;

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

          {/* Finance Record - Only show if initial quantity > 0 */}
          {formData.initialQuantity > 0 && (
            <Card className="bg-white border-slate-200">
              <CardHeader className="border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-slate-900">
                    <DollarSign className="h-5 w-5 text-slate-600" />
                    Finans Kaydı
                  </CardTitle>
                  <Switch
                    checked={formData.createFinanceRecord}
                    onCheckedChange={(checked) => {
                      setFormData((prev) => {
                        const newData = { ...prev, createFinanceRecord: checked };
                        if (checked && prev.initialQuantity && prev.costPrice) {
                          newData.paymentAmount = (Number(prev.initialQuantity) * Number(prev.costPrice)).toString();
                        }
                        return newData;
                      });
                    }}
                  />
                </div>
                <CardDescription>
                  Başlangıç stoğu için finans sistemi ile entegre gider kaydı oluştur
                </CardDescription>
              </CardHeader>
              {formData.createFinanceRecord && (
                <CardContent className="pt-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Ödeme Durumu</Label>
                      <Select
                        value={formData.paymentStatus}
                        onValueChange={(value) => handleChange("paymentStatus", value)}
                      >
                        <SelectTrigger className="border-slate-300">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="paid">Ödendi</SelectItem>
                          <SelectItem value="deferred">Vadeli</SelectItem>
                          <SelectItem value="partial">Kısmi Ödeme</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Ödeme Tutarı</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.paymentAmount}
                        onChange={(e) => handleChange("paymentAmount", e.target.value)}
                        className="border-slate-300"
                        placeholder="Otomatik hesaplanır"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Ödeme Tarihi</Label>
                      <Input
                        type="date"
                        value={formData.paymentDate}
                        onChange={(e) => handleChange("paymentDate", e.target.value)}
                        className="border-slate-300"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Ödeme Yöntemi</Label>
                      <Select
                        value={formData.paymentMethod}
                        onValueChange={(value) => handleChange("paymentMethod", value)}
                      >
                        <SelectTrigger className="border-slate-300">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash">Nakit</SelectItem>
                          <SelectItem value="bank_transfer">Havale/EFT</SelectItem>
                          <SelectItem value="credit_card">Kredi Kartı</SelectItem>
                          <SelectItem value="check">Çek</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Hesap</Label>
                      <Select
                        value={formData.financeAccountId}
                        onValueChange={(value) => handleChange("financeAccountId", value)}
                      >
                        <SelectTrigger className="border-slate-300">
                          <SelectValue placeholder="Hesap seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          {financeAccounts.map((account) => (
                            <SelectItem key={account.id} value={account.id}>
                              {account.name} ({account.currency || 'TRY'})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Fatura No (Opsiyonel)</Label>
                      <Input
                        value={formData.invoiceNumber}
                        onChange={(e) => handleChange("invoiceNumber", e.target.value)}
                        className="border-slate-300"
                        placeholder="FA-2026-001"
                      />
                    </div>
                  </div>

                  {formData.paymentStatus !== "paid" && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <p className="text-sm text-amber-800">
                        <strong>Not:</strong> {formData.paymentStatus === "deferred" ? "Vadeli ödeme olarak işaretlenecek" : "Kısmi ödeme olarak kaydedilecek"}
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Finans Notları</Label>
                    <Textarea
                      value={formData.financeNotes}
                      onChange={(e) => handleChange("financeNotes", e.target.value)}
                      placeholder="Ödeme ile ilgili notlar..."
                      rows={2}
                      className="border-slate-300"
                    />
                  </div>
                </CardContent>
              )}
            </Card>
          )}

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
