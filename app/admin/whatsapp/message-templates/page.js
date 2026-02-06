"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

// Icons
import {
  Search,
  Plus,
  RefreshCw,
  Loader2,
  FileText,
  Image,
  Video,
  MoreVertical,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  Send,
  Eye,
  Trash2,
  Phone,
  MessageSquare,
  Users,
} from "lucide-react";

// Custom WhatsApp Icon
const WhatsAppIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

// Template status config
const STATUS_CONFIG = {
  APPROVED: { label: "Onaylı", icon: CheckCircle2, className: "bg-green-50 text-green-700 border-green-200" },
  PENDING: { label: "Beklemede", icon: Clock, className: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  REJECTED: { label: "Reddedildi", icon: XCircle, className: "bg-red-50 text-red-700 border-red-200" },
  PAUSED: { label: "Duraklatıldı", icon: AlertTriangle, className: "bg-gray-50 text-gray-700 border-gray-200" },
};

// Category translations
const CATEGORY_LABELS = {
  MARKETING: "Pazarlama",
  UTILITY: "Yardımcı",
  AUTHENTICATION: "Doğrulama",
};

export default function WhatsAppTemplatesPage() {
  const { toast } = useToast();

  // State
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);

  // Send template state
  const [phoneInputMode, setPhoneInputMode] = useState("manual"); // manual | contact
  const [contacts, setContacts] = useState([]);
  const [contactSearch, setContactSearch] = useState("");
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [sendForm, setSendForm] = useState({
    phoneNumber: "",
    header: null,
    body: [],
  });
  const [sending, setSending] = useState(false);

  // Fetch templates
  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/whatsapp/templates");
      const data = await response.json();

      if (data.success) {
        setTemplates(data.data || []);
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: "Şablonlar yüklenemedi",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch contacts for picker
  const fetchContacts = async () => {
    if (contacts.length > 0) return;
    setLoadingContacts(true);
    try {
      const response = await fetch("/api/admin/whatsapp/contacts");
      const data = await response.json();
      if (data.success) {
        setContacts(
          (data.data || []).filter((c) => c.phone).map((c) => ({
            id: c.id,
            name: c.name || c.contactName || "İsimsiz",
            phone: c.phone,
            company: c.company || "",
          }))
        );
      }
    } catch (error) {
      console.error("Contacts fetch error:", error);
    } finally {
      setLoadingContacts(false);
    }
  };

  // Sync from Meta
  const syncFromMeta = async () => {
    setSyncing(true);
    try {
      const response = await fetch("/api/admin/whatsapp/templates?action=sync");
      const data = await response.json();

      if (data.success) {
        toast({
          title: "Senkronize Edildi",
          description: `${data.count || 0} şablon güncellendi`,
        });
        fetchTemplates();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: error.message || "Senkronizasyon başarısız",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  // Send template message
  const handleSendTemplate = async () => {
    if (!sendForm.phoneNumber) {
      toast({
        title: "Hata",
        description: "Telefon numarası gerekli",
        variant: "destructive",
      });
      return;
    }

    setSending(true);
    try {
      // Build components array
      const components = [];
      
      // Add header component if has header variable
      if (sendForm.header !== null && sendForm.header !== undefined) {
        components.push({
          type: "header",
          parameters: [{ type: "text", text: sendForm.header || "" }],
        });
      }
      
      // Add body component if has body variables
      if (sendForm.body?.length > 0) {
        components.push({
          type: "body",
          parameters: sendForm.body.map((v) => ({ type: "text", text: v || "" })),
        });
      }

      const response = await fetch("/api/admin/whatsapp/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: sendForm.phoneNumber.replace(/\D/g, ""),
          type: "template",
          template: {
            name: selectedTemplate.name,
            language: selectedTemplate.language,
            components: components.length > 0 ? components : undefined,
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Gönderildi",
          description: "Şablon mesajı gönderildi",
        });
        setSendDialogOpen(false);
        setSendForm({ phoneNumber: "", header: null, body: [] });
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: error.message || "Mesaj gönderilemedi",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  // Extract variables from template
  const extractVariables = (template) => {
    if (!template?.components) return { header: null, body: [] };
    
    const result = { header: null, body: [] };
    
    // Check header for variables
    const headerComponent = template.components.find((c) => c.type === "HEADER" && c.format === "TEXT");
    if (headerComponent?.text?.includes("{{1}}")) {
      result.header = "";
    }
    
    // Check body for variables
    const bodyComponent = template.components.find((c) => c.type === "BODY");
    if (bodyComponent?.text) {
      const matches = bodyComponent.text.match(/\{\{\d+\}\}/g) || [];
      result.body = matches.map(() => "");
    }
    
    return result;
  };

  // Filter templates
  const filteredTemplates = templates.filter((t) => {
    if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (categoryFilter !== "all" && t.category !== categoryFilter) return false;
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    return true;
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  // Open send dialog
  const openSendDialog = (template) => {
    setSelectedTemplate(template);
    setSendForm({
      phoneNumber: "",
      ...extractVariables(template),
    });
    setSendDialogOpen(true);
  };

  // Open preview dialog
  const openPreviewDialog = (template) => {
    setSelectedTemplate(template);
    setPreviewDialogOpen(true);
  };

  // Get template preview text
  const getPreviewText = (template) => {
    if (!template?.components) return "";
    const body = template.components.find((c) => c.type === "BODY");
    return body?.text || "";
  };

  // Get header info
  const getHeaderInfo = (template) => {
    if (!template?.components) return null;
    const header = template.components.find((c) => c.type === "HEADER");
    return header;
  };

  // Get footer info
  const getFooterInfo = (template) => {
    if (!template?.components) return null;
    const footer = template.components.find((c) => c.type === "FOOTER");
    return footer?.text;
  };

  // Get buttons info
  const getButtons = (template) => {
    if (!template?.components) return [];
    const buttons = template.components.find((c) => c.type === "BUTTONS");
    return buttons?.buttons || [];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50/50">
      {/* Header */}
      <div className="border-b bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Mesaj Şablonları</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {templates.length} şablon
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={syncFromMeta} disabled={syncing}>
              {syncing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              <span className="ml-2">Meta'dan Senkronize Et</span>
            </Button>
            <Button className="bg-green-600 hover:bg-green-700" asChild>
              <a
                href="https://business.facebook.com/wa/manage/message-templates/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Plus className="h-4 w-4 mr-2" />
                Yeni Şablon Oluştur
              </a>
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mt-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Şablon ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Kategoriler</SelectItem>
              <SelectItem value="MARKETING">Pazarlama</SelectItem>
              <SelectItem value="UTILITY">Yardımcı</SelectItem>
              <SelectItem value="AUTHENTICATION">Doğrulama</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Durum" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Durumlar</SelectItem>
              <SelectItem value="APPROVED">Onaylı</SelectItem>
              <SelectItem value="PENDING">Beklemede</SelectItem>
              <SelectItem value="REJECTED">Reddedildi</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="flex-1 overflow-auto p-6">
        {filteredTemplates.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">Şablon Bulunamadı</h3>
            <p className="text-sm text-gray-500 max-w-sm">
              {templates.length === 0
                ? "WhatsApp Business Manager'dan şablon oluşturun ve ardından buradan senkronize edin."
                : "Arama kriterlerinize uygun şablon bulunamadı."}
            </p>
            {templates.length === 0 && (
              <Button onClick={syncFromMeta} disabled={syncing} className="mt-4">
                <RefreshCw className={cn("h-4 w-4 mr-2", syncing && "animate-spin")} />
                Meta'dan Senkronize Et
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredTemplates.map((template) => {
              const status = STATUS_CONFIG[template.status] || STATUS_CONFIG.PENDING;
              const StatusIcon = status.icon;
              const header = getHeaderInfo(template);
              const bodyText = getPreviewText(template);
              const footer = getFooterInfo(template);
              const buttons = getButtons(template);

              return (
                <Card key={template.id} className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base font-medium truncate">
                          {template.name}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {template.language}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {CATEGORY_LABELS[template.category] || template.category}
                          </Badge>
                          <Badge variant="outline" className={cn("text-xs", status.className)}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {status.label}
                          </Badge>
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openPreviewDialog(template)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Önizle
                          </DropdownMenuItem>
                          {template.status === "APPROVED" && (
                            <DropdownMenuItem onClick={() => openSendDialog(template)}>
                              <Send className="h-4 w-4 mr-2" />
                              Gönder
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Template Preview */}
                    <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                      {header && (
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          {header.format === "IMAGE" && <Image className="h-3 w-3" />}
                          {header.format === "VIDEO" && <Video className="h-3 w-3" />}
                          {header.format === "TEXT" && header.text}
                          {header.format === "DOCUMENT" && <FileText className="h-3 w-3" />}
                          {header.format !== "TEXT" && `[${header.format}]`}
                        </div>
                      )}

                      <p className="text-sm text-gray-700 line-clamp-3">
                        {bodyText || "İçerik yok"}
                      </p>

                      {footer && (
                        <p className="text-xs text-gray-400">{footer}</p>
                      )}

                      {buttons.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-2 border-t border-gray-200">
                          {buttons.slice(0, 3).map((btn, i) => (
                            <Badge
                              key={i}
                              variant="outline"
                              className="text-xs bg-white"
                            >
                              {btn.type === "PHONE_NUMBER" && <Phone className="h-3 w-3 mr-1" />}
                              {btn.text}
                            </Badge>
                          ))}
                          {buttons.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{buttons.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => openPreviewDialog(template)}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Önizle
                      </Button>
                      {template.status === "APPROVED" && (
                        <Button
                          size="sm"
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          onClick={() => openSendDialog(template)}
                        >
                          <Send className="h-3 w-3 mr-1" />
                          Gönder
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Preview Dialog */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <WhatsAppIcon className="h-5 w-5 text-green-600" />
              Şablon Önizleme
            </DialogTitle>
            <DialogDescription>{selectedTemplate?.name}</DialogDescription>
          </DialogHeader>

          {selectedTemplate && (
            <div className="bg-[#e5ddd5] rounded-lg p-4">
              <div className="bg-white rounded-lg p-3 shadow-sm max-w-[280px] ml-auto">
                {getHeaderInfo(selectedTemplate)?.format === "IMAGE" && (
                  <div className="h-32 bg-gray-200 rounded-lg mb-2 flex items-center justify-center">
                    <Image className="h-8 w-8 text-gray-400" />
                  </div>
                )}
                {getHeaderInfo(selectedTemplate)?.format === "VIDEO" && (
                  <div className="h-32 bg-gray-200 rounded-lg mb-2 flex items-center justify-center">
                    <Video className="h-8 w-8 text-gray-400" />
                  </div>
                )}
                {getHeaderInfo(selectedTemplate)?.format === "TEXT" && (
                  <p className="font-bold text-sm mb-1">
                    {getHeaderInfo(selectedTemplate).text}
                  </p>
                )}

                <p className="text-sm text-gray-800 whitespace-pre-wrap">
                  {getPreviewText(selectedTemplate)}
                </p>

                {getFooterInfo(selectedTemplate) && (
                  <p className="text-xs text-gray-500 mt-2">
                    {getFooterInfo(selectedTemplate)}
                  </p>
                )}

                {getButtons(selectedTemplate).length > 0 && (
                  <div className="border-t border-gray-200 mt-2 pt-2 space-y-1">
                    {getButtons(selectedTemplate).map((btn, i) => (
                      <button
                        key={i}
                        className="w-full text-center text-sm text-blue-500 py-1 rounded hover:bg-gray-50"
                      >
                        {btn.text}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Send Dialog */}
      <Dialog open={sendDialogOpen} onOpenChange={(open) => {
        setSendDialogOpen(open);
        if (open) fetchContacts();
        if (!open) {
          setPhoneInputMode("manual");
          setContactSearch("");
        }
      }}>
        <DialogContent className="max-w-lg max-h-[85vh] flex flex-col">
          <DialogHeader className="shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-green-600" />
              Şablon Mesajı Gönder
            </DialogTitle>
            <DialogDescription>
              {selectedTemplate?.name} şablonunu gönderin
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4 overflow-y-auto min-h-0 flex-1">
            {/* Phone Input Tabs */}
            <Tabs value={phoneInputMode} onValueChange={(val) => {
              setPhoneInputMode(val);
              if (val === "contact" && contacts.length === 0) fetchContacts();
            }}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="manual" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Manuel Giriş
                </TabsTrigger>
                <TabsTrigger value="contact" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Rehberden Seç
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="manual" className="space-y-2 mt-4">
                <Label>Telefon Numarası</Label>
                <Input
                  placeholder="+905xxxxxxxxx"
                  value={sendForm.phoneNumber}
                  onChange={(e) => setSendForm({ ...sendForm, phoneNumber: e.target.value })}
                />
                <p className="text-xs text-gray-500">
                  Ülke kodu ile birlikte girin (örn: +905551234567)
                </p>
              </TabsContent>
              
              <TabsContent value="contact" className="space-y-3 mt-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Müşteri ara..."
                    value={contactSearch}
                    onChange={(e) => setContactSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="max-h-[250px] overflow-y-auto border rounded-lg divide-y">
                  {loadingContacts ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                    </div>
                  ) : contacts.filter(c => 
                    c.name.toLowerCase().includes(contactSearch.toLowerCase()) ||
                    c.phone.includes(contactSearch) ||
                    c.company.toLowerCase().includes(contactSearch.toLowerCase())
                  ).length === 0 ? (
                    <div className="text-center py-8 text-gray-500 text-sm">
                      Müşteri bulunamadı
                    </div>
                  ) : (
                    contacts
                      .filter(c => 
                        c.name.toLowerCase().includes(contactSearch.toLowerCase()) ||
                        c.phone.includes(contactSearch) ||
                        c.company.toLowerCase().includes(contactSearch.toLowerCase())
                      )
                      .map(contact => (
                        <button
                          key={contact.id}
                          type="button"
                          onClick={() => {
                            setSendForm({ ...sendForm, phoneNumber: contact.phone });
                            setPhoneInputMode("manual");
                          }}
                          className={cn(
                            "w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-3",
                            sendForm.phoneNumber === contact.phone && "bg-green-50"
                          )}
                        >
                          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                            <span className="text-green-700 text-sm font-medium">
                              {contact.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{contact.name}</p>
                            <p className="text-xs text-gray-500">{contact.phone}</p>
                          </div>
                          {contact.company && (
                            <span className="text-xs text-gray-400 truncate max-w-[100px]">
                              {contact.company}
                            </span>
                          )}
                        </button>
                      ))
                  )}
                </div>
                {sendForm.phoneNumber && (
                  <p className="text-sm text-green-600 flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4" />
                    Seçili: {sendForm.phoneNumber}
                  </p>
                )}
              </TabsContent>
            </Tabs>

            {/* Header Variable */}
            {sendForm.header !== null && sendForm.header !== undefined && (
              <div className="space-y-2">
                <Label>Başlık Değişkeni</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 w-16">Başlık</span>
                  <Input
                    placeholder="Başlık değeri"
                    value={sendForm.header}
                    onChange={(e) => setSendForm({ ...sendForm, header: e.target.value })}
                  />
                </div>
              </div>
            )}

            {/* Body Variables */}
            {sendForm.body?.length > 0 && (
              <div className="space-y-2">
                <Label>Mesaj Değişkenleri</Label>
                {sendForm.body.map((v, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 w-12">{`{{${i + 1}}}`}</span>
                    <Input
                      placeholder={`Değişken ${i + 1}`}
                      value={v}
                      onChange={(e) => {
                        const vars = [...sendForm.body];
                        vars[i] = e.target.value;
                        setSendForm({ ...sendForm, body: vars });
                      }}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Preview */}
            <div className="bg-gray-50 rounded-lg p-3">
              <Label className="text-xs text-gray-500 mb-2 block">Önizleme</Label>
              {/* Header Preview */}
              {getHeaderInfo(selectedTemplate)?.format === "TEXT" && (
                <p className="text-sm font-medium text-gray-800 mb-1">
                  {getHeaderInfo(selectedTemplate)?.text?.replace(
                    /\{\{1\}\}/g,
                    sendForm.header || "{{1}}"
                  )}
                </p>
              )}
              {/* Body Preview */}
              <p className="text-sm text-gray-800">
                {getPreviewText(selectedTemplate)?.replace(
                  /\{\{(\d+)\}\}/g,
                  (match, num) => {
                    const idx = parseInt(num) - 1;
                    return sendForm.body?.[idx] || match;
                  }
                )}
              </p>
            </div>
          </div>

          <DialogFooter className="shrink-0">
            <Button variant="outline" onClick={() => setSendDialogOpen(false)}>
              İptal
            </Button>
            <Button
              onClick={handleSendTemplate}
              disabled={sending || !sendForm.phoneNumber}
              className="bg-green-600 hover:bg-green-700"
            >
              {sending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Gönder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
