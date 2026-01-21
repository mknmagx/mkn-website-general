"use client";

import { useState } from "react";
import {
  COMMUNICATION_TYPE,
  getCommunicationTypeLabel,
} from "../../lib/services/communication-service";

// UI Components
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

// Icons
import {
  Mail,
  Phone,
  MessageCircle,
  Users,
  StickyNote,
  Loader2,
  Send,
  Clock,
} from "lucide-react";

// Tip ikonları
const typeIcons = {
  [COMMUNICATION_TYPE.EMAIL_OUTGOING]: Mail,
  [COMMUNICATION_TYPE.PHONE_OUTGOING]: Phone,
  [COMMUNICATION_TYPE.PHONE_INCOMING]: Phone,
  [COMMUNICATION_TYPE.WHATSAPP_OUTGOING]: MessageCircle,
  [COMMUNICATION_TYPE.MEETING]: Users,
  [COMMUNICATION_TYPE.NOTE]: StickyNote,
};

// Seçilebilir tipler (kullanıcı tarafından eklenebilecekler)
const selectableTypes = [
  { value: COMMUNICATION_TYPE.NOTE, label: "Dahili Not", icon: StickyNote },
  { value: COMMUNICATION_TYPE.EMAIL_OUTGOING, label: "Giden E-posta", icon: Mail },
  { value: COMMUNICATION_TYPE.PHONE_OUTGOING, label: "Giden Arama", icon: Phone },
  { value: COMMUNICATION_TYPE.PHONE_INCOMING, label: "Gelen Arama", icon: Phone },
  { value: COMMUNICATION_TYPE.WHATSAPP_OUTGOING, label: "WhatsApp Mesajı", icon: MessageCircle },
  { value: COMMUNICATION_TYPE.MEETING, label: "Toplantı", icon: Users },
];

/**
 * İletişim Ekleme Modalı
 */
export default function AddCommunicationModal({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
  defaultTo = "",
  customerName = "",
}) {
  const [formData, setFormData] = useState({
    type: COMMUNICATION_TYPE.NOTE,
    subject: "",
    content: "",
    summary: "",
    from: "info@mkngroup.com.tr",
    to: defaultTo,
    duration: "",
  });

  const [errors, setErrors] = useState({});

  const handleTypeChange = (type) => {
    setFormData((prev) => ({
      ...prev,
      type,
      // Tipi değiştirince bazı alanları sıfırla
      duration: type.includes("phone") ? prev.duration : "",
    }));
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.content.trim()) {
      newErrors.content = "İçerik zorunludur";
    }

    // E-posta için alıcı zorunlu
    if (formData.type === COMMUNICATION_TYPE.EMAIL_OUTGOING && !formData.to.trim()) {
      newErrors.to = "Alıcı e-posta adresi zorunludur";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const data = {
      type: formData.type,
      subject: formData.subject || getCommunicationTypeLabel(formData.type),
      content: formData.content,
      summary: formData.summary,
      from: formData.from,
      to: formData.to,
    };

    // Telefon için süre ekle
    if (formData.type.includes("phone") && formData.duration) {
      data.duration = parseInt(formData.duration) * 60; // Dakikayı saniyeye çevir
    }

    const result = await onSubmit(data);

    if (result?.success) {
      // Formu sıfırla
      setFormData({
        type: COMMUNICATION_TYPE.NOTE,
        subject: "",
        content: "",
        summary: "",
        from: "info@mkngroup.com.tr",
        to: defaultTo,
        duration: "",
      });
      onOpenChange(false);
    }
  };

  const isPhoneType = formData.type.includes("phone");
  const isEmailType = formData.type.includes("email");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-blue-600" />
            İletişim Kaydı Ekle
          </DialogTitle>
          <DialogDescription>
            {customerName ? `${customerName} ile iletişim kaydı oluşturun` : "Yeni bir iletişim kaydı oluşturun"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* İletişim Tipi */}
          <div>
            <Label className="text-sm font-medium">İletişim Türü *</Label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {selectableTypes.map((type) => {
                const Icon = type.icon;
                const isSelected = formData.type === type.value;
                return (
                  <Button
                    key={type.value}
                    type="button"
                    variant={isSelected ? "default" : "outline"}
                    className={`justify-start ${
                      isSelected
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                    onClick={() => handleTypeChange(type.value)}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {type.label}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* E-posta için Alıcı */}
          {isEmailType && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="from">Gönderen</Label>
                <Input
                  id="from"
                  value={formData.from}
                  onChange={(e) => handleInputChange("from", e.target.value)}
                  placeholder="info@mkngroup.com.tr"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="to">Alıcı *</Label>
                <Input
                  id="to"
                  value={formData.to}
                  onChange={(e) => handleInputChange("to", e.target.value)}
                  placeholder="musteri@email.com"
                  className={`mt-1 ${errors.to ? "border-red-500" : ""}`}
                />
                {errors.to && (
                  <p className="text-red-500 text-xs mt-1">{errors.to}</p>
                )}
              </div>
            </div>
          )}

          {/* Telefon için süre */}
          {isPhoneType && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="to">Telefon Numarası</Label>
                <Input
                  id="to"
                  value={formData.to}
                  onChange={(e) => handleInputChange("to", e.target.value)}
                  placeholder="+90 5XX XXX XX XX"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="duration" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Görüşme Süresi (dakika)
                </Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  value={formData.duration}
                  onChange={(e) => handleInputChange("duration", e.target.value)}
                  placeholder="5"
                  className="mt-1"
                />
              </div>
            </div>
          )}

          {/* Konu */}
          <div>
            <Label htmlFor="subject">Konu</Label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) => handleInputChange("subject", e.target.value)}
              placeholder="İletişimin konusu..."
              className="mt-1"
            />
          </div>

          {/* İçerik */}
          <div>
            <Label htmlFor="content">İçerik *</Label>
            <Textarea
              id="content"
              rows={6}
              value={formData.content}
              onChange={(e) => handleInputChange("content", e.target.value)}
              placeholder={
                formData.type === COMMUNICATION_TYPE.NOTE
                  ? "Dahili notunuzu yazın..."
                  : formData.type.includes("phone")
                  ? "Görüşme notları..."
                  : "Mesaj içeriği..."
              }
              className={`mt-1 ${errors.content ? "border-red-500" : ""}`}
            />
            {errors.content && (
              <p className="text-red-500 text-xs mt-1">{errors.content}</p>
            )}
          </div>

          {/* Özet */}
          <div>
            <Label htmlFor="summary">Özet (Opsiyonel)</Label>
            <Input
              id="summary"
              value={formData.summary}
              onChange={(e) => handleInputChange("summary", e.target.value)}
              placeholder="Kısa bir özet..."
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">
              İletişimin kısa bir özeti timeline'da görünecektir
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            İptal
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Kaydediliyor...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Kaydet
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
