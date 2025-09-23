"use client";

import { useState, useEffect } from "react";
import AdminProtectedWrapper from "../../../components/admin-protected-wrapper";
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
      console.error("Error loading quotes:", error);
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
      console.error("Error loading stats:", error);
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
      console.error("Error searching quotes:", error);
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
      console.error("Error updating status:", error);
    }
  };

  const handlePriorityUpdate = async (quoteId, newPriority) => {
    try {
      const result = await updateQuotePriority(quoteId, newPriority);
      if (result.success) {
        await loadQuotes();
      }
    } catch (error) {
      console.error("Error updating priority:", error);
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
        console.error("Error deleting quote:", error);
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
                console.log("Eye button clicked, quote:", quote);
                setSelectedQuote(quote);
                setShowQuoteModal(true);
                console.log("Modal state set to true");
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
    console.log("QuoteModal render:", { isOpen, quote: quote?.id });

    if (!isOpen || !quote) return null;

    // ESC tuşu ile kapatma
    useEffect(() => {
      const handleEsc = (event) => {
        if (event.keyCode === 27) {
          onClose();
        }
      };

      if (isOpen) {
        document.addEventListener("keydown", handleEsc, false);
        document.body.style.overflow = "hidden"; // Arka planın scroll'ını engelle
      }

      return () => {
        document.removeEventListener("keydown", handleEsc, false);
        document.body.style.overflow = "unset";
      };
    }, [isOpen, onClose]);

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
          <div className="relative bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Quote Detayları
                </h3>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* İletişim Bilgileri */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    İletişim Bilgileri
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-gray-400 mr-2" />
                      <span>
                        {quote.contactInfo?.firstName}{" "}
                        {quote.contactInfo?.lastName}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 text-gray-400 mr-2" />
                      <span>{quote.contactInfo?.email}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 text-gray-400 mr-2" />
                      <span>{quote.contactInfo?.phone}</span>
                    </div>
                    <div className="flex items-center">
                      <Building className="h-4 w-4 text-gray-400 mr-2" />
                      <span>{quote.contactInfo?.company || "-"}</span>
                    </div>
                  </div>
                </div>

                {/* Proje Bilgileri */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    Proje Bilgileri
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <strong>Hizmet Alanı:</strong>{" "}
                      {quote.projectInfo?.serviceArea}
                    </div>
                    <div>
                      <strong>Proje Adı:</strong>{" "}
                      {quote.projectInfo?.projectName}
                    </div>
                    <div>
                      <strong>Açıklama:</strong>{" "}
                      {quote.projectInfo?.projectDescription}
                    </div>
                    <div>
                      <strong>Hedef Pazar:</strong>{" "}
                      {quote.projectInfo?.targetMarket || "-"}
                    </div>
                  </div>
                </div>

                {/* Teknik Bilgiler */}
                <div className="md:col-span-2">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    Teknik Bilgiler
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Mevcut Formül:</strong>{" "}
                      {quote.technicalInfo?.existingFormula ? "Evet" : "Hayır"}
                    </div>
                    <div>
                      <strong>Ürün Hacmi:</strong>{" "}
                      {quote.technicalInfo?.productVolume || "-"}
                    </div>
                    <div>
                      <strong>Ambalaj Tipi:</strong>{" "}
                      {quote.technicalInfo?.packagingType?.join(", ") || "-"}
                    </div>
                    <div>
                      <strong>Raf Ömrü:</strong>{" "}
                      {quote.technicalInfo?.shelfLife || "-"}
                    </div>
                  </div>
                  {quote.technicalInfo?.formulaDetails && (
                    <div className="mt-4">
                      <strong>Formül Detayları:</strong>
                      <p className="mt-1 text-gray-600">
                        {quote.technicalInfo.formulaDetails}
                      </p>
                    </div>
                  )}
                </div>

                {/* Meta Bilgiler */}
                <div className="md:col-span-2 border-t pt-4">
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      Oluşturulma: {formatDate(quote.createdAt)}
                    </div>
                    <div className="flex items-center space-x-4">
                      <div>
                        Durum:{" "}
                        {
                          (
                            STATUS_CONFIG[quote.metadata?.status || "new"] ||
                            STATUS_CONFIG["new"]
                          ).label
                        }
                      </div>
                      <div>
                        Öncelik:{" "}
                        {
                          (
                            PRIORITY_CONFIG[
                              quote.metadata?.priority || "normal"
                            ] || PRIORITY_CONFIG["normal"]
                          ).label
                        }
                      </div>
                    </div>
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
    <AdminProtectedWrapper title="Quote İstekleri">
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
    </AdminProtectedWrapper>
  );
}
