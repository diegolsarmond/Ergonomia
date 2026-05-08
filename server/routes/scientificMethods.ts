import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

async function rowToMethod(r: any) {
  const { rows: imgs } = await pool.query(
    'SELECT imagem_url FROM modelo_metodo_cientifico_imagens WHERE modelo_id=$1 ORDER BY ordem',
    [r.id]
  );
  return {
    id: r.id,
    name: r.nome,
    description: r.descricao ?? '',
    imageDataUrls: imgs.map((i: any) => i.imagem_url),
  };
}

router.get('/', async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM modelos_metodo_cientifico ORDER BY nome');
    const result = await Promise.all(rows.map(rowToMethod));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.post('/', async (req, res) => {
  const m = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      `INSERT INTO modelos_metodo_cientifico (id, nome, descricao) VALUES (gen_random_uuid(),$1,$2) RETURNING *`,
      [m.name, m.description]
    );
    const id = rows[0].id;
    const imgs: string[] = m.imageDataUrls ?? [];
    for (let i = 0; i < imgs.length; i++)
      await client.query(
        'INSERT INTO modelo_metodo_cientifico_imagens (modelo_id, imagem_url, ordem) VALUES ($1,$2,$3)',
        [id, imgs[i], i + 1]
      );
    await client.query('COMMIT');
    res.status(201).json(await rowToMethod(rows[0]));
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: String(err) });
  } finally {
    client.release();
  }
});

router.put('/:id', async (req, res) => {
  const m = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      `UPDATE modelos_metodo_cientifico SET nome=$1, descricao=$2 WHERE id=$3 RETURNING *`,
      [m.name, m.description, req.params.id]
    );
    if (!rows.length) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'Não encontrado' }); }
    await client.query('DELETE FROM modelo_metodo_cientifico_imagens WHERE modelo_id=$1', [req.params.id]);
    const imgs: string[] = m.imageDataUrls ?? [];
    for (let i = 0; i < imgs.length; i++)
      await client.query(
        'INSERT INTO modelo_metodo_cientifico_imagens (modelo_id, imagem_url, ordem) VALUES ($1,$2,$3)',
        [req.params.id, imgs[i], i + 1]
      );
    await client.query('COMMIT');
    res.json(await rowToMethod(rows[0]));
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: String(err) });
  } finally {
    client.release();
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM modelos_metodo_cientifico WHERE id=$1', [req.params.id]);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
