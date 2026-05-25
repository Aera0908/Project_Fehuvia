const { Pool, types } = require('pg');
require('dotenv').config();

// Parse PostgreSQL DATE columns (OID 1082) as raw string to prevent timezone shifts
types.setTypeParser(1082, val => val);

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn("⚠️ Warning: DATABASE_URL is not defined. Database operations will fail until it is set.");
}

const pool = new Pool({
  connectionString,
  ssl: {
    // Required for secure connections to remote Supabase instances
    rejectUnauthorized: false
  }
});

module.exports = {
  /**
   * Run a query against the Supabase database.
   * @param {string} text SQL Query string.
   * @param {any[]} params Query parameters.
   */
  query: (text, params) => pool.query(text, params),
  pool
};
