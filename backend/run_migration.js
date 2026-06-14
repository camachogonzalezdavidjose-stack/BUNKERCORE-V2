const db = require('./config/db');

async function migrate() {
  try {
    await db.query('ALTER TABLE credentials ADD COLUMN IF NOT EXISTS aaguid TEXT;');
    console.log('Column "aaguid" added successfully!');
  } catch (err) {
    console.error('Error modifying table:', err);
  } finally {
    process.exit();
  }
}

migrate();
