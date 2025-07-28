import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { confirmPasswordReset } from 'firebase/auth';
import { auth } from '../firebase';
import Header from '../components/Header';
import Toast from '../components/Toast';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [toast, setToast] = useState(null);
  const [oobCode, setOobCode] = useState('');

  useEffect(() => {
    const code = searchParams.get('oobCode');
    if (!code) {
      setToast('Invalid reset link.');
    } else {
      setOobCode(code);
    }
  }, [searchParams]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      showToast('Password must be at least 6 characters.');
      return;
    }

    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      showToast('✅ Password reset successfully!');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      showToast('Something went wrong. Try again.');
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: `url('/loginbg.jpg')` }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-50 z-0" />
      <div className="relative z-10">
        <Header />
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <div className="bg-white bg-opacity-90 backdrop-blur-md p-8 rounded-lg shadow-lg max-w-md w-full">
          <h2 className="text-2xl font-bold text-center text-green-700 mb-6">
            Set New Password
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
            />
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 rounded-md font-semibold hover:bg-green-700 transition"
            >
              Reset Password
            </button>
          </form>
        </div>
      </div>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
