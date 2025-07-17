import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import Header from '../components/Header';
import Toast from '../components/Toast';
import { Pie } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';

Chart.register(ArcElement, Tooltip, Legend);

export default function Home() {
  const [user, setUser] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wasteType, setWasteType] = useState('');
  const [quantity, setQuantity] = useState('');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        fetchLogs(firebaseUser.email);
      } else {
        setUser(null);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchLogs = async (email) => {
    try {
      const res = await fetch(`http://localhost:5050/api/recycling-logs?email=${email}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setLogs(data);
      } else {
        console.warn('Logs format:', data);
        setLogs([]);
      }
    } catch (err) {
      console.error('❌ Failed to fetch logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user || !wasteType.trim() || !quantity) return;

    try {
      const res = await fetch('http://localhost:5050/api/recycling-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          waste_type: wasteType.trim(),
          quantity: Number(quantity),
        }),
      });

      if (!res.ok) throw new Error('Failed to submit');

      setWasteType('');
      setQuantity('');
      showToast('Activity logged!', 'success');
      fetchLogs(user.email);
    } catch (err) {
      console.error('❌ Submission failed:', err);
      showToast('Submission failed. Please try again.', 'error');
    }
  };

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // 🧁 Pie Chart Data
  const wasteCounts = logs.reduce((acc, log) => {
    acc[log.waste_type] = (acc[log.waste_type] || 0) + log.quantity;
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
          <h2 className="text-xl font-semibold text-green-600 mb-4">
            Log Recycling Activity
          </h2>
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

        {/* Logs */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold text-green-600 mb-4">
            Your Recycling Logs
          </h2>
          {logs.length === 0 ? (
            <p className="text-gray-600">No logs yet. Start tracking your impact!</p>
          ) : (
            <ul className="divide-y">
              {logs.map((log, idx) => (
                <li key={idx} className="py-3">
                  <div className="flex justify-between">
                    <span className="text-gray-800">{log.waste_type}</span>
                    <span className="text-gray-500">{log.quantity} item(s)</span>
                  </div>
                  <div className="text-sm text-gray-400">
                    {new Date(log.timestamp).toLocaleString()}
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
