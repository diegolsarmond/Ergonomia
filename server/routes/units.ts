import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

function rowToUnit(r: any) {
  return {
    id: r.id,
    companyId: r.empresa_id ?? '',
    name: r.nome,
    cep: r.cep ?? '',
    logradouro: r.logradouro ?? '',
    numero: r.numero ?? '',
    complemento: r.complemento ?? '',
    bairro: r.bairro ?? '',
    city: r.cidade ?? '',
    uf: r.uf ?? '',
    address: r.endereco ?? '',
    productionLocation: r.local_producao ?? '',
    logoDataUrl: r.logo_url ?? '',
  };
}

router.get('/', async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM unidades ORDER BY nome');
    res.json(rows.map(rowToUnit));
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.post('/', async (req, res) => {
  const u = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO unidades (id, empresa_id, nome, cep, logradouro, numero, complemento,
        bairro, cidade, uf, endereco, local_producao, logo_url)
       VALUES (gen_random_uuid(),$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       RETURNING *`,
      [u.companyId || null, u.name, u.cep, u.logradouro, u.numero, u.complemento,
       u.bairro, u.city, u.uf, u.address, u.productionLocation, u.logoDataUrl]
    );
    res.status(201).json(rowToUnit(rows[0]));
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.put('/:id', async (req, res) => {
  const u = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE unidades SET empresa_id=$1, nome=$2, cep=$3, logradouro=$4, numero=$5,
        complemento=$6, bairro=$7, cidade=$8, uf=$9, endereco=$10,
        local_producao=$11, logo_url=$12
       WHERE id=$13 RETURNING *`,
      [u.companyId || null, u.name, u.cep, u.logradouro, u.numero, u.complemento,
       u.bairro, u.city, u.uf, u.address, u.productionLocation, u.logoDataUrl, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Não encontrado' });
    res.json(rowToUnit(rows[0]));
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM unidades WHERE id=$1', [req.params.id]);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
