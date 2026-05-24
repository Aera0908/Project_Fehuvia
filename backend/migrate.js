const db = require('./db');

async function runMigration() {
  console.log("🚀 Starting database schema migration on Supabase...");
  
  const migrationQuery = `
    ALTER TABLE users ADD COLUMN IF NOT EXISTS automation_level VARCHAR(20) DEFAULT 'semi';
    ALTER TABLE users ADD COLUMN IF NOT EXISTS conversion_preference VARCHAR(20) DEFAULT 'manual';
    ALTER TABLE users ADD COLUMN IF NOT EXISTS risk_profile VARCHAR(20) DEFAULT 'balanced';
    ALTER TABLE users ADD COLUMN IF NOT EXISTS bank_linked BOOLEAN DEFAULT FALSE;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS bank_name VARCHAR(100);
  `;
  
  try {
    await db.query(migrationQuery);
    console.log("✅ Database schema migrated successfully!");
    
    // Quick verification query
    const res = await db.query("SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'users' AND COLUMN_NAME IN ('automation_level', 'conversion_preference', 'risk_profile', 'bank_linked', 'bank_name')");
    console.log("📊 Verification results:");
    console.log(res.rows);
  } catch (err) {
    console.error("❌ Migration failed:", err);
  } finally {
    await db.pool.end();
    console.log("🔌 Database pool closed.");
  }
}

runMigration();
