/**
 * Pexels API Integration Service
 * Handles image search and retrieval from Pexels
 */

const PEXELS_API_KEY = process.env.PEXELS_API_KEY;
const PEXELS_BASE_URL = 'https://api.pexels.com/v1';

/**
 * Search for images on Pexels based on query
 * @param {string} query - Search query for images
 * @param {number} perPage - Number of images to fetch (default: 20, max: 80)
 * @param {string} orientation - Image orientation (landscape, portrait, square)
 * @param {string} size - Image size (large, medium, small)
 * @returns {Promise<Array>} Array of image objects
 */
export async function searchPexelsImages(query, options = {}) {
  if (!PEXELS_API_KEY) {
    throw new Error('Pexels API key is not configured');
  }

  const {
    perPage = 20,
    orientation = 'landscape',
    size = 'large',
    category = null,
    color = null
  } = options;

  try {
    const params = new URLSearchParams({
      query: query,
      per_page: Math.min(perPage, 80), // Pexels max is 80
      orientation: orientation,
      size: size
    });

    if (category) params.append('category', category);
    if (color) params.append('color', color);

    const response = await fetch(`${PEXELS_BASE_URL}/search?${params}`, {
      headers: {
        'Authorization': PEXELS_API_KEY,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Pexels API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Transform Pexels response to our format
    return data.photos.map(photo => ({
      id: photo.id,
      url: photo.src.large2x, // High quality version
      mediumUrl: photo.src.large,
      smallUrl: photo.src.medium,
      thumbnailUrl: photo.src.small,
      alt: photo.alt || `Image by ${photo.photographer}`,
      photographer: photo.photographer,
      photographerUrl: photo.photographer_url,
      width: photo.width,
      height: photo.height,
      avgColor: photo.avg_color,
      pexelsUrl: photo.url
    }));
  } catch (error) {
    console.error('Error searching Pexels images:', error);
    throw error;
  }
}

/**
 * Get curated images from Pexels
 * @param {number} perPage - Number of images to fetch
 * @param {number} page - Page number
 * @returns {Promise<Array>} Array of curated image objects
 */
export async function getCuratedPexelsImages(perPage = 20, page = 1) {
  if (!PEXELS_API_KEY) {
    throw new Error('Pexels API key is not configured');
  }

  try {
    const params = new URLSearchParams({
      per_page: Math.min(perPage, 80),
      page: page
    });

    const response = await fetch(`${PEXELS_BASE_URL}/curated?${params}`, {
      headers: {
        'Authorization': PEXELS_API_KEY,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Pexels API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    return data.photos.map(photo => ({
      id: photo.id,
      url: photo.src.large2x,
      mediumUrl: photo.src.large,
      smallUrl: photo.src.medium,
      thumbnailUrl: photo.src.small,
      alt: photo.alt || `Image by ${photo.photographer}`,
      photographer: photo.photographer,
      photographerUrl: photo.photographer_url,
      width: photo.width,
      height: photo.height,
      avgColor: photo.avg_color,
      pexelsUrl: photo.url
    }));
  } catch (error) {
    console.error('Error getting curated Pexels images:', error);
    throw error;
  }
}

/**
 * Generate search terms based on blog content
 * @param {string} title - Blog title
 * @param {string} content - Blog content
 * @param {Array} tags - Blog tags
 * @returns {Array} Array of search terms
 */
export function generateImageSearchTerms(title, content = '', tags = []) {
  const searchTerms = [];
  
  // Turkish to English keyword mapping for better Pexels results
  const turkishToEnglish = {
    'kozmetik': 'cosmetics',
    'ambalaj': 'packaging',
    'üretim': 'manufacturing',
    'fason': 'contract manufacturing',
    'ürün': 'product',
    'kalite': 'quality',
    'fabrika': 'factory',
    'endüstri': 'industry',
    'teknoloji': 'technology',
    'inovasyon': 'innovation',
    'sürdürülebilir': 'sustainable',
    'çevre': 'environment',
    'doğal': 'natural',
    'organik': 'organic',
    'güzellik': 'beauty',
    'bakım': 'skincare',
    'makyaj': 'makeup',
    'parfüm': 'perfume',
    'krem': 'cream',
    'şampuan': 'shampoo',
    'sabun': 'soap',
    'temizlik': 'cleaning',
    'hijyen': 'hygiene',
    'sağlık': 'health',
    'welness': 'wellness',
    'spa': 'spa',
    'profesyonel': 'professional',
    'uzman': 'expert',
    'deneyim': 'experience',
    'hizmet': 'service',
    'çözüm': 'solution',
    'modern': 'modern',
    'gelişmiş': 'advanced',
    'yenilik': 'innovation',
    'araştırma': 'research',
    'geliştirme': 'development',
    'laboratuvar': 'laboratory',
    'test': 'testing',
    'analiz': 'analysis',
    'kontrol': 'control',
    'standart': 'standard',
    'sertifika': 'certificate',
    'iso': 'iso',
    'gmp': 'gmp',
    'haccp': 'haccp'
  };

  // Extract and translate keywords from title
  if (title) {
    const titleWords = title
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2);

    // Add both Turkish and English versions
    titleWords.forEach(word => {
      if (word.length > 3) {
        searchTerms.push(word);
        if (turkishToEnglish[word]) {
          searchTerms.push(turkishToEnglish[word]);
        }
      }
    });
  }

  // Add translated tags
  tags.forEach(tag => {
    const cleanTag = tag.toLowerCase().trim();
    searchTerms.push(cleanTag);
    if (turkishToEnglish[cleanTag]) {
      searchTerms.push(turkishToEnglish[cleanTag]);
    }
  });

  // Add general cosmetic/manufacturing terms if relevant
  const generalTerms = [];
  const titleLower = title.toLowerCase();
  
  if (titleLower.includes('kozmetik') || titleLower.includes('güzellik')) {
    generalTerms.push('cosmetics', 'beauty products', 'skincare');
  }
  if (titleLower.includes('ambalaj') || titleLower.includes('paket')) {
    generalTerms.push('packaging', 'containers', 'bottles');
  }
  if (titleLower.includes('üretim') || titleLower.includes('fabrika')) {
    generalTerms.push('manufacturing', 'factory', 'production');
  }
  if (titleLower.includes('doğal') || titleLower.includes('organik')) {
    generalTerms.push('natural', 'organic', 'eco-friendly');
  }
  if (titleLower.includes('teknoloji') || titleLower.includes('modern')) {
    generalTerms.push('technology', 'modern', 'innovation');
  }

  searchTerms.push(...generalTerms);

  // Remove duplicates and return top terms
  const uniqueTerms = [...new Set(searchTerms)].filter(term => term.length > 2);
  
  // Prioritize English terms for better Pexels results
  const englishTerms = uniqueTerms.filter(term => /^[a-zA-Z\s]+$/.test(term));
  const turkishTerms = uniqueTerms.filter(term => !/^[a-zA-Z\s]+$/.test(term));
  
  return [...englishTerms, ...turkishTerms].slice(0, 8);
}

/**
 * Search images with multiple terms and combine results
 * @param {Array} searchTerms - Array of search terms
 * @param {Object} options - Search options
 * @returns {Promise<Array>} Combined array of images
 */
export async function searchMultiplePexelsTerms(searchTerms, options = {}) {
  const { maxImagesPerTerm = 10, ...searchOptions } = options;
  
  try {
    const searchPromises = searchTerms.slice(0, 5).map(term => 
      searchPexelsImages(term, { 
        ...searchOptions, 
        perPage: maxImagesPerTerm 
      })
    );
    
    const results = await Promise.allSettled(searchPromises);
    
    const allImages = [];
    results.forEach(result => {
      if (result.status === 'fulfilled' && result.value) {
        allImages.push(...result.value);
      }
    });
    
    // Remove duplicates based on image ID
    const uniqueImages = allImages.filter((image, index, self) => 
      index === self.findIndex(img => img.id === image.id)
    );
    
    return uniqueImages;
  } catch (error) {
    console.error('Error searching multiple Pexels terms:', error);
    throw error;
  }
}