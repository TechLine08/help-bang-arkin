// File: /api/edit-profile.js

import { createClient } from '@supabase/supabase-js';
import { Pool } from 'pg';
import formidable from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

// Supabase Client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// PostgreSQL Client
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export default async function handler(req, res) {
  console.log('📡 edit-profile endpoint hit with method:', req.method);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const form = new formidable.IncomingForm({ keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    console.log('🧾 Parsing form...');
    if (err) {
      console.error('❌ Form parsing error:', err);
      return res.status(400).json({ error: 'Invalid form data' });
    }

    console.log('📦 Parsed fields:', fields);
    console.log('🖼️ Parsed files:', files);

    const { user_id, name, country } = fields;
    const file = files.avatar;

    if (!user_id) {
      console.warn('⚠️ Missing user_id');
      return res.status(400).json({ error: 'Missing user_id' });
    }

    let avatar_url = null;

    // Upload to Supabase
    if (file && file.filepath && file.originalFilename) {
      try {
        const fileBuffer = fs.readFileSync(file.filepath);
        const ext = file.originalFilename.split('.').pop();
        const filePath = `avatars/${user_id}.${ext}`;

        console.log(`⬆️ Uploading file to Supabase path: ${filePath}`);

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, fileBuffer, {
            contentType: file.mimetype,
            upsert: true,
          });

        if (uploadError) {
          console.error('❌ Upload failed:', uploadError);
          return res.status(500).json({ error: 'Failed to upload avatar' });
        }

        const { data: publicUrlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        avatar_url = publicUrlData?.publicUrl;
        console.log('✅ Uploaded avatar URL:', avatar_url);
      } catch (uploadErr) {
        console.error('❌ Upload exception:', uploadErr);
        return res.status(500).json({ error: 'Upload crashed' });
      }
    }

    // Update DB
    try {
      const query = `
        UPDATE users
        SET name = COALESCE($2, name),
            country = COALESCE($3, country),
            avatar_url = COALESCE($4, avatar_url)
        WHERE id = $1
        RETURNING *;
      `;

      const values = [user_id, name || null, country || null, avatar_url];
      console.log('📝 Running SQL update with:', values);

      const result = await pool.query(query, values);

      if (result.rows.length === 0) {
        console.warn('⚠️ No user found with id:', user_id);
        return res.status(404).json({ error: 'User not found' });
      }

      console.log('✅ Updated user:', result.rows[0]);
      return res.status(200).json(result.rows[0]);
    } catch (dbErr) {
      console.error('❌ Database error:', dbErr);
      return res.status(500).json({ error: 'Database update failed' });
    }
  });
}
