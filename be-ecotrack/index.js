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

// 🚀 Initialize Express App
const app = express();
const PORT = process.env.PORT || 5050;

// 🔧 Global Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🌍 Static Assets (optional future use)
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 🔌 Route Modules
const authRoutes = require('./routes/auth');
const contactRoutes = require('./routes/contact');
const marketplaceRoutes = require('./routes/marketplace');
const recyclingRoutes = require('./routes/recycling');
const locationsRoutes = require('./routes/locations');
const progressRoutes = require('./routes/progress');     // 🆕
const leaderboardRoutes = require('./routes/leaderboard'); // 🆕

// 🔗 API Route Registration
app.use('/api', authRoutes(pool));
app.use('/api', contactRoutes(pool));
app.use('/api', marketplaceRoutes(pool));
app.use('/api', recyclingRoutes(pool));
app.use('/api', locationsRoutes(pool));
app.use('/api', progressRoutes(pool));       // 🆕
app.use('/api', leaderboardRoutes(pool));    // 🆕

// 🩺 Health Check
app.get('/', (req, res) => {
  res.send('✅ EcoTrack Backend is Running!');
});

// 🚀 Start Server
app.listen(PORT, () => {
  console.log(`✅ EcoTrack Backend running at http://localhost:${PORT}`);
});
