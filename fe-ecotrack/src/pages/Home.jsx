import React, { useEffect, useState, useCallback } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import Header from '../components/Header';
import Toast from '../components/Toast';
import { Pie } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';
import { getApiUrl } from '../config/api';
import { Link } from 'react-router-dom';
import Select from 'react-select';


Chart.register(ArcElement, Tooltip, Legend);

export default function Home() {
  const [user, setUser] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWasteType, setSelectedWasteType] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [selectedLocationOption, setSelectedLocationOption] = useState(null);
  const [toast, setToast] = useState(null);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  const [leaderboardScope, setLeaderboardScope] = useState('individual');
  const [locations, setLocations] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(false);

  const fetchLogs = async (uid) => {
    try {
      const res = await fetch(getApiUrl(`api/progress?user_id=${uid}`));
      const data = await res.json();
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('❌ Failed to fetch logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLocations = useCallback(async () => {
    setLoadingLocations(true);
    try {
      const res = await fetch(getApiUrl('api/locations'));
      const data = await res.json();
      const locationsWithImages = Array.isArray(data) ? data.map(location => ({
        ...location,
        image_url: '/locations/recycle_1.png'
      })) : [];
      setLocations(locationsWithImages);
    } catch (err) {
      console.error('❌ Failed to fetch locations:', err);
      showToast('Failed to load recycling locations', 'error');
      setLocations([]);
    } finally {
      setLoadingLocations(false);
    }
  }, []);

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchLeaderboard = useCallback(async () => {
    setLoadingLeaderboard(true);
    try {
      const res = await fetch(getApiUrl(`/api/leaderboard?scope=${leaderboardScope}`));
      const data = await res.json();
      const allData = Array.isArray(data)
        ? data
        : data?.success && Array.isArray(data.data)
        ? data.data
        : [];
      if (leaderboardScope === 'individual' && user) {
        const index = allData.findIndex((entry) => entry.user_id === user.uid);
        setUserRank(index !== -1 ? { ...allData[index], rank: index + 1 } : null);
      } else {
        setUserRank(null);
      }
      setLeaderboardData(allData.slice(0, 3));
    } catch (err) {
      console.error('❌ Failed to fetch leaderboard:', err);
      showToast(`Failed to load leaderboard: ${err.message}`, 'error');
      setLeaderboardData([]);
      setUserRank(null);
    } finally {
      setLoadingLeaderboard(false);
    }
  }, [leaderboardScope, user]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        await fetchLogs(firebaseUser.uid);
        await fetchLeaderboard();
        await fetchLocations();
      } else {
        setUser(null);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [fetchLeaderboard, fetchLocations]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user || !selectedWasteType || !quantity || !selectedLocationOption) {
      showToast('Please fill in all fields.', 'error');
      return;
    }

    try {
      const res = await fetch(getApiUrl('api/progress'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.uid,
          location_id: selectedLocationOption.value,
          material_type: selectedWasteType.value,
          bottle_count: Number(quantity),
          weight_kg: Number(quantity) * 0.1,
          points_awarded: 5,
          photo_url: null,
        }),
      });

      if (!res.ok) throw new Error('Failed to submit');

      setSelectedWasteType(null);
      setQuantity('');
      setSelectedLocationOption(null);

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
              <label className="block text-sm font-medium mb-1">Waste Type</label>
              <Select
                options={[
                  { value: 'Plastic', label: 'Plastic' },
                  { value: 'Aluminum', label: 'Aluminum' },
                  { value: 'Glass', label: 'Glass' },
                  { value: 'Paper', label: 'Paper' },
                  { value: 'Other', label: 'Other' },
                ]}
                value={selectedWasteType}
                onChange={setSelectedWasteType}
                placeholder="Select material type"
                isSearchable={false}
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
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium mb-1">
                Recycling Location
              </label>
              <Select
                options={locations.map((loc) => ({
                  value: loc.id,
                  label: `${loc.name} - ${loc.city}`,
                }))}
                value={selectedLocationOption}
                onChange={setSelectedLocationOption}
                placeholder="Select a recycling location"
                isDisabled={loadingLocations || locations.length === 0}
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
                          : item.users?.display_name || item.name || item.user_id}
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

              {/* Show user's rank if not in top 3 */}
              {userRank && userRank.rank > 3 && (
                <div className="border-t pt-4 mt-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-sm">
                        {userRank.rank}
                      </div>
                      <div>
                        <p className="font-medium text-green-800">
                          {userRank.users?.display_name || userRank.user_id}
                        </p>
                        <p className="text-xs text-gray-500">You</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">
                        {(userRank.total_points || 0).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">points</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Marketplace Section */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-green-600">🏪 Marketplace</h2>
          </div>
          <p className="text-gray-600 mb-4">
            Redeem your points for exciting rewards and vouchers!
          </p>
          <Link
            to="/marketplace"
            className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition-colors"
          >
            <span>Browse Vouchers</span>
            <span>→</span>
          </Link>
        </div>

                 {/* Recycling Locations */}
         <div className="bg-white shadow-md rounded-lg p-6 mb-10">
           <div className="flex items-center gap-3 mb-6">
             <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
               <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                 <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
               </svg>
             </div>
             <h2 className="text-xl font-semibold text-green-600">Recycling Points</h2>
           </div>
           
           {loadingLocations ? (
             <div className="text-center py-12">
               <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
               <p className="mt-3 text-gray-600">Finding recycling points near you...</p>
             </div>
           ) : locations.length === 0 ? (
             <div className="text-center py-12">
               <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                 <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                   <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                 </svg>
               </div>
               <p className="text-gray-600">No recycling points available yet.</p>
             </div>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {locations.map((location, index) => (
                 <div key={index} className="group relative bg-gradient-to-br from-green-50 to-white border border-green-100 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:border-green-200">
                   <div className="flex items-start gap-4">
                     <div className="flex-shrink-0">
                       <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center">
                         <img src={location.image_url} alt={location.name} className="w-10 h-10 object-contain" />
                       </div>
                     </div>
                     <div className="flex-1 min-w-0">
                       <h3 className="font-semibold text-gray-900 text-lg mb-2 group-hover:text-green-700 transition-colors">
                         {location.name}
                       </h3>
                       <div className="space-y-1">
                         <p className="text-sm text-gray-600 flex items-center gap-1">
                           <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                             <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                           </svg>
                           {location.address}
                         </p>
                         <p className="text-sm text-gray-500 flex items-center gap-1">
                           <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                             <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                           </svg>
                           {location.city}, {location.region}
                         </p>
                       </div>
                     </div>
                   </div>
                   
                   <div className="mt-4 pt-4 border-t border-green-100">
                     <div className="flex items-center justify-between">
                       <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                         <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                           <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                         </svg>
                         Active
                       </span>
                     </div>
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