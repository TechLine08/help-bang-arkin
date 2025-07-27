import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import Header from '../components/Header';
import Toast from '../components/Toast';
import { getApiUrl } from '../config/api';

export default function Marketplace() {
  console.log('🏪 Marketplace component rendered');
  const [user, setUser] = useState(null);
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Log when component mounts
  useEffect(() => {
    console.log('🏪 Marketplace component mounted');
  }, []);

  const fetchVouchers = async () => {
    try {
      console.log('🔍 Fetching vouchers from:', getApiUrl('api/marketplace'));
      const res = await fetch(getApiUrl('api/marketplace'), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      console.log('📡 Response status:', res.status);
      console.log('📡 Response headers:', res.headers);
      
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      
      const data = await res.json();
      console.log('📦 Received data:', data);
      setVouchers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('❌ Failed to fetch vouchers:', err);
      showToast('Failed to load marketplace data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch vouchers immediately if user is already authenticated
    if (auth.currentUser) {
      setUser(auth.currentUser);
      fetchVouchers();
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      // Fetch vouchers regardless of authentication status
      await fetchVouchers();
    });
    return () => unsubscribe();
  }, []);

  const handleRedeem = (voucher) => {
    // TODO: Implement redemption logic
    showToast(`Redeeming ${voucher.title}...`, 'info');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-gray-600">
        <p>Loading marketplace...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <Header />
      <div className="max-w-6xl mx-auto px-4 pt-32 pb-20">
        <h1 className="text-3xl font-bold text-green-700 mb-6 text-center">
          🏪 Marketplace
        </h1>
        <p className="text-gray-600 text-center mb-8">
          Redeem your points for exciting rewards and vouchers!
        </p>

        {vouchers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No vouchers available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vouchers.map((voucher) => (
              <div
                key={voucher.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <div className="aspect-w-16 aspect-h-9 bg-gray-100">
                  {voucher.image_url ? (
                    <img
                      src={voucher.image_url}
                      alt={voucher.title}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.target.src = '/images/vouchers/default.png';
                      }}
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center">
                      <span className="text-4xl">🎁</span>
                    </div>
                  )}
                </div>
                
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {voucher.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {voucher.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-500">⭐</span>
                      <span className="font-semibold text-gray-800">
                        {voucher.points_required} points
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {voucher.stock > 0 ? (
                        <span className="text-green-600 text-sm font-medium">
                          {voucher.stock} available
                        </span>
                      ) : (
                        <span className="text-red-600 text-sm font-medium">
                          Out of stock
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleRedeem(voucher)}
                    disabled={!voucher.is_active || voucher.stock === 0}
                    className={`w-full mt-4 py-2 px-4 rounded-md font-medium transition-colors ${
                      voucher.is_active && voucher.stock > 0
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {voucher.is_active && voucher.stock > 0 ? 'Redeem' : 'Unavailable'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
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