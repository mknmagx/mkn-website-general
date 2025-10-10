"use client";

import React, { useState } from "react";
import {
  Send,
  AlertCircle,
  Factory,
  Package,
  Palette,
  Truck,
  Globe,
  Headphones,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useContactSubmission } from "@/hooks/use-contact-submission";
import SubmissionStatus from "@/components/submission-status";
import { useToast } from "@/hooks/use-toast";

const services = [
  {
    value: "uretim",
    label: "Contract Manufacturing / Fason Üretim",
    icon: <Factory className="h-4 w-4" />,
  },
  {
    value: "ambalaj",
    label: "Ambalaj Hizmetleri",
    icon: <Package className="h-4 w-4" />,
  },
  {
    value: "tasarim",
    label: "Tasarım & Branding",
    icon: <Palette className="h-4 w-4" />,
  },
  {
    value: "lojistik",
    label: "Lojistik & Dağıtım",
    icon: <Truck className="h-4 w-4" />,
  },
  {
    value: "ihracat",
    label: "İhracat Danışmanlığı",
    icon: <Globe className="h-4 w-4" />,
  },
  {
    value: "danismanlik",
    label: "Genel Danışmanlık",
    icon: <Headphones className="h-4 w-4" />,
  },
];

export default function ContactForm() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    service: "",
    product: "",
    message: "",
  });

  const [errors, setErrors] = useState({});

  const {
    submitForm,
    isSubmitting,
    isSuccess,
    isError,
    submitResult,
    showSubmissionModal,
    handleCloseModal,
    handleRetrySubmission,
  } = useContactSubmission();

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Ad soyad zorunludur";
    }

    if (!formData.email.trim()) {
      newErrors.email = "E-posta zorunludur";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Geçerli bir e-posta adresi giriniz";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Mesaj zorunludur";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Mesaj en az 10 karakter olmalıdır";
    }

    if (formData.phone && !/^[\+]?[0-9\s\-\(\)]{10,}$/.test(formData.phone)) {
      newErrors.phone = "Geçerli bir telefon numarası giriniz";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const result = await submitForm(formData);
      
      if (result.success) {
        // Toast mesajı göster
        toast({
          title: "✅ Mesaj Gönderildi!",
          description: "Mesajınız başarıyla alındı. En kısa sürede size dönüş yapacağız.",
          duration: 5000,
        });
        
        // Form'u temizle
        setFormData({
          name: "",
          email: "",
          phone: "",
          company: "",
          service: "",
          product: "",
          message: "",
        });
      } else {
        // Hata toast'ı göster
        toast({
          title: "❌ Gönderim Başarısız",
          description: result.message || "Mesajınız gönderilirken bir hata oluştu.",
          variant: "destructive",
          duration: 5000,
        });
      }
    } catch (error) {
      toast({
        title: "❌ Beklenmeyen Hata",
        description: "Bir hata oluştu. Lütfen tekrar deneyin.",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  return (
    <>
      {/* Enhanced Contact Form */}
      <Card className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
        <div className="p-8 bg-gradient-to-br from-purple-50/50 to-transparent dark:from-purple-900/20 dark:to-transparent">
          <CardHeader className="p-0 mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="h-12 w-12 rounded-2xl bg-purple-500/10 flex items-center justify-center">
                <Send className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-2xl text-purple-600 mb-1">
                  Bize Ulaşın
                </CardTitle>
                <Badge
                  variant="outline"
                  className="text-xs border-purple-200 text-purple-600"
                >
                  24h Geri Dönüş
                </Badge>
              </div>
            </div>
            <CardDescription className="text-base leading-relaxed">
              <strong>Contract manufacturing</strong> ve{" "}
              <strong>fason üretim</strong> projeleriniz için formu doldurarak
              bizimle iletişime geçin. <strong>Ücretsiz danışmanlık</strong>{" "}
              alın.
            </CardDescription>
          </CardHeader>

          {/* Submission Error Alert */}
          {isError && !showSubmissionModal && (
            <Alert className="mb-6 border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700 dark:text-red-300">
                Form gönderilirken bir hata oluştu. Lütfen tekrar deneyiniz.
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="font-semibold text-foreground">
                  Ad Soyad *
                </Label>
                <Input
                  id="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className={`h-12 ${
                    errors.name
                      ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                      : "border-border focus:border-purple-500 focus:ring-purple-500/20"
                  }`}
                  placeholder="Adınız ve soyadınız"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <span className="mr-1">⚠️</span>
                    {errors.name}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="font-semibold text-foreground"
                >
                  E-posta *
                </Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={`h-12 ${
                    errors.email
                      ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                      : "border-border focus:border-purple-500 focus:ring-purple-500/20"
                  }`}
                  placeholder="ornek@email.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <span className="mr-1">⚠️</span>
                    {errors.email}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label
                  htmlFor="phone"
                  className="font-semibold text-foreground"
                >
                  Telefon
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className={`h-12 ${
                    errors.phone
                      ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                      : "border-border focus:border-purple-500 focus:ring-purple-500/20"
                  }`}
                  placeholder="+90 5xx xxx xx xx"
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <span className="mr-1">⚠️</span>
                    {errors.phone}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="company"
                  className="font-semibold text-foreground"
                >
                  Şirket
                </Label>
                <Input
                  id="company"
                  type="text"
                  value={formData.company}
                  onChange={(e) => handleInputChange("company", e.target.value)}
                  className="h-12 border-border focus:border-purple-500 focus:ring-purple-500/20"
                  placeholder="Şirket adınız"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="service"
                className="font-semibold text-foreground"
              >
                İlgilendiğiniz Hizmet
              </Label>
              <Select
                value={formData.service}
                onValueChange={(value) => handleInputChange("service", value)}
              >
                <SelectTrigger className="h-12 border-border focus:border-purple-500 focus:ring-purple-500/20">
                  <SelectValue placeholder="Hizmet seçiniz" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.value} value={service.value}>
                      <div className="flex items-center space-x-2">
                        {service.icon}
                        <span>{service.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.service === "uretim" && (
              <div className="space-y-2">
                <Label
                  htmlFor="product"
                  className="font-semibold text-foreground"
                >
                  Ürün Detayları
                </Label>
                <Input
                  id="product"
                  type="text"
                  value={formData.product}
                  onChange={(e) => handleInputChange("product", e.target.value)}
                  className="h-12 border-border focus:border-purple-500 focus:ring-purple-500/20"
                  placeholder="İlgilendiğiniz ürün detayları"
                />
              </div>
            )}

            {formData.service === "tasarim" && (
              <div className="space-y-2">
                <Label
                  htmlFor="product"
                  className="font-semibold text-foreground"
                >
                  Tasarım Hizmeti Detayları
                </Label>
                <Input
                  id="product"
                  type="text"
                  value={formData.product}
                  onChange={(e) => handleInputChange("product", e.target.value)}
                  className="h-12 border-border focus:border-purple-500 focus:ring-purple-500/20"
                  placeholder="Hangi tasarım hizmetlerine ihtiyacınız var? (Logo, marka kimliği, ambalaj tasarımı, 3D modelleme vb.)"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label
                htmlFor="message"
                className="font-semibold text-foreground"
              >
                Mesajınız *
              </Label>
              <Textarea
                id="message"
                required
                rows={5}
                value={formData.message}
                onChange={(e) => handleInputChange("message", e.target.value)}
                className={`${
                  errors.message
                    ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                    : "border-border focus:border-purple-500 focus:ring-purple-500/20"
                }`}
                placeholder="Projeniz hakkında detayları paylaşın..."
              />
              {errors.message && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <span className="mr-1">⚠️</span>
                  {errors.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full h-12 bg-gradient-to-r from-purple-600 to-primary hover:from-purple-700 hover:to-primary/90 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Gönderiliyor...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Mesaj Gönder
                </>
              )}
            </Button>
          </form>
        </div>
      </Card>

      {/* Submission Modal */}
      {showSubmissionModal && (
        <SubmissionStatus
          isSubmitting={isSubmitting}
          isSuccess={isSuccess}
          isError={isError}
          submitResult={submitResult}
          onClose={handleCloseModal}
          onRetry={handleRetrySubmission}
        />
      )}
    </>
  );
}
