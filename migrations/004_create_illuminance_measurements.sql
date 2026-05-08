-- ============================================================
-- MIGRAÇÃO 004 — Malha de Medição de Iluminância
-- Baseado em ABNT NBR ISO/CIE 8995-1:2013 e NHO 11 (Fundacentro)
-- Geometrias A1–A6
-- ============================================================

-- ------------------------------------------------------------
-- Medição de iluminância (IlluminanceMeasurement)
-- Pode estar ligada a uma avaliação AEP ou diretamente à função (AET simples)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS medicoes_iluminancia (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Referência: avaliacao_aep_id OU funcao_id (apenas um preenchido)
  avaliacao_aep_id UUID,
  funcao_id        UUID,

  posto                  TEXT,
  ambiente               TEXT,
  tipo_ambiente          TEXT,
  -- Parâmetro normativo que define os valores de referência (lux mínimo, IRC etc.)
  parametro_normativo_id UUID,

  -- Parâmetros da malha (GridParameters)
  tipo_geometria    TEXT        CHECK (tipo_geometria IN ('A1','A2','A3','A4','A5','A6')),
  grade_n           INT,        -- número de luminárias por fila
  grade_m           INT,        -- número de filas
  grade_largura     NUMERIC(8,2), -- largura do recinto (m)
  grade_comprimento NUMERIC(8,2), -- comprimento do recinto (m)
  grade_max_colunas INT,

  -- Imagem do esquema da malha
  imagem_esquema_grade_url TEXT,

  -- Dados do equipamento / luxímetro (EquipmentData)
  equipamento_nome                TEXT,
  equipamento_certificado         TEXT,
  equipamento_data_calibracao     DATE,
  equipamento_certificado_img_url TEXT,
  equipamento_observacoes         TEXT,

  -- Resultados de cálculo (IlluminanceCalculationResult) — desnormalizado para leitura rápida
  calc_qtd_pontos_medidos    INT,
  calc_media_lux             NUMERIC(10,2),
  calc_lux_minimo            NUMERIC(10,2),
  calc_lux_maximo            NUMERIC(10,2),
  calc_lux_minimo_tolerancia NUMERIC(10,2),
  calc_media_setenta_pct     NUMERIC(10,2),
  calc_razao_uniformidade    NUMERIC(10,4),
  calc_valor_area_tarefa     NUMERIC(10,2),

  -- Resultado de avaliação (IlluminanceEvaluationResult)
  aval_status         TEXT    CHECK (aval_status IN ('Adequado','Inadequado','')),
  aval_media_adequada BOOLEAN,
  aval_tolerancia_ok  BOOLEAN,

  -- Metadados
  observacoes           TEXT,
  data_medicao          DATE,
  usuario_responsavel   TEXT,
  status_formulario     TEXT NOT NULL DEFAULT 'rascunho'
                          CHECK (status_formulario IN ('rascunho','finalizado')),

  criado_em     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Apenas uma das chaves pai deve estar preenchida
  CONSTRAINT chk_medicao_pai CHECK (
    (avaliacao_aep_id IS NOT NULL AND funcao_id IS NULL) OR
    (avaliacao_aep_id IS NULL     AND funcao_id IS NOT NULL)
  )
);

-- ------------------------------------------------------------
-- Linhas de medição da malha (MeasurementRow)
-- tipo_linha: 'r' = entre luminárias, 'q' = entre fileiras, 'p' = parede, 't' = tarefa
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS medicao_iluminancia_linhas (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medicao_id   UUID NOT NULL,
  tipo_linha   TEXT NOT NULL CHECK (tipo_linha IN ('r','q','p','t')),
  indice_linha INT  NOT NULL,
  colunas_ativas INT NOT NULL DEFAULT 0,
  ordem        INT  NOT NULL DEFAULT 0
);

-- Valores de cada célula da linha (normalizados)
CREATE TABLE IF NOT EXISTS medicao_linha_valores (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  linha_id      UUID         NOT NULL,
  indice_coluna INT          NOT NULL,
  lux           NUMERIC(10,2),  -- NULL = não medido
  nao_aplicavel BOOLEAN      NOT NULL DEFAULT FALSE
);

-- ------------------------------------------------------------
-- Pontos da malha cartesiana (GridPoint)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS medicao_pontos_grade (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  medicao_id    UUID         NOT NULL,
  indice_linha  INT          NOT NULL,
  indice_coluna INT          NOT NULL,
  lux           NUMERIC(10,2),
  nao_aplicavel BOOLEAN      NOT NULL DEFAULT FALSE,
  UNIQUE (medicao_id, indice_linha, indice_coluna)
);

-- Médias por linha de medição
CREATE TABLE IF NOT EXISTS medicao_linha_medias (
  id           UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  medicao_id   UUID          NOT NULL,
  tipo_linha   TEXT          NOT NULL CHECK (tipo_linha IN ('r','q','p','t')),
  indice_linha INT           NOT NULL,
  media_lux    NUMERIC(10,4)
);

-- ------------------------------------------------------------
-- Verificação do sistema de iluminação (VerificationItem)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS medicao_verificacao_itens (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medicao_id UUID NOT NULL,
  pergunta   TEXT NOT NULL,
  resposta   TEXT CHECK (resposta IN ('Sim','Não','NA','')),
  observacoes TEXT,
  ordem      INT  NOT NULL DEFAULT 0
);

-- ------------------------------------------------------------
-- Inconsistências detectadas (InconsistencyItem)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS medicao_inconsistencia_itens (
  id         UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  medicao_id UUID    NOT NULL,
  titulo     TEXT    NOT NULL,
  descricao  TEXT,
  encontrado BOOLEAN NOT NULL DEFAULT FALSE,
  observacoes TEXT,
  ordem      INT     NOT NULL DEFAULT 0
);

-- ------------------------------------------------------------
-- Chaves estrangeiras
-- (avaliacao_aep_id → aep_avaliacoes será adicionado em 005 após criar essa tabela)
-- ------------------------------------------------------------
ALTER TABLE medicoes_iluminancia
  ADD CONSTRAINT fk_medicoes_funcao
  FOREIGN KEY (funcao_id) REFERENCES funcoes(id) ON DELETE CASCADE;

ALTER TABLE medicoes_iluminancia
  ADD CONSTRAINT fk_medicoes_param_norm
  FOREIGN KEY (parametro_normativo_id) REFERENCES parametros_normativos_iluminancia(id) ON DELETE SET NULL;

ALTER TABLE medicao_iluminancia_linhas
  ADD CONSTRAINT fk_med_linhas_medicao
  FOREIGN KEY (medicao_id) REFERENCES medicoes_iluminancia(id) ON DELETE CASCADE;

ALTER TABLE medicao_linha_valores
  ADD CONSTRAINT fk_med_linha_vals_linha
  FOREIGN KEY (linha_id) REFERENCES medicao_iluminancia_linhas(id) ON DELETE CASCADE;

ALTER TABLE medicao_pontos_grade
  ADD CONSTRAINT fk_med_pontos_grade_medicao
  FOREIGN KEY (medicao_id) REFERENCES medicoes_iluminancia(id) ON DELETE CASCADE;

ALTER TABLE medicao_linha_medias
  ADD CONSTRAINT fk_med_linha_medias_medicao
  FOREIGN KEY (medicao_id) REFERENCES medicoes_iluminancia(id) ON DELETE CASCADE;

ALTER TABLE medicao_verificacao_itens
  ADD CONSTRAINT fk_med_verificacao_medicao
  FOREIGN KEY (medicao_id) REFERENCES medicoes_iluminancia(id) ON DELETE CASCADE;

ALTER TABLE medicao_inconsistencia_itens
  ADD CONSTRAINT fk_med_inconsistencia_medicao
  FOREIGN KEY (medicao_id) REFERENCES medicoes_iluminancia(id) ON DELETE CASCADE;

-- ------------------------------------------------------------
-- Índices
-- ------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_medicoes_aep_aval   ON medicoes_iluminancia(avaliacao_aep_id);
CREATE INDEX IF NOT EXISTS idx_medicoes_param_norm  ON medicoes_iluminancia(parametro_normativo_id);
CREATE INDEX IF NOT EXISTS idx_medicoes_funcao      ON medicoes_iluminancia(funcao_id);
CREATE INDEX IF NOT EXISTS idx_med_linhas_medicao   ON medicao_iluminancia_linhas(medicao_id);
CREATE INDEX IF NOT EXISTS idx_med_linha_vals_linha ON medicao_linha_valores(linha_id);
CREATE INDEX IF NOT EXISTS idx_med_pontos_grade     ON medicao_pontos_grade(medicao_id);
CREATE INDEX IF NOT EXISTS idx_med_verificacao_meds ON medicao_verificacao_itens(medicao_id);
CREATE INDEX IF NOT EXISTS idx_med_inconsistencia   ON medicao_inconsistencia_itens(medicao_id);
