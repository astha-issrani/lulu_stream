const pool = require('../config/db');
const jwt = require('jsonwebtoken');

// Verify JWT and attach user
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'No token provided.' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const result = await pool.query(
      'SELECT id, username, email, avatar_url, role, is_premium, is_banned, total_earnings, total_views FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) return res.status(401).json({ message: 'User not found.' });
    if (result.rows[0].is_banned) return res.status(403).json({ message: 'Your account has been banned.' });

    req.user = result.rows[0];
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') return res.status(401).json({ message: 'Invalid token.' });
    if (error.name === 'TokenExpiredError') return res.status(401).json({ message: 'Token expired.' });
    res.status(500).json({ message: 'Server error.' });
  }
};

// Admin only
const adminMiddleware = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'Not authenticated.' });
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required.' });
  next();
};

// Admin or Moderator
const modMiddleware = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'Not authenticated.' });
  if (!['admin', 'moderator'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Moderator access required.' });
  }
  next();
};

// Log admin actions helper
const logAction = async (adminId, action, targetType, targetId, details) => {
  try {
    await pool.query(
      'INSERT INTO audit_logs (admin_id, action, target_type, target_id, details) VALUES ($1,$2,$3,$4,$5)',
      [adminId, action, targetType, targetId, details]
    );
  } catch (e) {
    console.error('Audit log error:', e);
  }
};

module.exports = { authMiddleware, adminMiddleware, modMiddleware, logAction };