
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Defensive: show clear error if #root is missing
const rootEl = document.getElementById("root");
if (!rootEl) {
  throw new Error(
    "Root element with id 'root' not found in HTML. " +
    "Make sure your index.html contains <div id='root'></div>."
  );
}

createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>
);
