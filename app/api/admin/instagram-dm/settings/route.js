/**
 * Instagram DM Settings API Route
 * GET: Ayarları getir
 * POST: Ayarları kaydet
 * DELETE: Bağlantıyı kes
 */

import { NextResponse } from 'next/server';
import {
  getSettings,
  saveSettings,
  checkConnectionStatus,
  disconnect,
  getOrCreateWebhookVerifyToken,
} from '@/lib/services/instagram-dm';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    // Test connection
    if (action === 'test') {
      const connectionStatus = await checkConnectionStatus();
      return NextResponse.json({
        success: true,
        data: connectionStatus,
      });
    }

    // Fetch account info from access token
    if (action === 'fetch-account') {
      const settings = await getSettings();
      
      // System User Token kullan
      const tokenToUse = settings?.systemUserToken;
      
      if (!tokenToUse) {
        return NextResponse.json({
          success: false,
          error: 'System User Token bulunamadı. Önce bir token kaydedin.',
        }, { status: 400 });
      }

      const updates = { ...settings };
      let pageAccessToken = null; // Page-specific token

      try {
        // 1. Page bilgilerini al (access_token field'ı ile Page Access Token'ı da al)
        const pagesResponse = await fetch(
          `https://graph.facebook.com/v21.0/me/accounts?fields=id,name,access_token,instagram_business_account&access_token=${tokenToUse}`
        );
        const pagesData = await pagesResponse.json();
        
        if (pagesData.error) {
          return NextResponse.json({
            success: false,
            error: pagesData.error.message,
            details: pagesData.error,
          }, { status: 400 });
        }

        if (!pagesData.data || pagesData.data.length === 0) {
          return NextResponse.json({
            success: false,
            error: 'Bu Access Token ile ilişkili Facebook sayfası bulunamadı.',
          }, { status: 400 });
        }

        const page = pagesData.data[0];
        updates.pageId = page.id;
        updates.pageName = page.name;
        
        // Page Access Token'ı kaydet (Page-specific endpoint'ler için gerekli)
        if (page.access_token) {
          pageAccessToken = page.access_token;
          updates.pageAccessToken = page.access_token;
          console.log('📝 Page Access Token alındı ve kaydedildi');
        }

        // 2. Instagram Business Account'ı al
        const igAccountResponse = await fetch(
          `https://graph.facebook.com/v21.0/${page.id}?fields=instagram_business_account&access_token=${tokenToUse}`
        );
        const igAccountData = await igAccountResponse.json();

        if (!igAccountData.instagram_business_account) {
          return NextResponse.json({
            success: false,
            error: 'Bu Facebook sayfasına bağlı Instagram Business hesabı bulunamadı.',
            pageInfo: { pageId: page.id, pageName: page.name },
          }, { status: 400 });
        }

        updates.instagramAccountId = igAccountData.instagram_business_account.id;

        // 3. Instagram username'i al
        const igProfileResponse = await fetch(
          `https://graph.facebook.com/v21.0/${updates.instagramAccountId}?fields=username,name&access_token=${tokenToUse}`
        );
        const igProfileData = await igProfileResponse.json();

        if (igProfileData.username) {
          updates.instagramUsername = igProfileData.username;
        }

        // Kaydet
        await saveSettings(updates);

        return NextResponse.json({
          success: true,
          data: {
            pageId: updates.pageId,
            pageName: updates.pageName,
            instagramAccountId: updates.instagramAccountId,
            instagramUsername: updates.instagramUsername,
            hasPageAccessToken: !!updates.pageAccessToken,
          },
          message: 'Hesap bilgileri başarıyla alındı ve kaydedildi.' + (updates.pageAccessToken ? ' Page Access Token da kaydedildi.' : ''),
        });

      } catch (fetchError) {
        return NextResponse.json({
          success: false,
          error: fetchError.message,
        }, { status: 500 });
      }
    }

    // Full API Test - Tüm endpoint'leri test et
    if (action === 'full-api-test') {
      const settings = await getSettings();
      
      // System User Token - /me/accounts gibi endpoint'ler için
      // Page Access Token - IG Conversations için
      
      // DEBUG: Token'ları logla
      console.log('=== FULL API TEST - TOKEN DEBUG ===');
      console.log('System User Token (ilk 16):', settings?.systemUserToken ? settings.systemUserToken.substring(0, 16) : 'YOK');
      console.log('Page Access Token (ilk 16):', settings?.pageAccessToken ? settings.pageAccessToken.substring(0, 16) : 'YOK');
      console.log('===================================');
      
      if (!settings?.systemUserToken && !settings?.pageAccessToken) {
        return NextResponse.json({
          success: false,
          error: 'System User Token veya Page Access Token bulunamadı. Ayarlar sayfasından token girin.',
        }, { status: 400 });
      }

      const results = {
        timestamp: new Date().toISOString(),
        // Debug bilgileri response'a da ekle
        tokenDebug: {
          systemUserToken: settings?.systemUserToken ? settings.systemUserToken.substring(0, 16) + '...' : null,
          pageAccessToken: settings?.pageAccessToken ? settings.pageAccessToken.substring(0, 16) + '...' : null,
        },
        note: 'System User Token: /me/accounts için | Page Access Token: IG Conversations için',
        tests: []
      };

      try {
        // Test 1: System User Token Validation
        if (settings.systemUserToken) {
          const debugRes = await fetch(
            `https://graph.facebook.com/v21.0/debug_token?input_token=${settings.systemUserToken}&access_token=${settings.systemUserToken}`
          );
          const debugData = await debugRes.json();
          results.tests.push({
            name: 'System User Token Validation',
            endpoint: '/debug_token',
            success: !debugData.error && debugData.data?.is_valid,
            tokenUsed: 'System User Token ✓',
            data: debugData.error ? debugData.error : {
              isValid: debugData.data?.is_valid,
              type: debugData.data?.type,
              expiresAt: debugData.data?.expires_at ? new Date(debugData.data.expires_at * 1000).toISOString() : 'Never',
              scopes: debugData.data?.scopes?.slice(0, 10),
            },
          });
        }

        // Test 2: Page Access Token Validation
        if (settings.pageAccessToken) {
          const debugRes = await fetch(
            `https://graph.facebook.com/v21.0/debug_token?input_token=${settings.pageAccessToken}&access_token=${settings.pageAccessToken}`
          );
          const debugData = await debugRes.json();
          results.tests.push({
            name: 'Page Access Token Validation',
            endpoint: '/debug_token',
            success: !debugData.error && debugData.data?.is_valid,
            tokenUsed: 'Page Access Token ✓',
            data: debugData.error ? debugData.error : {
              isValid: debugData.data?.is_valid,
              type: debugData.data?.type,
              expiresAt: debugData.data?.expires_at ? new Date(debugData.data.expires_at * 1000).toISOString() : 'Never',
              scopes: debugData.data?.scopes?.slice(0, 10),
            },
          });
        }

        // Test 3: Get Pages (System User Token ile)
        if (settings.systemUserToken) {
          const pagesRes = await fetch(
            `https://graph.facebook.com/v21.0/me/accounts?fields=id,name,instagram_business_account&access_token=${settings.systemUserToken}`
          );
          const pagesData = await pagesRes.json();
          results.tests.push({
            name: 'Get Pages',
            endpoint: '/me/accounts',
            success: !pagesData.error && pagesData.data?.length > 0,
            tokenUsed: 'System User Token ✓',
            data: pagesData.error ? pagesData.error : pagesData.data?.map(p => ({ id: p.id, name: p.name, hasIG: !!p.instagram_business_account })),
          });
        }

        // Test 4: Get Instagram Business Account (System User Token ile)
        if (settings.pageId && settings.systemUserToken) {
          const igRes = await fetch(
            `https://graph.facebook.com/v21.0/${settings.pageId}?fields=instagram_business_account{id,username}&access_token=${settings.systemUserToken}`
          );
          const igData = await igRes.json();
          results.tests.push({
            name: 'Instagram Business Account',
            endpoint: `/${settings.pageId}?fields=instagram_business_account`,
            success: !igData.error && !!igData.instagram_business_account,
            tokenUsed: 'System User Token ✓',
            data: igData.error ? igData.error : igData.instagram_business_account,
          });
        }

        // Test 5: Get Conversations (PAGE ACCESS TOKEN GEREKLİ!)
        if (settings.instagramAccountId) {
          if (settings.pageAccessToken) {
            const tokenPreview = `${settings.pageAccessToken.substring(0, 10)}...${settings.pageAccessToken.slice(-5)}`;
            
            const convRes = await fetch(
              `https://graph.facebook.com/v21.0/${settings.instagramAccountId}/conversations?platform=instagram&access_token=${settings.pageAccessToken}`
            );
            const convData = await convRes.json();
            results.tests.push({
              name: 'Get IG Conversations',
              endpoint: `/${settings.instagramAccountId}/conversations?platform=instagram`,
              success: !convData.error,
              data: convData.error ? convData.error : { count: convData.data?.length || 0 },
              critical: true,
              tokenUsed: 'Page Access Token ✓',
              tokenPreview: tokenPreview,
              note: convData.error?.code === 3 ? 'App Review gerekli: instagram_business_manage_messages permission' : undefined,
            });
          } else {
            results.tests.push({
              name: 'Get IG Conversations',
              endpoint: `/${settings.instagramAccountId}/conversations?platform=instagram`,
              success: false,
              data: { message: 'Page Access Token bulunamadı! "Hesap Bilgilerini Çek" butonuna tıklayın.' },
              critical: true,
              tokenUsed: '❌ Page Token YOK',
              note: 'Bu endpoint SADECE Page Access Token kabul eder. System User Token çalışmaz!',
            });
          }
        }

        // Test 6: Page Subscription
        // Bu endpoint PAGE ACCESS TOKEN gerektirir (System User Token çalışmaz!)
        if (settings.pageId) {
          const subToken = settings.pageAccessToken;
          if (subToken) {
            const subRes = await fetch(
              `https://graph.facebook.com/v21.0/${settings.pageId}/subscribed_apps?access_token=${subToken}`
            );
            const subData = await subRes.json();
            results.tests.push({
              name: 'Page Webhook Subscription',
              endpoint: `/${settings.pageId}/subscribed_apps`,
              success: !subData.error,
              data: subData.error ? subData.error : { subscribed: subData.data?.length > 0, apps: subData.data },
              tokenUsed: 'Page Access Token',
            });
          } else {
            results.tests.push({
              name: 'Page Webhook Subscription',
              endpoint: `/${settings.pageId}/subscribed_apps`,
              success: false,
              data: { message: 'Page Access Token bulunamadı. "Hesap Bilgilerini Çek" butonuna tıklayın.' },
              note: 'Bu endpoint için Page Access Token gerekli, System User Token çalışmaz.',
            });
          }
        }

        // Overall status
        results.allPassed = results.tests.every(t => t.success);
        results.passedCount = results.tests.filter(t => t.success).length;
        results.totalCount = results.tests.length;

        return NextResponse.json({
          success: true,
          data: results,
        });

      } catch (fetchError) {
        return NextResponse.json({
          success: false,
          error: fetchError.message,
          data: results,
        }, { status: 500 });
      }
    }

    // Page Subscription Kontrolü
    if (action === 'check-page-subscription') {
      const settings = await getSettings();
      
      // Page Subscription için PAGE ACCESS TOKEN gerekli (System User Token çalışmaz!)
      const tokenToUse = settings?.pageAccessToken;
      
      if (!tokenToUse) {
        return NextResponse.json({
          success: false,
          error: 'Page Access Token bulunamadı. Önce "Hesap Bilgilerini Çek" butonuna tıklayın.',
          hint: 'Page Subscription için Page Access Token gereklidir. System User Token bu endpoint için çalışmaz.',
        }, { status: 400 });
      }
      
      if (!settings?.pageId) {
        return NextResponse.json({
          success: false,
          error: 'Page ID bulunamadı.',
        }, { status: 400 });
      }

      try {
        const response = await fetch(
          `https://graph.facebook.com/v21.0/${settings.pageId}/subscribed_apps?access_token=${tokenToUse}`
        );
        const data = await response.json();

        if (data.error) {
          return NextResponse.json({
            success: false,
            error: data.error.message,
            details: data.error,
          }, { status: 400 });
        }

        return NextResponse.json({
          success: true,
          data: {
            subscribed: data.data && data.data.length > 0,
            apps: data.data || [],
          },
        });
      } catch (fetchError) {
        return NextResponse.json({
          success: false,
          error: fetchError.message,
        }, { status: 500 });
      }
    }

    // Page Subscription Ekleme
    if (action === 'subscribe-page') {
      const settings = await getSettings();
      
      // Page Subscription için PAGE ACCESS TOKEN gerekli (System User Token çalışmaz!)
      const tokenToUse = settings?.pageAccessToken;
      
      if (!tokenToUse) {
        return NextResponse.json({
          success: false,
          error: 'Page Access Token bulunamadı. Önce "Hesap Bilgilerini Çek" butonuna tıklayın.',
          hint: 'Page Subscription için Page Access Token gereklidir. System User Token bu endpoint için çalışmaz.',
        }, { status: 400 });
      }
      
      if (!settings?.pageId) {
        return NextResponse.json({
          success: false,
          error: 'Page ID bulunamadı.',
        }, { status: 400 });
      }

      try {
        const response = await fetch(
          `https://graph.facebook.com/v21.0/${settings.pageId}/subscribed_apps?subscribed_fields=messages,message_reactions,messaging_postbacks,message_reads,messaging_referrals&access_token=${tokenToUse}`,
          { method: 'POST' }
        );
        const data = await response.json();

        if (data.error) {
          return NextResponse.json({
            success: false,
            error: data.error.message,
            details: data.error,
          }, { status: 400 });
        }

        return NextResponse.json({
          success: true,
          data: data,
          message: 'Page webhook\'lara başarıyla subscribe edildi!',
        });
      } catch (fetchError) {
        return NextResponse.json({
          success: false,
          error: fetchError.message,
        }, { status: 500 });
      }
    }

    // Debug - Firestore'daki gerçek verileri göster
    if (action === 'debug') {
      const settings = await getSettings();
      
      // Konuşma ve mesaj sayılarını al
      let conversationCount = 0;
      let messageCount = 0;
      try {
        const { adminDb } = await import('@/lib/firebase-admin');
        const { COLLECTIONS } = await import('@/lib/services/instagram-dm');
        
        const convSnapshot = await adminDb.collection(COLLECTIONS.CONVERSATIONS).count().get();
        conversationCount = convSnapshot.data().count;
        
        const msgSnapshot = await adminDb.collection(COLLECTIONS.MESSAGES).count().get();
        messageCount = msgSnapshot.data().count;
      } catch (e) {
        console.warn('Count error:', e.message);
      }
      
      return NextResponse.json({
        success: true,
        data: {
          // API Yapılandırması
          appId: settings?.appId || null,
          hasAppSecret: !!settings?.appSecret,
          hasSystemUserToken: !!settings?.systemUserToken,
          hasPageAccessToken: !!settings?.pageAccessToken,
          hasWebhookVerifyToken: !!settings?.webhookVerifyToken,
          
          // Hesap Bilgileri
          pageId: settings?.pageId || null,
          pageName: settings?.pageName || null,
          instagramAccountId: settings?.instagramAccountId || null,
          instagramUsername: settings?.instagramUsername || null,
          
          // İstatistikler
          stats: {
            conversations: conversationCount,
            messages: messageCount,
          },
          
          // Bağlantı Zamanı
          connectedAt: settings?.connectedAt || null,
          updatedAt: settings?.updatedAt || null,
        },
      });
    }

    // Debug Token - Token'ı doğrula
    if (action === 'debug-token') {
      const settings = await getSettings();
      
      // System User Token öncelikli
      const tokenToDebug = settings?.systemUserToken || settings?.accessToken;
      const tokenType = settings?.systemUserToken ? 'System User Token' : 'Page Access Token';
      
      if (!tokenToDebug) {
        return NextResponse.json({
          success: false,
          error: 'Token kayıtlı değil',
        }, { status: 400 });
      }

      try {
        const accessToken = tokenToDebug;
        const isFacebookToken = accessToken.startsWith('EAA');
        const isInstagramToken = accessToken.startsWith('IGAAW');
        
        // IGAAW token uyarısı - DM için çalışmaz
        if (isInstagramToken || !isFacebookToken) {
          return NextResponse.json({
            success: false,
            error: 'Instagram User Token (IGAAW) Instagram DM için kullanılamaz!',
            hint: 'Facebook Page Access Token (EAA ile başlayan - EAAW, EAAD vb.) gereklidir.',
            tokenType: isInstagramToken ? 'Instagram API (IGAAW) - DM desteklemiyor' : 'Bilinmeyen token türü',
            tokenFirstChars: accessToken.substring(0, 20) + '...',
            requiredTokenType: 'Facebook Page Access Token (EAA)',
            howToGet: 'Meta Developer Dashboard > Tools > Graph API Explorer > Get Page Access Token',
          }, { status: 400 });
        }
        
        // Facebook Page Token için debug_token kullan
        const debugResponse = await fetch(
          `https://graph.facebook.com/debug_token?input_token=${accessToken}&access_token=${accessToken}`
        );
        const debugData = await debugResponse.json();

        if (debugData.error) {
          // App Access Token ile deneyelim
          if (settings.appId && settings.appSecret) {
            const appToken = `${settings.appId}|${settings.appSecret}`;
            const debugResponse2 = await fetch(
              `https://graph.facebook.com/debug_token?input_token=${tokenToDebug}&access_token=${appToken}`
            );
            const debugData2 = await debugResponse2.json();

            if (debugData2.data) {
              return NextResponse.json({
                success: true,
                data: {
                  tokenType,
                  type: debugData2.data.type,
                  appId: debugData2.data.app_id,
                  userId: debugData2.data.user_id,
                  isValid: debugData2.data.is_valid,
                  expiresAt: debugData2.data.expires_at ? new Date(debugData2.data.expires_at * 1000).toISOString() : 'Never',
                  scopes: debugData2.data.scopes,
                  tokenFirstChars: tokenToDebug.substring(0, 20) + '...',
                  tokenLastChars: '...' + tokenToDebug.slice(-10),
                  tokenLength: tokenToDebug.length,
                },
              });
            }
          }

          return NextResponse.json({
            success: false,
            error: debugData.error.message,
            details: debugData.error,
            tokenType,
            tokenFirstChars: tokenToDebug.substring(0, 20) + '...',
            tokenLastChars: '...' + tokenToDebug.slice(-10),
            tokenLength: tokenToDebug.length,
          }, { status: 400 });
        }

        return NextResponse.json({
          success: true,
          data: {
            tokenType,
            type: debugData.data?.type,
            appId: debugData.data?.app_id,
            userId: debugData.data?.user_id,
            isValid: debugData.data?.is_valid,
            expiresAt: debugData.data?.expires_at ? new Date(debugData.data.expires_at * 1000).toISOString() : 'Never',
            scopes: debugData.data?.scopes,
            tokenFirstChars: tokenToDebug.substring(0, 20) + '...',
            tokenLastChars: '...' + tokenToDebug.slice(-10),
            tokenLength: tokenToDebug.length,
          },
        });
      } catch (error) {
        return NextResponse.json({
          success: false,
          error: error.message,
          tokenType,
          tokenFirstChars: tokenToDebug.substring(0, 20) + '...',
          tokenLastChars: '...' + tokenToDebug.slice(-10),
          tokenLength: tokenToDebug.length,
        }, { status: 500 });
      }
    }

    const [settings, webhookVerifyToken, connectionStatus] = await Promise.all([
      getSettings(),
      getOrCreateWebhookVerifyToken(),
      checkConnectionStatus(),
    ]);

    // Hassas bilgileri maskele
    const safeSettings = settings ? {
      appId: settings.appId || null,
      appSecretMasked: settings.appSecret ? `••••${settings.appSecret.slice(-4)}` : null,
      systemUserTokenMasked: settings.systemUserToken ? `••••${settings.systemUserToken.slice(-4)}` : null,
      pageAccessTokenMasked: settings.pageAccessToken ? `••••${settings.pageAccessToken.slice(-4)}` : null,
      hasPageAccessToken: !!settings.pageAccessToken,
      hasSystemUserToken: !!settings.systemUserToken,
      instagramAccountId: settings.instagramAccountId || null,
      instagramUsername: settings.instagramUsername || null,
      pageId: settings.pageId || null,
      pageName: settings.pageName || null,
      webhookVerifyToken: settings.webhookVerifyToken || webhookVerifyToken,
      connectedAt: settings.connectedAt || null,
    } : {
      webhookVerifyToken,
    };

    return NextResponse.json({
      success: true,
      data: {
        ...safeSettings,
        connectionStatus,
      },
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      appId,        // Meta App ID (Dashboard > Settings > Basic > App ID)
      appSecret,    // Meta App Secret
      systemUserToken, // System User Token - /me/accounts için
      pageAccessToken, // Page Access Token - IG Conversations için
      webhookVerifyToken,
      instagramAccountId,
      instagramUsername,
      pageId,       // Facebook Page ID (Graph API'deki gerçek Page ID)
      pageName,
    } = body;

    // En az appId gerekli
    if (!appId) {
      return NextResponse.json(
        { success: false, error: 'Meta App ID gerekli' },
        { status: 400 }
      );
    }

    // Mevcut ayarları al
    const currentSettings = await getSettings() || {};

    // Güncellenecek alanları hazırla (boş değilse güncelle)
    const updates = {
      ...currentSettings,
    };

    if (appId) updates.appId = appId;
    if (appSecret) updates.appSecret = appSecret;
    if (systemUserToken) updates.systemUserToken = systemUserToken;
    if (pageAccessToken) updates.pageAccessToken = pageAccessToken;
    if (webhookVerifyToken) updates.webhookVerifyToken = webhookVerifyToken;
    if (instagramAccountId) updates.instagramAccountId = instagramAccountId;
    if (instagramUsername) updates.instagramUsername = instagramUsername;
    if (pageId) updates.pageId = pageId;
    if (pageName) updates.pageName = pageName;

    // System User Token ile hesap bilgilerini otomatik çek (eğer pageId yoksa)
    const tokenToUse = systemUserToken || updates.systemUserToken;
    
    if (tokenToUse && !updates.pageId) {
      try {
        console.log('🔍 Fetching account info with System User Token...');
        console.log('   Token kullanılıyor (ilk 16):', tokenToUse.substring(0, 16));
        
        // Page bilgilerini al
        const pagesResponse = await fetch(
          `https://graph.facebook.com/v21.0/me/accounts?fields=id,name,instagram_business_account&access_token=${tokenToUse}`
        );
        const pagesData = await pagesResponse.json();
        
        if (pagesData.data && pagesData.data.length > 0) {
          const page = pagesData.data[0];
          updates.pageId = page.id;
          updates.pageName = page.name;
          console.log('📄 Found Page:', page.name, page.id);
          
          // Page'in Instagram Business Account'ını al
          const igAccountResponse = await fetch(
            `https://graph.facebook.com/v21.0/${page.id}?fields=instagram_business_account&access_token=${tokenToUse}`
          );
          const igAccountData = await igAccountResponse.json();
          
          if (igAccountData.instagram_business_account) {
            updates.instagramAccountId = igAccountData.instagram_business_account.id;
            console.log('📸 Found Instagram Account:', updates.instagramAccountId);
            
            // Instagram kullanıcı adını al
            const igProfileResponse = await fetch(
              `https://graph.facebook.com/v21.0/${updates.instagramAccountId}?fields=username,name&access_token=${tokenToUse}`
            );
            const igProfileData = await igProfileResponse.json();
            
            if (igProfileData.username) {
              updates.instagramUsername = igProfileData.username;
              console.log('👤 Instagram Username:', igProfileData.username);
            }
          } else {
            console.warn('⚠️ No Instagram Business Account linked to this page');
          }
        } else {
          console.warn('⚠️ No pages found for this token');
          if (pagesData.error) {
            console.error('   Error:', pagesData.error.message);
          }
        }
      } catch (fetchError) {
        console.error('Error fetching account info:', fetchError);
        // Hata olsa bile devam et, manuel girilmiş bilgileri kaydet
      }
    }

    updates.connectedAt = new Date();

    await saveSettings(updates);

    // Bağlantı durumunu kontrol et
    const connectionStatus = await checkConnectionStatus();

    return NextResponse.json({
      success: true,
      data: { connectionStatus },
      message: 'Ayarlar kaydedildi',
    });
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    await disconnect();

    return NextResponse.json({
      success: true,
      message: 'Bağlantı kesildi',
    });
  } catch (error) {
    console.error('Error disconnecting:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
