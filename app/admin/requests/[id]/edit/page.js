"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useRequest } from "../../../../../hooks/use-requests";
import { useCompanies } from "../../../../../hooks/use-company";
import { usePermissions } from "../../../../../components/admin-route-guard";
import { useAdminAuth } from "../../../../../hooks/use-admin-auth";
import { useToast } from "../../../../../hooks/use-toast";
import {
  REQUEST_CATEGORIES,
  REQUEST_PRIORITY,
  REQUEST_STATUS,
  REQUEST_SOURCE,
  getRequestCategoryLabel,
  getRequestPriorityLabel,
  getRequestStatusLabel,
  getRequestSourceLabel,
  getCategoryColor,
  RequestService,
} from "../../../../../lib/services/request-service";

// UI Components
import { Button } from "../../../../../components/ui/button";
import { Input } from "../../../../../components/ui/input";
import { Textarea } from "../../../../../components/ui/textarea";
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
import { Label } from "../../../../../components/ui/label";
import { Badge } from "../../../../../components/ui/badge";

// Icons
import {
  MessageSquareText,
  ArrowLeft,
  Save,
  AlertCircle,
  X,
  Loader2,
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  Calendar,
  DollarSign,
  Target,
  Sparkles,
  Edit3,
} from "lucide-react";

export default function RequestEditPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAdminAuth();
  const { toast } = useToast();
  const { hasPermission } = usePermissions();
  const { request, loading, error } = useRequest(params.id);
  const [updating, setUpdating] = useState(false);
  const { companies, loading: companiesLoading } = useCompanies();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    priority: REQUEST_PRIORITY.NORMAL,
    status: REQUEST_STATUS.NEW,
    source: REQUEST_SOURCE.WEBSITE_FORM,
    companyId: "",
    companyName: "",
    contactPerson: "",
    contactEmail: "",
    contactPhone: "",
    estimatedValue: "",
    actualValue: "",
    expectedDelivery: "",
    requirements: "",
    additionalNotes: "",
    assignedTo: "",
  });

  const [formErrors, setFormErrors] = useState({});

  const canEdit = hasPermission("requests.edit") || hasPermission("admin.all");

  useEffect(() => {
    if (request) {
      // Format date for input field (YYYY-MM-DD)
      const formatDateForInput = (dateValue) => {
        if (!dateValue) return "";

        // If it's already in string format (YYYY-MM-DD), return as is
        if (typeof dateValue === "string") {
          // Validate the string format
          const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
          if (dateRegex.test(dateValue)) {
            return dateValue;
          }
        }

        // Handle other date formats (Firestore timestamp, Date object)
        let date;
        if (dateValue.toDate) {
          date = dateValue.toDate();
        } else if (dateValue instanceof Date) {
          date = dateValue;
        } else {
          return "";
        }

        if (isNaN(date.getTime())) return "";

        return date.toISOString().split("T")[0];
      };

      const newFormData = {
        title: request.title || "",
        description: request.description || "",
        category: request.category || "",
        priority: request.priority || REQUEST_PRIORITY.NORMAL,
        status: request.status || REQUEST_STATUS.NEW,
        source: request.source || REQUEST_SOURCE.WEBSITE_FORM,
        companyId: request.companyId || "",
        companyName: request.companyName || "",
        contactPerson: request.contactPerson || "",
        contactEmail: request.contactEmail || "",
        contactPhone: request.contactPhone || "",
        estimatedValue: request.estimatedValue?.toString() || "",
        actualValue: request.actualValue?.toString() || "",
        expectedDelivery: formatDateForInput(request.expectedDelivery),
        requirements: request.requirements || "",
        additionalNotes: request.additionalNotes || "",
        assignedTo: request.assignedTo || "",
      };

      setFormData(newFormData);
    }
  }, [request]);

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

  const handleInputChange = useCallback(
    (field, value) => {
      setFormData((prev) => ({ ...prev, [field]: value }));

      // Clear error when user starts typing
      if (formErrors[field]) {
        setFormErrors((prev) => ({ ...prev, [field]: "" }));
      }
    },
    [formErrors]
  );

  const handleCompanyChange = useCallback(
    (companyId) => {
      const selectedCompany = companies.find((c) => c.id === companyId);

      if (selectedCompany) {
        setFormData((prev) => ({
          ...prev,
          companyId,
          companyName: selectedCompany.name,
          // Only update contact info if it's empty, preserve existing data
          contactPerson:
            prev.contactPerson || selectedCompany.contactPerson || "",
          contactEmail: prev.contactEmail || selectedCompany.email || "",
          contactPhone: prev.contactPhone || selectedCompany.phone || "",
        }));
      } else if (companyId === "new-company") {
        // Only clear company ID, keep existing contact info
        setFormData((prev) => ({
          ...prev,
          companyId: "",
        }));
      } else {
        // For other cases, just update the company ID
        setFormData((prev) => ({
          ...prev,
          companyId,
        }));
      }
    },
    [companies]
  );

  // Memoized handlers for better performance
  const handleTitleChange = useCallback(
    (e) => handleInputChange("title", e.target.value),
    [handleInputChange]
  );
  const handleDescriptionChange = useCallback(
    (e) => handleInputChange("description", e.target.value),
    [handleInputChange]
  );
  const handleEstimatedValueChange = useCallback(
    (e) => handleInputChange("estimatedValue", e.target.value),
    [handleInputChange]
  );
  const handleActualValueChange = useCallback(
    (e) => handleInputChange("actualValue", e.target.value),
    [handleInputChange]
  );
  const handleCompanyNameChange = useCallback(
    (e) => handleInputChange("companyName", e.target.value),
    [handleInputChange]
  );
  const handleContactPersonChange = useCallback(
    (e) => handleInputChange("contactPerson", e.target.value),
    [handleInputChange]
  );
  const handleContactEmailChange = useCallback(
    (e) => handleInputChange("contactEmail", e.target.value),
    [handleInputChange]
  );
  const handleContactPhoneChange = useCallback(
    (e) => handleInputChange("contactPhone", e.target.value),
    [handleInputChange]
  );
  const handleExpectedDeliveryChange = useCallback(
    (e) => handleInputChange("expectedDelivery", e.target.value),
    [handleInputChange]
  );
  const handleRequirementsChange = useCallback(
    (e) => handleInputChange("requirements", e.target.value),
    [handleInputChange]
  );
  const handleAdditionalNotesChange = useCallback(
    (e) => handleInputChange("additionalNotes", e.target.value),
    [handleInputChange]
  );
  const handleAssignedToChange = useCallback(
    (e) => handleInputChange("assignedTo", e.target.value),
    [handleInputChange]
  );

  const handleCategoryChange = useCallback(
    (value) => {
      handleInputChange("category", value);
    },
    [handleInputChange]
  );
  const handlePriorityChange = useCallback(
    (value) => handleInputChange("priority", value),
    [handleInputChange]
  );
  const handleStatusChange = useCallback(
    (value) => handleInputChange("status", value),
    [handleInputChange]
  );
  const handleSourceChange = useCallback(
    (value) => handleInputChange("source", value),
    [handleInputChange]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setUpdating(true);

    try {
      const requestData = {
        ...formData,
        estimatedValue: parseFloat(formData.estimatedValue) || 0,
        actualValue: parseFloat(formData.actualValue) || 0,
        updatedBy: user?.uid,
        updatedByName: user?.displayName || user?.email,
      };

      const result = await RequestService.updateRequest(params.id, requestData);

      if (result.success) {
        toast({
          title: "Başarılı",
          description: "Talep başarıyla güncellendi",
        });
        router.push(`/admin/requests/${params.id}`);
      } else {
        setFormErrors({
          submit: result.error || "Güncelleme sırasında bir hata oluştu",
        });
        toast({
          title: "Hata",
          description: result.error || "Güncelleme sırasında bir hata oluştu",
          variant: "destructive",
        });
      }
    } catch (error) {
      const errorMessage = "Güncelleme sırasında bir hata oluştu";
      setFormErrors({ submit: errorMessage });
      toast({
        title: "Hata",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

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

  if (!canEdit) {
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
                Talep düzenleme yetkiniz bulunmamaktadır.
              </p>
              <Button
                onClick={() => router.push(`/admin/requests/${params.id}`)}
                variant="outline"
                className="mt-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Talep Detayına Dön
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-gray-900 dark:via-blue-900/10 dark:to-gray-900">
      {/* Modern Header with Sticky Nav */}
      <div className="backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/admin/requests/${params.id}`)}
                className="hover:bg-blue-50 dark:hover:bg-blue-900/20"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Geri
              </Button>
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 rounded-lg p-2 shadow-md">
                  <Edit3 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Talep Düzenle
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                      #{request.requestNumber}
                    </span>
                    <Badge
                      variant="outline"
                      className={`${getCategoryColor(
                        request.category
                      )} border text-xs`}
                    >
                      {getRequestCategoryLabel(request.category)}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => router.push(`/admin/requests/${params.id}`)}
                className="hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4 mr-2" />
                İptal
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={updating}
                className="min-w-[140px] bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-md"
              >
                {updating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Kaydediliyor...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Kaydet
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {formErrors.submit && (
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                <p className="text-red-800 dark:text-red-200 font-medium">
                  {formErrors.submit}
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Left Column - Main Forms */}
            <div className="xl:col-span-2 space-y-6">
              {/* Temel Bilgiler */}
              <Card className="bg-white dark:bg-gray-800 border-none shadow-lg">
                <CardHeader className="border-b border-gray-100 dark:border-gray-700 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-lg p-2 shadow-md">
                      <MessageSquareText className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                        Temel Bilgiler
                      </CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-400">
                        Talebin genel bilgilerini düzenleyin
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-5">
                  <div>
                    <Label
                      htmlFor="title"
                      className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2"
                    >
                      <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      Talep Başlığı <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="title"
                      type="text"
                      value={formData.title}
                      onChange={handleTitleChange}
                      placeholder="Örn: Yeni ürün için fason üretim talebi"
                      className={`bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 ${
                        formErrors.title
                          ? "border-red-500 dark:border-red-500"
                          : ""
                      }`}
                    />
                    {formErrors.title && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {formErrors.title}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label
                      htmlFor="description"
                      className="text-sm font-semibold text-gray-900 dark:text-white mb-2"
                    >
                      Talep Açıklaması <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="description"
                      rows={4}
                      value={formData.description}
                      onChange={handleDescriptionChange}
                      placeholder="Talebin detaylı açıklamasını yazın..."
                      className={`bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 ${
                        formErrors.description
                          ? "border-red-500 dark:border-red-500"
                          : ""
                      }`}
                    />
                    {formErrors.description && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {formErrors.description}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label
                        htmlFor="category"
                        className="text-sm font-semibold text-gray-900 dark:text-white mb-2"
                      >
                        Kategori <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        key={`category-${formData.category || "empty"}`}
                        value={formData.category || ""}
                        onValueChange={handleCategoryChange}
                      >
                        <SelectTrigger
                          className={`bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 ${
                            formErrors.category
                              ? "border-red-500 dark:border-red-500"
                              : ""
                          }`}
                        >
                          <SelectValue placeholder="Kategori seçin">
                            {formData.category &&
                            Object.values(REQUEST_CATEGORIES).includes(
                              formData.category
                            )
                              ? getRequestCategoryLabel(formData.category)
                              : "Kategori seçin"}
                          </SelectValue>
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
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {formErrors.category}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label
                        htmlFor="status"
                        className="text-sm font-semibold text-gray-900 dark:text-white mb-2"
                      >
                        Durum
                      </Label>
                      <Select
                        key={`status-${formData.status || "empty"}`}
                        value={formData.status || ""}
                        onValueChange={handleStatusChange}
                      >
                        <SelectTrigger className="bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700">
                          <SelectValue placeholder="Durum seçin">
                            {formData.status &&
                            Object.values(REQUEST_STATUS).includes(
                              formData.status
                            )
                              ? getRequestStatusLabel(formData.status)
                              : "Durum seçin"}
                          </SelectValue>
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
                      <Label
                        htmlFor="priority"
                        className="text-sm font-semibold text-gray-900 dark:text-white mb-2"
                      >
                        Öncelik
                      </Label>
                      <Select
                        key={`priority-${formData.priority || "empty"}`}
                        value={formData.priority || ""}
                        onValueChange={handlePriorityChange}
                      >
                        <SelectTrigger className="bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700">
                          <SelectValue placeholder="Öncelik seçin">
                            {formData.priority &&
                            Object.values(REQUEST_PRIORITY).includes(
                              formData.priority
                            )
                              ? getRequestPriorityLabel(formData.priority)
                              : "Öncelik seçin"}
                          </SelectValue>
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
                      <Label
                        htmlFor="source"
                        className="text-sm font-semibold text-gray-900 dark:text-white mb-2"
                      >
                        Talep Kaynağı
                      </Label>
                      <Select
                        key={`source-${formData.source || "empty"}`}
                        value={formData.source || ""}
                        onValueChange={handleSourceChange}
                      >
                        <SelectTrigger className="bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700">
                          <SelectValue placeholder="Kaynak seçin">
                            {formData.source &&
                            Object.values(REQUEST_SOURCE).includes(
                              formData.source
                            )
                              ? getRequestSourceLabel(formData.source)
                              : "Kaynak seçin"}
                          </SelectValue>
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
                  </div>
                </CardContent>
              </Card>

              {/* Firma ve İletişim Bilgileri */}
              <Card className="bg-white dark:bg-gray-800 border-none shadow-lg">
                <CardHeader className="border-b border-gray-100 dark:border-gray-700 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 rounded-lg p-2 shadow-md">
                      <Building2 className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                        Firma ve İletişim Bilgileri
                      </CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-400">
                        Talep sahibi firma ve iletişim detayları
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-5">
                  <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800">
                    <Label
                      htmlFor="company"
                      className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2"
                    >
                      <Sparkles className="h-4 w-4 text-green-600 dark:text-green-400" />
                      Kayıtlı Firmalardan Hızlı Seçim
                    </Label>
                    <Select
                      value={formData.companyId || ""}
                      onValueChange={handleCompanyChange}
                    >
                      <SelectTrigger
                        className={`bg-white dark:bg-gray-800 border-green-200 dark:border-green-700 ${
                          formErrors.company
                            ? "border-red-500 dark:border-red-500"
                            : ""
                        }`}
                      >
                        <SelectValue placeholder="Mevcut firma seçin veya aşağıda yeni firma adı girin">
                          {formData.companyId
                            ? companies.find((c) => c.id === formData.companyId)
                                ?.name ||
                              formData.companyName ||
                              "Seçili firma bulunamadı"
                            : formData.companyName
                            ? formData.companyName
                            : "Mevcut firma seçin veya aşağıda yeni firma adı girin"}
                        </SelectValue>
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
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {formErrors.company}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label
                        htmlFor="companyName"
                        className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2"
                      >
                        <Building2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                        Firma Adı{" "}
                        {!formData.companyId && (
                          <span className="text-red-500">*</span>
                        )}
                      </Label>
                      <Input
                        id="companyName"
                        type="text"
                        value={formData.companyName}
                        onChange={handleCompanyNameChange}
                        placeholder="Firma adını girin"
                        disabled={
                          !!formData.companyId &&
                          companies.find((c) => c.id === formData.companyId)
                        }
                        className="bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700"
                      />
                    </div>

                    <div>
                      <Label
                        htmlFor="contactPerson"
                        className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2"
                      >
                        <User className="h-4 w-4 text-green-600 dark:text-green-400" />
                        İletişim Kişisi
                      </Label>
                      <Input
                        id="contactPerson"
                        type="text"
                        value={formData.contactPerson}
                        onChange={handleContactPersonChange}
                        placeholder="Ad Soyad"
                        className="bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700"
                      />
                    </div>

                    <div>
                      <Label
                        htmlFor="contactEmail"
                        className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2"
                      >
                        <Mail className="h-4 w-4 text-green-600 dark:text-green-400" />
                        İletişim E-postası{" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="contactEmail"
                        type="email"
                        value={formData.contactEmail}
                        onChange={handleContactEmailChange}
                        placeholder="email@example.com"
                        className={`bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 ${
                          formErrors.contactEmail
                            ? "border-red-500 dark:border-red-500"
                            : ""
                        }`}
                      />
                      {formErrors.contactEmail && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {formErrors.contactEmail}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label
                        htmlFor="contactPhone"
                        className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2"
                      >
                        <Phone className="h-4 w-4 text-green-600 dark:text-green-400" />
                        İletişim Telefonu
                      </Label>
                      <Input
                        id="contactPhone"
                        type="tel"
                        value={formData.contactPhone}
                        onChange={handleContactPhoneChange}
                        placeholder="+90 5XX XXX XX XX"
                        className="bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Ek Detaylar */}
              <Card className="bg-white dark:bg-gray-800 border-none shadow-lg">
                <CardHeader className="border-b border-gray-100 dark:border-gray-700 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700 rounded-lg p-2 shadow-md">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                        Ek Detaylar
                      </CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-400">
                        Özel gereksinimler ve ek notlar
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-5">
                  <div>
                    <Label
                      htmlFor="requirements"
                      className="text-sm font-semibold text-gray-900 dark:text-white mb-2"
                    >
                      Özel Gereksinimler
                    </Label>
                    <Textarea
                      id="requirements"
                      rows={3}
                      value={formData.requirements}
                      onChange={handleRequirementsChange}
                      placeholder="Özel sertifikalar, standartlar, teknik özellikler vb."
                      className="bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="additionalNotes"
                      className="text-sm font-semibold text-gray-900 dark:text-white mb-2"
                    >
                      Ek Notlar
                    </Label>
                    <Textarea
                      id="additionalNotes"
                      rows={3}
                      value={formData.additionalNotes}
                      onChange={handleAdditionalNotesChange}
                      placeholder="Diğer önemli notlar ve açıklamalar..."
                      className="bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Sticky Sidebar */}
            <div className="xl:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Finansal ve Zaman Bilgileri */}
                <Card className="bg-white dark:bg-gray-800 border-none shadow-lg">
                  <CardHeader className="border-b border-gray-100 dark:border-gray-700 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 rounded-lg p-2 shadow-md">
                        <DollarSign className="h-5 w-5 text-white" />
                      </div>
                      <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">
                        Finansal Bilgiler
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-4">
                    <div>
                      <Label
                        htmlFor="estimatedValue"
                        className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2"
                      >
                        <DollarSign className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        Tahmini Değer (TL)
                      </Label>
                      <Input
                        id="estimatedValue"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.estimatedValue}
                        onChange={handleEstimatedValueChange}
                        placeholder="0.00"
                        className="bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700"
                      />
                    </div>

                    <div>
                      <Label
                        htmlFor="actualValue"
                        className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2"
                      >
                        <DollarSign className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        Gerçek Değer (TL)
                      </Label>
                      <Input
                        id="actualValue"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.actualValue}
                        onChange={handleActualValueChange}
                        placeholder="0.00"
                        className="bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700"
                      />
                    </div>

                    <div>
                      <Label
                        htmlFor="expectedDelivery"
                        className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2"
                      >
                        <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        Beklenen Teslim Tarihi
                      </Label>
                      <Input
                        id="expectedDelivery"
                        type="date"
                        value={formData.expectedDelivery}
                        onChange={handleExpectedDeliveryChange}
                        className="bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700"
                      />
                    </div>

                    <div>
                      <Label
                        htmlFor="assignedTo"
                        className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2"
                      >
                        <Target className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        Atanan Kişi
                      </Label>
                      <Input
                        id="assignedTo"
                        type="text"
                        value={formData.assignedTo}
                        onChange={handleAssignedToChange}
                        placeholder="Talep sorumlusu"
                        className="bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* İşlem Butonları */}
                <Card className="bg-gradient-to-br from-blue-50 to-purple-50/30 dark:from-blue-900/20 dark:to-purple-900/10 border-none shadow-lg">
                  <CardContent className="pt-6 space-y-3">
                    <Button
                      onClick={handleSubmit}
                      disabled={updating}
                      className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-md"
                      size="lg"
                    >
                      {updating ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Kaydediliyor...
                        </>
                      ) : (
                        <>
                          <Save className="h-5 w-5 mr-2" />
                          Değişiklikleri Kaydet
                        </>
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() =>
                        router.push(`/admin/requests/${params.id}`)
                      }
                      className="w-full"
                    >
                      <X className="h-4 w-4 mr-2" />
                      İptal Et
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
