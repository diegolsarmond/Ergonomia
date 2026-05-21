import { Router } from 'express';
import { pool } from '../db.js';
import { registrarAuditoria } from '../lib/auditoria.js';

const router = Router();

async function rowToFactor(r: any) {
  const { rows: cats } = await pool.query(
    'SELECT categoria FROM fator_risco_biomecanico_categorias WHERE fator_id=$1',
    [r.id]
  );
  return {
    id: r.id,
    name: r.nome,
    active: r.ativo ?? true,
    biomechanicalFactors: cats.map((c: any) => c.categoria),
  };
}

router.get('/', async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM fatores_risco_biomecanico WHERE ativo ORDER BY nome');
    const result = await Promise.all(rows.map(rowToFactor));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.post('/', async (req, res) => {
  const f = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      `INSERT INTO fatores_risco_biomecanico (id, nome, ativo) VALUES (gen_random_uuid(),$1,$2) RETURNING *`,
      [f.name, f.active ?? true]
    );
    const id = rows[0].id;
    const cats: string[] = f.biomechanicalFactors ?? [];
    for (const cat of cats)
      await client.query(
        'INSERT INTO fator_risco_biomecanico_categorias (fator_id, categoria) VALUES ($1,$2) ON CONFLICT DO NOTHING',
        [id, cat]
      );
    await registrarAuditoria(req, 'CRIAÇÃO', 'fatores_risco_biomecanico', id, `Fator de risco criado: ${rows[0].nome}`, client);
    await client.query('COMMIT');
    res.status(201).json(await rowToFactor(rows[0]));
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: String(err) });
  } finally {
    client.release();
  }
});

router.put('/:id', async (req, res) => {
  const f = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      `UPDATE fatores_risco_biomecanico SET nome=$1, ativo=$2 WHERE id=$3 RETURNING *`,
      [f.name, f.active ?? true, req.params.id]
    );
    if (!rows.length) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'Não encontrado' }); }
    await client.query('DELETE FROM fator_risco_biomecanico_categorias WHERE fator_id=$1', [req.params.id]);
    const cats: string[] = f.biomechanicalFactors ?? [];
    for (const cat of cats)
      await client.query(
        'INSERT INTO fator_risco_biomecanico_categorias (fator_id, categoria) VALUES ($1,$2)',
        [req.params.id, cat]
      );
    await registrarAuditoria(req, 'EDIÇÃO', 'fatores_risco_biomecanico', req.params.id, `Fator de risco editado: ${rows[0].nome}`, client);
    await client.query('COMMIT');
    res.json(await rowToFactor(rows[0]));
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
      'UPDATE fatores_risco_biomecanico SET ativo = FALSE WHERE id=$1 AND ativo RETURNING *',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Não encontrado' });
    await registrarAuditoria(req, 'EXCLUSÃO', 'fatores_risco_biomecanico', req.params.id, `Fator de risco desativado: ${rows[0].nome}`);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
