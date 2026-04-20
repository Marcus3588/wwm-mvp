const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { requireVendor } = require('../middleware/roles');
const { pool } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

router.post('/apply', authenticate, async (req, res) => {
  const { business_name, business_description, services_offered, bank_name, bank_account_number, bank_account_name } = req.body;
  if (!business_name) return res.status(400).json({ error: 'business_name required' });

  try {
    let userId = 'mock-user-1';
    try {
      const user = await pool.query('SELECT id FROM users WHERE firebase_uid = $1', [req.firebaseUid]);
      if (user.rows[0]) userId = user.rows[0].id;
    } catch (_) { }

    try {
      const existing = await pool.query('SELECT id FROM vendors WHERE user_id = $1', [userId]);
      if (existing.rows.length > 0) return res.status(400).json({ error: 'Already applied as vendor' });

      const result = await pool.query(
        `INSERT INTO vendors (id, user_id, business_name, business_description, services_offered, bank_name, bank_account_number, bank_account_name, verification_status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending') RETURNING *`,
        [uuidv4(), userId, business_name, business_description || null,
        Array.isArray(services_offered) ? services_offered : (services_offered ? [services_offered] : []),
        bank_name || null, bank_account_number || null, bank_account_name || null]
      );
      try { await pool.query(`UPDATE users SET role = 'vendor' WHERE id = $1`, [userId]); } catch (_) { }
      return res.status(201).json({ vendor: result.rows[0] });
    } catch (dbErr) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[DEV] Mocking vendor approval - no DB:', dbErr.message);
        return res.status(201).json({
          vendor: { id: uuidv4(), user_id: userId, business_name, verification_status: 'approved' }
        });
      }
      throw dbErr;
    }
  } catch (err) {
    console.error('Vendor apply error:', err);
    res.status(500).json({ error: 'Vendor application failed' });
  }
});

router.get('/me', authenticate, requireVendor, async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT v.*, u.email, u.full_name, u.phone FROM vendors v
       JOIN users u ON u.id = v.user_id
       WHERE v.user_id = $1`,
      [req.user.id]
    );
    if (r.rows.length === 0) {
      if (process.env.NODE_ENV !== 'production') {
        return res.json({
          vendor: {
            id: 'mock-vendor-1',
            business_name: 'Luxe Events Ghana (Mock)',
            verification_status: 'approved',
            services_offered: ['Decor', 'Catering']
          }
        });
      }
      return res.status(404).json({ error: 'Vendor profile not found' });
    }
    const vendor = r.rows[0];
    if (vendor && process.env.NODE_ENV !== 'production') {
      vendor.verification_status = 'approved';
    }
    console.log('[DEBUG] /vendors/me returning:', JSON.stringify(vendor, null, 2));
    res.json({ vendor });
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      return res.json({
        vendor: {
          id: 'mock-vendor-1',
          business_name: 'Luxe Events Ghana (Mock)',
          verification_status: 'approved',
          services_offered: ['Decor', 'Catering']
        }
      });
    }
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch vendor' });
  }
});

router.patch('/me', authenticate, requireVendor, async (req, res) => {
  try {
    const { business_name, business_description, services_offered, bank_name, bank_account_number, bank_account_name } = req.body;
    const r = await pool.query('SELECT id FROM vendors WHERE user_id = $1', [req.user.id]);
    if (r.rows.length === 0) return res.status(404).json({ error: 'Vendor profile not found' });

    const updates = [];
    const values = [];
    let i = 1;
    if (business_name !== undefined) { updates.push(`business_name = $${i++}`); values.push(business_name); }
    if (business_description !== undefined) { updates.push(`business_description = $${i++}`); values.push(business_description); }
    if (services_offered !== undefined) { updates.push(`services_offered = $${i++}`); values.push(Array.isArray(services_offered) ? services_offered : [services_offered]); }
    if (bank_name !== undefined) { updates.push(`bank_name = $${i++}`); values.push(bank_name); }
    if (bank_account_number !== undefined) { updates.push(`bank_account_number = $${i++}`); values.push(bank_account_number); }
    if (bank_account_name !== undefined) { updates.push(`bank_account_name = $${i++}`); values.push(bank_account_name); }

    if (updates.length === 0) {
      const vendor = await pool.query('SELECT * FROM vendors WHERE user_id = $1', [req.user.id]);
      return res.json({ vendor: vendor.rows[0] });
    }

    values.push(r.rows[0].id);
    const up = await pool.query(
      `UPDATE vendors SET ${updates.join(', ')} WHERE id = $${i} RETURNING *`,
      values
    );
    res.json({ vendor: up.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Update failed' });
  }
});

module.exports = router;
