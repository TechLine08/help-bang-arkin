// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// ✅ Import global styles (Tailwind first)
import './index.css';

// ✅ Import animation and toast styles
import 'aos/dist/aos.css';
import 'react-toastify/dist/ReactToastify.css'; // Optional: if using Toast.jsx

// ✅ React Router
import { BrowserRouter } from 'react-router-dom';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
