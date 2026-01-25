const { Client } = require('pg');
require('dotenv').config();

async function ensureDatabaseExists() {
  const adminClient = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: 'postgres' // Connect to default postgres database
  });

  try {
    await adminClient.connect();

    // Check if database exists
    const result = await adminClient.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [process.env.DB_NAME || 'flightbooking_users']
    );

    if (result.rows.length === 0) {
      // Create database
      await adminClient.query(
        `CREATE DATABASE "${process.env.DB_NAME || 'flightbooking_users'}"`
      );
    }

    await adminClient.end();
  } catch (error) {
    // Don't throw - database might already exist or be created by Docker
    await adminClient.end().catch(() => {});
  }
}

module.exports = { ensureDatabaseExists };
