

const { pool } = require('../config/db');
const platformConfig = require('../config/platform');


async function findEligibleVendors({ packageId, eventDate, eventTime, durationHours, requiredServices }) {
  const bufferMins = await platformConfig.getConfig('buffer_minutes');
  const bufferMs = (bufferMins || 60) * 60 * 1000;

  const pkg = await pool.query(
    'SELECT required_services, duration_hours, category FROM packages WHERE id = $1',
    [packageId]
  );
  const pkgRow = pkg.rows[0];
  const services = requiredServices ?? (pkgRow?.required_services || []);
  const duration = durationHours ?? pkgRow?.duration_hours ?? 4;

  const eventDt = new Date(`${eventDate}T${eventTime || '12:00'}`);
  const dayOfWeek = eventDt.getDay();
  const eventEnd = new Date(eventDt.getTime() + duration * 60 * 60 * 1000);

  const vendorIds = await pool.query(
    `SELECT v.id, v.services_offered, v.location_city
     FROM vendors v
     WHERE v.verification_status = 'approved'
     AND (array_length($1::text[], 1) IS NULL OR v.services_offered && $1)`,
    [services.length ? services : null]
  );

  const eligible = [];

  for (const v of vendorIds.rows) {
    const isAvailable = await checkVendorAvailability(v.id, eventDate, eventTime, duration, bufferMs);
    const hasConflict = await hasVendorConflict(v.id, eventDt, eventEnd, bufferMs);
    if (isAvailable && !hasConflict) {
      const score = computeMatchScore(v, services, pkgRow?.category);
      eligible.push({ vendor: v, score });
    }
  }

  eligible.sort((a, b) => b.score - a.score);
  return eligible.map((e) => e.vendor);
}


async function checkVendorAvailability(vendorId, eventDate, eventTime, durationHours, bufferMs) {
  const eventDt = new Date(`${eventDate}T${eventTime || '12:00'}`);
  const dayOfWeek = eventDt.getDay();
  const startTime = eventTime || '09:00';
  const endTime = new Date(eventDt.getTime() + durationHours * 60 * 60 * 1000)
    .toTimeString()
    .slice(0, 5);

  const blocked = await pool.query(
    'SELECT 1 FROM vendor_blocked_dates WHERE vendor_id = $1 AND blocked_date = $2',
    [vendorId, eventDate]
  );
  if (blocked.rows.length > 0) return false;

  const avail = await pool.query(
    `SELECT 1 FROM vendor_availability
     WHERE vendor_id = $1 AND day_of_week = $2 AND is_available = true
     AND start_time <= $3::time AND end_time >= $4::time`,
    [vendorId, dayOfWeek, startTime, endTime]
  );

  return avail.rows.length > 0 || true;
}


async function hasVendorConflict(vendorId, slotStart, slotEnd, bufferMs) {
  const startWithBuffer = new Date(slotStart.getTime() - bufferMs);
  const endWithBuffer = new Date(slotEnd.getTime() + bufferMs);

  const r = await pool.query(
    `SELECT 1 FROM vendor_booking_slots vbs
     JOIN bookings b ON b.id = vbs.booking_id AND b.status NOT IN ('cancelled', 'refunded')
     WHERE vbs.vendor_id = $1
     AND (vbs.slot_start, vbs.slot_end) OVERLAPS ($2, $3)`,
    [vendorId, startWithBuffer, endWithBuffer]
  );
  return r.rows.length > 0;
}


async function reserveVendorSlot(vendorId, bookingId, eventDate, eventTime, durationHours) {
  const eventDt = new Date(`${eventDate}T${eventTime || '12:00'}`);
  const slotEnd = new Date(eventDt.getTime() + (durationHours || 4) * 60 * 60 * 1000);

  await pool.query(
    `INSERT INTO vendor_booking_slots (id, vendor_id, booking_id, slot_start, slot_end)
     VALUES (uuid_generate_v4(), $1, $2, $3, $4)`,
    [vendorId, bookingId, eventDt, slotEnd]
  );
}


async function releaseVendorSlot(bookingId) {
  await pool.query('DELETE FROM vendor_booking_slots WHERE booking_id = $1', [bookingId]);
}

function computeMatchScore(vendor, requiredServices, category) {
  let score = 50;
  if (vendor.services_offered && requiredServices?.length) {
    const match = vendor.services_offered.filter((s) => requiredServices.includes(s));
    score += match.length * 20;
  }
  return score;
}


async function getFallbackVendors(category) {
  const r = await pool.query(
    `SELECT v.*, u.phone FROM vendors v
     JOIN users u ON u.id = v.user_id
     WHERE v.verification_status = 'approved' AND v.is_fallback = true
     AND ($1::text IS NULL OR $1 = ANY(v.services_offered))`,
    [category || null]
  );
  return r.rows;
}

module.exports = {
  findEligibleVendors,
  checkVendorAvailability,
  hasVendorConflict,
  reserveVendorSlot,
  releaseVendorSlot,
  getFallbackVendors,
};
