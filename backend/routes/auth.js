const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const pool = require('../config/db');
const authMiddleware = require('../middleware/auth');

const generateToken = (userId, role) => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// @route   POST /api/auth/register
router.post(
  '/register',
  [
    body('username').trim().isLength({ min: 3, max: 50 }).withMessage('Username must be 3–50 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { username, email, password } = req.body;
    try {
      const existing = await pool.query(
        'SELECT id FROM users WHERE email = $1 OR username = $2',
        [email, username]
      );
      if (existing.rows.length > 0)
        return res.status(409).json({ message: 'Email or username already in use.' });

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const result = await pool.query(
        `INSERT INTO users (username, email, password_hash) 
         VALUES ($1, $2, $3) 
         RETURNING id, username, email, role, avatar_url, is_premium, total_earnings, total_views, created_at`,
        [username, email, passwordHash]
      );

      const user = result.rows[0];
      const token = generateToken(user.id, user.role);

      res.status(201).json({
        message: 'Account created successfully!',
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          avatarUrl: user.avatar_url,
          isPremium: user.is_premium,
          totalEarnings: user.total_earnings,
          totalViews: user.total_views,
        },
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ message: 'Server error during registration.' });
    }
  }
);

// @route   POST /api/auth/login
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;
    try {
      const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

      if (result.rows.length === 0)
        return res.status(401).json({ message: 'Invalid email or password.' });

      const user = result.rows[0];

      if (user.is_banned)
        return res.status(403).json({ message: `Account banned: ${user.ban_reason || 'Contact support.'}` });

      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch)
        return res.status(401).json({ message: 'Invalid email or password.' });

      const token = generateToken(user.id, user.role);

      res.json({
        message: 'Login successful!',
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          avatarUrl: user.avatar_url,
          isPremium: user.is_premium,
          totalEarnings: parseFloat(user.total_earnings),
          totalViews: parseInt(user.total_views),
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Server error during login.' });
    }
  }
);

// @route   GET /api/auth/me
router.get('/me', authMiddleware, async (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role,
      avatarUrl: req.user.avatar_url,
      isPremium: req.user.is_premium,
      totalEarnings: parseFloat(req.user.total_earnings),
      totalViews: parseInt(req.user.total_views),
    }
  });
});

// @route   PUT /api/auth/profile
router.put('/profile', authMiddleware, async (req, res) => {
  const { username, bio, avatarUrl } = req.body;
  try {
    const result = await pool.query(
      `UPDATE users SET username = COALESCE($1, username), bio = COALESCE($2, bio), avatar_url = COALESCE($3, avatar_url)
       WHERE id = $4
       RETURNING id, username, email, role, avatar_url, bio, is_premium, total_earnings, total_views`,
      [username, bio, avatarUrl, req.user.id]
    );
    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// @route   PUT /api/auth/change-password
router.put('/change-password', authMiddleware, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword)
    return res.status(400).json({ message: 'All fields are required.' });

  if (newPassword.length < 6)
    return res.status(400).json({ message: 'New password must be at least 6 characters.' });

  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.id]);

    if (result.rows.length === 0)
      return res.status(404).json({ message: 'User not found.' });

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch)
      return res.status(401).json({ message: 'Current password is incorrect.' });

    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);

    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [newHash, req.user.id]);

    res.json({ message: 'Password changed successfully.' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;