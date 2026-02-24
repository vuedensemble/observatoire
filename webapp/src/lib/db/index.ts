import { config } from 'dotenv';
config({ path: '.env' });
config({ path: '.env.local' });

import mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import * as schema from './schema';
import * as authSchema from './auth-schema';

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  port: Number(process.env.MYSQL_PORT) || 3306,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_USER_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
});

export const db = drizzle(pool, { schema: { ...schema, ...authSchema }, mode: 'default' });
