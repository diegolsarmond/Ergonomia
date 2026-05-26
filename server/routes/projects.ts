/**
 * Fachada /api/projects — delega para os handlers AEP/AET de acordo com reportType.
 * Mantém compatibilidade total com o frontend existente (mesmo contrato JSON).
 */
import { Router } from 'express';
import type { PoolClient } from 'pg';
import { pool } from '../db.js';
import { saveAEP, loadAllAEP, loadSingleAEP } from './aep.js';
import { saveAET, loadAllAET, loadSingleAET } from './aet.js';
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

function normalizarValor(v: any): string {
  if (v == null) return '';
  if (v instanceof Date) return v.toISOString().split('T')[0];
  const s = String(v);
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.substring(0, 10);
  if (s.includes('T')) return s.split('T')[0];
  return s;
}

const CAMPOS_FUNCAO: Array<[string, string, string]> = [
  ['Nº de Colaboradores', 'num_funcionarios', 'numEmployees'],
  ['Nome da Função',       'nome_funcao',      'name'],
];

async function listarAlteracoes(client: PoolClient, project: any): Promise<string[]> {
  const tabela = project?.reportType === 'AET' ? 'aet_projetos' : 'aep_projetos';
  const tabelaFuncoes = project?.reportType === 'AET' ? 'aet_funcoes' : 'aep_funcoes';
  const empresa = project.companyName ?? project.nomeEmpresa ?? '';

  const [{ rows: headerRows }, { rows: funcDetailsRows }] = await Promise.all([
    client.query(
      `SELECT nome_empresa, nome_fantasia, cnpj, endereco, unidade, produto,
              grau_risco, nome_avaliador, data
       FROM ${tabela} WHERE id=$1`,
      [project.id]
    ),
    client.query(
      `SELECT id, ${CAMPOS_FUNCAO.map(([, db]) => db).join(', ')} FROM ${tabelaFuncoes} WHERE projeto_id=$1`,
      [project.id]
    ),
  ]);

  if (!headerRows.length) return [`Projeto criado: ${empresa}`];

  const antigo = headerRows[0];
  const alteracoes: string[] = [];

  // Campos do cabeçalho do projeto
  for (const [label, dbField, jsField] of CAMPOS_HEADER) {
    const valAntigo = normalizarValor(antigo[dbField]);
    const valNovo   = normalizarValor(project[jsField]);
    if (valAntigo !== valNovo) {
      alteracoes.push(`Campo "${label}" alterado de "${valAntigo}" para "${valNovo}"`);
    }
  }

  // Quantidade de funções
  const qtdFuncoesAntigas: number = funcDetailsRows.length;
  const qtdFuncoesNovas: number   = (project.functions ?? []).length;
  if (qtdFuncoesAntigas !== qtdFuncoesNovas) {
    alteracoes.push(`Campo "Funções" alterado de "${qtdFuncoesAntigas}" para "${qtdFuncoesNovas}"`);
  }

  // Campos por função (apenas funções já existentes no banco)
  const funcMap = new Map<string, any>();
  for (const f of funcDetailsRows) funcMap.set(f.id, f);

  for (const f of (project.functions ?? [])) {
    const existing = funcMap.get(f.id);
    if (!existing) continue;
    const funcLabel = f.name || existing.nome_funcao || f.id;

    for (const [label, dbField, jsField] of CAMPOS_FUNCAO) {
      const valAntigo = normalizarValor(existing[dbField]);
      const valNovo   = normalizarValor(f[jsField]);
      if (valAntigo !== valNovo) {
        alteracoes.push(`Campo "${label}" na função "${funcLabel}" alterado de "${valAntigo}" para "${valNovo}"`);
      }
    }
  }

  if (!alteracoes.length) return [`Projeto editado sem alterações nos campos: ${empresa}`];
  return alteracoes;
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

// ─── GET /api/projects/:id — busca detalhes completos de um projeto AEP ou AET ─

router.get('/:id', async (req, res) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(req.params.id)) {
    res.status(400).json({ error: 'ID de projeto inválido' });
    return;
  }
  const client = await pool.connect();
  try {
    const aepProject = await loadSingleAEP(client, req.params.id);
    if (aepProject) {
      res.json(aepProject);
      return;
    }
    const aetProject = await loadSingleAET(client, req.params.id);
    if (aetProject) {
      res.json(aetProject);
      return;
    }
    res.status(404).json({ error: 'Projeto não encontrado' });
  } catch (err) {
    console.error('GET /api/projects/:id error:', err);
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
    const alteracoes = await listarAlteracoes(client, project);
    if (project?.reportType === 'AET') {
      await saveAET(client, project);
    } else {
      await saveAEP(client, project);
    }
    const tabela = project?.reportType === 'AET' ? 'aet_projetos' : 'aep_projetos';
    for (const descricao of alteracoes) {
      await registrarAuditoria(req, 'EDIÇÃO', tabela, req.params.id, descricao, client);
    }
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
