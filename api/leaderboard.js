// File: /api/leaderboard.js

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check required env vars
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({ error: 'Missing Supabase env variables' });
  }

  const { scope = 'individual', material_type } = req.query;

  try {
    // Build base query
    let query = supabase
      .from('leaderboard')
      .select('user_id, country, total_points, total_weight, year, week, materials')
      .eq('period', 'weekly');

    // Optional material_type filtering
    if (material_type) {
      query = query.filter(`materials->${material_type}->>count`, 'is not', null);
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ Supabase error:', error.message);
      return res.status(500).json({ error: error.message });
    }

    if (!data || data.length === 0) {
      return res.status(200).json([]);
    }

    // Grouped by country
    if (scope === 'country') {
      const grouped = {};

      for (const row of data) {
        const { country = 'Unknown', total_weight, total_points, materials } = row;

        if (!grouped[country]) {
          grouped[country] = {
            country,
            total_weight: 0,
            total_points: 0,
            materials: {},
          };
        }

        grouped[country].total_weight += total_weight || 0;
        grouped[country].total_points += total_points || 0;

        // Merge materials
        for (const [type, stats] of Object.entries(materials || {})) {
          if (!grouped[country].materials[type]) {
            grouped[country].materials[type] = { count: 0, weight: 0 };
          }
          grouped[country].materials[type].count += Number(stats.count || 0);
          grouped[country].materials[type].weight += Number(stats.weight || 0);
        }
      }

      const result = Object.values(grouped).sort((a, b) => b.total_points - a.total_points);
      return res.status(200).json(result);
    }

    // Default: Individual leaderboard
    const sorted = data
      .sort((a, b) => b.total_points - a.total_points)
      .slice(0, 10); // Limit to top 10

    return res.status(200).json(sorted);
  } catch (err) {
    console.error('❌ Handler crash:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
