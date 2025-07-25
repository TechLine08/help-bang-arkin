// File: /api/edit-profile.js

import { createClient } from '@supabase/supabase-js';
import { Pool } from 'pg';
import formidable from 'formidable';
import fs from 'fs';

// === Vercel serverless config to disable bodyParser ===
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

// === Handler ===
export default async function handler(req, res) {
  console.log('📥 Incoming request to /api/edit-profile');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Setup formidable for file parsing
  const form = new formidable.IncomingForm({ keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('❌ Error parsing form:', err);
      return res.status(400).json({ error: 'Invalid form data' });
    }

    console.log('📦 Fields:', fields);
    console.log('🖼️ Files:', files);

    const user_id = fields.user_id?.[0];
    const name = fields.name?.[0];
    const country = fields.country?.[0];
    const file = files.avatar;

    if (!user_id) {
      return res.status(400).json({ error: 'Missing user_id' });
    }

    let avatar_url = null;

    try {
      // === Upload to Supabase if file exists ===
      if (file && file[0]?.filepath) {
        const fileData = file[0];
        const fileBuffer = fs.readFileSync(fileData.filepath);
        const fileExt = fileData.originalFilename.split('.').pop();
        const filePath = `avatars/${user_id}.${fileExt}`;

        console.log('📤 Uploading file to Supabase:', filePath);

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, fileBuffer, {
            contentType: fileData.mimetype,
            upsert: true,
          });

        if (uploadError) {
          console.error('❌ Supabase upload error:', uploadError);
          return res.status(500).json({ error: 'Failed to upload avatar' });
        }

        const { data: publicURL } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        avatar_url = publicURL.publicUrl;
        console.log('✅ Uploaded avatar URL:', avatar_url);
      }

      // === Update user in DB ===
      const query = `
        UPDATE users
        SET name = COALESCE($2, name),
            country = COALESCE($3, country),
            avatar_url = COALESCE($4, avatar_url)
        WHERE id = $1
        RETURNING *;
      `;

      const values = [user_id, name, country, avatar_url];
      const result = await pool.query(query, values);

      console.log('✅ Updated user:', result.rows[0]);
      return res.status(200).json(result.rows[0]);
    } catch (e) {
      console.error('❌ Error updating profile:', e);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
}
