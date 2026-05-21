import { Router } from 'express';
import { pool } from '../db.js';
import { registrarAuditoria } from '../lib/auditoria.js';

const router = Router();

function rowToText(r: any) {
  return { id: r.id, section: r.secao, title: r.titulo, text: r.texto, active: r.ativo ?? true };
}

router.get('/', async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM modelos_texto_relatorio WHERE ativo ORDER BY secao, titulo');
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
    await registrarAuditoria(req, 'CRIAÇÃO', 'modelos_texto_relatorio', rows[0].id, `Texto de relatório criado: ${rows[0].titulo}`);
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
    await registrarAuditoria(req, 'EDIÇÃO', 'modelos_texto_relatorio', req.params.id, `Texto de relatório editado: ${rows[0].titulo}`);
    res.json(rowToText(rows[0]));
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'UPDATE modelos_texto_relatorio SET ativo = FALSE WHERE id=$1 AND ativo RETURNING *',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Não encontrado' });
    await registrarAuditoria(req, 'EXCLUSÃO', 'modelos_texto_relatorio', req.params.id, `Texto de relatório desativado: ${rows[0].titulo}`);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
