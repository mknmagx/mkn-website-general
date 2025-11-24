"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useRequest } from "../../../../hooks/use-requests";
import { usePermissions } from "../../../../components/admin-route-guard";
import { useAdminAuth } from "../../../../hooks/use-admin-auth";
import {
  REQUEST_STATUS,
  CATEGORY_FIELDS,
  getRequestCategoryLabel,
  getRequestStatusLabel,
  getRequestPriorityLabel,
  getRequestSourceLabel,
  getCategoryColor,
  getCategoryIcon,
} from "../../../../lib/services/request-service";

// UI Components
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Textarea } from "../../../../components/ui/textarea";
import { Badge } from "../../../../components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../../components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";
import { Label } from "../../../../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../../components/ui/dialog";

// Icons
import {
  MessageSquareText,
  ArrowLeft,
  Edit3,
  Save,
  Plus,
  MessageSquare,
  Calendar,
  Building2,
  Mail,
  Phone,
  DollarSign,
  Clock,
  User,
  AlertCircle,
  Droplets,
  Pill,
  SprayCanIcon as SprayCan,
  Package,
  ShoppingCart,
  TrendingUp,
  FlaskConical,
  Users,
  Star,
  Zap,
  Loader2,
  FileText,
  Target,
  CheckCircle2,
  Activity,
  TrendingDown,
  Send,
  Phone as PhoneCall,
  Video,
  FileCheck,
  Truck,
  CreditCard,
} from "lucide-react";

export default function RequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAdminAuth();
  const { hasPermission } = usePermissions();
  const { request, loading, error, updateRequest, addNote, addFollowUp } =
    useRequest(params.id);

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [activeTab, setActiveTab] = useState("overview");
  const [newNote, setNewNote] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [newFollowUp, setNewFollowUp] = useState({
    type: "call",
    description: "",
    scheduledDate: "",
    assignedTo: "",
  });

  // Activity states
  const [showActivityDialog, setShowActivityDialog] = useState(false);
  const [proformas, setProformas] = useState([]);
  const [loadingProformas, setLoadingProformas] = useState(false);
  const [newActivity, setNewActivity] = useState({
    type: "",
    title: "",
    description: "",
    relatedProformaId: "",
    performedBy: user?.displayName || user?.email || "",
  });

  const canView = hasPermission("requests.view") || hasPermission("admin.all");
  const canEdit = hasPermission("requests.edit") || hasPermission("admin.all");

  // Kategori ikonu getir
  const getCategoryIconComponent = (category) => {
    const iconMap = {
      cosmetic_manufacturing: Droplets,
      supplement_manufacturing: Pill,
      cleaning_manufacturing: SprayCan,
      packaging_supply: Package,
      ecommerce_operations: ShoppingCart,
      digital_marketing: TrendingUp,
      formulation_development: FlaskConical,
      consultation: Users,
    };
    const IconComponent = iconMap[category] || MessageSquareText;
    return <IconComponent className="h-5 w-5" />;
  };

  // Kategori özel alanları render et
  const renderCategorySpecificData = (categoryData, category) => {
    if (!categoryData || !CATEGORY_FIELDS[category]) return null;

    const categoryConfig = CATEGORY_FIELDS[category];

    return (
      <div className="space-y-6">
        {Object.entries(categoryConfig).map(([fieldKey, fieldConfig]) => {
          const value = categoryData[fieldKey];
          if (!value) return null;

          return (
            <div key={fieldKey}>
              <Label className="text-sm font-medium text-slate-500 mb-2 block">
                {fieldConfig.label}
              </Label>
              {fieldConfig.type === "array" && Array.isArray(value) ? (
                <div className="space-y-3">
                  {value.map((item, index) => (
                    <Card
                      key={index}
                      className="p-4 bg-slate-50 border-slate-200"
                    >
                      <h4 className="font-medium text-slate-800 mb-3">
                        {fieldConfig.label.slice(0, -6)} {index + 1}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.entries(fieldConfig.fields).map(
                          ([subKey, subConfig]) => {
                            const subValue = item[subKey];
                            if (!subValue) return null;
                            return (
                              <div
                                key={subKey}
                                className="bg-white p-3 rounded-lg"
                              >
                                <Label className="text-xs text-slate-500 mb-1 block">
                                  {subConfig.label}
                                </Label>
                                <p className="text-sm text-slate-800 font-medium">
                                  {subValue}
                                </p>
                              </div>
                            );
                          }
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              ) : fieldConfig.type === "multiselect" && Array.isArray(value) ? (
                <div className="flex flex-wrap gap-2">
                  {value.map((item, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="bg-blue-50 text-blue-700 border-blue-200"
                    >
                      {item}
                    </Badge>
                  ))}
                </div>
              ) : fieldConfig.type === "boolean" ? (
                <Badge variant={value ? "default" : "secondary"}>
                  {value ? "Evet" : "Hayır"}
                </Badge>
              ) : (
                <p className="text-slate-800 bg-slate-50 p-3 rounded-lg">
                  {value}
                </p>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  useEffect(() => {
    if (request && !isEditing) {
      setEditData({
        status: request.status,
        priority: request.priority,
        assignedTo: request.assignedTo || "",
        estimatedValue: request.estimatedValue || 0,
        actualValue: request.actualValue || 0,
        expectedDelivery: request.expectedDelivery || "",
        notes: request.notes || [],
      });
    }
  }, [request, isEditing]);

  const handleSave = async () => {
    try {
      const result = await updateRequest(editData);
      if (result.success) {
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error updating request:", error);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    try {
      const result = await addNote({
        content: newNote,
        author: user?.displayName || user?.email,
        authorId: user?.uid,
      });

      if (result.success) {
        setNewNote("");
      }
    } catch (error) {
      console.error("Error adding note:", error);
    }
  };

  const handleAddFollowUp = async () => {
    if (!newFollowUp.description.trim()) return;

    try {
      const result = await addFollowUp({
        ...newFollowUp,
        createdBy: user?.uid,
        createdByName: user?.displayName || user?.email,
      });

      if (result.success) {
        setNewFollowUp({
          type: "call",
          description: "",
          scheduledDate: "",
          assignedTo: "",
        });
      }
    } catch (error) {
      console.error("Error adding follow up:", error);
    }
  };

  const handleStatusChange = async (newStatusValue) => {
    if (!newStatusValue || newStatusValue === request.status) return;

    try {
      const result = await updateRequest({
        status: newStatusValue,
        updatedAt: new Date(),
        updatedBy: user?.uid,
        updatedByName: user?.displayName || user?.email || "Sistem",
      });

      if (result.success) {
        // Activity kaydı ekle (gelecekte activities tab için)
        console.log(
          `Status changed from ${request.status} to ${newStatusValue}`
        );
        setNewStatus("");
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  // Proformaları getir
  const fetchProformas = async () => {
    if (proformas.length > 0) return; // Zaten yüklendiyse tekrar yükleme

    setLoadingProformas(true);
    try {
      const { getDocs, collection, query, orderBy } = await import(
        "firebase/firestore"
      );
      const { db } = await import("../../../../lib/firebase");

      const q = query(
        collection(db, "proformas"),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);

      const proformaList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setProformas(proformaList);
    } catch (error) {
      console.error("Error fetching proformas:", error);
    } finally {
      setLoadingProformas(false);
    }
  };

  // Activity dialog açıldığında proforma tipiyse proformaları yükle
  useEffect(() => {
    if (showActivityDialog && newActivity.type === "proforma") {
      fetchProformas();
    }
  }, [showActivityDialog, newActivity.type]);

  // Yeni activity ekle
  const handleAddActivity = async () => {
    if (!newActivity.type || !newActivity.title) return;

    try {
      const activityData = {
        type: newActivity.type,
        title: newActivity.title,
        description: newActivity.description,
        performedBy: user?.displayName || user?.email || "Sistem",
        performedById: user?.uid,
        createdAt: new Date(),
        ...(newActivity.relatedProformaId && {
          relatedProformaId: newActivity.relatedProformaId,
          relatedProformaNumber: proformas.find(
            (p) => p.id === newActivity.relatedProformaId
          )?.proformaNumber,
        }),
      };

      // Request'e activities array ekle veya güncelle
      const currentActivities = request.activities || [];
      const result = await updateRequest({
        activities: [...currentActivities, activityData],
        updatedAt: new Date(),
        updatedBy: user?.uid,
        updatedByName: user?.displayName || user?.email || "Sistem",
      });

      if (result.success) {
        setShowActivityDialog(false);
        setNewActivity({
          type: "",
          title: "",
          description: "",
          relatedProformaId: "",
          performedBy: user?.displayName || user?.email || "",
        });
      }
    } catch (error) {
      console.error("Error adding activity:", error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case REQUEST_STATUS.NEW:
        return "bg-blue-100 text-blue-800 border-blue-200";
      case REQUEST_STATUS.ASSIGNED:
        return "bg-purple-100 text-purple-800 border-purple-200";
      case REQUEST_STATUS.IN_PROGRESS:
        return "bg-orange-100 text-orange-800 border-orange-200";
      case REQUEST_STATUS.WAITING_CLIENT:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case REQUEST_STATUS.QUOTATION_SENT:
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case REQUEST_STATUS.APPROVED:
        return "bg-green-100 text-green-800 border-green-200";
      case REQUEST_STATUS.REJECTED:
        return "bg-red-100 text-red-800 border-red-200";
      case REQUEST_STATUS.COMPLETED:
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case REQUEST_STATUS.CANCELLED:
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
    }).format(amount || 0);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "-";

    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Mevcut duruma göre bir sonraki geçerli durumları getir
  const getNextStatuses = (currentStatus) => {
    const statusWorkflow = {
      [REQUEST_STATUS.NEW]: [
        { value: REQUEST_STATUS.ASSIGNED, label: "👤 Atandı", icon: "User" },
        {
          value: REQUEST_STATUS.IN_PROGRESS,
          label: "⚙️ İşleme Al",
          icon: "Play",
        },
      ],
      [REQUEST_STATUS.ASSIGNED]: [
        {
          value: REQUEST_STATUS.IN_PROGRESS,
          label: "⚙️ İşleme Al",
          icon: "Play",
        },
      ],
      [REQUEST_STATUS.IN_PROGRESS]: [
        {
          value: REQUEST_STATUS.WAITING_CLIENT,
          label: "⏳ Müşteri Bekle",
          icon: "Clock",
        },
        {
          value: REQUEST_STATUS.QUOTATION_SENT,
          label: "💰 Teklif Gönder",
          icon: "Send",
        },
        { value: REQUEST_STATUS.CANCELLED, label: "🚫 İptal Et", icon: "X" },
      ],
      [REQUEST_STATUS.WAITING_CLIENT]: [
        {
          value: REQUEST_STATUS.IN_PROGRESS,
          label: "⚙️ İşleme Devam",
          icon: "Play",
        },
        {
          value: REQUEST_STATUS.QUOTATION_SENT,
          label: "💰 Teklif Gönder",
          icon: "Send",
        },
        { value: REQUEST_STATUS.CANCELLED, label: "🚫 İptal Et", icon: "X" },
      ],
      [REQUEST_STATUS.QUOTATION_SENT]: [
        {
          value: REQUEST_STATUS.APPROVED,
          label: "✅ Onayla",
          icon: "CheckCircle",
        },
        { value: REQUEST_STATUS.REJECTED, label: "❌ Reddet", icon: "XCircle" },
        { value: REQUEST_STATUS.CANCELLED, label: "🚫 İptal Et", icon: "X" },
      ],
      [REQUEST_STATUS.APPROVED]: [
        {
          value: REQUEST_STATUS.COMPLETED,
          label: "🎉 Tamamla",
          icon: "CheckCircle2",
        },
      ],
      [REQUEST_STATUS.REJECTED]: [],
      [REQUEST_STATUS.COMPLETED]: [],
      [REQUEST_STATUS.CANCELLED]: [],
    };

    return statusWorkflow[currentStatus] || [];
  };

  // Activity tipleri
  const getActivityTypes = () => [
    { value: "meeting", label: "👥 Görüşme", icon: Users, color: "blue" },
    {
      value: "phone_call",
      label: "📞 Telefon Görüşmesi",
      icon: PhoneCall,
      color: "green",
    },
    {
      value: "video_call",
      label: "🎥 Video Görüşme",
      icon: Video,
      color: "purple",
    },
    {
      value: "email",
      label: "📧 E-posta Gönderildi",
      icon: Mail,
      color: "orange",
    },
    {
      value: "whatsapp",
      label: "💬 WhatsApp Mesajı",
      icon: MessageSquareText,
      color: "emerald",
    },
    {
      value: "proforma",
      label: "📄 Proforma Oluşturuldu",
      icon: FileText,
      color: "indigo",
    },
    {
      value: "quotation",
      label: "💰 Teklif Hazırlandı",
      icon: DollarSign,
      color: "amber",
    },
    {
      value: "sample_sent",
      label: "📦 Numune Gönderildi",
      icon: Package,
      color: "cyan",
    },
    {
      value: "contract",
      label: "📝 Sözleşme İmzalandı",
      icon: FileCheck,
      color: "teal",
    },
    {
      value: "delivery",
      label: "🚚 Teslimat Yapıldı",
      icon: Truck,
      color: "violet",
    },
    {
      value: "payment",
      label: "💳 Ödeme Alındı",
      icon: CreditCard,
      color: "green",
    },
    { value: "other", label: "📌 Diğer", icon: Star, color: "gray" },
  ];

  // Activity icon ve renk getir
  const getActivityConfig = (type) => {
    const types = getActivityTypes();
    return types.find((t) => t.value === type) || types[types.length - 1];
  };

  if (!canView) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-gray-900 dark:via-blue-900/10 dark:to-gray-900">
        <div className="flex items-center justify-center h-screen">
          <Card className="max-w-md w-full mx-4 bg-white dark:bg-gray-800 border-none shadow-lg">
            <CardContent className="pt-6 text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 mb-2">
                <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Erişim Engellendi
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Bu sayfayı görüntüleme yetkiniz bulunmamaktadır.
              </p>
              <Button
                onClick={() => router.push("/admin/requests")}
                variant="outline"
                className="mt-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Taleplere Dön
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-gray-900 dark:via-blue-900/10 dark:to-gray-900">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 dark:text-blue-400 mx-auto" />
            <p className="text-gray-600 dark:text-gray-400 font-medium">
              Talep yükleniyor...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-gray-900 dark:via-blue-900/10 dark:to-gray-900">
        <div className="flex items-center justify-center h-screen">
          <Card className="max-w-md w-full mx-4 bg-white dark:bg-gray-800 border-none shadow-lg">
            <CardContent className="pt-6 text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 mb-2">
                <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Talep Bulunamadı
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {error || "Belirtilen talep bulunamadı."}
              </p>
              <Button
                onClick={() => router.push("/admin/requests")}
                variant="outline"
                className="mt-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Taleplere Dön
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-gray-900 dark:via-blue-900/10 dark:to-gray-900">
      {/* Modern Sticky Header */}
      <div className="backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/admin/requests")}
                className="hover:bg-blue-50 dark:hover:bg-blue-900/20"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Geri
              </Button>
              <div className="flex items-center gap-3">
                <div
                  className={`bg-gradient-to-br rounded-lg p-2 shadow-md ${
                    request.category === "cosmetic_manufacturing"
                      ? "from-pink-500 to-pink-600"
                      : request.category === "supplement_manufacturing"
                      ? "from-green-500 to-green-600"
                      : request.category === "cleaning_manufacturing"
                      ? "from-blue-500 to-blue-600"
                      : request.category === "packaging_supply"
                      ? "from-amber-500 to-amber-600"
                      : request.category === "ecommerce_operations"
                      ? "from-purple-500 to-purple-600"
                      : request.category === "digital_marketing"
                      ? "from-red-500 to-red-600"
                      : request.category === "formulation_development"
                      ? "from-cyan-500 to-cyan-600"
                      : "from-indigo-500 to-indigo-600"
                  }`}
                >
                  {getCategoryIconComponent(request.category)}
                  <span className="sr-only">
                    {getRequestCategoryLabel(request.category)}
                  </span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white line-clamp-1">
                    {request.title}
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                      #{request.requestNumber}
                    </span>
                    <Badge
                      variant="outline"
                      className={`${getStatusColor(
                        request.status
                      )} border text-xs`}
                    >
                      {getRequestStatusLabel(request.status)}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {canEdit && (
              <Button
                onClick={() => router.push(`/admin/requests/${params.id}/edit`)}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md"
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Düzenle
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-5 bg-white/80 dark:bg-gray-800/80 p-1 rounded-xl shadow-sm backdrop-blur-sm border border-gray-200 dark:border-gray-700">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg transition-all"
            >
              <Activity className="h-4 w-4 mr-2" />
              Genel Bakış
            </TabsTrigger>
            <TabsTrigger
              value="category-details"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg transition-all"
            >
              <Package className="h-4 w-4 mr-2" />
              Kategori Detayları
            </TabsTrigger>
            <TabsTrigger
              value="activities"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg transition-all"
            >
              <Target className="h-4 w-4 mr-2" />
              Eylemler
            </TabsTrigger>
            <TabsTrigger
              value="notes"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-amber-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg transition-all"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Notlar ({request.notes?.length || 0})
            </TabsTrigger>
            <TabsTrigger
              value="follow-ups"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-red-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg transition-all"
            >
              <Clock className="h-4 w-4 mr-2" />
              Takip ({request.followUps?.length || 0})
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Left Column */}
              <div className="xl:col-span-2 space-y-6">
                {/* Talep Bilgileri */}
                <Card className="bg-white dark:bg-gray-800 border-none shadow-lg">
                  <CardHeader className="border-b border-gray-100 dark:border-gray-700 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-lg p-2 shadow-md">
                        <FileText className="h-5 w-5 text-white" />
                      </div>
                      <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                        Talep Bilgileri
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-5">
                    <div className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-blue-50/30 dark:from-gray-800/50 dark:to-blue-900/10 border border-gray-200 dark:border-gray-700">
                      <Label className="text-sm font-semibold text-gray-900 dark:text-white mb-3 block">
                        Açıklama
                      </Label>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {request.description}
                      </p>
                    </div>

                    {request.requirements && (
                      <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50/30 dark:from-blue-900/20 dark:to-purple-900/10 border border-blue-200 dark:border-blue-800">
                        <Label className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-3 flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4" />
                          Özel Gereksinimler
                        </Label>
                        <p className="text-blue-800 dark:text-blue-300 leading-relaxed">
                          {request.requirements}
                        </p>
                      </div>
                    )}

                    {request.additionalNotes && (
                      <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50/30 dark:from-amber-900/20 dark:to-orange-900/10 border border-amber-200 dark:border-amber-800">
                        <Label className="text-sm font-semibold text-amber-900 dark:text-amber-200 mb-3 flex items-center gap-2">
                          <Star className="h-4 w-4" />
                          Ek Notlar
                        </Label>
                        <p className="text-amber-800 dark:text-amber-300 leading-relaxed">
                          {request.additionalNotes}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* İletişim Bilgileri */}
                <Card className="bg-white dark:bg-gray-800 border-none shadow-lg">
                  <CardHeader className="border-b border-gray-100 dark:border-gray-700 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-gradient-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 rounded-lg p-2 shadow-md">
                        <Building2 className="h-5 w-5 text-white" />
                      </div>
                      <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                        İletişim Bilgileri
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-blue-50/30 dark:from-gray-800/50 dark:to-blue-900/10 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="flex-1">
                            <Label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">
                              Firma
                            </Label>
                            <p className="text-gray-900 dark:text-white font-semibold">
                              {request.companyName}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-purple-50/30 dark:from-gray-800/50 dark:to-purple-900/10 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                            <User className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div className="flex-1">
                            <Label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">
                              İletişim Kişisi
                            </Label>
                            <p className="text-gray-900 dark:text-white font-semibold">
                              {request.contactPerson || "-"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-green-50/30 dark:from-gray-800/50 dark:to-green-900/10 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <Mail className="h-5 w-5 text-green-600 dark:text-green-400" />
                          </div>
                          <div className="flex-1">
                            <Label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">
                              E-posta
                            </Label>
                            <p className="text-gray-900 dark:text-white font-semibold text-sm break-all">
                              {request.contactEmail}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-amber-50/30 dark:from-gray-800/50 dark:to-amber-900/10 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                            <Phone className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                          </div>
                          <div className="flex-1">
                            <Label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">
                              Telefon
                            </Label>
                            <p className="text-gray-900 dark:text-white font-semibold">
                              {request.contactPhone || "-"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Sidebar */}
              <div className="xl:col-span-1">
                <div className="sticky top-24 space-y-6">
                  {/* Durum & Yönetim */}
                  <Card className="bg-white dark:bg-gray-800 border-none shadow-lg">
                    <CardHeader className="border-b border-gray-100 dark:border-gray-700 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 rounded-lg p-2 shadow-md">
                          <Target className="h-5 w-5 text-white" />
                        </div>
                        <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">
                          Durum & Yönetim
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                      {isEditing ? (
                        <>
                          <div>
                            <Label className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                              Durum
                            </Label>
                            <Select
                              value={editData.status}
                              onValueChange={(value) =>
                                setEditData((prev) => ({
                                  ...prev,
                                  status: value,
                                }))
                              }
                            >
                              <SelectTrigger className="bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.values(REQUEST_STATUS).map((status) => (
                                  <SelectItem key={status} value={status}>
                                    {getRequestStatusLabel(status)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                              Atanan Kişi
                            </Label>
                            <Input
                              value={editData.assignedTo}
                              onChange={(e) =>
                                setEditData((prev) => ({
                                  ...prev,
                                  assignedTo: e.target.value,
                                }))
                              }
                              placeholder="Atanan kişi"
                              className="bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700"
                            />
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50/30 dark:from-blue-900/20 dark:to-purple-900/10 border border-blue-200 dark:border-blue-800">
                            <Label className="text-xs text-gray-600 dark:text-gray-400 mb-2 block">
                              Mevcut Durum
                            </Label>
                            <Badge
                              variant="outline"
                              className={`${getStatusColor(
                                request.status
                              )} border font-semibold text-base px-4 py-2 w-full justify-center`}
                            >
                              {getRequestStatusLabel(request.status)}
                            </Badge>
                          </div>

                          {/* Durum Güncelleme - Workflow Based */}
                          {canEdit &&
                            getNextStatuses(request.status).length > 0 && (
                              <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50/30 dark:from-green-900/20 dark:to-emerald-900/10 border-2 border-green-200 dark:border-green-800">
                                <p className="text-sm font-semibold text-green-900 dark:text-green-100 mb-3 flex items-center gap-2">
                                  <TrendingUp className="h-4 w-4" />
                                  Sonraki İşlem
                                </p>
                                <Select
                                  value={newStatus}
                                  onValueChange={(value) => {
                                    setNewStatus(value);
                                    handleStatusChange(value);
                                  }}
                                >
                                  <SelectTrigger className="border-2 h-11 bg-white dark:bg-gray-800">
                                    <SelectValue placeholder="İşlem seç..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {getNextStatuses(request.status).map(
                                      (status) => (
                                        <SelectItem
                                          key={status.value}
                                          value={status.value}
                                        >
                                          {status.label}
                                        </SelectItem>
                                      )
                                    )}
                                  </SelectContent>
                                </Select>
                                <p className="text-xs text-green-700 dark:text-green-300 mt-2">
                                  Sadece sonraki geçerli durumlar gösteriliyor
                                </p>
                              </div>
                            )}

                          {/* Terminal Durum Mesajı */}
                          {canEdit &&
                            getNextStatuses(request.status).length === 0 && (
                              <div className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 border-2 border-gray-300 dark:border-gray-700">
                                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                  <CheckCircle2 className="h-4 w-4" />
                                  Durum Tamamlandı
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                  Bu talep son durumunda. Daha fazla işlem
                                  yapılamaz.
                                </p>
                              </div>
                            )}

                          <div className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-blue-50/30 dark:from-gray-800/50 dark:to-blue-900/10 border border-gray-200 dark:border-gray-700">
                            <Label className="text-xs text-gray-600 dark:text-gray-400 mb-2 block">
                              Öncelik
                            </Label>
                            <p className="text-gray-900 dark:text-white font-semibold">
                              {getRequestPriorityLabel(request.priority)}
                            </p>
                          </div>

                          <div className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-green-50/30 dark:from-gray-800/50 dark:to-green-900/10 border border-gray-200 dark:border-gray-700">
                            <Label className="text-xs text-gray-600 dark:text-gray-400 mb-2 block">
                              Kaynak
                            </Label>
                            <p className="text-gray-900 dark:text-white font-semibold">
                              {getRequestSourceLabel(request.source)}
                            </p>
                          </div>

                          {request.assignedTo && (
                            <div className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-purple-50/30 dark:from-gray-800/50 dark:to-purple-900/10 border border-gray-200 dark:border-gray-700">
                              <Label className="text-xs text-gray-600 dark:text-gray-400 mb-2 block">
                                Atanan Kişi
                              </Label>
                              <p className="text-gray-900 dark:text-white font-semibold">
                                {request.assignedTo}
                              </p>
                            </div>
                          )}
                        </>
                      )}
                    </CardContent>
                  </Card>

                  {/* Finansal Bilgiler */}
                  <Card className="bg-white dark:bg-gray-800 border-none shadow-lg">
                    <CardHeader className="border-b border-gray-100 dark:border-gray-700 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 rounded-lg p-2 shadow-md">
                          <DollarSign className="h-5 w-5 text-white" />
                        </div>
                        <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">
                          Finansal Bilgiler
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                      {isEditing ? (
                        <>
                          <div>
                            <Label className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                              Tahmini Değer (TL)
                            </Label>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={editData.estimatedValue}
                              onChange={(e) =>
                                setEditData((prev) => ({
                                  ...prev,
                                  estimatedValue:
                                    parseFloat(e.target.value) || 0,
                                }))
                              }
                              className="bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700"
                            />
                          </div>

                          <div>
                            <Label className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                              Gerçek Değer (TL)
                            </Label>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={editData.actualValue}
                              onChange={(e) =>
                                setEditData((prev) => ({
                                  ...prev,
                                  actualValue: parseFloat(e.target.value) || 0,
                                }))
                              }
                              className="bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700"
                            />
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50/30 dark:from-amber-900/20 dark:to-orange-900/10 border border-amber-200 dark:border-amber-800">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                                <DollarSign className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                              </div>
                              <div className="flex-1">
                                <Label className="text-xs text-amber-600 dark:text-amber-400 mb-1 block">
                                  Tahmini Değer
                                </Label>
                                <p className="text-amber-900 dark:text-amber-200 font-bold text-lg">
                                  {formatCurrency(request.estimatedValue)}
                                </p>
                              </div>
                            </div>
                          </div>

                          {request.actualValue > 0 && (
                            <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50/30 dark:from-green-900/20 dark:to-emerald-900/10 border border-green-200 dark:border-green-800">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                  <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                                </div>
                                <div className="flex-1">
                                  <Label className="text-xs text-green-600 dark:text-green-400 mb-1 block">
                                    Gerçek Değer
                                  </Label>
                                  <p className="text-green-900 dark:text-green-200 font-bold text-lg">
                                    {formatCurrency(request.actualValue)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50/30 dark:from-blue-900/20 dark:to-cyan-900/10 border border-blue-200 dark:border-blue-800">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div className="flex-1">
                                <Label className="text-xs text-blue-600 dark:text-blue-400 mb-1 block">
                                  Oluşturulma
                                </Label>
                                <p className="text-blue-900 dark:text-blue-200 font-semibold text-sm">
                                  {formatDate(request.createdAt)}
                                </p>
                              </div>
                            </div>
                          </div>

                          {request.expectedDelivery && (
                            <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-violet-50/30 dark:from-purple-900/20 dark:to-violet-900/10 border border-purple-200 dark:border-purple-800">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                  <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div className="flex-1">
                                  <Label className="text-xs text-purple-600 dark:text-purple-400 mb-1 block">
                                    Beklenen Teslimat
                                  </Label>
                                  <p className="text-purple-900 dark:text-purple-200 font-semibold">
                                    {request.expectedDelivery}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="category-details" className="space-y-6">
            <Card className="bg-white dark:bg-gray-800 border-none shadow-lg">
              <CardHeader className="border-b border-gray-100 dark:border-gray-700 pb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 rounded-lg p-2 shadow-md">
                    {getCategoryIconComponent(request.category)}
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      {getRequestCategoryLabel(request.category)} - Özel
                      Bilgiler
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400">
                      Bu kategoriye özel olarak girilen detaylar
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {request.categorySpecificData ? (
                  renderCategorySpecificData(
                    request.categorySpecificData,
                    request.category
                  )
                ) : (
                  <div className="text-center py-16">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 mb-4">
                      <div className="text-purple-600 dark:text-purple-400">
                        {getCategoryIconComponent(request.category)}
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Kategori Özel Veri Bulunmuyor
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-1">
                      Bu talep için kategori özel veri bulunmuyor.
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      Talep eski sistemde oluşturulmuş olabilir veya kategori
                      özel alanlar doldurulmamış olabilir.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="details" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Talep Detayları */}
              <Card className="bg-white dark:bg-gray-800 border-none shadow-lg">
                <CardHeader className="border-b border-gray-100 dark:border-gray-700 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-lg p-2 shadow-md">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                      Talep Detayları
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg bg-gradient-to-br from-gray-50 to-blue-50/30 dark:from-gray-800/50 dark:to-blue-900/10 border border-gray-200 dark:border-gray-700">
                      <Label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 block">
                        Talep ID
                      </Label>
                      <p className="text-gray-900 dark:text-white font-mono text-sm">
                        {request.id}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-gradient-to-br from-gray-50 to-purple-50/30 dark:from-gray-800/50 dark:to-purple-900/10 border border-gray-200 dark:border-gray-700">
                      <Label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 block">
                        Talep Numarası
                      </Label>
                      <p className="text-gray-900 dark:text-white font-semibold">
                        #{request.requestNumber}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-gradient-to-br from-gray-50 to-green-50/30 dark:from-gray-800/50 dark:to-green-900/10 border border-gray-200 dark:border-gray-700">
                      <Label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 block">
                        Kategori
                      </Label>
                      <p className="text-gray-900 dark:text-white font-medium">
                        {getRequestCategoryLabel(request.category)}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-gradient-to-br from-gray-50 to-amber-50/30 dark:from-gray-800/50 dark:to-amber-900/10 border border-gray-200 dark:border-gray-700">
                      <Label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 block">
                        Öncelik
                      </Label>
                      <p className="text-gray-900 dark:text-white font-medium">
                        {getRequestPriorityLabel(request.priority)}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-gradient-to-br from-gray-50 to-cyan-50/30 dark:from-gray-800/50 dark:to-cyan-900/10 border border-gray-200 dark:border-gray-700">
                      <Label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 block">
                        Kaynak
                      </Label>
                      <p className="text-gray-900 dark:text-white font-medium">
                        {getRequestSourceLabel(request.source)}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-gradient-to-br from-gray-50 to-indigo-50/30 dark:from-gray-800/50 dark:to-indigo-900/10 border border-gray-200 dark:border-gray-700">
                      <Label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 block">
                        Durum
                      </Label>
                      <Badge
                        variant="outline"
                        className={`${getStatusColor(
                          request.status
                        )} font-semibold`}
                      >
                        {getRequestStatusLabel(request.status)}
                      </Badge>
                    </div>
                  </div>

                  {request.requirements && (
                    <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50/30 dark:from-blue-900/20 dark:to-purple-900/10 border border-blue-200 dark:border-blue-800">
                      <Label className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2 block">
                        Özel Gereksinimler
                      </Label>
                      <p className="text-blue-800 dark:text-blue-300">
                        {request.requirements}
                      </p>
                    </div>
                  )}

                  {request.additionalNotes && (
                    <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50/30 dark:from-amber-900/20 dark:to-orange-900/10 border border-amber-200 dark:border-amber-800">
                      <Label className="text-sm font-semibold text-amber-900 dark:text-amber-200 mb-2 block">
                        Ek Notlar
                      </Label>
                      <p className="text-amber-800 dark:text-amber-300">
                        {request.additionalNotes}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Firma Detayları */}
              <Card className="bg-white dark:bg-gray-800 border-none shadow-lg">
                <CardHeader className="border-b border-gray-100 dark:border-gray-700 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 rounded-lg p-2 shadow-md">
                      <Building2 className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                      Firma Detayları
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-blue-50/30 dark:from-gray-800/50 dark:to-blue-900/10 border border-gray-200 dark:border-gray-700">
                    <Label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 block">
                      Firma Adı
                    </Label>
                    <p className="text-gray-900 dark:text-white font-bold text-lg">
                      {request.companyName}
                    </p>
                  </div>

                  {request.companyId && (
                    <div className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-purple-50/30 dark:from-gray-800/50 dark:to-purple-900/10 border border-gray-200 dark:border-gray-700">
                      <Label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 block">
                        Firma ID
                      </Label>
                      <p className="text-gray-900 dark:text-white font-mono text-sm">
                        {request.companyId}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-4">
                    <div className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-green-50/30 dark:from-gray-800/50 dark:to-green-900/10 border border-gray-200 dark:border-gray-700">
                      <Label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 block">
                        İletişim Kişisi
                      </Label>
                      <p className="text-gray-900 dark:text-white font-medium">
                        {request.contactPerson || "-"}
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-amber-50/30 dark:from-gray-800/50 dark:to-amber-900/10 border border-gray-200 dark:border-gray-700">
                      <Label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 block">
                        E-posta
                      </Label>
                      <p className="text-gray-900 dark:text-white font-medium break-all">
                        {request.contactEmail}
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-cyan-50/30 dark:from-gray-800/50 dark:to-cyan-900/10 border border-gray-200 dark:border-gray-700">
                      <Label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 block">
                        Telefon
                      </Label>
                      <p className="text-gray-900 dark:text-white font-medium">
                        {request.contactPhone || "-"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Değer ve Tarihler */}
              <Card className="bg-white dark:bg-gray-800 border-none shadow-lg">
                <CardHeader className="border-b border-gray-100 dark:border-gray-700 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-amber-500 to-amber-600 dark:from-amber-600 dark:to-amber-700 rounded-lg p-2 shadow-md">
                      <DollarSign className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                      Değer ve Tarihler
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50/30 dark:from-amber-900/20 dark:to-orange-900/10 border border-amber-200 dark:border-amber-800">
                      <Label className="text-xs font-semibold text-amber-600 dark:text-amber-400 mb-2 block">
                        Tahmini Değer
                      </Label>
                      <p className="text-amber-900 dark:text-amber-200 font-bold text-lg">
                        {formatCurrency(request.estimatedValue)}
                      </p>
                    </div>
                    {request.actualValue > 0 && (
                      <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50/30 dark:from-green-900/20 dark:to-emerald-900/10 border border-green-200 dark:border-green-800">
                        <Label className="text-xs font-semibold text-green-600 dark:text-green-400 mb-2 block">
                          Gerçek Değer
                        </Label>
                        <p className="text-green-900 dark:text-green-200 font-bold text-lg">
                          {formatCurrency(request.actualValue)}
                        </p>
                      </div>
                    )}
                    <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50/30 dark:from-blue-900/20 dark:to-cyan-900/10 border border-blue-200 dark:border-blue-800">
                      <Label className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-2 block">
                        Oluşturulma Tarihi
                      </Label>
                      <p className="text-blue-900 dark:text-blue-200 font-semibold">
                        {formatDate(request.createdAt)}
                      </p>
                    </div>
                    {request.updatedAt && (
                      <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-violet-50/30 dark:from-purple-900/20 dark:to-violet-900/10 border border-purple-200 dark:border-purple-800">
                        <Label className="text-xs font-semibold text-purple-600 dark:text-purple-400 mb-2 block">
                          Son Güncellenme
                        </Label>
                        <p className="text-purple-900 dark:text-purple-200 font-semibold">
                          {formatDate(request.updatedAt)}
                        </p>
                      </div>
                    )}
                    {request.expectedDelivery && (
                      <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50/30 dark:from-indigo-900/20 dark:to-blue-900/10 border border-indigo-200 dark:border-indigo-800 col-span-2">
                        <Label className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-2 block">
                          Beklenen Teslim
                        </Label>
                        <p className="text-indigo-900 dark:text-indigo-200 font-semibold">
                          {formatDate(request.expectedDelivery)}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* İstatistikler */}
              <Card className="lg:col-span-2 bg-white dark:bg-gray-800 border-none shadow-lg">
                <CardHeader className="border-b border-gray-100 dark:border-gray-700 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-700 rounded-lg p-2 shadow-md">
                      <Activity className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                      İstatistikler
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-6 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/30 border border-blue-200 dark:border-blue-800">
                      <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                        {request.notes?.length || 0}
                      </div>
                      <div className="text-sm font-medium text-blue-800 dark:text-blue-300">
                        Toplam Not
                      </div>
                    </div>
                    <div className="text-center p-6 rounded-xl bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/30 border border-green-200 dark:border-green-800">
                      <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
                        {request.followUps?.length || 0}
                      </div>
                      <div className="text-sm font-medium text-green-800 dark:text-green-300">
                        Takip Planı
                      </div>
                    </div>
                    <div className="text-center p-6 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-900/20 dark:to-orange-800/30 border border-orange-200 dark:border-orange-800">
                      <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-1">
                        {request.documents?.length || 0}
                      </div>
                      <div className="text-sm font-medium text-orange-800 dark:text-orange-300">
                        Belge
                      </div>
                    </div>
                    <div className="text-center p-6 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/30 border border-purple-200 dark:border-purple-800">
                      <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                        {request.updatedAt
                          ? Math.ceil(
                              (new Date() -
                                new Date(
                                  request.updatedAt?.seconds
                                    ? request.updatedAt.seconds * 1000
                                    : request.updatedAt
                                )) /
                                (1000 * 60 * 60 * 24)
                            )
                          : 0}
                      </div>
                      <div className="text-sm font-medium text-purple-800 dark:text-purple-300">
                        Gün Önce Güncellendi
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Activities Tab */}
          <TabsContent value="activities" className="space-y-6">
            <Card className="bg-white dark:bg-gray-800 border-none shadow-lg">
              <CardHeader className="border-b border-gray-100 dark:border-gray-700 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 rounded-lg p-2 shadow-md">
                      <Target className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                        Talep Eylemleri
                      </CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-400">
                        Bu talep için gerçekleştirilen tüm işlemler ve eylemler
                      </CardDescription>
                    </div>
                  </div>

                  {/* Yeni Eylem Ekle Dialog */}
                  {canEdit && (
                    <Dialog
                      open={showActivityDialog}
                      onOpenChange={setShowActivityDialog}
                    >
                      <DialogTrigger asChild>
                        <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-md">
                          <Plus className="h-4 w-4 mr-2" />
                          Yeni Eylem
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-white dark:bg-gray-800 max-w-2xl">
                        <DialogHeader>
                          <DialogTitle className="text-gray-900 dark:text-white text-xl font-bold">
                            Yeni Eylem Ekle
                          </DialogTitle>
                          <DialogDescription className="text-gray-600 dark:text-gray-400">
                            Talep için gerçekleştirilen eylemi kaydedin
                          </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                          {/* Eylem Tipi */}
                          <div>
                            <Label className="text-sm font-semibold text-gray-900 dark:text-white mb-2 block">
                              Eylem Tipi *
                            </Label>
                            <Select
                              value={newActivity.type}
                              onValueChange={(value) =>
                                setNewActivity((prev) => ({
                                  ...prev,
                                  type: value,
                                }))
                              }
                            >
                              <SelectTrigger className="border-2">
                                <SelectValue placeholder="Eylem tipi seçin..." />
                              </SelectTrigger>
                              <SelectContent>
                                {getActivityTypes().map((type) => (
                                  <SelectItem
                                    key={type.value}
                                    value={type.value}
                                  >
                                    {type.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Başlık */}
                          <div>
                            <Label className="text-sm font-semibold text-gray-900 dark:text-white mb-2 block">
                              Başlık *
                            </Label>
                            <Input
                              placeholder="Örn: Müşteri ile görüşme yapıldı"
                              value={newActivity.title}
                              onChange={(e) =>
                                setNewActivity((prev) => ({
                                  ...prev,
                                  title: e.target.value,
                                }))
                              }
                              className="border-2"
                            />
                          </div>

                          {/* Açıklama */}
                          <div>
                            <Label className="text-sm font-semibold text-gray-900 dark:text-white mb-2 block">
                              Açıklama
                            </Label>
                            <Textarea
                              placeholder="Detaylı açıklama yazın..."
                              value={newActivity.description}
                              onChange={(e) =>
                                setNewActivity((prev) => ({
                                  ...prev,
                                  description: e.target.value,
                                }))
                              }
                              rows={3}
                              className="border-2"
                            />
                          </div>

                          {/* Proforma Seçimi - Sadece proforma tipinde göster */}
                          {newActivity.type === "proforma" && (
                            <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100/30 dark:from-indigo-900/20 dark:to-indigo-800/10 border-2 border-indigo-200 dark:border-indigo-800">
                              <Label className="text-sm font-semibold text-indigo-900 dark:text-indigo-200 mb-3 block">
                                İlgili Proforma
                              </Label>
                              {loadingProformas ? (
                                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  Proformalar yükleniyor...
                                </div>
                              ) : (
                                <Select
                                  value={newActivity.relatedProformaId}
                                  onValueChange={(value) =>
                                    setNewActivity((prev) => ({
                                      ...prev,
                                      relatedProformaId: value,
                                    }))
                                  }
                                >
                                  <SelectTrigger className="border-2 bg-white dark:bg-gray-800">
                                    <SelectValue placeholder="Proforma seçin (opsiyonel)" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {proformas.map((proforma) => (
                                      <SelectItem
                                        key={proforma.id}
                                        value={proforma.id}
                                      >
                                        {proforma.proformaNumber} -{" "}
                                        {proforma.customerInfo?.companyName}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            </div>
                          )}

                          {/* Gerçekleştiren */}
                          <div>
                            <Label className="text-sm font-semibold text-gray-900 dark:text-white mb-2 block">
                              Gerçekleştiren
                            </Label>
                            <Input
                              value={newActivity.performedBy}
                              onChange={(e) =>
                                setNewActivity((prev) => ({
                                  ...prev,
                                  performedBy: e.target.value,
                                }))
                              }
                              className="border-2"
                              placeholder="Adınız"
                            />
                          </div>
                        </div>

                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setShowActivityDialog(false);
                              setNewActivity({
                                type: "",
                                title: "",
                                description: "",
                                relatedProformaId: "",
                                performedBy:
                                  user?.displayName || user?.email || "",
                              });
                            }}
                            className="border-2"
                          >
                            İptal
                          </Button>
                          <Button
                            onClick={handleAddActivity}
                            disabled={!newActivity.type || !newActivity.title}
                            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
                          >
                            <Save className="h-4 w-4 mr-2" />
                            Kaydet
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {/* Timeline */}
                <div className="relative space-y-6">
                  {/* Timeline Line */}
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-green-200 via-blue-200 to-purple-200 dark:from-green-800 dark:via-blue-800 dark:to-purple-800"></div>

                  {/* Talep Oluşturuldu */}
                  <div className="relative pl-16">
                    <div className="absolute left-0 top-1 bg-gradient-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 rounded-full p-3 shadow-lg">
                      <CheckCircle2 className="h-6 w-6 text-white" />
                    </div>
                    <div className="p-5 rounded-xl bg-gradient-to-br from-white to-green-50/30 dark:from-gray-800/80 dark:to-green-900/10 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          Talep Oluşturuldu
                        </h3>
                        <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {formatDate(request.createdAt)}
                        </span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 mb-3">
                        Talep sisteme kaydedildi ve işleme alındı.
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-full p-1.5">
                          <User className="h-3.5 w-3.5 text-white" />
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {request.createdByName || "Sistem"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Custom Activities - Eklenen eylemler */}
                  {request.activities &&
                    request.activities.length > 0 &&
                    request.activities.map((activity, index) => {
                      const config = getActivityConfig(activity.type);
                      const IconComponent = config.icon;
                      return (
                        <div key={index} className="relative pl-16">
                          <div
                            className={`absolute left-0 top-1 bg-gradient-to-br from-${config.color}-500 to-${config.color}-600 dark:from-${config.color}-600 dark:to-${config.color}-700 rounded-full p-3 shadow-lg`}
                          >
                            <IconComponent className="h-6 w-6 text-white" />
                          </div>
                          <div
                            className={`p-5 rounded-xl bg-gradient-to-br from-white to-${config.color}-50/30 dark:from-gray-800/80 dark:to-${config.color}-900/10 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                {activity.title}
                              </h3>
                              <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" />
                                {formatDate(activity.createdAt)}
                              </span>
                            </div>
                            {activity.description && (
                              <p className="text-gray-700 dark:text-gray-300 mb-3">
                                {activity.description}
                              </p>
                            )}
                            {activity.relatedProformaNumber && (
                              <div className="mb-3 p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800">
                                <Link
                                  href={`/admin/proformas/${activity.relatedProformaId}`}
                                  className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-2 transition-colors"
                                >
                                  <FileText className="h-4 w-4" />
                                  Proforma: {activity.relatedProformaNumber}
                                  <ArrowLeft className="h-3 w-3 rotate-180" />
                                </Link>
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <div
                                className={`bg-gradient-to-br from-${config.color}-500 to-${config.color}-600 rounded-full p-1.5`}
                              >
                                <User className="h-3.5 w-3.5 text-white" />
                              </div>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {activity.performedBy}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                  {/* Durum Değişiklikleri */}
                  {request.updatedAt &&
                    request.updatedAt !== request.createdAt && (
                      <div className="relative pl-16">
                        <div className="absolute left-0 top-1 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-full p-3 shadow-lg">
                          <Activity className="h-6 w-6 text-white" />
                        </div>
                        <div className="p-5 rounded-xl bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-800/80 dark:to-blue-900/10 border border-gray-200 dark:border-gray-700 shadow-sm">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                              Talep Güncellendi
                            </h3>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {formatDate(request.updatedAt)}
                            </span>
                          </div>
                          <p className="text-gray-700 dark:text-gray-300 mb-3">
                            Talep bilgileri güncellendi.
                          </p>
                          <div className="flex items-center gap-2">
                            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-full p-1.5">
                              <User className="h-3.5 w-3.5 text-white" />
                            </div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {request.updatedByName || "Sistem"}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                  {/* Not eklendi - son notu göster */}
                  {request.notes && request.notes.length > 0 && (
                    <div className="relative pl-16">
                      <div className="absolute left-0 top-1 bg-gradient-to-br from-amber-500 to-amber-600 dark:from-amber-600 dark:to-amber-700 rounded-full p-3 shadow-lg">
                        <MessageSquareText className="h-6 w-6 text-white" />
                      </div>
                      <div className="p-5 rounded-xl bg-gradient-to-br from-white to-amber-50/30 dark:from-gray-800/80 dark:to-amber-900/10 border border-gray-200 dark:border-gray-700 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                            Not Eklendi
                          </h3>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {formatDate(
                              request.notes[request.notes.length - 1]?.createdAt
                            )}
                          </span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 mb-3">
                          Talebe yeni bir not eklendi. Toplam{" "}
                          {request.notes.length} not mevcut.
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-full p-1.5">
                            <User className="h-3.5 w-3.5 text-white" />
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {request.notes[request.notes.length - 1]?.author}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Takip planı eklendi */}
                  {request.followUps && request.followUps.length > 0 && (
                    <div className="relative pl-16">
                      <div className="absolute left-0 top-1 bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 rounded-full p-3 shadow-lg">
                        <Calendar className="h-6 w-6 text-white" />
                      </div>
                      <div className="p-5 rounded-xl bg-gradient-to-br from-white to-purple-50/30 dark:from-gray-800/80 dark:to-purple-900/10 border border-gray-200 dark:border-gray-700 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                            Takip Planı Oluşturuldu
                          </h3>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {formatDate(
                              request.followUps[request.followUps.length - 1]
                                ?.createdAt
                            )}
                          </span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 mb-3">
                          Talep için takip planı oluşturuldu. Toplam{" "}
                          {request.followUps.length} takip mevcut.
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-full p-1.5">
                            <User className="h-3.5 w-3.5 text-white" />
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {
                              request.followUps[request.followUps.length - 1]
                                ?.createdByName
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Gelecekte eklenecek: Proforma oluşturuldu, Mail gönderildi, WhatsApp mesajı vs. */}
                  <div className="relative pl-16">
                    <div className="absolute left-0 top-1 bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 rounded-full p-3 shadow-lg">
                      <Zap className="h-6 w-6 text-white" />
                    </div>
                    <div className="p-5 rounded-xl bg-gradient-to-br from-white to-gray-50/30 dark:from-gray-800/80 dark:to-gray-900/10 border border-gray-200 dark:border-gray-700 shadow-sm border-dashed">
                      <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400 mb-2">
                        Daha Fazla Eylem Eklenecek
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Proforma oluşturma, mail gönderimi, WhatsApp mesajları
                        ve diğer eylemler bu zaman çizelgesine eklenecek.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notes" className="space-y-6">
            <Card className="bg-white dark:bg-gray-800 border-none shadow-lg">
              <CardHeader className="border-b border-gray-100 dark:border-gray-700 pb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-lg p-2 shadow-md">
                    <MessageSquareText className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                      Notlar
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400">
                      Talep ile ilgili notlar ve yorumlar
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-blue-50/30 dark:from-gray-800/50 dark:to-blue-900/10 border border-gray-200 dark:border-gray-700">
                  <Label className="text-sm font-semibold text-gray-900 dark:text-white mb-3 block">
                    Yeni Not Ekle
                  </Label>
                  <div className="flex gap-3">
                    <Textarea
                      placeholder="Yeni not ekle..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      rows={3}
                      className="flex-1 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                    />
                    <Button
                      onClick={handleAddNote}
                      disabled={!newNote.trim()}
                      className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md disabled:opacity-50"
                    >
                      <Plus className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  {request.notes?.map((note, index) => (
                    <div
                      key={index}
                      className="p-5 rounded-xl bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800/80 dark:to-gray-900/30 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2">
                          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-full p-1.5">
                            <User className="h-3.5 w-3.5 text-white" />
                          </div>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {note.author}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                          <Clock className="h-3.5 w-3.5" />
                          {formatDate(note.createdAt)}
                        </div>
                      </div>
                      <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                        {note.content}
                      </p>
                    </div>
                  ))}
                  {(!request.notes || request.notes.length === 0) && (
                    <div className="text-center py-12">
                      <div className="bg-gradient-to-br from-gray-100 to-blue-100/30 dark:from-gray-800/50 dark:to-blue-900/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <MessageSquareText className="h-8 w-8 text-gray-400 dark:text-gray-600" />
                      </div>
                      <p className="text-gray-500 dark:text-gray-400 font-medium">
                        Henüz not eklenmemiş.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="follow-ups" className="space-y-6">
            <Card className="bg-white dark:bg-gray-800 border-none shadow-lg">
              <CardHeader className="border-b border-gray-100 dark:border-gray-700 pb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 rounded-lg p-2 shadow-md">
                    <Calendar className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                      Takip Planları
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400">
                      Gelecekteki takip planları ve hatırlatmalar
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="p-5 rounded-xl bg-gradient-to-br from-gray-50 to-green-50/30 dark:from-gray-800/50 dark:to-green-900/10 border border-gray-200 dark:border-gray-700">
                  <Label className="text-sm font-semibold text-gray-900 dark:text-white mb-4 block">
                    Yeni Takip Ekle
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                        Takip Türü
                      </Label>
                      <Select
                        value={newFollowUp.type}
                        onValueChange={(value) =>
                          setNewFollowUp((prev) => ({ ...prev, type: value }))
                        }
                      >
                        <SelectTrigger className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="call">
                            Telefon Görüşmesi
                          </SelectItem>
                          <SelectItem value="email">E-posta</SelectItem>
                          <SelectItem value="meeting">Toplantı</SelectItem>
                          <SelectItem value="reminder">Hatırlatma</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                        Planlanan Tarih
                      </Label>
                      <Input
                        type="datetime-local"
                        value={newFollowUp.scheduledDate}
                        onChange={(e) =>
                          setNewFollowUp((prev) => ({
                            ...prev,
                            scheduledDate: e.target.value,
                          }))
                        }
                        className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                        Açıklama
                      </Label>
                      <Textarea
                        placeholder="Takip açıklaması..."
                        value={newFollowUp.description}
                        onChange={(e) =>
                          setNewFollowUp((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        rows={2}
                        className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Button
                        onClick={handleAddFollowUp}
                        disabled={!newFollowUp.description.trim()}
                        className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-md disabled:opacity-50"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Takip Ekle
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {request.followUps?.map((followUp, index) => (
                    <div
                      key={index}
                      className="p-5 rounded-xl bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800/80 dark:to-gray-900/30 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                          <Badge
                            variant="outline"
                            className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 border-green-300 dark:border-green-700 text-green-700 dark:text-green-300 font-semibold"
                          >
                            {followUp.type}
                          </Badge>
                          <div className="flex items-center gap-2">
                            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-full p-1.5">
                              <User className="h-3.5 w-3.5 text-white" />
                            </div>
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {followUp.createdByName}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDate(followUp.scheduledDate)}
                        </div>
                      </div>
                      <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                        {followUp.description}
                      </p>
                    </div>
                  ))}
                  {(!request.followUps || request.followUps.length === 0) && (
                    <div className="text-center py-12">
                      <div className="bg-gradient-to-br from-gray-100 to-green-100/30 dark:from-gray-800/50 dark:to-green-900/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <Calendar className="h-8 w-8 text-gray-400 dark:text-gray-600" />
                      </div>
                      <p className="text-gray-500 dark:text-gray-400 font-medium">
                        Henüz takip planı eklenmemiş.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
