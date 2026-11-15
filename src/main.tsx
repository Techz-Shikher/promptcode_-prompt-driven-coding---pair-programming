import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const nativeFetch = window.fetch.bind(window);
window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
  const requestUrl = typeof input === 'string' ? input : input instanceof URL ? input.pathname : input.url;
  if (!requestUrl.startsWith('/api/')) return nativeFetch(input, init);
  const headers = new Headers(input instanceof Request ? input.headers : undefined);
  new Headers(init?.headers).forEach((value, key) => headers.set(key, value));
  const selectedModel = localStorage.getItem('promptcode.aiModel');
  if (selectedModel) headers.set('X-AI-Model', selectedModel);
  return nativeFetch(input, { ...init, headers });
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
