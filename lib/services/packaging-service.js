import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "../firebase";

const COLLECTIONS = {
  PRODUCTS: "packaging_products",
  CATEGORIES: "packaging_categories",
};

export const generateSlug = (text) => {
  return text
    .toLowerCase()
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

export const packagingService = {
  async getAllProducts(filters = {}) {
    try {
      const q = collection(db, COLLECTIONS.PRODUCTS);
      const snapshot = await getDocs(q);

      let results = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      if (filters.isActive !== false) {
        results = results.filter(
          (product) => product.metadata?.isActive !== false
        );
      }

      if (filters.category) {
        results = results.filter(
          (product) => product.category === filters.category
        );
      }

      if (filters.inStock !== undefined) {
        results = results.filter(
          (product) => product.inStock === filters.inStock
        );
      }

      results.sort((a, b) => {
        const aTime = a.metadata?.createdAt?.seconds || 0;
        const bTime = b.metadata?.createdAt?.seconds || 0;
        return bTime - aTime;
      });

      return results;
    } catch (error) {
      console.error("Error fetching products:", error);
      throw new Error("Ürünler yüklenirken hata oluştu");
    }
  },

  async getProductById(id) {
    try {
      const docRef = doc(db, COLLECTIONS.PRODUCTS, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
        };
      } else {
        throw new Error("Ürün bulunamadı");
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      throw new Error("Ürün yüklenirken hata oluştu");
    }
  },

  async createProduct(productData) {
    try {
      const newId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const newProduct = {
        name: productData.name,
        code: productData.code,
        category: productData.category,
        description: productData.description,
        inStock: productData.inStock ?? true,

        specifications: {
          size: productData.specifications?.size || "",
          debit: productData.specifications?.debit || "",
          lockType: productData.specifications?.lockType || "",
          material: productData.specifications?.material || "",
        },

        colors: productData.colors?.filter((c) => c.trim()) || [],
        images: [],

        seo: {
          slug: generateSlug(productData.name),
          metaTitle: productData.seo?.metaTitle || productData.name,
          metaDescription:
            productData.seo?.metaDescription ||
            productData.description ||
            `${productData.name} ürün detayları`,
          keywords:
            productData.seo?.keywords?.filter((k) => k.trim()) ||
            [
              productData.category,
              productData.specifications?.material,
              productData.code,
            ].filter(Boolean),
        },

        business: {
          minOrderQuantity: productData.business?.minOrderQuantity || null,
          leadTime: productData.business?.leadTime || null,
          price: productData.business?.price || null,
          currency: productData.business?.currency || "TRY",
          availability: productData.inStock ? "in-stock" : "out-of-stock",
        },

        metadata: {
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          version: "1.0",
          source: "admin-panel",
          isActive: true,
        },

        customFields: productData.customFields || {},
      };

      const docRef = doc(db, COLLECTIONS.PRODUCTS, newId);
      await setDoc(docRef, newProduct);

      return {
        id: newId,
        ...newProduct,
      };
    } catch (error) {
      console.error("Error creating product:", error);
      throw new Error("Ürün oluşturulurken hata oluştu");
    }
  },
  async updateProduct(id, updates) {
    try {
      const updateData = {
        ...updates,
        metadata: {
          ...updates.metadata,
          updatedAt: serverTimestamp(),
        },
      };

      if (updates.name) {
        updateData.seo = {
          ...updates.seo,
          slug: generateSlug(updates.name),
          metaTitle: updates.name,
        };
      }

      if (updates.inStock !== undefined) {
        updateData.business = {
          ...updates.business,
          availability: updates.inStock ? "in-stock" : "out-of-stock",
        };
      }

      const docRef = doc(db, COLLECTIONS.PRODUCTS, id);
      await updateDoc(docRef, updateData);

      return await this.getProductById(id);
    } catch (error) {
      console.error("Error updating product:", error);
      throw new Error("Ürün güncellenirken hata oluştu");
    }
  },

  async deleteProduct(id) {
    try {
      const docRef = doc(db, COLLECTIONS.PRODUCTS, id);

      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        throw new Error("Ürün bulunamadı");
      }

      await deleteDoc(docRef);

      return true;
    } catch (error) {
      console.error("Error deleting product:", error);
      throw new Error("Ürün silinirken hata oluştu: " + error.message);
    }
  },

  async permanentDeleteProduct(id) {
    try {
      const docRef = doc(db, COLLECTIONS.PRODUCTS, id);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error("Error permanently deleting product:", error);
      throw new Error("Ürün kalıcı olarak silinirken hata oluştu");
    }
  },
};

export const categoryService = {
  async getAllCategories() {
    try {
      const q = query(
        collection(db, COLLECTIONS.CATEGORIES),
        where("isActive", "==", true),
        orderBy("sortOrder", "asc")
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw new Error("Kategoriler yüklenirken hata oluştu");
    }
  },

  async getCategoryBySlug(slug) {
    try {
      const docRef = doc(db, COLLECTIONS.CATEGORIES, slug);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
        };
      } else {
        throw new Error("Kategori bulunamadı");
      }
    } catch (error) {
      console.error("Error fetching category:", error);
      throw new Error("Kategori yüklenirken hata oluştu");
    }
  },

  // Create new category
  async createCategory(categoryData) {
    try {
      const slug = generateSlug(categoryData.name);

      const newCategory = {
        ...categoryData,
        slug,
        isActive: true,
        sortOrder: categoryData.sortOrder || 0,
        metadata: {
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          productCount: 0,
        },
      };

      const docRef = doc(db, COLLECTIONS.CATEGORIES, slug);
      await setDoc(docRef, newCategory);

      return {
        id: slug,
        ...newCategory,
      };
    } catch (error) {
      console.error("Error creating category:", error);
      throw new Error("Kategori oluşturulurken hata oluştu");
    }
  },

  // Update category
  async updateCategory(slug, updates) {
    try {
      const updateData = {
        ...updates,
        metadata: {
          ...updates.metadata,
          updatedAt: serverTimestamp(),
        },
      };

      const docRef = doc(db, COLLECTIONS.CATEGORIES, slug);
      await updateDoc(docRef, updateData);

      return await this.getCategoryBySlug(slug);
    } catch (error) {
      console.error("Error updating category:", error);
      throw new Error("Kategori güncellenirken hata oluştu");
    }
  },

  // Update product count for category
  async updateProductCount(categoryName) {
    try {
      const products = await packagingService.getAllProducts({
        category: categoryName,
      });
      const slug = generateSlug(categoryName);

      const docRef = doc(db, COLLECTIONS.CATEGORIES, slug);
      await updateDoc(docRef, {
        "metadata.productCount": products.length,
        "metadata.updatedAt": serverTimestamp(),
      });

      return products.length;
    } catch (error) {
      console.error("Error updating product count:", error);
      throw new Error("Ürün sayısı güncellenirken hata oluştu");
    }
  },
};

// BULK OPERATIONS
export const bulkOperations = {
  // Bulk update products
  async bulkUpdateProducts(updates) {
    try {
      const batch = writeBatch(db);

      updates.forEach(({ id, data }) => {
        const docRef = doc(db, COLLECTIONS.PRODUCTS, id);
        batch.update(docRef, {
          ...data,
          "metadata.updatedAt": serverTimestamp(),
        });
      });

      await batch.commit();
      return true;
    } catch (error) {
      console.error("Error in bulk update:", error);
      throw new Error("Toplu güncelleme sırasında hata oluştu");
    }
  },

  // Bulk delete products
  async bulkDeleteProducts(productIds) {
    try {
      const batch = writeBatch(db);

      productIds.forEach((id) => {
        const docRef = doc(db, COLLECTIONS.PRODUCTS, id);
        batch.update(docRef, {
          "metadata.isActive": false,
          "metadata.deletedAt": serverTimestamp(),
        });
      });

      await batch.commit();
      return true;
    } catch (error) {
      console.error("Error in bulk delete:", error);
      throw new Error("Toplu silme sırasında hata oluştu");
    }
  },
};

export default {
  packagingService,
  categoryService,
  bulkOperations,
  generateSlug,
};
