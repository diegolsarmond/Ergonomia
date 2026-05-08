import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

function rowToSector(r: any) {
  return {
    id: r.id,
    companyId: r.empresa_id ?? '',
    unitId: r.unidade_id ?? '',
    name: r.nome,
    description: r.descricao ?? '',
    active: r.ativo ?? true,
  };
}

router.get('/', async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM setores ORDER BY nome');
    res.json(rows.map(rowToSector));
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.post('/', async (req, res) => {
  const s = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO setores (id, empresa_id, unidade_id, nome, descricao, ativo)
       VALUES (gen_random_uuid(),$1,$2,$3,$4,$5) RETURNING *`,
      [s.companyId || null, s.unitId || null, s.name, s.description, s.active ?? true]
    );
    res.status(201).json(rowToSector(rows[0]));
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.put('/:id', async (req, res) => {
  const s = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE setores SET empresa_id=$1, unidade_id=$2, nome=$3, descricao=$4, ativo=$5
       WHERE id=$6 RETURNING *`,
      [s.companyId || null, s.unitId || null, s.name, s.description, s.active ?? true, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Não encontrado' });
    res.json(rowToSector(rows[0]));
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM setores WHERE id=$1', [req.params.id]);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
