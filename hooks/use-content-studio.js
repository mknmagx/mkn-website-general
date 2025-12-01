import { useState, useEffect } from "react";
import * as socialMediaService from "@/lib/services/social-media-service";
import { toast } from "sonner";
import { cleanContentData } from "@/lib/utils/content-helpers";

/**
 * Custom hook for Content Studio state and logic
 */
export function useContentStudio() {
  const [datasets, setDatasets] = useState([]);
  const [selectedDataset, setSelectedDataset] = useState(null);
  const [datasetTitles, setDatasetTitles] = useState([]);
  const [selectedTitle, setSelectedTitle] = useState(null);
  const [selectedPlatform, setSelectedPlatform] = useState("instagram");
  const [selectedContentType, setSelectedContentType] = useState("post");
  const [aiModel, setAiModel] = useState("claude-sonnet-4");
  const [generating, setGenerating] = useState(false);
  const [generatedContents, setGeneratedContents] = useState([]);
  const [currentPreview, setCurrentPreview] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [titleSearchTerm, setTitleSearchTerm] = useState("");
  const [loadingTitles, setLoadingTitles] = useState(false);
  const [activeTab, setActiveTab] = useState("generate");
  const [dialogOpen, setDialogOpen] = useState(false);

  // Title filters
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [contentTypeFilter, setContentTypeFilter] = useState("all");

  // Image management
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Video management
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);

  // Multiple images management (for carousel)
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  // Customization options
  const [customization, setCustomization] = useState({
    tone: "",
    customCTA: "",
    targetHashtags: [],
    length: "medium",
    includeEmoji: true,
    focusAngle: "",
    additionalContext: "",
  });
  const [showCustomization, setShowCustomization] = useState(false);
  const [editingContentId, setEditingContentId] = useState(null);

  useEffect(() => {
    loadDatasets();
    loadEditingContent();
    loadTitleFromStorage();
  }, []);

  const loadDatasets = async () => {
    try {
      const datasets = await socialMediaService.getDatasets();
      setDatasets(datasets);
    } catch (error) {
      console.error("Failed to load datasets:", error);
      toast.error("Dataset yüklenemedi");
    }
  };

  const loadDatasetTitles = async (datasetId) => {
    try {
      setLoadingTitles(true);
      const data = await socialMediaService.getDatasetById(datasetId);
      const titles = await socialMediaService.getDatasetTitles(datasetId);

      setDatasetTitles(titles);
      setSelectedDataset(data.dataset);
    } catch (error) {
      console.error("Failed to load dataset titles:", error);
      toast.error("Başlıklar yüklenemedi");
    } finally {
      setLoadingTitles(false);
    }
  };

  const loadEditingContent = () => {
    try {
      const editingContent = sessionStorage.getItem("editingContent");
      if (editingContent) {
        const loadedContent = JSON.parse(editingContent);

        let parsedContent = loadedContent.content;

        if (typeof parsedContent === "string") {
          try {
            parsedContent = JSON.parse(parsedContent);
          } catch (e) {
            // Silently handle parse errors
          }
        }

        // Load the content into state
        setGeneratedContents([
          {
            platform: loadedContent.platform,
            contentType: loadedContent.contentType,
            content: parsedContent,
            success: true,
            usedInCalendars: loadedContent.usedInCalendars || [],
          },
        ]);

        // Store the content ID for updating
        if (loadedContent.id) {
          setEditingContentId(loadedContent.id);
        }

        setSelectedPlatform(loadedContent.platform);
        setSelectedContentType(loadedContent.contentType);

        if (loadedContent.title) {
          setSelectedTitle({
            title: loadedContent.title,
            id: loadedContent.titleId,
          });
        }

        // Load customization settings if available
        if (loadedContent.customization) {
          setCustomization({
            tone: loadedContent.customization.tone || "",
            customCTA: loadedContent.customization.customCTA || "",
            targetHashtags: loadedContent.customization.targetHashtags || [],
            length: loadedContent.customization.length || "medium",
            includeEmoji:
              loadedContent.customization.includeEmoji !== undefined
                ? loadedContent.customization.includeEmoji
                : true,
            focusAngle: loadedContent.customization.focusAngle || "",
            additionalContext:
              loadedContent.customization.additionalContext || "",
          });
          setShowCustomization(true); // Özelleştirme panelini aç
        }

        // Load image or video based on type
        if (loadedContent.image) {
          const isVideo = loadedContent.image.type?.startsWith("video/");
          const isCarousel = loadedContent.image.type === "carousel";

          if (isVideo) {
            setVideoPreview(loadedContent.image.url);
            setSelectedVideo({
              preview: loadedContent.image.url,
              ...loadedContent.image,
            });
          } else if (isCarousel && loadedContent.image.images) {
            const carouselImages = loadedContent.image.images;
            setImagePreviews(carouselImages.map((img) => img.url));
            setSelectedImages(
              carouselImages.map((img) => ({
                preview: img.url,
                ...img,
              }))
            );
          } else {
            setImagePreview(loadedContent.image.url);
            setSelectedImage({
              preview: loadedContent.image.url,
              ...loadedContent.image,
            });
          }
        }

        // Also check for separate video field (for backward compatibility)
        if (loadedContent.video) {
          setVideoPreview(loadedContent.video.url);
          setSelectedVideo({
            preview: loadedContent.video.url,
            ...loadedContent.video,
          });
        }

        if (loadedContent.aiModel) {
          setAiModel(loadedContent.aiModel);
        }

        if (loadedContent.datasetId) {
          setSelectedDataset({
            id: loadedContent.datasetId,
            name: loadedContent.datasetName,
          });
        }

        setActiveTab("edit");
        setCurrentPreview(0);

        sessionStorage.removeItem("editingContent");

        toast.success("İçerik yüklendi - Düzenle sekmesine geçildi", {
          duration: 4000,
        });
      }
    } catch (error) {
      console.error("❌ Error loading editing content:", error);
      toast.error("İçerik yüklenirken hata oluştu");
    }
  };

  const loadTitleFromStorage = () => {
    try {
      const titleData = sessionStorage.getItem("contentStudioTitle");
      if (titleData) {
        const title = JSON.parse(titleData);

        // Set the title in selectedTitle state
        setSelectedTitle({
          id: title.id,
          title: title.title,
          description: title.description,
          category: title.category,
          emotionalHook: title.emotionalHook,
          trendAlignment: title.trendAlignment,
          visualPotential: title.visualPotential,
        });

        // Set platform and content type if provided
        if (title.platform) {
          setSelectedPlatform(title.platform);
        }
        if (title.contentType) {
          setSelectedContentType(title.contentType);
        }

        // Set dataset if provided
        if (title.datasetId) {
          setSelectedDataset({
            id: title.datasetId,
            name: title.datasetName || "Dataset",
          });
        }

        // Clear from session storage
        sessionStorage.removeItem("contentStudioTitle");

        toast.success("Başlık yüklendi", {
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("❌ Error loading title from storage:", error);
    }
  };

  const selectPlatform = (platformValue) => {
    setSelectedPlatform(platformValue);
    const CONTENT_TYPES = {
      instagram: [
        { value: "post", label: "Post" },
        { value: "carousel", label: "Carousel" },
        { value: "reel", label: "Reel" },
        { value: "story", label: "Story" },
      ],
      facebook: [
        { value: "post", label: "Post" },
        { value: "video", label: "Video" },
      ],
      x: [
        { value: "tweet", label: "Tweet" },
        { value: "thread", label: "Thread" },
      ],
      linkedin: [
        { value: "post", label: "Post" },
        { value: "carousel", label: "Carousel" },
      ],
    };
    const firstContentType = CONTENT_TYPES[platformValue]?.[0]?.value || "post";
    setSelectedContentType(firstContentType);
  };

  const selectContentType = (contentTypeValue) => {
    setSelectedContentType(contentTypeValue);
  };

  const handleGenerate = async () => {
    if (!selectedTitle) {
      toast.error("Lütfen bir başlık seçin");
      return;
    }

    if (!selectedPlatform || !selectedContentType) {
      toast.error("Lütfen platform ve içerik tipi seçin");
      return;
    }

    setGenerating(true);

    try {
      const data = await socialMediaService.generateContent({
        title: selectedTitle.title,
        platform: selectedPlatform,
        contentType: selectedContentType,
        aiModel,
        options: customization,
      });

      const cleanedContent = cleanContentData(data.content);

      const result = {
        platform: selectedPlatform,
        contentType: selectedContentType,
        content: cleanedContent,
        success: true,
      };

      setGeneratedContents([result]);
      setCurrentPreview(0);
      setActiveTab("edit");
      toast.success("İçerik başarıyla oluşturuldu!");
    } catch (error) {
      console.error("Generate error:", error);
      toast.error("İçerik oluşturma başarısız: " + error.message);
    } finally {
      setGenerating(false);
    }
  };

  // Helper function to upload media
  const uploadMedia = async (currentContent) => {
    let imageData = null;

    if (selectedVideo) {
      toast.info("Video yükleniyor...");
      const tempId = `temp_${Date.now()}`;
      imageData = await socialMediaService.uploadContentImage(
        selectedVideo,
        tempId,
        currentContent.platform,
        currentContent.contentType
      );
      toast.success("Video yüklendi");
    } else if (selectedImages.length > 0) {
      // Validate carousel minimum requirements
      if (
        currentContent.contentType === "carousel" &&
        selectedImages.length < 2
      ) {
        toast.error("Carousel için en az 2 görsel gereklidir");
        throw new Error("Carousel için en az 2 görsel gereklidir");
      }

      toast.info(`${selectedImages.length} görsel yükleniyor...`);
      const tempId = `temp_${Date.now()}`;

      try {
        const uploadPromises = selectedImages.map((img, idx) =>
          socialMediaService.uploadContentImage(
            img,
            `${tempId}_${idx}`,
            currentContent.platform,
            currentContent.contentType
          )
        );
        const uploadedImages = await Promise.all(uploadPromises);

        imageData = {
          type: "carousel",
          images: uploadedImages,
        };
        toast.success(`${uploadedImages.length} görsel başarıyla yüklendi`);
      } catch (error) {
        console.error("Carousel görsel yükleme hatası:", error);
        toast.error("Görseller yüklenirken hata oluştu");
        throw error;
      }
    } else if (selectedImage) {
      toast.info("Görsel yükleniyor...");
      const tempId = `temp_${Date.now()}`;
      imageData = await socialMediaService.uploadContentImage(
        selectedImage,
        tempId,
        currentContent.platform,
        currentContent.contentType
      );
      toast.success("Görsel yüklendi");
    }

    return imageData;
  };

  // Update existing content
  const handleUpdate = async () => {
    if (!generatedContents || generatedContents.length === 0) {
      toast.error("Güncellenecek içerik yok");
      return;
    }

    if (!editingContentId) {
      toast.error("Bu içerik henüz kaydedilmemiş. 'Farklı Kaydet' kullanın.");
      return;
    }

    const currentContent = generatedContents[currentPreview];
    if (!currentContent) return;

    try {
      const imageData = await uploadMedia(currentContent);

      const payload = {
        platform: currentContent.platform,
        contentType: currentContent.contentType,
        content: currentContent.content,
        aiModel,
        image: imageData,
        datasetId: selectedDataset?.id,
        datasetName: selectedDataset?.name,
        title: selectedTitle?.title,
        titleId: selectedTitle?.id,
        customization: customization, // Özelleştirme ayarları güncelleniyor
      };

      await socialMediaService.updateGeneratedContent(
        editingContentId,
        payload
      );
      toast.success("İçerik başarıyla güncellendi!");
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Güncelleme başarısız: " + error.message);
    }
  };

  // Save as new content
  const handleSaveAsNew = async () => {
    if (!generatedContents || generatedContents.length === 0) {
      toast.error("Kaydedilecek içerik yok");
      return;
    }

    const currentContent = generatedContents[currentPreview];
    if (!currentContent) return;

    try {
      const imageData = await uploadMedia(currentContent);

      const payload = {
        platform: currentContent.platform,
        contentType: currentContent.contentType,
        content: currentContent.content,
        aiModel,
        image: imageData,
        datasetId: selectedDataset?.id,
        datasetName: selectedDataset?.name,
        title: selectedTitle?.title,
        titleId: selectedTitle?.id,
        customization: customization, // Özelleştirme ayarları kaydediliyor
      };

      const result = await socialMediaService.saveGeneratedContent(payload);

      // Update editingContentId so user can continue updating
      if (result?.id) {
        setEditingContentId(result.id);
      }

      toast.success("Yeni içerik kütüphaneye kaydedildi!");
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Kaydetme başarısız: " + error.message);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Panoya kopyalandı!");
  };

  const handleExport = () => {
    const currentContent = generatedContents[currentPreview];
    const exportData = {
      platform: currentContent.platform,
      contentType: currentContent.contentType,
      content: currentContent.content,
      exportedAt: new Date().toISOString(),
    };
    navigator.clipboard.writeText(JSON.stringify(exportData, null, 2));
    toast.success("İçerik JSON formatında panoya kopyalandı!");
  };

  return {
    // State
    datasets,
    selectedDataset,
    datasetTitles,
    selectedTitle,
    selectedPlatform,
    selectedContentType,
    aiModel,
    generating,
    generatedContents,
    currentPreview,
    searchTerm,
    titleSearchTerm,
    loadingTitles,
    activeTab,
    dialogOpen,
    categoryFilter,
    platformFilter,
    contentTypeFilter,
    selectedImage,
    imagePreview,
    selectedVideo,
    videoPreview,
    selectedImages,
    imagePreviews,
    customization,
    showCustomization,

    // Setters
    setDatasets,
    setSelectedDataset,
    setDatasetTitles,
    setSelectedTitle,
    setSelectedPlatform,
    setSelectedContentType,
    setAiModel,
    setGenerating,
    setGeneratedContents,
    setCurrentPreview,
    setSearchTerm,
    setTitleSearchTerm,
    setLoadingTitles,
    setActiveTab,
    setDialogOpen,
    setCategoryFilter,
    setPlatformFilter,
    setContentTypeFilter,
    setSelectedImage,
    setImagePreview,
    setSelectedVideo,
    setVideoPreview,
    setSelectedImages,
    setImagePreviews,
    setCustomization,
    setShowCustomization,

    // Actions
    loadDatasets,
    loadDatasetTitles,
    loadEditingContent,
    selectPlatform,
    selectContentType,
    handleGenerate,
    handleUpdate,
    handleSaveAsNew,
    handleCopy,
    handleExport,
    editingContentId,
  };
}
