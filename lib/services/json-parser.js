/**
 * Simple and robust AI response parser
 * Handles JSON responses from AI APIs with maximum reliability
 */

/**
 * Parse AI response - handles any format and never fails
 * @param {string} response - Raw AI response
 * @returns {Object} Parsed blog data with required fields
 */
export function parseAiJsonResponse(response) {
  if (!response || typeof response !== "string") {
    return createDefaultBlogData(
      "Varsayılan Başlık",
      "Varsayılan içerik oluşturuldu."
    );
  }

  try {
    // Strategy 1: Try direct JSON parse (cleanest)
    const directJson = tryDirectJsonParse(response);
    if (directJson && directJson.title && directJson.content) {
      return ensureValidBlogData(directJson);
    }

    // Strategy 2: Extract JSON from markdown or mixed content
    const extractedJson = extractJsonFromResponse(response);
    if (extractedJson && extractedJson.title && extractedJson.content) {
      return ensureValidBlogData(extractedJson);
    }

    // Strategy 3: If JSON is incomplete/truncated, try to fix it
    const fixedJson = tryFixIncompleteJson(response);
    if (fixedJson && fixedJson.title && fixedJson.content) {
      return ensureValidBlogData(fixedJson);
    }

    // Strategy 4: Extract fields manually as fallback
    return extractFieldsManually(response);
  } catch (error) {
    console.warn("AI response parsing failed, using fallback:", error.message);
    return createDefaultBlogData(
      "AI Üretilen İçerik",
      response.substring(0, 1000) + "..."
    );
  }
}

/**
 * Try to parse response as direct JSON
 */
function tryDirectJsonParse(response) {
  try {
    const trimmed = response.trim();
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      return JSON.parse(trimmed);
    }
  } catch (e) {
    // Not direct JSON, continue
  }
  return null;
}

/**
 * Extract JSON from markdown or mixed content
 */
function extractJsonFromResponse(response) {
  try {
    // Remove markdown code blocks
    let cleaned = response
      .replace(/```json\s*/gi, "")
      .replace(/```\s*$/gi, "")
      .replace(/```[\s\S]*?```/gi, "");

    // Find the JSON object boundaries
    let braceCount = 0;
    let startIndex = -1;
    let endIndex = -1;

    for (let i = 0; i < cleaned.length; i++) {
      if (cleaned[i] === "{") {
        if (startIndex === -1) startIndex = i;
        braceCount++;
      } else if (cleaned[i] === "}") {
        braceCount--;
        if (braceCount === 0 && startIndex !== -1) {
          endIndex = i;
          break;
        }
      }
    }

    if (startIndex !== -1 && endIndex !== -1) {
      const jsonStr = cleaned.substring(startIndex, endIndex + 1);
      return JSON.parse(jsonStr);
    }
  } catch (e) {
    console.warn("JSON extraction failed:", e.message);
  }
  return null;
}

/**
 * Try to fix incomplete/truncated JSON
 */
function tryFixIncompleteJson(response) {
  try {
    // Extract what we can from the response
    let jsonStr = response.replace(/```json\s*/gi, "").replace(/```\s*$/gi, "");

    // Find JSON start
    const startIndex = jsonStr.indexOf("{");
    if (startIndex === -1) return null;

    jsonStr = jsonStr.substring(startIndex);

    // If JSON is incomplete, try to close it properly
    if (!jsonStr.trim().endsWith("}")) {
      // Find the last complete field
      const lastFieldMatch = jsonStr.match(/,?\s*"[^"]+"\s*:\s*"[^"]*"?[^"]*$/);
      if (lastFieldMatch) {
        const cutoffIndex = jsonStr.lastIndexOf(lastFieldMatch[0]);
        jsonStr = jsonStr.substring(0, cutoffIndex);
      }

      // Remove any trailing comma
      jsonStr = jsonStr.replace(/,\s*$/, "");

      // Close the JSON object
      if (!jsonStr.trim().endsWith("}")) {
        jsonStr += "\n}";
      }
    }

    return JSON.parse(jsonStr);
  } catch (e) {
    console.warn("JSON fix attempt failed:", e.message);
  }
  return null;
}

/**
 * Extract fields manually when JSON parsing fails completely
 */
function extractFieldsManually(response) {
  const blogData = {
    title: "",
    content: "",
    excerpt: "",
    slug: "",
    tags: "",
    category: "Genel",
  };

  // Extract title
  const titleMatches = [
    response.match(/"title"\s*:\s*"([^"]+)"/i),
    response.match(/title:\s*"([^"]+)"/i),
    response.match(/başlık:\s*"([^"]+)"/i),
  ];

  for (const match of titleMatches) {
    if (match) {
      blogData.title = match[1];
      break;
    }
  }

  // Extract excerpt
  const excerptMatches = [
    response.match(/"excerpt"\s*:\s*"([^"]+)"/i),
    response.match(/excerpt:\s*"([^"]+)"/i),
    response.match(/özet:\s*"([^"]+)"/i),
  ];

  for (const match of excerptMatches) {
    if (match) {
      blogData.excerpt = match[1];
      break;
    }
  }

  // Extract slug
  const slugMatches = [
    response.match(/"slug"\s*:\s*"([^"]+)"/i),
    response.match(/slug:\s*"([^"]+)"/i),
  ];

  for (const match of slugMatches) {
    if (match) {
      blogData.slug = match[1];
      break;
    }
  }

  // For content, extract carefully to avoid JSON contamination
  const contentMatches = [
    response.match(/"content"\s*:\s*"([\s\S]*?)"\s*[,}]/i),
    response.match(/content:\s*"([\s\S]*?)"\s*[,}]/i),
  ];

  for (const match of contentMatches) {
    if (match) {
      blogData.content = match[1]
        // Clean up escaped characters
        .replace(/\\"/g, '"')
        .replace(/\\n/g, '\n')
        .replace(/\\t/g, '\t')
        .replace(/\\\\/g, '\\');
      break;
    }
  }

  // If no content found via JSON extraction, clean the entire response
  if (!blogData.content) {
    blogData.content = cleanContentFromResponse(response);
  }

  // If still no title, generate one
  if (!blogData.title) {
    blogData.title = "AI Üretilen Blog İçeriği";
  }

  // If still no content, use a default
  if (!blogData.content) {
    blogData.content = response.substring(0, 1000);
  }

  return ensureValidBlogData(blogData);
}

/**
 * Clean content from raw response by removing JSON metadata
 */
function cleanContentFromResponse(response) {
  if (!response) return "";
  
  let cleaned = response;
  
  // Remove JSON code blocks
  cleaned = cleaned
    .replace(/```json\s*[\s\S]*?```/gi, "")
    .replace(/```[\s\S]*?```/gi, "");
  
  // Remove JSON objects at the beginning/end
  cleaned = cleaned.replace(/^\s*\{[\s\S]*?\}\s*/, "");
  cleaned = cleaned.replace(/\s*\{[\s\S]*?\}\s*$/, "");
  
  // Remove any remaining JSON-like structures
  cleaned = cleaned.replace(/\{\s*"[^"]*"\s*:\s*"[^"]*"[\s\S]*?\}/g, "");
  
  // Clean up common JSON artifacts
  cleaned = cleaned
    .replace(/"title"\s*:\s*"[^"]*"/gi, "")
    .replace(/"excerpt"\s*:\s*"[^"]*"/gi, "")
    .replace(/"slug"\s*:\s*"[^"]*"/gi, "")
    .replace(/"tags"\s*:\s*"[^"]*"/gi, "")
    .replace(/"category"\s*:\s*"[^"]*"/gi, "")
    .replace(/"content"\s*:\s*"/gi, "")
    .replace(/",?\s*$/, "");
  
  // Remove leftover braces and brackets
  cleaned = cleaned.replace(/[{}[\]]/g, "");
  
  // Clean up quotes and commas
  cleaned = cleaned.replace(/^[",\s]+|[",\s]+$/g, "");
  
  // Normalize whitespace
  cleaned = cleaned
    .replace(/\s+/g, " ")
    .replace(/\n\s*\n/g, "\n\n")
    .trim();
  
  return cleaned;
}

/**
 * Create default blog data when everything fails
 */
function createDefaultBlogData(title, content) {
  return {
    title: title || "Varsayılan Blog Başlığı",
    content: content || "Blog içeriği oluşturuldu.",
    excerpt: "Otomatik oluşturulan blog içeriği",
    slug: "varsayilan-blog",
    tags: "genel",
    category: "Genel",
  };
}

/**
 * Ensure blog data has all required fields and proper format
 */
function ensureValidBlogData(data) {
  const cleanData = {
    title: String(data.title || "Başlıksız Blog").trim(),
    content: String(data.content || "İçerik oluşturuluyor...").trim(),
    excerpt: String(data.excerpt || "").trim(),
    slug: String(data.slug || "").trim(),
    tags: String(data.tags || "").trim(),
    category: String(data.category || "Genel").trim(),
  };

  // Clean content from any remaining JSON artifacts
  cleanData.content = cleanData.content
    // Remove any JSON-like patterns that might have slipped through
    .replace(/^\s*[\{"].*?[\}"].*?:.*?$/gm, "")
    // Remove lines that look like JSON properties
    .replace(/^\s*"[^"]*"\s*:\s*"[^"]*".*$/gm, "")
    // Remove malformed JSON fragments
    .replace(/\{\s*"[^}]*$/g, "")
    .replace(/^[^}]*"\s*\}/g, "")
    // Clean up escaped characters properly
    .replace(/\\"/g, '"')
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, '\t')
    .replace(/\\\\/g, '\\')
    // Remove multiple consecutive newlines
    .replace(/\n{3,}/g, '\n\n')
    // Trim whitespace
    .trim();

  // Generate excerpt if missing
  if (!cleanData.excerpt && cleanData.content) {
    cleanData.excerpt = generateExcerpt(cleanData.content);
  }

  // Generate slug if missing
  if (!cleanData.slug && cleanData.title) {
    cleanData.slug = generateSlug(cleanData.title);
  }

  return cleanData;
}

/**
 * Generate excerpt from content
 */
function generateExcerpt(content, maxLength = 150) {
  if (!content) return "";

  // Remove HTML tags and clean up
  const cleaned = content
    .replace(/<[^>]*>/g, "")
    .replace(/\n+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (cleaned.length <= maxLength) return cleaned;

  const words = cleaned.split(" ");
  let excerpt = "";

  for (const word of words) {
    if ((excerpt + " " + word).length > maxLength) break;
    excerpt += (excerpt ? " " : "") + word;
  }

  return excerpt + "...";
}

/**
 * Generate slug from title
 */
function generateSlug(title) {
  if (!title) return "blog-post";

  return title
    .toLowerCase()
    .replace(/[ıİ]/g, "i")
    .replace(/[ğĞ]/g, "g")
    .replace(/[üÜ]/g, "u")
    .replace(/[şŞ]/g, "s")
    .replace(/[öÖ]/g, "o")
    .replace(/[çÇ]/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Legacy compatibility functions
export function validateBlogData(blogData) {
  return ensureValidBlogData(blogData);
}

export function cleanJsonString(jsonString) {
  return jsonString?.trim() || "{}";
}

export default {
  parseAiJsonResponse,
  validateBlogData,
  cleanJsonString,
};
