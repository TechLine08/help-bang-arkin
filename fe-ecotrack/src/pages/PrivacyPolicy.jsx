import React from 'react';
import Header from '../components/Header';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-green-50 text-gray-800">
      {/* Header */}
      <Header />

      {/* Content */}
      <div className="max-w-4xl mx-auto py-16 px-6">
        <h1 className="text-3xl font-bold text-green-700 mb-6">Privacy Policy</h1>

        <p className="mb-6">
          At <strong>EcoTrack</strong>, your privacy is important to us. This Privacy Policy outlines how we collect, use,
          and safeguard your personal information.
        </p>

        {/* Section 1 */}
        <h2 className="text-xl font-semibold text-green-700 mt-8 mb-2">1. Information We Collect</h2>
        <ul className="list-disc list-inside text-gray-700 mb-6">
          <li>Your full name, email address, and phone number during registration.</li>
          <li>Usage statistics for tracking your recycling behavior and app engagement.</li>
        </ul>

        {/* Section 2 */}
        <h2 className="text-xl font-semibold text-green-700 mt-8 mb-2">2. How We Use Your Information</h2>
        <ul className="list-disc list-inside text-gray-700 mb-6">
          <li>To personalize your experience and provide relevant recycling statistics.</li>
          <li>To improve our services and track overall sustainability impact.</li>
        </ul>

        {/* Section 3 */}
        <h2 className="text-xl font-semibold text-green-700 mt-8 mb-2">3. Data Protection</h2>
        <p className="text-gray-700 mb-6">
          Your data is stored securely using Firebase Authentication. We never sell your personal data to third parties.
        </p>

        {/* Section 4 */}
        <h2 className="text-xl font-semibold text-green-700 mt-8 mb-2">4. Contact</h2>
        <p className="text-gray-700 mb-4">
          If you have any questions regarding this Privacy Policy, please contact us through the{' '}
          <a href="/contact" className="text-green-600 underline hover:text-green-700">Contact page</a>.
        </p>
      </div>
    </div>
  );
}
