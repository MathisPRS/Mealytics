const pool = require('./pool');

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS users (
    id          SERIAL PRIMARY KEY,
    email       TEXT UNIQUE NOT NULL,
    password    TEXT NOT NULL,
    name        TEXT,
    gender      TEXT,
    weight      NUMERIC(5,2),
    height      INTEGER,
    age         INTEGER,
    activity_level TEXT,
    job_activity   TEXT,
    sport_activity TEXT,
    metabolism     TEXT,
    goal        TEXT,
    target_weight  NUMERIC(5,2),
    custom_calories INTEGER,
    notifications  JSONB DEFAULT '{}',
    member_since   TEXT,
    onboarded   BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMPTZ DEFAULT NOW()
  );

  -- Migrations: add new columns if they don't exist yet (idempotent)
  ALTER TABLE users ADD COLUMN IF NOT EXISTS job_activity   TEXT;
  ALTER TABLE users ADD COLUMN IF NOT EXISTS sport_activity TEXT;
  ALTER TABLE users ADD COLUMN IF NOT EXISTS metabolism     TEXT;

  CREATE TABLE IF NOT EXISTS journal_entries (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    entry_date  DATE NOT NULL,
    meal_type   TEXT NOT NULL CHECK (meal_type IN ('petit_dejeuner','dejeuner','diner','collation')),
    food_id     TEXT NOT NULL,
    food_name   TEXT NOT NULL,
    quantity    NUMERIC(8,2) NOT NULL,
    unit        TEXT NOT NULL,
    calories    NUMERIC(8,2) DEFAULT 0,
    protein     NUMERIC(8,2) DEFAULT 0,
    carbs       NUMERIC(8,2) DEFAULT 0,
    fat         NUMERIC(8,2) DEFAULT 0,
    created_at  TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS weight_log (
    id         SERIAL PRIMARY KEY,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    log_date   DATE NOT NULL,
    weight     NUMERIC(5,2) NOT NULL,
    note       TEXT DEFAULT '',
    UNIQUE(user_id, log_date)
  );

  CREATE TABLE IF NOT EXISTS recipes (
    id           SERIAL PRIMARY KEY,
    user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name         TEXT NOT NULL,
    ingredients  JSONB NOT NULL DEFAULT '[]',
    liked        BOOLEAN DEFAULT FALSE,
    created_at   TIMESTAMPTZ DEFAULT NOW(),
    updated_at   TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS favorites (
    id       SERIAL PRIMARY KEY,
    user_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    food_id  TEXT NOT NULL,
    UNIQUE(user_id, food_id)
  );

  CREATE TABLE IF NOT EXISTS recents (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    food_id     TEXT NOT NULL,
    used_at     TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, food_id)
  );

  CREATE TABLE IF NOT EXISTS water_log (
    id         SERIAL PRIMARY KEY,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    log_date   DATE NOT NULL,
    amount_ml  INTEGER NOT NULL DEFAULT 0,
    UNIQUE(user_id, log_date)
  );
`;

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(SCHEMA);
    await client.query('COMMIT');
    console.log('[DB] Schema migrated successfully');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { migrate };
