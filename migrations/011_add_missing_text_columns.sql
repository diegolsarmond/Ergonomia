-- ============================================================
-- MIGRAÇÃO 011 — Adiciona colunas de texto desnormalizadas
-- que o código do servidor referencia mas não existem no banco.
-- Essas colunas armazenam cópias locais dos dados da empresa/unidade
-- para manter compatibilidade com o JSON do frontend.
-- ============================================================

-- ── aep_projetos ────────────────────────────────────────────
ALTER TABLE aep_projetos
  ADD COLUMN IF NOT EXISTS nome_empresa  TEXT,
  ADD COLUMN IF NOT EXISTS nome_fantasia TEXT,
  ADD COLUMN IF NOT EXISTS cnpj         TEXT,
  ADD COLUMN IF NOT EXISTS endereco     TEXT,
  ADD COLUMN IF NOT EXISTS unidade      TEXT,
  ADD COLUMN IF NOT EXISTS produto      TEXT,
  ADD COLUMN IF NOT EXISTS grau_risco   TEXT,
  ADD COLUMN IF NOT EXISTS localizacao  TEXT;

-- ── aet_projetos ────────────────────────────────────────────
ALTER TABLE aet_projetos
  ADD COLUMN IF NOT EXISTS nome_empresa  TEXT,
  ADD COLUMN IF NOT EXISTS nome_fantasia TEXT,
  ADD COLUMN IF NOT EXISTS cnpj         TEXT,
  ADD COLUMN IF NOT EXISTS endereco     TEXT,
  ADD COLUMN IF NOT EXISTS unidade      TEXT,
  ADD COLUMN IF NOT EXISTS produto      TEXT,
  ADD COLUMN IF NOT EXISTS grau_risco   TEXT,
  ADD COLUMN IF NOT EXISTS localizacao  TEXT;

-- ── aep_funcoes ─────────────────────────────────────────────
ALTER TABLE aep_funcoes
  ADD COLUMN IF NOT EXISTS unidade_filial TEXT,
  ADD COLUMN IF NOT EXISTS setor_area     TEXT;

-- ── aet_funcoes ─────────────────────────────────────────────
ALTER TABLE aet_funcoes
  ADD COLUMN IF NOT EXISTS unidade TEXT,
  ADD COLUMN IF NOT EXISTS setor   TEXT;
