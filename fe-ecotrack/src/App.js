import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// 🌍 Public Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import Contact from './pages/Contact';
import PrivacyPolicy from './pages/PrivacyPolicy';

// 🔒 Authenticated Pages
import Home from './pages/Home'; // Dashboard after login/signup

function App() {
  return (
    <>
      <Routes>
        {/* ✅ Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />

        {/* 🔐 Authenticated Route */}
        <Route path="/home" element={<Home />} />
      </Routes>

      {/* 🔔 Toast notifications */}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </>
  );
}

export default App;
