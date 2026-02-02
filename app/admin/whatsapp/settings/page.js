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
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

// Icons
import {
  Key,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Copy,
  ExternalLink,
  Loader2,
  RefreshCw,
  Trash2,
  Shield,
  Globe,
  Phone,
  Building2,
  Smartphone,
  Link2,
} from "lucide-react";

// Custom WhatsApp Icon
const WhatsAppIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

export default function WhatsAppSettingsPage() {
  const { toast } = useToast();

  // State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [settings, setSettings] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState(null);

  // Form state
  const [form, setForm] = useState({
    appId: "",
    appSecret: "",
    systemUserToken: "",
    wabaId: "",
    phoneNumberId: "",
    webhookVerifyToken: "",
  });

  // Generate webhook URL
  const webhookUrl = typeof window !== "undefined"
    ? `${window.location.origin}/api/admin/whatsapp/webhook`
    : "";

  // Fetch settings
  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/whatsapp/settings");
      const data = await response.json();

      if (data.success && data.data) {
        setSettings(data.data);
        setForm({
          appId: data.data.appId ?? "",
          appSecret: "",
          systemUserToken: "",
          wabaId: data.data.wabaId ?? "",
          phoneNumberId: data.data.phoneNumberId ?? "",
          webhookVerifyToken: data.data.webhookVerifyToken ?? generateVerifyToken(),
        });
        setConnectionStatus(data.data.connectionStatus);
      } else {
        setForm({
          ...form,
          webhookVerifyToken: generateVerifyToken(),
        });
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: "Ayarlar yüklenemedi",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Generate random verify token
  const generateVerifyToken = () => {
    return `mkn_wa_${Math.random().toString(36).substring(2, 15)}`;
  };

  // Test connection
  const testConnection = async () => {
    setTesting(true);
    try {
      const response = await fetch("/api/admin/whatsapp/settings?action=test");
      const data = await response.json();

      if (data.success) {
        setConnectionStatus(data.data);
        if (data.data.status === "connected") {
          toast({
            title: "Bağlantı Başarılı",
            description: `${data.data.verifiedName || "WhatsApp Business"} hesabına bağlı`,
          });
        } else {
          toast({
            title: "Bağlantı Durumu",
            description: data.data.error || "Bağlantı kurulamadı",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Bağlantı Başarısız",
          description: data.error || "API bağlantısı kurulamadı",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: "Bağlantı test edilemedi",
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  // Fetch account info
  const fetchAccountInfo = async () => {
    setFetching(true);
    try {
      const response = await fetch("/api/admin/whatsapp/settings?action=fetch-account");
      const data = await response.json();

      if (data.success) {
        toast({
          title: "Hesap Bilgileri Alındı",
          description: data.message,
        });
        fetchSettings();
      } else {
        toast({
          title: "Hata",
          description: data.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: "Hesap bilgileri alınamadı",
        variant: "destructive",
      });
    } finally {
      setFetching(false);
    }
  };

  // Save settings
  const handleSave = async () => {
    if (!form.appId.trim()) {
      toast({
        title: "Hata",
        description: "Meta App ID gereklidir",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/admin/whatsapp/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appId: form.appId,
          appSecret: form.appSecret || undefined,
          systemUserToken: form.systemUserToken || undefined,
          wabaId: form.wabaId || undefined,
          phoneNumberId: form.phoneNumberId || undefined,
          webhookVerifyToken: form.webhookVerifyToken,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Başarılı",
          description: "Ayarlar kaydedildi",
        });
        fetchSettings();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: error.message || "Ayarlar kaydedilemedi",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Disconnect
  const handleDisconnect = async () => {
    if (!confirm("WhatsApp bağlantısını kesmek istediğinizden emin misiniz?")) return;

    try {
      const response = await fetch("/api/admin/whatsapp/settings", {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Bağlantı Kesildi",
          description: "WhatsApp hesabı bağlantısı kaldırıldı",
        });
        setSettings(null);
        setConnectionStatus(null);
        setForm({
          appId: "",
          appSecret: "",
          systemUserToken: "",
          wabaId: "",
          phoneNumberId: "",
          webhookVerifyToken: generateVerifyToken(),
        });
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: "Bağlantı kesilemedi",
        variant: "destructive",
      });
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Kopyalandı",
      description: `${label} panoya kopyalandı`,
    });
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const isConnected = connectionStatus?.status === "connected";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto bg-gray-50/50">
      <div className="max-w-5xl mx-auto p-6 space-y-6 pb-12">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">WhatsApp Ayarları</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              WhatsApp Business Cloud API bağlantısı
            </p>
          </div>
          {settings && (
            <Button
              variant="outline"
              onClick={handleDisconnect}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Bağlantıyı Kes
            </Button>
          )}
        </div>

        {/* Connection Status */}
        <Card className="bg-white border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <WhatsAppIcon className="h-5 w-5 text-green-600" />
              Bağlantı Durumu
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isConnected ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                    <WhatsAppIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">
                        {connectionStatus.verifiedName || "WhatsApp Business"}
                      </span>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Bağlı
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                      {connectionStatus.displayPhoneNumber && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {connectionStatus.displayPhoneNumber}
                        </span>
                      )}
                      {connectionStatus.qualityRating && (
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs",
                            connectionStatus.qualityRating === "GREEN" && "bg-green-50 text-green-700",
                            connectionStatus.qualityRating === "YELLOW" && "bg-yellow-50 text-yellow-700",
                            connectionStatus.qualityRating === "RED" && "bg-red-50 text-red-700"
                          )}
                        >
                          Kalite: {connectionStatus.qualityRating}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <Button variant="outline" onClick={testConnection} disabled={testing}>
                  {testing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  <span className="ml-2">Test Et</span>
                </Button>
              </div>
            ) : (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Bağlı Değil</AlertTitle>
                <AlertDescription>
                  WhatsApp özelliklerini kullanmak için Cloud API bağlantısı yapmanız gerekiyor.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* API Credentials */}
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Key className="h-5 w-5 text-gray-600" />
                API Kimlik Bilgileri
              </CardTitle>
              <CardDescription>
                Meta Developer Console bilgileri
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Meta App ID</Label>
                <Input
                  placeholder="2101225823984832"
                  value={form.appId}
                  onChange={(e) => setForm({ ...form, appId: e.target.value })}
                  className="placeholder:text-gray-400/60"
                />
                <p className="text-xs text-gray-500">
                  Meta Developer Console → App Dashboard → Settings → Basic
                </p>
              </div>

              <div className="space-y-2">
                <Label>
                  Meta App Secret
                  {settings?.appSecretMasked && (
                    <span className="text-xs text-gray-500 ml-2">(kayıtlı: {settings.appSecretMasked})</span>
                  )}
                </Label>
                <Input
                  type="password"
                  placeholder="Yeni değer girmek için doldurun"
                  value={form.appSecret}
                  onChange={(e) => setForm({ ...form, appSecret: e.target.value })}
                  className="placeholder:text-gray-400/60"
                />
              </div>

              <div className="space-y-2">
                <Label>
                  System User Access Token
                  {settings?.systemUserTokenMasked && (
                    <span className="text-xs text-gray-500 ml-2">(kayıtlı: {settings.systemUserTokenMasked})</span>
                  )}
                </Label>
                <Input
                  type="password"
                  placeholder="EAA ile başlayan kalıcı token"
                  value={form.systemUserToken}
                  onChange={(e) => setForm({ ...form, systemUserToken: e.target.value })}
                  className="placeholder:text-gray-400/60"
                />
                <p className="text-xs text-gray-500">
                  Business Settings → System Users → Generate Token (whatsapp_business_messaging, whatsapp_business_management izinleri ile)
                </p>
              </div>

              <Separator className="my-4" />

              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={saving} className="flex-1 bg-green-600 hover:bg-green-700">
                  {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Kaydet
                </Button>
                <Button
                  variant="outline"
                  onClick={fetchAccountInfo}
                  disabled={fetching || !settings?.systemUserTokenMasked}
                >
                  {fetching ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  <span className="ml-2">Hesap Bilgilerini Al</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* WhatsApp Account Info */}
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-green-600" />
                WhatsApp Hesap Bilgileri
              </CardTitle>
              <CardDescription>
                WhatsApp Business Account (WABA) bilgileri
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>WhatsApp Business Account ID (WABA ID)</Label>
                <Input
                  placeholder="123456789012345"
                  value={form.wabaId}
                  onChange={(e) => setForm({ ...form, wabaId: e.target.value })}
                  className="placeholder:text-gray-400/60"
                />
                <p className="text-xs text-gray-500">
                  WhatsApp Manager → Account → WABA ID
                </p>
              </div>

              <div className="space-y-2">
                <Label>Phone Number ID</Label>
                <Input
                  placeholder="123456789012345"
                  value={form.phoneNumberId}
                  onChange={(e) => setForm({ ...form, phoneNumberId: e.target.value })}
                  className="placeholder:text-gray-400/60"
                />
                <p className="text-xs text-gray-500">
                  WhatsApp Manager → Phone Numbers → Phone Number ID
                </p>
              </div>

              {settings?.displayPhoneNumber && (
                <Alert className="bg-green-50 border-green-200">
                  <Phone className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    <strong>Kayıtlı Numara:</strong> {settings.displayPhoneNumber}
                    {settings.verifiedName && (
                      <span className="ml-2">({settings.verifiedName})</span>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              <Separator className="my-4" />

              <Button onClick={handleSave} disabled={saving} className="w-full bg-green-600 hover:bg-green-700">
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Hesap Bilgilerini Kaydet
              </Button>
            </CardContent>
          </Card>

          {/* Webhook Configuration */}
          <Card className="bg-white border-0 shadow-sm lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Globe className="h-5 w-5 text-gray-600" />
                Webhook Ayarları
              </CardTitle>
              <CardDescription>
                Meta App Dashboard → WhatsApp → Configuration → Webhook
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Callback URL</Label>
                  <div className="flex gap-2">
                    <Input value={webhookUrl} readOnly className="font-mono text-sm" />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(webhookUrl, "Webhook URL")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Verify Token</Label>
                  <div className="flex gap-2">
                    <Input
                      value={form.webhookVerifyToken}
                      onChange={(e) => setForm({ ...form, webhookVerifyToken: e.target.value })}
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(form.webhookVerifyToken, "Verify Token")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label className="text-sm font-medium">Webhook Subscription Fields</Label>
                <p className="text-xs text-gray-500 mb-2">
                  Aşağıdaki alanları Meta App Dashboard'da "Webhooks" bölümünde seçin:
                </p>
                <div className="flex flex-wrap gap-2">
                  {["messages", "message_template_status_update"].map((field) => (
                    <Badge key={field} variant="outline" className="font-mono text-xs">
                      {field}
                    </Badge>
                  ))}
                </div>
              </div>

              <Alert className="bg-blue-50 border-blue-200">
                <Link2 className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800 text-sm">
                  <strong>Kurulum Adımları:</strong>
                  <ol className="list-decimal ml-4 mt-1 space-y-1">
                    <li>Meta Developer Console → App → WhatsApp → Configuration'a gidin</li>
                    <li>Webhook bölümünde "Edit" butonuna tıklayın</li>
                    <li>Callback URL ve Verify Token'ı yukarıdaki değerlerle doldurun</li>
                    <li>"Verify and Save" butonuna tıklayın</li>
                    <li>Webhook Fields'da "messages" seçin ve Subscribe olun</li>
                  </ol>
                  <a
                    href="https://developers.facebook.com/apps/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-blue-600 hover:underline mt-2"
                  >
                    Meta Developer Console <ExternalLink className="h-3 w-3" />
                  </a>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>

        {/* Setup Guide */}
        <Card className="bg-white border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-5 w-5 text-gray-600" />
              Kurulum Rehberi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-semibold text-sm mb-2">
                  1
                </div>
                <h4 className="font-medium text-sm mb-1">Meta App Oluştur</h4>
                <p className="text-xs text-gray-500">
                  "Connect with customers through WhatsApp" use case'i ile yeni app oluşturun
                </p>
              </div>
              <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-semibold text-sm mb-2">
                  2
                </div>
                <h4 className="font-medium text-sm mb-1">System User Token</h4>
                <p className="text-xs text-gray-500">
                  Business Settings'te System User oluşturup kalıcı token alın
                </p>
              </div>
              <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-semibold text-sm mb-2">
                  3
                </div>
                <h4 className="font-medium text-sm mb-1">Webhook Ayarla</h4>
                <p className="text-xs text-gray-500">
                  Callback URL ve Verify Token'ı Meta App Dashboard'a ekleyin
                </p>
              </div>
              <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-semibold text-sm mb-2">
                  4
                </div>
                <h4 className="font-medium text-sm mb-1">Test Et</h4>
                <p className="text-xs text-gray-500">
                  Bağlantıyı test edin ve mesaj göndermeye başlayın
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
