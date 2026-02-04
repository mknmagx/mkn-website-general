/**
 * WhatsApp Business API - Contact Service
 * Kişi yönetimi servisi (Telefon Rehberi)
 */

import { adminDb } from '../../firebase-admin';
import admin from 'firebase-admin';
import {
  COLLECTIONS,
  CONTACT_SCHEMA,
  CONTACT_GROUPS,
} from './schema';

/**
 * Format phone number to international format
 */
export function formatPhoneNumber(phone) {
  if (!phone) return null;
  
  // Remove all non-digits
  let cleaned = phone.replace(/\D/g, '');
  
  // Handle Turkish numbers
  if (cleaned.startsWith('0')) {
    cleaned = '90' + cleaned.slice(1);
  }
  
  // Add country code if missing (default Turkey)
  if (cleaned.length === 10) {
    cleaned = '90' + cleaned;
  }
  
  return cleaned;
}

/**
 * Validate phone number
 */
export function validatePhoneNumber(phone) {
  const formatted = formatPhoneNumber(phone);
  if (!formatted) return { valid: false, error: 'Telefon numarası gerekli' };
  if (formatted.length < 10 || formatted.length > 15) {
    return { valid: false, error: 'Geçersiz telefon numarası uzunluğu' };
  }
  return { valid: true, formatted };
}

/**
 * Get all contacts with pagination and filters
 */
export async function getContacts(options = {}) {
  try {
    if (!adminDb) {
      console.error('Firebase Admin DB not initialized');
      return { data: [], hasMore: false };
    }

    const {
      search,
      group,
      tag,
      pageSize = 50,
      lastDoc,
      sortBy = 'name',
      sortDir = 'asc',
      phoneNumberId, // Optional: filter by phoneNumberId
      filterByPhoneNumberId = false, // Explicitly enable phoneNumberId filtering
    } = options;

    let queryRef = adminDb.collection(COLLECTIONS.CONTACTS);

    // Only filter by phoneNumberId if explicitly requested
    if (filterByPhoneNumberId && phoneNumberId) {
      queryRef = queryRef.where('phoneNumberId', '==', phoneNumberId);
    }

    // Filters
    if (group && group !== 'all') {
      queryRef = queryRef.where('group', '==', group);
    }

    if (tag) {
      queryRef = queryRef.where('tags', 'array-contains', tag);
    }

    // Sort
    queryRef = queryRef.orderBy(sortBy, sortDir);

    // Pagination
    if (lastDoc) {
      queryRef = queryRef.startAfter(lastDoc);
    }

    queryRef = queryRef.limit(pageSize + 1);

    const snapshot = await queryRef.get();
    const contacts = [];
    let lastVisible = null;

    snapshot.docs.slice(0, pageSize).forEach((doc) => {
      contacts.push({ id: doc.id, ...doc.data() });
      lastVisible = doc;
    });

    // Client-side search filtering
    let filtered = contacts;
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = contacts.filter(
        (contact) =>
          contact.name?.toLowerCase().includes(searchLower) ||
          contact.phoneNumber?.includes(search) ||
          contact.company?.toLowerCase().includes(searchLower) ||
          contact.email?.toLowerCase().includes(searchLower)
      );
    }

    return {
      data: filtered,
      hasMore: snapshot.docs.length > pageSize,
      lastDoc: lastVisible,
    };
  } catch (error) {
    console.error('Error getting contacts:', error);
    throw error;
  }
}

/**
 * Get single contact by ID
 */
export async function getContact(contactId) {
  try {
    if (!adminDb) {
      console.error('Firebase Admin DB not initialized');
      return null;
    }

    const docRef = adminDb.collection(COLLECTIONS.CONTACTS).doc(contactId);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      return { id: docSnap.id, ...docSnap.data() };
    }

    return null;
  } catch (error) {
    console.error('Error getting contact:', error);
    throw error;
  }
}

/**
 * Find contact by phone number
 */
export async function findByPhone(phoneNumber) {
  try {
    if (!adminDb) {
      console.error('Firebase Admin DB not initialized');
      return null;
    }

    const formatted = formatPhoneNumber(phoneNumber);
    if (!formatted) return null;

    const snapshot = await adminDb
      .collection(COLLECTIONS.CONTACTS)
      .where('phoneNumber', '==', formatted)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  } catch (error) {
    console.error('Error finding contact by phone:', error);
    throw error;
  }
}

/**
 * Create new contact
 */
export async function createContact(contactData, userId = null) {
  try {
    if (!adminDb) {
      throw new Error('Firebase Admin DB not initialized');
    }

    // Validate phone number
    const validation = validatePhoneNumber(contactData.phoneNumber);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // Check if already exists
    const existing = await findByPhone(validation.formatted);
    if (existing) {
      return { success: false, error: 'Bu telefon numarası zaten kayıtlı', existingContact: existing };
    }

    const newContact = {
      ...CONTACT_SCHEMA,
      ...contactData,
      phoneNumber: validation.formatted,
      waId: validation.formatted,
      group: contactData.group || CONTACT_GROUPS.OTHER,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: userId,
    };

    // Remove undefined values to prevent Firestore error
    Object.keys(newContact).forEach(key => {
      if (newContact[key] === undefined) {
        delete newContact[key];
      }
    });

    const docRef = await adminDb.collection(COLLECTIONS.CONTACTS).add(newContact);
    
    return { 
      success: true, 
      contact: { id: docRef.id, ...newContact },
    };
  } catch (error) {
    console.error('Error creating contact:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Update contact
 */
export async function updateContact(contactId, updateData) {
  try {
    if (!adminDb) {
      throw new Error('Firebase Admin DB not initialized');
    }

    // If phone number is being updated, validate it
    if (updateData.phoneNumber) {
      const validation = validatePhoneNumber(updateData.phoneNumber);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }
      updateData.phoneNumber = validation.formatted;
      updateData.waId = validation.formatted;
    }

    const docRef = adminDb.collection(COLLECTIONS.CONTACTS).doc(contactId);
    await docRef.update({
      ...updateData,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating contact:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete contact
 */
export async function deleteContact(contactId) {
  try {
    if (!adminDb) {
      throw new Error('Firebase Admin DB not initialized');
    }

    const docRef = adminDb.collection(COLLECTIONS.CONTACTS).doc(contactId);
    await docRef.delete();

    return { success: true };
  } catch (error) {
    console.error('Error deleting contact:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Add tag to contact
 */
export async function addTagToContact(contactId, tag) {
  try {
    if (!adminDb) {
      throw new Error('Firebase Admin DB not initialized');
    }

    const docRef = adminDb.collection(COLLECTIONS.CONTACTS).doc(contactId);
    await docRef.update({
      tags: admin.firestore.FieldValue.arrayUnion(tag),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error('Error adding tag to contact:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Remove tag from contact
 */
export async function removeTagFromContact(contactId, tag) {
  try {
    if (!adminDb) {
      throw new Error('Firebase Admin DB not initialized');
    }

    const docRef = adminDb.collection(COLLECTIONS.CONTACTS).doc(contactId);
    await docRef.update({
      tags: admin.firestore.FieldValue.arrayRemove(tag),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error('Error removing tag from contact:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Update contact from conversation (auto-sync)
 */
export async function syncContactFromConversation(conversation) {
  try {
    if (!adminDb || !conversation?.waId) return null;

    const existing = await findByPhone(conversation.waId);
    
    if (existing) {
      // Update existing contact with latest info
      await updateContact(existing.id, {
        profileName: conversation.profileName || existing.profileName,
        lastConversationId: conversation.id,
        lastMessageAt: conversation.lastMessageAt,
      });
      return existing;
    }

    // Create new contact from conversation
    const result = await createContact({
      phoneNumber: conversation.waId,
      name: conversation.profileName || conversation.waId,
      profileName: conversation.profileName,
      lastConversationId: conversation.id,
      lastMessageAt: conversation.lastMessageAt,
      group: CONTACT_GROUPS.CUSTOMER,
    });

    return result.success ? result.contact : null;
  } catch (error) {
    console.error('Error syncing contact from conversation:', error);
    return null;
  }
}

/**
 * Get contact groups with counts
 */
export async function getContactGroupStats(phoneNumberIdFilter = null, filterByPhoneNumberId = false) {
  try {
    if (!adminDb) {
      console.error('Firebase Admin DB not initialized');
      return {};
    }

    const stats = {};
    
    for (const [key, value] of Object.entries(CONTACT_GROUPS)) {
      let query = adminDb
        .collection(COLLECTIONS.CONTACTS)
        .where('group', '==', value);
      
      // Only filter by phoneNumberId if explicitly requested
      if (filterByPhoneNumberId && phoneNumberIdFilter) {
        query = query.where('phoneNumberId', '==', phoneNumberIdFilter);
      }
      
      const snapshot = await query.count().get();
      stats[value] = snapshot.data().count;
    }

    // Total count
    let totalQuery = adminDb.collection(COLLECTIONS.CONTACTS);
    if (filterByPhoneNumberId && phoneNumberIdFilter) {
      totalQuery = totalQuery.where('phoneNumberId', '==', phoneNumberIdFilter);
    }
    const totalSnapshot = await totalQuery.count().get();
    stats.total = totalSnapshot.data().count;

    return stats;
  } catch (error) {
    console.error('Error getting contact group stats:', error);
    return {};
  }
}

/**
 * Search contacts
 */
export async function searchContacts(query, limit = 10, phoneNumberIdFilter = null, filterByPhoneNumberId = false) {
  try {
    if (!adminDb || !query) {
      return [];
    }

    // Get all contacts and filter (Firestore doesn't support full-text search)
    let queryRef = adminDb.collection(COLLECTIONS.CONTACTS);
    
    // Only filter by phoneNumberId if explicitly requested
    if (filterByPhoneNumberId && phoneNumberIdFilter) {
      queryRef = queryRef.where('phoneNumberId', '==', phoneNumberIdFilter);
    }
    
    const snapshot = await queryRef
      .orderBy('name')
      .limit(100)
      .get();

    const queryLower = query.toLowerCase();
    const results = [];

    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      if (
        data.name?.toLowerCase().includes(queryLower) ||
        data.phoneNumber?.includes(query) ||
        data.company?.toLowerCase().includes(queryLower)
      ) {
        results.push({ id: doc.id, ...data });
      }
    });

    return results.slice(0, limit);
  } catch (error) {
    console.error('Error searching contacts:', error);
    return [];
  }
}

/**
 * Import contacts from array
 */
export async function importContacts(contactsArray, userId = null) {
  try {
    if (!adminDb) {
      throw new Error('Firebase Admin DB not initialized');
    }

    const results = {
      success: 0,
      failed: 0,
      duplicates: 0,
      errors: [],
    };

    for (const contact of contactsArray) {
      const result = await createContact(contact, userId);
      
      if (result.success) {
        results.success++;
      } else if (result.existingContact) {
        results.duplicates++;
      } else {
        results.failed++;
        results.errors.push({ contact, error: result.error });
      }
    }

    return results;
  } catch (error) {
    console.error('Error importing contacts:', error);
    throw error;
  }
}
