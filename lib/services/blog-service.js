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
} from "firebase/firestore";
import { db } from "../firebase";

// Blog Posts Collection Adı
const BLOG_POSTS_COLLECTION = "blogPosts";
const BLOG_CATEGORIES_COLLECTION = "blogCategories";

/**
 * Blog Post CRUD Operations
 * 
 * @param {Object} blogData - Blog verisi
 * @param {Object} blogData.aiMetadata - AI üretim metadata'sı (opsiyonel)
 * @param {string} blogData.aiMetadata.provider - AI provider (claude, gemini, openai)
 * @param {string} blogData.aiMetadata.model - Kullanılan model
 * @param {string} blogData.aiMetadata.finishReason - Bitiş nedeni (stop, max_tokens, etc.)
 * @param {boolean} blogData.aiMetadata.isTruncated - İçerik yarıda mı kesildi
 * @param {Object} blogData.aiMetadata.usage - Token kullanımı
 */
export const addBlogPost = async (blogData) => {
  try {
    // AI metadata varsa ayrıştır
    const { aiMetadata, ...restData } = blogData;
    
    const postData = {
      ...restData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      publishedAt: blogData.publishedAt
        ? new Date(blogData.publishedAt)
        : serverTimestamp(),
    };
    
    // AI ile üretildiyse metadata ekle
    if (aiMetadata) {
      postData.aiGenerated = true;
      postData.aiMetadata = {
        provider: aiMetadata.provider || null,
        model: aiMetadata.model || null,
        finishReason: aiMetadata.finishReason || "unknown",
        isTruncated: aiMetadata.isTruncated || false,
        usage: aiMetadata.usage || null,
        generatedAt: new Date().toISOString(),
      };
      
      // Truncated ise log'la ve flag ekle
      if (aiMetadata.isTruncated) {
        console.warn(`⚠️ Blog post AI tarafından yarıda kesilmiş olarak kaydediliyor! Finish reason: ${aiMetadata.finishReason}`);
        postData.contentTruncated = true;
      }
    }
    
    const docRef = await addDoc(collection(db, BLOG_POSTS_COLLECTION), postData);
    return docRef.id;
  } catch (error) {
    console.error("Blog post eklenirken hata:", error);
    throw error;
  }
};

export const updateBlogPost = async (postId, blogData) => {
  try {
    // AI metadata varsa ayrıştır
    const { aiMetadata, ...restData } = blogData;
    
    const updateData = {
      ...restData,
      updatedAt: serverTimestamp(),
      publishedAt: blogData.publishedAt
        ? new Date(blogData.publishedAt)
        : undefined,
    };
    
    // AI ile güncelleniyorsa metadata ekle
    if (aiMetadata) {
      updateData.aiMetadata = {
        ...(blogData.aiMetadata || {}), // Mevcut metadata'yı koru
        provider: aiMetadata.provider,
        model: aiMetadata.model,
        finishReason: aiMetadata.finishReason || "unknown",
        isTruncated: aiMetadata.isTruncated || false,
        usage: aiMetadata.usage || null,
        lastUpdatedAt: new Date().toISOString(),
      };
      
      // Truncated durumunu güncelle
      updateData.contentTruncated = aiMetadata.isTruncated || false;
    }
    
    const docRef = doc(db, BLOG_POSTS_COLLECTION, postId);
    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error("Blog post güncellenirken hata:", error);
    throw error;
  }
};

// Utility function to clean existing blog posts from JSON artifacts
export const cleanBlogPostContent = async (postId) => {
  try {
    const docRef = doc(db, BLOG_POSTS_COLLECTION, postId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error("Blog post bulunamadı");
    }
    
    const data = docSnap.data();
    const content = data.content || "";
    
    // Clean the content using our JSON cleaning logic
    const cleanedContent = content
      // Remove JSON patterns at the beginning
      .replace(/^\s*\{\s*"title"[\s\S]*?\}\s*/, "")
      // Remove JSON-like lines
      .replace(/^\s*"[^"]*"\s*:\s*"[^"]*".*$/gm, "")
      // Remove malformed JSON fragments
      .replace(/\{\s*"[^}]*$/g, "")
      .replace(/^[^}]*"\s*\}/g, "")
      // Clean up escaped characters
      .replace(/\\"/g, '"')
      .replace(/\\n/g, '\n')
      .replace(/\\t/g, '\t')
      .replace(/\\\\/g, '\\')
      // Remove multiple consecutive newlines
      .replace(/\n{3,}/g, '\n\n')
      // Trim whitespace
      .trim();
    
    // Update the post with cleaned content
    await updateDoc(docRef, {
      content: cleanedContent,
      updatedAt: serverTimestamp()
    });
    
    return { success: true, message: "Content cleaned successfully" };
  } catch (error) {
    console.error("Blog post temizlenirken hata:", error);
    throw error;
  }
};

export const deleteBlogPost = async (postId) => {
  try {
    const docRef = doc(db, BLOG_POSTS_COLLECTION, postId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Blog post silinirken hata:", error);
    throw error;
  }
};

export const getBlogPost = async (postId) => {
  try {
    const docRef = doc(db, BLOG_POSTS_COLLECTION, postId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        publishedAt: data.publishedAt?.toDate?.() || data.publishedAt,
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
      };
    }
    return null;
  } catch (error) {
    console.error("Blog post alınırken hata:", error);
    throw error;
  }
};

export const getBlogPostBySlug = async (slug) => {
  try {
    const q = query(
      collection(db, BLOG_POSTS_COLLECTION),
      where("slug", "==", slug),
      limit(1)
    );
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        publishedAt: data.publishedAt?.toDate?.() || data.publishedAt,
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
      };
    }
    return null;
  } catch (error) {
    console.error("Blog post slug ile alınırken hata:", error);
    // Firestore rules hatası durumunda null döndür
    if (
      error.code === "permission-denied" ||
      error.message?.includes("permission")
    ) {
      console.warn(
        "Firestore permission denied - returning null for blog post"
      );
      return null;
    }
    return null;
  }
};

export const getAllBlogPosts = async () => {
  try {
    const q = query(
      collection(db, BLOG_POSTS_COLLECTION),
      orderBy("publishedAt", "desc")
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        publishedAt: data.publishedAt?.toDate?.() || data.publishedAt,
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
      };
    });
  } catch (error) {
    console.error("Blog postları alınırken hata:", error);
    // Firestore rules hatası durumunda boş array döndür
    if (
      error.code === "permission-denied" ||
      error.message?.includes("permission")
    ) {
      console.warn("Firestore permission denied - returning empty posts array");
      return [];
    }
    return [];
  }
};

export const getBlogPostsByCategory = async (categorySlug) => {
  try {
    let q;
    if (categorySlug === "all") {
      q = query(
        collection(db, BLOG_POSTS_COLLECTION),
        orderBy("publishedAt", "desc")
      );
    } else {
      q = query(
        collection(db, BLOG_POSTS_COLLECTION),
        where("categorySlug", "==", categorySlug),
        orderBy("publishedAt", "desc")
      );
    }

    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        publishedAt: data.publishedAt?.toDate?.() || data.publishedAt,
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
      };
    });
  } catch (error) {
    console.error("Kategori blog postları alınırken hata:", error);
    throw error;
  }
};

export const getFeaturedBlogPosts = async () => {
  try {
    const q = query(
      collection(db, BLOG_POSTS_COLLECTION),
      where("featured", "==", true),
      orderBy("publishedAt", "desc")
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        publishedAt: data.publishedAt?.toDate?.() || data.publishedAt,
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
      };
    });
  } catch (error) {
    console.error("Öne çıkan blog postları alınırken hata:", error);
    throw error;
  }
};

export const getRelatedBlogPosts = async (
  currentPostId,
  categorySlug,
  limitCount = 3
) => {
  try {
    const q = query(
      collection(db, BLOG_POSTS_COLLECTION),
      where("categorySlug", "==", categorySlug),
      orderBy("publishedAt", "desc"),
      limit(limitCount + 1) // +1 çünkü current post'u filtreleyeceğiz
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs
      .map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          publishedAt: data.publishedAt?.toDate?.() || data.publishedAt,
          createdAt: data.createdAt?.toDate?.() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
        };
      })
      .filter((post) => post.id !== currentPostId)
      .slice(0, limitCount);
  } catch (error) {
    console.error("İlgili blog postları alınırken hata:", error);
    // Firestore rules hatası durumunda boş array döndür
    if (
      error.code === "permission-denied" ||
      error.message?.includes("permission")
    ) {
      console.warn(
        "Firestore permission denied - returning empty related posts"
      );
      return [];
    }
    return [];
  }
};

export const searchBlogPosts = async (searchTerm) => {
  try {
    // Firestore'da full-text search için basit bir yaklaşım
    // Daha gelişmiş aramalar için Algolia veya ElasticSearch entegrasyonu yapılabilir
    const allPosts = await getAllBlogPosts();
    const term = searchTerm.toLowerCase();

    return allPosts.filter(
      (post) =>
        post.title?.toLowerCase().includes(term) ||
        post.excerpt?.toLowerCase().includes(term) ||
        post.content?.toLowerCase().includes(term) ||
        post.tags?.some((tag) => tag.toLowerCase().includes(term))
    );
  } catch (error) {
    console.error("Blog postları aranırken hata:", error);
    throw error;
  }
};

// Blog Categories CRUD Operations
export const addBlogCategory = async (categoryData) => {
  try {
    const docRef = await addDoc(collection(db, BLOG_CATEGORIES_COLLECTION), {
      ...categoryData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Blog kategorisi eklenirken hata:", error);
    throw error;
  }
};

export const updateBlogCategory = async (categoryId, categoryData) => {
  try {
    const docRef = doc(db, BLOG_CATEGORIES_COLLECTION, categoryId);
    await updateDoc(docRef, {
      ...categoryData,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Blog kategorisi güncellenirken hata:", error);
    throw error;
  }
};

export const deleteBlogCategory = async (categoryId) => {
  try {
    const docRef = doc(db, BLOG_CATEGORIES_COLLECTION, categoryId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Blog kategorisi silinirken hata:", error);
    throw error;
  }
};

export const getAllBlogCategories = async () => {
  try {
    const q = query(
      collection(db, BLOG_CATEGORIES_COLLECTION),
      orderBy("name", "asc")
    );
    const querySnapshot = await getDocs(q);

    const categories = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
      };
    });

    // Her kategori için post sayısını hesapla
    const allPosts = await getAllBlogPosts();

    const categoriesWithCount = categories.map((category) => ({
      ...category,
      count: allPosts.filter((post) => post.categorySlug === category.slug)
        .length,
    }));

    // "Tümü" kategorisini başa ekle
    return [
      {
        id: "all",
        name: "Tümü",
        slug: "all",
        description: "Tüm blog yazıları",
        count: allPosts.length,
      },
      ...categoriesWithCount,
    ];
  } catch (error) {
    console.error("Blog kategorileri alınırken hata:", error);
    // Firestore rules hatası durumunda varsayılan kategoriler döndür
    if (
      error.code === "permission-denied" ||
      error.message?.includes("permission")
    ) {
      console.warn(
        "Firestore permission denied - returning default categories"
      );
      return [
        {
          id: "all",
          name: "Tümü",
          slug: "all",
          description: "Tüm blog yazıları",
          count: 0,
        },
      ];
    }
    // Fallback kategoriler
    return [
      {
        id: "all",
        name: "Tümü",
        slug: "all",
        description: "Tüm blog yazıları",
        count: 0,
      },
    ];
  }
};

// Blog istatistikleri
export const getBlogStats = async () => {
  try {
    const allPosts = await getAllBlogPosts();
    const allCategories = await getAllBlogCategories();

    return {
      totalPosts: allPosts.length,
      totalCategories: allCategories.length - 1, // "Tümü" kategorisini çıkar
      featuredPosts: allPosts.filter((post) => post.featured).length,
      publishedThisMonth: allPosts.filter((post) => {
        const publishedDate = new Date(post.publishedAt);
        const now = new Date();
        return (
          publishedDate.getMonth() === now.getMonth() &&
          publishedDate.getFullYear() === now.getFullYear()
        );
      }).length,
    };
  } catch (error) {
    console.error("Blog istatistikleri alınırken hata:", error);
    throw error;
  }
};
