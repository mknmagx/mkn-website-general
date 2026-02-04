"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Phone,
  Building2,
  Mail,
  Tag,
  MessageSquare,
  Calendar,
  Edit2,
  Save,
  X,
  Loader2,
  User,
  FileText,
  ExternalLink,
} from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

const CONTACT_GROUPS = [
  { id: "customer", label: "Müşteri" },
  { id: "supplier", label: "Tedarikçi" },
  { id: "partner", label: "İş Ortağı" },
  { id: "lead", label: "Potansiyel" },
  { id: "other", label: "Diğer" },
];

export function ContactProfileDialog({
  open,
  onOpenChange,
  contact,
  conversation,
  onContactUpdate,
  onAddToContacts,
}) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    group: "other",
    notes: "",
    tags: [],
  });

  // Initialize form data when contact changes
  const initializeForm = () => {
    if (contact) {
      setFormData({
        name: contact.name || "",
        company: contact.company || "",
        email: contact.email || "",
        group: contact.group || "other",
        notes: contact.notes || "",
        tags: contact.tags || [],
      });
    }
  };

  // Handle dialog open
  const handleOpenChange = (open) => {
    if (open) {
      initializeForm();
      setIsEditing(false);
    }
    onOpenChange(open);
  };

  // Get initials
  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return "-";
    try {
      let date;
      if (timestamp?.seconds) {
        date = new Date(timestamp.seconds * 1000);
      } else if (timestamp?._seconds) {
        date = new Date(timestamp._seconds * 1000);
      } else {
        date = new Date(timestamp);
      }
      return format(date, "d MMMM yyyy HH:mm", { locale: tr });
    } catch {
      return "-";
    }
  };

  // Save contact
  const handleSave = async () => {
    if (!contact?.id) return;

    setSaving(true);
    try {
      const response = await fetch("/api/admin/whatsapp/contacts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: contact.id,
          ...formData,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Başarılı",
          description: "Kişi bilgileri güncellendi",
        });
        setIsEditing(false);
        if (onContactUpdate) {
          onContactUpdate({ ...contact, ...formData });
        }
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: error.message || "Kişi güncellenemedi",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Get display data
  const displayName = contact?.name || conversation?.profileName || conversation?.waId || "-";
  const displayPhone = contact?.phoneNumber || conversation?.waId || "-";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-gray-600" />
            Kişi Profili
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Avatar & Basic Info */}
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-green-100 text-green-700 text-xl">
                {getInitials(displayName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              {isEditing ? (
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="İsim"
                  className="text-lg font-semibold"
                />
              ) : (
                <h3 className="text-lg font-semibold text-gray-900">{displayName}</h3>
              )}
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {displayPhone}
              </p>
              {conversation?.profileName && contact && (
                <p className="text-xs text-gray-400">
                  WhatsApp: {conversation.profileName}
                </p>
              )}
            </div>
          </div>

          <Separator />

          {/* Contact Details */}
          {contact ? (
            <div className="space-y-4">
              {/* Company */}
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-500 flex items-center gap-1">
                  <Building2 className="h-3 w-3" />
                  Şirket
                </Label>
                {isEditing ? (
                  <Input
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="Şirket adı"
                  />
                ) : (
                  <p className="text-sm">{contact.company || "-"}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-500 flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  E-posta
                </Label>
                {isEditing ? (
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="E-posta adresi"
                  />
                ) : (
                  <p className="text-sm">
                    {contact.email ? (
                      <a href={`mailto:${contact.email}`} className="text-blue-600 hover:underline">
                        {contact.email}
                      </a>
                    ) : "-"}
                  </p>
                )}
              </div>

              {/* Group */}
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-500 flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  Grup
                </Label>
                {isEditing ? (
                  <Select
                    value={formData.group}
                    onValueChange={(value) => setFormData({ ...formData, group: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CONTACT_GROUPS.map((g) => (
                        <SelectItem key={g.id} value={g.id}>
                          {g.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge variant="outline" className="text-xs">
                    {CONTACT_GROUPS.find((g) => g.id === contact.group)?.label || "Diğer"}
                  </Badge>
                )}
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-500 flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  Notlar
                </Label>
                {isEditing ? (
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Notlar..."
                    rows={3}
                  />
                ) : (
                  <p className="text-sm text-gray-600">{contact.notes || "-"}</p>
                )}
              </div>

              <Separator />

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Mesaj Sayısı</p>
                  <p className="font-medium">{contact.messageCount || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Son Mesaj</p>
                  <p className="font-medium text-xs">{formatDate(contact.lastMessageAt)}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-500 mb-1">Oluşturulma</p>
                  <p className="font-medium text-xs">{formatDate(contact.createdAt)}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        initializeForm();
                        setIsEditing(false);
                      }}
                    >
                      <X className="h-4 w-4 mr-1" />
                      İptal
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={handleSave}
                      disabled={saving}
                    >
                      {saving ? (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-1" />
                      )}
                      Kaydet
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit2 className="h-4 w-4 mr-1" />
                      Düzenle
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => window.open(`/admin/whatsapp/contacts?id=${contact.id}`, "_blank")}
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Rehberde Aç
                    </Button>
                  </>
                )}
              </div>
            </div>
          ) : (
            /* Not in contacts */
            <div className="text-center py-4">
              <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                <User className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500 mb-4">
                Bu kişi rehberde kayıtlı değil
              </p>
              {onAddToContacts && (
                <Button
                  onClick={onAddToContacts}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Rehbere Ekle
                </Button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ContactProfileDialog;
