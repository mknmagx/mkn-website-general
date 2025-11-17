"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "../../../../hooks/use-admin-auth";
import {
  PermissionGuard,
  usePermissions,
} from "../../../../components/admin-route-guard";
import { useCreateDelivery } from "../../../../hooks/use-delivery";
import { useCompanySearch, useCompanies } from "../../../../hooks/use-company";
import {
  DELIVERY_TYPE,
  DELIVERY_STATUS,
  getDeliveryTypeLabel,
} from "../../../../lib/services/delivery-service";

import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
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
import { useToast } from "../../../../hooks/use-toast";
import {
  Package,
  ArrowLeft,
  Plus,
  Minus,
  Save,
  Loader2,
  Search,
  Building,
} from "lucide-react";

export default function NewDeliveryPage() {
  const { user, loading: authLoading } = useAdminAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { createDelivery, loading: createLoading } = useCreateDelivery();
  const { results: companyResults, loading: companyLoading, search: searchCompanies } = useCompanySearch();
  const { companies, loading: companiesLoading } = useCompanies();

  // Form state
  const [formData, setFormData] = useState({
    type: "",
    companyInfo: {
      companyName: "",
      contactPerson: "",
      phone: "",
      email: "",
      address: "",
    },
    deliveryAddress: {
      address: "",
      city: "",
      district: "",
      postalCode: "",
    },
    items: [
      {
        productName: "",
        productCode: "",
        description: "",
        quantity: "",
        unit: "",
      },
    ],
    notes: "",
  });

  const [errors, setErrors] = useState({});
  const [companySearchTerm, setCompanySearchTerm] = useState("");
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showCompanyResults, setShowCompanyResults] = useState(false);
  const [companySelectionMode, setCompanySelectionMode] = useState("select"); // "select" or "manual"

  const handleCompanySelectFromDropdown = (companyId) => {
    const company = companies.find(c => c.id === companyId);
    if (company) {
      setSelectedCompany(company);
      
      // Fill form data with company info
      setFormData(prev => ({
        ...prev,
        companyInfo: {
          companyName: company.name || "",
          contactPerson: company.contactPerson || "",
          phone: company.phone || "",
          email: company.email || "",
          address: company.address || "",
        }
      }));
    }
  };

  const handleCompanyModeChange = (mode) => {
    setCompanySelectionMode(mode);
    if (mode === "manual") {
      handleCompanyClear();
    }
  };

  // Company search handlers
  const handleCompanySearch = async (searchTerm) => {
    setCompanySearchTerm(searchTerm);
    if (searchTerm.length > 2) {
      await searchCompanies(searchTerm);
      setShowCompanyResults(true);
    } else {
      setShowCompanyResults(false);
    }
  };

  const handleCompanySelect = (company) => {
    setSelectedCompany(company);
    setCompanySearchTerm(company.name);
    setShowCompanyResults(false);
    
    // Fill form data with company info
    setFormData(prev => ({
      ...prev,
      companyInfo: {
        companyName: company.name || "",
        contactPerson: company.contactPerson || "",
        phone: company.phone || "",
        email: company.email || "",
        address: company.address || "",
      }
    }));
  };

  const handleCompanyClear = () => {
    setSelectedCompany(null);
    setCompanySearchTerm("");
    setShowCompanyResults(false);
    
    // Clear company info
    setFormData(prev => ({
      ...prev,
      companyInfo: {
        companyName: "",
        contactPerson: "",
        phone: "",
        email: "",
        address: "",
      }
    }));
  };

  // Form handlers
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleNestedInputChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
    
    // Clear error when user starts typing
    const errorKey = `${section}.${field}`;
    if (errors[errorKey]) {
      setErrors((prev) => ({
        ...prev,
        [errorKey]: "",
      }));
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index] = {
      ...newItems[index],
      [field]: value,
    };
    setFormData((prev) => ({
      ...prev,
      items: newItems,
    }));
    
    // Clear error when user starts typing
    const errorKey = `items.${index}.${field}`;
    if (errors[errorKey]) {
      setErrors((prev) => ({
        ...prev,
        [errorKey]: "",
      }));
    }
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          productName: "",
          productCode: "",
          description: "",
          quantity: "",
          unit: "",
        },
      ],
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      const newItems = formData.items.filter((_, i) => i !== index);
      setFormData((prev) => ({
        ...prev,
        items: newItems,
      }));
    }
  };

  // Validation
  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.type) {
      newErrors.type = "İrsaliye türü seçimi zorunludur";
    }

    if (!formData.companyInfo.companyName.trim()) {
      newErrors["companyInfo.companyName"] = "Firma adı zorunludur";
    }

    if (!formData.companyInfo.contactPerson.trim()) {
      newErrors["companyInfo.contactPerson"] = "İletişim kişisi zorunludur";
    }

    if (!formData.companyInfo.phone.trim()) {
      newErrors["companyInfo.phone"] = "Telefon numarası zorunludur";
    }

    if (!formData.deliveryAddress.address.trim()) {
      newErrors["deliveryAddress.address"] = "Teslimat adresi zorunludur";
    }

    if (!formData.deliveryAddress.city.trim()) {
      newErrors["deliveryAddress.city"] = "Şehir zorunludur";
    }

    // Validate items
    formData.items.forEach((item, index) => {
      if (!item.productName.trim()) {
        newErrors[`items.${index}.productName`] = "Ürün adı zorunludur";
      }
      if (!item.quantity || parseFloat(item.quantity) <= 0) {
        newErrors[`items.${index}.quantity`] = "Geçerli miktar giriniz";
      }
      if (!item.unit.trim()) {
        newErrors[`items.${index}.unit`] = "Birim zorunludur";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: "Hata",
        description: "Lütfen zorunlu alanları doldurun",
        variant: "destructive",
      });
      return;
    }

    try {
      // Calculate totals
      const totalItems = formData.items.length;
      const totalQuantity = formData.items.reduce(
        (sum, item) => sum + (parseFloat(item.quantity) || 0),
        0
      );

      const deliveryData = {
        ...formData,
        status: DELIVERY_STATUS.PREPARED,
        totalItems,
        totalQuantity,
      };

      const result = await createDelivery(deliveryData);

      if (result.success) {
        toast({
          title: "Başarılı",
          description: "İrsaliye oluşturuldu",
        });
        router.push("/admin/deliveries");
      } else {
        toast({
          title: "Hata",
          description: result.error || "İrsaliye oluşturulamadı",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Create delivery error:", error);
      toast({
        title: "Hata",
        description: "İrsaliye oluşturulurken bir hata oluştu",
        variant: "destructive",
      });
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <PermissionGuard
      requiredPermission="deliveries.create"
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="text-gray-400 mb-4">
              <Package className="h-16 w-16 mx-auto" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              Yetkisiz Erişim
            </h1>
            <p className="text-gray-600">
              İrsaliye oluşturmak için gerekli izinlere sahip değilsiniz.
            </p>
          </div>
        </div>
      }
    >
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="outline"
              onClick={() => router.push("/admin/deliveries")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Geri
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Package className="h-8 w-8 text-blue-600" />
                Yeni İrsaliye
              </h1>
              <p className="text-gray-600 mt-1">
                Yeni bir giriş veya çıkış irsaliyesi oluşturun
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Delivery Type */}
            <Card>
              <CardHeader>
                <CardTitle>İrsaliye Türü</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="type">İrsaliye Türü *</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => handleInputChange("type", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="İrsaliye türünü seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={DELIVERY_TYPE.INBOUND}>
                          {getDeliveryTypeLabel(DELIVERY_TYPE.INBOUND)}
                        </SelectItem>
                        <SelectItem value={DELIVERY_TYPE.OUTBOUND}>
                          {getDeliveryTypeLabel(DELIVERY_TYPE.OUTBOUND)}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.type && (
                      <p className="text-red-500 text-sm mt-1">{errors.type}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Company Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Firma Bilgileri
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Company Selection Mode */}
                <div className="mb-6">
                  <Label>Firma Seçim Yöntemi</Label>
                  <div className="flex gap-4 mt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value="select"
                        checked={companySelectionMode === "select"}
                        onChange={(e) => handleCompanyModeChange(e.target.value)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span>Mevcut Firmadan Seç</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value="manual"
                        checked={companySelectionMode === "manual"}
                        onChange={(e) => handleCompanyModeChange(e.target.value)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span>Manuel Giriş</span>
                    </label>
                  </div>
                </div>

                {/* Company Selection Dropdown */}
                {companySelectionMode === "select" && (
                  <div className="mb-6">
                    <Label htmlFor="companySelect">Firma Seçin</Label>
                    <Select
                      value={selectedCompany?.id || ""}
                      onValueChange={handleCompanySelectFromDropdown}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Firma seçiniz..." />
                      </SelectTrigger>
                      <SelectContent>
                        {companiesLoading ? (
                          <SelectItem value="loading" disabled>
                            <div className="flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Firmalar yükleniyor...
                            </div>
                          </SelectItem>
                        ) : companies.length === 0 ? (
                          <SelectItem value="empty" disabled>
                            Firma bulunamadı
                          </SelectItem>
                        ) : (
                          companies.map((company) => (
                            <SelectItem key={company.id} value={company.id}>
                              <div>
                                <div className="font-medium">{company.name}</div>
                                <div className="text-sm text-gray-500">
                                  {company.contactPerson && `${company.contactPerson} - `}
                                  {company.phone}
                                </div>
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    
                    {selectedCompany && (
                      <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-green-600" />
                          <span className="font-medium text-green-800">
                            Seçili Firma: {selectedCompany.name}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Company Search (Alternative) */}
                {companySelectionMode === "search" && (
                  <div className="mb-6">
                    <Label htmlFor="companySearch">Firma Ara</Label>
                    <div className="relative">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          id="companySearch"
                          value={companySearchTerm}
                          onChange={(e) => handleCompanySearch(e.target.value)}
                          placeholder="Firma adı ile arama yapın..."
                          className="pl-10"
                        />
                        {selectedCompany && (
                          <button
                            type="button"
                            onClick={handleCompanyClear}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            ×
                          </button>
                        )}
                      </div>
                      
                      {/* Search Results */}
                      {showCompanyResults && companyResults.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                          {companyResults.map((company) => (
                            <button
                              key={company.id}
                              type="button"
                              onClick={() => handleCompanySelect(company)}
                              className="w-full text-left px-4 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                            >
                              <div className="font-medium">{company.name}</div>
                              <div className="text-sm text-gray-500">
                                {company.contactPerson && `${company.contactPerson} - `}
                                {company.phone}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                      
                      {companyLoading && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-4 text-center">
                          <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                        </div>
                      )}
                      
                      {showCompanyResults && !companyLoading && companyResults.length === 0 && companySearchTerm.length > 2 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-4 text-center text-gray-500">
                          Firma bulunamadı
                        </div>
                      )}
                    </div>
                    
                    {selectedCompany && (
                      <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-green-600" />
                          <span className="font-medium text-green-800">
                            Seçili Firma: {selectedCompany.name}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="companyName">Firma Adı *</Label>
                    <Input
                      id="companyName"
                      value={formData.companyInfo.companyName}
                      onChange={(e) =>
                        handleNestedInputChange(
                          "companyInfo",
                          "companyName",
                          e.target.value
                        )
                      }
                      placeholder="Firma adını girin"
                      disabled={companySelectionMode === "select" && selectedCompany}
                    />
                    {errors["companyInfo.companyName"] && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors["companyInfo.companyName"]}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="contactPerson">İletişim Kişisi *</Label>
                    <Input
                      id="contactPerson"
                      value={formData.companyInfo.contactPerson}
                      onChange={(e) =>
                        handleNestedInputChange(
                          "companyInfo",
                          "contactPerson",
                          e.target.value
                        )
                      }
                      placeholder="İletişim kişisinin adını girin"
                      disabled={companySelectionMode === "select" && selectedCompany}
                    />
                    {errors["companyInfo.contactPerson"] && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors["companyInfo.contactPerson"]}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="phone">Telefon *</Label>
                    <Input
                      id="phone"
                      value={formData.companyInfo.phone}
                      onChange={(e) =>
                        handleNestedInputChange(
                          "companyInfo",
                          "phone",
                          e.target.value
                        )
                      }
                      placeholder="Telefon numarasını girin"
                      disabled={companySelectionMode === "select" && selectedCompany}
                    />
                    {errors["companyInfo.phone"] && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors["companyInfo.phone"]}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="email">E-posta</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.companyInfo.email}
                      onChange={(e) =>
                        handleNestedInputChange(
                          "companyInfo",
                          "email",
                          e.target.value
                        )
                      }
                      placeholder="E-posta adresini girin"
                      disabled={companySelectionMode === "select" && selectedCompany}
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <Label htmlFor="companyAddress">Firma Adresi</Label>
                  <Textarea
                    id="companyAddress"
                    value={formData.companyInfo.address}
                    onChange={(e) =>
                      handleNestedInputChange(
                        "companyInfo",
                        "address",
                        e.target.value
                      )
                    }
                    placeholder="Firma adresini girin"
                    rows={3}
                    disabled={companySelectionMode === "select" && selectedCompany}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Delivery Address */}
            <Card>
              <CardHeader>
                <CardTitle>Teslimat Adresi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div>
                    <Label htmlFor="city">Şehir *</Label>
                    <Input
                      id="city"
                      value={formData.deliveryAddress.city}
                      onChange={(e) =>
                        handleNestedInputChange(
                          "deliveryAddress",
                          "city",
                          e.target.value
                        )
                      }
                      placeholder="Şehir"
                    />
                    {errors["deliveryAddress.city"] && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors["deliveryAddress.city"]}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="district">İlçe</Label>
                    <Input
                      id="district"
                      value={formData.deliveryAddress.district}
                      onChange={(e) =>
                        handleNestedInputChange(
                          "deliveryAddress",
                          "district",
                          e.target.value
                        )
                      }
                      placeholder="İlçe"
                    />
                  </div>

                  <div>
                    <Label htmlFor="postalCode">Posta Kodu</Label>
                    <Input
                      id="postalCode"
                      value={formData.deliveryAddress.postalCode}
                      onChange={(e) =>
                        handleNestedInputChange(
                          "deliveryAddress",
                          "postalCode",
                          e.target.value
                        )
                      }
                      placeholder="Posta kodu"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="deliveryAddress">Adres *</Label>
                  <Textarea
                    id="deliveryAddress"
                    value={formData.deliveryAddress.address}
                    onChange={(e) =>
                      handleNestedInputChange(
                        "deliveryAddress",
                        "address",
                        e.target.value
                      )
                    }
                    placeholder="Teslimat adresini girin"
                    rows={3}
                  />
                  {errors["deliveryAddress.address"] && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors["deliveryAddress.address"]}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Items */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Ürünler</CardTitle>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addItem}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Ürün Ekle
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {formData.items.map((item, index) => (
                    <div
                      key={index}
                      className="p-4 border rounded-lg bg-gray-50"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium">Ürün {index + 1}</h4>
                        {formData.items.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        <div>
                          <Label>Ürün Adı *</Label>
                          <Input
                            value={item.productName}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "productName",
                                e.target.value
                              )
                            }
                            placeholder="Ürün adı"
                          />
                          {errors[`items.${index}.productName`] && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors[`items.${index}.productName`]}
                            </p>
                          )}
                        </div>

                        <div>
                          <Label>Ürün Kodu</Label>
                          <Input
                            value={item.productCode}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "productCode",
                                e.target.value
                              )
                            }
                            placeholder="Ürün kodu"
                          />
                        </div>

                        <div>
                          <Label>Miktar *</Label>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) =>
                              handleItemChange(index, "quantity", e.target.value)
                            }
                            placeholder="0"
                            min="0"
                            step="0.01"
                          />
                          {errors[`items.${index}.quantity`] && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors[`items.${index}.quantity`]}
                            </p>
                          )}
                        </div>

                        <div>
                          <Label>Birim *</Label>
                          <Input
                            value={item.unit}
                            onChange={(e) =>
                              handleItemChange(index, "unit", e.target.value)
                            }
                            placeholder="kg, adet, kutu..."
                          />
                          {errors[`items.${index}.unit`] && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors[`items.${index}.unit`]}
                            </p>
                          )}
                        </div>

                        <div>
                          <Label>Açıklama</Label>
                          <Input
                            value={item.description}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "description",
                                e.target.value
                              )
                            }
                            placeholder="Ürün açıklaması"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Notlar</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="notes">Özel Notlar</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    placeholder="İrsaliye ile ilgili özel notlar..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Submit */}
            <div className="flex items-center justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/admin/deliveries")}
              >
                İptal
              </Button>
              <Button type="submit" disabled={createLoading}>
                {createLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Oluşturuluyor...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    İrsaliyeyi Oluştur
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </PermissionGuard>
  );
}