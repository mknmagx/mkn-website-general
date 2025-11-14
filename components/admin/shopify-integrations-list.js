/**
 * Shopify Entegrasyonları Listesi Component
 * Güvenli API çağrıları ile entegrasyonları gösterir
 */
'use client';

import { useState, useEffect } from 'react';
import { useAdminAuth } from '../../hooks/use-admin-auth';
import { PermissionGuard } from '../admin-route-guard';
import { shopifyApi, handleApiError } from '../../lib/api/auth-fetch';
import { Loader2, Plus, Settings, Trash2, RefreshCw } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

export default function ShopifyIntegrationsList() {
  const [integrations, setIntegrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [syncingId, setSyncingId] = useState(null);
  
  const { user, hasPermission } = useAdminAuth();
  const { toast } = useToast();

  // Entegrasyonları yükle
  const loadIntegrations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await shopifyApi.getIntegrations();
      setIntegrations(response.integrations || []);
    } catch (error) {
      const errorInfo = handleApiError(error);
      setError(errorInfo.message);
      
      // Auth hatası durumunda redirect
      if (errorInfo.action === 'redirect_login') {
        window.location.href = '/admin/login';
      }
    } finally {
      setLoading(false);
    }
  };

  // Sipariş senkronizasyonu
  const handleSync = async (integrationId) => {
    try {
      setSyncingId(integrationId);
      const response = await shopifyApi.syncOrders(integrationId);
      
      // Başarı mesajı göster
      toast({
        title: "Senkronizasyon Tamamlandı",
        description: `${response.syncedOrders} sipariş başarıyla senkronize edildi`,
        variant: "default",
      });
      
      // Listeyi yenile
      await loadIntegrations();
    } catch (error) {
      const errorInfo = handleApiError(error);
      setError(errorInfo.message);
      toast({
        title: "Senkronizasyon Hatası",
        description: errorInfo.message,
        variant: "destructive",
      });
    } finally {
      setSyncingId(null);
    }
  };

  // Entegrasyon sil
  const handleDelete = async (integrationId) => {
    if (!window.confirm('Bu entegrasyonu silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await shopifyApi.deleteIntegration(integrationId);
      toast({
        title: "Entegrasyon Silindi",
        description: "Shopify entegrasyonu başarıyla kaldırıldı",
        variant: "default",
      });
      await loadIntegrations();
    } catch (error) {
      const errorInfo = handleApiError(error);
      setError(errorInfo.message);
      toast({
        title: "Silme Hatası",
        description: errorInfo.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (user) {
      loadIntegrations();
    }
  }, [user]);

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <PermissionGuard requiredPermission="integrations.view">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Shopify Entegrasyonları
          </h1>
          
          <PermissionGuard 
            requiredPermission="integrations.edit"
            fallback={null}
            showMessage={false}
          >
            <button 
              onClick={() => window.location.href = '/admin/integrations/shopify/new'}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Yeni Entegrasyon
            </button>
          </PermissionGuard>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="text-red-800">{error}</div>
          </div>
        )}

        {/* Integrations List */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {integrations.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Henüz entegrasyon bulunmamaktadır.</p>
              <PermissionGuard 
                requiredPermission="integrations.edit"
                fallback={null}
                showMessage={false}
              >
                <button 
                  onClick={() => window.location.href = '/admin/integrations/shopify/new'}
                  className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  İlk Entegrasyonu Oluştur
                </button>
              </PermissionGuard>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {integrations.map((integration) => (
                <li key={integration.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-900">
                            {integration.credentials?.shopDomain || 'Bilinmeyen Domain'}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {integration.companyName || 'Şirket Bilgisi Yok'}
                          </p>
                          <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                            <span 
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                integration.status === 'active'
                                  ? 'bg-green-100 text-green-800'
                                  : integration.status === 'error'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {integration.status === 'active' ? 'Aktif' : 
                               integration.status === 'error' ? 'Hatalı' : 'Pasif'}
                            </span>
                            <span>{integration.ordersCount || 0} sipariş</span>
                            {integration.lastSyncAt && (
                              <span>
                                Son senkronizasyon: {new Date(integration.lastSyncAt.seconds * 1000).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {/* Sync Button */}
                      <PermissionGuard 
                        requiredPermission="integrations.edit"
                        fallback={null}
                        showMessage={false}
                      >
                        <button
                          onClick={() => handleSync(integration.id)}
                          disabled={syncingId === integration.id}
                          className="inline-flex items-center p-2 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                          title="Siparişleri Senkronize Et"
                        >
                          <RefreshCw 
                            className={`h-4 w-4 ${syncingId === integration.id ? 'animate-spin' : ''}`} 
                          />
                        </button>
                      </PermissionGuard>

                      {/* Settings Button */}
                      <PermissionGuard 
                        requiredPermission="integrations.edit"
                        fallback={null}
                        showMessage={false}
                      >
                        <button
                          onClick={() => window.location.href = `/admin/integrations/shopify/${integration.id}`}
                          className="inline-flex items-center p-2 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50"
                          title="Entegrasyon Ayarları"
                        >
                          <Settings className="h-4 w-4" />
                        </button>
                      </PermissionGuard>

                      {/* Delete Button */}
                      <PermissionGuard 
                        requiredPermission="integrations.edit"
                        fallback={null}
                        showMessage={false}
                      >
                        <button
                          onClick={() => handleDelete(integration.id)}
                          className="inline-flex items-center p-2 border border-red-300 rounded-md text-sm text-red-700 bg-white hover:bg-red-50"
                          title="Entegrasyonu Sil"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </PermissionGuard>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </PermissionGuard>
  );
}