-- ============================================================
-- MIGRAÇÃO 015 — Iluminância por Setor no nível do Projeto AEP
-- Move medições de iluminância de função para setor/projeto
-- ============================================================

-- Coluna JSONB que armazena o array SectorIlluminance[] do frontend
-- Formato: [{ sectorId, sectorName, measurements: IlluminanceMeasurement[] }]
ALTER TABLE aep_projetos
  ADD COLUMN IF NOT EXISTS setor_iluminancia_json JSONB NOT NULL DEFAULT '[]'::jsonb;
