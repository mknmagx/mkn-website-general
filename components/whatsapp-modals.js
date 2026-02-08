"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  UserPlus,
  Send,
  Loader2,
  Search,
  FileText,
  Trash2,
  MessageSquare,
  BookUser,
  Phone,
  Eye,
  ChevronRight,
  User,
  Sparkles,
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
 * Gelişmiş Şablon Seçici Modal
 * - Manuel telefon numarası girişi veya rehberden kişi seçimi
 * - Parametre önerileri ve otomatik doldurma
 * - Canlı önizleme
 */
export function TemplatePickerModal({
  open,
  onOpenChange,
  onTemplateSelect,
  recipientPhone: initialPhone = "",
  recipientName: initialName = "",
  // Context data for auto-fill suggestions
  contextData = null,
  // Hide phone input if already have recipient
  hidePhoneInput = false,
}) {
  const [step, setStep] = useState(1); // 1: phone, 2: template
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [variables, setVariables] = useState({ header: "", body: [] });
  
  // Phone selection state
  const [phoneInputMode, setPhoneInputMode] = useState("manual"); // manual | contact
  const [phoneNumber, setPhoneNumber] = useState(initialPhone);
  const [recipientName, setRecipientName] = useState(initialName);
  const [phoneError, setPhoneError] = useState(null);
  
  // Contact picker state
  const [contacts, setContacts] = useState([]);
  const [contactSearch, setContactSearch] = useState("");
  const [loadingContacts, setLoadingContacts] = useState(false);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (open) {
      setPhoneNumber(initialPhone);
      setRecipientName(initialName);
      setSelectedTemplate(null);
      setVariables({ header: "", body: [] });
      setLoading(true);
      fetchTemplates().then(() => {
        // After templates loaded, set step
        setStep(initialPhone && hidePhoneInput ? 2 : 1);
      });
    }
  }, [open, initialPhone, initialName, hidePhoneInput]);

  // Auto-fill variables from context data when template is selected
  useEffect(() => {
    if (selectedTemplate && contextData) {
      const templateVars = getTemplateVariables(selectedTemplate);
      const autoFilledBody = templateVars.body.map((varNum, idx) => {
        // Try to auto-fill based on common patterns
        const suggestions = getVariableSuggestions(selectedTemplate, varNum, idx);
        if (suggestions.length > 0 && contextData[suggestions[0].key]) {
          return contextData[suggestions[0].key];
        }
        return "";
      });
      setVariables({ header: "", body: autoFilledBody });
    }
  }, [selectedTemplate, contextData]);

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

  const searchContacts = async (query) => {
    if (query.length < 2) {
      // If no query, fetch all contacts
      if (!query) fetchAllContacts();
      return;
    }
    setLoadingContacts(true);
    try {
      const response = await fetch(
        `/api/admin/whatsapp/contacts?search=${encodeURIComponent(query)}&quick=true`
      );
      const data = await response.json();
      if (data.success) {
        setContacts(data.data || []);
      }
    } catch (error) {
      console.error("Error searching contacts:", error);
    } finally {
      setLoadingContacts(false);
    }
  };

  // Fetch all contacts on tab switch
  const fetchAllContacts = async () => {
    if (contacts.length > 0) return;
    setLoadingContacts(true);
    try {
      const response = await fetch("/api/admin/whatsapp/contacts");
      const data = await response.json();
      if (data.success) {
        setContacts(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching contacts:", error);
    } finally {
      setLoadingContacts(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (contactSearch) searchContacts(contactSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [contactSearch]);

  const validatePhone = (phone) => {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length < 10) {
      return "Telefon numarası en az 10 haneli olmalı";
    }
    if (cleaned.length > 15) {
      return "Telefon numarası çok uzun";
    }
    return null;
  };

  const handlePhoneNext = () => {
    const error = validatePhone(phoneNumber);
    if (error) {
      setPhoneError(error);
      return;
    }
    setPhoneError(null);
    setStep(2);
  };

  const handleContactSelect = (contact) => {
    setPhoneNumber(contact.phoneNumber || contact.waId);
    setRecipientName(contact.name || contact.profileName || "");
    setPhoneError(null);
    setStep(2);
  };

  const handleSend = async () => {
    const cleanPhone = phoneNumber.replace(/\D/g, "");
    if (!selectedTemplate || !cleanPhone) return;

    setSending(true);
    try {
      const components = buildTemplateComponents(selectedTemplate, variables);

      const response = await fetch("/api/admin/whatsapp/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "template",
          to: cleanPhone,
          templateName: selectedTemplate.name,
          languageCode: selectedTemplate.language,
          components,
        }),
      });

      const data = await response.json();

      if (data.success) {
        onTemplateSelect?.({ ...data, recipientPhone: cleanPhone, recipientName });
        onOpenChange(false);
        setSelectedTemplate(null);
        setVariables({ header: "", body: [] });
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

  // Get variable suggestions based on template name and position
  const getVariableSuggestions = (template, varNum, idx) => {
    const suggestions = [];
    const templateName = template.name?.toLowerCase() || "";
    const bodyText = template.components?.find(c => c.type === "BODY")?.text?.toLowerCase() || "";
    
    // First variable is usually customer name
    if (varNum === 1 || idx === 0) {
      if (bodyText.includes("merhaba") || bodyText.includes("sayın")) {
        suggestions.push({ key: "customerName", label: "Müşteri Adı" });
      }
    }
    
    // Second variable patterns
    if (varNum === 2 || idx === 1) {
      if (templateName.includes("talep") || bodyText.includes("talep") || bodyText.includes("konulu")) {
        suggestions.push({ key: "requestTitle", label: "Talep Başlığı" });
      }
      if (templateName.includes("teklif") || bodyText.includes("teklif")) {
        suggestions.push({ key: "offerTitle", label: "Teklif Başlığı" });
        suggestions.push({ key: "offerUrl", label: "Teklif Linki" });
      }
      if (bodyText.includes("fiyat") || bodyText.includes("tutar")) {
        suggestions.push({ key: "amount", label: "Tutar" });
      }
    }
    
    return suggestions;
  };

  // Get live preview with filled variables
  const getLivePreview = (template) => {
    if (!template) return "";
    
    let preview = "";
    for (const comp of template.components || []) {
      if (comp.type === "HEADER" && comp.format === "TEXT") {
        let headerText = comp.text || "";
        if (variables.header) {
          headerText = headerText.replace(/\{\{1\}\}/g, variables.header);
        }
        preview += `*${headerText}*\n\n`;
      }
      if (comp.type === "BODY") {
        let bodyText = comp.text || "";
        const templateVars = getTemplateVariables(template);
        templateVars.body.forEach((varNum, idx) => {
          const value = variables.body?.[idx] || `{{${varNum}}}`;
          bodyText = bodyText.replace(new RegExp(`\\{\\{${varNum}\\}\\}`, 'g'), value);
        });
        preview += bodyText;
      }
    }
    return preview;
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
      <DialogContent className="sm:max-w-[750px] max-h-[85vh] flex flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-green-600" />
            {step === 1 ? "Alıcı Seç" : "Şablon Mesajı Gönder"}
          </DialogTitle>
          <DialogDescription>
            {step === 1 
              ? "Telefon numarası girin veya rehberden kişi seçin"
              : `${recipientName || phoneNumber} kişisine şablon gönder`
            }
          </DialogDescription>
        </DialogHeader>

        {/* Step 1: Phone Selection */}
        {step === 1 && (
          <div className="flex-1 overflow-y-auto py-4 min-h-0">
            <Tabs value={phoneInputMode} onValueChange={(val) => {
              setPhoneInputMode(val);
              if (val === "contact" && contacts.length === 0) fetchAllContacts();
            }} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="manual" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Manuel Giriş
                </TabsTrigger>
                <TabsTrigger value="contact" className="flex items-center gap-2">
                  <BookUser className="h-4 w-4" />
                  Rehberden Seç
                </TabsTrigger>
              </TabsList>

              <TabsContent value="manual" className="space-y-4">
                <div>
                  <Label htmlFor="phone">Telefon Numarası</Label>
                  <Input
                    id="phone"
                    placeholder="905551234567"
                    value={phoneNumber}
                    onChange={(e) => {
                      setPhoneNumber(e.target.value);
                      setPhoneError(null);
                    }}
                    className={`mt-1 ${phoneError ? "border-red-500" : ""}`}
                  />
                  {phoneError && (
                    <p className="text-xs text-red-500 mt-1">{phoneError}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Ülke kodu ile birlikte girin (örn: 905551234567)
                  </p>
                </div>
                <div>
                  <Label htmlFor="name">Alıcı Adı (Opsiyonel)</Label>
                  <Input
                    id="name"
                    placeholder="Ad Soyad"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </TabsContent>

              <TabsContent value="contact" className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="İsim veya telefon numarası ara..."
                    value={contactSearch}
                    onChange={(e) => setContactSearch(e.target.value)}
                    onFocus={() => { if (contacts.length === 0) fetchAllContacts(); }}
                    className="pl-9"
                  />
                </div>

                {loadingContacts ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                  </div>
                ) : contacts.length > 0 ? (
                  <ScrollArea className="h-[250px]">
                    <div className="space-y-1">
                      {(contactSearch.length >= 2 
                        ? contacts.filter(c => 
                            c.name?.toLowerCase().includes(contactSearch.toLowerCase()) ||
                            c.phoneNumber?.includes(contactSearch)
                          )
                        : contacts
                      ).map((contact) => (
                        <div
                          key={contact.id}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer border border-transparent hover:border-gray-200"
                          onClick={() => handleContactSelect(contact)}
                        >
                          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-medium">
                            {(contact.name || contact.phoneNumber)?.[0]?.toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">
                              {contact.name || contact.phoneNumber}
                            </p>
                            <p className="text-xs text-gray-500">
                              {contact.phoneNumber}
                            </p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : contactSearch.length >= 2 ? (
                  <p className="text-center text-sm text-gray-500 py-8">
                    Kişi bulunamadı
                  </p>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-sm text-gray-500 mb-2">Kişileri yüklemek için tıklayın</p>
                    <Button variant="outline" size="sm" onClick={fetchAllContacts}>
                      Kişileri Yükle
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Step 2: Template Selection & Variables */}
        {step === 2 && (
          <div className="flex-1 flex gap-4 min-h-0 overflow-hidden">
            {/* Left: Template List */}
            <div className="w-1/2 flex flex-col min-h-0">
              <div className="relative mb-3 shrink-0">
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
                <ScrollArea className="flex-1 min-h-0">
                  <div className="space-y-2 pr-2">
                    {filteredTemplates.length === 0 ? (
                      <p className="text-center text-gray-500 py-8 text-sm">
                        Onaylı şablon bulunamadı
                      </p>
                    ) : (
                      filteredTemplates.map((template) => (
                        <div
                          key={template.id}
                          className={`p-3 border rounded-lg cursor-pointer transition-all ${
                            selectedTemplate?.id === template.id
                              ? "border-green-500 bg-green-50 ring-1 ring-green-500"
                              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                          }`}
                          onClick={() => {
                            setSelectedTemplate(template);
                            const templateVars = getTemplateVariables(template);
                            // Try to auto-fill from context if available
                            const autoFilledBody = templateVars.body.map((varNum, idx) => {
                              if (contextData) {
                                const suggestions = getVariableSuggestions(template, varNum, idx);
                                for (const s of suggestions) {
                                  if (contextData[s.key]) return contextData[s.key];
                                }
                              }
                              // Default: use recipientName for first variable
                              if (idx === 0 && recipientName) return recipientName;
                              return "";
                            });
                            setVariables({ header: "", body: autoFilledBody });
                          }}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{template.name}</p>
                              <p className="text-xs text-gray-500 mt-0.5">
                                {template.language} • {template.category}
                              </p>
                            </div>
                            <Badge
                              variant="outline"
                              className="text-xs bg-green-50 text-green-700 border-green-200 ml-2 shrink-0"
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
            </div>

            {/* Right: Variables & Preview */}
            <div className="w-1/2 flex flex-col min-h-0 border-l pl-4">
              {selectedTemplate ? (
                <>
                  {/* Variable Inputs */}
                  <div className="mb-3 shrink-0">
                    <p className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-amber-500" />
                      Değişkenler
                    </p>
                    <ScrollArea className="max-h-[200px]">
                      <div className="space-y-2 pr-2">
                        {/* Header Variable */}
                        {getTemplateVariables(selectedTemplate).header && (
                          <div>
                            <Label className="text-xs text-gray-500">
                              Başlık Değişkeni
                              <span className="ml-1 text-gray-400">{`{{1}}`}</span>
                            </Label>
                            <Input
                              placeholder="Başlık değeri"
                              value={variables.header || ""}
                              onChange={(e) => setVariables({ ...variables, header: e.target.value })}
                              className="mt-1 h-8 text-sm"
                            />
                          </div>
                        )}
                        {/* Body Variables */}
                        {getTemplateVariables(selectedTemplate).body.map((varNum, idx) => {
                          const suggestions = getVariableSuggestions(selectedTemplate, varNum, idx);
                          return (
                            <div key={idx}>
                              <div className="flex items-center justify-between">
                                <Label className="text-xs text-gray-500">
                                  {suggestions.length > 0 ? suggestions[0].label : `Değişken ${varNum}`}
                                  <span className="ml-1 text-gray-400">{`{{${varNum}}}`}</span>
                                </Label>
                                {contextData && suggestions.length > 0 && (
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button variant="ghost" size="sm" className="h-6 text-xs">
                                        Öneriler
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-48 p-1" align="end">
                                      {suggestions.map((s) => (
                                        <Button
                                          key={s.key}
                                          variant="ghost"
                                          className="w-full justify-start text-xs h-8"
                                          disabled={!contextData[s.key]}
                                          onClick={() => {
                                            const newBody = [...(variables.body || [])];
                                            newBody[idx] = contextData[s.key] || "";
                                            setVariables({ ...variables, body: newBody });
                                          }}
                                        >
                                          {s.label}: {contextData[s.key] || "-"}
                                        </Button>
                                      ))}
                                    </PopoverContent>
                                  </Popover>
                                )}
                              </div>
                              <Input
                                placeholder={suggestions.length > 0 ? suggestions[0].label : `Değer ${varNum}`}
                                value={variables.body?.[idx] || ""}
                                onChange={(e) => {
                                  const newBody = [...(variables.body || [])];
                                  newBody[idx] = e.target.value;
                                  setVariables({ ...variables, body: newBody });
                                }}
                                className="mt-1 h-8 text-sm"
                              />
                            </div>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  </div>

                  {/* Live Preview */}
                  <div className="flex-1 min-h-0 flex flex-col">
                    <p className="text-sm font-medium mb-2 flex items-center gap-2 shrink-0">
                      <Eye className="h-4 w-4 text-blue-500" />
                      Önizleme
                    </p>
                    <div className="flex-1 bg-[#e5ddd5] rounded-lg p-3 overflow-auto min-h-0">
                      <div className="bg-white rounded-lg p-3 shadow-sm max-w-[90%] ml-auto">
                        <pre className="text-sm whitespace-pre-wrap font-sans text-gray-800">
                          {getLivePreview(selectedTemplate)}
                        </pre>
                        <p className="text-[10px] text-gray-400 text-right mt-1">
                          {new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
                  <div className="text-center">
                    <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Önizleme için şablon seçin</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <DialogFooter className="shrink-0 mt-4 pt-4 border-t">
          {step === 1 ? (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                İptal
              </Button>
              <Button
                onClick={handlePhoneNext}
                disabled={!phoneNumber}
                className="bg-green-600 hover:bg-green-700"
              >
                İleri
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              {!hidePhoneInput && (
                <Button variant="outline" onClick={() => setStep(1)}>
                  Geri
                </Button>
              )}
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
            </>
          )}
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
        `/api/admin/whatsapp/contacts?search=${encodeURIComponent(searchQuery)}`
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
