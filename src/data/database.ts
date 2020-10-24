import { Pool } from 'pg';

// Initialize DB connection
const _db = new Pool({
  connectionString: process.env.PG_URL || 'postgress://localhost:5432/shortcut',
});

export const DB_TOKEN = Symbol.for('DATABASE');
export const db = _db;
