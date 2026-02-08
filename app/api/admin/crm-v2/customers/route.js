/**
 * CRM v2 Customers API Route (Admin SDK)
 * 
 * GET: Müşteri ara / getir
 *   - ?phone=... : Telefon numarasıyla ara
 *   - ?email=... : E-posta ile ara
 *   - ?id=...    : ID ile getir
 *   - ?search=... : Genel arama (isim, email, telefon)
 * 
 * POST: Yeni müşteri oluştur / güncelle
 *   - action: 'create' | 'update' | 'findOrCreate'
 */

import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import admin from 'firebase-admin';
import { normalizePhone } from '@/lib/utils/phone-utils';

const CRM_COLLECTIONS = {
  CUSTOMERS: 'crm_customers',
};

// Telefon ile müşteri bul
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
    console.error('[CRM API] Error finding customer by phone:', error);
    return null;
  }
}

// Email ile müşteri bul
async function findCustomerByEmail(email) {
  if (!email || !adminDb) return null;
  
  const normalizedEmail = email.toLowerCase().trim();
  
  try {
    const snapshot = await adminDb.collection(CRM_COLLECTIONS.CUSTOMERS).get();
    
    for (const doc of snapshot.docs) {
      const data = doc.data();
      
      if (data.email && data.email.toLowerCase() === normalizedEmail) {
        return { id: doc.id, ...data };
      }
      
      // Alternatif iletişim bilgilerinde de ara
      const altContacts = data.alternativeContacts || [];
      for (const alt of altContacts) {
        if (alt.type === 'email' && alt.value?.toLowerCase() === normalizedEmail) {
          return { id: doc.id, ...data };
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('[CRM API] Error finding customer by email:', error);
    return null;
  }
}

// Müşteri bul (email veya telefon ile)
async function findCustomerByContact(email, phone) {
  if (email) {
    const byEmail = await findCustomerByEmail(email);
    if (byEmail) return byEmail;
  }
  
  if (phone) {
    const byPhone = await findCustomerByPhone(phone);
    if (byPhone) return byPhone;
  }
  
  return null;
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
    
    // Get by ID
    const customerId = searchParams.get('id');
    if (customerId) {
      const docSnap = await adminDb.collection(CRM_COLLECTIONS.CUSTOMERS).doc(customerId).get();
      if (!docSnap.exists) {
        return NextResponse.json({
          success: false,
          error: 'Müşteri bulunamadı',
        }, { status: 404 });
      }
      return NextResponse.json({
        success: true,
        data: { id: docSnap.id, ...docSnap.data() },
      });
    }
    
    // Search by phone number
    const phone = searchParams.get('phone');
    if (phone) {
      const customer = await findCustomerByPhone(phone);
      
      return NextResponse.json({
        success: true,
        data: customer,
        found: !!customer,
      });
    }
    
    // Search by email
    const email = searchParams.get('email');
    if (email) {
      const customer = await findCustomerByEmail(email);
      
      return NextResponse.json({
        success: true,
        data: customer,
        found: !!customer,
      });
    }
    
    // General search
    const search = searchParams.get('search');
    const limitParam = parseInt(searchParams.get('limit')) || 50;
    
    const snapshot = await adminDb
      .collection(CRM_COLLECTIONS.CUSTOMERS)
      .orderBy('updatedAt', 'desc')
      .limit(limitParam)
      .get();
    
    let customers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Client-side search filter
    if (search) {
      const term = search.toLowerCase();
      customers = customers.filter(c => 
        c.name?.toLowerCase().includes(term) ||
        c.email?.toLowerCase().includes(term) ||
        c.phone?.includes(term) ||
        c.company?.name?.toLowerCase().includes(term)
      );
    }
    
    return NextResponse.json({
      success: true,
      data: customers,
      count: customers.length,
    });
    
  } catch (error) {
    console.error('[CRM Customers API] GET error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Müşteri bilgileri alınamadı',
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
    const { action = 'create', ...customerData } = body;
    
    // Find or create - WhatsApp entegrasyonu için ideal
    if (action === 'findOrCreate') {
      const { phone, email, name, company, source = 'whatsapp', notes = '' } = customerData;
      
      if (!phone && !email) {
        return NextResponse.json({
          success: false,
          error: 'Telefon veya e-posta gerekli',
        }, { status: 400 });
      }
      
      // Önce mevcut müşteriyi ara
      let customer = await findCustomerByContact(email, phone);
      
      if (customer) {
        // Mevcut müşteri bulundu
        return NextResponse.json({
          success: true,
          data: customer,
          isNew: false,
          message: 'Mevcut müşteri bulundu',
        });
      }
      
      // Yeni müşteri oluştur
      const now = admin.firestore.FieldValue.serverTimestamp();
      const normalizedPhone = phone ? normalizePhone(phone) : '';
      
      const newCustomerData = {
        name: name || normalizedPhone || email,
        phone: normalizedPhone,
        email: email || '',
        company: { name: company || '' },
        type: 'lead',
        priority: 'normal',
        notes: notes || `${source} üzerinden oluşturuldu`,
        tags: source ? [`kaynak:${source}`] : [],
        createdBy: null,
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
      customer = { id: docRef.id, ...newCustomerData };
      
      return NextResponse.json({
        success: true,
        data: customer,
        isNew: true,
        message: 'Yeni müşteri oluşturuldu',
      });
    }
    
    // Create new customer
    if (action === 'create') {
      const now = admin.firestore.FieldValue.serverTimestamp();
      const normalizedPhone = customerData.phone ? normalizePhone(customerData.phone) : '';
      
      const newCustomerData = {
        name: customerData.name || normalizedPhone || customerData.email || '',
        phone: normalizedPhone,
        email: customerData.email || '',
        company: { name: customerData.companyName || customerData.company?.name || '' },
        type: customerData.type || 'lead',
        priority: customerData.priority || 'normal',
        notes: customerData.notes || '',
        tags: customerData.tags || [],
        createdBy: customerData.createdBy || null,
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
      
      return NextResponse.json({
        success: true,
        data: { id: docRef.id, ...newCustomerData },
        message: 'Müşteri oluşturuldu',
      });
    }
    
    // Update existing customer
    if (action === 'update') {
      const { id, ...updateData } = customerData;
      
      if (!id) {
        return NextResponse.json({
          success: false,
          error: 'Müşteri ID gerekli',
        }, { status: 400 });
      }
      
      const updates = {
        ...updateData,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };
      
      if (updates.phone) {
        updates.phone = normalizePhone(updates.phone);
      }
      
      await adminDb.collection(CRM_COLLECTIONS.CUSTOMERS).doc(id).update(updates);
      
      const updatedDoc = await adminDb.collection(CRM_COLLECTIONS.CUSTOMERS).doc(id).get();
      
      return NextResponse.json({
        success: true,
        data: { id: updatedDoc.id, ...updatedDoc.data() },
        message: 'Müşteri güncellendi',
      });
    }
    
    return NextResponse.json({
      success: false,
      error: `Geçersiz action: ${action}`,
    }, { status: 400 });
    
  } catch (error) {
    console.error('[CRM Customers API] POST error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'İşlem başarısız',
    }, { status: 500 });
  }
}
