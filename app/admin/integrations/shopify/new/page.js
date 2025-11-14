'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PermissionGuard } from '../../../../../components/admin-route-guard';
import { authenticatedFetch } from '../../../../../lib/api/auth-fetch';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle,
  Loader2,
  ExternalLink,
  Info
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../../components/ui/card';
import { Button } from '../../../../../components/ui/button';
import { Input } from '../../../../../components/ui/input';
import { Label } from '../../../../../components/ui/label';
import { Textarea } from '../../../../../components/ui/textarea';
import { Switch } from '../../../../../components/ui/switch';
import { Alert, AlertDescription } from '../../../../../components/ui/alert';
import { Badge } from '../../../../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../../components/ui/select';
import { useToast } from '../../../../../hooks/use-toast';

export default function NewShopifyIntegrationPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [showAccessToken, setShowAccessToken] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [createNewCompany, setCreateNewCompany] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);

  const [formData, setFormData] = useState({
    // Company Bilgileri
    companyId: '',
    companyInfo: {
      companyName: '',
      contactEmail: '',
      contactPhone: '',
      contactPerson: '',
      businessLine: '',
      address: {
        street: '',
        city: '',
        state: '',
        country: 'Turkey',
        zipCode: ''
      }
    },
    
    // Shopify Bağlantı Bilgileri
    credentials: {
      shopDomain: '',
      accessToken: '',
      apiVersion: '2025-01',
      webhookSecret: ''
    },
    
    // Entegrasyon Ayarları
    settings: {
      syncOrders: true,
      syncReturns: true,
      syncCustomers: true,
      autoFulfillment: false,
      syncInterval: 'realtime', // realtime, hourly, daily
      orderStatus: ['paid', 'fulfilled'], // hangi durumlar senkronize edilecek
    },
    
    // Fulfillment Ayarları
    fulfillmentSettings: {
      defaultWarehouse: '',
      shippingMethods: [],
      trackingEnabled: true,
      customFields: {}
    }
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoadingCompanies(true);
      const response = await authenticatedFetch('/api/admin/companies');
      
      if (response.ok) {
        const data = await response.json();
        setCompanies(data.companies || []);
        toast({
          title: "Firmalar Yüklendi",
          description: `${data.companies?.length || 0} firma yüklendi`,
        });
      } else {
        toast({
          title: "Hata",
          description: "Firmalar yüklenemedi",
          variant: "destructive",
        });
        setCompanies([]);
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: "Firmalar yüklenirken hata oluştu",
        variant: "destructive",
      });
      setCompanies([]);
    } finally {
      setLoadingCompanies(false);
    }
  };

  const handleInputChange = (section, field, value) => {
    if (section) {
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[`${section}.${field}`] || errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`${section}.${field}`];
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleNestedInputChange = (section, subsection, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subsection]: {
          ...prev[section][subsection],
          [field]: value
        }
      }
    }));
  };

  const testShopifyConnection = async () => {
    const { shopDomain, accessToken } = formData.credentials;
    
    if (!shopDomain || !accessToken) {
      setConnectionStatus('error');
      setErrors(prev => ({
        ...prev,
        connection: 'Shop domain ve access token gerekli'
      }));
      return;
    }

    setTestingConnection(true);
    setConnectionStatus(null);
    
    try {
      const response = await authenticatedFetch('/api/admin/integrations/shopify/test', {
        method: 'POST',
        body: JSON.stringify({
          shopDomain,
          accessToken,
          apiVersion: formData.credentials.apiVersion
        })
      });

      if (response.ok) {
        const result = await response.json();
        setConnectionStatus('success');
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.connection;
          return newErrors;
        });
        toast({
          title: "Bağlantı Başarılı ✅",
          description: `${result.shop?.name || 'Shopify mağazası'} ile başarıyla bağlantı kuruldu`,
          duration: 5000,
        });
      } else {
        const errorData = await response.json();
        setConnectionStatus('error');
        
        let errorMessage = 'Bağlantı test edilemedi. Bilgileri kontrol edin.';
        
        if (response.status === 401) {
          errorMessage = 'Geçersiz access token veya yetersiz izinler';
        } else if (response.status === 404) {
          errorMessage = 'Shop domain bulunamadı';
        } else if (errorData?.error) {
          errorMessage = errorData.error;
        }
        
        toast({
          title: "Bağlantı Hatası ❌",
          description: errorMessage,
          variant: "destructive",
          duration: 5000,
        });
        
        setErrors(prev => ({
          ...prev,
          connection: errorMessage
        }));
      }
    } catch (error) {
      setConnectionStatus('error');
      const errorMessage = 'Bağlantı test edilirken bir hata oluştu';
      
      toast({
        title: "Bağlantı Test Hatası",
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
      });
      
      setErrors(prev => ({
        ...prev, 
        connection: errorMessage
      }));
    } finally {
      setTestingConnection(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Company seçimi kontrolü
    if (!createNewCompany && !selectedCompany) {
      newErrors.company = 'Bir company seçin veya yeni company oluşturun';
    }

    // Yeni company oluşturuluyorsa gerekli alanlar
    if (createNewCompany) {
      if (!formData.companyInfo.companyName) {
        newErrors['companyInfo.companyName'] = 'Firma adı gerekli';
      }
      if (!formData.companyInfo.contactEmail) {
        newErrors['companyInfo.contactEmail'] = 'İletişim e-postası gerekli';
      }
    }

    // Shopify bağlantı bilgileri
    if (!formData.credentials.shopDomain) {
      newErrors['credentials.shopDomain'] = 'Shop domain gerekli';
    }
    if (!formData.credentials.accessToken) {
      newErrors['credentials.accessToken'] = 'Access token gerekli';
    }
    if (!formData.credentials.apiVersion) {
      newErrors['credentials.apiVersion'] = 'API versiyonu gerekli';
    } else if (!/^\d{4}-\d{2}$/.test(formData.credentials.apiVersion)) {
      newErrors['credentials.apiVersion'] = 'API versiyonu YYYY-MM formatında olmalı (örn: 2025-01)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Form Hatası",
        description: "Lütfen tüm alanları doğru doldurun",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    toast({
      title: "Entegrasyon Oluşturuluyor...",
      description: "Lütfen bekleyin",
    });
    
    try {
      const payload = {
        ...formData,
        companyId: createNewCompany ? null : selectedCompany
      };

      const response = await authenticatedFetch('/api/admin/integrations/shopify', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Başarılı! 🎉",
          description: `${formData.credentials.shopDomain} entegrasyonu oluşturuldu`,
        });
        router.push(`/admin/integrations/shopify/${result.id}`);
      } else {
        const errorData = await response.json();
        toast({
          title: "Hata",
          description: errorData?.error || "Entegrasyon oluşturulamadı",
          variant: "destructive",
        });
        
        setErrors(prev => ({
          ...prev,
          submit: errorData?.error || 'Entegrasyon oluşturulamadı'
        }));
      }
    } catch (error) {
      toast({
        title: "Sistem Hatası",
        description: "Beklenmeyen bir hata oluştu",
        variant: "destructive",
      });
      
      setErrors(prev => ({
        ...prev,
        submit: 'Entegrasyon oluşturulurken beklenmeyen bir hata oluştu'
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <PermissionGuard requiredPermission="integrations.create">
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin/integrations">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Geri
            </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Yeni Shopify Entegrasyonu</h1>
          <p className="text-gray-600 mt-2">
            Müşteri için Shopify mağaza bağlantısı oluşturun
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Company Seçimi */}
        <Card>
          <CardHeader>
            <CardTitle>Company Bilgileri</CardTitle>
            <CardDescription>
              Entegrasyonun hangi company için oluşturulacağını belirleyin
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="create-new-company"
                checked={createNewCompany}
                onCheckedChange={setCreateNewCompany}
              />
              <Label htmlFor="create-new-company">Yeni company oluştur</Label>
            </div>

            {!createNewCompany ? (
              <div className="space-y-2">
                <Label htmlFor="company-select">Mevcut Company Seç</Label>
                <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                  <SelectTrigger>
                    <SelectValue placeholder="Bir company seçin..." />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingCompanies ? (
                      <SelectItem disabled value="loading">Yükleniyor...</SelectItem>
                    ) : companies.length === 0 ? (
                      <SelectItem disabled value="no-companies">Company bulunamadı</SelectItem>
                    ) : (
                      companies.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          <div>
                            <div className="font-medium">{company.companyName || company.name}</div>
                            <div className="text-sm text-gray-500">{company.contactEmail || company.email}</div>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {errors.company && (
                  <p className="text-sm text-red-600">{errors.company}</p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company-name">Firma Adı *</Label>
                  <Input
                    id="company-name"
                    value={formData.companyInfo.companyName}
                    onChange={(e) => handleInputChange('companyInfo', 'companyName', e.target.value)}
                    placeholder="Örn: ABC Tekstil Ltd."
                  />
                  {errors['companyInfo.companyName'] && (
                    <p className="text-sm text-red-600">{errors['companyInfo.companyName']}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact-email">İletişim E-postası *</Label>
                  <Input
                    id="contact-email"
                    type="email"
                    value={formData.companyInfo.contactEmail}
                    onChange={(e) => handleInputChange('companyInfo', 'contactEmail', e.target.value)}
                    placeholder="info@firma.com"
                  />
                  {errors['companyInfo.contactEmail'] && (
                    <p className="text-sm text-red-600">{errors['companyInfo.contactEmail']}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact-phone">İletişim Telefonu</Label>
                  <Input
                    id="contact-phone"
                    value={formData.companyInfo.contactPhone}
                    onChange={(e) => handleInputChange('companyInfo', 'contactPhone', e.target.value)}
                    placeholder="+90 (555) 123-4567"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact-person">İletişim Kişisi</Label>
                  <Input
                    id="contact-person"
                    value={formData.companyInfo.contactPerson}
                    onChange={(e) => handleInputChange('companyInfo', 'contactPerson', e.target.value)}
                    placeholder="Ahmet Yılmaz"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="business-line">İş Kolu</Label>
                  <Input
                    id="business-line"
                    value={formData.companyInfo.businessLine}
                    onChange={(e) => handleInputChange('companyInfo', 'businessLine', e.target.value)}
                    placeholder="Tekstil, E-ticaret, vb."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">Şehir</Label>
                  <Input
                    id="city"
                    value={formData.companyInfo.address.city}
                    onChange={(e) => handleNestedInputChange('companyInfo', 'address', 'city', e.target.value)}
                    placeholder="İstanbul"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Shopify Bağlantı Bilgileri */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🛍️ Shopify Bağlantı Bilgileri
              <Badge variant="outline">Gerekli</Badge>
            </CardTitle>
            <CardDescription>
              Shopify mağazasına bağlanmak için gerekli API bilgilerini girin
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Shopify Admin'den private app oluşturarak access token alabilirsiniz.{' '}
                <a href="https://help.shopify.com/en/manual/apps/private-apps" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1">
                  Nasıl yapılır? <ExternalLink className="h-3 w-3" />
                </a>
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="shop-domain">Shop Domain *</Label>
                <Input
                  id="shop-domain"
                  value={formData.credentials.shopDomain}
                  onChange={(e) => handleInputChange('credentials', 'shopDomain', e.target.value)}
                  placeholder="ornek-magaza.myshopify.com"
                />
                {errors['credentials.shopDomain'] && (
                  <p className="text-sm text-red-600">{errors['credentials.shopDomain']}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="api-version">API Versiyonu</Label>
                <Input
                  id="api-version"
                  type="text"
                  value={formData.credentials.apiVersion}
                  onChange={(e) => handleInputChange('credentials', 'apiVersion', e.target.value)}
                  placeholder="2025-01"
                  className="font-mono"
                />
                <p className="text-xs text-gray-500">
                  Örnekler: 2025-01, 2024-10, 2024-07 (YYYY-MM formatında)
                </p>
                {errors['credentials.apiVersion'] && (
                  <p className="text-sm text-red-600">{errors['credentials.apiVersion']}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="access-token">Access Token *</Label>
              <div className="relative">
                <Input
                  id="access-token"
                  type={showAccessToken ? 'text' : 'password'}
                  value={formData.credentials.accessToken}
                  onChange={(e) => handleInputChange('credentials', 'accessToken', e.target.value)}
                  placeholder="shppa_..."
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
              {errors['credentials.accessToken'] && (
                <p className="text-sm text-red-600">{errors['credentials.accessToken']}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="webhook-secret">Webhook Secret (Opsiyonel)</Label>
              <Input
                id="webhook-secret"
                value={formData.credentials.webhookSecret}
                onChange={(e) => handleInputChange('credentials', 'webhookSecret', e.target.value)}
                placeholder="Webhook doğrulama için secret"
              />
            </div>

            {/* Bağlantı Testi */}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={testShopifyConnection}
                disabled={testingConnection || !formData.credentials.shopDomain || !formData.credentials.accessToken}
              >
                {testingConnection ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                Bağlantıyı Test Et
              </Button>
              
              {connectionStatus === 'success' && (
                <div className="flex items-center text-green-600">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span className="text-sm">Bağlantı başarılı!</span>
                </div>
              )}
              
              {connectionStatus === 'error' && (
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
          </CardContent>
        </Card>

        {/* Entegrasyon Ayarları */}
        <Card>
          <CardHeader>
            <CardTitle>Entegrasyon Ayarları</CardTitle>
            <CardDescription>
              Hangi verilerin senkronize edileceğini ve nasıl işleneceğini belirleyin
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium">Senkronizasyon</h4>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="sync-orders">Sipariş Senkronizasyonu</Label>
                    <p className="text-sm text-gray-500">Shopify siparişlerini otomatik olarak çek</p>
                  </div>
                  <Switch
                    id="sync-orders"
                    checked={formData.settings.syncOrders}
                    onCheckedChange={(checked) => handleInputChange('settings', 'syncOrders', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="sync-returns">İade Senkronizasyonu</Label>
                    <p className="text-sm text-gray-500">İade isteklerini takip et</p>
                  </div>
                  <Switch
                    id="sync-returns"
                    checked={formData.settings.syncReturns}
                    onCheckedChange={(checked) => handleInputChange('settings', 'syncReturns', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="sync-customers">Müşteri Senkronizasyonu</Label>
                    <p className="text-sm text-gray-500">Müşteri bilgilerini senkronize et</p>
                  </div>
                  <Switch
                    id="sync-customers"
                    checked={formData.settings.syncCustomers}
                    onCheckedChange={(checked) => handleInputChange('settings', 'syncCustomers', checked)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Fulfillment</h4>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-fulfillment">Otomatik Fulfillment</Label>
                    <p className="text-sm text-gray-500">Siparişleri otomatik olarak işle</p>
                  </div>
                  <Switch
                    id="auto-fulfillment"
                    checked={formData.settings.autoFulfillment}
                    onCheckedChange={(checked) => handleInputChange('settings', 'autoFulfillment', checked)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sync-interval">Senkronizasyon Sıklığı</Label>
                  <Select 
                    value={formData.settings.syncInterval}
                    onValueChange={(value) => handleInputChange('settings', 'syncInterval', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="realtime">Gerçek Zamanlı (Webhook)</SelectItem>
                      <SelectItem value="hourly">Saatlik</SelectItem>
                      <SelectItem value="daily">Günlük</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex justify-end gap-3">
          <Link href="/admin/integrations">
            <Button type="button" variant="outline">
              İptal
            </Button>
          </Link>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : null}
            Entegrasyonu Oluştur
          </Button>
        </div>

        {errors.submit && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errors.submit}</AlertDescription>
          </Alert>
        )}
      </form>
      </div>
    </PermissionGuard>
  );
}
