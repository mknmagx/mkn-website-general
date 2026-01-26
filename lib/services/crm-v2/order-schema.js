/**
 * CRM v2 - Order (Sipariş) Şema Tanımları
 * 
 * 3 Tip Sipariş:
 * 1. Üretim Siparişi (Production) - Kozmetik, takviye, temizlik üretimi
 * 2. Tedarik Siparişi (Supply) - Ambalaj tedariki
 * 3. Hizmet Siparişi (Service) - E-ticaret, fulfillment, danışmanlık
 * 
 * v2.0 - Profesyonel Sipariş Yönetimi
 * - Proforma entegrasyonu
 * - Kontrat bağlantısı
 * - Formül seçimi
 * - Genişletilmiş üretim workflow'u (ambalaj, etiket, kutu tasarımı, paketleme)
 * - Checklist sistemi
 */

// =============================================================================
// ORDER TYPES - Sipariş Türleri
// =============================================================================
export const ORDER_TYPE = {
  PRODUCTION: 'production',   // Üretim siparişi
  SUPPLY: 'supply',           // Tedarik siparişi
  SERVICE: 'service',         // Hizmet siparişi
};

export const getOrderTypeLabel = (type) => {
  const labels = {
    [ORDER_TYPE.PRODUCTION]: 'Üretim Siparişi',
    [ORDER_TYPE.SUPPLY]: 'Tedarik Siparişi',
    [ORDER_TYPE.SERVICE]: 'Hizmet Siparişi',
  };
  return labels[type] || type;
};

export const getOrderTypeColor = (type) => {
  const colors = {
    [ORDER_TYPE.PRODUCTION]: 'bg-purple-100 text-purple-700 border-purple-200',
    [ORDER_TYPE.SUPPLY]: 'bg-blue-100 text-blue-700 border-blue-200',
    [ORDER_TYPE.SERVICE]: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  };
  return colors[type] || 'bg-gray-100 text-gray-700 border-gray-200';
};

export const getOrderTypeIcon = (type) => {
  const icons = {
    [ORDER_TYPE.PRODUCTION]: 'Factory',
    [ORDER_TYPE.SUPPLY]: 'Package',
    [ORDER_TYPE.SERVICE]: 'Briefcase',
  };
  return icons[type] || 'FileText';
};

// =============================================================================
// ORDER STATUS - Sipariş Durumları (Ortak)
// =============================================================================
export const ORDER_STATUS = {
  // Ortak durumlar
  DRAFT: 'draft',                     // Taslak
  PENDING_PAYMENT: 'pending_payment', // Ödeme bekleniyor (avans)
  CONFIRMED: 'confirmed',             // Onaylandı
  IN_PROGRESS: 'in_progress',         // İşlemde
  COMPLETED: 'completed',             // Tamamlandı
  DELIVERED: 'delivered',             // Teslim edildi
  CANCELLED: 'cancelled',             // İptal
  ON_HOLD: 'on_hold',                 // Beklemede
};

export const getOrderStatusLabel = (status) => {
  const labels = {
    [ORDER_STATUS.DRAFT]: 'Taslak',
    [ORDER_STATUS.PENDING_PAYMENT]: 'Ödeme Bekleniyor',
    [ORDER_STATUS.CONFIRMED]: 'Onaylandı',
    [ORDER_STATUS.IN_PROGRESS]: 'İşlemde',
    [ORDER_STATUS.COMPLETED]: 'Tamamlandı',
    [ORDER_STATUS.DELIVERED]: 'Teslim Edildi',
    [ORDER_STATUS.CANCELLED]: 'İptal Edildi',
    [ORDER_STATUS.ON_HOLD]: 'Beklemede',
  };
  return labels[status] || status;
};

export const getOrderStatusColor = (status) => {
  const colors = {
    [ORDER_STATUS.DRAFT]: 'bg-slate-100 text-slate-700 border-slate-200',
    [ORDER_STATUS.PENDING_PAYMENT]: 'bg-amber-100 text-amber-700 border-amber-200',
    [ORDER_STATUS.CONFIRMED]: 'bg-blue-100 text-blue-700 border-blue-200',
    [ORDER_STATUS.IN_PROGRESS]: 'bg-cyan-100 text-cyan-700 border-cyan-200',
    [ORDER_STATUS.COMPLETED]: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    [ORDER_STATUS.DELIVERED]: 'bg-green-100 text-green-700 border-green-200',
    [ORDER_STATUS.CANCELLED]: 'bg-red-100 text-red-700 border-red-200',
    [ORDER_STATUS.ON_HOLD]: 'bg-orange-100 text-orange-700 border-orange-200',
  };
  return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
};

export const getOrderStatusDot = (status) => {
  const dots = {
    [ORDER_STATUS.DRAFT]: 'bg-slate-500',
    [ORDER_STATUS.PENDING_PAYMENT]: 'bg-amber-500',
    [ORDER_STATUS.CONFIRMED]: 'bg-blue-500',
    [ORDER_STATUS.IN_PROGRESS]: 'bg-cyan-500',
    [ORDER_STATUS.COMPLETED]: 'bg-emerald-500',
    [ORDER_STATUS.DELIVERED]: 'bg-green-500',
    [ORDER_STATUS.CANCELLED]: 'bg-red-500',
    [ORDER_STATUS.ON_HOLD]: 'bg-orange-500',
  };
  return dots[status] || 'bg-gray-500';
};

// =============================================================================
// PRODUCTION STAGES - Üretim Aşamaları (Sadece Production Order için)
// =============================================================================
export const PRODUCTION_STAGE = {
  // Ön Hazırlık
  FORMULA_SELECTION: 'formula_selection',       // Formül seçimi/onayı
  FORMULA_APPROVAL: 'formula_approval',         // Formül müşteri onayı
  
  // Tasarım Aşaması
  PACKAGING_DESIGN: 'packaging_design',         // Ambalaj tasarımı
  LABEL_DESIGN: 'label_design',                 // Etiket tasarımı
  BOX_DESIGN: 'box_design',                     // Kutu tasarımı
  DESIGN_APPROVAL: 'design_approval',           // Tasarım onayları
  
  // Tedarik
  RAW_MATERIAL: 'raw_material',                 // Hammadde tedarik
  PACKAGING_SUPPLY: 'packaging_supply',         // Ambalaj tedarik
  LABEL_SUPPLY: 'label_supply',                 // Etiket tedarik
  BOX_SUPPLY: 'box_supply',                     // Kutu tedarik
  
  // Üretim
  PRODUCTION_PLANNING: 'production_planning',   // Üretim planlama
  PRODUCTION: 'production',                     // Üretim
  FILLING: 'filling',                           // Dolum
  QUALITY_CONTROL: 'quality_control',           // Kalite kontrol
  
  // Paketleme
  LABELING: 'labeling',                         // Etiketleme
  BOXING: 'boxing',                             // Kutulama
  FINAL_PACKAGING: 'final_packaging',           // Son paketleme
  
  // Teslim
  READY_FOR_DELIVERY: 'ready_for_delivery',     // Teslimata hazır
};

export const getProductionStageLabel = (stage) => {
  const labels = {
    [PRODUCTION_STAGE.FORMULA_SELECTION]: 'Formül Seçimi',
    [PRODUCTION_STAGE.FORMULA_APPROVAL]: 'Formül Onayı',
    [PRODUCTION_STAGE.PACKAGING_DESIGN]: 'Ambalaj Tasarımı',
    [PRODUCTION_STAGE.LABEL_DESIGN]: 'Etiket Tasarımı',
    [PRODUCTION_STAGE.BOX_DESIGN]: 'Kutu Tasarımı',
    [PRODUCTION_STAGE.DESIGN_APPROVAL]: 'Tasarım Onayları',
    [PRODUCTION_STAGE.RAW_MATERIAL]: 'Hammadde Tedarik',
    [PRODUCTION_STAGE.PACKAGING_SUPPLY]: 'Ambalaj Tedarik',
    [PRODUCTION_STAGE.LABEL_SUPPLY]: 'Etiket Tedarik',
    [PRODUCTION_STAGE.BOX_SUPPLY]: 'Kutu Tedarik',
    [PRODUCTION_STAGE.PRODUCTION_PLANNING]: 'Üretim Planlama',
    [PRODUCTION_STAGE.PRODUCTION]: 'Üretim',
    [PRODUCTION_STAGE.FILLING]: 'Dolum',
    [PRODUCTION_STAGE.QUALITY_CONTROL]: 'Kalite Kontrol',
    [PRODUCTION_STAGE.LABELING]: 'Etiketleme',
    [PRODUCTION_STAGE.BOXING]: 'Kutulama',
    [PRODUCTION_STAGE.FINAL_PACKAGING]: 'Son Paketleme',
    [PRODUCTION_STAGE.READY_FOR_DELIVERY]: 'Teslimata Hazır',
  };
  return labels[stage] || stage;
};

export const getProductionStageOrder = () => [
  PRODUCTION_STAGE.FORMULA_SELECTION,
  PRODUCTION_STAGE.FORMULA_APPROVAL,
  PRODUCTION_STAGE.PACKAGING_DESIGN,
  PRODUCTION_STAGE.LABEL_DESIGN,
  PRODUCTION_STAGE.BOX_DESIGN,
  PRODUCTION_STAGE.DESIGN_APPROVAL,
  PRODUCTION_STAGE.RAW_MATERIAL,
  PRODUCTION_STAGE.PACKAGING_SUPPLY,
  PRODUCTION_STAGE.LABEL_SUPPLY,
  PRODUCTION_STAGE.BOX_SUPPLY,
  PRODUCTION_STAGE.PRODUCTION_PLANNING,
  PRODUCTION_STAGE.PRODUCTION,
  PRODUCTION_STAGE.FILLING,
  PRODUCTION_STAGE.QUALITY_CONTROL,
  PRODUCTION_STAGE.LABELING,
  PRODUCTION_STAGE.BOXING,
  PRODUCTION_STAGE.FINAL_PACKAGING,
  PRODUCTION_STAGE.READY_FOR_DELIVERY,
];

// Üretim aşama grupları (UI için)
export const PRODUCTION_STAGE_GROUPS = [
  {
    id: 'preparation',
    label: 'Hazırlık',
    icon: 'ClipboardList',
    stages: [PRODUCTION_STAGE.FORMULA_SELECTION, PRODUCTION_STAGE.FORMULA_APPROVAL],
  },
  {
    id: 'design',
    label: 'Tasarım',
    icon: 'Palette',
    stages: [PRODUCTION_STAGE.PACKAGING_DESIGN, PRODUCTION_STAGE.LABEL_DESIGN, PRODUCTION_STAGE.BOX_DESIGN, PRODUCTION_STAGE.DESIGN_APPROVAL],
  },
  {
    id: 'supply',
    label: 'Tedarik',
    icon: 'Truck',
    stages: [PRODUCTION_STAGE.RAW_MATERIAL, PRODUCTION_STAGE.PACKAGING_SUPPLY, PRODUCTION_STAGE.LABEL_SUPPLY, PRODUCTION_STAGE.BOX_SUPPLY],
  },
  {
    id: 'production',
    label: 'Üretim',
    icon: 'Factory',
    stages: [PRODUCTION_STAGE.PRODUCTION_PLANNING, PRODUCTION_STAGE.PRODUCTION, PRODUCTION_STAGE.FILLING, PRODUCTION_STAGE.QUALITY_CONTROL],
  },
  {
    id: 'packaging',
    label: 'Paketleme',
    icon: 'Package',
    stages: [PRODUCTION_STAGE.LABELING, PRODUCTION_STAGE.BOXING, PRODUCTION_STAGE.FINAL_PACKAGING],
  },
  {
    id: 'delivery',
    label: 'Teslim',
    icon: 'CheckCircle',
    stages: [PRODUCTION_STAGE.READY_FOR_DELIVERY],
  },
];

// =============================================================================
// SUPPLY STAGES - Tedarik Aşamaları (Sadece Supply Order için)
// =============================================================================
export const SUPPLY_STAGE = {
  ORDER_PLACED: 'order_placed',           // Sipariş verildi
  SUPPLIER_CONFIRMED: 'supplier_confirmed', // Tedarikçi onayladı
  IN_PRODUCTION: 'in_production',         // Üretimde (tedarikçide)
  QUALITY_CHECK: 'quality_check',         // Kalite kontrol
  IN_WAREHOUSE: 'in_warehouse',           // Depoda
  READY_FOR_DELIVERY: 'ready_for_delivery', // Teslimata hazır
};

export const getSupplyStageLabel = (stage) => {
  const labels = {
    [SUPPLY_STAGE.ORDER_PLACED]: 'Sipariş Verildi',
    [SUPPLY_STAGE.SUPPLIER_CONFIRMED]: 'Tedarikçi Onayladı',
    [SUPPLY_STAGE.IN_PRODUCTION]: 'Üretimde',
    [SUPPLY_STAGE.QUALITY_CHECK]: 'Kalite Kontrol',
    [SUPPLY_STAGE.IN_WAREHOUSE]: 'Depoda',
    [SUPPLY_STAGE.READY_FOR_DELIVERY]: 'Teslimata Hazır',
  };
  return labels[stage] || stage;
};

export const getSupplyStageOrder = () => [
  SUPPLY_STAGE.ORDER_PLACED,
  SUPPLY_STAGE.SUPPLIER_CONFIRMED,
  SUPPLY_STAGE.IN_PRODUCTION,
  SUPPLY_STAGE.QUALITY_CHECK,
  SUPPLY_STAGE.IN_WAREHOUSE,
  SUPPLY_STAGE.READY_FOR_DELIVERY,
];

// =============================================================================
// SERVICE STAGES - Hizmet Aşamaları (Sadece Service Order için)
// =============================================================================
export const SERVICE_STAGE = {
  CONTRACT_SIGNED: 'contract_signed',     // Sözleşme imzalandı
  SETUP: 'setup',                         // Kurulum/Hazırlık
  ACTIVE: 'active',                       // Aktif hizmet
  REVIEW: 'review',                       // Değerlendirme
  INVOICED: 'invoiced',                   // Faturalandı
};

export const getServiceStageLabel = (stage) => {
  const labels = {
    [SERVICE_STAGE.CONTRACT_SIGNED]: 'Sözleşme İmzalandı',
    [SERVICE_STAGE.SETUP]: 'Kurulum/Hazırlık',
    [SERVICE_STAGE.ACTIVE]: 'Aktif Hizmet',
    [SERVICE_STAGE.REVIEW]: 'Değerlendirme',
    [SERVICE_STAGE.INVOICED]: 'Faturalandı',
  };
  return labels[stage] || stage;
};

export const getServiceStageOrder = () => [
  SERVICE_STAGE.CONTRACT_SIGNED,
  SERVICE_STAGE.SETUP,
  SERVICE_STAGE.ACTIVE,
  SERVICE_STAGE.REVIEW,
  SERVICE_STAGE.INVOICED,
];

// =============================================================================
// PAYMENT STATUS - Ödeme Durumları
// =============================================================================
export const PAYMENT_STATUS = {
  PENDING: 'pending',           // Ödeme bekleniyor
  PARTIAL: 'partial',           // Kısmi ödeme
  PAID: 'paid',                 // Tamamen ödendi
  OVERDUE: 'overdue',           // Gecikmiş
  REFUNDED: 'refunded',         // İade edildi
};

export const getPaymentStatusLabel = (status) => {
  const labels = {
    [PAYMENT_STATUS.PENDING]: 'Ödeme Bekleniyor',
    [PAYMENT_STATUS.PARTIAL]: 'Kısmi Ödeme',
    [PAYMENT_STATUS.PAID]: 'Ödendi',
    [PAYMENT_STATUS.OVERDUE]: 'Gecikmiş',
    [PAYMENT_STATUS.REFUNDED]: 'İade Edildi',
  };
  return labels[status] || status;
};

export const getPaymentStatusColor = (status) => {
  const colors = {
    [PAYMENT_STATUS.PENDING]: 'bg-amber-100 text-amber-700 border-amber-200',
    [PAYMENT_STATUS.PARTIAL]: 'bg-blue-100 text-blue-700 border-blue-200',
    [PAYMENT_STATUS.PAID]: 'bg-green-100 text-green-700 border-green-200',
    [PAYMENT_STATUS.OVERDUE]: 'bg-red-100 text-red-700 border-red-200',
    [PAYMENT_STATUS.REFUNDED]: 'bg-purple-100 text-purple-700 border-purple-200',
  };
  return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
};

// =============================================================================
// PRIORITY - Öncelik (Aynı schema.js'den)
// =============================================================================
export const ORDER_PRIORITY = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  URGENT: 'urgent',
};

export const getOrderPriorityLabel = (priority) => {
  const labels = {
    [ORDER_PRIORITY.LOW]: 'Düşük',
    [ORDER_PRIORITY.NORMAL]: 'Normal',
    [ORDER_PRIORITY.HIGH]: 'Yüksek',
    [ORDER_PRIORITY.URGENT]: 'Acil',
  };
  return labels[priority] || priority;
};

export const getOrderPriorityColor = (priority) => {
  const colors = {
    [ORDER_PRIORITY.LOW]: 'bg-gray-100 text-gray-700 border-gray-200',
    [ORDER_PRIORITY.NORMAL]: 'bg-blue-100 text-blue-700 border-blue-200',
    [ORDER_PRIORITY.HIGH]: 'bg-orange-100 text-orange-700 border-orange-200',
    [ORDER_PRIORITY.URGENT]: 'bg-red-100 text-red-700 border-red-200',
  };
  return colors[priority] || 'bg-gray-100 text-gray-700 border-gray-200';
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Sipariş türüne göre aşama listesini döndürür
 */
export const getStagesForOrderType = (orderType) => {
  switch (orderType) {
    case ORDER_TYPE.PRODUCTION:
      return getProductionStageOrder().map(stage => ({
        id: stage,
        label: getProductionStageLabel(stage),
      }));
    case ORDER_TYPE.SUPPLY:
      return getSupplyStageOrder().map(stage => ({
        id: stage,
        label: getSupplyStageLabel(stage),
      }));
    case ORDER_TYPE.SERVICE:
      return getServiceStageOrder().map(stage => ({
        id: stage,
        label: getServiceStageLabel(stage),
      }));
    default:
      return [];
  }
};

/**
 * Aşama ilerleme yüzdesini hesaplar (eski lineer yöntem - non-production için)
 */
export const calculateStageProgress = (orderType, currentStage) => {
  const stages = getStagesForOrderType(orderType);
  if (!stages.length) return 0;
  
  const currentIndex = stages.findIndex(s => s.id === currentStage);
  if (currentIndex === -1) return 0;
  
  return Math.round(((currentIndex + 1) / stages.length) * 100);
};

/**
 * Üretim siparişleri için production objesine dayalı ilerleme hesaplama
 * Her stage'in tamamlanması production objesindeki boolean değerlere bağlı
 */
export const calculateProductionProgress = (production = {}) => {
  const stages = getProductionStageOrder();
  if (!stages.length) return { percent: 0, completed: 0, total: stages.length };
  
  // Her stage için tamamlanma kontrolü
  const isStageCompleted = (stage) => {
    switch (stage) {
      case PRODUCTION_STAGE.FORMULA_SELECTION:
        return !!production?.formulaId;
      case PRODUCTION_STAGE.FORMULA_APPROVAL:
        return !!production?.formulaApproved;
      case PRODUCTION_STAGE.PACKAGING_DESIGN:
        return !!production?.packaging?.approved;
      case PRODUCTION_STAGE.LABEL_DESIGN:
        return !!production?.label?.approved;
      case PRODUCTION_STAGE.BOX_DESIGN:
        return !!production?.box?.approved || !production?.box?.required;
      case PRODUCTION_STAGE.DESIGN_APPROVAL:
        return !!production?.designsApproved;
      case PRODUCTION_STAGE.RAW_MATERIAL:
        return !!production?.supply?.rawMaterialReceived;
      case PRODUCTION_STAGE.PACKAGING_SUPPLY:
        return !!production?.supply?.packagingReceived;
      case PRODUCTION_STAGE.LABEL_SUPPLY:
        return !!production?.supply?.labelReceived;
      case PRODUCTION_STAGE.BOX_SUPPLY:
        return !!production?.supply?.boxReceived || !production?.box?.required;
      case PRODUCTION_STAGE.PRODUCTION_PLANNING:
        return !!production?.productionPlanned;
      case PRODUCTION_STAGE.PRODUCTION:
        return !!production?.productionCompleted;
      case PRODUCTION_STAGE.FILLING:
        return !!production?.fillingCompleted;
      case PRODUCTION_STAGE.QUALITY_CONTROL:
        return !!production?.qcApproved;
      case PRODUCTION_STAGE.LABELING:
        return !!production?.labelingCompleted;
      case PRODUCTION_STAGE.BOXING:
        return !!production?.boxingCompleted;
      case PRODUCTION_STAGE.FINAL_PACKAGING:
        return !!production?.finalPackagingCompleted;
      case PRODUCTION_STAGE.READY_FOR_DELIVERY:
        return !!production?.readyForDelivery;
      default:
        return false;
    }
  };
  
  const completedCount = stages.filter(s => isStageCompleted(s)).length;
  const percent = Math.round((completedCount / stages.length) * 100);
  
  return { 
    percent, 
    completed: completedCount, 
    total: stages.length 
  };
};

/**
 * Üretim grubu bazında tamamlanma hesaplama
 */
export const calculateProductionGroupProgress = (production = {}) => {
  const groupProgress = {};
  
  const isStageCompleted = (stage) => {
    switch (stage) {
      case PRODUCTION_STAGE.FORMULA_SELECTION:
        return !!production?.formulaId;
      case PRODUCTION_STAGE.FORMULA_APPROVAL:
        return !!production?.formulaApproved;
      case PRODUCTION_STAGE.PACKAGING_DESIGN:
        return !!production?.packaging?.approved;
      case PRODUCTION_STAGE.LABEL_DESIGN:
        return !!production?.label?.approved;
      case PRODUCTION_STAGE.BOX_DESIGN:
        return !!production?.box?.approved || !production?.box?.required;
      case PRODUCTION_STAGE.DESIGN_APPROVAL:
        return !!production?.designsApproved;
      case PRODUCTION_STAGE.RAW_MATERIAL:
        return !!production?.supply?.rawMaterialReceived;
      case PRODUCTION_STAGE.PACKAGING_SUPPLY:
        return !!production?.supply?.packagingReceived;
      case PRODUCTION_STAGE.LABEL_SUPPLY:
        return !!production?.supply?.labelReceived;
      case PRODUCTION_STAGE.BOX_SUPPLY:
        return !!production?.supply?.boxReceived || !production?.box?.required;
      case PRODUCTION_STAGE.PRODUCTION_PLANNING:
        return !!production?.productionPlanned;
      case PRODUCTION_STAGE.PRODUCTION:
        return !!production?.productionCompleted;
      case PRODUCTION_STAGE.FILLING:
        return !!production?.fillingCompleted;
      case PRODUCTION_STAGE.QUALITY_CONTROL:
        return !!production?.qcApproved;
      case PRODUCTION_STAGE.LABELING:
        return !!production?.labelingCompleted;
      case PRODUCTION_STAGE.BOXING:
        return !!production?.boxingCompleted;
      case PRODUCTION_STAGE.FINAL_PACKAGING:
        return !!production?.finalPackagingCompleted;
      case PRODUCTION_STAGE.READY_FOR_DELIVERY:
        return !!production?.readyForDelivery;
      default:
        return false;
    }
  };
  
  PRODUCTION_STAGE_GROUPS.forEach(group => {
    const groupStages = group.stages || [];
    const completed = groupStages.filter(s => isStageCompleted(s)).length;
    groupProgress[group.id] = {
      completed,
      total: groupStages.length,
      isComplete: completed === groupStages.length && groupStages.length > 0
    };
  });
  
  return groupProgress;
};

/**
 * Case tipinden Order tipine dönüşüm
 */
export const mapCaseTypeToOrderType = (caseType) => {
  const mapping = {
    'cosmetic_manufacturing': ORDER_TYPE.PRODUCTION,
    'supplement_manufacturing': ORDER_TYPE.PRODUCTION,
    'cleaning_manufacturing': ORDER_TYPE.PRODUCTION,
    'formulation': ORDER_TYPE.PRODUCTION,
    'packaging_supply': ORDER_TYPE.SUPPLY,
    'ecommerce_operations': ORDER_TYPE.SERVICE,
    'consultation': ORDER_TYPE.SERVICE,
    'other': ORDER_TYPE.SERVICE,
  };
  return mapping[caseType] || ORDER_TYPE.SERVICE;
};

/**
 * Sipariş numarası prefix'i
 */
export const getOrderNumberPrefix = (orderType) => {
  const prefixes = {
    [ORDER_TYPE.PRODUCTION]: 'PRD',
    [ORDER_TYPE.SUPPLY]: 'SUP',
    [ORDER_TYPE.SERVICE]: 'SVC',
  };
  return prefixes[orderType] || 'ORD';
};

// =============================================================================
// PRODUCTION CHECKLIST - Üretim Kontrol Listesi
// =============================================================================

/**
 * Üretim siparişi için varsayılan checklist
 */
export const getDefaultProductionChecklist = () => [
  // Hazırlık
  { id: 'chk_formula_selected', stage: PRODUCTION_STAGE.FORMULA_SELECTION, task: 'Formül seçildi', completed: false },
  { id: 'chk_formula_customer_approved', stage: PRODUCTION_STAGE.FORMULA_APPROVAL, task: 'Müşteri formülü onayladı', completed: false },
  { id: 'chk_formula_pricing_confirmed', stage: PRODUCTION_STAGE.FORMULA_APPROVAL, task: 'Fiyatlandırma onaylandı', completed: false },
  
  // Tasarım
  { id: 'chk_packaging_type_selected', stage: PRODUCTION_STAGE.PACKAGING_DESIGN, task: 'Ambalaj tipi belirlendi', completed: false },
  { id: 'chk_packaging_design_uploaded', stage: PRODUCTION_STAGE.PACKAGING_DESIGN, task: 'Ambalaj tasarımı yüklendi', completed: false },
  { id: 'chk_label_design_uploaded', stage: PRODUCTION_STAGE.LABEL_DESIGN, task: 'Etiket tasarımı yüklendi', completed: false },
  { id: 'chk_label_text_approved', stage: PRODUCTION_STAGE.LABEL_DESIGN, task: 'Etiket metinleri onaylandı', completed: false },
  { id: 'chk_box_design_required', stage: PRODUCTION_STAGE.BOX_DESIGN, task: 'Kutu gereksinimi belirlendi', completed: false },
  { id: 'chk_box_design_uploaded', stage: PRODUCTION_STAGE.BOX_DESIGN, task: 'Kutu tasarımı yüklendi (gerekli ise)', completed: false },
  { id: 'chk_all_designs_approved', stage: PRODUCTION_STAGE.DESIGN_APPROVAL, task: 'Tüm tasarımlar müşteri onayı aldı', completed: false },
  
  // Tedarik
  { id: 'chk_raw_materials_ordered', stage: PRODUCTION_STAGE.RAW_MATERIAL, task: 'Hammaddeler sipariş edildi', completed: false },
  { id: 'chk_raw_materials_received', stage: PRODUCTION_STAGE.RAW_MATERIAL, task: 'Hammaddeler teslim alındı', completed: false },
  { id: 'chk_packaging_ordered', stage: PRODUCTION_STAGE.PACKAGING_SUPPLY, task: 'Ambalajlar sipariş edildi', completed: false },
  { id: 'chk_packaging_received', stage: PRODUCTION_STAGE.PACKAGING_SUPPLY, task: 'Ambalajlar teslim alındı', completed: false },
  { id: 'chk_labels_ordered', stage: PRODUCTION_STAGE.LABEL_SUPPLY, task: 'Etiketler sipariş edildi', completed: false },
  { id: 'chk_labels_received', stage: PRODUCTION_STAGE.LABEL_SUPPLY, task: 'Etiketler teslim alındı', completed: false },
  { id: 'chk_boxes_ordered', stage: PRODUCTION_STAGE.BOX_SUPPLY, task: 'Kutular sipariş edildi (gerekli ise)', completed: false },
  { id: 'chk_boxes_received', stage: PRODUCTION_STAGE.BOX_SUPPLY, task: 'Kutular teslim alındı', completed: false },
  
  // Üretim
  { id: 'chk_production_scheduled', stage: PRODUCTION_STAGE.PRODUCTION_PLANNING, task: 'Üretim planlandı', completed: false },
  { id: 'chk_batch_number_assigned', stage: PRODUCTION_STAGE.PRODUCTION_PLANNING, task: 'Batch numarası atandı', completed: false },
  { id: 'chk_production_started', stage: PRODUCTION_STAGE.PRODUCTION, task: 'Üretim başladı', completed: false },
  { id: 'chk_production_completed', stage: PRODUCTION_STAGE.PRODUCTION, task: 'Üretim tamamlandı', completed: false },
  { id: 'chk_filling_completed', stage: PRODUCTION_STAGE.FILLING, task: 'Dolum tamamlandı', completed: false },
  { id: 'chk_qc_sample_taken', stage: PRODUCTION_STAGE.QUALITY_CONTROL, task: 'QC numunesi alındı', completed: false },
  { id: 'chk_qc_approved', stage: PRODUCTION_STAGE.QUALITY_CONTROL, task: 'Kalite kontrol onayı', completed: false },
  
  // Paketleme
  { id: 'chk_labeling_completed', stage: PRODUCTION_STAGE.LABELING, task: 'Etiketleme tamamlandı', completed: false },
  { id: 'chk_boxing_completed', stage: PRODUCTION_STAGE.BOXING, task: 'Kutulama tamamlandı (gerekli ise)', completed: false },
  { id: 'chk_carton_packaging', stage: PRODUCTION_STAGE.FINAL_PACKAGING, task: 'Koli paketleme tamamlandı', completed: false },
  { id: 'chk_pallet_ready', stage: PRODUCTION_STAGE.FINAL_PACKAGING, task: 'Palet hazırlığı tamamlandı', completed: false },
  
  // Teslim
  { id: 'chk_final_count_verified', stage: PRODUCTION_STAGE.READY_FOR_DELIVERY, task: 'Son sayım yapıldı', completed: false },
  { id: 'chk_documents_prepared', stage: PRODUCTION_STAGE.READY_FOR_DELIVERY, task: 'Sevkiyat belgeleri hazır', completed: false },
  { id: 'chk_customer_notified', stage: PRODUCTION_STAGE.READY_FOR_DELIVERY, task: 'Müşteri bilgilendirildi', completed: false },
];

/**
 * Tedarik siparişi için varsayılan checklist
 */
export const getDefaultSupplyChecklist = () => [
  { id: 'chk_po_sent', stage: SUPPLY_STAGE.ORDER_PLACED, task: 'Sipariş formu gönderildi', completed: false },
  { id: 'chk_payment_made', stage: SUPPLY_STAGE.ORDER_PLACED, task: 'Ödeme yapıldı', completed: false },
  { id: 'chk_supplier_confirmation', stage: SUPPLY_STAGE.SUPPLIER_CONFIRMED, task: 'Tedarikçi onayı alındı', completed: false },
  { id: 'chk_estimated_delivery', stage: SUPPLY_STAGE.SUPPLIER_CONFIRMED, task: 'Tahmini teslimat tarihi belirlendi', completed: false },
  { id: 'chk_production_tracking', stage: SUPPLY_STAGE.IN_PRODUCTION, task: 'Üretim takibi yapılıyor', completed: false },
  { id: 'chk_quality_inspection', stage: SUPPLY_STAGE.QUALITY_CHECK, task: 'Kalite kontrolü yapıldı', completed: false },
  { id: 'chk_received_in_warehouse', stage: SUPPLY_STAGE.IN_WAREHOUSE, task: 'Depoya teslim alındı', completed: false },
  { id: 'chk_inventory_updated', stage: SUPPLY_STAGE.IN_WAREHOUSE, task: 'Stok güncellendi', completed: false },
  { id: 'chk_customer_ready', stage: SUPPLY_STAGE.READY_FOR_DELIVERY, task: 'Müşteriye teslim için hazır', completed: false },
];

/**
 * Hizmet siparişi için varsayılan checklist
 */
export const getDefaultServiceChecklist = () => [
  { id: 'chk_contract_signed', stage: SERVICE_STAGE.CONTRACT_SIGNED, task: 'Sözleşme imzalandı', completed: false },
  { id: 'chk_setup_completed', stage: SERVICE_STAGE.SETUP, task: 'Kurulum/Hazırlık tamamlandı', completed: false },
  { id: 'chk_integration_done', stage: SERVICE_STAGE.SETUP, task: 'Entegrasyonlar yapıldı', completed: false },
  { id: 'chk_service_active', stage: SERVICE_STAGE.ACTIVE, task: 'Hizmet aktif', completed: false },
  { id: 'chk_review_done', stage: SERVICE_STAGE.REVIEW, task: 'Değerlendirme yapıldı', completed: false },
  { id: 'chk_invoice_sent', stage: SERVICE_STAGE.INVOICED, task: 'Fatura gönderildi', completed: false },
];

/**
 * Sipariş tipine göre varsayılan checklist döndürür
 */
export const getDefaultChecklistForOrderType = (orderType) => {
  switch (orderType) {
    case ORDER_TYPE.PRODUCTION:
      return getDefaultProductionChecklist();
    case ORDER_TYPE.SUPPLY:
      return getDefaultSupplyChecklist();
    case ORDER_TYPE.SERVICE:
      return getDefaultServiceChecklist();
    default:
      return [];
  }
};

// =============================================================================
// PACKAGING TYPES - Ambalaj Türleri
// =============================================================================
export const PACKAGING_TYPES = [
  { id: 'airless', label: 'Airless Şişe', category: 'bottle' },
  { id: 'pump', label: 'Pompalı Şişe', category: 'bottle' },
  { id: 'dropper', label: 'Damlalıklı Şişe', category: 'bottle' },
  { id: 'spray', label: 'Sprey Şişe', category: 'bottle' },
  { id: 'tube', label: 'Tüp', category: 'tube' },
  { id: 'jar', label: 'Kavanoz', category: 'jar' },
  { id: 'sachet', label: 'Saşe', category: 'sachet' },
  { id: 'bottle_standard', label: 'Standart Şişe', category: 'bottle' },
  { id: 'custom', label: 'Özel Tasarım', category: 'custom' },
];

export const PACKAGING_MATERIALS = [
  { id: 'pet', label: 'PET' },
  { id: 'hdpe', label: 'HDPE' },
  { id: 'pp', label: 'PP' },
  { id: 'glass', label: 'Cam' },
  { id: 'aluminum', label: 'Alüminyum' },
  { id: 'pcr', label: 'PCR (Geri Dönüştürülmüş)' },
];

export const PACKAGING_CAPACITIES = [
  '5ml', '10ml', '15ml', '20ml', '30ml', '50ml', '75ml', '100ml', 
  '125ml', '150ml', '200ml', '250ml', '300ml', '400ml', '500ml', '1000ml'
];

// =============================================================================
// PRODUCTION CATEGORIES - Üretim Kategorileri
// =============================================================================
export const PRODUCTION_CATEGORIES = {
  COSMETIC: 'cosmetic',
  SUPPLEMENT: 'supplement',
  CLEANING: 'cleaning',
};

export const getProductionCategoryLabel = (category) => {
  const labels = {
    [PRODUCTION_CATEGORIES.COSMETIC]: 'Kozmetik',
    [PRODUCTION_CATEGORIES.SUPPLEMENT]: 'Gıda Takviyesi',
    [PRODUCTION_CATEGORIES.CLEANING]: 'Temizlik Ürünü',
  };
  return labels[category] || category;
};

// =============================================================================
// ORDER SCHEMA - Firestore Document Yapısı
// =============================================================================
/**
 * Order Document Schema:
 * {
 *   id: string,
 *   orderNumber: string,               // PRD-2024-0001, SUP-2024-0001, SVC-2024-0001
 *   type: ORDER_TYPE,
 *   status: ORDER_STATUS,
 *   currentStage: PRODUCTION_STAGE | SUPPLY_STAGE | SERVICE_STAGE,
 *   
 *   // İlişkiler
 *   customerId: string,
 *   caseId: string | null,
 *   proformaId: string | null,
 *   contractId: string | null,
 *   deliveryIds: string[],             // Bağlı irsaliyeler
 *   
 *   // Müşteri bilgileri (snapshot)
 *   customer: {
 *     companyName: string,
 *     contactName: string,
 *     email: string,
 *     phone: string,
 *   },
 *   
 *   // Sipariş içeriği
 *   items: [
 *     {
 *       id: string,
 *       name: string,
 *       description: string,
 *       quantity: number,
 *       unit: string,
 *       unitPrice: number,
 *       total: number,
 *     }
 *   ],
 *   
 *   // Finansal
 *   currency: 'TRY' | 'USD' | 'EUR',
 *   subtotal: number,
 *   taxRate: number,
 *   taxAmount: number,
 *   discountRate: number,
 *   discountAmount: number,
 *   total: number,
 *   
 *   // Ödeme
 *   paymentStatus: PAYMENT_STATUS,
 *   paymentTerms: string,
 *   advanceRate: number,               // Avans oranı (%)
 *   advanceAmount: number,
 *   advancePaidAt: Timestamp | null,
 *   balanceAmount: number,
 *   balancePaidAt: Timestamp | null,
 *   payments: [
 *     {
 *       id: string,
 *       amount: number,
 *       method: string,
 *       date: Timestamp,
 *       note: string,
 *     }
 *   ],
 *   
 *   // Tarihler
 *   priority: ORDER_PRIORITY,
 *   estimatedDeliveryDate: Timestamp | null,
 *   actualDeliveryDate: Timestamp | null,
 *   
 *   // Üretim detayları (sadece production için)
 *   production: {
 *     batchNumber: string,
 *     lotNumber: string,
 *     formulaId: string | null,
 *     formulaName: string | null,
 *     formulaApproved: boolean,
 *     formulaApprovedAt: Timestamp | null,
 *     formulaApprovedBy: string | null,
 *     productionStartDate: Timestamp | null,
 *     productionEndDate: Timestamp | null,
 *     qcApproved: boolean,
 *     qcNotes: string,
 *     
 *     // Tasarım bilgileri
 *     packaging: {
 *       type: string,           // Şişe tipi
 *       material: string,       // Malzeme
 *       capacity: string,       // Kapasite
 *       color: string,          // Renk
 *       supplierId: string | null,
 *       supplierName: string | null,
 *       designFile: string | null,
 *       approved: boolean,
 *       approvedAt: Timestamp | null,
 *       notes: string,
 *     } | null,
 *     
 *     label: {
 *       designFile: string | null,
 *       designerId: string | null,
 *       designerName: string | null,
 *       approved: boolean,
 *       approvedAt: Timestamp | null,
 *       printReady: boolean,
 *       notes: string,
 *     } | null,
 *     
 *     box: {
 *       required: boolean,
 *       designFile: string | null,
 *       dimensions: string | null,
 *       material: string | null,
 *       approved: boolean,
 *       approvedAt: Timestamp | null,
 *       notes: string,
 *     } | null,
 *     
 *     // Üretim bilgileri
 *     plannedQuantity: number,
 *     actualQuantity: number | null,
 *     fillVolume: string | null,
 *     fillingDate: Timestamp | null,
 *     
 *     // Paketleme bilgileri
 *     packagingInfo: {
 *       unitsPerCarton: number | null,
 *       totalCartons: number | null,
 *       palletCount: number | null,
 *       totalWeight: string | null,
 *       packagingDate: Timestamp | null,
 *       notes: string,
 *     } | null,
 *   } | null,
 *   
 *   // Checklist - her aşama için tamamlanması gereken görevler
 *   checklist: [
 *     {
 *       id: string,
 *       stage: string,
 *       task: string,
 *       completed: boolean,
 *       completedAt: Timestamp | null,
 *       completedBy: string | null,
 *       notes: string,
 *     }
 *   ],
 *   
 *   // Notlar ve dosyalar
 *   notes: string,
 *   internalNotes: string,
 *   attachments: [
 *     {
 *       id: string,
 *       name: string,
 *       url: string,
 *       type: string,
 *       uploadedAt: Timestamp,
 *     }
 *   ],
 *   
 *   // Stage history
 *   stageHistory: [
 *     {
 *       stage: string,
 *       timestamp: Timestamp,
 *       userId: string,
 *       note: string,
 *     }
 *   ],
 *   
 *   // Meta
 *   assignedTo: string | null,
 *   createdBy: string,
 *   createdAt: Timestamp,
 *   updatedAt: Timestamp,
 * }
 */
