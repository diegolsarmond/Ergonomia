import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

function rowToText(r: any) {
  return { id: r.id, section: r.secao, title: r.titulo, text: r.texto, active: r.ativo ?? true };
}

router.get('/', async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM modelos_texto_relatorio ORDER BY secao, titulo');
    res.json(rows.map(rowToText));
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.post('/', async (req, res) => {
  const t = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO modelos_texto_relatorio (id, secao, titulo, texto, ativo)
       VALUES (gen_random_uuid(),$1,$2,$3,$4) RETURNING *`,
      [t.section, t.title, t.text, t.active ?? true]
    );
    res.status(201).json(rowToText(rows[0]));
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.put('/:id', async (req, res) => {
  const t = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE modelos_texto_relatorio SET secao=$1, titulo=$2, texto=$3, ativo=$4 WHERE id=$5 RETURNING *`,
      [t.section, t.title, t.text, t.active ?? true, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Não encontrado' });
    res.json(rowToText(rows[0]));
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM modelos_texto_relatorio WHERE id=$1', [req.params.id]);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
