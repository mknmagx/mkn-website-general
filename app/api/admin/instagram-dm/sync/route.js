/**
 * Instagram DM Sync API Route
 * POST: Mesajları Facebook Graph API'den çeker ve Firestore'a kaydeder
 * NOT: Instagram DM için HER ZAMAN graph.facebook.com kullanılır!
 */

import { NextResponse } from 'next/server';
import { getSettings, COLLECTIONS, GRAPH_API_VERSION, GRAPH_API_BASE_URL } from '@/lib/services/instagram-dm';
import { adminDb } from '@/lib/firebase-admin';

// Instagram DM için her zaman Facebook Graph API kullan
const API_BASE = GRAPH_API_BASE_URL;

export async function POST(request) {
  try {
    const settings = await getSettings();

    console.log('🔄 Starting Instagram DM sync...');
    console.log('📋 Settings:', {
      hasPageAccessToken: !!settings?.pageAccessToken,
      hasSystemUserToken: !!settings?.systemUserToken,
      hasInstagramAccountId: !!settings?.instagramAccountId,
      instagramAccountId: settings?.instagramAccountId,
      hasPageId: !!settings?.pageId,
      pageId: settings?.pageId,
    });

    // Page Access Token gerekli (conversations için)
    if (!settings?.pageAccessToken) {
      return NextResponse.json({
        success: false,
        error: 'Page Access Token bulunamadı. Önce API ayarlarını yapılandırın.',
      }, { status: 400 });
    }

    const accessToken = settings.pageAccessToken;
    const instagramAccountId = settings.instagramAccountId;
    const pageId = settings.pageId;

    // Page ID zorunlu - conversations için gerekli
    if (!pageId) {
      return NextResponse.json({
        success: false,
        error: 'Facebook Page ID bulunamadı. Ayarlar sayfasından ekleyin.',
      }, { status: 400 });
    }

    // Token türünü kontrol et - EAA (Facebook Token) gerekli, IGAAW (Instagram Token) değil
    const isFacebookToken = accessToken.startsWith('EAA');
    const isInstagramToken = accessToken.startsWith('IGAAW');
    
    if (isInstagramToken || !isFacebookToken) {
      console.warn('⚠️ Token EAA ile başlamıyor. Instagram DM için Facebook Page Access Token gerekli!');
      return NextResponse.json({
        success: false,
        error: 'Geçersiz token türü. Instagram DM için Facebook Page Access Token (EAA ile başlayan) gereklidir.',
        hint: 'Meta Developer Dashboard > Graph API Explorer > Page Access Token alın. IGAAW tokenları DM için çalışmaz!',
        tokenInfo: {
          currentPrefix: accessToken.substring(0, 10) + '...',
          requiredPrefix: 'EAA... (EAAW, EAAD, vb.)',
          notAllowed: 'IGAAW (Instagram User Token)',
        },
      }, { status: 400 });
    }
    
    console.log('🔑 Token type: Facebook Page Access Token ✓');
    console.log('🌐 Using API: graph.facebook.com');

    // Token'ı test et - /me endpoint'i ile sayfa bilgilerini al
    console.log('🔑 Testing access token...');
    const testUrl = `${API_BASE}/me?fields=id,name&access_token=${accessToken}`;
    console.log('🔗 Test URL:', testUrl.replace(accessToken, '***'));
    
    const testResponse = await fetch(testUrl);
    const testData = await testResponse.json();

    if (testData.error) {
      console.error('❌ Token error:', testData.error);
      return NextResponse.json({
        success: false,
        error: `Token hatası: ${testData.error.message}`,
        errorDetails: testData.error,
        hint: getErrorHint(testData.error.code),
      }, { status: 400 });
    }

    console.log('✅ Token valid! Page:', testData.name || testData.id);

    // Facebook Page üzerinden Instagram conversations al
    console.log('📬 Fetching Instagram conversations via Facebook Page...');
    console.log('📄 Using Page ID:', pageId);
    
    // Facebook Graph API conversations endpoint - PAGE_ID kullan!
    // Instagram DM için: /{PAGE_ID}/conversations?platform=instagram
    const conversationsUrl = `${API_BASE}/${pageId}/conversations?platform=instagram&fields=id,participants,updated_time,messages.limit(20){id,created_time,from,message}&access_token=${accessToken}`;
    console.log('🌐 Conversations URL:', conversationsUrl.replace(accessToken, '***'));

    const conversationsResponse = await fetch(conversationsUrl);
    const conversationsData = await conversationsResponse.json();

    console.log('📨 Conversations API Response:', JSON.stringify(conversationsData, null, 2));

    if (conversationsData.error) {
      // Hata detaylarını göster
      return NextResponse.json({
        success: false,
        error: conversationsData.error.message,
        errorCode: conversationsData.error.code,
        errorSubcode: conversationsData.error.error_subcode,
        errorDetails: conversationsData.error,
        hint: getErrorHint(conversationsData.error.code),
        debugInfo: {
          pageId,
          instagramAccountId,
          tokenFirstChars: accessToken.substring(0, 20) + '...',
        },
      }, { status: 400 });
    }

    if (!conversationsData.data || conversationsData.data.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Henüz konuşma bulunmuyor veya API erişimi sınırlı.',
        synced: { conversations: 0, messages: 0 },
        note: 'Development modunda sadece test kullanıcılarının mesajları görünür. App Review onayı gerekebilir.',
      });
    }

    let syncedConversations = 0;
    let syncedMessages = 0;

    // Her konuşmayı işle
    for (const conversation of conversationsData.data) {
      try {
        console.log('💬 Processing conversation:', conversation.id);
        
        // Participant'ları bul
        const participants = conversation.participants?.data || [];
        const otherParticipant = participants.find(p => p.id !== instagramAccountId && p.id !== pageId);
        
        console.log('👥 Participants:', participants.map(p => ({ id: p.id, username: p.username })));

        // Kullanıcı bilgilerini al
        let username = otherParticipant?.username || `user_${otherParticipant?.id || conversation.id}`;
        let igUserId = otherParticipant?.id || conversation.id;

        const messages = conversation.messages?.data || [];
        const lastMessage = messages[0];

        // Konuşmayı Firestore'a kaydet/güncelle
        const conversationRef = adminDb.collection(COLLECTIONS.CONVERSATIONS).doc(igUserId);
        const existingConv = await conversationRef.get();

        const conversationData = {
          igConversationId: conversation.id,
          igUserId: igUserId,
          igUsername: username,
          platform: 'instagram', // Sync her zaman Instagram'dan gelir
          lastMessageAt: conversation.updated_time ? new Date(conversation.updated_time) : new Date(),
          lastMessagePreview: lastMessage?.message?.substring(0, 100) || '',
          status: 'open',
          unreadCount: existingConv.exists ? existingConv.data().unreadCount || 0 : messages.length,
          updatedAt: new Date(),
        };

        if (!existingConv.exists) {
          conversationData.createdAt = new Date();
        }

        await conversationRef.set(conversationData, { merge: true });
        syncedConversations++;
        console.log('✅ Conversation saved:', igUserId);

        // Mesajları kaydet
        for (const msg of messages) {
          try {
            console.log('📝 Processing message:', JSON.stringify(msg, null, 2));
            
            const messageRef = adminDb
              .collection(COLLECTIONS.MESSAGES)
              .doc(msg.id);

            const existingMsg = await messageRef.get();
            if (existingMsg.exists) {
              console.log('⏭️ Message already exists:', msg.id);
              continue;
            }

            const isFromCustomer = msg.from?.id !== instagramAccountId && msg.from?.id !== pageId;
            
            // Mesaj içeriği - farklı field'ları kontrol et
            const messageContent = msg.message || msg.text || msg.body || '';
            console.log('💬 Message content:', messageContent);

            await messageRef.set({
              igMessageId: msg.id,
              conversationId: igUserId,  // Conversation document ID ile eşleşmeli
              senderId: msg.from?.id || 'unknown',
              senderUsername: msg.from?.username || '',
              isFromCustomer: isFromCustomer,
              content: messageContent,
              platform: 'instagram', // Sync her zaman Instagram'dan gelir
              messageType: msg.attachments ? 'media' : 'text',
              sentAt: msg.created_time ? new Date(msg.created_time) : new Date(),
              createdAt: new Date(),
            });
            syncedMessages++;
            console.log('✅ Message saved:', msg.id, 'content:', messageContent.substring(0, 50));
          } catch (msgError) {
            console.error('❌ Error saving message:', msgError);
          }
        }
      } catch (convError) {
        console.error('❌ Error processing conversation:', convError);
      }
    }

    return NextResponse.json({
      success: true,
      message: `${syncedConversations} konuşma ve ${syncedMessages} mesaj senkronize edildi.`,
      synced: {
        conversations: syncedConversations,
        messages: syncedMessages,
      },
    });

  } catch (error) {
    console.error('❌ Sync error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    }, { status: 500 });
  }
}

function getErrorHint(errorCode) {
  const hints = {
    190: 'Access Token geçersiz veya süresi dolmuş. Yeni token alın.',
    100: 'Geçersiz parametre. Instagram Account ID doğru mu kontrol edin.',
    200: 'İzin hatası. instagram_business_manage_messages izni gerekli.',
    10: 'API izni yok. App Review\'dan geçmeniz gerekebilir.',
    2500: 'Aktif bir access token gerekli.',
  };
  return hints[errorCode] || 'Bilinmeyen hata. Facebook Developer Console\'u kontrol edin.';
}

// DELETE: Mesajları ve konuşmaları temizle
export async function DELETE(request) {
  try {
    console.log('🗑️ Clearing Instagram DM data...');
    
    // Mesajları sil
    const messagesSnapshot = await adminDb.collection(COLLECTIONS.MESSAGES).get();
    const messageDeletePromises = messagesSnapshot.docs.map(doc => doc.ref.delete());
    await Promise.all(messageDeletePromises);
    console.log(`🗑️ Deleted ${messagesSnapshot.size} messages`);
    
    // Konuşmaları sil
    const conversationsSnapshot = await adminDb.collection(COLLECTIONS.CONVERSATIONS).get();
    const convDeletePromises = conversationsSnapshot.docs.map(doc => doc.ref.delete());
    await Promise.all(convDeletePromises);
    console.log(`🗑️ Deleted ${conversationsSnapshot.size} conversations`);
    
    return NextResponse.json({
      success: true,
      message: `${conversationsSnapshot.size} konuşma ve ${messagesSnapshot.size} mesaj silindi.`,
      deleted: {
        conversations: conversationsSnapshot.size,
        messages: messagesSnapshot.size,
      },
    });
  } catch (error) {
    console.error('❌ Delete error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
