/**
 * Finance Module - Döviz Kuru Servisi
 * 
 * Güncel döviz kurlarını çekme, cache'leme ve dönüştürme işlemleri
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "../../firebase";
import { CURRENCY, ALL_CURRENCIES } from "./schema";

const RATES_COLLECTION = "finance_exchange_rates";
const CACHE_COLLECTION = "finance_exchange_cache";
const CACHE_DURATION = 60 * 60 * 1000; // 1 saat (ms)

// =============================================================================
// KUR API'LERİ
// =============================================================================

/**
 * TCMB'den kurları çek (Ücretsiz, resmi)
 * Fallback: ExchangeRate-API
 */
export const fetchExchangeRates = async (baseCurrency = CURRENCY.TRY) => {
  try {
    // Önce cache'e bak
    const cached = await getCachedRates(baseCurrency);
    if (cached) {
      return cached;
    }

    // API'den çek
    let rates = null;

    // ExchangeRate-API (ücretsiz tier)
    try {
      const response = await fetch(
        `https://api.exchangerate-api.com/v4/latest/${baseCurrency}`
      );
      if (response.ok) {
        const data = await response.json();
        rates = {
          base: baseCurrency,
          date: data.date,
          rates: {
            [CURRENCY.TRY]: data.rates.TRY || 1,
            [CURRENCY.USD]: data.rates.USD || 1,
            [CURRENCY.EUR]: data.rates.EUR || 1,
            [CURRENCY.GBP]: data.rates.GBP || 1,
          },
          source: 'exchangerate-api',
          fetchedAt: new Date().toISOString(),
        };
      }
    } catch (apiError) {
      console.error("ExchangeRate-API error:", apiError);
    }

    // Fallback: Sabit kurlar (son çare)
    if (!rates) {
      console.warn("Using fallback exchange rates");
      rates = getFallbackRates(baseCurrency);
    }

    // Cache'e kaydet
    await cacheRates(baseCurrency, rates);

    return rates;
  } catch (error) {
    console.error("Error fetching exchange rates:", error);
    return getFallbackRates(baseCurrency);
  }
};

/**
 * Fallback kurlar (API çalışmazsa)
 */
const getFallbackRates = (baseCurrency) => {
  // Yaklaşık kurlar (güncellenebilir)
  const baseRates = {
    [CURRENCY.TRY]: 1,
    [CURRENCY.USD]: 0.031,  // 1 TRY = 0.031 USD (yaklaşık 32 TRY/USD)
    [CURRENCY.EUR]: 0.028,  // 1 TRY = 0.028 EUR (yaklaşık 35 TRY/EUR)
    [CURRENCY.GBP]: 0.024,  // 1 TRY = 0.024 GBP (yaklaşık 42 TRY/GBP)
  };

  // Base currency'e göre normalize et
  const baseRate = baseRates[baseCurrency];
  const rates = {};
  
  Object.keys(baseRates).forEach(currency => {
    rates[currency] = baseRates[currency] / baseRate;
  });

  return {
    base: baseCurrency,
    date: new Date().toISOString().split('T')[0],
    rates,
    source: 'fallback',
    fetchedAt: new Date().toISOString(),
  };
};

// =============================================================================
// CACHE İŞLEMLERİ
// =============================================================================

/**
 * Cache'den kurları al
 */
const getCachedRates = async (baseCurrency) => {
  try {
    const cacheDoc = await getDoc(doc(db, CACHE_COLLECTION, baseCurrency));
    
    if (cacheDoc.exists()) {
      const data = cacheDoc.data();
      const cachedAt = data.cachedAt?.toDate?.() || new Date(data.cachedAt);
      const now = new Date();
      
      // Cache süresi dolmamışsa kullan
      if (now - cachedAt < CACHE_DURATION) {
        return data.rates;
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error getting cached rates:", error);
    return null;
  }
};

/**
 * Kurları cache'e kaydet
 */
const cacheRates = async (baseCurrency, rates) => {
  try {
    await setDoc(doc(db, CACHE_COLLECTION, baseCurrency), {
      rates,
      cachedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error caching rates:", error);
  }
};

// =============================================================================
// DÖVİZ ÇEVİRME
// =============================================================================

/**
 * Bir tutarı bir dövizden diğerine çevir
 */
export const convertCurrency = async (amount, fromCurrency, toCurrency) => {
  if (fromCurrency === toCurrency) {
    return {
      success: true,
      originalAmount: amount,
      convertedAmount: amount,
      rate: 1,
      fromCurrency,
      toCurrency,
    };
  }

  try {
    const rates = await fetchExchangeRates(fromCurrency);
    const rate = rates.rates[toCurrency];

    if (!rate) {
      return {
        success: false,
        error: `${toCurrency} için kur bulunamadı`,
      };
    }

    const convertedAmount = amount * rate;

    return {
      success: true,
      originalAmount: amount,
      convertedAmount: Math.round(convertedAmount * 100) / 100, // 2 decimal
      rate,
      fromCurrency,
      toCurrency,
      rateDate: rates.date,
      rateSource: rates.source,
    };
  } catch (error) {
    console.error("Error converting currency:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Birden fazla tutarı tek bir dövize çevir ve topla
 */
export const convertMultipleToSingle = async (amounts, targetCurrency) => {
  try {
    let total = 0;
    const conversions = [];

    for (const { amount, currency } of amounts) {
      if (amount <= 0) continue;
      
      const result = await convertCurrency(amount, currency, targetCurrency);
      if (result.success) {
        total += result.convertedAmount;
        conversions.push({
          original: { amount, currency },
          converted: result.convertedAmount,
          rate: result.rate,
        });
      }
    }

    return {
      success: true,
      total: Math.round(total * 100) / 100,
      targetCurrency,
      conversions,
    };
  } catch (error) {
    console.error("Error converting multiple currencies:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Bakiyeler objesini tek dövize çevir
 * @param {Object} balances - { TRY: 1000, USD: 500, EUR: 300 }
 * @param {string} targetCurrency - Hedef döviz
 */
export const convertBalancesToSingle = async (balances, targetCurrency) => {
  const amounts = Object.entries(balances)
    .filter(([_, amount]) => amount > 0)
    .map(([currency, amount]) => ({ currency, amount }));

  return await convertMultipleToSingle(amounts, targetCurrency);
};

// =============================================================================
// KUR GEÇMİŞİ
// =============================================================================

/**
 * Kur kaydı ekle (günlük snapshot için)
 */
export const saveRateSnapshot = async (rates) => {
  try {
    await addDoc(collection(db, RATES_COLLECTION), {
      ...rates,
      createdAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error("Error saving rate snapshot:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Kur geçmişini getir
 */
export const getRateHistory = async (baseCurrency, days = 30) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const q = query(
      collection(db, RATES_COLLECTION),
      where("base", "==", baseCurrency),
      where("createdAt", ">=", Timestamp.fromDate(startDate)),
      orderBy("createdAt", "desc"),
      limit(days)
    );

    const snapshot = await getDocs(q);
    const history = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return {
      success: true,
      data: history,
    };
  } catch (error) {
    console.error("Error getting rate history:", error);
    return {
      success: false,
      error: error.message,
      data: [],
    };
  }
};

// =============================================================================
// YARDIMCI FONKSİYONLAR
// =============================================================================

/**
 * Kur formatlama
 */
export const formatExchangeRate = (rate, fromCurrency, toCurrency) => {
  return `1 ${fromCurrency} = ${rate.toFixed(4)} ${toCurrency}`;
};

/**
 * Ters kur hesapla
 */
export const getInverseRate = (rate) => {
  return rate > 0 ? 1 / rate : 0;
};
