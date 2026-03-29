const { Pool } = require('pg');

// Fail-fast: refuse to start with default/hardcoded DB credentials
if (!process.env.DB_PASSWORD) {
  console.error('[FATAL] DB_PASSWORD is not set. Refusing to start with default credentials.');
  process.exit(1);
}

const pool = new Pool({
  host:     process.env.DB_HOST || 'localhost',
  port:     parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'mealytics',
  user:     process.env.DB_USER || 'mealytics',
  password: process.env.DB_PASSWORD,
});

pool.on('error', (err) => {
  console.error('[DB] Unexpected error on idle client', err);
});

module.exports = pool;
