import { pool } from './server/db.js';
pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'aep_projetos'").then(r => {console.log(r.rows); process.exit(0)});
