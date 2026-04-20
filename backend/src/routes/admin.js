const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/roles');
const { pool } = require('../config/db');
const paymentService = require('../services/paymentService');
const analyticsService = require('../services/analyticsService');

router.get('/dashboard', authenticate, requireAdmin, async (req, res) => {
  try {
    const [vendors, bookings, payments, users, analytics] = await Promise.all([
      pool.query("SELECT COUNT(*) as total FROM vendors WHERE verification_status = 'pending'"),
      pool.query('SELECT COUNT(*) as total FROM bookings WHERE status IN ($1, $2)', ['paid', 'confirmed']),
      pool.query("SELECT COUNT(*) as total, COALESCE(SUM(amount_cents), 0) as total_hold FROM payments WHERE status = 'success'"),
      pool.query('SELECT COUNT(*) as total FROM users'),
      analyticsService.getAdminAnalytics(),
    ]);

    res.json({
      pending_vendors: parseInt(vendors.rows[0].total, 10),
      active_bookings: parseInt(bookings.rows[0].total, 10),
      total_users: parseInt(users.rows[0].total, 10),
      payments_hold_count: parseInt(payments.rows[0].total, 10),
      payments_hold_amount_cents: parseInt(payments.rows[0].total_hold || 0, 10),
      analytics,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch dashboard' });
  }
});

router.get('/vendors', authenticate, requireAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    let query = `SELECT v.*, u.email, u.full_name, u.phone FROM vendors v JOIN users u ON u.id = v.user_id`;
    const params = [];
    if (status) {
      query += ' WHERE v.verification_status = $1';
      params.push(status);
    }
    query += ' ORDER BY v.created_at DESC';
    const r = await pool.query(query, params);
    res.json({ vendors: r.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch vendors' });
  }
});

router.post('/vendors/:id/approve', authenticate, requireAdmin, async (req, res) => {
  try {
    const r = await pool.query(
      `UPDATE vendors SET verification_status = 'approved', verified_at = NOW(), rejection_reason = NULL WHERE id = $1 RETURNING *`,
      [req.params.id]
    );
    if (r.rows.length === 0) return res.status(404).json({ error: 'Vendor not found' });
    res.json({ vendor: r.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to approve vendor' });
  }
});

router.post('/vendors/:id/reject', authenticate, requireAdmin, async (req, res) => {
  try {
    const { reason } = req.body;
    const r = await pool.query(
      `UPDATE vendors SET verification_status = 'rejected', rejection_reason = $1 WHERE id = $2 RETURNING *`,
      [reason || null, req.params.id]
    );
    if (r.rows.length === 0) return res.status(404).json({ error: 'Vendor not found' });
    res.json({ vendor: r.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to reject vendor' });
  }
});

router.get('/bookings', authenticate, requireAdmin, async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT b.*, p.title as package_title, u.full_name as customer_name, u.email as customer_email
       FROM bookings b
       JOIN packages p ON p.id = b.package_id
       JOIN users u ON u.id = b.customer_id
       ORDER BY b.created_at DESC
       LIMIT 100`
    );
    res.json({ bookings: r.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

router.get('/payments', authenticate, requireAdmin, async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT p.*, b.booking_reference, b.total_amount_cents as booking_total
       FROM payments p
       JOIN bookings b ON b.id = p.booking_id
       WHERE p.status IN ('success', 'released')
       ORDER BY p.paid_at DESC NULLS LAST
       LIMIT 100`
    );
    res.json({ payments: r.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

router.post('/payments/:id/release', authenticate, requireAdmin, async (req, res) => {
  try {
    const payment = await paymentService.releasePaymentToVendor(req.params.id, req.user.id);
    if (!payment) return res.status(404).json({ error: 'Payment not found or already released' });
    res.json({ payment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to release payment' });
  }
});

router.get('/analytics', authenticate, requireAdmin, async (req, res) => {
  try {
    const analytics = await analyticsService.getAdminAnalytics(req.query.from, req.query.to);
    res.json(analytics);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

router.get('/packages', authenticate, requireAdmin, async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT p.*, 
        (SELECT json_agg(json_build_object('id', pt.id, 'name', pt.name, 'price_cents', pt.price_cents))
         FROM package_tiers pt WHERE pt.package_id = p.id) as tiers
       FROM packages p ORDER BY p.created_at DESC`
    );
    res.json({ packages: r.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch packages' });
  }
});

module.exports = router;
