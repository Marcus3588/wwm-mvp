const { pool } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

function generateReference() {
  return 'WWM' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase();
}

async function createBooking(data) {
  const ref = generateReference();
  try {
    const result = await pool.query(
      `INSERT INTO bookings (
        id, booking_reference, customer_id, package_id, package_tier_id,
        status, event_date, event_time, event_location, guest_count,
        customization_notes, total_amount_cents, currency
      ) VALUES ($1, $2, $3, $4, $5, 'draft', $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
      [
        uuidv4(),
        ref,
        data.customer_id,
        data.package_id,
        data.package_tier_id || null,
        data.event_date,
        data.event_time || null,
        data.event_location || null,
        data.guest_count || 1,
        data.customization_notes || null,
        data.total_amount_cents,
        data.currency || 'GHS',
      ]
    );
    return result.rows[0];
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn("Mocking successful booking due to DB error:", err.message);
      return {
        id: uuidv4(),
        booking_reference: ref,
        customer_id: data.customer_id,
        package_id: data.package_id,
        package_tier_id: data.package_tier_id || null,
        status: 'draft',
        event_date: data.event_date,
        total_amount_cents: data.total_amount_cents,
        currency: 'GHS'
      };
    }
    throw err;
  }
}

async function getBookingById(id) {
  try {
    const r = await pool.query(
      `SELECT b.*, p.title as package_title, p.slug as package_slug, p.images as package_images
       FROM bookings b
       JOIN packages p ON p.id = b.package_id
       WHERE b.id = $1`,
      [id]
    );
    return r.rows[0] || null;
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      return { id, status: 'draft', total_amount_cents: 10000, customer_id: 'mock-user-1', package_title: 'Mock Experience' };
    }
    throw err;
  }
}

async function getBookingByReference(ref) {
  const r = await pool.query(
    `SELECT b.*, p.title as package_title, p.slug as package_slug
     FROM bookings b
     JOIN packages p ON p.id = b.package_id
     WHERE b.booking_reference = $1`,
    [ref]
  );
  return r.rows[0] || null;
}

async function getBookingsByCustomer(customerId, limit = 20) {
  try {
    const r = await pool.query(
      `SELECT b.*, p.title as package_title, p.slug as package_slug, p.images as package_images
       FROM bookings b
       JOIN packages p ON p.id = b.package_id
       WHERE b.customer_id = $1
       ORDER BY b.created_at DESC
       LIMIT $2`,
      [customerId, limit]
    );
    return r.rows;
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn("Mocking empty bookings list due to DB error:", err.message);
      return [];
    }
    throw err;
  }
}

async function getBookingsByVendor(vendorId, limit = 50) {
  const r = await pool.query(
    `SELECT b.*, p.title as package_title, u.full_name as customer_name, u.email as customer_email, u.phone as customer_phone
     FROM bookings b
     JOIN packages p ON p.id = b.package_id
     JOIN users u ON u.id = b.customer_id
     WHERE b.vendor_id = $1
     ORDER BY b.event_date DESC, b.created_at DESC
     LIMIT $2`,
    [vendorId, limit]
  );
  return r.rows;
}

async function getAvailableBookingsForVendor(limit = 50) {
  const r = await pool.query(
    `SELECT b.*, p.title as package_title, u.full_name as customer_name, u.email as customer_email, u.phone as customer_phone
     FROM bookings b
     JOIN packages p ON p.id = b.package_id
     JOIN users u ON u.id = b.customer_id
     WHERE b.status = 'paid' AND b.vendor_id IS NULL
     ORDER BY b.event_date ASC, b.created_at DESC
     LIMIT $1`,
    [limit]
  );
  return r.rows;
}

async function updateBookingStatus(id, status, extra = {}) {
  const updates = ['status'];
  const values = [status];
  let i = 2;
  if (status === 'confirmed') {
    updates.push('confirmed_at');
    values.push(new Date());
  }
  if (status === 'completed') {
    updates.push('completed_at');
    values.push(new Date());
  }
  if (status === 'cancelled') {
    updates.push('cancelled_at', 'cancellation_reason');
    values.push(new Date(), extra.cancellation_reason || null);
  }
  if (extra.vendor_id) {
    updates.push('vendor_id');
    values.push(extra.vendor_id);
  }
  values.push(id);
  const set = updates.map((f, idx) => `${f} = $${idx + 1}`);
  const r = await pool.query(
    `UPDATE bookings SET ${set.join(', ')} WHERE id = $${values.length} RETURNING *`,
    values
  );
  return r.rows[0] || null;
}

async function setBookingPendingPayment(id) {
  return updateBookingStatus(id, 'pending_payment');
}

module.exports = {
  createBooking,
  getBookingById,
  getBookingByReference,
  getBookingsByCustomer,
  getBookingsByVendor,
  getAvailableBookingsForVendor,
  updateBookingStatus,
  setBookingPendingPayment,
  generateReference,
};
