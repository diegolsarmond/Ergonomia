import { Router } from 'express';
import { pool } from '../db.js';
import { registrarAuditoria } from '../lib/auditoria.js';

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
    const { rows } = await pool.query('SELECT * FROM setores WHERE ativo ORDER BY nome');
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
    await registrarAuditoria(req, 'CRIAÇÃO', 'setores', rows[0].id, `Setor criado: ${rows[0].nome}`);
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
    await registrarAuditoria(req, 'EDIÇÃO', 'setores', req.params.id, `Setor editado: ${rows[0].nome}`);
    res.json(rowToSector(rows[0]));
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'UPDATE setores SET ativo = FALSE WHERE id=$1 AND ativo RETURNING *',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Não encontrado' });
    await registrarAuditoria(req, 'EXCLUSÃO', 'setores', req.params.id, `Setor desativado: ${rows[0].nome}`);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
