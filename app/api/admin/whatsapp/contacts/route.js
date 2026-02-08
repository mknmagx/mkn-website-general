/**
 * WhatsApp Contacts API Route
 * 
 * 🔄 REFACTORED: Artık CRM Customers tabanlı (Admin SDK)
 * 
 * WhatsApp rehberi artık ayrı bir collection değil,
 * CRM customers'tan telefon numarası olanları gösterir.
 * 
 * GET: CRM müşterilerini (telefon numarası olanlar) listele / ara
 * POST: Yeni CRM müşteri oluştur (telefon ile)
 * PATCH: CRM müşteri güncelle
 */

import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import admin from 'firebase-admin';
import { normalizePhone } from '@/lib/utils/phone-utils';

// CRM Collections
const CRM_COLLECTIONS = {
  CUSTOMERS: 'crm_customers',
};

// Müşteri tiplerini WhatsApp gruplarına map et
const CUSTOMER_TYPE_TO_GROUP = {
  customer: 'customer',
  lead: 'lead',
  prospect: 'lead',
  partner: 'partner',
  supplier: 'supplier',
  other: 'other',
};

const GROUP_LABELS = {
  customer: 'Müşteri',
  lead: 'Potansiyel',
  supplier: 'Tedarikçi',
  partner: 'İş Ortağı',
  other: 'Diğer',
};

// CRM customer'ı WhatsApp contact formatına dönüştür
function mapCustomerToContact(customer) {
  const phone = normalizePhone(customer.phone || '');
  return {
    id: customer.id,
    name: customer.name || phone,
    phoneNumber: phone,
    waId: phone,
    email: customer.email || '',
    company: customer.company?.name || '',
    group: CUSTOMER_TYPE_TO_GROUP[customer.type] || 'other',
    tags: customer.tags || [],
    notes: customer.notes || '',
    // CRM referansı
    crmCustomerId: customer.id,
    linkedCompanyId: customer.linkedCompanyId,
    // Meta
    createdAt: customer.createdAt,
    updatedAt: customer.updatedAt,
  };
}

// Telefon ile müşteri bul (Admin SDK)
async function findCustomerByPhone(phone) {
  if (!phone || !adminDb) return null;
  
  const normalizedPhone = normalizePhone(phone);
  if (!normalizedPhone) return null;
  
  try {
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
    console.error('[Contacts API] Error finding customer by phone:', error);
    return null;
  }
}

// Tüm müşterileri al (Admin SDK)
async function getAllCustomersWithPhone() {
  if (!adminDb) return [];
  
  try {
    const snapshot = await adminDb
      .collection(CRM_COLLECTIONS.CUSTOMERS)
      .orderBy('name', 'asc')
      .get();
    
    return snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(c => c.phone && normalizePhone(c.phone));
  } catch (error) {
    console.error('[Contacts API] Error getting customers:', error);
    return [];
  }
}

export async function GET(request) {
  try {
    if (!adminDb) {
      return NextResponse.json({
        success: false,
        error: 'Firebase Admin DB not initialized',
      }, { status: 500 });
    }
    
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    // Get contact groups stats
    if (action === 'stats') {
      const withPhone = await getAllCustomersWithPhone();
      
      const stats = {
        total: withPhone.length,
        customer: withPhone.filter(c => c.type === 'customer').length,
        lead: withPhone.filter(c => c.type === 'lead' || c.type === 'prospect').length,
        supplier: withPhone.filter(c => c.type === 'supplier').length,
        partner: withPhone.filter(c => c.type === 'partner').length,
        other: withPhone.filter(c => !c.type || c.type === 'other').length,
      };
      
      return NextResponse.json({
        success: true,
        data: stats,
      });
    }

    // Get groups list
    if (action === 'groups') {
      return NextResponse.json({
        success: true,
        data: Object.entries(GROUP_LABELS).map(([id, label]) => ({ id, label })),
      });
    }

    // Search contacts
    const searchQuery = searchParams.get('search');
    const exactMatch = searchParams.get('exactMatch') === 'true';
    
    // Exact phone match
    if (searchQuery && exactMatch) {
      const customer = await findCustomerByPhone(searchQuery);
      if (customer && customer.phone) {
        return NextResponse.json({
          success: true,
          data: [mapCustomerToContact(customer)],
        });
      }
      return NextResponse.json({
        success: true,
        data: [],
      });
    }

    // Get single contact by ID
    const contactId = searchParams.get('id');
    if (contactId) {
      const docSnap = await adminDb.collection(CRM_COLLECTIONS.CUSTOMERS).doc(contactId).get();
      if (!docSnap.exists || !docSnap.data()?.phone) {
        return NextResponse.json({
          success: false,
          error: 'Kişi bulunamadı',
        }, { status: 404 });
      }
      return NextResponse.json({
        success: true,
        data: mapCustomerToContact({ id: docSnap.id, ...docSnap.data() }),
      });
    }

    // List all contacts with phone numbers
    const group = searchParams.get('group');
    const includeStats = searchParams.get('stats') === 'true';
    const pageSize = parseInt(searchParams.get('pageSize')) || parseInt(searchParams.get('limit')) || 1000;
    
    // CRM müşterilerini al
    const allCustomers = await getAllCustomersWithPhone();
    let contacts = allCustomers.map(mapCustomerToContact);
    
    // Stats hesapla (filtreden önce)
    let stats = null;
    if (includeStats) {
      const groupCounts = {};
      allCustomers.forEach(c => {
        const group = CUSTOMER_TYPE_TO_GROUP[c.type] || 'other';
        groupCounts[group] = (groupCounts[group] || 0) + 1;
      });
      
      stats = {
        total: allCustomers.length,
        groups: groupCounts,
      };
    }
    
    // Grup filtresi
    if (group && group !== 'all') {
      contacts = contacts.filter(c => c.group === group);
    }
    
    // Arama filtresi
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      contacts = contacts.filter(c => 
        c.name?.toLowerCase().includes(query) ||
        c.phoneNumber?.includes(query) ||
        c.company?.toLowerCase().includes(query) ||
        c.email?.toLowerCase().includes(query)
      );
    }
    
    // Pagination (basit)
    const limitedContacts = contacts.slice(0, pageSize);

    const response = {
      success: true,
      data: limitedContacts,
      hasMore: contacts.length > pageSize,
      total: contacts.length,
    };
    
    if (stats) {
      response.stats = stats;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('WhatsApp contacts GET error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
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
    const { action } = body;

    // Import contacts (bulk) - CRM customers olarak oluştur
    if (action === 'import') {
      const { contacts, userId } = body;
      if (!Array.isArray(contacts) || contacts.length === 0) {
        return NextResponse.json({
          success: false,
          error: 'Geçerli kişi listesi gerekli',
        }, { status: 400 });
      }

      let success = 0;
      let duplicates = 0;
      let failed = 0;

      for (const contact of contacts) {
        try {
          const phone = normalizePhone(contact.phoneNumber || contact.phone);
          if (!phone) {
            failed++;
            continue;
          }
          
          // Zaten var mı?
          const existing = await findCustomerByPhone(phone);
          if (existing) {
            duplicates++;
            continue;
          }
          
          // CRM customer oluştur
          const now = admin.firestore.FieldValue.serverTimestamp();
          await adminDb.collection(CRM_COLLECTIONS.CUSTOMERS).add({
            name: contact.name || phone,
            phone: phone,
            email: contact.email || '',
            company: { name: contact.company || '' },
            type: 'lead',
            notes: contact.notes || 'WhatsApp rehberinden import edildi',
            tags: contact.tags || [],
            createdBy: userId,
            createdAt: now,
            updatedAt: now,
            stats: {
              totalConversations: 0,
              totalCases: 0,
              openCases: 0,
              wonCases: 0,
              lostCases: 0,
              totalValue: 0,
              lastContactAt: null,
              firstContactAt: now,
            },
          });
          success++;
        } catch (e) {
          console.error('Import error:', e);
          failed++;
        }
      }

      return NextResponse.json({
        success: true,
        data: { success, duplicates, failed },
        message: `${success} kişi eklendi, ${duplicates} tekrar, ${failed} hatalı`,
      });
    }

    // Create single contact - CRM customer olarak
    const { phoneNumber, name, company, email, group, notes, tags, userId } = body;

    if (!phoneNumber) {
      return NextResponse.json({
        success: false,
        error: 'Telefon numarası gerekli',
      }, { status: 400 });
    }

    const normalizedPhone = normalizePhone(phoneNumber);
    
    // Zaten var mı kontrol et
    const existing = await findCustomerByPhone(normalizedPhone);
    if (existing) {
      return NextResponse.json({
        success: false,
        error: 'Bu telefon numarası zaten kayıtlı',
        existingContact: mapCustomerToContact(existing),
      }, { status: 400 });
    }

    // Grup → CRM type mapping
    const typeMap = {
      customer: 'customer',
      lead: 'lead',
      supplier: 'supplier',
      partner: 'partner',
      other: 'lead',
    };

    // CRM customer oluştur
    const now = admin.firestore.FieldValue.serverTimestamp();
    const newCustomerData = {
      name: name || normalizedPhone,
      phone: normalizedPhone,
      email: email || '',
      company: { name: company || '' },
      type: typeMap[group] || 'lead',
      notes: notes || 'WhatsApp rehberinden eklendi',
      tags: tags || [],
      createdBy: userId || null,
      createdAt: now,
      updatedAt: now,
      stats: {
        totalConversations: 0,
        totalCases: 0,
        openCases: 0,
        wonCases: 0,
        lostCases: 0,
        totalValue: 0,
        lastContactAt: null,
        firstContactAt: now,
      },
    };
    
    const docRef = await adminDb.collection(CRM_COLLECTIONS.CUSTOMERS).add(newCustomerData);
    const newCustomer = { id: docRef.id, ...newCustomerData };

    return NextResponse.json({
      success: true,
      contact: mapCustomerToContact(newCustomer),
      data: mapCustomerToContact(newCustomer),
      message: 'Kişi başarıyla oluşturuldu',
    });
  } catch (error) {
    console.error('WhatsApp contacts POST error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    if (!adminDb) {
      return NextResponse.json({
        success: false,
        error: 'Firebase Admin DB not initialized',
      }, { status: 500 });
    }
    
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Kişi ID gerekli',
      }, { status: 400 });
    }

    // CRM customer güncelle
    const updates = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    
    if (updateData.name) updates.name = updateData.name;
    if (updateData.email) updates.email = updateData.email;
    if (updateData.company) updates['company.name'] = updateData.company;
    if (updateData.notes) updates.notes = updateData.notes;
    if (updateData.tags) updates.tags = updateData.tags;
    if (updateData.phoneNumber) updates.phone = normalizePhone(updateData.phoneNumber);
    
    // Group → type mapping
    if (updateData.group) {
      const typeMap = {
        customer: 'customer',
        lead: 'lead',
        supplier: 'supplier',
        partner: 'partner',
        other: 'lead',
      };
      updates.type = typeMap[updateData.group] || 'lead';
    }

    await adminDb.collection(CRM_COLLECTIONS.CUSTOMERS).doc(id).update(updates);

    return NextResponse.json({
      success: true,
      message: 'Kişi başarıyla güncellendi',
    });
  } catch (error) {
    console.error('WhatsApp contacts PATCH error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}

// DELETE endpoint - CRM müşterisini silmek yerine sadece uyarı ver
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const contactId = searchParams.get('id');

    if (!contactId) {
      return NextResponse.json({
        success: false,
        error: 'Kişi ID gerekli',
      }, { status: 400 });
    }

    // CRM müşterisini silmek tehlikeli - uyarı ver
    return NextResponse.json({
      success: false,
      error: 'CRM müşterisi WhatsApp rehberinden silinemez. Müşteri silmek için CRM sayfasını kullanın.',
      redirectTo: `/admin/crm-v2/customers/${contactId}`,
    }, { status: 403 });
  } catch (error) {
    console.error('WhatsApp contacts DELETE error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
