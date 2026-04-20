const { pool } = require('../config/db');


function requireRole(...allowedRoles) {
  return async (req, res, next) => {
    if (!req.firebaseUid) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    try {
      const result = await pool.query(
        'SELECT id, role FROM users WHERE firebase_uid = $1',
        [req.firebaseUid]
      );

      if (result.rows.length === 0) {
        if (process.env.NODE_ENV !== 'production') {
          req.user = { id: 'mock-user-1', role: allowedRoles[0] };
          return next();
        }
        return res.status(403).json({ error: 'User not found. Complete registration first.' });
      }

      req.user = result.rows[0];
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }
      next();
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[DEV] Mocking role check due to DB error - granting:', allowedRoles[0]);
        req.user = { id: 'mock-user-1', role: allowedRoles[0] };
        return next();
      }
      console.error('Role check error:', err);
      return res.status(500).json({ error: 'Auth check failed' });
    }
  };
}

const requireCustomer = requireRole('customer', 'admin');
const requireVendor = requireRole('vendor', 'admin');
const requireAdmin = requireRole('admin');

module.exports = { requireRole, requireCustomer, requireVendor, requireAdmin };
