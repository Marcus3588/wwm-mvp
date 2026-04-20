const express = require('express');
const router = express.Router();
const { optionalAuth, authenticate } = require('../middleware/auth');
const packageService = require('../services/packageService');
const { v4: uuidv4 } = require('uuid'); // Added for uuidv4
const pool = require('../config/db'); // Assuming a db pool is available

router.get('/', optionalAuth, async (req, res) => {
  try {
    const { category, featured, limit, offset } = req.query;
    const packages = await packageService.listPackages({
      category: category || undefined,
      featured: featured === 'true',
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    });
    res.json({ packages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch packages' });
  }
});

router.get('/featured', optionalAuth, async (req, res) => {
  try {
    const packages = await packageService.listPackages({ featured: true, limit: 6 });
    res.json({ packages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch packages' });
  }
});

router.get('/:idOrSlug', optionalAuth, async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
    const pkg = isUuid
      ? await packageService.getPackageById(idOrSlug)
      : await packageService.getPackageBySlug(idOrSlug);
    if (!pkg) return res.status(404).json({ error: 'Package not found' });
    res.json({ package: pkg });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch package' });
  }
});

router.post('/', authenticate, async (req, res) => {
  try {
    const pkg = await packageService.createPackage(req.body, req.firebaseUid);
    res.json({ package: pkg });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create package' });
  }
});

module.exports = router;
