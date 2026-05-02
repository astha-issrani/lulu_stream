const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Fetch fresh user data (role added)
    const result = await pool.query(
      'SELECT id, username, email, role, avatar_url, is_premium, total_earnings, total_views, is_banned FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'User not found.' });
    }

    // Block banned users
    if (result.rows[0].is_banned) {
      return res.status(403).json({ message: 'Your account has been banned.' });
    }

    req.user = result.rows[0];
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token.' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired.' });
    }
    console.error('Auth middleware error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = authMiddleware;