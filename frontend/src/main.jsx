import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const rootEl = document.getElementById('root');
createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Signal loader to fade out after first paint
requestAnimationFrame(() => {
  if (typeof window !== 'undefined' && window.__APP_READY__) {
    window.__APP_READY__();
  }
});
