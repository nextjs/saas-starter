// test-db-connection.js
require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

async function testConnection() {
  // Get connection details from environment variables
  const host = process.env.POSTGRES_HOST; // Use the host directly from env
  const port = process.env.POSTGRES_PORT || '5432';
  const user = process.env.POSTGRES_USER;
  const password = process.env.POSTGRES_PASSWORD;
  const database = process.env.POSTGRES_DATABASE;

  console.log('Attempting to connect to database with:');
  console.log(`Host: ${host}`);
  console.log(`Port: ${port}`);
  console.log(`User: ${user}`);
  console.log(`Database: ${database}`);
  
  // Create a new client
  const client = new Client({
    host,
    port,
    user,
    password,
    database,
    ssl: {
      rejectUnauthorized: false // For Supabase, we need this
    },
    connectionTimeoutMillis: 30000 // 30 seconds
  });

  try {
    // Connect to the database
    console.log('Connecting to database...');
    await client.connect();
    console.log('Successfully connected to the database!');
    
    // Run a simple query
    const result = await client.query('SELECT NOW()');
    console.log('Current database time:', result.rows[0].now);
    
    // Close the connection
    await client.end();
    console.log('Connection closed.');
  } catch (error) {
    console.error('Error connecting to the database:', error);
  }
}

testConnection(); 