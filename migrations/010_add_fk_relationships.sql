-- Migration 010: Add FK relationships linking projects and functions to catalog tables

-- Project tables: empresa_id (empresas) + unidade_id (unidades)
ALTER TABLE aep_projetos
  ADD COLUMN IF NOT EXISTS empresa_id UUID REFERENCES empresas(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS unidade_id UUID REFERENCES unidades(id) ON DELETE SET NULL;

ALTER TABLE aet_projetos
  ADD COLUMN IF NOT EXISTS empresa_id UUID REFERENCES empresas(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS unidade_id UUID REFERENCES unidades(id) ON DELETE SET NULL;

-- Function tables: unidade_id (unidades) + setor_id (setores)
ALTER TABLE aep_funcoes
  ADD COLUMN IF NOT EXISTS unidade_id UUID REFERENCES unidades(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS setor_id   UUID REFERENCES setores(id)  ON DELETE SET NULL;

ALTER TABLE aet_funcoes
  ADD COLUMN IF NOT EXISTS unidade_id UUID REFERENCES unidades(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS setor_id   UUID REFERENCES setores(id)  ON DELETE SET NULL;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_aep_projetos_empresa_id  ON aep_projetos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_aep_projetos_unidade_id  ON aep_projetos(unidade_id);
CREATE INDEX IF NOT EXISTS idx_aet_projetos_empresa_id  ON aet_projetos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_aet_projetos_unidade_id  ON aet_projetos(unidade_id);
CREATE INDEX IF NOT EXISTS idx_aep_funcoes_unidade_id   ON aep_funcoes(unidade_id);
CREATE INDEX IF NOT EXISTS idx_aep_funcoes_setor_id     ON aep_funcoes(setor_id);
CREATE INDEX IF NOT EXISTS idx_aet_funcoes_unidade_id   ON aet_funcoes(unidade_id);
CREATE INDEX IF NOT EXISTS idx_aet_funcoes_setor_id     ON aet_funcoes(setor_id);
