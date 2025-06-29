/**
 * OpenAI API Configuration
 * 
 * This file contains all OpenAI-related configuration settings.
 * Modify these values to customize the AI behavior for your application.
 */

export const openAIConfig = {
  // API Configuration
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  baseURL: 'https://api.openai.com/v1',
  
  // Model Settings
  model: 'gpt-3.5-turbo', // Options: 'gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo'
  
  // Generation Parameters
  temperature: 0.7, // Controls randomness (0.0 = deterministic, 1.0 = very random)
  maxTokens: 150,   // Maximum tokens in the response
  topP: 1.0,        // Nucleus sampling parameter (0.1 = only top 10% probability mass)
  
  // Rate Limiting
  rateLimits: {
    requestsPerMinute: 60,    // Maximum requests per minute
    tokensPerMinute: 40000,   // Maximum tokens per minute
    retryAttempts: 3,         // Number of retry attempts on failure
    retryDelay: 1000,         // Initial retry delay in milliseconds
  },
  
  // Timeout Settings
  timeout: 30000, // Request timeout in milliseconds (30 seconds)
  
  // System Prompts for different use cases
  systemPrompts: {
    vocabularyClue: `You are a vocabulary teacher creating clues for English learners. 
                     Create a sentence with a blank where the target word should go. 
                     The sentence should provide enough context to guess the word but not be too obvious.`,
    
    difficulty: {
      A1: 'Use simple vocabulary and basic sentence structures suitable for beginners.',
      A2: 'Use elementary vocabulary with slightly more complex sentences.',
      B1: 'Use intermediate vocabulary with varied sentence structures.',
      B2: 'Use upper-intermediate vocabulary with complex sentence patterns.'
    }
  },
  
  // Error Messages
  errorMessages: {
    invalidApiKey: 'Invalid OpenAI API key. Please check your configuration.',
    rateLimitExceeded: 'Rate limit exceeded. Please try again later.',
    networkError: 'Network error. Please check your internet connection.',
    timeout: 'Request timed out. Please try again.',
    generic: 'An error occurred while processing your request.'
  }
};

/**
 * Validates the OpenAI configuration
 * @returns {Object} Validation result with isValid boolean and errors array
 */
export const validateOpenAIConfig = () => {
  const errors = [];
  
  if (!openAIConfig.apiKey || openAIConfig.apiKey === 'your_openai_api_key_here') {
    errors.push('OpenAI API key is missing or not configured');
  }
  
  if (openAIConfig.temperature < 0 || openAIConfig.temperature > 1) {
    errors.push('Temperature must be between 0 and 1');
  }
  
  if (openAIConfig.maxTokens < 1 || openAIConfig.maxTokens > 4096) {
    errors.push('Max tokens must be between 1 and 4096');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Gets the appropriate system prompt based on difficulty level
 * @param {string} level - The CEFR level (A1, A2, B1, B2)
 * @returns {string} Combined system prompt
 */
export const getSystemPrompt = (level = 'B1') => {
  const basePrompt = openAIConfig.systemPrompts.vocabularyClue;
  const difficultyPrompt = openAIConfig.systemPrompts.difficulty[level] || 
                          openAIConfig.systemPrompts.difficulty.B1;
  
  return `${basePrompt} ${difficultyPrompt}`;
};