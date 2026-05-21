import { Router } from 'express';
import { pool } from '../db.js';
import { registrarAuditoria } from '../lib/auditoria.js';

const router = Router();

function rowToEPI(r: any) {
  return {
    id: r.id,
    name: r.nome,
    type: r.tipo ?? '',
    description: r.descricao ?? '',
    mandatoryByDefault: r.obrigatorio_padrao ?? false,
    active: r.ativo ?? true,
  };
}

router.get('/', async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM epis WHERE ativo ORDER BY nome');
    res.json(rows.map(rowToEPI));
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.post('/', async (req, res) => {
  const e = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO epis (id, nome, tipo, descricao, obrigatorio_padrao, ativo)
       VALUES (gen_random_uuid(),$1,$2,$3,$4,$5) RETURNING *`,
      [e.name, e.type, e.description, e.mandatoryByDefault ?? false, e.active ?? true]
    );
    await registrarAuditoria(req, 'CRIAÇÃO', 'epis', rows[0].id, `EPI criado: ${rows[0].nome}`);
    res.status(201).json(rowToEPI(rows[0]));
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.put('/:id', async (req, res) => {
  const e = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE epis SET nome=$1, tipo=$2, descricao=$3, obrigatorio_padrao=$4, ativo=$5
       WHERE id=$6 RETURNING *`,
      [e.name, e.type, e.description, e.mandatoryByDefault ?? false, e.active ?? true, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Não encontrado' });
    await registrarAuditoria(req, 'EDIÇÃO', 'epis', req.params.id, `EPI editado: ${rows[0].nome}`);
    res.json(rowToEPI(rows[0]));
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'UPDATE epis SET ativo = FALSE WHERE id=$1 AND ativo RETURNING *',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Não encontrado' });
    await registrarAuditoria(req, 'EXCLUSÃO', 'epis', req.params.id, `EPI desativado: ${rows[0].nome}`);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
