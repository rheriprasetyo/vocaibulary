import { useState, useCallback } from 'react';
import { SpeechMode } from '../services/speechService';

export interface Word {
  word: string;
  level: 'A1' | 'A2' | 'B1' | 'B2';
  definition: string;
  example: string;
  partOfSpeech: string;
}

export interface GameStats {
  totalAttempted: number;
  correctAnswers: number;
  incorrectAnswers: number;
  currentStreak: number;
  bestStreak: number;
}

export interface GameState {
  currentWord: Word | null;
  currentClue: string;
  isPlaying: boolean;
  gameStats: GameStats;
  selectedLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'ALL';
  showAnswer: boolean;
  lastAnswer: string;
  isCorrect: boolean | null;
  speechMode: SpeechMode;
  multipleChoiceOptions: string[];
  selectedChoice: string | null;
}

const initialStats: GameStats = {
  totalAttempted: 0,
  correctAnswers: 0,
  incorrectAnswers: 0,
  currentStreak: 0,
  bestStreak: 0
};

const initialState: GameState = {
  currentWord: null,
  currentClue: '',
  isPlaying: false,
  gameStats: initialStats,
  selectedLevel: 'ALL',
  showAnswer: false,
  lastAnswer: '',
  isCorrect: null,
  speechMode: 'disabled',
  multipleChoiceOptions: [],
  selectedChoice: null
};

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>(() => {
    // Load speech mode from localStorage
    const savedSpeechMode = localStorage.getItem('speechMode') as SpeechMode;
    return {
      ...initialState,
      speechMode: savedSpeechMode || 'disabled' // Default to 'disabled' if no saved preference
    };
  });

  const updateGameState = useCallback((updates: Partial<GameState>) => {
    setGameState(prev => {
      const newState = { ...prev, ...updates };
      
      // Save speech mode to localStorage when it changes
      if (updates.speechMode && updates.speechMode !== prev.speechMode) {
        localStorage.setItem('speechMode', updates.speechMode);
      }
      
      return newState;
    });
  }, []);

  const updateStats = useCallback((isCorrect: boolean) => {
    setGameState(prev => {
      const newStats = { ...prev.gameStats };
      newStats.totalAttempted += 1;

      if (isCorrect) {
        newStats.correctAnswers += 1;
        newStats.currentStreak += 1;
        newStats.bestStreak = Math.max(newStats.bestStreak, newStats.currentStreak);
      } else {
        newStats.incorrectAnswers += 1;
        newStats.currentStreak = 0;
      }

      return {
        ...prev,
        gameStats: newStats,
        isCorrect,
        showAnswer: true
      };
    });
  }, []);

  const resetGame = useCallback(() => {
    setGameState(prev => ({
      ...initialState,
      speechMode: prev.speechMode // Preserve speech mode setting
    }));
  }, []);

  const nextWord = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      showAnswer: false,
      isCorrect: null,
      lastAnswer: '',
      multipleChoiceOptions: [],
      selectedChoice: null
    }));
  }, []);

  return {
    gameState,
    updateGameState,
    updateStats,
    resetGame,
    nextWord
  };
};