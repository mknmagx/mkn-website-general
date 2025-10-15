/**
 * Claude AI Image Analysis Service
 * Analyzes images using Claude AI to determine the best match for blog content
 */

import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Analyze a single image's relevance to blog content
 * @param {string} imageUrl - URL of the image to analyze
 * @param {string} blogTitle - Title of the blog post
 * @param {string} blogContent - Content of the blog post
 * @param {Array} blogTags - Tags associated with the blog
 * @returns {Promise<Object>} Analysis result with score and reasoning
 */
export async function analyzeImageRelevance(imageUrl, blogTitle, blogContent = '', blogTags = []) {
  try {
    const prompt = `
Analyze this image and determine how well it matches the following blog content:

Blog Title: "${blogTitle}"
Blog Content Preview: "${blogContent.substring(0, 500)}..."
Blog Tags: ${blogTags.join(', ')}

Please evaluate the image based on:
1. Visual relevance to the topic
2. Professional quality and aesthetics
3. Emotional tone match
4. Cultural appropriateness
5. Brand suitability

Provide a score from 0-100 and explain your reasoning in 2-3 sentences.

Respond in JSON format:
{
  "score": number,
  "reasoning": "string",
  "themes": ["array", "of", "visual", "themes"],
  "suitability": "high|medium|low",
  "concerns": "any concerns or empty string"
}
    `;

    const message = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 300,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "url",
                url: imageUrl
              }
            },
            {
              type: "text",
              text: prompt
            }
          ]
        }
      ]
    });

    const analysis = JSON.parse(message.content[0].text);
    return {
      score: analysis.score,
      reasoning: analysis.reasoning,
      themes: analysis.themes || [],
      suitability: analysis.suitability || 'medium',
      concerns: analysis.concerns || '',
      imageUrl
    };
  } catch (error) {
    console.error('Error analyzing image with Claude:', error);
    return {
      score: 0,
      reasoning: 'Failed to analyze image',
      themes: [],
      suitability: 'low',
      concerns: 'Analysis failed',
      imageUrl
    };
  }
}

/**
 * Analyze multiple images and return them ranked by relevance
 * @param {Array} images - Array of image objects from Pexels
 * @param {string} blogTitle - Title of the blog post
 * @param {string} blogContent - Content of the blog post
 * @param {Array} blogTags - Tags associated with the blog
 * @param {number} maxImages - Maximum number of images to analyze
 * @returns {Promise<Array>} Array of analyzed images sorted by score
 */
export async function analyzeAndRankImages(images, blogTitle, blogContent = '', blogTags = [], maxImages = 10) {
  if (!images || images.length === 0) {
    return [];
  }

  try {
    // Limit the number of images to analyze to control API costs
    const imagesToAnalyze = images.slice(0, maxImages);
    
    // Analyze images in batches of 3 to avoid rate limits
    const batchSize = 3;
    const analyzedImages = [];
    
    for (let i = 0; i < imagesToAnalyze.length; i += batchSize) {
      const batch = imagesToAnalyze.slice(i, i + batchSize);
      
      const batchPromises = batch.map(image => 
        analyzeImageRelevance(image.url, blogTitle, blogContent, blogTags)
          .then(analysis => ({
            ...image,
            analysis
          }))
      );
      
      const batchResults = await Promise.allSettled(batchPromises);
      
      batchResults.forEach(result => {
        if (result.status === 'fulfilled') {
          analyzedImages.push(result.value);
        }
      });
      
      // Small delay between batches to be respectful to API limits
      if (i + batchSize < imagesToAnalyze.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    // Sort by analysis score (highest first)
    const rankedImages = analyzedImages
      .filter(image => image.analysis && image.analysis.score > 0)
      .sort((a, b) => b.analysis.score - a.analysis.score);
    
    return rankedImages;
  } catch (error) {
    console.error('Error analyzing and ranking images:', error);
    throw error;
  }
}

/**
 * Get the best image recommendation with detailed analysis
 * @param {Array} images - Array of image objects from Pexels
 * @param {string} blogTitle - Title of the blog post
 * @param {string} blogContent - Content of the blog post
 * @param {Array} blogTags - Tags associated with the blog
 * @returns {Promise<Object>} Best image with analysis or null if none suitable
 */
export async function getBestImageRecommendation(images, blogTitle, blogContent = '', blogTags = []) {
  try {
    const rankedImages = await analyzeAndRankImages(images, blogTitle, blogContent, blogTags);
    
    if (rankedImages.length === 0) {
      return null;
    }
    
    const bestImage = rankedImages[0];
    
    // Only return if the score is above threshold and suitability is high
    if (bestImage.analysis.score >= 60 && bestImage.analysis.suitability !== 'low') {
      return {
        ...bestImage,
        recommendation: {
          confidence: bestImage.analysis.score >= 80 ? 'high' : 'medium',
          alternatives: rankedImages.slice(1, 4), // Top 3 alternatives
          totalAnalyzed: rankedImages.length
        }
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting best image recommendation:', error);
    throw error;
  }
}

/**
 * Quick image analysis for faster processing (less detailed)
 * @param {string} imageUrl - URL of the image to analyze
 * @param {string} blogTitle - Title of the blog post
 * @param {Array} blogTags - Tags associated with the blog
 * @returns {Promise<Object>} Quick analysis result
 */
export async function quickImageAnalysis(imageUrl, blogTitle, blogTags = []) {
  try {
    const prompt = `
Quickly analyze this image for the blog titled "${blogTitle}" with tags: ${blogTags.join(', ')}.

Rate from 0-100 how well it matches and respond with just a JSON:
{
  "score": number,
  "match": "excellent|good|fair|poor"
}
    `;

    const message = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 100,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "url",
                url: imageUrl
              }
            },
            {
              type: "text",
              text: prompt
            }
          ]
        }
      ]
    });

    const analysis = JSON.parse(message.content[0].text);
    return {
      score: analysis.score,
      match: analysis.match,
      imageUrl
    };
  } catch (error) {
    console.error('Error in quick image analysis:', error);
    return {
      score: 0,
      match: 'poor',
      imageUrl
    };
  }
}