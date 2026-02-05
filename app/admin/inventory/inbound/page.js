"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAdminAuth } from "../../../../hooks/use-admin-auth";
import { useToast } from "../../../../hooks/use-toast";
import {
  useInventoryItems,
  useWarehouses,
  useSuppliers,
  useInventoryOperations,
} from "../../../../hooks/use-inventory";
import {
  TRANSACTION_SUBTYPE,
  TRANSACTION_SUBTYPE_LABELS,
  UNIT_LABELS,
} from "../../../../lib/services/inventory-service";
import { getDocuments } from "../../../../lib/firestore";
import { createTransaction } from "../../../../lib/services/finance/transaction-service";
import {
  TRANSACTION_TYPE,
  EXPENSE_CATEGORY,
  TRANSACTION_STATUS,
} from "../../../../lib/services/finance/schema";

// UI Components
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { Textarea } from "../../../../components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";
import { Switch } from "../../../../components/ui/switch";
import { Badge } from "../../../../components/ui/badge";
import { Skeleton } from "../../../../components/ui/skeleton";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../../../../components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../../components/ui/popover";

// Icons
import {
  ArrowLeft,
  ArrowDownToLine,
  Save,
  Package,
  Building2,
  Warehouse,
  Hash,
  FileText,
  Truck,
  Loader2,
  Check,
  ChevronsUpDown,
  Plus,
  Search,
  DollarSign,
} from "lucide-react";

export default function InboundPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedItemId = searchParams.get("itemId");
  const { user } = useAdminAuth();
  const { toast } = useToast();

  const { items, loading: itemsLoading, refresh: refreshItems } = useInventoryItems();
  const { warehouses, loading: warehousesLoading } = useWarehouses();
  const { suppliers, loading: suppliersLoading } = useSuppliers();
  const { inbound, loading: saving } = useInventoryOperations();

  const [companies, setCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [financeAccounts, setFinanceAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);

  // Form state
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemSearchOpen, setItemSearchOpen] = useState(false);
  const [formData, setFormData] = useState({
    quantity: "",
    subtype: TRANSACTION_SUBTYPE.PURCHASE,
    unitPrice: "",
    warehouseId: "",
    companyId: "",
    companyName: "",
    supplierId: "",
    supplierName: "",
    lotNumber: "",
    serialNumber: "",
    notes: "",
    createDelivery: true,
    // Finans kaydı
    createFinanceRecord: false,
    paymentStatus: "paid", // paid, deferred, partial
    paymentAmount: "",
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: "bank_transfer", // cash, bank_transfer, credit_card, check
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
        // Set default account
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

  // Pre-select item from URL
  useEffect(() => {
    if (preselectedItemId && items.length > 0) {
      const item = items.find((i) => i.id === preselectedItemId);
      if (item) {
        setSelectedItem(item);
        setFormData((prev) => ({
          ...prev,
          warehouseId: item.warehouseId || "",
          unitPrice: item.pricing?.costPrice || "",
        }));
      }
    }
  }, [preselectedItemId, items]);

  // Set default warehouse
  useEffect(() => {
    if (warehouses.length > 0 && !formData.warehouseId) {
      const defaultWarehouse = warehouses.find((w) => w.isDefault) || warehouses[0];
      setFormData((prev) => ({ ...prev, warehouseId: defaultWarehouse.id }));
    }
  }, [warehouses, formData.warehouseId]);

  const handleChange = (field, value) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };
      
      // Ödeme tutarını otomatik hesapla
      if ((field === "quantity" || field === "unitPrice") && prev.createFinanceRecord) {
        const qty = field === "quantity" ? value : prev.quantity;
        const price = field === "unitPrice" ? value : prev.unitPrice;
        if (qty && price) {
          newData.paymentAmount = (Number(qty) * Number(price)).toString();
        }
      }
      
      return newData;
    });
  };

  const handleItemSelect = (item) => {
    setSelectedItem(item);
    setFormData((prev) => ({
      ...prev,
      warehouseId: item.warehouseId || prev.warehouseId,
      unitPrice: item.pricing?.costPrice || "",
    }));
    setItemSearchOpen(false);
  };

  const handleCompanySelect = (companyId) => {
    const company = companies.find((c) => c.id === companyId);
    setFormData((prev) => ({
      ...prev,
      companyId,
      companyName: company?.name || "",
    }));
  };

  const handleSupplierSelect = (supplierId) => {
    const supplier = suppliers.find((s) => s.id === supplierId);
    setFormData((prev) => ({
      ...prev,
      supplierId,
      supplierName: supplier?.name || "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedItem) {
      toast({
        title: "Hata",
        description: "Lütfen bir ürün seçin.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.quantity || Number(formData.quantity) <= 0) {
      toast({
        title: "Hata",
        description: "Geçerli bir miktar girin.",
        variant: "destructive",
      });
      return;
    }

    // Finans kaydı kontrolü
    if (formData.createFinanceRecord) {
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
      const result = await inbound(
        {
          itemId: selectedItem.id,
          quantity: Number(formData.quantity),
          subtype: formData.subtype,
          unitPrice: Number(formData.unitPrice) || 0,
          warehouseId: formData.warehouseId,
          companyId: formData.companyId || null,
          companyName: formData.companyName || null,
          supplierId: formData.supplierId || null,
          supplierName: formData.supplierName || null,
          lotNumber: formData.lotNumber || null,
          serialNumber: formData.serialNumber || null,
          notes: formData.notes,
        },
        user
      );

      // Finans kaydı oluştur
      if (formData.createFinanceRecord && result) {
        try {
          // Kategoriyi belirle
          let category = EXPENSE_CATEGORY.RAW_MATERIAL;
          if (selectedItem.category === "packaging") {
            category = EXPENSE_CATEGORY.PACKAGING;
          } else if (selectedItem.category === "finished_product" || selectedItem.category === "semi_finished") {
            category = EXPENSE_CATEGORY.PRODUCTION_COST;
          }

          const selectedAccount = financeAccounts.find(acc => acc.id === formData.financeAccountId);
          
          const financeData = {
            type: TRANSACTION_TYPE.EXPENSE,
            status: formData.paymentStatus === "paid" ? TRANSACTION_STATUS.COMPLETED : TRANSACTION_STATUS.PENDING,
            category: category,
            amount: Number(formData.paymentAmount),
            currency: selectedAccount?.currency || "TRY",
            accountId: formData.financeAccountId,
            accountName: selectedAccount?.name || "",
            // İlişkiler
            companyId: formData.companyId || null,
            companyName: formData.companyName || null,
            // Açıklama
            description: `Stok girişi: ${selectedItem.name} (${formData.quantity} ${UNIT_LABELS[selectedItem.stock?.unit]})`,
            notes: formData.financeNotes || `Envanter kaydı: ${selectedItem.sku}`,
            reference: formData.invoiceNumber || "",
            transactionDate: formData.paymentDate ? new Date(formData.paymentDate) : new Date(),
            // Envanter bağlantısı
            inventoryTransactionId: result.transactionId || null,
            inventoryItemId: selectedItem.id,
            inventoryItemName: selectedItem.name,
            inventoryItemSku: selectedItem.sku,
          };

          const financeResult = await createTransaction(financeData, user.uid);
          
          if (!financeResult.success) {
            // Finans kaydı başarısız olsa da envanter kaydı yapıldı
            toast({
              title: "Uyarı",
              description: "Stok girişi yapıldı ancak finans kaydı oluşturulamadı: " + financeResult.error,
              variant: "destructive",
            });
            return;
          }
        } catch (financeError) {
          console.error("Finance record error:", financeError);
          toast({
            title: "Uyarı",
            description: "Stok girişi yapıldı ancak finans kaydı oluşturulamadı.",
            variant: "destructive",
          });
        }
      }

      toast({
        title: "Başarılı",
        description: formData.createFinanceRecord 
          ? `${formData.quantity} ${UNIT_LABELS[selectedItem.stock?.unit]} giriş yapıldı ve finans kaydı oluşturuldu.`
          : `${formData.quantity} ${UNIT_LABELS[selectedItem.stock?.unit]} giriş yapıldı.`,
      });

      // Reset form or redirect
      if (preselectedItemId) {
        router.push(`/admin/inventory/items/${preselectedItemId}`);
      } else {
        setSelectedItem(null);
        setFormData({
          quantity: "",
          subtype: TRANSACTION_SUBTYPE.PURCHASE,
          unitPrice: "",
          warehouseId: formData.warehouseId,
          companyId: "",
          companyName: "",
          supplierId: "",
          supplierName: "",
          lotNumber: "",
          serialNumber: "",
          notes: "",
          createDelivery: true,
          // Finans
          createFinanceRecord: false,
          paymentStatus: "paid",
          paymentAmount: "",
          paymentDate: new Date().toISOString().split('T')[0],
          paymentMethod: "bank_transfer",
          financeAccountId: formData.financeAccountId,
          invoiceNumber: "",
          financeNotes: "",
        });
        refreshItems();
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const loading = itemsLoading || warehousesLoading || suppliersLoading || loadingCompanies;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="space-y-6 max-w-2xl mx-auto">
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
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/inventory">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <ArrowDownToLine className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Stok Girişi</h1>
                <p className="text-sm text-slate-600 mt-1">
                  Depoya ürün girişi yapın
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Product Selection */}
          <Card className="bg-white border-slate-200">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <Package className="h-5 w-5 text-slate-600" />
                Ürün Seçimi
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <Popover open={itemSearchOpen} onOpenChange={setItemSearchOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={itemSearchOpen}
                    className="w-full justify-between h-auto py-3 border-slate-300"
                  >
                    {selectedItem ? (
                      <div className="flex items-center gap-3 text-left">
                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                          <Package className="h-5 w-5 text-slate-400" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{selectedItem.name}</p>
                          <p className="text-xs text-slate-500">
                            SKU: {selectedItem.sku} • Mevcut: {selectedItem.stock?.quantity || 0}{" "}
                            {UNIT_LABELS[selectedItem.stock?.unit]}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-500">Ürün seçin veya arayın...</span>
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[500px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Ürün adı veya SKU ara..." />
                    <CommandList>
                      <CommandEmpty>Ürün bulunamadı.</CommandEmpty>
                      <CommandGroup>
                        {items.map((item) => (
                          <CommandItem
                            key={item.id}
                            value={`${item.name} ${item.sku}`}
                            onSelect={() => handleItemSelect(item)}
                            className="flex items-center gap-3 py-3 data-[selected=true]:bg-slate-100 data-[selected=true]:text-slate-900"
                          >
                            <Check
                              className={`h-4 w-4 ${
                                selectedItem?.id === item.id ? "opacity-100" : "opacity-0"
                              }`}
                            />
                            <div className="w-8 h-8 bg-slate-100 rounded flex items-center justify-center">
                              <Package className="h-4 w-4 text-slate-400" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-slate-900">{item.name}</p>
                              <p className="text-xs text-slate-500">
                                {item.sku} • {item.stock?.quantity || 0}{" "}
                                {UNIT_LABELS[item.stock?.unit]}
                              </p>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              {items.length === 0 && (
                <div className="mt-4 p-4 bg-slate-50 rounded-lg text-center">
                  <p className="text-sm text-slate-500 mb-3">Henüz stok kalemi yok.</p>
                  <Button asChild size="sm">
                    <Link href="/admin/inventory/items/new">
                      <Plus className="h-4 w-4 mr-2" />
                      Yeni Ürün Ekle
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quantity & Details */}
          {selectedItem && (
            <>
              <Card className="bg-white border-slate-200">
                <CardHeader className="border-b border-slate-100">
                  <CardTitle className="flex items-center gap-2 text-slate-900">
                    <Hash className="h-5 w-5 text-slate-600" />
                    Giriş Detayları
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="quantity">Miktar *</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="quantity"
                          type="number"
                          min="1"
                          value={formData.quantity}
                          onChange={(e) => handleChange("quantity", e.target.value)}
                          placeholder="0"
                          className="border-slate-300 text-lg font-semibold"
                          autoFocus
                        />
                        <Badge variant="outline" className="border-slate-300 whitespace-nowrap">
                          {UNIT_LABELS[selectedItem.stock?.unit]}
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="unitPrice">Birim Fiyat</Label>
                      <Input
                        id="unitPrice"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.unitPrice}
                        onChange={(e) => handleChange("unitPrice", e.target.value)}
                        placeholder="0.00"
                        className="border-slate-300"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subtype">Giriş Türü</Label>
                    <Select
                      value={formData.subtype}
                      onValueChange={(v) => handleChange("subtype", v)}
                    >
                      <SelectTrigger className="border-slate-300">
                        <SelectValue placeholder="Tür seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={TRANSACTION_SUBTYPE.PURCHASE}>
                          {TRANSACTION_SUBTYPE_LABELS[TRANSACTION_SUBTYPE.PURCHASE]}
                        </SelectItem>
                        <SelectItem value={TRANSACTION_SUBTYPE.PRODUCTION}>
                          {TRANSACTION_SUBTYPE_LABELS[TRANSACTION_SUBTYPE.PRODUCTION]}
                        </SelectItem>
                        <SelectItem value={TRANSACTION_SUBTYPE.RETURN}>
                          {TRANSACTION_SUBTYPE_LABELS[TRANSACTION_SUBTYPE.RETURN]}
                        </SelectItem>
                        <SelectItem value={TRANSACTION_SUBTYPE.CUSTOMER_INBOUND}>
                          {TRANSACTION_SUBTYPE_LABELS[TRANSACTION_SUBTYPE.CUSTOMER_INBOUND]}
                        </SelectItem>
                        <SelectItem value={TRANSACTION_SUBTYPE.MANUAL}>
                          {TRANSACTION_SUBTYPE_LABELS[TRANSACTION_SUBTYPE.MANUAL]}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

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
                </CardContent>
              </Card>

              {/* Company & Supplier */}
              <Card className="bg-white border-slate-200">
                <CardHeader className="border-b border-slate-100">
                  <CardTitle className="flex items-center gap-2 text-slate-900">
                    <Building2 className="h-5 w-5 text-slate-600" />
                    Firma / Tedarikçi
                  </CardTitle>
                  <CardDescription className="text-slate-500">
                    Opsiyonel - İrsaliye ve takip için
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company">Firma</Label>
                      <Select
                        value={formData.companyId}
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
                    <div className="space-y-2">
                      <Label htmlFor="supplier">Tedarikçi</Label>
                      <Select
                        value={formData.supplierId}
                        onValueChange={handleSupplierSelect}
                      >
                        <SelectTrigger className="border-slate-300">
                          <SelectValue placeholder="Tedarikçi seçin" />
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
                  </div>
                </CardContent>
              </Card>

              {/* Lot/Serial */}
              {(selectedItem.tracking?.hasLotTracking || selectedItem.tracking?.hasSerialTracking) && (
                <Card className="bg-white border-slate-200">
                  <CardHeader className="border-b border-slate-100">
                    <CardTitle className="flex items-center gap-2 text-slate-900">
                      <Hash className="h-5 w-5 text-slate-600" />
                      Lot / Seri Bilgisi
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {selectedItem.tracking?.hasLotTracking && (
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
                      {selectedItem.tracking?.hasSerialTracking && (
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
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Finance Record */}
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
                          // Checkbox açıldığında ödeme tutarını hesapla
                          if (checked && prev.quantity && prev.unitPrice) {
                            newData.paymentAmount = (Number(prev.quantity) * Number(prev.unitPrice)).toString();
                          }
                          return newData;
                        });
                      }}
                    />
                  </div>
                  <CardDescription>
                    Stok girişi için finans sistemi ile entegre gider kaydı oluştur
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
                    placeholder="Giriş ile ilgili notlar..."
                    rows={3}
                    className="border-slate-300"
                  />
                </CardContent>
              </Card>

              {/* Summary */}
              <Card className="bg-green-50 border-green-200">
                <CardContent className="py-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <ArrowDownToLine className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-green-900">
                          {formData.quantity || 0} {UNIT_LABELS[selectedItem.stock?.unit]} giriş
                          yapılacak
                        </p>
                        <p className="text-sm text-green-700">
                          Yeni stok:{" "}
                          {(selectedItem.stock?.quantity || 0) + Number(formData.quantity || 0)}{" "}
                          {UNIT_LABELS[selectedItem.stock?.unit]}
                        </p>
                      </div>
                    </div>
                    {formData.unitPrice && formData.quantity && (
                      <div className="text-right">
                        <p className="text-sm text-green-700">Toplam Değer</p>
                        <p className="font-semibold text-green-900">
                          {new Intl.NumberFormat("tr-TR", {
                            style: "currency",
                            currency: "TRY",
                          }).format(Number(formData.unitPrice) * Number(formData.quantity))}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {formData.createFinanceRecord && formData.paymentAmount && (
                    <div className="pt-3 border-t border-green-300">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-green-700" />
                          <span className="text-sm font-medium text-green-800">Finans Kaydı</span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-green-700">
                            {formData.paymentStatus === "paid" ? "Ödendi" : formData.paymentStatus === "deferred" ? "Vadeli" : "Kısmi"}
                          </p>
                          <p className="font-semibold text-green-900">
                            {new Intl.NumberFormat("tr-TR", {
                              style: "currency",
                              currency: "TRY",
                            }).format(Number(formData.paymentAmount))}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}

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
              disabled={saving || !selectedItem || !formData.quantity}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  İşleniyor...
                </>
              ) : (
                <>
                  <ArrowDownToLine className="h-4 w-4 mr-2" />
                  Giriş Yap
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
