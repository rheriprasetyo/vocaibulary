import React, { useState, useEffect, useCallback } from 'react';
import { GameSetup } from './components/GameSetup';
import { GameInterface } from './components/GameInterface';
import { useGameState } from './hooks/useGameState';
import { AIService } from './services/aiService';
import { SpeechService, SpeechMode } from './services/speechService';
import { getRandomWord } from './data/oxford3000';
import { logEnvironmentStatus } from './config/environment.config.js';

type AppState = 'setup' | 'playing' | 'listening_for_answer' | 'feedback' | 'listening_for_command';

function App() {
  const [appState, setAppState] = useState<AppState>('setup');
  const [openAIKey, setOpenAIKey] = useState(() => {
    return import.meta.env.VITE_OPENAI_API_KEY || localStorage.getItem('openai_key') || '';
  });
  const [elevenLabsKey, setElevenLabsKey] = useState(() => {
    return import.meta.env.VITE_ELEVENLABS_API_KEY || localStorage.getItem('elevenlabs_key') || '';
  });
  const [aiService, setAIService] = useState<AIService | null>(null);
  const [speechService, setSpeechService] = useState<SpeechService | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [currentInstruction, setCurrentInstruction] = useState('');

  const { gameState, updateGameState, updateStats, resetGame, nextWord } = useGameState();

  // Log environment status in development
  useEffect(() => {
    logEnvironmentStatus();
  }, []);

  // Initialize services when keys change
  useEffect(() => {
    if (openAIKey) {
      setAIService(new AIService(openAIKey));
      localStorage.setItem('openai_key', openAIKey);
    }
  }, [openAIKey]);

  useEffect(() => {
    const service = new SpeechService(elevenLabsKey, gameState.speechMode);
    setSpeechService(service);
    if (elevenLabsKey) {
      localStorage.setItem('elevenlabs_key', elevenLabsKey);
    }
  }, [elevenLabsKey, gameState.speechMode]);

  // Update speech service mode when it changes
  useEffect(() => {
    if (speechService) {
      speechService.setSpeechMode(gameState.speechMode);
    }
  }, [speechService, gameState.speechMode]);

  // Conversational flow management
  useEffect(() => {
    const handleConversationalFlow = async () => {
      if (!speechService) return;

      switch (appState) {
        case 'listening_for_answer':
          // Only start listening if speech mode is not disabled
          if (!isListening && gameState.speechMode !== 'disabled') {
            startListeningForAnswer();
          }
          break;

        case 'feedback':
          if (gameState.isCorrect !== null) {
            // Use optimized feedback based on speech mode
            let feedbackText = '';
            
            if (gameState.speechMode === 'concise') {
              feedbackText = gameState.isCorrect 
                ? `Correct! The word was ${gameState.currentWord?.word}. Say next word or go home.`
                : `Incorrect. The word was ${gameState.currentWord?.word}. Say next word or go home.`;
            } else if (gameState.speechMode === 'full') {
              feedbackText = gameState.isCorrect 
                ? `Excellent work! The correct word was ${gameState.currentWord?.word}. Say "next word" to continue, or say "go home" to return to the main menu.`
                : `Not quite right. The correct word was ${gameState.currentWord?.word}. Don't worry, let's try another one. Say "next word" to continue, or say "go home" to return to the main menu.`;
            } else {
              // For disabled mode, set a simple instruction
              feedbackText = gameState.isCorrect 
                ? `Correct! The word was ${gameState.currentWord?.word}.`
                : `Incorrect. The word was ${gameState.currentWord?.word}.`;
            }
            
            setCurrentInstruction(feedbackText);
            
            if (gameState.speechMode !== 'disabled') {
              try {
                await speechService.speakText(feedbackText);
              } catch (error) {
                console.error('Speech synthesis error:', error);
              }
            }
            
            setAppState('listening_for_command');
          }
          break;

        case 'listening_for_command':
          // Only start listening if speech mode is not disabled
          if (!isListening && gameState.speechMode !== 'disabled') {
            startListeningForCommand();
          }
          break;
      }
    };

    handleConversationalFlow();
  }, [appState, speechService, gameState.isCorrect, gameState.currentWord, gameState.speechMode, isListening]);

  const startListeningForCommand = useCallback(async () => {
    if (!speechService || isListening || gameState.speechMode === 'disabled') return;

    setIsListening(true);
    
    try {
      const transcript = await speechService.startListening();
      setIsListening(false);
      
      const command = transcript.toLowerCase().trim();
      
      // Process voice commands
      if (command.includes('next word') && appState === 'listening_for_command') {
        handleNextWord();
      } else if (command.includes('go home')) {
        handleCompleteReset();
      } else {
        // Unrecognized command - use concise response
        const errorMessage = gameState.speechMode === 'concise' 
          ? 'Try again. Say next word or go home.'
          : 'I didn\'t understand that command. Please say "next word" to continue or "go home" to return to the main menu.';
        
        setCurrentInstruction(errorMessage);
        await speechService.speakText(errorMessage);
        setAppState('listening_for_command');
      }
      
    } catch (error) {
      console.error('Speech recognition error:', error);
      setIsListening(false);
      setAppState('listening_for_command');
    }
  }, [speechService, isListening, appState, gameState.speechMode]);

  const startListeningForAnswer = useCallback(async () => {
    if (!speechService || isListening || gameState.speechMode === 'disabled') return;

    setIsListening(true);
    
    try {
      const transcript = await speechService.startListening();
      setIsListening(false);
      
      // This is an answer attempt during gameplay
      const command = transcript.toLowerCase().trim();
      const isCorrect = command === gameState.currentWord?.word.toLowerCase();
      updateGameState({ lastAnswer: transcript, selectedChoice: transcript });
      updateStats(isCorrect);
      setAppState('feedback');
      
    } catch (error) {
      console.error('Speech recognition error:', error);
      setIsListening(false);
      setAppState('listening_for_answer');
    }
  }, [speechService, isListening, gameState.currentWord, updateGameState, updateStats, gameState.speechMode]);

  // Handle manual answer submission for disabled speech mode
  const handleManualAnswer = useCallback((answer: string) => {
    if (!gameState.currentWord || gameState.speechMode !== 'disabled') return;
    
    const isCorrect = answer.toLowerCase().trim() === gameState.currentWord.word.toLowerCase();
    updateGameState({ lastAnswer: answer, selectedChoice: answer });
    updateStats(isCorrect);
    setAppState('feedback');
  }, [gameState.currentWord, gameState.speechMode, updateGameState, updateStats]);

  // Handle multiple choice selection
  const handleMultipleChoiceAnswer = useCallback((selectedOption: string) => {
    if (!gameState.currentWord) return;
    
    const isCorrect = selectedOption.toLowerCase().trim() === gameState.currentWord.word.toLowerCase();
    updateGameState({ lastAnswer: selectedOption, selectedChoice: selectedOption });
    updateStats(isCorrect);
    setAppState('feedback');
  }, [gameState.currentWord, updateGameState, updateStats]);

  const startGame = useCallback(async () => {
    try {
      // Use AI service to get word and clue
      if (aiService) {
        console.log('Using AI service to generate word and clue...');
        const wordAndClue = await aiService.fetchWordAndClue(gameState.selectedLevel);
        
        updateGameState({ 
          currentWord: wordAndClue.word,
          currentClue: wordAndClue.clue,
          isPlaying: true,
          showAnswer: false,
          isCorrect: null,
          lastAnswer: '',
          multipleChoiceOptions: wordAndClue.multipleChoiceOptions,
          selectedChoice: null
        });

        // Optimize instruction based on speech mode
        let instruction = '';
        if (gameState.speechMode === 'concise') {
          instruction = 'Listen to the clue, then choose your answer or speak it.';
        } else if (gameState.speechMode === 'full') {
          instruction = 'Listen carefully to the clue and context, then select your answer from the options below or speak it clearly.';
        } else {
          instruction = 'Read the clue and context below, then select your answer from the multiple choice options.';
        }
        
        setCurrentInstruction(instruction);
        setAppState('playing');
        
        // Create optimized speech text based on mode
        let speechText = '';
        if (gameState.speechMode === 'concise') {
          speechText = `Challenge: ${wordAndClue.clue}. This ${wordAndClue.word.partOfSpeech} means "${wordAndClue.word.definition}". Choose your answer.`;
        } else if (gameState.speechMode === 'full') {
          speechText = `Let's begin. Here is your vocabulary challenge: ${wordAndClue.clue}. For context: This is a ${wordAndClue.word.partOfSpeech} that means "${wordAndClue.word.definition}". Now, what word fits in the blank? You can select from the options below or speak your answer clearly.`;
        }
        
        // Start speech synthesis if not disabled
        if (speechService && gameState.speechMode !== 'disabled') {
          try {
            await speechService.speakText(speechText);
            setAppState('listening_for_answer');
          } catch (error) {
            console.error('Speech synthesis error:', error);
            setAppState('listening_for_answer');
          }
        } else {
          // For disabled mode, go directly to listening_for_answer state but don't actually listen
          setAppState('listening_for_answer');
        }
      } else {
        throw new Error('AI service not available');
      }
    } catch (error) {
      console.error('Failed to start game:', error);
      
      // Fallback to Oxford 3000 words
      const word = getRandomWord(gameState.selectedLevel === 'ALL' ? undefined : gameState.selectedLevel);
      const fallbackClue = `This word means "${word.definition}". Complete this sentence: "${word.example.replace(word.word, '____')}"`;
      
      // Generate simple multiple choice options for fallback
      const allWords = [word.word, 'example', 'answer', 'question'];
      const shuffledOptions = allWords.sort(() => Math.random() - 0.5);
      
      updateGameState({ 
        currentWord: word,
        currentClue: fallbackClue,
        isPlaying: true,
        showAnswer: false,
        isCorrect: null,
        lastAnswer: '',
        multipleChoiceOptions: shuffledOptions,
        selectedChoice: null
      });

      const instruction = gameState.speechMode === 'disabled' 
        ? 'Read the clue and context below, then select your answer from the options.'
        : 'Listen carefully to the clue, then choose your answer or speak it clearly.';
      
      setCurrentInstruction(instruction);
      setAppState('playing');
      
      // Fallback speech without high-quality synthesis
      const fallbackSpeechText = gameState.speechMode === 'concise'
        ? `Challenge: ${fallbackClue}. Choose your answer.`
        : `Let's begin with a vocabulary challenge. ${fallbackClue}. Please select your answer from the options or speak it clearly.`;
      
      if (speechService && gameState.speechMode !== 'disabled') {
        try {
          await speechService.speakText(fallbackSpeechText);
          setAppState('listening_for_answer');
        } catch (speechError) {
          console.error('Speech synthesis also failed:', speechError);
          setAppState('listening_for_answer');
        }
      } else {
        setAppState('listening_for_answer');
      }
    }
  }, [gameState.selectedLevel, gameState.speechMode, aiService, speechService, updateGameState]);

  const handleNextWord = useCallback(() => {
    nextWord();
    startGame();
  }, [nextWord, startGame]);

  // Complete reset function that stops all processes and refreshes the app
  const handleCompleteReset = useCallback(() => {
    console.log('Performing complete application reset...');
    
    // Stop all speech processes immediately
    if (speechService) {
      speechService.stopListening();
      speechService.stopSpeaking();
      speechService.clearCache();
    }
    
    // Stop any ongoing listening
    setIsListening(false);
    
    // Clear all timeouts and intervals
    const highestTimeoutId = setTimeout(() => {}, 0);
    for (let i = 0; i < highestTimeoutId; i++) {
      clearTimeout(i);
      clearInterval(i);
    }
    
    // Reset all state to initial values
    resetGame();
    setAppState('setup');
    setCurrentInstruction('');
    
    // Force a complete page refresh to ensure clean state
    setTimeout(() => {
      window.location.reload();
    }, 100);
  }, [speechService, resetGame]);

  const handleReturnHome = useCallback(() => {
    handleCompleteReset();
  }, [handleCompleteReset]);

  const handleLevelChange = useCallback((level: 'A1' | 'A2' | 'B1' | 'B2' | 'ALL') => {
    updateGameState({ selectedLevel: level });
  }, [updateGameState]);

  const handleSpeechModeChange = useCallback((mode: SpeechMode) => {
    updateGameState({ speechMode: mode });
  }, [updateGameState]);

  if (appState === 'setup') {
    return (
      <div key="setup" className="animate-fade-in">
        <GameSetup
          selectedLevel={gameState.selectedLevel}
          speechMode={gameState.speechMode}
          onLevelChange={handleLevelChange}
          onSpeechModeChange={handleSpeechModeChange}
          onStartGame={startGame}
        />
      </div>
    );
  }

  // Render GameInterface for ALL game-related states
  if (appState === 'playing' || appState === 'listening_for_answer' || appState === 'feedback' || appState === 'listening_for_command') {
    return (
      <div key="game" className="animate-fade-in">
        <GameInterface
          currentClue={gameState.currentClue}
          currentWord={gameState.currentWord}
          isListening={isListening}
          isCorrect={gameState.isCorrect}
          showAnswer={appState === 'feedback' || appState === 'listening_for_command'}
          lastAnswer={gameState.lastAnswer}
          stats={gameState.gameStats}
          currentInstruction={currentInstruction}
          appState={appState}
          speechMode={gameState.speechMode}
          multipleChoiceOptions={gameState.multipleChoiceOptions}
          selectedChoice={gameState.selectedChoice}
          onNextWord={handleNextWord}
          onGoHome={handleCompleteReset}
          onManualAnswer={handleManualAnswer}
          onMultipleChoiceAnswer={handleMultipleChoiceAnswer}
        />
      </div>
    );
  }

  return null;
}

export default App;