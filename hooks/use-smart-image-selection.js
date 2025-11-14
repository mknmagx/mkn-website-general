import { useState, useCallback, useRef } from "react";

/**
 * Smart Image Selection Hook
 * Combines Pexels image search with Claude AI analysis for intelligent image selection
 */
export function useSmartImageSelection() {
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [bestImage, setBestImage] = useState(null);
  const [error, setError] = useState(null);
  const [searchTerms, setSearchTerms] = useState([]);
  const abortControllerRef = useRef(null);

  /**
   * Search and analyze images for blog content
   */
  const searchSmartImages = useCallback(async (options = {}) => {
    const {
      blogTitle,
      blogContent = "",
      blogTags = [],
      searchQuery = "",
      maxImages = 20,
      analysisMode = "quick",
    } = options;

    // Abort any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    setError(null);
    setImages([]);
    setBestImage(null);
    setSearchTerms([]);

    try {
      const response = await fetch("/api/smart-image-selection", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          blogTitle,
          blogContent,
          blogTags,
          searchQuery,
          maxImages,
          analysisMode,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to search images");
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Image search was not successful");
      }

      setImages(data.images || []);
      setBestImage(data.bestImage);
      setSearchTerms(data.searchTerms || []);

      return data;
    } catch (error) {
      if (error.name === "AbortError") {
        // Aborted search - no action needed
        return null;
      }

      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, []);

  /**
   * Simple image search without AI analysis
   */
  const searchImages = useCallback(async (query, count = 20) => {
    setIsLoading(true);
    setError(null);
    setImages([]);
    setBestImage(null);
    setSearchTerms([query]);

    try {
      const response = await fetch(
        `/api/smart-image-selection?q=${encodeURIComponent(
          query
        )}&count=${count}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to search images");
      }

      const data = await response.json();
      setImages(data.images || []);
      return data.images;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Cancel ongoing search
   */
  const cancelSearch = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  /**
   * Clear all results
   */
  const clearResults = useCallback(() => {
    setImages([]);
    setBestImage(null);
    setError(null);
    setSearchTerms([]);
  }, []);

  /**
   * Select a specific image as the chosen one
   */
  const selectImage = useCallback(
    (imageId) => {
      const selectedImage = images.find((img) => img.id === imageId);
      if (selectedImage) {
        setBestImage(selectedImage);
        return selectedImage;
      }
      return null;
    },
    [images]
  );

  /**
   * Get image by ID
   */
  const getImageById = useCallback(
    (imageId) => {
      return images.find((img) => img.id === imageId) || null;
    },
    [images]
  );

  return {
    // State
    isLoading,
    images,
    bestImage,
    error,
    searchTerms,

    // Actions
    searchSmartImages,
    searchImages,
    cancelSearch,
    clearResults,
    selectImage,

    // Helpers
    getImageById,

    // Computed values
    hasResults: images.length > 0,
    hasError: !!error,
    totalImages: images.length,
  };
}
