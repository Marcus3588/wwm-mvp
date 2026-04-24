const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn('DATABASE_URL is not set. Database operations will likely fail or use defaults.');
}

const poolConfig = {
  connectionString,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
};

// Ensure password is a string if missing from the connection string to avoid driver errors
if (!connectionString || !connectionString.includes(':')) {
  poolConfig.password = '';
}

const pool = new Pool(poolConfig);

pool.on('error', (err) => console.error('Unexpected DB error:', err));

// Attempt a connection to verify
if (process.env.NODE_ENV !== 'production' && connectionString) {
  pool.query('SELECT 1').then(() => {
    console.log('Database connected successfully');
  }).catch(err => {
    console.error('Database connection failed:', err.message);
  });
}

module.exports = { pool };
