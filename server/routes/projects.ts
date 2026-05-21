/**
 * Fachada /api/projects — delega para os handlers AEP/AET de acordo com reportType.
 * Mantém compatibilidade total com o frontend existente (mesmo contrato JSON).
 */
import { Router } from 'express';
import type { PoolClient } from 'pg';
import { pool } from '../db.js';
import { saveAEP, loadAllAEP } from './aep.js';
import { saveAET, loadAllAET } from './aet.js';
import { registrarAuditoria } from '../lib/auditoria.js';

const router = Router();

// ─── GET /api/projects — AEP + AET combinados ────────────────────────────────

router.get('/', async (_req, res) => {
  const client = await pool.connect();
  try {
    const [aepList, aetList] = await Promise.all([
      loadAllAEP(client),
      loadAllAET(client),
    ]);
    res.json([...aepList, ...aetList]);
  } catch (err) {
    console.error('GET /api/projects error:', err);
    res.status(500).json({ error: String(err) });
  } finally {
    client.release();
  }
});

// ─── POST /api/projects — cria em AEP ou AET conforme reportType ─────────────

router.post('/', async (req, res) => {
  const project = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    if (project?.reportType === 'AET') {
      await saveAET(client, project);
    } else {
      await saveAEP(client, project);
    }
    const tabela = project?.reportType === 'AET' ? 'aet_projetos' : 'aep_projetos';
    await registrarAuditoria(req, 'CRIAÇÃO', tabela, project.id ?? '', `Projeto criado: ${project.companyName ?? project.nomeEmpresa ?? ''}`, client);
    await client.query('COMMIT');
    res.status(201).json(project);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('POST /api/projects error:', err);
    res.status(500).json({ error: String(err) });
  } finally {
    client.release();
  }
});

// ─── PUT /api/projects/:id — atualiza em AEP ou AET conforme reportType ──────

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

router.put('/:id', async (req, res) => {
  if (!UUID_RE.test(req.params.id)) {
    res.status(400).json({ error: 'ID de projeto inválido' });
    return;
  }
  const project = { ...req.body, id: req.params.id };
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    if (project?.reportType === 'AET') {
      await saveAET(client, project);
    } else {
      await saveAEP(client, project);
    }
    const tabela = project?.reportType === 'AET' ? 'aet_projetos' : 'aep_projetos';
    await registrarAuditoria(req, 'EDIÇÃO', tabela, req.params.id, `Projeto editado: ${project.companyName ?? project.nomeEmpresa ?? ''}`, client);
    await client.query('COMMIT');
    res.json(project);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('PUT /api/projects error:', err);
    res.status(500).json({ error: String(err) });
  } finally {
    client.release();
  }
});

// ─── DELETE /api/projects/:id — inativa em ambas as tabelas ──────────────────

router.delete('/:id', async (req, res) => {
  const id = req.params.id;
  const client: PoolClient = await pool.connect();
  try {
    await client.query('BEGIN');
    const [ra, rb] = await Promise.all([
      client.query('UPDATE aep_projetos SET ativo = FALSE WHERE id=$1 AND ativo RETURNING id, nome_empresa', [id]),
      client.query('UPDATE aet_projetos SET ativo = FALSE WHERE id=$1 AND ativo RETURNING id, nome_empresa', [id]),
    ]);
    await client.query('COMMIT');

    const aepRow = ra.rows[0];
    const aetRow = rb.rows[0];
    const inativado = aepRow ?? aetRow;

    if (!inativado) return res.status(404).json({ error: 'Projeto não encontrado' });

    const tabela = aepRow ? 'aep_projetos' : 'aet_projetos';
    await registrarAuditoria(req, 'EXCLUSÃO', tabela, id, `Projeto desativado: ${inativado.nome_empresa ?? ''}`);
    res.status(204).end();
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('DELETE /api/projects error:', err);
    res.status(500).json({ error: String(err) });
  } finally {
    client.release();
  }
});

export default router;
