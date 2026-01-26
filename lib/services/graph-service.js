/**
 * Microsoft Graph API Service
 * Outlook/Exchange email operations
 */

import { graphApiCall } from '../graph-token';

const EMAIL_SENDER = process.env.EMAIL_SENDER || 'info@mkngroup.com.tr';

/**
 * Mail klasörlerini listeler
 * @param {string} userId - User ID veya email (default: shared mailbox)
 * @returns {Promise<Array>} Mail klasörleri
 */
export async function getMailFolders(userId = EMAIL_SENDER) {
  try {
    const response = await graphApiCall(`/users/${encodeURIComponent(userId)}/mailFolders`);
    return response.value || [];
  } catch (error) {
    console.error('Error fetching mail folders:', error);
    throw error;
  }
}

/**
 * Belirli bir klasördeki mailleri listeler
 * @param {string} folderId - Klasör ID'si (default: inbox)
 * @param {Object} options - Filtreleme ve sayfalama seçenekleri
 * @returns {Promise<Object>} Mail listesi ve metadata
 */
export async function getEmails(folderId = 'inbox', options = {}) {
  try {
    const {
      userId = EMAIL_SENDER,
      top = 50,
      skip = 0,
      filter = null,
      orderBy = 'receivedDateTime desc',
      select = 'id,subject,from,toRecipients,receivedDateTime,isRead,hasAttachments,bodyPreview',
    } = options;

    let endpoint = `/users/${encodeURIComponent(userId)}/mailFolders/${encodeURIComponent(folderId)}/messages?`;
    endpoint += `$top=${top}&$skip=${skip}`;
    endpoint += `&$orderby=${orderBy}`;
    endpoint += `&$select=${select}`;
    
    if (filter) {
      endpoint += `&$filter=${filter}`;
    }

    const response = await graphApiCall(endpoint);
    
    return {
      emails: response.value || [],
      nextLink: response['@odata.nextLink'],
      count: response['@odata.count'],
    };
  } catch (error) {
    console.error('Error fetching emails:', error);
    throw error;
  }
}

/**
 * Tek bir mailin detaylarını getirir
 * @param {string} messageId - Mail ID'si
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Mail detayları
 */
export async function getEmailById(messageId, userId = EMAIL_SENDER) {
  try {
    // Body dahil tüm alanları al
    const response = await graphApiCall(
      `/users/${encodeURIComponent(userId)}/messages/${encodeURIComponent(messageId)}?$select=id,subject,from,toRecipients,ccRecipients,receivedDateTime,sentDateTime,isRead,hasAttachments,bodyPreview,body,conversationId,internetMessageId,importance`
    );
    return response;
  } catch (error) {
    console.error('Error fetching email:', error);
    throw error;
  }
}

/**
 * Mail'i okundu olarak işaretle
 * @param {string} messageId - Mail ID'si
 * @param {boolean} isRead - Okundu durumu
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
export async function markEmailAsRead(messageId, isRead = true, userId = EMAIL_SENDER) {
  try {
    await graphApiCall(`/users/${encodeURIComponent(userId)}/messages/${encodeURIComponent(messageId)}`, {
      method: 'PATCH',
      body: JSON.stringify({ isRead }),
    });
  } catch (error) {
    console.error('Error marking email as read:', error);
    throw error;
  }
}

/**
 * Mail gönderir (Draft oluştur + Gönder yöntemi ile conversationId alır)
 * @param {Object} emailData - Mail verisi
 * @returns {Promise<Object>} - messageId, conversationId, internetMessageId döner
 */
export async function sendEmail(emailData) {
  try {
    const {
      to,
      cc = [],
      bcc = [],
      subject,
      body,
      bodyType = 'HTML', // HTML veya Text
      attachments = [],
      userId = EMAIL_SENDER,
    } = emailData;

    const message = {
      subject,
      body: {
        contentType: bodyType,
        content: body,
      },
      toRecipients: Array.isArray(to) 
        ? to.map(email => ({ emailAddress: { address: email } }))
        : [{ emailAddress: { address: to } }],
    };

    if (cc.length > 0) {
      message.ccRecipients = cc.map(email => ({ emailAddress: { address: email } }));
    }

    if (bcc.length > 0) {
      message.bccRecipients = bcc.map(email => ({ emailAddress: { address: email } }));
    }

    if (attachments.length > 0) {
      message.attachments = attachments.map(att => ({
        '@odata.type': '#microsoft.graph.fileAttachment',
        name: att.name,
        contentType: att.contentType,
        contentBytes: att.contentBytes, // Base64 encoded
      }));
    }

    // 1. Draft oluştur (conversationId almak için)
    const draft = await graphApiCall(`/users/${encodeURIComponent(userId)}/messages`, {
      method: 'POST',
      body: JSON.stringify(message),
    });

    // 2. Draft'ı gönder
    await graphApiCall(`/users/${encodeURIComponent(userId)}/messages/${encodeURIComponent(draft.id)}/send`, {
      method: 'POST',
    });

    // 3. Thread takibi için gerekli bilgileri döndür
    return { 
      success: true,
      messageId: draft.id,
      conversationId: draft.conversationId,
      internetMessageId: draft.internetMessageId,
    };
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

/**
 * Mail'e cevap gönderir
 * @param {string} messageId - Cevap verilecek mail ID'si
 * @param {string} comment - Cevap metni
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
export async function replyToEmail(messageId, comment, userId = EMAIL_SENDER) {
  try {
    await graphApiCall(`/users/${encodeURIComponent(userId)}/messages/${encodeURIComponent(messageId)}/reply`, {
      method: 'POST',
      body: JSON.stringify({ comment }),
    });
  } catch (error) {
    console.error('Error replying to email:', error);
    throw error;
  }
}

/**
 * Mail'i siler (çöp kutusuna taşır)
 * @param {string} messageId - Mail ID'si
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
export async function deleteEmail(messageId, userId = EMAIL_SENDER) {
  try {
    await graphApiCall(`/users/${encodeURIComponent(userId)}/messages/${encodeURIComponent(messageId)}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('Error deleting email:', error);
    throw error;
  }
}

/**
 * Mail'i başka klasöre taşır
 * @param {string} messageId - Mail ID'si
 * @param {string} destinationId - Hedef klasör ID'si
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Taşınan mail
 */
export async function moveEmail(messageId, destinationId, userId = EMAIL_SENDER) {
  try {
    const response = await graphApiCall(`/users/${encodeURIComponent(userId)}/messages/${encodeURIComponent(messageId)}/move`, {
      method: 'POST',
      body: JSON.stringify({ destinationId }),
    });
    return response;
  } catch (error) {
    console.error('Error moving email:', error);
    throw error;
  }
}

/**
 * Mail eklerini listeler
 * @param {string} messageId - Mail ID'si
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Ek listesi
 */
export async function getEmailAttachments(messageId, userId = EMAIL_SENDER) {
  try {
    const response = await graphApiCall(`/users/${encodeURIComponent(userId)}/messages/${encodeURIComponent(messageId)}/attachments`);
    return response.value || [];
  } catch (error) {
    console.error('Error fetching attachments:', error);
    throw error;
  }
}

/**
 * Tek bir eki indirir
 * @param {string} messageId - Mail ID'si
 * @param {string} attachmentId - Ek ID'si
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Ek verisi
 */
export async function downloadAttachment(messageId, attachmentId, userId = EMAIL_SENDER) {
  try {
    const response = await graphApiCall(
      `/users/${encodeURIComponent(userId)}/messages/${encodeURIComponent(messageId)}/attachments/${encodeURIComponent(attachmentId)}`
    );
    return response;
  } catch (error) {
    console.error('Error downloading attachment:', error);
    throw error;
  }
}

/**
 * Mail istatistiklerini getirir
 * @param {string} userId - User ID
 * @returns {Promise<Object>} İstatistikler
 */
export async function getEmailStats(userId = EMAIL_SENDER) {
  try {
    const inboxInfo = await graphApiCall(`/users/${encodeURIComponent(userId)}/mailFolders/inbox`);

    return {
      totalMessages: inboxInfo.totalItemCount || 0,
      unreadMessages: inboxInfo.unreadItemCount || 0,
      folderName: inboxInfo.displayName || 'Inbox',
    };
  } catch (error) {
    console.error('Error fetching email stats:', error);
    throw error;
  }
}

/**
 * Mail ara
 * @param {string} searchQuery - Arama sorgusu
 * @param {string} userId - User ID (optional)
 * @param {Object} options - Arama seçenekleri
 * @returns {Promise<Array>} Bulunan mailler
 */
export async function searchEmails(searchQuery, userId = EMAIL_SENDER, options = {}) {
  try {
    const { top = 25 } = options;

    // Microsoft Graph $search için KQL syntax kullanır
    // Özel karakterleri temizle ve tırnak içine al
    const sanitizedQuery = searchQuery.replace(/['"]/g, '').trim();
    
    // $search query'si tırnak içinde olmalı
    const encodedSearch = encodeURIComponent(`"${sanitizedQuery}"`);
    
    console.log(`[Graph API] Searching emails with query: ${sanitizedQuery}`);
    
    // NOT: $search ile $orderby birlikte kullanılamaz (Graph API kısıtlaması)
    const response = await graphApiCall(
      `/users/${encodeURIComponent(userId)}/messages?$search=${encodedSearch}&$top=${top}&$select=id,subject,from,toRecipients,receivedDateTime,isRead,hasAttachments,bodyPreview,body,conversationId,internetMessageId`
    );

    console.log(`[Graph API] Search returned ${response.value?.length || 0} results`);
    
    // Sonuçları tarihe göre sırala (client-side)
    const emails = response.value || [];
    emails.sort((a, b) => new Date(b.receivedDateTime) - new Date(a.receivedDateTime));
    
    return emails;
  } catch (error) {
    console.error('Error searching emails:', error);
    console.error('Search query was:', searchQuery);
    throw error;
  }
}

/**
 * ConversationId'ye göre thread'deki tüm e-postaları getirir
 * @param {string} conversationId - Outlook conversation ID
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Thread'deki tüm e-postalar
 */
export async function getEmailsByConversationId(conversationId, userId = EMAIL_SENDER) {
  try {
    // conversationId'yi encode et
    const filter = encodeURIComponent(`conversationId eq '${conversationId}'`);
    const response = await graphApiCall(
      `/users/${encodeURIComponent(userId)}/messages?$filter=${filter}&$orderby=receivedDateTime asc&$select=id,subject,from,toRecipients,receivedDateTime,isRead,hasAttachments,bodyPreview,body,conversationId,internetMessageId`
    );
    return response.value || [];
  } catch (error) {
    console.error('Error fetching emails by conversation:', error);
    throw error;
  }
}

/**
 * Belirli bir tarihten sonra gelen inbox e-postalarını getirir
 * Thread takibi için polling'de kullanılır
 * @param {string} sinceDateTime - ISO date string
 * @param {string} userId - User ID
 * @returns {Promise<Array>} E-posta listesi
 */
export async function getNewInboxEmails(sinceDateTime, userId = EMAIL_SENDER) {
  try {
    const filter = `receivedDateTime ge ${sinceDateTime}`;
    const response = await graphApiCall(
      `/users/${encodeURIComponent(userId)}/mailFolders/inbox/messages?$filter=${encodeURIComponent(filter)}&$orderby=receivedDateTime desc&$select=id,subject,from,toRecipients,receivedDateTime,isRead,hasAttachments,bodyPreview,body,conversationId,internetMessageId`
    );
    return response.value || [];
  } catch (error) {
    console.error('Error fetching new inbox emails:', error);
    throw error;
  }
}
