const express = require('express');
const router = express.Router();
const { optionalAuth, authenticate } = require('../middleware/auth');
const { requireVendor } = require('../middleware/roles');
const packageService = require('../services/packageService');

router.get('/', optionalAuth, async (req, res) => {
  try {
    const { category, featured, limit, offset, status } = req.query;
    const packages = await packageService.listPackages({
      category: category || undefined,
      featured: featured === 'true',
      status: status || undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
      is_active: true
    });
    res.json({ packages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch packages' });
  }
});

router.get('/featured', optionalAuth, async (req, res) => {
  try {
    const packages = await packageService.listPackages({ featured: true, limit: 6, status: 'published' });
    res.json({ packages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch packages' });
  }
});

// Vendor-only: Get my packages
router.get('/vendor/me', authenticate, requireVendor, async (req, res) => {
  try {
    const packages = await packageService.listPackages({ vendor_id: req.user.id });
    res.json({ packages });
  } catch (err) {
    console.error('Vendor fetch packages error:', err);
    res.status(500).json({ error: 'Failed to fetch your packages' });
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

router.post('/', authenticate, requireVendor, async (req, res) => {
  try {
    const pkg = await packageService.createPackage(req.body, req.firebaseUid);
    res.status(201).json({ package: pkg });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Failed to create package' });
  }
});

router.patch('/:id', authenticate, requireVendor, async (req, res) => {
  try {
    const pkg = await packageService.updatePackage(req.params.id, req.firebaseUid, req.body);
    res.json({ package: pkg });
  } catch (err) {
    console.error(err);
    res.status(err.message.includes('permission') ? 403 : 500).json({ error: err.message });
  }
});

router.delete('/:id', authenticate, requireVendor, async (req, res) => {
  try {
    await packageService.deletePackage(req.params.id, req.firebaseUid);
    res.json({ message: 'Package deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(err.message.includes('permission') ? 403 : 500).json({ error: err.message });
  }
});

module.exports = router;
