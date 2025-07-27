import React, { useEffect, useState } from 'react';
import { getApiUrl } from '../config/api';

export default function AdminTips() {
  const [tips, setTips] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchTips = async () => {
    try {
      const res = await fetch(getApiUrl('api/tips'));
      const data = await res.json();
      setTips(data);
    } catch (err) {
      console.error('❌ Failed to fetch tips:', err);
    }
  };

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

  useEffect(() => {
    fetchTips();
  }, []);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">📬 Manage Daily Eco Tips</h1>

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
          className="bg-green-600 text-white px-4 py-2 rounded"
          onClick={addTip}
          disabled={loading}
        >
          {loading ? 'Adding...' : '➕ Add Tip'}
        </button>
      </div>

      <hr className="my-4" />

      <h2 className="text-xl font-semibold mb-2">🗂 Current Tips</h2>
      <ul className="space-y-3">
        {tips.map((tip) => (
          <li key={tip.id} className="border p-3 rounded">
            <strong>{tip.title}</strong>
            <p className="text-gray-700">{tip.content}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
