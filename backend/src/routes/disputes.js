

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/roles');
const trustService = require('../services/trustService');
const { pool } = require('../config/db');

router.post('/', authenticate, async (req, res) => {
  try {
    const { booking_id, reason } = req.body;
    if (!booking_id || !reason) return res.status(400).json({ error: 'booking_id, reason required' });
    const user = await pool.query('SELECT id FROM users WHERE firebase_uid = $1', [req.firebaseUid]);
    if (user.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    const booking = await pool.query(
      'SELECT * FROM bookings WHERE id = $1 AND (customer_id = $2 OR vendor_id IN (SELECT id FROM vendors WHERE user_id = $2))',
      [booking_id, user.rows[0].id]
    );
    if (booking.rows.length === 0) return res.status(403).json({ error: 'Forbidden' });
    const dispute = await trustService.createDispute(booking_id, user.rows[0].id, reason);
    res.status(201).json({ dispute });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create dispute' });
  }
});

router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT d.*, b.booking_reference, u.email as raised_by_email
       FROM disputes d
       JOIN bookings b ON b.id = d.booking_id
       JOIN users u ON u.id = d.raised_by
       ORDER BY d.created_at DESC`
    );
    res.json({ disputes: r.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch disputes' });
  }
});

router.post('/:id/resolve', authenticate, requireAdmin, async (req, res) => {
  try {
    const { resolution_notes } = req.body;
    const dispute = await trustService.resolveDispute(
      req.params.id,
      req.user.id,
      resolution_notes
    );
    if (!dispute) return res.status(404).json({ error: 'Dispute not found' });
    res.json({ dispute });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to resolve dispute' });
  }
});

module.exports = router;
