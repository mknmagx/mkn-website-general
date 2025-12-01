"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useRequestCreation } from "../../../../hooks/use-requests";
import { useCompanies } from "../../../../hooks/use-company";
import { usePermissions } from "../../../../components/admin-route-guard";
import { useAdminAuth } from "../../../../hooks/use-admin-auth";
import { useToast } from "@/hooks/use-toast";
import {
  REQUEST_CATEGORIES,
  REQUEST_PRIORITY,
  REQUEST_SOURCE,
  CATEGORY_FIELDS,
  getRequestCategoryLabel,
  getRequestPriorityLabel,
  getRequestSourceLabel,
} from "../../../../lib/services/request-service";

// UI Components
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Textarea } from "../../../../components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";
import { Label } from "../../../../components/ui/label";
import { Badge } from "../../../../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../../../components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../../components/ui/tabs";

// Icons
import {
  MessageSquareText,
  ArrowLeft,
  Save,
  AlertCircle,
  FileText,
  Mail,
  Building2,
  User,
  Phone,
  Calendar,
  DollarSign,
  Tag,
  CheckCircle2,
  Loader2,
  Sparkles,
  Import,
  Info,
  Droplets,
  Pill,
  SprayCanIcon as SprayCan,
  Package,
  ShoppingCart,
  TrendingUp,
  FlaskConical,
  Users,
} from "lucide-react";

export default function NewRequestPage() {
  const router = useRouter();
  const { user } = useAdminAuth();
  const { hasPermission } = usePermissions();
  const { toast } = useToast();
  const { createRequest, loading, error } = useRequestCreation();
  const { companies, loading: companiesLoading } = useCompanies();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    priority: REQUEST_PRIORITY.NORMAL,
    source: REQUEST_SOURCE.WEBSITE_FORM,
    companyId: "",
    companyName: "",
    contactPerson: "",
    contactEmail: "",
    contactPhone: "",
    estimatedValue: "",
    expectedDelivery: "",
    requirements: "",
    additionalNotes: "",
  });

  const [formErrors, setFormErrors] = useState({});
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [quotes, setQuotes] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [companyExists, setCompanyExists] = useState(true);
  const [savingCompany, setSavingCompany] = useState(false);

  const canCreate =
    hasPermission("requests.create") || hasPermission("admin.all");

  // Fetch quotes and contacts with "new" or "pending" status
  useEffect(() => {
    const fetchData = async () => {
      if (!showImportDialog) return;

      setLoadingData(true);
      try {
        const { db } = await import("../../../../lib/firebase");
        const { collection, query, where, orderBy, limit, getDocs } =
          await import("firebase/firestore");

        // Fetch all quotes
        const quotesQuery = query(
          collection(db, "quotes"),
          orderBy("createdAt", "desc"),
          limit(50)
        );
        const quotesSnapshot = await getDocs(quotesQuery);
        const quotesData = quotesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Fetch all contacts
        const contactsQuery = query(
          collection(db, "contacts"),
          orderBy("createdAt", "desc"),
          limit(50)
        );
        const contactsSnapshot = await getDocs(contactsQuery);
        const contactsData = contactsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setQuotes(quotesData);
        setContacts(contactsData);
        toast({
          title: "Veri Yüklendi",
          description: `${quotesData.length} teklif ve ${contactsData.length} iletişim kaydı bulundu.`,
        });
      } catch (error) {
        toast({
          title: "Hata",
          description: "Veriler yüklenirken bir hata oluştu.",
          variant: "destructive",
        });
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [showImportDialog]);

  // Import from quote
  const handleImportFromQuote = async (quote) => {
    // Format technical info as readable text
    let requirementsText = "";
    const sections = [];

    if (quote.technicalInfo) {
      const info = quote.technicalInfo;

      // Ürün bilgileri
      if (info.productType) sections.push(`Ürün Tipi: ${info.productType}`);
      if (info.consistency) {
        const consistencyLabels = {
          cream: "Krem",
          gel: "Jel",
          lotion: "Losyon",
          serum: "Serum",
          oil: "Yağ",
          powder: "Toz",
          capsule: "Kapsül",
          tablet: "Tablet",
          syrup: "Şurup",
          liquid: "Sıvı",
        };
        sections.push(
          `Kıvam/Form: ${
            consistencyLabels[info.consistency] || info.consistency
          }`
        );
      }

      // Formül bilgileri
      if (info.existingFormula) {
        const formulaLabels = {
          existing: "Mevcut Formül Var",
          new: "Yeni Formül İsteniyor",
        };
        sections.push(
          `Formül Durumu: ${
            formulaLabels[info.existingFormula] || info.existingFormula
          }`
        );
      }
      if (info.formulaDetails)
        sections.push(`Formül Detayları: ${info.formulaDetails}`);
      if (info.ingredients)
        sections.push(`İçerik/İngredients:\n${info.ingredients}`);

      // Ambalaj bilgileri
      if (info.packagingType && info.packagingType.length > 0) {
        sections.push(`Ambalaj Tipi: ${info.packagingType.join(", ")}`);
      }
      if (info.packagingSize)
        sections.push(`Ambalaj Boyutu: ${info.packagingSize}`);
      if (info.ambalajType) sections.push(`Ambalaj Türü: ${info.ambalajType}`);
      if (info.ambalajMaterial)
        sections.push(`Ambalaj Malzemesi: ${info.ambalajMaterial}`);
      if (info.printingRequirements)
        sections.push(`Baskı Gereksinimleri: ${info.printingRequirements}`);

      // Miktar ve hacim
      if (info.productVolume && info.productVolume !== "")
        sections.push(`Ürün Hacmi: ${info.productVolume}`);
      if (info.quantity) sections.push(`Miktar: ${info.quantity}`);
      if (info.currentOrderVolume)
        sections.push(`Mevcut Sipariş Hacmi: ${info.currentOrderVolume}`);

      // Sertifikalar ve düzenlemeler
      if (info.certificates && info.certificates.length > 0) {
        sections.push(`Sertifikalar: ${info.certificates.join(", ")}`);
      }
      if (
        info.regulatoryRequirements &&
        info.regulatoryRequirements.length > 0
      ) {
        sections.push(
          `Yasal Gereksinimler: ${info.regulatoryRequirements.join(", ")}`
        );
      }
      if (info.shelfLife) {
        const shelfLifeLabels = {
          "12months": "12 Ay",
          "24months": "24 Ay",
          "36months": "36 Ay",
          "48months": "48 Ay",
        };
        sections.push(
          `Raf Ömrü: ${shelfLifeLabels[info.shelfLife] || info.shelfLife}`
        );
      }

      // E-ticaret bilgileri
      if (info.warehouseNeeds)
        sections.push(`Depo İhtiyaçları: ${info.warehouseNeeds}`);
      if (info.integrationNeeds && info.integrationNeeds.length > 0) {
        sections.push(
          `Entegrasyon İhtiyaçları: ${info.integrationNeeds.join(", ")}`
        );
      }
      if (info.customerServiceNeeds)
        sections.push(
          `Müşteri Hizmetleri İhtiyaçları: ${info.customerServiceNeeds}`
        );

      // Dijital pazarlama bilgileri
      if (info.brandStage) sections.push(`Marka Aşaması: ${info.brandStage}`);
      if (info.targetAudience)
        sections.push(`Hedef Kitle: ${info.targetAudience}`);
      if (info.marketingGoals && info.marketingGoals.length > 0) {
        sections.push(`Pazarlama Hedefleri: ${info.marketingGoals.join(", ")}`);
      }
      if (info.campaignBudget)
        sections.push(`Kampanya Bütçesi: ${info.campaignBudget}`);
      if (info.contentNeeds && info.contentNeeds.length > 0) {
        sections.push(`İçerik İhtiyaçları: ${info.contentNeeds.join(", ")}`);
      }

      // Genel bilgiler
      if (info.timeline) sections.push(`Zaman Çizelgesi: ${info.timeline}`);
      if (info.budget) sections.push(`Bütçe: ${info.budget}`);
      if (info.specialRequirements)
        sections.push(`Özel Gereksinimler: ${info.specialRequirements}`);
    }

    // Additional info
    let additionalNotesText = "";
    if (quote.additionalInfo) {
      const addInfo = quote.additionalInfo;
      const addSections = [];

      if (addInfo.previousExperience) {
        addSections.push(`Önceki Deneyim: ${addInfo.previousExperience}`);
      }
      if (addInfo.additionalServices && addInfo.additionalServices.length > 0) {
        addSections.push(
          `Ek Hizmetler: ${addInfo.additionalServices.join(", ")}`
        );
      }
      if (addInfo.notes) {
        addSections.push(`Notlar: ${addInfo.notes}`);
      }

      additionalNotesText = addSections.join("\n");
    }

    requirementsText = sections.join("\n");

    // Check if company exists
    const companyName = quote.contactInfo?.company || "";
    if (companyName) {
      const existingCompany = companies.find(
        (c) => c.name.toLowerCase() === companyName.toLowerCase()
      );
      setCompanyExists(!!existingCompany);
      if (existingCompany) {
        setFormData({
          title: quote.projectInfo?.projectName || "Teklif Talebi",
          description: quote.projectInfo?.projectDescription || "",
          category: mapServiceAreaToCategory(quote.projectInfo?.serviceArea),
          priority: REQUEST_PRIORITY.NORMAL,
          source: REQUEST_SOURCE.WEBSITE_FORM,
          companyId: existingCompany.id,
          companyName: existingCompany.name,
          contactPerson: `${quote.contactInfo?.firstName || ""} ${
            quote.contactInfo?.lastName || ""
          }`.trim(),
          contactEmail: quote.contactInfo?.email || "",
          contactPhone: quote.contactInfo?.phone || "",
          estimatedValue: "",
          expectedDelivery: "",
          requirements: requirementsText,
          additionalNotes: additionalNotesText,
        });
      } else {
        setFormData({
          title: quote.projectInfo?.projectName || "Teklif Talebi",
          description: quote.projectInfo?.projectDescription || "",
          category: mapServiceAreaToCategory(quote.projectInfo?.serviceArea),
          priority: REQUEST_PRIORITY.NORMAL,
          source: REQUEST_SOURCE.WEBSITE_FORM,
          companyId: "",
          companyName: companyName,
          contactPerson: `${quote.contactInfo?.firstName || ""} ${
            quote.contactInfo?.lastName || ""
          }`.trim(),
          contactEmail: quote.contactInfo?.email || "",
          contactPhone: quote.contactInfo?.phone || "",
          estimatedValue: "",
          expectedDelivery: "",
          requirements: requirementsText,
          additionalNotes: additionalNotesText,
        });
      }
    } else {
      setCompanyExists(true);
      setFormData({
        title: quote.projectInfo?.projectName || "Teklif Talebi",
        description: quote.projectInfo?.projectDescription || "",
        category: mapServiceAreaToCategory(quote.projectInfo?.serviceArea),
        priority: REQUEST_PRIORITY.NORMAL,
        source: REQUEST_SOURCE.WEBSITE_FORM,
        companyId: "",
        companyName: "",
        contactPerson: `${quote.contactInfo?.firstName || ""} ${
          quote.contactInfo?.lastName || ""
        }`.trim(),
        contactEmail: quote.contactInfo?.email || "",
        contactPhone: quote.contactInfo?.phone || "",
        estimatedValue: "",
        expectedDelivery: "",
        requirements: requirementsText,
        additionalNotes: additionalNotesText,
      });
    }
    setShowImportDialog(false);
  };

  // Import from contact
  const handleImportFromContact = (contact) => {
    // Check if company exists
    const companyName = contact.company || "";
    if (companyName) {
      const existingCompany = companies.find(
        (c) => c.name.toLowerCase() === companyName.toLowerCase()
      );
      setCompanyExists(!!existingCompany);
      if (existingCompany) {
        setFormData({
          title: `${contact.service || "İletişim"} Talebi`,
          description: contact.message || "",
          category: mapServiceToCategory(contact.service),
          priority: REQUEST_PRIORITY.NORMAL,
          source: REQUEST_SOURCE.DIRECT_CONTACT,
          companyId: existingCompany.id,
          companyName: existingCompany.name,
          contactPerson: contact.name || "",
          contactEmail: contact.email || "",
          contactPhone: contact.phone || "",
          estimatedValue: "",
          expectedDelivery: "",
          requirements: contact.product ? `Ürün: ${contact.product}` : "",
          additionalNotes: "",
        });
      } else {
        setFormData({
          title: `${contact.service || "İletişim"} Talebi`,
          description: contact.message || "",
          category: mapServiceToCategory(contact.service),
          priority: REQUEST_PRIORITY.NORMAL,
          source: REQUEST_SOURCE.DIRECT_CONTACT,
          companyId: "",
          companyName: companyName,
          contactPerson: contact.name || "",
          contactEmail: contact.email || "",
          contactPhone: contact.phone || "",
          estimatedValue: "",
          expectedDelivery: "",
          requirements: contact.product ? `Ürün: ${contact.product}` : "",
          additionalNotes: "",
        });
      }
    } else {
      setCompanyExists(true);
      setFormData({
        title: `${contact.service || "İletişim"} Talebi`,
        description: contact.message || "",
        category: mapServiceToCategory(contact.service),
        priority: REQUEST_PRIORITY.NORMAL,
        source: REQUEST_SOURCE.DIRECT_CONTACT,
        companyId: "",
        companyName: "",
        contactPerson: contact.name || "",
        contactEmail: contact.email || "",
        contactPhone: contact.phone || "",
        estimatedValue: "",
        expectedDelivery: "",
        requirements: contact.product ? `Ürün: ${contact.product}` : "",
        additionalNotes: "",
      });
    }
    setShowImportDialog(false);
  };

  // Map service area to request category
  const mapServiceAreaToCategory = (serviceArea) => {
    const mapping = {
      "fason-uretim": REQUEST_CATEGORIES.COSMETIC_MANUFACTURING,
      ambalaj: REQUEST_CATEGORIES.PACKAGING_SUPPLY,
      "eticaret-operasyon": REQUEST_CATEGORIES.ECOMMERCE_OPERATIONS,
      "dijital-pazarlama": REQUEST_CATEGORIES.DIGITAL_MARKETING,
    };

    // If it's a service subcategory, map to appropriate category
    if (serviceArea === "gida-takviyesi") {
      return (
        REQUEST_CATEGORIES.SUPPLEMENT_MANUFACTURING ||
        REQUEST_CATEGORIES.COSMETIC_MANUFACTURING
      );
    }

    return mapping[serviceArea] || "";
  };

  // Save new company
  const handleSaveCompany = async () => {
    if (!formData.companyName.trim()) return;

    setSavingCompany(true);
    try {
      const { createCompany } = await import(
        "../../../../lib/services/companies-service"
      );

      const newCompany = {
        name: formData.companyName,
        email: formData.contactEmail,
        phone: formData.contactPhone,
        contactPerson: formData.contactPerson,
        status: "lead",
        priority: "normal",
        businessLine: "genel",
        description: formData.description || "",
      };

      const companyId = await createCompany(newCompany);

      setFormData((prev) => ({
        ...prev,
        companyId: companyId,
      }));

      setCompanyExists(true);

      // Show success message
      toast({
        title: "Başarılı",
        description: "Firma başarıyla kaydedildi!",
      });
    } catch (error) {
      toast({
        title: "Hata",
        description: "Firma kaydedilirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setSavingCompany(false);
    }
  };

  // Map contact service to request category
  const mapServiceToCategory = (service) => {
    const mapping = {
      "Fason Üretim": REQUEST_CATEGORIES.COSMETIC_MANUFACTURING,
      Ambalaj: REQUEST_CATEGORIES.PACKAGING_SUPPLY,
      "E-ticaret": REQUEST_CATEGORIES.ECOMMERCE_OPERATIONS,
      "Dijital Pazarlama": REQUEST_CATEGORIES.DIGITAL_MARKETING,
    };
    return mapping[service] || "";
  };

  // Get category icon component
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
    return <IconComponent className="h-4 w-4" />;
  };

  // Get category description
  const getCategoryDescription = (category) => {
    const descriptions = {
      cosmetic_manufacturing:
        "Kozmetik ürünleri için fason üretim hizmeti. Krem, serum, şampuan gibi ürünlerin formülasyonu ve üretimi.",
      supplement_manufacturing:
        "Takviye edici gıdaların üretimi. Tablet, kapsül, şurup ve toz formunda üretim.",
      cleaning_manufacturing:
        "Temizlik ürünlerinin fason üretimi. Yüzey temizleyici, bulaşık deterjanı ve genel temizlik ürünleri.",
      packaging_supply:
        "Ambalaj malzemesi tedariki. Şişe, kavanoz, kutu, etiket ve diğer ambalaj çözümleri.",
      ecommerce_operations:
        "E-ticaret operasyon yönetimi. Depo, lojistik, müşteri hizmetleri ve sipariş yönetimi.",
      digital_marketing:
        "Dijital pazarlama hizmetleri. SEO, sosyal medya yönetimi, içerik üretimi ve reklam kampanyaları.",
      formulation_development:
        "Ürün formülasyon geliştirme. Ar-Ge, test ve iyileştirme çalışmaları.",
      consultation:
        "Danışmanlık hizmetleri. İş geliştirme, pazar analizi ve stratejik planlama.",
    };
    return descriptions[category] || "";
  };

  // Get required fields for category
  const getCategoryRequiredFields = (category) => {
    if (!CATEGORY_FIELDS[category]) return [];

    const fields = [];
    Object.entries(CATEGORY_FIELDS[category]).forEach(([key, config]) => {
      if (config.required) {
        fields.push(config.label);
      }
    });
    return fields;
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.title.trim()) {
      errors.title = "Talep başlığı gereklidir";
    }

    if (!formData.description.trim()) {
      errors.description = "Talep açıklaması gereklidir";
    }

    if (!formData.category) {
      errors.category = "Kategori seçimi gereklidir";
    }

    if (!formData.companyId && !formData.companyName.trim()) {
      errors.company = "Firma seçimi veya yeni firma adı gereklidir";
    }

    if (!formData.contactEmail.trim()) {
      errors.contactEmail = "İletişim e-postası gereklidir";
    } else if (!/\S+@\S+\.\S+/.test(formData.contactEmail)) {
      errors.contactEmail = "Geçerli bir e-posta adresi giriniz";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCompanyChange = (companyId) => {
    const selectedCompany = companies.find((c) => c.id === companyId);

    if (selectedCompany) {
      setFormData((prev) => ({
        ...prev,
        companyId,
        companyName: selectedCompany.name,
        contactPerson: selectedCompany.contactPerson || "",
        contactEmail: selectedCompany.email || "",
        contactPhone: selectedCompany.phone || "",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        companyId: "",
        companyName: "",
        contactPerson: "",
        contactEmail: "",
        contactPhone: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const requestData = {
      ...formData,
      estimatedValue: parseFloat(formData.estimatedValue) || 0,
      createdBy: user?.uid,
      createdByName: user?.displayName || user?.email || "Sistem",
    };

    const result = await createRequest(requestData);

    if (result.success) {
      router.push("/admin/requests");
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat("tr-TR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  if (!canCreate) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Erişim Reddedildi
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Talep oluşturma yetkiniz bulunmamaktadır.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      {/* Modern Header */}
      <div className="sticky top-0 z-10 backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin/requests">
                <Button
                  variant="outline"
                  size="sm"
                  className="hover:bg-slate-50 dark:hover:bg-gray-800"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Geri
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
                  <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-2.5 shadow-lg">
                    <MessageSquareText className="h-7 w-7 text-white" />
                  </div>
                  Yeni Talep Oluştur
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2 ml-14">
                  Manuel talep oluşturun veya mevcut teklif/iletişim
                  formlarından içe aktarın
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowImportDialog(true)}
              className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-purple-200 dark:border-purple-800 hover:from-purple-100 hover:to-indigo-100"
            >
              <Import className="h-4 w-4 mr-2" />
              Veri İçe Aktar
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {error && (
          <Card className="mb-6 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-300">
                    Hata Oluştu
                  </h3>
                  <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                    {error}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card className="bg-white dark:bg-gray-800 border-none shadow-lg">
            <CardHeader className="border-b border-gray-100 dark:border-gray-700">
              <CardTitle className="flex items-center gap-2 text-xl">
                <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Temel Bilgiler
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="lg:col-span-2">
                  <Label
                    htmlFor="title"
                    className="text-sm font-medium flex items-center gap-2"
                  >
                    <Tag className="h-4 w-4 text-gray-400" />
                    Talep Başlığı *
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }));
                      setFormErrors((prev) => ({ ...prev, title: "" }));
                    }}
                    placeholder="Örn: Yeni ürün için fason üretim talebi"
                    className={`mt-2 h-12 ${
                      formErrors.title ? "border-red-500" : ""
                    }`}
                  />
                  {formErrors.title && (
                    <p className="text-red-500 text-sm mt-1.5">
                      {formErrors.title}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="category" className="text-sm font-medium">
                    Kategori *
                  </Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => {
                      setFormData((prev) => ({ ...prev, category: value }));
                      setFormErrors((prev) => ({ ...prev, category: "" }));
                    }}
                  >
                    <SelectTrigger
                      className={`mt-2 h-12 ${
                        formErrors.category ? "border-red-500" : ""
                      }`}
                    >
                      <SelectValue placeholder="Kategori seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(REQUEST_CATEGORIES).map((category) => (
                        <SelectItem key={category} value={category}>
                          {getRequestCategoryLabel(category)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.category && (
                    <p className="text-red-500 text-sm mt-1.5">
                      {formErrors.category}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="priority" className="text-sm font-medium">
                    Öncelik
                  </Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, priority: value }))
                    }
                  >
                    <SelectTrigger className="mt-2 h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(REQUEST_PRIORITY).map((priority) => (
                        <SelectItem key={priority} value={priority}>
                          {getRequestPriorityLabel(priority)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="source" className="text-sm font-medium">
                    Talep Kaynağı
                  </Label>
                  <Select
                    value={formData.source}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, source: value }))
                    }
                  >
                    <SelectTrigger className="mt-2 h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(REQUEST_SOURCE).map((source) => (
                        <SelectItem key={source} value={source}>
                          {getRequestSourceLabel(source)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label
                    htmlFor="estimatedValue"
                    className="text-sm font-medium flex items-center gap-2"
                  >
                    <DollarSign className="h-4 w-4 text-gray-400" />
                    Tahmini Değer (₺)
                  </Label>
                  <Input
                    id="estimatedValue"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.estimatedValue}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        estimatedValue: e.target.value,
                      }))
                    }
                    placeholder="0.00"
                    className="mt-2 h-12"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="expectedDelivery"
                    className="text-sm font-medium flex items-center gap-2"
                  >
                    <Calendar className="h-4 w-4 text-gray-400" />
                    Beklenen Teslimat
                  </Label>
                  <Input
                    id="expectedDelivery"
                    type="date"
                    value={formData.expectedDelivery}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        expectedDelivery: e.target.value,
                      }))
                    }
                    className="mt-2 h-12"
                  />
                </div>

                <div className="lg:col-span-2">
                  <Label htmlFor="description" className="text-sm font-medium">
                    Talep Açıklaması *
                  </Label>
                  <Textarea
                    id="description"
                    rows={4}
                    value={formData.description}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }));
                      setFormErrors((prev) => ({ ...prev, description: "" }));
                    }}
                    placeholder="Talebin detaylı açıklamasını yazın..."
                    className={`mt-2 ${
                      formErrors.description ? "border-red-500" : ""
                    }`}
                  />
                  {formErrors.description && (
                    <p className="text-red-500 text-sm mt-1.5">
                      {formErrors.description}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Category Details Card - Show when category is selected */}
          {formData.category && (
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800 shadow-lg">
              <CardHeader className="border-b border-blue-200 dark:border-blue-800">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <div className="bg-blue-600 dark:bg-blue-500 rounded-lg p-2">
                    {getCategoryIconComponent(formData.category)}
                  </div>
                  <div>
                    <div className="text-blue-900 dark:text-blue-100">
                      {getRequestCategoryLabel(formData.category)}
                    </div>
                    <p className="text-sm font-normal text-blue-700 dark:text-blue-300 mt-1">
                      Kategori Detayları
                    </p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Description */}
                  <div className="flex items-start gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg border border-blue-100 dark:border-blue-900">
                    <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                        Hizmet Açıklaması
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {getCategoryDescription(formData.category)}
                      </p>
                    </div>
                  </div>

                  {/* Required Fields */}
                  {getCategoryRequiredFields(formData.category).length > 0 && (
                    <div className="flex items-start gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg border border-blue-100 dark:border-blue-900">
                      <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                          Bu Kategori İçin Gerekli Alanlar
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {getCategoryRequiredFields(formData.category).map(
                            (field, index) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                              >
                                {field}
                              </Badge>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Info Note */}
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      💡 Form kaydedildikten sonra talep detay sayfasında bu
                      kategoriye özel alanları doldurabilirsiniz.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Company & Contact */}
          <Card className="bg-white dark:bg-gray-800 border-none shadow-lg">
            <CardHeader className="border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  Firma ve İletişim Bilgileri
                </CardTitle>
                {!companyExists && formData.companyName && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleSaveCompany}
                    disabled={savingCompany}
                    className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300"
                  >
                    {savingCompany ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Kaydediliyor...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Şirketi Kaydet
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="lg:col-span-2">
                  <Label htmlFor="company" className="text-sm font-medium">
                    Firma Seçimi
                  </Label>
                  <Select
                    value={formData.companyId}
                    onValueChange={handleCompanyChange}
                  >
                    <SelectTrigger
                      className={`mt-2 h-12 ${
                        formErrors.company ? "border-red-500" : ""
                      }`}
                    >
                      <SelectValue placeholder="Mevcut firma seçin veya aşağıda yeni firma adı girin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new-company">Yeni Firma</SelectItem>
                      {companies.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.company && (
                    <p className="text-red-500 text-sm mt-1.5">
                      {formErrors.company}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="companyName" className="text-sm font-medium">
                    Firma Adı {!formData.companyId && "*"}
                  </Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        companyName: e.target.value,
                      }))
                    }
                    placeholder="Firma adını girin"
                    disabled={!!formData.companyId}
                    className="mt-2 h-12"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="contactPerson"
                    className="text-sm font-medium flex items-center gap-2"
                  >
                    <User className="h-4 w-4 text-gray-400" />
                    İletişim Kişisi
                  </Label>
                  <Input
                    id="contactPerson"
                    value={formData.contactPerson}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        contactPerson: e.target.value,
                      }))
                    }
                    placeholder="Ad Soyad"
                    className="mt-2 h-12"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="contactEmail"
                    className="text-sm font-medium flex items-center gap-2"
                  >
                    <Mail className="h-4 w-4 text-gray-400" />
                    İletişim E-postası *
                  </Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        contactEmail: e.target.value,
                      }));
                      setFormErrors((prev) => ({ ...prev, contactEmail: "" }));
                    }}
                    placeholder="email@example.com"
                    className={`mt-2 h-12 ${
                      formErrors.contactEmail ? "border-red-500" : ""
                    }`}
                  />
                  {formErrors.contactEmail && (
                    <p className="text-red-500 text-sm mt-1.5">
                      {formErrors.contactEmail}
                    </p>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="contactPhone"
                    className="text-sm font-medium flex items-center gap-2"
                  >
                    <Phone className="h-4 w-4 text-gray-400" />
                    İletişim Telefonu
                  </Label>
                  <Input
                    id="contactPhone"
                    type="tel"
                    value={formData.contactPhone}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        contactPhone: e.target.value,
                      }))
                    }
                    placeholder="+90 5XX XXX XX XX"
                    className="mt-2 h-12"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card className="bg-white dark:bg-gray-800 border-none shadow-lg">
            <CardHeader className="border-b border-gray-100 dark:border-gray-700">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Ek Bilgiler
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div>
                <Label htmlFor="requirements" className="text-sm font-medium">
                  Özel Gereksinimler
                </Label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-2">
                  İçe aktarılan teknik bilgiler otomatik olarak formatlanmıştır.
                  Düzenleyebilirsiniz.
                </p>
                <Textarea
                  id="requirements"
                  rows={8}
                  value={formData.requirements}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      requirements: e.target.value,
                    }))
                  }
                  placeholder="Özel sertifikalar, standartlar, teknik özellikler...\n\nÖrnek:\nÜrün Tipi: Krem\nKıvam: Jel\nAmbalaj: Airless Pompa\nAmbalaj Boyutu: 50ml\nMiktar: 1000 adet"
                  className="mt-2 font-mono text-sm"
                />
              </div>

              <div>
                <Label
                  htmlFor="additionalNotes"
                  className="text-sm font-medium"
                >
                  Ek Notlar
                </Label>
                <Textarea
                  id="additionalNotes"
                  rows={3}
                  value={formData.additionalNotes}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      additionalNotes: e.target.value,
                    }))
                  }
                  placeholder="Projeyle ilgili diğer önemli bilgiler..."
                  className="mt-2"
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end gap-4">
            <Link href="/admin/requests">
              <Button variant="outline" type="button" size="lg">
                İptal
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={loading}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5 mr-2" />
                  Talebi Kaydet
                </>
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Import Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="max-w-6xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <Import className="h-6 w-6 text-blue-600" />
              Veri İçe Aktar
            </DialogTitle>
            <DialogDescription>
              Teklif formları veya iletişim formlarından talep oluşturun
            </DialogDescription>
          </DialogHeader>

          <Tabs
            defaultValue="quotes"
            className="mt-4 flex-1 flex flex-col overflow-hidden"
          >
            <TabsList className="grid w-full grid-cols-2 flex-shrink-0">
              <TabsTrigger value="quotes">
                Teklif Formları ({quotes.length})
              </TabsTrigger>
              <TabsTrigger value="contacts">
                İletişim Formları ({contacts.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="quotes"
              className="space-y-3 mt-4 overflow-y-auto flex-1"
            >
              {loadingData ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
              ) : quotes.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    Teklif talebi bulunamadı
                  </p>
                </div>
              ) : (
                quotes.map((quote) => (
                  <div
                    key={quote.id}
                    className="group relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer"
                    onClick={() => handleImportFromQuote(quote)}
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 flex items-center justify-center border border-blue-100 dark:border-blue-800">
                          <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <h4 className="font-semibold text-gray-900 dark:text-white text-base">
                            {quote.projectInfo?.projectName || "İsimsiz Proje"}
                          </h4>
                          <Badge
                            variant="outline"
                            className="flex-shrink-0 bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800"
                          >
                            {quote.projectInfo?.serviceArea ===
                              "fason-uretim" && "Fason Üretim"}
                            {quote.projectInfo?.serviceArea === "ambalaj" &&
                              "Ambalaj"}
                            {quote.projectInfo?.serviceArea ===
                              "eticaret-operasyon" && "E-ticaret"}
                            {quote.projectInfo?.serviceArea ===
                              "dijital-pazarlama" && "Dijital Pazarlama"}
                            {!quote.projectInfo?.serviceArea && "Diğer"}
                          </Badge>
                        </div>

                        {quote.projectInfo?.projectDescription && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                            {quote.projectInfo.projectDescription}
                          </p>
                        )}

                        {/* Info Grid */}
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div className="flex items-center gap-2 text-sm">
                            <Building2 className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            <span className="text-gray-700 dark:text-gray-300 truncate">
                              {quote.contactInfo?.company ||
                                "Firma belirtilmemiş"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            <span className="text-gray-700 dark:text-gray-300 truncate">
                              {quote.contactInfo?.firstName}{" "}
                              {quote.contactInfo?.lastName}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            <span className="text-gray-700 dark:text-gray-300 truncate">
                              {quote.contactInfo?.email}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            <span className="text-gray-700 dark:text-gray-300 truncate">
                              {quote.contactInfo?.phone}
                            </span>
                          </div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <Calendar className="h-3.5 w-3.5" />
                            {formatDate(quote.createdAt)}
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-xs font-medium text-blue-600 dark:text-blue-400 flex items-center gap-1">
                              İçe Aktar
                              <CheckCircle2 className="h-4 w-4" />
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>

            <TabsContent
              value="contacts"
              className="space-y-3 mt-4 overflow-y-auto flex-1"
            >
              {loadingData ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
              ) : contacts.length === 0 ? (
                <div className="text-center py-12">
                  <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    İletişim formu bulunamadı
                  </p>
                </div>
              ) : (
                contacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="group relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-green-400 hover:shadow-md transition-all cursor-pointer"
                    onClick={() => handleImportFromContact(contact)}
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 flex items-center justify-center border border-green-100 dark:border-green-800">
                          <Mail className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <h4 className="font-semibold text-gray-900 dark:text-white text-base">
                            {contact.name}
                          </h4>
                          {contact.service && (
                            <Badge
                              variant="outline"
                              className="flex-shrink-0 bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800"
                            >
                              {contact.service}
                            </Badge>
                          )}
                        </div>

                        {contact.message && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                            {contact.message}
                          </p>
                        )}

                        {/* Info Grid */}
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          {contact.company && (
                            <div className="flex items-center gap-2 text-sm">
                              <Building2 className="h-4 w-4 text-gray-400 flex-shrink-0" />
                              <span className="text-gray-700 dark:text-gray-300 truncate">
                                {contact.company}
                              </span>
                            </div>
                          )}
                          {contact.email && (
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                              <span className="text-gray-700 dark:text-gray-300 truncate">
                                {contact.email}
                              </span>
                            </div>
                          )}
                          {contact.phone && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                              <span className="text-gray-700 dark:text-gray-300 truncate">
                                {contact.phone}
                              </span>
                            </div>
                          )}
                          {contact.product && (
                            <div className="flex items-center gap-2 text-sm">
                              <Package className="h-4 w-4 text-gray-400 flex-shrink-0" />
                              <span className="text-gray-700 dark:text-gray-300 truncate">
                                {contact.product}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <Calendar className="h-3.5 w-3.5" />
                            {formatDate(contact.createdAt)}
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-xs font-medium text-green-600 dark:text-green-400 flex items-center gap-1">
                              İçe Aktar
                              <CheckCircle2 className="h-4 w-4" />
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}
