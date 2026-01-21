/**
 * Helper function to clean and parse content data (recursive)
 * Cleans JSON strings and nested objects
 */
export const cleanContentData = (content, depth = 0) => {
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
        console.warn("Could not parse stringified content:", e.message);
        return content;
      }
    }
  }

  return content;
};

/**
 * Normalize Instagram post content to expected format
 * Handles various AI response structures and maps them to UI format
 */
export const normalizeInstagramPostContent = (content) => {
  if (!content) return content;
  
  // If already in correct format
  if (content.hook && content.fullCaption) {
    return content;
  }
  
  // Handle nested instagram_post structure
  const source = content.instagram_post || content;
  
  const normalized = { ...source };
  
  // Map caption structure to expected fields
  if (source.caption && typeof source.caption === 'object') {
    // Build fullCaption from caption parts
    const parts = [];
    if (source.caption.headline) parts.push(source.caption.headline);
    if (source.caption.body) parts.push(source.caption.body);
    if (source.caption.call_to_action) parts.push(source.caption.call_to_action);
    
    normalized.fullCaption = parts.join('\n\n');
    normalized.hook = source.caption.headline || source.caption.hook || normalized.fullCaption?.substring(0, 125);
  }
  
  // Map visual_style to visualSuggestions
  if (source.visual_style && !source.visualSuggestions) {
    normalized.visualSuggestions = {
      primary: source.visual_style.description || source.visual_style.text_overlay,
      alternative: source.visual_style.type,
      carouselIdea: null
    };
  }
  
  // Map hashtags array to hashtagStrategy
  if (source.hashtags && Array.isArray(source.hashtags) && !source.hashtagStrategy) {
    normalized.hashtagStrategy = {
      hashtags: source.hashtags,
      rationale: "AI tarafından seçildi"
    };
  }
  
  // Map story_idea to storyIdea
  if (source.story_idea && !source.storyIdea) {
    normalized.storyIdea = source.story_idea;
  }
  
  // Ensure hook exists
  if (!normalized.hook && normalized.fullCaption) {
    normalized.hook = normalized.fullCaption.substring(0, 125);
  }
  
  return normalized;
};

/**
 * Normalize content based on platform and content type
 */
export const normalizeContent = (content, platform, contentType) => {
  if (!content) return content;
  
  // Apply platform-specific normalization
  if (platform === 'instagram' && contentType === 'post') {
    return normalizeInstagramPostContent(content);
  }
  
  // Add more normalizers for other platforms/content types as needed
  // if (platform === 'facebook' && contentType === 'post') {
  //   return normalizeFacebookPostContent(content);
  // }
  
  return content;
};

/**
 * Export content to clipboard as JSON
 */
export const exportContentToClipboard = (content, platform, contentType) => {
  const exportData = {
    platform,
    contentType,
    content,
    exportedAt: new Date().toISOString(),
  };

  navigator.clipboard.writeText(JSON.stringify(exportData, null, 2));
};
