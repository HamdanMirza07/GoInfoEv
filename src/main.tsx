import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Global safeguard: Prevent any fetch().then(res => res.json()) from throwing
// "Unexpected token 'T', \"The page c\"... is not valid JSON" on static/Vercel 404 responses
if (typeof window !== 'undefined' && typeof Response !== 'undefined') {
  const originalJson = Response.prototype.json;
  Response.prototype.json = async function () {
    try {
      const text = await this.clone().text();
      const trimmed = (text || '').trim();
      if (
        !trimmed ||
        trimmed.startsWith('The page') ||
        trimmed.startsWith('<!DOCTYPE') ||
        trimmed.startsWith('<html') ||
        trimmed.startsWith('NOT_FOUND')
      ) {
        return { _nonJson: true };
      }
      return JSON.parse(trimmed);
    } catch {
      try {
        return await originalJson.call(this);
      } catch {
        return { _nonJson: true };
      }
    }
  };

  // Unregister stale PWA service workers that may cache old JS bundles
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .getRegistrations()
      .then((registrations) => {
        for (const registration of registrations) {
          registration.unregister().catch(() => {});
        }
      })
      .catch(() => {});
  }
  if ('caches' in window) {
    caches
      .keys()
      .then((keys) => {
        for (const key of keys) {
          caches.delete(key).catch(() => {});
        }
      })
      .catch(() => {});
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
