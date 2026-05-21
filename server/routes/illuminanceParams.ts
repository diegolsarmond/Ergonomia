import { Router } from 'express';
import { pool } from '../db.js';
import { registrarAuditoria } from '../lib/auditoria.js';

const router = Router();

function rowToParam(r: any) {
  return {
    id: r.id,
    activityDescription: r.descricao_atividade,
    minimumLux: r.lux_minimo,
    minimumIRC: r.irc_minimo,
    tolerancePercent: Number(r.tolerancia_percentual),
    maxUniformityRatio: Number(r.razao_uniformidade_max),
    normativeNotes: '',
    normativeReference: r.referencia_normativa ?? 'ABNT NBR ISO/CIE 8995-1:2013',
    pageReference: r.referencia_pagina ?? '',
    active: r.ativo ?? true,
  };
}

router.get('/', async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM parametros_normativos_iluminancia WHERE ativo ORDER BY descricao_atividade');
    res.json(rows.map(rowToParam));
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.post('/', async (req, res) => {
  const p = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO parametros_normativos_iluminancia
        (id, descricao_atividade, lux_minimo, irc_minimo, tolerancia_percentual, razao_uniformidade_max, referencia_normativa, referencia_pagina)
       VALUES (gen_random_uuid(),$1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [p.activityDescription, p.minimumLux, p.minimumIRC, p.tolerancePercent,
       p.maxUniformityRatio, p.normativeReference ?? 'ABNT NBR ISO/CIE 8995-1:2013', p.pageReference ?? '']
    );
    await registrarAuditoria(req, 'CRIAÇÃO', 'parametros_normativos_iluminancia', rows[0].id, `Parâmetro de iluminância criado: ${rows[0].descricao_atividade}`);
    res.status(201).json(rowToParam(rows[0]));
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.put('/:id', async (req, res) => {
  const p = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE parametros_normativos_iluminancia
       SET descricao_atividade=$1, lux_minimo=$2, irc_minimo=$3, tolerancia_percentual=$4,
           razao_uniformidade_max=$5, referencia_normativa=$6, referencia_pagina=$7
       WHERE id=$8 RETURNING *`,
      [p.activityDescription, p.minimumLux, p.minimumIRC, p.tolerancePercent,
       p.maxUniformityRatio, p.normativeReference ?? 'ABNT NBR ISO/CIE 8995-1:2013',
       p.pageReference ?? '', req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Não encontrado' });
    await registrarAuditoria(req, 'EDIÇÃO', 'parametros_normativos_iluminancia', req.params.id, `Parâmetro de iluminância editado: ${rows[0].descricao_atividade}`);
    res.json(rowToParam(rows[0]));
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'UPDATE parametros_normativos_iluminancia SET ativo = FALSE WHERE id=$1 AND ativo RETURNING *',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Não encontrado' });
    await registrarAuditoria(req, 'EXCLUSÃO', 'parametros_normativos_iluminancia', req.params.id, `Parâmetro de iluminância desativado: ${rows[0].descricao_atividade}`);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
