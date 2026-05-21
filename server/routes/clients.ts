import { Router } from 'express';
import { pool } from '../db.js';
import { registrarAuditoria } from '../lib/auditoria.js';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const { rows } = await pool.query(`SELECT dados FROM aet_clientes WHERE ativo ORDER BY dados->>'companyName'`);
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
    await registrarAuditoria(req, 'CRIAÇÃO', 'aet_clientes', client.id, `Cliente criado: ${client.companyName ?? ''}`);
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
    await registrarAuditoria(req, 'EDIÇÃO', 'aet_clientes', req.params.id, `Cliente editado: ${client.companyName ?? ''}`);
    res.json(client);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `UPDATE aet_clientes SET ativo = FALSE WHERE id=$1 AND ativo RETURNING id, dados->>'companyName' AS company_name`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Não encontrado' });
    await registrarAuditoria(req, 'EXCLUSÃO', 'aet_clientes', req.params.id, `Cliente desativado: ${rows[0].company_name ?? ''}`);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
