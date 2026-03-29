#!/usr/bin/env node

/**
 * TheCaddy.AI  --  Database Migration Runner
 *
 * Connects to Neon PostgreSQL via @neondatabase/serverless
 * and executes the migrate.sql file.
 *
 * Usage:
 *   DATABASE_URL="postgres://..." node scripts/migrate.js
 *
 * Or with dotenv (reads .env.local automatically):
 *   npx dotenv -e .env.local -- node scripts/migrate.js
 */

const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

async function main() {
  // ---- 1. Resolve DATABASE_URL ----
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error(
      '❌  DATABASE_URL is not set.\n' +
        '   Provide it as an environment variable or use:\n' +
        '   npx dotenv -e .env.local -- node scripts/migrate.js'
    );
    process.exit(1);
  }

  // Mask the URL for logging (show host only)
  const masked = databaseUrl.replace(
    /\/\/[^@]+@/,
    '//***:***@'
  );
  console.log(`\n🔗  Connecting to: ${masked}\n`);

  // ---- 2. Read SQL file ----
  const sqlPath = path.join(__dirname, 'migrate.sql');
  if (!fs.existsSync(sqlPath)) {
    console.error(`❌  SQL file not found at ${sqlPath}`);
    process.exit(1);
  }

  const sqlContent = fs.readFileSync(sqlPath, 'utf-8');
  console.log(`📄  Loaded migrate.sql (${sqlContent.length} bytes)\n`);

  // ---- 3. Split into individual statements ----
  // Remove SQL comments and split on semicolons.
  // We keep the statements that actually have content.
  const statements = sqlContent
    .split(';')
    .map((s) => s.trim())
    .filter((s) => {
      // Remove empty or comment-only blocks
      const withoutComments = s.replace(/--[^\n]*/g, '').trim();
      return withoutComments.length > 0;
    });

  console.log(`📦  Found ${statements.length} SQL statements to execute.\n`);

  // ---- 4. Execute statements ----
  const sql = neon(databaseUrl);
  let succeeded = 0;
  let failed = 0;

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];

    // Extract a short label from the statement for logging
    const label = extractLabel(stmt);
    const num = String(i + 1).padStart(2, ' ');

    try {
      await sql(stmt);
      console.log(`  ✅  [${num}/${statements.length}]  ${label}`);
      succeeded++;
    } catch (err) {
      console.error(`  ❌  [${num}/${statements.length}]  ${label}`);
      console.error(`      Error: ${err.message}\n`);
      failed++;
    }
  }

  // ---- 5. Summary ----
  console.log('\n' + '='.repeat(50));
  console.log(`  Migration complete.`);
  console.log(`  ✅  Succeeded: ${succeeded}`);
  if (failed > 0) {
    console.log(`  ❌  Failed:    ${failed}`);
  }
  console.log('='.repeat(50) + '\n');

  if (failed > 0) {
    process.exit(1);
  }
}

/**
 * Extract a human-readable label from a SQL statement.
 * Examples:
 *   "CREATE TABLE IF NOT EXISTS users ..."  =>  "CREATE TABLE users"
 *   "CREATE INDEX IF NOT EXISTS idx_foo ..." =>  "CREATE INDEX idx_foo"
 *   "CREATE EXTENSION IF NOT EXISTS pgcrypto" => "CREATE EXTENSION pgcrypto"
 */
function extractLabel(stmt) {
  // Normalise whitespace
  const single = stmt.replace(/\s+/g, ' ');

  // Try to match CREATE TABLE / INDEX / EXTENSION
  const match = single.match(
    /^(CREATE\s+(?:TABLE|INDEX|EXTENSION))\s+(?:IF\s+NOT\s+EXISTS\s+)?(\S+)/i
  );
  if (match) {
    return `${match[1].toUpperCase()} ${match[2]}`;
  }

  // Fallback: first 60 chars
  return single.substring(0, 60) + (single.length > 60 ? '...' : '');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
