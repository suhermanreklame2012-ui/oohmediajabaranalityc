import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Global error & warning shielding for preview iframe environments
const origWarn = console.warn;
console.warn = (...args: any[]) => {
  const msg = typeof args[0] === 'string' ? args[0] : '';
  if (
    msg.includes('gmp-advanced-marker') ||
    msg.includes('The Google Maps JavaScript API has already been loaded') ||
    msg.includes('WebSocket closed without opened') ||
    msg.includes('vite:ws')
  ) {
    return;
  }
  origWarn.apply(console, args);
};

const origError = console.error;
console.error = (...args: any[]) => {
  const msg = typeof args[0] === 'string' ? args[0] : '';
  if (
    msg.includes('WebSocket closed without opened') ||
    msg.includes('The Google Maps JavaScript API has already been loaded') ||
    msg.includes('vite:ws')
  ) {
    return;
  }
  origError.apply(console, args);
};

// Global protection against WebSocket connection drops and map library reload popups
window.addEventListener(
  'error',
  (event) => {
    const msg = event?.message || '';
    if (
      msg.includes('WebSocket') ||
      msg.includes('closed without opened') ||
      msg.includes('maps.googleapis') ||
      msg.includes('already been loaded')
    ) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return true;
    }
  },
  true
);

window.addEventListener(
  'unhandledrejection',
  (event) => {
    const reason = event.reason?.message || String(event.reason || '');
    if (
      reason.includes('WebSocket') ||
      reason.includes('closed without opened') ||
      reason.includes('maps.googleapis') ||
      reason.includes('already been loaded') ||
      reason.includes('vite')
    ) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return true;
    }
  },
  true
);

createRoot(document.getElementById('root')!).render(<App />);

