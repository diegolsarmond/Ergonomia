-- ============================================================
-- MIGRAÇÃO 002 — Catálogo / Parâmetros do Sistema
-- Sistema Ergonomia
-- ============================================================

-- ------------------------------------------------------------
-- Empresas
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS empresas (
  id               UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  razao_social     TEXT    NOT NULL,
  nome_fantasia    TEXT,
  cnpj             TEXT,
  logradouro       TEXT,
  numero           TEXT,
  complemento      TEXT,
  bairro           TEXT,
  municipio        TEXT,
  uf               CHAR(2),
  cep              TEXT,
  produto          TEXT,
  situacao_mercado TEXT,
  local_producao   TEXT,
  grau_risco       TEXT,
  logo_url         TEXT,    -- base64 ou URL
  ativo            BOOLEAN NOT NULL DEFAULT TRUE
);

-- ------------------------------------------------------------
-- Unidades (filiais / plantas)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS unidades (
  id             UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id     UUID    NOT NULL,
  nome           TEXT    NOT NULL,
  cep            TEXT,
  logradouro     TEXT,
  numero         TEXT,
  complemento    TEXT,
  bairro         TEXT,
  cidade         TEXT,
  uf             CHAR(2),
  endereco       TEXT,
  local_producao TEXT,
  logo_url       TEXT
);

-- ------------------------------------------------------------
-- Setores
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS setores (
  id         UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID    NOT NULL,
  unidade_id UUID,
  nome       TEXT    NOT NULL,
  descricao  TEXT,
  ativo      BOOLEAN NOT NULL DEFAULT TRUE
);

-- ------------------------------------------------------------
-- Cargos padrão
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cargos_padrao (
  id           UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id   UUID    NOT NULL,
  setor_id     UUID,
  cargo_pai_id UUID,
  nome         TEXT    NOT NULL,
  cbo          TEXT,    -- Código Brasileiro de Ocupações
  descricao    TEXT,
  ativo        BOOLEAN NOT NULL DEFAULT TRUE
);

-- ------------------------------------------------------------
-- EPIs (Equipamentos de Proteção Individual)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS epis (
  id                 UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  nome               TEXT    NOT NULL,
  tipo               TEXT,
  descricao          TEXT,
  obrigatorio_padrao BOOLEAN NOT NULL DEFAULT FALSE,
  ativo              BOOLEAN NOT NULL DEFAULT TRUE
);

-- Associação: quais EPIs são padrão para cada cargo
CREATE TABLE IF NOT EXISTS cargo_epis (
  cargo_id UUID NOT NULL,
  epi_id   UUID NOT NULL,
  PRIMARY KEY (cargo_id, epi_id)
);

-- ------------------------------------------------------------
-- Equipamentos padrão
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS equipamentos_padrao (
  id            UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  nome          TEXT    NOT NULL,
  categoria     TEXT,
  descricao     TEXT,
  tem_dimensoes BOOLEAN NOT NULL DEFAULT FALSE,
  ativo         BOOLEAN NOT NULL DEFAULT TRUE
);

-- Operações possíveis de cada equipamento (array → tabela)
CREATE TABLE IF NOT EXISTS equipamento_operacoes (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipamento_id UUID NOT NULL,
  operacao       TEXT NOT NULL,
  ordem          INT  NOT NULL DEFAULT 0
);

-- Associação: quais equipamentos são padrão para cada cargo
CREATE TABLE IF NOT EXISTS cargo_equipamentos (
  cargo_id       UUID NOT NULL,
  equipamento_id UUID NOT NULL,
  PRIMARY KEY (cargo_id, equipamento_id)
);

-- ------------------------------------------------------------
-- Perguntas de entrevista com trabalhador
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS perguntas_entrevista (
  id            UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  pergunta      TEXT    NOT NULL,
  categoria     TEXT,
  tipo_resposta TEXT    NOT NULL,  -- 'texto' | 'selecao' | 'multipla' | 'booleano' etc.
  obrigatorio   BOOLEAN NOT NULL DEFAULT FALSE,
  ordem         INT     NOT NULL DEFAULT 0,
  ativo         BOOLEAN NOT NULL DEFAULT TRUE
);

-- Opções de resposta para perguntas do tipo seleção
CREATE TABLE IF NOT EXISTS pergunta_entrevista_opcoes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pergunta_id UUID NOT NULL,
  texto_opcao TEXT NOT NULL,
  ordem       INT  NOT NULL DEFAULT 0
);

-- ------------------------------------------------------------
-- Pausas padrão
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pausas_padrao (
  id              UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  nome            TEXT    NOT NULL,
  duracao         TEXT,
  unidade_duracao TEXT,    -- 'minutos' | 'horas'
  descricao       TEXT,
  ativo           BOOLEAN NOT NULL DEFAULT TRUE
);

-- ------------------------------------------------------------
-- Turnos
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS turnos (
  id        UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  nome      TEXT    NOT NULL,
  descricao TEXT,
  ativo     BOOLEAN NOT NULL DEFAULT TRUE
);

-- ------------------------------------------------------------
-- Classificações de risco (matriz probabilidade × gravidade)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS classificacoes_risco (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome             TEXT NOT NULL,   -- 'BAIXO' | 'MODERADO' | 'ALTO RISCO' | 'CRÍTICO'
  pontuacao_minima INT  NOT NULL,
  pontuacao_maxima INT  NOT NULL,
  cor              TEXT,             -- hex ou nome da cor
  interpretacao    TEXT
);

-- ------------------------------------------------------------
-- Modelos de texto de relatório
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS modelos_texto_relatorio (
  id      UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  secao   TEXT    NOT NULL,   -- ex: 'intro_ergonomia', 'metodologia'
  titulo  TEXT    NOT NULL,
  texto   TEXT    NOT NULL,
  ativo   BOOLEAN NOT NULL DEFAULT TRUE
);

-- ------------------------------------------------------------
-- Modelos de métodos científicos (RULA, REBA, NIOSH, KIM...)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS modelos_metodo_cientifico (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome      TEXT NOT NULL,
  descricao TEXT
);

-- Imagens de referência do método
CREATE TABLE IF NOT EXISTS modelo_metodo_cientifico_imagens (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  modelo_id  UUID NOT NULL,
  imagem_url TEXT NOT NULL,
  ordem      INT  NOT NULL DEFAULT 0
);

-- ------------------------------------------------------------
-- Perguntas de checklist
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS perguntas_checklist (
  id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  texto TEXT NOT NULL
);

-- Funções/cargos para os quais a pergunta se aplica
CREATE TABLE IF NOT EXISTS checklist_pergunta_funcoes (
  pergunta_id UUID NOT NULL,
  nome_funcao TEXT NOT NULL,
  PRIMARY KEY (pergunta_id, nome_funcao)
);

-- ------------------------------------------------------------
-- Fatores de risco biomecânico
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS fatores_risco_biomecanico (
  id    UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  nome  TEXT    NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT TRUE
);

-- Categorias às quais o fator pertence (array → tabela)
CREATE TABLE IF NOT EXISTS fator_risco_biomecanico_categorias (
  fator_id  UUID NOT NULL,
  categoria TEXT NOT NULL,
  PRIMARY KEY (fator_id, categoria)
);

-- ------------------------------------------------------------
-- Parâmetros normativos de iluminância (ABNT NBR ISO/CIE 8995-1:2013)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS parametros_normativos_iluminancia (
  id                     UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  descricao_atividade    TEXT         NOT NULL,
  lux_minimo             INT          NOT NULL,
  irc_minimo             INT          NOT NULL,   -- Índice de Reprodução de Cores mínimo
  tolerancia_percentual  NUMERIC(5,2) NOT NULL DEFAULT 10.0,
  razao_uniformidade_max NUMERIC(5,2) NOT NULL DEFAULT 5.0,
  referencia_normativa   TEXT         NOT NULL DEFAULT 'ABNT NBR ISO/CIE 8995-1:2013',
  referencia_pagina      TEXT
);

-- ------------------------------------------------------------
-- Chaves estrangeiras
-- ------------------------------------------------------------
ALTER TABLE unidades
  ADD CONSTRAINT fk_unidades_empresa
  FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE;

ALTER TABLE setores
  ADD CONSTRAINT fk_setores_empresa
  FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE;

ALTER TABLE setores
  ADD CONSTRAINT fk_setores_unidade
  FOREIGN KEY (unidade_id) REFERENCES unidades(id) ON DELETE SET NULL;

ALTER TABLE cargos_padrao
  ADD CONSTRAINT fk_cargos_empresa
  FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE;

ALTER TABLE cargos_padrao
  ADD CONSTRAINT fk_cargos_setor
  FOREIGN KEY (setor_id) REFERENCES setores(id) ON DELETE SET NULL;

ALTER TABLE cargos_padrao
  ADD CONSTRAINT fk_cargos_pai
  FOREIGN KEY (cargo_pai_id) REFERENCES cargos_padrao(id) ON DELETE SET NULL;

ALTER TABLE cargo_epis
  ADD CONSTRAINT fk_cargo_epis_cargo
  FOREIGN KEY (cargo_id) REFERENCES cargos_padrao(id) ON DELETE CASCADE;

ALTER TABLE cargo_epis
  ADD CONSTRAINT fk_cargo_epis_epi
  FOREIGN KEY (epi_id) REFERENCES epis(id) ON DELETE CASCADE;

ALTER TABLE equipamento_operacoes
  ADD CONSTRAINT fk_equipamento_operacoes_equipamento
  FOREIGN KEY (equipamento_id) REFERENCES equipamentos_padrao(id) ON DELETE CASCADE;

ALTER TABLE cargo_equipamentos
  ADD CONSTRAINT fk_cargo_equipamentos_cargo
  FOREIGN KEY (cargo_id) REFERENCES cargos_padrao(id) ON DELETE CASCADE;

ALTER TABLE cargo_equipamentos
  ADD CONSTRAINT fk_cargo_equipamentos_equipamento
  FOREIGN KEY (equipamento_id) REFERENCES equipamentos_padrao(id) ON DELETE CASCADE;

ALTER TABLE pergunta_entrevista_opcoes
  ADD CONSTRAINT fk_pergunta_entrevista_opcoes_pergunta
  FOREIGN KEY (pergunta_id) REFERENCES perguntas_entrevista(id) ON DELETE CASCADE;

ALTER TABLE modelo_metodo_cientifico_imagens
  ADD CONSTRAINT fk_modelo_imagens_modelo
  FOREIGN KEY (modelo_id) REFERENCES modelos_metodo_cientifico(id) ON DELETE CASCADE;

ALTER TABLE checklist_pergunta_funcoes
  ADD CONSTRAINT fk_checklist_pergunta_funcoes_pergunta
  FOREIGN KEY (pergunta_id) REFERENCES perguntas_checklist(id) ON DELETE CASCADE;

ALTER TABLE fator_risco_biomecanico_categorias
  ADD CONSTRAINT fk_fator_risco_categorias_fator
  FOREIGN KEY (fator_id) REFERENCES fatores_risco_biomecanico(id) ON DELETE CASCADE;

-- ------------------------------------------------------------
-- Índices de catálogo
-- ------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_unidades_empresa ON unidades(empresa_id);
CREATE INDEX IF NOT EXISTS idx_setores_empresa  ON setores(empresa_id);
CREATE INDEX IF NOT EXISTS idx_setores_unidade  ON setores(unidade_id);
CREATE INDEX IF NOT EXISTS idx_cargos_empresa   ON cargos_padrao(empresa_id);
CREATE INDEX IF NOT EXISTS idx_cargos_setor     ON cargos_padrao(setor_id);
CREATE INDEX IF NOT EXISTS idx_cargos_pai       ON cargos_padrao(cargo_pai_id);
