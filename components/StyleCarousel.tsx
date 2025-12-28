import React from 'react';
import { STYLES, StyleOption } from '../types';

interface StyleCarouselProps {
  onSelect: (style: StyleOption) => void;
  selectedId: string | null;
  disabled: boolean;
}

export const StyleCarousel: React.FC<StyleCarouselProps> = ({ onSelect, selectedId, disabled }) => {
  return (
    <div className="w-full overflow-x-auto py-4 scrollbar-hide">
      <div className="flex space-x-4 px-1">
        {STYLES.map((style) => (
          <button
            key={style.id}
            onClick={() => onSelect(style)}
            disabled={disabled}
            className={`
              group relative flex-shrink-0 w-32 h-40 rounded-xl overflow-hidden transition-all duration-300
              ${selectedId === style.id ? 'ring-4 ring-accent scale-105' : 'hover:scale-105 opacity-80 hover:opacity-100'}
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <img 
              src={style.thumbnail} 
              alt={style.name} 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <span className="text-white text-sm font-semibold block">{style.name}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};