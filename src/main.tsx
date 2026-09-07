import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Safely suppress benign HMR and development server websocket errors or rejections 
// from triggering uncaught error overlays and red flags in the browser preview.
if (typeof window !== 'undefined') {
  const isHmrError = (text: string) => {
    const str = String(text || '').toLowerCase();
    return str.includes('websocket') || str.includes('hmr') || str.includes('ws://') || str.includes('wss://');
  };

  window.addEventListener('error', (event) => {
    const msg = event.message || '';
    if (isHmrError(msg)) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }, true);

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const reasonStr = reason ? (reason.message || String(reason)) : '';
    if (isHmrError(reasonStr)) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }, true);

  // Hide the benign websocket warning logs from console
  const originalConsoleError = console.error;
  console.error = function(...args: any[]) {
    const msg = args.map(arg => {
      try {
        return String(arg || '');
      } catch (e) {
        return '';
      }
    }).join(' ');
    
    if (isHmrError(msg)) {
      return;
    }
    originalConsoleError.apply(console, args);
  };
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

