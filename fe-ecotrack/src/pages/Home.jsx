import React, { useEffect, useState, useCallback } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import Header from '../components/Header';
import Toast from '../components/Toast';
import { Pie } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';
import { getApiUrl } from '../config/api';

Chart.register(ArcElement, Tooltip, Legend);

export default function Home() {
  const [user, setUser] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wasteType, setWasteType] = useState('');
  const [quantity, setQuantity] = useState('');
  const [toast, setToast] = useState(null);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  const [leaderboardScope, setLeaderboardScope] = useState('individual');

  const fetchLogs = async (uid) => {
    try {
      console.log('📦 Fetching logs for:', uid);
      const res = await fetch(getApiUrl(`api/progress?user_id=${uid}`));
      const data = await res.json();
      console.log('📬 Logs response:', data);
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('❌ Failed to fetch logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchLeaderboard = useCallback(async () => {
    setLoadingLeaderboard(true);
    try {
      const res = await fetch(getApiUrl(`/api/leaderboard?scope=${leaderboardScope}`));
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      const data = await res.json();
      console.log('📊 Leaderboard API response:', data);

      const leaderboard = Array.isArray(data)
        ? data
        : data?.success && Array.isArray(data.data)
        ? data.data
        : [];

      if (leaderboard.length === 0) {
        console.warn('⚠️ Leaderboard empty or invalid structure');
        showToast('No leaderboard data found.', 'info');
      }

      setLeaderboardData(leaderboard);
    } catch (err) {
      console.error('❌ Failed to fetch leaderboard:', err);
      showToast(`Failed to load leaderboard: ${err.message}`, 'error');
      setLeaderboardData([]);
    } finally {
      setLoadingLeaderboard(false);
    }
  }, [leaderboardScope]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        await fetchLogs(firebaseUser.uid);
        await fetchLeaderboard();
      } else {
        setUser(null);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [fetchLeaderboard]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !wasteType.trim() || !quantity) return;

    try {
      const res = await fetch(getApiUrl('api/progress'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.uid,
          location_id: 'dummy-location',
          material_type: wasteType.trim(),
          bottle_count: Number(quantity),
          weight_kg: 0.5,
        }),
      });

      if (!res.ok) throw new Error('Failed to submit');

      setWasteType('');
      setQuantity('');
      showToast('Activity logged!', 'success');
      fetchLogs(user.uid);
    } catch (err) {
      console.error('❌ Submission failed:', err);
      showToast('Submission failed. Please try again.', 'error');
    }
  };

  const wasteCounts = logs.reduce((acc, log) => {
    acc[log.material_type] = (acc[log.material_type] || 0) + (log.bottle_count || 0);
    return acc;
  }, {});

  const chartData = {
    labels: Object.keys(wasteCounts),
    datasets: [
      {
        label: 'Recycled Waste',
        data: Object.values(wasteCounts),
        backgroundColor: ['#34D399', '#60A5FA', '#FBBF24', '#F87171', '#A78BFA'],
        borderWidth: 1,
      },
    ],
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-gray-600">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <Header />
      <div className="max-w-2xl mx-auto px-4 pt-32 pb-20">
        <h1 className="text-3xl font-bold text-green-700 mb-6 text-center">
          Welcome, {user?.displayName || user?.email} 👋
        </h1>

        {/* Log Activity */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-10">
          <h2 className="text-xl font-semibold text-green-600 mb-4">Log Recycling Activity</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="wasteType" className="block text-sm font-medium mb-1">
                Waste Type
              </label>
              <input
                id="wasteType"
                type="text"
                value={wasteType}
                onChange={(e) => setWasteType(e.target.value)}
                placeholder="e.g. Plastic, Paper, Glass"
                className="w-full px-4 py-2 border rounded-md focus:ring-green-500 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium mb-1">
                Quantity
              </label>
              <input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="e.g. 3"
                className="w-full px-4 py-2 border rounded-md focus:ring-green-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition w-full"
            >
              Submit Activity
            </button>
          </form>
        </div>

        {/* Pie Chart */}
        {logs.length > 0 && (
          <div className="bg-white shadow-md rounded-lg p-6 mb-10">
            <h2 className="text-xl font-semibold text-green-600 mb-4 text-center">
              Recycling Breakdown
            </h2>
            <div className="w-64 mx-auto">
              <Pie data={chartData} />
            </div>
          </div>
        )}

        {/* Leaderboard */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-green-600">🏆 Leaderboard</h2>
            <div className="space-x-2">
              <button
                className={`px-3 py-1 text-sm rounded-md border ${
                  leaderboardScope === 'individual'
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-green-600'
                }`}
                onClick={() => setLeaderboardScope('individual')}
              >
                Individuals
              </button>
              <button
                className={`px-3 py-1 text-sm rounded-md border ${
                  leaderboardScope === 'country'
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-green-600'
                }`}
                onClick={() => setLeaderboardScope('country')}
              >
                Countries
              </button>
            </div>
          </div>

          {loadingLeaderboard ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <p className="mt-2 text-gray-600">Loading leaderboard...</p>
            </div>
          ) : leaderboardData.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No leaderboard data available yet.</p>
          ) : (
            <div className="space-y-3">
              {leaderboardData.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                        index === 0
                          ? 'bg-yellow-500'
                          : index === 1
                          ? 'bg-gray-400'
                          : index === 2
                          ? 'bg-amber-600'
                          : 'bg-green-600'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">
                        {leaderboardScope === 'country'
                          ? item.country
                          : item.users?.displayName || item.user_id}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">
                      {(item.total_points || item.total_weight || 0).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {leaderboardScope === 'country' ? 'kg recycled' : 'points'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Logs */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold text-green-600 mb-4">Your Recycling Logs</h2>
          {logs.length === 0 ? (
            <p className="text-gray-600">No logs yet. Start tracking your impact!</p>
          ) : (
            <ul className="divide-y">
              {logs.map((log, idx) => (
                <li key={idx} className="py-3">
                  <div className="flex justify-between">
                    <span className="text-gray-800">{log.material_type}</span>
                    <span className="text-gray-500">{log.bottle_count} item(s)</span>
                  </div>
                  <div className="text-sm text-gray-400">
                    {new Date(log.recycled_at).toLocaleString()}
                  </div>
                </li>
              ))}
            </ul>
          )}
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
