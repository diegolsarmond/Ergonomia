import { Router } from 'express';
import { pool } from '../db.js';
import { registrarAuditoria } from '../lib/auditoria.js';

const router = Router();

async function rowToQuestion(r: any) {
  const { rows: opts } = await pool.query(
    'SELECT texto_opcao FROM pergunta_entrevista_opcoes WHERE pergunta_id=$1 ORDER BY ordem',
    [r.id]
  );
  return {
    id: r.id,
    question: r.pergunta,
    category: r.categoria ?? '',
    responseType: r.tipo_resposta ?? 'texto',
    required: r.obrigatorio ?? false,
    order: r.ordem ?? 0,
    active: r.ativo ?? true,
    options: opts.map((o: any) => o.texto_opcao),
  };
}

router.get('/', async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM perguntas_entrevista WHERE ativo ORDER BY ordem');
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
      `INSERT INTO perguntas_entrevista (id, pergunta, categoria, tipo_resposta, obrigatorio, ordem, ativo)
       VALUES (gen_random_uuid(),$1,$2,$3,$4,$5,$6) RETURNING *`,
      [q.question, q.category, q.responseType, q.required ?? false, q.order ?? 0, q.active ?? true]
    );
    const id = rows[0].id;
    const options: string[] = q.options ?? [];
    for (let i = 0; i < options.length; i++)
      await client.query(
        'INSERT INTO pergunta_entrevista_opcoes (pergunta_id, texto_opcao, ordem) VALUES ($1,$2,$3)',
        [id, options[i], i + 1]
      );
    await registrarAuditoria(req, 'CRIAÇÃO', 'perguntas_entrevista', id, `Pergunta criada: ${rows[0].pergunta?.substring(0, 60)}`, client);
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
      `UPDATE perguntas_entrevista SET pergunta=$1, categoria=$2, tipo_resposta=$3,
        obrigatorio=$4, ordem=$5, ativo=$6 WHERE id=$7 RETURNING *`,
      [q.question, q.category, q.responseType, q.required ?? false, q.order ?? 0, q.active ?? true, req.params.id]
    );
    if (!rows.length) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'Não encontrado' }); }
    await client.query('DELETE FROM pergunta_entrevista_opcoes WHERE pergunta_id=$1', [req.params.id]);
    const options: string[] = q.options ?? [];
    for (let i = 0; i < options.length; i++)
      await client.query(
        'INSERT INTO pergunta_entrevista_opcoes (pergunta_id, texto_opcao, ordem) VALUES ($1,$2,$3)',
        [req.params.id, options[i], i + 1]
      );
    await registrarAuditoria(req, 'EDIÇÃO', 'perguntas_entrevista', req.params.id, `Pergunta editada: ${rows[0].pergunta?.substring(0, 60)}`, client);
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
      'UPDATE perguntas_entrevista SET ativo = FALSE WHERE id=$1 AND ativo RETURNING *',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Não encontrado' });
    await registrarAuditoria(req, 'EXCLUSÃO', 'perguntas_entrevista', req.params.id, `Pergunta desativada: ${rows[0].pergunta?.substring(0, 60)}`);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
