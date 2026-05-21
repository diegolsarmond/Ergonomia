-- ============================================================
-- MIGRAÇÃO 014 — Auditoria e Soft Delete
-- Substitui remoção física por inativação de status.
-- Rastreia todas as alterações realizadas no sistema.
-- ============================================================

-- ------------------------------------------------------------
-- Tabela de Auditoria
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS auditoria (
  id           SERIAL      PRIMARY KEY,
  data_hora    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  usuario_id   UUID        REFERENCES usuarios(id) ON DELETE SET NULL,
  usuario_nome TEXT        NOT NULL,
  acao         TEXT        NOT NULL
                 CHECK (acao IN ('CRIAÇÃO','EDIÇÃO','EXCLUSÃO','INATIVAÇÃO','ATIVAÇÃO','BLOQUEIO','DESBLOQUEIO')),
  tabela       TEXT        NOT NULL,
  registro_id  TEXT        NOT NULL,
  descricao    TEXT
);

CREATE INDEX IF NOT EXISTS idx_auditoria_data_hora   ON auditoria(data_hora DESC);
CREATE INDEX IF NOT EXISTS idx_auditoria_usuario_id  ON auditoria(usuario_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_tabela      ON auditoria(tabela);
CREATE INDEX IF NOT EXISTS idx_auditoria_registro_id ON auditoria(registro_id);

-- ------------------------------------------------------------
-- Adicionar coluna ativo nas tabelas que não possuem
-- (todos os registros existentes herdam ativo = TRUE)
-- ------------------------------------------------------------
ALTER TABLE unidades
  ADD COLUMN IF NOT EXISTS ativo BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE classificacoes_risco
  ADD COLUMN IF NOT EXISTS ativo BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE modelos_metodo_cientifico
  ADD COLUMN IF NOT EXISTS ativo BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE perguntas_checklist
  ADD COLUMN IF NOT EXISTS ativo BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE parametros_normativos_iluminancia
  ADD COLUMN IF NOT EXISTS ativo BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE aep_projetos
  ADD COLUMN IF NOT EXISTS ativo BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE aet_projetos
  ADD COLUMN IF NOT EXISTS ativo BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE perfis_customizados
  ADD COLUMN IF NOT EXISTS ativo BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE aet_clientes
  ADD COLUMN IF NOT EXISTS ativo BOOLEAN NOT NULL DEFAULT TRUE;
