import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './theme'; // applies the saved/auto theme to <html> before first paint
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
