import { Router } from 'express';
import { pool } from '../db.js';
import { registrarAuditoria } from '../lib/auditoria.js';

const router = Router();

function rowToShift(r: any) {
  return { id: r.id, name: r.nome, description: r.descricao ?? '', active: r.ativo ?? true };
}

router.get('/', async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM turnos WHERE ativo ORDER BY nome');
    res.json(rows.map(rowToShift));
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.post('/', async (req, res) => {
  const s = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO turnos (id, nome, descricao, ativo) VALUES (gen_random_uuid(),$1,$2,$3) RETURNING *`,
      [s.name, s.description, s.active ?? true]
    );
    await registrarAuditoria(req, 'CRIAÇÃO', 'turnos', rows[0].id, `Turno criado: ${rows[0].nome}`);
    res.status(201).json(rowToShift(rows[0]));
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.put('/:id', async (req, res) => {
  const s = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE turnos SET nome=$1, descricao=$2, ativo=$3 WHERE id=$4 RETURNING *`,
      [s.name, s.description, s.active ?? true, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Não encontrado' });
    await registrarAuditoria(req, 'EDIÇÃO', 'turnos', req.params.id, `Turno editado: ${rows[0].nome}`);
    res.json(rowToShift(rows[0]));
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'UPDATE turnos SET ativo = FALSE WHERE id=$1 AND ativo RETURNING *',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Não encontrado' });
    await registrarAuditoria(req, 'EXCLUSÃO', 'turnos', req.params.id, `Turno desativado: ${rows[0].nome}`);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
