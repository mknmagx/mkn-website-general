"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  RequestService,
  REQUEST_STATUS,
  REQUEST_PRIORITY,
  getRequestCategoryLabel,
} from "../../../lib/services/request-service";
import {
  getAllCompanies,
  createCompany,
} from "../../../lib/services/companies-service";
import { Timestamp } from "firebase/firestore";
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
  PlusCircle,
  FileText,
} from "lucide-react";

export default function ContactsPage() {
  const { user: currentUser } = useAdminAuth();
  const { toast } = useToast();
  const router = useRouter();
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

  // Talep oluşturma state'leri
  const [showCreateRequestModal, setShowCreateRequestModal] = useState(false);
  const [requestPreview, setRequestPreview] = useState(null);
  const [shouldCreateCompany, setShouldCreateCompany] = useState(false);
  const [companyExists, setCompanyExists] = useState(false);
  const [existingCompanyData, setExistingCompanyData] = useState(null);
  const [creatingRequest, setCreatingRequest] = useState(false);

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
        loadContacts();
      } catch (error) {
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
      loadContacts();
    } catch (error) {
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
      loadContacts();
    } catch (error) {
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

  // İletişimden talep oluşturma fonksiyonları
  const handleCreateRequest = async (contact) => {
    try {
      // Şirketin sistemde kayıtlı olup olmadığını kontrol et
      const companies = await getAllCompanies();
      const existingCompany = companies.find(
        (c) =>
          c.email?.toLowerCase() === contact.email?.toLowerCase() ||
          c.name?.toLowerCase() === contact.company?.toLowerCase()
      );

      setCompanyExists(!!existingCompany);
      setExistingCompanyData(existingCompany);
      setShouldCreateCompany(!existingCompany);

      // Kategoriyi belirle (service veya product bilgisinden)
      const category = determineCategoryFromService(
        contact.service || contact.product
      );

      // İletişim bilgilerinden talep formatı oluştur
      const preview = {
        contactId: contact.id,
        companyId: existingCompany?.id || null,
        contactInfo: {
          company: contact.company || "",
          firstName: contact.name?.split(" ")[0] || "",
          lastName: contact.name?.split(" ").slice(1).join(" ") || "",
          email: contact.email || "",
          phone: contact.phone || "",
        },
        projectInfo: {
          projectName: contact.service || "İletişim Talebi",
          projectDescription: contact.message || "",
          serviceArea: contact.service || contact.product || "Genel Talep",
        },
        requirements: {
          specificRequirements: formatContactRequirements(contact),
        },
        metadata: {
          source: "contact",
          category: category,
          priority: contact.priority || "normal",
          originalContactData: contact,
        },
      };

      setRequestPreview(preview);
      setShowCreateRequestModal(true);
    } catch (error) {
      console.error("Error preparing request:", error);
      toast({
        title: "Hata",
        description: "Talep hazırlanırken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  const formatContactRequirements = (contact) => {
    let requirements = "";

    if (contact.service) {
      requirements += `Hizmet: ${contact.service}\n`;
    }

    if (contact.product) {
      requirements += `Ürün: ${contact.product}\n`;
    }

    if (contact.message) {
      requirements += `\nMesaj:\n${contact.message}\n`;
    }

    if (contact.company) {
      requirements += `\nŞirket: ${contact.company}\n`;
    }

    return requirements.trim() || "İletişim mesajından oluşturulan talep.";
  };

  // Hizmet/ürün bilgisinden kategori belirle
  const determineCategoryFromService = (serviceOrProduct) => {
    if (!serviceOrProduct) return "consultation";

    const service = serviceOrProduct.toLowerCase();

    // Kozmetik anahtar kelimeler
    if (
      service.includes("kozmetik") ||
      service.includes("krem") ||
      service.includes("serum") ||
      service.includes("şampuan") ||
      service.includes("maske") ||
      service.includes("tonik")
    ) {
      return "cosmetic_manufacturing";
    }

    // Gıda takviyesi anahtar kelimeler
    if (
      service.includes("takviye") ||
      service.includes("vitamin") ||
      service.includes("suplement") ||
      service.includes("tablet") ||
      service.includes("kapsül")
    ) {
      return "supplement_manufacturing";
    }

    // Temizlik ürünleri
    if (
      service.includes("temizlik") ||
      service.includes("deterjan") ||
      service.includes("sabun")
    ) {
      return "cleaning_manufacturing";
    }

    // Ambalaj
    if (
      service.includes("ambalaj") ||
      service.includes("şişe") ||
      service.includes("kutu") ||
      service.includes("etiket") ||
      service.includes("paket")
    ) {
      return "packaging_supply";
    }

    // E-ticaret
    if (
      service.includes("e-ticaret") ||
      service.includes("eticaret") ||
      service.includes("trendyol") ||
      service.includes("hepsiburada") ||
      service.includes("amazon")
    ) {
      return "ecommerce_operations";
    }

    // Dijital pazarlama
    if (
      service.includes("pazarlama") ||
      service.includes("reklam") ||
      service.includes("sosyal medya") ||
      service.includes("seo") ||
      service.includes("google ads")
    ) {
      return "digital_marketing";
    }

    // Formülasyon
    if (
      service.includes("formül") ||
      service.includes("ar-ge") ||
      service.includes("arge") ||
      service.includes("geliştirme") ||
      service.includes("reçete")
    ) {
      return "formulation_development";
    }

    // Varsayılan: Danışmanlık
    return "consultation";
  };

  const confirmCreateRequest = async () => {
    if (!requestPreview) return;

    setCreatingRequest(true);
    try {
      let companyId = requestPreview.companyId;

      // Eğer şirket yoksa ve oluşturma seçili ise, önce şirketi oluştur
      if (shouldCreateCompany && !companyExists) {
        const newCompany = {
          name: requestPreview.contactInfo.company || "Bilinmeyen Şirket",
          email: requestPreview.contactInfo.email,
          phone: requestPreview.contactInfo.phone || "",
          contactPerson:
            `${requestPreview.contactInfo.firstName} ${requestPreview.contactInfo.lastName}`.trim(),
          status: "lead",
          priority: "normal",
          businessLine: "genel",
          source: "contact_form",
          tags: ["iletişim-formu"],
          createdBy: currentUser?.email || "system",
        };

        const result = await createCompany(newCompany);

        if (result.success) {
          companyId = result.id;
          toast({
            title: "Şirket Oluşturuldu",
            description: "Yeni şirket kaydı başarıyla oluşturuldu.",
          });
        }
      }

      // Priority'yi enum'a çevir
      let priorityEnum = REQUEST_PRIORITY.NORMAL;
      if (requestPreview.metadata.priority === "urgent") {
        priorityEnum = REQUEST_PRIORITY.URGENT;
      } else if (requestPreview.metadata.priority === "high") {
        priorityEnum = REQUEST_PRIORITY.HIGH;
      } else if (requestPreview.metadata.priority === "low") {
        priorityEnum = REQUEST_PRIORITY.LOW;
      }

      // Talebi oluştur - doğru veri yapısıyla
      const requestData = {
        // Temel bilgiler
        title: requestPreview.projectInfo.projectName,
        description: requestPreview.projectInfo.projectDescription,
        category: requestPreview.metadata.category,

        // İletişim bilgileri
        companyId: companyId,
        companyName: requestPreview.contactInfo.company,
        contactName:
          `${requestPreview.contactInfo.firstName} ${requestPreview.contactInfo.lastName}`.trim(),
        contactEmail: requestPreview.contactInfo.email,
        contactPhone: requestPreview.contactInfo.phone,

        // Proje detayları
        serviceType: requestPreview.projectInfo.serviceArea,
        requirements: requestPreview.requirements.specificRequirements,

        // Metadata
        source: "contact_form",
        priority: priorityEnum,
        status: REQUEST_STATUS.NEW,

        // Referans bilgisi
        originalContactId: requestPreview.contactId,

        // Ek bilgiler
        tags: ["iletişim-formu"],
        assignedTo: null,
        createdBy: currentUser?.email || "system",
      };

      const result = await RequestService.createRequest(requestData);

      if (!result.success) {
        throw new Error(result.error || "Talep oluşturulamadı");
      }

      // İletişim durumunu "işlemde" olarak güncelle
      await updateContactStatus(
        requestPreview.contactId,
        CONTACT_STATUS.IN_PROGRESS
      );

      toast({
        title: "Başarılı",
        description:
          "Talep başarıyla oluşturuldu ve iletişim durumu güncellendi.",
      });

      // Modal'ı kapat ve sayfayı yenile
      setShowCreateRequestModal(false);
      setRequestPreview(null);
      loadContacts();
    } catch (error) {
      console.error("Error creating request:", error);
      toast({
        title: "Hata",
        description: error.message || "Talep oluşturulurken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setCreatingRequest(false);
    }
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

  // Talep Oluşturma Önizleme Modalı
  const RequestPreviewModal = ({ isOpen, onClose, preview, onConfirm }) => {
    if (!isOpen || !preview) return null;

    return (
      <div
        className="fixed inset-0 z-50 overflow-y-auto"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
      >
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileText className="h-6 w-6 text-white" />
                  <h3 className="text-lg font-semibold text-white">
                    Talep Önizleme
                  </h3>
                </div>
                <button
                  onClick={onClose}
                  className="text-white hover:text-gray-200 transition-colors"
                  disabled={creatingRequest}
                >
                  <svg
                    className="h-6 w-6"
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
            </div>

            {/* Content */}
            <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
              <div className="space-y-6">
                {/* İletişim Bilgileri */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <User className="h-4 w-4 mr-2 text-blue-600" />
                    İletişim Bilgileri
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Şirket:</span>
                      <p className="font-medium text-gray-900">
                        {preview.contactInfo.company || "-"}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Ad Soyad:</span>
                      <p className="font-medium text-gray-900">
                        {preview.contactInfo.firstName}{" "}
                        {preview.contactInfo.lastName}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">E-posta:</span>
                      <p className="font-medium text-gray-900">
                        {preview.contactInfo.email}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Telefon:</span>
                      <p className="font-medium text-gray-900">
                        {preview.contactInfo.phone || "-"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Proje Bilgileri */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <Building2 className="h-4 w-4 mr-2 text-green-600" />
                    Proje Bilgileri
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-gray-600">Proje Adı:</span>
                      <p className="font-medium text-gray-900">
                        {preview.projectInfo.projectName}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Kategori:</span>
                      <p className="font-medium text-gray-900">
                        {preview.metadata.category
                          ? getRequestCategoryLabel(preview.metadata.category)
                          : "Belirlenmedi"}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Hizmet Alanı:</span>
                      <p className="font-medium text-gray-900">
                        {preview.projectInfo.serviceArea}
                      </p>
                    </div>
                    {preview.projectInfo.projectDescription && (
                      <div>
                        <span className="text-gray-600">Açıklama:</span>
                        <p className="font-medium text-gray-900 whitespace-pre-wrap">
                          {preview.projectInfo.projectDescription}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Özel Gereksinimler */}
                <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-lg p-4 border border-amber-200">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <MessageSquare className="h-4 w-4 mr-2 text-amber-600" />
                    Gereksinimler
                  </h4>
                  <div className="text-sm">
                    <pre className="whitespace-pre-wrap font-medium text-gray-900 bg-white/50 p-3 rounded border border-amber-100">
                      {preview.requirements.specificRequirements}
                    </pre>
                  </div>
                </div>

                {/* Şirket Oluşturma Kontrolü */}
                {!companyExists && (
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        id="createCompany"
                        checked={shouldCreateCompany}
                        onChange={(e) =>
                          setShouldCreateCompany(e.target.checked)
                        }
                        className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                      <div className="flex-1">
                        <label
                          htmlFor="createCompany"
                          className="text-sm font-medium text-gray-900 cursor-pointer"
                        >
                          Yeni şirket kaydı oluştur
                        </label>
                        <p className="text-xs text-gray-600 mt-1">
                          Bu iletişim için sistemde kayıtlı bir şirket
                          bulunamadı. İşaretlerseniz otomatik olarak yeni bir
                          şirket kaydı oluşturulacaktır.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {companyExists && (
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                    <div className="flex items-center space-x-2 text-green-700">
                      <CheckCircle className="h-5 w-5" />
                      <span className="text-sm font-medium">
                        Bu şirket sistemde kayıtlı
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 border-t border-gray-200">
              <button
                onClick={onClose}
                disabled={creatingRequest}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                İptal
              </button>
              <button
                onClick={onConfirm}
                disabled={creatingRequest}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {creatingRequest ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Oluşturuluyor...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    <span>Talebi Oluştur</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
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
    <PermissionGuard requiredPermission="contacts.view">
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
                <p className="text-sm font-medium text-gray-600">
                  Toplam Mesaj
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.total}
                </p>
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
            <table className="w-full divide-y divide-gray-200 table-fixed min-w-max">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-1/5 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İletişim Bilgileri
                  </th>
                  <th className="w-1/4 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mesaj
                  </th>
                  <th className="w-[10%] px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="w-[10%] px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Öncelik
                  </th>
                  <th className="w-[12%] px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tarih
                  </th>
                  <th className="w-[18%] px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                      <td className="px-3 py-3">
                        <div className="flex items-start">
                          <div className="flex-shrink-0 h-8 w-8">
                            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                              <User className="h-4 w-4 text-gray-600" />
                            </div>
                          </div>
                          <div className="ml-2 min-w-0">
                            <div className="text-xs font-medium text-gray-900 truncate">
                              {contact.name}
                            </div>
                            <div className="text-xs text-gray-500 flex items-center truncate">
                              <Mail className="h-2.5 w-2.5 mr-1 flex-shrink-0" />
                              <span className="truncate">{contact.email}</span>
                            </div>
                            {contact.phone && (
                              <div className="text-xs text-gray-500 flex items-center truncate">
                                <Phone className="h-2.5 w-2.5 mr-1 flex-shrink-0" />
                                <span className="truncate">
                                  {contact.phone}
                                </span>
                              </div>
                            )}
                            {contact.company && (
                              <div className="text-xs text-gray-500 flex items-center truncate">
                                <Building2 className="h-2.5 w-2.5 mr-1 flex-shrink-0" />
                                <span className="truncate">
                                  {contact.company}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="text-xs text-gray-900">
                          <div className="font-medium mb-1 flex flex-wrap gap-1">
                            {contact.service && (
                              <span className="inline-flex px-1.5 py-0.5 text-[10px] bg-blue-100 text-blue-800 rounded">
                                {contact.service}
                              </span>
                            )}
                            {contact.product && (
                              <span className="inline-flex px-1.5 py-0.5 text-[10px] bg-green-100 text-green-800 rounded">
                                {contact.product}
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 text-xs line-clamp-2">
                            {contact.message || "Mesaj bulunamadı"}
                          </p>
                        </div>
                      </td>
                      <td className="px-2 py-3">
                        <div className="flex items-center justify-center">
                          {getStatusIcon(contact.status)}
                        </div>
                      </td>
                      <td className="px-2 py-3">
                        <span
                          className={`inline-flex px-1.5 py-0.5 text-[10px] font-semibold rounded ${getPriorityColor(
                            contact.priority
                          )}`}
                        >
                          {getPriorityText(contact.priority)}
                        </span>
                      </td>
                      <td className="px-2 py-3 text-xs text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
                          <span className="whitespace-nowrap">
                            {contact.createdAt
                              ? (() => {
                                  try {
                                    const date = contact.createdAt.toDate
                                      ? contact.createdAt.toDate()
                                      : new Date(contact.createdAt);
                                    return date.toLocaleDateString("tr-TR");
                                  } catch (error) {
                                    console.error("Date format error:", error);
                                    return "Geçersiz tarih";
                                  }
                                })()
                              : "-"}
                          </span>
                        </div>
                      </td>
                      <td className="px-2 py-3 text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleViewContact(contact)}
                            className="text-blue-600 hover:text-blue-900 p-1"
                            title="Görüntüle"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleCreateRequest(contact)}
                            className="text-green-600 hover:text-green-900 p-1"
                            title="Talep Oluştur"
                          >
                            <PlusCircle className="h-3.5 w-3.5" />
                          </button>
                          {canUpdate && (
                            <select
                              value={contact.status}
                              onChange={(e) =>
                                handleStatusChange(contact.id, e.target.value)
                              }
                              className="text-[10px] border border-gray-300 rounded px-1 py-0.5 max-w-[70px]"
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
                              className="text-red-600 hover:text-red-900 p-1"
                              title="Sil"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
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

        {/* Talep Oluşturma Modal'ı */}
        {showCreateRequestModal && requestPreview && (
          <RequestPreviewModal
            isOpen={showCreateRequestModal}
            onClose={() => {
              setShowCreateRequestModal(false);
              setRequestPreview(null);
            }}
            preview={requestPreview}
            onConfirm={confirmCreateRequest}
          />
        )}
      </div>
    </PermissionGuard>
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
                {(() => {
                  try {
                    if (!contact.createdAt) return "Tarih bilinmiyor";
                    const date = contact.createdAt.toDate
                      ? contact.createdAt.toDate()
                      : new Date(contact.createdAt);
                    return date.toLocaleString("tr-TR");
                  } catch (error) {
                    console.error("Date format error:", error);
                    return "Geçersiz tarih";
                  }
                })()}
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
                {contact.message || "Mesaj bulunamadı"}
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
