import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  orderBy,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { db, storage } from "../firebase";

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Clean and parse content data from API/Database
 * Handles stringified JSON with markdown code blocks (recursive)
 */
const cleanContentData = (content, depth = 0) => {
  // Prevent infinite recursion
  if (depth > 10) return content;
  if (!content) return content;

  // If content is already an object, check if fields need parsing
  if (typeof content === "object" && !Array.isArray(content)) {
    const cleaned = { ...content };

    // Check if any string fields contain JSON
    Object.keys(cleaned).forEach((key) => {
      const value = cleaned[key];
      
      if (typeof value === "string") {
        // Try to detect and parse JSON strings
        const str = value.trim();
        if (
          (str.startsWith("{") || str.startsWith("```json")) &&
          str.length > 50
        ) {
          try {
            // Remove markdown code blocks
            let cleanStr = str
              .replace(/^```json\s*/i, "")
              .replace(/^```\s*/, "");
            cleanStr = cleanStr.replace(/\s*```\s*$/, "").trim();

            // Try to extract and parse JSON
            const jsonMatch = cleanStr.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              const parsed = JSON.parse(jsonMatch[0]);
              // Only replace if it's actually a complex object
              if (
                typeof parsed === "object" &&
                Object.keys(parsed).length > 1
              ) {
                // Recursively clean nested objects
                cleaned[key] = cleanContentData(parsed, depth + 1);
              }
            }
          } catch (e) {
            // Keep original value if parsing fails
            console.warn(`Could not parse field ${key}:`, e.message);
          }
        }
      } else if (typeof value === "object" && value !== null) {
        // Recursively clean nested objects
        cleaned[key] = cleanContentData(value, depth + 1);
      }
    });

    return cleaned;
  }

  // If content is an array, recursively clean each item
  if (Array.isArray(content)) {
    return content.map(item => cleanContentData(item, depth + 1));
  }

  // If content is a string, try to parse it
  if (typeof content === "string") {
    const str = content.trim();
    if (
      (str.startsWith("{") || str.startsWith("```json")) &&
      str.length > 50
    ) {
      try {
        let cleaned = str.replace(/^```json\s*/i, "").replace(/^```\s*/, "");
        cleaned = cleaned.replace(/\s*```\s*$/, "").trim();

        const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          // Recursively clean the parsed object
          return cleanContentData(parsed, depth + 1);
        }
        const parsed = JSON.parse(cleaned);
        return cleanContentData(parsed, depth + 1);
      } catch (e) {
        console.warn("Could not parse stringified content:", e.message);
        return content;
      }
    }
  }

  return content;
};

// ==========================================
// DATASET MANAGEMENT
// ==========================================

/**
 * Get all datasets from API
 */
export const getDatasets = async () => {
  try {
    const response = await fetch("/api/admin/social-media/datasets");
    if (!response.ok) {
      throw new Error("Datasets yüklenemedi");
    }
    const data = await response.json();
    return data.datasets || [];
  } catch (error) {
    console.error("Datasets getirilirken hata:", error);
    throw error;
  }
};

/**
 * Get dataset by ID from API
 */
export const getDatasetById = async (datasetId) => {
  try {
    const response = await fetch(
      `/api/admin/social-media/datasets/${datasetId}`
    );
    if (!response.ok) {
      throw new Error("Dataset yüklenemedi");
    }
    return await response.json();
  } catch (error) {
    console.error("Dataset getirilirken hata:", error);
    throw error;
  }
};

/**
 * Get titles for a specific dataset from API
 */
export const getDatasetTitles = async (datasetId) => {
  try {
    const response = await fetch(
      `/api/admin/social-media/datasets/${datasetId}/titles`
    );
    if (!response.ok) {
      throw new Error("Başlıklar yüklenemedi");
    }
    const data = await response.json();
    return data.titles || [];
  } catch (error) {
    console.error("Başlıklar getirilirken hata:", error);
    throw error;
  }
};

/**
 * Create new dataset via API
 */
export const createDataset = async (datasetData) => {
  try {
    const response = await fetch("/api/admin/social-media/datasets", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(datasetData),
    });
    if (!response.ok) {
      throw new Error("Dataset oluşturulamadı");
    }
    return await response.json();
  } catch (error) {
    console.error("Dataset oluşturulurken hata:", error);
    throw error;
  }
};

/**
 * Update existing dataset via API
 */
export const updateDataset = async (datasetId, datasetData) => {
  try {
    const response = await fetch(
      `/api/admin/social-media/datasets/${datasetId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(datasetData),
      }
    );
    if (!response.ok) {
      throw new Error("Dataset güncellenemedi");
    }
    return await response.json();
  } catch (error) {
    console.error("Dataset güncellenirken hata:", error);
    throw error;
  }
};

/**
 * Delete dataset via API
 */
export const deleteDataset = async (datasetId) => {
  try {
    const response = await fetch(
      `/api/admin/social-media/datasets/${datasetId}`,
      {
        method: "DELETE",
      }
    );
    if (!response.ok) {
      throw new Error("Dataset silinemedi");
    }
    return await response.json();
  } catch (error) {
    console.error("Dataset silinirken hata:", error);
    throw error;
  }
};

// ==========================================
// CONTENT GENERATION (AI)
// ==========================================

/**
 * Generate social media content via Claude AI
 */
export const generateContent = async (contentData) => {
  try {
    const response = await fetch("/api/admin/social-media/generate-content", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(contentData),
    });
    if (!response.ok) {
      throw new Error("İçerik oluşturulamadı");
    }
    return await response.json();
  } catch (error) {
    console.error("İçerik oluşturulurken hata:", error);
    throw error;
  }
};

/**
 * Generate titles for dataset via Claude AI
 */
export const generateTitles = async (titleData) => {
  try {
    const response = await fetch("/api/admin/social-media/generate-titles", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(titleData),
    });
    if (!response.ok) {
      throw new Error("Başlıklar oluşturulamadı");
    }
    return await response.json();
  } catch (error) {
    console.error("Başlıklar oluşturulurken hata:", error);
    throw error;
  }
};

// ==========================================
// CALENDAR & PLANNING
// ==========================================

/**
 * Get all titles for calendar view
 */
export const getAllTitles = async () => {
  try {
    const response = await fetch("/api/admin/social-media/titles");
    if (!response.ok) {
      throw new Error("Başlıklar yüklenemedi");
    }
    const data = await response.json();
    return data.titles || [];
  } catch (error) {
    console.error("Başlıklar getirilirken hata:", error);
    throw error;
  }
};

/**
 * Get calendar plans from Firestore
 */
export const getCalendarPlans = async () => {
  try {
    const response = await fetch("/api/admin/social-media/calendar-plans");
    if (!response.ok) {
      throw new Error("Takvim planları yüklenemedi");
    }
    const data = await response.json();
    return data.plans || [];
  } catch (error) {
    console.error("Takvim planları getirilirken hata:", error);
    throw error;
  }
};

/**
 * Save calendar plan to Firestore
 */
export const saveCalendarPlan = async (planData) => {
  try {
    const response = await fetch("/api/admin/social-media/calendar-plans", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(planData),
    });
    if (!response.ok) {
      throw new Error("Takvim planı kaydedilemedi");
    }
    return await response.json();
  } catch (error) {
    console.error("Takvim planı kaydedilirken hata:", error);
    throw error;
  }
};

/**
 * Delete calendar plan from Firestore
 */
export const deleteCalendarPlan = async (planId) => {
  try {
    const response = await fetch(
      `/api/admin/social-media/calendar-plans/${planId}`,
      {
        method: "DELETE",
      }
    );
    if (!response.ok) {
      throw new Error("Takvim planı silinemedi");
    }
    return await response.json();
  } catch (error) {
    console.error("Takvim planı silinirken hata:", error);
    throw error;
  }
};

/**
 * Update calendar plan in Firestore
 */
export const updateCalendarPlan = async (planId, planData) => {
  try {
    const response = await fetch(
      `/api/admin/social-media/calendar-plans/${planId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(planData),
      }
    );
    if (!response.ok) {
      throw new Error("Takvim planı güncellenemedi");
    }
    return await response.json();
  } catch (error) {
    console.error("Takvim planı güncellenirken hata:", error);
    throw error;
  }
};

// ==========================================
// GENERATED CONTENT MANAGEMENT (Firestore)
// ==========================================

const GENERATED_CONTENT_COLLECTION = "social-media-content";

/**
 * Get all generated contents from Firestore
 * Automatically cleans stringified JSON data
 */
export const getAllGeneratedContents = async () => {
  try {
    const contentsRef = collection(db, GENERATED_CONTENT_COLLECTION);
    const q = query(contentsRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      // Clean content data if it contains stringified JSON
      if (data.content) {
        data.content = cleanContentData(data.content);
      }
      return {
        id: doc.id,
        ...data,
      };
    });
  } catch (error) {
    console.error("İçerikler getirilirken hata:", error);
    throw error;
  }
};

/**
 * Get single generated content by ID from Firestore
 * @param {string} contentId - The ID of the content to retrieve
 * @returns {Promise<Object>} The content object with cleaned data
 */
export const getGeneratedContentById = async (contentId) => {
  try {
    const contentRef = doc(db, GENERATED_CONTENT_COLLECTION, contentId);
    const contentSnap = await getDoc(contentRef);

    if (!contentSnap.exists()) {
      throw new Error('Content not found');
    }

    const data = contentSnap.data();
    // Clean content data if it contains stringified JSON
    if (data.content) {
      data.content = cleanContentData(data.content);
    }

    return {
      id: contentSnap.id,
      ...data,
    };
  } catch (error) {
    console.error("İçerik getirilirken hata:", error);
    throw error;
  }
};

/**
 * Save generated content to Firestore
 * Also updates the title document's usedPosts array if titleId is provided
 */
export const saveGeneratedContent = async (contentData) => {
  try {
    const contentsRef = collection(db, GENERATED_CONTENT_COLLECTION);
    const docRef = await addDoc(contentsRef, {
      ...contentData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    const contentId = docRef.id;

    // If titleId exists, update the title document with usedPosts info
    if (contentData.titleId && contentData.datasetId) {
      try {
        const titleRef = doc(
          db,
          "socialMediaDatasets",
          contentData.datasetId,
          "titles",
          contentData.titleId
        );

        const usedPostData = {
          postId: contentId,
          platform: contentData.platform,
          contentType: contentData.contentType,
          createdAt: new Date().toISOString(),
        };

        // Use arrayUnion to add to usedPosts array
        await updateDoc(titleRef, {
          usedPosts: arrayUnion(usedPostData),
          updatedAt: serverTimestamp(),
        });

        console.log(`✅ Added post ${contentId} to title ${contentData.titleId} usedPosts`);
      } catch (titleError) {
        console.error("Başlık dosyası güncellenirken hata:", titleError);
        // Don't throw, content is already saved
      }
    }

    return { id: contentId, ...contentData };
  } catch (error) {
    console.error("İçerik kaydedilirken hata:", error);
    throw error;
  }
};

/**
 * Update generated content in Firestore
 * If titleId changes, updates both old and new title documents
 */
export const updateGeneratedContent = async (contentId, updates) => {
  try {
    const contentRef = doc(db, GENERATED_CONTENT_COLLECTION, contentId);
    
    // Get current content to check if titleId is changing
    const contentSnapshot = await getDoc(contentRef);
    const currentData = contentSnapshot.data();

    await updateDoc(contentRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });

    // Handle titleId changes
    const oldTitleId = currentData?.titleId;
    const newTitleId = updates.titleId;
    const oldDatasetId = currentData?.datasetId;
    const newDatasetId = updates.datasetId;

    // If titleId changed, update both old and new title documents
    if (oldTitleId && oldDatasetId && (oldTitleId !== newTitleId || oldDatasetId !== newDatasetId)) {
      try {
        // Remove from old title
        const oldTitleRef = doc(
          db,
          "socialMediaDatasets",
          oldDatasetId,
          "titles",
          oldTitleId
        );

        const usedPostData = {
          postId: contentId,
          platform: currentData.platform,
          contentType: currentData.contentType,
          createdAt: currentData.createdAt?.toISOString?.() || new Date().toISOString(),
        };

        await updateDoc(oldTitleRef, {
          usedPosts: arrayRemove(usedPostData),
          updatedAt: serverTimestamp(),
        });

        console.log(`🗑️ Removed post ${contentId} from old title ${oldTitleId}`);
      } catch (error) {
        console.error("Eski başlık güncellenirken hata:", error);
      }
    }

    // Add to new title if titleId exists
    if (newTitleId && newDatasetId) {
      try {
        const newTitleRef = doc(
          db,
          "socialMediaDatasets",
          newDatasetId,
          "titles",
          newTitleId
        );

        const usedPostData = {
          postId: contentId,
          platform: updates.platform || currentData.platform,
          contentType: updates.contentType || currentData.contentType,
          createdAt: currentData.createdAt?.toISOString?.() || new Date().toISOString(),
        };

        await updateDoc(newTitleRef, {
          usedPosts: arrayUnion(usedPostData),
          updatedAt: serverTimestamp(),
        });

        console.log(`✅ Added post ${contentId} to new title ${newTitleId}`);
      } catch (error) {
        console.error("Yeni başlık güncellenirken hata:", error);
      }
    }

    return { success: true };
  } catch (error) {
    console.error("İçerik güncellenirken hata:", error);
    throw error;
  }
};

/**
 * Delete generated content from Firestore
 * Also removes the post from title document's usedPosts array
 */
export const deleteGeneratedContent = async (contentId) => {
  try {
    const contentRef = doc(db, GENERATED_CONTENT_COLLECTION, contentId);
    
    // Get content data before deleting to access titleId
    const contentSnapshot = await getDoc(contentRef);
    const contentData = contentSnapshot.data();

    // Delete the content
    await deleteDoc(contentRef);

    // If titleId exists, remove from title document's usedPosts
    if (contentData?.titleId && contentData?.datasetId) {
      try {
        const titleRef = doc(
          db,
          "socialMediaDatasets",
          contentData.datasetId,
          "titles",
          contentData.titleId
        );

        const usedPostData = {
          postId: contentId,
          platform: contentData.platform,
          contentType: contentData.contentType,
          createdAt: contentData.createdAt?.toISOString?.() || contentData.createdAt || new Date().toISOString(),
        };

        await updateDoc(titleRef, {
          usedPosts: arrayRemove(usedPostData),
          updatedAt: serverTimestamp(),
        });

        console.log(`🗑️ Removed post ${contentId} from title ${contentData.titleId} usedPosts`);
      } catch (titleError) {
        console.error("Başlık dosyasından post kaldırılırken hata:", titleError);
        // Don't throw, content is already deleted
      }
    }

    return { success: true };
  } catch (error) {
    console.error("İçerik silinirken hata:", error);
    throw error;
  }
};

// ==========================================
// IMAGE MANAGEMENT (Firebase Storage)
// ==========================================

/**
 * Upload image to Firebase Storage
 * Path: social-media-content/{platform}/{contentType}/{contentId}_{timestamp}_{filename}
 */
export const uploadContentImage = async (
  file,
  contentId,
  platform,
  contentType
) => {
  try {
    const timestamp = Date.now();
    const fileName = `${contentId}_${timestamp}_${file.name}`;
    const storagePath = `social-media-content/${platform}/${contentType}/${fileName}`;

    const storageRef = ref(storage, storagePath);

    // Upload file with metadata
    await uploadBytes(storageRef, file, {
      contentType: file.type,
      customMetadata: {
        contentId,
        platform,
        contentType,
        uploadedAt: new Date().toISOString(),
      },
    });

    // Get download URL
    const downloadURL = await getDownloadURL(storageRef);

    return {
      url: downloadURL,
      path: storagePath,
      fileName,
      size: file.size,
      type: file.type,
    };
  } catch (error) {
    console.error("Görsel yüklenirken hata:", error);
    throw error;
  }
};

/**
 * Delete image from Firebase Storage
 */
export const deleteContentImage = async (imagePath) => {
  try {
    const storageRef = ref(storage, imagePath);
    await deleteObject(storageRef);
    return { success: true };
  } catch (error) {
    console.error("Görsel silinirken hata:", error);
    throw error;
  }
};
