"use client";

import { useState, useEffect } from "react";
import {
  PermissionGuard,
  RoleGuard,
  usePermissions,
} from "../../../components/admin-route-guard";
import { useAdminAuth } from "../../../hooks/use-admin-auth";
import { useToast } from "../../../hooks/use-toast";
import {
  getAllContacts,
  deleteContact,
  updateContactStatus,
  updateContactPriority,
  searchContacts,
  getContactsByStatus,
  getContactsByService,
  getContactStats,
  CONTACT_STATUS,
  CONTACT_PRIORITY,
  CONTACT_SOURCE,
} from "../../../lib/services/contacts-service";
import {
  Mail,
  Phone,
  User,
  Building2,
  MessageSquare,
  Clock,
  Filter,
  Search,
  Eye,
  Trash2,
  CheckCircle,
  AlertCircle,
  Circle,
  XCircle,
  Plus,
  Calendar,
  TrendingUp,
  Users,
  MessageCircle,
  BarChart3,
} from "lucide-react";

export default function ContactsPage() {
  const { user: currentUser } = useAdminAuth();
  const { toast } = useToast();
  const [contacts, setContacts] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    thisMonth: 0,
    lastMonth: 0,
    growthRate: 0,
    averageResponseTime: 0,
    statusCounts: {
      [CONTACT_STATUS.NEW]: 0,
      [CONTACT_STATUS.IN_PROGRESS]: 0,
      [CONTACT_STATUS.RESPONDED]: 0,
      [CONTACT_STATUS.CLOSED]: 0,
    },
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingContact, setViewingContact] = useState(null);

  // Yetki kontrolü
  const { hasPermission } = usePermissions();
  const canView = hasPermission("contacts.view");
  const canUpdate = hasPermission("contacts.update");
  const canDelete = hasPermission("contacts.delete");

  // Firestore'dan iletişimleri ve istatistikleri yükle
  const loadContacts = async () => {
    setLoading(true);
    try {
      let contactsData;

      // Filtrelemeye göre veri çek
      if (statusFilter !== "all") {
        contactsData = await getContactsByStatus(statusFilter);
      } else {
        contactsData = await getAllContacts();
      }

      // Client-side filtreleme (öncelik ve arama)
      if (priorityFilter !== "all") {
        contactsData = contactsData.filter(
          (c) => c.priority === priorityFilter
        );
      }

      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        contactsData = contactsData.filter(
          (c) =>
            c.name?.toLowerCase().includes(search) ||
            c.email?.toLowerCase().includes(search) ||
            c.company?.toLowerCase().includes(search) ||
            c.service?.toLowerCase().includes(search) ||
            c.message?.toLowerCase().includes(search)
        );
      }

      setContacts(contactsData);

      // İstatistikleri de yükle
      const statsData = await getContactStats();
      setStats((prev) => ({
        ...prev,
        total: statsData.total,
        statusCounts: {
          [CONTACT_STATUS.NEW]: statsData.new,
          [CONTACT_STATUS.IN_PROGRESS]: statsData.inProgress,
          [CONTACT_STATUS.RESPONDED]: statsData.responded,
          [CONTACT_STATUS.CLOSED]: statsData.closed,
        },
      }));
    } catch (error) {
      console.error("Error loading contacts:", error);
      toast({
        title: "Hata",
        description: "İletişimler yüklenirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // İletişim silme
  const handleDeleteContact = async (contactId) => {
    if (!canDelete) {
      toast({
        title: "Yetkisiz İşlem",
        description: "Bu işlemi gerçekleştirme yetkiniz yok.",
        variant: "destructive",
      });
      return;
    }

    if (window.confirm("Bu iletişimi silmek istediğinizden emin misiniz?")) {
      try {
        await deleteContact(contactId);
        toast({
          title: "Başarılı",
          description: "İletişim başarıyla silindi.",
        });
        loadContacts(); // Listeyi yenile
      } catch (error) {
        console.error("Error deleting contact:", error);
        toast({
          title: "Hata",
          description: "İletişim silinirken bir hata oluştu.",
          variant: "destructive",
        });
      }
    }
  };

  // İletişim durumunu güncelle
  const handleStatusChange = async (contactId, newStatus) => {
    if (!canUpdate) {
      toast({
        title: "Yetkisiz İşlem",
        description: "Bu işlemi gerçekleştirme yetkiniz yok.",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateContactStatus(contactId, newStatus);
      toast({
        title: "Başarılı",
        description: "İletişim durumu güncellendi.",
      });
      loadContacts(); // Listeyi yenile
    } catch (error) {
      console.error("Error updating contact status:", error);
      toast({
        title: "Hata",
        description: "Durum güncellenirken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  // İletişim önceliğini güncelle
  const handlePriorityChange = async (contactId, newPriority) => {
    if (!canUpdate) {
      toast({
        title: "Yetkisiz İşlem",
        description: "Bu işlemi gerçekleştirme yetkiniz yok.",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateContactPriority(contactId, newPriority);
      toast({
        title: "Başarılı",
        description: "İletişim önceliği güncellendi.",
      });
      loadContacts(); // Listeyi yenile
    } catch (error) {
      console.error("Error updating contact priority:", error);
      toast({
        title: "Hata",
        description: "Öncelik güncellenirken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadContacts();
  }, [statusFilter, priorityFilter, searchTerm]);

  const getStatusIcon = (status) => {
    switch (status) {
      case CONTACT_STATUS.NEW:
        return <Circle className="h-4 w-4 text-blue-500" />;
      case CONTACT_STATUS.IN_PROGRESS:
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case CONTACT_STATUS.RESPONDED:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case CONTACT_STATUS.CLOSED:
        return <XCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <Circle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case CONTACT_STATUS.NEW:
        return "Yeni";
      case CONTACT_STATUS.IN_PROGRESS:
        return "İşlemde";
      case CONTACT_STATUS.RESPONDED:
        return "Yanıtlandı";
      case CONTACT_STATUS.CLOSED:
        return "Kapatıldı";
      default:
        return "Bilinmiyor";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case CONTACT_PRIORITY.URGENT:
        return "text-red-600 bg-red-100";
      case CONTACT_PRIORITY.HIGH:
        return "text-orange-600 bg-orange-100";
      case CONTACT_PRIORITY.NORMAL:
        return "text-blue-600 bg-blue-100";
      case CONTACT_PRIORITY.LOW:
        return "text-gray-600 bg-gray-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getPriorityText = (priority) => {
    switch (priority) {
      case CONTACT_PRIORITY.URGENT:
        return "Acil";
      case CONTACT_PRIORITY.HIGH:
        return "Yüksek";
      case CONTACT_PRIORITY.NORMAL:
        return "Normal";
      case CONTACT_PRIORITY.LOW:
        return "Düşük";
      default:
        return "Normal";
    }
  };

  const handleViewContact = (contact) => {
    setViewingContact(contact);
    setShowViewModal(true);
  };

  const handleUpdateStatus = async (contactId, newStatus) => {
    try {
      // Mock güncelleme - gerçek servise bağlanacak
      setContacts((prev) =>
        prev.map((c) =>
          c.id === contactId
            ? { ...c, status: newStatus, updatedAt: new Date() }
            : c
        )
      );

      toast({
        title: "Başarılı",
        description: "Mesaj durumu güncellendi",
      });
    } catch (error) {
      toast({
        title: "Hata",
        description: "Durum güncellenirken hata oluştu",
        variant: "destructive",
      });
    }
  };

  if (!canView) {
    return (
      <div className="p-6 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">
            Bu sayfayı görüntüleme yetkiniz bulunmuyor.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            İletişim Mesajları
          </h1>
          <p className="text-gray-600 mt-1">
            Müşteri iletişim mesajlarını yönetin
          </p>
        </div>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <MessageCircle className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Toplam Mesaj</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Bu Ay</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.thisMonth}
              </p>
              <p className="text-xs text-green-600">
                +{stats.growthRate}% büyüme
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Ort. Yanıt Süresi
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.averageResponseTime}s
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Bekleyen</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.statusCounts[CONTACT_STATUS.NEW]}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtreler ve Arama */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Arama */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Mesajlarda ara..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Durum Filtresi */}
          <select
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Tüm Durumlar</option>
            <option value={CONTACT_STATUS.NEW}>Yeni</option>
            <option value={CONTACT_STATUS.IN_PROGRESS}>İşlemde</option>
            <option value={CONTACT_STATUS.RESPONDED}>Yanıtlandı</option>
            <option value={CONTACT_STATUS.CLOSED}>Kapatıldı</option>
          </select>

          {/* Öncelik Filtresi */}
          <select
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="all">Tüm Öncelikler</option>
            <option value={CONTACT_PRIORITY.URGENT}>Acil</option>
            <option value={CONTACT_PRIORITY.HIGH}>Yüksek</option>
            <option value={CONTACT_PRIORITY.NORMAL}>Normal</option>
            <option value={CONTACT_PRIORITY.LOW}>Düşük</option>
          </select>
        </div>
      </div>

      {/* İletişim Mesajları Tablosu */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İletişim Bilgileri
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mesaj
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    </div>
                  </td>
                </tr>
              ) : contacts.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    Henüz mesaj bulunmuyor
                  </td>
                </tr>
              ) : (
                contacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="h-5 w-5 text-gray-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {contact.name}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            {contact.email}
                          </div>
                          {contact.phone && (
                            <div className="text-sm text-gray-500 flex items-center">
                              <Phone className="h-3 w-3 mr-1" />
                              {contact.phone}
                            </div>
                          )}
                          {contact.company && (
                            <div className="text-sm text-gray-500 flex items-center">
                              <Building2 className="h-3 w-3 mr-1" />
                              {contact.company}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        <div className="font-medium mb-1">
                          {contact.service && (
                            <span className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full mr-2">
                              {contact.service}
                            </span>
                          )}
                          {contact.product && (
                            <span className="inline-flex px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                              {contact.product}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm line-clamp-2">
                          {contact.message}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(contact.status)}
                        <span className="ml-2 text-sm text-gray-900">
                          {getStatusText(contact.status)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(
                          contact.priority
                        )}`}
                      >
                        {getPriorityText(contact.priority)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {contact.createdAt
                          ? new Date(contact.createdAt).toLocaleDateString(
                              "tr-TR"
                            )
                          : "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewContact(contact)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Görüntüle"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {canUpdate && (
                          <select
                            value={contact.status}
                            onChange={(e) =>
                              handleStatusChange(contact.id, e.target.value)
                            }
                            className="text-xs border border-gray-300 rounded px-2 py-1"
                            title="Durumu Değiştir"
                          >
                            <option value={CONTACT_STATUS.NEW}>Yeni</option>
                            <option value={CONTACT_STATUS.IN_PROGRESS}>
                              İşlemde
                            </option>
                            <option value={CONTACT_STATUS.RESPONDED}>
                              Yanıtlandı
                            </option>
                            <option value={CONTACT_STATUS.CLOSED}>
                              Kapatıldı
                            </option>
                          </select>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => handleDeleteContact(contact.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Sil"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Görüntüle Modal */}
      {showViewModal && viewingContact && (
        <ViewContactModal
          contact={viewingContact}
          onClose={() => {
            setShowViewModal(false);
            setViewingContact(null);
          }}
        />
      )}
    </div>
  );
}

// Mesaj Görüntüleme Modal'ı
function ViewContactModal({ contact, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                İletişim Mesajı
              </h3>
              <p className="text-sm text-gray-500">
                {contact.createdAt.toLocaleString("tr-TR")}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* İletişim Bilgileri */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ad Soyad
                </label>
                <p className="text-sm text-gray-900">{contact.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  E-posta
                </label>
                <p className="text-sm text-gray-900">{contact.email}</p>
              </div>
              {contact.phone && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefon
                  </label>
                  <p className="text-sm text-gray-900">{contact.phone}</p>
                </div>
              )}
              {contact.company && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Şirket
                  </label>
                  <p className="text-sm text-gray-900">{contact.company}</p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hizmet
                </label>
                <p className="text-sm text-gray-900">
                  {contact.service || "-"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ürün
                </label>
                <p className="text-sm text-gray-900">
                  {contact.product || "-"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Durum
                </label>
                <div className="flex items-center">
                  {/* Status icon and text code here */}
                  <span className="text-sm text-gray-900">
                    {contact.status === CONTACT_STATUS.NEW && "Yeni"}
                    {contact.status === CONTACT_STATUS.IN_PROGRESS && "İşlemde"}
                    {contact.status === CONTACT_STATUS.RESPONDED &&
                      "Yanıtlandı"}
                    {contact.status === CONTACT_STATUS.CLOSED && "Kapatıldı"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Mesaj */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mesaj
            </label>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-900 whitespace-pre-wrap">
                {contact.message}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
