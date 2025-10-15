/**
 * JSON parsing utilities for AI responses
 * Handles cleaning and parsing of AI-generated JSON with markdown content
 */

/**
 * Clean JSON string from AI response
 * Removes control characters and properly escapes string content
 * @param {string} jsonString - Raw JSON string from AI
 * @returns {string} Cleaned JSON string
 */
export function cleanJsonString(jsonString) {
  if (!jsonString || typeof jsonString !== 'string') {
    return '';
  }

  // First, let's try a different approach - parse it safely
  // Look for the content field and properly escape it
  try {
    // Use regex to find and fix the content field specifically
    const contentRegex = /"content":\s*"([\s\S]*?)"/;
    const match = jsonString.match(contentRegex);
    
    if (match) {
      const originalContent = match[1];
      const escapedContent = originalContent
        .replace(/\\/g, '\\\\')  // Escape backslashes first
        .replace(/"/g, '\\"')    // Escape quotes
        .replace(/\n/g, '\\n')   // Escape newlines
        .replace(/\r/g, '\\r')   // Escape carriage returns
        .replace(/\t/g, '\\t')   // Escape tabs
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ''); // Remove other control chars
      
      jsonString = jsonString.replace(contentRegex, `"content": "${escapedContent}"`);
    }
    
    // Clean other control characters from the rest
    jsonString = jsonString.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
    
    return jsonString.trim();
    
  } catch (error) {
    console.error('JSON cleaning error:', error);
    // Fallback: basic cleaning
    return jsonString
      .replace(/[\x00-\x1F\x7F]/g, '') // Remove all control characters
      .trim();
  }
}

/**
 * Extract JSON from AI response that might contain additional text
 * @param {string} response - Full AI response
 * @returns {string} Extracted JSON string
 */
export function extractJsonFromResponse(response) {
  if (!response || typeof response !== 'string') {
    return '';
  }

  // Look for JSON object pattern
  const jsonStart = response.indexOf('{');
  const jsonEnd = response.lastIndexOf('}');

  if (jsonStart === -1 || jsonEnd === -1 || jsonEnd <= jsonStart) {
    return response; // Return as is if no JSON brackets found
  }

  return response.substring(jsonStart, jsonEnd + 1);
}

/**
 * Manual JSON parsing for AI responses with multiline content
 * This is a fallback when standard JSON parsing fails
 * @param {string} response - AI response string
 * @returns {Object} Parsed object
 */
export function manualJsonParse(response) {
  const result = {};
  
  // Extract fields using regex patterns
  const patterns = {
    title: /"title":\s*"([^"]+)"/,
    slug: /"slug":\s*"([^"]+)"/,
    excerpt: /"excerpt":\s*"([^"]+)"/,
    tags: /"tags":\s*"([^"]+)"/,
    metaDescription: /"metaDescription":\s*"([^"]+)"/
  };
  
  // Extract simple fields
  for (const [key, pattern] of Object.entries(patterns)) {
    const match = response.match(pattern);
    if (match) {
      result[key] = match[1];
    }
  }
  
  // Extract content field (can span multiple lines)
  const contentMatch = response.match(/"content":\s*"([\s\S]*?)"\s*,\s*"tags"/);
  if (contentMatch) {
    result.content = contentMatch[1]
      .replace(/\\n/g, '\n')
      .replace(/\\r/g, '\r')
      .replace(/\\t/g, '\t')
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, '\\');
  }
  
  return result;
}

/**
 * Parse AI JSON response with error handling
 * @param {string} response - AI response containing JSON
 * @returns {Object} Parsed JSON object
 * @throws {Error} If JSON parsing fails with detailed error message
 */
export function parseAiJsonResponse(response) {
  if (!response || typeof response !== 'string') {
    throw new Error('Invalid response: Response is empty or not a string');
  }

  try {
    // First, extract JSON from response
    const jsonString = extractJsonFromResponse(response);
    
    // Try standard JSON parsing first
    try {
      const cleanedJson = cleanJsonString(jsonString);
      console.log('Cleaned JSON (first 300 chars):', cleanedJson.substring(0, 300));
      const parsed = JSON.parse(cleanedJson);
      
      // Validate required fields
      if (!parsed.title || !parsed.content) {
        throw new Error('Missing required fields: title or content');
      }
      
      return parsed;
      
    } catch (jsonError) {
      console.warn('Standard JSON parsing failed, trying manual parsing...', jsonError.message);
      
      // Fallback to manual parsing
      const manualParsed = manualJsonParse(response);
      
      if (!manualParsed.title || !manualParsed.content) {
        throw new Error('Manual parsing also failed to extract required fields');
      }
      
      console.log('Manual parsing successful');
      return manualParsed;
    }
    
  } catch (error) {
    console.error('JSON parsing error:', error);
    console.error('Original response:', response);
    console.error('Response length:', response.length);
    
    // Try to give more specific error messages
    if (error instanceof SyntaxError) {
      const match = error.message.match(/position (\d+)/);
      if (match) {
        const position = parseInt(match[1]);
        const contextStart = Math.max(0, position - 50);
        const contextEnd = Math.min(response.length, position + 50);
        const context = response.substring(contextStart, contextEnd);
        console.error(`JSON error context around position ${position}:`, context);
      }
    }
    
    throw new Error(`AI response parsing failed: ${error.message}`);
  }
}

/**
 * Validate blog data structure
 * @param {Object} blogData - Parsed blog data
 * @returns {Object} Validated blog data
 * @throws {Error} If validation fails
 */
export function validateBlogData(blogData) {
  const required = ['title', 'content', 'excerpt'];
  const missing = required.filter(field => !blogData[field]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required blog fields: ${missing.join(', ')}`);
  }
  
  // Ensure tags is a string
  if (blogData.tags && Array.isArray(blogData.tags)) {
    blogData.tags = blogData.tags.join(', ');
  }
  
  return blogData;
}