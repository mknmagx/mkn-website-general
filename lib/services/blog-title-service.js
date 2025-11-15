import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
  arrayUnion,
  arrayRemove,
  increment,
} from "firebase/firestore";
import { auth, db } from "../firebase";

// Collections
const BLOG_TITLE_DATASETS_COLLECTION = "blogTitleDatasets";
const BLOG_TITLE_USAGE_COLLECTION = "blogTitleUsage";

// Kategori tanımları - Firestore'dan alınabilir hale getiriliyor
export const DEFAULT_TITLE_CATEGORIES = [
  {
    key: "kozmetik-fason-uretim",
    name: "Kozmetik Fason Üretim",
    description: "Kozmetik ürün üretimi ve fason hizmetleri",
    color: "#f59e0b",
    icon: "💄",
  },
  {
    key: "gida-takviyesi",
    name: "Gıda Takviyesi Üretim",
    description: "Gıda takviyesi ve sağlık ürünleri",
    color: "#10b981",
    icon: "💊",
  },
  {
    key: "temizlik-urunleri",
    name: "Temizlik Ürünleri",
    description: "Temizlik ve hijyen ürünleri",
    color: "#3b82f6",
    icon: "🧽",
  },
  {
    key: "ambalaj",
    name: "Ambalaj Çözümleri",
    description: "Ambalaj tasarımı ve üretimi",
    color: "#8b5cf6",
    icon: "📦",
  },
  {
    key: "eticaret-operasyon",
    name: "E-ticaret Operasyon",
    description: "E-ticaret ve lojistik hizmetleri",
    color: "#ef4444",
    icon: "🛒",
  },
  {
    key: "pazarlama",
    name: "Pazarlama ve Marka",
    description: "Pazarlama stratejileri ve marka yönetimi",
    color: "#f97316",
    icon: "📈",
  },
  {
    key: "sektorel-trendler",
    name: "Sektörel Trendler",
    description: "Sektör analizleri ve gelecek trendleri",
    color: "#06b6d4",
    icon: "📊",
  },
  {
    key: "kalite-sertifikasyon",
    name: "Kalite ve Sertifikasyon",
    description: "Kalite standartları ve sertifika süreçleri",
    color: "#84cc16",
    icon: "🏆",
  },
];

// Dataset CRUD Operations
export const createTitleDataset = async (datasetData) => {
  try {
    // Current user'ı al
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("Kullanıcı oturumu bulunamadı");
    }

    const docRef = await addDoc(
      collection(db, BLOG_TITLE_DATASETS_COLLECTION),
      {
        name: datasetData.name,
        description: datasetData.description || "",
        categories: datasetData.categories || [], // Her kategori: {categoryKey, titles: []}
        isActive:
          datasetData.isActive !== undefined ? datasetData.isActive : true,
        aiModel: datasetData.aiModel || "",
        generatedBy: datasetData.generatedBy || "system",
        userId: currentUser.uid, // Kullanıcı ID'si ekle
        totalTitles: 0,
        usedTitles: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }
    );

    // Total titles hesapla
    const totalTitles =
      datasetData.categories?.reduce(
        (sum, cat) => sum + (cat.titles?.length || 0),
        0
      ) || 0;

    // Total titles güncelle
    await updateDoc(docRef, {
      totalTitles: totalTitles,
    });

    return docRef.id;
  } catch (error) {
    console.error("Title dataset oluşturulurken hata:", error);
    throw error;
  }
};

export const updateTitleDataset = async (datasetId, datasetData) => {
  try {
    const docRef = doc(db, BLOG_TITLE_DATASETS_COLLECTION, datasetId);

    // Total titles hesapla
    const totalTitles = datasetData.categories?.reduce(
      (sum, cat) => sum + (cat.titles?.length || 0),
      0
    );

    await updateDoc(docRef, {
      ...datasetData,
      totalTitles: totalTitles,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Title dataset güncellenirken hata:", error);
    throw error;
  }
};

export const deleteTitleDataset = async (datasetId) => {
  try {
    await deleteDoc(doc(db, BLOG_TITLE_DATASETS_COLLECTION, datasetId));

    // İlgili usage kayıtlarını da sil
    const usageQuery = query(
      collection(db, BLOG_TITLE_USAGE_COLLECTION),
      where("datasetId", "==", datasetId)
    );
    const usageDocs = await getDocs(usageQuery);

    const deletePromises = usageDocs.docs.map((usageDoc) =>
      deleteDoc(doc(db, BLOG_TITLE_USAGE_COLLECTION, usageDoc.id))
    );

    await Promise.all(deletePromises);
  } catch (error) {
    console.error("Title dataset silinirken hata:", error);
    throw error;
  }
};

export const getTitleDataset = async (datasetId) => {
  try {
    const docRef = doc(db, BLOG_TITLE_DATASETS_COLLECTION, datasetId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
      };
    }
    return null;
  } catch (error) {
    console.error("Title dataset alınırken hata:", error);
    throw error;
  }
};

export const getAllTitleDatasets = async (options = {}) => {
  try {
    let q = collection(db, BLOG_TITLE_DATASETS_COLLECTION);

    // Aktif olanları filtrele
    if (options.activeOnly) {
      q = query(q, where("isActive", "==", true));
    }

    // Sırala
    q = query(q, orderBy("updatedAt", "desc"));

    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
      };
    });
  } catch (error) {
    console.error("Title datasets alınırken hata:", error);
    return [];
  }
};

// Title Usage Tracking
export const markTitleAsUsed = async (
  datasetId,
  categoryKey,
  title,
  usageContext = {}
) => {
  try {
    // Current user'ı al
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("Kullanıcı oturumu bulunamadı");
    }

    // Usage kaydını oluştur
    const usageRef = await addDoc(collection(db, BLOG_TITLE_USAGE_COLLECTION), {
      datasetId: datasetId,
      categoryKey: categoryKey,
      title: title,
      userId: currentUser.uid, // Kullanıcı ID'si ekle
      usedAt: serverTimestamp(),
      usedBy: usageContext.userId || currentUser.uid,
      blogPostId: usageContext.blogPostId || null,
      blogSlug: usageContext.blogSlug || null,
      usageType: usageContext.usageType || "blog_generation", // blog_generation, manual_selection
      aiModel: usageContext.aiModel || null,
    });

    // Dataset'teki used count'u artır
    const datasetRef = doc(db, BLOG_TITLE_DATASETS_COLLECTION, datasetId);
    await updateDoc(datasetRef, {
      usedTitles: increment(1),
      updatedAt: serverTimestamp(),
    });

    return usageRef.id;
  } catch (error) {
    console.error("Title kullanım kaydı oluşturulurken hata:", error);
    throw error;
  }
};

export const getTitleUsageHistory = async (
  datasetId,
  categoryKey = null,
  title = null
) => {
  try {
    let q = query(
      collection(db, BLOG_TITLE_USAGE_COLLECTION),
      where("datasetId", "==", datasetId),
      orderBy("usedAt", "desc")
    );

    if (categoryKey) {
      q = query(q, where("categoryKey", "==", categoryKey));
    }

    if (title) {
      q = query(q, where("title", "==", title));
    }

    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        usedAt: data.usedAt?.toDate?.() || data.usedAt,
      };
    });
  } catch (error) {
    console.error("Title usage history alınırken hata:", error);
    return [];
  }
};

export const getUsedTitles = async (datasetId) => {
  try {
    const usageHistory = await getTitleUsageHistory(datasetId);

    // Kullanılmış title'ları grupla
    const usedTitlesMap = new Map();

    usageHistory.forEach((usage) => {
      const key = `${usage.categoryKey}::${usage.title}`;
      if (!usedTitlesMap.has(key)) {
        usedTitlesMap.set(key, {
          categoryKey: usage.categoryKey,
          title: usage.title,
          usageCount: 0,
          lastUsedAt: null,
          usages: [],
        });
      }

      const titleData = usedTitlesMap.get(key);
      titleData.usageCount++;
      titleData.usages.push(usage);

      if (!titleData.lastUsedAt || usage.usedAt > titleData.lastUsedAt) {
        titleData.lastUsedAt = usage.usedAt;
      }
    });

    return Array.from(usedTitlesMap.values());
  } catch (error) {
    console.error("Used titles alınırken hata:", error);
    return [];
  }
};

// Title Management Utilities
export const getTitlesByCategory = async (datasetId, categoryKey) => {
  try {
    const dataset = await getTitleDataset(datasetId);
    if (!dataset) return null;

    const category = dataset.categories.find(
      (cat) => cat.categoryKey === categoryKey
    );
    if (!category) return null;

    const usedTitles = await getUsedTitles(datasetId);
    const usedTitlesForCategory = usedTitles.filter(
      (ut) => ut.categoryKey === categoryKey
    );

    // Title'ları kullanım durumu ile zenginleştir
    const enrichedTitles = category.titles.map((title) => {
      const usageData = usedTitlesForCategory.find((ut) => ut.title === title);
      return {
        title,
        isUsed: !!usageData,
        usageCount: usageData?.usageCount || 0,
        lastUsedAt: usageData?.lastUsedAt || null,
        usages: usageData?.usages || [],
      };
    });

    return {
      categoryKey,
      categoryName:
        DEFAULT_TITLE_CATEGORIES.find((c) => c.key === categoryKey)?.name ||
        categoryKey,
      titles: enrichedTitles,
      totalTitles: enrichedTitles.length,
      usedTitles: enrichedTitles.filter((t) => t.isUsed).length,
      availableTitles: enrichedTitles.filter((t) => !t.isUsed).length,
    };
  } catch (error) {
    console.error("Category titles alınırken hata:", error);
    return null;
  }
};

export const getAvailableTitles = async (datasetId, categoryKey = null) => {
  try {
    const dataset = await getTitleDataset(datasetId);
    if (!dataset) return [];

    const usedTitles = await getUsedTitles(datasetId);
    const usedTitlesSet = new Set(
      usedTitles.map((ut) => `${ut.categoryKey}::${ut.title}`)
    );

    let availableTitles = [];

    dataset.categories.forEach((category) => {
      if (categoryKey && category.categoryKey !== categoryKey) return;

      category.titles.forEach((title) => {
        const key = `${category.categoryKey}::${title}`;
        if (!usedTitlesSet.has(key)) {
          availableTitles.push({
            categoryKey: category.categoryKey,
            categoryName:
              DEFAULT_TITLE_CATEGORIES.find(
                (c) => c.key === category.categoryKey
              )?.name || category.categoryKey,
            title,
          });
        }
      });
    });

    return availableTitles;
  } catch (error) {
    console.error("Available titles alınırken hata:", error);
    return [];
  }
};

// Dataset Statistics
export const getDatasetStats = async (datasetId) => {
  try {
    const dataset = await getTitleDataset(datasetId);
    if (!dataset) return null;

    const usageHistory = await getTitleUsageHistory(datasetId);
    const usedTitles = await getUsedTitles(datasetId);

    const categoryStats = DEFAULT_TITLE_CATEGORIES.map((defaultCat) => {
      const datasetCategory = dataset.categories.find(
        (c) => c.categoryKey === defaultCat.key
      );
      const totalTitles = datasetCategory?.titles?.length || 0;
      const usedInCategory = usedTitles.filter(
        (ut) => ut.categoryKey === defaultCat.key
      ).length;

      return {
        categoryKey: defaultCat.key,
        categoryName: defaultCat.name,
        totalTitles,
        usedTitles: usedInCategory,
        availableTitles: totalTitles - usedInCategory,
        usagePercentage:
          totalTitles > 0
            ? Math.round((usedInCategory / totalTitles) * 100)
            : 0,
      };
    });

    return {
      dataset: {
        id: dataset.id,
        name: dataset.name,
        totalTitles: dataset.totalTitles,
        usedTitles: usedTitles.length,
        availableTitles: dataset.totalTitles - usedTitles.length,
        usagePercentage:
          dataset.totalTitles > 0
            ? Math.round((usedTitles.length / dataset.totalTitles) * 100)
            : 0,
      },
      categories: categoryStats,
      recentUsage: usageHistory.slice(0, 10), // Son 10 kullanım
      totalUsageCount: usageHistory.length,
    };
  } catch (error) {
    console.error("Dataset stats alınırken hata:", error);
    return null;
  }
};

// AI Integration Helpers
export const generateTitlesWithAI = async (
  categoryKey,
  count = 10,
  aiOptions = {}
) => {
  try {
    const category = DEFAULT_TITLE_CATEGORIES.find(
      (c) => c.key === categoryKey
    );
    if (!category) throw new Error("Kategori bulunamadı");

    // AI title generation logic burada implement edilecek
    // Şimdilik mock data döndürüyoruz
    const mockTitles = Array.from(
      { length: count },
      (_, i) => `${category.name} ile İlgili Profesyonel Blog Başlığı ${i + 1}`
    );

    return mockTitles;
  } catch (error) {
    console.error("AI title generation hatası:", error);
    throw error;
  }
};

export const validateTitleDataset = (datasetData) => {
  const errors = [];

  if (!datasetData.name || datasetData.name.trim().length < 3) {
    errors.push("Dataset adı en az 3 karakter olmalıdır");
  }

  if (!datasetData.categories || datasetData.categories.length === 0) {
    errors.push("En az bir kategori olmalıdır");
  }

  datasetData.categories?.forEach((category, index) => {
    if (!category.categoryKey) {
      errors.push(`${index + 1}. kategoride categoryKey eksik`);
    }

    if (!category.titles || category.titles.length === 0) {
      errors.push(`${index + 1}. kategoride title'lar eksik`);
    }

    if (
      category.titles &&
      category.titles.some((title) => !title || title.trim().length < 5)
    ) {
      errors.push(`${index + 1}. kategoride çok kısa title'lar var`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
};
