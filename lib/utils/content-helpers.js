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
