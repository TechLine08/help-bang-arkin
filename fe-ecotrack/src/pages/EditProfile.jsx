// File: EditProfile.jsx

import React, { useEffect, useState } from 'react';
import { getApiUrl } from '../config/api';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { getNames } from 'country-list';
import Toast from '../components/Toast';
import Header from '../components/Header';

export default function EditProfile() {
  const [userId, setUserId] = useState(null);
  const [name, setName] = useState('');
  const [country, setCountry] = useState(null);
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [toast, setToast] = useState(null);

  const navigate = useNavigate();

  // Generate country options
  const countryOptions = getNames().map((c) => ({ label: c, value: c }));

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('loggedInUser'));
    if (!stored || !stored.id) {
      navigate('/login');
      return;
    }
    setUserId(stored.id);

    const fetchProfile = async () => {
      try {
        const res = await fetch(getApiUrl(`api/edit-profile?user_id=${stored.id}`));
        const data = await res.json();
        setName(data.name || '');
        setCountry(data.country ? { label: data.country, value: data.country } : null);
        setAvatarPreview(data.avatar_url);
        setMarketingOptIn(!!data.marketing_opt_in);
      } catch (err) {
        setToast({ type: 'error', message: 'Failed to load profile' });
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('user_id', userId);
    formData.append('name', name);
    formData.append('country', country?.value);
    formData.append('marketing_opt_in', marketingOptIn);
    if (avatar) formData.append('avatar', avatar);

    try {
      const res = await fetch(getApiUrl('api/edit-profile'), {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Update failed');
      setToast({ type: 'success', message: 'Profile updated successfully' });
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to update' });
    }
  };

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white pt-24 pb-16 px-6">
      <Header />
      <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-6 text-green-700 text-center">Edit Profile</h2>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-semibold mb-2">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border px-4 py-2 rounded-md"
              placeholder="Your full name"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Country</label>
            <Select
              value={country}
              onChange={setCountry}
              options={countryOptions}
              placeholder="Select your country"
              isClearable
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Avatar</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="w-full"
            />
            {avatarPreview && (
              <img
                src={avatarPreview}
                alt="Preview"
                className="mt-4 w-24 h-24 rounded-full object-cover border-2 border-green-500"
              />
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={marketingOptIn}
              onChange={(e) => setMarketingOptIn(e.target.checked)}
              id="opt-in"
              className="h-4 w-4"
            />
            <label htmlFor="opt-in" className="text-sm">
              I want to receive eco tips via email
            </label>
          </div>

          <button
            type="submit"
            className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700"
          >
            Save Changes
          </button>
        </form>
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
