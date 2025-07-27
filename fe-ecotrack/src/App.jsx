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

// 🔒 Authenticated User Dashboard
import Home from './pages/Home';

// 🛠 Admin Pages
import AdminHome from './pages/Admin/AdminHome';
import ManageVouchers from './pages/Admin/ManageVouchers';
// Optional future admin pages:
// import ViewFeedback from './pages/Admin/ViewFeedback';
// import SendTips from './pages/Admin/SendTips';
// import RedeemHistory from './pages/Admin/RedeemHistory';
import Marketplace from './pages/Marketplace';

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

        {/* 🔐 User Dashboard */}
        <Route path="/home" element={<Home />} />
        <Route path="/marketplace" element={<Marketplace />} />

        {/* 🛡️ Admin Routes */}
        <Route path="/admin" element={<AdminHome />} />
        <Route path="/admin/manage-vouchers" element={<ManageVouchers />} />
        {/* <Route path="/admin/view-feedback" element={<ViewFeedback />} /> */}
        {/* <Route path="/admin/send-tips" element={<SendTips />} /> */}
        {/* <Route path="/admin/redeem-history" element={<RedeemHistory />} /> */}
      </Routes>

      {/* 🔔 Global Toast Notifications */}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </>
  );
}

export default App;
