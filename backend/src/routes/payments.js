const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { requireCustomer } = require('../middleware/roles');
const paymentService = require('../services/paymentService');

router.get('/verify', authenticate, requireCustomer, async (req, res) => {
  try {
    const { reference } = req.query;
    if (!reference) return res.status(400).json({ error: 'reference required' });
    const result = await paymentService.verifyPayment(reference);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Verification failed' });
  }
});

module.exports = router;
