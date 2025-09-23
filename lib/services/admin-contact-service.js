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
 * Admin panel için contact mesajları yönetim servisleri
 */

// Contact mesajlarını getir
export const getContactMessages = async (options = {}) => {
  const {
    status = null,
    limit: limitCount = 20,
    lastDoc = null,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = options;

  try {
    let q = query(collection(db, 'contact-messages'));

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
    const contacts = [];

    snapshot.forEach((doc) => {
      contacts.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return {
      success: true,
      contacts,
      lastDoc: snapshot.docs[snapshot.docs.length - 1] || null,
      hasMore: snapshot.docs.length === limitCount
    };
  } catch (error) {
    console.error('Error fetching contact messages:', error);
    return {
      success: false,
      error: error.message,
      contacts: [],
      lastDoc: null,
      hasMore: false
    };
  }
};

// Contact mesajı detaylarını getir
export const getContactMessageById = async (contactId) => {
  try {
    const docRef = doc(db, 'contact-messages', contactId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        success: true,
        contact: {
          id: docSnap.id,
          ...docSnap.data()
        }
      };
    } else {
      return {
        success: false,
        error: 'Contact message not found'
      };
    }
  } catch (error) {
    console.error('Error fetching contact message:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Contact mesajı durumunu güncelle
export const updateContactStatus = async (contactId, newStatus, notes = '') => {
  try {
    const docRef = doc(db, 'contact-messages', contactId);
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
      message: 'Mesaj durumu başarıyla güncellendi.'
    };
  } catch (error) {
    console.error('Error updating contact status:', error);
    return {
      success: false,
      error: error.message,
      message: 'Mesaj durumu güncellenirken hata oluştu.'
    };
  }
};

// Contact mesajı önceliğini güncelle
export const updateContactPriority = async (contactId, priority) => {
  try {
    const docRef = doc(db, 'contact-messages', contactId);
    await updateDoc(docRef, {
      'metadata.priority': priority,
      'metadata.lastUpdated': new Date(),
      updatedAt: new Date()
    });

    return {
      success: true,
      message: 'Mesaj önceliği başarıyla güncellendi.'
    };
  } catch (error) {
    console.error('Error updating contact priority:', error);
    return {
      success: false,
      error: error.message,
      message: 'Mesaj önceliği güncellenirken hata oluştu.'
    };
  }
};

// Contact mesajını sil
export const deleteContactMessage = async (contactId) => {
  try {
    await deleteDoc(doc(db, 'contact-messages', contactId));

    return {
      success: true,
      message: 'Mesaj başarıyla silindi.'
    };
  } catch (error) {
    console.error('Error deleting contact message:', error);
    return {
      success: false,
      error: error.message,
      message: 'Mesaj silinirken hata oluştu.'
    };
  }
};

// Contact istatistiklerini getir
export const getContactStats = async () => {
  try {
    const allContactsQuery = query(collection(db, 'contact-messages'));
    const allContactsSnapshot = await getDocs(allContactsQuery);

    const stats = {
      total: 0,
      new: 0,
      inProgress: 0,
      responded: 0,
      closed: 0
    };

    allContactsSnapshot.forEach((doc) => {
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
    console.error('Error fetching contact stats:', error);
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

// Contact mesajları arama
export const searchContactMessages = async (searchTerm, searchField = 'all') => {
  try {
    // Firestore'da full-text search yoksa tüm contact'ları getirip filtreleme yapacağız
    const allContactsQuery = query(
      collection(db, 'contact-messages'),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(allContactsQuery);
    const contacts = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      const contact = { id: doc.id, ...data };
      
      // Arama terimi kontrolü
      const searchLower = searchTerm.toLowerCase();
      let isMatch = false;

      if (searchField === 'all' || searchField === 'name') {
        const name = data.contactInfo?.name?.toLowerCase() || '';
        if (name.includes(searchLower)) isMatch = true;
      }

      if (searchField === 'all' || searchField === 'email') {
        const email = data.contactInfo?.email?.toLowerCase() || '';
        if (email.includes(searchLower)) isMatch = true;
      }

      if (searchField === 'all' || searchField === 'company') {
        const company = data.contactInfo?.company?.toLowerCase() || '';
        if (company.includes(searchLower)) isMatch = true;
      }

      if (searchField === 'all' || searchField === 'message') {
        const message = data.requestInfo?.message?.toLowerCase() || '';
        if (message.includes(searchLower)) isMatch = true;
      }

      if (isMatch) {
        contacts.push(contact);
      }
    });

    return {
      success: true,
      contacts
    };
  } catch (error) {
    console.error('Error searching contact messages:', error);
    return {
      success: false,
      error: error.message,
      contacts: []
    };
  }
};