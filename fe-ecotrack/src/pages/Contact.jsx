import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Toast from '../components/Toast';
import { getApiUrl } from '../config/api';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [toast, setToast] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.message) {
      setToast({ type: 'error', message: 'Please fill in all fields.' });
      return;
    }

    try {
      const res = await fetch(getApiUrl('api/feedback'), { // ✅ FIXED LINE
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        setToast({ type: 'success', message: 'Message sent successfully!' });
        setForm({ name: '', email: '', message: '' });
      } else {
        throw new Error(data?.error || 'Submission failed.');
      }
    } catch (err) {
      setToast({ type: 'error', message: 'Internal Server Error' });
    }
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-50 to-white">
      <Header />

      <main className="flex-grow flex flex-col items-center px-6 py-20">
        <h1 className="text-4xl md:text-5xl font-bold text-center text-gray-800 mb-4">
          Contact Us
        </h1>
        <p className="text-center text-gray-600 mb-10 max-w-2xl">
          Have questions, feedback, or ideas? We'd love to hear from you! Fill out the form below and our team will get back to you shortly.
        </p>

        <form
          className="bg-white shadow-lg rounded-lg w-full max-w-2xl p-8 space-y-6"
          onSubmit={handleSubmit}
        >
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Your Name"
              className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              rows="5"
              placeholder="How can we help you?"
              className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
            ></textarea>
          </div>

          <div className="text-right">
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-md shadow-md transition"
            >
              Send Message
            </button>
          </div>
        </form>
      </main>

      <footer className="bg-white py-8 px-8 md:px-20 text-center border-t">
        <p className="text-gray-600 text-sm">© 2025 EcoTrack. All rights reserved.</p>
      </footer>

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
