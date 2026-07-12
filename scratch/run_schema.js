import postgres from 'postgres';
import fs from 'fs';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('Error: DATABASE_URL environment variable is missing.');
  process.exit(1);
}

console.log('Connecting to database...');
const sql = postgres(connectionString, {
  ssl: 'require' // Supabase requires SSL connection
});

async function run() {
  try {
    const schemaSql = fs.readFileSync('supabase_schema.sql', 'utf8');
    
    // Split statements or execute the entire schema as one multi-statement query
    console.log('Executing database schema SQL...');
    await sql.unsafe(schemaSql);
    console.log('Database schema created and configured successfully!');
  } catch (error) {
    console.error('Failed to run schema:', error.message || error);
  } finally {
    await sql.end();
  }
}

run();
