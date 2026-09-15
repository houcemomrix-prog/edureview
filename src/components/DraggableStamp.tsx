import React, { useState, useRef, useEffect } from 'react';

interface DraggableStampProps {
  src: string;
  language: 'ar' | 'en';
  /** Save callback optional to persist offsets */
  storageKey?: string;
  className?: string;
  defaultRotate?: number;
  defaultOffsetX?: number;
  defaultOffsetY?: number;
}

export const DraggableStamp: React.FC<DraggableStampProps> = ({
  src,
  language,
  storageKey = 'oman_moe_stamp_pos',
  className = '',
  defaultRotate = -5,
  defaultOffsetX = 0,
  defaultOffsetY = 0,
}) => {
  const [position, setPosition] = useState<{ x: number; y: number }>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = window.localStorage.getItem(storageKey);
        if (saved) return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return { x: defaultOffsetX, y: defaultOffsetY };
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = window.localStorage.getItem(storageKey);
        if (!saved) {
          setPosition({ x: defaultOffsetX, y: defaultOffsetY });
        }
      } catch (e) {}
    }
  }, [defaultOffsetX, defaultOffsetY, storageKey]);

  const [scale, setScale] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedScale = window.localStorage.getItem(storageKey + '_scale');
        if (savedScale) return parseFloat(savedScale);
      } catch (e) {
      }
    }
    return 1;
  });

  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const elementStart = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return; // Only left click
    e.preventDefault();
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    elementStart.current = { x: position.x, y: position.y };
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length !== 1) return;
    setIsDragging(true);
    dragStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    elementStart.current = { x: position.x, y: position.y };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      const newPos = {
        x: elementStart.current.x + dx,
        y: elementStart.current.y + dy,
      };
      setPosition(newPos);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging || e.touches.length !== 1) return;
      const dx = e.touches[0].clientX - dragStart.current.x;
      const dy = e.touches[0].clientY - dragStart.current.y;
      const newPos = {
        x: elementStart.current.x + dx,
        y: elementStart.current.y + dy,
      };
      setPosition(newPos);
    };

    const handleDragEnd = () => {
      if (isDragging) {
        setIsDragging(false);
        try {
          window.localStorage.setItem(storageKey, JSON.stringify(position));
        } catch (e) {
          // ignore
        }
      }
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleDragEnd);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleDragEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleDragEnd);
    };
  }, [isDragging, position, storageKey]);

  return (
    <div
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      className={`absolute select-none z-25 group cursor-move active:scale-105 transition-transform duration-75 flex items-center justify-center ${className}`}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        touchAction: 'none',
      }}
    >
      {/* Official Stamp Image */}
      <img
        src={src}
        alt="Official Stamp"
        className="w-24 h-24 object-contain pointer-events-none"
        style={{
          transform: `scale(${scale}) rotate(${defaultRotate}deg)`,
          transformOrigin: 'center',
        }}
        referrerPolicy="no-referrer"
      />

      {/* Helper drag border - visible only on screen and when active / hovered */}
      <div 
        data-html2canvas-ignore="true"
        className={`absolute inset-[-4px] rounded-full border-2 border-dashed transition-all duration-200 pointer-events-none print:hidden
          ${isDragging 
            ? 'border-emerald-500 bg-emerald-500/10 scale-105 shadow-md shadow-emerald-500/20' 
            : 'border-transparent group-hover:border-[#821315]/70 group-hover:bg-[#821315]/5'
          }
        `}
      />

      {/* Helper tooltip info text */}
      <div 
        data-html2canvas-ignore="true"
        className={`absolute -bottom-6 bg-slate-900/90 text-[10px] text-white px-2 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 font-bold transition-opacity pointer-events-none print:hidden z-30 transition-transform duration-200
          ${isDragging ? 'opacity-100 scale-95' : ''}
        `}
        dir={language === 'ar' ? 'rtl' : 'ltr'}
      >
        {language === 'ar' ? '← اسحب لضبط مكان الختم →' : '↔ Drag to reposition ↕'}
      </div>

      {/* Scale controls */}
      <div data-html2canvas-ignore="true" className="absolute -right-6 top-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity print:hidden z-30 pointer-events-auto">
        <button
          onClick={(e) => {
            e.stopPropagation();
            const newScale = Math.min(scale + 0.1, 3);
            setScale(newScale);
            try { window.localStorage.setItem(storageKey + '_scale', newScale.toString()); } catch (err) {}
          }}
          className="bg-slate-700 text-white p-1 rounded-full shadow hover:bg-slate-600 flex items-center justify-center w-5 h-5"
          title={language === 'ar' ? 'تكبير' : 'Zoom In'}
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            const newScale = Math.max(scale - 0.1, 0.3);
            setScale(newScale);
            try { window.localStorage.setItem(storageKey + '_scale', newScale.toString()); } catch (err) {}
          }}
          className="bg-slate-700 text-white p-1 rounded-full shadow hover:bg-slate-600 flex items-center justify-center w-5 h-5"
          title={language === 'ar' ? 'تصغير' : 'Zoom Out'}
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" />
          </svg>
        </button>
      </div>
      
      {/* Reset button inside group to quickly put it back */}
      {(position.x !== defaultOffsetX || position.y !== defaultOffsetY) && (
        <button
          data-html2canvas-ignore="true"
          onClick={(e) => {
            e.stopPropagation();
            setPosition({ x: defaultOffsetX, y: defaultOffsetY });
            try {
              window.localStorage.removeItem(storageKey);
            } catch (err) {}
          }}
          className="absolute -top-6 bg-rose-600 text-white p-1 rounded-full shadow hover:bg-rose-700 pointer-events-auto opacity-0 group-hover:opacity-100 transition-opacity print:hidden z-30 flex items-center justify-center w-5 h-5"
          title={language === 'ar' ? 'إعادة ضبط الموضع' : 'Reset Position'}
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default DraggableStamp;
