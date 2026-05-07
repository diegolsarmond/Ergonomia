import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

function rowToRisk(r: any) {
  return {
    id: r.id,
    name: r.nome,
    minScore: r.pontuacao_minima,
    maxScore: r.pontuacao_maxima,
    color: r.cor ?? '',
    interpretation: r.interpretacao ?? '',
  };
}

router.get('/', async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM classificacoes_risco ORDER BY pontuacao_minima');
    res.json(rows.map(rowToRisk));
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.post('/', async (req, res) => {
  const r = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO classificacoes_risco (id, nome, pontuacao_minima, pontuacao_maxima, cor, interpretacao)
       VALUES (gen_random_uuid(),$1,$2,$3,$4,$5) RETURNING *`,
      [r.name, r.minScore, r.maxScore, r.color, r.interpretation]
    );
    res.status(201).json(rowToRisk(rows[0]));
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.put('/:id', async (req, res) => {
  const r = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE classificacoes_risco SET nome=$1, pontuacao_minima=$2, pontuacao_maxima=$3,
        cor=$4, interpretacao=$5 WHERE id=$6 RETURNING *`,
      [r.name, r.minScore, r.maxScore, r.color, r.interpretation, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Não encontrado' });
    res.json(rowToRisk(rows[0]));
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM classificacoes_risco WHERE id=$1', [req.params.id]);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
