import type { Request } from 'express';
import type { PoolClient } from 'pg';
import { pool } from '../db.js';

export type AcaoAuditoria =
  | 'CRIAÇÃO'
  | 'EDIÇÃO'
  | 'EXCLUSÃO'
  | 'INATIVAÇÃO'
  | 'ATIVAÇÃO'
  | 'BLOQUEIO'
  | 'DESBLOQUEIO';

type DbClient = typeof pool | PoolClient;

export async function registrarAuditoria(
  req: Request,
  acao: AcaoAuditoria,
  tabela: string,
  registroId: string,
  descricao: string,
  client?: DbClient,
): Promise<void> {
  const q = client ?? pool;
  const usuarioId: string | null = req.auth?.userId ?? null;
  const usuarioNome: string = req.auth?.nome ?? req.auth?.username ?? 'Não autenticado';

  await q.query(
    `INSERT INTO auditoria (usuario_id, usuario_nome, acao, tabela, registro_id, descricao)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [usuarioId, usuarioNome, acao, tabela, registroId, descricao],
  );
}
