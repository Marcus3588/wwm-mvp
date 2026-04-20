

const { pool } = require('../config/db');
const commissionService = require('./commissionService');
const vendorMatchingService = require('./vendorMatchingService');

async function cancelBooking(bookingId, cancelledByUserId, reason) {
  const booking = await pool.query(
    'SELECT * FROM bookings WHERE id = $1',
    [bookingId]
  );
  const b = booking.rows[0];
  if (!b) return null;

  const allowedStatuses = ['draft', 'pending_payment', 'paid', 'confirmed'];
  if (!allowedStatuses.includes(b.status)) {
    throw new Error('Booking cannot be cancelled in current status');
  }

  const penalty = await commissionService.getCancellationPenalty(
    b.event_date,
    new Date(),
    b.total_amount_cents
  );

  await pool.query(
    `UPDATE bookings SET status = 'cancelled', cancelled_at = NOW(), cancellation_reason = $1 WHERE id = $2`,
    [reason || null, bookingId]
  );

  if (b.vendor_id) {
    await vendorMatchingService.releaseVendorSlot(bookingId);
  }

  const payment = await pool.query(
    'SELECT id, amount_cents FROM payments WHERE booking_id = $1 AND status = $2',
    [bookingId, 'success']
  );
  if (payment.rows[0] && penalty.refundCents > 0) {
    await pool.query(
      `UPDATE payments SET status = 'refunded', refunded_at = NOW(), refund_amount_cents = $1, cancellation_penalty_cents = $2 WHERE id = $3`,
      [penalty.refundCents, penalty.penaltyCents, payment.rows[0].id]
    );
  }

  return {
    cancelled: true,
    refund_cents: penalty.refundCents,
    penalty_cents: penalty.penaltyCents,
  };
}

module.exports = { cancelBooking };
