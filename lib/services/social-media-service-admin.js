/**
 * Social Media Service - Server-side (Firebase Admin SDK)
 * Bu servis sadece API route'larda kullanılır ve Firestore security rules'u bypass eder
 */

import { adminFirestore } from "../firebase-admin";

// Merkezi AI Model Konfigürasyonundan import
import { GEMINI_IMAGE_MODEL } from "@/lib/ai-models";

// Collection name
const GENERATED_CONTENT_COLLECTION = "social-media-content";

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
            // Keep original value if parsing fails silently
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
    return content.map((item) => cleanContentData(item, depth + 1));
  }

  // If content is a string, try to parse it
  if (typeof content === "string") {
    const str = content.trim();
    if ((str.startsWith("{") || str.startsWith("```json")) && str.length > 50) {
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
        // Keep original content if parsing fails
        return content;
      }
    }
  }

  return content;
};

/**
 * Get single generated content by ID from Firestore (Admin SDK)
 * @param {string} contentId - The ID of the content to retrieve
 * @returns {Promise<Object>} The content object with cleaned data
 */
export const getGeneratedContentByIdAdmin = async (contentId) => {
  try {
    if (!adminFirestore) {
      throw new Error("Firebase Admin SDK is not initialized");
    }

    if (!contentId) {
      throw new Error("Content ID is required");
    }

    const contentRef = adminFirestore
      .collection(GENERATED_CONTENT_COLLECTION)
      .doc(contentId);

    const contentDoc = await contentRef.get();

    if (!contentDoc.exists) {
      return null;
    }

    const data = contentDoc.data();

    // Clean content data if it contains stringified JSON
    if (data.content) {
      data.content = cleanContentData(data.content);
    }

    // Convert Firestore timestamps in aiImageSuggestions array
    if (data.aiImageSuggestions && Array.isArray(data.aiImageSuggestions)) {
      data.aiImageSuggestions = data.aiImageSuggestions.map(suggestion => ({
        ...suggestion,
        createdAt: suggestion.createdAt?.toDate
          ? suggestion.createdAt.toDate().toISOString()
          : suggestion.createdAt,
      }));
    }

    return {
      id: contentDoc.id,
      ...data,
      // Convert Firestore timestamps to ISO strings
      createdAt: data.createdAt?.toDate
        ? data.createdAt.toDate().toISOString()
        : data.createdAt,
      updatedAt: data.updatedAt?.toDate
        ? data.updatedAt.toDate().toISOString()
        : data.updatedAt,
    };
  } catch (error) {
    console.error("❌ [ADMIN] Content fetch error:", error);
    throw new Error(`Failed to fetch content: ${error.message}`);
  }
};

/**
 * Get all generated contents from Firestore (Admin SDK)
 * @param {number} limitCount - Maximum number of contents to fetch
 * @returns {Promise<Array>} Array of content objects with cleaned data
 */
export const getAllGeneratedContentsAdmin = async (limitCount = 200) => {
  try {
    if (!adminFirestore) {
      throw new Error("Firebase Admin SDK is not initialized");
    }

    const contentsRef = adminFirestore
      .collection(GENERATED_CONTENT_COLLECTION)
      .orderBy("createdAt", "desc")
      .limit(limitCount);

    const snapshot = await contentsRef.get();

    const contents = [];
    snapshot.forEach((doc) => {
      const data = doc.data();

      // Clean content data if it contains stringified JSON
      if (data.content) {
        data.content = cleanContentData(data.content);
      }

      contents.push({
        id: doc.id,
        ...data,
        // Convert Firestore timestamps to ISO strings
        createdAt: data.createdAt?.toDate
          ? data.createdAt.toDate().toISOString()
          : data.createdAt,
        updatedAt: data.updatedAt?.toDate
          ? data.updatedAt.toDate().toISOString()
          : data.updatedAt,
      });
    });

    return contents;
  } catch (error) {
    console.error("❌ [ADMIN] Contents fetch error:", error);
    throw new Error(`Failed to fetch contents: ${error.message}`);
  }
};

/**
 * Get contents by platform (Admin SDK)
 * @param {string} platform - The platform to filter by
 * @param {number} limitCount - Maximum number of contents to fetch
 * @returns {Promise<Array>} Array of content objects
 */
export const getContentsByPlatformAdmin = async (
  platform,
  limitCount = 100
) => {
  try {
    if (!adminFirestore) {
      throw new Error("Firebase Admin SDK is not initialized");
    }

    if (!platform) {
      throw new Error("Platform is required");
    }

    const contentsRef = adminFirestore
      .collection(GENERATED_CONTENT_COLLECTION)
      .where("platform", "==", platform)
      .orderBy("createdAt", "desc")
      .limit(limitCount);

    const snapshot = await contentsRef.get();

    const contents = [];
    snapshot.forEach((doc) => {
      const data = doc.data();

      if (data.content) {
        data.content = cleanContentData(data.content);
      }

      contents.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate
          ? data.createdAt.toDate().toISOString()
          : data.createdAt,
        updatedAt: data.updatedAt?.toDate
          ? data.updatedAt.toDate().toISOString()
          : data.updatedAt,
      });
    });

    return contents;
  } catch (error) {
    console.error("❌ [ADMIN] Contents by platform fetch error:", error);
    throw new Error(`Failed to fetch contents by platform: ${error.message}`);
  }
};

/**
 * Update content with AI image suggestions
 * @param {string} contentId - Content document ID
 * @param {string} imageUrl - AI generated image URL to add
 * @returns {Promise<void>}
 */
export const addAiImageSuggestionAdmin = async (contentId, imageUrl) => {
  try {
    if (!adminFirestore) {
      throw new Error("Firebase Admin SDK is not initialized");
    }

    if (!contentId || !imageUrl) {
      throw new Error("Content ID and image URL are required");
    }

    const contentRef = adminFirestore
      .collection(GENERATED_CONTENT_COLLECTION)
      .doc(contentId);

    const doc = await contentRef.get();
    
    if (!doc.exists) {
      throw new Error("Content not found");
    }

    const currentData = doc.data();
    const currentSuggestions = currentData.aiImageSuggestions || [];

    // Add new suggestion with timestamp
    const newSuggestion = {
      url: imageUrl,
      createdAt: new Date(),
      model: GEMINI_IMAGE_MODEL
    };

    await contentRef.update({
      aiImageSuggestions: [...currentSuggestions, newSuggestion],
      updatedAt: new Date(),
    });

    return true;
  } catch (error) {
    console.error("❌ [ADMIN] Add AI image suggestion error:", error);
    throw new Error(`Failed to add AI image suggestion: ${error.message}`);
  }
};
