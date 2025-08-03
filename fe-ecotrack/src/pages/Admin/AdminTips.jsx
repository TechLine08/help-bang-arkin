import React, { useEffect, useState } from 'react';
import { getApiUrl } from '../../config/api';

export default function AdminTips() {
  const [tips, setTips] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch all tips from backend
  const fetchTips = async () => {
    try {
      const res = await fetch(getApiUrl('api/tips'));
      const data = await res.json();
      setTips(data);
    } catch (err) {
      console.error('❌ Failed to fetch tips:', err);
    }
  };

  // Add a new tip
  const addTip = async () => {
    if (!title || !content) return alert('Please fill both fields');
    setLoading(true);

    try {
      const res = await fetch(getApiUrl('api/tips'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      });

      if (!res.ok) throw new Error('Failed to submit tip');

      setTitle('');
      setContent('');
      fetchTips(); // refresh
    } catch (err) {
      alert('❌ Error submitting tip');
    } finally {
      setLoading(false);
    }
  };

  // Delete a tip
  const deleteTip = async (id) => {
    // eslint-disable-next-line no-restricted-globals
    if (!window.confirm('Are you sure you want to delete this tip?')) return;

    try {
      const res = await fetch(getApiUrl(`api/tips?id=${id}`), {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete tip');

      fetchTips(); // refresh
    } catch (err) {
      alert('❌ Error deleting tip');
      console.error('DELETE error:', err);
    }
  };

  useEffect(() => {
    fetchTips();
  }, []);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">📬 Manage Daily Eco Tips</h1>

      {/* ➕ Add Tip Form */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Tip Title"
          className="border p-2 w-full mb-2"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          placeholder="Tip Content"
          className="border p-2 w-full mb-2"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <button
          className="bg-green-600 text-white px-4 py-2 rounded w-full"
          onClick={addTip}
          disabled={loading}
        >
          {loading ? 'Adding...' : '➕ Add Tip'}
        </button>
      </div>

      <hr className="my-4" />

      {/* 🗂 Tips List */}
      <h2 className="text-xl font-semibold mb-2">🗂 Current Tips</h2>
      {tips.length === 0 ? (
        <p className="text-gray-500">No tips available.</p>
      ) : (
        <ul className="space-y-3">
          {tips.map((tip) => (
            <li
              key={tip.id}
              className="border p-3 rounded flex justify-between items-start bg-white shadow"
            >
              <div>
                <strong className="block text-md text-black">{tip.title}</strong>
                <p className="text-gray-700">{tip.content}</p>
              </div>
              <button
                onClick={() => deleteTip(tip.id)}
                className="text-red-500 text-sm ml-4 hover:underline"
              >
                🗑️ Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
