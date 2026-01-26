"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useAdminAuth } from "../../../../../hooks/use-admin-auth";
import { useToast } from "../../../../../hooks/use-toast";
import {
  getOrder,
  updateOrder,
  updateOrderStatus,
  updateOrderStage,
  addPayment,
  deletePayment,
  deleteOrder,
  updateProductionDetails,
  updateChecklistItem,
  addChecklistItem,
  deleteChecklistItem,
  linkContractToOrder,
  linkProformaToOrder,
  updateFormulaInfo,
  updatePackagingInfo,
  updateLabelInfo,
  updateBoxInfo,
  ORDER_TYPE,
  ORDER_STATUS,
  PAYMENT_STATUS,
  ORDER_PRIORITY,
  PRODUCTION_STAGE,
  getOrderTypeLabel,
  getOrderTypeColor,
  getOrderStatusLabel,
  getOrderStatusColor,
  getOrderStatusDot,
  getPaymentStatusLabel,
  getPaymentStatusColor,
  getOrderPriorityLabel,
  getOrderPriorityColor,
  getStagesForOrderType,
  calculateStageProgress,
  calculateProductionProgress,
  calculateProductionGroupProgress,
  getProductionStageLabel,
  getSupplyStageLabel,
  getServiceStageLabel,
  PRODUCTION_STAGE_GROUPS,
} from "../../../../../lib/services/crm-v2";
import { formatDistanceToNow, format } from "date-fns";
import { tr } from "date-fns/locale";
import { cn } from "../../../../../lib/utils";

// Production Workflow Components
import { 
  ProductionWorkflowTimeline, 
  ProductionChecklist,
  ProductionDetailsForm 
} from "../../../../../components/admin/crm-v2/production-workflow";
import { ContractSelector, ContractSummaryCard } from "../../../../../components/admin/crm-v2/contract-selector";
import { ProformaSelector, ProformaSummaryCard } from "../../../../../components/admin/crm-v2/proforma-selector";
import { FormulaSelector, FormulaSummaryCard } from "../../../../../components/admin/crm-v2/formula-selector";

// UI Components
import { Button } from "../../../../../components/ui/button";
import { Input } from "../../../../../components/ui/input";
import { Badge } from "../../../../../components/ui/badge";
import { Textarea } from "../../../../../components/ui/textarea";
import { Label } from "../../../../../components/ui/label";
import { Progress } from "../../../../../components/ui/progress";
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../../../../components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../../../components/ui/dropdown-menu";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../../../components/ui/tabs";

// Icons
import {
  ArrowLeft,
  Factory,
  Package,
  Briefcase,
  FileText,
  Building2,
  User,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  MoreVertical,
  Edit,
  Save,
  X,
  Plus,
  Trash2,
  ArrowUpRight,
  CreditCard,
  Truck,
  FileCheck,
  History,
  ChevronRight,
  Circle,
  Check,
  FileSignature,
  FlaskConical,
  Link2,
  ClipboardList,
  Settings2,
} from "lucide-react";

export default function OrderDetailPage() {
  const { user, loading: authLoading } = useAdminAuth();
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const orderId = params.id;

  // State
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showContractSelector, setShowContractSelector] = useState(false);
  const [showProformaSelector, setShowProformaSelector] = useState(false);
  const [showFormulaSelector, setShowFormulaSelector] = useState(false);
  const [showProductionDetails, setShowProductionDetails] = useState(false);
  const [documentToRemove, setDocumentToRemove] = useState(null); // { type: 'proforma' | 'contract' | 'formula', name: string }
  const [removingDocument, setRemovingDocument] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amount: 0,
    method: "transfer",
    date: format(new Date(), "yyyy-MM-dd"),
    note: "",
  });

  // Load order
  const loadOrder = useCallback(async () => {
    if (!orderId) return;
    
    setLoading(true);
    try {
      const orderData = await getOrder(orderId);
      if (orderData) {
        setOrder(orderData);
      } else {
        toast({ title: "Hata", description: "Sipariş bulunamadı.", variant: "destructive" });
        router.push("/admin/crm-v2/orders");
      }
    } catch (error) {
      console.error("Error loading order:", error);
      toast({ title: "Hata", description: "Sipariş yüklenemedi.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [orderId, router, toast]);

  useEffect(() => {
    if (!authLoading && user) {
      loadOrder();
    }
  }, [authLoading, user, loadOrder]);

  // Format currency
  const formatCurrency = (amount, currency = "TRY") => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: currency || "TRY",
    }).format(amount || 0);
  };

  // Get stage label based on order type
  const getStageLabel = (stage) => {
    if (!order) return stage;
    switch (order.type) {
      case ORDER_TYPE.PRODUCTION:
        return getProductionStageLabel(stage);
      case ORDER_TYPE.SUPPLY:
        return getSupplyStageLabel(stage);
      case ORDER_TYPE.SERVICE:
        return getServiceStageLabel(stage);
      default:
        return stage;
    }
  };

  // Handle status change
  const handleStatusChange = async (newStatus) => {
    setSaving(true);
    try {
      const result = await updateOrderStatus(orderId, newStatus, user?.uid);
      if (result.success) {
        // Update local state instead of reloading
        setOrder(prev => ({
          ...prev,
          status: newStatus
        }));
        toast({ title: "Başarılı", description: "Durum güncellendi." });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({ title: "Hata", description: "Durum güncellenemedi.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  // Handle stage change
  const handleStageChange = async (newStage) => {
    setSaving(true);
    try {
      const result = await updateOrderStage(orderId, newStage, user?.uid);
      if (result.success) {
        // Update local state instead of reloading
        setOrder(prev => ({
          ...prev,
          currentStage: newStage,
          stageHistory: [
            ...(prev.stageHistory || []),
            {
              stage: newStage,
              timestamp: new Date(),
              userId: user?.uid
            }
          ]
        }));
        toast({ title: "Başarılı", description: "Aşama güncellendi." });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({ title: "Hata", description: "Aşama güncellenemedi.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  // Handle add payment
  const handleAddPayment = async () => {
    if (!paymentForm.amount || paymentForm.amount <= 0) {
      toast({ title: "Hata", description: "Geçerli bir tutar girin.", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const result = await addPayment(orderId, {
        ...paymentForm,
        date: new Date(paymentForm.date),
      }, user?.uid);
      
      if (result.success) {
        // Update local state instead of reloading
        const newPayment = {
          id: result.paymentId || Date.now().toString(),
          ...paymentForm,
          date: new Date(paymentForm.date),
          createdAt: new Date()
        };
        setOrder(prev => ({
          ...prev,
          payments: [...(prev.payments || []), newPayment]
        }));
        toast({ title: "Başarılı", description: "Ödeme kaydedildi." });
        setShowPaymentModal(false);
        setPaymentForm({ amount: 0, method: "transfer", date: format(new Date(), "yyyy-MM-dd"), note: "" });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({ title: "Hata", description: "Ödeme kaydedilemedi.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  // Handle delete payment
  const handleDeletePayment = async (paymentId) => {
    if (!confirm("Bu ödemeyi silmek istediğinizden emin misiniz?")) return;
    
    try {
      const result = await deletePayment(orderId, paymentId, user?.uid);
      if (result.success) {
        // Update local state instead of reloading
        setOrder(prev => ({
          ...prev,
          payments: (prev.payments || []).filter(p => p.id !== paymentId)
        }));
        toast({ title: "Başarılı", description: "Ödeme silindi." });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({ title: "Hata", description: "Ödeme silinemedi.", variant: "destructive" });
    }
  };

  // Handle contract link
  const handleContractSelect = async (contract) => {
    setSaving(true);
    try {
      const result = await linkContractToOrder(orderId, contract.id, contract.contractNumber, user?.uid);
      if (result.success) {
        // Update local state instead of reloading
        setOrder(prev => ({
          ...prev,
          contractId: contract.id,
          contractNumber: contract.contractNumber
        }));
        toast({ title: "Başarılı", description: "Kontrat bağlandı." });
        setShowContractSelector(false);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({ title: "Hata", description: "Kontrat bağlanamadı.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  // Handle proforma link
  const handleProformaSelect = async (proforma) => {
    setSaving(true);
    try {
      const result = await linkProformaToOrder(orderId, proforma, user?.uid);
      if (result.success) {
        // Update local state instead of reloading
        setOrder(prev => ({
          ...prev,
          proformaId: proforma.id,
          proformaNumber: proforma.proformaNumber,
          customer: proforma.customer || prev.customer,
          items: proforma.items || prev.items,
          total: proforma.total || prev.total,
          currency: proforma.currency || prev.currency
        }));
        toast({ title: "Başarılı", description: "Proforma bağlandı ve veriler aktarıldı." });
        setShowProformaSelector(false);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({ title: "Hata", description: "Proforma bağlanamadı.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  // Handle formula selection
  const handleFormulaSelect = async (formula) => {
    setSaving(true);
    try {
      const formulaData = {
        formulaId: formula.id,
        formulaName: formula.productName || formula.name,
        formulaCode: formula.formulaCode,
        category: formula.category,
        productType: formula.productType,
      };
      
      const result = await updateFormulaInfo(orderId, formulaData, user?.uid);
      
      if (result.success) {
        // Update local state instead of reloading
        setOrder(prev => ({
          ...prev,
          production: {
            ...(prev.production || {}),
            ...formulaData
          }
        }));
        toast({ title: "Başarılı", description: "Formül seçildi." });
        setShowFormulaSelector(false);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({ title: "Hata", description: "Formül seçilemedi.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  // Handle document removal
  const handleRemoveDocument = async () => {
    if (!documentToRemove) return;
    
    setRemovingDocument(true);
    try {
      let updates = {};
      
      switch (documentToRemove.type) {
        case 'proforma':
          updates = { proformaId: null, proformaNumber: null };
          break;
        case 'contract':
          updates = { contractId: null, contractNumber: null };
          break;
        case 'formula':
          updates = { 
            'production.formulaId': null, 
            'production.formulaName': null,
            'production.formulaCode': null,
            'production.category': null,
            'production.productType': null
          };
          break;
      }
      
      const result = await updateOrder(orderId, updates, user?.uid);
      
      if (result.success) {
        // Update local state
        if (documentToRemove.type === 'formula') {
          setOrder(prev => ({
            ...prev,
            production: {
              ...(prev.production || {}),
              formulaId: null,
              formulaName: null,
              formulaCode: null,
              category: null,
              productType: null
            }
          }));
        } else {
          setOrder(prev => ({
            ...prev,
            ...updates
          }));
        }
        toast({ title: "Başarılı", description: `${documentToRemove.name} bağlantısı kaldırıldı.` });
        setDocumentToRemove(null);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({ title: "Hata", description: "Belge bağlantısı kaldırılamadı.", variant: "destructive" });
    } finally {
      setRemovingDocument(false);
    }
  };

  // Handle checklist item update
  const handleChecklistUpdate = async (itemId, completed) => {
    try {
      const result = await updateChecklistItem(orderId, itemId, { completed }, user?.uid);
      if (result.success) {
        // Update local state instead of reloading
        setOrder(prev => ({
          ...prev,
          checklist: (prev.checklist || []).map(item => 
            item.id === itemId ? { ...item, completed } : item
          )
        }));
      }
    } catch (error) {
      toast({ title: "Hata", description: "Checklist güncellenemedi.", variant: "destructive" });
    }
  };

  // Handle production details update
  const handleProductionUpdate = async (updates) => {
    setSaving(true);
    try {
      const result = await updateProductionDetails(orderId, updates, user?.uid);
      if (result.success) {
        // Update local state directly instead of reloading
        setOrder(prev => ({
          ...prev,
          production: updates
        }));
        toast({ title: "Başarılı", description: "Üretim detayları güncellendi." });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({ title: "Hata", description: "Üretim detayları güncellenemedi.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  // Handle delete order
  const handleDeleteOrder = async () => {
    setDeleting(true);
    try {
      const result = await deleteOrder(orderId, user?.uid);
      if (result.success) {
        toast({ 
          title: "Başarılı", 
          description: `Sipariş ${order.orderNumber} başarıyla silindi.` 
        });
        setShowDeleteDialog(false);
        router.push("/admin/crm-v2/orders");
      } else {
        throw new Error(result.error || "Sipariş silinemedi");
      }
    } catch (error) {
      toast({ 
        title: "Hata", 
        description: error.message || "Sipariş silinirken bir hata oluştu.", 
        variant: "destructive" 
      });
    } finally {
      setDeleting(false);
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

  // Check if a production stage is completed based on production data
  const isStageCompletedFromProgress = (stage, production = {}) => {
    switch (stage) {
      case PRODUCTION_STAGE.FORMULA_SELECTION:
        return !!production?.formulaId;
      case PRODUCTION_STAGE.FORMULA_APPROVAL:
        return !!production?.formulaApproved;
      case PRODUCTION_STAGE.PACKAGING_DESIGN:
        return !!production?.packaging?.approved;
      case PRODUCTION_STAGE.LABEL_DESIGN:
        return !!production?.label?.approved;
      case PRODUCTION_STAGE.BOX_DESIGN:
        return !!production?.box?.approved || !production?.box?.required;
      case PRODUCTION_STAGE.DESIGN_APPROVAL:
        return !!production?.designsApproved;
      case PRODUCTION_STAGE.RAW_MATERIAL:
        return !!production?.supply?.rawMaterialReceived;
      case PRODUCTION_STAGE.PACKAGING_SUPPLY:
        return !!production?.supply?.packagingReceived;
      case PRODUCTION_STAGE.LABEL_SUPPLY:
        return !!production?.supply?.labelReceived;
      case PRODUCTION_STAGE.BOX_SUPPLY:
        return !!production?.supply?.boxReceived || !production?.box?.required;
      case PRODUCTION_STAGE.PRODUCTION_PLANNING:
        return !!production?.productionPlanned;
      case PRODUCTION_STAGE.PRODUCTION:
        return !!production?.productionCompleted;
      case PRODUCTION_STAGE.FILLING:
        return !!production?.fillingCompleted;
      case PRODUCTION_STAGE.QUALITY_CONTROL:
        return !!production?.qcApproved;
      case PRODUCTION_STAGE.LABELING:
        return !!production?.labelingCompleted;
      case PRODUCTION_STAGE.BOXING:
        return !!production?.boxingCompleted;
      case PRODUCTION_STAGE.FINAL_PACKAGING:
        return !!production?.finalPackagingCompleted;
      case PRODUCTION_STAGE.READY_FOR_DELIVERY:
        return !!production?.readyForDelivery;
      default:
        return false;
    }
  };

  // Calculate paid amount
  const getPaidAmount = () => {
    return (order?.payments || []).reduce((sum, p) => sum + (p.amount || 0), 0);
  };

  // Loading
  if (authLoading || loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-64" />
        </div>
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

  if (!order) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900">Sipariş bulunamadı</h3>
          <Button variant="outline" className="mt-4" onClick={() => router.push("/admin/crm-v2/orders")}>
            Siparişlere Dön
          </Button>
        </div>
      </div>
    );
  }

  const IconComponent = getIconComponent(order.type);
  const stages = getStagesForOrderType(order.type);
  
  // Production siparişleri için production objesine dayalı hesaplama kullan
  const productionProgressData = order.type === ORDER_TYPE.PRODUCTION 
    ? calculateProductionProgress(order.production) 
    : null;
  const productionGroupProgressData = order.type === ORDER_TYPE.PRODUCTION 
    ? calculateProductionGroupProgress(order.production) 
    : null;
  
  // Genel ilerleme yüzdesi: production için production verisi, diğerleri için eski yöntem
  const stageProgress = order.type === ORDER_TYPE.PRODUCTION 
    ? productionProgressData.percent 
    : calculateStageProgress(order.type, order.currentStage);
  
  const paidAmount = getPaidAmount();
  const remainingAmount = (order.total || 0) - paidAmount;
  const paymentProgress = order.total > 0 ? Math.round((paidAmount / order.total) * 100) : 0;
  const createdAt = order.createdAt?.toDate?.() || new Date(order.createdAt);

  // Type-based colors
  const typeColors = {
    [ORDER_TYPE.PRODUCTION]: {
      bg: "bg-violet-50",
      border: "border-violet-200",
      text: "text-violet-700",
      icon: "text-violet-600",
      badge: "bg-violet-100 text-violet-700",
    },
    [ORDER_TYPE.SUPPLY]: {
      bg: "bg-sky-50",
      border: "border-sky-200",
      text: "text-sky-700",
      icon: "text-sky-600",
      badge: "bg-sky-100 text-sky-700",
    },
    [ORDER_TYPE.SERVICE]: {
      bg: "bg-teal-50",
      border: "border-teal-200",
      text: "text-teal-700",
      icon: "text-teal-600",
      badge: "bg-teal-100 text-teal-700",
    },
  };
  const colors = typeColors[order.type] || typeColors[ORDER_TYPE.PRODUCTION];

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Compact Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.push("/admin/crm-v2/orders")}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              
              <div className="flex items-center gap-3">
                <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center", colors.bg)}>
                  <IconComponent className={cn("h-4 w-4", colors.icon)} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-lg font-semibold text-slate-900">{order.orderNumber}</h1>
                    <Badge variant="secondary" className={cn("text-xs font-normal", colors.badge)}>
                      {getOrderTypeLabel(order.type)}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500">
                    {order.customer?.companyName || "Müşteri belirlenmedi"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className={cn("text-xs", getOrderStatusColor(order.status))}>
                <span className={cn("h-1.5 w-1.5 rounded-full mr-1.5", getOrderStatusDot(order.status))} />
                {getOrderStatusLabel(order.status)}
              </Badge>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => router.push(`/admin/crm-v2/orders/${orderId}/edit`)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Düzenle
                  </DropdownMenuItem>
                  {order.caseId && (
                    <DropdownMenuItem onClick={() => router.push(`/admin/crm-v2/cases/${order.caseId}`)}>
                      <ArrowUpRight className="h-4 w-4 mr-2" />
                      Case'e Git
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="text-red-600 focus:text-red-600 focus:bg-red-50"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Siparişi Sil
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {/* Total */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                <DollarSign className="h-3.5 w-3.5" />
                Toplam Tutar
              </div>
              <p className="text-xl font-semibold text-slate-900">
                {formatCurrency(order.total, order.currency)}
              </p>
            </div>
            
            {/* Paid */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                <CheckCircle className="h-3.5 w-3.5" />
                Ödenen
              </div>
              <p className="text-xl font-semibold text-emerald-600">
                {formatCurrency(paidAmount, order.currency)}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">%{paymentProgress} tamamlandı</p>
            </div>
            
            {/* Remaining */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                <Clock className="h-3.5 w-3.5" />
                Kalan
              </div>
              <p className="text-xl font-semibold text-amber-600">
                {formatCurrency(remainingAmount, order.currency)}
              </p>
            </div>
            
            {/* Progress */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                <Factory className="h-3.5 w-3.5" />
                İlerleme
              </div>
              <p className="text-xl font-semibold text-slate-900">%{stageProgress}</p>
              <Progress value={stageProgress} className="h-1.5 mt-2" />
            </div>
          </div>

          {/* Tabs Content */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="bg-white border border-slate-200 p-1 h-auto">
              <TabsTrigger value="overview" className="text-sm px-4 py-2 data-[state=active]:bg-slate-900 data-[state=active]:text-white">
                Özet
              </TabsTrigger>
              {order.type === ORDER_TYPE.PRODUCTION && (
                <TabsTrigger value="production" className="text-sm px-4 py-2 data-[state=active]:bg-slate-900 data-[state=active]:text-white">
                  Üretim
                </TabsTrigger>
              )}
              <TabsTrigger value="documents" className="text-sm px-4 py-2 data-[state=active]:bg-slate-900 data-[state=active]:text-white">
                Belgeler
              </TabsTrigger>
              <TabsTrigger value="payments" className="text-sm px-4 py-2 data-[state=active]:bg-slate-900 data-[state=active]:text-white">
                Ödemeler
              </TabsTrigger>
              <TabsTrigger value="history" className="text-sm px-4 py-2 data-[state=active]:bg-slate-900 data-[state=active]:text-white">
                Geçmiş
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left - Order Details */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Stage Progress - Compact Group View */}
                  <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium text-slate-900">Sipariş Aşaması</h3>
                      <Badge variant="outline" className="text-xs">
                        %{stageProgress} tamamlandı
                      </Badge>
                    </div>
                    
                    {/* Progress Bar */}
                    <Progress value={stageProgress} className="h-2 mb-6" />
                    
                    {/* Stage Groups - Horizontal Compact */}
                    {order.type === ORDER_TYPE.PRODUCTION && PRODUCTION_STAGE_GROUPS ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {PRODUCTION_STAGE_GROUPS.map((group) => {
                          const groupStages = group.stages || [];
                          // Production verilerine dayalı grup progress kullan
                          const groupData = productionGroupProgressData?.[group.id] || { completed: 0, total: groupStages.length, isComplete: false };
                          const completedInGroup = groupData.completed;
                          const isCompletedGroup = groupData.isComplete;
                          // Aktif grup: en az 1 stage tamamlanmış ama hepsi değil
                          const isCurrentGroup = completedInGroup > 0 && !isCompletedGroup;
                          
                          // İlk tamamlanmamış stage'i bul (mevcut aşama olarak göster)
                          const firstIncompleteStage = !isCompletedGroup ? groupStages.find(stageId => {
                            const progress = productionProgressData;
                            // Bu stage tamamlanmış mı kontrol et
                            return !isStageCompletedFromProgress(stageId, order.production);
                          }) : null;

                          return (
                            <div
                              key={group.id}
                              className={cn(
                                "p-3 rounded-lg border transition-all",
                                isCompletedGroup && "bg-emerald-50 border-emerald-200",
                                isCurrentGroup && !isCompletedGroup && "bg-blue-50 border-blue-200 ring-1 ring-blue-300",
                                !isCompletedGroup && !isCurrentGroup && "bg-slate-50 border-slate-200"
                              )}
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <div className={cn(
                                  "h-6 w-6 rounded-full flex items-center justify-center text-xs",
                                  isCompletedGroup && "bg-emerald-500 text-white",
                                  isCurrentGroup && !isCompletedGroup && "bg-blue-500 text-white",
                                  !isCompletedGroup && !isCurrentGroup && "bg-slate-300 text-white"
                                )}>
                                  {isCompletedGroup ? <Check className="h-3.5 w-3.5" /> : completedInGroup}
                                </div>
                                <span className={cn(
                                  "text-sm font-medium truncate",
                                  isCompletedGroup && "text-emerald-700",
                                  isCurrentGroup && !isCompletedGroup && "text-blue-700",
                                  !isCompletedGroup && !isCurrentGroup && "text-slate-500"
                                )}>
                                  {group.label}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-slate-500">
                                  {completedInGroup}/{groupStages.length}
                                </span>
                                {firstIncompleteStage && !isCompletedGroup && (
                                  <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
                                    {getProductionStageLabel(firstIncompleteStage)}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      /* Non-production simple stages */
                      <div className="flex items-center gap-2 overflow-x-auto pb-2">
                        {stages.map((stage, index) => {
                          const stageIndex = stages.findIndex(s => s.id === order.currentStage);
                          const isCompleted = index < stageIndex;
                          const isCurrent = index === stageIndex;
                          
                          return (
                            <button
                              key={stage.id}
                              onClick={() => handleStageChange(stage.id)}
                              disabled={saving}
                              className={cn(
                                "flex items-center gap-2 px-3 py-2 rounded-lg border text-sm whitespace-nowrap transition-all",
                                isCompleted && "bg-emerald-50 border-emerald-200 text-emerald-700",
                                isCurrent && "bg-blue-50 border-blue-300 text-blue-700 ring-1 ring-blue-300",
                                !isCompleted && !isCurrent && "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
                              )}
                            >
                              {isCompleted && <Check className="h-3.5 w-3.5" />}
                              {isCurrent && <Circle className="h-3.5 w-3.5 fill-current" />}
                              {stage.label}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Order Items */}
                  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100">
                      <h3 className="font-medium text-slate-900">Sipariş Kalemleri</h3>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {(order.items || []).map((item, index) => (
                        <div key={item.id || index} className="px-6 py-4 flex items-center justify-between">
                          <div>
                            <p className="font-medium text-slate-900">{item.name}</p>
                            {item.description && (
                              <p className="text-sm text-slate-500 mt-0.5">{item.description}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-slate-900">{formatCurrency(item.total, order.currency)}</p>
                            <p className="text-xs text-slate-500">
                              {item.quantity} {item.unit} × {formatCurrency(item.unitPrice, order.currency)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="px-6 py-4 bg-slate-50 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Ara Toplam</span>
                        <span>{formatCurrency(order.subtotal, order.currency)}</span>
                      </div>
                      {order.discountAmount > 0 && (
                        <div className="flex justify-between text-sm text-red-600">
                          <span>İndirim (%{order.discountRate})</span>
                          <span>-{formatCurrency(order.discountAmount, order.currency)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">KDV (%{order.taxRate})</span>
                        <span>{formatCurrency(order.taxAmount, order.currency)}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-slate-200">
                        <span className="font-semibold text-slate-900">Genel Toplam</span>
                        <span className="font-semibold text-slate-900">{formatCurrency(order.total, order.currency)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right - Info Cards */}
                <div className="space-y-6">
                  {/* Status Card */}
                  <div className="bg-white rounded-xl border border-slate-200 p-5">
                    <h3 className="font-medium text-slate-900 mb-4">Durum</h3>
                    <div className="flex flex-wrap gap-2">
                      {Object.values(ORDER_STATUS)
                        .filter(s => s !== ORDER_STATUS.CANCELLED)
                        .map(status => (
                          <Button
                            key={status}
                            variant={order.status === status ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleStatusChange(status)}
                            disabled={saving || order.status === status}
                            className={cn(
                              "text-xs",
                              order.status !== status && "text-slate-600 hover:text-slate-900"
                            )}
                          >
                            {getOrderStatusLabel(status)}
                          </Button>
                        ))}
                    </div>
                  </div>

                  {/* Customer Card */}
                  <div className="bg-white rounded-xl border border-slate-200 p-5">
                    <h3 className="font-medium text-slate-900 mb-4">Müşteri</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
                          <Building2 className="h-4 w-4 text-slate-500" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 text-sm">{order.customer?.companyName || "-"}</p>
                          <p className="text-xs text-slate-500">{order.customer?.contactName || ""}</p>
                        </div>
                      </div>
                      {order.customer?.email && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Mail className="h-3.5 w-3.5" />
                          {order.customer.email}
                        </div>
                      )}
                      {order.customer?.phone && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Phone className="h-3.5 w-3.5" />
                          {order.customer.phone}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Dates Card */}
                  <div className="bg-white rounded-xl border border-slate-200 p-5">
                    <h3 className="font-medium text-slate-900 mb-4">Tarihler</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Oluşturulma</span>
                        <span className="text-slate-900">{format(createdAt, "d MMM yyyy", { locale: tr })}</span>
                      </div>
                      {order.estimatedDeliveryDate && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Tahmini Teslim</span>
                          <span className="text-slate-900">
                            {format(
                              order.estimatedDeliveryDate?.toDate?.() || new Date(order.estimatedDeliveryDate),
                              "d MMM yyyy",
                              { locale: tr }
                            )}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Öncelik</span>
                        <Badge variant="secondary" className={cn("text-xs", getOrderPriorityColor(order.priority))}>
                          {getOrderPriorityLabel(order.priority)}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {(order.notes || order.internalNotes) && (
                    <div className="bg-white rounded-xl border border-slate-200 p-5">
                      <h3 className="font-medium text-slate-900 mb-4">Notlar</h3>
                      <div className="space-y-3">
                        {order.notes && (
                          <p className="text-sm text-slate-600">{order.notes}</p>
                        )}
                        {order.internalNotes && (
                          <div className="bg-amber-50 rounded-lg p-3">
                            <p className="text-xs text-amber-600 font-medium mb-1">Dahili Not</p>
                            <p className="text-sm text-amber-800">{order.internalNotes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Production Tab */}
            {order.type === ORDER_TYPE.PRODUCTION && (
              <TabsContent value="production" className="mt-6">
                <div className="space-y-4">
                  {/* Production Workflow */}
                  <div className="bg-white rounded-xl border border-slate-200 p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium text-slate-900 text-sm">Üretim İş Akışı</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowProductionDetails(!showProductionDetails)}
                        className="text-xs h-7"
                      >
                        <Settings2 className="h-3.5 w-3.5 mr-1.5" />
                        {showProductionDetails ? "Kapat" : "Detaylar"}
                      </Button>
                    </div>
                    
                    <ProductionWorkflowTimeline
                      currentStage={order.currentStage}
                      production={order.production || {}}
                    />
                  </div>

                  {/* Production Details Form - Separate card when expanded */}
                  {showProductionDetails && (
                    <div className="bg-white rounded-xl border border-slate-200 p-5">
                      <ProductionDetailsForm
                        production={order.production || {}}
                        onChange={handleProductionUpdate}
                        onFormulaSelect={() => setShowFormulaSelector(true)}
                        currentStage={order.currentStage}
                        onStageChange={handleStageChange}
                      />
                    </div>
                  )}

                  {/* Checklist */}
                  {order.checklist && order.checklist.length > 0 && (
                    <ProductionChecklist
                      checklist={order.checklist}
                      production={order.production || {}}
                      onItemToggle={handleChecklistUpdate}
                      currentStage={order.currentStage}
                    />
                  )}
                </div>
              </TabsContent>
            )}

            {/* Documents Tab */}
            <TabsContent value="documents" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Proforma */}
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900">Proforma</h4>
                      <p className="text-xs text-slate-500">Teklif belgesi</p>
                    </div>
                  </div>
                  {order.proformaId ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <span className="font-medium text-blue-900 text-sm">{order.proformaNumber || "Proforma"}</span>
                        <Button variant="ghost" size="sm" className="h-7 text-blue-600" onClick={() => router.push(`/admin/proformas/${order.proformaId}`)}>
                          Görüntüle
                        </Button>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1 h-8 text-xs" onClick={() => setShowProformaSelector(true)}>
                          <Edit className="h-3.5 w-3.5 mr-1.5" />
                          Değiştir
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200" 
                          onClick={() => setDocumentToRemove({ type: 'proforma', name: 'Proforma' })}
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                          Kaldır
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button variant="outline" className="w-full border-dashed" onClick={() => setShowProformaSelector(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Proforma Bağla
                    </Button>
                  )}
                </div>

                {/* Contract */}
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                      <FileSignature className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900">Kontrat</h4>
                      <p className="text-xs text-slate-500">Sözleşme belgesi</p>
                    </div>
                  </div>
                  {order.contractId ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                        <span className="font-medium text-emerald-900 text-sm">{order.contractNumber || "Kontrat"}</span>
                        <Button variant="ghost" size="sm" className="h-7 text-emerald-600" onClick={() => router.push(`/admin/contracts/${order.contractId}`)}>
                          Görüntüle
                        </Button>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1 h-8 text-xs" onClick={() => setShowContractSelector(true)}>
                          <Edit className="h-3.5 w-3.5 mr-1.5" />
                          Değiştir
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200" 
                          onClick={() => setDocumentToRemove({ type: 'contract', name: 'Kontrat' })}
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                          Kaldır
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button variant="outline" className="w-full border-dashed" onClick={() => setShowContractSelector(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Kontrat Bağla
                    </Button>
                  )}
                </div>

                {/* Formula (only for production) */}
                {order.type === ORDER_TYPE.PRODUCTION && (
                  <div className="bg-white rounded-xl border border-slate-200 p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-10 w-10 rounded-lg bg-violet-50 flex items-center justify-center">
                        <FlaskConical className="h-5 w-5 text-violet-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-900">Formül</h4>
                        <p className="text-xs text-slate-500">Ürün formülasyonu</p>
                      </div>
                    </div>
                    {order.production?.formulaId ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-3 bg-violet-50 rounded-lg">
                          <div>
                            <span className="font-medium text-violet-900 text-sm block">{order.production.formulaName || "Formül"}</span>
                            {order.production.formulaCode && (
                              <span className="text-xs text-violet-600">{order.production.formulaCode}</span>
                            )}
                          </div>
                          <Button variant="ghost" size="sm" className="h-7 text-violet-600" onClick={() => router.push(`/admin/formulas/${order.production.formulaId}`)}>
                            Görüntüle
                          </Button>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="flex-1 h-8 text-xs" onClick={() => setShowFormulaSelector(true)}>
                            <Edit className="h-3.5 w-3.5 mr-1.5" />
                            Değiştir
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1 h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200" 
                            onClick={() => setDocumentToRemove({ type: 'formula', name: 'Formül' })}
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                            Kaldır
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button variant="outline" className="w-full border-dashed" onClick={() => setShowFormulaSelector(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Formül Seç
                      </Button>
                    )}
                  </div>
                )}

                {/* Case */}
                {order.caseId && (
                  <div className="bg-white rounded-xl border border-slate-200 p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-10 w-10 rounded-lg bg-amber-50 flex items-center justify-center">
                        <Briefcase className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-900">Case</h4>
                        <p className="text-xs text-slate-500">Kaynak talep</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                      <span className="font-medium text-amber-900 text-sm">Case #{order.caseNumber || order.caseId.slice(-6)}</span>
                      <Button variant="ghost" size="sm" className="h-7 text-amber-600" onClick={() => router.push(`/admin/crm-v2/cases/${order.caseId}`)}>
                        Görüntüle
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Payments Tab */}
            <TabsContent value="payments" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Payment Summary */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-medium text-slate-900">Ödeme Özeti</h3>
                    <Button size="sm" onClick={() => setShowPaymentModal(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Ödeme Ekle
                    </Button>
                  </div>

                  {/* Payment Progress */}
                  <div className="mb-6">
                    <div className="flex items-end justify-between mb-2">
                      <div>
                        <p className="text-sm text-slate-500">Ödenen Tutar</p>
                        <p className="text-2xl font-semibold text-emerald-600">{formatCurrency(paidAmount, order.currency)}</p>
                      </div>
                      <p className="text-sm text-slate-500">/ {formatCurrency(order.total, order.currency)}</p>
                    </div>
                    <Progress value={paymentProgress} className="h-3" />
                    <p className="text-xs text-slate-500 mt-2">Kalan: {formatCurrency(remainingAmount, order.currency)}</p>
                  </div>

                  {/* Advance & Balance */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className={cn(
                      "p-4 rounded-xl border",
                      order.advancePaidAt ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"
                    )}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-700">Avans (%{order.advanceRate})</span>
                        {order.advancePaidAt && <CheckCircle className="h-4 w-4 text-emerald-500" />}
                      </div>
                      <p className={cn(
                        "text-xl font-semibold",
                        order.advancePaidAt ? "text-emerald-700" : "text-amber-700"
                      )}>
                        {formatCurrency(order.advanceAmount, order.currency)}
                      </p>
                    </div>
                    <div className={cn(
                      "p-4 rounded-xl border",
                      order.balancePaidAt ? "bg-emerald-50 border-emerald-200" : "bg-slate-50 border-slate-200"
                    )}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-700">Bakiye</span>
                        {order.balancePaidAt && <CheckCircle className="h-4 w-4 text-emerald-500" />}
                      </div>
                      <p className={cn(
                        "text-xl font-semibold",
                        order.balancePaidAt ? "text-emerald-700" : "text-slate-700"
                      )}>
                        {formatCurrency(order.balanceAmount, order.currency)}
                      </p>
                    </div>
                  </div>

                  {/* Payment History */}
                  {(order.payments || []).length > 0 ? (
                    <div>
                      <h4 className="text-sm font-medium text-slate-700 mb-3">Ödeme Geçmişi</h4>
                      <div className="space-y-2">
                        {order.payments.map((payment) => {
                          const paymentDate = payment.date?.toDate?.() || new Date(payment.date);
                          return (
                            <div key={payment.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
                                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                                </div>
                                <div>
                                  <p className="font-medium text-slate-900">{formatCurrency(payment.amount, order.currency)}</p>
                                  <p className="text-xs text-slate-500">{format(paymentDate, "d MMM yyyy", { locale: tr })}</p>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-slate-400 hover:text-red-500"
                                onClick={() => handleDeletePayment(payment.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-500">
                      <CreditCard className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                      <p>Henüz ödeme kaydı yok</p>
                    </div>
                  )}
                </div>

                {/* Payment Status */}
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                  <h3 className="font-medium text-slate-900 mb-4">Ödeme Durumu</h3>
                  <Badge variant="outline" className={cn("text-sm", getPaymentStatusColor(order.paymentStatus))}>
                    {getPaymentStatusLabel(order.paymentStatus)}
                  </Badge>
                </div>
              </div>
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history" className="mt-6">
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="font-medium text-slate-900 mb-6">Aşama Geçmişi</h3>
                {order.stageHistory && order.stageHistory.length > 0 ? (
                  <div className="relative">
                    <div className="absolute left-3 top-0 bottom-0 w-px bg-slate-200" />
                    <div className="space-y-6">
                      {order.stageHistory.slice().reverse().map((history, index) => {
                        const historyDate = history.timestamp?.toDate?.() || new Date(history.timestamp);
                        return (
                          <div key={index} className="flex items-start gap-4 relative">
                            <div className="h-6 w-6 rounded-full bg-white border-2 border-slate-300 flex items-center justify-center flex-shrink-0 z-10">
                              <Check className="h-3 w-3 text-slate-400" />
                            </div>
                            <div className="flex-1 pb-6">
                              <p className="font-medium text-slate-900">{getStageLabel(history.stage)}</p>
                              {history.note && (
                                <p className="text-sm text-slate-500 mt-1">{history.note}</p>
                              )}
                              <p className="text-xs text-slate-400 mt-1">
                                {format(historyDate, "d MMM yyyy, HH:mm", { locale: tr })}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <History className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                    <p>Henüz aşama geçmişi yok</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Payment Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="bg-white max-w-md">
          <DialogHeader>
            <DialogTitle>Ödeme Ekle</DialogTitle>
            <DialogDescription>
              Kalan tutar: {formatCurrency(remainingAmount, order.currency)}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label className="text-sm">Tutar *</Label>
              <Input
                type="number"
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: Number(e.target.value) }))}
                min="0"
                max={remainingAmount}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label className="text-sm">Ödeme Yöntemi</Label>
              <Select
                value={paymentForm.method}
                onValueChange={(value) => setPaymentForm(prev => ({ ...prev, method: value }))}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="transfer">Havale/EFT</SelectItem>
                  <SelectItem value="cash">Nakit</SelectItem>
                  <SelectItem value="credit_card">Kredi Kartı</SelectItem>
                  <SelectItem value="check">Çek</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm">Tarih</Label>
              <Input
                type="date"
                value={paymentForm.date}
                onChange={(e) => setPaymentForm(prev => ({ ...prev, date: e.target.value }))}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label className="text-sm">Not</Label>
              <Textarea
                value={paymentForm.note}
                onChange={(e) => setPaymentForm(prev => ({ ...prev, note: e.target.value }))}
                placeholder="Ödeme notu..."
                rows={2}
                className="mt-1.5"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentModal(false)}>
              İptal
            </Button>
            <Button onClick={handleAddPayment} disabled={saving}>
              {saving ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Contract Selector Modal */}
      <ContractSelector
        open={showContractSelector}
        onClose={() => setShowContractSelector(false)}
        onSelect={handleContractSelect}
        selectedContractId={order?.contractId}
      />

      {/* Proforma Selector Modal */}
      <ProformaSelector
        open={showProformaSelector}
        onClose={() => setShowProformaSelector(false)}
        onSelect={handleProformaSelect}
        selectedProformaId={order?.proformaId}
        companyId={order?.companyId}
      />

      {/* Formula Selector Modal */}
      <FormulaSelector
        open={showFormulaSelector}
        onClose={() => setShowFormulaSelector(false)}
        onSelect={handleFormulaSelect}
        selectedFormulaId={order?.production?.formulaId}
      />

      {/* Document Removal Confirmation Dialog */}
      <Dialog open={!!documentToRemove} onOpenChange={(open) => !open && setDocumentToRemove(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600">
              <AlertCircle className="h-5 w-5" />
              Belge Bağlantısını Kaldır
            </DialogTitle>
            <DialogDescription className="pt-2">
              <strong>{documentToRemove?.name}</strong> bağlantısını bu siparişten kaldırmak istediğinizden emin misiniz?
              <br /><br />
              Bu işlem sadece bağlantıyı kaldırır, belgenin kendisini silmez. İstediğiniz zaman yeni bir belge bağlayabilirsiniz.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter className="gap-2 sm:gap-0">
            <Button 
              variant="outline" 
              onClick={() => setDocumentToRemove(null)}
              disabled={removingDocument}
            >
              İptal
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleRemoveDocument}
              disabled={removingDocument}
            >
              {removingDocument ? (
                <>Kaldırılıyor...</>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Kaldır
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Siparişi Sil
            </DialogTitle>
            <DialogDescription className="pt-2">
              <strong>{order?.orderNumber}</strong> numaralı siparişi silmek istediğinizden emin misiniz?
              <br /><br />
              Bu işlem geri alınamaz ve sipariş ile ilgili tüm veriler kalıcı olarak silinecektir.
              {order?.payments?.length > 0 && (
                <span className="block mt-2 text-amber-600 text-sm">
                  ⚠️ Bu siparişe ait {order.payments.length} adet ödeme kaydı bulunmaktadır.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter className="gap-2 sm:gap-0">
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteDialog(false)}
              disabled={deleting}
            >
              İptal
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteOrder}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Siliniyor...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Evet, Sil
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
