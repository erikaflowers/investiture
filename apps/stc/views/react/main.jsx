import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Global styles will be imported here once created
// import './styles/index.css';

const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
