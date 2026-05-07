import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

function rowToPause(r: any) {
  return {
    id: r.id,
    name: r.nome,
    duration: r.duracao ?? '',
    durationUnit: r.unidade_duracao ?? 'minutos',
    description: r.descricao ?? '',
    active: r.ativo ?? true,
  };
}

router.get('/', async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM pausas_padrao ORDER BY nome');
    res.json(rows.map(rowToPause));
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.post('/', async (req, res) => {
  const p = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO pausas_padrao (id, nome, duracao, unidade_duracao, descricao, ativo)
       VALUES (gen_random_uuid(),$1,$2,$3,$4,$5) RETURNING *`,
      [p.name, p.duration, p.durationUnit, p.description, p.active ?? true]
    );
    res.status(201).json(rowToPause(rows[0]));
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.put('/:id', async (req, res) => {
  const p = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE pausas_padrao SET nome=$1, duracao=$2, unidade_duracao=$3, descricao=$4, ativo=$5
       WHERE id=$6 RETURNING *`,
      [p.name, p.duration, p.durationUnit, p.description, p.active ?? true, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Não encontrado' });
    res.json(rowToPause(rows[0]));
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM pausas_padrao WHERE id=$1', [req.params.id]);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
