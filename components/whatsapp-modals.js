"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  UserPlus,
  Send,
  Loader2,
  Search,
  FileText,
  Trash2,
  MessageSquare,
} from "lucide-react";

/**
 * Yeni Kişi Ekleme Modal
 */
export function NewContactModal({ open, onOpenChange, onContactCreated }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    phoneNumber: "",
    name: "",
    company: "",
    email: "",
    group: "customer",
    notes: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/admin/whatsapp/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        onContactCreated?.(data.data);
        onOpenChange(false);
        setFormData({
          phoneNumber: "",
          name: "",
          company: "",
          email: "",
          group: "customer",
          notes: "",
        });
      } else {
        alert(data.error || "Kişi eklenemedi");
      }
    } catch (error) {
      console.error("Error creating contact:", error);
      alert("Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-green-600" />
            Yeni Kişi Ekle
          </DialogTitle>
          <DialogDescription>
            WhatsApp rehberine yeni bir kişi ekleyin
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="phoneNumber">Telefon Numarası *</Label>
              <Input
                id="phoneNumber"
                placeholder="905551234567"
                value={formData.phoneNumber}
                onChange={(e) =>
                  setFormData({ ...formData, phoneNumber: e.target.value })
                }
                required
              />
              <p className="text-xs text-gray-500">
                Ülke kodu ile birlikte girin (örn: 905551234567)
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name">İsim</Label>
              <Input
                id="name"
                placeholder="Ad Soyad"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="company">Şirket</Label>
              <Input
                id="company"
                placeholder="Şirket adı"
                value={formData.company}
                onChange={(e) =>
                  setFormData({ ...formData, company: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="group">Grup</Label>
              <Select
                value={formData.group}
                onValueChange={(value) =>
                  setFormData({ ...formData, group: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customer">Müşteri</SelectItem>
                  <SelectItem value="lead">Potansiyel</SelectItem>
                  <SelectItem value="supplier">Tedarikçi</SelectItem>
                  <SelectItem value="partner">İş Ortağı</SelectItem>
                  <SelectItem value="other">Diğer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notlar</Label>
              <Textarea
                id="notes"
                placeholder="Kişi hakkında notlar..."
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              İptal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Kaydet
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Şablon Seçici Modal
 */
export function TemplatePickerModal({
  open,
  onOpenChange,
  onTemplateSelect,
  recipientPhone,
  recipientName,
}) {
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [variables, setVariables] = useState({});

  useEffect(() => {
    if (open) {
      fetchTemplates();
    }
  }, [open]);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/whatsapp/templates?status=APPROVED");
      const data = await response.json();
      if (data.success) {
        setTemplates(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!selectedTemplate || !recipientPhone) return;

    setSending(true);
    try {
      // Build components from variables
      const components = buildTemplateComponents(selectedTemplate, variables);

      const response = await fetch("/api/admin/whatsapp/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "template",
          to: recipientPhone,
          templateName: selectedTemplate.name,
          languageCode: selectedTemplate.language,
          components,
        }),
      });

      const data = await response.json();

      if (data.success) {
        onTemplateSelect?.(data);
        onOpenChange(false);
        setSelectedTemplate(null);
        setVariables({});
      } else {
        alert(data.error || "Şablon gönderilemedi");
      }
    } catch (error) {
      console.error("Error sending template:", error);
      alert("Bir hata oluştu");
    } finally {
      setSending(false);
    }
  };

  const buildTemplateComponents = (template, vars) => {
    const components = [];

    for (const component of template.components || []) {
      if (component.type === "HEADER" && vars.header) {
        if (component.format === "TEXT") {
          components.push({
            type: "header",
            parameters: [{ type: "text", text: vars.header }],
          });
        }
      }

      if (component.type === "BODY" && vars.body?.length > 0) {
        components.push({
          type: "body",
          parameters: vars.body.map((v) => ({ type: "text", text: v || "" })),
        });
      }
    }

    return components;
  };

  const getTemplateVariables = (template) => {
    const vars = { header: null, body: [] };
    const regex = /\{\{(\d+)\}\}/g;

    for (const component of template.components || []) {
      if (component.type === "HEADER" && component.format === "TEXT") {
        const matches = component.text?.match(regex);
        if (matches) vars.header = true;
      }
      if (component.type === "BODY" && component.text) {
        const matches = [...component.text.matchAll(regex)];
        vars.body = matches.map((m) => parseInt(m[1]));
      }
    }

    return vars;
  };

  const getPreview = (template) => {
    let preview = "";
    for (const comp of template.components || []) {
      if (comp.type === "BODY") {
        preview = comp.text || "";
        break;
      }
    }
    return preview.slice(0, 100) + (preview.length > 100 ? "..." : "");
  };

  const filteredTemplates = templates.filter(
    (t) =>
      t.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-green-600" />
            Şablon Seç
          </DialogTitle>
          <DialogDescription>
            {recipientName || recipientPhone} kişisine gönderilecek şablonu seçin
          </DialogDescription>
        </DialogHeader>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Şablon ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : (
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-2">
              {filteredTemplates.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  Onaylı şablon bulunamadı
                </p>
              ) : (
                filteredTemplates.map((template) => (
                  <div
                    key={template.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedTemplate?.id === template.id
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => {
                      setSelectedTemplate(template);
                      const templateVars = getTemplateVariables(template);
                      setVariables({
                        header: "",
                        body: templateVars.body.map(() => ""),
                      });
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-sm">{template.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {template.language} • {template.category}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className="text-xs bg-green-50 text-green-700 border-green-200"
                      >
                        Onaylı
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                      {getPreview(template)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        )}

        {/* Variable inputs */}
        {selectedTemplate && (
          <div className="border-t pt-4 mt-4">
            <p className="text-sm font-medium mb-3">Değişkenleri Doldurun</p>
            {getTemplateVariables(selectedTemplate).body.map((varNum, idx) => (
              <div key={idx} className="mb-2">
                <Label className="text-xs text-gray-500">
                  Değişken {`{{${varNum}}}`}
                </Label>
                <Input
                  placeholder={`Değer ${varNum}`}
                  value={variables.body?.[idx] || ""}
                  onChange={(e) => {
                    const newBody = [...(variables.body || [])];
                    newBody[idx] = e.target.value;
                    setVariables({ ...variables, body: newBody });
                  }}
                  className="mt-1"
                />
              </div>
            ))}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            İptal
          </Button>
          <Button
            onClick={handleSend}
            disabled={!selectedTemplate || sending}
            className="bg-green-600 hover:bg-green-700"
          >
            {sending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Send className="mr-2 h-4 w-4" />
            Gönder
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Yeni Mesaj Başlatma Modal (Kişi seç veya ekle)
 */
export function NewMessageModal({ open, onOpenChange, onConversationStart }) {
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [showNewContact, setShowNewContact] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  useEffect(() => {
    if (open && searchQuery.length >= 2) {
      searchContacts();
    }
  }, [open, searchQuery]);

  const searchContacts = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/admin/whatsapp/contacts?search=${encodeURIComponent(searchQuery)}&quick=true`
      );
      const data = await response.json();
      if (data.success) {
        setContacts(data.data || []);
      }
    } catch (error) {
      console.error("Error searching contacts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleContactSelect = (contact) => {
    setSelectedContact(contact);
    setShowTemplates(true);
  };

  const handleTemplateSelect = (result) => {
    onConversationStart?.(result);
    onOpenChange(false);
    setSearchQuery("");
    setContacts([]);
    setSelectedContact(null);
    setShowTemplates(false);
  };

  const handleNewContactCreated = (contact) => {
    setShowNewContact(false);
    setSelectedContact(contact);
    setShowTemplates(true);
  };

  if (showTemplates && selectedContact) {
    return (
      <TemplatePickerModal
        open={open}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setShowTemplates(false);
            setSelectedContact(null);
          }
          onOpenChange(isOpen);
        }}
        onTemplateSelect={handleTemplateSelect}
        recipientPhone={selectedContact.phoneNumber || selectedContact.waId}
        recipientName={selectedContact.name || selectedContact.profileName}
      />
    );
  }

  if (showNewContact) {
    return (
      <NewContactModal
        open={open}
        onOpenChange={(isOpen) => {
          if (!isOpen) setShowNewContact(false);
          onOpenChange(isOpen);
        }}
        onContactCreated={handleNewContactCreated}
      />
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-green-600" />
            Yeni Mesaj
          </DialogTitle>
          <DialogDescription>
            Kişi seçin veya yeni kişi ekleyin
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="İsim veya telefon numarası ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            </div>
          ) : contacts.length > 0 ? (
            <ScrollArea className="h-[200px]">
              <div className="space-y-1">
                {contacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleContactSelect(contact)}
                  >
                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-medium">
                      {(contact.name || contact.phoneNumber)?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {contact.name || contact.phoneNumber}
                      </p>
                      <p className="text-xs text-gray-500">
                        {contact.phoneNumber}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : searchQuery.length >= 2 ? (
            <p className="text-center text-sm text-gray-500 py-4">
              Kişi bulunamadı
            </p>
          ) : (
            <p className="text-center text-sm text-gray-500 py-4">
              Aramak için en az 2 karakter girin
            </p>
          )}

          <div className="border-t pt-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowNewContact(true)}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Yeni Kişi Ekle
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Conversation Silme Dialog
 */
export function DeleteConversationDialog({
  open,
  onOpenChange,
  conversation,
  onDeleted,
}) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!conversation) return;

    setLoading(true);
    try {
      const response = await fetch(
        `/api/admin/whatsapp/conversations?id=${conversation.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (data.success) {
        onDeleted?.();
        onOpenChange(false);
      } else {
        alert(data.error || "Silinemedi");
      }
    } catch (error) {
      console.error("Error deleting conversation:", error);
      alert("Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-red-500" />
            Konuşmayı Sil
          </AlertDialogTitle>
          <AlertDialogDescription>
            <strong>
              {conversation?.profileName || conversation?.waId}
            </strong>{" "}
            ile olan konuşmayı silmek istediğinize emin misiniz?
            <br />
            <br />
            Bu işlem geri alınamaz ve tüm mesajlar kalıcı olarak silinecektir.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>İptal</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700"
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sil
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
