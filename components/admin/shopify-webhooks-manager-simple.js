"use client";

import { useState, useEffect } from 'react';
import { useAdminAuth } from '../../hooks/use-admin-auth';
import { getCurrentUserToken } from '../../lib/api/auth-fetch';
import logger from '../../lib/utils/logger';

/**
 * Shopify Webhook Yönetim Bileşeni
 * Basitleştirilmiş webhook yönetimi
 */
export default function ShopifyWebhooksManager({ integrationId }) {
  const { user } = useAdminAuth();
  const [webhooks, setWebhooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [setupLoading, setSetupLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  // Webhook'ları yükle
  const fetchWebhooks = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const url = integrationId 
        ? `/api/admin/integrations/shopify/webhooks/manage?integrationId=${integrationId}`
        : "/api/admin/integrations/shopify/webhooks/manage";
      
      const response = await fetch(url);
      const data = await response.json();

      if (response.ok) {
        setWebhooks(data.webhooks || []);
      } else {
        throw new Error(data.error || 'Webhook\'lar alınamadı');
      }
    } catch (error) {
      logger.error('Error fetching webhooks:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Webhook'ları kur
  const setupWebhooks = async () => {
    setSetupLoading(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch("/api/admin/integrations/shopify/webhooks/manage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          integrationId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        logger.info("Webhooks setup completed:", data);
        await fetchWebhooks(); // Webhook'ları yeniden yükle
      } else {
        throw new Error(data.error || 'Webhook kurulumu başarısız');
      }
    } catch (error) {
      logger.error("Error setting up webhooks:", error);
      setError(error.message);
    } finally {
      setSetupLoading(false);
    }
  };

  // Webhook'ları kaldır
  const removeWebhooks = async () => {
    if (!confirm("Tüm webhook'ları kaldırmak istediğinizden emin misiniz?")) {
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const url = integrationId 
        ? `/api/admin/integrations/shopify/webhooks/manage?integrationId=${integrationId}`
        : "/api/admin/integrations/shopify/webhooks/manage";
      
      const response = await fetch(url, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok && data.success) {
        logger.info("Webhooks removed:", data);
        setMessage(data.message || "Webhook'lar başarıyla kaldırıldı");
        
        // Detaylı sonucu göster
        if (data.removed && data.removed.length > 0) {
          setMessage(`✅ ${data.removedCount} webhook kaldırıldı${data.errorCount > 0 ? `, ${data.errorCount} hata` : ''}`);
        }
        
        await fetchWebhooks(); // Webhook'ları yeniden yükle
      } else {
        const errorMsg = data.error || data.details || 'Webhook kaldırma başarısız';
        throw new Error(errorMsg);
      }
    } catch (error) {
      logger.error("Error removing webhooks:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Tüm webhook'ları test et
  const testAllWebhooks = async () => {
    if (!confirm('Tüm aktif webhook\'ları test etmek istediğinizden emin misiniz?')) {
      return;
    }

    setSetupLoading(true);
    setError(null);
    setMessage(null);

    try {
      const token = await getCurrentUserToken();
      
      const response = await fetch(`/api/admin/integrations/shopify/webhooks/test-all`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          integrationId
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage(`🎉 Webhook testleri tamamlandı! ${data.message}`);
        
        // Detaylı sonuçları göster
        const failedTests = data.results?.filter(r => !r.test.success) || [];
        if (failedTests.length > 0) {
          const failedTopics = failedTests.map(f => f.webhook.topic).join(', ');
          setError(`⚠️ Başarısız testler: ${failedTopics}`);
        }
        
        logger.info("All webhook tests completed:", data);
      } else {
        const errorMsg = data.error || 'Webhook testleri başarısız';
        throw new Error(errorMsg);
      }
    } catch (error) {
      logger.error("Error testing all webhooks:", error);
      setError(`❌ Webhook test hatası: ${error.message}`);
    } finally {
      setSetupLoading(false);
    }
  };

  // Webhook test et
  const testWebhook = async (webhook) => {
    if (!confirm(`${webhook.topic} webhook'ını test etmek istediğinizden emin misiniz?`)) {
      return;
    }

    setSetupLoading(true);
    setError(null);
    setMessage(null);

    try {
      const token = await getCurrentUserToken();
      
      const response = await fetch(`/api/admin/integrations/shopify/webhooks/test`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          integrationId,
          webhookId: webhook.id,
          topic: webhook.topic
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage(`✅ ${webhook.topic} webhook testi başarılı! Response: ${data.status} (${data.responseTime})`);
        logger.info("Webhook test successful:", data);
      } else {
        const errorMsg = data.error || data.details || 'Webhook testi başarısız';
        throw new Error(errorMsg);
      }
    } catch (error) {
      logger.error("Error testing webhook:", error);
      setError(`❌ Webhook test hatası: ${error.message}`);
    } finally {
      setSetupLoading(false);
    }
  };

  // Webhook secret migration
  const migrateWebhookSecrets = async () => {
    if (!confirm('Bu işlem tüm aktif Shopify integration\'larına webhook secret ekleyecek. Devam etmek istediğinizden emin misiniz?')) {
      return;
    }

    setSetupLoading(true);
    setError(null);
    setMessage(null);

    try {
      const token = await getCurrentUserToken();
      
      const response = await fetch(`/api/admin/integrations/shopify/webhooks/migrate-secrets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage(`✅ Webhook Secret Migration tamamlandı! ${data.message}`);
        logger.info("Webhook secrets migration successful:", data);
      } else {
        const errorMsg = data.error || 'Migration başarısız';
        throw new Error(errorMsg);
      }
    } catch (error) {
      logger.error("Error migrating webhook secrets:", error);
      setError(`❌ Migration hatası: ${error.message}`);
    } finally {
      setSetupLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchWebhooks();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="p-4 text-center text-gray-500">
        Webhook yönetimine erişim için yetki gerekli
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Shopify Webhook Yönetimi
        </h3>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {message && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-600">{message}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mb-4">
          <button
            onClick={setupWebhooks}
            disabled={setupLoading || loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {setupLoading && (
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            <span>{setupLoading ? 'Kuruluyor...' : 'Webhook\'ları Kur'}</span>
          </button>
          
          <button
            onClick={testAllWebhooks}
            disabled={loading || setupLoading || webhooks.length === 0}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {setupLoading && (
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            <span>Tümünü Test Et</span>
          </button>
          
          <button
            onClick={migrateWebhookSecrets}
            disabled={loading || setupLoading}
            className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {setupLoading && (
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            <span>Webhook Secrets Migrate Et</span>
          </button>
          
          <button
            onClick={removeWebhooks}
            disabled={loading || setupLoading}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Webhook'ları Kaldır
          </button>
          
          <button
            onClick={fetchWebhooks}
            disabled={loading || setupLoading}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Yükleniyor...' : 'Yenile'}
          </button>
        </div>

        {/* Webhook Status Info */}
        <div className="bg-gray-50 rounded-md p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            Webhook Endpoint
          </h4>
          <code className="text-xs text-gray-600 bg-white p-2 rounded border">
            {process.env.NEXT_PUBLIC_BASE_URL}/api/admin/integrations/shopify/webhooks/receiver
          </code>
        </div>
      </div>

      {/* Active Webhooks */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">
          Aktif Webhook'lar ({webhooks.length})
        </h4>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Webhook'lar yükleniyor...</p>
          </div>
        ) : webhooks.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <p className="text-gray-500">Henüz webhook kurulmamış</p>
            <p className="text-sm text-gray-400 mt-1">
              Webhook'ları kurmak için yukarıdaki 'Webhook'ları Kur' butonunu kullanın
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {webhooks.map((webhook, index) => (
              <div key={webhook.id || index} className="flex items-center justify-between p-4 border border-gray-200 rounded-md bg-gray-50">
                <div className="flex-1">
                  <div className="font-medium text-sm text-gray-900">
                    {webhook.topic}
                  </div>
                  {webhook.address && (
                    <div className="text-xs text-gray-500 mt-1">
                      {webhook.address}
                    </div>
                  )}
                  <div className="text-xs text-gray-400 mt-1">
                    ID: {webhook.id}
                    {webhook.created_at && ` • Oluşturulma: ${new Date(webhook.created_at).toLocaleDateString('tr-TR')}`}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => testWebhook(webhook)}
                    className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors disabled:opacity-50"
                    disabled={setupLoading}
                  >
                    🧪 Test
                  </button>
                  <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                    Aktif
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Webhook Info */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <h5 className="text-sm font-medium text-blue-900 mb-2">
          📘 Webhook Hakkında
        </h5>
        <div className="text-sm text-blue-700 space-y-1">
          <p>• Webhook'lar Shopify'dan gerçek zamanlı veri alımı sağlar</p>
          <p>• Sipariş güncellemeleri otomatik olarak sisteme yansıtılır</p>
          <p>• HMAC imza doğrulaması ile güvenlik sağlanır</p>
          <p>• Webhook'lar manuel senkronizasyon ihtiyacını azaltır</p>
        </div>
      </div>
    </div>
  );
}