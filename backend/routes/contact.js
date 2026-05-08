const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// POST /api/contact  — public, no auth required
router.post('/', async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  // Basic email format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email address.' });
  }

  if (message.length < 10) {
    return res.status(400).json({ message: 'Message is too short.' });
  }

  try {
    await pool.query(
      `INSERT INTO contact_messages (name, email, subject, message, status)
       VALUES ($1, $2, $3, $4, 'unread')`,
      [name.trim(), email.trim().toLowerCase(), subject, message.trim()]
    );
    res.status(201).json({ message: 'Message sent successfully.' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

module.exports = router;