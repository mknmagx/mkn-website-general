import { 
  collection,
  getDocs,
  query,
  orderBy,
  where,
  limit,
  startAfter,
  doc,
  updateDoc,
  deleteDoc,
  getDoc
} from "firebase/firestore";
import { db } from "../firebase";

/**
 * Admin panel için quote yönetim servisleri
 */

// Quote listesini getir
export const getQuotes = async (options = {}) => {
  const {
    status = null,
    limit: limitCount = 20,
    lastDoc = null,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = options;

  try {
    let q = query(collection(db, 'quote-requests'));

    // Status filtreleme
    if (status && status !== 'all') {
      q = query(q, where('metadata.status', '==', status));
    }

    // Sıralama
    q = query(q, orderBy(sortBy, sortOrder));

    // Pagination
    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    // Limit
    q = query(q, limit(limitCount));

    const snapshot = await getDocs(q);
    const quotes = [];

    snapshot.forEach((doc) => {
      quotes.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return {
      success: true,
      quotes,
      lastDoc: snapshot.docs[snapshot.docs.length - 1] || null,
      hasMore: snapshot.docs.length === limitCount
    };
  } catch (error) {
    console.error('Error fetching quotes:', error);
    return {
      success: false,
      error: error.message,
      quotes: [],
      lastDoc: null,
      hasMore: false
    };
  }
};

// Quote detaylarını getir
export const getQuoteById = async (quoteId) => {
  try {
    const docRef = doc(db, 'quote-requests', quoteId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        success: true,
        quote: {
          id: docSnap.id,
          ...docSnap.data()
        }
      };
    } else {
      return {
        success: false,
        error: 'Quote not found'
      };
    }
  } catch (error) {
    console.error('Error fetching quote:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Quote durumunu güncelle
export const updateQuoteStatus = async (quoteId, newStatus, notes = '') => {
  try {
    const docRef = doc(db, 'quote-requests', quoteId);
    const updateData = {
      'metadata.status': newStatus,
      'metadata.lastUpdated': new Date(),
      updatedAt: new Date()
    };

    if (notes) {
      updateData['metadata.adminNotes'] = notes;
    }

    await updateDoc(docRef, updateData);

    return {
      success: true,
      message: 'Quote durumu başarıyla güncellendi.'
    };
  } catch (error) {
    console.error('Error updating quote status:', error);
    return {
      success: false,
      error: error.message,
      message: 'Quote durumu güncellenirken hata oluştu.'
    };
  }
};

// Quote önceliğini güncelle
export const updateQuotePriority = async (quoteId, priority) => {
  try {
    const docRef = doc(db, 'quote-requests', quoteId);
    await updateDoc(docRef, {
      'metadata.priority': priority,
      'metadata.lastUpdated': new Date(),
      updatedAt: new Date()
    });

    return {
      success: true,
      message: 'Quote önceliği başarıyla güncellendi.'
    };
  } catch (error) {
    console.error('Error updating quote priority:', error);
    return {
      success: false,
      error: error.message,
      message: 'Quote önceliği güncellenirken hata oluştu.'
    };
  }
};

// Quote sil
export const deleteQuote = async (quoteId) => {
  try {
    await deleteDoc(doc(db, 'quote-requests', quoteId));

    return {
      success: true,
      message: 'Quote başarıyla silindi.'
    };
  } catch (error) {
    console.error('Error deleting quote:', error);
    return {
      success: false,
      error: error.message,
      message: 'Quote silinirken hata oluştu.'
    };
  }
};

// Quote istatistiklerini getir
export const getQuoteStats = async () => {
  try {
    const allQuotesQuery = query(collection(db, 'quote-requests'));
    const allQuotesSnapshot = await getDocs(allQuotesQuery);

    const stats = {
      total: 0,
      new: 0,
      inProgress: 0,
      responded: 0,
      closed: 0
    };

    allQuotesSnapshot.forEach((doc) => {
      const data = doc.data();
      const status = data.metadata?.status || 'new';
      
      stats.total++;
      
      switch (status) {
        case 'new':
          stats.new++;
          break;
        case 'in-progress':
          stats.inProgress++;
          break;
        case 'responded':
          stats.responded++;
          break;
        case 'closed':
          stats.closed++;
          break;
        default:
          stats.new++;
      }
    });

    return {
      success: true,
      stats
    };
  } catch (error) {
    console.error('Error fetching quote stats:', error);
    return {
      success: false,
      error: error.message,
      stats: {
        total: 0,
        new: 0,
        inProgress: 0,
        responded: 0,
        closed: 0
      }
    };
  }
};

// Quote arama
export const searchQuotes = async (searchTerm, searchField = 'all') => {
  try {
    // Firestore'da full-text search yoksa tüm quote'ları getirip filtreleme yapacağız
    const allQuotesQuery = query(
      collection(db, 'quote-requests'),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(allQuotesQuery);
    const quotes = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      const quote = { id: doc.id, ...data };
      
      // Arama terimi kontrolü
      const searchLower = searchTerm.toLowerCase();
      let isMatch = false;

      if (searchField === 'all' || searchField === 'name') {
        const fullName = `${data.contactInfo?.firstName || ''} ${data.contactInfo?.lastName || ''}`.toLowerCase();
        if (fullName.includes(searchLower)) isMatch = true;
      }

      if (searchField === 'all' || searchField === 'email') {
        const email = data.contactInfo?.email?.toLowerCase() || '';
        if (email.includes(searchLower)) isMatch = true;
      }

      if (searchField === 'all' || searchField === 'company') {
        const company = data.contactInfo?.company?.toLowerCase() || '';
        if (company.includes(searchLower)) isMatch = true;
      }

      if (searchField === 'all' || searchField === 'project') {
        const projectName = data.projectInfo?.projectName?.toLowerCase() || '';
        if (projectName.includes(searchLower)) isMatch = true;
      }

      if (isMatch) {
        quotes.push(quote);
      }
    });

    return {
      success: true,
      quotes
    };
  } catch (error) {
    console.error('Error searching quotes:', error);
    return {
      success: false,
      error: error.message,
      quotes: []
    };
  }
};