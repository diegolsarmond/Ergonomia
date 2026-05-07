/**
 * Atualiza o hash da senha do usuário admin para bcrypt.
 * Executar uma vez após rodar as migrations:
 *   npx tsx server/scripts/seed-admin.ts
 */
import bcrypt from 'bcryptjs';
import { pool } from '../db.js';

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'admin123';

async function main() {
  const hash = await bcrypt.hash(ADMIN_PASSWORD, 12);
  const { rowCount } = await pool.query(
    `UPDATE usuarios SET senha_hash = $1, atualizado_em = NOW()
     WHERE nome_usuario = $2`,
    [hash, ADMIN_USERNAME]
  );

  if (!rowCount) {
    // Cria se não existir
    await pool.query(
      `INSERT INTO usuarios (nome, email, nome_usuario, senha_hash, perfil, status, alterar_senha)
       VALUES ('Administrador', 'admin@ergonomia.local', $1, $2, 'ADMIN', 'ativo', true)
       ON CONFLICT (nome_usuario) DO UPDATE SET senha_hash = EXCLUDED.senha_hash`,
      [ADMIN_USERNAME, hash]
    );
    console.log(`Usuário admin criado — senha: ${ADMIN_PASSWORD}`);
  } else {
    console.log(`Hash bcrypt atualizado para o usuário '${ADMIN_USERNAME}' — senha: ${ADMIN_PASSWORD}`);
  }

  await pool.end();
}

main().catch((err) => { console.error(err); process.exit(1); });
