

const { pool } = require('../config/db');


async function setEmailVerified(userId) {
  await pool.query(
    'UPDATE users SET email_verified = true, verified_at = COALESCE(verified_at, NOW()) WHERE id = $1',
    [userId]
  );
}


async function setPhoneVerified(userId) {
  await pool.query(
    'UPDATE users SET phone_verified = true, verified_at = COALESCE(verified_at, NOW()) WHERE id = $1',
    [userId]
  );
}


async function addVendorRating(vendorId, bookingId, customerId, rating, comment) {
  if (rating < 1 || rating > 5) throw new Error('Rating must be 1-5');
  const r = await pool.query(
    `INSERT INTO vendor_ratings (id, vendor_id, booking_id, customer_id, rating, comment)
     VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5)
     ON CONFLICT (booking_id, customer_id) DO UPDATE SET rating = $4, comment = $5
     RETURNING *`,
    [vendorId, bookingId, customerId, rating, comment || null]
  );
  return r.rows[0];
}


async function getVendorRating(vendorId) {
  const r = await pool.query(
    'SELECT COALESCE(AVG(rating), 0) as avg_rating, COUNT(*) as review_count FROM vendor_ratings WHERE vendor_id = $1',
    [vendorId]
  );
  return {
    avgRating: parseFloat(r.rows[0].avg_rating).toFixed(1),
    reviewCount: parseInt(r.rows[0].review_count, 10),
  };
}


async function createDispute(bookingId, raisedBy, reason) {
  const r = await pool.query(
    `INSERT INTO disputes (id, booking_id, raised_by, reason, status)
     VALUES (uuid_generate_v4(), $1, $2, $3, 'open')
     RETURNING *`,
    [bookingId, raisedBy, reason]
  );
  return r.rows[0];
}


async function resolveDispute(disputeId, resolvedBy, resolutionNotes) {
  const r = await pool.query(
    `UPDATE disputes SET status = 'resolved', resolved_by = $1, resolved_at = NOW(), resolution_notes = $2
     WHERE id = $3 RETURNING *`,
    [resolvedBy, resolutionNotes, disputeId]
  );
  return r.rows[0] || null;
}


async function logActivity(userId, entityType, entityId, action, payload = {}, ipAddress) {
  await pool.query(
    `INSERT INTO activity_logs (id, user_id, entity_type, entity_id, action, payload, ip_address)
     VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5, $6)`,
    [userId, entityType, entityId, action, JSON.stringify(payload), ipAddress || null]
  );
}

module.exports = {
  setEmailVerified,
  setPhoneVerified,
  addVendorRating,
  getVendorRating,
  createDispute,
  resolveDispute,
  logActivity,
};
