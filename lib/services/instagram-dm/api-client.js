/**
 * Facebook Graph API Client for Instagram DM
 * Instagram DM için Facebook Graph API kullanılır
 * 
 * TOKEN KULLANIMI:
 * - Page Access Token (EAA...): Sayfa işlemleri, konuşma okuma
 * - System User Token (EAA...): Server-to-server, tüm işlemler
 * 
 * NOT: Her iki token türü de EAA ile başlar!
 * System User Token tercih edilmeli (süresiz geçerli)
 */

import { GRAPH_API_BASE_URL, getApiBaseUrl } from './schema';

/**
 * Graph API hata detaylarını formatlar
 * @param {Object} error - Graph API error object
 * @returns {Object} Formatlanmış hata
 */
function formatGraphError(error) {
  return {
    message: error.message || 'Unknown error',
    type: error.type || 'OAuthException',
    code: error.code,
    error_subcode: error.error_subcode,
    fbtrace_id: error.fbtrace_id,
    error_user_title: error.error_user_title,
    error_user_msg: error.error_user_msg,
  };
}

/**
 * Facebook Graph API çağrısı yapar
 * @param {string} endpoint - API endpoint
 * @param {string} accessToken - Access Token (System User veya Page)
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} API response
 */
export async function graphApiCall(endpoint, accessToken, options = {}) {
  const baseUrl = getApiBaseUrl();
  
  const url = endpoint.startsWith('http') 
    ? endpoint 
    : `${baseUrl}${endpoint}`;
  
  // POST için token body'de, GET için query'de
  let finalUrl = url;
  let finalBody = options.body;
  
  if (options.method === 'POST') {
    // POST: Token'ı body'e ekle
    const bodyObj = options.body ? JSON.parse(options.body) : {};
    bodyObj.access_token = accessToken;
    finalBody = JSON.stringify(bodyObj);
  } else {
    // GET: Token'ı URL'e ekle
    const separator = url.includes('?') ? '&' : '?';
    finalUrl = `${url}${separator}access_token=${accessToken}`;
  }

  console.log(`📡 Graph API ${options.method || 'GET'}: ${endpoint}`);

  const response = await fetch(finalUrl, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: finalBody,
  });

  const data = await response.json().catch(() => ({}));
  
  if (!response.ok || data.error) {
    const formattedError = formatGraphError(data.error || {});
    console.error('❌ Graph API Error:', JSON.stringify(formattedError, null, 2));
    
    // Detaylı hata fırlat
    const error = new Error(formattedError.message);
    error.code = formattedError.code;
    error.subcode = formattedError.error_subcode;
    error.fbtrace_id = formattedError.fbtrace_id;
    error.type = formattedError.type;
    throw error;
  }

  return data;
}

/**
 * Konuşmaları listeler
 * @param {string} igAccountId - Instagram Business Account ID
 * @param {string} accessToken - Page Access Token
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Conversations list
 */
export async function getConversations(igAccountId, accessToken, options = {}) {
  const { limit = 20, after = null } = options;
  
  let endpoint = `/${igAccountId}/conversations?platform=instagram&fields=id,participants,messages.limit(1){id,message,from,to,created_time}`;
  
  if (limit) endpoint += `&limit=${limit}`;
  if (after) endpoint += `&after=${after}`;

  return graphApiCall(endpoint, accessToken);
}

/**
 * Tekil konuşmayı getirir
 * @param {string} conversationId - Conversation ID
 * @param {string} accessToken - Page Access Token
 * @returns {Promise<Object>} Conversation details
 */
export async function getConversation(conversationId, accessToken) {
  const endpoint = `/${conversationId}?fields=id,participants,messages{id,message,from,to,created_time,attachments}`;
  return graphApiCall(endpoint, accessToken);
}

/**
 * Konuşmadaki mesajları listeler
 * @param {string} conversationId - Conversation ID
 * @param {string} accessToken - Page Access Token
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Messages list
 */
export async function getMessages(conversationId, accessToken, options = {}) {
  const { limit = 50, after = null } = options;
  
  let endpoint = `/${conversationId}/messages?fields=id,message,from,to,created_time,attachments`;
  
  if (limit) endpoint += `&limit=${limit}`;
  if (after) endpoint += `&after=${after}`;

  return graphApiCall(endpoint, accessToken);
}

/**
 * Mesaj gönderir
 * @param {string} igAccountId - Instagram Business Account ID
 * @param {string} recipientId - Recipient IGSID
 * @param {string} messageText - Message content
 * @param {string} accessToken - Page Access Token
 * @returns {Promise<Object>} Send response
 */
export async function sendMessage(igAccountId, recipientId, messageText, accessToken) {
  const endpoint = `/${igAccountId}/messages`;
  
  const body = {
    recipient: {
      id: recipientId,
    },
    message: {
      text: messageText,
    },
  };

  return graphApiCall(endpoint, accessToken, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/**
 * Görsel mesaj gönderir
 * @param {string} igAccountId - Instagram Business Account ID
 * @param {string} recipientId - Recipient IGSID
 * @param {string} imageUrl - Image URL
 * @param {string} accessToken - Page Access Token
 * @returns {Promise<Object>} Send response
 */
export async function sendImageMessage(igAccountId, recipientId, imageUrl, accessToken) {
  const endpoint = `/${igAccountId}/messages`;
  
  const body = {
    recipient: {
      id: recipientId,
    },
    message: {
      attachment: {
        type: 'image',
        payload: {
          url: imageUrl,
        },
      },
    },
  };

  return graphApiCall(endpoint, accessToken, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/**
 * Kullanıcı profilini getirir - Platform'a göre farklı yöntem kullanır
 * 
 * Facebook Messenger: 
 *   1. Önce /{page-id}/conversations?user_id={psid} ile konuşmadan çekmeyi dene
 *   2. Başarısız olursa direkt /{psid} endpoint'ini dene
 * Instagram: Direkt profil API'si yok, konuşma participants'tan alınmalı
 * 
 * @param {string} userId - User PSID (Facebook) veya IGSID (Instagram)
 * @param {string} accessToken - Page Access Token
 * @param {string} platform - 'facebook' veya 'instagram'
 * @param {string} pageId - Facebook Page ID (opsiyonel, facebook platform için gerekli)
 * @returns {Promise<Object>} User profile
 */
export async function getUserProfile(userId, accessToken, platform = 'instagram', pageId = null) {
  try {
    if (platform === 'facebook') {
      // Facebook Messenger - Önce konuşmadan participant bilgisi almayı dene
      if (pageId) {
        try {
          console.log('👤 Trying to get user from conversation participants...');
          const convEndpoint = `/${pageId}/conversations?user_id=${userId}&fields=participants`;
          const convData = await graphApiCall(convEndpoint, accessToken);
          
          if (convData?.data?.[0]?.participants?.data) {
            const participant = convData.data[0].participants.data.find(p => p.id === userId);
            if (participant?.name) {
              console.log('✅ Got user name from conversation:', participant.name);
              return {
                id: userId,
                username: null,
                name: participant.name,
                profile_pic: null,
              };
            }
          }
        } catch (convError) {
          console.warn('⚠️ Could not get user from conversation:', convError.message);
        }
      }
      
      // Direkt profil endpoint'ini dene (genellikle çalışmaz ama denemekten zarar gelmez)
      try {
        console.log('👤 Trying direct profile endpoint...');
        const endpoint = `/${userId}?fields=id,name,first_name,last_name,profile_pic`;
        const data = await graphApiCall(endpoint, accessToken);
        return {
          id: data.id,
          username: null,
          name: data.name || `${data.first_name || ''} ${data.last_name || ''}`.trim(),
          profile_pic: data.profile_pic || null,
        };
      } catch (directError) {
        console.warn('⚠️ Direct profile endpoint failed:', directError.message);
      }
      
      // Her şey başarısız oldu - null dön
      return null;
    } else {
      // Instagram - direkt profil API'si yok
      const endpoint = `/${userId}?fields=id,username,name,profile_pic`;
      return graphApiCall(endpoint, accessToken);
    }
  } catch (error) {
    console.warn(`⚠️ getUserProfile failed for ${platform}:`, error.message);
    return null;
  }
}

/**
 * Instagram konuşmasından kullanıcı bilgilerini çeker
 * Bu, IGSID için kullanıcı bilgisi almanın doğru yoludur
 * @param {string} igAccountId - Instagram Business Account ID
 * @param {string} userId - User IGSID (konuşma ID'si olarak kullanılabilir)
 * @param {string} accessToken - Page Access Token
 * @returns {Promise<Object|null>} User info from conversation
 */
export async function getUserFromConversation(igAccountId, userId, accessToken) {
  try {
    // Konuşmaları listele ve kullanıcıyı bul
    const conversations = await getConversations(igAccountId, accessToken, { limit: 50 });
    
    if (conversations?.data) {
      for (const conv of conversations.data) {
        if (conv.participants?.data) {
          const user = conv.participants.data.find(p => p.id === userId);
          if (user) {
            return {
              id: user.id,
              username: user.username || null,
              name: user.name || null,
              profile_pic: null, // Konuşmadan profil resmi gelmez
            };
          }
        }
      }
    }
    return null;
  } catch (error) {
    console.warn('Could not get user from conversations:', error.message);
    return null;
  }
}

/**
 * Instagram Business Account bilgilerini getirir
 * @param {string} pageId - Facebook Page ID
 * @param {string} accessToken - Page Access Token
 * @returns {Promise<Object>} Instagram account info
 */
export async function getInstagramBusinessAccount(pageId, accessToken) {
  const endpoint = `/${pageId}?fields=instagram_business_account{id,username,name,profile_picture_url}`;
  return graphApiCall(endpoint, accessToken);
}

/**
 * Facebook sayfalarını listeler
 * @param {string} accessToken - User Access Token
 * @returns {Promise<Object>} Pages list
 */
export async function getPages(accessToken) {
  const endpoint = `/me/accounts?fields=id,name,access_token,instagram_business_account{id,username,name,profile_picture_url}`;
  return graphApiCall(endpoint, accessToken);
}

/**
 * Long-lived token exchange
 * @param {string} shortLivedToken - Short-lived access token
 * @param {string} appId - Meta App ID (Dashboard > Settings > Basic > App ID)
 * @param {string} appSecret - Meta App Secret
 * @returns {Promise<Object>} Long-lived token response
 */
export async function exchangeForLongLivedToken(shortLivedToken, appId, appSecret) {
  const endpoint = `/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${shortLivedToken}`;
  return graphApiCall(endpoint, shortLivedToken);
}

/**
 * Webhook subscription'ı aktifleştirir
 * @param {string} pageId - Facebook Page ID
 * @param {string} accessToken - Facebook Page Access Token (EAA ile başlayan)
 * @returns {Promise<Object>} Subscription response
 */
export async function subscribeToWebhook(pageId, accessToken) {
  const endpoint = `/${pageId}/subscribed_apps`;
  
  return graphApiCall(endpoint, accessToken, {
    method: 'POST',
    body: JSON.stringify({
      subscribed_fields: ['messages'],
    }),
  });
}
