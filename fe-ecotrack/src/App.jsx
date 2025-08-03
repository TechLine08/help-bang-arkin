// File: App.jsx

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// 🌍 Public Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Contact from './pages/Contact';
import PrivacyPolicy from './pages/PrivacyPolicy';

// 🔒 Authenticated User Pages
import Home from './pages/Home';
import Marketplace from './pages/Marketplace';
import EditProfile from './pages/EditProfile';

// 🛠 Admin Pages
import AdminHome from './pages/Admin/AdminHome';
import ManageVouchers from './pages/Admin/ManageVouchers';
import ViewFeedback from './pages/Admin/ViewFeedback';
import RedeemHistory from './pages/Admin/ReedemHistory';
import AdminTips from './pages/Admin/AdminTips';

function App() {
  return (
    <>
      <Routes>
        {/* ✅ Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />

        {/* 🔐 User Dashboard */}
        <Route path="/home" element={<Home />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/edit-profile" element={<EditProfile />} />

        {/* 🛡️ Admin Dashboard */}
        <Route path="/admin" element={<AdminHome />} />
        <Route path="/admin/manage-vouchers" element={<ManageVouchers />} />
        <Route path="/admin/view-feedback" element={<ViewFeedback />} />
        <Route path="/admin/send-tips" element={<AdminTips />} />
        <Route path="/admin/redeem-history" element={<RedeemHistory />} />
      </Routes>

      {/* 🔔 Global Toast Notifications */}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </>
  );
}

export default App;
