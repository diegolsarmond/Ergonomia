import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../db.js';
import { requireAuth, JWT_SECRET, JWT_EXPIRES_IN, AuthPayload } from '../middleware/auth.js';

const router = Router();

function rowToUser(r: any, permissions: string[] = []) {
  return {
    id: r.id,
    nome: r.nome,
    email: r.email,
    nomeUsuario: r.nome_usuario,
    perfil: r.perfil,
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

async function getUserPermissions(userId: string, perfil: string): Promise<string[]> {
  if (perfil === 'ADMIN') return ['ALL'];

  const [profilePerms, userPerms] = await Promise.all([
    pool.query(
      `SELECT pp.permissao FROM perfil_permissoes pp WHERE pp.perfil_id = $1`,
      [perfil]
    ),
    pool.query(
      `SELECT permissao FROM usuario_permissoes WHERE usuario_id = $1`,
      [userId]
    ),
  ]);

  const perms = new Set<string>([
    ...profilePerms.rows.map((r: any) => r.permissao),
    ...userPerms.rows.map((r: any) => r.permissao),
  ]);
  return Array.from(perms);
}

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Autenticação de usuário
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nomeUsuario, senha]
 *             properties:
 *               nomeUsuario:
 *                 type: string
 *               senha:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *       401:
 *         description: Credenciais inválidas
 */
router.post('/login', async (req, res) => {
  const { nomeUsuario, senha } = req.body;
  if (!nomeUsuario || !senha) {
    res.status(400).json({ error: 'nomeUsuario e senha são obrigatórios' });
    return;
  }

  try {
    const { rows } = await pool.query(
      `SELECT * FROM usuarios WHERE nome_usuario = $1 AND status = 'ativo'`,
      [nomeUsuario]
    );

    if (!rows.length) {
      res.status(401).json({ error: 'Usuário ou senha inválidos' });
      return;
    }

    const user = rows[0];
    const valid = await bcrypt.compare(senha, user.senha_hash);
    if (!valid) {
      res.status(401).json({ error: 'Usuário ou senha inválidos' });
      return;
    }

    await pool.query(
      `UPDATE usuarios SET ultimo_acesso_em = NOW() WHERE id = $1`,
      [user.id]
    );

    const payload: AuthPayload = {
      userId: user.id,
      username: user.nome_usuario,
      perfil: user.perfil,
    };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    const permissions = await getUserPermissions(user.id, user.perfil);
    res.json({ token, user: rowToUser(user, permissions) });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Retorna o usuário autenticado
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados do usuário atual
 *       401:
 *         description: Não autenticado
 */
router.get('/me', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM usuarios WHERE id = $1`,
      [req.auth!.userId]
    );
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
 * /api/auth/change-password:
 *   post:
 *     summary: Altera a senha do usuário autenticado
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 */
router.post('/change-password', requireAuth, async (req, res) => {
  const { senhaAtual, novaSenha } = req.body;
  if (!senhaAtual || !novaSenha) {
    res.status(400).json({ error: 'senhaAtual e novaSenha são obrigatórios' });
    return;
  }
  if (novaSenha.length < 6) {
    res.status(400).json({ error: 'A nova senha deve ter no mínimo 6 caracteres' });
    return;
  }

  try {
    const { rows } = await pool.query(
      `SELECT * FROM usuarios WHERE id = $1`,
      [req.auth!.userId]
    );
    if (!rows.length) {
      res.status(404).json({ error: 'Usuário não encontrado' });
      return;
    }

    const valid = await bcrypt.compare(senhaAtual, rows[0].senha_hash);
    if (!valid) {
      res.status(401).json({ error: 'Senha atual incorreta' });
      return;
    }

    const hash = await bcrypt.hash(novaSenha, 12);
    await pool.query(
      `UPDATE usuarios SET senha_hash = $1, alterar_senha = FALSE, atualizado_em = NOW() WHERE id = $2`,
      [hash, req.auth!.userId]
    );
    res.json({ message: 'Senha alterada com sucesso' });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
