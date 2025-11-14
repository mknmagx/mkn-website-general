/**
 * Production-safe logger utility
 * Only logs in development environment
 */

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = {
  /**
   * Log info messages (only in development)
   */
  info: (...args) => {
    if (isDevelopment) {
      console.log('ℹ️', ...args);
    }
  },

  /**
   * Log success messages (only in development)
   */
  success: (...args) => {
    if (isDevelopment) {
      console.log('✅', ...args);
    }
  },

  /**
   * Log debug messages (only in development)
   */
  debug: (...args) => {
    if (isDevelopment) {
      console.log('🔍', ...args);
    }
  },

  /**
   * Log warning messages (only in development)
   */
  warn: (...args) => {
    if (isDevelopment) {
      console.warn('⚠️', ...args);
    }
  },

  /**
   * Log error messages (always logs, but with different formatting)
   */
  error: (...args) => {
    if (isDevelopment) {
      console.error('❌', ...args);
    } else {
      // In production, log errors without emojis for log aggregation services
      console.error('[ERROR]', ...args);
    }
  },

  /**
   * Log authentication events (only in development)
   */
  auth: (...args) => {
    if (isDevelopment) {
      console.log('🔐', ...args);
    }
  },

  /**
   * Log API events (only in development)
   */
  api: (...args) => {
    if (isDevelopment) {
      console.log('🌐', ...args);
    }
  },

  /**
   * Log Shopify events (only in development)
   */
  shopify: (...args) => {
    if (isDevelopment) {
      console.log('🛍️', ...args);
    }
  }
};

export default logger;