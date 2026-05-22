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

// ─── Helpers de diff para auditoria de edição ─────────────────────────────────

const CAMPOS_HEADER: Array<[string, string, string]> = [
  ['Empresa',        'nome_empresa',   'companyName'],
  ['Nome Fantasia',  'nome_fantasia',  'fantasyName'],
  ['CNPJ',           'cnpj',           'cnpj'],
  ['Endereço',       'endereco',       'address'],
  ['Unidade',        'unidade',        'unit'],
  ['Produto',        'produto',        'product'],
  ['Grau de Risco',  'grau_risco',     'riskDegree'],
  ['Avaliador',      'nome_avaliador', 'evaluatorName'],
  ['Data',           'data',           'date'],
];

async function descricaoEdicao(client: PoolClient, project: any): Promise<string> {
  const tabela = project?.reportType === 'AET' ? 'aet_projetos' : 'aep_projetos';
  const tabelaFuncoes = project?.reportType === 'AET' ? 'aet_funcoes' : 'aep_funcoes';
  const empresa = project.companyName ?? project.nomeEmpresa ?? '';

  const [{ rows: headerRows }, { rows: funcRows }] = await Promise.all([
    client.query(
      `SELECT nome_empresa, nome_fantasia, cnpj, endereco, unidade, produto,
              grau_risco, nome_avaliador, data
       FROM ${tabela} WHERE id=$1`,
      [project.id]
    ),
    client.query(
      `SELECT COUNT(*)::int AS total FROM ${tabelaFuncoes} WHERE projeto_id=$1`,
      [project.id]
    ),
  ]);

  if (!headerRows.length) return `Projeto criado: ${empresa}`;

  const antigo = headerRows[0];
  const alteracoes: string[] = [];

  for (const [label, dbField, jsField] of CAMPOS_HEADER) {
    const valAntigo = antigo[dbField] != null ? String(antigo[dbField]).split('T')[0] : '';
    const valNovo   = project[jsField]  != null ? String(project[jsField]).split('T')[0] : '';
    if (valAntigo !== valNovo) {
      alteracoes.push(`${label}: "${valAntigo}" → "${valNovo}"`);
    }
  }

  const qtdFuncoesAntigas: number = funcRows[0]?.total ?? 0;
  const qtdFuncoesNovas: number   = (project.functions ?? []).length;
  if (qtdFuncoesAntigas !== qtdFuncoesNovas) {
    alteracoes.push(`Funções: ${qtdFuncoesAntigas} → ${qtdFuncoesNovas}`);
  }

  if (!alteracoes.length) return `Projeto editado: ${empresa}`;
  return `Projeto editado: ${empresa}. Alterações — ${alteracoes.join('; ')}`;
}

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
    const descricao = await descricaoEdicao(client, project);
    if (project?.reportType === 'AET') {
      await saveAET(client, project);
    } else {
      await saveAEP(client, project);
    }
    const tabela = project?.reportType === 'AET' ? 'aet_projetos' : 'aep_projetos';
    await registrarAuditoria(req, 'EDIÇÃO', tabela, req.params.id, descricao, client);
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
