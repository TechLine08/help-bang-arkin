// File: /pages/Admin/RedeemHistory.jsx

import React, { useEffect, useState } from 'react';
import { getApiUrl } from '../../config/api';

export default function RedeemHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(getApiUrl('api/redeem-history'));
        const data = await res.json();
        setHistory(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('❌ Failed to fetch redeem history:', err);
        setToast('Failed to load redemption logs.');
      } finally {
        setLoading(false);
        setTimeout(() => setToast(null), 3000);
      }
    };

    fetchHistory();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white pt-32 pb-20 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-green-700 mb-6 text-center">
          📜 Redemption Logs
        </h1>

        {toast && (
          <div className="mb-4 bg-yellow-100 text-yellow-800 p-2 rounded text-center">
            {toast}
          </div>
        )}

        {loading ? (
          <div className="text-center text-gray-600">Loading redemption logs...</div>
        ) : history.length === 0 ? (
          <div className="text-center text-gray-600">No redemptions recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-300 text-sm">
              <thead className="bg-green-100 text-green-800">
                <tr>
                  <th className="px-4 py-2 text-left">User</th>
                  <th className="px-4 py-2 text-left">Voucher</th>
                  <th className="px-4 py-2 text-left">Points</th>
                  <th className="px-4 py-2 text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => (
                  <tr key={item.id} className="border-t border-gray-200">
                    <td className="px-4 py-2">{item.user_name} ({item.user_email})</td>
                    <td className="px-4 py-2">{item.voucher_name}</td>
                    <td className="px-4 py-2">{item.points}</td>
                    <td className="px-4 py-2">
                      {new Date(item.redeemed_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
