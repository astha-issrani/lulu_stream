const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const authMiddleware = require('../middleware/auth');

// @route   GET /api/videos
// @desc    Get all videos (with pagination)
// @access  Public
router.get('/', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;
  const offset = (page - 1) * limit;
  const sort = req.query.sort || 'latest'; // latest | popular | earnings

  let orderBy = 'v.created_at DESC';
  if (sort === 'popular') orderBy = 'v.views DESC';
  if (sort === 'earnings') orderBy = 'v.earnings DESC';

  try {
    const result = await pool.query(
      `SELECT v.*, u.username, u.avatar_url,
              COUNT(*) OVER() as total_count
       FROM videos v
       JOIN users u ON v.user_id = u.id
       WHERE v.status = 'active'
       ORDER BY ${orderBy}
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const total = result.rows[0]?.total_count || 0;

    res.json({
      videos: result.rows,
      pagination: {
        page,
        limit,
        total: parseInt(total),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get videos error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// @route   GET /api/videos/trending
// @desc    Get trending videos
// @access  Public
router.get('/trending', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT v.*, u.username, u.avatar_url
       FROM videos v
       JOIN users u ON v.user_id = u.id
       WHERE v.status = 'active'
       AND v.created_at > NOW() - INTERVAL '7 days'
       ORDER BY v.views DESC
       LIMIT 8`
    );
    res.json({ videos: result.rows });
  } catch (error) {
    console.error('Trending error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// @route   GET /api/videos/:id
// @desc    Get single video
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT v.*, u.username, u.avatar_url, u.bio
       FROM videos v
       JOIN users u ON v.user_id = u.id
       WHERE v.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Video not found.' });
    }

    // Record view and update earnings (simplified: $0.001 per view)
    await pool.query(
      `UPDATE videos SET views = views + 1, earnings = earnings + 0.001 WHERE id = $1`,
      [req.params.id]
    );
    await pool.query(
      `UPDATE users SET total_views = total_views + 1, total_earnings = total_earnings + 0.001
       WHERE id = $1`,
      [result.rows[0].user_id]
    );

    res.json({ video: result.rows[0] });
  } catch (error) {
    console.error('Get video error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// @route   POST /api/videos
// @desc    Upload/create video
// @access  Private
router.post('/', authMiddleware, async (req, res) => {
  const { title, description, videoUrl, thumbnailUrl, duration, isPremium } = req.body;

  if (!title || !videoUrl) {
    return res.status(400).json({ message: 'Title and video URL are required.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO videos (user_id, title, description, video_url, thumbnail_url, duration, is_premium)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [req.user.id, title, description, videoUrl, thumbnailUrl, duration || 0, isPremium || false]
    );

    res.status(201).json({ video: result.rows[0], message: 'Video uploaded successfully!' });
  } catch (error) {
    console.error('Create video error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// @route   DELETE /api/videos/:id
// @desc    Delete video
// @access  Private
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM videos WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Video not found or unauthorized.' });
    }

    res.json({ message: 'Video deleted successfully.' });
  } catch (error) {
    console.error('Delete video error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// @route   GET /api/videos/user/:userId
// @desc    Get user's videos
// @access  Public
router.get('/user/:userId', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT v.*, u.username, u.avatar_url
       FROM videos v
       JOIN users u ON v.user_id = u.id
       WHERE v.user_id = $1 AND v.status = 'active'
       ORDER BY v.created_at DESC`,
      [req.params.userId]
    );

    res.json({ videos: result.rows });
  } catch (error) {
    console.error('User videos error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;