"use client";

import { useState, useEffect } from "react";
import AdminProtectedWrapper from "../../../components/admin-protected-wrapper";
import {
  getContactMessages,
  updateContactStatus,
  updateContactPriority,
  deleteContactMessage,
  getContactStats,
  searchContactMessages,
} from "../../../lib/services/admin-contact-service";
import {
  MessageSquare,
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
  MessageCircle,
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

export default function ContactsPage() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedContact, setSelectedContact] = useState(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    inProgress: 0,
    responded: 0,
    closed: 0,
  });

  useEffect(() => {
    loadContacts();
    loadStats();
  }, [statusFilter]);

  const loadContacts = async () => {
    setLoading(true);
    try {
      const result = await getContactMessages({
        status: statusFilter,
        limit: 50,
      });

      if (result.success) {
        setContacts(result.contacts);
      }
    } catch (error) {
      console.error("Error loading contacts:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const result = await getContactStats();
      if (result.success) {
        setStats(result.stats);
      }
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadContacts();
      return;
    }

    setLoading(true);
    try {
      const result = await searchContactMessages(searchTerm);
      if (result.success) {
        setContacts(result.contacts);
      }
    } catch (error) {
      console.error("Error searching contacts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (contactId, newStatus) => {
    try {
      const result = await updateContactStatus(contactId, newStatus);
      if (result.success) {
        await loadContacts();
        await loadStats();
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handlePriorityUpdate = async (contactId, newPriority) => {
    try {
      const result = await updateContactPriority(contactId, newPriority);
      if (result.success) {
        await loadContacts();
      }
    } catch (error) {
      console.error("Error updating priority:", error);
    }
  };

  const handleDelete = async (contactId) => {
    if (confirm("Bu iletişim mesajını silmek istediğinizden emin misiniz?")) {
      try {
        const result = await deleteContactMessage(contactId);
        if (result.success) {
          await loadContacts();
          await loadStats();
        }
      } catch (error) {
        console.error("Error deleting contact:", error);
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

  const ContactRow = ({ contact }) => {
    const status = contact.metadata?.status || "new";
    const priority = contact.metadata?.priority || "normal";

    const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG["new"];
    const priorityConfig =
      PRIORITY_CONFIG[priority] || PRIORITY_CONFIG["normal"];
    const StatusIcon = statusConfig?.icon || AlertCircle;

    return (
      <tr className="hover:bg-gray-50">
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center">
            <div className="flex-shrink-0 h-10 w-10">
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <User className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-900">
                {contact.contactInfo?.name}
              </div>
              <div className="text-sm text-gray-500">
                {contact.contactInfo?.email}
              </div>
            </div>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-900">
            {contact.contactInfo?.company || "-"}
          </div>
          <div className="text-sm text-gray-500">
            {contact.contactInfo?.phone || "-"}
          </div>
        </td>
        <td className="px-6 py-4">
          <div className="text-sm text-gray-900 max-w-xs truncate">
            {contact.requestInfo?.service || "-"}
          </div>
          <div className="text-sm text-gray-500 max-w-xs truncate">
            {contact.requestInfo?.message || "-"}
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
          {formatDate(contact.createdAt)}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setSelectedContact(contact);
                setShowContactModal(true);
              }}
              className="text-blue-600 hover:text-blue-900 p-1 rounded"
              title="Görüntüle"
            >
              <Eye className="h-4 w-4" />
            </button>
            <select
              value={contact.metadata?.status || "new"}
              onChange={(e) => handleStatusUpdate(contact.id, e.target.value)}
              className="text-xs border-gray-300 rounded px-2 py-1"
            >
              <option value="new">Yeni</option>
              <option value="in-progress">İşlemde</option>
              <option value="responded">Yanıtlandı</option>
              <option value="closed">Kapatıldı</option>
            </select>
            <button
              onClick={() => handleDelete(contact.id)}
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

  const ContactModal = ({ contact, isOpen, onClose }) => {
    if (!isOpen || !contact) return null;

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.05)" }}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-xl">
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              İletişim Mesajı Detayları
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XCircle className="h-6 w-6" />
            </button>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* İletişim Bilgileri */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  İletişim Bilgileri
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <User className="h-4 w-4 text-gray-400 mr-2" />
                    <span>{contact.contactInfo?.name}</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 text-gray-400 mr-2" />
                    <span>{contact.contactInfo?.email}</span>
                  </div>
                  {contact.contactInfo?.phone && (
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 text-gray-400 mr-2" />
                      <span>{contact.contactInfo.phone}</span>
                    </div>
                  )}
                  {contact.contactInfo?.company && (
                    <div className="flex items-center">
                      <Building className="h-4 w-4 text-gray-400 mr-2" />
                      <span>{contact.contactInfo.company}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Talep Bilgileri */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Talep Bilgileri
                </h4>
                <div className="space-y-2 text-sm">
                  {contact.requestInfo?.service && (
                    <div>
                      <strong>Hizmet:</strong> {contact.requestInfo.service}
                    </div>
                  )}
                  {contact.requestInfo?.product && (
                    <div>
                      <strong>Ürün:</strong> {contact.requestInfo.product}
                    </div>
                  )}
                </div>
              </div>

              {/* Mesaj */}
              <div className="md:col-span-2">
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Mesaj
                </h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700 whitespace-pre-line">
                    {contact.requestInfo?.message || "Mesaj yok"}
                  </p>
                </div>
              </div>

              {/* Meta Bilgiler */}
              <div className="md:col-span-2 border-t pt-4">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Gönderilme: {formatDate(contact.createdAt)}
                  </div>
                  <div className="flex items-center space-x-4">
                    <div>
                      Durum:{" "}
                      {
                        (
                          STATUS_CONFIG[contact.metadata?.status || "new"] ||
                          STATUS_CONFIG["new"]
                        ).label
                      }
                    </div>
                    <div>
                      Öncelik:{" "}
                      {
                        (
                          PRIORITY_CONFIG[
                            contact.metadata?.priority || "normal"
                          ] || PRIORITY_CONFIG["normal"]
                        ).label
                      }
                    </div>
                  </div>
                </div>
                {contact.metadata?.adminNotes && (
                  <div className="mt-4">
                    <h5 className="text-sm font-medium text-gray-900 mb-2">
                      Admin Notları
                    </h5>
                    <p className="text-sm text-gray-600 bg-yellow-50 p-3 rounded">
                      {contact.metadata.adminNotes}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Hızlı Email Bağlantısı */}
            <div className="mt-6 flex justify-end">
              <a
                href={`mailto:${
                  contact.contactInfo?.email
                }?subject=MKN Group - İletişim Talebiniz Hakkında&body=Merhaba ${
                  contact.contactInfo?.name
                },%0A%0A${
                  contact.requestInfo?.message
                    ? `"${contact.requestInfo.message}" mesajınız için teşekkür ederiz.%0A%0A`
                    : ""
                }İletişim talebiniz için teşekkür ederiz.%0A%0AEn kısa sürede sizinle iletişime geçeceğiz.%0A%0Aİyi günler,%0AMKN Group Ekibi`}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Mail className="h-4 w-4 mr-2" />
                Email Gönder
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <AdminProtectedWrapper title="İletişim Mesajları">
      <div className="space-y-6">
        {/* İstatistikler */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard
            title="Toplam Mesaj"
            value={stats.total}
            icon={MessageSquare}
            color="text-green-600"
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
                    placeholder="İsim, email, şirket veya mesaj ile ara..."
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
                onClick={loadContacts}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Yenile
              </button>
            </div>
          </div>
        </div>

        {/* Contact Listesi */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              İletişim Mesajları ({contacts.length})
            </h3>

            {loading ? (
              <div className="text-center py-12">
                <RefreshCw className="mx-auto h-12 w-12 text-gray-400 animate-spin" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  Yükleniyor...
                </h3>
              </div>
            ) : contacts.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  Mesaj bulunamadı
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Henüz iletişim mesajı yok veya arama kriterlerinize uygun
                  sonuç bulunamadı.
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
                        Şirket / Telefon
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Hizmet / Mesaj
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
                    {contacts.map((contact) => (
                      <ContactRow key={contact.id} contact={contact} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contact Detay Modal */}
      <ContactModal
        contact={selectedContact}
        isOpen={showContactModal}
        onClose={() => {
          setShowContactModal(false);
          setSelectedContact(null);
        }}
      />
    </AdminProtectedWrapper>
  );
}
