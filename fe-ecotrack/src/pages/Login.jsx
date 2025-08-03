import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import Header from '../components/Header';
import Toast from '../components/Toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      showToast('Please enter email and password.', 'error');
      return;
    }

    try {
      // ✅ Firebase login
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      const firebase_uid = user.uid;

      // ✅ Fetch user from backend using firebase_uid
      const res = await fetch(`https://help-bang-arkin-backend.vercel.app/api/auth?firebase_uid=${firebase_uid}`);
      const userData = await res.json();

      if (!res.ok) {
        throw new Error(userData.error || 'Failed to fetch user data');
      }

      // ✅ Log full response and role for debugging
      console.log('✅ Full user data:', userData);
      console.log('✅ User role:', userData.role);

      // ✅ Save to localStorage
      localStorage.setItem('loggedInUser', JSON.stringify(userData));

      showToast('Login successful!', 'success');

      // ✅ Navigate based on role
      setTimeout(() => {
        if (userData.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/home');
        }
      }, 500);
    } catch (error) {
      console.error('Login error:', error);
      const friendly =
        error.code === 'auth/user-not-found'
          ? 'No user found with this email.'
          : error.code === 'auth/wrong-password'
          ? 'Incorrect password.'
          : error.code === 'auth/invalid-email'
          ? 'Invalid email address.'
          : error.message || 'Login failed. Please try again.';
      showToast(friendly, 'error');
    }
  };

  return (
    <div
      className="relative min-h-screen w-full bg-cover bg-center bg-no-repeat overflow-hidden"
      style={{ backgroundImage: "url('/loginbg.jpg')" }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-50 z-0" />
      <div className="relative z-20"><Header /></div>

      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 pt-4 pb-8">
        <div className="bg-white bg-opacity-90 backdrop-blur-lg p-8 rounded-xl shadow-lg max-w-md w-full">
          <h2 className="text-3xl font-bold text-center text-green-700 mb-6">Login</h2>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <span
                onClick={() => setShowPassword(prev => !prev)}
                className="absolute right-3 top-2.5 text-sm cursor-pointer text-green-700 font-semibold"
              >
                {showPassword ? 'Hide' : 'Show'}
              </span>
            </div>
            <div className="text-right">
              <Link to="/forgot-password" className="text-sm text-green-600 hover:underline">
                Forgot Password?
              </Link>
            </div>
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 rounded-md font-semibold hover:bg-green-700 transition"
            >
              Enter
            </button>
          </form>

          <p className="text-center mt-4 text-sm text-gray-700">
            Don’t have an account?{' '}
            <span
              onClick={() => navigate('/signup')}
              className="text-green-700 font-semibold cursor-pointer hover:underline"
            >
              Sign Up
            </span>
          </p>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
