const { Pool } = require('pg');
require('dotenv').config();

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
