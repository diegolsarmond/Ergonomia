import { Router } from 'express';
import { pool } from '../db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.get('/', requireAdmin, async (req, res) => {
  const { tabela, registroId, usuarioId, limit = '100', offset = '0' } = req.query as Record<string, string>;

  const conditions: string[] = [];
  const params: unknown[] = [];
  let i = 1;

  if (tabela) {
    conditions.push(`tabela = $${i++}`);
    params.push(tabela);
  }
  if (registroId) {
    conditions.push(`registro_id = $${i++}`);
    params.push(registroId);
  }
  if (usuarioId) {
    conditions.push(`usuario_id = $${i++}`);
    params.push(usuarioId);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const lim = Math.min(Number(limit) || 100, 500);
  const off = Number(offset) || 0;

  try {
    const { rows } = await pool.query(
      `SELECT id, data_hora, usuario_id, usuario_nome, acao, tabela, registro_id, descricao
       FROM auditoria
       ${where}
       ORDER BY data_hora DESC
       LIMIT $${i} OFFSET $${i + 1}`,
      [...params, lim, off],
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
