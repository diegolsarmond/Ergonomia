import { pool } from '../server/db.js';

async function main() {
  const res = await pool.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'empresas';`);
  console.log(JSON.stringify(res.rows, null, 2));
  process.exit(0);
}
main().catch(console.error);
