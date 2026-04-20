

const { pool } = require('../config/db');


async function trackEvent(eventType, entityType, entityId, userId, payload = {}) {
  await pool.query(
    `INSERT INTO analytics_events (id, event_type, entity_type, entity_id, user_id, payload)
     VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5)`,
    [eventType, entityType || null, entityId || null, userId || null, JSON.stringify(payload)]
  );
}


async function getAdminAnalytics(dateFrom, dateTo) {
  const from = dateFrom || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const to = dateTo || new Date().toISOString().slice(0, 10);

  const [
    bookingsCreated,
    bookingsPaid,
    bookingsCompleted,
    bookingsCancelled,
    revenue,
    avgOrderValue,
    userCount,
    vendorCount,
  ] = await Promise.all([
    pool.query(
      "SELECT COUNT(*) as n FROM bookings WHERE created_at >= $1::date AND created_at < ($2::date + interval '1 day')",
      [from, to]
    ),
    pool.query(
      "SELECT COUNT(*) as n FROM bookings WHERE status IN ('paid','confirmed','in_progress','completed') AND created_at >= $1::date AND created_at < ($2::date + interval '1 day')",
      [from, to]
    ),
    pool.query(
      "SELECT COUNT(*) as n FROM bookings WHERE status = 'completed' AND completed_at >= $1::date AND completed_at < ($2::date + interval '1 day')",
      [from, to]
    ),
    pool.query(
      "SELECT COUNT(*) as n FROM bookings WHERE status IN ('cancelled','refunded') AND cancelled_at >= $1::date AND cancelled_at < ($2::date + interval '1 day')",
      [from, to]
    ),
    pool.query(
      "SELECT COALESCE(SUM(amount_cents), 0) as total FROM payments WHERE status IN ('success','released') AND paid_at >= $1::date AND paid_at < ($2::date + interval '1 day')",
      [from, to]
    ),
    pool.query(
      "SELECT COALESCE(AVG(amount_cents), 0) as avg FROM payments WHERE status IN ('success','released') AND paid_at >= $1::date AND paid_at < ($2::date + interval '1 day')",
      [from, to]
    ),
    pool.query('SELECT COUNT(*) as n FROM users'),
    pool.query("SELECT COUNT(*) as n FROM vendors WHERE verification_status = 'approved'"),
  ]);

  const created = parseInt(bookingsCreated.rows[0].n, 10);
  const paid = parseInt(bookingsPaid.rows[0].n, 10);
  const completed = parseInt(bookingsCompleted.rows[0].n, 10);
  const cancelled = parseInt(bookingsCancelled.rows[0].n, 10);

  return {
    period: { from, to },
    conversion_rate: created > 0 ? ((paid / created) * 100).toFixed(1) : 0,
    booking_completion_rate: paid > 0 ? ((completed / paid) * 100).toFixed(1) : 0,
    cancellations: cancelled,
    revenue_cents: parseInt(revenue.rows[0].total || 0, 10),
    average_order_value_cents: parseInt(avgOrderValue.rows[0].avg || 0, 10),
    total_users: parseInt(userCount.rows[0].n, 10),
    active_vendors: parseInt(vendorCount.rows[0].n, 10),
  };
}


async function getVendorReliability(vendorId) {
  const [completed, total, ratings] = await Promise.all([
    pool.query(
      "SELECT COUNT(*) as n FROM bookings WHERE vendor_id = $1 AND status = 'completed'",
      [vendorId]
    ),
    pool.query(
      "SELECT COUNT(*) as n FROM bookings WHERE vendor_id = $1 AND status IN ('confirmed','in_progress','completed')",
      [vendorId]
    ),
    pool.query(
      'SELECT AVG(rating) as avg, COUNT(*) as n FROM vendor_ratings WHERE vendor_id = $1',
      [vendorId]
    ),
  ]);

  const tot = parseInt(total.rows[0].n, 10);
  const comp = parseInt(completed.rows[0].n, 10);

  return {
    completion_rate: tot > 0 ? ((comp / tot) * 100).toFixed(1) : 100,
    avg_rating: parseFloat(ratings.rows[0].avg || 0).toFixed(1),
    review_count: parseInt(ratings.rows[0].n, 10),
  };
}


async function getCustomerLifetimeValue(customerId) {
  const r = await pool.query(
    `SELECT COALESCE(SUM(b.total_amount_cents), 0) as total, COUNT(*) as booking_count
     FROM bookings b WHERE b.customer_id = $1 AND b.status = 'completed'`,
    [customerId]
  );
  return {
    total_spent_cents: parseInt(r.rows[0].total || 0, 10),
    booking_count: parseInt(r.rows[0].booking_count, 10),
  };
}

module.exports = {
  trackEvent,
  getAdminAnalytics,
  getVendorReliability,
  getCustomerLifetimeValue,
};
