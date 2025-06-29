/**
 * API Error Handling Utilities
 * 
 * This file provides centralized error handling for API requests
 * with proper error classification and user-friendly messages.
 */

/**
 * Error types for classification
 */
export const ErrorTypes = {
  NETWORK: 'NETWORK',
  AUTHENTICATION: 'AUTHENTICATION', 
  RATE_LIMIT: 'RATE_LIMIT',
  QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',
  VALIDATION: 'VALIDATION',
  SERVER: 'SERVER',
  TIMEOUT: 'TIMEOUT',
  UNKNOWN: 'UNKNOWN'
};

/**
 * API Error class for structured error handling
 */
export class APIError extends Error {
  constructor(message, type = ErrorTypes.UNKNOWN, statusCode = null, originalError = null) {
    super(message);
    this.name = 'APIError';
    this.type = type;
    this.statusCode = statusCode;
    this.originalError = originalError;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * Classifies HTTP status codes into error types
 * @param {number} statusCode - HTTP status code
 * @returns {string} Error type
 */
const classifyHttpError = (statusCode) => {
  if (statusCode >= 400 && statusCode < 500) {
    switch (statusCode) {
      case 401:
      case 403:
        return ErrorTypes.AUTHENTICATION;
      case 429:
        return ErrorTypes.RATE_LIMIT;
      case 422:
        return ErrorTypes.VALIDATION;
      default:
        return ErrorTypes.VALIDATION;
    }
  } else if (statusCode >= 500) {
    return ErrorTypes.SERVER;
  }
  return ErrorTypes.UNKNOWN;
};

/**
 * Handles OpenAI API errors
 * @param {Error} error - Original error object
 * @returns {APIError} Structured API error
 */
export const handleOpenAIError = (error) => {
  if (error.name === 'AbortError') {
    return new APIError(
      'Request timed out. Please try again.',
      ErrorTypes.TIMEOUT,
      null,
      error
    );
  }
  
  if (error.response) {
    const { status, data } = error.response;
    const message = data?.error?.message || 'OpenAI API error occurred';
    
    if (status === 401) {
      return new APIError(
        'Invalid OpenAI API key. Please check your configuration.',
        ErrorTypes.AUTHENTICATION,
        status,
        error
      );
    }
    
    if (status === 429) {
      return new APIError(
        'OpenAI rate limit exceeded. Please try again later.',
        ErrorTypes.RATE_LIMIT,
        status,
        error
      );
    }
    
    return new APIError(
      message,
      classifyHttpError(status),
      status,
      error
    );
  }
  
  if (error.request) {
    return new APIError(
      'Network error. Please check your internet connection.',
      ErrorTypes.NETWORK,
      null,
      error
    );
  }
  
  return new APIError(
    error.message || 'An unexpected error occurred',
    ErrorTypes.UNKNOWN,
    null,
    error
  );
};

/**
 * Handles ElevenLabs API errors
 * @param {Error} error - Original error object
 * @returns {APIError} Structured API error
 */
export const handleElevenLabsError = (error) => {
  if (error.name === 'AbortError') {
    return new APIError(
      'Speech synthesis timed out. Please try again.',
      ErrorTypes.TIMEOUT,
      null,
      error
    );
  }
  
  if (error.response) {
    const { status, data } = error.response;
    const message = data?.detail?.message || data?.message || 'ElevenLabs API error occurred';
    
    if (status === 401) {
      return new APIError(
        'Invalid ElevenLabs API key. Please check your configuration.',
        ErrorTypes.AUTHENTICATION,
        status,
        error
      );
    }
    
    if (status === 429) {
      return new APIError(
        'ElevenLabs rate limit exceeded. Please try again later.',
        ErrorTypes.RATE_LIMIT,
        status,
        error
      );
    }
    
    if (status === 402) {
      return new APIError(
        'Character quota exceeded. Please upgrade your ElevenLabs plan.',
        ErrorTypes.QUOTA_EXCEEDED,
        status,
        error
      );
    }
    
    return new APIError(
      message,
      classifyHttpError(status),
      status,
      error
    );
  }
  
  if (error.request) {
    return new APIError(
      'Network error. Please check your internet connection.',
      ErrorTypes.NETWORK,
      null,
      error
    );
  }
  
  return new APIError(
    error.message || 'An unexpected error occurred during speech synthesis',
    ErrorTypes.UNKNOWN,
    null,
    error
  );
};

/**
 * Rate limiter utility class
 */
export class RateLimiter {
  constructor(requestsPerMinute = 60) {
    this.requestsPerMinute = requestsPerMinute;
    this.requests = [];
  }
  
  /**
   * Checks if a request can be made within rate limits
   * @returns {boolean} True if request is allowed
   */
  canMakeRequest() {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    
    // Remove requests older than 1 minute
    this.requests = this.requests.filter(timestamp => timestamp > oneMinuteAgo);
    
    return this.requests.length < this.requestsPerMinute;
  }
  
  /**
   * Records a request timestamp
   */
  recordRequest() {
    this.requests.push(Date.now());
  }
  
  /**
   * Gets time until next request is allowed
   * @returns {number} Milliseconds until next request
   */
  getTimeUntilNextRequest() {
    if (this.canMakeRequest()) return 0;
    
    const oldestRequest = Math.min(...this.requests);
    return Math.max(0, oldestRequest + 60000 - Date.now());
  }
}

/**
 * Retry utility with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {number} maxAttempts - Maximum retry attempts
 * @param {number} baseDelay - Base delay in milliseconds
 * @returns {Promise} Result of the function
 */
export const retryWithBackoff = async (fn, maxAttempts = 3, baseDelay = 1000) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry on authentication or validation errors
      if (error instanceof APIError && 
          (error.type === ErrorTypes.AUTHENTICATION || 
           error.type === ErrorTypes.VALIDATION)) {
        throw error;
      }
      
      // Don't retry on the last attempt
      if (attempt === maxAttempts) {
        break;
      }
      
      // Calculate delay with exponential backoff
      const delay = baseDelay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};