import { NextResponse } from 'next/server';
import { adminFirestore, adminTimestamp } from '../../../../../lib/firebase-admin';
import { withAuth } from '../../../../../lib/services/api-auth-middleware';

const COMPANIES_COLLECTION = 'companies';
const CRM_CUSTOMERS_COLLECTION = 'crm_customers';
const COMPANY_CRM_LINKS_COLLECTION = 'company_crm_links';

/**
 * Metni normalize et (karşılaştırma için)
 */
const normalizeText = (text) => {
  if (!text) return '';
  return text
    .toLowerCase()
    .trim()
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^\w\s@.-]/g, '')
    .replace(/\s+/g, ' ');
};

/**
 * Telefon numarasını normalize et
 */
const normalizePhone = (phone) => {
  if (!phone) return '';
  return phone.replace(/\D/g, '').slice(-10);
};

/**
 * Email'i normalize et
 */
const normalizeEmail = (email) => {
  if (!email) return '';
  return email.toLowerCase().trim();
};

/**
 * Customer ID ile link bul
 */
const getLinkByCustomerId = async (customerId) => {
  const snapshot = await adminFirestore
    .collection(COMPANY_CRM_LINKS_COLLECTION)
    .where('customerId', '==', customerId)
    .limit(1)
    .get();
    
  if (snapshot.empty) return null;
  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
};

/**
 * Company ID ile link bul
 */
const getLinkByCompanyId = async (companyId) => {
  const snapshot = await adminFirestore
    .collection(COMPANY_CRM_LINKS_COLLECTION)
    .where('companyId', '==', companyId)
    .limit(1)
    .get();
    
  if (snapshot.empty) return null;
  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
};

/**
 * CRM Customers içindeki duplicate kayıtları tespit et
 */
const detectDuplicateCustomers = async () => {
  const customersSnapshot = await adminFirestore.collection(CRM_CUSTOMERS_COLLECTION).get();
  const customers = customersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
  const duplicateGroups = [];
  const processedIds = new Set();
  
  for (const customer of customers) {
    if (processedIds.has(customer.id)) continue;
    
    const normalizedEmail = normalizeEmail(customer.email);
    const normalizedPhone = normalizePhone(customer.phone);
    
    if (!normalizedEmail && !normalizedPhone) continue;
    
    const duplicates = customers.filter(c => {
      if (c.id === customer.id || processedIds.has(c.id)) return false;
      
      const cEmail = normalizeEmail(c.email);
      const cPhone = normalizePhone(c.phone);
      
      const emailMatch = normalizedEmail && cEmail && normalizedEmail === cEmail;
      const phoneMatch = normalizedPhone && cPhone && normalizedPhone === cPhone;
      
      return emailMatch || phoneMatch;
    });
    
    if (duplicates.length > 0) {
      const group = [customer, ...duplicates];
      duplicateGroups.push({
        matchType: normalizedEmail ? 'email' : 'phone',
        matchValue: normalizedEmail || normalizedPhone,
        records: group.map(r => ({
          id: r.id,
          name: r.name,
          email: r.email,
          phone: r.phone,
          companyName: r.company?.name || '',
          type: r.type,
          linkedCompanyId: r.linkedCompanyId,
          conversationCount: r.stats?.totalConversations || 0,
          createdAt: r.createdAt,
        })),
      });
      
      group.forEach(r => processedIds.add(r.id));
    }
  }
  
  return {
    success: true,
    totalCustomers: customers.length,
    duplicateGroups,
    duplicateCount: duplicateGroups.reduce((sum, g) => sum + g.records.length - 1, 0),
  };
};

/**
 * Companies içindeki duplicate kayıtları tespit et
 */
const detectDuplicateCompanies = async () => {
  const companiesSnapshot = await adminFirestore.collection(COMPANIES_COLLECTION).get();
  const companies = companiesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
  const duplicateGroups = [];
  const processedIds = new Set();
  
  for (const company of companies) {
    if (processedIds.has(company.id)) continue;
    
    const primaryEmail = normalizeEmail(company.email || company.contactEmail);
    const primaryPhone = normalizePhone(company.phone || company.contactPhone);
    
    if (!primaryEmail && !primaryPhone) continue;
    
    const duplicates = companies.filter(c => {
      if (c.id === company.id || processedIds.has(c.id)) return false;
      
      const cEmail = normalizeEmail(c.email || c.contactEmail);
      const cPhone = normalizePhone(c.phone || c.contactPhone);
      
      const emailMatch = primaryEmail && cEmail && primaryEmail === cEmail;
      const phoneMatch = primaryPhone && cPhone && primaryPhone === cPhone;
      
      return emailMatch || phoneMatch;
    });
    
    if (duplicates.length > 0) {
      const group = [company, ...duplicates];
      duplicateGroups.push({
        matchType: primaryEmail ? 'email' : 'phone',
        matchValue: primaryEmail || primaryPhone,
        records: group.map(r => ({
          id: r.id,
          name: r.name,
          email: r.email || r.contactEmail,
          phone: r.phone || r.contactPhone,
          status: r.status,
          linkedCustomerId: null,
          proformaCount: r.totalProjects || 0,
          createdAt: r.createdAt,
        })),
      });
      
      group.forEach(r => processedIds.add(r.id));
    }
  }
  
  // Link bilgilerini ekle
  const allLinksSnapshot = await adminFirestore.collection(COMPANY_CRM_LINKS_COLLECTION).get();
  const allLinks = allLinksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
  for (const group of duplicateGroups) {
    for (const record of group.records) {
      const link = allLinks.find(l => l.companyId === record.id);
      if (link) {
        record.linkedCustomerId = link.customerId;
      }
    }
  }
  
  return {
    success: true,
    totalCompanies: companies.length,
    duplicateGroups,
    duplicateCount: duplicateGroups.reduce((sum, g) => sum + g.records.length - 1, 0),
  };
};

/**
 * CRM Customer duplicate grubunu birleştir
 */
const mergeDuplicateCustomers = async (customerIds, masterId, mergedBy) => {
  try {
    if (!customerIds || customerIds.length < 2) {
      return { success: false, error: 'En az 2 kayıt gerekli' };
    }
    
    // Kayıtları getir
    const customers = [];
    for (const id of customerIds) {
      const docSnap = await adminFirestore.collection(CRM_CUSTOMERS_COLLECTION).doc(id).get();
      if (docSnap.exists) {
        customers.push({ id: docSnap.id, ...docSnap.data() });
      }
    }
    
    if (customers.length < 2) {
    return { success: false, error: 'Yeterli kayıt bulunamadı' };
  }
  
  // Master kaydı belirle
  let master;
  if (masterId) {
    master = customers.find(c => c.id === masterId);
    if (!master) {
      return { success: false, error: 'Belirtilen master kayıt bulunamadı' };
    }
  } else {
    // En eski kaydı bul (createdAt'a göre)
    master = customers.reduce((oldest, current) => {
      const oldestTime = oldest.createdAt?.toDate?.() || oldest.createdAt?._seconds * 1000 || 0;
      const currentTime = current.createdAt?.toDate?.() || current.createdAt?._seconds * 1000 || 0;
      return currentTime < oldestTime ? current : oldest;
    });
  }
  
  const duplicatesToRemove = customers.filter(c => c.id !== master.id);
  const batch = adminFirestore.batch();
  
  // 1. Conversations'ları master'a taşı
  for (const dupe of duplicatesToRemove) {
    const convSnapshot = await adminFirestore
      .collection('crm_conversations')
      .where('customerId', '==', dupe.id)
      .get();
    
    convSnapshot.forEach(convDoc => {
      batch.update(convDoc.ref, {
        customerId: master.id,
        'sender.name': master.name || dupe.name,
        'sender.email': master.email || dupe.email,
        'sender.phone': master.phone || dupe.phone,
        updatedAt: adminTimestamp(),
        mergeNote: `Birleştirildi: ${dupe.id} → ${master.id}`,
      });
    });
  }
  
  // 2. Cases'leri master'a taşı
  for (const dupe of duplicatesToRemove) {
    const casesSnapshot = await adminFirestore
      .collection('crm_cases')
      .where('customerId', '==', dupe.id)
      .get();
    
    casesSnapshot.forEach(caseDoc => {
      batch.update(caseDoc.ref, {
        customerId: master.id,
        updatedAt: adminTimestamp(),
        mergeNote: `Birleştirildi: ${dupe.id} → ${master.id}`,
      });
    });
  }
  
  // 3. Activities'leri master'a taşı
  for (const dupe of duplicatesToRemove) {
    const actSnapshot = await adminFirestore
      .collection('crm_activities')
      .where('customerId', '==', dupe.id)
      .get();
    
    actSnapshot.forEach(actDoc => {
      batch.update(actDoc.ref, {
        customerId: master.id,
        updatedAt: adminTimestamp(),
      });
    });
  }
  
  // 4. Company-CRM linklerini güncelle
  for (const dupe of duplicatesToRemove) {
    const link = await getLinkByCustomerId(dupe.id);
    if (link && link.id) {
      const masterLink = await getLinkByCustomerId(master.id);
      if (masterLink) {
        batch.delete(adminFirestore.collection(COMPANY_CRM_LINKS_COLLECTION).doc(link.id));
      } else {
        batch.update(adminFirestore.collection(COMPANY_CRM_LINKS_COLLECTION).doc(link.id), {
          customerId: master.id,
          lastSyncAt: adminTimestamp(),
          mergeNote: `Birleştirildi: ${dupe.id} → ${master.id}`,
        });
        if (link.companyId) {
          batch.update(adminFirestore.collection(CRM_CUSTOMERS_COLLECTION).doc(master.id), {
            linkedCompanyId: link.companyId,
            updatedAt: adminTimestamp(),
          });
        }
      }
    }
  }
  
  // 5. Master kaydını güncelle (bilgileri birleştir)
  const mergedData = {
    name: master.name || duplicatesToRemove.find(d => d.name)?.name || '',
    email: master.email || duplicatesToRemove.find(d => d.email)?.email || '',
    phone: master.phone || duplicatesToRemove.find(d => d.phone)?.phone || '',
    company: {
      name: master.company?.name || duplicatesToRemove.find(d => d.company?.name)?.company?.name || '',
      position: master.company?.position || duplicatesToRemove.find(d => d.company?.position)?.company?.position || '',
      website: master.company?.website || duplicatesToRemove.find(d => d.company?.website)?.company?.website || '',
      address: master.company?.address || duplicatesToRemove.find(d => d.company?.address)?.company?.address || '',
      city: master.company?.city || duplicatesToRemove.find(d => d.company?.city)?.company?.city || '',
      country: master.company?.country || duplicatesToRemove.find(d => d.company?.country)?.company?.country || 'TR',
    },
    taxInfo: {
      taxOffice: master.taxInfo?.taxOffice || duplicatesToRemove.find(d => d.taxInfo?.taxOffice)?.taxInfo?.taxOffice || '',
      taxNumber: master.taxInfo?.taxNumber || duplicatesToRemove.find(d => d.taxInfo?.taxNumber)?.taxInfo?.taxNumber || '',
    },
    stats: {
      totalConversations: (master.stats?.totalConversations || 0) + 
        duplicatesToRemove.reduce((sum, d) => sum + (d.stats?.totalConversations || 0), 0),
      totalCases: (master.stats?.totalCases || 0) + 
        duplicatesToRemove.reduce((sum, d) => sum + (d.stats?.totalCases || 0), 0),
      openCases: (master.stats?.openCases || 0) + 
        duplicatesToRemove.reduce((sum, d) => sum + (d.stats?.openCases || 0), 0),
      wonCases: (master.stats?.wonCases || 0) + 
        duplicatesToRemove.reduce((sum, d) => sum + (d.stats?.wonCases || 0), 0),
      lostCases: (master.stats?.lostCases || 0) + 
        duplicatesToRemove.reduce((sum, d) => sum + (d.stats?.lostCases || 0), 0),
      totalValue: (master.stats?.totalValue || 0) + 
        duplicatesToRemove.reduce((sum, d) => sum + (d.stats?.totalValue || 0), 0),
    },
    updatedAt: adminTimestamp(),
    mergedIds: duplicatesToRemove.map(d => d.id),
    mergedAt: adminTimestamp(),
    mergedBy,
  };
  
  batch.update(adminFirestore.collection(CRM_CUSTOMERS_COLLECTION).doc(master.id), mergedData);
  
  // 6. Duplicate kayıtları sil
  for (const dupe of duplicatesToRemove) {
    batch.delete(adminFirestore.collection(CRM_CUSTOMERS_COLLECTION).doc(dupe.id));
  }
  
  try {
    await batch.commit();
  } catch (commitError) {
    console.error('Customers batch commit error:', commitError);
    return { success: false, error: `Batch commit failed: ${commitError.message}` };
  }
  
  return {
    success: true,
    masterId: master.id,
    mergedCount: duplicatesToRemove.length,
    deletedIds: duplicatesToRemove.map(d => d.id),
  };
  } catch (err) {
    console.error('mergeDuplicateCustomers error:', err);
    return { success: false, error: `Merge function error: ${err.message}` };
  }
};

/**
 * Companies duplicate grubunu birleştir
 */
const mergeDuplicateCompanies = async (companyIds, masterId, mergedBy) => {
  try {
    if (!companyIds || companyIds.length < 2) {
      return { success: false, error: 'En az 2 kayıt gerekli' };
    }
    
    // Kayıtları getir
    const companies = [];
    for (const id of companyIds) {
    const docSnap = await adminFirestore.collection(COMPANIES_COLLECTION).doc(id).get();
    if (docSnap.exists) {
      companies.push({ id: docSnap.id, ...docSnap.data() });
    }
  }
  
  if (companies.length < 2) {
    return { success: false, error: 'Yeterli kayıt bulunamadı' };
  }
  
  // Master kaydı belirle
  let master;
  if (masterId) {
    master = companies.find(c => c.id === masterId);
    if (!master) {
      return { success: false, error: 'Belirtilen master kayıt bulunamadı' };
    }
  } else {
    // En eski kaydı bul
    master = companies.reduce((oldest, current) => {
      const oldestTime = oldest.createdAt?.toDate?.() || oldest.createdAt?._seconds * 1000 || 0;
      const currentTime = current.createdAt?.toDate?.() || current.createdAt?._seconds * 1000 || 0;
      return currentTime < oldestTime ? current : oldest;
    });
  }
  
  const duplicatesToRemove = companies.filter(c => c.id !== master.id);
  const batch = adminFirestore.batch();
  
  // 1. Proformas'ları master'a taşı
  for (const dupe of duplicatesToRemove) {
    const proformasSnapshot = await adminFirestore
      .collection('proformas')
      .where('companyId', '==', dupe.id)
      .get();
    
    proformasSnapshot.forEach(proformaDoc => {
      batch.update(proformaDoc.ref, {
        companyId: master.id,
        updatedAt: adminTimestamp(),
        mergeNote: `Birleştirildi: ${dupe.id} → ${master.id}`,
      });
    });
  }
  
  // 2. Contracts'ları master'a taşı
  for (const dupe of duplicatesToRemove) {
    const contractsSnapshot = await adminFirestore
      .collection('contracts')
      .where('companyId', '==', dupe.id)
      .get();
    
    contractsSnapshot.forEach(contractDoc => {
      batch.update(contractDoc.ref, {
        companyId: master.id,
        updatedAt: adminTimestamp(),
        mergeNote: `Birleştirildi: ${dupe.id} → ${master.id}`,
      });
    });
  }
  
  // 3. PricingCalculations linkedCompanies güncelle
  const allCalcsSnapshot = await adminFirestore.collection('pricingCalculations').get();
  allCalcsSnapshot.forEach(calcDoc => {
    const data = calcDoc.data();
    const linkedCompanies = data.linkedCompanies || [];
    
    let needsUpdate = false;
    const updatedLinks = linkedCompanies.map(companyId => {
      if (duplicatesToRemove.some(d => d.id === companyId)) {
        needsUpdate = true;
        return master.id;
      }
      return companyId;
    });
    
    const uniqueLinks = [...new Set(updatedLinks)];
    
    if (needsUpdate) {
      batch.update(calcDoc.ref, {
        linkedCompanies: uniqueLinks,
        updatedAt: adminTimestamp(),
      });
    }
  });
  
  // 4. Shopify integrations taşı
  for (const dupe of duplicatesToRemove) {
    const intSnapshot = await adminFirestore
      .collection('shopify_integrations')
      .where('companyId', '==', dupe.id)
      .get();
    
    intSnapshot.forEach(intDoc => {
      batch.update(intDoc.ref, {
        companyId: master.id,
        updatedAt: adminTimestamp(),
      });
    });
  }
  
  // 5. Company-CRM linklerini güncelle
  for (const dupe of duplicatesToRemove) {
    const link = await getLinkByCompanyId(dupe.id);
    if (link && link.customerId) {
      const masterLink = await getLinkByCompanyId(master.id);
      if (masterLink) {
        batch.update(adminFirestore.collection(CRM_CUSTOMERS_COLLECTION).doc(link.customerId), {
          linkedCompanyId: master.id,
          updatedAt: adminTimestamp(),
        });
        batch.delete(adminFirestore.collection(COMPANY_CRM_LINKS_COLLECTION).doc(link.id));
      } else {
        batch.update(adminFirestore.collection(COMPANY_CRM_LINKS_COLLECTION).doc(link.id), {
          companyId: master.id,
          lastSyncAt: adminTimestamp(),
        });
      }
    }
  }
  
  // 6. Master kaydını güncelle
  // Notes alanını güvenli şekilde birleştir (array değilse dönüştür)
  const masterNotes = Array.isArray(master.notes) ? master.notes : (master.notes ? [master.notes] : []);
  const dupeNotes = duplicatesToRemove.flatMap(d => Array.isArray(d.notes) ? d.notes : (d.notes ? [d.notes] : []));
  
  const mergedData = {
    name: master.name || duplicatesToRemove.find(d => d.name)?.name || '',
    email: master.email || duplicatesToRemove.find(d => d.email)?.email || '',
    phone: master.phone || duplicatesToRemove.find(d => d.phone)?.phone || '',
    contactPerson: master.contactPerson || duplicatesToRemove.find(d => d.contactPerson)?.contactPerson || '',
    contactEmail: master.contactEmail || duplicatesToRemove.find(d => d.contactEmail)?.contactEmail || '',
    contactPhone: master.contactPhone || duplicatesToRemove.find(d => d.contactPhone)?.contactPhone || '',
    address: master.address || duplicatesToRemove.find(d => d.address)?.address || '',
    website: master.website || duplicatesToRemove.find(d => d.website)?.website || '',
    taxOffice: master.taxOffice || duplicatesToRemove.find(d => d.taxOffice)?.taxOffice || '',
    taxNumber: master.taxNumber || duplicatesToRemove.find(d => d.taxNumber)?.taxNumber || '',
    totalProjects: (master.totalProjects || 0) + 
      duplicatesToRemove.reduce((sum, d) => sum + (d.totalProjects || 0), 0),
    totalRevenue: (master.totalRevenue || 0) + 
      duplicatesToRemove.reduce((sum, d) => sum + (d.totalRevenue || 0), 0),
    notes: [...masterNotes, ...dupeNotes],
    updatedAt: adminTimestamp(),
    mergedIds: duplicatesToRemove.map(d => d.id),
    mergedAt: adminTimestamp(),
    mergedBy,
  };
  
  batch.update(adminFirestore.collection(COMPANIES_COLLECTION).doc(master.id), mergedData);
  
  // 7. Duplicate kayıtları sil
  for (const dupe of duplicatesToRemove) {
    batch.delete(adminFirestore.collection(COMPANIES_COLLECTION).doc(dupe.id));
  }
  
  try {
    await batch.commit();
  } catch (commitError) {
    console.error('Companies batch commit error:', commitError);
    return { success: false, error: `Batch commit failed: ${commitError.message}` };
  }
  
  return {
    success: true,
    masterId: master.id,
    mergedCount: duplicatesToRemove.length,
    deletedIds: duplicatesToRemove.map(d => d.id),
  };
  } catch (err) {
    console.error('mergeDuplicateCompanies error:', err);
    return { success: false, error: `Merge function error: ${err.message}` };
  }
};

// GET - Duplicate'leri tespit et
export const GET = withAuth(async (request) => {
  try {
    if (!adminFirestore) {
      return NextResponse.json(
        { error: 'Server configuration error' }, 
        { status: 500 }
      );
    }

    const [customerDupes, companyDupes] = await Promise.all([
      detectDuplicateCustomers(),
      detectDuplicateCompanies(),
    ]);

    return NextResponse.json({
      success: true,
      customers: customerDupes,
      companies: companyDupes,
      summary: {
        totalCustomerDuplicates: customerDupes.duplicateCount || 0,
        totalCompanyDuplicates: companyDupes.duplicateCount || 0,
        customerGroups: customerDupes.duplicateGroups?.length || 0,
        companyGroups: companyDupes.duplicateGroups?.length || 0,
      },
    });
  } catch (error) {
    console.error('Error detecting duplicates:', error);
    return NextResponse.json(
      { error: 'Failed to detect duplicates', details: error.message }, 
      { status: 500 }
    );
  }
});

// POST - Duplicate'leri birleştir
export const POST = withAuth(async (request) => {
  try {
    // User bilgisi request.user içinde (withAuth middleware tarafından eklenir)
    const user = request.user;
    const mergedBy = user?.uid || 'system';
    
    if (!adminFirestore) {
      return NextResponse.json(
        { error: 'Server configuration error' }, 
        { status: 500 }
      );
    }

    const body = await request.json();
    const { type, ids, masterId, mergeAll } = body;

    // Toplu birleştirme
    if (mergeAll) {
      const results = {
        customers: { merged: 0, errors: [] },
        companies: { merged: 0, errors: [] },
      };

      // CRM Customers
      const customerDupes = await detectDuplicateCustomers();
      if (customerDupes.success && customerDupes.duplicateGroups) {
        for (const group of customerDupes.duplicateGroups) {
          try {
            const groupIds = group.records.map(r => r.id);
            const result = await mergeDuplicateCustomers(groupIds, null, mergedBy);
            if (result.success) {
              results.customers.merged += result.mergedCount;
            } else {
              results.customers.errors.push({ group: group.matchValue, error: result.error });
            }
          } catch (error) {
            results.customers.errors.push({ group: group.matchValue, error: error.message });
          }
        }
      }

      // Companies
      const companyDupes = await detectDuplicateCompanies();
      if (companyDupes.success && companyDupes.duplicateGroups) {
        for (const group of companyDupes.duplicateGroups) {
          try {
            const groupIds = group.records.map(r => r.id);
            const result = await mergeDuplicateCompanies(groupIds, null, mergedBy);
            if (result.success) {
              results.companies.merged += result.mergedCount;
            } else {
              results.companies.errors.push({ group: group.matchValue, error: result.error });
            }
          } catch (error) {
            results.companies.errors.push({ group: group.matchValue, error: error.message });
          }
        }
      }

      return NextResponse.json({
        success: true,
        ...results,
        totalMerged: results.customers.merged + results.companies.merged,
      });
    }

    // Tek grup birleştirme
    if (!type || !ids || !Array.isArray(ids) || ids.length < 2) {
      return NextResponse.json(
        { error: 'Invalid request: type and ids (array with at least 2 items) required' },
        { status: 400 }
      );
    }

    let result;
    if (type === 'customer') {
      result = await mergeDuplicateCustomers(ids, masterId, mergedBy);
    } else if (type === 'company') {
      result = await mergeDuplicateCompanies(ids, masterId, mergedBy);
    } else {
      return NextResponse.json(
        { error: 'Invalid type: must be "customer" or "company"' },
        { status: 400 }
      );
    }

    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error merging duplicates:', error);
    console.error('Stack trace:', error.stack);
    return NextResponse.json(
      { error: 'Failed to merge duplicates', details: error.message, stack: error.stack }, 
      { status: 500 }
    );
  }
});
