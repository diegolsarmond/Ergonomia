import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { registrarAuditoria } from '../lib/auditoria.js';

const router = Router();

// Todas as rotas exigem autenticação
router.use(requireAuth);

function rowToUser(r: any, permissions: string[] = [], perfilRotulo?: string | null) {
  return {
    id: r.id,
    nome: r.nome,
    email: r.email,
    nomeUsuario: r.nome_usuario,
    perfil: r.perfil,
    perfilRotulo: perfilRotulo ?? r.perfil_rotulo ?? null,
    status: r.status,
    alterarSenha: r.alterar_senha,
    formacao: r.formacao ?? '',
    crefito: r.crefito ?? '',
    criadoEm: r.criado_em,
    atualizadoEm: r.atualizado_em,
    ultimoAcessoEm: r.ultimo_acesso_em,
    permissions,
  };
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function getUserPermissions(userId: string, perfil: string): Promise<string[]> {
  if (perfil === 'ADMIN') return ['ALL'];
  const [profilePerms, userPerms] = await Promise.all([
    UUID_RE.test(perfil)
      ? pool.query(`SELECT permissao FROM perfil_permissoes WHERE perfil_id = $1`, [perfil])
      : Promise.resolve({ rows: [] }),
    pool.query(`SELECT permissao FROM usuario_permissoes WHERE usuario_id = $1`, [userId]),
  ]);
  const perms = new Set<string>([
    ...profilePerms.rows.map((r: any) => r.permissao),
    ...userPerms.rows.map((r: any) => r.permissao),
  ]);
  return Array.from(perms);
}

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Lista todos os usuários
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', requireAdmin, async (req, res) => {
  try {
    // Busca primeiro perfil ativo como fallback para perfis órfãos
    const { rows: fallbackRows } = await pool.query(
      `SELECT id, rotulo FROM perfis_customizados WHERE ativo = TRUE ORDER BY criado_em LIMIT 1`
    );
    const fallback = fallbackRows[0] ?? null;

    // Usuários com nome do perfil via LEFT JOIN
    const { rows } = await pool.query(
      `SELECT u.*, pc.rotulo AS perfil_rotulo
       FROM usuarios u
       LEFT JOIN perfis_customizados pc ON pc.id::text = u.perfil
       ORDER BY u.nome`
    );

    // Corrige usuários cujo perfil UUID não existe mais em perfis_customizados
    if (fallback) {
      const orphanIds = rows
        .filter(r => r.perfil !== 'ADMIN' && r.perfil_rotulo === null)
        .map(r => r.id);

      if (orphanIds.length > 0) {
        await pool.query(
          `UPDATE usuarios SET perfil = $1, atualizado_em = NOW() WHERE id = ANY($2::uuid[])`,
          [fallback.id, orphanIds]
        );
        await registrarAuditoria(
          req, 'EDIÇÃO', 'usuarios', orphanIds.join(','),
          `Perfil inválido corrigido automaticamente para "${fallback.rotulo}" (${orphanIds.length} usuário(s))`
        );
        for (const r of rows) {
          if (orphanIds.includes(r.id)) {
            r.perfil = fallback.id;
            r.perfil_rotulo = fallback.rotulo;
          }
        }
      }
    }

    const users = await Promise.all(
      rows.map(async (r) => rowToUser(r, await getUserPermissions(r.id, r.perfil)))
    );
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Retorna um usuário pelo ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', async (req, res) => {
  // Usuário só pode ver o próprio perfil, ADMIN pode ver qualquer um
  if (req.auth!.perfil !== 'ADMIN' && req.auth!.userId !== req.params.id) {
    res.status(403).json({ error: 'Acesso negado' });
    return;
  }
  try {
    const { rows } = await pool.query(`SELECT * FROM usuarios WHERE id = $1`, [req.params.id]);
    if (!rows.length) {
      res.status(404).json({ error: 'Usuário não encontrado' });
      return;
    }
    const permissions = await getUserPermissions(rows[0].id, rows[0].perfil);
    res.json(rowToUser(rows[0], permissions));
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Cria um novo usuário (apenas ADMIN)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', requireAdmin, async (req, res) => {
  const { nome, email, nomeUsuario, senha, perfil, status, formacao, crefito, alterarSenha } = req.body;
  if (!nome || !email || !nomeUsuario || !senha) {
    res.status(400).json({ error: 'nome, email, nomeUsuario e senha são obrigatórios' });
    return;
  }

  try {
    const hash = await bcrypt.hash(senha, 12);
    const { rows } = await pool.query(
      `INSERT INTO usuarios (nome, email, nome_usuario, senha_hash, perfil, status, alterar_senha, formacao, crefito)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        nome,
        email,
        nomeUsuario,
        hash,
        perfil ?? 'ADMIN',
        status ?? 'ativo',
        alterarSenha ?? false,
        formacao ?? null,
        crefito ?? null,
      ]
    );
    await registrarAuditoria(req, 'CRIAÇÃO', 'usuarios', rows[0].id, `Usuário criado: ${rows[0].nome} (${rows[0].nome_usuario})`);
    res.status(201).json(rowToUser(rows[0]));
  } catch (err: any) {
    if (err.code === '23505') {
      res.status(409).json({ error: 'E-mail ou nome de usuário já cadastrado' });
      return;
    }
    res.status(500).json({ error: String(err) });
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Atualiza dados de um usuário
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', async (req, res) => {
  const isAdmin = req.auth!.perfil === 'ADMIN';
  const isSelf = req.auth!.userId === req.params.id;

  if (!isAdmin && !isSelf) {
    res.status(403).json({ error: 'Acesso negado' });
    return;
  }

  const { nome, email, formacao, crefito, perfil, status, alterarSenha } = req.body;

  try {
    // Não-admins não podem mudar perfil, status ou alterarSenha
    const { rows } = await pool.query(
      `UPDATE usuarios SET
        nome = COALESCE($1, nome),
        email = COALESCE($2, email),
        formacao = COALESCE($3, formacao),
        crefito = COALESCE($4, crefito),
        perfil = CASE WHEN $5::boolean THEN COALESCE($6, perfil) ELSE perfil END,
        status = CASE WHEN $5::boolean THEN COALESCE($7, status) ELSE status END,
        alterar_senha = CASE WHEN $5::boolean THEN COALESCE($8, alterar_senha) ELSE alterar_senha END,
        atualizado_em = NOW()
       WHERE id = $9
       RETURNING *`,
      [nome, email, formacao, crefito, isAdmin, perfil, status, alterarSenha, req.params.id]
    );
    if (!rows.length) {
      res.status(404).json({ error: 'Usuário não encontrado' });
      return;
    }
    await registrarAuditoria(req, 'EDIÇÃO', 'usuarios', req.params.id, `Usuário editado: ${rows[0].nome} (${rows[0].nome_usuario})`);
    const permissions = await getUserPermissions(rows[0].id, rows[0].perfil);
    res.json(rowToUser(rows[0], permissions));
  } catch (err: any) {
    if (err.code === '23505') {
      res.status(409).json({ error: 'E-mail já cadastrado para outro usuário' });
      return;
    }
    res.status(500).json({ error: String(err) });
  }
});

/**
 * @swagger
 * /api/users/{id}/reset-password:
 *   post:
 *     summary: Redefine a senha de um usuário (apenas ADMIN)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.post('/:id/reset-password', requireAdmin, async (req, res) => {
  const { novaSenha } = req.body;
  if (!novaSenha || novaSenha.length < 6) {
    res.status(400).json({ error: 'novaSenha deve ter no mínimo 6 caracteres' });
    return;
  }
  try {
    const hash = await bcrypt.hash(novaSenha, 12);
    const { rowCount } = await pool.query(
      `UPDATE usuarios SET senha_hash = $1, alterar_senha = TRUE, atualizado_em = NOW() WHERE id = $2`,
      [hash, req.params.id]
    );
    if (!rowCount) {
      res.status(404).json({ error: 'Usuário não encontrado' });
      return;
    }
    res.json({ message: 'Senha redefinida com sucesso' });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Remove um usuário (apenas ADMIN)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', requireAdmin, async (req, res) => {
  if (req.auth!.userId === req.params.id) {
    res.status(400).json({ error: 'Não é possível desativar o próprio usuário' });
    return;
  }
  try {
    const { rows } = await pool.query(
      `UPDATE usuarios SET status = 'inativo', atualizado_em = NOW()
       WHERE id = $1 AND status != 'inativo'
       RETURNING *`,
      [req.params.id]
    );
    if (!rows.length) {
      res.status(404).json({ error: 'Usuário não encontrado ou já inativo' });
      return;
    }
    await pool.query(`DELETE FROM sessoes WHERE usuario_id = $1`, [req.params.id]);
    await registrarAuditoria(req, 'EXCLUSÃO', 'usuarios', req.params.id, `Usuário desativado: ${rows[0].nome} (${rows[0].nome_usuario})`);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// ─── Perfis customizados ────────────────────────────────────────────────────

/**
 * @swagger
 * /api/users/profiles:
 *   get:
 *     summary: Lista perfis customizados com suas permissões
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.get('/profiles/list', requireAdmin, async (_req, res) => {
  try {
    const { rows: profiles } = await pool.query(
      `SELECT * FROM perfis_customizados ORDER BY rotulo`
    );
    const result = await Promise.all(
      profiles.map(async (p) => {
        const { rows: perms } = await pool.query(
          `SELECT permissao FROM perfil_permissoes WHERE perfil_id = $1`,
          [p.id]
        );
        return {
          id: p.id,
          rotulo: p.rotulo,
          criadoEm: p.criado_em,
          permissoes: perms.map((r: any) => r.permissao),
        };
      })
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.post('/profiles/list', requireAdmin, async (req, res) => {
  const { rotulo, permissoes } = req.body;
  if (!rotulo) {
    res.status(400).json({ error: 'rotulo é obrigatório' });
    return;
  }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      `INSERT INTO perfis_customizados (rotulo) VALUES ($1) RETURNING *`,
      [rotulo]
    );
    const profileId = rows[0].id;
    if (Array.isArray(permissoes) && permissoes.length) {
      const values = permissoes.map((_: string, i: number) => `($1, $${i + 2})`).join(', ');
      await client.query(
        `INSERT INTO perfil_permissoes (perfil_id, permissao) VALUES ${values}`,
        [profileId, ...permissoes]
      );
    }
    await registrarAuditoria(req, 'CRIAÇÃO', 'perfis_customizados', profileId, `Perfil criado: ${rotulo}`, client);
    await client.query('COMMIT');
    res.status(201).json({ id: profileId, rotulo, permissoes: permissoes ?? [] });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: String(err) });
  } finally {
    client.release();
  }
});

router.put('/profiles/:profileId', requireAdmin, async (req, res) => {
  const { rotulo, permissoes } = req.body;
  const { profileId } = req.params;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    if (rotulo) {
      await client.query(
        `UPDATE perfis_customizados SET rotulo = $1, atualizado_em = NOW() WHERE id = $2`,
        [rotulo, profileId]
      );
    }
    if (Array.isArray(permissoes)) {
      await client.query(`DELETE FROM perfil_permissoes WHERE perfil_id = $1`, [profileId]);
      if (permissoes.length) {
        const values = permissoes.map((_: string, i: number) => `($1, $${i + 2})`).join(', ');
        await client.query(
          `INSERT INTO perfil_permissoes (perfil_id, permissao) VALUES ${values}`,
          [profileId, ...permissoes]
        );
      }
    }
    await registrarAuditoria(req, 'EDIÇÃO', 'perfis_customizados', profileId, `Perfil editado: ${rotulo ?? profileId}`, client);
    await client.query('COMMIT');
    res.json({ message: 'Perfil atualizado' });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: String(err) });
  } finally {
    client.release();
  }
});

router.delete('/profiles/:profileId', requireAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `UPDATE perfis_customizados SET ativo = FALSE, atualizado_em = NOW()
       WHERE id = $1 AND ativo
       RETURNING *`,
      [req.params.profileId]
    );
    if (!rows.length) {
      res.status(404).json({ error: 'Perfil não encontrado ou já inativo' });
      return;
    }
    await registrarAuditoria(req, 'EXCLUSÃO', 'perfis_customizados', req.params.profileId, `Perfil desativado: ${rows[0].rotulo}`);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
