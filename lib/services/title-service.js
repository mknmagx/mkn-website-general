import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  getDoc 
} from 'firebase/firestore';
import { db } from '../firebase';

const COLLECTION_NAME = 'title_suggestions';

/**
 * Başlık önerilerini Firestore'a kaydet
 * @param {Array} titles - Kaydedilecek başlık dizisi
 * @returns {Promise<Array>} Kaydedilen başlıklar
 */
export async function saveTitleSuggestions(titles) {
  try {
    const savedTitles = [];
    
    for (const titleData of titles) {
      const docData = {
        text: titleData.text,
        category: titleData.category || 'educational',
        tone: titleData.tone || 'professional',
        businessArea: titleData.businessArea || null,
        targetAudience: titleData.targetAudience || 'genel',
        topic: titleData.topic || '',
        contentType: titleData.contentType || 'blog',
        characterCount: titleData.text.length,
        isCustom: titleData.isCustom || false,
        isSelected: titleData.isSelected || false,
        isFavorite: titleData.isFavorite || false,
        usage: {
          clickCount: 0,
          copyCount: 0,
          editCount: 0,
          lastUsed: null
        },
        metadata: {
          generatedBy: titleData.generatedBy || 'ai',
          generationPrompt: titleData.generationPrompt || null,
          originalTitle: titleData.originalTitle || null,
          variations: titleData.variations || [],
          tags: titleData.tags || []
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: titleData.createdBy || 'system'
      };

      const docRef = await addDoc(collection(db, COLLECTION_NAME), docData);
      
      savedTitles.push({
        id: docRef.id,
        ...docData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    return savedTitles;
  } catch (error) {
    console.error('Error saving title suggestions:', error);
    throw new Error(`Başlıklar kaydedilemedi: ${error.message}`);
  }
}

/**
 * Başlık önerilerini Firestore'dan yükle
 * @param {Object} filters - Filtreleme parametreleri
 * @returns {Promise<Array>} Başlık listesi
 */
export async function loadTitleSuggestions(filters = {}) {
  try {
    let q = collection(db, COLLECTION_NAME);
    
    // Filtreleri uygula
    const conditions = [];
    
    if (filters.category) {
      conditions.push(where('category', '==', filters.category));
    }
    
    if (filters.businessArea) {
      conditions.push(where('businessArea', '==', filters.businessArea));
    }
    
    if (filters.tone) {
      conditions.push(where('tone', '==', filters.tone));
    }
    
    if (filters.targetAudience) {
      conditions.push(where('targetAudience', '==', filters.targetAudience));
    }
    
    if (filters.contentType) {
      conditions.push(where('contentType', '==', filters.contentType));
    }
    
    if (filters.isCustom !== undefined) {
      conditions.push(where('isCustom', '==', filters.isCustom));
    }
    
    if (filters.isFavorite) {
      conditions.push(where('isFavorite', '==', true));
    }

    // Sıralama
    const sortBy = filters.sortBy || 'createdAt';
    const sortOrder = filters.sortOrder || 'desc';
    conditions.push(orderBy(sortBy, sortOrder));
    
    // Limit
    if (filters.limit) {
      conditions.push(limit(filters.limit));
    }
    
    // Query oluştur
    if (conditions.length > 0) {
      q = query(q, ...conditions);
    }

    const querySnapshot = await getDocs(q);
    const titles = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      titles.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate()?.toISOString() || null,
        updatedAt: data.updatedAt?.toDate()?.toISOString() || null,
        usage: {
          ...data.usage,
          lastUsed: data.usage?.lastUsed?.toDate()?.toISOString() || null
        }
      });
    });

    return titles;
  } catch (error) {
    console.error('Error loading title suggestions:', error);
    throw new Error(`Başlıklar yüklenemedi: ${error.message}`);
  }
}

/**
 * Belirli bir başlık önerisini getir
 * @param {string} titleId - Başlık ID'si
 * @returns {Promise<Object>} Başlık verisi
 */
export async function getTitleSuggestion(titleId) {
  try {
    const docRef = doc(db, COLLECTION_NAME, titleId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate()?.toISOString() || null,
        updatedAt: data.updatedAt?.toDate()?.toISOString() || null,
        usage: {
          ...data.usage,
          lastUsed: data.usage?.lastUsed?.toDate()?.toISOString() || null
        }
      };
    } else {
      throw new Error('Başlık bulunamadı');
    }
  } catch (error) {
    console.error('Error getting title suggestion:', error);
    throw new Error(`Başlık getirilemedi: ${error.message}`);
  }
}

/**
 * Başlık önerisini güncelle
 * @param {string} titleId - Başlık ID'si
 * @param {Object} updates - Güncellenecek alanlar
 * @returns {Promise<Object>} Güncellenmiş başlık
 */
export async function updateTitleSuggestion(titleId, updates) {
  try {
    const docRef = doc(db, COLLECTION_NAME, titleId);
    
    const updateData = {
      ...updates,
      updatedAt: serverTimestamp()
    };

    // Karakter sayısını güncelle
    if (updates.text) {
      updateData.characterCount = updates.text.length;
    }

    await updateDoc(docRef, updateData);

    // Güncellenmiş veriyi döndür
    return await getTitleSuggestion(titleId);
  } catch (error) {
    console.error('Error updating title suggestion:', error);
    throw new Error(`Başlık güncellenemedi: ${error.message}`);
  }
}

/**
 * Başlık kullanımını kaydet (tıklama, kopyalama, düzenleme)
 * @param {string} titleId - Başlık ID'si
 * @param {string} actionType - Eylem türü ('click', 'copy', 'edit')
 * @returns {Promise<void>}
 */
export async function recordTitleUsage(titleId, actionType) {
  try {
    const titleDoc = await getTitleSuggestion(titleId);
    
    const updates = {
      usage: {
        ...titleDoc.usage,
        lastUsed: serverTimestamp()
      }
    };

    // Eylem türüne göre sayacı artır
    switch (actionType) {
      case 'click':
        updates.usage.clickCount = (titleDoc.usage.clickCount || 0) + 1;
        break;
      case 'copy':
        updates.usage.copyCount = (titleDoc.usage.copyCount || 0) + 1;
        break;
      case 'edit':
        updates.usage.editCount = (titleDoc.usage.editCount || 0) + 1;
        break;
    }

    await updateTitleSuggestion(titleId, updates);
  } catch (error) {
    console.error('Error recording title usage:', error);
    // Kullanım kaydı hatası kritik değil, devam et
  }
}

/**
 * Başlık önerisini sil
 * @param {string} titleId - Başlık ID'si
 * @returns {Promise<void>}
 */
export async function deleteTitleSuggestion(titleId) {
  try {
    const docRef = doc(db, COLLECTION_NAME, titleId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting title suggestion:', error);
    throw new Error(`Başlık silinemedi: ${error.message}`);
  }
}

/**
 * Toplu başlık silme
 * @param {Array} titleIds - Silinecek başlık ID'leri
 * @returns {Promise<void>}
 */
export async function bulkDeleteTitles(titleIds) {
  try {
    const deletePromises = titleIds.map(id => deleteTitleSuggestion(id));
    await Promise.all(deletePromises);
  } catch (error) {
    console.error('Error bulk deleting titles:', error);
    throw new Error(`Başlıklar toplu olarak silinemedi: ${error.message}`);
  }
}

/**
 * En çok kullanılan başlıkları getir
 * @param {number} limitCount - Getirilenecek sayı
 * @returns {Promise<Array>} Popüler başlıklar
 */
export async function getPopularTitles(limitCount = 10) {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      orderBy('usage.clickCount', 'desc'),
      limit(limitCount)
    );

    return await loadTitleSuggestions({ limit: limitCount });
  } catch (error) {
    console.error('Error getting popular titles:', error);
    throw new Error(`Popüler başlıklar getirilemedi: ${error.message}`);
  }
}

/**
 * Son kullanılan başlıkları getir
 * @param {number} limitCount - Getirilenecek sayı
 * @returns {Promise<Array>} Son başlıklar
 */
export async function getRecentTitles(limitCount = 10) {
  try {
    return await loadTitleSuggestions({ 
      sortBy: 'usage.lastUsed', 
      sortOrder: 'desc',
      limit: limitCount 
    });
  } catch (error) {
    console.error('Error getting recent titles:', error);
    throw new Error(`Son başlıklar getirilemedi: ${error.message}`);
  }
}

/**
 * Başlık arama (metin tabanlı)
 * @param {string} searchTerm - Arama terimi
 * @param {Object} filters - Ek filtreler
 * @returns {Promise<Array>} Arama sonuçları
 */
export async function searchTitles(searchTerm, filters = {}) {
  try {
    // Firestore tam metin arama desteklemediği için basit filtreleme
    const allTitles = await loadTitleSuggestions(filters);
    
    const searchTermLower = searchTerm.toLowerCase();
    
    return allTitles.filter(title => 
      title.text.toLowerCase().includes(searchTermLower) ||
      title.topic.toLowerCase().includes(searchTermLower) ||
      title.metadata?.tags?.some(tag => tag.toLowerCase().includes(searchTermLower))
    );
  } catch (error) {
    console.error('Error searching titles:', error);
    throw new Error(`Başlık araması yapılamadı: ${error.message}`);
  }
}

/**
 * Başlık istatistiklerini getir
 * @returns {Promise<Object>} İstatistik verileri
 */
export async function getTitleStatistics() {
  try {
    const allTitles = await loadTitleSuggestions();
    
    const stats = {
      total: allTitles.length,
      byCategory: {},
      byBusinessArea: {},
      byTone: {},
      totalUsage: {
        clicks: 0,
        copies: 0,
        edits: 0
      },
      averageLength: 0,
      customCount: 0,
      favoriteCount: 0
    };

    let totalLength = 0;

    allTitles.forEach(title => {
      // Kategori istatistikleri
      stats.byCategory[title.category] = (stats.byCategory[title.category] || 0) + 1;
      
      // İş alanı istatistikleri
      if (title.businessArea) {
        stats.byBusinessArea[title.businessArea] = (stats.byBusinessArea[title.businessArea] || 0) + 1;
      }
      
      // Ton istatistikleri
      stats.byTone[title.tone] = (stats.byTone[title.tone] || 0) + 1;
      
      // Kullanım istatistikleri
      stats.totalUsage.clicks += title.usage?.clickCount || 0;
      stats.totalUsage.copies += title.usage?.copyCount || 0;
      stats.totalUsage.edits += title.usage?.editCount || 0;
      
      // Uzunluk
      totalLength += title.characterCount || title.text.length;
      
      // Özel sayımlar
      if (title.isCustom) stats.customCount++;
      if (title.isFavorite) stats.favoriteCount++;
    });

    stats.averageLength = allTitles.length > 0 ? Math.round(totalLength / allTitles.length) : 0;

    return stats;
  } catch (error) {
    console.error('Error getting title statistics:', error);
    throw new Error(`İstatistikler getirilemedi: ${error.message}`);
  }
}