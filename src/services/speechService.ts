import { 
  elevenLabsConfig, 
  getVoiceConfig, 
  validateElevenLabsConfig 
} from '../config/elevenlabs.config.js';
import { handleElevenLabsError, retryWithBackoff, RateLimiter } from '../utils/apiErrorHandler.js';

export type SpeechMode = 'full' | 'concise' | 'disabled';

export class SpeechService {
  private apiKey: string;
  private synthesis: SpeechSynthesis;
  private recognition: SpeechRecognition | null = null;
  private rateLimiter: RateLimiter;
  private isRecognitionActive: boolean = false;
  private onEndPromise: Promise<void> | null = null;
  private speechMode: SpeechMode = 'full';
  
  // Audio cache for repeated phrases
  private audioCache: Map<string, Blob> = new Map();
  
  // Common phrases that can be cached
  private readonly commonPhrases = {
    correct: "Excellent!",
    incorrect: "Not quite right.",
    listening: "Listening...",
    nextWord: "Next word",
    goHome: "Go home",
    tryAgain: "Try again",
    wellDone: "Well done!",
    keepGoing: "Keep going!",
    almostThere: "Almost there!",
    goodJob: "Good job!",
    letsBegin: "Let's begin.",
    yourTurn: "Your turn.",
    speakClearly: "Please speak clearly.",
    didntUnderstand: "I didn't understand that.",
    sayNextWord: "Say next word to continue.",
    sayGoHome: "Say go home to return to the main menu."
  };

  constructor(apiKey?: string, speechMode: SpeechMode = 'full') {
    this.apiKey = apiKey || elevenLabsConfig.apiKey;
    this.synthesis = window.speechSynthesis;
    this.rateLimiter = new RateLimiter(elevenLabsConfig.rateLimits.requestsPerMinute);
    this.speechMode = speechMode;
    this.initializeSpeechRecognition();
    
    // Pre-cache common phrases on initialization
    this.preCacheCommonPhrases();
    
    // Validate configuration on initialization
    const validation = validateElevenLabsConfig();
    if (!validation.isValid) {
      console.warn('ElevenLabs configuration issues:', validation.errors);
    }
  }

  setSpeechMode(mode: SpeechMode) {
    this.speechMode = mode;
  }

  getSpeechMode(): SpeechMode {
    return this.speechMode;
  }

  private async preCacheCommonPhrases() {
    // Only pre-cache if we have a valid API key and speech is not disabled
    if (!this.apiKey || 
        this.apiKey === 'your_elevenlabs_api_key_here' || 
        this.apiKey.length < 10 ||
        this.speechMode === 'disabled') {
      return;
    }

    console.log('Pre-caching common phrases...');
    
    // Cache the most frequently used phrases
    const priorityPhrases = [
      this.commonPhrases.correct,
      this.commonPhrases.incorrect,
      this.commonPhrases.letsBegin,
      this.commonPhrases.speakClearly,
      this.commonPhrases.sayNextWord,
      this.commonPhrases.sayGoHome
    ];

    for (const phrase of priorityPhrases) {
      try {
        await this.cachePhrase(phrase);
        // Small delay to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.warn(`Failed to cache phrase "${phrase}":`, error);
      }
    }
  }

  private async cachePhrase(text: string): Promise<void> {
    if (this.audioCache.has(text)) {
      return; // Already cached
    }

    try {
      const audioBlob = await this.generateAudioBlob(text);
      this.audioCache.set(text, audioBlob);
      console.log(`Cached phrase: "${text}"`);
    } catch (error) {
      console.warn(`Failed to cache phrase "${text}":`, error);
    }
  }

  private async playFromCache(text: string): Promise<boolean> {
    const cachedBlob = this.audioCache.get(text);
    if (!cachedBlob) {
      return false;
    }

    return new Promise((resolve, reject) => {
      const audioUrl = URL.createObjectURL(cachedBlob);
      const audio = new Audio(audioUrl);
      
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        resolve(true);
      };
      
      audio.onerror = (error) => {
        URL.revokeObjectURL(audioUrl);
        reject(error);
      };
      
      audio.play().catch(reject);
    });
  }

  private optimizeTextForSpeech(text: string): string {
    if (this.speechMode === 'disabled') {
      return '';
    }

    if (this.speechMode === 'concise') {
      // Apply aggressive text optimization for concise mode
      return text
        // Remove filler words and phrases
        .replace(/\b(well|you know|actually|basically|essentially|literally)\b/gi, '')
        // Simplify common phrases
        .replace(/Please speak your answer clearly/gi, 'Speak your answer')
        .replace(/Let's begin\. Here is your vocabulary challenge:/gi, 'Your challenge:')
        .replace(/For context: This is a/gi, 'This is a')
        .replace(/Now, what word fits in the blank\?/gi, 'What word fits?')
        .replace(/Say "next word" to continue, or say "go home" to return to the main menu/gi, 'Say next word or go home')
        .replace(/I didn't understand that command\./gi, 'Try again.')
        // Remove extra spaces and clean up
        .replace(/\s+/g, ' ')
        .trim();
    }

    return text;
  }

  async speakText(text: string, voiceId?: string): Promise<void> {
    if (this.speechMode === 'disabled') {
      return Promise.resolve();
    }

    const optimizedText = this.optimizeTextForSpeech(text);
    if (!optimizedText) {
      return Promise.resolve();
    }

    // Check if this is a common phrase that might be cached
    const exactMatch = Object.values(this.commonPhrases).find(phrase => phrase === optimizedText);
    if (exactMatch) {
      try {
        const played = await this.playFromCache(exactMatch);
        if (played) {
          console.log(`Played from cache: "${exactMatch}"`);
          return;
        }
      } catch (error) {
        console.warn('Failed to play from cache, falling back to API:', error);
      }
    }

    return new Promise((resolve, reject) => {
      // Require valid ElevenLabs API key for production use
      if (!this.apiKey || 
          this.apiKey === 'your_elevenlabs_api_key_here' || 
          this.apiKey.length < 10) {
        reject(new Error('Valid ElevenLabs API key is required for high-quality speech synthesis.'));
        return;
      }

      // Use ElevenLabs API for high-quality speech
      this.speakWithElevenLabs(optimizedText, voiceId)
        .then(resolve)
        .catch((error) => {
          console.error('ElevenLabs speech synthesis failed:', error);
          reject(new Error(`ElevenLabs speech synthesis failed: ${error.message}`));
        });
    });
  }

  private async generateAudioBlob(text: string, voiceId?: string): Promise<Blob> {
    // Check rate limits
    if (!this.rateLimiter.canMakeRequest()) {
      const waitTime = this.rateLimiter.getTimeUntilNextRequest();
      throw new Error(`ElevenLabs rate limit exceeded. Please wait ${Math.ceil(waitTime / 1000)} seconds.`);
    }

    const voice = getVoiceConfig(voiceId || elevenLabsConfig.defaultVoice.voiceId);
    
    const response = await retryWithBackoff(async () => {
      this.rateLimiter.recordRequest();
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), elevenLabsConfig.timeout);

      try {
        const response = await fetch(
          `${elevenLabsConfig.baseURL}/text-to-speech/${voice.id}`,
          {
            method: 'POST',
            headers: {
              'Accept': 'audio/mpeg',
              'Content-Type': 'application/json',
              'xi-api-key': this.apiKey
            },
            body: JSON.stringify({
              text: text,
              model_id: elevenLabsConfig.model,
              voice_settings: {
                stability: 0.8,
                similarity_boost: 0.7,
                style: 0.0,
                use_speaker_boost: true
              }
            }),
            signal: controller.signal
          }
        );

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('ElevenLabs API error response:', response.status, errorText);
          
          if (response.status === 401) {
            throw new Error('Invalid ElevenLabs API key. Please check your API key configuration.');
          } else if (response.status === 429) {
            throw new Error('ElevenLabs rate limit exceeded. Please wait a moment and try again.');
          } else if (response.status === 402) {
            throw new Error('ElevenLabs quota exceeded. Please check your billing and usage limits.');
          }
          
          throw new Error(`ElevenLabs API error (${response.status}): ${response.statusText}`);
        }

        return response;
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
    }, elevenLabsConfig.rateLimits.retryAttempts, elevenLabsConfig.rateLimits.retryDelay);

    return await response.blob();
  }

  private async speakWithElevenLabs(text: string, voiceId?: string): Promise<void> {
    try {
      const audioBlob = await this.generateAudioBlob(text, voiceId);
      
      // Cache the audio if it's a common phrase
      const exactMatch = Object.values(this.commonPhrases).find(phrase => phrase === text);
      if (exactMatch && !this.audioCache.has(exactMatch)) {
        this.audioCache.set(exactMatch, audioBlob);
        console.log(`Auto-cached phrase: "${exactMatch}"`);
      }
      
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      return new Promise((resolve, reject) => {
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          resolve();
        };
        audio.onerror = (error) => {
          URL.revokeObjectURL(audioUrl);
          reject(error);
        };
        audio.play().catch(reject);
      });
    } catch (error) {
      const apiError = handleElevenLabsError(error);
      console.error('ElevenLabs API Error:', apiError);
      throw new Error(`ElevenLabs API Error: ${apiError.message}`);
    }
  }

  // Utility methods for common phrases
  async speakCorrect(): Promise<void> {
    return this.speakText(this.commonPhrases.correct);
  }

  async speakIncorrect(): Promise<void> {
    return this.speakText(this.commonPhrases.incorrect);
  }

  async speakLetsBegin(): Promise<void> {
    return this.speakText(this.commonPhrases.letsBegin);
  }

  async speakSpeakClearly(): Promise<void> {
    return this.speakText(this.commonPhrases.speakClearly);
  }

  async speakCommandInstructions(): Promise<void> {
    return this.speakText(this.commonPhrases.sayNextWord + " " + this.commonPhrases.sayGoHome);
  }

  private initializeSpeechRecognition() {
    if ('webkitSpeechRecognition' in window) {
      this.recognition = new (window as any).webkitSpeechRecognition();
    } else if ('SpeechRecognition' in window) {
      this.recognition = new (window as any).SpeechRecognition();
    }

    if (this.recognition) {
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';
    }
  }

  async startListening(): Promise<string> {
    // Wait for any previous recognition session to fully end
    if (this.onEndPromise) {
      await this.onEndPromise;
    }

    return new Promise((resolve, reject) => {
      if (!this.recognition) {
        reject(new Error('Speech recognition not supported in this browser.'));
        return;
      }

      // If recognition is already active, stop it first and wait
      if (this.isRecognitionActive) {
        this.recognition.stop();
        // Create a promise that resolves when onend fires
        this.onEndPromise = new Promise<void>((resolveEnd) => {
          const originalOnEnd = this.recognition!.onend;
          this.recognition!.onend = (event) => {
            if (originalOnEnd) originalOnEnd(event);
            resolveEnd();
          };
        });
        
        this.onEndPromise.then(() => {
          this.startRecognitionSession(resolve, reject);
        });
      } else {
        this.startRecognitionSession(resolve, reject);
      }
    });
  }

  private startRecognitionSession(resolve: (value: string) => void, reject: (reason?: any) => void) {
    if (!this.recognition) {
      reject(new Error('Speech recognition not supported'));
      return;
    }

    this.isRecognitionActive = true;
    let hasResult = false;

    this.recognition.onresult = (event) => {
      hasResult = true;
      const transcript = event.results[0][0].transcript;
      this.isRecognitionActive = false;
      resolve(transcript.toLowerCase().trim());
    };

    this.recognition.onerror = (event) => {
      this.isRecognitionActive = false;
      reject(new Error(`Speech recognition error: ${event.error}`));
    };

    this.recognition.onend = () => {
      this.isRecognitionActive = false;
      this.onEndPromise = null;
      
      // Only reject if no result was captured
      if (!hasResult) {
        reject(new Error('Speech recognition ended without capturing speech'));
      }
    };

    try {
      this.recognition.start();
    } catch (error) {
      this.isRecognitionActive = false;
      reject(error);
    }
  }

  stopListening() {
    if (this.recognition && this.isRecognitionActive) {
      this.recognition.stop();
      this.isRecognitionActive = false;
    }
  }

  stopSpeaking() {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
  }

  // Clear cache if needed (for memory management)
  clearCache() {
    this.audioCache.clear();
    console.log('Audio cache cleared');
  }

  // Get cache statistics
  getCacheStats() {
    return {
      cachedPhrases: this.audioCache.size,
      phrases: Array.from(this.audioCache.keys())
    };
  }
}