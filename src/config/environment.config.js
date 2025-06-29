/**
 * Environment Configuration
 * 
 * This file handles environment variable validation and provides
 * a centralized configuration management system.
 */

/**
 * Environment variable validation schema
 */
const envSchema = {
  VITE_OPENAI_API_KEY: {
    required: false,
    type: 'string',
    description: 'OpenAI API key for AI-powered features'
  },
  VITE_ELEVENLABS_API_KEY: {
    required: false,
    type: 'string', 
    description: 'ElevenLabs API key for text-to-speech'
  },
  VITE_APP_NAME: {
    required: false,
    type: 'string',
    default: 'VocAIbulary',
    description: 'Application name'
  },
  VITE_APP_VERSION: {
    required: false,
    type: 'string',
    default: '1.0.0',
    description: 'Application version'
  },
  VITE_ENVIRONMENT: {
    required: false,
    type: 'string',
    default: 'development',
    description: 'Current environment (development, production, etc.)'
  }
};

/**
 * Validates environment variables against the schema
 * @returns {Object} Validation result with isValid boolean and errors array
 */
export const validateEnvironment = () => {
  const errors = [];
  const warnings = [];
  
  Object.entries(envSchema).forEach(([key, config]) => {
    const value = import.meta.env[key];
    
    // Check required variables
    if (config.required && (!value || value.trim() === '')) {
      errors.push(`Required environment variable ${key} is missing`);
      return;
    }
    
    // Check type validation
    if (value && config.type === 'string' && typeof value !== 'string') {
      errors.push(`Environment variable ${key} must be a string`);
    }
    
    // Check for default API keys (security warning)
    if (key.includes('API_KEY') && value && 
        (value.includes('your_') || value.includes('_here'))) {
      warnings.push(`${key} appears to be using a placeholder value`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Gets environment configuration with defaults
 * @returns {Object} Environment configuration object
 */
export const getEnvironmentConfig = () => {
  const config = {};
  
  Object.entries(envSchema).forEach(([key, schema]) => {
    const value = import.meta.env[key];
    config[key] = value || schema.default || null;
  });
  
  return config;
};

/**
 * Checks if the application is running in development mode
 * @returns {boolean} True if in development mode
 */
export const isDevelopment = () => {
  return import.meta.env.DEV || 
         import.meta.env.VITE_ENVIRONMENT === 'development';
};

/**
 * Checks if the application is running in production mode
 * @returns {boolean} True if in production mode
 */
export const isProduction = () => {
  return import.meta.env.PROD || 
         import.meta.env.VITE_ENVIRONMENT === 'production';
};

/**
 * Gets the current environment name
 * @returns {string} Environment name
 */
export const getEnvironment = () => {
  return import.meta.env.VITE_ENVIRONMENT || 'development';
};

/**
 * Logs environment validation results (development only)
 */
export const logEnvironmentStatus = () => {
  if (!isDevelopment()) return;
  
  const validation = validateEnvironment();
  const config = getEnvironmentConfig();
  
  console.group('🔧 Environment Configuration');
  console.log('Environment:', getEnvironment());
  console.log('Configuration:', config);
  
  if (validation.errors.length > 0) {
    console.group('❌ Errors');
    validation.errors.forEach(error => console.error(error));
    console.groupEnd();
  }
  
  if (validation.warnings.length > 0) {
    console.group('⚠️ Warnings');
    validation.warnings.forEach(warning => console.warn(warning));
    console.groupEnd();
  }
  
  if (validation.isValid && validation.warnings.length === 0) {
    console.log('✅ Environment configuration is valid');
  }
  
  console.groupEnd();
};