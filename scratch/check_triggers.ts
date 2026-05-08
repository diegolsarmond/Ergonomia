import { pool } from '../server/db.js';

async function main() {
  const query = `
    SELECT t.event_object_table
    FROM information_schema.triggers t
    WHERE t.action_statement LIKE '%atualiza_timestamp()%'
    AND NOT EXISTS (
      SELECT 1 FROM information_schema.columns c
      WHERE c.table_name = t.event_object_table
      AND c.column_name = 'atualizado_em'
    );
  `;
  const res = await pool.query(query);
  console.log(JSON.stringify(res.rows, null, 2));
  process.exit(0);
}
main().catch(console.error);
