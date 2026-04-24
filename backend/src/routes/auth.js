const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const userService = require('../services/userService');

router.post('/register', authenticate, async (req, res) => {
  try {
    const { role, full_name, phone } = req.body;
    const allowedRoles = ['customer', 'vendor'];
    const userRole = role && allowedRoles.includes(role) ? role : 'customer';
    const user = await userService.findOrCreateUser(
      req.firebaseUid,
      req.firebaseEmail,
      userRole,
      { full_name, phone }
    );
    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await userService.getUserByFirebaseUid(req.firebaseUid);
    if (!user) {
      if (process.env.NODE_ENV !== 'production') {
        return res.json({
          user: {
            id: 'mock-user-1',
            firebase_uid: req.firebaseUid,
            email: req.firebaseEmail || 'mockvendor@example.com',
            role: 'vendor',
            full_name: 'Mock Vendor'
          }
        });
      }
      return res.status(404).json({ error: 'User not found. Complete registration.' });
    }
    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

router.patch('/me', authenticate, async (req, res) => {
  try {
    const user = await userService.getUserByFirebaseUid(req.firebaseUid);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const updated = await userService.updateUser(user.id, req.body);
    res.json({ user: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Update failed' });
  }
});

module.exports = router;
