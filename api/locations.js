// File: /api/locations.js

const { Pool } = require('pg');
const formidable = require('formidable');
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// === Disable default body parsing for file upload support ===
export const config = {
  api: {
    bodyParser: false,
  },
};

// === Supabase Client ===
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// === PostgreSQL Pool ===
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const setCors = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // Change in prod
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
};

export default async function handler(req, res) {
  const method = req.method;
  setCors(res);
  console.log(`📥 [${method}] /api/locations hit`);

  if (method === 'OPTIONS') return res.status(200).end();

  // === GET: Fetch all locations ===
  if (method === 'GET') {
    try {
      const result = await pool.query('SELECT * FROM locations ORDER BY created_at DESC');
      return res.status(200).json(result.rows);
    } catch (err) {
      console.error('❌ Error in GET:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // === POST: Add new location (with optional image upload) ===
  if (method === 'POST') {
    const form = new formidable.IncomingForm({ keepExtensions: true });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('❌ Form parse error:', err);
        return res.status(400).json({ error: 'Invalid form data' });
      }

      const { name, address, city, region, lat, lng } = fields;
      const image = files.image;

      if (!name || !lat || !lng) {
        return res.status(400).json({ error: 'Missing required fields: name, lat, lng' });
      }

      let imageUrl = null;

      try {
        // === Upload image to Supabase if provided ===
        if (image?.[0]?.filepath) {
          const file = image[0];
          const buffer = fs.readFileSync(file.filepath);
          const ext = file.originalFilename.split('.').pop();
          const path = `locations/${Date.now()}.${ext}`;

          const { error: uploadError } = await supabase.storage
            .from('location-images')
            .upload(path, buffer, {
              contentType: file.mimetype,
              upsert: true,
            });

          if (uploadError) {
            console.error('❌ Supabase upload error:', uploadError.message);
            return res.status(500).json({ error: 'Image upload failed' });
          }

          const { data: publicData } = supabase.storage
            .from('location-images')
            .getPublicUrl(path);

          imageUrl = publicData?.publicUrl || null;
        }

        // === Insert into DB ===
        const result = await pool.query(
          `INSERT INTO locations (id, name, address, city, region, lat, lng, image_url, created_at)
           VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, NOW())
           RETURNING *`,
          [
            name[0],
            address?.[0] || '',
            city?.[0] || '',
            region?.[0] || '',
            parseFloat(lat[0]),
            parseFloat(lng[0]),
            imageUrl,
          ]
        );

        console.log('✅ Location added:', result.rows[0]);
        return res.status(201).json(result.rows[0]);
      } catch (err) {
        console.error('❌ Error inserting location:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
    });

    return; // Avoid duplicate send
  }

  // === DELETE: Remove a location by ID ===
  if (method === 'DELETE') {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'Missing location ID' });

    try {
      await pool.query(`DELETE FROM locations WHERE id = $1`, [id]);
      return res.status(200).json({ message: 'Location deleted successfully' });
    } catch (err) {
      console.error('❌ Error deleting location:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // === Method not allowed fallback ===
  return res.status(405).json({ error: 'Method not allowed' });
}
