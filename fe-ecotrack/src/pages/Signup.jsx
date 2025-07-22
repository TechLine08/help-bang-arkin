import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../firebase';
import Header from '../components/Header';
import Toast from '../components/Toast';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedPDA, setAcceptedPDA] = useState(false);
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!name || !email || !password || !confirmPassword) {
      showToast('Please fill in all fields.', 'error');
      return;
    }

    if (password !== confirmPassword) {
      showToast('Passwords do not match!', 'error');
      return;
    }

    if (!acceptedPDA) {
      showToast('You must agree to the Personal Data Agreement.', 'error');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });

      await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, marketing_opt_in: marketingOptIn }),
      });

      showToast('Account created successfully!');
      setTimeout(() => navigate('/home'), 1000);
    } catch (error) {
      console.error('Signup Error:', error);
      showToast(error.message || 'Registration failed.', 'error');
    }
  };

  const handleGoogleSignup = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: user.displayName, email: user.email, marketing_opt_in: true }),
      });

      showToast('Signed in with Google!');
      setTimeout(() => navigate('/home'), 1000);
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      showToast('Google sign-in failed.', 'error');
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

      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 pt-10 md:pt-0">
        <div className="bg-white bg-opacity-90 backdrop-blur-md p-8 rounded-lg shadow-lg max-w-md w-full">
          <h2 className="text-3xl font-bold text-center text-green-700 mb-6">Sign Up</h2>

          <form onSubmit={handleSignup} className="space-y-4">
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-green-600 focus:outline-none"
            />

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-green-600 focus:outline-none"
            />

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-green-600 focus:outline-none"
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-sm text-green-700 cursor-pointer font-semibold"
              >
                {showPassword ? 'Hide' : 'Show'}
              </span>
            </div>

            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-green-600 focus:outline-none"
              />
              <span
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-2.5 text-sm text-green-700 cursor-pointer font-semibold"
              >
                {showConfirmPassword ? 'Hide' : 'Show'}
              </span>
            </div>

            <div className="flex items-start gap-2 mt-2">
              <input
                type="checkbox"
                id="pda"
                checked={acceptedPDA}
                onChange={(e) => setAcceptedPDA(e.target.checked)}
                className="mt-1"
              />
              <label htmlFor="pda" className="text-sm text-gray-700 leading-snug">
                I confirm that the information provided is accurate and I agree to EcoTrack’s processing of my personal data in accordance with the{' '}
                <Link
                  to="/privacy-policy"
                  className="text-green-600 underline hover:text-green-700"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Privacy Policy
                </Link>.
              </label>
            </div>

            <div className="flex items-start gap-2 mt-2">
              <input
                type="checkbox"
                id="marketing"
                checked={marketingOptIn}
                onChange={(e) => setMarketingOptIn(e.target.checked)}
                className="mt-1"
              />
              <label htmlFor="marketing" className="text-sm text-gray-700 leading-snug">
                I agree to receive occasional tips and recycling reminders from EcoTrack via email.
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 rounded-md font-semibold hover:bg-green-700 transition"
            >
              Register
            </button>

            <div className="text-center my-4 text-gray-500">OR</div>

            <button
              type="button"
              onClick={handleGoogleSignup}
              className="w-full border border-green-600 text-green-700 py-2 rounded-md font-semibold hover:bg-green-50 transition"
            >
              Continue with Google
            </button>
          </form>

          <p className="text-center mt-4 text-sm text-gray-700">
            Already have an account?{' '}
            <span
              onClick={() => navigate('/login')}
              className="text-green-700 font-semibold cursor-pointer hover:underline"
            >
              Back to Login
            </span>
          </p>
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
