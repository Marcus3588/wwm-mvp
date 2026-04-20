const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { requireCustomer, requireVendor } = require('../middleware/roles');
const bookingService = require('../services/bookingService');
const paymentService = require('../services/paymentService');
const userService = require('../services/userService');
const cancellationService = require('../services/cancellationService');
const vendorMatchingService = require('../services/vendorMatchingService');
const notificationService = require('../services/notificationService');
const analyticsService = require('../services/analyticsService');
const { pool } = require('../config/db');

router.post('/', authenticate, requireCustomer, async (req, res) => {
  try {
    const { package_id, package_tier_id, event_date, event_time, event_location, guest_count, customization_notes, total_amount_cents } = req.body;
    if (!package_id || !event_date || total_amount_cents == null) {
      return res.status(400).json({ error: 'Missing required fields: package_id, event_date, total_amount_cents' });
    }
    const booking = await bookingService.createBooking({
      customer_id: req.user.id,
      package_id,
      package_tier_id: package_tier_id || null,
      event_date,
      event_time: event_time || null,
      event_location: event_location || null,
      guest_count: guest_count || 1,
      customization_notes: customization_notes || null,
      total_amount_cents: parseInt(total_amount_cents, 10),
    });
    res.status(201).json({ booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

router.get('/my', authenticate, requireCustomer, async (req, res) => {
  try {
    const bookings = await bookingService.getBookingsByCustomer(req.user.id);
    res.json({ bookings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

router.get('/vendor', authenticate, requireVendor, async (req, res) => {
  try {
    let vendorId = 'mock-vendor-1';
    try {
      const vendor = await pool.query('SELECT id FROM vendors WHERE user_id = $1', [req.user.id]);
      if (vendor.rows.length > 0) vendorId = vendor.rows[0].id;
    } catch (_) { }

    try {
      const [myBookings, availableBookings] = await Promise.all([
        bookingService.getBookingsByVendor(vendorId),
        bookingService.getAvailableBookingsForVendor(),
      ]);
      const bookings = [...availableBookings, ...myBookings];
      res.json({ bookings: bookings || [] });
    } catch (dbErr) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[DEV] Mocking vendor bookings due to error:', dbErr.message);
        return res.json({ bookings: [] });
      }
      throw dbErr;
    }
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      return res.json({ bookings: [] });
    }
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const booking = await bookingService.getBookingById(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (booking.customer_id !== req.user.id) {
      const vendor = await pool.query('SELECT id FROM vendors WHERE user_id = $1', [req.user.id]);
      if (vendor.rows.length === 0 || booking.vendor_id !== vendor.rows[0].id) {
        if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
      }
    }
    res.json({ booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
});

router.post('/:id/initiate-payment', authenticate, requireCustomer, async (req, res) => {
  try {
    const booking = await bookingService.getBookingById(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (booking.customer_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
    if (booking.status !== 'draft') return res.status(400).json({ error: 'Booking not in draft state' });

    const user = await userService.getUserById(booking.customer_id);
    const payment = await paymentService.createPayment(
      booking.id,
      booking.total_amount_cents,
      user.email,
      { booking_reference: booking.booking_reference }
    );

    await bookingService.setBookingPendingPayment(booking.id);

    res.json({
      authorization_url: payment.paystack_authorization_url,
      reference: payment.paystack_reference,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to initiate payment' });
  }
});

router.post('/:id/accept', authenticate, requireVendor, async (req, res) => {
  try {
    const vendor = await pool.query('SELECT id FROM vendors WHERE user_id = $1 AND verification_status = $2', [req.user.id, 'approved']);
    if (vendor.rows.length === 0) return res.status(403).json({ error: 'Vendor not approved' });

    const booking = await bookingService.getBookingById(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (booking.status !== 'paid') return res.status(400).json({ error: 'Booking must be paid first' });

    const vendorId = vendor.rows[0].id;
    await bookingService.updateBookingStatus(req.params.id, 'confirmed', { vendor_id: vendorId });
    const pkg = await pool.query('SELECT duration_hours FROM packages WHERE id = $1', [booking.package_id]);
    const duration = pkg.rows[0]?.duration_hours || 4;
    await vendorMatchingService.reserveVendorSlot(vendorId, req.params.id, booking.event_date, booking.event_time, duration);
    const updated = await bookingService.getBookingById(req.params.id);
    res.json({ booking: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to accept booking' });
  }
});

router.post('/:id/cancel', authenticate, requireCustomer, async (req, res) => {
  try {
    const booking = await bookingService.getBookingById(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    const isCustomer = booking.customer_id === req.user.id;
    const isAdmin = req.user.role === 'admin';
    if (!isCustomer && !isAdmin) return res.status(403).json({ error: 'Forbidden' });
    const result = await cancellationService.cancelBooking(
      req.params.id,
      req.user.id,
      req.body.reason
    );
    if (result) analyticsService.trackEvent('booking_cancelled', 'booking', req.params.id, req.user.id);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Cancellation failed' });
  }
});

router.post('/:id/complete', authenticate, requireVendor, async (req, res) => {
  try {
    const vendor = await pool.query('SELECT id FROM vendors WHERE user_id = $1', [req.user.id]);
    if (vendor.rows.length === 0) return res.status(403).json({ error: 'Vendor not found' });

    const booking = await bookingService.getBookingById(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (booking.vendor_id !== vendor.rows[0].id) return res.status(403).json({ error: 'Not your booking' });
    if (booking.status !== 'confirmed') return res.status(400).json({ error: 'Booking must be confirmed' });

    await bookingService.updateBookingStatus(req.params.id, 'in_progress');
    const updated = await bookingService.getBookingById(req.params.id);
    res.json({ booking: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update booking' });
  }
});

module.exports = router;
