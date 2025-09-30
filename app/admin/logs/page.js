"use client";

import { useState, useEffect, useCallback } from "react";
import { useAdminAuth } from "../../../hooks/use-admin-auth";
import {
  getAdminLogs,
  getLogStats,
  LOG_LEVELS,
  LOG_CATEGORIES,
  getLogMessage,
  getLogLevelColor,
  getLogCategoryIcon,
} from "../../../lib/services/admin-log-service";
import {
  Search,
  Filter,
  Download,
  Calendar,
  User,
  Activity,
  TrendingUp,
  RefreshCw,
  Eye,
  ChevronDown,
  ChevronRight,
  Clock,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Bug,
} from "lucide-react";
import { useToast } from "../../../hooks/use-toast";

export default function AdminLogsPage() {
  const { user, permissions } = useAdminAuth();
  const { toast } = useToast();

  // States
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filters, setFilters] = useState({
    category: "",
    level: "",
    userId: "",
    resource: "",
    dateFrom: "",
    dateTo: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [showLogDetail, setShowLogDetail] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState(null);

  // Load initial data
  useEffect(() => {
    loadLogs();
    loadStats();
  }, []);

  const loadLogs = async (reset = true) => {
    try {
      setLoading(true);
      const result = await getAdminLogs(
        { ...filters, searchText },
        50,
        reset ? null : lastDoc
      );

      if (result.success) {
        if (reset) {
          setLogs(result.logs);
          setCurrentPage(1);
        } else {
          setLogs((prev) => [...prev, ...result.logs]);
        }
        setLastDoc(result.lastDoc);
        setHasMore(result.hasMore);
      } else {
        toast({
          title: "Hata",
          description: "Loglar yüklenirken bir hata oluştu",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error loading logs:", error);
      toast({
        title: "Hata",
        description: "Loglar yüklenirken bir hata oluştu",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const result = await getLogStats(null, null);
      if (result.success) {
        setStats(result.stats);
      }
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const handleSearch = useCallback(async () => {
    setSearching(true);
    await loadLogs(true);
    setSearching(false);
  }, [filters, searchText]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    loadLogs(true);
    loadStats();
  };

  const clearFilters = () => {
    setFilters({
      category: "",
      level: "",
      userId: "",
      resource: "",
      dateFrom: "",
      dateTo: "",
    });
    setSearchText("");
    setTimeout(() => {
      loadLogs(true);
      loadStats();
    }, 100);
  };

  const exportLogs = async () => {
    try {
      const result = await getAdminLogs(filters, 1000);
      if (result.success) {
        const csvContent = [
          [
            "Zaman",
            "Seviye",
            "Kategori",
            "Kullanıcı",
            "Mesaj",
            "Kaynak",
            "Kaynak ID",
          ].join(","),
          ...result.logs.map((log) =>
            [
              log.createdAt?.toLocaleString("tr-TR") || "",
              log.level || "",
              log.category || "",
              log.userId || "",
              `"${(log.message || "").replace(/"/g, '""')}"`,
              log.resource || "",
              log.resourceId || "",
            ].join(",")
          ),
        ].join("\n");

        const blob = new Blob([csvContent], {
          type: "text/csv;charset=utf-8;",
        });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute(
          "download",
          `admin-logs-${new Date().toISOString().split("T")[0]}.csv`
        );
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast({
          title: "Başarılı",
          description: "Loglar başarıyla dışa aktarıldı",
        });
      }
    } catch (error) {
      console.error("Error exporting logs:", error);
      toast({
        title: "Hata",
        description: "Loglar dışa aktarılırken bir hata oluştu",
        variant: "destructive",
      });
    }
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      loadLogs(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "-";
    if (date.toDate) {
      return date.toDate().toLocaleString("tr-TR");
    }
    if (date instanceof Date) {
      return date.toLocaleString("tr-TR");
    }
    return new Date(date).toLocaleString("tr-TR");
  };

  const getLevelIcon = (level) => {
    switch (level) {
      case LOG_LEVELS.ERROR:
        return <XCircle className="w-4 h-4 text-red-500" />;
      case LOG_LEVELS.WARNING:
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case LOG_LEVELS.SUCCESS:
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case LOG_LEVELS.DEBUG:
        return <Bug className="w-4 h-4 text-gray-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Logları</h1>
          <p className="text-gray-600">
            Sistem aktivitelerini izleyin ve analiz edin
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => loadLogs(true)}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Yenile
          </button>
          <button
            onClick={exportLogs}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Download className="w-4 h-4 mr-2" />
            Dışa Aktar
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg border">
            <div className="flex items-center">
              <Activity className="w-5 h-5 text-blue-500 mr-2" />
              <div>
                <p className="text-sm text-gray-600">Toplam Log</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalLogs}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg border">
            <div className="flex items-center">
              <XCircle className="w-5 h-5 text-red-500 mr-2" />
              <div>
                <p className="text-sm text-gray-600">Hatalar</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.levels?.error || 0}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg border">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-yellow-500 mr-2" />
              <div>
                <p className="text-sm text-gray-600">Uyarılar</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.levels?.warning || 0}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg border">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              <div>
                <p className="text-sm text-gray-600">Başarılı</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.levels?.success || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Arama
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Log mesajında ara..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSearch}
              disabled={searching}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {searching ? "Arıyor..." : "Ara"}
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtreler
              {showFilters ? (
                <ChevronDown className="w-4 h-4 ml-2" />
              ) : (
                <ChevronRight className="w-4 h-4 ml-2" />
              )}
            </button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kategori
                </label>
                <select
                  value={filters.category}
                  onChange={(e) =>
                    handleFilterChange("category", e.target.value)
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Tüm Kategoriler</option>
                  {Object.values(LOG_CATEGORIES).map((category) => (
                    <option key={category} value={category}>
                      {getLogCategoryIcon(category)}{" "}
                      {category.replace(/_/g, " ").toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Seviye
                </label>
                <select
                  value={filters.level}
                  onChange={(e) => handleFilterChange("level", e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Tüm Seviyeler</option>
                  <option value={LOG_LEVELS.ERROR}>Hata</option>
                  <option value={LOG_LEVELS.WARNING}>Uyarı</option>
                  <option value={LOG_LEVELS.SUCCESS}>Başarılı</option>
                  <option value={LOG_LEVELS.INFO}>Bilgi</option>
                  <option value={LOG_LEVELS.DEBUG}>Debug</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kaynak
                </label>
                <input
                  type="text"
                  placeholder="Kaynak türü..."
                  value={filters.resource}
                  onChange={(e) =>
                    handleFilterChange("resource", e.target.value)
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="md:col-span-3 flex gap-2 pt-2">
                <button
                  onClick={applyFilters}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Filtrele
                </button>
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Temizle
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Zaman
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Seviye
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kategori
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kullanıcı
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mesaj
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    {loading ? "Loglar yükleniyor..." : "Henüz log bulunmuyor"}
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 text-gray-400 mr-2" />
                        {formatDate(log.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getLevelIcon(log.level)}
                        <span
                          className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getLogLevelColor(
                            log.level
                          )}`}
                        >
                          {log.level}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        {getLogCategoryIcon(log.category)}
                        <span className="ml-1">{log.category}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">
                          {log.userId || "-"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-md">
                      <div className="truncate" title={getLogMessage(log)}>
                        {getLogMessage(log)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedLog(log);
                          setShowLogDetail(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 flex items-center"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Detay
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Load More */}
        {hasMore && logs.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <button
              onClick={loadMore}
              disabled={loading}
              className="w-full py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              {loading ? "Yükleniyor..." : "Daha Fazla Yükle"}
            </button>
          </div>
        )}

        {/* Log Detail Modal */}
        {showLogDetail && selectedLog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
              <div className="px-6 py-4 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Log Detayları
                  </h2>
                  <button
                    onClick={() => setShowLogDetail(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
              </div>
              <div className="px-6 py-4 overflow-y-auto max-h-[60vh]">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Zaman
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedLog.createdAt?.toLocaleString("tr-TR")}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Seviye
                      </label>
                      <div className="flex items-center">
                        {getLevelIcon(selectedLog.level)}
                        <span
                          className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getLogLevelColor(
                            selectedLog.level
                          )}`}
                        >
                          {selectedLog.level}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Kategori
                      </label>
                      <div className="flex items-center">
                        {getLogCategoryIcon(selectedLog.category)}
                        <span className="ml-1 text-sm text-gray-900">
                          {selectedLog.category}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Kullanıcı ID
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedLog.userId || "-"}
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mesaj
                    </label>
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">
                      {getLogMessage(selectedLog)}
                    </p>
                  </div>
                  {selectedLog.resource && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Kaynak
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedLog.resource}
                      </p>
                    </div>
                  )}
                  {selectedLog.resourceId && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Kaynak ID
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedLog.resourceId}
                      </p>
                    </div>
                  )}
                  {selectedLog.details && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Detaylar
                      </label>
                      <p className="text-sm text-gray-900 whitespace-pre-wrap">
                        {selectedLog.details}
                      </p>
                    </div>
                  )}
                  {selectedLog.metadata &&
                    Object.keys(selectedLog.metadata).length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Metadata
                        </label>
                        <pre className="text-sm text-gray-900 bg-gray-100 p-3 rounded-md overflow-x-auto">
                          {JSON.stringify(selectedLog.metadata, null, 2)}
                        </pre>
                      </div>
                    )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
