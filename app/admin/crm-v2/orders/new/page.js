"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAdminAuth } from "../../../../../hooks/use-admin-auth";
import { useToast } from "../../../../../hooks/use-toast";
import {
  createOrder,
  createOrderFromCase,
  createOrderFromProforma,
  getCase,
  getCustomer,
  ORDER_TYPE,
  ORDER_STATUS,
  ORDER_PRIORITY,
  PRODUCTION_STAGE,
  getOrderTypeLabel,
  getOrderTypeColor,
  getOrderTypeIcon,
  getOrderPriorityLabel,
  getStagesForOrderType,
  mapCaseTypeToOrderType,
  PRODUCTION_CATEGORIES,
  getProductionCategoryLabel,
} from "../../../../../lib/services/crm-v2";
import { ProformaService } from "../../../../../lib/services/proforma-service";
import { format, addDays } from "date-fns";
import { cn } from "../../../../../lib/utils";

// Selector Components
import { ProformaSelector, ProformaSummaryCard } from "../../../../../components/admin/crm-v2/proforma-selector";
import { ContractSelector, ContractSummaryCard } from "../../../../../components/admin/crm-v2/contract-selector";
import { FormulaSelector, FormulaSummaryCard } from "../../../../../components/admin/crm-v2/formula-selector";
import { CustomerAutocomplete, CustomerSelector, CustomerSummaryCard, CreateCustomerModal } from "../../../../../components/admin/crm-v2/customer-selector";
import { ProductionDetailsForm } from "../../../../../components/admin/crm-v2/production-workflow";
import { findCustomerByContact, createCustomer } from "../../../../../lib/services/crm-v2/customer-service";
import { CUSTOMER_TYPE, PRIORITY } from "../../../../../lib/services/crm-v2/schema";

// UI Components
import { Button } from "../../../../../components/ui/button";
import { Input } from "../../../../../components/ui/input";
import { Badge } from "../../../../../components/ui/badge";
import { Textarea } from "../../../../../components/ui/textarea";
import { Label } from "../../../../../components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../../../../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../../components/ui/select";
import { Skeleton } from "../../../../../components/ui/skeleton";
import { Separator } from "../../../../../components/ui/separator";

// Icons
import {
  ArrowLeft,
  Factory,
  Package,
  Briefcase,
  FileText,
  Plus,
  Trash2,
  Save,
  Building2,
  User,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  Percent,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  FileSignature,
  FlaskConical,
  Link2,
  Search,
  Loader2,
} from "lucide-react";

export default function NewOrderPage() {
  const { user, loading: authLoading } = useAdminAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  // URL params
  const caseId = searchParams.get("caseId");
  const proformaIdFromUrl = searchParams.get("proformaId");

  // Modal states
  const [showProformaSelector, setShowProformaSelector] = useState(false);
  const [showContractSelector, setShowContractSelector] = useState(false);
  const [showFormulaSelector, setShowFormulaSelector] = useState(false);
  const [showCustomerSelector, setShowCustomerSelector] = useState(false);
  const [showCreateCustomerModal, setShowCreateCustomerModal] = useState(false);

  // Data states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [caseData, setCaseData] = useState(null);
  const [selectedProforma, setSelectedProforma] = useState(null);
  const [selectedContract, setSelectedContract] = useState(null);
  const [selectedFormula, setSelectedFormula] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [checkingCustomer, setCheckingCustomer] = useState(false);
  const [customerMatch, setCustomerMatch] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    type: ORDER_TYPE.PRODUCTION,
    priority: ORDER_PRIORITY.NORMAL,
    productionCategory: PRODUCTION_CATEGORIES?.COSMETIC || "cosmetic",
    customer: {
      companyName: "",
      contactName: "",
      email: "",
      phone: "",
    },
    items: [],
    currency: "TRY",
    subtotal: 0,
    taxRate: 20,
    discountRate: 0,
    total: 0,
    advanceRate: 50,
    paymentTerms: "",
    estimatedDeliveryDate: "",
    notes: "",
    internalNotes: "",
    // Production specific
    production: {
      batchNumber: "",
      lotNumber: "",
      formulaId: null,
      formulaName: null,
      plannedQuantity: 0,
      fillVolume: "",
      packaging: {
        type: "",
        material: "",
        capacity: "",
        color: "",
        supplierName: "",
        notes: "",
        approved: false,
      },
      label: {
        designerName: "",
        notes: "",
        approved: false,
        printReady: false,
      },
      box: {
        required: false,
        dimensions: "",
        material: "",
        notes: "",
        approved: false,
      },
    },
  });

  // Load case and proforma if provided
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Case'den yükle
        if (caseId) {
          const caseResult = await getCase(caseId);
          if (caseResult) {
            setCaseData(caseResult);
            
            const orderType = mapCaseTypeToOrderType(caseResult.type);
            
            let customerInfo = {
              companyName: caseResult.contactName || "",
              contactName: caseResult.contactName || "",
              email: caseResult.contactEmail || "",
              phone: caseResult.contactPhone || "",
            };
            
            if (caseResult.customerId) {
              const customer = await getCustomer(caseResult.customerId);
              if (customer) {
                customerInfo = {
                  companyName: customer.company || customer.name || "",
                  contactName: customer.name || "",
                  email: customer.email || "",
                  phone: customer.phone || "",
                };
              }
            }
            
            setFormData(prev => ({
              ...prev,
              type: orderType,
              priority: caseResult.priority || ORDER_PRIORITY.NORMAL,
              customer: customerInfo,
              notes: caseResult.description || "",
            }));
          }
        }
        
        // Proforma'dan yükle
        if (proformaIdFromUrl) {
          const proformaResult = await ProformaService.getProforma(proformaIdFromUrl);
          if (proformaResult) {
            handleProformaSelect(proformaResult);
          }
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (!authLoading && user) {
      loadData();
    }
  }, [authLoading, user, caseId, proformaIdFromUrl]);

  // Handle proforma selection
  const handleProformaSelect = (proforma) => {
    setSelectedProforma(proforma);
    
    // Proforma'dan item ve fiyat bilgilerini aktar
    const items = (proforma.services || []).map((service, index) => ({
      id: `item_${Date.now()}_${index}`,
      name: service.name || "",
      description: service.description || "",
      quantity: service.quantity || 1,
      unit: service.unit || "Adet",
      unitPrice: service.unitPrice || 0,
      total: (service.quantity || 1) * (service.unitPrice || 0),
    }));
    
    setFormData(prev => ({
      ...prev,
      items,
      currency: proforma.currency || "TRY",
      taxRate: proforma.taxRate ?? 20,
      discountRate: proforma.discountRate || 0,
      customer: {
        companyName: proforma.customerInfo?.companyName || prev.customer.companyName,
        contactName: proforma.customerInfo?.contactPerson || prev.customer.contactName,
        email: proforma.customerInfo?.email || prev.customer.email,
        phone: proforma.customerInfo?.phone || prev.customer.phone,
      },
    }));
  };

  // Handle contract selection
  const handleContractSelect = (contract) => {
    setSelectedContract(contract);
    
    // Kontrat firma bilgilerini aktar (müşteri henüz girilmemişse)
    if (!formData.customer.companyName && contract.companyName) {
      setFormData(prev => ({
        ...prev,
        customer: {
          ...prev.customer,
          companyName: contract.companyName,
        },
      }));
    }
  };

  // Handle customer selection from CRM
  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
    setCustomerMatch(null); // Clear any match warning
    
    if (customer) {
      setFormData(prev => ({
        ...prev,
        customer: {
          companyName: customer.company?.name || customer.name || "",
          contactName: customer.name || "",
          email: customer.email || "",
          phone: customer.phone || "",
        },
      }));
    }
  };
  
  // Handle customer created (yeni müşteri oluşturulduğunda)
  const handleCustomerCreated = (customer) => {
    handleCustomerSelect(customer);
    setShowCreateCustomerModal(false);
  };
  
  // Check if manual customer data matches existing CRM customer
  const checkCustomerMatch = async () => {
    const { email, phone } = formData.customer;
    
    if (!email && !phone) {
      setCustomerMatch(null);
      return;
    }
    
    setCheckingCustomer(true);
    try {
      const existingCustomer = await findCustomerByContact(email || null, phone || null);
      setCustomerMatch(existingCustomer);
    } catch (error) {
      console.error("Error checking customer match:", error);
    } finally {
      setCheckingCustomer(false);
    }
  };
  
  // Use matched customer
  const handleUseMatchedCustomer = () => {
    if (customerMatch) {
      handleCustomerSelect(customerMatch);
    }
  };
  
  // Create new customer from form data
  const handleCreateNewCustomer = async () => {
    const { companyName, contactName, email, phone } = formData.customer;
    
    if (!companyName && !contactName) return null;
    
    try {
      const customerData = {
        name: contactName || companyName,
        companyName: companyName,
        email: email,
        phone: phone,
        type: CUSTOMER_TYPE.LEAD,
        priority: PRIORITY.NORMAL,
      };
      
      const newCustomer = await createCustomer(customerData);
      setSelectedCustomer(newCustomer);
      return newCustomer;
    } catch (error) {
      console.error("Error creating customer:", error);
      return null;
    }
  };

  // Handle formula selection
  const handleFormulaSelect = (formula) => {
    setSelectedFormula(formula);
    
    setFormData(prev => ({
      ...prev,
      production: {
        ...prev.production,
        formulaId: formula.id,
        formulaName: formula.productName || formula.name,
      },
    }));
  };

  // Calculate totals when items change
  const calculateTotals = useCallback(() => {
    const subtotal = formData.items.reduce((sum, item) => sum + (item.total || 0), 0);
    const discountAmount = subtotal * formData.discountRate / 100;
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = taxableAmount * formData.taxRate / 100;
    const total = taxableAmount + taxAmount;
    const advanceAmount = total * formData.advanceRate / 100;
    
    return {
      subtotal,
      discountAmount,
      taxAmount,
      total: Math.round(total),
      advanceAmount: Math.round(advanceAmount),
      balanceAmount: Math.round(total - advanceAmount),
    };
  }, [formData.items, formData.taxRate, formData.discountRate, formData.advanceRate]);

  // Update item
  const updateItem = (itemId, field, value) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === itemId) {
          const updated = { ...item, [field]: value };
          if (field === "quantity" || field === "unitPrice") {
            updated.total = (updated.quantity || 0) * (updated.unitPrice || 0);
          }
          return updated;
        }
        return item;
      }),
    }));
  };

  // Add item
  const addItem = () => {
    const newItem = {
      id: `item_${Date.now()}`,
      name: "",
      description: "",
      quantity: 1,
      unit: "Adet",
      unitPrice: 0,
      total: 0,
    };
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
  };

  // Remove item
  const removeItem = (itemId) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId),
    }));
  };

  // Handle submit
  const handleSubmit = async () => {
    // Validation
    if (!formData.customer.companyName) {
      toast({ title: "Hata", description: "Firma adı zorunludur.", variant: "destructive" });
      return;
    }
    if (formData.items.length === 0) {
      toast({ title: "Hata", description: "En az bir ürün/hizmet ekleyin.", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const totals = calculateTotals();
      
      // Müşteri ID belirleme: Seçili CRM müşterisi varsa onu kullan
      // Yoksa ve manuel girilmişse, önce eşleşme kontrol et
      let customerId = selectedCustomer?.id || null;
      
      // Eğer CRM müşterisi seçilmediyse ve manuel bilgi girildiyse
      if (!customerId && (formData.customer.email || formData.customer.phone)) {
        // Eşleşen müşteri varsa kullan
        if (customerMatch) {
          customerId = customerMatch.id;
        } else {
          // Yoksa yeni müşteri oluştur
          const newCustomer = await handleCreateNewCustomer();
          if (newCustomer) {
            customerId = newCustomer.id;
          }
        }
      }
      
      const orderData = {
        ...formData,
        ...totals,
        caseId: caseId || null,
        proformaId: selectedProforma?.id || null,
        proformaNumber: selectedProforma?.proformaNumber || null,
        contractId: selectedContract?.id || null,
        contractNumber: selectedContract?.contractNumber || null,
        customerId: customerId || caseData?.customerId || selectedProforma?.customerId || null,
        companyId: selectedContract?.companyId || selectedProforma?.companyId || null,
        formulaId: selectedFormula?.id || formData.production?.formulaId || null,
        formulaName: selectedFormula?.productName || selectedFormula?.name || formData.production?.formulaName || null,
        estimatedDeliveryDate: formData.estimatedDeliveryDate 
          ? new Date(formData.estimatedDeliveryDate) 
          : null,
      };

      const result = await createOrder(orderData, user?.uid);
      
      if (result.success) {
        toast({ 
          title: "Başarılı", 
          description: `Sipariş ${result.orderNumber} oluşturuldu.` 
        });
        router.push(`/admin/crm-v2/orders/${result.id}`);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Error creating order:", error);
      toast({ 
        title: "Hata", 
        description: "Sipariş oluşturulamadı.", 
        variant: "destructive" 
      });
    } finally {
      setSaving(false);
    }
  };

  // Get icon component
  const getIconComponent = (type) => {
    const icons = {
      [ORDER_TYPE.PRODUCTION]: Factory,
      [ORDER_TYPE.SUPPLY]: Package,
      [ORDER_TYPE.SERVICE]: Briefcase,
    };
    return icons[type] || FileText;
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: formData.currency,
    }).format(amount || 0);
  };

  const totals = calculateTotals();

  if (authLoading || loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-48" />
            <Skeleton className="h-64" />
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Yeni Sipariş</h1>
          {caseData && (
            <p className="text-slate-500 text-sm mt-0.5">
              Case #{caseData.caseNumber} üzerinden oluşturuluyor
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Type Selection */}
          <Card className="bg-white border-slate-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Sipariş Türü</CardTitle>
              <CardDescription>Siparişin türünü seçin</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {Object.values(ORDER_TYPE).map((type) => {
                  const IconComponent = getIconComponent(type);
                  const isSelected = formData.type === type;
                  return (
                    <button
                      key={type}
                      onClick={() => setFormData(prev => ({ ...prev, type }))}
                      className={cn(
                        "p-4 rounded-lg border-2 transition-all text-left",
                        isSelected
                          ? "border-blue-500 bg-blue-50"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      )}
                    >
                      <IconComponent className={cn(
                        "h-6 w-6 mb-2",
                        isSelected ? "text-blue-600" : "text-slate-400"
                      )} />
                      <div className={cn(
                        "font-medium",
                        isSelected ? "text-blue-900" : "text-slate-700"
                      )}>
                        {getOrderTypeLabel(type)}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Production Category (only for production orders) */}
              {formData.type === ORDER_TYPE.PRODUCTION && PRODUCTION_CATEGORIES && (
                <div className="mt-4 pt-4 border-t">
                  <Label className="text-sm font-medium">Üretim Kategorisi</Label>
                  <Select
                    value={formData.productionCategory}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, productionCategory: value }))}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(PRODUCTION_CATEGORIES).map(cat => (
                        <SelectItem key={cat} value={cat}>
                          {getProductionCategoryLabel ? getProductionCategoryLabel(cat) : cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Linked Documents Section */}
          <Card className="bg-white border-slate-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Link2 className="h-4 w-4" />
                Bağlı Belgeler
              </CardTitle>
              <CardDescription>
                Siparişe proforma, kontrat veya formül bağlayın
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Proforma */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Proforma</Label>
                {selectedProforma ? (
                  <ProformaSummaryCard 
                    proforma={selectedProforma}
                    onRemove={() => {
                      setSelectedProforma(null);
                      setFormData(prev => ({ ...prev, items: [] }));
                    }}
                  />
                ) : (
                  <Button
                    variant="outline"
                    className="w-full h-16 border-dashed"
                    onClick={() => setShowProformaSelector(true)}
                  >
                    <FileText className="h-5 w-5 mr-2 text-blue-600" />
                    Proforma Seç
                  </Button>
                )}
              </div>

              {/* Contract */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Kontrat</Label>
                {selectedContract ? (
                  <ContractSummaryCard 
                    contract={selectedContract}
                    onRemove={() => setSelectedContract(null)}
                  />
                ) : (
                  <Button
                    variant="outline"
                    className="w-full h-16 border-dashed"
                    onClick={() => setShowContractSelector(true)}
                  >
                    <FileSignature className="h-5 w-5 mr-2 text-emerald-600" />
                    Kontrat Seç
                  </Button>
                )}
              </div>

              {/* Formula (only for production) */}
              {formData.type === ORDER_TYPE.PRODUCTION && (
                <div>
                  <Label className="text-sm font-medium mb-2 block">Formül</Label>
                  {selectedFormula ? (
                    <FormulaSummaryCard 
                      formula={selectedFormula}
                      onRemove={() => {
                        setSelectedFormula(null);
                        setFormData(prev => ({
                          ...prev,
                          production: {
                            ...prev.production,
                            formulaId: null,
                            formulaName: null,
                          }
                        }));
                      }}
                    />
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full h-16 border-dashed"
                      onClick={() => setShowFormulaSelector(true)}
                    >
                      <FlaskConical className="h-5 w-5 mr-2 text-purple-600" />
                      Formül Seç
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Customer Info */}
          <Card className="bg-white border-slate-200">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Müşteri Bilgileri
                </CardTitle>
                {!selectedCustomer && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCustomerSelector(true)}
                  >
                    <Search className="h-4 w-4 mr-1" />
                    CRM&apos;den Seç
                  </Button>
                )}
              </div>
              <CardDescription>
                CRM&apos;den mevcut müşteri seçin veya manuel olarak girin.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Seçili CRM Müşterisi */}
              {selectedCustomer && (
                <CustomerSummaryCard
                  customer={selectedCustomer}
                  onRemove={() => {
                    setSelectedCustomer(null);
                    setFormData(prev => ({
                      ...prev,
                      customer: {
                        companyName: "",
                        contactName: "",
                        email: "",
                        phone: "",
                      },
                    }));
                  }}
                />
              )}
              
              {/* Eşleşme Uyarısı */}
              {!selectedCustomer && customerMatch && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-amber-800">
                        Bu iletişim bilgisiyle kayıtlı müşteri bulundu!
                      </p>
                      <div className="mt-2 p-2 bg-white rounded border border-amber-100">
                        <div className="font-medium text-sm">
                          {customerMatch.company?.name || customerMatch.name}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {customerMatch.email} {customerMatch.phone && `• ${customerMatch.phone}`}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        className="mt-2"
                        onClick={handleUseMatchedCustomer}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Bu Müşteriyi Kullan
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Firma Adı *</Label>
                  <Input
                    value={formData.customer.companyName}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      customer: { ...prev.customer, companyName: e.target.value }
                    }))}
                    placeholder="Firma adı"
                    className="mt-1.5 bg-white"
                    disabled={!!selectedCustomer}
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">Yetkili Kişi</Label>
                  <Input
                    value={formData.customer.contactName}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      customer: { ...prev.customer, contactName: e.target.value }
                    }))}
                    placeholder="Ad Soyad"
                    className="mt-1.5 bg-white"
                    disabled={!!selectedCustomer}
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">E-posta</Label>
                  <div className="relative">
                    <Input
                      type="email"
                      value={formData.customer.email}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        customer: { ...prev.customer, email: e.target.value }
                      }))}
                      onBlur={checkCustomerMatch}
                      placeholder="email@firma.com"
                      className="mt-1.5 bg-white"
                      disabled={!!selectedCustomer}
                    />
                    {checkingCustomer && (
                      <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-slate-400 mt-0.75" />
                    )}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Telefon</Label>
                  <div className="relative">
                    <Input
                      value={formData.customer.phone}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        customer: { ...prev.customer, phone: e.target.value }
                      }))}
                      onBlur={checkCustomerMatch}
                      placeholder="+90 5XX XXX XX XX"
                      className="mt-1.5 bg-white"
                      disabled={!!selectedCustomer}
                    />
                    {checkingCustomer && (
                      <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-slate-400 mt-0.75" />
                    )}
                  </div>
                </div>
              </div>
              
              {/* Yeni Müşteri Oluştur Butonu */}
              {!selectedCustomer && formData.customer.companyName && !customerMatch && (
                <div className="pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => setShowCreateCustomerModal(true)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    CRM&apos;e Yeni Müşteri Olarak Kaydet
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Items */}
          <Card className="bg-white border-slate-200">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Ürün / Hizmetler</CardTitle>
                <Button variant="outline" size="sm" onClick={addItem}>
                  <Plus className="h-4 w-4 mr-1" />
                  Ekle
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.items.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                  <p>Henüz ürün/hizmet eklenmedi</p>
                  <p className="text-sm mt-1">Proforma seçerek veya manuel ekleyebilirsiniz</p>
                  <div className="flex items-center justify-center gap-2 mt-4">
                    <Button variant="outline" size="sm" onClick={() => setShowProformaSelector(true)}>
                      <FileText className="h-4 w-4 mr-1" />
                      Proforma Seç
                    </Button>
                    <Button variant="outline" size="sm" onClick={addItem}>
                      <Plus className="h-4 w-4 mr-1" />
                      Manuel Ekle
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {formData.items.map((item, index) => (
                    <div key={item.id} className="p-4 border border-slate-200 rounded-lg bg-slate-50">
                      <div className="flex items-start gap-4">
                        <div className="flex-1 space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label className="text-xs text-slate-500">Ürün/Hizmet Adı</Label>
                              <Input
                                value={item.name}
                                onChange={(e) => updateItem(item.id, "name", e.target.value)}
                                placeholder="Ürün adı"
                                className="mt-1 bg-white"
                              />
                            </div>
                            <div>
                              <Label className="text-xs text-slate-500">Birim</Label>
                              <Input
                                value={item.unit}
                                onChange={(e) => updateItem(item.id, "unit", e.target.value)}
                                placeholder="Adet"
                                className="mt-1 bg-white"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            <div>
                              <Label className="text-xs text-slate-500">Miktar</Label>
                              <Input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => updateItem(item.id, "quantity", Number(e.target.value))}
                                min="0"
                                className="mt-1 bg-white"
                              />
                            </div>
                            <div>
                              <Label className="text-xs text-slate-500">Birim Fiyat</Label>
                              <Input
                                type="number"
                                value={item.unitPrice}
                                onChange={(e) => updateItem(item.id, "unitPrice", Number(e.target.value))}
                                min="0"
                                className="mt-1 bg-white"
                              />
                            </div>
                            <div>
                              <Label className="text-xs text-slate-500">Toplam</Label>
                              <div className="mt-1 h-10 px-3 flex items-center bg-white border border-slate-200 rounded-md font-medium">
                                {formatCurrency(item.total)}
                              </div>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-slate-400 hover:text-red-500 mt-6"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Production Details (only for production orders) */}
          {formData.type === ORDER_TYPE.PRODUCTION && (
            <Card className="bg-white border-slate-200">
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <Factory className="h-4 w-4" />
                  Üretim Detayları
                </CardTitle>
                <CardDescription>
                  Ambalaj, etiket, kutu ve üretim bilgilerini girin
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProductionDetailsForm
                  production={formData.production}
                  onChange={(production) => setFormData(prev => ({ ...prev, production }))}
                  onFormulaSelect={() => setShowFormulaSelector(true)}
                  currentStage={PRODUCTION_STAGE.FORMULA_SELECTION}
                  disabled={true}
                />
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          <Card className="bg-white border-slate-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Notlar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Müşteri Notu</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Müşteriye görünür notlar..."
                  rows={3}
                  className="mt-1.5 bg-white"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Dahili Not</Label>
                <Textarea
                  value={formData.internalNotes}
                  onChange={(e) => setFormData(prev => ({ ...prev, internalNotes: e.target.value }))}
                  placeholder="Sadece ekip içi notlar..."
                  rows={2}
                  className="mt-1.5 bg-white"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Summary & Settings */}
        <div className="space-y-6">
          {/* Priority & Date */}
          <Card className="bg-white border-slate-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Sipariş Ayarları</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Öncelik</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger className="mt-1.5 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(ORDER_PRIORITY).map(priority => (
                      <SelectItem key={priority} value={priority}>
                        {getOrderPriorityLabel(priority)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium">Tahmini Teslim Tarihi</Label>
                <Input
                  type="date"
                  value={formData.estimatedDeliveryDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimatedDeliveryDate: e.target.value }))}
                  min={format(new Date(), "yyyy-MM-dd")}
                  className="mt-1.5 bg-white"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Para Birimi</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}
                >
                  <SelectTrigger className="mt-1.5 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TRY">TRY - Türk Lirası</SelectItem>
                    <SelectItem value="USD">USD - Amerikan Doları</SelectItem>
                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Financial */}
          <Card className="bg-white border-slate-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Finansal Özet
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Ara Toplam</span>
                  <span className="font-medium">{formatCurrency(totals.subtotal)}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 flex-1">İndirim (%)</span>
                  <Input
                    type="number"
                    value={formData.discountRate}
                    onChange={(e) => setFormData(prev => ({ ...prev, discountRate: Number(e.target.value) }))}
                    min="0"
                    max="100"
                    className="w-20 h-8 text-right bg-white"
                  />
                </div>
                {totals.discountAmount > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>İndirim</span>
                    <span>-{formatCurrency(totals.discountAmount)}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 flex-1">KDV (%)</span>
                  <Input
                    type="number"
                    value={formData.taxRate}
                    onChange={(e) => setFormData(prev => ({ ...prev, taxRate: Number(e.target.value) }))}
                    min="0"
                    max="100"
                    className="w-20 h-8 text-right bg-white"
                  />
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">KDV</span>
                  <span>{formatCurrency(totals.taxAmount)}</span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between text-base font-bold">
                  <span>Genel Toplam</span>
                  <span>{formatCurrency(totals.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Terms */}
          <Card className="bg-white border-slate-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Percent className="h-4 w-4" />
                Ödeme Planı
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Avans Oranı (%)</Label>
                <Input
                  type="number"
                  value={formData.advanceRate}
                  onChange={(e) => setFormData(prev => ({ ...prev, advanceRate: Number(e.target.value) }))}
                  min="0"
                  max="100"
                  className="mt-1.5 bg-white"
                />
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between p-2 bg-amber-50 rounded-md">
                  <span className="text-amber-700">Avans</span>
                  <span className="font-medium text-amber-700">{formatCurrency(totals.advanceAmount)}</span>
                </div>
                <div className="flex justify-between p-2 bg-blue-50 rounded-md">
                  <span className="text-blue-700">Bakiye</span>
                  <span className="font-medium text-blue-700">{formatCurrency(totals.balanceAmount)}</span>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Ödeme Koşulları</Label>
                <Textarea
                  value={formData.paymentTerms}
                  onChange={(e) => setFormData(prev => ({ ...prev, paymentTerms: e.target.value }))}
                  placeholder="Ödeme koşulları..."
                  rows={2}
                  className="mt-1.5 bg-white"
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card className="bg-white border-slate-200">
            <CardContent className="p-4">
              <Button
                className="w-full"
                onClick={handleSubmit}
                disabled={saving || formData.items.length === 0}
              >
                {saving ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Oluşturuluyor...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Sipariş Oluştur
                  </>
                )}
              </Button>
              
              <div className="text-xs text-center text-slate-500 mt-3 space-y-1">
                {selectedCustomer && (
                  <p className="text-blue-600">✓ CRM Müşterisi: {selectedCustomer.company?.name || selectedCustomer.name}</p>
                )}
                {caseData && (
                  <p>Case #{caseData.caseNumber} ile ilişkilendirilecek</p>
                )}
                {selectedProforma && (
                  <p>Proforma {selectedProforma.proformaNumber} ile ilişkilendirilecek</p>
                )}
                {selectedContract && (
                  <p>Kontrat {selectedContract.contractNumber} ile ilişkilendirilecek</p>
                )}
                {!selectedCustomer && formData.customer.companyName && (
                  <p className="text-amber-600">⚠ Yeni müşteri olarak kaydedilecek</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modals */}
      <ProformaSelector
        open={showProformaSelector}
        onClose={() => setShowProformaSelector(false)}
        onSelect={handleProformaSelect}
        selectedProformaId={selectedProforma?.id}
        companyId={selectedContract?.companyId}
      />

      <ContractSelector
        open={showContractSelector}
        onClose={() => setShowContractSelector(false)}
        onSelect={handleContractSelect}
        selectedContractId={selectedContract?.id}
      />

      <FormulaSelector
        open={showFormulaSelector}
        onClose={() => setShowFormulaSelector(false)}
        onSelect={handleFormulaSelect}
        selectedFormulaId={selectedFormula?.id}
      />
      
      <CustomerSelector
        open={showCustomerSelector}
        onClose={() => setShowCustomerSelector(false)}
        onSelect={handleCustomerSelect}
        selectedCustomerId={selectedCustomer?.id}
      />
      
      <CreateCustomerModal
        open={showCreateCustomerModal}
        onClose={() => setShowCreateCustomerModal(false)}
        onCustomerCreated={handleCustomerCreated}
        initialData={formData.customer.companyName ? {
          companyName: formData.customer.companyName,
          contactName: formData.customer.contactName,
          email: formData.customer.email,
          phone: formData.customer.phone,
        } : null}
      />
    </div>
  );
}
