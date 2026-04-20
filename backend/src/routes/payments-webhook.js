const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const paymentService = require('../services/paymentService');

function verifyPaystackSignature(payload, signature) {
  const secret = process.env.PAYSTACK_WEBHOOK_SECRET;
  if (!secret) return false;
  const hash = crypto.createHmac('sha512', secret).update(payload).digest('hex');
  return hash === signature;
}

router.post('/', async (req, res) => {
  const signature = req.headers['x-paystack-signature'];
  const rawBody = req.body;
  const payload = Buffer.isBuffer(rawBody) ? rawBody.toString('utf8') : JSON.stringify(rawBody);

  if (!verifyPaystackSignature(payload, signature)) {
    return res.status(401).send('Invalid signature');
  }

  let event;
  try {
    event = JSON.parse(payload);
  } catch {
    return res.status(400).send('Invalid JSON');
  }

  if (event.event === 'charge.success') {
    const ref = event.data?.reference;
    if (ref) {
      try {
        await paymentService.verifyPayment(ref);
      } catch (err) {
        console.error('Webhook payment verify error:', err);
      }
    }
  }

  res.status(200).send('OK');
});

module.exports = router;
