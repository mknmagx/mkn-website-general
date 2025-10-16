"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useRequestCreation } from "../../../../hooks/use-requests";
import { useCompanies } from "../../../../hooks/use-company";
import { usePermissions } from "../../../../components/admin-route-guard";
import { useAdminAuth } from "../../../../hooks/use-admin-auth";
import {
  REQUEST_CATEGORIES,
  REQUEST_PRIORITY,
  REQUEST_SOURCE,
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
  CardDescription,
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

// Icons
import { MessageSquareText, ArrowLeft, Save, AlertCircle } from "lucide-react";

export default function NewRequestPage() {
  const router = useRouter();
  const { user } = useAdminAuth();
  const { hasPermission } = usePermissions();
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

  const canCreate =
    hasPermission("requests.create") || hasPermission("admin.all");

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

      // Clear error when user starts typing - only if error exists
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
          contactPerson: selectedCompany.contactPerson || "",
          contactEmail: selectedCompany.email || "",
          contactPhone: selectedCompany.phone || "",
        }));
      } else {
        // Handle "new-company" or any other non-existing company ID
        setFormData((prev) => ({
          ...prev,
          companyId: "",
          companyName: "",
          contactPerson: "",
          contactEmail: "",
          contactPhone: "",
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

  const handleCategoryChange = useCallback(
    (value) => handleInputChange("category", value),
    [handleInputChange]
  );
  const handlePriorityChange = useCallback(
    (value) => handleInputChange("priority", value),
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

    const requestData = {
      ...formData,
      estimatedValue: parseFloat(formData.estimatedValue) || 0,
      createdBy: user?.uid,
      createdByName: user?.displayName || user?.email,
    };

    const result = await createRequest(requestData);

    if (result.success) {
      router.push("/admin/requests");
    }
  };

  if (!canCreate) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Erişim Reddedildi
          </h3>
          <p className="text-gray-500">
            Talep oluşturma yetkiniz bulunmamaktadır.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/requests">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <MessageSquareText className="h-8 w-8 text-blue-600" />
            Yeni Müşteri Talebi
          </h1>
          <p className="text-gray-600 mt-2">
            Yeni bir müşteri talebi oluşturun ve detaylı bilgilerini kaydedin
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Hata Oluştu</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Temel Bilgiler</CardTitle>
            <CardDescription>Talebin genel bilgilerini girin</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Label htmlFor="title">Talep Başlığı *</Label>
                <Input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={handleTitleChange}
                  placeholder="Örn: Yeni ürün için fason üretim talebi"
                  className={formErrors.title ? "border-red-500" : ""}
                />
                {formErrors.title && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.title}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="category">Kategori *</Label>
                <Select
                  value={formData.category}
                  onValueChange={handleCategoryChange}
                >
                  <SelectTrigger
                    className={formErrors.category ? "border-red-500" : ""}
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
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.category}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="priority">Öncelik</Label>
                <Select
                  value={formData.priority}
                  onValueChange={handlePriorityChange}
                >
                  <SelectTrigger>
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
                <Label htmlFor="source">Talep Kaynağı</Label>
                <Select
                  value={formData.source}
                  onValueChange={handleSourceChange}
                >
                  <SelectTrigger>
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
                <Label htmlFor="estimatedValue">Tahmini Değer (TL)</Label>
                <Input
                  id="estimatedValue"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.estimatedValue}
                  onChange={handleEstimatedValueChange}
                  placeholder="0.00"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="description">Talep Açıklaması *</Label>
                <Textarea
                  id="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleDescriptionChange}
                  placeholder="Talebin detaylı açıklamasını yazın..."
                  className={formErrors.description ? "border-red-500" : ""}
                />
                {formErrors.description && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.description}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Company & Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Firma ve İletişim Bilgileri</CardTitle>
            <CardDescription>
              Talep sahibi firma ve iletişim detayları
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Label htmlFor="company">Firma Seçimi</Label>
                <Select
                  value={formData.companyId}
                  onValueChange={handleCompanyChange}
                >
                  <SelectTrigger
                    className={formErrors.company ? "border-red-500" : ""}
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
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.company}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="companyName">
                  Firma Adı {!formData.companyId && "*"}
                </Label>
                <Input
                  id="companyName"
                  type="text"
                  value={formData.companyName}
                  onChange={handleCompanyNameChange}
                  placeholder="Firma adını girin"
                  disabled={!!formData.companyId}
                />
              </div>

              <div>
                <Label htmlFor="contactPerson">İletişim Kişisi</Label>
                <Input
                  id="contactPerson"
                  type="text"
                  value={formData.contactPerson}
                  onChange={handleContactPersonChange}
                  placeholder="Ad Soyad"
                />
              </div>

              <div>
                <Label htmlFor="contactEmail">İletişim E-postası *</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={handleContactEmailChange}
                  placeholder="email@example.com"
                  className={formErrors.contactEmail ? "border-red-500" : ""}
                />
                {formErrors.contactEmail && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.contactEmail}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="contactPhone">İletişim Telefonu</Label>
                <Input
                  id="contactPhone"
                  type="tel"
                  value={formData.contactPhone}
                  onChange={handleContactPhoneChange}
                  placeholder="+90 5XX XXX XX XX"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Details */}
        <Card>
          <CardHeader>
            <CardTitle>Ek Detaylar</CardTitle>
            <CardDescription>
              Taleple ilgili ek bilgiler ve gereksinimler
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <div>
                <Label htmlFor="expectedDelivery">
                  Beklenen Teslimat Tarihi
                </Label>
                <Input
                  id="expectedDelivery"
                  type="date"
                  value={formData.expectedDelivery}
                  onChange={handleExpectedDeliveryChange}
                />
              </div>

              <div>
                <Label htmlFor="requirements">Özel Gereksinimler</Label>
                <Textarea
                  id="requirements"
                  rows={3}
                  value={formData.requirements}
                  onChange={handleRequirementsChange}
                  placeholder="Özel sertifikalar, standartlar, teknik özellikler vb."
                />
              </div>

              <div>
                <Label htmlFor="additionalNotes">Ek Notlar</Label>
                <Textarea
                  id="additionalNotes"
                  rows={3}
                  value={formData.additionalNotes}
                  onChange={handleAdditionalNotesChange}
                  placeholder="Diğer önemli notlar ve açıklamalar..."
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex items-center justify-end gap-4">
          <Link href="/admin/requests">
            <Button variant="outline" type="button">
              İptal
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Kaydediliyor...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Talebi Kaydet
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
