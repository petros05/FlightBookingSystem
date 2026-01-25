const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: 'postgres' // Connect to default postgres database first
});

async function createDatabase() {
  try {
    await client.connect();

    // Check if database exists
    const result = await client.query(
      "SELECT datname FROM pg_catalog.pg_database WHERE datname = 'flightbooking_users'"
    );

    if (result.rows.length === 0) {
      // Create database
      await client.query('CREATE DATABASE flightbooking_users');
    }

  } catch (error) {
  } finally {
    await client.end();
  }
}

createDatabase();