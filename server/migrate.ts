import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsDir = path.resolve(__dirname, '../migrations');

async function migrate() {
  // Cria tabela de controle se ainda não existir
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version     TEXT        PRIMARY KEY,
      applied_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const { rows: appliedRows } = await pool.query('SELECT version FROM schema_migrations');
  const applied = new Set<string>(appliedRows.map((r: any) => r.version));

  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  console.log(`Verificando ${files.length} migration(s) em ${migrationsDir}...`);

  let count = 0;
  for (const file of files) {
    if (applied.has(file)) {
      console.log(`  ⏭  ${file} (já aplicada)`);
      continue;
    }

    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    console.log(`  →  Aplicando ${file}...`);

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('INSERT INTO schema_migrations (version) VALUES ($1)', [file]);
      await client.query('COMMIT');
      count++;
      console.log(`  ✓  ${file} aplicada com sucesso`);
    } catch (err: any) {
      await client.query('ROLLBACK');
      // 42P07 = duplicate_table  |  42710 = duplicate_object (constraint/index já existente)
      // 23505 = unique_violation (seed data já inserida)
      // Esses erros indicam que a migration foi aplicada em uma execução anterior.
      if (['42P07', '42710', '23505'].includes(err.code)) {
        console.log(`  ⏭  ${file} (objetos já existem — marcada como aplicada)`);
        await pool.query(
          'INSERT INTO schema_migrations (version) VALUES ($1) ON CONFLICT DO NOTHING',
          [file],
        );
      } else {
        throw err;
      }
    } finally {
      client.release();
    }
  }

  if (count === 0) {
    console.log('Nenhuma migration pendente. Banco já está atualizado.');
  } else {
    console.log(`\n${count} migration(s) aplicada(s) com sucesso.`);
  }

  await pool.end();
}

migrate().catch((err) => {
  console.error('Migration falhou:', err);
  process.exit(1);
});
