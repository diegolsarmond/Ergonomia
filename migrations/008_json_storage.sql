-- ============================================================
-- MIGRAÇÃO 008 — Armazenamento JSON para projetos e clientes
-- Armazena os projetos AET/AEP e clientes como JSONB
-- para compatibilidade com a estrutura do frontend TypeScript.
-- ============================================================

CREATE TABLE IF NOT EXISTS aet_projetos (
  id           UUID        PRIMARY KEY,
  dados        JSONB       NOT NULL,
  criado_em    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS aet_clientes (
  id    UUID  PRIMARY KEY,
  dados JSONB NOT NULL
);

-- Atualiza automaticamente o campo atualizado_em
CREATE OR REPLACE FUNCTION atualiza_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_aet_projetos_atualizado ON aet_projetos;
CREATE TRIGGER trg_aet_projetos_atualizado
  BEFORE UPDATE ON aet_projetos
  FOR EACH ROW EXECUTE FUNCTION atualiza_timestamp();

CREATE INDEX IF NOT EXISTS idx_aet_projetos_criado ON aet_projetos(criado_em);
