/**
 * Content temizleyici utility fonksiyonları
 */

/**
 * JSON artifact'larını content'ten temizler
 * @param {string} content - Temizlenecek content
 * @returns {string} - Temizlenmiş content
 */
export function cleanContentFromJson(content) {
  if (!content || typeof content !== "string") {
    return "";
  }

  let cleaned = content;

  try {
    // Eğer content JSON string ise, içindeki actual content'i çıkar
    if (cleaned.trim().startsWith("{") && cleaned.includes('"content"')) {
      const parsed = JSON.parse(cleaned);
      if (parsed.content) {
        cleaned = parsed.content;
      }
    }
  } catch (e) {
    // JSON parse başarısız olursa, manuel temizleme yap
    console.warn("JSON parse failed, using manual cleaning");
  }

  // Manuel temizleme - JSON pattern'larını kaldır
  cleaned = cleaned
    // JSON object pattern'ini kaldır
    .replace(/^\s*\{\s*"title"[\s\S]*?"content"\s*:\s*"/, "")
    .replace(/"\s*\}\s*$/, "")

    // Escaped characters'ları düzelt
    .replace(/\\"/g, '"')
    .replace(/\\n/g, "\n")
    .replace(/\\t/g, "\t")
    .replace(/\\\\/g, "\\")

    // JSON property pattern'larını kaldır
    .replace(/^\s*"[^"]*"\s*:\s*"[^"]*".*$/gm, "")

    // Kalan JSON artifact'larını temizle
    .replace(/\{[\s\S]*?"content"\s*:\s*"/i, "")
    .replace(/"\s*,?\s*"[^"]*"\s*:\s*"[^"]*".*$/gm, "")
    .replace(/",?\s*$/, "")

    // Multiple newlines'ı normalize et
    .replace(/\n{3,}/g, "\n\n")

    // Trim whitespace
    .trim();

  return cleaned;
}

/**
 * Blog post'un tüm content'ini temizler
 * @param {Object} post - Blog post object
 * @returns {Object} - Temizlenmiş blog post
 */
export function cleanBlogPost(post) {
  if (!post) return post;

  return {
    ...post,
    content: cleanContentFromJson(post.content),
  };
}

export default {
  cleanContentFromJson,
  cleanBlogPost,
};
