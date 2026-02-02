"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAdminAuth } from "../../../../hooks/use-admin-auth";
import { useToast } from "../../../../hooks/use-toast";
import {
  useInventoryItems,
  useWarehouses,
  useInventoryOperations,
} from "../../../../hooks/use-inventory";
import {
  TRANSACTION_SUBTYPE,
  TRANSACTION_SUBTYPE_LABELS,
  UNIT_LABELS,
} from "../../../../lib/services/inventory-service";
import { getDocuments } from "../../../../lib/firestore";
import {
  createTransaction,
  getAccounts,
  TRANSACTION_TYPE as FINANCE_TRANSACTION_TYPE,
  INCOME_CATEGORY,
  CURRENCY,
  getCurrencySymbol,
  getIncomeCategoryLabel,
} from "../../../../lib/services/finance";

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
import { Badge } from "../../../../components/ui/badge";
import { Skeleton } from "../../../../components/ui/skeleton";
import { Checkbox } from "../../../../components/ui/checkbox";
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
  ArrowUpFromLine,
  Package,
  Building2,
  Hash,
  FileText,
  Loader2,
  Check,
  ChevronsUpDown,
  AlertTriangle,
  Wallet,
  CircleDollarSign,
} from "lucide-react";

// Çıkış türlerine göre finans kaydı oluşturulacak mı?
const FINANCE_ENABLED_SUBTYPES = [
  TRANSACTION_SUBTYPE.SALE,
  TRANSACTION_SUBTYPE.CUSTOMER_OUTBOUND,
];

// Çıkış türüne göre finans kategorisi
const SUBTYPE_TO_FINANCE_CATEGORY = {
  [TRANSACTION_SUBTYPE.SALE]: INCOME_CATEGORY.SALES,
  [TRANSACTION_SUBTYPE.CUSTOMER_OUTBOUND]: INCOME_CATEGORY.SALES,
};

export default function OutboundPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedItemId = searchParams.get("itemId");
  const { user } = useAdminAuth();
  const { toast } = useToast();

  const { items, loading: itemsLoading, refresh: refreshItems } = useInventoryItems();
  const { warehouses, loading: warehousesLoading } = useWarehouses();
  const { outbound, loading: saving } = useInventoryOperations();

  const [companies, setCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [financeAccounts, setFinanceAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);

  // Form state
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemSearchOpen, setItemSearchOpen] = useState(false);
  const [formData, setFormData] = useState({
    quantity: "",
    subtype: TRANSACTION_SUBTYPE.SALE,
    unitPrice: "",
    warehouseId: "",
    companyId: "",
    companyName: "",
    lotNumber: "",
    serialNumber: "",
    notes: "",
    createDelivery: true,
    // Finans alanları
    createFinanceRecord: true,
    financeCurrency: CURRENCY.TRY,
    financeUnitPrice: "",
    financeAccountId: "",
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
        const result = await getAccounts();
        if (result.success) {
          setFinanceAccounts(result.data || []);
          // Set default account if exists
          const defaultAccount = result.data?.find(a => a.isDefault);
          if (defaultAccount) {
            setFormData(prev => ({ ...prev, financeAccountId: defaultAccount.id }));
          }
        }
      } catch (error) {
        // Silent fail - will use manual entry
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
          unitPrice: item.pricing?.salePrice || item.pricing?.costPrice || "",
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
      
      // Birim fiyat değişirse finans fiyatını da senkronize et
      if (field === "unitPrice" && !prev.financeUnitPrice) {
        newData.financeUnitPrice = value;
      }
      
      // Para birimi değişirse stok ve finans fiyatı aynı olsun
      if (field === "financeCurrency") {
        // Yeni para birimi seçildiğinde mevcut fiyatı koru
      }
      
      return newData;
    });
  };

  const handleItemSelect = (item) => {
    setSelectedItem(item);
    const salePrice = item.pricing?.salePrice || item.pricing?.costPrice || "";
    setFormData((prev) => ({
      ...prev,
      warehouseId: item.warehouseId || prev.warehouseId,
      unitPrice: salePrice,
      financeUnitPrice: salePrice,
      financeCurrency: item.pricing?.currency || CURRENCY.TRY,
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

    const quantity = Number(formData.quantity);

    if (!quantity || quantity <= 0) {
      toast({
        title: "Hata",
        description: "Geçerli bir miktar girin.",
        variant: "destructive",
      });
      return;
    }

    if (quantity > (selectedItem.stock?.quantity || 0)) {
      toast({
        title: "Hata",
        description: `Yetersiz stok. Mevcut: ${selectedItem.stock?.quantity || 0} ${
          UNIT_LABELS[selectedItem.stock?.unit]
        }`,
        variant: "destructive",
      });
      return;
    }

    // Finans kaydı için hesap kontrolü
    const shouldCreateFinanceRecord = 
      formData.createFinanceRecord && 
      FINANCE_ENABLED_SUBTYPES.includes(formData.subtype);
    
    if (shouldCreateFinanceRecord && !formData.financeAccountId) {
      toast({
        title: "Hata",
        description: "Finans kaydı için bir hesap seçmelisiniz.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Stok çıkışı yap
      const outboundResult = await outbound(
        {
          itemId: selectedItem.id,
          quantity,
          subtype: formData.subtype,
          unitPrice: Number(formData.unitPrice) || 0,
          currency: formData.financeCurrency, // Currency bilgisini ekle
          warehouseId: formData.warehouseId,
          companyId: formData.companyId || null,
          companyName: formData.companyName || null,
          lotNumber: formData.lotNumber || null,
          serialNumber: formData.serialNumber || null,
          notes: formData.notes,
        },
        user
      );

      // Finans kaydı oluştur
      let financeResult = null;
      if (shouldCreateFinanceRecord) {
        const financeUnitPrice = Number(formData.financeUnitPrice) || Number(formData.unitPrice) || 0;
        const financeTotal = financeUnitPrice * quantity;
        const selectedAccount = financeAccounts.find(a => a.id === formData.financeAccountId);

        financeResult = await createTransaction({
          type: FINANCE_TRANSACTION_TYPE.INCOME,
          category: SUBTYPE_TO_FINANCE_CATEGORY[formData.subtype] || INCOME_CATEGORY.SALES,
          amount: financeTotal,
          currency: formData.financeCurrency,
          accountId: formData.financeAccountId,
          accountName: selectedAccount?.name || "",
          companyId: formData.companyId || null,
          companyName: formData.companyName || null,
          description: `Stok Satışı: ${selectedItem.name} (${quantity} ${UNIT_LABELS[selectedItem.stock?.unit]})`,
          notes: formData.financeNotes || formData.notes,
          reference: outboundResult?.transactionNumber || "",
          // Link to inventory transaction
          inventoryTransactionId: outboundResult?.id || null,
        }, user?.uid);

        // Update inventory transaction with finance transaction ID
        if (financeResult?.success && financeResult?.id && outboundResult?.id) {
          try {
            const { updateDoc, doc } = await import("firebase/firestore");
            const { db } = await import("../../../../lib/firebase");
            await updateDoc(doc(db, "inventory_transactions", outboundResult.id), {
              financeTransactionId: financeResult.id,
            });
          } catch (linkError) {
            console.error("Error linking finance transaction:", linkError);
          }
        }
      }

      toast({
        title: "Başarılı",
        description: `${quantity} ${UNIT_LABELS[selectedItem.stock?.unit]} çıkış yapıldı.${
          financeResult?.success ? " Finans kaydı oluşturuldu." : ""
        }`,
      });

      // Reset form or redirect
      if (preselectedItemId) {
        router.push(`/admin/inventory/items/${preselectedItemId}`);
      } else {
        setSelectedItem(null);
        setFormData({
          quantity: "",
          subtype: TRANSACTION_SUBTYPE.SALE,
          unitPrice: "",
          warehouseId: formData.warehouseId,
          companyId: "",
          companyName: "",
          lotNumber: "",
          serialNumber: "",
          notes: "",
          createDelivery: true,
          createFinanceRecord: true,
          financeCurrency: CURRENCY.TRY,
          financeUnitPrice: "",
          financeAccountId: formData.financeAccountId,
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

  const loading = itemsLoading || warehousesLoading || loadingCompanies || loadingAccounts;

  // Check if finance section should be shown
  const showFinanceSection = FINANCE_ENABLED_SUBTYPES.includes(formData.subtype);
  const financeUnitPrice = Number(formData.financeUnitPrice) || Number(formData.unitPrice) || 0;
  const financeTotal = financeUnitPrice * (Number(formData.quantity) || 0);

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

  const availableStock = selectedItem?.stock?.quantity || 0;
  const requestedQuantity = Number(formData.quantity) || 0;
  const isOverStock = requestedQuantity > availableStock;

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
              <div className="p-2 bg-red-100 rounded-lg">
                <ArrowUpFromLine className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Stok Çıkışı</h1>
                <p className="text-sm text-slate-600 mt-1">
                  Depodan ürün çıkışı yapın
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
                        <div className="flex-1">
                          <p className="font-medium text-slate-900">{selectedItem.name}</p>
                          <p className="text-xs text-slate-500">
                            SKU: {selectedItem.sku} • Mevcut:{" "}
                            <span
                              className={
                                availableStock === 0 ? "text-red-500 font-semibold" : ""
                              }
                            >
                              {availableStock} {UNIT_LABELS[selectedItem.stock?.unit]}
                            </span>
                          </p>
                        </div>
                        {selectedItem.pricing?.salePrice && (
                          <div className="text-right">
                            <p className="text-xs text-slate-500">Satış Fiyatı</p>
                            <p className="font-semibold text-emerald-600">
                              {getCurrencySymbol(selectedItem.pricing?.currency || CURRENCY.TRY)}
                              {new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2 }).format(selectedItem.pricing.salePrice)}
                            </p>
                          </div>
                        )}
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
                        {items.map((item) => {
                          const stock = item.stock?.quantity || 0;
                          return (
                            <CommandItem
                              key={item.id}
                              value={`${item.name} ${item.sku}`}
                              onSelect={() => handleItemSelect(item)}
                              className="flex items-center gap-3 py-3 data-[selected=true]:bg-slate-100 data-[selected=true]:text-slate-900"
                              disabled={stock === 0}
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
                                <p
                                  className={`font-medium ${
                                    stock === 0 ? "text-slate-400" : "text-slate-900"
                                  }`}
                                >
                                  {item.name}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {item.sku} •{" "}
                                  <span className={stock === 0 ? "text-red-500" : ""}>
                                    {stock} {UNIT_LABELS[item.stock?.unit]}
                                  </span>
                                  {stock === 0 && " (Stokta yok)"}
                                </p>
                              </div>
                              {item.pricing?.salePrice && (
                                <div className="text-right text-xs">
                                  <span className="text-emerald-600 font-medium">
                                    {getCurrencySymbol(item.pricing?.currency || CURRENCY.TRY)}
                                    {new Intl.NumberFormat("tr-TR").format(item.pricing.salePrice)}
                                  </span>
                                </div>
                              )}
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </CardContent>
          </Card>

          {/* Quantity & Details */}
          {selectedItem && (
            <>
              <Card className="bg-white border-slate-200">
                <CardHeader className="border-b border-slate-100">
                  <CardTitle className="flex items-center gap-2 text-slate-900">
                    <Hash className="h-5 w-5 text-slate-600" />
                    Çıkış Detayları
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
                          max={availableStock}
                          value={formData.quantity}
                          onChange={(e) => handleChange("quantity", e.target.value)}
                          placeholder="0"
                          className={`border-slate-300 text-lg font-semibold ${
                            isOverStock ? "border-red-300 focus:border-red-500" : ""
                          }`}
                          autoFocus
                        />
                        <Badge variant="outline" className="border-slate-300 whitespace-nowrap">
                          {UNIT_LABELS[selectedItem.stock?.unit]}
                        </Badge>
                      </div>
                      {isOverStock && (
                        <p className="text-xs text-red-500 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Yetersiz stok! Maks: {availableStock}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="unitPrice">Birim Fiyat</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="unitPrice"
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.unitPrice}
                          onChange={(e) => {
                            const newPrice = e.target.value;
                            setFormData(prev => ({
                              ...prev,
                              unitPrice: newPrice,
                              financeUnitPrice: newPrice, // Senkronize et
                            }));
                          }}
                          placeholder="0.00"
                          className="border-slate-300"
                        />
                        <Select
                          value={formData.financeCurrency}
                          onValueChange={(v) => handleChange("financeCurrency", v)}
                        >
                          <SelectTrigger className="w-24 border-slate-300">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={CURRENCY.TRY}>₺ TRY</SelectItem>
                            <SelectItem value={CURRENCY.USD}>$ USD</SelectItem>
                            <SelectItem value={CURRENCY.EUR}>€ EUR</SelectItem>
                            <SelectItem value={CURRENCY.GBP}>£ GBP</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <p className="text-xs text-slate-500">
                        Toplam: {getCurrencySymbol(formData.financeCurrency)}
                        {new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2 }).format(
                          (Number(formData.unitPrice) || 0) * (Number(formData.quantity) || 0)
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subtype">Çıkış Türü</Label>
                    <Select
                      value={formData.subtype}
                      onValueChange={(v) => handleChange("subtype", v)}
                    >
                      <SelectTrigger className="border-slate-300">
                        <SelectValue placeholder="Tür seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={TRANSACTION_SUBTYPE.SALE}>
                          {TRANSACTION_SUBTYPE_LABELS[TRANSACTION_SUBTYPE.SALE]}
                        </SelectItem>
                        <SelectItem value={TRANSACTION_SUBTYPE.PRODUCTION}>
                          {TRANSACTION_SUBTYPE_LABELS[TRANSACTION_SUBTYPE.PRODUCTION]}
                        </SelectItem>
                        <SelectItem value={TRANSACTION_SUBTYPE.DAMAGE}>
                          {TRANSACTION_SUBTYPE_LABELS[TRANSACTION_SUBTYPE.DAMAGE]}
                        </SelectItem>
                        <SelectItem value={TRANSACTION_SUBTYPE.CUSTOMER_OUTBOUND}>
                          {TRANSACTION_SUBTYPE_LABELS[TRANSACTION_SUBTYPE.CUSTOMER_OUTBOUND]}
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

              {/* Company */}
              <Card className="bg-white border-slate-200">
                <CardHeader className="border-b border-slate-100">
                  <CardTitle className="flex items-center gap-2 text-slate-900">
                    <Building2 className="h-5 w-5 text-slate-600" />
                    Firma
                  </CardTitle>
                  <CardDescription className="text-slate-500">
                    Opsiyonel - İrsaliye ve takip için
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="company">Kayıtlı Firma</Label>
                    <Select 
                      value={formData.companyId || "none"} 
                      onValueChange={(v) => {
                        if (v === "none") {
                          setFormData(prev => ({ ...prev, companyId: "", companyName: "" }));
                        } else {
                          handleCompanySelect(v);
                        }
                      }}
                    >
                      <SelectTrigger className="border-slate-300">
                        <SelectValue placeholder="Firma seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Seçilmedi / Manuel Giriş</SelectItem>
                        {companies.map((company) => (
                          <SelectItem key={company.id} value={company.id}>
                            {company.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Manuel firma girişi - kayıtlı firma seçilmediyse göster */}
                  {!formData.companyId && (
                    <div className="space-y-2">
                      <Label htmlFor="companyName">
                        Manuel Firma Adı
                        <span className="text-xs text-slate-400 ml-2">(kayıtlı değilse)</span>
                      </Label>
                      <Input
                        id="companyName"
                        value={formData.companyName}
                        onChange={(e) => handleChange("companyName", e.target.value)}
                        placeholder="Firma adını yazın..."
                        className="border-slate-300"
                      />
                      <p className="text-xs text-slate-500">
                        Kayıtlı firmalar arasında yoksa manuel olarak firma adı girebilirsiniz.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Lot/Serial */}
              {(selectedItem.tracking?.hasLotTracking ||
                selectedItem.tracking?.hasSerialTracking) && (
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
                    placeholder="Çıkış ile ilgili notlar..."
                    rows={3}
                    className="border-slate-300"
                  />
                </CardContent>
              </Card>

              {/* Finance Integration */}
              {showFinanceSection && (
                <Card className="bg-white border-emerald-200">
                  <CardHeader className="border-b border-slate-100">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-slate-900">
                        <CircleDollarSign className="h-5 w-5 text-emerald-600" />
                        Finans Kaydı
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="createFinanceRecord"
                          checked={formData.createFinanceRecord}
                          onCheckedChange={(checked) => handleChange("createFinanceRecord", checked)}
                        />
                        <Label htmlFor="createFinanceRecord" className="text-sm cursor-pointer">
                          Gelir kaydı oluştur
                        </Label>
                      </div>
                    </div>
                    <CardDescription className="text-slate-500">
                      Satış için otomatik finans gelir kaydı oluşturulur
                    </CardDescription>
                  </CardHeader>
                  
                  {formData.createFinanceRecord && (
                    <CardContent className="pt-6 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="financeUnitPrice">Finans Birim Fiyatı</Label>
                          <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                                {getCurrencySymbol(formData.financeCurrency)}
                              </span>
                              <Input
                                id="financeUnitPrice"
                                type="number"
                                min="0"
                                step="0.01"
                                value={formData.financeUnitPrice || formData.unitPrice}
                                onChange={(e) => handleChange("financeUnitPrice", e.target.value)}
                                placeholder="0.00"
                                className="border-slate-300 pl-8"
                              />
                            </div>
                          </div>
                          <p className="text-xs text-slate-500">
                            Stok fiyatından farklı ise değiştirebilirsiniz
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="financeAccount">Hesap *</Label>
                          <Select
                            value={formData.financeAccountId}
                            onValueChange={(v) => handleChange("financeAccountId", v)}
                          >
                            <SelectTrigger className="border-slate-300">
                              <SelectValue placeholder="Hesap seçin" />
                            </SelectTrigger>
                            <SelectContent>
                              {financeAccounts.map((account) => (
                                <SelectItem key={account.id} value={account.id}>
                                  <div className="flex items-center gap-2">
                                    <Wallet className="h-3 w-3 text-slate-400" />
                                    {account.name}
                                    <span className="text-xs text-slate-400">
                                      ({getCurrencySymbol(account.currency)})
                                    </span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {/* Para birimi uyuşmazlık uyarısı */}
                          {formData.financeAccountId && (() => {
                            const selectedAccount = financeAccounts.find(a => a.id === formData.financeAccountId);
                            const accountCurrency = selectedAccount?.currency;
                            const isMultiCurrency = selectedAccount?.mode === 'multi';
                            const supportedCurrencies = selectedAccount?.supportedCurrencies || [];
                            
                            // Çoklu döviz hesabı veya aynı para birimi ise uyarı gösterme
                            if (isMultiCurrency && supportedCurrencies.includes(formData.financeCurrency)) return null;
                            if (accountCurrency === formData.financeCurrency) return null;
                            
                            return (
                              <p className="text-xs text-amber-600 flex items-center gap-1 mt-1">
                                <AlertTriangle className="h-3 w-3" />
                                Hesap para birimi ({getCurrencySymbol(accountCurrency)}) ile işlem para birimi ({getCurrencySymbol(formData.financeCurrency)}) farklı
                              </p>
                            );
                          })()}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="financeNotes">Finans Notu (Opsiyonel)</Label>
                        <Input
                          id="financeNotes"
                          value={formData.financeNotes}
                          onChange={(e) => handleChange("financeNotes", e.target.value)}
                          placeholder="Finans kaydı için ek not..."
                          className="border-slate-300"
                        />
                      </div>

                      {/* Finance Summary */}
                      {financeTotal > 0 && (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-emerald-700">
                                Finansa Kaydedilecek Gelir
                              </p>
                              <p className="text-xs text-emerald-600">
                                Kategori: {getIncomeCategoryLabel(SUBTYPE_TO_FINANCE_CATEGORY[formData.subtype])}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-emerald-700">
                                {getCurrencySymbol(formData.financeCurrency)}
                                {new Intl.NumberFormat("tr-TR", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                }).format(financeTotal)}
                              </p>
                              <p className="text-xs text-emerald-600">
                                {Number(formData.quantity) || 0} × {getCurrencySymbol(formData.financeCurrency)}
                                {new Intl.NumberFormat("tr-TR").format(financeUnitPrice)}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  )}
                </Card>
              )}

              {/* Summary */}
              <Card className={`${isOverStock ? "bg-red-50 border-red-200" : "bg-red-50 border-red-200"}`}>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${isOverStock ? "bg-red-200" : "bg-red-100"}`}>
                        <ArrowUpFromLine className={`h-5 w-5 ${isOverStock ? "text-red-700" : "text-red-600"}`} />
                      </div>
                      <div>
                        <p className={`font-medium ${isOverStock ? "text-red-800" : "text-red-900"}`}>
                          {requestedQuantity || 0} {UNIT_LABELS[selectedItem.stock?.unit]} çıkış
                          yapılacak
                        </p>
                        <p className={`text-sm ${isOverStock ? "text-red-700" : "text-red-700"}`}>
                          Kalan stok: {Math.max(0, availableStock - requestedQuantity)}{" "}
                          {UNIT_LABELS[selectedItem.stock?.unit]}
                        </p>
                      </div>
                    </div>
                    {formData.unitPrice && formData.quantity && (
                      <div className="text-right">
                        <p className="text-sm text-red-700">Toplam Değer</p>
                        <p className="font-semibold text-red-900">
                          {getCurrencySymbol(formData.financeCurrency)}
                          {new Intl.NumberFormat("tr-TR", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }).format(Number(formData.unitPrice) * requestedQuantity)}
                        </p>
                        <p className="text-xs text-red-600">
                          {requestedQuantity} × {getCurrencySymbol(formData.financeCurrency)}
                          {new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2 }).format(Number(formData.unitPrice) || 0)}
                        </p>
                      </div>
                    )}
                  </div>
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
              disabled={saving || !selectedItem || !formData.quantity || isOverStock}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  İşleniyor...
                </>
              ) : (
                <>
                  <ArrowUpFromLine className="h-4 w-4 mr-2" />
                  Çıkış Yap
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
