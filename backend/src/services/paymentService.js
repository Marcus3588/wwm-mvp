const { pool } = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const paystack = require('../lib/paystack');
const bookingService = require('./bookingService');
const commissionService = require('./commissionService');
const notificationService = require('./notificationService');

async function createPayment(bookingId, amountCents, email, metadata = {}) {
  let payment;
  try {
    const result = await pool.query(
      `INSERT INTO payments (id, booking_id, amount_cents, currency, status)
       VALUES ($1, $2, $3, 'GHS', 'pending')
       RETURNING *`,
      [uuidv4(), bookingId, amountCents]
    );
    payment = result.rows[0];
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn("Mocking payment record due to DB error:", err.message);
      payment = { id: uuidv4(), booking_id: bookingId, amount_cents: amountCents };
    } else {
      throw err;
    }
  }

  if (!process.env.PAYSTACK_SECRET_KEY) {
    if (process.env.NODE_ENV !== 'production') {
      return {
        ...payment,
        paystack_reference: 'mock_ref_' + Date.now(),
        paystack_authorization_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/bookings/confirm?reference=mock_ref_${Date.now()}`,
        status: 'hold',
      };
    }
    throw new Error('Paystack not configured');
  }

  try {
    const tx = await paystack.initializeTransaction({
      email,
      amount: amountCents,
      currency: 'GHS',
      reference: `wwm_${payment.id}`,
      metadata: {
        payment_id: payment.id,
        booking_id: bookingId,
        ...metadata,
      },
      callback_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/bookings/confirm`,
    });

    try {
      await pool.query(
        `UPDATE payments SET paystack_reference = $1, paystack_authorization_url = $2, status = 'hold'
         WHERE id = $3`,
        [tx.data.reference, tx.data.authorization_url, payment.id]
      );
    } catch (dbErr) {
      console.warn("Could not update payment record in DB:", dbErr.message);
    }

    return {
      ...payment,
      paystack_reference: tx.data.reference,
      paystack_authorization_url: tx.data.authorization_url,
      status: 'hold',
    };
  } catch (err) {
    try {
      await pool.query(`UPDATE payments SET status = 'failed' WHERE id = $1`, [payment.id]);
    } catch (ignore) { }
    throw err;
  }
}

async function verifyPayment(paystackReference) {
  if (paystackReference.startsWith('mock_ref_') && process.env.NODE_ENV !== 'production') {
    return {
      success: true,
      payment: { id: uuidv4(), status: 'success', paid_at: new Date() }
    };
  }

  const verify = await paystack.verifyTransaction(paystackReference);
  if (verify.data.status !== 'success') {
    return { success: false, payment: null };
  }

  const ref = verify.data.reference;
  const paymentResult = await pool.query(
    'SELECT * FROM payments WHERE paystack_reference = $1',
    [ref]
  );
  if (paymentResult.rows.length === 0) {
    if (process.env.NODE_ENV !== 'production') {
      return { success: true, payment: { id: uuidv4(), status: 'success', paid_at: new Date() } };
    }
    return { success: false, payment: null };
  }

  const payment = paymentResult.rows[0];
  const breakdown = await commissionService.calculateBookingBreakdown(payment.amount_cents);
  await pool.query(
    `UPDATE payments SET status = 'success', paid_at = NOW(),
     platform_commission_cents = $2, service_fee_cents = $3, vendor_payout_cents = $4
     WHERE id = $1`,
    [payment.id, breakdown.commissionCents, breakdown.serviceFeeCents, breakdown.vendorPayoutCents]
  );
  await bookingService.updateBookingStatus(payment.booking_id, 'paid');

  try {
    const b = await bookingService.getBookingById(payment.booking_id);
    const userResult = await pool.query('SELECT id FROM users WHERE id = $1', [b.customer_id]);
    const user = userResult.rows[0];
    if (user) {
      await notificationService.sendPaymentConfirmation(b, { id: user.id });
    }
  } catch (_) { }

  return {
    success: true,
    payment: { ...payment, status: 'success', paid_at: new Date() },
  };
}

async function getPaymentByPaystackRef(ref) {
  const r = await pool.query('SELECT * FROM payments WHERE paystack_reference = $1', [ref]);
  return r.rows[0] || null;
}

async function releasePaymentToVendor(paymentId, adminId) {
  const r = await pool.query(
    `UPDATE payments SET status = 'released', released_at = NOW() WHERE id = $1 AND status = 'success' RETURNING *`,
    [paymentId]
  );
  const payment = r.rows[0];
  if (payment) {
    await bookingService.updateBookingStatus(payment.booking_id, 'completed');
  }
  return payment;
}

async function getPaymentBreakdown(paymentId) {
  const r = await pool.query(
    'SELECT platform_commission_cents, service_fee_cents, vendor_payout_cents FROM payments WHERE id = $1',
    [paymentId]
  );
  return r.rows[0] || null;
}

module.exports = {
  createPayment,
  verifyPayment,
  getPaymentByPaystackRef,
  releasePaymentToVendor,
  getPaymentBreakdown,
};
