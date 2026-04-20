

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { requireCustomer } = require('../middleware/roles');
const trustService = require('../services/trustService');
const { pool } = require('../config/db');

router.post('/', authenticate, requireCustomer, async (req, res) => {
  try {
    const { booking_id, vendor_id, rating, comment } = req.body;
    if (!booking_id || !vendor_id || rating == null) {
      return res.status(400).json({ error: 'booking_id, vendor_id, rating required' });
    }
    const booking = await pool.query(
      'SELECT * FROM bookings WHERE id = $1 AND customer_id = $2 AND status = $3',
      [booking_id, req.user.id, 'completed']
    );
    if (booking.rows.length === 0) {
      return res.status(403).json({ error: 'Can only rate completed bookings you made' });
    }
    const r = await trustService.addVendorRating(vendor_id, booking_id, req.user.id, rating, comment);
    res.status(201).json({ rating: r });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Failed to add rating' });
  }
});

router.get('/vendor/:vendorId', async (req, res) => {
  try {
    const rating = await trustService.getVendorRating(req.params.vendorId);
    res.json(rating);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch rating' });
  }
});

module.exports = router;
