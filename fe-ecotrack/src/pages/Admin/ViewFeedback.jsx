import React, { useEffect, useState } from 'react';
import { getApiUrl } from '../../config/api';

export default function ViewFeedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const res = await fetch(getApiUrl('api/feedback'));
        const data = await res.json();
        setFeedbacks(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('❌ Failed to fetch feedback:', err);
        setToast('Failed to load feedback.');
      } finally {
        setLoading(false);
        setTimeout(() => setToast(null), 3000);
      }
    };

    fetchFeedbacks();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white pt-32 pb-20 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-green-700 mb-6 text-center">📬 User Feedback</h1>

        {toast && (
          <div className="mb-4 bg-yellow-100 text-yellow-800 p-2 rounded text-center">
            {toast}
          </div>
        )}

        {loading ? (
          <div className="text-center text-gray-600">Loading feedback...</div>
        ) : feedbacks.length === 0 ? (
          <div className="text-center text-gray-600">No feedback submitted yet.</div>
        ) : (
          <ul className="space-y-4">
            {feedbacks.map((fb) => (
              <li key={fb.id} className="bg-white p-4 rounded-lg shadow-md">
                <div className="mb-2">
                  <span className="font-semibold text-green-600">{fb.name}</span>{' '}
                  <span className="text-gray-500 text-sm">&lt;{fb.email}&gt;</span>
                </div>
                <p className="text-gray-800">{fb.message}</p>
                <div className="text-sm text-gray-400 mt-2">
                  {new Date(fb.submitted_at).toLocaleString()}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
