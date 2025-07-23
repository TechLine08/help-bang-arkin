// 🌱 Load Environment Variables
require('dotenv').config();

// 📦 Dependencies
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');

// 🗄️ PostgreSQL Connection Pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false,
});

// 📧 Import marketing tip sender
const { sendTips } = require('./scripts/sendMarketingEmails');

// 🚀 Initialize Express App
const app = express();

// 🔧 Global Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🖼️ Static Assets (e.g., images for vouchers)
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// 🔌 API Routes
app.use('/api', require('./routes/auth')(pool));
app.use('/api', require('./routes/contact')(pool));
app.use('/api', require('./routes/marketplace')(pool));
app.use('/api', require('./routes/recycling')(pool));
app.use('/api', require('./routes/locations')(pool));
app.use('/api', require('./routes/progress')(pool));
app.use('/api', require('./routes/leaderboard')(pool));

// 📨 Cron route for marketing tips
app.get('/api/send-tips', async (req, res) => {
  try {
    await sendTips();
    res.status(200).json({ success: true, message: 'Marketing tips sent successfully' });
  } catch (err) {
    console.error('❌ Failed to send tips:', err);
    res.status(500).json({ success: false, error: 'Failed to send marketing tips' });
  }
});

// 🩺 Health Check
app.get('/', (req, res) => {
  res.send('✅ EcoTrack Backend is Running!');
});

// 🧪 Local development server (only if run directly)
if (require.main === module) {
  const PORT = process.env.PORT || 5050;
  app.listen(PORT, () => {
    console.log(`✅ Server running locally at http://localhost:${PORT}`);
  });
}

// 📦 Export app for Vercel
module.exports = app;
