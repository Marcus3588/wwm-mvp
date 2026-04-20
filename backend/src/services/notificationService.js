

const { pool } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const CHANNELS = ['email', 'sms', 'whatsapp', 'push'];


async function send(opts) {
  const { userId, type, title, body, channel = 'email', data = {} } = opts;

  const notif = await pool.query(
    `INSERT INTO notifications (id, user_id, type, title, body, channel, data, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
     RETURNING *`,
    [uuidv4(), userId, type, title || '', body || '', channel, JSON.stringify(data)]
  );

  try {
    await deliver(notif.rows[0]);
    await pool.query(
      "UPDATE notifications SET status = 'sent', sent_at = NOW() WHERE id = $1",
      [notif.rows[0].id]
    );
  } catch (err) {
    await pool.query(
      "UPDATE notifications SET status = 'failed', error_message = $1, retry_count = retry_count + 1 WHERE id = $2",
      [err.message, notif.rows[0].id]
    );
    throw err;
  }

  return notif.rows[0];
}


async function deliver(notif) {
  if (process.env.NODE_ENV === 'test') return;

  switch (notif.channel) {
    case 'email':
      if (process.env.SENDGRID_API_KEY) {
      }
      break;
    case 'sms':
      if (process.env.TWILIO_ACCOUNT_SID) {
      }
      break;
    case 'whatsapp':
      if (process.env.TWILIO_WHATSAPP_NUMBER) {
      }
      break;
    default:
      break;
  }
}


async function sendBookingConfirmation(booking, user) {
  return send({
    userId: user.id,
    type: 'booking_confirmation',
    title: 'Booking Confirmed',
    body: `Your Walk With Me booking ${booking.booking_reference} for ${booking.event_date} is confirmed.`,
    channel: 'email',
    data: { bookingId: booking.id, bookingReference: booking.booking_reference },
  });
}


async function sendPaymentConfirmation(booking, user) {
  return send({
    userId: user.id,
    type: 'payment_confirmation',
    title: 'Payment Received',
    body: `Payment of GHS ${((booking.total_amount_cents || 0) / 100).toFixed(2)} for booking ${booking.booking_reference} has been received.`,
    channel: 'email',
    data: { bookingId: booking.id },
  });
}


async function sendVendorNewBookingAlert(booking, vendorUserId) {
  return send({
    userId: vendorUserId,
    type: 'vendor_new_booking',
    title: 'New Booking Request',
    body: `You have a new paid booking ${booking.booking_reference} for ${booking.event_date}. Please accept or decline.`,
    channel: 'email',
    data: { bookingId: booking.id },
  });
}


async function sendBookingReminder(booking, user) {
  return send({
    userId: user.id,
    type: 'booking_reminder',
    title: 'Upcoming Experience',
    body: `Reminder: Your Walk With Me experience (${booking.booking_reference}) is tomorrow.`,
    channel: 'email',
    data: { bookingId: booking.id },
  });
}

module.exports = {
  send,
  sendBookingConfirmation,
  sendPaymentConfirmation,
  sendVendorNewBookingAlert,
  sendBookingReminder,
};
