-- ============================================================
-- MIGRAÇÃO 003 — Análise Ergonômica do Trabalho (AET)
--               e Análise Ergonômica Preliminar (AEP)
-- Sistema Ergonomia
-- ============================================================

-- ------------------------------------------------------------
-- Análise Ergonômica do Trabalho — AET
-- Documento completo com seções 1–9 e avaliação detalhada por função
-- ------------------------------------------------------------
CREATE TABLE analise_trabalho (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id    UUID        NOT NULL REFERENCES empresas(id),
  unidade_id    UUID        REFERENCES unidades(id) ON DELETE SET NULL,


  -- Seção 1 — Introdução
  intro_ergonomia          TEXT,
  intro_objetivo           TEXT,
  intro_metodologia        TEXT,

  data          DATE,
  criado_em     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Avaliadores da AET — N:N com usuarios
-- responsavel = TRUE indica o responsável técnico que assina o documento
CREATE TABLE aet_avaliadores (
  analise_trabalho_id UUID    NOT NULL REFERENCES analise_trabalho(id) ON DELETE CASCADE,
  usuario_id          UUID    NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  responsavel         BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (analise_trabalho_id, usuario_id)
);

-- ------------------------------------------------------------
-- Análise Ergonômica Preliminar — AEP
-- Avaliação preliminar; o responsável técnico fica por função (aep_avaliacoes.resp_*)
-- ------------------------------------------------------------
CREATE TABLE analise_preliminar (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id    UUID        NOT NULL REFERENCES empresas(id),
  unidade_id    UUID        REFERENCES unidades(id) ON DELETE SET NULL,



  -- Introdução
  intro_ergonomia          TEXT,
  intro_objetivo           TEXT,
  intro_metodologia        TEXT,

  data          DATE,
  criado_em     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- Funções avaliadas — compartilhada entre AET e AEP
-- Apenas uma das chaves pai deve estar preenchida (CHECK abaixo)
-- ------------------------------------------------------------
CREATE TABLE funcoes (
  id                    UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
  analise_trabalho_id   UUID  REFERENCES analise_trabalho(id)  ON DELETE CASCADE,
  analise_preliminar_id UUID  REFERENCES analise_preliminar(id) ON DELETE CASCADE,
  ordem                 INT   NOT NULL DEFAULT 0,

  CONSTRAINT chk_funcao_analise CHECK (
    (analise_trabalho_id IS NOT NULL AND analise_preliminar_id IS NULL) OR
    (analise_trabalho_id IS NULL     AND analise_preliminar_id IS NOT NULL)
  ),

  -- 4.1 Cabeçalho
  cargo_id         UUID REFERENCES cargos_padrao(id) ON DELETE SET NULL,
  unidade_id       UUID REFERENCES unidades(id)      ON DELETE SET NULL,
  setor_id         UUID REFERENCES setores(id)       ON DELETE SET NULL,
  data_analise     DATE,
  num_funcionarios TEXT,

  -- ── Campos exclusivos AET (seções 4.2 – 4.20) ───────────────

  -- 4.2 Origem da demanda
  origem_demanda TEXT,

  -- 4.3 Objetivo
  objetivo TEXT,

  -- 4.4 Demanda encontrada
  demanda_encontrada TEXT,

  -- 4.5 Análise global
  situacao_mercado TEXT,
  produto          TEXT,
  local_producao   TEXT,

  -- 4.6 Dimensão da produção
  dimensao_producao   TEXT,
  metas_producao      TEXT,
  analise_qualidade   TEXT,
  avaliador_qualidade TEXT,

  -- 4.7 Organização do trabalho
  turno_id               UUID REFERENCES turnos(id)        ON DELETE SET NULL,
  inicio_turno           TEXT,
  fim_turno              TEXT,
  dias_trabalho          TEXT,
  horas_extras           TEXT,
  pausa_id               UUID REFERENCES pausas_padrao(id) ON DELETE SET NULL,
  rodizio_tarefas        TEXT,
  distancia_banheiro     TEXT,
  condicao_banheiro      TEXT,
  organograma_hierarquia TEXT,
  descricao_posto        TEXT,

  -- 4.8 Colaborador
  formacao_colaborador TEXT,
  turno_colaborador_id UUID REFERENCES turnos(id) ON DELETE SET NULL,
  opiniao_genero       TEXT,
  opiniao_idade        TEXT,
  opiniao_tempo        TEXT,

  -- 4.9 Opinião do trabalhador
  opiniao_objetivo              TEXT,
  opiniao_termico               TEXT,
  opiniao_ventilacao            TEXT,
  opiniao_ventilacao_desc       TEXT,
  opiniao_iluminacao_sens       TEXT,
  opiniao_iluminacao_desc       TEXT,
  opiniao_acustica              TEXT,
  opiniao_epi                   TEXT,
  opiniao_equipamento           TEXT,
  opiniao_ciclo                 TEXT,
  opiniao_layout                TEXT,
  opiniao_dificuldades          TEXT,
  opiniao_pressao               TEXT,
  opiniao_relacionamento        TEXT,
  opiniao_lideranca             TEXT,
  opiniao_manutencao_influencia TEXT,
  opiniao_manutencao_atraso     TEXT,
  opiniao_intercorrencias       TEXT,

  -- 4.10 Exigências físicas
  esforco_dinamico TEXT,
  esforco_estatico TEXT,

  -- 4.11 Cronoanálise
  cronoanalise TEXT,

  -- 4.12 Carregamento de peso
  carregamento_carga TEXT,

  -- 4.13 Deslocamentos
  deslocamento TEXT,

  -- 4.14 Manutenções
  manutencao_desc         TEXT,
  manutencao_causa_atraso TEXT,

  -- 4.15 Logística
  logistica_influencia TEXT,
  logistica_atraso     TEXT,

  -- 4.16 Retrabalho / refugo
  retrabalho_desc          TEXT,
  retrabalho_semana        TEXT,
  retrabalho_nao_aplicavel BOOLEAN NOT NULL DEFAULT FALSE,

  -- 4.17 Equipamentos e EPIs
  usa_equipamento       BOOLEAN NOT NULL DEFAULT FALSE,
  usa_epi               BOOLEAN NOT NULL DEFAULT FALSE,
  problemas_equipamento TEXT,

  -- 4.18 Modo operatório
  ciclo_prescrito TEXT,
  ciclo_real      TEXT,

  -- 4.19 Predominância postural (%)
  postura_sentado_pct     NUMERIC(5,2) NOT NULL DEFAULT 0,
  postura_em_pe_pct       NUMERIC(5,2) NOT NULL DEFAULT 0,
  postura_caminhando_pct  NUMERIC(5,2) NOT NULL DEFAULT 0,
  postura_agachado_pct    NUMERIC(5,2) NOT NULL DEFAULT 0,
  postura_outro_pct       NUMERIC(5,2) NOT NULL DEFAULT 0,
  postura_outro_descricao TEXT,

  -- 4.20 Meio ambiente
  meio_ambiente TEXT,

  -- Diagnóstico final (AET)
  diagnostico    TEXT,
  rula_pontuacao TEXT
);

-- ------------------------------------------------------------
-- Iluminação da função (AETIllumination) — 1:1 com funcao
-- Utilizada na AET; na AEP a iluminância fica em medicoes_iluminancia
-- ------------------------------------------------------------
CREATE TABLE funcao_iluminacoes (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  funcao_id UUID NOT NULL UNIQUE REFERENCES funcoes(id) ON DELETE CASCADE,

  local                TEXT,
  data                 DATE,
  tipo_iluminacao      TEXT,
  introducao           TEXT,
  objetivo             TEXT,
  justificativa        TEXT,
  descricao_ambiente   TEXT,
  sistema_iluminacao   TEXT,
  atividades           TEXT,
  criterios            TEXT,
  valores_medidos      TEXT,
  valor_referencia     TEXT,
  formula              TEXT,
  resultado_lux        TEXT,
  interpretacao        TEXT,
  referencia_normativa TEXT,
  tipo_modelo          TEXT,  -- 'SIMPLE_AVERAGE' | 'RECTANGULAR_REGULAR_GRID' etc.
  conclusao            TEXT   CHECK (conclusao IN ('adequada','inadequada','não_aplicável','')),
  texto_conclusao      TEXT,
  lux_referencia       NUMERIC(10,2) NOT NULL DEFAULT 0
);

-- Pontos de medição NHO 11 da iluminação (NHO11MeasurementPoint)
CREATE TABLE iluminacao_pontos_medicao (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  iluminacao_id UUID          NOT NULL REFERENCES funcao_iluminacoes(id) ON DELETE CASCADE,
  rotulo        TEXT,
  lux           NUMERIC(10,2),
  ordem         INT           NOT NULL DEFAULT 0
);

-- Checklist de iluminação (IlluminationChecklistItem)
CREATE TABLE iluminacao_checklist_itens (
  id               UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
  iluminacao_id    UUID  NOT NULL REFERENCES funcao_iluminacoes(id) ON DELETE CASCADE,
  descricao        TEXT  NOT NULL,
  conforme         TEXT  CHECK (conforme IN ('sim','nao','')),
  acao_recomendada TEXT,
  prazo            TEXT,
  responsavel      TEXT,
  observacoes      TEXT,
  ordem            INT   NOT NULL DEFAULT 0
);

-- ------------------------------------------------------------
-- Métodos científicos da função — AETScientificMethod (AET)
-- ------------------------------------------------------------
CREATE TABLE funcao_metodos_cientificos (
  id                     UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
  funcao_id              UUID  NOT NULL REFERENCES funcoes(id) ON DELETE CASCADE,
  modelo_id              UUID  REFERENCES modelos_metodo_cientifico(id) ON DELETE SET NULL,
  classificacao_risco_id UUID  REFERENCES classificacoes_risco(id) ON DELETE SET NULL,
  descricao              TEXT,
  resultado              TEXT,
  interpretacao          TEXT,
  imagem_url             TEXT,
  recomendacoes          TEXT,
  ordem                  INT   NOT NULL DEFAULT 0
);

-- ------------------------------------------------------------
-- Imagens da função — AETImage (AET e AEP)
-- ------------------------------------------------------------
CREATE TABLE funcao_imagens (
  id         UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
  funcao_id  UUID  NOT NULL REFERENCES funcoes(id) ON DELETE CASCADE,
  imagem_url TEXT  NOT NULL,
  legenda    TEXT,
  categoria  TEXT  CHECK (categoria IN ('posto_trabalho','banheiro','equipamento','postura','metodo','evidencia_risco','outro')),
  ordem      INT   NOT NULL DEFAULT 0
);

-- ------------------------------------------------------------
-- Equipamentos da função — AETEquipmentItem (AET)
-- ------------------------------------------------------------
CREATE TABLE funcao_equipamentos (
  id             UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
  funcao_id      UUID  NOT NULL REFERENCES funcoes(id) ON DELETE CASCADE,
  equipamento_id UUID  REFERENCES equipamentos_padrao(id) ON DELETE SET NULL,
  nome           TEXT,  -- preenchido quando não vem do catálogo
  quantidade     TEXT,
  dimensoes      TEXT,
  principio      TEXT  CHECK (principio IN ('manual','eletrico','hidraulico','pneumatico','')),
  condicao       TEXT,
  observacoes    TEXT,
  ordem          INT   NOT NULL DEFAULT 0
);

-- ------------------------------------------------------------
-- EPIs da função — AETEPIItem (AET)
-- ------------------------------------------------------------
CREATE TABLE funcao_epis (
  id          UUID     PRIMARY KEY DEFAULT gen_random_uuid(),
  funcao_id   UUID     NOT NULL REFERENCES funcoes(id) ON DELETE CASCADE,
  epi_id      UUID     REFERENCES epis(id) ON DELETE SET NULL,
  nome        TEXT,    -- preenchido quando não vem do catálogo
  obrigatorio BOOLEAN  NOT NULL DEFAULT FALSE,
  eventual    BOOLEAN  NOT NULL DEFAULT FALSE,
  local       TEXT,
  observacoes TEXT,
  ordem       INT      NOT NULL DEFAULT 0
);

-- ------------------------------------------------------------
-- Riscos ergonômicos — ErgonomicRisk (AET e AEP)
-- ------------------------------------------------------------
CREATE TABLE funcao_riscos_ergonomicos (
  id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  funcao_id                  UUID NOT NULL REFERENCES funcoes(id) ON DELETE CASCADE,
  classificacao_risco_id     UUID REFERENCES classificacoes_risco(id) ON DELETE SET NULL,
  fator_risco_biomecanico_id UUID REFERENCES fatores_risco_biomecanico(id) ON DELETE SET NULL,
  agente                     TEXT,
  efeito_saude_possivel      TEXT,
  situacao_encontrada        TEXT,
  controle_existente         TEXT,
  proposta_melhoria          TEXT,
  probabilidade              INT  CHECK (probabilidade BETWEEN 1 AND 5),
  gravidade                  INT  CHECK (gravidade BETWEEN 1 AND 5),
  pontuacao                  INT  GENERATED ALWAYS AS (probabilidade * gravidade) STORED,
  referencia_normativa       TEXT,
  imagem_evidencia_url       TEXT,
  responsavel                TEXT,
  prazo                      TEXT,
  status                     TEXT,
  ordem                      INT  NOT NULL DEFAULT 0
);

-- ------------------------------------------------------------
-- Melhorias / plano de ação simples — AETImprovement (AET)
-- ------------------------------------------------------------
CREATE TABLE funcao_melhorias (
  id                      UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
  funcao_id               UUID  NOT NULL REFERENCES funcoes(id) ON DELETE CASCADE,
  classificacao_risco_id  UUID  REFERENCES classificacoes_risco(id) ON DELETE SET NULL,
  foto_url                TEXT,
  perigo                  TEXT,
  probabilidade           TEXT,
  gravidade               TEXT,
  nivel_risco_bruto       TEXT,
  avaliacao_risco         TEXT,
  acoes                   TEXT,
  probabilidade_atenuacao TEXT,
  prazo                   TEXT,
  responsavel             TEXT,
  observacoes             TEXT,
  ordem                   INT   NOT NULL DEFAULT 0
);

-- ------------------------------------------------------------
-- Respostas do checklist da função (AET)
-- ------------------------------------------------------------
CREATE TABLE funcao_respostas_checklist (
  id                    UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
  funcao_id             UUID  NOT NULL REFERENCES funcoes(id) ON DELETE CASCADE,
  pergunta_checklist_id UUID  NOT NULL REFERENCES perguntas_checklist(id) ON DELETE CASCADE,
  resposta              TEXT  CHECK (resposta IN ('sim','nao','nao_se_aplica',''))
);

-- ------------------------------------------------------------
-- Índices
-- ------------------------------------------------------------
-- analise_trabalho
CREATE INDEX idx_aet_empresa               ON analise_trabalho(empresa_id);
CREATE INDEX idx_aet_unidade               ON analise_trabalho(unidade_id);
CREATE INDEX idx_aet_aval_usuario          ON aet_avaliadores(usuario_id);

-- analise_preliminar
CREATE INDEX idx_aep_empresa               ON analise_preliminar(empresa_id);
CREATE INDEX idx_aep_unidade               ON analise_preliminar(unidade_id);

-- funcoes
CREATE INDEX idx_funcoes_analise_trabalho   ON funcoes(analise_trabalho_id);
CREATE INDEX idx_funcoes_analise_prelim     ON funcoes(analise_preliminar_id);
CREATE INDEX idx_funcoes_cargo              ON funcoes(cargo_id);
CREATE INDEX idx_funcoes_setor              ON funcoes(setor_id);
CREATE INDEX idx_funcoes_unidade            ON funcoes(unidade_id);
CREATE INDEX idx_funcoes_turno              ON funcoes(turno_id);

-- sub-tabelas de funcao
CREATE INDEX idx_func_iluminacoes_funcao    ON funcao_iluminacoes(funcao_id);
CREATE INDEX idx_func_metodos_funcao        ON funcao_metodos_cientificos(funcao_id);
CREATE INDEX idx_func_metodos_modelo        ON funcao_metodos_cientificos(modelo_id);
CREATE INDEX idx_func_imagens_funcao        ON funcao_imagens(funcao_id);
CREATE INDEX idx_func_equipamentos_funcao   ON funcao_equipamentos(funcao_id);
CREATE INDEX idx_func_epis_funcao           ON funcao_epis(funcao_id);
CREATE INDEX idx_func_riscos_funcao         ON funcao_riscos_ergonomicos(funcao_id);
CREATE INDEX idx_func_riscos_class_risco    ON funcao_riscos_ergonomicos(classificacao_risco_id);
CREATE INDEX idx_func_riscos_fator_biom     ON funcao_riscos_ergonomicos(fator_risco_biomecanico_id);
CREATE INDEX idx_func_melhorias_funcao      ON funcao_melhorias(funcao_id);
CREATE INDEX idx_func_melhorias_class_risco ON funcao_melhorias(classificacao_risco_id);
CREATE INDEX idx_func_respostas_checklist   ON funcao_respostas_checklist(funcao_id);
