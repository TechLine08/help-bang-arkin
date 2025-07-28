// File: src/pages/Admin/ManageLocations.jsx

import React, { useEffect, useState } from 'react';
import { getApiUrl } from '../../config/api';

export default function ManageLocations() {
  const [locations, setLocations] = useState([]);
  const [form, setForm] = useState({
    name: '',
    address: '',
    city: '',
    region: '',
    lat: '',
    lng: '',
    image_url: '/locations/recycle_1.png', // 🔒 Default static image
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const fetchLocations = async () => {
    try {
      const res = await fetch(getApiUrl('api/locations'));
      const data = await res.json();
      setLocations(data);
    } catch (err) {
      console.error('❌ Error fetching locations:', err);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddLocation = async () => {
    const { name, lat, lng } = form;
    if (!name || !lat || !lng) {
      setToast('❗ Name, latitude, and longitude are required');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(getApiUrl('api/locations'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (res.ok) {
        setToast('✅ Location added!');
        setForm({ name: '', address: '', city: '', region: '', lat: '', lng: '', image_url: '/locations/recycle_1.png' });
        fetchLocations();
      } else {
        setToast(`❌ ${data.error || 'Failed to add location'}`);
      }
    } catch (err) {
      console.error('❌ Error adding location:', err);
      setToast('❌ Error adding location');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(getApiUrl(`api/locations/${id}`), { method: 'DELETE' });
      setToast('🗑️ Location deleted');
      fetchLocations();
    } catch (err) {
      console.error('❌ Error deleting location:', err);
      setToast('❌ Failed to delete');
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  return (
    <div className="min-h-screen bg-green-50 pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-green-800 mb-6">📍 Manage Locations</h1>

        {toast && (
          <div className="mb-4 p-3 bg-white shadow rounded text-sm text-gray-700 border">
            {toast}
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-6 mb-10 bg-white p-6 rounded shadow">
          {['name', 'address', 'city', 'region', 'lat', 'lng'].map((field) => (
            <input
              key={field}
              type="text"
              name={field}
              value={form[field]}
              onChange={handleChange}
              placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              className="border border-gray-300 px-3 py-2 rounded w-full"
            />
          ))}

          <button
            onClick={handleAddLocation}
            disabled={loading}
            className="col-span-2 bg-green-600 text-white py-2 rounded hover:bg-green-700"
          >
            {loading ? 'Adding...' : 'Add Location'}
          </button>
        </div>

        <div className="grid gap-6">
          {locations.map((loc) => (
            <div key={loc.id} className="bg-white shadow rounded-lg p-4 flex items-center gap-4">
              <img
                src={loc.image_url || '/locations/recycle_1.png'}
                alt={loc.name}
                className="w-16 h-16 rounded object-cover border"
              />
              <div className="flex-1">
                <h2 className="text-lg font-semibold">{loc.name}</h2>
                <p className="text-sm text-gray-500">{loc.address || '-'}</p>
                <p className="text-xs text-gray-400">
                  {loc.city || ''} {loc.region ? `– ${loc.region}` : ''}
                </p>
              </div>
              <button
                onClick={() => handleDelete(loc.id)}
                className="text-sm text-red-600 hover:underline"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
