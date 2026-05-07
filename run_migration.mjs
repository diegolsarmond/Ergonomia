import 'dotenv/config';
import pg from 'pg';
import fs from 'fs';

const pool = new pg.Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: false,
});

const sql = fs.readFileSync('migrations/008_json_storage.sql', 'utf8');

try {
  await pool.query(sql);
  console.log('✅ Migração 008 executada com sucesso!');
} catch (e) {
  console.error('❌ Erro:', e.message);
} finally {
  await pool.end();
}
