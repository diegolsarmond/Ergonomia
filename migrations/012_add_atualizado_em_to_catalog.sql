-- Adiciona a coluna atualizado_em as tabelas que possuem trigger de atualiza_timestamp
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE unidades ADD COLUMN IF NOT EXISTS atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE setores ADD COLUMN IF NOT EXISTS atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW();
