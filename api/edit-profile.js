// File: /api/edit-profile.js

import { createClient } from '@supabase/supabase-js';
import { Pool } from 'pg';
import formidable from 'formidable';
import fs from 'fs';

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

export default async function handler(req, res) {
  console.log('📥 Incoming request to /api/edit-profile');

  // === CORS Headers ===
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // === GET: Fetch user profile ===
  if (req.method === 'GET') {
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({ error: 'Missing user_id' });
    }

    try {
      const result = await pool.query(
        `SELECT id, name, country, avatar_url, marketing_opt_in FROM users WHERE id = $1`,
        [user_id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      const user = result.rows[0];
      const defaultAvatar =
        'https://kqolfqxyiywlkintnoky.supabase.co/storage/v1/object/public/avatars/default.jpg';

      return res.status(200).json({
        ...user,
        avatar_url: user.avatar_url || defaultAvatar,
      });
    } catch (err) {
      console.error('❌ Error fetching user:', err.message);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // === POST: Update profile (name, country, avatar, opt-in) ===
  if (req.method === 'POST') {
    const form = new formidable.IncomingForm({ keepExtensions: true });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('❌ Error parsing form:', err);
        return res.status(400).json({ error: 'Invalid form data' });
      }

      const user_id = fields.user_id?.[0];
      const name = fields.name?.[0];
      const country = fields.country?.[0];
      const marketing_opt_in = fields.marketing_opt_in?.[0];
      const file = files.avatar;

      if (!user_id) {
        return res.status(400).json({ error: 'Missing user_id' });
      }

      let avatar_url = null;

      try {
        // === Upload Avatar if Provided ===
        if (file && file[0] && file[0].filepath) {
          const fileData = file[0];
          const fileBuffer = fs.readFileSync(fileData.filepath);
          const fileExt = fileData.originalFilename.split('.').pop();
          const filePath = `avatars/${user_id}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, fileBuffer, {
              contentType: fileData.mimetype,
              upsert: true,
            });

          if (uploadError) {
            console.error('❌ Upload failed:', uploadError.message);
            return res.status(500).json({ error: 'Failed to upload avatar' });
          }

          const { data: publicURL } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);

          avatar_url = publicURL?.publicUrl || null;
        }

        // === Normalize boolean field ===
        const marketingOpt =
          typeof marketing_opt_in === 'string'
            ? marketing_opt_in.toLowerCase() === 'true'
            : null;

        // === Update DB ===
        const result = await pool.query(
          `
          UPDATE users
          SET name = COALESCE($2, name),
              country = COALESCE($3, country),
              avatar_url = COALESCE($4, avatar_url),
              marketing_opt_in = COALESCE($5, marketing_opt_in)
          WHERE id = $1
          RETURNING id, name, country, avatar_url, marketing_opt_in
        `,
          [user_id, name, country, avatar_url, marketingOpt]
        );

        return res.status(200).json(result.rows[0]);
      } catch (err) {
        console.error('❌ Error updating profile:', err.message);
        return res.status(500).json({ error: 'Internal server error' });
      }
    });

    return; // prevent duplicate response
  }

  // === Method Not Allowed ===
  return res.status(405).json({ error: 'Method not allowed' });
}
