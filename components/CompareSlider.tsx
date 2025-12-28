import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CompareSliderProps {
  original: string;
  generated: string | null;
  className?: string;
}

export const CompareSlider: React.FC<CompareSliderProps> = ({ original, generated, className = '' }) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const percentage = (x / rect.width) * 100;
      setSliderPosition(percentage);
    }
  }, []);

  const handleMouseDown = () => setIsDragging(true);
  const handleTouchStart = () => setIsDragging(true);
  
  const handleMouseUp = useCallback(() => setIsDragging(false), []);
  
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) handleMove(e.clientX);
  }, [isDragging, handleMove]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (isDragging) handleMove(e.touches[0].clientX);
  }, [isDragging, handleMove]);

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp, handleTouchMove]);

  if (!generated) {
    return (
      <div className={`relative w-full h-full overflow-hidden rounded-xl shadow-lg bg-gray-100 ${className}`}>
         <img src={original} alt="Original" className="w-full h-full object-cover" />
         <div className="absolute inset-0 flex items-center justify-center bg-black/20">
           <p className="text-white font-medium px-4 py-2 bg-black/50 rounded-lg backdrop-blur-sm">
             Select a style to generate a design
           </p>
         </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden rounded-xl shadow-lg select-none cursor-ew-resize group ${className}`}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      {/* Underlying Image (Generated - After) */}
      <img 
        src={generated} 
        alt="After" 
        className="absolute inset-0 w-full h-full object-cover" 
      />

      {/* Overlay Image (Original - Before) clipped by width */}
      <div 
        className="absolute inset-0 overflow-hidden" 
        style={{ width: `${sliderPosition}%` }}
      >
        <img 
          src={original} 
          alt="Before" 
          className="absolute inset-0 w-[100vw] max-w-none h-full object-cover" // max-w-none needed to prevent squishing inside clipped div if using vw, but actually simpler to use exact same dims as parent
          style={{ width: containerRef.current?.getBoundingClientRect().width || '100%' }}
        />
      </div>

      {/* Slider Handle */}
      <div 
        className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize shadow-[0_0_10px_rgba(0,0,0,0.5)] z-10"
        style={{ left: `${sliderPosition}%` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600">
           <div className="flex -space-x-1">
             <ChevronLeft size={14} />
             <ChevronRight size={14} />
           </div>
        </div>
      </div>
      
      {/* Labels */}
      <div className="absolute top-4 left-4 bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur-md pointer-events-none">
        Original
      </div>
      <div className="absolute top-4 right-4 bg-accent/80 text-white text-xs px-2 py-1 rounded backdrop-blur-md pointer-events-none">
        Reimagined
      </div>
    </div>
  );
};