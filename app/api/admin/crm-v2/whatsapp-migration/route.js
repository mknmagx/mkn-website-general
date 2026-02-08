/**
 * WhatsApp Contacts to CRM Customers Migration API
 * 
 * Bu endpoint, mevcut whatsapp_contacts verilerini CRM customers'a taşır.
 * 
 * GET: Migration istatistiklerini al
 * POST: 
 *   - action: 'analyze' - Analiz et (dry-run)
 *   - action: 'migrate' - Gerçek migration
 *   - action: 'migrateOne' - Tek bir contact'ı migrate et
 */

import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import admin from 'firebase-admin';
import { normalizePhone } from '@/utils/phone-utils';

// CRM v2 Collections
const CRM_COLLECTIONS = {
  CUSTOMERS: 'crm_customers',
};

// WhatsApp Collections
const WA_COLLECTIONS = {
  CONTACTS: 'whatsapp_contacts',
};

/**
 * WhatsApp contact'ı CRM customer'a dönüştür
 */
const mapContactToCustomer = (waContact) => {
  const now = admin.firestore.FieldValue.serverTimestamp();
  const phone = normalizePhone(waContact.phoneNumber || waContact.waId || '');
  
  return {
    // Temel bilgiler
    name: waContact.name || phone,
    email: waContact.email || '',
    phone: phone,
    
    // Şirket bilgileri (WhatsApp contact'tan)
    company: {
      name: waContact.company || '',
      position: waContact.position || '',
      website: '',
      industry: '',
      size: '',
      address: waContact.address || '',
      country: 'TR',
      city: '',
    },
    
    // Vergi bilgileri (boş)
    taxInfo: {
      taxOffice: '',
      taxNumber: '',
      mersisNumber: '',
    },
    
    // Alternatif iletişim bilgileri
    alternativeContacts: [],
    
    // Müşteri sınıflandırma
    type: 'lead', // WhatsApp'tan gelen default lead
    priority: 'normal',
    tags: waContact.tags || [],
    
    // İstatistikler
    stats: {
      totalConversations: 0,
      totalCases: 0,
      openCases: 0,
      wonCases: 0,
      lostCases: 0,
      totalValue: 0,
      lastContactAt: waContact.lastContactAt || waContact.updatedAt || null,
      firstContactAt: waContact.createdAt || now,
    },
    
    // Bağlı veriler
    linkedCompanyId: null,
    
    // Notlar
    notes: waContact.notes || '',
    
    // Meta
    createdAt: waContact.createdAt || now,
    updatedAt: now,
    createdBy: waContact.createdBy || null,
    
    // Migration bilgisi
    migratedAt: now,
    migratedFrom: 'whatsapp_contacts',
    sourceRef: {
      type: 'whatsapp_contact_migration',
      id: waContact.id,
      waId: waContact.waId || waContact.phoneNumber,
    },
  };
};

/**
 * CRM'de müşteri ara (telefon ile)
 */
const findExistingCustomer = async (phone) => {
  if (!phone) return null;
  
  const normalizedPhone = normalizePhone(phone);
  if (!normalizedPhone) return null;
  
  try {
    // Tüm müşterileri çek ve normalize edilmiş telefon ile karşılaştır
    const snapshot = await adminDb.collection(CRM_COLLECTIONS.CUSTOMERS).get();
    
    for (const doc of snapshot.docs) {
      const data = doc.data();
      const customerPhone = normalizePhone(data.phone || '');
      
      if (customerPhone && customerPhone === normalizedPhone) {
        return { id: doc.id, ...data };
      }
      
      // Alternatif iletişim bilgilerinde de ara
      const altContacts = data.alternativeContacts || [];
      for (const alt of altContacts) {
        if (alt.type === 'phone') {
          const altPhone = normalizePhone(alt.value || '');
          if (altPhone === normalizedPhone) {
            return { id: doc.id, ...data };
          }
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('[Migration] Error finding customer:', error);
    return null;
  }
};

export async function GET(request) {
  try {
    if (!adminDb) {
      return NextResponse.json({
        success: false,
        error: 'Firebase Admin DB not initialized',
      }, { status: 500 });
    }
    
    // WhatsApp contacts sayısını al
    const waContactsSnapshot = await adminDb.collection(WA_COLLECTIONS.CONTACTS).get();
    const waContactsCount = waContactsSnapshot.size;
    
    // CRM customers sayısını al
    const crmCustomersSnapshot = await adminDb.collection(CRM_COLLECTIONS.CUSTOMERS).get();
    const crmCustomersCount = crmCustomersSnapshot.size;
    
    // whatsapp_contact_migration kaynağından gelen müşteri sayısı
    let migratedCount = 0;
    crmCustomersSnapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data.migratedFrom === 'whatsapp_contacts') {
        migratedCount++;
      }
    });
    
    return NextResponse.json({
      success: true,
      stats: {
        whatsappContacts: waContactsCount,
        crmCustomers: crmCustomersCount,
        migratedFromWhatsApp: migratedCount,
        pendingMigration: waContactsCount - migratedCount,
      },
    });
    
  } catch (error) {
    console.error('[WhatsApp Migration API] GET error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'İstatistikler alınamadı',
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    if (!adminDb) {
      return NextResponse.json({
        success: false,
        error: 'Firebase Admin DB not initialized',
      }, { status: 500 });
    }
    
    const body = await request.json();
    const { action = 'analyze' } = body;
    
    // WhatsApp contacts'ları al
    const waContactsSnapshot = await adminDb.collection(WA_COLLECTIONS.CONTACTS).get();
    const waContacts = waContactsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    const results = {
      total: waContacts.length,
      alreadyExists: 0,
      toMigrate: 0,
      migrated: 0,
      failed: 0,
      details: [],
    };
    
    for (const waContact of waContacts) {
      const phone = waContact.phoneNumber || waContact.waId;
      
      if (!phone) {
        results.failed++;
        results.details.push({
          contact: waContact,
          status: 'failed',
          reason: 'Telefon numarası yok',
        });
        continue;
      }
      
      // CRM'de zaten var mı kontrol et
      const existingCustomer = await findExistingCustomer(phone);
      
      if (existingCustomer) {
        results.alreadyExists++;
        results.details.push({
          contact: waContact,
          status: 'exists',
          customerId: existingCustomer.id,
          customerName: existingCustomer.name,
        });
        continue;
      }
      
      // Migration gerekiyor
      results.toMigrate++;
      
      if (action === 'migrate') {
        try {
          // CRM customer oluştur
          const customerData = mapContactToCustomer(waContact);
          const docRef = await adminDb.collection(CRM_COLLECTIONS.CUSTOMERS).add(customerData);
          
          results.migrated++;
          results.details.push({
            contact: waContact,
            status: 'migrated',
            newCustomerId: docRef.id,
          });
        } catch (migrateError) {
          results.failed++;
          results.details.push({
            contact: waContact,
            status: 'failed',
            reason: migrateError.message,
          });
        }
      } else {
        // Analyze mode - sadece kaydet
        results.details.push({
          contact: waContact,
          status: 'pending',
          willCreate: mapContactToCustomer(waContact),
        });
      }
    }
    
    return NextResponse.json({
      success: true,
      action,
      results,
      message: action === 'migrate' 
        ? `${results.migrated} contact CRM'e taşındı` 
        : `${results.toMigrate} contact taşınabilir`,
    });
    
  } catch (error) {
    console.error('[WhatsApp Migration API] POST error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Migration başarısız',
    }, { status: 500 });
  }
}
