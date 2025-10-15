import { NextResponse } from 'next/server';
import { searchPexelsImages, searchMultiplePexelsTerms, generateImageSearchTerms } from '@/lib/services/pexels';
import { getBestImageRecommendation, quickImageAnalysis } from '@/lib/services/claude-image-analysis';
import { generateEnhancedSearchTerms, generateSpecificQueries } from '@/lib/services/enhanced-search';

/**
 * Smart Image Selection API
 * Combines Pexels image search with optional Claude AI analysis
 */
export async function POST(request) {
  try {
    const { 
      blogTitle, 
      blogContent = '', 
      blogTags = [], 
      searchQuery = '',
      maxImages = 20,
      analysisMode = 'none' // 'none', 'quick', or 'full'
    } = await request.json();

    if (!blogTitle && !searchQuery) {
      return NextResponse.json(
        { error: 'Blog title or search query is required' },
        { status: 400 }
      );
    }

    // Step 1: Generate search terms with enhanced algorithm
    let searchTerms = [];
    if (searchQuery) {
      // If user provided search query, use it as primary
      searchTerms = [searchQuery];
      if (blogTitle) {
        // Add some enhanced terms as backup
        const enhancedTerms = generateEnhancedSearchTerms(blogTitle, blogContent, blogTags);
        searchTerms.push(...enhancedTerms.slice(0, 2));
      }
    } else {
      // Use enhanced search term generation
      const specificQueries = generateSpecificQueries(blogTitle, blogContent, blogTags);
      const enhancedTerms = generateEnhancedSearchTerms(blogTitle, blogContent, blogTags);
      
      // Combine specific queries with enhanced terms
      searchTerms = [...specificQueries, ...enhancedTerms];
      
      // Remove duplicates and limit
      searchTerms = [...new Set(searchTerms)].slice(0, 6);
    }

    console.log('Enhanced search terms:', searchTerms);

    if (searchTerms.length === 0) {
      searchTerms = ['cosmetics', 'manufacturing']; // Fallback terms
    }

    // Step 2: Search for images on Pexels using multiple strategies
    let allImages = [];

    // Strategy 1: Use specific queries first
    if (searchTerms.length > 0) {
      try {
        const images = await searchMultiplePexelsTerms(searchTerms, {
          maxImagesPerTerm: Math.ceil(maxImages / searchTerms.length),
          orientation: 'landscape',
          size: 'large'
        });
        allImages.push(...images);
      } catch (error) {
        console.error('Multi-term search failed:', error);
      }
    }

    // Strategy 2: If we don't have enough images, try individual key terms
    if (allImages.length < 10 && blogTitle) {
      try {
        const fallbackTerms = ['cosmetics', 'manufacturing', 'beauty', 'production'];
        for (const term of fallbackTerms) {
          if (allImages.length >= maxImages) break;
          
          const images = await searchPexelsImages(term, {
            perPage: 10,
            orientation: 'landscape',
            size: 'large'
          });
          
          // Add images that aren't already in our collection
          const newImages = images.filter(img => 
            !allImages.some(existing => existing.id === img.id)
          );
          allImages.push(...newImages);
        }
      } catch (error) {
        console.error('Fallback search failed:', error);
      }
    }

    if (allImages.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No images found for the given criteria. Try different search terms.',
        searchTerms,
        images: []
      });
    }

    // Remove duplicates and limit results
    const uniqueImages = allImages.filter((img, index, self) => 
      index === self.findIndex(t => t.id === img.id)
    );
    
    console.log(`Found ${uniqueImages.length} unique images from Pexels`);

    let result = {
      success: true,
      images: uniqueImages.slice(0, maxImages),
      searchTerms,
      totalImagesFound: uniqueImages.length,
      analysisMode: 'none',
      bestImage: null
    };

    // Step 3: Optional AI analysis (only if explicitly requested)
    if (analysisMode === 'quick' && uniqueImages.length > 0) {
      try {
        // Quick analysis of top 5 images only
        const topImages = uniqueImages.slice(0, 5);
        const analysisPromises = topImages.map(async (image) => {
          try {
            const analysis = await quickImageAnalysis(image.url, blogTitle, blogTags);
            return { ...image, analysis };
          } catch (error) {
            console.error(`Analysis failed for image ${image.id}:`, error);
            return image; // Return image without analysis
          }
        });

        const analyzedImages = await Promise.allSettled(analysisPromises);
        const validAnalyzedImages = analyzedImages
          .filter(result => result.status === 'fulfilled')
          .map(result => result.value)
          .filter(img => img.analysis && img.analysis.score > 0);

        if (validAnalyzedImages.length > 0) {
          // Sort by score and get best
          validAnalyzedImages.sort((a, b) => b.analysis.score - a.analysis.score);
          result.bestImage = validAnalyzedImages[0];
          result.analysisMode = 'quick';
          
          // Mix analyzed images with regular images
          const nonAnalyzedImages = uniqueImages.slice(5);
          result.images = [...validAnalyzedImages, ...nonAnalyzedImages].slice(0, maxImages);
        }
      } catch (analysisError) {
        console.error('Quick analysis failed:', analysisError);
        // Continue without analysis
      }
    } else if (analysisMode === 'full' && uniqueImages.length > 0) {
      try {
        // Full analysis with detailed recommendations
        const bestImage = await getBestImageRecommendation(
          uniqueImages.slice(0, 10), // Analyze top 10 images only
          blogTitle, 
          blogContent, 
          blogTags
        );
        
        if (bestImage) {
          result.bestImage = bestImage;
          result.analysisMode = 'full';
        }
      } catch (analysisError) {
        console.error('Full analysis failed:', analysisError);
        // Continue without analysis
      }
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('Smart image selection error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to process image selection',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

/**
 * GET method for simple searches
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const count = parseInt(searchParams.get('count') || '20');
    
    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter "q" is required' },
        { status: 400 }
      );
    }

    // Simple search without AI analysis
    const images = await searchPexelsImages(query, {
      perPage: Math.min(count, 50), // Pexels limit
      orientation: 'landscape'
    });

    return NextResponse.json({
      success: true,
      query,
      images,
      count: images.length
    });

  } catch (error) {
    console.error('Image search error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to search images',
        details: error.message 
      },
      { status: 500 }
    );
  }
}