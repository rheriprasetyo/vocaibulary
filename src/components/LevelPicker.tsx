import React, { useRef, useEffect, useState } from 'react';

interface LevelPickerProps {
  selectedLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'ALL';
  onLevelChange: (level: 'A1' | 'A2' | 'B1' | 'B2' | 'ALL') => void;
}

export const LevelPicker: React.FC<LevelPickerProps> = ({
  selectedLevel,
  onLevelChange
}) => {
  const pickerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  const [startY, setStartY] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);
  const [scrollTimeout, setScrollTimeout] = useState<NodeJS.Timeout | null>(null);

  const levels = [
    { value: 'ALL' as const, label: 'All Levels', description: 'Mixed difficulty', color: 'from-purple-400 to-pink-400' },
    { value: 'A1' as const, label: 'A1 - Beginner', description: 'Basic everyday words', color: 'from-green-400 to-emerald-400' },
    { value: 'A2' as const, label: 'A2 - Elementary', description: 'Common situations', color: 'from-blue-400 to-cyan-400' },
    { value: 'B1' as const, label: 'B1 - Intermediate', description: 'Work and study topics', color: 'from-yellow-400 to-orange-400' },
    { value: 'B2' as const, label: 'B2 - Upper-Intermediate', description: 'Complex ideas', color: 'from-red-400 to-pink-400' }
  ];

  const selectedIndex = levels.findIndex(level => level.value === selectedLevel);

  useEffect(() => {
    if (pickerRef.current && !isUserInteracting) {
      const itemHeight = 80; // Height of each picker item
      const containerHeight = pickerRef.current.clientHeight;
      const centerOffset = (containerHeight - itemHeight) / 2;
      const targetScrollTop = selectedIndex * itemHeight - centerOffset;
      
      pickerRef.current.scrollTo({
        top: Math.max(0, targetScrollTop),
        behavior: 'smooth'
      });
    }
  }, [selectedIndex, isUserInteracting]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setIsUserInteracting(true);
    setStartY(e.pageY - (pickerRef.current?.offsetTop || 0));
    setScrollTop(pickerRef.current?.scrollTop || 0);
    
    // Clear any existing scroll timeout
    if (scrollTimeout) {
      clearTimeout(scrollTimeout);
      setScrollTimeout(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !pickerRef.current) return;
    e.preventDefault();
    const y = e.pageY - (pickerRef.current.offsetTop || 0);
    const walk = (y - startY) * 2;
    pickerRef.current.scrollTop = scrollTop - walk;
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      snapToNearestItem();
      
      // Reset user interaction flag after a delay
      setTimeout(() => {
        setIsUserInteracting(false);
      }, 500);
    }
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      snapToNearestItem();
      
      // Reset user interaction flag after a delay
      setTimeout(() => {
        setIsUserInteracting(false);
      }, 500);
    }
  };

  const handleScroll = () => {
    // Only handle scroll if user is actively interacting
    if (!isUserInteracting || isDragging) return;
    
    // Clear existing timeout
    if (scrollTimeout) {
      clearTimeout(scrollTimeout);
    }
    
    // Set a new timeout to snap to nearest item
    const timeout = setTimeout(() => {
      snapToNearestItem();
      setIsUserInteracting(false);
    }, 150);
    
    setScrollTimeout(timeout);
  };

  const snapToNearestItem = () => {
    if (!pickerRef.current) return;
    
    const itemHeight = 80;
    const containerHeight = pickerRef.current.clientHeight;
    const centerOffset = (containerHeight - itemHeight) / 2;
    const scrollTop = pickerRef.current.scrollTop;
    const nearestIndex = Math.round((scrollTop + centerOffset) / itemHeight);
    const clampedIndex = Math.max(0, Math.min(nearestIndex, levels.length - 1));
    
    if (clampedIndex !== selectedIndex) {
      onLevelChange(levels[clampedIndex].value);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setIsUserInteracting(true);
    setStartY(e.touches[0].pageY - (pickerRef.current?.offsetTop || 0));
    setScrollTop(pickerRef.current?.scrollTop || 0);
    
    // Clear any existing scroll timeout
    if (scrollTimeout) {
      clearTimeout(scrollTimeout);
      setScrollTimeout(null);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !pickerRef.current) return;
    const y = e.touches[0].pageY - (pickerRef.current.offsetTop || 0);
    const walk = (y - startY) * 2;
    pickerRef.current.scrollTop = scrollTop - walk;
  };

  const handleTouchEnd = () => {
    if (isDragging) {
      setIsDragging(false);
      snapToNearestItem();
      
      // Reset user interaction flag after a delay
      setTimeout(() => {
        setIsUserInteracting(false);
      }, 500);
    }
  };

  const handleItemClick = (level: typeof levels[0]) => {
    setIsUserInteracting(true);
    onLevelChange(level.value);
    
    // Reset user interaction flag after a delay
    setTimeout(() => {
      setIsUserInteracting(false);
    }, 500);
  };

  // Handle wheel events for better scroll control
  const handleWheel = (e: React.WheelEvent) => {
    setIsUserInteracting(true);
    
    // Clear existing timeout
    if (scrollTimeout) {
      clearTimeout(scrollTimeout);
    }
    
    // Set a new timeout to snap to nearest item
    const timeout = setTimeout(() => {
      snapToNearestItem();
      setIsUserInteracting(false);
    }, 300);
    
    setScrollTimeout(timeout);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
    };
  }, [scrollTimeout]);

  return (
    <div className="relative">
      <h2 className="text-base font-medium text-gray-700 mb-3 text-center">Choose Your Level</h2>
      
      {/* Picker Container */}
      <div className="relative h-64 overflow-hidden rounded-2xl">
        {/* Fade Gradients - More subtle */}
        <div className="absolute top-0 inset-x-0 h-12 bg-gradient-to-b from-white/40 to-transparent pointer-events-none z-20"></div>
        <div className="absolute bottom-0 inset-x-0 h-12 bg-gradient-to-t from-white/40 to-transparent pointer-events-none z-20"></div>
        
        {/* Scrollable Items */}
        <div
          ref={pickerRef}
          className="h-full overflow-y-scroll scrollbar-hide px-4 py-20"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onScroll={handleScroll}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onWheel={handleWheel}
        >
          {levels.map((level, index) => {
            const isSelected = level.value === selectedLevel;
            const distance = Math.abs(index - selectedIndex);
            const opacity = Math.max(0.4, 1 - distance * 0.25);
            const scale = Math.max(0.85, 1 - distance * 0.08);
            
            return (
              <div
                key={level.value}
                className="h-20 flex items-center justify-center mb-2 transition-all duration-300 cursor-pointer animate-fade-in-up"
                style={{ 
                  opacity,
                  transform: `scale(${scale})`,
                  animationDelay: `${index * 0.1}s`
                }}
                onClick={() => handleItemClick(level)}
              >
                <div className={`w-full liquid-glass-level-card ${
                  isSelected ? 'liquid-glass-level-selected' : 'liquid-glass-level-unselected'
                } py-3 px-4 transition-all duration-300`}>
                  <div className="flex items-center gap-3">
                    {/* Level Indicator */}
                    <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${level.color} shadow-sm`}></div>
                    
                    {/* Level Info */}
                    <div className="flex-1">
                      <div className={`font-medium text-sm ${
                        isSelected ? 'text-gray-900' : 'text-gray-500'
                      }`}>{level.label}</div>
                      <div className={`text-xs mt-1 ${
                        isSelected ? 'text-gray-700' : 'text-gray-400'
                      }`}>{level.description}</div>
                    </div>
                    
                    {/* Selection Indicator */}
                    {isSelected && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Instructions */}
      <div className="text-center mt-3">
        <p className="text-xs text-gray-500 font-light">Scroll, drag, or click to select your level</p>
      </div>
    </div>
  );
};