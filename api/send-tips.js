// File: /api/send-tips.js

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const { sendTips } = require('../scripts/sendMarketingEmails');

module.exports = async (req, res) => {
  // === ✅ CORS headers ===
  res.setHeader('Access-Control-Allow-Origin', '*'); // Use your frontend domain in production
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // === ✅ Handle preflight CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // === ✅ Optional: Restrict to POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    await sendTips();
    console.log('📬 Marketing tips sent successfully');
    return res.status(200).json({ success: true, message: 'Marketing tips sent successfully' });
  } catch (err) {
    console.error('❌ Failed to send tips:', err);
    return res.status(500).json({ success: false, error: 'Failed to send marketing tips' });
  }
};
