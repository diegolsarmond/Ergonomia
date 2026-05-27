-- ============================================================
-- MIGRAÇÃO 017 — Múltiplos responsáveis técnicos por projeto
-- ============================================================

-- Adiciona campo de assinatura (imagem DataURL) na tabela de usuários
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS assinatura_url TEXT;

-- Tabela de responsáveis técnicos adicionais por projeto (AEP ou AET)
CREATE TABLE IF NOT EXISTS projeto_responsaveis_tecnicos (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  projeto_id      UUID        NOT NULL,
  projeto_tipo    TEXT        NOT NULL CHECK (projeto_tipo IN ('AEP', 'AET')),
  usuario_id      UUID        REFERENCES usuarios(id) ON DELETE SET NULL,
  nome            TEXT        NOT NULL DEFAULT '',
  formacao        TEXT        NOT NULL DEFAULT '',
  crefito         TEXT        NOT NULL DEFAULT '',
  empresa         TEXT        NOT NULL DEFAULT '',
  assinatura_url  TEXT,
  ordem           INTEGER     NOT NULL DEFAULT 0,
  criado_em       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_proj_resp_tec_projeto
  ON projeto_responsaveis_tecnicos(projeto_id, projeto_tipo);
