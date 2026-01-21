/**
 * Microsoft Graph API Token Management
 * Azure AD OAuth 2.0 token alımı, yenileme ve cache yönetimi
 */

const TOKEN_CACHE = {
  accessToken: null,
  expiresAt: null,
};

/**
 * Azure AD'den access token alır (Client Credentials Flow)
 * @returns {Promise<string>} Access token
 */
export async function getGraphAccessToken() {
  // Cache kontrolü
  if (TOKEN_CACHE.accessToken && TOKEN_CACHE.expiresAt > Date.now()) {
    return TOKEN_CACHE.accessToken;
  }

  const tenantId = process.env.AZURE_TENANT_ID;
  const clientId = process.env.AZURE_CLIENT_ID;
  const clientSecret = process.env.AZURE_CLIENT_SECRET;

  if (!tenantId || !clientId || !clientSecret) {
    throw new Error('Azure AD configuration is missing');
  }

  try {
    const tokenEndpoint = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
    
    const params = new URLSearchParams({
      client_id: clientId,
      scope: 'https://graph.microsoft.com/.default',
      client_secret: clientSecret,
      grant_type: 'client_credentials',
    });

    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Token request failed: ${response.status} - ${error}`);
    }

    const data = await response.json();
    
    // Cache token with 5 minute buffer before expiry
    TOKEN_CACHE.accessToken = data.access_token;
    TOKEN_CACHE.expiresAt = Date.now() + (data.expires_in - 300) * 1000;

    return data.access_token;
  } catch (error) {
    console.error('Error getting Graph access token:', error);
    throw error;
  }
}

/**
 * Graph API çağrısı yapar
 * @param {string} endpoint - API endpoint (örn: /me/messages)
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} API response
 */
export async function graphApiCall(endpoint, options = {}) {
  const accessToken = await getGraphAccessToken();
  
  const url = endpoint.startsWith('http') 
    ? endpoint 
    : `https://graph.microsoft.com/v1.0${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Graph API call failed: ${response.status} - ${error}`);
  }

  // Handle 204 No Content (PATCH, DELETE operations)
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return { success: true };
  }

  // Handle different content types
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return await response.json();
  }

  // If response body is empty, return success
  const text = await response.text();
  if (!text || text.trim() === '') {
    return { success: true };
  }

  return text;
}

/**
 * Cache'i temizler (manuel yenileme için)
 */
export function clearTokenCache() {
  TOKEN_CACHE.accessToken = null;
  TOKEN_CACHE.expiresAt = null;
}

/**
 * Token durumunu kontrol eder
 * @returns {Object} Token durumu
 */
export function getTokenStatus() {
  return {
    hasToken: !!TOKEN_CACHE.accessToken,
    expiresAt: TOKEN_CACHE.expiresAt,
    isValid: TOKEN_CACHE.accessToken && TOKEN_CACHE.expiresAt > Date.now(),
  };
}
