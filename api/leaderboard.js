import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// CORS helper
const setCorsHeaders = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
};

export default async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { scope = 'individual', material_type } = req.query;

  try {
    if (scope === 'country') {
      let { data, error } = await supabase
        .from('national_leaderboard')
        .select('country, total_weight, updated_at, materials');

      if (error) throw error;

      if (material_type) {
        data = data.filter(
          (entry) =>
            entry.materials &&
            entry.materials[material_type] &&
            entry.materials[material_type].count !== null
        );
      }

      const sorted = data.sort((a, b) => b.total_weight - a.total_weight);
      return res.status(200).json(sorted);
    } else {
      // First get all leaderboard entries
      let { data: leaderboardData, error: lbError } = await supabase
        .from('leaderboard')
        .select('*')
        .eq('period', 'weekly');

      if (lbError) throw lbError;

      // Extract all unique user IDs
      const userIds = [...new Set(leaderboardData.map(entry => entry.user_id))];

      // Then get all user profiles in one query
      let { data: userProfiles, error: upError } = await supabase
        .from('users')  // or 'profiles' - use your actual table name
        .select('id, name')
        .in('id', userIds);

      if (upError) throw upError;

      // Create a map of user_id to name for easy lookup
      const userMap = {};
      userProfiles.forEach(user => {
        userMap[user.id] = user.name || 'Anonymous Recycler';
      });

      // Combine the data
      const enrichedData = leaderboardData.map(entry => ({
        ...entry,
        name: userMap[entry.user_id] || 'Anonymous Recycler'
      }));

      // Filter by material type if specified
      if (material_type) {
        enrichedData = enrichedData.filter(
          entry =>
            entry.materials &&
            entry.materials[material_type] &&
            entry.materials[material_type].count !== null
        );
      }

      // Sort by total_points descending
      const sorted = enrichedData.sort((a, b) => b.total_points - a.total_points);

      return res.status(200).json(sorted);
    }
  } catch (err) {
    console.error('❌ Leaderboard API Error:', err);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: err.message 
    });
  }
}