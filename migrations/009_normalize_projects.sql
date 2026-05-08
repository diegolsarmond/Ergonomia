-- ============================================================
-- MIGRAÇÃO 009 — Estrutura relacional normalizada para AEP e AET
-- Substitui aet_projetos (JSONB) e tabelas anteriores não utilizadas
-- por esquemas relacionais separados por tipo de análise.
-- ============================================================

-- ============================================================
-- PARTE 1 — DROP das tabelas antigas (ordem: filhos → pais)
-- ============================================================

-- Migração 005 — AEP Assessment estruturada
DROP TABLE IF EXISTS aep_acoes_raci CASCADE;
DROP TABLE IF EXISTS aep_gatilhos_aet CASCADE;
DROP TABLE IF EXISTS aep_respostas_psicossocial CASCADE;
DROP TABLE IF EXISTS aep_ferramentas_cientificas CASCADE;
DROP TABLE IF EXISTS aep_itens_biomecanica CASCADE;
DROP TABLE IF EXISTS aep_registros_fotograficos CASCADE;
DROP TABLE IF EXISTS aep_avaliacoes CASCADE;

-- Migração 004 — Medições de iluminância
DROP TABLE IF EXISTS medicao_inconsistencia_itens CASCADE;
DROP TABLE IF EXISTS medicao_verificacao_itens CASCADE;
DROP TABLE IF EXISTS medicao_linha_medias CASCADE;
DROP TABLE IF EXISTS medicao_pontos_grade CASCADE;
DROP TABLE IF EXISTS medicao_linha_valores CASCADE;
DROP TABLE IF EXISTS medicao_iluminancia_linhas CASCADE;
DROP TABLE IF EXISTS medicoes_iluminancia CASCADE;

-- Migração 003 — AET/AEP Projects (estrutura relacional anterior não utilizada)
DROP TABLE IF EXISTS funcao_respostas_checklist CASCADE;
DROP TABLE IF EXISTS funcao_melhorias CASCADE;
DROP TABLE IF EXISTS funcao_riscos_ergonomicos CASCADE;
DROP TABLE IF EXISTS funcao_epis CASCADE;
DROP TABLE IF EXISTS funcao_equipamentos CASCADE;
DROP TABLE IF EXISTS funcao_imagens CASCADE;
DROP TABLE IF EXISTS funcao_metodos_cientificos CASCADE;
DROP TABLE IF EXISTS iluminacao_checklist_itens CASCADE;
DROP TABLE IF EXISTS iluminacao_pontos_medicao CASCADE;
DROP TABLE IF EXISTS funcao_iluminacoes CASCADE;
DROP TABLE IF EXISTS funcoes CASCADE;
DROP TABLE IF EXISTS aet_avaliadores CASCADE;
DROP TABLE IF EXISTS analise_trabalho CASCADE;
DROP TABLE IF EXISTS analise_preliminar CASCADE;

-- Migração 008 — Armazenamento JSON
DROP TABLE IF EXISTS aet_projetos CASCADE;

-- ============================================================
-- PARTE 2 — Estrutura relacional para AEP
--            (Análise Ergonômica Preliminar)
-- ============================================================

-- Projeto AEP — cabeçalho
CREATE TABLE aep_projetos (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Empresa
  nome_empresa     TEXT,
  nome_fantasia    TEXT,
  cnpj             TEXT,
  endereco         TEXT,
  unidade          TEXT,
  produto          TEXT,
  grau_risco       TEXT,
  localizacao      TEXT,
  -- Introdução
  intro_ergonomia  TEXT,
  intro_objetivo   TEXT,
  intro_metodologia TEXT,
  -- Responsável técnico do projeto
  nome_avaliador       TEXT,
  formacao_avaliador   TEXT,
  crefito_avaliador    TEXT,
  empresa_avaliador    TEXT,
  assinatura_avaliador TEXT,
  data                 DATE,
  -- Logos (base64 data URLs)
  logo_consultoria TEXT,
  logo_empresa     TEXT,
  logo_responsavel TEXT,
  criado_em        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Funções avaliadas AEP — 1:N com projeto
CREATE TABLE aep_funcoes (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  projeto_id  UUID        NOT NULL REFERENCES aep_projetos(id) ON DELETE CASCADE,
  ordem       INT         NOT NULL DEFAULT 0,

  -- Seção 1 — Identificação
  nome_funcao           TEXT,
  codigo_posto          TEXT,
  unidade_filial        TEXT,
  setor_area            TEXT,
  funcoes_contempladas  TEXT,
  atividade_avaliada    TEXT,
  num_funcionarios      TEXT,
  data_analise          DATE,

  -- Seção 2.1 — Processo
  descricao_processo       TEXT,
  descricao_ciclo_trabalho TEXT,

  -- Seção 2.2 — Organização do trabalho
  jornada_trabalho   TEXT,
  escala             TEXT,
  horas_extras       TEXT,
  intervalo_almoco   TEXT,
  outras_pausas      TEXT,
  rodizio_tarefas    TEXT,
  dialogos_seguranca TEXT,

  -- Seção 2.3 — Ferramentas e materiais
  descricao_equipamentos TEXT,
  epis_utilizados        TEXT,
  outros_materiais       TEXT,

  -- Seção 3 — Nota LGPD
  nota_lgpd TEXT,

  -- Seção 4.6 — Conforto ambiental: Iluminação
  reclamacao_iluminacao TEXT CHECK (reclamacao_iluminacao IN ('Sim','Não','')),
  valor_iluminacao      TEXT,
  descricao_iluminacao  TEXT,
  -- Ruído
  reclamacao_ruido      TEXT CHECK (reclamacao_ruido IN ('Sim','Não','')),
  valor_ruido           TEXT,
  descricao_ruido       TEXT,
  -- Temperatura
  reclamacao_temperatura TEXT CHECK (reclamacao_temperatura IN ('Sim','Não','')),
  valor_temperatura      TEXT,
  descricao_temperatura  TEXT,

  -- Seção 6 — Médias psicossociais calculadas
  psi_media_demanda_ritmo       NUMERIC(5,2),
  psi_media_autonomia_controle  NUMERIC(5,2),
  psi_media_clareza_papel       NUMERIC(5,2),
  psi_media_apoio_social        NUMERIC(5,2),
  psi_media_reconhecimento      NUMERIC(5,2),
  psi_media_geral               NUMERIC(5,2),
  psi_classificacao TEXT CHECK (psi_classificacao IN ('VERDE','AMARELO','VERMELHO','')),
  psi_interpretacao TEXT,

  -- Seção 7 — Classificação de risco
  requer_aet           BOOLEAN DEFAULT FALSE,
  orientacao_final     TEXT,
  justificativa_decisao TEXT,

  -- Seção 9 — Responsável técnico da função
  resp_nome      TEXT,
  resp_registro  TEXT,
  resp_formacao  TEXT,
  resp_empresa   TEXT,
  resp_assinatura TEXT,

  criado_em     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seção 3 — Registros fotográficos — 1:N
CREATE TABLE aep_funcao_fotos (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  funcao_id  UUID NOT NULL REFERENCES aep_funcoes(id) ON DELETE CASCADE,
  imagem_url TEXT NOT NULL,
  descricao  TEXT,
  ordem      INT  NOT NULL DEFAULT 0
);

-- Seção 4 — Itens biomecânicos por categoria — 1:N
CREATE TABLE aep_funcao_biomecanica (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  funcao_id           UUID NOT NULL REFERENCES aep_funcoes(id) ON DELETE CASCADE,
  categoria           TEXT NOT NULL CHECK (categoria IN (
                        'postura_e_alcance',
                        'repetitividade_e_ritmo',
                        'forca_e_demanda_fisica',
                        'manuseio_manual_materiais',
                        'moveis_e_posto'
                      )),
  fator_risco_id      UUID REFERENCES fatores_risco_biomecanico(id) ON DELETE SET NULL,
  fator_risco_texto   TEXT,
  avaliacao           TEXT CHECK (avaliacao IN ('OK','Atenção','Crítico','N.A.','')),
  observacoes         TEXT,
  ordem               INT  NOT NULL DEFAULT 0
);

-- Seção 5 — Ferramentas científicas — 1:N
CREATE TABLE aep_funcao_ferramentas_cientificas (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  funcao_id      UUID NOT NULL REFERENCES aep_funcoes(id) ON DELETE CASCADE,
  modelo_id      UUID REFERENCES modelos_metodo_cientifico(id) ON DELETE SET NULL,
  nome_ferramenta TEXT,
  resultado       TEXT,
  interpretacao   TEXT,
  recomendacao    TEXT,
  imagem_url      TEXT,
  ordem           INT  NOT NULL DEFAULT 0
);

-- Seção 5b — Medições de iluminância (malha) — 1:N por posto
CREATE TABLE aep_funcao_iluminancia (
  id                      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  funcao_id               UUID        NOT NULL REFERENCES aep_funcoes(id) ON DELETE CASCADE,
  posto                   TEXT,
  ambiente                TEXT,
  tipo_ambiente           TEXT,
  lux_minimo_recomendado  NUMERIC(10,2),
  irc_ra                  TEXT,
  escala                  TEXT        DEFAULT 'lux',
  parametro_normativo_id  UUID        REFERENCES parametros_normativos_iluminancia(id) ON DELETE SET NULL,
  -- Parâmetros da malha NHO11
  tipo_geometria          TEXT        CHECK (tipo_geometria IN ('A1','A2','A3','A4','A5','A6')),
  grade_n                 INT,
  grade_m                 INT,
  grade_largura           NUMERIC(8,2),
  grade_comprimento       NUMERIC(8,2),
  grade_max_colunas       INT,
  -- Grade simples (entrada direta de pontos)
  grid_linhas             INT,
  grid_colunas            INT,
  grade_schema_imagem     TEXT,
  -- Resultados calculados
  calc_qtd_pontos         INT,
  calc_media_lux          NUMERIC(10,2),
  calc_lux_minimo         NUMERIC(10,2),
  calc_lux_maximo         NUMERIC(10,2),
  calc_lux_tolerancia     NUMERIC(10,2),
  calc_media_setenta_pct  NUMERIC(10,2),
  calc_razao_uniformidade NUMERIC(10,4),
  calc_valor_area_tarefa  NUMERIC(10,2),
  -- Avaliação
  aval_status             TEXT        CHECK (aval_status IN ('Adequado','Inadequado','')),
  aval_media_adequada     BOOLEAN,
  aval_tolerancia_ok      BOOLEAN,
  -- Equipamento (luxímetro)
  equip_nome              TEXT,
  equip_certificado       TEXT,
  equip_data_calibracao   TEXT,
  equip_cert_imagem       TEXT,
  equip_observacoes       TEXT,
  -- Metadados
  observacoes             TEXT,
  data_medicao            TEXT,
  usuario_responsavel     TEXT,
  status_formulario       TEXT        CHECK (status_formulario IN ('rascunho','finalizado')),
  ordem                   INT         NOT NULL DEFAULT 0,
  criado_em               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Linhas de medição NHO11 — 1:N por medição
CREATE TABLE aep_funcao_iluminancia_linhas (
  id            UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  iluminancia_id UUID   NOT NULL REFERENCES aep_funcao_iluminancia(id) ON DELETE CASCADE,
  tipo_linha    TEXT    NOT NULL CHECK (tipo_linha IN ('r','q','p','t')),
  indice_linha  INT     NOT NULL,
  valores       JSONB   NOT NULL DEFAULT '[]',
  colunas_ativas INT    DEFAULT 0,
  flags_na      JSONB   DEFAULT '[]',
  ordem         INT     NOT NULL DEFAULT 0
);

-- Pontos da grade simples — 1:N por medição
CREATE TABLE aep_funcao_iluminancia_pontos (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  iluminancia_id UUID        NOT NULL REFERENCES aep_funcao_iluminancia(id) ON DELETE CASCADE,
  linha         INT          NOT NULL,
  coluna        INT          NOT NULL,
  lux           NUMERIC(10,2),
  nao_aplicavel BOOLEAN      DEFAULT FALSE,
  UNIQUE (iluminancia_id, linha, coluna)
);

-- Itens de verificação do sistema de iluminação — 1:N
CREATE TABLE aep_funcao_iluminancia_verificacao (
  id            UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  iluminancia_id UUID   NOT NULL REFERENCES aep_funcao_iluminancia(id) ON DELETE CASCADE,
  item_id       TEXT    NOT NULL,
  pergunta      TEXT,
  resposta      TEXT    CHECK (resposta IN ('Sim','Não','NA','')),
  observacoes   TEXT,
  ordem         INT     NOT NULL DEFAULT 0
);

-- Itens de inconsistência da iluminância — 1:N
CREATE TABLE aep_funcao_iluminancia_inconsistencias (
  id            UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  iluminancia_id UUID   NOT NULL REFERENCES aep_funcao_iluminancia(id) ON DELETE CASCADE,
  item_id       TEXT    NOT NULL,
  titulo        TEXT,
  descricao     TEXT,
  encontrado    BOOLEAN DEFAULT FALSE,
  observacoes   TEXT,
  ordem         INT     NOT NULL DEFAULT 0
);

-- Seção 6 — Respostas psicossociais individuais — 1:N (13 perguntas fixas psy-1..psy-13)
CREATE TABLE aep_funcao_psicossocial (
  id             UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  funcao_id      UUID    NOT NULL REFERENCES aep_funcoes(id) ON DELETE CASCADE,
  chave_pergunta TEXT    NOT NULL,
  grupo          TEXT,
  pergunta       TEXT,
  pontuacao      SMALLINT CHECK (pontuacao BETWEEN 1 AND 5),
  rotulo_escala  TEXT,
  invertida      BOOLEAN DEFAULT FALSE,
  comentarios    TEXT,
  ordem          INT     NOT NULL DEFAULT 0,
  UNIQUE (funcao_id, chave_pergunta)
);

-- Seção 7 — Gatilhos AET — 1:N (7 gatilhos fixos trig-1..trig-7)
CREATE TABLE aep_funcao_gatilhos (
  id             UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  funcao_id      UUID    NOT NULL REFERENCES aep_funcoes(id) ON DELETE CASCADE,
  chave_gatilho  TEXT    NOT NULL,
  descricao      TEXT,
  resposta       TEXT    CHECK (resposta IN ('Sim','Não','')),
  ordem          INT     NOT NULL DEFAULT 0,
  UNIQUE (funcao_id, chave_gatilho)
);

-- Seção 8 — Plano de ação RACI — 1:N
CREATE TABLE aep_funcao_acoes_raci (
  id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  funcao_id   UUID    NOT NULL REFERENCES aep_funcoes(id) ON DELETE CASCADE,
  fator_risco TEXT,
  acao        TEXT,
  responsavel TEXT,
  aprovador   TEXT,
  consultado  TEXT,
  informado   TEXT,
  prazo       TEXT,
  prioridade  TEXT    CHECK (prioridade IN ('Baixa','Média','Alta','Crítica','')),
  status      TEXT    CHECK (status IN ('Pendente','Em andamento','Concluído','Cancelado','')),
  ordem       INT     NOT NULL DEFAULT 0
);

-- ============================================================
-- PARTE 3 — Estrutura relacional para AET
--            (Análise Ergonômica do Trabalho)
-- ============================================================

-- Projeto AET — cabeçalho
CREATE TABLE aet_projetos (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Empresa
  nome_empresa     TEXT,
  nome_fantasia    TEXT,
  cnpj             TEXT,
  endereco         TEXT,
  unidade          TEXT,
  produto          TEXT,
  grau_risco       TEXT,
  localizacao      TEXT,
  -- Introdução
  intro_ergonomia  TEXT,
  intro_objetivo   TEXT,
  intro_metodologia TEXT,
  -- Responsável técnico
  nome_avaliador       TEXT,
  formacao_avaliador   TEXT,
  crefito_avaliador    TEXT,
  empresa_avaliador    TEXT,
  assinatura_avaliador TEXT,
  data                 DATE,
  -- Logos (base64 data URLs)
  logo_consultoria TEXT,
  logo_empresa     TEXT,
  logo_responsavel TEXT,
  criado_em        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Funções avaliadas AET — 1:N com projeto
CREATE TABLE aet_funcoes (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  projeto_id  UUID        NOT NULL REFERENCES aet_projetos(id) ON DELETE CASCADE,
  ordem       INT         NOT NULL DEFAULT 0,

  -- 4.1 Cabeçalho
  nome_funcao      TEXT,
  unidade          TEXT,
  setor            TEXT,
  data_analise     DATE,
  num_funcionarios TEXT,

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
  turnos                 TEXT,
  inicio_turno           TEXT,
  fim_turno              TEXT,
  dias_trabalho          TEXT,
  horas_extras           TEXT,
  pausas                 TEXT,
  rodizio_tarefas        TEXT,
  distancia_banheiro     TEXT,
  condicao_banheiro      TEXT,
  organograma_hierarquia TEXT,
  descricao_posto        TEXT,

  -- 4.8 Colaborador
  formacao_colaborador TEXT,
  turno_colaborador    TEXT,
  opiniao_genero       TEXT,
  opiniao_idade        TEXT,
  opiniao_tempo        TEXT,

  -- 4.9 Opinião do trabalhador (18 campos)
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

  -- 4.17 Equipamentos e EPIs (flags booleanas; itens ficam em sub-tabelas)
  usa_equipamento       BOOLEAN NOT NULL DEFAULT FALSE,
  usa_epi               BOOLEAN NOT NULL DEFAULT FALSE,
  problemas_equipamento TEXT,

  -- 4.18 Modo operatório
  ciclo_prescrito TEXT,
  ciclo_real      TEXT,

  -- 4.19 Predominância postural (%)
  postura_sentado_pct     NUMERIC(5,2) DEFAULT 0,
  postura_em_pe_pct       NUMERIC(5,2) DEFAULT 0,
  postura_caminhando_pct  NUMERIC(5,2) DEFAULT 0,
  postura_agachado_pct    NUMERIC(5,2) DEFAULT 0,
  postura_outro_pct       NUMERIC(5,2) DEFAULT 0,
  postura_outro_descricao TEXT,

  -- 4.20 Meio ambiente
  meio_ambiente TEXT,

  -- Diagnóstico final
  diagnostico    TEXT,
  nivel_risco    TEXT,
  pontuacao_rula TEXT,

  -- Iluminação NHO11 — campos escalares (AETIllumination)
  ilum_local               TEXT,
  ilum_data                TEXT,
  ilum_tipo_iluminacao     TEXT,
  ilum_introducao          TEXT,
  ilum_objetivo            TEXT,
  ilum_justificativa       TEXT,
  ilum_descricao_ambiente  TEXT,
  ilum_sistema_iluminacao  TEXT,
  ilum_atividades          TEXT,
  ilum_criterios           TEXT,
  ilum_valores_medidos     TEXT,
  ilum_valor_referencia    TEXT,
  ilum_formula             TEXT,
  ilum_resultado_lux       TEXT,
  ilum_interpretacao       TEXT,
  ilum_referencia_normativa TEXT,
  ilum_tipo_modelo         TEXT,
  ilum_conclusao           TEXT CHECK (ilum_conclusao IN ('adequada','inadequada','não_aplicável','')),
  ilum_texto_conclusao     TEXT,
  ilum_lux_referencia      NUMERIC(10,2) DEFAULT 0,

  criado_em     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4.17 Equipamentos da função AET — 1:N
CREATE TABLE aet_funcao_equipamentos (
  id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  funcao_id   UUID    NOT NULL REFERENCES aet_funcoes(id) ON DELETE CASCADE,
  nome        TEXT,
  quantidade  TEXT,
  dimensoes   TEXT,
  principio   TEXT    CHECK (principio IN ('manual','eletrico','hidraulico','pneumatico','')),
  condicao    TEXT,
  observacoes TEXT,
  ordem       INT     NOT NULL DEFAULT 0
);

-- 4.17 EPIs da função AET — 1:N
CREATE TABLE aet_funcao_epis (
  id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  funcao_id   UUID    NOT NULL REFERENCES aet_funcoes(id) ON DELETE CASCADE,
  nome        TEXT,
  obrigatorio BOOLEAN NOT NULL DEFAULT FALSE,
  eventual    BOOLEAN NOT NULL DEFAULT FALSE,
  local       TEXT,
  observacoes TEXT,
  ordem       INT     NOT NULL DEFAULT 0
);

-- Métodos científicos da função AET — 1:N
CREATE TABLE aet_funcao_metodos_cientificos (
  id              UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  funcao_id       UUID    NOT NULL REFERENCES aet_funcoes(id) ON DELETE CASCADE,
  modelo_id       UUID    REFERENCES modelos_metodo_cientifico(id) ON DELETE SET NULL,
  nome_metodo     TEXT,
  descricao       TEXT,
  resultado       TEXT,
  classificacao_risco TEXT,
  interpretacao   TEXT,
  imagem_url      TEXT,
  recomendacoes   TEXT,
  ordem           INT     NOT NULL DEFAULT 0
);

-- Pontos de medição NHO11 da iluminação AET — 1:N
CREATE TABLE aet_funcao_iluminancia_pontos (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  funcao_id   UUID         NOT NULL REFERENCES aet_funcoes(id) ON DELETE CASCADE,
  rotulo      TEXT,
  lux         NUMERIC(10,2),
  ordem       INT          NOT NULL DEFAULT 0
);

-- Checklist de iluminação AET — 1:N
CREATE TABLE aet_funcao_iluminancia_checklist (
  id               UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  funcao_id        UUID    NOT NULL REFERENCES aet_funcoes(id) ON DELETE CASCADE,
  descricao        TEXT    NOT NULL,
  conforme         TEXT    CHECK (conforme IN ('sim','nao','')),
  acao_recomendada TEXT,
  prazo            TEXT,
  responsavel      TEXT,
  observacoes      TEXT,
  ordem            INT     NOT NULL DEFAULT 0
);

-- Imagens da função AET — 1:N
CREATE TABLE aet_funcao_imagens (
  id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  funcao_id   UUID    NOT NULL REFERENCES aet_funcoes(id) ON DELETE CASCADE,
  categoria   TEXT    CHECK (categoria IN (
                'workplace','bathroom','equipment','posture','method','risk_evidence','other'
              )),
  imagem_url  TEXT    NOT NULL,
  legenda     TEXT,
  ordem       INT     NOT NULL DEFAULT 0
);

-- Riscos ergonômicos da função AET — 1:N
CREATE TABLE aet_funcao_riscos (
  id                  UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  funcao_id           UUID    NOT NULL REFERENCES aet_funcoes(id) ON DELETE CASCADE,
  agente              TEXT,
  fator_risco         TEXT,
  efeito_saude        TEXT,
  situacao_encontrada TEXT,
  controle_existente  TEXT,
  proposta_melhoria   TEXT,
  probabilidade       SMALLINT CHECK (probabilidade BETWEEN 1 AND 5),
  gravidade           SMALLINT CHECK (gravidade BETWEEN 1 AND 5),
  pontuacao           SMALLINT GENERATED ALWAYS AS (probabilidade * gravidade) STORED,
  nivel_risco         TEXT,
  referencia_normativa TEXT,
  imagem_evidencia_url TEXT,
  responsavel         TEXT,
  prazo               TEXT,
  status              TEXT,
  ordem               INT     NOT NULL DEFAULT 0
);

-- Melhorias / Plano de ação AET — 1:N
CREATE TABLE aet_funcao_melhorias (
  id                      UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  funcao_id               UUID    NOT NULL REFERENCES aet_funcoes(id) ON DELETE CASCADE,
  foto_url                TEXT,
  perigo                  TEXT,
  probabilidade           TEXT,
  gravidade               TEXT,
  nivel_risco_bruto       TEXT,
  classificacao_risco     TEXT,
  avaliacao_risco         TEXT,
  acoes                   TEXT,
  probabilidade_atenuacao TEXT,
  prazo                   TEXT,
  responsavel             TEXT,
  observacoes             TEXT,
  ordem                   INT     NOT NULL DEFAULT 0
);

-- Respostas do checklist de ergonomia AET — 1:N
CREATE TABLE aet_funcao_checklist (
  id              UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  funcao_id       UUID    NOT NULL REFERENCES aet_funcoes(id) ON DELETE CASCADE,
  pergunta_id     UUID    REFERENCES perguntas_checklist(id) ON DELETE SET NULL,
  pergunta_id_str TEXT,
  resposta        TEXT    CHECK (resposta IN ('sim','nao','nao_se_aplica','')),
  UNIQUE (funcao_id, pergunta_id)
);

-- ============================================================
-- PARTE 4 — Índices
-- ============================================================

-- AEP
CREATE INDEX idx_aep_projetos_criado         ON aep_projetos(criado_em);
CREATE INDEX idx_aep_funcoes_projeto         ON aep_funcoes(projeto_id);
CREATE INDEX idx_aep_fotos_funcao            ON aep_funcao_fotos(funcao_id);
CREATE INDEX idx_aep_biomecanica_funcao      ON aep_funcao_biomecanica(funcao_id);
CREATE INDEX idx_aep_ferramentas_funcao      ON aep_funcao_ferramentas_cientificas(funcao_id);
CREATE INDEX idx_aep_iluminancia_funcao      ON aep_funcao_iluminancia(funcao_id);
CREATE INDEX idx_aep_ilum_linhas             ON aep_funcao_iluminancia_linhas(iluminancia_id);
CREATE INDEX idx_aep_ilum_pontos             ON aep_funcao_iluminancia_pontos(iluminancia_id);
CREATE INDEX idx_aep_ilum_verificacao        ON aep_funcao_iluminancia_verificacao(iluminancia_id);
CREATE INDEX idx_aep_ilum_inconsistencias    ON aep_funcao_iluminancia_inconsistencias(iluminancia_id);
CREATE INDEX idx_aep_psicossocial_funcao     ON aep_funcao_psicossocial(funcao_id);
CREATE INDEX idx_aep_gatilhos_funcao         ON aep_funcao_gatilhos(funcao_id);
CREATE INDEX idx_aep_raci_funcao             ON aep_funcao_acoes_raci(funcao_id);

-- AET
CREATE INDEX idx_aet_projetos_criado         ON aet_projetos(criado_em);
CREATE INDEX idx_aet_funcoes_projeto         ON aet_funcoes(projeto_id);
CREATE INDEX idx_aet_equipamentos_funcao     ON aet_funcao_equipamentos(funcao_id);
CREATE INDEX idx_aet_epis_funcao             ON aet_funcao_epis(funcao_id);
CREATE INDEX idx_aet_metodos_funcao          ON aet_funcao_metodos_cientificos(funcao_id);
CREATE INDEX idx_aet_ilum_pontos             ON aet_funcao_iluminancia_pontos(funcao_id);
CREATE INDEX idx_aet_ilum_checklist          ON aet_funcao_iluminancia_checklist(funcao_id);
CREATE INDEX idx_aet_imagens_funcao          ON aet_funcao_imagens(funcao_id);
CREATE INDEX idx_aet_riscos_funcao           ON aet_funcao_riscos(funcao_id);
CREATE INDEX idx_aet_melhorias_funcao        ON aet_funcao_melhorias(funcao_id);
CREATE INDEX idx_aet_checklist_funcao        ON aet_funcao_checklist(funcao_id);

-- ============================================================
-- PARTE 5 — Triggers de atualização automática
-- ============================================================

CREATE OR REPLACE FUNCTION atualiza_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_aep_projetos_atualizado ON aep_projetos;
CREATE TRIGGER trg_aep_projetos_atualizado
  BEFORE UPDATE ON aep_projetos
  FOR EACH ROW EXECUTE FUNCTION atualiza_timestamp();

DROP TRIGGER IF EXISTS trg_aep_funcoes_atualizado ON aep_funcoes;
CREATE TRIGGER trg_aep_funcoes_atualizado
  BEFORE UPDATE ON aep_funcoes
  FOR EACH ROW EXECUTE FUNCTION atualiza_timestamp();

DROP TRIGGER IF EXISTS trg_aet_projetos_atualizado ON aet_projetos;
CREATE TRIGGER trg_aet_projetos_atualizado
  BEFORE UPDATE ON aet_projetos
  FOR EACH ROW EXECUTE FUNCTION atualiza_timestamp();

DROP TRIGGER IF EXISTS trg_aet_funcoes_atualizado ON aet_funcoes;
CREATE TRIGGER trg_aet_funcoes_atualizado
  BEFORE UPDATE ON aet_funcoes
  FOR EACH ROW EXECUTE FUNCTION atualiza_timestamp();

DROP TRIGGER IF EXISTS trg_aep_iluminancia_atualizado ON aep_funcao_iluminancia;
CREATE TRIGGER trg_aep_iluminancia_atualizado
  BEFORE UPDATE ON aep_funcao_iluminancia
  FOR EACH ROW EXECUTE FUNCTION atualiza_timestamp();
