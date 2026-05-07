import pkg from 'pg';
const { Pool } = pkg;

export const pool = new Pool({
  host: 'easypanel.quantumtecnologia.com.br',
  port: 5435,
  database: 'ergominas',
  user: 'postgres',
  password: 'C@104rm0nd1994',
  ssl: false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('Erro inesperado no pool do PostgreSQL:', err);
});
