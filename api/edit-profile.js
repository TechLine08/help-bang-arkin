// File: /api/edit-profile.js

import { createClient } from '@supabase/supabase-js';
import { Pool } from 'pg';
import formidable from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false, // Allow formidable to parse multipart/form-data
  },
};

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Initialize PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const form = new formidable.IncomingForm({ keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('❌ Form parse error:', err);
      return res.status(400).json({ error: 'Invalid form data' });
    }

    const { user_id, name, country } = fields;
    const file = files.avatar;

    if (!user_id) {
      return res.status(400).json({ error: 'Missing user_id' });
    }

    let avatar_url = null;

    // ⬆️ Handle file upload to Supabase Storage
    if (file && file.filepath && file.originalFilename) {
      try {
        const fileBuffer = fs.readFileSync(file.filepath);
        const fileExt = file.originalFilename.split('.').pop();
        const storagePath = `avatars/${user_id}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(storagePath, fileBuffer, {
            contentType: file.mimetype,
            upsert: true,
          });

        if (uploadError) {
          console.error('❌ Upload error:', uploadError);
          return res.status(500).json({ error: 'Failed to upload avatar' });
        }

        const { data: publicURL } = supabase.storage
          .from('avatars')
          .getPublicUrl(storagePath);

        avatar_url = publicURL.publicUrl;
      } catch (uploadErr) {
        console.error('❌ File upload exception:', uploadErr);
        return res.status(500).json({ error: 'Upload failed' });
      }
    }

    try {
      const updateQuery = `
        UPDATE users
        SET name = COALESCE($2, name),
            country = COALESCE($3, country),
            avatar_url = COALESCE($4, avatar_url)
        WHERE id = $1
        RETURNING *;
      `;

      const values = [user_id, name || null, country || null, avatar_url];

      const result = await pool.query(updateQuery, values);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      console.log('✅ Profile updated:', result.rows[0]);
      return res.status(200).json(result.rows[0]);
    } catch (dbErr) {
      console.error('❌ DB update error:', dbErr);
      return res.status(500).json({ error: 'Database update failed' });
    }
  });
}
