import { Router } from 'express';
import { pool } from '../db.js';
import { registrarAuditoria } from '../lib/auditoria.js';

const router = Router();

async function rowToEquipment(r: any) {
  const { rows: ops } = await pool.query(
    'SELECT operacao FROM equipamento_operacoes WHERE equipamento_id=$1 ORDER BY ordem',
    [r.id]
  );
  return {
    id: r.id,
    name: r.nome,
    category: r.categoria ?? '',
    description: r.descricao ?? '',
    hasDimensions: r.tem_dimensoes ?? false,
    active: r.ativo ?? true,
    operation: ops.map((o: any) => o.operacao),
  };
}

router.get('/', async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM equipamentos_padrao WHERE ativo ORDER BY nome');
    const result = await Promise.all(rows.map(rowToEquipment));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.post('/', async (req, res) => {
  const e = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      `INSERT INTO equipamentos_padrao (id, nome, categoria, descricao, tem_dimensoes, ativo)
       VALUES (gen_random_uuid(),$1,$2,$3,$4,$5) RETURNING *`,
      [e.name, e.category, e.description, e.hasDimensions ?? false, e.active ?? true]
    );
    const id = rows[0].id;
    const ops: string[] = e.operation ?? [];
    for (let i = 0; i < ops.length; i++)
      await client.query(
        'INSERT INTO equipamento_operacoes (equipamento_id, operacao, ordem) VALUES ($1,$2,$3)',
        [id, ops[i], i + 1]
      );
    await registrarAuditoria(req, 'CRIAÇÃO', 'equipamentos_padrao', id, `Equipamento criado: ${rows[0].nome}`, client);
    await client.query('COMMIT');
    res.status(201).json(await rowToEquipment(rows[0]));
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: String(err) });
  } finally {
    client.release();
  }
});

router.put('/:id', async (req, res) => {
  const e = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      `UPDATE equipamentos_padrao SET nome=$1, categoria=$2, descricao=$3,
        tem_dimensoes=$4, ativo=$5 WHERE id=$6 RETURNING *`,
      [e.name, e.category, e.description, e.hasDimensions ?? false, e.active ?? true, req.params.id]
    );
    if (!rows.length) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'Não encontrado' }); }
    await client.query('DELETE FROM equipamento_operacoes WHERE equipamento_id=$1', [req.params.id]);
    const ops: string[] = e.operation ?? [];
    for (let i = 0; i < ops.length; i++)
      await client.query(
        'INSERT INTO equipamento_operacoes (equipamento_id, operacao, ordem) VALUES ($1,$2,$3)',
        [req.params.id, ops[i], i + 1]
      );
    await registrarAuditoria(req, 'EDIÇÃO', 'equipamentos_padrao', req.params.id, `Equipamento editado: ${rows[0].nome}`, client);
    await client.query('COMMIT');
    res.json(await rowToEquipment(rows[0]));
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
      'UPDATE equipamentos_padrao SET ativo = FALSE WHERE id=$1 AND ativo RETURNING *',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Não encontrado' });
    await registrarAuditoria(req, 'EXCLUSÃO', 'equipamentos_padrao', req.params.id, `Equipamento desativado: ${rows[0].nome}`);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
