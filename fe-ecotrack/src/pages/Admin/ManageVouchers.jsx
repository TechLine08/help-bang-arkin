import React, { useEffect, useState } from 'react';
import { getApiUrl } from '../../config/api';

export default function ManageVouchers() {
  const [vouchers, setVouchers] = useState([]);
  const [form, setForm] = useState({
    name: '',
    description: '',
    image_url: '',
    points_required: ''
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        const res = await fetch(getApiUrl('api/marketplace'));
        const data = await res.json();
        setVouchers(data);
      } catch (err) {
        console.error('Error fetching vouchers:', err);
      }
    };
    fetchVouchers();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.description || !form.image_url || !form.points_required) {
      return setToast('⚠️ Please fill in all fields.');
    }

    setLoading(true);
    try {
      const res = await fetch(getApiUrl('api/marketplace'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          points_required: parseInt(form.points_required)
        })
      });

      const newVoucher = await res.json();
      if (!res.ok) throw new Error(newVoucher.error || 'Failed to create voucher');

      setVouchers([newVoucher, ...vouchers]);
      setForm({ name: '', description: '', image_url: '', points_required: '' });
      setToast('✅ Voucher created!');
    } catch (err) {
      console.error(err);
      setToast('❌ Error creating voucher');
    } finally {
      setLoading(false);
      setTimeout(() => setToast(null), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white pt-32 pb-20 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-green-700 mb-6 text-center">🎁 Manage Vouchers</h1>

        {toast && (
          <div className="mb-4 bg-yellow-100 text-yellow-800 p-2 rounded text-center">
            {toast}
          </div>
        )}

        {/* Voucher Creation Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-lg shadow-md mb-10 space-y-4"
        >
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Voucher Name"
            className="w-full border px-4 py-2 rounded-md"
          />
          <input
            type="text"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Description"
            className="w-full border px-4 py-2 rounded-md"
          />
          <input
            type="text"
            name="image_url"
            value={form.image_url}
            onChange={handleChange}
            placeholder="Image URL"
            className="w-full border px-4 py-2 rounded-md"
          />
          <input
            type="number"
            name="points_required"
            value={form.points_required}
            onChange={handleChange}
            placeholder="Points Required"
            className="w-full border px-4 py-2 rounded-md"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-md transition"
          >
            {loading ? 'Creating...' : 'Add Voucher'}
          </button>
        </form>

        {/* Existing Vouchers List */}
        <div className="space-y-4">
          {vouchers.length === 0 ? (
            <p className="text-gray-600 text-center">No vouchers yet.</p>
          ) : (
            vouchers.map((v) => (
              <div key={v.id} className="bg-white shadow-sm p-4 rounded-lg flex gap-4 items-center">
                <img
                  src={v.image_url}
                  alt={v.name}
                  className="w-20 h-20 object-cover rounded-md border"
                />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-green-700">{v.name}</h3>
                  <p className="text-sm text-gray-600">{v.description}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    <span className="font-medium text-green-600">{v.points_required}</span> points
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
