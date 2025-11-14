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
  CATEGORY_FIELDS,
  getRequestCategoryLabel,
  getRequestPriorityLabel,
  getRequestSourceLabel,
  getCategoryIcon,
  getCategoryColor,
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
import {
  MessageSquareText,
  ArrowLeft,
  Save,
  AlertCircle,
  Plus,
  Trash2,
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
    categorySpecificData: {},
  });

  const [formErrors, setFormErrors] = useState({});
  const [selectedCategory, setSelectedCategory] = useState(null);

  const canCreate =
    hasPermission("requests.create") || hasPermission("admin.all");

  // Kategori değiştiğinde özel alanları sıfırla
  useEffect(() => {
    if (formData.category && formData.category !== selectedCategory) {
      setSelectedCategory(formData.category);
      setFormData((prev) => ({
        ...prev,
        categorySpecificData: {},
      }));
    }
  }, [formData.category, selectedCategory]);

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

  // Dinamik form alanları renderer
  const renderDynamicField = (fieldKey, fieldConfig, parentKey = null) => {
    const fullKey = parentKey ? `${parentKey}.${fieldKey}` : fieldKey;
    const value = parentKey
      ? formData.categorySpecificData[parentKey]?.[fieldKey] || ""
      : formData.categorySpecificData[fieldKey] || "";

    const updateValue = (newValue) => {
      if (parentKey) {
        setFormData((prev) => ({
          ...prev,
          categorySpecificData: {
            ...prev.categorySpecificData,
            [parentKey]: {
              ...prev.categorySpecificData[parentKey],
              [fieldKey]: newValue,
            },
          },
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          categorySpecificData: {
            ...prev.categorySpecificData,
            [fieldKey]: newValue,
          },
        }));
      }
    };

    switch (fieldConfig.type) {
      case "text":
        return (
          <div key={fullKey}>
            <Label htmlFor={fullKey}>
              {fieldConfig.label} {fieldConfig.required && "*"}
            </Label>
            <Input
              id={fullKey}
              type="text"
              value={value}
              onChange={(e) => updateValue(e.target.value)}
              placeholder={
                fieldConfig.placeholder || `${fieldConfig.label} girin`
              }
            />
          </div>
        );

      case "number":
        return (
          <div key={fullKey}>
            <Label htmlFor={fullKey}>
              {fieldConfig.label} {fieldConfig.required && "*"}
            </Label>
            <Input
              id={fullKey}
              type="number"
              min="0"
              value={value}
              onChange={(e) => updateValue(parseInt(e.target.value) || 0)}
              placeholder={fieldConfig.placeholder || "0"}
            />
          </div>
        );

      case "textarea":
        return (
          <div key={fullKey}>
            <Label htmlFor={fullKey}>
              {fieldConfig.label} {fieldConfig.required && "*"}
            </Label>
            <Textarea
              id={fullKey}
              rows={3}
              value={value}
              onChange={(e) => updateValue(e.target.value)}
              placeholder={
                fieldConfig.placeholder || `${fieldConfig.label} girin`
              }
            />
          </div>
        );

      case "select":
        return (
          <div key={fullKey}>
            <Label htmlFor={fullKey}>
              {fieldConfig.label} {fieldConfig.required && "*"}
            </Label>
            <Select value={value} onValueChange={updateValue}>
              <SelectTrigger>
                <SelectValue placeholder={`${fieldConfig.label} seçin`} />
              </SelectTrigger>
              <SelectContent>
                {fieldConfig.options?.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case "multiselect":
        const multiValue = Array.isArray(value) ? value : [];
        return (
          <div key={fullKey}>
            <Label>
              {fieldConfig.label} {fieldConfig.required && "*"}
            </Label>
            <div className="grid grid-cols-2 gap-2 p-3 border rounded-md">
              {fieldConfig.options?.map((option) => (
                <label key={option} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={multiValue.includes(option)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        updateValue([...multiValue, option]);
                      } else {
                        updateValue(
                          multiValue.filter((item) => item !== option)
                        );
                      }
                    }}
                    className="rounded"
                  />
                  <span className="text-sm">{option}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case "boolean":
        return (
          <div key={fullKey}>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={Boolean(value)}
                onChange={(e) => updateValue(e.target.checked)}
                className="rounded"
              />
              <span>{fieldConfig.label}</span>
            </label>
          </div>
        );

      case "array":
        const arrayValue = Array.isArray(value) ? value : [{}];
        return (
          <div key={fullKey} className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-medium">
                {fieldConfig.label} {fieldConfig.required && "*"}
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => updateValue([...arrayValue, {}])}
              >
                <Plus className="h-4 w-4 mr-1" />
                Ekle
              </Button>
            </div>

            {arrayValue.map((item, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium">
                    {fieldConfig.label.slice(0, -6)} {index + 1}
                  </h4>
                  {arrayValue.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const newValue = arrayValue.filter(
                          (_, i) => i !== index
                        );
                        updateValue(newValue);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(fieldConfig.fields).map(
                    ([subKey, subConfig]) => {
                      const subValue = item[subKey] || "";
                      const updateSubValue = (newSubValue) => {
                        const newArrayValue = [...arrayValue];
                        newArrayValue[index] = {
                          ...newArrayValue[index],
                          [subKey]: newSubValue,
                        };
                        updateValue(newArrayValue);
                      };

                      // Render sub field
                      switch (subConfig.type) {
                        case "text":
                          return (
                            <div key={`${fieldKey}[${index}].${subKey}`}>
                              <Label>
                                {subConfig.label} {subConfig.required && "*"}
                              </Label>
                              <Input
                                type="text"
                                value={subValue}
                                onChange={(e) => updateSubValue(e.target.value)}
                                placeholder={
                                  subConfig.placeholder ||
                                  `${subConfig.label} girin`
                                }
                              />
                            </div>
                          );

                        case "number":
                          return (
                            <div key={`${fieldKey}[${index}].${subKey}`}>
                              <Label>
                                {subConfig.label} {subConfig.required && "*"}
                              </Label>
                              <Input
                                type="number"
                                min="0"
                                value={subValue}
                                onChange={(e) =>
                                  updateSubValue(parseInt(e.target.value) || 0)
                                }
                                placeholder={subConfig.placeholder || "0"}
                              />
                            </div>
                          );

                        case "textarea":
                          return (
                            <div
                              key={`${fieldKey}[${index}].${subKey}`}
                              className="md:col-span-2"
                            >
                              <Label>
                                {subConfig.label} {subConfig.required && "*"}
                              </Label>
                              <Textarea
                                rows={3}
                                value={subValue}
                                onChange={(e) => updateSubValue(e.target.value)}
                                placeholder={
                                  subConfig.placeholder ||
                                  `${subConfig.label} girin`
                                }
                              />
                            </div>
                          );

                        case "select":
                          return (
                            <div key={`${fieldKey}[${index}].${subKey}`}>
                              <Label>
                                {subConfig.label} {subConfig.required && "*"}
                              </Label>
                              <Select
                                value={subValue}
                                onValueChange={updateSubValue}
                              >
                                <SelectTrigger>
                                  <SelectValue
                                    placeholder={`${subConfig.label} seçin`}
                                  />
                                </SelectTrigger>
                                <SelectContent>
                                  {subConfig.options?.map((option) => (
                                    <SelectItem key={option} value={option}>
                                      {option}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          );

                        default:
                          return null;
                      }
                    }
                  )}
                </div>
              </Card>
            ))}
          </div>
        );

      default:
        return null;
    }
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

    // Kategori özel alanları validasyonu
    if (formData.category && CATEGORY_FIELDS[formData.category]) {
      const categoryFields = CATEGORY_FIELDS[formData.category];
      Object.entries(categoryFields).forEach(([fieldKey, fieldConfig]) => {
        if (fieldConfig.required) {
          const value = formData.categorySpecificData[fieldKey];
          if (
            !value ||
            (Array.isArray(value) && value.length === 0) ||
            (typeof value === "string" && !value.trim())
          ) {
            errors[`category_${fieldKey}`] = `${fieldConfig.label} gereklidir`;
          }
        }
      });
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
        {/* Category Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Hizmet Kategorisi Seçimi</CardTitle>
            <CardDescription>
              MKN Group'un sunduğu hizmetlerden talebinize uygun olanı seçin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(REQUEST_CATEGORIES).map(([key, category]) => (
                <div
                  key={category}
                  className={`cursor-pointer border-2 rounded-lg p-4 transition-all hover:shadow-md ${
                    formData.category === category
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => handleCategoryChange(category)}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`p-2 rounded-lg ${getCategoryColor(category)}`}
                    >
                      {getCategoryIconComponent(category)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm text-gray-900">
                        {getRequestCategoryLabel(category)}
                      </h4>
                    </div>
                    {formData.category === category && (
                      <div className="text-blue-500">
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {formErrors.category && (
              <p className="text-red-500 text-sm mt-2">{formErrors.category}</p>
            )}
          </CardContent>
        </Card>

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

        {/* Category Specific Fields */}
        {formData.category && CATEGORY_FIELDS[formData.category] && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getCategoryIconComponent(formData.category)}
                {getRequestCategoryLabel(formData.category)} - Özel Alanlar
              </CardTitle>
              <CardDescription>
                Seçtiğiniz kategoriye özel detayları doldurun
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(CATEGORY_FIELDS[formData.category]).map(
                ([fieldKey, fieldConfig]) => (
                  <div key={fieldKey}>
                    {renderDynamicField(fieldKey, fieldConfig)}
                    {formErrors[`category_${fieldKey}`] && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors[`category_${fieldKey}`]}
                      </p>
                    )}
                  </div>
                )
              )}
            </CardContent>
          </Card>
        )}

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
            <CardTitle>Ek Bilgiler</CardTitle>
            <CardDescription>
              İsteğe bağlı ek detaylar ve özel notlar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <div>
                <Label htmlFor="requirements">Özel Gereksinimler</Label>
                <Textarea
                  id="requirements"
                  rows={3}
                  value={formData.requirements}
                  onChange={handleRequirementsChange}
                  placeholder="Özel sertifikalar, standartlar, teknik özellikler, compliance gereksinimleri vb."
                />
              </div>

              <div>
                <Label htmlFor="additionalNotes">
                  Ek Notlar ve Açıklamalar
                </Label>
                <Textarea
                  id="additionalNotes"
                  rows={3}
                  value={formData.additionalNotes}
                  onChange={handleAdditionalNotesChange}
                  placeholder="Projeyle ilgili diğer önemli bilgiler, özel durumlar, tercihler..."
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
