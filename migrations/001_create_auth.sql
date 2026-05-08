-- ============================================================
-- MIGRAÇÃO 001 — Autenticação e Autorização
-- Sistema Ergonomia
-- ============================================================

-- Extensão para UUIDs (PostgreSQL)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------
-- Perfis customizados (roles definidas pelo ADMIN)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS perfis_customizados (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  rotulo        TEXT        NOT NULL,
  criado_em     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Permissões atribuídas a cada perfil customizado
CREATE TABLE IF NOT EXISTS perfil_permissoes (
  perfil_id  UUID  NOT NULL,
  permissao  TEXT  NOT NULL,  -- ex: 'USERS_VIEW', 'AET_PRINT', etc.
  PRIMARY KEY (perfil_id, permissao)
);

-- ------------------------------------------------------------
-- Usuários do sistema
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuarios (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  nome             TEXT        NOT NULL,
  email            TEXT        NOT NULL UNIQUE,
  nome_usuario     TEXT        NOT NULL UNIQUE,
  senha_hash       TEXT        NOT NULL,
  senha_salt       TEXT,
  -- 'ADMIN' é fixo; qualquer outro valor é o ID de um perfil_customizado
  perfil           TEXT        NOT NULL DEFAULT 'ADMIN',
  status           TEXT        NOT NULL DEFAULT 'ativo'
                     CHECK (status IN ('ativo', 'inativo', 'bloqueado')),
  alterar_senha    BOOLEAN     NOT NULL DEFAULT FALSE,
  formacao         TEXT,
  crefito          TEXT,
  criado_em        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ultimo_acesso_em TIMESTAMPTZ
);

-- Permissões diretas atribuídas ao usuário (sobrescrevem/complementam o perfil)
CREATE TABLE IF NOT EXISTS usuario_permissoes (
  usuario_id  UUID  NOT NULL,
  permissao   TEXT  NOT NULL,
  PRIMARY KEY (usuario_id, permissao)
);

-- ------------------------------------------------------------
-- Sessões autenticadas
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sessoes (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID        NOT NULL,
  criado_em  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expira_em  TIMESTAMPTZ NOT NULL
);

-- ------------------------------------------------------------
-- Chaves estrangeiras
-- ------------------------------------------------------------
ALTER TABLE perfil_permissoes
  ADD CONSTRAINT fk_perfil_permissoes_perfil
  FOREIGN KEY (perfil_id) REFERENCES perfis_customizados(id) ON DELETE CASCADE;

ALTER TABLE usuario_permissoes
  ADD CONSTRAINT fk_usuario_permissoes_usuario
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE;

ALTER TABLE sessoes
  ADD CONSTRAINT fk_sessoes_usuario
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE;

-- ------------------------------------------------------------
-- Índices
-- ------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_usuarios_nome_usuario ON usuarios(nome_usuario);
CREATE INDEX IF NOT EXISTS idx_usuarios_email        ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_sessoes_usuario       ON sessoes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_sessoes_expira        ON sessoes(expira_em);
