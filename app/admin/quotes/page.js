"use client";

import { useState, useEffect } from "react";
import {
  PermissionGuard,
  usePermissions,
} from "../../../components/admin-route-guard";
import {
  getQuotes,
  updateQuoteStatus,
  updateQuotePriority,
  deleteQuote,
  getQuoteStats,
  searchQuotes,
} from "../../../lib/services/admin-quote-service";
import {
  FileText,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Mail,
  Phone,
  Building,
  Calendar,
  User,
  ChevronDown,
  RefreshCw,
} from "lucide-react";

const STATUS_CONFIG = {
  new: {
    label: "Yeni",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: AlertCircle,
    iconColor: "text-blue-600",
  },
  "in-progress": {
    label: "İşlemde",
    color: "bg-orange-100 text-orange-800 border-orange-200",
    icon: Clock,
    iconColor: "text-orange-600",
  },
  responded: {
    label: "Yanıtlandı",
    color: "bg-green-100 text-green-800 border-green-200",
    icon: CheckCircle,
    iconColor: "text-green-600",
  },
  closed: {
    label: "Kapatıldı",
    color: "bg-gray-100 text-gray-800 border-gray-200",
    icon: XCircle,
    iconColor: "text-gray-600",
  },
};

const PRIORITY_CONFIG = {
  low: { label: "Düşük", color: "bg-gray-100 text-gray-800" },
  normal: { label: "Normal", color: "bg-blue-100 text-blue-800" },
  high: { label: "Yüksek", color: "bg-orange-100 text-orange-800" },
  urgent: { label: "Acil", color: "bg-red-100 text-red-800" },
};

export default function QuotesPage() {
  const { hasPermission } = usePermissions();
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    inProgress: 0,
    responded: 0,
    closed: 0,
  });

  const canView = hasPermission("quotes.view");
  const canEdit = hasPermission("quotes.edit");
  const canDelete = hasPermission("quotes.delete");

  useEffect(() => {
    loadQuotes();
    loadStats();
  }, [statusFilter]);

  const loadQuotes = async () => {
    setLoading(true);
    try {
      const result = await getQuotes({
        status: statusFilter,
        limit: 50,
      });

      if (result.success) {
        setQuotes(result.quotes);
      }
    } catch (error) {
      // Error handling without console spam
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const result = await getQuoteStats();
      if (result.success) {
        setStats(result.stats);
      }
    } catch (error) {
      // Error handling without console spam
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadQuotes();
      return;
    }

    setLoading(true);
    try {
      const result = await searchQuotes(searchTerm);
      if (result.success) {
        setQuotes(result.quotes);
      }
    } catch (error) {
      // Error handling without console spam
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (quoteId, newStatus) => {
    try {
      const result = await updateQuoteStatus(quoteId, newStatus);
      if (result.success) {
        await loadQuotes();
        await loadStats();
      }
    } catch (error) {
      // Error handling without console spam
    }
  };

  const handlePriorityUpdate = async (quoteId, newPriority) => {
    try {
      const result = await updateQuotePriority(quoteId, newPriority);
      if (result.success) {
        await loadQuotes();
      }
    } catch (error) {
      // Error handling without console spam
    }
  };

  const handleDelete = async (quoteId) => {
    if (confirm("Bu quote isteğini silmek istediğinizden emin misiniz?")) {
      try {
        const result = await deleteQuote(quoteId);
        if (result.success) {
          await loadQuotes();
          await loadStats();
        }
      } catch (error) {
        // Error handling without console spam
      }
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "-";

    let date;
    if (timestamp.toDate) {
      date = timestamp.toDate();
    } else if (timestamp instanceof Date) {
      date = timestamp;
    } else {
      date = new Date(timestamp);
    }

    return date.toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Icon className={`h-6 w-6 ${color}`} />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                {title}
              </dt>
              <dd className="text-lg font-medium text-gray-900">{value}</dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );

  const QuoteRow = ({ quote }) => {
    const status = quote.metadata?.status || "new";
    const priority = quote.metadata?.priority || "normal";

    const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG["new"];
    const priorityConfig =
      PRIORITY_CONFIG[priority] || PRIORITY_CONFIG["normal"];
    const StatusIcon = statusConfig?.icon || AlertCircle;

    return (
      <tr className="hover:bg-gray-50">
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center">
            <div className="flex-shrink-0 h-10 w-10">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-900">
                {quote.contactInfo?.firstName} {quote.contactInfo?.lastName}
              </div>
              <div className="text-sm text-gray-500">
                {quote.contactInfo?.email}
              </div>
            </div>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-900">
            {quote.contactInfo?.company || "-"}
          </div>
          <div className="text-sm text-gray-500">
            {quote.projectInfo?.projectName || "-"}
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-900">
            {quote.projectInfo?.serviceArea || "-"}
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusConfig.color}`}
          >
            <StatusIcon className={`w-3 h-3 mr-1 ${statusConfig.iconColor}`} />
            {statusConfig.label}
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityConfig.color}`}
          >
            {priorityConfig.label}
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {formatDate(quote.createdAt)}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setSelectedQuote(quote);
                setShowQuoteModal(true);
              }}
              className="text-blue-600 hover:text-blue-900 p-1 rounded"
              title="Görüntüle"
            >
              <Eye className="h-4 w-4" />
            </button>
            <select
              value={quote.metadata?.status || "new"}
              onChange={(e) => handleStatusUpdate(quote.id, e.target.value)}
              className="text-xs border-gray-300 rounded px-2 py-1"
            >
              <option value="new">Yeni</option>
              <option value="in-progress">İşlemde</option>
              <option value="responded">Yanıtlandı</option>
              <option value="closed">Kapatıldı</option>
            </select>
            <button
              onClick={() => handleDelete(quote.id)}
              className="text-red-600 hover:text-red-900 p-1 rounded"
              title="Sil"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </td>
      </tr>
    );
  };

  const QuoteModal = ({ quote, isOpen, onClose }) => {
    if (!isOpen || !quote) return null;

    useEffect(() => {
      const handleEsc = (event) => {
        if (event.keyCode === 27) {
          onClose();
        }
      };

      if (isOpen) {
        document.addEventListener("keydown", handleEsc, false);
        document.body.style.overflow = "hidden";
      }

      return () => {
        document.removeEventListener("keydown", handleEsc, false);
        document.body.style.overflow = "unset";
      };
    }, [isOpen, onClose]);

    const formatValue = (value) => {
      if (value === null || value === undefined || value === "") return "-";
      if (Array.isArray(value))
        return value.length > 0 ? value.join(", ") : "-";
      return String(value);
    };

    const formatBooleanValue = (value) => {
      if (value === null || value === undefined) return "-";
      if (typeof value === "boolean") return value ? "Evet" : "Hayır";
      if (value === "new") return "Yeni";
      if (value === "existing") return "Mevcut";
      return value;
    };

    return (
      <div
        className="fixed inset-0 z-50 overflow-y-auto"
        style={{
          zIndex: 9999,
          backgroundColor: "rgba(0, 0, 0, 0.05)",
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="relative bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Quote Detayları - {quote.contactInfo?.firstName}{" "}
                  {quote.contactInfo?.lastName}
                </h3>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* İletişim Bilgileri */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-base font-semibold text-gray-900 mb-4 flex items-center">
                    <User className="h-5 w-5 mr-2 text-blue-600" />
                    İletişim Bilgileri
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Ad:</span>{" "}
                      {formatValue(quote.contactInfo?.firstName)}
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Soyad:</span>{" "}
                      {formatValue(quote.contactInfo?.lastName)}
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Email:</span>{" "}
                      {formatValue(quote.contactInfo?.email)}
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">
                        Telefon:
                      </span>{" "}
                      {formatValue(quote.contactInfo?.phone)}
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Şirket:</span>{" "}
                      {formatValue(quote.contactInfo?.company)}
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">
                        Pozisyon:
                      </span>{" "}
                      {formatValue(quote.contactInfo?.position)}
                    </div>
                  </div>
                </div>

                {/* Proje Bilgileri */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="text-base font-semibold text-gray-900 mb-4 flex items-center">
                    <Building className="h-5 w-5 mr-2 text-blue-600" />
                    Proje Bilgileri
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">
                        Proje Adı:
                      </span>{" "}
                      {formatValue(quote.projectInfo?.projectName)}
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">
                        Hizmet Alanı:
                      </span>{" "}
                      {formatValue(quote.projectInfo?.serviceArea)}
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">
                        Hizmet Alt Kategorisi:
                      </span>{" "}
                      {formatValue(quote.projectInfo?.serviceSubcategory)}
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">
                        Ürün Kategorisi:
                      </span>{" "}
                      {formatValue(quote.projectInfo?.productCategory)}
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">
                        Hedef Pazar:
                      </span>{" "}
                      {formatValue(quote.projectInfo?.targetMarket)}
                    </div>
                    <div className="md:col-span-2">
                      <span className="font-medium text-gray-700">
                        Proje Açıklaması:
                      </span>
                      <p className="mt-1 text-gray-600">
                        {formatValue(quote.projectInfo?.projectDescription)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Teknik Bilgiler */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="text-base font-semibold text-gray-900 mb-4 flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2 text-green-600" />
                    Teknik Bilgiler
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">
                        Mevcut Formül:
                      </span>{" "}
                      {formatBooleanValue(quote.technicalInfo?.existingFormula)}
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">
                        Ürün Hacmi:
                      </span>{" "}
                      {formatValue(quote.technicalInfo?.productVolume)}
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Miktar:</span>{" "}
                      {formatValue(quote.technicalInfo?.quantity)}
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">
                        Ürün Tipi:
                      </span>{" "}
                      {formatValue(quote.technicalInfo?.productType)}
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Kıvam:</span>{" "}
                      {formatValue(quote.technicalInfo?.consistency)}
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">
                        Raf Ömrü:
                      </span>{" "}
                      {formatValue(quote.technicalInfo?.shelfLife)}
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">
                        Marka Aşaması:
                      </span>{" "}
                      {formatValue(quote.technicalInfo?.brandStage)}
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Bütçe:</span>{" "}
                      {formatValue(quote.technicalInfo?.budget)}
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">
                        Kampanya Bütçesi:
                      </span>{" "}
                      {formatValue(quote.technicalInfo?.campaignBudget)}
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">
                        Ambalaj Tipi:
                      </span>{" "}
                      {formatValue(quote.technicalInfo?.ambalajType)}
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">
                        Ambalaj Malzemesi:
                      </span>{" "}
                      {formatValue(quote.technicalInfo?.ambalajMaterial)}
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">
                        Ambalaj Boyutu:
                      </span>{" "}
                      {formatValue(quote.technicalInfo?.packagingSize)}
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">
                        Mevcut Sipariş Hacmi:
                      </span>{" "}
                      {formatValue(quote.technicalInfo?.currentOrderVolume)}
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">
                        Hedef Kitle:
                      </span>{" "}
                      {formatValue(quote.technicalInfo?.targetAudience)}
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">
                        Zaman Çizelgesi:
                      </span>{" "}
                      {formatValue(quote.technicalInfo?.timeline)}
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">
                        Depo İhtiyaçları:
                      </span>{" "}
                      {formatValue(quote.technicalInfo?.warehouseNeeds)}
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">
                        Müşteri Hizmetleri İhtiyaçları:
                      </span>{" "}
                      {formatValue(quote.technicalInfo?.customerServiceNeeds)}
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">
                        Baskı Gereksinimleri:
                      </span>{" "}
                      {formatValue(quote.technicalInfo?.printingRequirements)}
                    </div>
                    <div className="md:col-span-3">
                      <span className="font-medium text-gray-700">
                        Ambalaj Tipleri:
                      </span>{" "}
                      {formatValue(quote.technicalInfo?.packagingType)}
                    </div>
                    <div className="md:col-span-3">
                      <span className="font-medium text-gray-700">
                        Sertifikalar:
                      </span>{" "}
                      {formatValue(quote.technicalInfo?.certificates)}
                    </div>
                    <div className="md:col-span-3">
                      <span className="font-medium text-gray-700">
                        İçerik İhtiyaçları:
                      </span>{" "}
                      {formatValue(quote.technicalInfo?.contentNeeds)}
                    </div>
                    <div className="md:col-span-3">
                      <span className="font-medium text-gray-700">
                        Entegrasyon İhtiyaçları:
                      </span>{" "}
                      {formatValue(quote.technicalInfo?.integrationNeeds)}
                    </div>
                    <div className="md:col-span-3">
                      <span className="font-medium text-gray-700">
                        Pazarlama Hedefleri:
                      </span>{" "}
                      {formatValue(quote.technicalInfo?.marketingGoals)}
                    </div>
                    <div className="md:col-span-3">
                      <span className="font-medium text-gray-700">
                        Yasal Gereksinimler:
                      </span>{" "}
                      {formatValue(quote.technicalInfo?.regulatoryRequirements)}
                    </div>
                    {quote.technicalInfo?.formulaDetails && (
                      <div className="md:col-span-3">
                        <span className="font-medium text-gray-700">
                          Formül Detayları:
                        </span>
                        <p className="mt-1 text-gray-600">
                          {quote.technicalInfo.formulaDetails}
                        </p>
                      </div>
                    )}
                    {quote.technicalInfo?.ingredients && (
                      <div className="md:col-span-3">
                        <span className="font-medium text-gray-700">
                          İçerikler:
                        </span>
                        <p className="mt-1 text-gray-600">
                          {quote.technicalInfo.ingredients}
                        </p>
                      </div>
                    )}
                    {quote.technicalInfo?.specialRequirements && (
                      <div className="md:col-span-3">
                        <span className="font-medium text-gray-700">
                          Özel Gereksinimler:
                        </span>
                        <p className="mt-1 text-gray-600">
                          {quote.technicalInfo.specialRequirements}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Ek Bilgiler */}
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="text-base font-semibold text-gray-900 mb-4 flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-purple-600" />
                    Ek Bilgiler
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">
                        Ek Hizmetler:
                      </span>{" "}
                      {formatValue(quote.additionalInfo?.additionalServices)}
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">
                        Önceki Deneyim:
                      </span>{" "}
                      {formatValue(quote.additionalInfo?.previousExperience)}
                    </div>
                    {quote.additionalInfo?.notes && (
                      <div className="md:col-span-2">
                        <span className="font-medium text-gray-700">
                          Notlar:
                        </span>
                        <p className="mt-1 text-gray-600">
                          {quote.additionalInfo.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Metadata */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-base font-semibold text-gray-900 mb-4 flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-gray-600" />
                    Sistem Bilgileri
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Durum:</span>
                      <span
                        className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          (
                            STATUS_CONFIG[quote.metadata?.status || "new"] ||
                            STATUS_CONFIG["new"]
                          ).color
                        }`}
                      >
                        {
                          (
                            STATUS_CONFIG[quote.metadata?.status || "new"] ||
                            STATUS_CONFIG["new"]
                          ).label
                        }
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">
                        Öncelik:
                      </span>
                      <span
                        className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          (
                            PRIORITY_CONFIG[
                              quote.metadata?.priority || "normal"
                            ] || PRIORITY_CONFIG["normal"]
                          ).color
                        }`}
                      >
                        {
                          (
                            PRIORITY_CONFIG[
                              quote.metadata?.priority || "normal"
                            ] || PRIORITY_CONFIG["normal"]
                          ).label
                        }
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Kaynak:</span>{" "}
                      {formatValue(quote.metadata?.source)}
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">
                        IP Adresi:
                      </span>{" "}
                      {formatValue(quote.metadata?.ipAddress)}
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">
                        Oluşturulma Tarihi:
                      </span>{" "}
                      {formatDate(quote.createdAt)}
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">
                        Güncellenme Tarihi:
                      </span>{" "}
                      {formatDate(quote.updatedAt)}
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">
                        Gönderim Tarihi:
                      </span>{" "}
                      {formatDate(quote.metadata?.submissionDate)}
                    </div>
                    {quote.metadata?.userAgent && (
                      <div className="md:col-span-2">
                        <span className="font-medium text-gray-700">
                          Tarayıcı Bilgisi:
                        </span>
                        <p className="mt-1 text-xs text-gray-600 break-all">
                          {quote.metadata.userAgent}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <PermissionGuard requiredPermission="quotes.view">
      <div className="space-y-6">
        <div className="space-y-6">
          {/* İstatistikler */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
            <StatCard
              title="Toplam Quote"
              value={stats.total}
              icon={FileText}
              color="text-blue-600"
            />
            <StatCard
              title="Yeni"
              value={stats.new}
              icon={AlertCircle}
              color="text-blue-600"
            />
            <StatCard
              title="İşlemde"
              value={stats.inProgress}
              icon={Clock}
              color="text-orange-600"
            />
            <StatCard
              title="Yanıtlandı"
              value={stats.responded}
              icon={CheckCircle}
              color="text-green-600"
            />
            <StatCard
              title="Kapatıldı"
              value={stats.closed}
              icon={XCircle}
              color="text-gray-600"
            />
          </div>

          {/* Filtreler ve Arama */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="İsim, email, şirket veya proje adı ile ara..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="block px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">Tüm Durumlar</option>
                  <option value="new">Yeni</option>
                  <option value="in-progress">İşlemde</option>
                  <option value="responded">Yanıtlandı</option>
                  <option value="closed">Kapatıldı</option>
                </select>
                <button
                  onClick={handleSearch}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Ara
                </button>
                <button
                  onClick={loadQuotes}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Yenile
                </button>
              </div>
            </div>
          </div>

          {/* Quote Listesi */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Quote İstekleri ({quotes.length})
              </h3>

              {loading ? (
                <div className="text-center py-12">
                  <RefreshCw className="mx-auto h-12 w-12 text-gray-400 animate-spin" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    Yükleniyor...
                  </h3>
                </div>
              ) : quotes.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    Quote bulunamadı
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Henüz quote isteği yok veya arama kriterlerinize uygun sonuç
                    bulunamadı.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Kişi
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Şirket / Proje
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Hizmet Alanı
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Durum
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Öncelik
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tarih
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          İşlemler
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {quotes.map((quote) => (
                        <QuoteRow key={quote.id} quote={quote} />
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quote Detay Modal */}
        <QuoteModal
          quote={selectedQuote}
          isOpen={showQuoteModal}
          onClose={() => {
            setShowQuoteModal(false);
            setSelectedQuote(null);
          }}
        />
      </div>
    </PermissionGuard>
  );
}
