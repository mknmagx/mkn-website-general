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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Icons
import {
  Instagram,
  Facebook,
  Key,
  Settings2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Copy,
  ExternalLink,
  Loader2,
  RefreshCw,
  Trash2,
  Link2,
  Shield,
  Globe,
  Bug,
  MessageSquare,
  Database,
  Send,
} from "lucide-react";

// Custom Meta Icon Component
const MetaIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2C6.477 2 2 6.145 2 11.243c0 2.936 1.444 5.548 3.7 7.254V22l3.405-1.87c.91.252 1.873.388 2.895.388 5.523 0 10-4.145 10-9.243S17.523 2 12 2zm1.054 12.443l-2.55-2.723-4.974 2.723 5.47-5.805 2.612 2.723 4.912-2.723-5.47 5.805z"/>
  </svg>
);

export default function SettingsPage() {
  const { toast } = useToast();

  // State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [settings, setSettings] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState(null);
  
  // Debug state
  const [debugResult, setDebugResult] = useState(null);
  const [debugLoading, setDebugLoading] = useState(false);

  // Form state
  const [form, setForm] = useState({
    appId: "",
    appSecret: "",
    systemUserToken: "",
    pageAccessToken: "",
    webhookVerifyToken: "",
    pageId: "",
    pageName: "",
    instagramAccountId: "",
    instagramUsername: "",
  });

  // Generate webhook URL
  const webhookUrl = typeof window !== "undefined" 
    ? `${window.location.origin}/api/admin/instagram-dm/webhook`
    : "";

  // Fetch settings
  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/instagram-dm/settings");
      const data = await response.json();

      if (data.success && data.data) {
        setSettings(data.data);
        setForm({
          appId: data.data.appId ?? "",
          appSecret: "",
          systemUserToken: "",
          pageAccessToken: "",
          webhookVerifyToken: data.data.webhookVerifyToken ?? generateVerifyToken(),
          pageId: data.data.pageId ?? "",
          pageName: data.data.pageName ?? "",
          instagramAccountId: data.data.instagramAccountId ?? "",
          instagramUsername: data.data.instagramUsername ?? "",
        });
        setConnectionStatus(data.data.connectionStatus);
      } else {
        // No settings yet, generate verify token
        setForm({
          appId: "",
          appSecret: "",
          systemUserToken: "",
          pageAccessToken: "",
          webhookVerifyToken: generateVerifyToken(),
          pageId: "",
          pageName: "",
          instagramAccountId: "",
          instagramUsername: "",
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
    return `mkn_ig_${Math.random().toString(36).substring(2, 15)}`;
  };

  // Test connection
  const testConnection = async () => {
    setTesting(true);
    try {
      const response = await fetch("/api/admin/instagram-dm/settings?action=test");
      const data = await response.json();

      if (data.success) {
        setConnectionStatus(data.data);
        toast({
          title: "Bağlantı Başarılı",
          description: `Instagram hesabı: ${data.data.instagramAccountName || "Bağlı"}`,
        });
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

  // Debug Firestore
  const debugFirestore = async () => {
    setDebugLoading(true);
    setDebugResult(null);
    try {
      const response = await fetch("/api/admin/instagram-dm/settings?action=debug");
      const data = await response.json();
      setDebugResult({ type: 'firestore', data });
      toast({
        title: "Firestore Debug",
        description: "Sonuçlar aşağıda gösterildi",
      });
    } catch (error) {
      setDebugResult({ type: 'error', error: error.message });
    } finally {
      setDebugLoading(false);
    }
  };

  // Debug Token - Token'ı doğrula
  const debugToken = async () => {
    setDebugLoading(true);
    setDebugResult(null);
    try {
      const response = await fetch("/api/admin/instagram-dm/settings?action=debug-token");
      const data = await response.json();
      setDebugResult({ type: 'token', data });
      toast({
        title: data.success ? "Token Geçerli" : "Token Hatası",
        description: data.success ? `Token tipi: ${data.data?.type || 'Bilinmiyor'}` : data.error,
        variant: data.success ? 'default' : 'destructive',
      });
    } catch (error) {
      setDebugResult({ type: 'error', error: error.message });
    } finally {
      setDebugLoading(false);
    }
  };

  // Debug Conversations
  const debugConversations = async () => {
    setDebugLoading(true);
    setDebugResult(null);
    try {
      const response = await fetch("/api/admin/instagram-dm/conversations");
      const data = await response.json();
      setDebugResult({ type: 'conversations', data });
      toast({
        title: "Konuşmalar Debug",
        description: `${data.data?.length || 0} konuşma bulundu`,
      });
    } catch (error) {
      setDebugResult({ type: 'error', error: error.message });
    } finally {
      setDebugLoading(false);
    }
  };

  // Test Webhook Manually
  const testWebhookManual = async (platform = 'instagram') => {
    setDebugLoading(true);
    setDebugResult(null);
    try {
      // Simüle edilmiş webhook verisi - platform parametresine göre
      const testPayload = {
        object: platform === 'facebook' ? 'page' : 'instagram',
        entry: [{
          id: "test_page_id",
          time: Date.now(),
          messaging: [{
            sender: { id: "test_user_123" },
            recipient: { id: "test_page_id" },
            timestamp: Date.now(),
            message: {
              mid: `test_mid_${Date.now()}`,
              text: `🧪 Test mesajı (${platform}) - ` + new Date().toLocaleTimeString('tr-TR'),
            }
          }]
        }]
      };

      const response = await fetch("/api/admin/instagram-dm/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testPayload),
      });
      const data = await response.json();
      setDebugResult({ type: 'webhook', data, payload: testPayload, platform });
      toast({
        title: "Webhook Test",
        description: data.status === 'ok' ? `${platform} webhook başarıyla işlendi` : "Webhook hatası",
        variant: data.status === 'ok' ? 'default' : 'destructive',
      });
    } catch (error) {
      setDebugResult({ type: 'error', error: error.message });
    } finally {
      setDebugLoading(false);
    }
  };

  // Full API Test - Tüm endpoint'leri test et
  const fullApiTest = async () => {
    setDebugLoading(true);
    setDebugResult(null);
    try {
      const response = await fetch("/api/admin/instagram-dm/settings?action=full-api-test");
      const data = await response.json();
      setDebugResult({ type: 'full-api-test', data });
      if (data.success) {
        toast({
          title: data.data.allPassed ? "✅ Tüm Testler Başarılı!" : "⚠️ Bazı Testler Başarısız",
          description: `${data.data.passedCount}/${data.data.totalCount} test geçti`,
          variant: data.data.allPassed ? 'default' : 'destructive',
        });
      } else {
        toast({
          title: "Hata",
          description: data.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      setDebugResult({ type: 'error', error: error.message });
    } finally {
      setDebugLoading(false);
    }
  };

  // Check Page Subscription
  const checkPageSubscription = async () => {
    setDebugLoading(true);
    setDebugResult(null);
    try {
      const response = await fetch("/api/admin/instagram-dm/settings?action=check-page-subscription");
      const data = await response.json();
      setDebugResult({ type: 'page-subscription', data });
      if (data.success) {
        toast({
          title: data.data.subscribed ? "Page Subscribe Edilmiş" : "Page Subscribe Edilmemiş",
          description: data.data.subscribed 
            ? `${data.data.apps?.length || 0} uygulama bağlı` 
            : "Webhook'ların çalışması için Page subscribe edilmeli!",
          variant: data.data.subscribed ? 'default' : 'destructive',
        });
      } else {
        toast({
          title: "Hata",
          description: data.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      setDebugResult({ type: 'error', error: error.message });
    } finally {
      setDebugLoading(false);
    }
  };

  // Subscribe Page to Webhooks
  const subscribePage = async () => {
    setDebugLoading(true);
    setDebugResult(null);
    try {
      const response = await fetch("/api/admin/instagram-dm/settings?action=subscribe-page");
      const data = await response.json();
      setDebugResult({ type: 'subscribe-page', data });
      toast({
        title: data.success ? "Başarılı!" : "Hata",
        description: data.success 
          ? "Page webhook'lara subscribe edildi. Artık mesajlar otomatik gelecek." 
          : data.error,
        variant: data.success ? 'default' : 'destructive',
      });
    } catch (error) {
      setDebugResult({ type: 'error', error: error.message });
    } finally {
      setDebugLoading(false);
    }
  };

  // Sync old messages from Instagram API
  const syncMessages = async () => {
    setDebugLoading(true);
    setDebugResult(null);
    try {
      const response = await fetch("/api/admin/instagram-dm/sync", {
        method: "POST",
      });
      const data = await response.json();
      setDebugResult({ type: 'sync', data });
      toast({
        title: data.success ? "Senkronizasyon Başarılı" : "Senkronizasyon Hatası",
        description: data.message || data.error,
        variant: data.success ? 'default' : 'destructive',
      });
    } catch (error) {
      setDebugResult({ type: 'error', error: error.message });
    } finally {
      setDebugLoading(false);
    }
  };

  // Clear messages data from Firestore
  const clearMessagesData = async () => {
    if (!confirm("Tüm mesajlar ve konuşmalar silinecek. Emin misiniz?")) return;
    
    setDebugLoading(true);
    setDebugResult(null);
    try {
      const response = await fetch("/api/admin/instagram-dm/sync?action=clear", {
        method: "DELETE",
      });
      const data = await response.json();
      setDebugResult({ type: 'clear', data });
      toast({
        title: data.success ? "Temizleme Başarılı" : "Temizleme Hatası",
        description: data.message || data.error,
        variant: data.success ? 'default' : 'destructive',
      });
    } catch (error) {
      setDebugResult({ type: 'error', error: error.message });
    } finally {
      setDebugLoading(false);
    }
  };

  // Fetch account info from access token
  const fetchAccountInfo = async () => {
    setDebugLoading(true);
    setDebugResult(null);
    try {
      const response = await fetch("/api/admin/instagram-dm/settings?action=fetch-account");
      const data = await response.json();
      setDebugResult({ type: 'account', data });
      if (data.success) {
        toast({
          title: "Hesap Bilgileri Alındı",
          description: `Page: ${data.data.pageName || 'N/A'}, IG: @${data.data.instagramUsername || 'N/A'}`,
        });
        // Sayfayı yenile
        fetchSettings();
      } else {
        toast({
          title: "Hata",
          description: data.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      setDebugResult({ type: 'error', error: error.message });
    } finally {
      setDebugLoading(false);
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
      const response = await fetch("/api/admin/instagram-dm/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appId: form.appId,
          appSecret: form.appSecret || undefined,
          systemUserToken: form.systemUserToken || undefined,
          pageAccessToken: form.pageAccessToken || undefined,
          webhookVerifyToken: form.webhookVerifyToken,
          pageId: form.pageId || undefined,
          pageName: form.pageName || undefined,
          instagramAccountId: form.instagramAccountId || undefined,
          instagramUsername: form.instagramUsername || undefined,
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
    if (!confirm("Instagram bağlantısını kesmek istediğinizden emin misiniz?")) return;

    try {
      const response = await fetch("/api/admin/instagram-dm/settings", {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Bağlantı Kesildi",
          description: "Instagram hesabı bağlantısı kaldırıldı",
        });
        setSettings(null);
        setConnectionStatus(null);
        setForm({
          appId: "",
          appSecret: "",
          systemUserToken: "",
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

  const isConnected = connectionStatus?.status === 'connected';

  return (
    <div className="h-full overflow-auto bg-gray-50/50">
      <div className="max-w-6xl mx-auto p-6 space-y-6 pb-12">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Meta Messenger Ayarları</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Facebook & Instagram API bağlantısı
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
            <MetaIcon className="h-5 w-5 text-blue-600" />
            Bağlantı Durumu
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-gray-200 animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 w-40 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          ) : isConnected ? (
            <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <MetaIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    {/* Facebook Page */}
                    {connectionStatus.pageName && (
                      <div className="flex items-center gap-1.5">
                        <Facebook className="h-4 w-4 text-blue-600" />
                        <span className="font-medium text-gray-900">{connectionStatus.pageName}</span>
                      </div>
                    )}
                    {/* Instagram Account */}
                    {connectionStatus.instagramUsername && (
                      <div className="flex items-center gap-1.5">
                        <Instagram className="h-4 w-4 text-pink-600" />
                        <span className="font-medium text-gray-900">@{connectionStatus.instagramUsername}</span>
                      </div>
                    )}
                    {!connectionStatus.pageName && !connectionStatus.instagramUsername && (
                      <span className="font-medium text-gray-900">Meta Hesabı</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Bağlı
                    </Badge>
                    {settings?.activeTokenType && (
                      <Badge variant="outline" className={settings.activeTokenType === 'System User Token' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-amber-50 text-amber-700 border-amber-200'}>
                        <Key className="h-3 w-3 mr-1" />
                        {settings.activeTokenType}
                      </Badge>
                    )}
                    {settings?.hasPageAccessToken ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Page Token ✓
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Page Token Yok
                      </Badge>
                    )}
                    {connectionStatus.instagramAccountId && (
                      <span className="text-xs text-gray-500">
                        IG ID: {connectionStatus.instagramAccountId}
                      </span>
                    )}
                    {connectionStatus.pageId && (
                      <span className="text-xs text-gray-500">
                        Page ID: {connectionStatus.pageId}
                      </span>
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
            
            {/* Token Durumu Özeti */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg border">
              <p className="text-xs font-medium text-gray-700 mb-2">🔑 Token Durumu:</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className={cn("p-2 rounded", settings?.systemUserTokenMasked ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-500")}>
                  <span className="font-medium">System User Token:</span><br/>
                  {settings?.systemUserTokenMasked || "❌ Girilmedi"}
                </div>
                <div className={cn("p-2 rounded", settings?.pageAccessTokenMasked ? "bg-blue-100 text-blue-800" : "bg-red-100 text-red-700")}>
                  <span className="font-medium">Page Access Token:</span><br/>
                  {settings?.pageAccessTokenMasked || "❌ Girilmedi"}
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2 italic">
                💡 IG Conversations için <strong>Page Access Token</strong> gereklidir. System User Token kaydedildiğinde otomatik alınır.
              </p>
            </div>
          </>
          ) : (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Bağlı Değil</AlertTitle>
              <AlertDescription>
                Meta Messenger özelliklerini kullanmak için Facebook & Instagram API bağlantısı yapmanız gerekiyor.
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
              />
              <p className="text-xs text-gray-500">
                Meta Developer Console → Dashboard → Settings → Basic → App ID
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
              />
              <p className="text-xs text-gray-500">
                Meta Developer Console → Dashboard → Settings → Basic → App Secret
              </p>
            </div>

            <div className="space-y-2">
              <Label>
                System User Token
                {settings?.systemUserTokenMasked && (
                  <span className="text-xs text-gray-500 ml-2">(kayıtlı: {settings.systemUserTokenMasked})</span>
                )}
              </Label>
              <Input
                type="password"
                placeholder="EAA ile başlayan System User Token"
                value={form.systemUserToken}
                onChange={(e) => setForm({ ...form, systemUserToken: e.target.value })}
              />
              <p className="text-xs text-gray-500">
                Business Settings → System Users → Generate Token ile alınır. /me/accounts gibi endpoint'ler için kullanılır.
              </p>
            </div>

            <div className="space-y-2">
              <Label>
                Page Access Token
                {settings?.pageAccessTokenMasked && (
                  <span className="text-xs text-gray-500 ml-2">(kayıtlı: {settings.pageAccessTokenMasked})</span>
                )}
              </Label>
              <Input
                type="password"
                placeholder="EAA ile başlayan Page Access Token"
                value={form.pageAccessToken}
                onChange={(e) => setForm({ ...form, pageAccessToken: e.target.value })}
              />
              <Alert className="mt-2 bg-blue-50 border-blue-200">
                <Key className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-xs text-blue-800">
                  <strong>Page Access Token:</strong> IG Conversations ve Page Subscription için gereklidir.
                  <br />
                  Graph API Explorer → Get Token → Get Page Access Token ile alınır.
                  <br />
                  <a 
                    href="https://developers.facebook.com/tools/explorer/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline inline-flex items-center gap-1 mt-1"
                  >
                    Graph API Explorer <ExternalLink className="h-3 w-3" />
                  </a>
                </AlertDescription>
              </Alert>
            </div>

            <Separator className="my-4" />

            <Button onClick={handleSave} disabled={saving} className="w-full bg-gray-900 hover:bg-gray-800">
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Kaydet
            </Button>
          </CardContent>
        </Card>

        {/* Instagram Account Info */}
        <Card className="bg-white border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Instagram className="h-5 w-5 text-purple-600" />
              Instagram Hesap Bilgileri
            </CardTitle>
            <CardDescription>
              Bağlanacak Instagram Business hesabı
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Facebook Page ID</Label>
              <Input
                placeholder="123456789012345"
                value={form.pageId}
                onChange={(e) => setForm({ ...form, pageId: e.target.value })}
              />
              <p className="text-xs text-gray-500">
                Facebook sayfanızın ID'si (Sayfa Ayarları → Hakkında → Page ID)
              </p>
            </div>

            <div className="space-y-2">
              <Label>Facebook Page Adı</Label>
              <Input
                placeholder="MKN Group"
                value={form.pageName}
                onChange={(e) => setForm({ ...form, pageName: e.target.value })}
              />
            </div>

            <Separator className="my-2" />

            <div className="space-y-2">
              <Label>Instagram Business Account ID</Label>
              <Input
                placeholder="17841477392685490"
                value={form.instagramAccountId}
                onChange={(e) => setForm({ ...form, instagramAccountId: e.target.value })}
              />
              <p className="text-xs text-gray-500">
                Graph API Explorer'da: /{'{page_id}'}?fields=instagram_business_account
              </p>
            </div>

            <div className="space-y-2">
              <Label>Instagram Kullanıcı Adı</Label>
              <Input
                placeholder="mkngroupofficial"
                value={form.instagramUsername}
                onChange={(e) => setForm({ ...form, instagramUsername: e.target.value })}
              />
            </div>

            <Separator className="my-4" />

            <Button onClick={handleSave} disabled={saving} className="w-full bg-purple-600 hover:bg-purple-700">
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Hesap Bilgilerini Kaydet
            </Button>
          </CardContent>
        </Card>

        {/* Webhook Configuration */}
        <Card className="bg-white border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Globe className="h-5 w-5 text-gray-600" />
              Webhook Ayarları
            </CardTitle>
            <CardDescription>
              Facebook App Dashboard için webhook bilgileri
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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

            <Separator className="my-4" />

            <div className="space-y-2">
              <Label className="text-sm font-medium">Webhook Fields</Label>
              <p className="text-xs text-gray-500 mb-2">
                Aşağıdaki alanları Facebook App Dashboard'da etkinleştirin:
              </p>
              <div className="flex flex-wrap gap-2">
                {["messages", "messaging_postbacks", "messaging_seen", "message_echoes"].map((field) => (
                  <Badge key={field} variant="outline" className="font-mono text-xs">
                    {field}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Permissions Info */}
        <Card className="lg:col-span-2 bg-white border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-5 w-5 text-gray-600" />
              Gerekli İzinler
            </CardTitle>
            <CardDescription>
              Facebook App için gerekli izinler
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { name: "instagram_basic", desc: "Temel profil bilgileri" },
                { name: "instagram_manage_messages", desc: "Mesaj okuma ve gönderme" },
                { name: "pages_messaging", desc: "Sayfa mesajlaşması" },
                { name: "pages_show_list", desc: "Sayfa listesi" },
                { name: "pages_manage_metadata", desc: "Sayfa meta verileri" },
                { name: "business_management", desc: "İşletme yönetimi" },
              ].map((perm) => (
                <div
                  key={perm.name}
                  className="flex items-start gap-2 p-3 rounded-lg bg-gray-50"
                >
                  <CheckCircle2 className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-mono text-sm">{perm.name}</p>
                    <p className="text-xs text-gray-500">{perm.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Help Links */}
        <Card className="lg:col-span-2 bg-white border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Link2 className="h-5 w-5 text-gray-600" />
              Faydalı Bağlantılar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {[
                { label: "Facebook Developer Console", url: "https://developers.facebook.com" },
                { label: "Graph API Explorer", url: "https://developers.facebook.com/tools/explorer" },
                { label: "Instagram API Docs", url: "https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login" },
                { label: "Webhook Setup", url: "https://developers.facebook.com/docs/graph-api/webhooks/getting-started" },
              ].map((link) => (
                <Button
                  key={link.label}
                  variant="outline"
                  size="sm"
                  asChild
                >
                  <a href={link.url} target="_blank" rel="noopener noreferrer">
                    {link.label}
                    <ExternalLink className="h-3 w-3 ml-2" />
                  </a>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Debug & Test Panel */}
        <Card className="lg:col-span-2 bg-white border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Bug className="h-5 w-5 text-amber-600" />
              Debug & Test
            </CardTitle>
            <CardDescription>
              API bağlantılarını test edin
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Action Buttons - Grouped */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Button 
                variant="outline" 
                onClick={fullApiTest}
                disabled={debugLoading}
                className="justify-start h-auto py-3 px-4"
              >
                <div className="flex items-center gap-3">
                  {debugLoading ? <Loader2 className="h-5 w-5 animate-spin text-green-600" /> : <CheckCircle2 className="h-5 w-5 text-green-600" />}
                  <div className="text-left">
                    <div className="font-medium text-sm">Full API Test</div>
                    <div className="text-xs text-gray-500">Tüm endpoint'leri test et</div>
                  </div>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                onClick={fetchAccountInfo}
                disabled={debugLoading}
                className="justify-start h-auto py-3 px-4"
              >
                <div className="flex items-center gap-3">
                  {debugLoading ? <Loader2 className="h-5 w-5 animate-spin text-blue-600" /> : <MetaIcon className="h-5 w-5 text-blue-600" />}
                  <div className="text-left">
                    <div className="font-medium text-sm">Hesap Bilgileri</div>
                    <div className="text-xs text-gray-500">Token'dan hesap çek</div>
                  </div>
                </div>
              </Button>

              <Button 
                variant="outline" 
                onClick={subscribePage}
                disabled={debugLoading}
                className="justify-start h-auto py-3 px-4"
              >
                <div className="flex items-center gap-3">
                  {debugLoading ? <Loader2 className="h-5 w-5 animate-spin text-blue-600" /> : <Link2 className="h-5 w-5 text-blue-600" />}
                  <div className="text-left">
                    <div className="font-medium text-sm">Page Subscribe</div>
                    <div className="text-xs text-gray-500">Webhook'a bağla</div>
                  </div>
                </div>
              </Button>

              <Button 
                variant="outline" 
                onClick={syncMessages}
                disabled={debugLoading}
                className="justify-start h-auto py-3 px-4"
              >
                <div className="flex items-center gap-3">
                  {debugLoading ? <Loader2 className="h-5 w-5 animate-spin text-amber-600" /> : <RefreshCw className="h-5 w-5 text-amber-600" />}
                  <div className="text-left">
                    <div className="font-medium text-sm">Mesaj Sync</div>
                    <div className="text-xs text-gray-500">Eski mesajları çek</div>
                  </div>
                </div>
              </Button>
            </div>

            {/* Secondary Actions */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={debugFirestore}
                disabled={debugLoading}
                className="text-xs"
              >
                <Database className="h-3.5 w-3.5 mr-1.5" />
                Firestore
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={debugToken}
                disabled={debugLoading}
                className="text-xs"
              >
                <Key className="h-3.5 w-3.5 mr-1.5" />
                Token Debug
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={debugConversations}
                disabled={debugLoading}
                className="text-xs"
              >
                <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
                Konuşmalar
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    disabled={debugLoading}
                    className="text-xs"
                  >
                    <Send className="h-3.5 w-3.5 mr-1.5" />
                    Test Webhook
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={() => testWebhookManual('instagram')}>
                    <Instagram className="h-4 w-4 mr-2 text-pink-600" />
                    Instagram Webhook
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => testWebhookManual('facebook')}>
                    <Facebook className="h-4 w-4 mr-2 text-blue-600" />
                    Facebook Webhook
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={checkPageSubscription}
                disabled={debugLoading}
                className="text-xs"
              >
                <Shield className="h-3.5 w-3.5 mr-1.5" />
                Subscription Check
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={clearMessagesData}
                disabled={debugLoading}
                className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                Temizle
              </Button>
            </div>

            {/* Debug Results */}
            {debugResult && (
              <div className="mt-4 p-4 bg-white rounded-lg border border-amber-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-amber-800">
                    {debugResult.type === 'firestore' && '📂 Firestore Durumu'}
                    {debugResult.type === 'conversations' && '💬 Konuşmalar'}
                    {debugResult.type === 'webhook' && '🔔 Webhook Test'}
                    {debugResult.type === 'sync' && '🔄 Senkronizasyon'}
                    {debugResult.type === 'clear' && '🗑️ Temizleme'}
                    {debugResult.type === 'account' && '📸 Hesap Bilgileri'}
                    {debugResult.type === 'token' && '🔑 Token Bilgileri'}
                    {debugResult.type === 'page-subscription' && '🔗 Page Subscription Durumu'}
                    {debugResult.type === 'subscribe-page' && '✅ Page Subscribe'}
                    {debugResult.type === 'full-api-test' && '🧪 Full API Test Sonuçları'}
                    {debugResult.type === 'error' && '❌ Hata'}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setDebugResult(null)}
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Full API Test için özel görünüm */}
                {debugResult.type === 'full-api-test' && debugResult.data?.data?.tests ? (
                  <div className="space-y-2">
                    {/* Test özeti */}
                    <div className="p-3 rounded-lg bg-gray-100 mb-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className={cn(
                          "text-sm font-bold",
                          debugResult.data.data.allPassed ? "text-green-600" : "text-red-600"
                        )}>
                          {debugResult.data.data.passedCount}/{debugResult.data.data.totalCount} Test Geçti
                        </span>
                        <Badge variant="outline">
                          {debugResult.data.data.tokenType || 'Token'}
                        </Badge>
                      </div>
                      
                      {/* Token Debug Bilgileri */}
                      {debugResult.data.data.tokenDebug && (
                        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs space-y-1">
                          <p className="font-bold text-yellow-800">🔍 Token Debug (ilk 16 karakter):</p>
                          <p><span className="text-gray-600">System User Token:</span> <code className="bg-yellow-100 px-1">{debugResult.data.data.tokenDebug.systemUserToken || 'YOK'}</code></p>
                          <p><span className="text-gray-600">Page Access Token:</span> <code className="bg-yellow-100 px-1">{debugResult.data.data.tokenDebug.pageAccessToken || 'YOK'}</code></p>
                        </div>
                      )}
                      
                      {debugResult.data.data.note && (
                        <p className="text-xs text-gray-600 italic mt-2">
                          ℹ️ {debugResult.data.data.note}
                        </p>
                      )}
                    </div>
                    
                    {/* Test sonuçları */}
                    {debugResult.data.data.tests.map((test, idx) => (
                      <div 
                        key={idx} 
                        className={cn(
                          "p-3 rounded-lg border",
                          test.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200",
                          test.critical && !test.success && "ring-2 ring-red-500"
                        )}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm flex items-center gap-2">
                            {test.success ? '✅' : '❌'} {test.name}
                            {test.critical && (
                              <Badge variant="destructive" className="text-xs">KRİTİK</Badge>
                            )}
                          </span>
                          <code className="text-xs text-gray-500">{test.endpoint}</code>
                        </div>
                        {/* Token bilgisi */}
                        {test.tokenUsed && (
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className={test.tokenUsed.includes('✓') ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-red-50 text-red-700 border-red-200'}>
                              🔑 {test.tokenUsed}
                            </Badge>
                            {test.tokenPreview && (
                              <code className="text-xs text-gray-400">{test.tokenPreview}</code>
                            )}
                          </div>
                        )}
                        {test.note && (
                          <p className="text-xs text-gray-500 mb-1 italic">💡 {test.note}</p>
                        )}
                        <pre className={cn(
                          "text-xs p-2 rounded overflow-auto max-h-32",
                          test.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        )}>
                          {JSON.stringify(test.data, null, 2)}
                        </pre>
                      </div>
                    ))}
                  </div>
                ) : (
                  <pre className="text-xs bg-gray-900 text-green-400 p-3 rounded overflow-auto max-h-64">
                    {JSON.stringify(debugResult.data || debugResult, null, 2)}
                  </pre>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  );
}