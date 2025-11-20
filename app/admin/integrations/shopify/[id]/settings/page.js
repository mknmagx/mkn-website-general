"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { PermissionGuard } from "../../../../../../components/admin-route-guard";
import { authenticatedFetch } from "../../../../../../lib/api/auth-fetch";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Loader2,
  Trash2,
  RotateCcw,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../../../../components/ui/card";
import { Button } from "../../../../../../components/ui/button";
import { Input } from "../../../../../../components/ui/input";
import { Label } from "../../../../../../components/ui/label";
import { Switch } from "../../../../../../components/ui/switch";
import { Alert, AlertDescription } from "../../../../../../components/ui/alert";
import { Badge } from "../../../../../../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../../../components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../../../../components/ui/tabs";
import { useToast } from "../../../../../../hooks/use-toast";
import ShopifyWebhooksManagerSimple from "../../../../../../components/admin/shopify-webhooks-manager-simple";

export default function ShopifyIntegrationSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { id } = params;

  const [integration, setIntegration] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [showAccessToken, setShowAccessToken] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchIntegrationSettings();
  }, [id]);

  const fetchIntegrationSettings = async () => {
    try {
      setLoading(true);
      const response = await authenticatedFetch(
        `/api/admin/integrations/shopify/${id}`
      );

      if (!response.ok) {
        throw new Error("Entegrasyon bulunamadı");
      }

      const data = await response.json();
      const integration = data.integration;
      setIntegration(integration);

      // Form data'ya company bilgilerini de dahil et
      const formDataWithCompany = {
        ...integration,
        companyName: integration.companyName || "",
        companyEmail: integration.companyEmail || "",
        companyPhone: integration.companyPhone || "",
        companyContactPerson: integration.companyContactPerson || "",
        companyBusinessLine: integration.companyBusinessLine || "",
        companyAddress: {
          street: "",
          city: "",
          state: "",
          country: "Turkey",
          zipCode: "",
        },
      };

      // Address bilgisini parse et (companies doc'unda string olarak tutuluyor)
      if (
        integration.companyAddress &&
        typeof integration.companyAddress === "string"
      ) {
        // String address'i parse etmeye çalış
        const addressParts = integration.companyAddress.split(", ");
        if (addressParts.length > 0) {
          formDataWithCompany.companyAddress.street = addressParts[0] || "";
          formDataWithCompany.companyAddress.city = addressParts[1] || "";
          formDataWithCompany.companyAddress.state = addressParts[2] || "";
          formDataWithCompany.companyAddress.zipCode = addressParts[3] || "";
          formDataWithCompany.companyAddress.country =
            addressParts[4] || "Turkey";
        }
      } else if (
        integration.companyAddress &&
        typeof integration.companyAddress === "object"
      ) {
        // Eğer object olarak geliyorsa direkt kullan
        formDataWithCompany.companyAddress = {
          street: integration.companyAddress.street || "",
          city: integration.companyAddress.city || "",
          state: integration.companyAddress.state || "",
          country: integration.companyAddress.country || "Turkey",
          zipCode: integration.companyAddress.zipCode || "",
        };
      }

      setFormData(formDataWithCompany);
    } catch (error) {
      toast({
        title: "Veri Yükleme Hatası",
        description: "Entegrasyon ayarları yüklenirken hata oluştu",
        variant: "destructive",
      });
      setIntegration(null);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (section, field, value) => {
    if (section) {
      setFormData((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value,
        },
      }));

      // Real-time validation for API version
      if (section === "credentials" && field === "apiVersion") {
        const apiVersionPattern = /^\d{4}-\d{2}$/;
        if (apiVersionPattern.test(value)) {
          // Clear error if format is valid
          setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors["credentials.apiVersion"];
            return newErrors;
          });
        }
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }

    // Clear error when user starts typing
    if (errors[`${section}.${field}`] || errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[`${section}.${field}`];
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const testShopifyConnection = async () => {
    const { shopDomain, accessToken } = formData.credentials;

    if (!shopDomain || !accessToken) {
      setConnectionStatus("error");
      setErrors((prev) => ({
        ...prev,
        connection: "Shop domain ve access token gerekli",
      }));
      return;
    }

    setTestingConnection(true);
    setConnectionStatus(null);

    try {
      // Test using database credentials - no body needed
      const response = await authenticatedFetch(
        `/api/admin/integrations/shopify/${id}/test`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Connection test failed: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success) {
        setConnectionStatus("success");
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.connection;
          return newErrors;
        });
        toast({
          title: "Bağlantı Başarılı! ✅",
          description: `${
            result.data?.shopName || "Shop"
          } mağazasına başarıyla bağlanıldı`,
          duration: 4000,
        });
      } else {
        throw new Error(result.error || "Connection test failed");
      }
    } catch (error) {
      setConnectionStatus("error");
      const errorMessage =
        error.message || "Bağlantı test edilemedi. Bilgileri kontrol edin.";
      setErrors((prev) => ({
        ...prev,
        connection: errorMessage,
      }));
      toast({
        title: "Bağlantı Hatası",
        description: errorMessage,
        variant: "destructive",
        duration: 6000,
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      // Company bilgileri validation
      const newErrors = {};

      if (!formData.companyName?.trim()) {
        newErrors.companyName = "Şirket adı gerekli";
      }

      if (!formData.companyEmail?.trim()) {
        newErrors.companyEmail = "İletişim e-postası gerekli";
      } else {
        // Basic email validation
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(formData.companyEmail)) {
          newErrors.companyEmail = "Geçerli bir e-posta adresi girin";
        }
      }

      // Validate API version format
      const apiVersionPattern = /^\d{4}-\d{2}$/;
      if (!apiVersionPattern.test(formData.credentials?.apiVersion)) {
        newErrors["credentials.apiVersion"] =
          "API Version format must be YYYY-MM (e.g., 2025-01)";
      }

      // If there are validation errors, show them and stop
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        toast({
          title: "Form Hatası",
          description: "Lütfen tüm gerekli alanları doğru doldurun",
          variant: "destructive",
          duration: 5000,
        });
        setSaving(false);
        return;
      }

      // Clear errors if validation passes
      setErrors({});

      const response = await authenticatedFetch(
        `/api/admin/integrations/shopify/${id}`,
        {
          method: "PUT",
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        const updatedData = await response.json();
        setIntegration(updatedData.integration || formData);
        toast({
          title: "Ayarlar Kaydedildi ✅",
          description: "Entegrasyon ve şirket bilgileri başarıyla güncellendi",
          duration: 4000,
        });
      } else {
        const errorData = await response.json();
        const errorMessage = errorData?.error || "Ayarlar kaydedilemedi";

        toast({
          title: "Kaydetme Hatası",
          description: errorMessage,
          variant: "destructive",
          duration: 5000,
        });

        setErrors((prev) => ({
          ...prev,
          save: errorMessage,
        }));
      }
    } catch (error) {
      const errorMessage = "Ayarlar kaydedilirken hata oluştu";

      toast({
        title: "Sistem Hatası",
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
      });

      setErrors((prev) => ({
        ...prev,
        save: errorMessage,
      }));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        "Bu entegrasyonu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz."
      )
    ) {
      return;
    }

    toast({
      title: "Entegrasyon Siliniyor...",
      description: "İşlem tamamlanırken lütfen bekleyin",
      duration: 3000,
    });

    try {
      const response = await authenticatedFetch(
        `/api/admin/integrations/shopify/${id}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        toast({
          title: "Entegrasyon Silindi ✅",
          description: "Shopify entegrasyonu başarıyla kaldırıldı",
          duration: 4000,
        });
        router.push("/admin/integrations");
      } else {
        const errorData = await response.json();
        const errorMessage = errorData?.error || "Entegrasyon silinemedi";

        toast({
          title: "Silme Hatası",
          description: errorMessage,
          variant: "destructive",
          duration: 5000,
        });

        setErrors((prev) => ({
          ...prev,
          delete: errorMessage,
        }));
      }
    } catch (error) {
      const errorMessage = "Entegrasyon silinirken hata oluştu";

      toast({
        title: "Sistem Hatası",
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
      });

      setErrors((prev) => ({
        ...prev,
        delete: errorMessage,
      }));
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="w-3 h-3 mr-1" />
            Aktif
          </Badge>
        );
      case "inactive":
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
            Pasif
          </Badge>
        );
      case "error":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            <AlertCircle className="w-3 h-3 mr-1" />
            Hata
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!integration) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Entegrasyon bulunamadı veya erişim yetkiniz yok.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <PermissionGuard requiredPermission="integrations.edit">
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/admin/integrations/shopify/${id}`}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Geri
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-xl">
                  🛍️
                </div>
                <div>
                  <div className="mb-1">
                    <Badge variant="outline" className="text-xs">
                      Entegrasyon Sahibi
                    </Badge>
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {integration.companyName || integration.customerName} -
                    Ayarlar
                  </h1>
                  <p className="text-gray-600">{integration.shopDomain}</p>
                  {integration.companyEmail && (
                    <p className="text-sm text-gray-500">
                      {integration.companyEmail}
                    </p>
                  )}
                </div>
                {getStatusBadge(integration.status)}
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={handleSave} disabled={saving}>
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Kaydet
            </Button>
          </div>
        </div>

        <Tabs defaultValue="company" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="company">Şirket Bilgileri</TabsTrigger>
            <TabsTrigger value="connection">Bağlantı</TabsTrigger>
            <TabsTrigger value="webhooks">Webhook'lar</TabsTrigger>
            <TabsTrigger value="sync">Senkronizasyon</TabsTrigger>
            <TabsTrigger value="fulfillment">Fulfillment</TabsTrigger>
            <TabsTrigger value="advanced">Gelişmiş</TabsTrigger>
          </TabsList>

          {/* Company Information Settings */}
          <TabsContent value="company" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Entegrasyon Sahibi Şirket Bilgileri</CardTitle>
                <CardDescription>
                  Bu entegrasyonun sahibi olan şirketin iletişim ve firma
                  bilgileri
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company-name">Şirket Adı *</Label>
                    <Input
                      id="company-name"
                      value={formData.companyName || ""}
                      onChange={(e) =>
                        handleInputChange(null, "companyName", e.target.value)
                      }
                      placeholder="Örn: ABC Tekstil Ltd. Şti."
                    />
                    {errors.companyName && (
                      <p className="text-sm text-red-600">
                        {errors.companyName}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company-email">İletişim E-postası *</Label>
                    <Input
                      id="company-email"
                      type="email"
                      value={formData.companyEmail || ""}
                      onChange={(e) =>
                        handleInputChange(null, "companyEmail", e.target.value)
                      }
                      placeholder="info@sirket.com"
                    />
                    {errors.companyEmail && (
                      <p className="text-sm text-red-600">
                        {errors.companyEmail}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company-phone">İletişim Telefonu</Label>
                    <Input
                      id="company-phone"
                      value={formData.companyPhone || ""}
                      onChange={(e) =>
                        handleInputChange(null, "companyPhone", e.target.value)
                      }
                      placeholder="+90 (555) 123-4567"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company-contact-person">
                      İletişim Kişisi
                    </Label>
                    <Input
                      id="company-contact-person"
                      value={formData.companyContactPerson || ""}
                      onChange={(e) =>
                        handleInputChange(
                          null,
                          "companyContactPerson",
                          e.target.value
                        )
                      }
                      placeholder="Ahmet Yılmaz"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="company-business-line">İş Kolu</Label>
                    <Input
                      id="company-business-line"
                      value={formData.companyBusinessLine || ""}
                      onChange={(e) =>
                        handleInputChange(
                          null,
                          "companyBusinessLine",
                          e.target.value
                        )
                      }
                      placeholder="Tekstil, E-ticaret, Kozmetik, vb."
                    />
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-3">Adres Bilgileri</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company-city">Şehir</Label>
                      <Input
                        id="company-city"
                        value={formData.companyAddress?.city || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "companyAddress",
                            "city",
                            e.target.value
                          )
                        }
                        placeholder="İstanbul"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="company-state">İl/Bölge</Label>
                      <Input
                        id="company-state"
                        value={formData.companyAddress?.state || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "companyAddress",
                            "state",
                            e.target.value
                          )
                        }
                        placeholder="Marmara"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="company-country">Ülke</Label>
                      <Input
                        id="company-country"
                        value={formData.companyAddress?.country || "Turkey"}
                        onChange={(e) =>
                          handleInputChange(
                            "companyAddress",
                            "country",
                            e.target.value
                          )
                        }
                        placeholder="Turkey"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="company-street">Adres</Label>
                      <Input
                        id="company-street"
                        value={formData.companyAddress?.street || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "companyAddress",
                            "street",
                            e.target.value
                          )
                        }
                        placeholder="Mahalle, Sokak, No, vb."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="company-zip">Posta Kodu</Label>
                      <Input
                        id="company-zip"
                        value={formData.companyAddress?.zipCode || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "companyAddress",
                            "zipCode",
                            e.target.value
                          )
                        }
                        placeholder="34000"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Connection Settings */}
          <TabsContent value="connection" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Shopify API Bağlantı Bilgileri</CardTitle>
                <CardDescription>
                  Shopify mağazanıza bağlanmak için gerekli tüm bilgiler. 
                  Bu bilgiler sadece database'de saklanır, environment dosyalarından alınmaz.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Önemli:</strong> Tüm API bilgileri database'den gelir. 
                    Her müşteri için ayrı API credentials kullanılabilir.
                    Shopify Partner Dashboard'dan alacağınız bilgileri buraya girin.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="shop-domain">Shop Domain *</Label>
                    <Input
                      id="shop-domain"
                      value={formData.credentials?.shopDomain || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "credentials",
                          "shopDomain",
                          e.target.value
                        )
                      }
                      placeholder="mystore.myshopify.com"
                    />
                    <p className="text-xs text-gray-500">
                      Tam domain girin (örn: "mystore.myshopify.com")
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="api-version">API Versiyonu *</Label>
                    <Select
                      value={formData.credentials?.apiVersion || "2025-10"}
                      onValueChange={(value) =>
                        handleInputChange("credentials", "apiVersion", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2025-10">2025-10 (Latest)</SelectItem>
                        <SelectItem value="2025-07">2025-07</SelectItem>
                        <SelectItem value="2025-04">2025-04</SelectItem>
                        <SelectItem value="2025-01">2025-01</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="api-key">Shopify API Key *</Label>
                    <Input
                      id="api-key"
                      value={formData.credentials?.apiKey || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "credentials",
                          "apiKey",
                          e.target.value
                        )
                      }
                      placeholder="abc123..."
                    />
                    <p className="text-xs text-gray-500">
                      Shopify Partner Dashboard → Apps → Your App → API keys
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="api-secret">Shopify API Secret *</Label>
                    <Input
                      id="api-secret"
                      type="password"
                      value={formData.credentials?.apiSecret || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "credentials",
                          "apiSecret",
                          e.target.value
                        )
                      }
                      placeholder="shpss_..."
                    />
                    <p className="text-xs text-gray-500">
                      Shopify Partner Dashboard'da "Show" butonuna basın
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="access-token">Access Token *</Label>
                  <div className="relative">
                    <Input
                      id="access-token"
                      type={showAccessToken ? "text" : "password"}
                      value={formData.credentials?.accessToken || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "credentials",
                          "accessToken",
                          e.target.value
                        )
                      }
                      placeholder="shpat_..."
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAccessToken(!showAccessToken)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showAccessToken ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Müşteri Shopify mağazasından alınan private app token'ı
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="webhook-secret">Webhook Secret</Label>
                  <Input
                    id="webhook-secret"
                    type="password"
                    value={formData.credentials?.webhookSecret || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "credentials",
                        "webhookSecret",
                        e.target.value
                      )
                    }
                    placeholder="Webhook HMAC doğrulama için secret"
                  />
                  <p className="text-xs text-gray-500">
                    Webhook güvenliği için kullanılır. Boş bırakılabilir.
                  </p>
                </div>

                {/* Connection Test */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={testShopifyConnection}
                    disabled={testingConnection}
                  >
                    {testingConnection ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    Bağlantıyı Test Et
                  </Button>

                  {connectionStatus === "success" && (
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      <span className="text-sm">Bağlantı başarılı!</span>
                    </div>
                  )}

                  {connectionStatus === "error" && (
                    <div className="flex items-center text-red-600">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      <span className="text-sm">Bağlantı hatası</span>
                    </div>
                  )}
                </div>

                {errors.connection && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{errors.connection}</AlertDescription>
                  </Alert>
                )}

                {/* Shopify Setup Guide */}
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h5 className="text-sm font-medium text-blue-900 mb-2">
                    📘 Shopify Kurulum Rehberi
                  </h5>
                  <div className="text-sm text-blue-700 space-y-1">
                    <p><strong>1.</strong> Shopify Partners → Apps → Create app</p>
                    <p><strong>2.</strong> API keys sekmesinden Key ve Secret'ı kopyalayın</p>
                    <p><strong>3.</strong> Müşteri mağazasından Private app oluşturun</p>
                    <p><strong>4.</strong> Admin API access token'ını kopyalayın</p>
                    <p><strong>5.</strong> Webhook endpoint: <code className="bg-white px-1 rounded text-xs">mkngroup.com.tr/api/admin/integrations/shopify/webhooks/receiver</code></p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Webhook Settings */}
          <TabsContent value="webhooks" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Webhook Yönetimi</CardTitle>
                <CardDescription>
                  Shopify'dan gerçek zamanlı veri alımı için webhook'ları yapılandırın
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ShopifyWebhooksManagerSimple integrationId={id} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sync Settings */}
          <TabsContent value="sync" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Senkronizasyon Ayarları</CardTitle>
                <CardDescription>
                  Hangi verilerin ne sıklıkla senkronize edileceğini belirleyin
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Veri Senkronizasyonu</h4>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="sync-orders">
                          Sipariş Senkronizasyonu
                        </Label>
                        <p className="text-sm text-gray-500">
                          Shopify siparişlerini otomatik olarak çek
                        </p>
                      </div>
                      <Switch
                        id="sync-orders"
                        checked={formData.settings?.syncOrders || false}
                        onCheckedChange={(checked) =>
                          handleInputChange("settings", "syncOrders", checked)
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="sync-returns">
                          İade Senkronizasyonu
                        </Label>
                        <p className="text-sm text-gray-500">
                          İade isteklerini takip et
                        </p>
                      </div>
                      <Switch
                        id="sync-returns"
                        checked={formData.settings?.syncReturns || false}
                        onCheckedChange={(checked) =>
                          handleInputChange("settings", "syncReturns", checked)
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="sync-customers">
                          Müşteri Senkronizasyonu
                        </Label>
                        <p className="text-sm text-gray-500">
                          Müşteri bilgilerini senkronize et
                        </p>
                      </div>
                      <Switch
                        id="sync-customers"
                        checked={formData.settings?.syncCustomers || false}
                        onCheckedChange={(checked) =>
                          handleInputChange(
                            "settings",
                            "syncCustomers",
                            checked
                          )
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Senkronizasyon Ayarları</h4>

                    <div className="space-y-2">
                      <Label htmlFor="sync-interval">
                        Senkronizasyon Sıklığı
                      </Label>
                      <Select
                        value={formData.settings?.syncInterval || "realtime"}
                        onValueChange={(value) =>
                          handleInputChange("settings", "syncInterval", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="realtime">
                            Gerçek Zamanlı (Webhook)
                          </SelectItem>
                          <SelectItem value="hourly">Saatlik</SelectItem>
                          <SelectItem value="daily">Günlük</SelectItem>
                          <SelectItem value="manual">Manuel</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notification-email">
                        Bildirim E-postası
                      </Label>
                      <Input
                        id="notification-email"
                        type="email"
                        value={formData.settings?.notificationEmail || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "settings",
                            "notificationEmail",
                            e.target.value
                          )
                        }
                        placeholder="admin@mkngroup.com"
                      />
                      <p className="text-sm text-gray-500">
                        Senkronizasyon hatalarında bildirim gönderilecek
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Fulfillment Settings */}
          <TabsContent value="fulfillment" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Fulfillment Ayarları</CardTitle>
                <CardDescription>
                  Sipariş işleme ve gönderim süreçlerini yapılandırın
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Genel Ayarlar</h4>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="auto-fulfillment">
                          Otomatik Fulfillment
                        </Label>
                        <p className="text-sm text-gray-500">
                          Siparişleri otomatik olarak işle
                        </p>
                      </div>
                      <Switch
                        id="auto-fulfillment"
                        checked={formData.settings?.autoFulfillment || false}
                        onCheckedChange={(checked) =>
                          handleInputChange(
                            "settings",
                            "autoFulfillment",
                            checked
                          )
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="tracking-enabled">Kargo Takibi</Label>
                        <p className="text-sm text-gray-500">
                          Kargo takip numarası gönder
                        </p>
                      </div>
                      <Switch
                        id="tracking-enabled"
                        checked={
                          formData.fulfillmentSettings?.trackingEnabled || false
                        }
                        onCheckedChange={(checked) =>
                          handleInputChange(
                            "fulfillmentSettings",
                            "trackingEnabled",
                            checked
                          )
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="auto-notify">Otomatik Bildirim</Label>
                        <p className="text-sm text-gray-500">
                          Müşteriye otomatik gönderim bildirimi
                        </p>
                      </div>
                      <Switch
                        id="auto-notify"
                        checked={
                          formData.fulfillmentSettings?.autoNotifyCustomer ||
                          false
                        }
                        onCheckedChange={(checked) =>
                          handleInputChange(
                            "fulfillmentSettings",
                            "autoNotifyCustomer",
                            checked
                          )
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Depo ve Kargo</h4>

                    <div className="space-y-2">
                      <Label htmlFor="default-warehouse">Varsayılan Depo</Label>
                      <Select
                        value={
                          formData.fulfillmentSettings?.defaultWarehouse ||
                          "main"
                        }
                        onValueChange={(value) =>
                          handleInputChange(
                            "fulfillmentSettings",
                            "defaultWarehouse",
                            value
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="main">
                            Ana Depo - İstanbul
                          </SelectItem>
                          <SelectItem value="ankara">Ankara Depo</SelectItem>
                          <SelectItem value="izmir">İzmir Depo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Kargo Yöntemleri</Label>
                      <div className="space-y-2">
                        {["standard", "express", "overnight"].map((method) => (
                          <div
                            key={method}
                            className="flex items-center space-x-2"
                          >
                            <input
                              type="checkbox"
                              id={`shipping-${method}`}
                              checked={
                                formData.fulfillmentSettings?.shippingMethods?.includes(
                                  method
                                ) || false
                              }
                              onChange={(e) => {
                                const currentMethods =
                                  formData.fulfillmentSettings
                                    ?.shippingMethods || [];
                                const newMethods = e.target.checked
                                  ? [...currentMethods, method]
                                  : currentMethods.filter((m) => m !== method);
                                handleInputChange(
                                  "fulfillmentSettings",
                                  "shippingMethods",
                                  newMethods
                                );
                              }}
                              className="rounded border-gray-300"
                            />
                            <Label
                              htmlFor={`shipping-${method}`}
                              className="capitalize"
                            >
                              {method === "standard"
                                ? "Standart Kargo"
                                : method === "express"
                                ? "Hızlı Kargo"
                                : "Bir Günde Teslimat"}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Advanced Settings */}
          <TabsContent value="advanced" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Gelişmiş Ayarlar</CardTitle>
                <CardDescription>
                  Entegrasyon yönetimi ve gelişmiş seçenekler
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Manuel Senkronizasyon</h4>
                      <p className="text-sm text-gray-500">
                        Tüm verileri şimdi yeniden senkronize et
                      </p>
                    </div>
                    <Button variant="outline">
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Senkronize Et
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Webhook URL'leri</h4>
                      <p className="text-sm text-gray-500">
                        Shopify webhook yapılandırması için URL'ler
                      </p>
                    </div>
                    <Button variant="outline">URL'leri Göster</Button>
                  </div>

                  <div className="border rounded-lg p-4 border-red-200 bg-red-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-red-900">
                          Entegrasyonu Sil
                        </h4>
                        <p className="text-sm text-red-700">
                          Bu entegrasyonu ve tüm verilerini kalıcı olarak sil
                        </p>
                      </div>
                      <Button
                        variant="destructive"
                        onClick={() => setShowDeleteConfirm(true)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Sil
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md mx-4">
              <h3 className="text-lg font-semibold mb-4">Entegrasyonu Sil</h3>
              <p className="text-gray-600 mb-6">
                Bu entegrasyonu silmek istediğinizden emin misiniz? Bu işlem
                geri alınamaz ve tüm sipariş verileri silinecektir.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1"
                >
                  İptal
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  className="flex-1"
                >
                  Evet, Sil
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Error Messages */}
        {errors.save && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errors.save}</AlertDescription>
          </Alert>
        )}

        {errors.delete && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errors.delete}</AlertDescription>
          </Alert>
        )}
      </div>
    </PermissionGuard>
  );
}
