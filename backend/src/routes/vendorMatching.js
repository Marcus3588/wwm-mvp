

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/roles');
const vendorMatchingService = require('../services/vendorMatchingService');

router.get('/eligible', authenticate, requireAdmin, async (req, res) => {
  try {
    const { package_id, event_date, event_time } = req.query;
    if (!package_id || !event_date) {
      return res.status(400).json({ error: 'package_id, event_date required' });
    }
    const vendors = await vendorMatchingService.findEligibleVendors({
      packageId: package_id,
      eventDate: event_date,
      eventTime: event_time || null,
    });
    res.json({ vendors });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to find vendors' });
  }
});

router.get('/fallback', authenticate, requireAdmin, async (req, res) => {
  try {
    const vendors = await vendorMatchingService.getFallbackVendors(req.query.category);
    res.json({ vendors });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch fallback vendors' });
  }
});

module.exports = router;
