import React, { useState } from 'react';
import { Target, Home, BookOpen, Volume2, VolumeX, ArrowRight, Volume1, Check } from 'lucide-react';
import { SpeechMode } from '../services/speechService';

interface Word {
  word: string;
  level: 'A1' | 'A2' | 'B1' | 'B2';
  definition: string;
  example: string;
  partOfSpeech: string;
}

interface GameInterfaceProps {
  currentClue: string;
  currentWord: Word | null;
  isListening: boolean;
  isCorrect: boolean | null;
  showAnswer: boolean;
  lastAnswer: string;
  stats: {
    correctAnswers: number;
    totalAttempted: number;
    currentStreak: number;
  };
  currentInstruction: string;
  appState: string;
  speechMode: SpeechMode;
  multipleChoiceOptions: string[];
  selectedChoice: string | null;
  onNextWord: () => void;
  onGoHome: () => void;
  onManualAnswer: (answer: string) => void;
  onMultipleChoiceAnswer: (answer: string) => void;
}

export const GameInterface: React.FC<GameInterfaceProps> = ({
  currentClue,
  currentWord,
  isListening,
  isCorrect,
  showAnswer,
  lastAnswer,
  stats,
  currentInstruction,
  appState,
  speechMode,
  multipleChoiceOptions,
  selectedChoice,
  onNextWord,
  onGoHome,
  onManualAnswer,
  onMultipleChoiceAnswer
}) => {
  const [manualAnswer, setManualAnswer] = useState('');

  const accuracy = stats.totalAttempted > 0 ? Math.round((stats.correctAnswers / stats.totalAttempted) * 100) : 0;

  const handleManualSubmit = () => {
    if (!manualAnswer.trim() || !currentWord) return;
    
    // Call the parent handler to process the answer
    onManualAnswer(manualAnswer.trim());
    
    // Clear the input
    setManualAnswer('');
  };

  const handleMultipleChoiceClick = (option: string) => {
    if (showAnswer) return; // Prevent clicking after answer is shown
    onMultipleChoiceAnswer(option);
  };

  const getAnswerFeedback = () => {
    if (!showAnswer || isCorrect === null || !currentWord) return null;
    
    return (
      <div 
        key={`feedback-${currentWord.word}-${isCorrect}`}
        className={`liquid-glass-feedback-card animate-fade-in-up ${
          isCorrect ? 'liquid-glass-feedback-correct' : 'liquid-glass-feedback-incorrect'
        }`}
      >
        <div className={`font-medium text-lg mb-3 ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
          {isCorrect ? '✓ Excellent!' : '✗ Not quite right'}
        </div>
        <div className="text-gray-700 mb-2 text-sm">
          You {speechMode === 'disabled' ? 'selected' : 'said'}: <span className="font-medium">"{lastAnswer}"</span>
        </div>
        <div className="text-gray-700 text-sm mb-3">
          Correct answer: <span className="font-medium">"{currentWord.word}"</span>
        </div>
        
        {/* Word Learning Context */}
        <div className="border-t border-gray-200 pt-3 mt-3">
          <div className="text-xs text-gray-600 mb-2 font-medium">💡 Remember this word:</div>
          <div className="text-sm text-gray-700 mb-2">
            <span className="font-medium">{currentWord.word}</span> ({currentWord.partOfSpeech}) - {currentWord.definition}
          </div>
          <div className="text-xs text-gray-600 italic">
            Example: "{currentWord.example}"
          </div>
        </div>

        {/* Action buttons for disabled speech mode */}
        {speechMode === 'disabled' && (
          <div className="flex gap-2 mt-4">
            <button
              onClick={onNextWord}
              className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
            >
              <ArrowRight className="w-4 h-4" />
              Next Word
            </button>
            <button
              onClick={onGoHome}
              className="bg-gray-500 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-600 transition-colors"
            >
              <Home className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    );
  };

  const getWordContext = () => {
    if (!currentWord || showAnswer) return null;
    
    return (
      <div className="liquid-glass-context-card mb-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="w-4 h-4 text-blue-500" />
          <span className="text-sm font-medium text-gray-700">Word Context</span>
        </div>
        
        <div className="space-y-2 text-sm text-gray-700">
          <div>
            <span className="font-medium text-gray-800">Type:</span> {currentWord.partOfSpeech}
          </div>
          <div>
            <span className="font-medium text-gray-800">Level:</span> {currentWord.level}
          </div>
          <div>
            <span className="font-medium text-gray-800">Meaning:</span> {currentWord.definition}
          </div>
        </div>
      </div>
    );
  };

  const getMultipleChoiceOptions = () => {
    if (!multipleChoiceOptions.length || showAnswer) return null;

    return (
      <div className="w-full max-w-sm mx-auto mb-6 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
        <div className="text-sm font-medium text-gray-700 mb-3 text-center">Choose your answer:</div>
        <div className="grid grid-cols-2 gap-3">
          {multipleChoiceOptions.map((option, index) => (
            <button
              key={`${option}-${index}`}
              onClick={() => handleMultipleChoiceClick(option)}
              className="liquid-glass-button border border-white/30 hover:border-blue-400/50 p-3 rounded-xl transition-all duration-200 hover:shadow-lg hover:bg-white/40 text-gray-800 font-medium text-sm"
              disabled={showAnswer}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const getSpeechModeIndicator = () => {
    const icons = {
      full: Volume2,
      concise: Volume1,
      disabled: VolumeX
    };
    
    const colors = {
      full: 'text-blue-500',
      concise: 'text-green-500',
      disabled: 'text-gray-500'
    };
    
    const labels = {
      full: 'Full',
      concise: 'Brief',
      disabled: 'Silent'
    };
    
    const Icon = icons[speechMode];
    
    return (
      <div className={`flex items-center gap-1 text-xs ${colors[speechMode]}`}>
        <Icon className="w-3 h-3" />
        <span>{labels[speechMode]}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-3 flex flex-col">
      <div className="max-w-md mx-auto w-full flex flex-col min-h-screen">
        {/* Compact Header */}
        <div className="liquid-glass-header mb-4 py-3 px-4 animate-slide-up">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-600">
              <button
                onClick={onGoHome}
                className="flex items-center gap-2 hover:text-blue-600 transition-colors duration-200 p-1 rounded-lg hover:bg-white/20"
                title="Return to Home"
              >
                <Home className="w-4 h-4" />
                <span className="font-light text-sm">
                  Voc<span className="text-blue-500 font-medium">AI</span>bulary
                </span>
              </button>
              {getSpeechModeIndicator()}
            </div>
            
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Target className="w-4 h-4 text-blue-500" />
                <span className="font-light text-gray-700">
                  {stats.correctAnswers}/{stats.totalAttempted}
                </span>
              </div>
              
              <div className="text-xs text-gray-600 font-light">
                Streak: <span className="font-bold text-orange-500">{stats.currentStreak}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Game Area - Flexible Height */}
        <div className="liquid-glass-game-card flex-1 flex flex-col justify-between p-6 animate-scale-in">
          {/* Clue Section */}
          <div className="text-center">
            <h2 className="text-2xl font-light text-gray-900 mb-4 tracking-tight animate-fade-in-up">
              {speechMode === 'disabled' ? 'Read & Choose' : 'Listen & Respond'}
            </h2>
            
            {currentClue && (
              <div 
                key={`clue-${currentWord?.word}`}
                className="liquid-glass-clue-card mb-4 animate-fade-in-up"
                style={{ animationDelay: '0.1s' }}
              >
                <div className="flex items-center gap-2 mb-3">
                  {speechMode === 'disabled' ? (
                    <BookOpen className="w-4 h-4 text-blue-500" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-blue-500" />
                  )}
                  <span className="text-sm font-medium text-gray-700">Guess the Word</span>
                </div>
                <p className="text-base text-gray-800 leading-relaxed font-light">
                  {currentClue}
                </p>
              </div>
            )}

            {/* Word Context - Only show during gameplay, not during feedback */}
            {getWordContext()}

            {/* Multiple Choice Options */}
            {getMultipleChoiceOptions()}

            {/* Answer Feedback */}
            {getAnswerFeedback()}
          </div>

          {/* Voice Interaction Area */}
          <div className="flex flex-col items-center gap-4">
            {/* Voice Indicator - Hide for disabled speech mode */}
            {speechMode !== 'disabled' && (
              <div 
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500 animate-scale-in ${
                  isListening
                    ? 'bg-gradient-to-r from-red-400 to-pink-500 animate-pulse shadow-xl shadow-red-200'
                    : appState === 'playing'
                    ? 'bg-gradient-to-r from-green-400 to-emerald-500 shadow-lg shadow-green-200'
                    : 'bg-gradient-to-r from-blue-400 to-indigo-500 shadow-lg shadow-blue-200'
                }`}
                style={{ animationDelay: '0.2s' }}
              >
                <div className={`w-6 h-6 rounded-full transition-all duration-300 ${
                  isListening ? 'bg-white animate-pulse' : 'bg-white'
                }`}></div>
              </div>
            )}

            {/* Instruction Text */}
            <div 
              key={`instruction-${currentInstruction}`}
              className="liquid-glass-instruction-card animate-fade-in-up"
              style={{ animationDelay: '0.3s' }}
            >
              <p className="text-gray-800 leading-relaxed font-light text-sm text-center">
                {currentInstruction}
              </p>
            </div>

            {/* Listening Animation - Hide for disabled speech mode */}
            {isListening && speechMode !== 'disabled' && (
              <div className="text-center animate-fade-in-up">
                <div className="flex justify-center space-x-1 mb-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <p className="text-xs text-gray-500 font-light">Listening...</p>
              </div>
            )}

            {/* Manual controls for disabled speech mode during gameplay - Only show if no multiple choice */}
            {speechMode === 'disabled' && !showAnswer && !multipleChoiceOptions.length && (
              <div className="w-full max-w-xs">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={manualAnswer}
                    onChange={(e) => setManualAnswer(e.target.value)}
                    placeholder="Type your answer here..."
                    className="flex-1 px-4 py-3 rounded-xl border border-gray-300 bg-white/80 backdrop-blur-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-center"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleManualSubmit();
                      }
                    }}
                    autoFocus
                  />
                  <button
                    onClick={handleManualSubmit}
                    disabled={!manualAnswer.trim()}
                    className="bg-blue-500 text-white px-4 py-3 rounded-xl font-medium hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-gray-500 text-center mt-2">Type your answer and press Enter or click submit</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};