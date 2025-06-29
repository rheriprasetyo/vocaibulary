import { openAIConfig, getSystemPrompt, validateOpenAIConfig } from '../config/openai.config.js';
import { handleOpenAIError, retryWithBackoff, RateLimiter } from '../utils/apiErrorHandler.js';
import { oxford3000Words } from '../data/oxford3000';

export interface Word {
  word: string;
  level: 'A1' | 'A2' | 'B1' | 'B2';
  definition: string;
  example: string;
  partOfSpeech: string;
}

export interface WordAndClueResponse {
  word: Word;
  clue: string;
  difficulty: number;
  multipleChoiceOptions: string[];
}

export class AIService {
  private apiKey: string;
  private rateLimiter: RateLimiter;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || openAIConfig.apiKey;
    this.rateLimiter = new RateLimiter(openAIConfig.rateLimits.requestsPerMinute);
    
    // Validate configuration on initialization
    const validation = validateOpenAIConfig();
    if (!validation.isValid) {
      console.warn('OpenAI configuration issues:', validation.errors);
    }
  }

  private generateMultipleChoiceOptions(correctWord: Word, level: 'A1' | 'A2' | 'B1' | 'B2' | 'ALL'): string[] {
    // Filter words by level and part of speech for better distractors
    const levelWords = level === 'ALL' 
      ? oxford3000Words 
      : oxford3000Words.filter(w => w.level === level);
    
    const samePartOfSpeech = levelWords.filter(w => 
      w.partOfSpeech === correctWord.partOfSpeech && 
      w.word !== correctWord.word
    );
    
    // If we don't have enough words of the same part of speech, use any words from the level
    const availableWords = samePartOfSpeech.length >= 3 ? samePartOfSpeech : levelWords;
    
    // Randomly select 3 incorrect options
    const incorrectOptions: string[] = [];
    const usedWords = new Set([correctWord.word.toLowerCase()]);
    
    while (incorrectOptions.length < 3 && availableWords.length > incorrectOptions.length) {
      const randomWord = availableWords[Math.floor(Math.random() * availableWords.length)];
      if (!usedWords.has(randomWord.word.toLowerCase())) {
        incorrectOptions.push(randomWord.word);
        usedWords.add(randomWord.word.toLowerCase());
      }
    }
    
    // If we still don't have enough options, add some generic ones
    while (incorrectOptions.length < 3) {
      const fallbackOptions = ['answer', 'option', 'choice', 'word', 'item', 'thing', 'place', 'time'];
      const fallback = fallbackOptions[Math.floor(Math.random() * fallbackOptions.length)];
      if (!usedWords.has(fallback)) {
        incorrectOptions.push(fallback);
        usedWords.add(fallback);
      }
    }
    
    // Combine correct answer with incorrect options and shuffle
    const allOptions = [correctWord.word, ...incorrectOptions.slice(0, 3)];
    
    // Fisher-Yates shuffle
    for (let i = allOptions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allOptions[i], allOptions[j]] = [allOptions[j], allOptions[i]];
    }
    
    return allOptions;
  }

  async fetchWordAndClue(level: 'A1' | 'A2' | 'B1' | 'B2' | 'ALL'): Promise<WordAndClueResponse> {
    // Strict validation - require valid OpenAI API key
    if (!this.apiKey || 
        this.apiKey === 'your_openai_api_key_here' || 
        this.apiKey.length < 20 ||
        !this.apiKey.startsWith('sk-')) {
      throw new Error('Valid OpenAI API key is required for VocabAI to function. Please configure your API key.');
    }

    console.log('Using OpenAI API to generate word and clue for level:', level);

    // Check rate limits
    if (!this.rateLimiter.canMakeRequest()) {
      const waitTime = this.rateLimiter.getTimeUntilNextRequest();
      throw new Error(`OpenAI rate limit exceeded. Please wait ${Math.ceil(waitTime / 1000)} seconds and try again.`);
    }

    try {
      const levelFilter = level === 'ALL' ? 'any level (A1, A2, B1, or B2)' : `${level} level`;
      
      const response = await retryWithBackoff(async () => {
        this.rateLimiter.recordRequest();
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), openAIConfig.timeout);

        try {
          console.log('Making OpenAI API request...');
          const response = await fetch(`${openAIConfig.baseURL}/chat/completions`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
              model: openAIConfig.model,
              messages: [
                {
                  role: 'system',
                  content: `You are an expert English vocabulary teacher creating learning exercises for students. Your task is to:

1. Select a vocabulary word from the Oxford 3000 list appropriate for ${levelFilter}
2. Create a concise, educational clue that helps students learn the word
3. The clue should be a complete sentence or question with a blank (____) where the target word goes
4. Make the clue contextual and meaningful, not just a definition
5. Keep the clue brief but clear - aim for 10-15 words maximum
6. Ensure the clue provides enough context to guess the word but isn't too obvious

Return your response in this EXACT JSON format:
{
  "word": "example",
  "level": "A1",
  "definition": "a thing that is representative of all such things in a group",
  "example": "This is a good example of modern art.",
  "partOfSpeech": "noun",
  "clue": "Can you give me an ____ of what you mean?"
}

The clue should be concise and educational, helping students understand the word's usage.`
                },
                {
                  role: 'user',
                  content: `Please create a brief vocabulary learning exercise for a ${levelFilter} English learner. Select an appropriate word and create a concise clue sentence with a blank (____) where the word should go. Keep it short and clear.`
                }
              ],
              max_tokens: 250, // Reduced from 300 to save tokens
              temperature: 0.7,
              top_p: 1.0
            }),
            signal: controller.signal
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            const errorText = await response.text();
            console.error('OpenAI API error response:', response.status, errorText);
            
            // Handle specific error cases
            if (response.status === 401) {
              throw new Error('Invalid OpenAI API key. Please check your API key configuration.');
            } else if (response.status === 429) {
              throw new Error('OpenAI rate limit exceeded. Please wait a moment and try again.');
            } else if (response.status === 402) {
              throw new Error('OpenAI quota exceeded. Please check your billing and usage limits.');
            }
            
            throw new Error(`OpenAI API error (${response.status}): ${response.statusText}`);
          }

          return response.json();
        } catch (error) {
          clearTimeout(timeoutId);
          throw error;
        }
      }, openAIConfig.rateLimits.retryAttempts, openAIConfig.rateLimits.retryDelay);

      console.log('OpenAI API response received:', response);

      const content = response.choices[0].message.content.trim();
      console.log('OpenAI response content:', content);
      
      // Parse the JSON response
      let parsedResponse;
      try {
        // Clean the response in case there's extra text
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        const jsonString = jsonMatch ? jsonMatch[0] : content;
        parsedResponse = JSON.parse(jsonString);
      } catch (parseError) {
        console.error('Failed to parse OpenAI response as JSON:', content);
        console.error('Parse error:', parseError);
        throw new Error('OpenAI returned an invalid response format. Please try again.');
      }

      // Validate the response structure
      if (!parsedResponse.word || !parsedResponse.definition || !parsedResponse.clue) {
        console.error('Incomplete response from OpenAI:', parsedResponse);
        throw new Error('OpenAI returned incomplete data. Please try again.');
      }

      const word: Word = {
        word: parsedResponse.word.toLowerCase(),
        level: parsedResponse.level || (level === 'ALL' ? 'B1' : level),
        definition: parsedResponse.definition,
        example: parsedResponse.example || `This is an example with ${parsedResponse.word}.`,
        partOfSpeech: parsedResponse.partOfSpeech || 'word'
      };
      
      // Generate multiple choice options
      const multipleChoiceOptions = this.generateMultipleChoiceOptions(word, level);
      
      console.log('Successfully generated word and clue from OpenAI:', { 
        word: word.word, 
        clue: parsedResponse.clue,
        definition: word.definition,
        multipleChoiceOptions
      });
      
      return {
        word,
        clue: parsedResponse.clue,
        difficulty: this.calculateDifficulty(word.level),
        multipleChoiceOptions
      };
    } catch (error) {
      const apiError = handleOpenAIError(error);
      console.error('OpenAI API Error:', apiError);
      
      // Re-throw the error instead of falling back
      throw new Error(`OpenAI API Error: ${apiError.message}. VocabAI requires a working OpenAI connection.`);
    }
  }

  // Legacy method for backward compatibility
  async generateClue(word: string, definition: string, level: string): Promise<{ clue: string; difficulty: number }> {
    if (!this.apiKey || this.apiKey === 'your_openai_api_key_here' || this.apiKey.length < 20 || !this.apiKey.startsWith('sk-')) {
      throw new Error('Valid OpenAI API key is required for clue generation.');
    }

    // Check rate limits
    if (!this.rateLimiter.canMakeRequest()) {
      const waitTime = this.rateLimiter.getTimeUntilNextRequest();
      throw new Error(`Rate limit exceeded. Please wait ${Math.ceil(waitTime / 1000)} seconds.`);
    }

    try {
      const response = await retryWithBackoff(async () => {
        this.rateLimiter.recordRequest();
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), openAIConfig.timeout);

        try {
          const response = await fetch(`${openAIConfig.baseURL}/chat/completions`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
              model: openAIConfig.model,
              messages: [
                {
                  role: 'system',
                  content: `${getSystemPrompt(level)} Be concise - use 10-15 words maximum.`
                },
                {
                  role: 'user',
                  content: `Create a brief clue sentence for "${word}" (definition: ${definition}). Replace the word with "____". Keep it short and clear for ${level} level learners.`
                }
              ],
              max_tokens: 100, // Reduced from 150 to save tokens
              temperature: openAIConfig.temperature,
              top_p: openAIConfig.topP
            }),
            signal: controller.signal
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          return response.json();
        } catch (error) {
          clearTimeout(timeoutId);
          throw error;
        }
      }, openAIConfig.rateLimits.retryAttempts, openAIConfig.rateLimits.retryDelay);

      const clue = response.choices[0].message.content.trim();
      
      return {
        clue,
        difficulty: this.calculateDifficulty(level)
      };
    } catch (error) {
      const apiError = handleOpenAIError(error);
      console.error('OpenAI API Error:', apiError);
      throw new Error(`OpenAI API Error: ${apiError.message}`);
    }
  }

  private calculateDifficulty(level: string): number {
    switch (level) {
      case 'A1': return 1;
      case 'A2': return 2;
      case 'B1': return 3;
      case 'B2': return 4;
      default: return 2;
    }
  }
}