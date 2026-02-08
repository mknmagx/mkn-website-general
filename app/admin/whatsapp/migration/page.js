'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  FileSearch,
  Database,
  ArrowRight,
  Clock,
  Info,
  Phone,
  MessageSquare
} from 'lucide-react';

export default function WhatsAppMigrationPage() {
  // WhatsApp Migration States
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [migrationResult, setMigrationResult] = useState(null);
  const [error, setError] = useState(null);

  // Phone Normalization States
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [phonePreviewData, setPhonePreviewData] = useState(null);
  const [phoneMigrationResult, setPhoneMigrationResult] = useState(null);
  const [phoneError, setPhoneError] = useState(null);

  const handlePreview = async () => {
    setLoading(true);
    setError(null);
    setPreviewData(null);
    setMigrationResult(null);

    try {
      const response = await fetch('/api/admin/whatsapp/migrate?action=preview');
      const data = await response.json();

      if (data.success) {
        setPreviewData(data.data);
      } else {
        setError(data.error || 'Preview failed');
      }
    } catch (err) {
      console.error('Preview error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMigration = async (dryRun = false) => {
    if (!dryRun && !confirm('⚠️ Bu işlem veritabanını güncelleyecek. Devam etmek istediğinize emin misiniz?')) {
      return;
    }

    setLoading(true);
    setError(null);
    setMigrationResult(null);

    try {
      const response = await fetch('/api/admin/whatsapp/migrate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dryRun,
          limit: 1000,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMigrationResult(data.data);
        if (!dryRun) {
          // Başarılı migration sonrası preview'i yenile
          setTimeout(() => handlePreview(), 2000);
        }
      } else {
        setError(data.error || 'Migration failed');
      }
    } catch (err) {
      console.error('Migration error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // Phone Normalization Handlers
  // ============================================

  const handlePhonePreview = async () => {
    setPhoneLoading(true);
    setPhoneError(null);
    setPhonePreviewData(null);
    setPhoneMigrationResult(null);

    try {
      const response = await fetch('/api/admin/crm-v2/phone-migration?action=preview');
      const data = await response.json();

      if (data.success) {
        setPhonePreviewData(data.data);
      } else {
        setPhoneError(data.error || 'Preview failed');
      }
    } catch (err) {
      console.error('Phone preview error:', err);
      setPhoneError(err.message);
    } finally {
      setPhoneLoading(false);
    }
  };

  const handlePhoneMigration = async (dryRun = false, collections = ['customers', 'conversations', 'companies']) => {
    if (!dryRun && !confirm('⚠️ Bu işlem veritabanındaki tüm telefon numaralarını normalize edecek. Devam etmek istediğinize emin misiniz?')) {
      return;
    }

    setPhoneLoading(true);
    setPhoneError(null);
    setPhoneMigrationResult(null);

    try {
      const response = await fetch('/api/admin/crm-v2/phone-migration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dryRun,
          collections,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setPhoneMigrationResult(data.data);
        if (!dryRun) {
          // Başarılı migration sonrası preview'i yenile
          setTimeout(() => handlePhonePreview(), 2000);
        }
      } else {
        setPhoneError(data.error || 'Phone migration failed');
      }
    } catch (err) {
      console.error('Phone migration error:', err);
      setPhoneError(err.message);
    } finally {
      setPhoneLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl max-h-full overflow-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">CRM Migration Araçları</h1>
        <p className="text-muted-foreground">
          WhatsApp metadata güncellemeleri ve telefon numarası normalizasyonu
        </p>
      </div>

      <Tabs defaultValue="whatsapp" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="whatsapp" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            WhatsApp Migration
          </TabsTrigger>
          <TabsTrigger value="phone" className="gap-2">
            <Phone className="h-4 w-4" />
            Telefon Normalizasyon
          </TabsTrigger>
        </TabsList>

        {/* ========================================== */}
        {/* WhatsApp Migration Tab */}
        {/* ========================================== */}
        <TabsContent value="whatsapp" className="space-y-6">      {/* Info Alert */}
      <Alert className="mb-6 border-blue-200 bg-blue-50">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-900">
          <strong>Bu araç ne yapar?</strong>
          <ul className="mt-2 ml-4 list-disc space-y-1 text-sm">
            <li>WhatsApp conversation'larını Firestore'dan okur</li>
            <li>CRM conversation'larını telefon numaralarıyla eşleştirir</li>
            <li>Eksik WhatsApp metadata field'larını (waId, whatsappConversationId, profileName, vb.) doldurur</li>
            <li>Quote form ve contact form kaynaklı conversation'lara WhatsApp bağlantısı ekler</li>
          </ul>
        </AlertDescription>
      </Alert>

      {/* Error Alert */}
      {error && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <XCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-900">
            <strong>Hata:</strong> {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Actions */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>İşlemler</CardTitle>
          <CardDescription>
            Önce preview yaparak hangi conversation'ların güncelleneceğini görün
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handlePreview}
              disabled={loading}
              variant="outline"
              className="gap-2"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileSearch className="h-4 w-4" />
              )}
              Preview Migration
            </Button>

            <Button
              onClick={() => handleMigration(true)}
              disabled={loading || !previewData}
              variant="outline"
              className="gap-2"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Database className="h-4 w-4" />
              )}
              Dry Run (Test)
            </Button>

            <Button
              onClick={() => handleMigration(false)}
              disabled={loading || !previewData}
              className="gap-2 bg-green-600 hover:bg-green-700"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowRight className="h-4 w-4" />
              )}
              Run Migration (Canlı)
            </Button>
          </div>

          <div className="text-sm text-muted-foreground space-y-1">
            <p><strong>Preview:</strong> Değişiklik yapmaz, sadece rapor oluşturur</p>
            <p><strong>Dry Run:</strong> Hangi güncellemelerin yapılacağını simüle eder, veritabanına dokunmaz</p>
            <p><strong>Run Migration:</strong> Gerçek güncellemeyi yapar (geri alınamaz)</p>
          </div>
        </CardContent>
      </Card>

      {/* Preview Results */}
      {previewData && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Preview Sonuçları</CardTitle>
            <CardDescription>
              Güncelleme yapılmadan önce durum raporu
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
              <div className="p-4 border rounded-lg">
                <div className="text-2xl font-bold">{previewData.summary.totalCrmConversations}</div>
                <div className="text-sm text-muted-foreground">Toplam CRM</div>
              </div>
              <div className="p-4 border rounded-lg bg-green-50">
                <div className="text-2xl font-bold text-green-600">{previewData.summary.alreadyComplete}</div>
                <div className="text-sm text-green-600">Tamamlanmış</div>
              </div>
              <div className="p-4 border rounded-lg bg-blue-50">
                <div className="text-2xl font-bold text-blue-600">{previewData.summary.needsUpdate}</div>
                <div className="text-sm text-blue-600">Güncellenmeli</div>
              </div>
              <div className="p-4 border rounded-lg bg-amber-50">
                <div className="text-2xl font-bold text-amber-600">{previewData.summary.noWhatsAppMatch}</div>
                <div className="text-sm text-amber-600">WA Yok</div>
              </div>
              <div className="p-4 border rounded-lg bg-purple-50">
                <div className="text-2xl font-bold text-purple-600">{previewData.summary.whatsappChannelConversations}</div>
                <div className="text-sm text-purple-600">WA Channel</div>
              </div>
              <div className="p-4 border rounded-lg bg-red-50">
                <div className="text-2xl font-bold text-red-600">{previewData.summary.errors}</div>
                <div className="text-sm text-red-600">Hata</div>
              </div>
            </div>

            {/* Conversations Needing Update */}
            {previewData.details.conversationsNeedingUpdate.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Güncellenmesi Gereken Conversation'lar ({previewData.details.conversationsNeedingUpdate.length})</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {previewData.details.conversationsNeedingUpdate.slice(0, 20).map((conv, idx) => (
                    <div key={conv.id} className="p-3 border rounded-lg text-sm">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-mono text-xs text-muted-foreground">{conv.id}</div>
                        <Badge variant="outline">{conv.channel}</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-muted-foreground">İsim:</span> {conv.name}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Telefon:</span> {conv.phone}
                        </div>
                        <div className="col-span-2">
                          <span className="text-muted-foreground">Eksik Field'lar:</span>{' '}
                          <span className="text-red-600">
                            {Object.keys(conv.missingFields).filter(k => conv.missingFields[k]).join(', ')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {previewData.details.conversationsNeedingUpdate.length > 20 && (
                    <div className="text-center text-sm text-muted-foreground py-2">
                      ... ve {previewData.details.conversationsNeedingUpdate.length - 20} tane daha
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Conversations Already Complete */}
            {previewData.details.conversationsAlreadyComplete.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold mb-3 text-green-600">
                  <CheckCircle2 className="h-4 w-4 inline mr-1" />
                  Zaten Tamamlanmış ({previewData.details.conversationsAlreadyComplete.length})
                </h3>
                <div className="text-sm text-muted-foreground">
                  Bu conversation'ların tüm WhatsApp metadata'sı mevcut
                </div>
              </div>
            )}

            {/* Conversations Without WhatsApp */}
            {previewData.details.conversationsWithoutWhatsApp.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 text-amber-600">
                  <AlertTriangle className="h-4 w-4 inline mr-1" />
                  WhatsApp Eşleşmesi Yok ({previewData.details.conversationsWithoutWhatsApp.length})
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {previewData.details.conversationsWithoutWhatsApp.slice(0, 10).map((conv, idx) => (
                    <div key={conv.id} className="p-2 border rounded text-xs">
                      <div className="font-mono text-muted-foreground">{conv.id}</div>
                      <div>{conv.name} - {conv.reason}</div>
                    </div>
                  ))}
                  {previewData.details.conversationsWithoutWhatsApp.length > 10 && (
                    <div className="text-center text-sm text-muted-foreground py-2">
                      ... ve {previewData.details.conversationsWithoutWhatsApp.length - 10} tane daha
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Migration Result */}
      {migrationResult && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-900">
              <CheckCircle2 className="h-5 w-5 inline mr-2" />
              Migration Tamamlandı!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="p-3 bg-white rounded-lg">
                <div className="text-xl font-bold">{migrationResult.analyzed}</div>
                <div className="text-sm text-muted-foreground">Analiz Edildi</div>
              </div>
              <div className="p-3 bg-white rounded-lg">
                <div className="text-xl font-bold text-green-600">{migrationResult.updated}</div>
                <div className="text-sm text-green-600">Güncellendi</div>
              </div>
              <div className="p-3 bg-white rounded-lg">
                <div className="text-xl font-bold text-gray-600">{migrationResult.skipped}</div>
                <div className="text-sm text-gray-600">Atlandı</div>
              </div>
              <div className="p-3 bg-white rounded-lg">
                <div className="text-xl font-bold text-red-600">{migrationResult.errors.length}</div>
                <div className="text-sm text-red-600">Hata</div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-green-900">
              <Clock className="h-4 w-4" />
              <span>Süre: {migrationResult.duration}</span>
            </div>

            {migrationResult.errors.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold text-red-900 mb-2">Hatalar:</h4>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {migrationResult.errors.map((err, idx) => (
                    <div key={idx} className="text-xs text-red-800">
                      {err.id || 'Unknown'}: {err.error}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
        </TabsContent>

        {/* ========================================== */}
        {/* Phone Normalization Tab */}
        {/* ========================================== */}
        <TabsContent value="phone" className="space-y-6">
          {/* Info Alert */}
          <Alert className="border-purple-200 bg-purple-50">
            <Phone className="h-4 w-4 text-purple-600" />
            <AlertDescription className="text-purple-900">
              <strong>Bu araç ne yapar?</strong>
              <ul className="mt-2 ml-4 list-disc space-y-1 text-sm">
                <li>Tüm telefon numaralarını standart formata dönüştürür (sadece rakam, ülke kodu dahil)</li>
                <li>100+ ülke kodu desteği ile uluslararası numaralar tanınır</li>
                <li>CRM Customers, Conversations ve Companies koleksiyonlarını günceller</li>
                <li>Duplicate conversation sorunlarını önler</li>
              </ul>
              <div className="mt-3 p-2 bg-white/50 rounded text-xs">
                <strong>Örnek:</strong> "+90 536 592 30 35" → "905365923035"
              </div>
            </AlertDescription>
          </Alert>

          {/* Phone Error Alert */}
          {phoneError && (
            <Alert className="border-red-200 bg-red-50">
              <XCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-900">
                <strong>Hata:</strong> {phoneError}
              </AlertDescription>
            </Alert>
          )}

          {/* Phone Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Telefon Normalizasyon İşlemleri</CardTitle>
              <CardDescription>
                Önce preview yaparak hangi kayıtların güncelleneceğini görün
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={handlePhonePreview}
                  disabled={phoneLoading}
                  variant="outline"
                  className="gap-2"
                >
                  {phoneLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <FileSearch className="h-4 w-4" />
                  )}
                  Preview
                </Button>

                <Button
                  onClick={() => handlePhoneMigration(true)}
                  disabled={phoneLoading || !phonePreviewData}
                  variant="outline"
                  className="gap-2"
                >
                  {phoneLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Database className="h-4 w-4" />
                  )}
                  Dry Run (Test)
                </Button>

                <Button
                  onClick={() => handlePhoneMigration(false)}
                  disabled={phoneLoading || !phonePreviewData}
                  className="gap-2 bg-purple-600 hover:bg-purple-700"
                >
                  {phoneLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowRight className="h-4 w-4" />
                  )}
                  Normalize Et (Canlı)
                </Button>
              </div>

              <div className="text-sm text-muted-foreground space-y-1">
                <p><strong>Preview:</strong> Değişiklik yapmaz, sadece rapor oluşturur</p>
                <p><strong>Dry Run:</strong> Hangi güncellemelerin yapılacağını simüle eder</p>
                <p><strong>Normalize Et:</strong> Gerçek güncellemeyi yapar (geri alınamaz)</p>
              </div>
            </CardContent>
          </Card>

          {/* Phone Preview Results */}
          {phonePreviewData && (
            <Card>
              <CardHeader>
                <CardTitle>Preview Sonuçları</CardTitle>
                <CardDescription>
                  Normalize edilecek telefon numaralarının raporu
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  {/* Customers */}
                  <div className="p-4 border rounded-lg">
                    <div className="text-sm font-medium text-muted-foreground mb-2">Customers</div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <div className="text-lg font-bold text-blue-600">{phonePreviewData.customers?.needsUpdate?.length || 0}</div>
                        <div className="text-xs text-muted-foreground">Güncellenmeli</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-green-600">{phonePreviewData.customers?.alreadyNormalized?.length || 0}</div>
                        <div className="text-xs text-muted-foreground">Zaten OK</div>
                      </div>
                    </div>
                  </div>

                  {/* Conversations */}
                  <div className="p-4 border rounded-lg">
                    <div className="text-sm font-medium text-muted-foreground mb-2">Conversations</div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <div className="text-lg font-bold text-blue-600">{phonePreviewData.conversations?.needsUpdate?.length || 0}</div>
                        <div className="text-xs text-muted-foreground">Güncellenmeli</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-green-600">{phonePreviewData.conversations?.alreadyNormalized?.length || 0}</div>
                        <div className="text-xs text-muted-foreground">Zaten OK</div>
                      </div>
                    </div>
                  </div>

                  {/* Companies */}
                  <div className="p-4 border rounded-lg">
                    <div className="text-sm font-medium text-muted-foreground mb-2">Companies</div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <div className="text-lg font-bold text-blue-600">{phonePreviewData.companies?.needsUpdate?.length || 0}</div>
                        <div className="text-xs text-muted-foreground">Güncellenmeli</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-green-600">{phonePreviewData.companies?.alreadyNormalized?.length || 0}</div>
                        <div className="text-xs text-muted-foreground">Zaten OK</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Details - Customers needing update */}
                {phonePreviewData.customers?.needsUpdate?.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium mb-2 text-sm">Güncellenecek Customers ({phonePreviewData.customers.needsUpdate.length})</h4>
                    <div className="space-y-1 max-h-48 overflow-y-auto border rounded p-2">
                      {phonePreviewData.customers.needsUpdate.slice(0, 15).map((item, idx) => (
                        <div key={idx} className="text-xs flex items-center gap-2 py-1 border-b last:border-0">
                          <span className="font-mono text-muted-foreground w-20 truncate">{item.id?.slice(0, 8)}...</span>
                          <span className="text-red-500 line-through">{item.oldPhone || item.oldWhatsappNumber}</span>
                          <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          <span className="text-green-600 font-medium">{item.newPhone || item.newWhatsappNumber}</span>
                        </div>
                      ))}
                      {phonePreviewData.customers.needsUpdate.length > 15 && (
                        <div className="text-xs text-center text-muted-foreground py-1">
                          ... ve {phonePreviewData.customers.needsUpdate.length - 15} tane daha
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Details - Conversations needing update */}
                {phonePreviewData.conversations?.needsUpdate?.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium mb-2 text-sm">Güncellenecek Conversations ({phonePreviewData.conversations.needsUpdate.length})</h4>
                    <div className="space-y-1 max-h-48 overflow-y-auto border rounded p-2">
                      {phonePreviewData.conversations.needsUpdate.slice(0, 15).map((item, idx) => (
                        <div key={idx} className="text-xs flex items-center gap-2 py-1 border-b last:border-0">
                          <span className="font-mono text-muted-foreground w-20 truncate">{item.id?.slice(0, 8)}...</span>
                          <span className="text-red-500 line-through">{item.oldSenderPhone || item.oldWaId}</span>
                          <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          <span className="text-green-600 font-medium">{item.newSenderPhone || item.newWaId}</span>
                        </div>
                      ))}
                      {phonePreviewData.conversations.needsUpdate.length > 15 && (
                        <div className="text-xs text-center text-muted-foreground py-1">
                          ... ve {phonePreviewData.conversations.needsUpdate.length - 15} tane daha
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Details - Companies needing update */}
                {phonePreviewData.companies?.needsUpdate?.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2 text-sm">Güncellenecek Companies ({phonePreviewData.companies.needsUpdate.length})</h4>
                    <div className="space-y-1 max-h-48 overflow-y-auto border rounded p-2">
                      {phonePreviewData.companies.needsUpdate.slice(0, 15).map((item, idx) => (
                        <div key={idx} className="text-xs flex items-center gap-2 py-1 border-b last:border-0">
                          <span className="font-mono text-muted-foreground w-20 truncate">{item.id?.slice(0, 8)}...</span>
                          <span className="text-red-500 line-through">{item.oldPhone || item.oldWhatsappNumber}</span>
                          <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          <span className="text-green-600 font-medium">{item.newPhone || item.newWhatsappNumber}</span>
                        </div>
                      ))}
                      {phonePreviewData.companies.needsUpdate.length > 15 && (
                        <div className="text-xs text-center text-muted-foreground py-1">
                          ... ve {phonePreviewData.companies.needsUpdate.length - 15} tane daha
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Phone Migration Result */}
          {phoneMigrationResult && (
            <Card className="border-purple-200 bg-purple-50">
              <CardHeader>
                <CardTitle className="text-purple-900">
                  <CheckCircle2 className="h-5 w-5 inline mr-2" />
                  Telefon Normalizasyonu Tamamlandı!
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="p-3 bg-white rounded-lg">
                    <div className="text-xl font-bold">{phoneMigrationResult.summary?.totalUpdated + phoneMigrationResult.summary?.totalSkipped || 0}</div>
                    <div className="text-sm text-muted-foreground">Toplam Kayıt</div>
                  </div>
                  <div className="p-3 bg-white rounded-lg">
                    <div className="text-xl font-bold text-purple-600">{phoneMigrationResult.summary?.totalUpdated || 0}</div>
                    <div className="text-sm text-purple-600">Güncellendi</div>
                  </div>
                  <div className="p-3 bg-white rounded-lg">
                    <div className="text-xl font-bold text-gray-600">{phoneMigrationResult.summary?.totalSkipped || 0}</div>
                    <div className="text-sm text-gray-600">Atlandı</div>
                  </div>
                  <div className="p-3 bg-white rounded-lg">
                    <div className="text-xl font-bold text-red-600">{phoneMigrationResult.summary?.totalErrors || 0}</div>
                    <div className="text-sm text-red-600">Hata</div>
                  </div>
                </div>

                {phoneMigrationResult.summary?.mode === 'DRY RUN' && (
                  <Alert className="border-amber-200 bg-amber-50 mb-4">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-amber-900">
                      <strong>Dry Run:</strong> Bu bir test çalıştırmasıydı, veritabanında değişiklik yapılmadı.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Collection breakdown */}
                <div className="grid grid-cols-3 gap-2 text-sm mb-4">
                  <div className="p-2 bg-white rounded text-center">
                    <div className="font-medium">Customers</div>
                    <div className="text-xs text-muted-foreground">{phoneMigrationResult.customers?.updated || 0} güncellendi</div>
                  </div>
                  <div className="p-2 bg-white rounded text-center">
                    <div className="font-medium">Conversations</div>
                    <div className="text-xs text-muted-foreground">{phoneMigrationResult.conversations?.updated || 0} güncellendi</div>
                  </div>
                  <div className="p-2 bg-white rounded text-center">
                    <div className="font-medium">Companies</div>
                    <div className="text-xs text-muted-foreground">{phoneMigrationResult.companies?.updated || 0} güncellendi</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-purple-900">
                  <Clock className="h-4 w-4" />
                  <span>Süre: {phoneMigrationResult.summary?.duration}</span>
                </div>

                {phoneMigrationResult.summary?.totalErrors > 0 && (
                  <div className="mt-4">
                    <h4 className="font-semibold text-red-900 mb-2">Hatalar:</h4>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {[
                        ...(phoneMigrationResult.customers?.errors || []),
                        ...(phoneMigrationResult.conversations?.errors || []),
                        ...(phoneMigrationResult.companies?.errors || [])
                      ].map((err, idx) => (
                        <div key={idx} className="text-xs text-red-800">
                          {err.id || 'Unknown'}: {err.error || err.message}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
