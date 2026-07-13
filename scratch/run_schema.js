import postgres from 'postgres';
import fs from 'fs';

// Try to read .env from root first, then fall back to client/.env
let envContent = '';
try {
  if (fs.existsSync('.env')) {
    envContent = fs.readFileSync('.env', 'utf8');
  } else if (fs.existsSync('client/.env')) {
    envContent = fs.readFileSync('client/.env', 'utf8');
  } else if (fs.existsSync('server/.env')) {
    envContent = fs.readFileSync('server/.env', 'utf8');
  } else {
    throw new Error('No .env file found in root, client, or server directories');
  }

  envContent.split(/\r?\n/).forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const index = trimmed.indexOf('=');
    if (index !== -1) {
      const key = trimmed.slice(0, index).trim();
      let value = trimmed.slice(index + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
  });
} catch (err) {
  console.warn('Warning:', err.message);
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('Error: DATABASE_URL is missing in configuration env files.');
  process.exit(1);
}

console.log('Connecting to database...');
const sql = postgres(connectionString, {
  ssl: 'require'
});

async function run() {
  try {
    const schemaSql = fs.readFileSync('supabase_schema.sql', 'utf8');
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
