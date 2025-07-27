import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ✅ CORS helper
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
  let query;

  try {
    if (scope === 'country') {
      query = supabase
        .from('national_leaderboard')
        .select('country, total_weight, updated_at, materials');

      if (material_type) {
        query = query.filter(`materials->${material_type}->>count`, 'is not', null);
      }

      const { data, error } = await query;

      if (error) throw error;

      const sorted = data.sort((a, b) => b.total_weight - a.total_weight);
      return res.status(200).json(sorted);
    } else {
      query = supabase
        .from('leaderboard')
        .select('user_id, total_points, total_weight, year, week, materials')
        .eq('period', 'weekly');

      if (material_type) {
        query = query.filter(`materials->${material_type}->>count`, 'is not', null);
      }

      const { data, error } = await query;

      if (error) throw error;

      const sorted = data.sort((a, b) => b.total_points - a.total_points);
      return res.status(200).json(sorted);
    }
  } catch (err) {
    console.error('❌ Leaderboard API Error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
