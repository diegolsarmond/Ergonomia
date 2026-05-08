import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

async function rowToJobRole(r: any) {
  const epiRes = await pool.query('SELECT epi_id FROM cargo_epis WHERE cargo_id=$1', [r.id]);
  const eqRes  = await pool.query('SELECT equipamento_id FROM cargo_equipamentos WHERE cargo_id=$1', [r.id]);
  return {
    id: r.id,
    companyId: r.empresa_id ?? '',
    sectorId: r.setor_id ?? '',
    parentRoleId: r.cargo_pai_id ?? '',
    name: r.nome,
    cbo: r.cbo ?? '',
    description: r.descricao ?? '',
    active: r.ativo ?? true,
    epiIds: epiRes.rows.map((x: any) => x.epi_id),
    equipmentIds: eqRes.rows.map((x: any) => x.equipamento_id),
  };
}

router.get('/', async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM cargos_padrao ORDER BY nome');
    const result = await Promise.all(rows.map(rowToJobRole));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.post('/', async (req, res) => {
  const r = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      `INSERT INTO cargos_padrao (id, empresa_id, setor_id, cargo_pai_id, nome, cbo, descricao, ativo)
       VALUES (gen_random_uuid(),$1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [r.companyId || null, r.sectorId || null, r.parentRoleId || null,
       r.name, r.cbo, r.description, r.active ?? true]
    );
    const id = rows[0].id;
    if (r.epiIds?.length) {
      for (const epiId of r.epiIds)
        await client.query('INSERT INTO cargo_epis (cargo_id, epi_id) VALUES ($1,$2) ON CONFLICT DO NOTHING', [id, epiId]);
    }
    if (r.equipmentIds?.length) {
      for (const eqId of r.equipmentIds)
        await client.query('INSERT INTO cargo_equipamentos (cargo_id, equipamento_id) VALUES ($1,$2) ON CONFLICT DO NOTHING', [id, eqId]);
    }
    await client.query('COMMIT');
    res.status(201).json(await rowToJobRole(rows[0]));
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: String(err) });
  } finally {
    client.release();
  }
});

router.put('/:id', async (req, res) => {
  const r = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      `UPDATE cargos_padrao SET empresa_id=$1, setor_id=$2, cargo_pai_id=$3, nome=$4,
        cbo=$5, descricao=$6, ativo=$7 WHERE id=$8 RETURNING *`,
      [r.companyId || null, r.sectorId || null, r.parentRoleId || null,
       r.name, r.cbo, r.description, r.active ?? true, req.params.id]
    );
    if (!rows.length) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'Não encontrado' }); }
    const id = req.params.id;
    await client.query('DELETE FROM cargo_epis WHERE cargo_id=$1', [id]);
    await client.query('DELETE FROM cargo_equipamentos WHERE cargo_id=$1', [id]);
    if (r.epiIds?.length) {
      for (const epiId of r.epiIds)
        await client.query('INSERT INTO cargo_epis (cargo_id, epi_id) VALUES ($1,$2)', [id, epiId]);
    }
    if (r.equipmentIds?.length) {
      for (const eqId of r.equipmentIds)
        await client.query('INSERT INTO cargo_equipamentos (cargo_id, equipamento_id) VALUES ($1,$2)', [id, eqId]);
    }
    await client.query('COMMIT');
    res.json(await rowToJobRole(rows[0]));
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: String(err) });
  } finally {
    client.release();
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM cargos_padrao WHERE id=$1', [req.params.id]);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
