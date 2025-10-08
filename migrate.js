const { Client } = require("pg");
const fs = require("fs");

async function runMigration() {
  const client = new Client({
    connectionString:
      process.env.DATABASE_URL ||
      "postgresql://postgres:postgres@localhost:54322/postgres",
  });

  try {
    await client.connect();
    console.log("Connected to database");

    const migration = fs.readFileSync(
      "./lib/db/migrations/0000_initial_schema.sql",
      "utf8"
    );
    await client.query(migration);
    console.log("Migration applied successfully");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await client.end();
  }
}

runMigration();
