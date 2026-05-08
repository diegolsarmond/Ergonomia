import { pool } from '../server/db.js';

async function main() {
  const res = await pool.query(`SELECT event_object_table, trigger_name, event_manipulation, action_statement, action_timing FROM information_schema.triggers WHERE event_object_table = 'empresas';`);
  console.log(JSON.stringify(res.rows, null, 2));
  process.exit(0);
}
main().catch(console.error);
