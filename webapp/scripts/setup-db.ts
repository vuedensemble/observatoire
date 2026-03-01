/**
 * Setup MySQL database and user for the observatoire webapp.
 *
 * Uses the admin credentials from .env to:
 * 1. Create the database (MYSQL_DATABASE) if it doesn't exist
 * 2. Create the app user (MYSQL_USER) if it doesn't exist
 * 3. Grant all privileges on the database to the app user
 *
 * Usage:
 *   npx tsx scripts/setup-db.ts
 *
 * Required env vars (in .env):
 *   MYSQL_ADMINUSER, MYSQL_ADMIN_PASSWORD - admin credentials
 *   MYSQL_HOST, MYSQL_PORT - server connection
 *   MYSQL_DATABASE - database name to create
 *   MYSQL_USER, MYSQL_PASSWORD - app user to create
 */

import { config } from 'dotenv';
config({ path: '.env' });
import mysql from 'mysql2/promise';

async function main() {
  const host = process.env.MYSQL_HOST;
  const port = Number(process.env.MYSQL_PORT) || 3306;
  const adminUser = process.env.MYSQL_ADMINUSER;
  const adminPassword = process.env.MYSQL_ADMIN_PASSWORD;
  const database = process.env.MYSQL_DATABASE;
  const appUser = process.env.MYSQL_USER;
  const appPassword = process.env.MYSQL_PASSWORD;

  if (!host || !adminUser || !adminPassword || !database || !appUser || !appPassword) {
    console.error('Missing required env vars. Check .env for:');
    console.error('  MYSQL_HOST, MYSQL_PORT, MYSQL_ADMINUSER, MYSQL_ADMIN_PASSWORD');
    console.error('  MYSQL_DATABASE, MYSQL_USER, MYSQL_PASSWORD');
    process.exit(1);
  }

  console.log(`Connecting to MySQL at ${host}:${port} as ${adminUser}...`);

  const connection = await mysql.createConnection({
    host,
    port,
    user: adminUser,
    password: adminPassword,
  });

  console.log(`Creating database ${database} (if not exists)...`);
  await connection.execute(
    `CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  );

  console.log(`Creating user ${appUser} (if not exists)...`);
  await connection.execute(
    `CREATE USER IF NOT EXISTS ?@'%' IDENTIFIED BY ?`,
    [appUser, appPassword]
  );

  console.log(`Granting privileges on ${database} to ${appUser}...`);
  await connection.execute(
    `GRANT ALL PRIVILEGES ON \`${database}\`.* TO ?@'%'`,
    [appUser]
  );

  await connection.execute('FLUSH PRIVILEGES');

  console.log('Done! Database and user are ready.');
  console.log(`\nNext steps:`);
  console.log(`  npm run db:push    # Create tables`);
  console.log(`  npm run db:seed    # Seed with mock data`);

  await connection.end();
}

main().catch((err) => {
  console.error('Setup failed:', err);
  process.exit(1);
});
