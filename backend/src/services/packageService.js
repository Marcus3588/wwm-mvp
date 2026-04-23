const { pool } = require('../config/db');


const DEV_PACKAGES = [
  {
    id: 'dev-1', slug: 'romantic-yacht-dinner', title: 'Romantic Yacht Dinner Experience', short_description: 'An intimate candlelit dinner on the water', category: 'date',
    images: [
      'https://images.unsplash.com/photo-1548032885-b5e38734688a?w=800',
      'https://images.unsplash.com/photo-1540324886616-8d19d6d025b6?w=800',
      'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800',
      'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=800',
      'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800'
    ],
    base_price_cents: 2500000, tiers: []
  },
  {
    id: 'dev-2', slug: 'luxury-villa-birthday', title: 'Luxury Villa Birthday Celebration', short_description: 'Make your special day unforgettable in a private estate', category: 'birthday',
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
      'https://images.unsplash.com/photo-1579621970588-a3528b1fbda5?w=800',
      'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800',
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800'
    ],
    base_price_cents: 1500000, tiers: []
  },
  {
    id: 'dev-3', slug: 'helicopter-proposal', title: 'Dream Helicopter Proposal Package', short_description: 'Say yes in the perfect setting above the city', category: 'proposal',
    images: [
      'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800',
      'https://images.unsplash.com/photo-1519741497674-611481863552?w=800',
      'https://images.unsplash.com/photo-1602434228300-a645bce6891b?w=800',
      'https://images.unsplash.com/photo-1514782293527-dcaca2ef60bf?w=800',
      'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800'
    ],
    base_price_cents: 3500000, tiers: []
  },
  {
    id: 'dev-4', slug: 'exclusive-beach-party', title: 'Exclusive Beachfront Party', short_description: 'Private cabanas, DJ, and unlimited cocktails', category: 'party',
    images: [
      'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=800',
      'https://images.unsplash.com/photo-1533174000255-bfa345009022?w=800',
      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800',
      'https://images.unsplash.com/photo-1540039155732-61f22e03259e?w=800',
      'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=800'
    ],
    base_price_cents: 4500000, tiers: []
  },
  {
    id: 'dev-5', slug: 'luxury-dubai-trip', title: 'Luxury Dubai Desert Adventure', short_description: 'Dune bashing, private camp, and 5-star hospitality', category: 'trip',
    images: [
      'https://images.unsplash.com/photo-1512453979436-5a536f44020e?w=800',
      'https://images.unsplash.com/photo-1582672060624-cb814c405c86?w=800',
      'https://images.unsplash.com/photo-1528702748617-c64d49f918af?w=800',
      'https://images.unsplash.com/photo-1478144596228-3e46c7dc8d38?w=800',
      'https://images.unsplash.com/photo-1528702748617-c64d49f918af?w=800'
    ],
    base_price_cents: 8500000, tiers: []
  },
];

async function listPackages(filters = {}) {
  let query = `
    SELECT p.*, 
      COALESCE(
        (SELECT json_agg(tiers_data) FROM (
          SELECT id, name, description, price_cents, sort_order 
          FROM package_tiers pt 
          WHERE pt.package_id = p.id 
          ORDER BY sort_order
        ) tiers_data),
        '[]'::json
      ) AS tiers
    FROM packages p
    WHERE 1=1
  `;
  const params = [];
  let i = 1;

  if (filters.is_active !== undefined) {
    query += ` AND p.is_active = $${i++}`;
    params.push(filters.is_active);
  } else if (process.env.NODE_ENV === 'production') {
    query += ` AND p.is_active = true`;
  }

  if (filters.status) {
    query += ` AND p.status = $${i++}`;
    params.push(filters.status);
  }

  if (filters.vendor_id) {
    query += ` AND p.vendor_id = $${i++}`;
    params.push(filters.vendor_id);
  }

  if (filters.category) {
    query += ` AND p.category = $${i++}`;
    params.push(filters.category);
  }
  if (filters.featured) {
    query += ` AND p.is_featured = true`;
  }
  query += ` ORDER BY p.is_featured DESC, p.created_at DESC`;

  if (filters.limit) {
    query += ` LIMIT $${i++}`;
    params.push(filters.limit);
  }
  if (filters.offset) {
    query += ` OFFSET $${i++}`;
    params.push(filters.offset);
  }

  try {
    const result = await pool.query(query, params);
    if (result.rows.length === 0 && process.env.NODE_ENV !== 'production' && !filters.vendor_id) {
      return DEV_PACKAGES.filter((p) => !filters.category || p.category === filters.category)
        .slice(0, filters.limit || 20);
    }
    return result.rows;
  } catch (err) {
    if (process.env.NODE_ENV !== 'production' && !filters.vendor_id) {
      console.warn("DB Error (fallback to dev packages):", err.message);
      return DEV_PACKAGES.filter((p) => !filters.category || p.category === filters.category)
        .slice(0, filters.limit || 20);
    }
    throw err;
  }
}

async function getPackageById(id) {
  try {
    const r = await pool.query(
      `SELECT p.*, 
      COALESCE(
        (SELECT json_agg(tiers_data) FROM (
          SELECT id, name, description, price_cents, sort_order 
          FROM package_tiers pt 
          WHERE pt.package_id = p.id 
          ORDER BY sort_order
        ) tiers_data),
        '[]'::json
      ) AS tiers
    FROM packages p WHERE p.id = $1`,
      [id]
    );
    if (!r.rows[0] && process.env.NODE_ENV !== 'production') {
      return DEV_PACKAGES.find((p) => p.id === id) || null;
    }
    return r.rows[0] || null;
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn("DB Error (fallback to dev package):", err.message);
      return DEV_PACKAGES.find((p) => p.id === id) || null;
    }
    throw err;
  }
}

async function getPackageBySlug(slug) {
  try {
    const r = await pool.query(
      `SELECT p.*, 
      COALESCE(
        (SELECT json_agg(tiers_data) FROM (
          SELECT id, name, description, price_cents, sort_order 
          FROM package_tiers pt 
          WHERE pt.package_id = p.id 
          ORDER BY sort_order
        ) tiers_data),
        '[]'::json
      ) AS tiers
    FROM packages p WHERE p.slug = $1 AND p.is_active = true`,
      [slug]
    );
    if (!r.rows[0] && process.env.NODE_ENV !== 'production') {
      return DEV_PACKAGES.find((p) => p.slug === slug) || null;
    }
    return r.rows[0] || null;
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn("DB Error (fallback to dev package):", err.message);
      return DEV_PACKAGES.find((p) => p.slug === slug) || null;
    }
    throw err;
  }
}

async function createPackage(data, firebaseUid) {
  const { 
    title, 
    short_description, 
    long_description, 
    category, 
    base_price_cents, 
    images, 
    location,
    duration_hours,
    min_guests,
    max_guests,
    status = 'draft'
  } = data;
  
  const userRes = await pool.query('SELECT id FROM users WHERE firebase_uid = $1', [firebaseUid]);
  if (!userRes.rows.length) throw new Error('User not found');
  const vendorRes = await pool.query('SELECT id FROM vendors WHERE user_id = $1', [userRes.rows[0].id]);
  if (!vendorRes.rows.length) throw new Error('User is not a vendor');
  const vendor_id = vendorRes.rows[0].id;

  const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-4)}`;

  const query = `
    INSERT INTO packages (
      vendor_id, slug, title, short_description, long_description, 
      category, location, images, base_price_cents, 
      duration_hours, min_guests, max_guests, status, is_active
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, true)
    RETURNING *
  `;
  const result = await pool.query(query, [
    vendor_id, slug, title, short_description, long_description, 
    category, location || null, images || [], base_price_cents,
    duration_hours || null, min_guests || 1, max_guests || null, status
  ]);
  return result.rows[0];
}

async function updatePackage(id, firebaseUid, data) {
  const userRes = await pool.query('SELECT id FROM users WHERE firebase_uid = $1', [firebaseUid]);
  if (!userRes.rows.length) throw new Error('User not found');
  const vendorRes = await pool.query('SELECT id FROM vendors WHERE user_id = $1', [userRes.rows[0].id]);
  if (!vendorRes.rows.length) throw new Error('User is not a vendor');
  const vendor_id = vendorRes.rows[0].id;

  const allowedFields = [
    'title', 'short_description', 'long_description', 'category', 
    'location', 'images', 'base_price_cents', 'duration_hours', 
    'min_guests', 'max_guests', 'status', 'is_active'
  ];
  const updates = [];
  const values = [];
  let i = 1;

  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      updates.push(`${field} = $${i++}`);
      values.push(data[field]);
    }
  }

  if (updates.length === 0) return getPackageById(id);

  values.push(id);
  const idIndex = i++;
  values.push(vendor_id);
  const vendorIndex = i;

  const query = `
    UPDATE packages 
    SET ${updates.join(', ')}, updated_at = NOW() 
    WHERE id = $${idIndex} AND vendor_id = $${vendorIndex}
    RETURNING *
  `;
  
  const result = await pool.query(query, values);
  if (result.rows.length === 0) {
    throw new Error('Package not found or you do not have permission to edit it');
  }
  return result.rows[0];
}

async function deletePackage(id, firebaseUid) {
  const userRes = await pool.query('SELECT id FROM users WHERE firebase_uid = $1', [firebaseUid]);
  if (!userRes.rows.length) throw new Error('User not found');
  const vendorRes = await pool.query('SELECT id FROM vendors WHERE user_id = $1', [userRes.rows[0].id]);
  if (!vendorRes.rows.length) throw new Error('User is not a vendor');
  const vendor_id = vendorRes.rows[0].id;

  const query = 'DELETE FROM packages WHERE id = $1 AND vendor_id = $2 RETURNING id';
  const result = await pool.query(query, [id, vendor_id]);
  if (result.rows.length === 0) {
    throw new Error('Package not found or you do not have permission to delete it');
  }
  return true;
}

module.exports = {
  listPackages,
  getPackageById,
  getPackageBySlug,
  createPackage,
  updatePackage,
  deletePackage
};
