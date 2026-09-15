import React, { useState, useEffect, useRef } from 'react';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface DocumentViewerProps {
  children: React.ReactNode;
  language: 'ar' | 'en';
  documentWidth?: number;
}

export function DocumentViewer({ children, language, documentWidth = 1000 }: DocumentViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [hasAutoFit, setHasAutoFit] = useState(false);

  useEffect(() => {
    const fitToScreen = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        // Adding a 40px buffer for padding
        if (containerWidth < documentWidth + 40) {
          setZoom((containerWidth - 40) / documentWidth);
        } else {
          setZoom(1);
        }
      }
    };
    
    if (!hasAutoFit) {
      setTimeout(() => {
        fitToScreen();
        setHasAutoFit(true);
      }, 100);
    }
    
    window.addEventListener('resize', fitToScreen);
    return () => window.removeEventListener('resize', fitToScreen);
  }, [documentWidth, hasAutoFit]);

  const handleZoomIn = () => setZoom(z => Math.min(z + 0.15, 2.5));
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.15, 0.3));
  const handleReset = () => {
     if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        if (containerWidth < documentWidth + 40) {
          setZoom((containerWidth - 40) / documentWidth);
        } else {
          setZoom(1);
        }
      }
  };

  return (
    <div className="flex flex-col border border-slate-300 rounded-3xl overflow-hidden bg-slate-900/5 shadow-inner my-4">
      {/* Viewer Toolbar */}
      <div className="bg-slate-100/95 backdrop-blur-sm border-b border-slate-300 p-2 sm:p-3 flex items-center justify-between z-10" dir={language === 'ar' ? 'rtl' : 'ltr'}>
         <div className="text-[11px] sm:text-xs font-bold text-slate-600 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-sm"></span>
            {language === 'ar' ? 'عارض المستندات الذكي (نمط PDF)' : 'Smart PDF Viewer'}
         </div>
         <div className="flex items-center gap-1 bg-white p-1 rounded-xl shadow-xs border border-slate-200" dir="ltr">
           <button type="button" onClick={handleZoomOut} className="p-1.5 hover:bg-slate-100 text-slate-700 rounded-lg transition-colors cursor-pointer" title={language === 'ar' ? 'تصغير' : 'Zoom Out'}>
             <ZoomOut className="w-4 h-4" />
           </button>
           <div className="text-[11px] font-mono font-black text-slate-600 w-12 text-center select-none">
             {Math.round(zoom * 100)}%
           </div>
           <button type="button" onClick={handleZoomIn} className="p-1.5 hover:bg-slate-100 text-slate-700 rounded-lg transition-colors cursor-pointer" title={language === 'ar' ? 'تكبير' : 'Zoom In'}>
             <ZoomIn className="w-4 h-4" />
           </button>
           <div className="w-px h-4 bg-slate-300 mx-1"></div>
           <button type="button" onClick={handleReset} className="p-1.5 hover:bg-slate-100 text-slate-700 rounded-lg transition-colors cursor-pointer" title={language === 'ar' ? 'ملاءمة الشاشة' : 'Fit to Screen'}>
             <Maximize2 className="w-4 h-4" />
           </button>
         </div>
      </div>
      
      {/* Scrollable Canvas Viewport */}
      <div 
        ref={containerRef}
        className="overflow-auto relative bg-slate-900/5 custom-scrollbar" 
        style={{ height: '70vh', minHeight: '500px', maxHeight: '800px' }}
      >
         <div 
            className="py-8 px-4 flex justify-center"
            style={{ 
              minWidth: `${documentWidth * zoom}px`,
            }}
         >
            <div style={{ 
              transform: `scale(${zoom})`,
              transformOrigin: 'top center',
              transition: 'transform 0.15s ease-out'
            }}>
              {children}
            </div>
         </div>
      </div>
    </div>
  );
}
