-- ============================================================
-- MIGRAÇÃO 006 — Dados iniciais (seed)
-- Parâmetros normativos, classificações de risco e textos padrão
-- ============================================================

-- ------------------------------------------------------------
-- Classificações de risco (Matriz Probabilidade × Gravidade)
-- Pontuação = probabilidade (1–5) × gravidade (1–5) = 1–25
-- ------------------------------------------------------------
INSERT INTO classificacoes_risco (nome, pontuacao_minima, pontuacao_maxima, cor, interpretacao) VALUES
  ('BAIXO',      1,  4,  '#22c55e', 'Risco aceitável. Manter monitoramento periódico.'),
  ('MODERADO',   5,  9,  '#eab308', 'Risco tolerável. Implementar melhorias no médio prazo.'),
  ('ALTO RISCO', 10, 16, '#f97316', 'Risco significativo. Ação corretiva no curto prazo.'),
  ('CRÍTICO',    17, 25, '#ef4444', 'Risco inaceitável. Ação imediata obrigatória.');

-- ------------------------------------------------------------
-- Parâmetros normativos de iluminância — ABNT NBR ISO/CIE 8995-1:2013
-- ------------------------------------------------------------
INSERT INTO parametros_normativos_iluminancia
  (descricao_atividade, lux_minimo, irc_minimo, tolerancia_percentual, razao_uniformidade_max, referencia_normativa, referencia_pagina)
VALUES
  ('Escritório — leitura, redação e processamento de dados',        500, 80, 10, 5, 'ABNT NBR ISO/CIE 8995-1:2013', 'Tabela 5.1'),
  ('Sala de reuniões e conferências',                                500, 80, 10, 5, 'ABNT NBR ISO/CIE 8995-1:2013', 'Tabela 5.1'),
  ('Recepção / hall de entrada',                                     300, 80, 10, 5, 'ABNT NBR ISO/CIE 8995-1:2013', 'Tabela 5.1'),
  ('Corredor e área de circulação interna',                          100, 40, 10, 5, 'ABNT NBR ISO/CIE 8995-1:2013', 'Tabela 5.1'),
  ('Escadas e rampas',                                               150, 40, 10, 5, 'ABNT NBR ISO/CIE 8995-1:2013', 'Tabela 5.1'),
  ('Depósito / almoxarifado',                                        100, 40, 10, 5, 'ABNT NBR ISO/CIE 8995-1:2013', 'Tabela 5.1'),
  ('Indústria — trabalho grosseiro (sem exigência visual fina)',      200, 60, 10, 5, 'ABNT NBR ISO/CIE 8995-1:2013', 'Tabela 5.2'),
  ('Indústria — trabalho médio',                                     300, 60, 10, 5, 'ABNT NBR ISO/CIE 8995-1:2013', 'Tabela 5.2'),
  ('Indústria — trabalho fino (montagem, ajuste)',                   500, 80, 10, 5, 'ABNT NBR ISO/CIE 8995-1:2013', 'Tabela 5.2'),
  ('Laboratório — análises gerais',                                  500, 80, 10, 5, 'ABNT NBR ISO/CIE 8995-1:2013', 'Tabela 5.3'),
  ('Refeitório / copa',                                              200, 80, 10, 5, 'ABNT NBR ISO/CIE 8995-1:2013', 'Tabela 5.1'),
  ('Sanitários e vestiários',                                        200, 80, 10, 5, 'ABNT NBR ISO/CIE 8995-1:2013', 'Tabela 5.1'),
  ('Área de controle / cabine de operação',                          500, 80, 10, 5, 'ABNT NBR ISO/CIE 8995-1:2013', 'Tabela 5.2');

-- ------------------------------------------------------------
-- Modelos de texto de relatório (padrões)
-- ------------------------------------------------------------
INSERT INTO modelos_texto_relatorio (secao, titulo, texto, ativo) VALUES
(
  'intro_ergonomia',
  'Conceito de Ergonomia',
  'A Ergonomia é o conjunto de conhecimentos científicos relativos ao homem e necessários para a concepção de ferramentas, máquinas e dispositivos que possam ser utilizados com o máximo de conforto, segurança e eficiência. Conforme a Associação Brasileira de Ergonomia (ABERGO), trata-se de uma disciplina científica que estuda as interações entre os seres humanos e outros elementos de um sistema.',
  TRUE
),
(
  'intro_objetivo_aep',
  'Objetivo — AEP',
  'Esta AEP tem como objetivo realizar uma avaliação ergonômica preliminar das condições de trabalho nos postos avaliados, identificando os principais fatores de risco ergonômico, priorizando-os por meio de matriz de risco e propondo ações corretivas e preventivas, em conformidade com a NR-17 (Ergonomia) e demais normas aplicáveis.',
  TRUE
),
(
  'intro_metodologia_aep',
  'Metodologia — AEP',
  'A metodologia adotada para esta AEP compreende: visitas técnicas ao ambiente de trabalho; observação direta e registro fotográfico dos postos de trabalho; entrevistas com trabalhadores e gestores; identificação e classificação dos fatores de risco ergonômico; e avaliação por meio da Matriz de Risco (Probabilidade × Gravidade), com elaboração de plano de ação prioritário.',
  TRUE
),
(
  'intro_objetivo_aet',
  'Objetivo — AET',
  'Esta AET tem como objetivo atender ao disposto na NR-17 (Ergonomia), identificar e avaliar os fatores ergonômicos presentes nos postos de trabalho, propondo melhorias que visem à promoção da saúde, ao conforto, à segurança e ao desempenho dos trabalhadores.',
  TRUE
),
(
  'intro_metodologia_aet',
  'Metodologia — AET',
  'A metodologia adotada compreende: visitas técnicas ao ambiente de trabalho; entrevistas com trabalhadores e gestores; registros fotográficos e filmagens; observação sistemática das atividades; medições de iluminância conforme NHO 11 (Fundacentro); e aplicação de métodos científicos validados (RULA, REBA, NIOSH, entre outros) com auxílio de softwares especializados.',
  TRUE
);

-- ------------------------------------------------------------
-- Usuário ADMIN padrão (senha deve ser alterada no primeiro login)
-- senha_hash é placeholder — substituir pela implementação real (bcrypt/PBKDF2)
-- ------------------------------------------------------------
INSERT INTO usuarios (nome, email, nome_usuario, senha_hash, perfil, status, alterar_senha)
VALUES (
  'Administrador',
  'admin@ergonomia.local',
  'admin',
  'ALTERAR_USE_BCRYPT_OU_PBKDF2',
  'ADMIN',
  'ativo',
  TRUE
);
