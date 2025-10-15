/**
 * Enhanced Image Search Service
 * Better keyword extraction and search term generation for Pexels
 */

/**
 * Enhanced search term generator with industry-specific keywords
 */
export function generateEnhancedSearchTerms(title, content = '', tags = []) {
  // Comprehensive Turkish to English mapping for cosmetic industry
  const cosmeticKeywords = {
    // Product types
    'kozmetik': ['cosmetics', 'beauty products', 'makeup'],
    'makyaj': ['makeup', 'cosmetics', 'beauty'],
    'parfüm': ['perfume', 'fragrance', 'scent'],
    'krem': ['cream', 'moisturizer', 'skincare'],
    'serum': ['serum', 'skincare', 'beauty treatment'],
    'şampuan': ['shampoo', 'hair care', 'hair products'],
    'sabun': ['soap', 'cleanser', 'hygiene'],
    'tonik': ['toner', 'skincare', 'beauty'],
    'maske': ['mask', 'face mask', 'skincare'],
    'güneş kremi': ['sunscreen', 'sun protection', 'skincare'],
    
    // Manufacturing & Business
    'üretim': ['manufacturing', 'production', 'factory'],
    'fason': ['contract manufacturing', 'private label', 'manufacturing'],
    'ambalaj': ['packaging', 'containers', 'bottles'],
    'fabrika': ['factory', 'manufacturing plant', 'production facility'],
    'kalite': ['quality', 'standards', 'testing'],
    'laboratuvar': ['laboratory', 'testing facility', 'research'],
    'ar-ge': ['research development', 'innovation', 'technology'],
    'teknoloji': ['technology', 'innovation', 'modern'],
    'makine': ['machinery', 'equipment', 'manufacturing equipment'],
    'otomasyon': ['automation', 'modern manufacturing', 'technology'],
    
    // Ingredients & Features
    'doğal': ['natural', 'organic', 'botanical'],
    'organik': ['organic', 'natural', 'eco-friendly'],
    'vegan': ['vegan', 'cruelty-free', 'plant-based'],
    'sürdürülebilir': ['sustainable', 'eco-friendly', 'green'],
    'çevre dostu': ['eco-friendly', 'sustainable', 'green'],
    'kimyasal': ['chemical', 'ingredients', 'formulation'],
    'vitamin': ['vitamin', 'nutrients', 'skincare'],
    'mineral': ['mineral', 'natural ingredients', 'skincare'],
    'antiaging': ['anti-aging', 'skincare', 'youth'],
    'nemlendirici': ['moisturizing', 'hydrating', 'skincare'],
    
    // Business terms
    'ihracat': ['export', 'international', 'global'],
    'marka': ['brand', 'branding', 'company'],
    'hizmet': ['service', 'customer service', 'professional'],
    'danışmanlık': ['consulting', 'advisory', 'expertise'],
    'çözüm': ['solution', 'problem solving', 'innovation'],
    'deneyim': ['experience', 'expertise', 'professional'],
    'uzman': ['expert', 'specialist', 'professional'],
    'sertifika': ['certificate', 'certification', 'standards'],
    'iso': ['ISO certification', 'standards', 'quality'],
    'gmp': ['GMP', 'manufacturing standards', 'quality'],
    
    // Visual concepts
    'modern': ['modern', 'contemporary', 'sleek'],
    'gelişmiş': ['advanced', 'sophisticated', 'high-tech'],
    'yenilik': ['innovation', 'breakthrough', 'cutting edge'],
    'hijyen': ['hygiene', 'cleanliness', 'sanitary'],
    'temizlik': ['cleaning', 'cleanliness', 'fresh'],
    'güzellik': ['beauty', 'aesthetics', 'beautiful'],
    'bakım': ['care', 'treatment', 'maintenance'],
    'sağlık': ['health', 'wellness', 'healthy'],
    'wellness': ['wellness', 'wellbeing', 'health'],
    'spa': ['spa', 'relaxation', 'wellness']
  };

  const searchTerms = new Set();
  
  // Extract keywords from title
  if (title) {
    const titleLower = title.toLowerCase();
    
    // Direct keyword mapping
    Object.entries(cosmeticKeywords).forEach(([turkish, englishArray]) => {
      if (titleLower.includes(turkish)) {
        englishArray.forEach(eng => searchTerms.add(eng));
      }
    });
    
    // Extract individual words
    const words = titleLower
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3);
    
    words.forEach(word => {
      if (cosmeticKeywords[word]) {
        cosmeticKeywords[word].forEach(eng => searchTerms.add(eng));
      } else if (word.length > 4) {
        searchTerms.add(word); // Keep longer Turkish words
      }
    });
  }
  
  // Process tags
  tags.forEach(tag => {
    const tagLower = tag.toLowerCase().trim();
    if (cosmeticKeywords[tagLower]) {
      cosmeticKeywords[tagLower].forEach(eng => searchTerms.add(eng));
    } else {
      searchTerms.add(tagLower);
    }
  });
  
  // Add contextual terms based on content analysis
  const contentLower = (title + ' ' + content).toLowerCase();
  
  const contextualTerms = [];
  
  // Manufacturing context
  if (/üretim|fason|fabrika|makine|otomasyon/.test(contentLower)) {
    contextualTerms.push('manufacturing', 'factory', 'production line', 'industrial');
  }
  
  // Beauty/cosmetic context
  if (/kozmetik|güzellik|bakım|makyaj/.test(contentLower)) {
    contextualTerms.push('beauty', 'cosmetics', 'skincare', 'makeup artist');
  }
  
  // Quality/lab context
  if (/kalite|laboratuvar|test|analiz/.test(contentLower)) {
    contextualTerms.push('laboratory', 'quality control', 'testing', 'research');
  }
  
  // Natural/organic context
  if (/doğal|organik|vegan|sürdürülebilir/.test(contentLower)) {
    contextualTerms.push('natural', 'organic', 'eco-friendly', 'sustainable');
  }
  
  // Technology context
  if (/teknoloji|modern|gelişmiş|inovasyon/.test(contentLower)) {
    contextualTerms.push('technology', 'innovation', 'modern', 'advanced');
  }
  
  contextualTerms.forEach(term => searchTerms.add(term));
  
  // Convert to array and prioritize English terms
  const allTerms = Array.from(searchTerms);
  const englishTerms = allTerms.filter(term => /^[a-zA-Z\s-]+$/.test(term));
  const otherTerms = allTerms.filter(term => !/^[a-zA-Z\s-]+$/.test(term));
  
  // Return prioritized list (English first, most relevant)
  return [...englishTerms, ...otherTerms].slice(0, 8);
}

/**
 * Generate specific search queries for different aspects
 */
export function generateSpecificQueries(title, content = '', tags = []) {
  const queries = [];
  const contentLower = (title + ' ' + content).toLowerCase();
  
  // Primary search based on main topic
  const mainTerms = generateEnhancedSearchTerms(title, content, tags);
  if (mainTerms.length > 0) {
    queries.push(mainTerms.slice(0, 3).join(' ')); // Combine top 3 terms
  }
  
  // Specific industry queries
  if (/kozmetik|güzellik|makyaj/.test(contentLower)) {
    queries.push('cosmetics manufacturing');
    queries.push('beauty products');
    queries.push('makeup cosmetics');
  }
  
  if (/ambalaj/.test(contentLower)) {
    queries.push('cosmetic packaging');
    queries.push('beauty product containers');
    queries.push('bottles packaging');
  }
  
  if (/üretim|fason/.test(contentLower)) {
    queries.push('manufacturing facility');
    queries.push('production line');
    queries.push('factory equipment');
  }
  
  if (/doğal|organik/.test(contentLower)) {
    queries.push('natural cosmetics');
    queries.push('organic beauty');
    queries.push('natural ingredients');
  }
  
  if (/teknoloji|modern/.test(contentLower)) {
    queries.push('modern manufacturing');
    queries.push('technology innovation');
    queries.push('advanced equipment');
  }
  
  // Quality and lab terms
  if (/kalite|laboratuvar|test/.test(contentLower)) {
    queries.push('laboratory testing');
    queries.push('quality control');
    queries.push('research facility');
  }
  
  // Remove duplicates and return top queries
  return [...new Set(queries)].slice(0, 5);
}