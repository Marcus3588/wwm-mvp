

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/roles');
const platformConfig = require('../config/platform');

router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const keys = ['commission', 'service_fee', 'cancellation', 'vendor_matching', 'buffer_minutes', 'sla_response_hours'];
    const config = {};
    for (const k of keys) {
      config[k] = await platformConfig.getConfig(k);
    }
    res.json({ config });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch config' });
  }
});

router.patch('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { key, value } = req.body;
    if (!key) return res.status(400).json({ error: 'key required' });
    await platformConfig.setConfig(key, value);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update config' });
  }
});

module.exports = router;
