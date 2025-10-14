/**
 * Converts Turkish text to ASCII URL-friendly slugs
 * @param {string} text - Text to slugify
 * @returns {string} - ASCII slug
 */
export function slugifyTr(text) {
  if (!text) return "";

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
  );
}

/**
 * Creates a unique product slug by combining name, size/ml information and product code
 * @param {Object} product - Product object with name, size and code properties
 * @returns {string} - Unique product slug
 */
export function createProductSlug(product) {
  if (!product || !product.name) return "";

  let slug = slugifyTr(product.name);

  const size = product.specifications?.size || product.size;
  if (size) {
    const sizeFormatted = size
      .toString()
      .toLowerCase()
      .replace(/[\/\s]/g, "")
      .replace(/ml/g, "-ml");
    slug = `${slug}-${sizeFormatted}`;
  }

  const code = product.specifications?.code || product.code;
  if (code) {
    const codeSlug = slugifyTr(code);
    slug = `${slug}-${codeSlug}`;
  }

  return slug;
}
