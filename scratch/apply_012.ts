import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from '../server/db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sqlPath = path.resolve(__dirname, '../migrations/012_add_atualizado_em_to_catalog.sql');

async function migrate() {
  const sql = fs.readFileSync(sqlPath, 'utf8');
  console.log('Running:', sql);
  await pool.query(sql);
  console.log('Success.');
  process.exit(0);
}

migrate().catch(console.error);
