import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

/**
 * GET /api/ocupacoes?q=<search>&limit=<n>
 * Busca ocupações por descrição (autocomplete).
 * Retorna no máximo `limit` registros (padrão 20).
 */
router.get('/', async (req, res) => {
  const q = (req.query.q as string ?? '').trim();
  const limit = Math.min(Number(req.query.limit) || 20, 100);

  try {
    let rows: any[];
    if (q.length >= 2) {
      const result = await pool.query(
        `SELECT id, codigo, descricao, tipo
         FROM ocupacoes
         WHERE descricao ILIKE $1
         ORDER BY descricao
         LIMIT $2`,
        [`%${q}%`, limit],
      );
      rows = result.rows;
    } else {
      rows = [];
    }
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
