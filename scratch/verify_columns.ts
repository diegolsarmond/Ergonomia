import pg from 'pg';
const { Client } = pg;

async function main() {
  const c = new Client({
    host: 'easypanel.quantumtecnologia.com.br',
    port: 5435,
    database: 'ergominas',
    user: 'postgres',
    password: 'C@104rm0nd1994',
    ssl: false,
  });
  await c.connect();
  const r = await c.query(
    "SELECT column_name FROM information_schema.columns WHERE table_name='aep_projetos' AND column_name IN ('nome_empresa','endereco','localizacao','unidade') ORDER BY column_name"
  );
  console.log('aep_projetos verified columns:', r.rows.map((row: any) => row.column_name));

  const r2 = await c.query(
    "SELECT column_name FROM information_schema.columns WHERE table_name='aet_funcoes' AND column_name IN ('unidade','setor') ORDER BY column_name"
  );
  console.log('aet_funcoes verified columns:', r2.rows.map((row: any) => row.column_name));

  await c.end();
}
main().catch((e) => { console.error(e); process.exit(1); });
