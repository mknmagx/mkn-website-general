/**
 * Finance Module - Şema Tanımları
 * 
 * Finansal yönetim sistemi için temel veri yapıları ve sabitler.
 * 
 * Collections:
 * - finance_accounts: Hesaplar (Kasa, Banka, vb.)
 * - finance_transactions: Tüm finansal hareketler
 * - finance_categories: Gelir/Gider kategorileri
 * - finance_receivables: Alacaklar
 * - finance_payables: Borçlar
 * - finance_personnel: Personel kayıtları
 * - finance_salaries: Maaş bordroları
 * - finance_advances: Personel avansları
 */

// =============================================================================
// PARA BİRİMLERİ
// =============================================================================
export const CURRENCY = {
  TRY: 'TRY',
  USD: 'USD',
  EUR: 'EUR',
  GBP: 'GBP',
};

export const ALL_CURRENCIES = [CURRENCY.TRY, CURRENCY.USD, CURRENCY.EUR, CURRENCY.GBP];

export const getCurrencyLabel = (currency) => {
  const labels = {
    [CURRENCY.TRY]: 'Türk Lirası',
    [CURRENCY.USD]: 'Amerikan Doları',
    [CURRENCY.EUR]: 'Euro',
    [CURRENCY.GBP]: 'İngiliz Sterlini',
  };
  return labels[currency] || currency;
};

export const getCurrencySymbol = (currency) => {
  const symbols = {
    [CURRENCY.TRY]: '₺',
    [CURRENCY.USD]: '$',
    [CURRENCY.EUR]: '€',
    [CURRENCY.GBP]: '£',
  };
  return symbols[currency] || currency;
};

// Boş bakiye objesi oluştur
export const createEmptyBalances = () => ({
  [CURRENCY.TRY]: 0,
  [CURRENCY.USD]: 0,
  [CURRENCY.EUR]: 0,
  [CURRENCY.GBP]: 0,
});

// =============================================================================
// HESAP MODLARI
// =============================================================================
export const ACCOUNT_MODE = {
  SINGLE: 'single',       // Tek döviz (geleneksel banka hesabı)
  MULTI: 'multi',         // Çoklu döviz (multi-currency wallet)
};

export const getAccountModeLabel = (mode) => {
  const labels = {
    [ACCOUNT_MODE.SINGLE]: 'Tek Döviz',
    [ACCOUNT_MODE.MULTI]: 'Çoklu Döviz',
  };
  return labels[mode] || mode;
};

// =============================================================================
// HESAP TÜRLERİ
// =============================================================================
export const ACCOUNT_TYPE = {
  CASH: 'cash',           // Kasa
  BANK: 'bank',           // Banka hesabı
  CREDIT_CARD: 'credit_card', // Kredi kartı
  POS: 'pos',             // POS cihazı
  CHEQUE: 'cheque',       // Çek
  PROMISSORY: 'promissory', // Senet
  ONLINE: 'online',       // Online ödeme (PayPal, Stripe vb.)
};

export const getAccountTypeLabel = (type) => {
  const labels = {
    [ACCOUNT_TYPE.CASH]: 'Kasa',
    [ACCOUNT_TYPE.BANK]: 'Banka',
    [ACCOUNT_TYPE.CREDIT_CARD]: 'Kredi Kartı',
    [ACCOUNT_TYPE.POS]: 'POS',
    [ACCOUNT_TYPE.CHEQUE]: 'Çek',
    [ACCOUNT_TYPE.PROMISSORY]: 'Senet',
    [ACCOUNT_TYPE.ONLINE]: 'Online Ödeme',
  };
  return labels[type] || type;
};

export const getAccountTypeIcon = (type) => {
  const icons = {
    [ACCOUNT_TYPE.CASH]: 'Wallet',
    [ACCOUNT_TYPE.BANK]: 'Building2',
    [ACCOUNT_TYPE.CREDIT_CARD]: 'CreditCard',
    [ACCOUNT_TYPE.POS]: 'Smartphone',
    [ACCOUNT_TYPE.CHEQUE]: 'FileText',
    [ACCOUNT_TYPE.PROMISSORY]: 'ScrollText',
    [ACCOUNT_TYPE.ONLINE]: 'Globe',
  };
  return icons[type] || 'Wallet';
};

export const getAccountTypeColor = (type) => {
  const colors = {
    [ACCOUNT_TYPE.CASH]: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    [ACCOUNT_TYPE.BANK]: 'bg-blue-100 text-blue-700 border-blue-200',
    [ACCOUNT_TYPE.CREDIT_CARD]: 'bg-purple-100 text-purple-700 border-purple-200',
    [ACCOUNT_TYPE.POS]: 'bg-orange-100 text-orange-700 border-orange-200',
    [ACCOUNT_TYPE.CHEQUE]: 'bg-amber-100 text-amber-700 border-amber-200',
    [ACCOUNT_TYPE.PROMISSORY]: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    [ACCOUNT_TYPE.ONLINE]: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  };
  return colors[type] || 'bg-gray-100 text-gray-700 border-gray-200';
};

// =============================================================================
// İŞLEM TÜRLERİ
// =============================================================================
export const TRANSACTION_TYPE = {
  INCOME: 'income',       // Gelir
  EXPENSE: 'expense',     // Gider
  TRANSFER: 'transfer',   // Hesaplar arası transfer
  EXCHANGE: 'exchange',   // Döviz çevirme (aynı hesap içi veya hesaplar arası)
};

export const getTransactionTypeLabel = (type) => {
  const labels = {
    [TRANSACTION_TYPE.INCOME]: 'Gelir',
    [TRANSACTION_TYPE.EXPENSE]: 'Gider',
    [TRANSACTION_TYPE.TRANSFER]: 'Transfer',
    [TRANSACTION_TYPE.EXCHANGE]: 'Döviz Çevirme',
  };
  return labels[type] || type;
};

export const getTransactionTypeColor = (type) => {
  const colors = {
    [TRANSACTION_TYPE.INCOME]: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    [TRANSACTION_TYPE.EXPENSE]: 'bg-red-100 text-red-700 border-red-200',
    [TRANSACTION_TYPE.TRANSFER]: 'bg-blue-100 text-blue-700 border-blue-200',
    [TRANSACTION_TYPE.EXCHANGE]: 'bg-purple-100 text-purple-700 border-purple-200',
  };
  return colors[type] || 'bg-gray-100 text-gray-700 border-gray-200';
};

// =============================================================================
// GELİR KATEGORİLERİ
// =============================================================================
export const INCOME_CATEGORY = {
  SALES: 'sales',                 // Satış geliri
  SERVICE: 'service',             // Hizmet geliri
  PRODUCTION: 'production',       // Üretim geliri
  COMMISSION: 'commission',       // Komisyon
  INTEREST: 'interest',           // Faiz geliri
  REFUND: 'refund',               // İade/Geri ödeme
  OTHER: 'other',                 // Diğer
};

export const getIncomeCategoryLabel = (category) => {
  const labels = {
    [INCOME_CATEGORY.SALES]: 'Satış Geliri',
    [INCOME_CATEGORY.SERVICE]: 'Hizmet Geliri',
    [INCOME_CATEGORY.PRODUCTION]: 'Üretim Geliri',
    [INCOME_CATEGORY.COMMISSION]: 'Komisyon',
    [INCOME_CATEGORY.INTEREST]: 'Faiz Geliri',
    [INCOME_CATEGORY.REFUND]: 'İade/Geri Ödeme',
    [INCOME_CATEGORY.OTHER]: 'Diğer Gelir',
  };
  return labels[category] || category;
};

export const getIncomeCategoryIcon = (category) => {
  const icons = {
    [INCOME_CATEGORY.SALES]: 'ShoppingCart',
    [INCOME_CATEGORY.SERVICE]: 'Briefcase',
    [INCOME_CATEGORY.PRODUCTION]: 'Factory',
    [INCOME_CATEGORY.COMMISSION]: 'Percent',
    [INCOME_CATEGORY.INTEREST]: 'TrendingUp',
    [INCOME_CATEGORY.REFUND]: 'RotateCcw',
    [INCOME_CATEGORY.OTHER]: 'MoreHorizontal',
  };
  return icons[category] || 'CircleDollarSign';
};

// =============================================================================
// GİDER KATEGORİLERİ
// =============================================================================
export const EXPENSE_CATEGORY = {
  // Üretim Giderleri
  RAW_MATERIAL: 'raw_material',     // Hammadde
  PACKAGING: 'packaging',           // Ambalaj
  PRODUCTION_COST: 'production_cost', // Üretim maliyeti
  
  // Personel Giderleri
  SALARY: 'salary',                 // Maaş
  ADVANCE: 'advance',               // Avans
  BONUS: 'bonus',                   // Prim/İkramiye
  SSK: 'ssk',                       // SGK
  
  // İşletme Giderleri
  RENT: 'rent',                     // Kira
  UTILITY: 'utility',               // Faturalar (Elektrik, Su, Doğalgaz)
  COMMUNICATION: 'communication',   // İletişim (Telefon, İnternet)
  TRANSPORT: 'transport',           // Nakliye/Ulaşım
  MAINTENANCE: 'maintenance',       // Bakım/Onarım
  
  // Diğer Giderler
  MARKETING: 'marketing',           // Pazarlama/Reklam
  TAX: 'tax',                       // Vergi
  INSURANCE: 'insurance',           // Sigorta
  LEGAL: 'legal',                   // Hukuk/Danışmanlık
  OFFICE: 'office',                 // Ofis giderleri
  OTHER: 'other',                   // Diğer
};

export const getExpenseCategoryLabel = (category) => {
  const labels = {
    [EXPENSE_CATEGORY.RAW_MATERIAL]: 'Hammadde',
    [EXPENSE_CATEGORY.PACKAGING]: 'Ambalaj',
    [EXPENSE_CATEGORY.PRODUCTION_COST]: 'Üretim Maliyeti',
    [EXPENSE_CATEGORY.SALARY]: 'Maaş',
    [EXPENSE_CATEGORY.ADVANCE]: 'Avans',
    [EXPENSE_CATEGORY.BONUS]: 'Prim/İkramiye',
    [EXPENSE_CATEGORY.SSK]: 'SGK',
    [EXPENSE_CATEGORY.RENT]: 'Kira',
    [EXPENSE_CATEGORY.UTILITY]: 'Faturalar',
    [EXPENSE_CATEGORY.COMMUNICATION]: 'İletişim',
    [EXPENSE_CATEGORY.TRANSPORT]: 'Nakliye/Ulaşım',
    [EXPENSE_CATEGORY.MAINTENANCE]: 'Bakım/Onarım',
    [EXPENSE_CATEGORY.MARKETING]: 'Pazarlama/Reklam',
    [EXPENSE_CATEGORY.TAX]: 'Vergi',
    [EXPENSE_CATEGORY.INSURANCE]: 'Sigorta',
    [EXPENSE_CATEGORY.LEGAL]: 'Hukuk/Danışmanlık',
    [EXPENSE_CATEGORY.OFFICE]: 'Ofis Giderleri',
    [EXPENSE_CATEGORY.OTHER]: 'Diğer Gider',
  };
  return labels[category] || category;
};

export const getExpenseCategoryIcon = (category) => {
  const icons = {
    [EXPENSE_CATEGORY.RAW_MATERIAL]: 'Beaker',
    [EXPENSE_CATEGORY.PACKAGING]: 'Package',
    [EXPENSE_CATEGORY.PRODUCTION_COST]: 'Factory',
    [EXPENSE_CATEGORY.SALARY]: 'Users',
    [EXPENSE_CATEGORY.ADVANCE]: 'HandCoins',
    [EXPENSE_CATEGORY.BONUS]: 'Gift',
    [EXPENSE_CATEGORY.SSK]: 'Shield',
    [EXPENSE_CATEGORY.RENT]: 'Building',
    [EXPENSE_CATEGORY.UTILITY]: 'Zap',
    [EXPENSE_CATEGORY.COMMUNICATION]: 'Phone',
    [EXPENSE_CATEGORY.TRANSPORT]: 'Truck',
    [EXPENSE_CATEGORY.MAINTENANCE]: 'Wrench',
    [EXPENSE_CATEGORY.MARKETING]: 'Megaphone',
    [EXPENSE_CATEGORY.TAX]: 'Receipt',
    [EXPENSE_CATEGORY.INSURANCE]: 'ShieldCheck',
    [EXPENSE_CATEGORY.LEGAL]: 'Scale',
    [EXPENSE_CATEGORY.OFFICE]: 'Clipboard',
    [EXPENSE_CATEGORY.OTHER]: 'MoreHorizontal',
  };
  return icons[category] || 'CircleDollarSign';
};

// Gider kategori grupları (UI için)
export const EXPENSE_CATEGORY_GROUPS = [
  {
    id: 'production',
    label: 'Üretim Giderleri',
    categories: [EXPENSE_CATEGORY.RAW_MATERIAL, EXPENSE_CATEGORY.PACKAGING, EXPENSE_CATEGORY.PRODUCTION_COST],
  },
  {
    id: 'personnel',
    label: 'Personel Giderleri',
    categories: [EXPENSE_CATEGORY.SALARY, EXPENSE_CATEGORY.ADVANCE, EXPENSE_CATEGORY.BONUS, EXPENSE_CATEGORY.SSK],
  },
  {
    id: 'operations',
    label: 'İşletme Giderleri',
    categories: [EXPENSE_CATEGORY.RENT, EXPENSE_CATEGORY.UTILITY, EXPENSE_CATEGORY.COMMUNICATION, EXPENSE_CATEGORY.TRANSPORT, EXPENSE_CATEGORY.MAINTENANCE],
  },
  {
    id: 'other',
    label: 'Diğer Giderler',
    categories: [EXPENSE_CATEGORY.MARKETING, EXPENSE_CATEGORY.TAX, EXPENSE_CATEGORY.INSURANCE, EXPENSE_CATEGORY.LEGAL, EXPENSE_CATEGORY.OFFICE, EXPENSE_CATEGORY.OTHER],
  },
];

// =============================================================================
// İŞLEM DURUMU
// =============================================================================
export const TRANSACTION_STATUS = {
  PENDING: 'pending',       // Beklemede
  COMPLETED: 'completed',   // Tamamlandı
  CANCELLED: 'cancelled',   // İptal
};

export const getTransactionStatusLabel = (status) => {
  const labels = {
    [TRANSACTION_STATUS.PENDING]: 'Beklemede',
    [TRANSACTION_STATUS.COMPLETED]: 'Tamamlandı',
    [TRANSACTION_STATUS.CANCELLED]: 'İptal',
  };
  return labels[status] || status;
};

export const getTransactionStatusColor = (status) => {
  const colors = {
    [TRANSACTION_STATUS.PENDING]: 'bg-amber-100 text-amber-700 border-amber-200',
    [TRANSACTION_STATUS.COMPLETED]: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    [TRANSACTION_STATUS.CANCELLED]: 'bg-red-100 text-red-700 border-red-200',
  };
  return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
};

// =============================================================================
// ÖDEME YÖNTEMLERİ
// =============================================================================
export const PAYMENT_METHOD = {
  CASH: 'cash',             // Nakit
  BANK_TRANSFER: 'bank_transfer', // Banka havalesi
  EFT: 'eft',               // EFT
  CREDIT_CARD: 'credit_card', // Kredi kartı
  CHEQUE: 'cheque',         // Çek
  PROMISSORY: 'promissory', // Senet
  ONLINE: 'online',         // Online ödeme
};

export const getPaymentMethodLabel = (method) => {
  const labels = {
    [PAYMENT_METHOD.CASH]: 'Nakit',
    [PAYMENT_METHOD.BANK_TRANSFER]: 'Banka Havalesi',
    [PAYMENT_METHOD.EFT]: 'EFT',
    [PAYMENT_METHOD.CREDIT_CARD]: 'Kredi Kartı',
    [PAYMENT_METHOD.CHEQUE]: 'Çek',
    [PAYMENT_METHOD.PROMISSORY]: 'Senet',
    [PAYMENT_METHOD.ONLINE]: 'Online Ödeme',
  };
  return labels[method] || method;
};

// =============================================================================
// ALACAK/BORÇ DURUMU
// =============================================================================
export const RECEIVABLE_STATUS = {
  PENDING: 'pending',       // Tahsil edilmedi
  PARTIAL: 'partial',       // Kısmi tahsilat
  COLLECTED: 'collected',   // Tahsil edildi
  OVERDUE: 'overdue',       // Vadesi geçmiş
  CANCELLED: 'cancelled',   // İptal
};

export const getReceivableStatusLabel = (status) => {
  const labels = {
    [RECEIVABLE_STATUS.PENDING]: 'Beklemede',
    [RECEIVABLE_STATUS.PARTIAL]: 'Kısmi Tahsilat',
    [RECEIVABLE_STATUS.COLLECTED]: 'Tahsil Edildi',
    [RECEIVABLE_STATUS.OVERDUE]: 'Vadesi Geçmiş',
    [RECEIVABLE_STATUS.CANCELLED]: 'İptal',
  };
  return labels[status] || status;
};

export const getReceivableStatusColor = (status) => {
  const colors = {
    [RECEIVABLE_STATUS.PENDING]: 'bg-amber-100 text-amber-700 border-amber-200',
    [RECEIVABLE_STATUS.PARTIAL]: 'bg-blue-100 text-blue-700 border-blue-200',
    [RECEIVABLE_STATUS.COLLECTED]: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    [RECEIVABLE_STATUS.OVERDUE]: 'bg-red-100 text-red-700 border-red-200',
    [RECEIVABLE_STATUS.CANCELLED]: 'bg-gray-100 text-gray-700 border-gray-200',
  };
  return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
};

export const PAYABLE_STATUS = {
  PENDING: 'pending',       // Ödenmedi
  PARTIAL: 'partial',       // Kısmi ödeme
  PAID: 'paid',             // Ödendi
  OVERDUE: 'overdue',       // Vadesi geçmiş
  CANCELLED: 'cancelled',   // İptal
};

export const getPayableStatusLabel = (status) => {
  const labels = {
    [PAYABLE_STATUS.PENDING]: 'Ödenmedi',
    [PAYABLE_STATUS.PARTIAL]: 'Kısmi Ödeme',
    [PAYABLE_STATUS.PAID]: 'Ödendi',
    [PAYABLE_STATUS.OVERDUE]: 'Vadesi Geçmiş',
    [PAYABLE_STATUS.CANCELLED]: 'İptal',
  };
  return labels[status] || status;
};

export const getPayableStatusColor = (status) => {
  const colors = {
    [PAYABLE_STATUS.PENDING]: 'bg-amber-100 text-amber-700 border-amber-200',
    [PAYABLE_STATUS.PARTIAL]: 'bg-blue-100 text-blue-700 border-blue-200',
    [PAYABLE_STATUS.PAID]: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    [PAYABLE_STATUS.OVERDUE]: 'bg-red-100 text-red-700 border-red-200',
    [PAYABLE_STATUS.CANCELLED]: 'bg-gray-100 text-gray-700 border-gray-200',
  };
  return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
};

// =============================================================================
// PERSONEL DURUMU
// =============================================================================
export const PERSONNEL_STATUS = {
  ACTIVE: 'active',         // Aktif
  INACTIVE: 'inactive',     // Pasif
  ON_LEAVE: 'on_leave',     // İzinli
  TERMINATED: 'terminated', // İşten ayrıldı
};

export const getPersonnelStatusLabel = (status) => {
  const labels = {
    [PERSONNEL_STATUS.ACTIVE]: 'Aktif',
    [PERSONNEL_STATUS.INACTIVE]: 'Pasif',
    [PERSONNEL_STATUS.ON_LEAVE]: 'İzinli',
    [PERSONNEL_STATUS.TERMINATED]: 'Ayrıldı',
  };
  return labels[status] || status;
};

export const getPersonnelStatusColor = (status) => {
  const colors = {
    [PERSONNEL_STATUS.ACTIVE]: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    [PERSONNEL_STATUS.INACTIVE]: 'bg-gray-100 text-gray-700 border-gray-200',
    [PERSONNEL_STATUS.ON_LEAVE]: 'bg-blue-100 text-blue-700 border-blue-200',
    [PERSONNEL_STATUS.TERMINATED]: 'bg-red-100 text-red-700 border-red-200',
  };
  return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
};

// =============================================================================
// AVANS DURUMU
// =============================================================================
export const ADVANCE_STATUS = {
  PENDING: 'pending',       // Onay bekliyor
  APPROVED: 'approved',     // Onaylandı
  PAID: 'paid',             // Ödendi
  DEDUCTED: 'deducted',     // Maaştan kesildi
  CANCELLED: 'cancelled',   // İptal
};

export const getAdvanceStatusLabel = (status) => {
  const labels = {
    [ADVANCE_STATUS.PENDING]: 'Onay Bekliyor',
    [ADVANCE_STATUS.APPROVED]: 'Onaylandı',
    [ADVANCE_STATUS.PAID]: 'Ödendi',
    [ADVANCE_STATUS.DEDUCTED]: 'Maaştan Kesildi',
    [ADVANCE_STATUS.CANCELLED]: 'İptal',
  };
  return labels[status] || status;
};

export const getAdvanceStatusColor = (status) => {
  const colors = {
    [ADVANCE_STATUS.PENDING]: 'bg-amber-100 text-amber-700 border-amber-200',
    [ADVANCE_STATUS.APPROVED]: 'bg-blue-100 text-blue-700 border-blue-200',
    [ADVANCE_STATUS.PAID]: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    [ADVANCE_STATUS.DEDUCTED]: 'bg-purple-100 text-purple-700 border-purple-200',
    [ADVANCE_STATUS.CANCELLED]: 'bg-red-100 text-red-700 border-red-200',
  };
  return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
};

// =============================================================================
// MAAŞ DURUMU
// =============================================================================
export const SALARY_STATUS = {
  DRAFT: 'draft',           // Taslak
  CALCULATED: 'calculated', // Hesaplandı
  APPROVED: 'approved',     // Onaylandı
  PAID: 'paid',             // Ödendi
};

export const getSalaryStatusLabel = (status) => {
  const labels = {
    [SALARY_STATUS.DRAFT]: 'Taslak',
    [SALARY_STATUS.CALCULATED]: 'Hesaplandı',
    [SALARY_STATUS.APPROVED]: 'Onaylandı',
    [SALARY_STATUS.PAID]: 'Ödendi',
  };
  return labels[status] || status;
};

export const getSalaryStatusColor = (status) => {
  const colors = {
    [SALARY_STATUS.DRAFT]: 'bg-gray-100 text-gray-700 border-gray-200',
    [SALARY_STATUS.CALCULATED]: 'bg-blue-100 text-blue-700 border-blue-200',
    [SALARY_STATUS.APPROVED]: 'bg-amber-100 text-amber-700 border-amber-200',
    [SALARY_STATUS.PAID]: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  };
  return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
};

// =============================================================================
// YARDIMCI FONKSİYONLAR
// =============================================================================

/**
 * Para formatla
 */
export const formatCurrency = (amount, currency = CURRENCY.TRY) => {
  const symbol = getCurrencySymbol(currency);
  const formatted = new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount || 0);
  return `${symbol}${formatted}`;
};

/**
 * Kısa para formatı
 */
export const formatCurrencyShort = (amount, currency = CURRENCY.TRY) => {
  const symbol = getCurrencySymbol(currency);
  if (amount >= 1000000) {
    return `${symbol}${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `${symbol}${(amount / 1000).toFixed(1)}K`;
  }
  return `${symbol}${amount.toFixed(0)}`;
};

/**
 * Tarih formatla
 */
export const formatDate = (date) => {
  if (!date) return '-';
  const d = date.toDate ? date.toDate() : new Date(date);
  return new Intl.DateTimeFormat('tr-TR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
};

/**
 * Tarih saat formatla
 */
export const formatDateTime = (date) => {
  if (!date) return '-';
  const d = date.toDate ? date.toDate() : new Date(date);
  return new Intl.DateTimeFormat('tr-TR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
};

/**
 * Ay/Yıl formatı (maaş dönemleri için)
 */
export const formatPeriod = (year, month) => {
  const months = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];
  return `${months[month - 1]} ${year}`;
};
