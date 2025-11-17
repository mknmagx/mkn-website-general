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

/**
 * Category name to URL slug mapping for SEO-friendly URLs
 */
const CATEGORY_SLUG_MAP = {
  "Disc Top Kapaklar": "disc-top-kapaklar",
  "Krem Pompalar": "krem-pompalar",
  "Losyon Pompaları": "losyon-pompalari",
  "Sprey Pompalar": "sprey-pompalar",
  "Köpük Pompalar": "kopuk-pompalar",
  "Aseton Kapakları": "aseton-kapaklari",
  "Airless Şişeler": "airless-siseler",
  "Parmak Losyon Pompaları": "parmak-losyon-pompalari",
};

/**
 * Converts category name to URL-friendly slug
 * @param {string} categoryName - Category name in Turkish
 * @returns {string} - URL-friendly category slug
 */
export function createCategorySlug(categoryName) {
  if (!categoryName) return "";

  // Check if category has a predefined mapping
  if (CATEGORY_SLUG_MAP[categoryName]) {
    return CATEGORY_SLUG_MAP[categoryName];
  }

  // Fallback to automatic slugification
  return slugifyTr(categoryName);
}

/**
 * Converts URL slug back to category name
 * @param {string} slug - URL slug
 * @returns {string|null} - Category name or null if not found
 */
export function getCategoryFromSlug(slug) {
  if (!slug) return null;

  // Find category by matching slug
  const entry = Object.entries(CATEGORY_SLUG_MAP).find(
    ([_, categorySlug]) => categorySlug === slug
  );

  return entry ? entry[0] : null;
}

/**
 * Get all valid category slugs for static generation
 * @returns {string[]} - Array of category slugs
 */
export function getAllCategorySlugs() {
  return Object.values(CATEGORY_SLUG_MAP);
}

/**
 * Get all category names and their slugs
 * @returns {Object} - Object with category names as keys and slugs as values
 */
export function getCategorySlugMap() {
  return { ...CATEGORY_SLUG_MAP };
}
