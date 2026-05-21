import { Router } from 'express';
import { pool } from '../db.js';
import { registrarAuditoria } from '../lib/auditoria.js';

const router = Router();

function rowToCompany(r: any) {
  return {
    id: r.id,
    razaoSocial: r.razao_social,
    nomeFantasia: r.nome_fantasia ?? '',
    cnpj: r.cnpj ?? '',
    logradouro: r.logradouro ?? '',
    numero: r.numero ?? '',
    complemento: r.complemento ?? '',
    bairro: r.bairro ?? '',
    municipio: r.municipio ?? '',
    uf: r.uf ?? '',
    cep: r.cep ?? '',
    product: r.produto ?? '',
    marketSituation: r.situacao_mercado ?? '',
    productionLocation: r.local_producao ?? '',
    riskDegree: r.grau_risco ?? '',
    logoDataUrl: r.logo_url ?? '',
    active: r.ativo ?? true,
  };
}

router.get('/', async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM empresas WHERE ativo ORDER BY razao_social');
    res.json(rows.map(rowToCompany));
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.post('/', async (req, res) => {
  const c = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO empresas (id, razao_social, nome_fantasia, cnpj, logradouro, numero, complemento,
        bairro, municipio, uf, cep, produto, situacao_mercado, local_producao, grau_risco, logo_url, ativo)
       VALUES (gen_random_uuid(),$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
       RETURNING *`,
      [c.razaoSocial, c.nomeFantasia, c.cnpj, c.logradouro, c.numero, c.complemento,
       c.bairro, c.municipio, c.uf, c.cep, c.product, c.marketSituation,
       c.productionLocation, c.riskDegree, c.logoDataUrl, c.active ?? true]
    );
    await registrarAuditoria(req, 'CRIAÇÃO', 'empresas', rows[0].id, `Empresa criada: ${rows[0].razao_social}`);
    res.status(201).json(rowToCompany(rows[0]));
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.put('/:id', async (req, res) => {
  const c = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE empresas SET razao_social=$1, nome_fantasia=$2, cnpj=$3, logradouro=$4, numero=$5,
        complemento=$6, bairro=$7, municipio=$8, uf=$9, cep=$10, produto=$11,
        situacao_mercado=$12, local_producao=$13, grau_risco=$14, logo_url=$15, ativo=$16
       WHERE id=$17 RETURNING *`,
      [c.razaoSocial, c.nomeFantasia, c.cnpj, c.logradouro, c.numero, c.complemento,
       c.bairro, c.municipio, c.uf, c.cep, c.product, c.marketSituation,
       c.productionLocation, c.riskDegree, c.logoDataUrl, c.active ?? true, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Não encontrado' });
    await registrarAuditoria(req, 'EDIÇÃO', 'empresas', req.params.id, `Empresa editada: ${rows[0].razao_social}`);
    res.json(rowToCompany(rows[0]));
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'UPDATE empresas SET ativo = FALSE WHERE id=$1 AND ativo RETURNING *',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Não encontrado' });
    await registrarAuditoria(req, 'EXCLUSÃO', 'empresas', req.params.id, `Empresa desativada: ${rows[0].razao_social}`);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
