import { Router } from 'express';
import { pool } from '../db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { registrarAuditoria, type AcaoAuditoria } from '../lib/auditoria.js';

const router = Router();

router.use(requireAuth);

// Qualquer usuário autenticado pode registrar uma ação de auditoria
router.post('/', async (req, res) => {
  const { acao, tabela, registroId, descricao } = req.body as {
    acao: AcaoAuditoria;
    tabela: string;
    registroId: string;
    descricao: string;
  };

  const acoesPermitidas: AcaoAuditoria[] = [
    'CRIAÇÃO','EDIÇÃO','EXCLUSÃO','INATIVAÇÃO','ATIVAÇÃO',
    'BLOQUEIO','DESBLOQUEIO','EXPORTAÇÃO','IMPRESSÃO',
  ];

  if (!acao || !acoesPermitidas.includes(acao)) {
    return res.status(400).json({ error: 'Ação inválida.' });
  }
  if (!tabela || !registroId) {
    return res.status(400).json({ error: 'tabela e registroId são obrigatórios.' });
  }

  try {
    await registrarAuditoria(req, acao, tabela, registroId, descricao ?? '');
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// Somente admin pode consultar o log completo
router.get('/', requireAdmin, async (req, res) => {
  const {
    tabela, registroId, usuarioId, acao,
    dataInicio, dataFim,
    limit = '50', offset = '0',
  } = req.query as Record<string, string>;

  const conditions: string[] = [];
  const params: unknown[] = [];
  let i = 1;

  if (tabela) { conditions.push(`tabela = $${i++}`); params.push(tabela); }
  if (registroId) { conditions.push(`registro_id = $${i++}`); params.push(registroId); }
  if (usuarioId) { conditions.push(`usuario_id = $${i++}`); params.push(usuarioId); }
  if (acao) { conditions.push(`acao = $${i++}`); params.push(acao); }
  if (dataInicio) { conditions.push(`data_hora >= $${i++}`); params.push(dataInicio); }
  if (dataFim) { conditions.push(`data_hora <= $${i++}`); params.push(dataFim + 'T23:59:59.999Z'); }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const lim = Math.min(Number(limit) || 50, 500);
  const off = Number(offset) || 0;

  try {
    const [dataRes, countRes] = await Promise.all([
      pool.query(
        `SELECT id, data_hora, usuario_id, usuario_nome, acao, tabela, registro_id, descricao
         FROM auditoria
         ${where}
         ORDER BY data_hora DESC
         LIMIT $${i} OFFSET $${i + 1}`,
        [...params, lim, off],
      ),
      pool.query(
        `SELECT COUNT(*) FROM auditoria ${where}`,
        params,
      ),
    ]);

    res.json({ rows: dataRes.rows, total: Number(countRes.rows[0].count) });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
