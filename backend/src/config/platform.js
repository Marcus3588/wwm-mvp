

const { pool } = require('./db');

let cache = null;
let cacheTime = 0;
const CACHE_TTL_MS = 60000; 


async function getConfig(key, defaultValue = null) {
  if (cache && Date.now() - cacheTime < CACHE_TTL_MS && cache[key] !== undefined) {
    return cache[key];
  }
  try {
    const r = await pool.query(
      'SELECT value FROM platform_config WHERE key = $1',
      [key]
    );
    if (r.rows.length > 0) {
      const val = r.rows[0].value;
      if (!cache) cache = {};
      cache[key] = val;
      return val;
    }
  } catch (err) {
    if (err.code !== '42P01') console.error('platform config error:', err);
  }
  return defaultValue ?? getEnvDefault(key);
}


function getEnvDefault(key) {
  const env = {
    commission: { percentage: parseInt(process.env.PLATFORM_COMMISSION_PCT || '15', 10), min_cents: 5000 },
    service_fee: { percentage: parseFloat(process.env.PLATFORM_SERVICE_FEE_PCT || '2.5'), flat_cents: 0 },
    cancellation: {
      within_24h_penalty_pct: 100,
      within_48h_penalty_pct: 50,
      within_7d_penalty_pct: 25,
      refund_window_days: 14,
    },
    vendor_matching: { mode: process.env.VENDOR_MATCHING_MODE || 'manual', auto_assign_categories: [] },
    buffer_minutes: parseInt(process.env.BOOKING_BUFFER_MINUTES || '60', 10),
    sla_response_hours: parseInt(process.env.VENDOR_SLA_RESPONSE_HOURS || '24', 10),
  };
  return env[key] ?? null;
}


function invalidateCache() {
  cache = null;
}


async function setConfig(key, value) {
  const val = typeof value === 'object' && value !== null ? JSON.stringify(value) : value;
  await pool.query(
    `INSERT INTO platform_config (key, value) VALUES ($1, $2)
     ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()`,
    [key, val]
  );
  invalidateCache();
}

module.exports = {
  getConfig,
  setConfig,
  invalidateCache,
};
