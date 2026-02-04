"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "../../../../../hooks/use-admin-auth";
import { useToast } from "../../../../../hooks/use-toast";
import { createConversation } from "../../../../../lib/services/crm-v2/conversation-service";
import { getAllCustomers } from "../../../../../lib/services/crm-v2/customer-service";
import {
  CHANNEL,
  PRIORITY,
  getChannelLabel,
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
  Inbox,
  Save,
  Building2,
  User,
  Mail,
  Phone,
  MessageSquare,
  FileText,
  Loader2,
  Search,
  X,
} from "lucide-react";

export default function NewConversationPage() {
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
    // Channel
    channel: CHANNEL.MANUAL,
    // Subject
    subject: "",
    // Contact info
    senderName: "",
    senderEmail: "",
    senderPhone: "",
    senderCompany: "",
    // Message content
    messageContent: "",
    // Priority
    priority: PRIORITY.NORMAL,
    // Customer
    customerId: null,
    // Tags
    tags: "",
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
      senderName: customer.name || "",
      senderEmail: customer.email || "",
      senderPhone: customer.phone || "",
      senderCompany: customer.company?.name || "",
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
    }));
  };

  // Handle form change
  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Channel options for manual entry
  const channelOptions = [
    { value: CHANNEL.MANUAL, label: "Manuel Kayıt", icon: MessageSquare },
    { value: CHANNEL.PHONE, label: "Telefon Görüşmesi", icon: Phone },
    { value: CHANNEL.EMAIL, label: "E-posta", icon: Mail },
  ];

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.senderName.trim() && !formData.senderEmail.trim() && !formData.senderPhone.trim()) {
      toast({ 
        title: "Hata", 
        description: "En az bir iletişim bilgisi giriniz (isim, email veya telefon).", 
        variant: "destructive" 
      });
      return;
    }

    if (!formData.subject.trim()) {
      toast({ 
        title: "Hata", 
        description: "Konu başlığı zorunludur.", 
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

      const conversationData = {
        // Channel
        channel: formData.channel,
        
        // Subject
        subject: formData.subject.trim(),
        
        // Sender info
        senderName: formData.senderName.trim(),
        email: formData.senderEmail.trim(),
        phone: formData.senderPhone.trim(),
        company: formData.senderCompany.trim(),
        
        // First message content
        firstMessage: formData.messageContent.trim(),
        
        // Priority
        priority: formData.priority,
        
        // Customer
        customerId: formData.customerId,
        
        // Tags
        tags: tags,
        
        // Creator
        createdBy: user?.uid,
        
        // Additional metadata
        channelMetadata: {
          source: "manual_entry",
          createdByAdmin: true,
        },
      };

      const result = await createConversation(conversationData);
      
      if (result?.id && !result.skipped) {
        toast({ 
          title: "Başarılı", 
          description: "Konuşma başarıyla oluşturuldu." 
        });
        router.push(`/admin/crm-v2/inbox/${result.id}`);
      } else if (result?.skipped) {
        toast({ 
          title: "Uyarı", 
          description: "Bu konuşma zaten mevcut.", 
          variant: "warning" 
        });
        router.push(`/admin/crm-v2/inbox/${result.id}`);
      } else {
        throw new Error("Konuşma oluşturulamadı");
      }
    } catch (error) {
      console.error("Error creating conversation:", error);
      toast({ 
        title: "Hata", 
        description: "Konuşma oluşturulamadı.", 
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
          <h1 className="text-2xl font-semibold text-slate-900">Yeni Konuşma</h1>
          <p className="text-sm text-slate-500">Manuel olarak yeni bir konuşma kaydı oluşturun</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Kanal ve Konu */}
          <Card className="bg-white border-slate-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Inbox className="h-5 w-5 text-slate-600" />
                Konuşma Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Channel & Priority */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Kanal</Label>
                  <Select
                    value={formData.channel}
                    onValueChange={(value) => handleChange("channel", value)}
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {channelOptions.map((channel) => (
                        <SelectItem key={channel.value} value={channel.value}>
                          <div className="flex items-center gap-2">
                            <channel.icon className="h-4 w-4" />
                            {channel.label}
                          </div>
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

              {/* Subject */}
              <div className="space-y-2">
                <Label htmlFor="subject">Konu *</Label>
                <Input
                  id="subject"
                  placeholder="Konuşma konusu..."
                  value={formData.subject}
                  onChange={(e) => handleChange("subject", e.target.value)}
                  className="bg-white"
                />
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label htmlFor="tags">Etiketler</Label>
                <Input
                  id="tags"
                  placeholder="Etiketleri virgülle ayırın (örn: acil, teklif, kozmetik)"
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

          {/* İletişim Bilgileri */}
          <Card className="bg-white border-slate-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-slate-600" />
                Gönderen Bilgileri
              </CardTitle>
              <CardDescription>
                Mevcut müşteriyi seçin veya manuel bilgi girin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Customer Search / Selection */}
              <div className="space-y-2">
                <Label>Müşteri Seç (Opsiyonel)</Label>
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
                  {selectedCustomer ? "Gönderen bilgileri (düzenlenebilir):" : "Gönderen bilgilerini girin:"}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="senderName" className="text-slate-600 flex items-center gap-2">
                      <User className="h-3.5 w-3.5" />
                      İsim
                    </Label>
                    <Input
                      id="senderName"
                      placeholder="Ad Soyad"
                      value={formData.senderName}
                      onChange={(e) => handleChange("senderName", e.target.value)}
                      className="bg-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="senderCompany" className="text-slate-600 flex items-center gap-2">
                      <Building2 className="h-3.5 w-3.5" />
                      Firma
                    </Label>
                    <Input
                      id="senderCompany"
                      placeholder="Firma Adı"
                      value={formData.senderCompany}
                      onChange={(e) => handleChange("senderCompany", e.target.value)}
                      className="bg-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="senderEmail" className="text-slate-600 flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5" />
                      E-posta
                    </Label>
                    <Input
                      id="senderEmail"
                      type="email"
                      placeholder="email@example.com"
                      value={formData.senderEmail}
                      onChange={(e) => handleChange("senderEmail", e.target.value)}
                      className="bg-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="senderPhone" className="text-slate-600 flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5" />
                      Telefon
                    </Label>
                    <Input
                      id="senderPhone"
                      placeholder="+90 5XX XXX XX XX"
                      value={formData.senderPhone}
                      onChange={(e) => handleChange("senderPhone", e.target.value)}
                      className="bg-white"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mesaj İçeriği */}
          <Card className="bg-white border-slate-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-slate-600" />
                Mesaj İçeriği
              </CardTitle>
              <CardDescription>
                Konuşmanın ilk mesajı veya notları
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Mesaj içeriği, görüşme notları veya talep detayları..."
                value={formData.messageContent}
                onChange={(e) => handleChange("messageContent", e.target.value)}
                rows={6}
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
                  Konuşma Oluştur
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
