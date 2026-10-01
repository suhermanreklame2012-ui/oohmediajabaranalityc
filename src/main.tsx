import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Filter out deprecated <gmp-advanced-marker> addListener warning
const origWarn = console.warn;
console.warn = (...args: any[]) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('gmp-advanced-marker') &&
    args[0].includes('addListener')
  ) {
    return;
  }
  origWarn.apply(console, args);
};

createRoot(document.getElementById('root')!).render(<App />);
