import { Router } from 'express';
import { pool } from '../db.js';
import { registrarAuditoria } from '../lib/auditoria.js';

const router = Router();

async function rowToQuestion(r: any) {
  const { rows: funcs } = await pool.query(
    'SELECT nome_funcao FROM checklist_pergunta_funcoes WHERE pergunta_id=$1',
    [r.id]
  );
  return {
    id: r.id,
    text: r.texto,
    functionIds: funcs.map((f: any) => f.nome_funcao),
  };
}

router.get('/', async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM perguntas_checklist WHERE ativo ORDER BY texto');
    const result = await Promise.all(rows.map(rowToQuestion));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.post('/', async (req, res) => {
  const q = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      `INSERT INTO perguntas_checklist (id, texto) VALUES (gen_random_uuid(),$1) RETURNING *`,
      [q.text]
    );
    const id = rows[0].id;
    const fIds: string[] = q.functionIds ?? [];
    for (const fId of fIds)
      await client.query(
        'INSERT INTO checklist_pergunta_funcoes (pergunta_id, nome_funcao) VALUES ($1,$2) ON CONFLICT DO NOTHING',
        [id, fId]
      );
    await registrarAuditoria(req, 'CRIAÇÃO', 'perguntas_checklist', id, `Pergunta de checklist criada: ${rows[0].texto?.substring(0, 60)}`, client);
    await client.query('COMMIT');
    res.status(201).json(await rowToQuestion(rows[0]));
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: String(err) });
  } finally {
    client.release();
  }
});

router.put('/:id', async (req, res) => {
  const q = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      `UPDATE perguntas_checklist SET texto=$1 WHERE id=$2 RETURNING *`,
      [q.text, req.params.id]
    );
    if (!rows.length) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'Não encontrado' }); }
    await client.query('DELETE FROM checklist_pergunta_funcoes WHERE pergunta_id=$1', [req.params.id]);
    const fIds: string[] = q.functionIds ?? [];
    for (const fId of fIds)
      await client.query(
        'INSERT INTO checklist_pergunta_funcoes (pergunta_id, nome_funcao) VALUES ($1,$2)',
        [req.params.id, fId]
      );
    await registrarAuditoria(req, 'EDIÇÃO', 'perguntas_checklist', req.params.id, `Pergunta de checklist editada: ${rows[0].texto?.substring(0, 60)}`, client);
    await client.query('COMMIT');
    res.json(await rowToQuestion(rows[0]));
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: String(err) });
  } finally {
    client.release();
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'UPDATE perguntas_checklist SET ativo = FALSE WHERE id=$1 AND ativo RETURNING *',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Não encontrado' });
    await registrarAuditoria(req, 'EXCLUSÃO', 'perguntas_checklist', req.params.id, `Pergunta de checklist desativada: ${rows[0].texto?.substring(0, 60)}`);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
