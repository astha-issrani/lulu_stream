const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authMiddleware, adminMiddleware, modMiddleware, logAction } = require('../middleware/roleMiddleware');

// All admin routes require auth first
router.use(authMiddleware);

// ══════════════════════════════
// DASHBOARD STATS
// ══════════════════════════════

// GET /api/admin/stats
router.get('/stats', modMiddleware, async (req, res) => {
  try {
    const [users, videos, earnings, reports, withdrawals, newUsers, newVideos, unreadMessages] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM users WHERE role = $1', ['user']),
      pool.query('SELECT COUNT(*) FROM videos WHERE status = $1', ['active']),
      pool.query('SELECT COALESCE(SUM(total_earnings),0) as total FROM users'),
      pool.query('SELECT COUNT(*) FROM video_reports WHERE status = $1', ['pending']),
      pool.query('SELECT COUNT(*) FROM withdrawals WHERE status = $1', ['pending']),
      pool.query("SELECT COUNT(*) FROM users WHERE created_at >= NOW() - INTERVAL '7 days'"),
      pool.query("SELECT COUNT(*) FROM videos WHERE created_at >= NOW() - INTERVAL '7 days'"),
      pool.query("SELECT COUNT(*) FROM contact_messages WHERE status = 'unread'"),
    ]);

    res.json({
      totalUsers: parseInt(users.rows[0].count),
      totalVideos: parseInt(videos.rows[0].count),
      totalEarnings: parseFloat(earnings.rows[0].total),
      pendingReports: parseInt(reports.rows[0].count),
      pendingWithdrawals: parseInt(withdrawals.rows[0].count),
      newUsersThisWeek: parseInt(newUsers.rows[0].count),
      newVideosThisWeek: parseInt(newVideos.rows[0].count),
      unreadMessages: parseInt(unreadMessages.rows[0].count),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error.' });
  }
});

// ══════════════════════════════
// USER MANAGEMENT
// ══════════════════════════════

// GET /api/admin/users
router.get('/users', modMiddleware, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;
  const search = req.query.search || '';
  const role = req.query.role || '';

  try {
    let query = `SELECT id, username, email, role, is_premium, is_banned, ban_reason,
                   total_earnings, total_views, created_at,
                   COUNT(*) OVER() as total_count
                 FROM users WHERE 1=1`;
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (username ILIKE $${params.length} OR email ILIKE $${params.length})`;
    }
    if (role) {
      params.push(role);
      query += ` AND role = $${params.length}`;
    }

    params.push(limit, offset);
    query += ` ORDER BY created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`;

    const result = await pool.query(query, params);
    const total = result.rows[0]?.total_count || 0;

    res.json({
      users: result.rows,
      pagination: { page, limit, total: parseInt(total), pages: Math.ceil(total / limit) },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error.' });
  }
});

// PUT /api/admin/users/:id/role
router.put('/users/:id/role', adminMiddleware, async (req, res) => {
  const { role } = req.body;
  if (!['user', 'moderator', 'admin'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role.' });
  }
  try {
    await pool.query('UPDATE users SET role = $1 WHERE id = $2', [role, req.params.id]);
    await logAction(req.user.id, 'CHANGE_ROLE', 'user', req.params.id, `Role changed to ${role}`);
    res.json({ message: `Role updated to ${role}` });
  } catch (e) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// PUT /api/admin/users/:id/ban
router.put('/users/:id/ban', modMiddleware, async (req, res) => {
  const { ban, reason } = req.body;
  try {
    await pool.query(
      'UPDATE users SET is_banned = $1, ban_reason = $2 WHERE id = $3',
      [ban, reason || null, req.params.id]
    );
    await logAction(req.user.id, ban ? 'BAN_USER' : 'UNBAN_USER', 'user', req.params.id, reason || '');
    res.json({ message: ban ? 'User banned.' : 'User unbanned.' });
  } catch (e) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// PUT /api/admin/users/:id/premium
router.put('/users/:id/premium', adminMiddleware, async (req, res) => {
  const { isPremium } = req.body;
  try {
    await pool.query('UPDATE users SET is_premium = $1 WHERE id = $2', [isPremium, req.params.id]);
    await logAction(req.user.id, isPremium ? 'GRANT_PREMIUM' : 'REVOKE_PREMIUM', 'user', req.params.id, '');
    res.json({ message: `Premium ${isPremium ? 'granted' : 'revoked'}.` });
  } catch (e) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', adminMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM users WHERE id = $1', [req.params.id]);
    await logAction(req.user.id, 'DELETE_USER', 'user', req.params.id, '');
    res.json({ message: 'User deleted.' });
  } catch (e) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// ══════════════════════════════
// VIDEO MANAGEMENT
// ══════════════════════════════

// GET /api/admin/videos
router.get('/videos', modMiddleware, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;
  const search = req.query.search || '';

  try {
    let query = `SELECT v.*, u.username, u.email,
                   COUNT(*) OVER() as total_count
                 FROM videos v JOIN users u ON v.user_id = u.id WHERE 1=1`;
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (v.title ILIKE $${params.length} OR u.username ILIKE $${params.length})`;
    }

    params.push(limit, offset);
    query += ` ORDER BY v.created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`;

    const result = await pool.query(query, params);
    const total = result.rows[0]?.total_count || 0;

    res.json({
      videos: result.rows,
      pagination: { page, limit, total: parseInt(total), pages: Math.ceil(total / limit) },
    });
  } catch (e) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// PUT /api/admin/videos/:id/status
router.put('/videos/:id/status', modMiddleware, async (req, res) => {
  const { status } = req.body;
  if (!['active', 'inactive'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status.' });
  }
  try {
    await pool.query('UPDATE videos SET status = $1 WHERE id = $2', [status, req.params.id]);
    await logAction(req.user.id, 'CHANGE_VIDEO_STATUS', 'video', req.params.id, `Status → ${status}`);
    res.json({ message: `Video ${status}.` });
  } catch (e) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// DELETE /api/admin/videos/:id
router.delete('/videos/:id', modMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM videos WHERE id = $1', [req.params.id]);
    await logAction(req.user.id, 'DELETE_VIDEO', 'video', req.params.id, '');
    res.json({ message: 'Video deleted.' });
  } catch (e) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// ══════════════════════════════
// REPORTS
// ══════════════════════════════

// GET /api/admin/reports
router.get('/reports', modMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT r.*, v.title as video_title, u.username as reporter_name
       FROM video_reports r
       JOIN videos v ON r.video_id = v.id
       LEFT JOIN users u ON r.reporter_id = u.id
       WHERE r.status = 'pending'
       ORDER BY r.created_at DESC`
    );
    res.json({ reports: result.rows });
  } catch (e) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// PUT /api/admin/reports/:id
router.put('/reports/:id', modMiddleware, async (req, res) => {
  const { status } = req.body;
  try {
    await pool.query(
      'UPDATE video_reports SET status = $1, reviewed_by = $2 WHERE id = $3',
      [status, req.user.id, req.params.id]
    );
    res.json({ message: 'Report updated.' });
  } catch (e) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// ══════════════════════════════
// WITHDRAWALS
// ══════════════════════════════

// GET /api/admin/withdrawals
router.get('/withdrawals', modMiddleware, async (req, res) => {
  const status = req.query.status || 'pending';
  try {
    const result = await pool.query(
      `SELECT w.*, u.username, u.email
       FROM withdrawals w JOIN users u ON w.user_id = u.id
       WHERE w.status = $1
       ORDER BY w.created_at DESC`,
      [status]
    );
    res.json({ withdrawals: result.rows });
  } catch (e) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// PUT /api/admin/withdrawals/:id
router.put('/withdrawals/:id', adminMiddleware, async (req, res) => {
  const { status, adminNote } = req.body;
  try {
    await pool.query(
      `UPDATE withdrawals SET status=$1, admin_note=$2, processed_by=$3, processed_at=NOW()
       WHERE id=$4`,
      [status, adminNote || '', req.user.id, req.params.id]
    );
    await logAction(req.user.id, 'PROCESS_WITHDRAWAL', 'withdrawal', req.params.id, `Status → ${status}`);
    res.json({ message: `Withdrawal ${status}.` });
  } catch (e) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// ══════════════════════════════
// CONTACT MESSAGES
// ══════════════════════════════

// GET /api/admin/messages
router.get('/messages', modMiddleware, async (req, res) => {
  const status = req.query.status || 'unread';
  try {
    const result = await pool.query(
      `SELECT * FROM contact_messages WHERE status = $1 ORDER BY created_at DESC`,
      [status]
    );
    res.json({ messages: result.rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error.' });
  }
});

// PUT /api/admin/messages/:id  — update status
router.put('/messages/:id', modMiddleware, async (req, res) => {
  const { status } = req.body;
  if (!['unread', 'read', 'resolved'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status.' });
  }
  try {
    await pool.query(
      'UPDATE contact_messages SET status = $1 WHERE id = $2',
      [status, req.params.id]
    );
    res.json({ message: 'Message updated.' });
  } catch (e) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// DELETE /api/admin/messages/:id
router.delete('/messages/:id', adminMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM contact_messages WHERE id = $1', [req.params.id]);
    res.json({ message: 'Message deleted.' });
  } catch (e) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// ══════════════════════════════
// AUDIT LOGS
// ══════════════════════════════

// GET /api/admin/audit-logs
router.get('/audit-logs', adminMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT l.*, u.username as admin_name
       FROM audit_logs l JOIN users u ON l.admin_id = u.id
       ORDER BY l.created_at DESC LIMIT 100`
    );
    res.json({ logs: result.rows });
  } catch (e) {
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;