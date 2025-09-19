/**
 * Converts Turkish text to ASCII URL-friendly slugs
 * @param {string} text - Text to slugify
 * @returns {string} - ASCII slug
 */
export function slugifyTr(text) {
  if (!text) return ""

  return (
    text
      .toLowerCase()
      // Turkish character replacements
      .replace(/ğ/g, "g")
      .replace(/ü/g, "u")
      .replace(/ş/g, "s")
      .replace(/ı/g, "i")
      .replace(/İ/g, "i")
      .replace(/ç/g, "c")
      .replace(/ö/g, "o")
      // Remove special characters except spaces and hyphens
      .replace(/[^\w\s-]/g, "")
      // Replace spaces with hyphens
      .replace(/\s+/g, "-")
      // Remove multiple consecutive hyphens
      .replace(/-+/g, "-")
      // Remove leading/trailing hyphens
      .replace(/^-+|-+$/g, "")
  )
}
