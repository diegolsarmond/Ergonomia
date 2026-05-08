-- ============================================================
-- MIGRAÇÃO 005 — Avaliação AEP Estruturada (Planilha AEP 2026)
-- AEPFunctionAssessment: 9 seções completas
-- ATENÇÃO: execute APÓS 003_create_projects.sql e 004_create_illuminance_measurements.sql
-- ============================================================

-- ------------------------------------------------------------
-- Avaliação AEP — cabeçalho (1:1 com funcao)
-- Contém campos escalares das seções 1, 2, 6, 7, 9
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS aep_avaliacoes (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  funcao_id UUID NOT NULL UNIQUE,

  -- Seção 1 — Identificação
  unidade_filial       TEXT,
  setor_area           TEXT,
  funcoes_contempladas TEXT,
  atividade_avaliada   TEXT,
  codigo               TEXT,

  -- Seção 2 — Caracterização do Trabalho
  descricao_processo       TEXT,
  descricao_ciclo_trabalho TEXT,
  -- Organização do trabalho (prefixo ot_)
  ot_jornada            TEXT,
  ot_escala             TEXT,
  ot_horas_extras       TEXT,
  ot_intervalo_almoco   TEXT,
  ot_outras_pausas      TEXT,
  ot_rodizio_tarefas    TEXT,
  ot_dialogos_seguranca TEXT,
  -- Ferramentas e materiais (prefixo fm_)
  fm_descricao TEXT,
  fm_epis      TEXT,
  fm_outros    TEXT,

  -- Seção 3 — Registro fotográfico
  nota_lgpd TEXT,

  -- Seção 4 — Conforto ambiental (prefixo amb_)
  amb_reclamacao_iluminacao  TEXT CHECK (amb_reclamacao_iluminacao  IN ('Sim','Não','')),
  amb_valor_iluminacao       TEXT,
  amb_descricao_iluminacao   TEXT,
  amb_reclamacao_ruido       TEXT CHECK (amb_reclamacao_ruido       IN ('Sim','Não','')),
  amb_valor_ruido            TEXT,
  amb_descricao_ruido        TEXT,
  amb_reclamacao_temperatura TEXT CHECK (amb_reclamacao_temperatura IN ('Sim','Não','')),
  amb_valor_temperatura      TEXT,
  amb_descricao_temperatura  TEXT,

  -- Seção 6 — Psicossocial — médias calculadas (prefixo psi_)
  psi_media_demanda_ritmo      NUMERIC(5,2),
  psi_media_autonomia_controle NUMERIC(5,2),
  psi_media_clareza_papel      NUMERIC(5,2),
  psi_media_apoio_social       NUMERIC(5,2),
  psi_media_reconhecimento     NUMERIC(5,2),
  psi_media_geral              NUMERIC(5,2),
  psi_classificacao TEXT CHECK (psi_classificacao IN ('VERDE','AMARELO','VERMELHO','')),
  psi_interpretacao TEXT,

  -- Seção 7 — Gatilhos / Classificação de Risco
  orientacao_final      TEXT,
  justificativa_decisao TEXT,

  -- Seção 9 — Responsável Técnico (prefixo resp_)
  resp_nome           TEXT,
  resp_registro       TEXT,
  resp_formacao       TEXT,
  resp_empresa        TEXT,
  resp_assinatura_url TEXT
);

-- ------------------------------------------------------------
-- Seção 3 — Registros fotográficos (PhotoRecord[])
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS aep_registros_fotograficos (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  avaliacao_id UUID NOT NULL,
  imagem_url   TEXT NOT NULL,
  descricao    TEXT,
  ordem        INT  NOT NULL DEFAULT 0
);

-- ------------------------------------------------------------
-- Seção 4 — Biomecânica (BiomechanicalItem[])
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS aep_itens_biomecanica (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  avaliacao_id          UUID NOT NULL,
  categoria             TEXT NOT NULL CHECK (categoria IN (
                          'postura_e_alcance',
                          'repetitividade_e_ritmo',
                          'forca_e_demanda_fisica',
                          'manuseio_manual_materiais',
                          'moveis_e_posto'
                        )),
  fator_risco_id        UUID,
  fator_risco_id_legado TEXT, -- ID original do catálogo (fallback)
  valor_avaliacao       TEXT CHECK (valor_avaliacao IN ('OK','Atenção','Crítico','N.A.','')),
  descricao             TEXT,
  ordem                 INT  NOT NULL DEFAULT 0
);

-- ------------------------------------------------------------
-- Seção 5 — Ferramentas Científicas (ScientificToolItem[])
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS aep_ferramentas_cientificas (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  avaliacao_id UUID NOT NULL,
  modelo_id    UUID,
  resultado    TEXT,
  interpretacao TEXT,
  recomendacao TEXT,
  imagem_url   TEXT,
  ordem        INT  NOT NULL DEFAULT 0
);

-- ------------------------------------------------------------
-- Seção 6 — Respostas psicossociais individuais (PsychosocialQuestion[])
-- 13 perguntas com pontuação 1–5 (Nunca → Sempre)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS aep_respostas_psicossocial (
  id             UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  avaliacao_id   UUID    NOT NULL,
  chave_pergunta TEXT    NOT NULL,  -- ex: 'psy-1', 'psy-2', ...
  nome_grupo     TEXT,
  pergunta       TEXT,
  pontuacao      INT     CHECK (pontuacao BETWEEN 1 AND 5),
  rotulo_escala  TEXT,
  invertida      BOOLEAN NOT NULL DEFAULT FALSE,  -- TRUE = fator protetor
  comentarios    TEXT,
  ordem          INT     NOT NULL DEFAULT 0
);

-- ------------------------------------------------------------
-- Seção 7 — Gatilhos AET (AETTrigger[])
-- 7 gatilhos pré-definidos que decidem se a AET é necessária
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS aep_gatilhos_aet (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  avaliacao_id  UUID NOT NULL,
  chave_gatilho TEXT NOT NULL,  -- 'trig-1' … 'trig-7'
  resposta      TEXT CHECK (resposta IN ('Sim','Não','')),
  descricao     TEXT,
  ordem         INT  NOT NULL DEFAULT 0
);

-- ------------------------------------------------------------
-- Seção 8 — Plano de Ação RACI (RACIAction[])
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS aep_acoes_raci (
  id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  avaliacao_id               UUID NOT NULL,
  fator_risco_biomecanico_id UUID,
  acao                       TEXT,
  responsavel                TEXT,
  aprovador                  TEXT,
  consultado                 TEXT,
  informado                  TEXT,
  prazo                      TEXT,
  prioridade TEXT CHECK (prioridade IN ('Baixa','Média','Alta','Crítica','')),
  status     TEXT CHECK (status     IN ('Pendente','Em andamento','Concluído','Cancelado','')),
  ordem      INT  NOT NULL DEFAULT 0
);

-- ------------------------------------------------------------
-- Chaves estrangeiras
-- ------------------------------------------------------------
ALTER TABLE aep_avaliacoes
  ADD CONSTRAINT fk_aep_avaliacoes_funcao
  FOREIGN KEY (funcao_id) REFERENCES funcoes(id) ON DELETE CASCADE;

ALTER TABLE aep_registros_fotograficos
  ADD CONSTRAINT fk_aep_registros_avaliacao
  FOREIGN KEY (avaliacao_id) REFERENCES aep_avaliacoes(id) ON DELETE CASCADE;

ALTER TABLE aep_itens_biomecanica
  ADD CONSTRAINT fk_aep_biomecanica_avaliacao
  FOREIGN KEY (avaliacao_id) REFERENCES aep_avaliacoes(id) ON DELETE CASCADE;

ALTER TABLE aep_itens_biomecanica
  ADD CONSTRAINT fk_aep_biomecanica_fator_risco
  FOREIGN KEY (fator_risco_id) REFERENCES fatores_risco_biomecanico(id) ON DELETE SET NULL;

ALTER TABLE aep_ferramentas_cientificas
  ADD CONSTRAINT fk_aep_ferramentas_avaliacao
  FOREIGN KEY (avaliacao_id) REFERENCES aep_avaliacoes(id) ON DELETE CASCADE;

ALTER TABLE aep_ferramentas_cientificas
  ADD CONSTRAINT fk_aep_ferramentas_modelo
  FOREIGN KEY (modelo_id) REFERENCES modelos_metodo_cientifico(id) ON DELETE SET NULL;

ALTER TABLE aep_respostas_psicossocial
  ADD CONSTRAINT fk_aep_psicossocial_avaliacao
  FOREIGN KEY (avaliacao_id) REFERENCES aep_avaliacoes(id) ON DELETE CASCADE;

ALTER TABLE aep_gatilhos_aet
  ADD CONSTRAINT fk_aep_gatilhos_avaliacao
  FOREIGN KEY (avaliacao_id) REFERENCES aep_avaliacoes(id) ON DELETE CASCADE;

ALTER TABLE aep_acoes_raci
  ADD CONSTRAINT fk_aep_raci_avaliacao
  FOREIGN KEY (avaliacao_id) REFERENCES aep_avaliacoes(id) ON DELETE CASCADE;

ALTER TABLE aep_acoes_raci
  ADD CONSTRAINT fk_aep_raci_fator_biom
  FOREIGN KEY (fator_risco_biomecanico_id) REFERENCES fatores_risco_biomecanico(id) ON DELETE SET NULL;

-- Agora que aep_avaliacoes existe, adiciona o FK da migração 004
ALTER TABLE medicoes_iluminancia
  ADD CONSTRAINT fk_medicao_aep_avaliacao
  FOREIGN KEY (avaliacao_aep_id) REFERENCES aep_avaliacoes(id) ON DELETE CASCADE;

-- ------------------------------------------------------------
-- Índices
-- ------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_aep_avaliacoes_funcao     ON aep_avaliacoes(funcao_id);
CREATE INDEX IF NOT EXISTS idx_aep_registros_avaliacao   ON aep_registros_fotograficos(avaliacao_id);
CREATE INDEX IF NOT EXISTS idx_aep_biomecanica_avaliacao ON aep_itens_biomecanica(avaliacao_id);
CREATE INDEX IF NOT EXISTS idx_aep_ferramentas_avaliacao ON aep_ferramentas_cientificas(avaliacao_id);
CREATE INDEX IF NOT EXISTS idx_aep_ferramentas_modelo    ON aep_ferramentas_cientificas(modelo_id);
CREATE INDEX IF NOT EXISTS idx_aep_raci_fator_biom       ON aep_acoes_raci(fator_risco_biomecanico_id);
CREATE INDEX IF NOT EXISTS idx_aep_psicossocial_avaliacao ON aep_respostas_psicossocial(avaliacao_id);
CREATE INDEX IF NOT EXISTS idx_aep_gatilhos_avaliacao    ON aep_gatilhos_aet(avaliacao_id);
CREATE INDEX IF NOT EXISTS idx_aep_raci_avaliacao        ON aep_acoes_raci(avaliacao_id);
