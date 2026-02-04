"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "../../../../../hooks/use-admin-auth";
import { useToast } from "../../../../../hooks/use-toast";
import { createCustomer } from "../../../../../lib/services/crm-v2/customer-service";
import {
  CUSTOMER_TYPE,
  PRIORITY,
  getCustomerTypeLabel,
  getPriorityLabel,
} from "../../../../../lib/services/crm-v2/schema";
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
  Users,
  Save,
  Building2,
  User,
  Mail,
  Phone,
  Globe,
  MapPin,
  FileText,
  Loader2,
  Briefcase,
  Tag,
} from "lucide-react";

export default function NewCustomerPage() {
  const { user, loading: authLoading } = useAdminAuth();
  const router = useRouter();
  const { toast } = useToast();

  // State
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    // Personal info
    name: "",
    email: "",
    phone: "",
    position: "",
    
    // Company info
    companyName: "",
    website: "",
    industry: "",
    companySize: "",
    address: "",
    city: "",
    country: "TR",
    
    // Tax info (B2B)
    taxOffice: "",
    taxNumber: "",
    mersisNumber: "",
    
    // Classification
    type: CUSTOMER_TYPE.LEAD,
    priority: PRIORITY.NORMAL,
    tags: "",
    
    // Notes
    notes: "",
  });

  // Handle form change
  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Industry options
  const industryOptions = [
    { value: "", label: "Seçiniz..." },
    { value: "kozmetik", label: "Kozmetik" },
    { value: "gida_takviyesi", label: "Gıda Takviyesi" },
    { value: "temizlik", label: "Temizlik Ürünleri" },
    { value: "ilac", label: "İlaç / Medikal" },
    { value: "e_ticaret", label: "E-ticaret" },
    { value: "perakende", label: "Perakende" },
    { value: "ithalat_ihracat", label: "İthalat / İhracat" },
    { value: "uretim", label: "Üretim" },
    { value: "hizmet", label: "Hizmet" },
    { value: "diger", label: "Diğer" },
  ];

  // Company size options
  const companySizeOptions = [
    { value: "", label: "Seçiniz..." },
    { value: "1-10", label: "1-10 Çalışan" },
    { value: "11-50", label: "11-50 Çalışan" },
    { value: "51-200", label: "51-200 Çalışan" },
    { value: "201-500", label: "201-500 Çalışan" },
    { value: "500+", label: "500+ Çalışan" },
  ];

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim() && !formData.companyName.trim()) {
      toast({ 
        title: "Hata", 
        description: "İsim veya firma adı zorunludur.", 
        variant: "destructive" 
      });
      return;
    }

    setSaving(true);
    try {
      // Parse tags
      const tags = formData.tags
        .split(",")
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const customerData = {
        // Personal info
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        position: formData.position.trim(),
        
        // Company info
        companyName: formData.companyName.trim(),
        website: formData.website.trim(),
        industry: formData.industry,
        companySize: formData.companySize,
        address: formData.address.trim(),
        city: formData.city.trim(),
        country: formData.country,
        
        // Tax info
        taxOffice: formData.taxOffice.trim(),
        taxNumber: formData.taxNumber.trim(),
        mersisNumber: formData.mersisNumber.trim(),
        
        // Classification
        type: formData.type,
        priority: formData.priority,
        tags: tags,
        
        // Notes
        notes: formData.notes.trim(),
        
        // Creator
        createdBy: user?.uid,
      };

      const result = await createCustomer(customerData);
      
      if (result?.id) {
        toast({ 
          title: "Başarılı", 
          description: "Müşteri başarıyla oluşturuldu." 
        });
        router.push(`/admin/crm-v2/customers/${result.id}`);
      } else {
        throw new Error("Müşteri oluşturulamadı");
      }
    } catch (error) {
      console.error("Error creating customer:", error);
      toast({ 
        title: "Hata", 
        description: "Müşteri oluşturulamadı.", 
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
          <h1 className="text-2xl font-semibold text-slate-900">Yeni Müşteri</h1>
          <p className="text-sm text-slate-500">CRM sistemine yeni müşteri ekleyin</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Kişisel Bilgiler */}
          <Card className="bg-white border-slate-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-slate-600" />
                İletişim Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <User className="h-3.5 w-3.5 text-slate-500" />
                    İsim Soyisim *
                  </Label>
                  <Input
                    id="name"
                    placeholder="Ad Soyad"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className="bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position" className="flex items-center gap-2">
                    <Briefcase className="h-3.5 w-3.5 text-slate-500" />
                    Pozisyon
                  </Label>
                  <Input
                    id="position"
                    placeholder="Örn: Satın Alma Müdürü"
                    value={formData.position}
                    onChange={(e) => handleChange("position", e.target.value)}
                    className="bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-slate-500" />
                    E-posta
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className="bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-slate-500" />
                    Telefon
                  </Label>
                  <Input
                    id="phone"
                    placeholder="+90 5XX XXX XX XX"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    className="bg-white"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Firma Bilgileri */}
          <Card className="bg-white border-slate-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="h-5 w-5 text-slate-600" />
                Firma Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Firma Adı *</Label>
                  <Input
                    id="companyName"
                    placeholder="Firma Adı"
                    value={formData.companyName}
                    onChange={(e) => handleChange("companyName", e.target.value)}
                    className="bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website" className="flex items-center gap-2">
                    <Globe className="h-3.5 w-3.5 text-slate-500" />
                    Web Sitesi
                  </Label>
                  <Input
                    id="website"
                    placeholder="https://example.com"
                    value={formData.website}
                    onChange={(e) => handleChange("website", e.target.value)}
                    className="bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Sektör</Label>
                  <Select
                    value={formData.industry}
                    onValueChange={(value) => handleChange("industry", value)}
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Seçiniz..." />
                    </SelectTrigger>
                    <SelectContent>
                      {industryOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Firma Büyüklüğü</Label>
                  <Select
                    value={formData.companySize}
                    onValueChange={(value) => handleChange("companySize", value)}
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Seçiniz..." />
                    </SelectTrigger>
                    <SelectContent>
                      {companySizeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-slate-500" />
                  Adres
                </Label>
                <Input
                  id="address"
                  placeholder="Adres"
                  value={formData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  className="bg-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">Şehir</Label>
                  <Input
                    id="city"
                    placeholder="İstanbul"
                    value={formData.city}
                    onChange={(e) => handleChange("city", e.target.value)}
                    className="bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Ülke</Label>
                  <Select
                    value={formData.country}
                    onValueChange={(value) => handleChange("country", value)}
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TR">Türkiye</SelectItem>
                      <SelectItem value="US">ABD</SelectItem>
                      <SelectItem value="DE">Almanya</SelectItem>
                      <SelectItem value="GB">İngiltere</SelectItem>
                      <SelectItem value="FR">Fransa</SelectItem>
                      <SelectItem value="IT">İtalya</SelectItem>
                      <SelectItem value="ES">İspanya</SelectItem>
                      <SelectItem value="NL">Hollanda</SelectItem>
                      <SelectItem value="AE">BAE</SelectItem>
                      <SelectItem value="SA">Suudi Arabistan</SelectItem>
                      <SelectItem value="OTHER">Diğer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Vergi Bilgileri */}
          <Card className="bg-white border-slate-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-slate-600" />
                Vergi Bilgileri (B2B)
              </CardTitle>
              <CardDescription>
                Opsiyonel - Kurumsal müşteriler için
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="taxOffice">Vergi Dairesi</Label>
                  <Input
                    id="taxOffice"
                    placeholder="Vergi Dairesi"
                    value={formData.taxOffice}
                    onChange={(e) => handleChange("taxOffice", e.target.value)}
                    className="bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="taxNumber">Vergi No</Label>
                  <Input
                    id="taxNumber"
                    placeholder="Vergi No / TC Kimlik"
                    value={formData.taxNumber}
                    onChange={(e) => handleChange("taxNumber", e.target.value)}
                    className="bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mersisNumber">MERSİS No</Label>
                  <Input
                    id="mersisNumber"
                    placeholder="MERSİS Numarası"
                    value={formData.mersisNumber}
                    onChange={(e) => handleChange("mersisNumber", e.target.value)}
                    className="bg-white"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sınıflandırma */}
          <Card className="bg-white border-slate-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Tag className="h-5 w-5 text-slate-600" />
                Sınıflandırma
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Müşteri Tipi</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => handleChange("type", value)}
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(CUSTOMER_TYPE).map((type) => (
                        <SelectItem key={type} value={type}>
                          {getCustomerTypeLabel(type)}
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Etiketler</Label>
                <Input
                  id="tags"
                  placeholder="Etiketleri virgülle ayırın (örn: kozmetik, b2b, ihracat)"
                  value={formData.tags}
                  onChange={(e) => handleChange("tags", e.target.value)}
                  className="bg-white"
                />
                <p className="text-xs text-slate-500">
                  Birden fazla etiket için virgül kullanın
                </p>
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
                placeholder="Müşteri hakkında ek notlar..."
                value={formData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                rows={4}
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
              className="min-w-[140px]"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Müşteri Oluştur
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
