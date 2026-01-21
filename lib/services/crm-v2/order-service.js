/**
 * CRM v2 - Order (Sipariş) Service
 * 
 * Sipariş yönetimi için CRUD ve iş mantığı fonksiyonları
 * 
 * v2.0 - Profesyonel Sipariş Yönetimi
 * - Proforma entegrasyonu
 * - Kontrat bağlantısı
 * - Formül seçimi
 * - Genişletilmiş üretim workflow'u
 * - Checklist sistemi
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "../../firebase";
import {
  ORDER_TYPE,
  ORDER_STATUS,
  PAYMENT_STATUS,
  ORDER_PRIORITY,
  PRODUCTION_STAGE,
  SUPPLY_STAGE,
  SERVICE_STAGE,
  getOrderNumberPrefix,
  mapCaseTypeToOrderType,
  getStagesForOrderType,
  getDefaultChecklistForOrderType,
} from "./order-schema";

const ORDER_COLLECTION = "crm_orders";

// =============================================================================
// ORDER CRUD
// =============================================================================

/**
 * Sipariş numarası oluştur
 */
export const generateOrderNumber = async (orderType) => {
  const prefix = getOrderNumberPrefix(orderType);
  const year = new Date().getFullYear();
  
  // Bu yılın bu tipteki son siparişini bul
  const q = query(
    collection(db, ORDER_COLLECTION),
    where("type", "==", orderType),
    where("orderNumber", ">=", `${prefix}-${year}-`),
    where("orderNumber", "<=", `${prefix}-${year}-\uf8ff`),
    orderBy("orderNumber", "desc"),
    limit(1)
  );
  
  const snapshot = await getDocs(q);
  
  let nextNumber = 1;
  if (!snapshot.empty) {
    const lastOrder = snapshot.docs[0].data();
    const lastNumber = parseInt(lastOrder.orderNumber.split("-")[2], 10);
    nextNumber = lastNumber + 1;
  }
  
  return `${prefix}-${year}-${String(nextNumber).padStart(4, "0")}`;
};

/**
 * Yeni sipariş oluştur
 */
export const createOrder = async (orderData, userId) => {
  try {
    const orderNumber = await generateOrderNumber(orderData.type);
    
    // İlk aşamayı belirle
    let initialStage = null;
    switch (orderData.type) {
      case ORDER_TYPE.PRODUCTION:
        initialStage = PRODUCTION_STAGE.FORMULA_SELECTION;
        break;
      case ORDER_TYPE.SUPPLY:
        initialStage = SUPPLY_STAGE.ORDER_PLACED;
        break;
      case ORDER_TYPE.SERVICE:
        initialStage = SERVICE_STAGE.CONTRACT_SIGNED;
        break;
    }
    
    // Varsayılan checklist'i al
    const defaultChecklist = getDefaultChecklistForOrderType(orderData.type);
    
    const newOrder = {
      orderNumber,
      type: orderData.type,
      status: orderData.status || ORDER_STATUS.DRAFT,
      currentStage: initialStage,
      
      // İlişkiler
      customerId: orderData.customerId || null,
      companyId: orderData.companyId || null,
      caseId: orderData.caseId || null,
      proformaId: orderData.proformaId || null,
      contractId: orderData.contractId || null,
      deliveryIds: [],
      
      // Proforma referans bilgileri
      proformaNumber: orderData.proformaNumber || null,
      contractNumber: orderData.contractNumber || null,
      
      // Müşteri bilgileri (snapshot)
      customer: orderData.customer || {
        companyName: "",
        contactName: "",
        email: "",
        phone: "",
      },
      
      // Sipariş içeriği
      items: orderData.items || [],
      
      // Üretim kategorisi (production için)
      productionCategory: orderData.productionCategory || null,
      
      // Finansal
      currency: orderData.currency || "TRY",
      subtotal: orderData.subtotal || 0,
      taxRate: orderData.taxRate ?? 20,
      taxAmount: orderData.taxAmount || 0,
      discountRate: orderData.discountRate || 0,
      discountAmount: orderData.discountAmount || 0,
      total: orderData.total || 0,
      
      // Ödeme
      paymentStatus: PAYMENT_STATUS.PENDING,
      paymentTerms: orderData.paymentTerms || "",
      advanceRate: orderData.advanceRate ?? 50,
      advanceAmount: orderData.advanceAmount || 0,
      advancePaidAt: null,
      balanceAmount: orderData.balanceAmount || 0,
      balancePaidAt: null,
      payments: [],
      
      // Tarihler
      priority: orderData.priority || ORDER_PRIORITY.NORMAL,
      estimatedDeliveryDate: orderData.estimatedDeliveryDate || null,
      actualDeliveryDate: null,
      
      // Üretim detayları (genişletilmiş)
      production: orderData.type === ORDER_TYPE.PRODUCTION ? {
        batchNumber: orderData.production?.batchNumber || "",
        lotNumber: orderData.production?.lotNumber || "",
        formulaId: orderData.formulaId || orderData.production?.formulaId || null,
        formulaName: orderData.formulaName || orderData.production?.formulaName || null,
        formulaApproved: false,
        formulaApprovedAt: null,
        formulaApprovedBy: null,
        productionStartDate: null,
        productionEndDate: null,
        qcApproved: false,
        qcNotes: "",
        
        // Ambalaj bilgileri
        packaging: orderData.production?.packaging || {
          type: "",
          material: "",
          capacity: "",
          color: "",
          supplierId: null,
          supplierName: null,
          designFile: null,
          approved: false,
          approvedAt: null,
          notes: "",
        },
        
        // Etiket bilgileri
        label: orderData.production?.label || {
          designFile: null,
          designerId: null,
          designerName: null,
          approved: false,
          approvedAt: null,
          printReady: false,
          notes: "",
        },
        
        // Kutu bilgileri
        box: orderData.production?.box || {
          required: false,
          designFile: null,
          dimensions: null,
          material: null,
          approved: false,
          approvedAt: null,
          notes: "",
        },
        
        // Üretim miktarları
        plannedQuantity: orderData.production?.plannedQuantity || 0,
        actualQuantity: null,
        fillVolume: orderData.production?.fillVolume || null,
        fillingDate: null,
        
        // Paketleme bilgileri
        packagingInfo: orderData.production?.packagingInfo || {
          unitsPerCarton: null,
          totalCartons: null,
          palletCount: null,
          totalWeight: null,
          packagingDate: null,
          notes: "",
        },
      } : null,
      
      // Checklist
      checklist: orderData.checklist || defaultChecklist,
      
      // Notlar ve dosyalar
      notes: orderData.notes || "",
      internalNotes: orderData.internalNotes || "",
      attachments: orderData.attachments || [],
      
      // Stage history
      stageHistory: [{
        stage: initialStage,
        timestamp: Timestamp.now(),
        userId: userId,
        note: "Sipariş oluşturuldu",
      }],
      
      // Meta
      assignedTo: orderData.assignedTo || null,
      createdBy: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    const docRef = await addDoc(collection(db, ORDER_COLLECTION), newOrder);
    
    return {
      success: true,
      id: docRef.id,
      orderNumber,
    };
  } catch (error) {
    console.error("Error creating order:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Sipariş getir
 */
export const getOrder = async (orderId) => {
  try {
    const docRef = doc(db, ORDER_COLLECTION, orderId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }
    
    return {
      id: docSnap.id,
      ...docSnap.data(),
    };
  } catch (error) {
    console.error("Error getting order:", error);
    return null;
  }
};

/**
 * Siparişleri listele
 */
export const getOrders = async (filters = {}) => {
  try {
    let q = collection(db, ORDER_COLLECTION);
    const constraints = [];
    
    // Filtreler
    if (filters.type) {
      constraints.push(where("type", "==", filters.type));
    }
    if (filters.status) {
      constraints.push(where("status", "==", filters.status));
    }
    if (filters.customerId) {
      constraints.push(where("customerId", "==", filters.customerId));
    }
    if (filters.caseId) {
      constraints.push(where("caseId", "==", filters.caseId));
    }
    if (filters.assignedTo) {
      constraints.push(where("assignedTo", "==", filters.assignedTo));
    }
    if (filters.paymentStatus) {
      constraints.push(where("paymentStatus", "==", filters.paymentStatus));
    }
    
    // Sıralama
    constraints.push(orderBy("createdAt", "desc"));
    
    // Limit
    if (filters.limit) {
      constraints.push(limit(filters.limit));
    }
    
    q = query(q, ...constraints);
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error getting orders:", error);
    return [];
  }
};

/**
 * Sipariş güncelle
 */
export const updateOrder = async (orderId, updateData, userId) => {
  try {
    const docRef = doc(db, ORDER_COLLECTION, orderId);
    
    await updateDoc(docRef, {
      ...updateData,
      updatedAt: serverTimestamp(),
    });
    
    return { success: true };
  } catch (error) {
    console.error("Error updating order:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Sipariş sil - İlişkili koleksiyonları da günceller
 * @param {string} orderId - Silinecek sipariş ID
 * @param {string} userId - İşlemi yapan kullanıcı ID
 * @returns {Object} - { success: boolean, error?: string }
 */
export const deleteOrder = async (orderId, userId = null) => {
  try {
    // Önce siparişi al
    const order = await getOrder(orderId);
    if (!order) {
      return { success: false, error: "Sipariş bulunamadı" };
    }

    // Sipariş dokümanını sil
    const docRef = doc(db, ORDER_COLLECTION, orderId);
    await deleteDoc(docRef);

    // Case bağlantısı varsa, case'i güncelle (orderId referansını temizle)
    // NOT: Case'de orderId array tutulmuyorsa bu adım atlanır
    // Eğer case'de orders array varsa burada güncelleme yapılabilir

    // Aktivite kaydı oluştur
    try {
      await addDoc(collection(db, "crm_activities"), {
        type: "order_deleted",
        orderId: orderId,
        orderNumber: order.orderNumber || null,
        customerId: order.customerId || null,
        caseId: order.caseId || null,
        performedBy: userId,
        metadata: {
          orderType: order.type,
          orderStatus: order.status,
          orderTotal: order.total,
          orderCurrency: order.currency,
          customerName: order.customer?.companyName || null,
        },
        createdAt: serverTimestamp(),
      });
    } catch (activityError) {
      console.warn("Activity log failed:", activityError);
      // Aktivite kaydı başarısız olsa bile silme işlemi başarılı sayılır
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting order:", error);
    return { success: false, error: error.message };
  }
};

// =============================================================================
// STATUS & STAGE MANAGEMENT
// =============================================================================

/**
 * Sipariş durumunu güncelle
 */
export const updateOrderStatus = async (orderId, newStatus, userId, note = "") => {
  try {
    const docRef = doc(db, ORDER_COLLECTION, orderId);
    
    await updateDoc(docRef, {
      status: newStatus,
      updatedAt: serverTimestamp(),
    });
    
    return { success: true };
  } catch (error) {
    console.error("Error updating order status:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Sipariş aşamasını güncelle
 */
export const updateOrderStage = async (orderId, newStage, userId, note = "") => {
  try {
    const order = await getOrder(orderId);
    if (!order) {
      return { success: false, error: "Sipariş bulunamadı" };
    }
    
    const stageHistoryEntry = {
      stage: newStage,
      timestamp: Timestamp.now(),
      userId: userId,
      note: note,
    };
    
    const docRef = doc(db, ORDER_COLLECTION, orderId);
    
    await updateDoc(docRef, {
      currentStage: newStage,
      stageHistory: [...(order.stageHistory || []), stageHistoryEntry],
      updatedAt: serverTimestamp(),
    });
    
    return { success: true };
  } catch (error) {
    console.error("Error updating order stage:", error);
    return { success: false, error: error.message };
  }
};

// =============================================================================
// PAYMENT MANAGEMENT
// =============================================================================

/**
 * Ödeme ekle
 */
export const addPayment = async (orderId, paymentData, userId) => {
  try {
    const order = await getOrder(orderId);
    if (!order) {
      return { success: false, error: "Sipariş bulunamadı" };
    }
    
    const newPayment = {
      id: `pmt_${Date.now()}`,
      amount: paymentData.amount,
      method: paymentData.method || "transfer",
      date: paymentData.date || Timestamp.now(),
      note: paymentData.note || "",
      recordedBy: userId,
      recordedAt: Timestamp.now(),
    };
    
    const payments = [...(order.payments || []), newPayment];
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    
    // Ödeme durumunu belirle
    let paymentStatus = PAYMENT_STATUS.PENDING;
    if (totalPaid >= order.total) {
      paymentStatus = PAYMENT_STATUS.PAID;
    } else if (totalPaid > 0) {
      paymentStatus = PAYMENT_STATUS.PARTIAL;
    }
    
    // Avans ödenmiş mi kontrol et
    const updates = {
      payments,
      paymentStatus,
      updatedAt: serverTimestamp(),
    };
    
    if (!order.advancePaidAt && totalPaid >= order.advanceAmount) {
      updates.advancePaidAt = Timestamp.now();
    }
    
    if (!order.balancePaidAt && totalPaid >= order.total) {
      updates.balancePaidAt = Timestamp.now();
    }
    
    const docRef = doc(db, ORDER_COLLECTION, orderId);
    await updateDoc(docRef, updates);
    
    return { success: true, paymentId: newPayment.id };
  } catch (error) {
    console.error("Error adding payment:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Ödeme sil
 */
export const deletePayment = async (orderId, paymentId, userId) => {
  try {
    const order = await getOrder(orderId);
    if (!order) {
      return { success: false, error: "Sipariş bulunamadı" };
    }
    
    const payments = (order.payments || []).filter(p => p.id !== paymentId);
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    
    // Ödeme durumunu yeniden belirle
    let paymentStatus = PAYMENT_STATUS.PENDING;
    if (totalPaid >= order.total) {
      paymentStatus = PAYMENT_STATUS.PAID;
    } else if (totalPaid > 0) {
      paymentStatus = PAYMENT_STATUS.PARTIAL;
    }
    
    const docRef = doc(db, ORDER_COLLECTION, orderId);
    await updateDoc(docRef, {
      payments,
      paymentStatus,
      updatedAt: serverTimestamp(),
    });
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting payment:", error);
    return { success: false, error: error.message };
  }
};

// =============================================================================
// CASE TO ORDER CONVERSION
// =============================================================================

/**
 * Case'den sipariş oluştur
 */
export const createOrderFromCase = async (caseData, proformaData, userId) => {
  try {
    // Case tipinden order tipini belirle
    const orderType = mapCaseTypeToOrderType(caseData.type);
    
    // Müşteri bilgilerini hazırla
    const customer = {
      companyName: caseData.customer?.companyName || "",
      contactName: caseData.customer?.contactName || caseData.contactName || "",
      email: caseData.customer?.email || caseData.contactEmail || "",
      phone: caseData.customer?.phone || caseData.contactPhone || "",
    };
    
    // Proforma'dan item ve fiyat bilgilerini al
    let items = [];
    let subtotal = 0;
    let taxRate = 20;
    let total = 0;
    let currency = "TRY";
    
    if (proformaData) {
      items = (proformaData.services || []).map(service => ({
        id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: service.name,
        description: service.description || "",
        quantity: service.quantity || 1,
        unit: service.unit || "Adet",
        unitPrice: service.unitPrice || 0,
        total: (service.quantity || 1) * (service.unitPrice || 0),
      }));
      
      subtotal = proformaData.subtotal || items.reduce((sum, item) => sum + item.total, 0);
      taxRate = proformaData.taxRate ?? 20;
      total = proformaData.totalAmount || subtotal * (1 + taxRate / 100);
      currency = proformaData.currency || "TRY";
    }
    
    // Case quotes'tan bilgi al (proforma yoksa)
    if (!proformaData && caseData.quotes?.length > 0) {
      const acceptedQuote = caseData.quotes.find(q => q.status === "accepted") || caseData.quotes[0];
      if (acceptedQuote) {
        total = acceptedQuote.amount || 0;
        currency = acceptedQuote.currency || "TRY";
        items = [{
          id: `item_${Date.now()}`,
          name: caseData.title || "Sipariş",
          description: acceptedQuote.description || "",
          quantity: 1,
          unit: "Adet",
          unitPrice: acceptedQuote.amount || 0,
          total: acceptedQuote.amount || 0,
        }];
        subtotal = total / 1.20; // KDV çıkar (varsayılan %20)
      }
    }
    
    // Avans hesapla (varsayılan %50)
    const advanceRate = 50;
    const advanceAmount = Math.round(total * advanceRate / 100);
    const balanceAmount = total - advanceAmount;
    
    const orderData = {
      type: orderType,
      customerId: caseData.customerId,
      caseId: caseData.id,
      proformaId: proformaData?.id || null,
      customer,
      items,
      currency,
      subtotal,
      taxRate,
      taxAmount: Math.round(subtotal * taxRate / 100),
      total,
      advanceRate,
      advanceAmount,
      balanceAmount,
      priority: caseData.priority || ORDER_PRIORITY.NORMAL,
      notes: caseData.description || "",
    };
    
    return await createOrder(orderData, userId);
  } catch (error) {
    console.error("Error creating order from case:", error);
    return { success: false, error: error.message };
  }
};

// =============================================================================
// DELIVERY MANAGEMENT
// =============================================================================

/**
 * İrsaliye bağla
 */
export const linkDeliveryToOrder = async (orderId, deliveryId, userId) => {
  try {
    const order = await getOrder(orderId);
    if (!order) {
      return { success: false, error: "Sipariş bulunamadı" };
    }
    
    const deliveryIds = [...(order.deliveryIds || [])];
    if (!deliveryIds.includes(deliveryId)) {
      deliveryIds.push(deliveryId);
    }
    
    const docRef = doc(db, ORDER_COLLECTION, orderId);
    await updateDoc(docRef, {
      deliveryIds,
      updatedAt: serverTimestamp(),
    });
    
    return { success: true };
  } catch (error) {
    console.error("Error linking delivery:", error);
    return { success: false, error: error.message };
  }
};

/**
 * İrsaliye bağlantısını kaldır
 */
export const unlinkDeliveryFromOrder = async (orderId, deliveryId, userId) => {
  try {
    const order = await getOrder(orderId);
    if (!order) {
      return { success: false, error: "Sipariş bulunamadı" };
    }
    
    const deliveryIds = (order.deliveryIds || []).filter(id => id !== deliveryId);
    
    const docRef = doc(db, ORDER_COLLECTION, orderId);
    await updateDoc(docRef, {
      deliveryIds,
      updatedAt: serverTimestamp(),
    });
    
    return { success: true };
  } catch (error) {
    console.error("Error unlinking delivery:", error);
    return { success: false, error: error.message };
  }
};

// =============================================================================
// PRODUCTION SPECIFIC
// =============================================================================

/**
 * Üretim bilgilerini güncelle (sadece production order için)
 */
export const updateProductionDetails = async (orderId, productionData, userId) => {
  try {
    const order = await getOrder(orderId);
    if (!order) {
      return { success: false, error: "Sipariş bulunamadı" };
    }
    
    if (order.type !== ORDER_TYPE.PRODUCTION) {
      return { success: false, error: "Bu sipariş üretim siparişi değil" };
    }
    
    const production = {
      ...(order.production || {}),
      ...productionData,
    };
    
    const docRef = doc(db, ORDER_COLLECTION, orderId);
    await updateDoc(docRef, {
      production,
      updatedAt: serverTimestamp(),
    });
    
    return { success: true };
  } catch (error) {
    console.error("Error updating production details:", error);
    return { success: false, error: error.message };
  }
};

// =============================================================================
// STATISTICS
// =============================================================================

/**
 * Sipariş istatistikleri
 */
export const getOrderStats = async (filters = {}) => {
  try {
    const orders = await getOrders(filters);
    
    const stats = {
      total: orders.length,
      byType: {
        [ORDER_TYPE.PRODUCTION]: 0,
        [ORDER_TYPE.SUPPLY]: 0,
        [ORDER_TYPE.SERVICE]: 0,
      },
      byStatus: {},
      byPaymentStatus: {},
      totalValue: 0,
      paidValue: 0,
      pendingValue: 0,
    };
    
    orders.forEach(order => {
      // Type
      if (stats.byType[order.type] !== undefined) {
        stats.byType[order.type]++;
      }
      
      // Status
      stats.byStatus[order.status] = (stats.byStatus[order.status] || 0) + 1;
      
      // Payment status
      stats.byPaymentStatus[order.paymentStatus] = (stats.byPaymentStatus[order.paymentStatus] || 0) + 1;
      
      // Values
      stats.totalValue += order.total || 0;
      
      const paidAmount = (order.payments || []).reduce((sum, p) => sum + p.amount, 0);
      stats.paidValue += paidAmount;
      stats.pendingValue += (order.total || 0) - paidAmount;
    });
    
    return stats;
  } catch (error) {
    console.error("Error getting order stats:", error);
    return null;
  }
};

/**
 * Müşteriye ait siparişleri getir
 */
export const getOrdersByCustomer = async (customerId) => {
  return getOrders({ customerId });
};

/**
 * Case'e ait siparişleri getir
 */
export const getOrdersByCase = async (caseId) => {
  return getOrders({ caseId });
};

// =============================================================================
// CHECKLIST MANAGEMENT
// =============================================================================

/**
 * Checklist item'ını güncelle
 */
export const updateChecklistItem = async (orderId, checklistItemId, updates, userId) => {
  try {
    const order = await getOrder(orderId);
    if (!order) {
      return { success: false, error: "Sipariş bulunamadı" };
    }
    
    const checklist = (order.checklist || []).map(item => {
      if (item.id === checklistItemId) {
        return {
          ...item,
          ...updates,
          completedAt: updates.completed ? Timestamp.now() : null,
          completedBy: updates.completed ? userId : null,
        };
      }
      return item;
    });
    
    const docRef = doc(db, ORDER_COLLECTION, orderId);
    await updateDoc(docRef, {
      checklist,
      updatedAt: serverTimestamp(),
    });
    
    return { success: true };
  } catch (error) {
    console.error("Error updating checklist item:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Checklist'e yeni item ekle
 */
export const addChecklistItem = async (orderId, itemData, userId) => {
  try {
    const order = await getOrder(orderId);
    if (!order) {
      return { success: false, error: "Sipariş bulunamadı" };
    }
    
    const newItem = {
      id: `chk_custom_${Date.now()}`,
      stage: itemData.stage,
      task: itemData.task,
      completed: false,
      completedAt: null,
      completedBy: null,
      notes: itemData.notes || "",
      isCustom: true,
      createdBy: userId,
      createdAt: Timestamp.now(),
    };
    
    const checklist = [...(order.checklist || []), newItem];
    
    const docRef = doc(db, ORDER_COLLECTION, orderId);
    await updateDoc(docRef, {
      checklist,
      updatedAt: serverTimestamp(),
    });
    
    return { success: true, itemId: newItem.id };
  } catch (error) {
    console.error("Error adding checklist item:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Checklist item'ını sil (sadece custom item'lar silinebilir)
 */
export const deleteChecklistItem = async (orderId, checklistItemId, userId) => {
  try {
    const order = await getOrder(orderId);
    if (!order) {
      return { success: false, error: "Sipariş bulunamadı" };
    }
    
    const item = (order.checklist || []).find(i => i.id === checklistItemId);
    if (!item?.isCustom) {
      return { success: false, error: "Sadece özel eklenen görevler silinebilir" };
    }
    
    const checklist = (order.checklist || []).filter(i => i.id !== checklistItemId);
    
    const docRef = doc(db, ORDER_COLLECTION, orderId);
    await updateDoc(docRef, {
      checklist,
      updatedAt: serverTimestamp(),
    });
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting checklist item:", error);
    return { success: false, error: error.message };
  }
};

// =============================================================================
// PRODUCTION WORKFLOW MANAGEMENT
// =============================================================================

/**
 * Formül bilgilerini güncelle
 */
export const updateFormulaInfo = async (orderId, formulaData, userId) => {
  try {
    const order = await getOrder(orderId);
    if (!order || order.type !== ORDER_TYPE.PRODUCTION) {
      return { success: false, error: "Geçerli bir üretim siparişi bulunamadı" };
    }
    
    const production = {
      ...(order.production || {}),
      formulaId: formulaData.formulaId,
      formulaName: formulaData.formulaName,
      formulaApproved: formulaData.approved || false,
      formulaApprovedAt: formulaData.approved ? Timestamp.now() : null,
      formulaApprovedBy: formulaData.approved ? userId : null,
    };
    
    const docRef = doc(db, ORDER_COLLECTION, orderId);
    await updateDoc(docRef, {
      production,
      updatedAt: serverTimestamp(),
    });
    
    return { success: true };
  } catch (error) {
    console.error("Error updating formula info:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Ambalaj bilgilerini güncelle
 */
export const updatePackagingInfo = async (orderId, packagingData, userId) => {
  try {
    const order = await getOrder(orderId);
    if (!order || order.type !== ORDER_TYPE.PRODUCTION) {
      return { success: false, error: "Geçerli bir üretim siparişi bulunamadı" };
    }
    
    const production = {
      ...(order.production || {}),
      packaging: {
        ...(order.production?.packaging || {}),
        ...packagingData,
        approvedAt: packagingData.approved ? Timestamp.now() : (order.production?.packaging?.approvedAt || null),
      },
    };
    
    const docRef = doc(db, ORDER_COLLECTION, orderId);
    await updateDoc(docRef, {
      production,
      updatedAt: serverTimestamp(),
    });
    
    return { success: true };
  } catch (error) {
    console.error("Error updating packaging info:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Etiket bilgilerini güncelle
 */
export const updateLabelInfo = async (orderId, labelData, userId) => {
  try {
    const order = await getOrder(orderId);
    if (!order || order.type !== ORDER_TYPE.PRODUCTION) {
      return { success: false, error: "Geçerli bir üretim siparişi bulunamadı" };
    }
    
    const production = {
      ...(order.production || {}),
      label: {
        ...(order.production?.label || {}),
        ...labelData,
        approvedAt: labelData.approved ? Timestamp.now() : (order.production?.label?.approvedAt || null),
      },
    };
    
    const docRef = doc(db, ORDER_COLLECTION, orderId);
    await updateDoc(docRef, {
      production,
      updatedAt: serverTimestamp(),
    });
    
    return { success: true };
  } catch (error) {
    console.error("Error updating label info:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Kutu bilgilerini güncelle
 */
export const updateBoxInfo = async (orderId, boxData, userId) => {
  try {
    const order = await getOrder(orderId);
    if (!order || order.type !== ORDER_TYPE.PRODUCTION) {
      return { success: false, error: "Geçerli bir üretim siparişi bulunamadı" };
    }
    
    const production = {
      ...(order.production || {}),
      box: {
        ...(order.production?.box || {}),
        ...boxData,
        approvedAt: boxData.approved ? Timestamp.now() : (order.production?.box?.approvedAt || null),
      },
    };
    
    const docRef = doc(db, ORDER_COLLECTION, orderId);
    await updateDoc(docRef, {
      production,
      updatedAt: serverTimestamp(),
    });
    
    return { success: true };
  } catch (error) {
    console.error("Error updating box info:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Final paketleme bilgilerini güncelle
 */
export const updateFinalPackagingInfo = async (orderId, packagingInfoData, userId) => {
  try {
    const order = await getOrder(orderId);
    if (!order || order.type !== ORDER_TYPE.PRODUCTION) {
      return { success: false, error: "Geçerli bir üretim siparişi bulunamadı" };
    }
    
    const production = {
      ...(order.production || {}),
      packagingInfo: {
        ...(order.production?.packagingInfo || {}),
        ...packagingInfoData,
      },
    };
    
    const docRef = doc(db, ORDER_COLLECTION, orderId);
    await updateDoc(docRef, {
      production,
      updatedAt: serverTimestamp(),
    });
    
    return { success: true };
  } catch (error) {
    console.error("Error updating final packaging info:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Kontrat bağla
 */
export const linkContractToOrder = async (orderId, contractId, contractNumber, userId) => {
  try {
    const docRef = doc(db, ORDER_COLLECTION, orderId);
    await updateDoc(docRef, {
      contractId,
      contractNumber,
      updatedAt: serverTimestamp(),
    });
    
    return { success: true };
  } catch (error) {
    console.error("Error linking contract:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Proforma bağla ve sipariş bilgilerini güncelle
 */
export const linkProformaToOrder = async (orderId, proformaData, userId) => {
  try {
    const order = await getOrder(orderId);
    if (!order) {
      return { success: false, error: "Sipariş bulunamadı" };
    }
    
    // Proforma'dan item ve fiyat bilgilerini çıkar
    const items = (proformaData.services || []).map((service, index) => ({
      id: `item_${Date.now()}_${index}`,
      name: service.name || "",
      description: service.description || "",
      quantity: service.quantity || 1,
      unit: service.unit || "Adet",
      unitPrice: service.unitPrice || 0,
      total: (service.quantity || 1) * (service.unitPrice || 0),
    }));
    
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const taxRate = proformaData.taxRate ?? 20;
    const discountRate = proformaData.discountRate || 0;
    const discountAmount = subtotal * discountRate / 100;
    const taxAmount = (subtotal - discountAmount) * taxRate / 100;
    const total = subtotal - discountAmount + taxAmount;
    const advanceRate = order.advanceRate || 50;
    const advanceAmount = Math.round(total * advanceRate / 100);
    
    const updateData = {
      proformaId: proformaData.id,
      proformaNumber: proformaData.proformaNumber,
      items,
      currency: proformaData.currency || "TRY",
      subtotal,
      taxRate,
      taxAmount: Math.round(taxAmount),
      discountRate,
      discountAmount: Math.round(discountAmount),
      total: Math.round(total),
      advanceAmount,
      balanceAmount: Math.round(total - advanceAmount),
      updatedAt: serverTimestamp(),
    };
    
    // Müşteri bilgilerini de güncelle (varsa)
    if (proformaData.customerInfo) {
      updateData.customer = {
        companyName: proformaData.customerInfo.companyName || order.customer?.companyName || "",
        contactName: proformaData.customerInfo.contactPerson || order.customer?.contactName || "",
        email: proformaData.customerInfo.email || order.customer?.email || "",
        phone: proformaData.customerInfo.phone || order.customer?.phone || "",
      };
    }
    
    const docRef = doc(db, ORDER_COLLECTION, orderId);
    await updateDoc(docRef, updateData);
    
    return { success: true };
  } catch (error) {
    console.error("Error linking proforma:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Sipariş dosyası ekle
 */
export const addOrderAttachment = async (orderId, attachmentData, userId) => {
  try {
    const order = await getOrder(orderId);
    if (!order) {
      return { success: false, error: "Sipariş bulunamadı" };
    }
    
    const newAttachment = {
      id: `att_${Date.now()}`,
      name: attachmentData.name,
      url: attachmentData.url,
      type: attachmentData.type || "document",
      category: attachmentData.category || "general", // design, document, qc, etc.
      uploadedBy: userId,
      uploadedAt: Timestamp.now(),
    };
    
    const attachments = [...(order.attachments || []), newAttachment];
    
    const docRef = doc(db, ORDER_COLLECTION, orderId);
    await updateDoc(docRef, {
      attachments,
      updatedAt: serverTimestamp(),
    });
    
    return { success: true, attachmentId: newAttachment.id };
  } catch (error) {
    console.error("Error adding attachment:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Sipariş dosyasını sil
 */
export const deleteOrderAttachment = async (orderId, attachmentId, userId) => {
  try {
    const order = await getOrder(orderId);
    if (!order) {
      return { success: false, error: "Sipariş bulunamadı" };
    }
    
    const attachments = (order.attachments || []).filter(a => a.id !== attachmentId);
    
    const docRef = doc(db, ORDER_COLLECTION, orderId);
    await updateDoc(docRef, {
      attachments,
      updatedAt: serverTimestamp(),
    });
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting attachment:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Proforma'dan sipariş oluştur
 */
export const createOrderFromProforma = async (proformaData, orderType, userId) => {
  try {
    // Proforma'dan item ve fiyat bilgilerini çıkar
    const items = (proformaData.services || []).map((service, index) => ({
      id: `item_${Date.now()}_${index}`,
      name: service.name || "",
      description: service.description || "",
      quantity: service.quantity || 1,
      unit: service.unit || "Adet",
      unitPrice: service.unitPrice || 0,
      total: (service.quantity || 1) * (service.unitPrice || 0),
    }));
    
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const taxRate = proformaData.taxRate ?? 20;
    const discountRate = proformaData.discountRate || 0;
    const discountAmount = subtotal * discountRate / 100;
    const taxAmount = (subtotal - discountAmount) * taxRate / 100;
    const total = subtotal - discountAmount + taxAmount;
    const advanceRate = 50;
    const advanceAmount = Math.round(total * advanceRate / 100);
    
    const orderData = {
      type: orderType || ORDER_TYPE.PRODUCTION,
      proformaId: proformaData.id,
      proformaNumber: proformaData.proformaNumber,
      customerId: proformaData.customerId || null,
      companyId: proformaData.companyId || null,
      customer: {
        companyName: proformaData.customerInfo?.companyName || "",
        contactName: proformaData.customerInfo?.contactPerson || "",
        email: proformaData.customerInfo?.email || "",
        phone: proformaData.customerInfo?.phone || "",
      },
      items,
      currency: proformaData.currency || "TRY",
      subtotal,
      taxRate,
      taxAmount: Math.round(taxAmount),
      discountRate,
      discountAmount: Math.round(discountAmount),
      total: Math.round(total),
      advanceRate,
      advanceAmount,
      balanceAmount: Math.round(total - advanceAmount),
      paymentTerms: proformaData.paymentTerms || "",
      notes: proformaData.notes || "",
    };
    
    return await createOrder(orderData, userId);
  } catch (error) {
    console.error("Error creating order from proforma:", error);
    return { success: false, error: error.message };
  }
};
