"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useAdminAuth } from "../../../../../hooks/use-admin-auth";
import { useToast } from "../../../../../hooks/use-toast";
import {
  getCustomer,
  updateCustomer,
  getCustomerCases,
  getUnifiedTimeline,
  addNote,
  createReminder,
  getOrdersByCustomer,
} from "../../../../../lib/services/crm-v2";
import {
  getOrderStatusLabel,
  getOrderStatusColor,
  getOrderTypeLabel,
  getOrderTypeColor,
} from "../../../../../lib/services/crm-v2/order-schema";
import { 
  getInboxConversations, 
  createConversation, 
  addMessage 
} from "../../../../../lib/services/crm-v2/conversation-service";
import {
  CUSTOMER_TYPE,
  PRIORITY,
  CASE_STATUS,
  CHANNEL,
  getCustomerTypeLabel,
  getCustomerTypeColor,
  getCaseStatusLabel,
  getCaseStatusColor,
  getPriorityLabel,
  getActivityIcon,
  getActivityColor,
  getChannelLabel,
  getChannelColor,
} from "../../../../../lib/services/crm-v2/schema";
import { formatDistanceToNow, format } from "date-fns";
import { tr } from "date-fns/locale";
import { cn } from "../../../../../lib/utils";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";
import { db } from "../../../../../lib/firebase";
import { ProformaService, PROFORMA_STATUS_LABELS } from "../../../../../lib/services/proforma-service";
import * as PricingService from "../../../../../lib/services/pricing-service";

// HTML to Text utility - Mesaj temizleme
import { htmlToText } from "../../../../../utils/html-to-text";

// UI Components
import { Button } from "../../../../../components/ui/button";
import { Input } from "../../../../../components/ui/input";
import { Badge } from "../../../../../components/ui/badge";
import { Textarea } from "../../../../../components/ui/textarea";
import { Label } from "../../../../../components/ui/label";
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
import { Skeleton } from "../../../../../components/ui/skeleton";
import { ScrollArea } from "../../../../../components/ui/scroll-area";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../../../components/ui/tabs";
import { Separator } from "../../../../../components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../../../components/ui/dialog";

// Icons
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  Edit,
  Save,
  X,
  Plus,
  MessageSquare,
  Briefcase,
  Clock,
  Calendar,
  TrendingUp,
  Activity,
  StickyNote,
  Bell,
  CheckCircle,
  XCircle,
  ArrowRight,
  User,
  History,
  FileText,
  DollarSign,
  Send,
  RefreshCw,
  ShoppingCart,
  Package,
  Receipt,
  Calculator,
  Link2,
  Eye,
  ExternalLink,
  Loader2,
} from "lucide-react";

/**
 * HTML içeriğinden düz metin çıkar (preview için)
 * html-to-text utility'sini kullanır
 */
const stripHtmlToText = (html) => {
  if (!html) return '';
  return htmlToText(html, { removeQuotes: true, removeSignature: true });
};

export default function CustomerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAdminAuth();
  const { toast } = useToast();

  const customerId = params.id;

  // State
  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState(null);
  const [cases, setCases] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [orders, setOrders] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);

  // Linked Documents State (Company üzerinden)
  const [linkedProformas, setLinkedProformas] = useState([]);
  const [linkedContracts, setLinkedContracts] = useState([]);
  const [linkedCalculations, setLinkedCalculations] = useState([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [linkedCompany, setLinkedCompany] = useState(null);

  // Modals
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [noteContent, setNoteContent] = useState("");
  const [reminderForm, setReminderForm] = useState({ title: "", dueDate: "" });
  
  // New Conversation Modal
  const [showNewConversationModal, setShowNewConversationModal] = useState(false);
  const [newConversationForm, setNewConversationForm] = useState({
    channel: CHANNEL.MANUAL,
    subject: "",
    message: "",
  });
  const [creatingConversation, setCreatingConversation] = useState(false);

  // Load data
  const loadData = useCallback(async () => {
    try {
      const [
        customerData,
        casesData,
        conversationsData,
        ordersData,
        timelineData,
      ] = await Promise.all([
        getCustomer(customerId),
        getCustomerCases(customerId),
        getInboxConversations({ customerId }),
        getOrdersByCustomer(customerId),
        getUnifiedTimeline(customerId, { limitCount: 50 }),
      ]);

      if (!customerData) {
        toast({
          title: "Hata",
          description: "Müşteri bulunamadı.",
          variant: "destructive",
        });
        router.push("/admin/crm-v2/customers");
        return;
      }

      setCustomer(customerData);
      setCases(casesData);
      setConversations(conversationsData);
      setOrders(ordersData || []);
      setTimeline(timelineData);
      setEditForm({
        name: customerData.name || "",
        email: customerData.email || "",
        phone: customerData.phone || "",
        type: customerData.type || CUSTOMER_TYPE.LEAD,
        priority: customerData.priority || PRIORITY.NORMAL,
        company: {
          name: customerData.company?.name || "",
          position: customerData.company?.position || "",
          website: customerData.company?.website || "",
          address: customerData.company?.address || "",
          city: customerData.company?.city || "",
          country: customerData.company?.country || "",
        },
        taxInfo: {
          taxOffice: customerData.taxInfo?.taxOffice || "",
          taxNumber: customerData.taxInfo?.taxNumber || "",
        },
        notes: customerData.notes || "",
      });
    } catch (error) {
      console.error("Error loading customer:", error);
      toast({
        title: "Hata",
        description: "Veriler yüklenirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [customerId, router, toast]);

  // Load linked documents from Company (proformas, contracts, calculations)
  const loadLinkedDocuments = useCallback(async (companyId) => {
    if (!companyId) {
      setLinkedProformas([]);
      setLinkedContracts([]);
      setLinkedCalculations([]);
      setLinkedCompany(null);
      return;
    }

    try {
      setDocumentsLoading(true);

      // Load Company info
      const { getDoc, doc } = await import("firebase/firestore");
      const companyDoc = await getDoc(doc(db, "companies", companyId));
      if (companyDoc.exists()) {
        setLinkedCompany({ id: companyDoc.id, ...companyDoc.data() });
      }

      // Load Proformas
      try {
        const proformasQuery = query(
          collection(db, "proformas"),
          where("companyId", "==", companyId),
          orderBy("createdAt", "desc"),
          limit(20)
        );
        const proformasSnapshot = await getDocs(proformasQuery);
        const proformasData = proformasSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setLinkedProformas(proformasData);
      } catch (error) {
        console.error("Error loading linked proformas:", error);
        setLinkedProformas([]);
      }

      // Load Contracts
      try {
        const contractsQuery = query(
          collection(db, "contracts"),
          where("companyId", "==", companyId),
          orderBy("createdAt", "desc"),
          limit(20)
        );
        const contractsSnapshot = await getDocs(contractsQuery);
        const contractsData = contractsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setLinkedContracts(contractsData);
      } catch (error) {
        console.error("Error loading linked contracts:", error);
        setLinkedContracts([]);
      }

      // Load Calculations - İKİ KAYNAKTAN:
      // 1. pricingCalculations koleksiyonunda linkedCompanies içinde companyId olanlar
      // 2. companies koleksiyonundaki pricingCalculations array'i
      try {
        const allCalculations = await PricingService.getPricingCalculations();
        
        // Kaynak 1: linkedCompanies içinde companyId olanlar
        const linkedFromCalcCollection = allCalculations.filter(
          (calc) => calc.linkedCompanies && calc.linkedCompanies.includes(companyId)
        );
        
        // Kaynak 2: Firma dokümanındaki pricingCalculations array'i
        const companyDoc = await getDoc(doc(db, "companies", companyId));
        let linkedFromCompanyDoc = [];
        if (companyDoc.exists()) {
          const companyData = companyDoc.data();
          const companyCalcIds = (companyData.pricingCalculations || []).map(c => c.calculationId || c.id);
          // Bu ID'lere karşılık gelen hesaplamaları bul
          linkedFromCompanyDoc = allCalculations.filter(calc => companyCalcIds.includes(calc.id));
        }
        
        // İki kaynağı birleştir (duplicate'leri kaldır)
        const combinedCalcs = [...linkedFromCalcCollection];
        for (const calc of linkedFromCompanyDoc) {
          if (!combinedCalcs.some(c => c.id === calc.id)) {
            combinedCalcs.push(calc);
          }
        }
        
        setLinkedCalculations(combinedCalcs);
      } catch (error) {
        console.error("Error loading linked calculations:", error);
        setLinkedCalculations([]);
      }
    } catch (error) {
      console.error("Error loading linked documents:", error);
    } finally {
      setDocumentsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Load linked documents when customer changes
  useEffect(() => {
    if (customer?.linkedCompanyId) {
      loadLinkedDocuments(customer.linkedCompanyId);
    }
  }, [customer?.linkedCompanyId, loadLinkedDocuments]);

  // Save changes
  const handleSave = async () => {
    setSaving(true);
    try {
      await updateCustomer(customerId, editForm, user?.uid);
      toast({
        title: "✅ Başarılı",
        description: "Müşteri bilgileri ve ilişkili tüm kayıtlar güncellendi.",
      });
      setEditing(false);
      loadData();
    } catch (error) {
      toast({
        title: "Hata",
        description: "Güncelleme başarısız oldu.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Add note
  const handleAddNote = async () => {
    if (!noteContent.trim()) return;

    try {
      await addNote({
        customerId,
        content: noteContent,
        createdBy: user?.uid,
      });
      toast({ title: "Başarılı", description: "Not eklendi." });
      setShowNoteModal(false);
      setNoteContent("");
      loadData();
    } catch (error) {
      toast({
        title: "Hata",
        description: "Not eklenemedi.",
        variant: "destructive",
      });
    }
  };

  // Add reminder
  const handleAddReminder = async () => {
    if (!reminderForm.title || !reminderForm.dueDate) return;

    try {
      await createReminder({
        customerId,
        title: reminderForm.title,
        dueDate: reminderForm.dueDate,
        createdBy: user?.uid,
      });
      toast({ title: "Başarılı", description: "Hatırlatma oluşturuldu." });
      setShowReminderModal(false);
      setReminderForm({ title: "", dueDate: "" });
      loadData();
    } catch (error) {
      toast({
        title: "Hata",
        description: "Hatırlatma oluşturulamadı.",
        variant: "destructive",
      });
    }
  };

  // Create new conversation
  const handleCreateConversation = async () => {
    if (!newConversationForm.subject.trim()) {
      toast({
        title: "Hata",
        description: "Konu alanı zorunludur.",
        variant: "destructive",
      });
      return;
    }

    setCreatingConversation(true);
    try {
      // Create the conversation
      const conversationData = {
        channel: newConversationForm.channel,
        subject: newConversationForm.subject,
        name: customer.name,
        email: customer.email || "",
        phone: customer.phone || "",
        company: customer.company?.name || "",
        customerId: customerId,
        message: newConversationForm.message || "",
        createdBy: user?.uid,
      };

      const newConversation = await createConversation(conversationData);

      // If there's a message and this is a new conversation (not duplicate)
      if (newConversationForm.message.trim() && newConversation?.id && !newConversation.skipped) {
        // First message is added by createConversation, but if we need to add an outbound message
        // we can add it separately if the form channel is manual and we want it as internal note
      }

      toast({ 
        title: "Başarılı", 
        description: newConversation.skipped 
          ? "Mevcut konuşmaya yönlendiriliyorsunuz." 
          : "Yeni iletişim oluşturuldu." 
      });
      
      setShowNewConversationModal(false);
      setNewConversationForm({
        channel: CHANNEL.MANUAL,
        subject: "",
        message: "",
      });
      
      // Navigate to the conversation
      router.push(`/admin/crm-v2/inbox/${newConversation.id}`);
    } catch (error) {
      console.error("Error creating conversation:", error);
      toast({
        title: "Hata",
        description: "İletişim oluşturulamadı.",
        variant: "destructive",
      });
    } finally {
      setCreatingConversation(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 0,
    }).format(value || 0);
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
        <Skeleton className="h-8 w-48 bg-slate-200" />
        <div className="grid grid-cols-3 gap-6">
          <Skeleton className="h-96 col-span-2 bg-slate-200" />
          <Skeleton className="h-96 bg-slate-200" />
        </div>
      </div>
    );
  }

  if (!customer) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="text-slate-500 hover:text-slate-700 hover:bg-slate-100"
            asChild
          >
            <Link href="/admin/crm-v2/customers">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold text-slate-800">
                {customer.name || "İsimsiz"}
              </h1>
              <Badge
                variant="outline"
                className={cn(
                  "bg-white border-slate-200",
                  getCustomerTypeColor(customer.type),
                )}
              >
                {getCustomerTypeLabel(customer.type)}
              </Badge>
            </div>
            {customer.company?.name && (
              <p className="text-slate-500 flex items-center gap-1.5 mt-1">
                <Building2 className="h-4 w-4 text-slate-400" />
                {customer.company.name}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {editing ? (
            <>
              <Button
                variant="outline"
                onClick={() => setEditing(false)}
                className="bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                <X className="h-4 w-4 mr-2" />
                İptal
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-slate-800 hover:bg-slate-900 text-white"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Kaydediliyor..." : "Kaydet"}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => setShowNoteModal(true)}
                className="bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                <StickyNote className="h-4 w-4 mr-2" />
                Not Ekle
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowReminderModal(true)}
                className="bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                <Bell className="h-4 w-4 mr-2" />
                Hatırlatma
              </Button>
              <Button
                onClick={() => setEditing(true)}
                className="bg-slate-800 hover:bg-slate-900 text-white"
              >
                <Edit className="h-4 w-4 mr-2" />
                Düzenle
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Details & Edit */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-white border border-slate-200 p-1">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-slate-100 data-[state=active]:text-slate-800"
              >
                Genel Bakış
              </TabsTrigger>
              <TabsTrigger
                value="cases"
                className="data-[state=active]:bg-slate-100 data-[state=active]:text-slate-800"
              >
                Talepler ({cases.length})
              </TabsTrigger>
              <TabsTrigger
                value="conversations"
                className="data-[state=active]:bg-slate-100 data-[state=active]:text-slate-800"
              >
                Konuşmalar ({conversations.length})
              </TabsTrigger>
              <TabsTrigger
                value="orders"
                className="data-[state=active]:bg-slate-100 data-[state=active]:text-slate-800"
              >
                Siparişler ({orders.length})
              </TabsTrigger>
              {customer?.linkedCompanyId && (
                <TabsTrigger
                  value="documents"
                  className="data-[state=active]:bg-slate-100 data-[state=active]:text-slate-800"
                >
                  <Link2 className="h-3.5 w-3.5 mr-1.5" />
                  Belgeler ({linkedProformas.length + linkedContracts.length + linkedCalculations.length})
                </TabsTrigger>
              )}
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6 mt-6">
              {/* Contact Info */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100">
                  <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                    <User className="h-4 w-4 text-slate-400" />
                    İletişim Bilgileri
                  </h3>
                </div>
                <div className="p-5">
                  {editing ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-slate-600 text-sm">
                          Ad Soyad
                        </Label>
                        <Input
                          value={editForm.name}
                          onChange={(e) =>
                            setEditForm({ ...editForm, name: e.target.value })
                          }
                          className="bg-slate-50 border-slate-200 focus:bg-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-600 text-sm">Tür</Label>
                        <Select
                          value={editForm.type}
                          onValueChange={(v) =>
                            setEditForm({ ...editForm, type: v })
                          }
                        >
                          <SelectTrigger className="bg-slate-50 border-slate-200">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-white">
                            {Object.values(CUSTOMER_TYPE).map((type) => (
                              <SelectItem key={type} value={type}>
                                {getCustomerTypeLabel(type)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-600 text-sm">
                          E-posta
                        </Label>
                        <Input
                          type="email"
                          value={editForm.email}
                          onChange={(e) =>
                            setEditForm({ ...editForm, email: e.target.value })
                          }
                          className="bg-slate-50 border-slate-200 focus:bg-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-600 text-sm">
                          Telefon
                        </Label>
                        <Input
                          value={editForm.phone}
                          onChange={(e) =>
                            setEditForm({ ...editForm, phone: e.target.value })
                          }
                          className="bg-slate-50 border-slate-200 focus:bg-white"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2.5 text-slate-600">
                        <Mail className="h-4 w-4 text-slate-400" />
                        <span>{customer.email || "-"}</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-slate-600">
                        <Phone className="h-4 w-4 text-slate-400" />
                        <span>{customer.phone || "-"}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Company Info */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100">
                  <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-slate-400" />
                    Şirket Bilgileri
                  </h3>
                </div>
                <div className="p-5">
                  {editing ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-slate-600 text-sm">
                          Şirket Adı
                        </Label>
                        <Input
                          value={editForm.company?.name}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              company: {
                                ...editForm.company,
                                name: e.target.value,
                              },
                            })
                          }
                          className="bg-slate-50 border-slate-200 focus:bg-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-600 text-sm">
                          Pozisyon
                        </Label>
                        <Input
                          value={editForm.company?.position}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              company: {
                                ...editForm.company,
                                position: e.target.value,
                              },
                            })
                          }
                          className="bg-slate-50 border-slate-200 focus:bg-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-600 text-sm">
                          Web Sitesi
                        </Label>
                        <Input
                          value={editForm.company?.website}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              company: {
                                ...editForm.company,
                                website: e.target.value,
                              },
                            })
                          }
                          className="bg-slate-50 border-slate-200 focus:bg-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-600 text-sm">Şehir</Label>
                        <Input
                          value={editForm.company?.city}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              company: {
                                ...editForm.company,
                                city: e.target.value,
                              },
                            })
                          }
                          className="bg-slate-50 border-slate-200 focus:bg-white"
                        />
                      </div>
                      <div className="col-span-2 space-y-2">
                        <Label className="text-slate-600 text-sm">Adres</Label>
                        <Textarea
                          value={editForm.company?.address}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              company: {
                                ...editForm.company,
                                address: e.target.value,
                              },
                            })
                          }
                          className="bg-slate-50 border-slate-200 focus:bg-white"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {customer.company?.name && (
                        <div className="flex items-center gap-2.5 text-slate-600">
                          <Building2 className="h-4 w-4 text-slate-400" />
                          <span>
                            {customer.company.name}
                            {customer.company.position &&
                              ` - ${customer.company.position}`}
                          </span>
                        </div>
                      )}
                      {customer.company?.website && (
                        <div className="flex items-center gap-2.5">
                          <Globe className="h-4 w-4 text-slate-400" />
                          <a
                            href={customer.company.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {customer.company.website}
                          </a>
                        </div>
                      )}
                      {(customer.company?.address ||
                        customer.company?.city) && (
                        <div className="flex items-center gap-2.5 text-slate-600">
                          <MapPin className="h-4 w-4 text-slate-400" />
                          <span>
                            {[customer.company.address, customer.company.city]
                              .filter(Boolean)
                              .join(", ")}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100">
                  <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                    <StickyNote className="h-4 w-4 text-slate-400" />
                    Notlar
                  </h3>
                </div>
                <div className="p-5">
                  {editing ? (
                    <Textarea
                      value={editForm.notes}
                      onChange={(e) =>
                        setEditForm({ ...editForm, notes: e.target.value })
                      }
                      rows={4}
                      className="bg-slate-50 border-slate-200 focus:bg-white"
                    />
                  ) : (
                    <p className="text-sm text-slate-600 whitespace-pre-wrap">
                      {customer.notes || "Not yok"}
                    </p>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Cases Tab */}
            <TabsContent value="cases" className="space-y-4 mt-6">
              {cases.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 py-16 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                    <Briefcase className="h-8 w-8 text-slate-400" />
                  </div>
                  <p className="text-slate-500 font-medium">Henüz talep yok</p>
                  <Button
                    variant="outline"
                    className="mt-4 bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                    asChild
                  >
                    <Link href="/admin/crm-v2/cases/new">
                      <Plus className="h-4 w-4 mr-2" />
                      Yeni Talep Oluştur
                    </Link>
                  </Button>
                </div>
              ) : (
                cases.map((caseItem) => (
                  <div
                    key={caseItem.id}
                    className="bg-white rounded-xl border border-slate-200 p-4 cursor-pointer hover:shadow-md hover:border-slate-300 transition-all"
                    onClick={() =>
                      router.push(`/admin/crm-v2/cases/${caseItem.id}`)
                    }
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-slate-800">
                          {caseItem.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1.5">
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs bg-white",
                              getCaseStatusColor(caseItem.status),
                            )}
                          >
                            {getCaseStatusLabel(caseItem.status)}
                          </Badge>
                          {caseItem.financials?.quotedValue > 0 && (
                            <span className="text-sm text-slate-500">
                              {formatCurrency(caseItem.financials.quotedValue)}
                            </span>
                          )}
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-slate-400" />
                    </div>
                  </div>
                ))
              )}
            </TabsContent>

            {/* Conversations Tab */}
            <TabsContent value="conversations" className="space-y-4 mt-6">
              {/* New Conversation Button */}
              <div className="flex justify-end">
                <Button
                  onClick={() => setShowNewConversationModal(true)}
                  className="bg-slate-800 hover:bg-slate-900 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Yeni İletişim Başlat
                </Button>
              </div>
              
              {conversations.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 py-16 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                    <MessageSquare className="h-8 w-8 text-slate-400" />
                  </div>
                  <p className="text-slate-500 font-medium">
                    Henüz konuşma yok
                  </p>
                  <p className="text-sm text-slate-400 mt-1">
                    Yukarıdaki butona tıklayarak yeni iletişim başlatabilirsiniz.
                  </p>
                </div>
              ) : (
                conversations.map((conv) => (
                  <div
                    key={conv.id}
                    className="bg-white rounded-xl border border-slate-200 p-4 cursor-pointer hover:shadow-md hover:border-slate-300 transition-all"
                    onClick={() =>
                      router.push(`/admin/crm-v2/inbox/${conv.id}`)
                    }
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-slate-800">
                          {conv.subject}
                        </h4>
                        <p className="text-sm text-slate-500 line-clamp-1 mt-0.5">
                          {stripHtmlToText(conv.preview)}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <Badge
                            variant="outline"
                            className="bg-white border-slate-200 text-slate-600 text-xs"
                          >
                            {getChannelLabel(conv.channel)}
                          </Badge>
                          <span className="text-xs text-slate-400">
                            {(() => {
                              const originalDate =
                                conv.channelMetadata?.originalCreatedAt;
                              const displayDate =
                                originalDate ||
                                conv.createdAt ||
                                conv.lastMessageAt;
                              if (!displayDate) return "";
                              
                              try {
                                const dateObj = displayDate?.toDate?.() || new Date(displayDate);
                                // Check if the date is valid
                                if (isNaN(dateObj.getTime())) return "";
                                return formatDistanceToNow(dateObj, {
                                  addSuffix: true,
                                  locale: tr,
                                });
                              } catch (error) {
                                return "";
                              }
                            })()}
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-slate-400" />
                    </div>
                  </div>
                ))
              )}
            </TabsContent>

            {/* Orders Tab */}
            <TabsContent value="orders" className="space-y-4 mt-6">
              {orders.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 py-16 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                    <ShoppingCart className="h-8 w-8 text-slate-400" />
                  </div>
                  <p className="text-slate-500 font-medium">
                    Henüz sipariş yok
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4 bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                    asChild
                  >
                    <Link href="/admin/crm-v2/orders/new">
                      <Plus className="h-4 w-4 mr-2" />
                      Yeni Sipariş Oluştur
                    </Link>
                  </Button>
                </div>
              ) : (
                orders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white rounded-xl border border-slate-200 p-4 cursor-pointer hover:shadow-md hover:border-slate-300 transition-all"
                    onClick={() =>
                      router.push(`/admin/crm-v2/orders/${order.id}`)
                    }
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-slate-800">
                            {order.orderNumber || `#${order.id?.slice(0, 8)}`}
                          </h4>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs bg-white",
                              getOrderTypeColor(order.type),
                            )}
                          >
                            {getOrderTypeLabel(order.type)}
                          </Badge>
                        </div>
                        {order.title && (
                          <p className="text-sm text-slate-600 mt-1">
                            {order.title}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-2">
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs bg-white",
                              getOrderStatusColor(order.status),
                            )}
                          >
                            {getOrderStatusLabel(order.status)}
                          </Badge>
                          {order.financials?.totalAmount > 0 && (
                            <span className="text-sm font-medium text-slate-600">
                              {formatCurrency(order.financials.totalAmount)}
                            </span>
                          )}
                          {order.createdAt && (
                            <span className="text-xs text-slate-400">
                              {formatDistanceToNow(
                                order.createdAt?.toDate?.() ||
                                  new Date(order.createdAt),
                                { addSuffix: true, locale: tr },
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-slate-400" />
                    </div>
                  </div>
                ))
              )}
            </TabsContent>

            {/* Documents Tab - Linked from Company */}
            {customer?.linkedCompanyId && (
              <TabsContent value="documents" className="space-y-6 mt-6">
                {/* Company Link Info */}
                {linkedCompany && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm text-blue-600 font-medium">Bağlı Firma</p>
                          <p className="text-base font-semibold text-blue-900">{linkedCompany.name}</p>
                        </div>
                      </div>
                      <Link href={`/admin/companies/${linkedCompany.id}`}>
                        <Button size="sm" variant="outline" className="bg-white border-blue-200 text-blue-700 hover:bg-blue-50">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Firmaya Git
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}

                {documentsLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-32 w-full bg-slate-100" />
                    <Skeleton className="h-32 w-full bg-slate-100" />
                    <Skeleton className="h-32 w-full bg-slate-100" />
                  </div>
                ) : (
                  <>
                    {/* Proformas Section */}
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                          <Receipt className="h-4 w-4 text-blue-500" />
                          Proformalar
                          <Badge variant="secondary" className="ml-2 bg-blue-50 text-blue-700">
                            {linkedProformas.length}
                          </Badge>
                        </h3>
                        {linkedCompany && (
                          <Link href={`/admin/proformas/new?companyId=${linkedCompany.id}`}>
                            <Button size="sm" variant="outline" className="bg-white border-slate-200 text-slate-600 hover:bg-slate-50">
                              <Plus className="h-4 w-4 mr-1" />
                              Yeni
                            </Button>
                          </Link>
                        )}
                      </div>
                      <div className="p-4">
                        {linkedProformas.length === 0 ? (
                          <div className="text-center py-8">
                            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-100 flex items-center justify-center">
                              <Receipt className="h-6 w-6 text-slate-400" />
                            </div>
                            <p className="text-sm text-slate-500">Henüz proforma yok</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {linkedProformas.map((proforma) => (
                              <div
                                key={proforma.id}
                                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="h-9 w-9 rounded-lg bg-blue-100 flex items-center justify-center">
                                    <Receipt className="h-4 w-4 text-blue-600" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-slate-800 text-sm">
                                      {proforma.proformaNumber || `#${proforma.id?.slice(0, 8)}`}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                      {proforma.createdAt && format(
                                        proforma.createdAt?.toDate?.() || new Date(proforma.createdAt),
                                        "dd MMM yyyy",
                                        { locale: tr }
                                      )}
                                      {proforma.totals?.grandTotal && (
                                        <span className="ml-2 font-medium text-emerald-600">
                                          {formatCurrency(proforma.totals.grandTotal)}
                                        </span>
                                      )}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge
                                    variant="outline"
                                    className={cn(
                                      "text-xs",
                                      proforma.status === "accepted" && "bg-emerald-50 text-emerald-700 border-emerald-200",
                                      proforma.status === "sent" && "bg-blue-50 text-blue-700 border-blue-200",
                                      proforma.status === "draft" && "bg-slate-50 text-slate-600 border-slate-200",
                                      proforma.status === "rejected" && "bg-red-50 text-red-700 border-red-200",
                                      proforma.status === "expired" && "bg-amber-50 text-amber-700 border-amber-200"
                                    )}
                                  >
                                    {PROFORMA_STATUS_LABELS[proforma.status] || proforma.status}
                                  </Badge>
                                  <Link href={`/admin/proformas/${proforma.id}`}>
                                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                      <Eye className="h-4 w-4 text-slate-400" />
                                    </Button>
                                  </Link>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Contracts Section */}
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                          <FileText className="h-4 w-4 text-green-500" />
                          Sözleşmeler
                          <Badge variant="secondary" className="ml-2 bg-green-50 text-green-700">
                            {linkedContracts.length}
                          </Badge>
                        </h3>
                        {linkedCompany && (
                          <Link href={`/admin/contracts/new?companyId=${linkedCompany.id}`}>
                            <Button size="sm" variant="outline" className="bg-white border-slate-200 text-slate-600 hover:bg-slate-50">
                              <Plus className="h-4 w-4 mr-1" />
                              Yeni
                            </Button>
                          </Link>
                        )}
                      </div>
                      <div className="p-4">
                        {linkedContracts.length === 0 ? (
                          <div className="text-center py-8">
                            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-100 flex items-center justify-center">
                              <FileText className="h-6 w-6 text-slate-400" />
                            </div>
                            <p className="text-sm text-slate-500">Henüz sözleşme yok</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {linkedContracts.map((contract) => (
                              <div
                                key={contract.id}
                                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="h-9 w-9 rounded-lg bg-green-100 flex items-center justify-center">
                                    <FileText className="h-4 w-4 text-green-600" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-slate-800 text-sm">
                                      {contract.contractNumber || `#${contract.id?.slice(0, 8)}`}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                      {contract.contractType && (
                                        <span className="mr-2">{contract.contractType}</span>
                                      )}
                                      {contract.createdAt && format(
                                        contract.createdAt?.toDate?.() || new Date(contract.createdAt),
                                        "dd MMM yyyy",
                                        { locale: tr }
                                      )}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge
                                    variant="outline"
                                    className={cn(
                                      "text-xs",
                                      contract.status === "active" && "bg-emerald-50 text-emerald-700 border-emerald-200",
                                      contract.status === "draft" && "bg-slate-50 text-slate-600 border-slate-200",
                                      contract.status === "completed" && "bg-blue-50 text-blue-700 border-blue-200",
                                      contract.status === "cancelled" && "bg-red-50 text-red-700 border-red-200"
                                    )}
                                  >
                                    {contract.status === "active" ? "Aktif" :
                                     contract.status === "draft" ? "Taslak" :
                                     contract.status === "completed" ? "Tamamlandı" :
                                     contract.status === "cancelled" ? "İptal" : contract.status}
                                  </Badge>
                                  <Link href={`/admin/contracts/${contract.id}`}>
                                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                      <Eye className="h-4 w-4 text-slate-400" />
                                    </Button>
                                  </Link>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Calculations Section */}
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                          <Calculator className="h-4 w-4 text-purple-500" />
                          Fiyat Hesaplamaları
                          <Badge variant="secondary" className="ml-2 bg-purple-50 text-purple-700">
                            {linkedCalculations.length}
                          </Badge>
                        </h3>
                        <Link href="/admin/pricing">
                          <Button size="sm" variant="outline" className="bg-white border-slate-200 text-slate-600 hover:bg-slate-50">
                            <Plus className="h-4 w-4 mr-1" />
                            Hesaplama Yap
                          </Button>
                        </Link>
                      </div>
                      <div className="p-4">
                        {linkedCalculations.length === 0 ? (
                          <div className="text-center py-8">
                            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-100 flex items-center justify-center">
                              <Calculator className="h-6 w-6 text-slate-400" />
                            </div>
                            <p className="text-sm text-slate-500">Henüz hesaplama yok</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {linkedCalculations.map((calc) => (
                              <div
                                key={calc.id}
                                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="h-9 w-9 rounded-lg bg-purple-100 flex items-center justify-center">
                                    <Calculator className="h-4 w-4 text-purple-600" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-slate-800 text-sm">
                                      {calc.productName || calc.name || "Hesaplama"}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                      {calc.createdAt && format(
                                        calc.createdAt?.toDate?.() || new Date(calc.createdAt),
                                        "dd MMM yyyy",
                                        { locale: tr }
                                      )}
                                      {calc.totalCost && (
                                        <span className="ml-2 font-medium text-purple-600">
                                          {formatCurrency(calc.totalCost)}
                                        </span>
                                      )}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {calc.productType && (
                                    <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                                      {calc.productType}
                                    </Badge>
                                  )}
                                  <Link href={`/admin/pricing?id=${calc.id}`}>
                                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                      <Eye className="h-4 w-4 text-slate-400" />
                                    </Button>
                                  </Link>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </TabsContent>
            )}
          </Tabs>
        </div>

        {/* Right Panel - Stats & Timeline */}
        <div className="space-y-6">
          {/* Stats */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-slate-400" />
                İstatistikler
              </h3>
            </div>
            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Konuşmalar</span>
                <span className="font-medium text-slate-700">
                  {customer.stats?.totalConversations || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Toplam Talepler</span>
                <span className="font-medium text-slate-700">
                  {customer.stats?.totalCases || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Açık Talepler</span>
                <span className="font-medium text-slate-700">
                  {customer.stats?.openCases || 0}
                </span>
              </div>
              <div className="border-t border-slate-100 pt-3 mt-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Kazanılan</span>
                  <span className="font-medium text-emerald-600">
                    {customer.stats?.wonCases || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Kaybedilen</span>
                  <span className="font-medium text-red-500">
                    {customer.stats?.lostCases || 0}
                  </span>
                </div>
              </div>
              <div className="border-t border-slate-100 pt-3 mt-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Toplam Değer</span>
                  <span className="font-semibold text-slate-800">
                    {formatCurrency(customer.stats?.totalValue)}
                  </span>
                </div>
              </div>
              {/* Müşteri Tarihi Bilgisi */}
              <div className="border-t border-slate-100 pt-4 mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Kayıt Tarihi</span>
                  <span className="text-sm text-slate-600">
                    {customer.createdAt &&
                      format(
                        customer.createdAt?.toDate?.() ||
                          new Date(customer.createdAt),
                        "dd MMM yyyy",
                        { locale: tr },
                      )}
                  </span>
                </div>
                {customer.stats?.firstContactAt && (
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm text-slate-500">İlk İletişim</span>
                    <span className="text-sm text-slate-600">
                      {format(
                        customer.stats.firstContactAt?.toDate?.() ||
                          new Date(customer.stats.firstContactAt),
                        "dd MMM yyyy",
                        { locale: tr },
                      )}
                    </span>
                  </div>
                )}
                {/* Migration bilgisi */}
                {customer.migratedAt && (
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm text-slate-500">Kaynak</span>
                    <Badge
                      variant="outline"
                      className="text-xs bg-amber-50 text-amber-700 border-amber-200"
                    >
                      Eski Sistemden
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                <History className="h-4 w-4 text-slate-400" />
                Aktivite Geçmişi
              </h3>
            </div>
            <div className="p-5">
              <ScrollArea className="h-[400px] pr-4">
                {timeline.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-100 flex items-center justify-center">
                      <Activity className="h-6 w-6 text-slate-400" />
                    </div>
                    <p className="text-sm text-slate-500">Henüz aktivite yok</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {timeline.map((activity, index) => (
                      <div key={activity.id} className="flex gap-3">
                        <div
                          className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                            "bg-slate-100 text-slate-500",
                          )}
                        >
                          {activity.type?.includes("message") && (
                            <MessageSquare className="h-4 w-4" />
                          )}
                          {activity.type?.includes("case") && (
                            <Briefcase className="h-4 w-4" />
                          )}
                          {activity.type?.includes("note") && (
                            <StickyNote className="h-4 w-4" />
                          )}
                          {activity.type?.includes("reminder") && (
                            <Bell className="h-4 w-4" />
                          )}
                          {!activity.type?.includes("message") &&
                            !activity.type?.includes("case") &&
                            !activity.type?.includes("note") &&
                            !activity.type?.includes("reminder") && (
                              <Activity className="h-4 w-4" />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-slate-700">
                            {activity.description}
                          </p>
                          {activity.metadata?.content && (
                            <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                              {activity.metadata.content}
                            </p>
                          )}
                          <p className="text-xs text-slate-400 mt-1">
                            {(() => {
                              const originalDate =
                                activity.metadata?.originalCreatedAt;
                              const displayDate =
                                originalDate || activity.createdAt;
                              if (!displayDate) return "";
                              return formatDistanceToNow(
                                displayDate?.toDate?.() ||
                                  new Date(displayDate),
                                { addSuffix: true, locale: tr },
                              );
                            })()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>
        </div>
      </div>

      {/* Add Note Modal */}
      <Dialog open={showNoteModal} onOpenChange={setShowNoteModal}>
        <DialogContent className="bg-white border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-slate-800">Not Ekle</DialogTitle>
            <DialogDescription className="text-slate-500">
              Bu müşteri için not ekleyin. Not, aktivite geçmişinde
              görünecektir.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea
              placeholder="Notunuzu yazın..."
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              rows={4}
              className="bg-slate-50 border-slate-200 focus:bg-white"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowNoteModal(false)}
              className="bg-white border-slate-200 text-slate-600"
            >
              İptal
            </Button>
            <Button
              onClick={handleAddNote}
              disabled={!noteContent.trim()}
              className="bg-slate-800 hover:bg-slate-900 text-white"
            >
              <StickyNote className="h-4 w-4 mr-2" />
              Ekle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Reminder Modal */}
      <Dialog open={showReminderModal} onOpenChange={setShowReminderModal}>
        <DialogContent className="bg-white border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-slate-800">
              Hatırlatma Oluştur
            </DialogTitle>
            <DialogDescription className="text-slate-500">
              Bu müşteri için hatırlatma oluşturun.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-slate-600 text-sm">Başlık</Label>
              <Input
                placeholder="Hatırlatma başlığı"
                value={reminderForm.title}
                onChange={(e) =>
                  setReminderForm({ ...reminderForm, title: e.target.value })
                }
                className="bg-slate-50 border-slate-200 focus:bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-600 text-sm">Tarih</Label>
              <Input
                type="datetime-local"
                value={reminderForm.dueDate}
                onChange={(e) =>
                  setReminderForm({ ...reminderForm, dueDate: e.target.value })
                }
                className="bg-slate-50 border-slate-200 focus:bg-white"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowReminderModal(false)}
              className="bg-white border-slate-200 text-slate-600"
            >
              İptal
            </Button>
            <Button
              onClick={handleAddReminder}
              disabled={!reminderForm.title || !reminderForm.dueDate}
              className="bg-slate-800 hover:bg-slate-900 text-white"
            >
              <Bell className="h-4 w-4 mr-2" />
              Oluştur
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Conversation Modal */}
      <Dialog open={showNewConversationModal} onOpenChange={setShowNewConversationModal}>
        <DialogContent className="bg-white border-slate-200 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-slate-800 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-slate-600" />
              Yeni İletişim Başlat
            </DialogTitle>
            <DialogDescription className="text-slate-500">
              {customer?.name} ile yeni bir iletişim başlatın.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-slate-600 text-sm">Kanal</Label>
              <Select
                value={newConversationForm.channel}
                onValueChange={(v) =>
                  setNewConversationForm({ ...newConversationForm, channel: v })
                }
              >
                <SelectTrigger className="bg-slate-50 border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value={CHANNEL.MANUAL}>Manuel</SelectItem>
                  <SelectItem value={CHANNEL.EMAIL}>E-posta</SelectItem>
                  <SelectItem value={CHANNEL.PHONE}>Telefon</SelectItem>
                  <SelectItem value={CHANNEL.WHATSAPP}>WhatsApp</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-600 text-sm">Konu *</Label>
              <Input
                placeholder="İletişim konusu"
                value={newConversationForm.subject}
                onChange={(e) =>
                  setNewConversationForm({ ...newConversationForm, subject: e.target.value })
                }
                className="bg-slate-50 border-slate-200 focus:bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-600 text-sm">İlk Mesaj (Opsiyonel)</Label>
              <Textarea
                placeholder="İletişim için ilk not veya mesaj..."
                value={newConversationForm.message}
                onChange={(e) =>
                  setNewConversationForm({ ...newConversationForm, message: e.target.value })
                }
                rows={4}
                className="bg-slate-50 border-slate-200 focus:bg-white"
              />
              <p className="text-xs text-slate-400">
                Bu mesaj iletişim kaydına dahili not olarak eklenecektir.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowNewConversationModal(false)}
              className="bg-white border-slate-200 text-slate-600"
              disabled={creatingConversation}
            >
              İptal
            </Button>
            <Button
              onClick={handleCreateConversation}
              disabled={!newConversationForm.subject.trim() || creatingConversation}
              className="bg-slate-800 hover:bg-slate-900 text-white"
            >
              {creatingConversation ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Oluşturuluyor...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  İletişim Başlat
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
