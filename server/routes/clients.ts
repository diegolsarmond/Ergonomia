import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT dados FROM aet_clientes ORDER BY dados->>\'companyName\'');
    res.json(rows.map((r: any) => r.dados));
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.post('/', async (req, res) => {
  const client = req.body;
  try {
    await pool.query(
      `INSERT INTO aet_clientes (id, dados) VALUES ($1, $2)
       ON CONFLICT (id) DO UPDATE SET dados=$2`,
      [client.id, JSON.stringify(client)]
    );
    res.status(201).json(client);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.put('/:id', async (req, res) => {
  const client = req.body;
  try {
    const { rowCount } = await pool.query(
      `UPDATE aet_clientes SET dados=$1 WHERE id=$2`,
      [JSON.stringify(client), req.params.id]
    );
    if (!rowCount) return res.status(404).json({ error: 'Não encontrado' });
    res.json(client);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM aet_clientes WHERE id=$1', [req.params.id]);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
