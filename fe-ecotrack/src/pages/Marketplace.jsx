import React, { useEffect, useState, useCallback } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import Header from '../components/Header';
import Toast from '../components/Toast';
import { getApiUrl } from '../config/api';

export default function Marketplace() {
  const [vouchers, setVouchers] = useState([]);
  const [userPoints, setUserPoints] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [redeemingId, setRedeemingId] = useState(null);

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchVouchers = useCallback(async (uid) => {
    try {
      const res = await fetch(getApiUrl(`api/marketplace?user_id=${uid}`));
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);

      const data = await res.json();
      setVouchers(Array.isArray(data.vouchers) ? data.vouchers : []);
      setUserPoints(data.points ?? null);
    } catch (err) {
      console.error('❌ Failed to fetch vouchers:', err);
      showToast('Failed to load marketplace data.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (auth.currentUser) {
      fetchVouchers(auth.currentUser.uid);
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await fetchVouchers(firebaseUser.uid);
      }
    });

    return () => unsubscribe();
  }, [fetchVouchers]);

  const handleRedeem = async (voucher) => {
    if (!auth.currentUser) {
      showToast('You must be logged in to redeem.', 'error');
      return;
    }

    try {
      setRedeemingId(voucher.id);
      showToast(`Redeeming ${voucher.title}...`, 'info');

      const res = await fetch(getApiUrl('api/redeem-voucher'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: auth.currentUser.uid,
          voucher_id: voucher.id,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        showToast(data.message || 'Redemption successful!', 'success');
        await fetchVouchers(auth.currentUser.uid);
      } else {
        showToast(data.error || 'Redemption failed.', 'error');
      }
    } catch (err) {
      console.error('❌ Error redeeming:', err);
      showToast('Redemption failed.', 'error');
    } finally {
      setRedeemingId(null);
    }
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
        <p className="text-gray-600 text-center mb-2">
          Redeem your points for exciting rewards and vouchers!
        </p>
        {userPoints !== null && (
          <p className="text-center text-green-700 font-medium mb-8">
            Your Points: <span className="font-bold">{userPoints}</span>
          </p>
        )}

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
                <div className="bg-gray-100 flex items-center justify-center">
                  <img
                    src={`/vouchers/${voucher.image || 'Grab.png'}`}
                    alt={voucher.title}
                    className="w-full h-48 object-contain"
                    onError={(e) => {
                      e.target.src = '/vouchers/Grab.png';
                    }}
                  />
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
                    disabled={
                      !voucher.is_active ||
                      voucher.stock === 0 ||
                      redeemingId === voucher.id
                    }
                    className={`w-full mt-4 py-2 px-4 rounded-md font-medium transition-colors ${
                      voucher.is_active && voucher.stock > 0
                        ? redeemingId === voucher.id
                          ? 'bg-yellow-500 text-white cursor-wait'
                          : 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {redeemingId === voucher.id ? 'Redeeming...' : 'Redeem'}
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
