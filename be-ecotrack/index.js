// 🌱 Load Environment Variables (only in local development)
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

// 📦 Dependencies
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');

// ✅ Log the environment and check DATABASE_URL
console.log('🌍 NODE_ENV:', process.env.NODE_ENV);
console.log('🛢️ DATABASE_URL:', process.env.DATABASE_URL || '❌ Not defined');

// 🗄️ PostgreSQL Connection Pool
let pool;
try {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });
  console.log('✅ PostgreSQL pool created');
} catch (err) {
  console.error('❌ Failed to create PostgreSQL pool:', err);
}

// 📧 Marketing Email Sender
const { sendTips } = require('./scripts/sendMarketingEmails');

// 🚀 Initialize Express App
const app = express();

// 🔧 Global Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🖼️ Static Assets (local dev only)
if (process.env.NODE_ENV !== 'production') {
  app.use('/images', express.static(path.join(__dirname, 'public/images')));
}

// 🔌 API Routes
const routes = [
  './routes/auth',
  './routes/contact',
  './routes/marketplace',
  './routes/recycling',
  './routes/locations',
  './routes/progress',
  './routes/leaderboard',
];

routes.forEach((routePath) => {
  try {
    const route = require(routePath);
    app.use('/api', route(pool));
    console.log(`✅ Loaded route: ${routePath}`);
  } catch (err) {
    console.error(`❌ Failed to load route ${routePath}:`, err.message);
  }
});

// 📨 Cron Endpoint (Manual trigger)
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

// 🛠️ Global Error Handler
app.use((err, req, res, next) => {
  console.error('🔥 Uncaught error:', err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// 🔄 Local Dev Server (Skip in Vercel)
if (require.main === module) {
  const PORT = process.env.PORT || 5050;
  app.listen(PORT, () => {
    console.log(`🚀 Server running locally at http://localhost:${PORT}`);
  });
}

// 🔁 Export app (for Vercel)
module.exports = app;
