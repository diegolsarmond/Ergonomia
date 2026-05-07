-- ============================================================
-- MIGRAÇÃO 007a — Correção de schema antes do seed mock
-- Execute este script ANTES do 007_seed_mock_catalog.sql
-- caso os scripts 001-006 já tenham sido executados.
-- ============================================================

-- Remove a restrição NOT NULL de empresa_id em cargos_padrao
-- (cargos do catálogo global não precisam estar vinculados a uma empresa)
ALTER TABLE cargos_padrao
  ALTER COLUMN empresa_id DROP NOT NULL;
