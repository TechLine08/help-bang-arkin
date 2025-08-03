import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import Select from 'react-select';
import { getNames } from 'country-list';
import { useNavigate, Link } from 'react-router-dom';
import {
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { auth } from '../firebase';
import Header from '../components/Header';
import Toast from '../components/Toast';
import { getApiUrl } from '../config/api';

export default function Signup() {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm();

  const navigate = useNavigate();
  const countries = getNames().map((name) => ({ label: name, value: name }));
  const [toast, setToast] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const onSubmit = async (data) => {
    const {
      name,
      email,
      password,
      confirmPassword,
      country,
      marketing_opt_in,
      acceptedPDA,
    } = data;

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

      await fetch(getApiUrl('api/auth'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          country: country.value,
          marketing_opt_in,
          firebase_uid: userCredential.user.reloadUserInfo.localId,
        }),
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

      await fetch(getApiUrl('api/auth'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: user.displayName || 'Anonymous',
          email: user.email,
          password: 'google_fallback_password',
          country: null, // 👈 Google users don’t pick a country
          avatar_url: user.photoURL,
          marketing_opt_in: true,
        }),
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

      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 pt-24 pb-16 md:pt-36 md:pb-24">
        <div className="bg-white bg-opacity-90 backdrop-blur-md p-8 rounded-lg shadow-lg max-w-md w-full">
          <h2 className="text-3xl font-bold text-center text-green-700 mb-6">Sign Up</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <input
              type="text"
              placeholder="Full Name"
              {...register('name', { required: true })}
              className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-green-600 focus:outline-none"
            />
            {errors.name && <p className="text-sm text-red-600">Name is required.</p>}

            <input
              type="email"
              placeholder="Email"
              {...register('email', { required: true })}
              className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-green-600 focus:outline-none"
            />
            {errors.email && <p className="text-sm text-red-600">Email is required.</p>}

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                {...register('password', { required: true })}
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-green-600 focus:outline-none"
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-sm text-green-700 cursor-pointer font-semibold"
              >
                {showPassword ? 'Hide' : 'Show'}
              </span>
              {errors.password && <p className="text-sm text-red-600">Password is required.</p>}
            </div>

            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm Password"
                {...register('confirmPassword', { required: true })}
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-green-600 focus:outline-none"
              />
              <span
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-2.5 text-sm text-green-700 cursor-pointer font-semibold"
              >
                {showConfirmPassword ? 'Hide' : 'Show'}
              </span>
              {errors.confirmPassword && (
                <p className="text-sm text-red-600">Please confirm your password.</p>
              )}
            </div>

            {/* ✅ Country select with react-select */}
            <Controller
              name="country"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Select
                  {...field}
                  options={countries}
                  placeholder="Select Country"
                  className="react-select-container"
                  classNamePrefix="react-select"
                />
              )}
            />
            {errors.country && <p className="text-sm text-red-600">Country is required.</p>}

            {/* ✅ PDA */}
            <div className="flex items-start gap-2 mt-2">
              <input
                type="checkbox"
                {...register('acceptedPDA', { required: true })}
                className="mt-1"
              />
              <label className="text-sm text-gray-700 leading-snug">
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
            {errors.acceptedPDA && (
              <p className="text-sm text-red-600">You must accept the data agreement.</p>
            )}

            {/* ✅ Marketing */}
            <div className="flex items-start gap-2 mt-2">
              <input type="checkbox" {...register('marketing_opt_in')} className="mt-1" />
              <label className="text-sm text-gray-700 leading-snug">
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

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
