const { Pool } = require('pg');
require('dotenv').config();

// Validate that the variable exists before attempting to connect
if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL is not defined in the environment.');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Force SSL usage for Neon
  ssl: {
    rejectUnauthorized: false
  }
});

// Connection test
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Fatal error connecting to Neon:', err.message);
  } else {
    console.log('Connection to Neon verified successfully!');
  }
});

module.exports = pool;
