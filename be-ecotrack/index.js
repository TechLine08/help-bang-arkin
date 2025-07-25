// 🌱 Load Environment Variables (only in local development)
if (process.env.NODE_ENV !== 'production') {
  console.log('📦 Loading .env for local development...');
  require('dotenv').config();
}

// 📦 Core Dependencies
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');

// ✅ Debug: Print environment and DB config
console.log('🌍 Environment:', process.env.NODE_ENV || '❌ Not defined');
console.log('🛢️ DATABASE_URL:', process.env.DATABASE_URL || '❌ Not defined');

// 🗄️ PostgreSQL Connection Setup
let pool;
try {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });
  console.log('✅ PostgreSQL pool initialized successfully');
} catch (err) {
  console.error('❌ Failed to initialize PostgreSQL pool:', err.message);
}

// 📧 Scheduled Email Service
const { sendTips } = require('../scripts/sendMarketingEmails');

// 🚀 Initialize Express App
const app = express();

// 🔧 Global Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
console.log('🔧 Middleware configured');

// 🖼️ Serve Static Files (Only for local)
if (process.env.NODE_ENV !== 'production') {
  const staticPath = path.join(__dirname, 'public/images');
  app.use('/images', express.static(staticPath));
  console.log(`🖼️ Serving static files from: ${staticPath}`);
}

// 🔌 Dynamically Load All Routes
const routeFiles = [
  './routes/auth',
  './routes/contact',
  './routes/marketplace',
  './routes/recycling',
  './routes/locations',
  './routes/progress',
  './routes/leaderboard', // ✅ Re-enabled
];

routeFiles.forEach((routePath) => {
  try {
    const route = require(routePath);
    app.use('/api', route(pool));
    console.log(`✅ Route loaded: ${routePath}`);
  } catch (err) {
    console.error(`❌ Failed to load ${routePath}: ${err.message}`);
  }
});

// 📨 Trigger Cron Manually (also runs on schedule in Vercel)
app.get('/api/send-tips', async (req, res) => {
  try {
    await sendTips();
    console.log('📬 Marketing tips sent successfully');
    res.status(200).json({ success: true, message: 'Marketing tips sent successfully' });
  } catch (err) {
    console.error('❌ Error in /api/send-tips:', err.message);
    res.status(500).json({ success: false, error: 'Failed to send marketing tips' });
  }
});

// 🩺 Health Check Route
app.get('/', (req, res) => {
  console.log('✅ Health check endpoint hit');
  res.send('✅ EcoTrack Backend is Running!');
});

// 🧯 Global Error Handler
app.use((err, req, res, next) => {
  console.error('🔥 Uncaught Exception:', err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// 🔄 Run Dev Server Locally (skip on Vercel)
if (require.main === module) {
  const PORT = process.env.PORT || 5050;
  app.listen(PORT, () => {
    console.log(`🚀 Local server is running at http://localhost:${PORT}`);
  });
}

// 🧪 Export App for Vercel Serverless
module.exports = app;
