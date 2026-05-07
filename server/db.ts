import 'dotenv/config';
// @ts-ignore — pg is a CJS module resolved at runtime by tsx, not by the Vite bundler
import pkg from 'pg';
const { Pool } = pkg;

export const pool = new Pool({
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  database: process.env.DB_NAME ?? 'ergominas',
  user: process.env.DB_USER ?? 'postgres',
  password: process.env.DB_PASSWORD ?? '',
  ssl: process.env.DB_SSL === 'true',
  max: Number(process.env.DB_MAX_CONNECTIONS ?? 10),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err: Error) => {
  console.error('Erro inesperado no pool do PostgreSQL:', err);
});
