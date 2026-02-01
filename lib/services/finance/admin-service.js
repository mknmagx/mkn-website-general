/**
 * Finance Module - Admin/Maintenance Servisi
 * 
 * Finans modülü bakım ve yönetim işlemleri
 */

import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  writeBatch,
  query,
  limit,
} from "firebase/firestore";
import { db } from "../../firebase";

// Finans koleksiyonları
const FINANCE_COLLECTIONS = [
  "finance_accounts",
  "finance_transactions",
  "finance_receivables",
  "finance_payables",
  "finance_personnel",
  "finance_salaries",
  "finance_advances",
  "finance_exchange_rates",
  "finance_exchange_cache",
];

/**
 * Belirli bir koleksiyondaki tüm dokümanları sil
 * Batch işlem ile 500'erli gruplar halinde siler
 */
const deleteCollection = async (collectionName) => {
  try {
    const collRef = collection(db, collectionName);
    let totalDeleted = 0;
    let hasMore = true;

    while (hasMore) {
      // Her seferinde 500 doküman al (batch limit)
      const q = query(collRef, limit(500));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        hasMore = false;
        break;
      }

      // Batch ile sil
      const batch = writeBatch(db);
      snapshot.docs.forEach((document) => {
        batch.delete(doc(db, collectionName, document.id));
      });

      await batch.commit();
      totalDeleted += snapshot.docs.length;

      // Eğer 500'den az döndüyse daha fazla yok demektir
      if (snapshot.docs.length < 500) {
        hasMore = false;
      }
    }

    return { success: true, deleted: totalDeleted };
  } catch (error) {
    console.error(`Error deleting collection ${collectionName}:`, error);
    return { success: false, error: error.message, deleted: 0 };
  }
};

/**
 * Bir koleksiyondaki doküman sayısını getir
 */
const getCollectionCount = async (collectionName) => {
  try {
    const snapshot = await getDocs(collection(db, collectionName));
    return snapshot.size;
  } catch (error) {
    console.error(`Error counting collection ${collectionName}:`, error);
    return 0;
  }
};

/**
 * Tüm finans koleksiyonlarının istatistiklerini getir
 */
export const getFinanceStats = async () => {
  try {
    const stats = {};
    let totalDocuments = 0;

    for (const collName of FINANCE_COLLECTIONS) {
      const count = await getCollectionCount(collName);
      stats[collName] = count;
      totalDocuments += count;
    }

    return {
      success: true,
      data: {
        collections: stats,
        totalDocuments,
        collectionCount: FINANCE_COLLECTIONS.length,
      },
    };
  } catch (error) {
    console.error("Error getting finance stats:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Belirli bir finans koleksiyonunu temizle
 */
export const clearFinanceCollection = async (collectionName) => {
  if (!FINANCE_COLLECTIONS.includes(collectionName)) {
    return { success: false, error: "Geçersiz koleksiyon adı" };
  }

  return await deleteCollection(collectionName);
};

/**
 * TÜM finans koleksiyonlarını temizle
 * DİKKAT: Bu işlem geri alınamaz!
 */
export const clearAllFinanceData = async () => {
  try {
    const results = {};
    let totalDeleted = 0;
    let hasError = false;

    for (const collName of FINANCE_COLLECTIONS) {
      const result = await deleteCollection(collName);
      results[collName] = result;
      
      if (result.success) {
        totalDeleted += result.deleted;
      } else {
        hasError = true;
      }
    }

    return {
      success: !hasError,
      data: {
        results,
        totalDeleted,
        collectionsCleared: FINANCE_COLLECTIONS.length,
      },
      message: hasError 
        ? "Bazı koleksiyonlar temizlenirken hata oluştu" 
        : `Toplam ${totalDeleted} kayıt silindi`,
    };
  } catch (error) {
    console.error("Error clearing all finance data:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Koleksiyon isimlerini getir
 */
export const getFinanceCollections = () => FINANCE_COLLECTIONS;
