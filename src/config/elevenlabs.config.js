/**
 * ElevenLabs API Configuration
 * 
 * This file contains all ElevenLabs-related configuration settings.
 * Modify these values to customize the text-to-speech behavior.
 */

export const elevenLabsConfig = {
  // API Configuration
  apiKey: import.meta.env.VITE_ELEVENLABS_API_KEY,
  baseURL: 'https://api.elevenlabs.io/v1',
  
  // Default Voice Settings - Optimized for non-native speakers
  defaultVoice: {
    voiceId: '21m00Tcm4TlvDq8ikWAM', // Rachel - Professional female voice
    name: 'Rachel',
    description: 'Professional, clear female voice ideal for educational content'
  },
  
  // Available Voices (add more as needed)
  voices: {
    rachel: {
      id: '21m00Tcm4TlvDq8ikWAM',
      name: 'Rachel',
      gender: 'female',
      accent: 'american',
      description: 'Professional, clear voice - perfect for learning'
    },
    adam: {
      id: 'pNInz6obpgDQGcFmaJgB',
      name: 'Adam',
      gender: 'male', 
      accent: 'american',
      description: 'Deep, authoritative voice'
    },
    bella: {
      id: 'EXAVITQu4vr4xnSDxMaL',
      name: 'Bella',
      gender: 'female',
      accent: 'american',
      description: 'Young, friendly voice'
    }
  },
  
  // Voice Generation Settings - Optimized for clarity and learning
  voiceSettings: {
    stability: 0.8,        // Higher stability for clearer pronunciation
    similarityBoost: 0.7,  // Better voice consistency for learning
    style: 0.0,           // No style exaggeration for maximum clarity
    useSpeakerBoost: true  // Enhance speaker clarity
  },
  
  // Model Settings
  model: 'eleven_monolingual_v1', // Options: 'eleven_monolingual_v1', 'eleven_multilingual_v2'
  
  // Audio Settings
  audioSettings: {
    outputFormat: 'mp3_44100_128', // Audio format and quality
    optimizeStreamingLatency: 0,   // Streaming optimization (0-4, higher = faster but lower quality)
  },
  
  // Rate Limiting - More conservative settings to avoid 429 errors
  rateLimits: {
    requestsPerMinute: 60,        // Reduced from 120 to be more conservative
    charactersPerMonth: 10000,    // Character limit per month (adjust based on your plan)
    retryAttempts: 5,             // Increased from 3 for better resilience
    retryDelay: 1500,             // Increased from 1000ms for better backoff
  },
  
  // Timeout Settings
  timeout: 30000, // Request timeout in milliseconds (30 seconds)
  
  // Browser Fallback Settings (when ElevenLabs is unavailable) - Optimized for learning
  browserFallback: {
    enabled: true,
    voice: {
      rate: 0.5,    // Slower speech rate for better comprehension
      pitch: 0.7,   // Normal voice pitch
      volume: 1.0,  // Full volume level
      lang: 'en-US' // Clear American English
    }
  },
  
  // Error Messages
  errorMessages: {
    invalidApiKey: 'Invalid ElevenLabs API key. Please check your configuration.',
    quotaExceeded: 'Character quota exceeded. Please upgrade your plan or try again next month.',
    voiceNotFound: 'Selected voice not found. Using default voice.',
    networkError: 'Network error. Please check your internet connection.',
    timeout: 'Request timed out. Please try again.',
    generic: 'An error occurred during speech synthesis.'
  }
};

/**
 * Validates the ElevenLabs configuration
 * @returns {Object} Validation result with isValid boolean and errors array
 */
export const validateElevenLabsConfig = () => {
  const errors = [];
  
  if (!elevenLabsConfig.apiKey || elevenLabsConfig.apiKey === 'your_elevenlabs_api_key_here') {
    errors.push('ElevenLabs API key is missing or not configured');
  }
  
  const { stability, similarityBoost, style } = elevenLabsConfig.voiceSettings;
  
  if (stability < 0 || stability > 1) {
    errors.push('Voice stability must be between 0 and 1');
  }
  
  if (similarityBoost < 0 || similarityBoost > 1) {
    errors.push('Similarity boost must be between 0 and 1');
  }
  
  if (style < 0 || style > 1) {
    errors.push('Style must be between 0 and 1');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Gets voice configuration by name or ID
 * @param {string} voiceIdentifier - Voice name or ID
 * @returns {Object} Voice configuration object
 */
export const getVoiceConfig = (voiceIdentifier = 'rachel') => {
  // Check if it's a voice name
  const voiceByName = elevenLabsConfig.voices[voiceIdentifier.toLowerCase()];
  if (voiceByName) {
    return voiceByName;
  }
  
  // Check if it's a voice ID
  const voiceById = Object.values(elevenLabsConfig.voices)
    .find(voice => voice.id === voiceIdentifier);
  if (voiceById) {
    return voiceById;
  }
  
  // Return default voice if not found
  return elevenLabsConfig.voices.rachel;
};