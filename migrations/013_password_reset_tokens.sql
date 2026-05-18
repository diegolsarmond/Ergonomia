-- Migration 013: Tabela de tokens para redefinição de senha
-- Tokens seguros, com expiração e uso único

CREATE TABLE IF NOT EXISTS tokens_redefinicao_senha (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID        NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  token      TEXT        NOT NULL UNIQUE,
  expira_em  TIMESTAMPTZ NOT NULL,
  usado_em   TIMESTAMPTZ,
  criado_em  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tokens_redefinicao_token   ON tokens_redefinicao_senha(token);
CREATE INDEX IF NOT EXISTS idx_tokens_redefinicao_usuario ON tokens_redefinicao_senha(usuario_id);
