import React, { useState } from 'react';
import { BookOpen, Play, Volume2, VolumeX, Volume1, Settings, ChevronDown } from 'lucide-react';
import { LevelPicker } from './LevelPicker';
import { SpeechMode } from '../services/speechService';

interface GameSetupProps {
  selectedLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'ALL';
  speechMode: SpeechMode;
  onLevelChange: (level: 'A1' | 'A2' | 'B1' | 'B2' | 'ALL') => void;
  onSpeechModeChange: (mode: SpeechMode) => void;
  onStartGame: () => void;
}

export const GameSetup: React.FC<GameSetupProps> = ({
  selectedLevel,
  speechMode,
  onLevelChange,
  onSpeechModeChange,
  onStartGame
}) => {
  const [showSpeechMenu, setShowSpeechMenu] = useState(false);

  const speechModes = [
    {
      value: 'disabled' as const,
      label: 'No Speech',
      description: 'Visual interface only, saves tokens',
      icon: VolumeX,
      color: 'from-gray-500 to-slate-600'
    },
    {
      value: 'concise' as const,
      label: 'Concise Speech',
      description: 'Brief, essential audio only',
      icon: Volume1,
      color: 'from-green-500 to-emerald-600'
    },
    {
      value: 'full' as const,
      label: 'Full Speech',
      description: 'Complete audio guidance and feedback',
      icon: Volume2,
      color: 'from-blue-500 to-indigo-600'
    }
  ];

  const currentSpeechMode = speechModes.find(mode => mode.value === speechMode) || speechModes[0];
  const CurrentIcon = currentSpeechMode.icon;

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="liquid-glass-card w-full max-w-sm animate-scale-in relative">
        {/* Speech Settings Popup */}
        {showSpeechMenu && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/20 backdrop-blur-xs z-40"
              onClick={() => setShowSpeechMenu(false)}
            />
            
            {/* Popup Menu - Positioned for left button */}
            <div className="absolute top-4 left-4 z-50 liquid-glass-card min-w-[280px] p-4 animate-scale-in">
              <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Speech Settings
              </h3>
              
              <div className="space-y-2">
                {speechModes.map((mode) => {
                  const Icon = mode.icon;
                  const isSelected = speechMode === mode.value;
                  
                  return (
                    <button
                      key={mode.value}
                      onClick={() => {
                        onSpeechModeChange(mode.value);
                        setShowSpeechMenu(false);
                      }}
                      className={`w-full p-3 rounded-xl transition-all duration-200 flex items-center gap-3 ${
                        isSelected
                          ? 'bg-white border-2 border-blue-200 shadow-lg'
                          : 'liquid-glass-button border border-white/30 hover:border-white/50'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-r ${mode.color}`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      
                      <div className="flex-1 text-left">
                        <div className={`font-medium text-sm ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
                          {mode.label}
                        </div>
                        <div className={`text-xs mt-1 ${isSelected ? 'text-gray-600' : 'text-gray-500'}`}>
                          {mode.description}
                        </div>
                      </div>
                      
                      {isSelected && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* Powered by Bolt Badge - Top Right */}
        <a
          href="https://bolt.new/"
          target="_blank"
          rel="noopener noreferrer"
          className="absolute top-4 right-4 z-30 transition-all duration-200 hover:scale-105 hover:opacity-80"
          title="Powered by Bolt"
        >
          <img
            src="/black_circle_360x360.png"
            alt="Powered by Bolt"
            className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full shadow-lg hover:shadow-xl transition-shadow duration-200"
          />
        </a>

        {/* YouTube Video Embed */}
        <div className="mb-6 animate-fade-in-up">
          <div className="liquid-glass-card p-4 rounded-2xl">
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              <iframe 
                className="absolute top-0 left-0 w-full h-full rounded-xl"
                src="https://www.youtube.com/embed/fsRdVvt4zlw?si=9V8wKNT8UKuu52FL" 
                title="VocAIbulary Demo Video" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                referrerPolicy="strict-origin-when-cross-origin" 
                allowFullScreen
              />
            </div>
            <p className="text-xs text-gray-600 text-center mt-2 font-light">
              Watch how VocAIbulary works
            </p>
          </div>
        </div>

        {/* App Header with Speech Settings Button */}
        <div className="flex items-center justify-between mb-6">
          {/* Speech Settings Button - Moved to left */}
          <button
            onClick={() => setShowSpeechMenu(!showSpeechMenu)}
            className="absolute top-4 left-4 liquid-glass-button border border-white/30 hover:border-white/50 p-2 rounded-xl transition-all duration-200 flex items-center gap-2 z-30"
            title="Speech Settings"
          >
            <CurrentIcon className="w-4 h-4 text-gray-600" />
            <ChevronDown className={`w-3 h-3 text-gray-600 transition-transform duration-200 ${showSpeechMenu ? 'rotate-180' : ''}`} />
          </button>
          
          <div className="text-center flex-1">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-4 liquid-glass-icon animate-float">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-light text-gray-900 mb-2 tracking-tight animate-fade-in-up">
              Voc<span className="text-blue-500 font-medium">AI</span>bulary
            </h1>
            <p className="text-gray-600 font-light text-sm animate-fade-in-up" style={{ animationDelay: '0.1s' }}>Master the Oxford 3000 words with AI-powered learning</p>
          </div>
        </div>

        {/* Level Picker */}
        <div className="mb-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <LevelPicker
            selectedLevel={selectedLevel}
            onLevelChange={onLevelChange}
          />
        </div>

        {/* Start Button */}
        <button
          onClick={onStartGame}
          className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-6 rounded-2xl font-medium hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-[1.02] flex items-center justify-center gap-2 animate-fade-in-up"
          style={{ animationDelay: '0.3s' }}
        >
          <Play className="w-5 h-5" />
          Start Learning
        </button>

        {/* Current Speech Mode Info */}
        <div className="liquid-glass-instruction-card mt-4 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <CurrentIcon className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">{currentSpeechMode.label}</span>
            </div>
            <p className="text-gray-700 text-xs leading-relaxed font-light">
              {speechMode === 'disabled' 
                ? 'No speech mode saves all API tokens. You\'ll interact using visual cues and multiple choice.'
                : speechMode === 'concise'
                ? 'Concise mode reduces token usage while maintaining essential audio guidance.'
                : 'Full speech mode uses more API tokens but provides the best learning experience.'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};