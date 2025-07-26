import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';
import Header from '../components/Header';
import Toast from '../components/Toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const handleReset = async (e) => {
    e.preventDefault();
    try {
      await sendPasswordResetEmail(auth, email);
      showToast('Reset link sent! Check your email.');
    } catch (error) {
      const friendly =
        error.code === 'auth/user-not-found'
          ? 'No account found with this email.'
          : error.code === 'auth/invalid-email'
          ? 'Invalid email address.'
          : 'Something went wrong.';
      showToast(friendly);
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: `url('/loginbg.jpg')` }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50 z-0" />

      {/* Header */}
      <div className="relative z-10">
        <Header />
      </div>

      {/* Form Section */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <div className="bg-white bg-opacity-90 backdrop-blur-md p-8 rounded-lg shadow-lg max-w-md w-full">
          <h2 className="text-3xl font-bold text-center text-green-700 mb-6">Reset Password</h2>
          <form onSubmit={handleReset} className="space-y-4">
            <input
              type="email"
              placeholder="Registered Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
            />
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 rounded-md font-semibold hover:bg-green-700 transition"
            >
              Send Reset Link
            </button>
          </form>

          <p className="text-center mt-4 text-sm text-gray-700">
            <span
              onClick={() => navigate('/login')}
              className="text-green-700 font-semibold cursor-pointer hover:underline"
            >
              ← Back to Login
            </span>
          </p>
        </div>
      </div>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
