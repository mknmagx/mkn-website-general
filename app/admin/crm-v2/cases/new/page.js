"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "../../../../../hooks/use-admin-auth";
import { useToast } from "../../../../../hooks/use-toast";
import {
  createCase,
} from "../../../../../lib/services/crm-v2";
import {
  CASE_STATUS,
  CASE_TYPE,
  PRIORITY,
  getCaseStatusLabel,
  getCaseTypeLabel,
  getPriorityLabel,
} from "../../../../../lib/services/crm-v2/schema";
import { getAllCustomers } from "../../../../../lib/services/crm-v2/customer-service";
import { cn } from "../../../../../lib/utils";

// UI Components
import { Button } from "../../../../../components/ui/button";
import { Input } from "../../../../../components/ui/input";
import { Textarea } from "../../../../../components/ui/textarea";
import { Label } from "../../../../../components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../../../../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../../components/ui/select";
import { Skeleton } from "../../../../../components/ui/skeleton";

// Icons
import {
  ArrowLeft,
  Briefcase,
  Save,
  Building2,
  User,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  Loader2,
  Search,
  X,
} from "lucide-react";

export default function NewCasePage() {
  const { user, loading: authLoading } = useAdminAuth();
  const router = useRouter();
  const { toast } = useToast();

  // State
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [customerSearchTerm, setCustomerSearchTerm] = useState("");
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: CASE_TYPE.COSMETIC_MANUFACTURING,
    status: CASE_STATUS.NEW,
    priority: PRIORITY.NORMAL,
    customerId: null,
    // Contact info (manual entry if no customer selected)
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    contactCompany: "",
    // Financials
    estimatedValue: "",
    currency: "TRY",
    moq: "",
    unitPrice: "",
    // Expected close
    expectedCloseDate: "",
    // Notes
    notes: "",
  });

  // Load customers for selection
  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const customersData = await getAllCustomers({
          sortBy: "createdAt",
          sortDirection: "desc",
          limitCount: 500,
        });
        setCustomers(customersData);
      } catch (error) {
        console.error("Error loading customers:", error);
      }
    };
    
    if (user) {
      loadCustomers();
    }
  }, [user]);

  // Filter customers based on search
  const filteredCustomers = customers.filter(customer => {
    const searchLower = customerSearchTerm.toLowerCase();
    return (
      (customer.name && customer.name.toLowerCase().includes(searchLower)) ||
      (customer.email && customer.email.toLowerCase().includes(searchLower)) ||
      (customer.company?.name && customer.company.name.toLowerCase().includes(searchLower)) ||
      (customer.phone && customer.phone.includes(searchLower))
    );
  }).slice(0, 10);

  // Handle customer selection
  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
    setFormData(prev => ({
      ...prev,
      customerId: customer.id,
      contactName: customer.name || "",
      contactEmail: customer.email || "",
      contactPhone: customer.phone || "",
      contactCompany: customer.company?.name || "",
    }));
    setShowCustomerDropdown(false);
    setCustomerSearchTerm("");
  };

  // Clear customer selection
  const handleClearCustomer = () => {
    setSelectedCustomer(null);
    setFormData(prev => ({
      ...prev,
      customerId: null,
      contactName: "",
      contactEmail: "",
      contactPhone: "",
      contactCompany: "",
    }));
  };

  // Handle form change
  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      toast({ 
        title: "Hata", 
        description: "Talep başlığı zorunludur.", 
        variant: "destructive" 
      });
      return;
    }

    setSaving(true);
    try {
      const caseData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        type: formData.type,
        status: formData.status,
        priority: formData.priority,
        customerId: formData.customerId,
        // Contact info
        contactName: formData.contactName,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone,
        // Financials
        estimatedValue: formData.estimatedValue ? parseFloat(formData.estimatedValue) : 0,
        currency: formData.currency,
        moq: formData.moq,
        unitPrice: formData.unitPrice,
        // Expected close date
        expectedCloseDate: formData.expectedCloseDate || null,
        // Notes
        notes: formData.notes,
        // Creator
        createdBy: user?.uid,
      };

      const result = await createCase(caseData);
      
      if (result?.id) {
        toast({ 
          title: "Başarılı", 
          description: "Talep başarıyla oluşturuldu." 
        });
        router.push(`/admin/crm-v2/cases/${result.id}`);
      } else {
        throw new Error("Talep oluşturulamadı");
      }
    } catch (error) {
      console.error("Error creating case:", error);
      toast({ 
        title: "Hata", 
        description: "Talep oluşturulamadı.", 
        variant: "destructive" 
      });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="h-9 w-9"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Yeni Talep</h1>
          <p className="text-sm text-slate-500">Yeni bir iş talebi oluşturun</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Temel Bilgiler */}
          <Card className="bg-white border-slate-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-slate-600" />
                Talep Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Talep Başlığı *</Label>
                <Input
                  id="title"
                  placeholder="Örn: Kozmetik üretim talebi"
                  value={formData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  className="bg-white"
                />
              </div>

              {/* Type & Priority */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Talep Türü</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => handleChange("type", value)}
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(CASE_TYPE).map((type) => (
                        <SelectItem key={type} value={type}>
                          {getCaseTypeLabel(type)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Öncelik</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => handleChange("priority", value)}
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(PRIORITY).map((priority) => (
                        <SelectItem key={priority} value={priority}>
                          {getPriorityLabel(priority)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Durum</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleChange("status", value)}
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(CASE_STATUS).map((status) => (
                        <SelectItem key={status} value={status}>
                          {getCaseStatusLabel(status)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Açıklama</Label>
                <Textarea
                  id="description"
                  placeholder="Talep hakkında detaylı bilgi..."
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  rows={4}
                  className="bg-white resize-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* Müşteri Bilgileri */}
          <Card className="bg-white border-slate-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="h-5 w-5 text-slate-600" />
                Müşteri Bilgileri
              </CardTitle>
              <CardDescription>
                Mevcut müşteriyi seçin veya manuel bilgi girin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Customer Search / Selection */}
              <div className="space-y-2">
                <Label>Müşteri Seç</Label>
                {selectedCustomer ? (
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center">
                      <User className="h-5 w-5 text-slate-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 truncate">
                        {selectedCustomer.name || selectedCustomer.company?.name || "İsimsiz"}
                      </p>
                      <p className="text-sm text-slate-500 truncate">
                        {selectedCustomer.email || selectedCustomer.phone || ""}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={handleClearCustomer}
                      className="h-8 w-8 text-slate-400 hover:text-slate-600"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        placeholder="İsim, email veya telefon ile ara..."
                        value={customerSearchTerm}
                        onChange={(e) => {
                          setCustomerSearchTerm(e.target.value);
                          setShowCustomerDropdown(e.target.value.length > 0);
                        }}
                        onFocus={() => setShowCustomerDropdown(customerSearchTerm.length > 0)}
                        className="pl-10 bg-white"
                      />
                    </div>
                    
                    {showCustomerDropdown && filteredCustomers.length > 0 && (
                      <div className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                        {filteredCustomers.map((customer) => (
                          <button
                            key={customer.id}
                            type="button"
                            onClick={() => handleCustomerSelect(customer)}
                            className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 text-left border-b border-slate-100 last:border-0"
                          >
                            <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                              <User className="h-4 w-4 text-slate-500" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-slate-900 truncate">
                                {customer.name || customer.company?.name || "İsimsiz"}
                              </p>
                              <p className="text-xs text-slate-500 truncate">
                                {customer.email || customer.phone || ""}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Manual Contact Info */}
              <div className="pt-2 border-t border-slate-100">
                <p className="text-sm text-slate-500 mb-3">
                  {selectedCustomer ? "Müşteri bilgileri (düzenlenebilir):" : "veya manuel olarak girin:"}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactName" className="text-slate-600 flex items-center gap-2">
                      <User className="h-3.5 w-3.5" />
                      İletişim Kişisi
                    </Label>
                    <Input
                      id="contactName"
                      placeholder="Ad Soyad"
                      value={formData.contactName}
                      onChange={(e) => handleChange("contactName", e.target.value)}
                      className="bg-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactCompany" className="text-slate-600 flex items-center gap-2">
                      <Building2 className="h-3.5 w-3.5" />
                      Firma
                    </Label>
                    <Input
                      id="contactCompany"
                      placeholder="Firma Adı"
                      value={formData.contactCompany}
                      onChange={(e) => handleChange("contactCompany", e.target.value)}
                      className="bg-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactEmail" className="text-slate-600 flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5" />
                      E-posta
                    </Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      placeholder="email@example.com"
                      value={formData.contactEmail}
                      onChange={(e) => handleChange("contactEmail", e.target.value)}
                      className="bg-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactPhone" className="text-slate-600 flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5" />
                      Telefon
                    </Label>
                    <Input
                      id="contactPhone"
                      placeholder="+90 5XX XXX XX XX"
                      value={formData.contactPhone}
                      onChange={(e) => handleChange("contactPhone", e.target.value)}
                      className="bg-white"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Finansal Bilgiler */}
          <Card className="bg-white border-slate-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-slate-600" />
                Finansal Bilgiler
              </CardTitle>
              <CardDescription>
                Opsiyonel - tahmini değer ve fiyatlandırma bilgileri
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="estimatedValue">Tahmini Değer</Label>
                  <Input
                    id="estimatedValue"
                    type="number"
                    placeholder="0"
                    value={formData.estimatedValue}
                    onChange={(e) => handleChange("estimatedValue", e.target.value)}
                    className="bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Para Birimi</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) => handleChange("currency", value)}
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TRY">TRY</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="moq">Minimum Sipariş</Label>
                  <Input
                    id="moq"
                    placeholder="Örn: 1000 adet"
                    value={formData.moq}
                    onChange={(e) => handleChange("moq", e.target.value)}
                    className="bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unitPrice">Birim Fiyat</Label>
                  <Input
                    id="unitPrice"
                    placeholder="Örn: 5.50"
                    value={formData.unitPrice}
                    onChange={(e) => handleChange("unitPrice", e.target.value)}
                    className="bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expectedCloseDate" className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-slate-500" />
                    Beklenen Kapanış Tarihi
                  </Label>
                  <Input
                    id="expectedCloseDate"
                    type="date"
                    value={formData.expectedCloseDate}
                    onChange={(e) => handleChange("expectedCloseDate", e.target.value)}
                    className="bg-white"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notlar */}
          <Card className="bg-white border-slate-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Notlar</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Ek notlar veya açıklamalar..."
                value={formData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                rows={3}
                className="bg-white resize-none"
              />
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={saving}
            >
              İptal
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="min-w-[120px]"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Talep Oluştur
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
