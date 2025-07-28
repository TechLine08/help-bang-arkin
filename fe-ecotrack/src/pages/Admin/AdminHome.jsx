import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminHome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white pt-32 pb-20 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-green-700 mb-8 text-center">
          👩‍💼 Admin Dashboard
        </h1>

        <div className="grid gap-6 sm:grid-cols-2">
          <div
            onClick={() => navigate('/admin/manage-vouchers')}
            className="cursor-pointer bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition"
          >
            <h2 className="text-xl font-semibold text-green-600 mb-2">🎁 Manage Vouchers</h2>
            <p className="text-gray-600 text-sm">Create and maintain redeemable vouchers.</p>
          </div>

          <div
            onClick={() => navigate('/admin/view-feedback')}
            className="cursor-pointer bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition"
          >
            <h2 className="text-xl font-semibold text-green-600 mb-2">📬 View Feedback</h2>
            <p className="text-gray-600 text-sm">Read what users are saying about EcoTrack.</p>
          </div>

          <div
            onClick={() => navigate('/admin/send-tips')}
            className="cursor-pointer bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition"
          >
            <h2 className="text-xl font-semibold text-green-600 mb-2">🧠 Tips & Education</h2>
            <p className="text-gray-600 text-sm">Send educational tips to all users.</p>
          </div>

          <div
            onClick={() => navigate('/admin/redeem-history')}
            className="cursor-pointer bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition"
          >
            <h2 className="text-xl font-semibold text-green-600 mb-2">📜 Redemption Logs</h2>
            <p className="text-gray-600 text-sm">Track who redeemed what, and when.</p>
          </div>

          <div
            onClick={() => navigate('/admin/manage-locations')}
            className="cursor-pointer bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition"
          >
            <h2 className="text-xl font-semibold text-green-600 mb-2">📍 Manage Locations</h2>
            <p className="text-gray-600 text-sm">Add, edit, or remove recycling points.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
