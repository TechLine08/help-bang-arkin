// File: /api/edit-profile.js

import { createClient } from '@supabase/supabase-js';
import { Pool } from 'pg';
import formidable from 'formidable';
import fs from 'fs';

// Vercel serverless config to disable default body parser
export const config = {
  api: {
    bodyParser: false,
  },
};

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Initialize PostgreSQL pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export default async function handler(req, res) {
  console.log('📥 Incoming request to /api/edit-profile');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const form = new formidable.IncomingForm({ keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('❌ Error parsing form:', err);
      return res.status(400).json({ error: 'Invalid form data' });
    }

    console.log('📦 Parsed fields:', fields);
    console.log('🖼️ Parsed files:', files);

    const user_id = fields.user_id?.[0];
    const name = fields.name?.[0];
    const country = fields.country?.[0];
    const file = files.avatar;

    if (!user_id) {
      console.error('❌ Missing user_id');
      return res.status(400).json({ error: 'Missing user_id' });
    }

    let avatar_url = null;

    try {
      // === Upload image to Supabase if exists ===
      if (file && file[0] && file[0].filepath) {
        const fileData = file[0];
        const fileBuffer = fs.readFileSync(fileData.filepath);
        const fileExt = fileData.originalFilename.split('.').pop();
        const filePath = `avatars/${user_id}.${fileExt}`;

        console.log('📤 Uploading to Supabase:', filePath);

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
        console.log('✅ Avatar uploaded:', avatar_url);
      }

      // === Update user in PostgreSQL ===
      const result = await pool.query(
        `
        UPDATE users
        SET name = COALESCE($2, name),
            country = COALESCE($3, country),
            avatar_url = COALESCE($4, avatar_url)
        WHERE id = $1
        RETURNING *;
      `,
        [user_id, name, country, avatar_url]
      );

      console.log('✅ User updated:', result.rows[0]);
      return res.status(200).json(result.rows[0]);
    } catch (e) {
      console.error('❌ Internal error during profile update:', e);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
}
