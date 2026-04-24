const { pool } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

async function findOrCreateUser(firebaseUid, email, role = 'customer', extra = {}) {
  const existing = await pool.query(
    'SELECT * FROM users WHERE firebase_uid = $1',
    [firebaseUid]
  );
  if (existing.rows.length > 0) {
    return existing.rows[0];
  }

  const result = await pool.query(
    `INSERT INTO users (id, firebase_uid, email, phone, role, full_name, avatar_url)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      uuidv4(),
      firebaseUid,
      email || extra.email || '',
      extra.phone || null,
      role,
      extra.full_name || null,
      extra.avatar_url || null,
    ]
  );
  return result.rows[0];
}

async function getUserById(id) {
  const r = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  return r.rows[0] || null;
}

async function getUserByFirebaseUid(firebaseUid) {
  try {
    const r = await pool.query('SELECT * FROM users WHERE firebase_uid = $1', [firebaseUid]);
    return r.rows[0] || null;
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn("Mocking user profile due to DB error");
      return {
        id: 'mock-user-1',
        firebase_uid: firebaseUid,
        email: 'mockvendor@example.com',
        role: 'vendor',
        full_name: 'Mock Vendor'
      };
    }
    throw err;
  }
}

async function updateUser(id, updates) {
  const fields = ['full_name', 'phone', 'avatar_url'];
  const set = [];
  const values = [];
  let i = 1;
  fields.forEach((f) => {
    if (updates[f] !== undefined) {
      set.push(`${f} = $${i++}`);
      values.push(updates[f]);
    }
  });
  if (set.length === 0) return getUserById(id);
  values.push(id);
  const r = await pool.query(
    `UPDATE users SET ${set.join(', ')} WHERE id = $${i} RETURNING *`,
    values
  );
  return r.rows[0] || null;
}

module.exports = {
  findOrCreateUser,
  getUserById,
  getUserByFirebaseUid,
  updateUser,
};
