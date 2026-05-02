const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const authMiddleware = require('../middleware/auth');

// @route   GET /api/earnings
// @desc    Get user earnings summary
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await pool.query(
      'SELECT total_earnings, total_views FROM users WHERE id = $1',
      [req.user.id]
    );

    const todayEarnings = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) as today
       FROM earnings
       WHERE user_id = $1 AND created_at >= CURRENT_DATE`,
      [req.user.id]
    );

    const yesterdayEarnings = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) as yesterday
       FROM earnings
       WHERE user_id = $1
       AND created_at >= CURRENT_DATE - INTERVAL '1 day'
       AND created_at < CURRENT_DATE`,
      [req.user.id]
    );

    const weeklyEarnings = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) as weekly
       FROM earnings
       WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '7 days'`,
      [req.user.id]
    );

    const today = parseFloat(todayEarnings.rows[0].today);
    const yesterday = parseFloat(yesterdayEarnings.rows[0].yesterday);
    const percentChange = yesterday > 0 ? ((today - yesterday) / yesterday) * 100 : 0;

    res.json({
      totalEarnings: parseFloat(user.rows[0].total_earnings),
      totalViews: parseInt(user.rows[0].total_views),
      todayEarnings: today,
      yesterdayEarnings: yesterday,
      weeklyEarnings: parseFloat(weeklyEarnings.rows[0].weekly),
      percentChange: parseFloat(percentChange.toFixed(1)),
    });
  } catch (error) {
    console.error('Earnings error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// @route   GET /api/earnings/history
// @desc    Get earnings history
// @access  Private
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT e.*, v.title as video_title
       FROM earnings e
       LEFT JOIN videos v ON e.video_id = v.id
       WHERE e.user_id = $1
       ORDER BY e.created_at DESC
       LIMIT 50`,
      [req.user.id]
    );

    res.json({ history: result.rows });
  } catch (error) {
    console.error('Earnings history error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// @route   GET /api/earnings/top-videos
// @desc    Get top earning videos
// @access  Private
router.get('/top-videos', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, title, views, earnings, thumbnail_url
       FROM videos
       WHERE user_id = $1
       ORDER BY earnings DESC
       LIMIT 5`,
      [req.user.id]
    );

    res.json({ videos: result.rows });
  } catch (error) {
    console.error('Top videos error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;