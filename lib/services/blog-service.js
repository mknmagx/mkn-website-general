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

// Blog Post CRUD Operations
export const addBlogPost = async (blogData) => {
  try {
    const docRef = await addDoc(collection(db, BLOG_POSTS_COLLECTION), {
      ...blogData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      publishedAt: blogData.publishedAt ? new Date(blogData.publishedAt) : serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Blog post eklenirken hata:", error);
    throw error;
  }
};

export const updateBlogPost = async (postId, blogData) => {
  try {
    const docRef = doc(db, BLOG_POSTS_COLLECTION, postId);
    await updateDoc(docRef, {
      ...blogData,
      updatedAt: serverTimestamp(),
      publishedAt: blogData.publishedAt ? new Date(blogData.publishedAt) : undefined,
    });
  } catch (error) {
    console.error("Blog post güncellenirken hata:", error);
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
    throw error;
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
    throw error;
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

export const getRelatedBlogPosts = async (currentPostId, categorySlug, limitCount = 3) => {
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
    throw error;
  }
};

export const searchBlogPosts = async (searchTerm) => {
  try {
    // Firestore'da full-text search için basit bir yaklaşım
    // Daha gelişmiş aramalar için Algolia veya ElasticSearch entegrasyonu yapılabilir
    const allPosts = await getAllBlogPosts();
    const term = searchTerm.toLowerCase();
    
    return allPosts.filter((post) =>
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
      count: allPosts.filter((post) => post.categorySlug === category.slug).length,
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
    throw error;
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