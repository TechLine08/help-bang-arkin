const jwt = require('jsonwebtoken');

/**
 * Middleware to protect routes using JWT.
 * Expects token in 'Authorization: Bearer <token>' or optionally in cookies.
 */
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token =
    authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : req.cookies?.token;

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: Missing token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // e.g., { userId, email }
    next();
  } catch (err) {
    console.error('❌ Invalid token:', err.message);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

module.exports = authMiddleware;
