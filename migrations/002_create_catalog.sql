-- ============================================================
-- MIGRAÇÃO 002 — Catálogo / Parâmetros do Sistema
-- Sistema Ergonomia
-- ============================================================

-- ------------------------------------------------------------
-- Empresas
-- ------------------------------------------------------------
CREATE TABLE empresas (
  id                  UUID     PRIMARY KEY DEFAULT gen_random_uuid(),
  razao_social        TEXT     NOT NULL,
  nome_fantasia       TEXT,
  cnpj                TEXT,
  logradouro          TEXT,
  numero              TEXT,
  complemento         TEXT,
  bairro              TEXT,
  municipio           TEXT,
  uf                  CHAR(2),
  cep                 TEXT,
  produto             TEXT,
  situacao_mercado    TEXT,
  local_producao      TEXT,
  grau_risco          TEXT,
  logo_url            TEXT,    -- base64 ou URL
  ativo               BOOLEAN  NOT NULL DEFAULT TRUE
);

-- ------------------------------------------------------------
-- Unidades (filiais / plantas)
-- ------------------------------------------------------------
CREATE TABLE unidades (
  id             UUID     PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id     UUID     NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nome           TEXT     NOT NULL,
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
CREATE TABLE setores (
  id         UUID     PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID     NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  unidade_id UUID     REFERENCES unidades(id) ON DELETE SET NULL,
  nome       TEXT     NOT NULL,
  descricao  TEXT,
  ativo      BOOLEAN  NOT NULL DEFAULT TRUE
);

-- ------------------------------------------------------------
-- Cargos padrão
-- ------------------------------------------------------------
CREATE TABLE cargos_padrao (
  id           UUID     PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id   UUID     NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  setor_id     UUID     REFERENCES setores(id) ON DELETE SET NULL,
  cargo_pai_id UUID     REFERENCES cargos_padrao(id) ON DELETE SET NULL,
  nome         TEXT     NOT NULL,
  cbo          TEXT,    -- Código Brasileiro de Ocupações
  descricao    TEXT,
  ativo        BOOLEAN  NOT NULL DEFAULT TRUE
);

-- ------------------------------------------------------------
-- EPIs (Equipamentos de Proteção Individual)
-- ------------------------------------------------------------
CREATE TABLE epis (
  id                 UUID     PRIMARY KEY DEFAULT gen_random_uuid(),
  nome               TEXT     NOT NULL,
  tipo               TEXT,
  descricao          TEXT,
  obrigatorio_padrao BOOLEAN  NOT NULL DEFAULT FALSE,
  ativo              BOOLEAN  NOT NULL DEFAULT TRUE
);

-- Associação: quais EPIs são padrão para cada cargo
CREATE TABLE cargo_epis (
  cargo_id UUID NOT NULL REFERENCES cargos_padrao(id) ON DELETE CASCADE,
  epi_id   UUID NOT NULL REFERENCES epis(id) ON DELETE CASCADE,
  PRIMARY KEY (cargo_id, epi_id)
);

-- ------------------------------------------------------------
-- Equipamentos padrão
-- ------------------------------------------------------------
CREATE TABLE equipamentos_padrao (
  id             UUID     PRIMARY KEY DEFAULT gen_random_uuid(),
  nome           TEXT     NOT NULL,
  categoria      TEXT,
  descricao      TEXT,
  tem_dimensoes  BOOLEAN  NOT NULL DEFAULT FALSE,
  ativo          BOOLEAN  NOT NULL DEFAULT TRUE
);

-- Operações possíveis de cada equipamento (array → tabela)
CREATE TABLE equipamento_operacoes (
  id            UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
  equipamento_id UUID NOT NULL REFERENCES equipamentos_padrao(id) ON DELETE CASCADE,
  operacao      TEXT  NOT NULL,
  ordem         INT   NOT NULL DEFAULT 0
);

-- Associação: quais equipamentos são padrão para cada cargo
CREATE TABLE cargo_equipamentos (
  cargo_id       UUID NOT NULL REFERENCES cargos_padrao(id) ON DELETE CASCADE,
  equipamento_id UUID NOT NULL REFERENCES equipamentos_padrao(id) ON DELETE CASCADE,
  PRIMARY KEY (cargo_id, equipamento_id)
);

-- ------------------------------------------------------------
-- Perguntas de entrevista com trabalhador
-- ------------------------------------------------------------
CREATE TABLE perguntas_entrevista (
  id           UUID     PRIMARY KEY DEFAULT gen_random_uuid(),
  pergunta     TEXT     NOT NULL,
  categoria    TEXT,
  tipo_resposta TEXT    NOT NULL,  -- 'texto' | 'selecao' | 'multipla' | 'booleano' etc.
  obrigatorio  BOOLEAN  NOT NULL DEFAULT FALSE,
  ordem        INT      NOT NULL DEFAULT 0,
  ativo        BOOLEAN  NOT NULL DEFAULT TRUE
);

-- Opções de resposta para perguntas do tipo seleção
CREATE TABLE pergunta_entrevista_opcoes (
  id          UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
  pergunta_id UUID  NOT NULL REFERENCES perguntas_entrevista(id) ON DELETE CASCADE,
  texto_opcao TEXT  NOT NULL,
  ordem       INT   NOT NULL DEFAULT 0
);

-- ------------------------------------------------------------
-- Pausas padrão
-- ------------------------------------------------------------
CREATE TABLE pausas_padrao (
  id               UUID     PRIMARY KEY DEFAULT gen_random_uuid(),
  nome             TEXT     NOT NULL,
  duracao          TEXT,
  unidade_duracao  TEXT,    -- 'minutos' | 'horas'
  descricao        TEXT,
  ativo            BOOLEAN  NOT NULL DEFAULT TRUE
);

-- ------------------------------------------------------------
-- Turnos
-- ------------------------------------------------------------
CREATE TABLE turnos (
  id        UUID     PRIMARY KEY DEFAULT gen_random_uuid(),
  nome      TEXT     NOT NULL,
  descricao TEXT,
  ativo     BOOLEAN  NOT NULL DEFAULT TRUE
);

-- ------------------------------------------------------------
-- Classificações de risco (matriz probabilidade × gravidade)
-- ------------------------------------------------------------
CREATE TABLE classificacoes_risco (
  id               UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
  nome             TEXT  NOT NULL,   -- 'BAIXO' | 'MODERADO' | 'ALTO RISCO' | 'CRÍTICO'
  pontuacao_minima INT   NOT NULL,
  pontuacao_maxima INT   NOT NULL,
  cor              TEXT,             -- hex ou nome da cor
  interpretacao    TEXT
);

-- ------------------------------------------------------------
-- Modelos de texto de relatório
-- ------------------------------------------------------------
CREATE TABLE modelos_texto_relatorio (
  id      UUID     PRIMARY KEY DEFAULT gen_random_uuid(),
  secao   TEXT     NOT NULL,   -- ex: 'intro_ergonomia', 'metodologia'
  titulo  TEXT     NOT NULL,
  texto   TEXT     NOT NULL,
  ativo   BOOLEAN  NOT NULL DEFAULT TRUE
);

-- ------------------------------------------------------------
-- Modelos de métodos científicos (RULA, REBA, NIOSH, KIM...)
-- ------------------------------------------------------------
CREATE TABLE modelos_metodo_cientifico (
  id        UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
  nome      TEXT  NOT NULL,
  descricao TEXT
);

-- Imagens de referência do método
CREATE TABLE modelo_metodo_cientifico_imagens (
  id         UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
  modelo_id  UUID  NOT NULL REFERENCES modelos_metodo_cientifico(id) ON DELETE CASCADE,
  imagem_url TEXT  NOT NULL,
  ordem      INT   NOT NULL DEFAULT 0
);

-- ------------------------------------------------------------
-- Perguntas de checklist
-- ------------------------------------------------------------
CREATE TABLE perguntas_checklist (
  id     UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
  texto  TEXT  NOT NULL
);

-- Funções/cargos para os quais a pergunta se aplica
CREATE TABLE checklist_pergunta_funcoes (
  pergunta_id  UUID  NOT NULL REFERENCES perguntas_checklist(id) ON DELETE CASCADE,
  nome_funcao  TEXT  NOT NULL,
  PRIMARY KEY (pergunta_id, nome_funcao)
);

-- ------------------------------------------------------------
-- Fatores de risco biomecânico
-- ------------------------------------------------------------
CREATE TABLE fatores_risco_biomecanico (
  id     UUID     PRIMARY KEY DEFAULT gen_random_uuid(),
  nome   TEXT     NOT NULL,
  ativo  BOOLEAN  NOT NULL DEFAULT TRUE
);

-- Categorias às quais o fator pertence (array → tabela)
CREATE TABLE fator_risco_biomecanico_categorias (
  fator_id  UUID  NOT NULL REFERENCES fatores_risco_biomecanico(id) ON DELETE CASCADE,
  categoria TEXT  NOT NULL,
  PRIMARY KEY (fator_id, categoria)
);

-- ------------------------------------------------------------
-- Parâmetros normativos de iluminância (ABNT NBR ISO/CIE 8995-1:2013)
-- ------------------------------------------------------------
CREATE TABLE parametros_normativos_iluminancia (
  id                     UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  descricao_atividade    TEXT    NOT NULL,
  lux_minimo             INT     NOT NULL,
  irc_minimo             INT     NOT NULL,   -- Índice de Reprodução de Cores mínimo
  tolerancia_percentual  NUMERIC(5,2) NOT NULL DEFAULT 10.0,
  razao_uniformidade_max NUMERIC(5,2) NOT NULL DEFAULT 5.0,
  referencia_normativa   TEXT    NOT NULL DEFAULT 'ABNT NBR ISO/CIE 8995-1:2013',
  referencia_pagina      TEXT
);

-- ------------------------------------------------------------
-- Índices de catálogo
-- ------------------------------------------------------------
CREATE INDEX idx_unidades_empresa    ON unidades(empresa_id);
CREATE INDEX idx_setores_empresa     ON setores(empresa_id);
CREATE INDEX idx_setores_unidade     ON setores(unidade_id);
CREATE INDEX idx_cargos_empresa      ON cargos_padrao(empresa_id);
CREATE INDEX idx_cargos_setor        ON cargos_padrao(setor_id);
CREATE INDEX idx_cargos_pai          ON cargos_padrao(cargo_pai_id);
