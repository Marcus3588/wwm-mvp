const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn('DATABASE_URL is not set. Database operations will likely fail or use defaults.');
}

const poolConfig = {
  connectionString,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  // Force password to be a string (even if empty) to avoid SASL errors in the 'pg' driver
  password: '', 
};

// If connection string has a password, pg legacy parser will use it, 
// but modern Pool often needs the explicit field as a string.
if (connectionString && connectionString.includes(':')) {
  const parts = connectionString.split(':');
  if (parts.length > 2) {
    // There might be a password in the string, let's let Pool parse it but ensure we don't break logic
  }
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
