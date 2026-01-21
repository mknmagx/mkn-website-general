/**
 * CRM v2 - Case Service
 * 
 * Talep/İş yönetimi servisi.
 * Case, gerçek ticari süreçlerin yürütüldüğü alandır.
 * Pipeline mantığıyla ilerler: Yeni → Değerlendirme → Teklif → Pazarlık → Kazanıldı/Kaybedildi
 */

import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  serverTimestamp,
  writeBatch,
  increment,
} from "firebase/firestore";
import { db } from "../../firebase";
import { 
  COLLECTIONS, 
  CASE_STATUS,
  CASE_TYPE,
  PRIORITY,
  ACTIVITY_TYPE,
  CASE_PIPELINE_ORDER,
} from "./schema";
import { updateCustomerStats, getCustomer } from "./customer-service";
import { convertToCase as updateConversationForCase, getConversation } from "./conversation-service";

/**
 * Yeni Case oluştur
 */
export const createCase = async (caseData) => {
  try {
    const now = serverTimestamp();
    
    const newCase = {
      // Müşteri bağlantısı
      customerId: caseData.customerId || null,
      
      // Kaynak konuşma (varsa)
      sourceConversationId: caseData.sourceConversationId || null,
      
      // Temel bilgiler
      title: caseData.title || 'Yeni Talep',
      description: caseData.description || '',
      
      // Tür ve durum
      type: caseData.type || CASE_TYPE.OTHER,
      status: caseData.status || CASE_STATUS.NEW,
      priority: caseData.priority || PRIORITY.NORMAL,
      
      // Atama
      assignedTo: caseData.assignedTo || null,
      
      // Etiketler
      tags: caseData.tags || [],
      
      // Finansal bilgiler
      financials: {
        estimatedValue: caseData.estimatedValue || 0,
        quotedValue: caseData.quotedValue || 0,
        finalValue: caseData.finalValue || 0,
        currency: caseData.currency || 'TRY',
        moq: caseData.moq || '',
        unitPrice: caseData.unitPrice || '',
      },
      
      // Ürün/Hizmet detayları
      products: caseData.products || [],
      // Örnek: [{ name: 'Şampuan', quantity: 1000, packaging: '500ml', notes: '' }]
      
      // Teklifler
      quotes: [],
      // Her teklif: { id, date, amount, currency, validUntil, status, pdfUrl, notes }
      
      // Tarihler
      expectedCloseDate: caseData.expectedCloseDate ? Timestamp.fromDate(new Date(caseData.expectedCloseDate)) : null,
      actualCloseDate: null,
      
      // Pipeline geçmişi
      statusHistory: [{
        status: CASE_STATUS.NEW,
        changedAt: Timestamp.now(),
        changedBy: caseData.createdBy || null,
        notes: 'Talep oluşturuldu',
      }],
      
      // Notlar (eski alan - açıklama için)
      notes: caseData.notes || '',
      
      // Ek Bilgiler - Dosyalar
      attachments: [],
      // Her dosya: { id, name, url, type, size, category, uploadedBy, uploadedAt, description }
      
      // Ek Bilgiler - Ekip Notları
      internalNotes: [],
      // Her not: { id, content, createdBy, createdByName, createdAt, important }
      
      // Kaynak referansı (eski sistemden geldiyse)
      sourceRef: caseData.sourceRef || null,
      // Örnek: { type: 'request', id: 'req_123' }
      
      // Meta
      createdAt: now,
      updatedAt: now,
      closedAt: null,
      createdBy: caseData.createdBy || null,
    };
    
    const docRef = await addDoc(collection(db, COLLECTIONS.CASES), newCase);
    
    // Kaynak konuşmayı güncelle
    if (caseData.sourceConversationId) {
      await updateConversationForCase(caseData.sourceConversationId, docRef.id, caseData.createdBy);
    }
    
    // Müşteri istatistiklerini güncelle
    if (caseData.customerId) {
      await updateCustomerStats(caseData.customerId, {
        totalCases: increment(1),
        openCases: increment(1),
        lastContactAt: now,
      });
    }
    
    // Aktivite kaydı
    await logActivity({
      type: ACTIVITY_TYPE.CASE_CREATED,
      caseId: docRef.id,
      customerId: caseData.customerId,
      conversationId: caseData.sourceConversationId,
      performedBy: caseData.createdBy,
      metadata: { 
        title: newCase.title,
        type: newCase.type,
      },
    });
    
    return { id: docRef.id, ...newCase };
  } catch (error) {
    console.error("Error creating case:", error);
    throw error;
  }
};

/**
 * Conversation ID'ye göre bağlı case'i getir
 */
export const getCaseByConversationId = async (conversationId) => {
  try {
    const q = query(
      collection(db, COLLECTIONS.CASES),
      where('sourceConversationId', '==', conversationId),
      limit(1)
    );
    
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return null;
    }
    
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  } catch (error) {
    console.error("Error getting case by conversation ID:", error);
    return null;
  }
};

/**
 * Birden fazla conversation ID için bağlı case'leri getir
 * @returns {Object} - { conversationId: caseId }
 */
export const getCasesByConversationIds = async (conversationIds) => {
  try {
    if (!conversationIds || conversationIds.length === 0) {
      return {};
    }
    
    // Firestore 'in' query 30 element ile sınırlı
    const chunks = [];
    for (let i = 0; i < conversationIds.length; i += 30) {
      chunks.push(conversationIds.slice(i, i + 30));
    }
    
    const result = {};
    
    for (const chunk of chunks) {
      const q = query(
        collection(db, COLLECTIONS.CASES),
        where('sourceConversationId', 'in', chunk)
      );
      
      const snapshot = await getDocs(q);
      
      for (const doc of snapshot.docs) {
        const data = doc.data();
        if (data.sourceConversationId) {
          result[data.sourceConversationId] = doc.id;
        }
      }
    }
    
    return result;
  } catch (error) {
    console.error("Error getting cases by conversation IDs:", error);
    return {};
  }
};

/**
 * Konuşmadan Case oluştur (hızlı dönüştürme)
 * Tüm conversation bilgilerini case'e aktarır
 */
export const createCaseFromConversation = async (conversationId, caseData, createdBy = null) => {
  try {
    const conversation = await getConversation(conversationId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }
    
    // Conversation'dan tam açıklama oluştur
    let fullDescription = caseData.description || conversation.preview || '';
    
    // Conversation detaylarını açıklamaya ekle
    const conversationDetails = [];
    if (conversation.sender?.name) conversationDetails.push(`Müşteri: ${conversation.sender.name}`);
    if (conversation.sender?.email) conversationDetails.push(`E-posta: ${conversation.sender.email}`);
    if (conversation.sender?.phone) conversationDetails.push(`Telefon: ${conversation.sender.phone}`);
    if (conversation.channel) conversationDetails.push(`Kanal: ${conversation.channel}`);
    if (conversation.sourceRef?.type) conversationDetails.push(`Kaynak: ${conversation.sourceRef.type}`);
    
    if (conversationDetails.length > 0 && fullDescription) {
      fullDescription = `${fullDescription}\n\n--- Kaynak Bilgileri ---\n${conversationDetails.join('\n')}`;
    }
    
    // Conversation'daki ek metadata'yı da aktar
    const metadata = {
      sourceConversationId: conversationId,
      sourceChannel: conversation.channel,
      sourceSender: conversation.sender,
      sourceSubject: conversation.subject,
      sourceCreatedAt: conversation.createdAt,
      sourceRef: conversation.sourceRef,
    };
    
    // Tahmini değer (eğer quote'dan geldiyse)
    let estimatedValue = null;
    if (conversation.sourceRef?.type === 'quote' && conversation.channelMetadata?.budget) {
      estimatedValue = conversation.channelMetadata.budget;
    }
    
    // Conversation bilgilerini Case'e aktar
    const newCase = await createCase({
      customerId: conversation.customerId,
      sourceConversationId: conversationId,
      title: caseData.title || conversation.subject || 'Konuşmadan Dönüştürüldü',
      description: fullDescription,
      type: caseData.type || CASE_TYPE.OTHER,
      priority: caseData.priority || conversation.priority || PRIORITY.NORMAL,
      tags: caseData.tags || conversation.tags || [],
      assignedTo: caseData.assignedTo || conversation.assignedTo,
      createdBy,
      // Finansal bilgiler
      financials: estimatedValue ? {
        estimatedValue: estimatedValue,
        currency: 'TRY',
      } : undefined,
      // Ek alanları ekle
      notes: caseData.notes || '',
      // Metadata
      sourceMetadata: metadata,
      ...caseData, // Diğer alanları override et
    });
    
    // Conversation'a linkedCaseId ekle
    await updateConversationForCase(conversationId, newCase.id, createdBy);
    
    return newCase;
  } catch (error) {
    console.error("Error creating case from conversation:", error);
    throw error;
  }
};

/**
 * Case güncelle
 */
export const updateCase = async (caseId, updateData, updatedBy = null) => {
  try {
    const caseRef = doc(db, COLLECTIONS.CASES, caseId);
    const caseDoc = await getDoc(caseRef);
    
    if (!caseDoc.exists()) {
      throw new Error('Case not found');
    }
    
    const currentCase = caseDoc.data();
    
    const updates = {
      ...updateData,
      updatedAt: serverTimestamp(),
    };
    
    // Nested objeleri düzgün güncelle
    if (updateData.financials) {
      updates.financials = { ...currentCase.financials, ...updateData.financials };
    }
    
    // Status değişikliği için özel işlemler
    if (updateData.status && updateData.status !== currentCase.status) {
      // Status history güncelle
      const statusHistory = currentCase.statusHistory || [];
      statusHistory.push({
        status: updateData.status,
        changedAt: Timestamp.now(),
        changedBy: updatedBy,
        notes: updateData.statusChangeNotes || '',
        previousStatus: currentCase.status,
      });
      updates.statusHistory = statusHistory;
      
      // Kapanış durumları için
      if ([CASE_STATUS.WON, CASE_STATUS.LOST].includes(updateData.status)) {
        updates.closedAt = serverTimestamp();
        updates.actualCloseDate = serverTimestamp();
        
        // Müşteri istatistiklerini güncelle
        if (currentCase.customerId) {
          const statsUpdate = {
            openCases: increment(-1),
          };
          
          if (updateData.status === CASE_STATUS.WON) {
            statsUpdate.wonCases = increment(1);
            statsUpdate.totalValue = increment(updateData.finalValue || currentCase.financials?.finalValue || 0);
          } else {
            statsUpdate.lostCases = increment(1);
          }
          
          await updateCustomerStats(currentCase.customerId, statsUpdate);
        }
      }
      
      // Aktivite kaydı
      await logActivity({
        type: ACTIVITY_TYPE.CASE_STATUS_CHANGED,
        caseId,
        customerId: currentCase.customerId,
        performedBy: updatedBy,
        metadata: { 
          previousStatus: currentCase.status,
          newStatus: updateData.status,
        },
      });
    }
    
    await updateDoc(caseRef, updates);
    return true;
  } catch (error) {
    console.error("Error updating case:", error);
    throw error;
  }
};

/**
 * Case getir
 */
export const getCase = async (caseId) => {
  try {
    const caseRef = doc(db, COLLECTIONS.CASES, caseId);
    const caseDoc = await getDoc(caseRef);
    
    if (!caseDoc.exists()) {
      return null;
    }
    
    return { id: caseDoc.id, ...caseDoc.data() };
  } catch (error) {
    console.error("Error getting case:", error);
    throw error;
  }
};

/**
 * Case ile müşteri bilgisini getir
 */
export const getCaseWithCustomer = async (caseId) => {
  try {
    const caseData = await getCase(caseId);
    if (!caseData) return null;
    
    let customer = null;
    if (caseData.customerId) {
      customer = await getCustomer(caseData.customerId);
    }
    
    return {
      ...caseData,
      customer,
    };
  } catch (error) {
    console.error("Error getting case with customer:", error);
    throw error;
  }
};

/**
 * Pipeline için Case'leri getir (Kanban view)
 */
export const getPipelineCases = async (options = {}) => {
  try {
    const {
      type = null,
      assignedTo = null,
      tags = [],
      searchTerm = '',
      includeClosedStatuses = false,
    } = options;
    
    let q = collection(db, COLLECTIONS.CASES);
    let constraints = [];
    
    // Sadece aktif pipeline statüleri
    if (!includeClosedStatuses) {
      constraints.push(where('status', 'in', [
        CASE_STATUS.NEW,
        CASE_STATUS.QUALIFYING,
        CASE_STATUS.QUOTE_SENT,
        CASE_STATUS.NEGOTIATING,
        CASE_STATUS.ON_HOLD,
      ]));
    }
    
    if (type) {
      constraints.push(where('type', '==', type));
    }
    
    if (assignedTo !== null) {
      constraints.push(where('assignedTo', '==', assignedTo));
    }
    
    constraints.push(orderBy('updatedAt', 'desc'));
    
    q = query(q, ...constraints);
    
    const snapshot = await getDocs(q);
    let cases = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Client-side filtreler
    if (tags.length > 0) {
      cases = cases.filter(c => 
        tags.some(tag => c.tags?.includes(tag))
      );
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      cases = cases.filter(c => 
        c.title?.toLowerCase().includes(term) ||
        c.description?.toLowerCase().includes(term)
      );
    }
    
    // Pipeline görünümü için gruplama
    const pipeline = {};
    CASE_PIPELINE_ORDER.forEach(status => {
      pipeline[status] = cases.filter(c => c.status === status);
    });
    
    // On Hold ve diğer durumlar
    pipeline[CASE_STATUS.ON_HOLD] = cases.filter(c => c.status === CASE_STATUS.ON_HOLD);
    
    if (includeClosedStatuses) {
      pipeline[CASE_STATUS.WON] = cases.filter(c => c.status === CASE_STATUS.WON);
      pipeline[CASE_STATUS.LOST] = cases.filter(c => c.status === CASE_STATUS.LOST);
    }
    
    return {
      pipeline,
      all: cases,
      counts: {
        total: cases.length,
        byStatus: Object.fromEntries(
          Object.entries(pipeline).map(([status, items]) => [status, items.length])
        ),
      },
    };
  } catch (error) {
    console.error("Error getting pipeline cases:", error);
    throw error;
  }
};

/**
 * Müşterinin Case'lerini getir
 */
export const getCustomerCases = async (customerId, options = {}) => {
  try {
    const {
      status = null,
      limitCount = 50,
      sortBy = 'createdAt',
      sortDirection = 'desc',
    } = options;
    
    let constraints = [
      where('customerId', '==', customerId),
      orderBy(sortBy, sortDirection),
      limit(limitCount),
    ];
    
    if (status) {
      constraints = [
        where('customerId', '==', customerId),
        where('status', '==', status),
        orderBy(sortBy, sortDirection),
        limit(limitCount),
      ];
    }
    
    const q = query(collection(db, COLLECTIONS.CASES), ...constraints);
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting customer cases:", error);
    throw error;
  }
};

/**
 * Tüm Case'leri getir (liste görünümü)
 */
export const getAllCases = async (options = {}) => {
  try {
    const {
      status = null,
      type = null,
      assignedTo = null,
      customerId = null,
      tags = [],
      searchTerm = '',
      sortBy = 'updatedAt',
      sortDirection = 'desc',
      limitCount = 50,
      startAfterDoc = null,
    } = options;
    
    let q = collection(db, COLLECTIONS.CASES);
    let constraints = [];
    
    if (status) {
      if (Array.isArray(status)) {
        constraints.push(where('status', 'in', status));
      } else {
        constraints.push(where('status', '==', status));
      }
    }
    
    if (type) {
      constraints.push(where('type', '==', type));
    }
    
    if (assignedTo !== null) {
      constraints.push(where('assignedTo', '==', assignedTo));
    }
    
    if (customerId) {
      constraints.push(where('customerId', '==', customerId));
    }
    
    constraints.push(orderBy(sortBy, sortDirection));
    constraints.push(limit(limitCount));
    
    if (startAfterDoc) {
      constraints.push(startAfter(startAfterDoc));
    }
    
    q = query(q, ...constraints);
    
    const snapshot = await getDocs(q);
    let cases = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Client-side filtreler
    if (tags.length > 0) {
      cases = cases.filter(c => 
        tags.some(tag => c.tags?.includes(tag))
      );
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      cases = cases.filter(c => 
        c.title?.toLowerCase().includes(term) ||
        c.description?.toLowerCase().includes(term)
      );
    }
    
    return cases;
  } catch (error) {
    console.error("Error getting all cases:", error);
    throw error;
  }
};

/**
 * Case'e teklif ekle
 */
export const addQuoteToCase = async (caseId, quoteData, addedBy = null) => {
  try {
    const caseRef = doc(db, COLLECTIONS.CASES, caseId);
    const caseDoc = await getDoc(caseRef);
    
    if (!caseDoc.exists()) {
      throw new Error('Case not found');
    }
    
    const currentCase = caseDoc.data();
    const quotes = currentCase.quotes || [];
    
    // validUntil tarihini güvenli şekilde parse et
    let validUntilTimestamp = null;
    if (quoteData.validUntil) {
      try {
        const dateValue = quoteData.validUntil?.toDate?.() || new Date(quoteData.validUntil);
        if (dateValue instanceof Date && !isNaN(dateValue.getTime())) {
          validUntilTimestamp = Timestamp.fromDate(dateValue);
        }
      } catch (e) {
        console.warn("Invalid validUntil date:", quoteData.validUntil);
      }
    }
    
    const newQuote = {
      id: `quote_${Date.now()}`,
      createdAt: Timestamp.now(), // serverTimestamp() dizi içinde kullanılamaz
      amount: quoteData.amount || 0,
      currency: quoteData.currency || 'TRY',
      description: quoteData.description || '',
      validUntil: validUntilTimestamp,
      status: quoteData.status || 'draft', // draft, sent, accepted, rejected, expired
      pdfUrl: quoteData.pdfUrl || null,
      notes: quoteData.notes || '',
      createdBy: addedBy,
      // Proforma bağlantısı (varsa)
      proformaId: quoteData.proformaId || null,
      proformaNumber: quoteData.proformaNumber || null,
    };
    
    quotes.push(newQuote);
    
    const updates = {
      quotes,
      'financials.quotedValue': quoteData.amount || currentCase.financials?.quotedValue || 0,
      updatedAt: serverTimestamp(),
    };
    
    // Akıllı Status Güncellemesi:
    // 1. Teklif durumu "sent" ise ve case "new" veya "qualifying" ise → "quote_sent" yap
    // 2. Teklif durumu "draft" ise ve case "new" ise → "qualifying" yap
    const quoteStatus = quoteData.status || 'draft';
    const currentCaseStatus = currentCase.status;
    
    if (quoteStatus === 'sent' && [CASE_STATUS.NEW, CASE_STATUS.QUALIFYING].includes(currentCaseStatus)) {
      updates.status = CASE_STATUS.QUOTE_SENT;
      updates.statusHistory = [
        ...(currentCase.statusHistory || []),
        {
          status: CASE_STATUS.QUOTE_SENT,
          changedAt: Timestamp.now(),
          changedBy: addedBy,
          notes: 'Teklif gönderildi - otomatik güncelleme',
        }
      ];
    } else if (quoteStatus === 'draft' && currentCaseStatus === CASE_STATUS.NEW) {
      updates.status = CASE_STATUS.QUALIFYING;
      updates.statusHistory = [
        ...(currentCase.statusHistory || []),
        {
          status: CASE_STATUS.QUALIFYING,
          changedAt: Timestamp.now(),
          changedBy: addedBy,
          notes: 'Teklif taslağı oluşturuldu - değerlendirme aşamasına geçildi',
        }
      ];
    }
    
    await updateDoc(caseRef, updates);
    
    return newQuote;
  } catch (error) {
    console.error("Error adding quote to case:", error);
    throw error;
  }
};

/**
 * Case teklifini güncelle
 */
export const updateCaseQuote = async (caseId, quoteId, quoteUpdate, updatedBy = null) => {
  try {
    const caseRef = doc(db, COLLECTIONS.CASES, caseId);
    const caseDoc = await getDoc(caseRef);
    
    if (!caseDoc.exists()) {
      throw new Error('Case not found');
    }
    
    const currentCase = caseDoc.data();
    const quotes = currentCase.quotes || [];
    const quoteIndex = quotes.findIndex(q => q.id === quoteId);
    
    if (quoteIndex === -1) {
      throw new Error('Quote not found');
    }
    
    quotes[quoteIndex] = { ...quotes[quoteIndex], ...quoteUpdate };
    
    const updates = {
      quotes,
      updatedAt: serverTimestamp(),
    };
    
    // Teklif gönderildiyse ve case henüz quote_sent değilse
    if (quoteUpdate.status === 'sent' && [CASE_STATUS.NEW, CASE_STATUS.QUALIFYING].includes(currentCase.status)) {
      updates.status = CASE_STATUS.QUOTE_SENT;
      updates.statusHistory = [
        ...(currentCase.statusHistory || []),
        {
          status: CASE_STATUS.QUOTE_SENT,
          changedAt: Timestamp.now(),
          changedBy: updatedBy,
          notes: 'Teklif gönderildi - otomatik güncelleme',
        }
      ];
      
      await logActivity({
        type: ACTIVITY_TYPE.QUOTE_SENT,
        caseId,
        customerId: currentCase.customerId,
        performedBy: updatedBy,
        metadata: { quoteId },
      });
    }
    
    // Teklif kabul edildiyse
    if (quoteUpdate.status === 'accepted') {
      updates['financials.finalValue'] = quotes[quoteIndex].amount;
      
      // Case'i WON durumuna geçir
      if (currentCase.status !== CASE_STATUS.WON) {
        updates.status = CASE_STATUS.WON;
        updates.actualCloseDate = Timestamp.now();
        updates.statusHistory = [
          ...(currentCase.statusHistory || []),
          {
            status: CASE_STATUS.WON,
            changedAt: Timestamp.now(),
            changedBy: updatedBy,
            notes: 'Teklif kabul edildi - kazanıldı',
          }
        ];
      }
      
      await logActivity({
        type: ACTIVITY_TYPE.QUOTE_ACCEPTED,
        caseId,
        customerId: currentCase.customerId,
        performedBy: updatedBy,
        metadata: { quoteId },
      });
    }
    
    // Teklif reddedildiyse
    if (quoteUpdate.status === 'rejected') {
      await logActivity({
        type: ACTIVITY_TYPE.QUOTE_REJECTED,
        caseId,
        customerId: currentCase.customerId,
        performedBy: updatedBy,
        metadata: { quoteId },
      });
    }
    
    await updateDoc(caseRef, updates);
    return true;
  } catch (error) {
    console.error("Error updating case quote:", error);
    throw error;
  }
};

/**
 * Case'den teklif sil
 */
export const deleteQuoteFromCase = async (caseId, quoteId, deletedBy = null) => {
  try {
    const caseRef = doc(db, COLLECTIONS.CASES, caseId);
    const caseDoc = await getDoc(caseRef);
    
    if (!caseDoc.exists()) {
      throw new Error('Case not found');
    }
    
    const currentCase = caseDoc.data();
    const quotes = currentCase.quotes || [];
    const filteredQuotes = quotes.filter(q => q.id !== quoteId);
    
    if (filteredQuotes.length === quotes.length) {
      throw new Error('Quote not found');
    }
    
    // En yüksek teklif değerini bul
    const maxQuoteValue = filteredQuotes.length > 0 
      ? Math.max(...filteredQuotes.map(q => q.amount || 0))
      : 0;
    
    await updateDoc(caseRef, {
      quotes: filteredQuotes,
      'financials.quotedValue': maxQuoteValue,
      updatedAt: serverTimestamp(),
    });
    
    return true;
  } catch (error) {
    console.error("Error deleting quote from case:", error);
    throw error;
  }
};

/**
 * Case'i birine ata
 */
export const assignCase = async (caseId, assignedTo, assignedBy = null) => {
  try {
    await updateCase(caseId, { assignedTo }, assignedBy);
    
    const caseData = await getCase(caseId);
    
    await logActivity({
      type: ACTIVITY_TYPE.CASE_ASSIGNED,
      caseId,
      customerId: caseData?.customerId,
      performedBy: assignedBy,
      metadata: { assignedTo },
    });
    
    return true;
  } catch (error) {
    console.error("Error assigning case:", error);
    throw error;
  }
};

/**
 * Case sil
 */
export const deleteCase = async (caseId) => {
  try {
    const caseData = await getCase(caseId);
    
    // Bağlı conversation'ı güncelle
    if (caseData?.sourceConversationId) {
      const conversationRef = doc(db, COLLECTIONS.CONVERSATIONS, caseData.sourceConversationId);
      await updateDoc(conversationRef, {
        linkedCaseId: null,
        status: 'open', // Tekrar açık duruma getir
        updatedAt: serverTimestamp(),
      });
    }
    
    // Müşteri istatistiklerini güncelle
    if (caseData?.customerId) {
      const statsUpdate = {
        totalCases: increment(-1),
      };
      
      if (![CASE_STATUS.WON, CASE_STATUS.LOST].includes(caseData.status)) {
        statsUpdate.openCases = increment(-1);
      }
      
      await updateCustomerStats(caseData.customerId, statsUpdate);
    }
    
    await deleteDoc(doc(db, COLLECTIONS.CASES, caseId));
    return true;
  } catch (error) {
    console.error("Error deleting case:", error);
    throw error;
  }
};

/**
 * Case istatistikleri
 */
export const getCaseStatistics = async (options = {}) => {
  try {
    const { assignedTo = null, dateRange = null } = options;
    
    let q = collection(db, COLLECTIONS.CASES);
    
    if (assignedTo !== null) {
      q = query(q, where('assignedTo', '==', assignedTo));
    }
    
    const snapshot = await getDocs(q);
    
    const stats = {
      total: 0,
      byStatus: {},
      byType: {},
      totalValue: 0,
      wonValue: 0,
      lostValue: 0,
      conversionRate: 0,
      avgDealSize: 0,
    };
    
    let wonCount = 0;
    let lostCount = 0;
    
    snapshot.forEach(doc => {
      const data = doc.data();
      stats.total++;
      stats.byStatus[data.status] = (stats.byStatus[data.status] || 0) + 1;
      stats.byType[data.type] = (stats.byType[data.type] || 0) + 1;
      
      const value = data.financials?.finalValue || data.financials?.quotedValue || 0;
      stats.totalValue += value;
      
      if (data.status === CASE_STATUS.WON) {
        stats.wonValue += value;
        wonCount++;
      }
      
      if (data.status === CASE_STATUS.LOST) {
        stats.lostValue += data.financials?.quotedValue || 0;
        lostCount++;
      }
    });
    
    // Conversion rate hesapla
    const closedCount = wonCount + lostCount;
    if (closedCount > 0) {
      stats.conversionRate = (wonCount / closedCount) * 100;
    }
    
    // Ortalama deal size
    if (wonCount > 0) {
      stats.avgDealSize = stats.wonValue / wonCount;
    }
    
    return stats;
  } catch (error) {
    console.error("Error getting case statistics:", error);
    throw error;
  }
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Aktivite kaydı oluştur (internal)
 */
const logActivity = async (activityData) => {
  try {
    await addDoc(collection(db, COLLECTIONS.ACTIVITIES), {
      ...activityData,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error logging activity:", error);
  }
};
// =============================================================================
// CHECKLIST FUNCTIONS
// =============================================================================

/**
 * Case checklist'ini güncelle
 */
export const updateCaseChecklist = async (caseId, checklistItems, updatedBy = null) => {
  try {
    const caseRef = doc(db, COLLECTIONS.CASES, caseId);
    
    await updateDoc(caseRef, {
      checklist: checklistItems,
      updatedAt: serverTimestamp(),
    });
    
    return true;
  } catch (error) {
    console.error("Error updating case checklist:", error);
    throw error;
  }
};

/**
 * Tek bir checklist item'ını toggle et
 */
export const toggleChecklistItem = async (caseId, itemId, checklistSettings = null, updatedBy = null) => {
  try {
    const caseData = await getCase(caseId);
    if (!caseData) throw new Error('Case not found');
    
    // Checklist yoksa ve settings varsa, initialize et
    let checklist = caseData.checklist || [];
    if (checklist.length === 0 && checklistSettings?.phases?.length > 0) {
      checklist = checklistSettings.phases.flatMap(phase => 
        phase.items.map(item => ({ 
          ...item, 
          completed: false, 
          completedAt: null, 
          completedBy: null 
        }))
      );
    }
    
    // Item'ı bul ve toggle et
    const itemIndex = checklist.findIndex(item => item.id === itemId);
    if (itemIndex === -1) {
      throw new Error(`Checklist item not found: ${itemId}`);
    }
    
    const currentItem = checklist[itemIndex];
    const newCompleted = !currentItem.completed;
    
    const updatedChecklist = checklist.map(item => 
      item.id === itemId 
        ? { 
            ...item, 
            completed: newCompleted, 
            completedAt: newCompleted ? Timestamp.now() : null, 
            completedBy: newCompleted ? updatedBy : null 
          }
        : item
    );
    
    await updateCaseChecklist(caseId, updatedChecklist, updatedBy);
    
    // Aktivite kaydı
    await logActivity({
      type: newCompleted ? 'checklist_completed' : 'checklist_uncompleted',
      caseId,
      customerId: caseData.customerId,
      performedBy: updatedBy,
      metadata: { itemId, itemLabel: currentItem.label },
    });
    
    return { success: true, completed: newCompleted };
  } catch (error) {
    console.error("Error toggling checklist item:", error);
    throw error;
  }
};

/**
 * Checklist tamamlanma yüzdesini hesapla
 */
export const getChecklistProgress = (checklist) => {
  if (!checklist || checklist.length === 0) return { completed: 0, total: 0, percentage: 0 };
  
  const completed = checklist.filter(item => item.completed).length;
  const total = checklist.length;
  const percentage = Math.round((completed / total) * 100);
  
  return { completed, total, percentage };
};

/**
 * Mevcut aşama için zorunlu checklist kontrolü
 */
export const canProgressToNextStatus = (caseData, nextStatus) => {
  if (!caseData?.checklist) return { canProgress: true, missingItems: [] };
  
  // Şu anki aşama için zorunlu item'ları bul
  const currentPhase = caseData.status;
  const requiredItems = caseData.checklist.filter(
    item => item.required && item.phase === currentPhase && !item.completed
  );
  
  return {
    canProgress: requiredItems.length === 0,
    missingItems: requiredItems,
  };
};

// =============================================================================
// REMINDER FUNCTIONS
// =============================================================================

/**
 * Case'e hatırlatma ekle
 */
export const addReminderToCase = async (caseId, reminderData, createdBy = null) => {
  try {
    const caseData = await getCase(caseId);
    if (!caseData) throw new Error('Case not found');
    
    const newReminder = {
      id: `rem_${Date.now()}`,
      type: reminderData.type || 'custom',
      title: reminderData.title || '',
      description: reminderData.description || '',
      dueDate: reminderData.dueDate ? Timestamp.fromDate(new Date(reminderData.dueDate)) : null,
      status: 'pending',
      assignedTo: reminderData.assignedTo || createdBy,
      createdAt: Timestamp.now(),
      createdBy,
    };
    
    const reminders = caseData.reminders || [];
    reminders.push(newReminder);
    
    const caseRef = doc(db, COLLECTIONS.CASES, caseId);
    await updateDoc(caseRef, {
      reminders,
      updatedAt: serverTimestamp(),
    });
    
    // Aktivite kaydı
    await logActivity({
      type: ACTIVITY_TYPE.REMINDER_SET,
      caseId,
      customerId: caseData.customerId,
      performedBy: createdBy,
      metadata: { reminderId: newReminder.id, title: newReminder.title },
    });
    
    return newReminder;
  } catch (error) {
    console.error("Error adding reminder to case:", error);
    throw error;
  }
};

/**
 * Hatırlatma durumunu güncelle
 */
export const updateReminderStatus = async (caseId, reminderId, status, updatedBy = null) => {
  try {
    const caseData = await getCase(caseId);
    if (!caseData) throw new Error('Case not found');
    
    const reminders = caseData.reminders || [];
    const updatedReminders = reminders.map(rem => 
      rem.id === reminderId 
        ? { 
            ...rem, 
            status, 
            ...(status === 'completed' ? { completedAt: Timestamp.now(), completedBy: updatedBy } : {}),
            ...(status === 'snoozed' ? { snoozedAt: Timestamp.now(), snoozedBy: updatedBy } : {}),
          }
        : rem
    );
    
    const caseRef = doc(db, COLLECTIONS.CASES, caseId);
    await updateDoc(caseRef, {
      reminders: updatedReminders,
      updatedAt: serverTimestamp(),
    });
    
    // Aktivite kaydı (tamamlandıysa)
    if (status === 'completed') {
      await logActivity({
        type: ACTIVITY_TYPE.REMINDER_COMPLETED,
        caseId,
        customerId: caseData.customerId,
        performedBy: updatedBy,
        metadata: { reminderId },
      });
    }
    
    return true;
  } catch (error) {
    console.error("Error updating reminder status:", error);
    throw error;
  }
};

/**
 * Hatırlatmayı ertele
 */
export const snoozeReminder = async (caseId, reminderId, newDueDate, updatedBy = null) => {
  try {
    const caseData = await getCase(caseId);
    if (!caseData) throw new Error('Case not found');
    
    const reminders = caseData.reminders || [];
    const updatedReminders = reminders.map(rem => 
      rem.id === reminderId 
        ? { 
            ...rem, 
            dueDate: Timestamp.fromDate(new Date(newDueDate)),
            status: 'pending', // Ertelendikten sonra tekrar pending
            snoozedAt: Timestamp.now(),
            snoozedBy: updatedBy,
          }
        : rem
    );
    
    const caseRef = doc(db, COLLECTIONS.CASES, caseId);
    await updateDoc(caseRef, {
      reminders: updatedReminders,
      updatedAt: serverTimestamp(),
    });
    
    return true;
  } catch (error) {
    console.error("Error snoozing reminder:", error);
    throw error;
  }
};

/**
 * Hatırlatmayı sil
 */
export const deleteReminder = async (caseId, reminderId, deletedBy = null) => {
  try {
    const caseData = await getCase(caseId);
    if (!caseData) throw new Error('Case not found');
    
    const reminders = caseData.reminders || [];
    const filteredReminders = reminders.filter(rem => rem.id !== reminderId);
    
    const caseRef = doc(db, COLLECTIONS.CASES, caseId);
    await updateDoc(caseRef, {
      reminders: filteredReminders,
      updatedAt: serverTimestamp(),
    });
    
    return true;
  } catch (error) {
    console.error("Error deleting reminder:", error);
    throw error;
  }
};

/**
 * Yaklaşan hatırlatmaları getir (tüm case'lerden)
 */
export const getCaseUpcomingReminders = async (userId = null, options = {}) => {
  try {
    const { limitCount = 10, hoursAhead = 72 } = options;
    
    // Tüm açık case'leri getir
    let q = query(
      collection(db, COLLECTIONS.CASES),
      where('status', 'in', [
        CASE_STATUS.NEW,
        CASE_STATUS.QUALIFYING,
        CASE_STATUS.QUOTE_SENT,
        CASE_STATUS.NEGOTIATING,
        CASE_STATUS.ON_HOLD,
      ])
    );
    
    const snapshot = await getDocs(q);
    
    const now = new Date();
    const futureLimit = new Date(now.getTime() + hoursAhead * 60 * 60 * 1000);
    
    const allReminders = [];
    
    snapshot.forEach(docSnap => {
      const caseData = { id: docSnap.id, ...docSnap.data() };
      const reminders = caseData.reminders || [];
      
      reminders
        .filter(rem => {
          if (rem.status !== 'pending') return false;
          if (!rem.dueDate) return false;
          
          const dueDate = rem.dueDate.toDate();
          if (dueDate > futureLimit) return false;
          
          // userId belirtilmişse sadece o kullanıcının hatırlatmalarını
          if (userId && rem.assignedTo && rem.assignedTo !== userId) return false;
          
          return true;
        })
        .forEach(rem => {
          allReminders.push({
            ...rem,
            caseId: caseData.id,
            caseTitle: caseData.title,
            caseStatus: caseData.status,
            customerId: caseData.customerId,
            isOverdue: rem.dueDate.toDate() < now,
          });
        });
    });
    
    // Tarihe göre sırala ve limitle
    return allReminders
      .sort((a, b) => a.dueDate.toDate() - b.dueDate.toDate())
      .slice(0, limitCount);
  } catch (error) {
    console.error("Error getting upcoming reminders:", error);
    return [];
  }
};

/**
 * SLA ihlali olan case'leri getir
 */
export const getSLABreachedCases = async (options = {}) => {
  try {
    const { assignedTo = null, slaSettings = null } = options;
    
    // Import schema dynamically to avoid circular dependency
    const { DEFAULT_SLA_SETTINGS, calculateSLAStatus } = await import('./schema');
    const settings = slaSettings || DEFAULT_SLA_SETTINGS;
    
    let q = query(
      collection(db, COLLECTIONS.CASES),
      where('status', 'in', [
        CASE_STATUS.NEW,
        CASE_STATUS.QUALIFYING,
        CASE_STATUS.QUOTE_SENT,
        CASE_STATUS.NEGOTIATING,
        CASE_STATUS.ON_HOLD,
      ])
    );
    
    if (assignedTo !== null) {
      q = query(q, where('assignedTo', '==', assignedTo));
    }
    
    const snapshot = await getDocs(q);
    
    const breachedCases = [];
    
    snapshot.forEach(docSnap => {
      const caseData = { id: docSnap.id, ...docSnap.data() };
      const slaStatus = calculateSLAStatus(caseData, settings);
      
      if (slaStatus && (slaStatus.status === 'warning' || slaStatus.status === 'overdue')) {
        breachedCases.push({
          ...caseData,
          slaStatus,
        });
      }
    });
    
    // Overdue olanları önce, sonra warning
    return breachedCases.sort((a, b) => {
      if (a.slaStatus.status === 'overdue' && b.slaStatus.status !== 'overdue') return -1;
      if (a.slaStatus.status !== 'overdue' && b.slaStatus.status === 'overdue') return 1;
      return b.slaStatus.percentUsed - a.slaStatus.percentUsed;
    });
  } catch (error) {
    console.error("Error getting SLA breached cases:", error);
    return [];
  }
};

// =============================================================================
// ATTACHMENT FUNCTIONS - Ek Dosya Yönetimi
// =============================================================================

/**
 * Case'e dosya ekle
 */
export const addAttachmentToCase = async (caseId, attachment, userId = null) => {
  try {
    const caseData = await getCase(caseId);
    if (!caseData) throw new Error('Case not found');
    
    const newAttachment = {
      id: `att_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: attachment.name,
      url: attachment.url,
      type: attachment.type || 'file', // image, pdf, doc, file
      size: attachment.size || 0,
      category: attachment.category || 'general', // general, packaging, design, document, certificate
      description: attachment.description || '',
      uploadedBy: userId,
      uploadedAt: Timestamp.now(),
    };
    
    const attachments = caseData.attachments || [];
    attachments.push(newAttachment);
    
    const caseRef = doc(db, COLLECTIONS.CASES, caseId);
    await updateDoc(caseRef, {
      attachments,
      updatedAt: serverTimestamp(),
    });
    
    // Aktivite kaydı
    await logActivity({
      type: 'attachment_added',
      caseId,
      customerId: caseData.customerId,
      performedBy: userId,
      metadata: { fileName: attachment.name, fileType: attachment.type },
    });
    
    return newAttachment;
  } catch (error) {
    console.error("Error adding attachment:", error);
    throw error;
  }
};

/**
 * Case'den dosya sil
 */
export const deleteAttachmentFromCase = async (caseId, attachmentId, userId = null) => {
  try {
    const caseData = await getCase(caseId);
    if (!caseData) throw new Error('Case not found');
    
    const attachments = caseData.attachments || [];
    const attachment = attachments.find(a => a.id === attachmentId);
    const updatedAttachments = attachments.filter(a => a.id !== attachmentId);
    
    const caseRef = doc(db, COLLECTIONS.CASES, caseId);
    await updateDoc(caseRef, {
      attachments: updatedAttachments,
      updatedAt: serverTimestamp(),
    });
    
    // Aktivite kaydı
    await logActivity({
      type: 'attachment_deleted',
      caseId,
      customerId: caseData.customerId,
      performedBy: userId,
      metadata: { fileName: attachment?.name },
    });
    
    return true;
  } catch (error) {
    console.error("Error deleting attachment:", error);
    throw error;
  }
};

/**
 * Dosya açıklamasını güncelle
 */
export const updateAttachmentDescription = async (caseId, attachmentId, description, userId = null) => {
  try {
    const caseData = await getCase(caseId);
    if (!caseData) throw new Error('Case not found');
    
    const attachments = (caseData.attachments || []).map(a => 
      a.id === attachmentId ? { ...a, description } : a
    );
    
    const caseRef = doc(db, COLLECTIONS.CASES, caseId);
    await updateDoc(caseRef, {
      attachments,
      updatedAt: serverTimestamp(),
    });
    
    return true;
  } catch (error) {
    console.error("Error updating attachment:", error);
    throw error;
  }
};

// =============================================================================
// INTERNAL NOTES FUNCTIONS - Ekip Notları Yönetimi
// =============================================================================

/**
 * Case'e not ekle
 */
export const addNoteToCase = async (caseId, noteData, userId = null, userName = null) => {
  try {
    const caseData = await getCase(caseId);
    if (!caseData) throw new Error('Case not found');
    
    const newNote = {
      id: `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content: noteData.content,
      important: noteData.important || false,
      createdBy: userId,
      createdByName: userName || 'Bilinmeyen',
      createdAt: Timestamp.now(),
    };
    
    const internalNotes = caseData.internalNotes || [];
    internalNotes.unshift(newNote); // En yeni en üstte
    
    const caseRef = doc(db, COLLECTIONS.CASES, caseId);
    await updateDoc(caseRef, {
      internalNotes,
      updatedAt: serverTimestamp(),
    });
    
    // Aktivite kaydı
    await logActivity({
      type: 'note_added',
      caseId,
      customerId: caseData.customerId,
      performedBy: userId,
      metadata: { important: noteData.important },
    });
    
    return newNote;
  } catch (error) {
    console.error("Error adding note:", error);
    throw error;
  }
};

/**
 * Case'den not sil
 */
export const deleteNoteFromCase = async (caseId, noteId, userId = null) => {
  try {
    const caseData = await getCase(caseId);
    if (!caseData) throw new Error('Case not found');
    
    const internalNotes = (caseData.internalNotes || []).filter(n => n.id !== noteId);
    
    const caseRef = doc(db, COLLECTIONS.CASES, caseId);
    await updateDoc(caseRef, {
      internalNotes,
      updatedAt: serverTimestamp(),
    });
    
    return true;
  } catch (error) {
    console.error("Error deleting note:", error);
    throw error;
  }
};

/**
 * Not önem durumunu toggle et
 */
export const toggleNoteImportance = async (caseId, noteId, userId = null) => {
  try {
    const caseData = await getCase(caseId);
    if (!caseData) throw new Error('Case not found');
    
    const internalNotes = (caseData.internalNotes || []).map(n => 
      n.id === noteId ? { ...n, important: !n.important } : n
    );
    
    const caseRef = doc(db, COLLECTIONS.CASES, caseId);
    await updateDoc(caseRef, {
      internalNotes,
      updatedAt: serverTimestamp(),
    });
    
    return true;
  } catch (error) {
    console.error("Error toggling note importance:", error);
    throw error;
  }
};