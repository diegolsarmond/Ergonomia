-- ============================================================
-- MIGRAÇÃO 007 — Dados mock do catálogo do sistema
-- Empresas, Unidades, Setores, Cargos, EPIs, Equipamentos,
-- Turnos, Pausas, Perguntas de entrevista, Checklist,
-- Fatores de risco biomecânico, Métodos científicos,
-- Textos de relatório, Classificações de risco,
-- Perguntas e inconsistências de iluminância
-- ============================================================

-- ------------------------------------------------------------
-- Empresas
-- ------------------------------------------------------------
INSERT INTO empresas (id, razao_social, nome_fantasia, cnpj, logradouro, numero, complemento, bairro, municipio, uf, cep, produto, grau_risco, ativo) VALUES
  ('comp-1',                       'Metalúrgica São Paulo Ltda',       'MetalSP',                          '12.345.678/0001-90', 'Rua das Indústrias',    '1500', '',                  'Distrito Industrial',      'Guarulhos',       'SP', '07220-000', 'Peças automotivas estampadas em aço carbono para sistemas de suspensão',                        '3', TRUE),
  ('comp-2',                       'Distribuidora Alimentícia Norte Ltda', 'AlimNorte',                   '98.765.432/0001-10', 'Av. Comercial',         '3200', '',                  'Parque Industrial Norte',  'Manaus',          'AM', '69075-000', 'Distribuição e armazenamento de alimentos secos e frios',                                       '2', TRUE),
  ('comp-3',                       'Construtora Horizonte S.A.',        'Horizonte',                       '45.678.901/0001-23', 'Av. das Construções',   '500',  'Centro Empresarial', 'Centro',                  'Belo Horizonte',  'MG', '30130-110', 'Construção civil, obras de infraestrutura e serviços de engenharia',                            '4', TRUE),
  ('company-padaria-horizonte',    'Padaria Horizonte Azul Ltda.',      'Padaria Horizonte Azul',           '11.222.333/0001-44', 'Rua das Palmeiras',     '250',  '',                  'Boa Vista',               'Recife',          'PE', '50000-000', 'Panificação, confeitaria e atendimento ao público',                                             '2', TRUE),
  ('company-metalurgica-serra-clara', 'Metalúrgica Serra Clara S.A.',   'Serra Clara Componentes Industriais', '55.666.777/0001-88', 'Avenida Industrial', '1450', '',                  'Cinco',                   'Contagem',        'MG', '32000-000', 'Fabricação de componentes metálicos para máquinas industriais',                                 '3', TRUE);

-- ------------------------------------------------------------
-- Unidades
-- ------------------------------------------------------------
INSERT INTO unidades (id, empresa_id, nome, cep, logradouro, numero, complemento, bairro, cidade, uf, endereco, local_producao) VALUES
  ('unit-1',                    'comp-1',                        'Unidade Guarulhos',              '',         'Rua das Indústrias',   '1500', '', 'Distrito Industrial',     'Guarulhos',      'SP', 'Rua das Indústrias, 1500 - Distrito Industrial',             'Galpão principal – Linhas 1, 2 e 3'),
  ('unit-2',                    'comp-1',                        'Filial Campinas',                '',         'Rod. Dom Pedro I',     'km 68','', 'Parque Industrial',       'Campinas',       'SP', 'Rod. Dom Pedro I, km 68 - Parque Industrial',                'Galpão B – Linha de usinagem'),
  ('unit-3',                    'comp-2',                        'Centro de Distribuição Manaus',  '',         'Av. Comercial',        '3200', '', 'Parque Industrial Norte',  'Manaus',         'AM', 'Av. Comercial, 3200 - Parque Industrial Norte',              'Armazém geral + câmara fria'),
  ('unit-4',                    'comp-3',                        'Sede BH',                        '',         'Av. das Construções',  '500',  '', 'Centro Empresarial',      'Belo Horizonte', 'MG', 'Av. das Construções, 500 - Centro Empresarial',             'Escritório + canteiro de obras ativo'),
  ('unit-padaria-matriz',       'company-padaria-horizonte',     'Loja Matriz',                    '50000-000','Rua das Palmeiras',    '250',  '', 'Boa Vista',               'Recife',         'PE', 'Rua das Palmeiras, 250 - Boa Vista',                         'Área de panificação, balcão de atendimento, salão de consumo e estoque.'),
  ('unit-serra-clara-contagem', 'company-metalurgica-serra-clara','Planta Contagem',               '32000-000','Avenida Industrial',   '1450', '', 'Cinco',                   'Contagem',       'MG', 'Avenida Industrial, 1450 - Cinco',                           'Usinagem, montagem, almoxarifado e administrativo técnico.');

-- ------------------------------------------------------------
-- Setores
-- ------------------------------------------------------------
INSERT INTO setores (id, empresa_id, unidade_id, nome, descricao, ativo) VALUES
  ('sect-1',                    'comp-1',                        'unit-1',                    'Estamparia',             'Produção de peças via prensas hidráulicas e mecânicas',                   TRUE),
  ('sect-2',                    'comp-1',                        'unit-1',                    'Embalagem e Expedição',  'Embalagem, etiquetagem e expedição de peças acabadas',                    TRUE),
  ('sect-3',                    'comp-1',                        'unit-1',                    'Manutenção',             'Manutenção preventiva e corretiva de máquinas e instalações',             TRUE),
  ('sect-4',                    'comp-1',                        'unit-1',                    'Controle de Qualidade',  'Inspeção dimensional e testes de conformidade de peças',                  TRUE),
  ('sect-5',                    'comp-1',                        'unit-2',                    'Usinagem',               'Torneamento, fresamento e furação de peças metálicas',                    TRUE),
  ('sect-6',                    'comp-2',                        'unit-3',                    'Recebimento',            'Recebimento, conferência e entrada de mercadorias',                       TRUE),
  ('sect-7',                    'comp-2',                        'unit-3',                    'Separação e Picking',    'Separação de pedidos e preparação para entrega',                          TRUE),
  ('sect-8',                    'comp-3',                        'unit-4',                    'Administrativo',         'Suporte administrativo, financeiro e RH',                                 TRUE),
  ('sector-padaria-atendimento','company-padaria-horizonte',     'unit-padaria-matriz',       'Atendimento ao Balcão',  'Atendimento a clientes, caixa e venda de produtos de panificação e confeitaria.', TRUE),
  ('sector-padaria-producao',   'company-padaria-horizonte',     'unit-padaria-matriz',       'Produção',               'Produção de pães, bolos e demais itens de panificação e confeitaria.',   TRUE),
  ('sector-serra-usinagem',     'company-metalurgica-serra-clara','unit-serra-clara-contagem','Usinagem',               'Torneamento, fresamento e usinagem CNC de componentes metálicos.',        TRUE),
  ('sector-serra-qualidade',    'company-metalurgica-serra-clara','unit-serra-clara-contagem','Controle de Qualidade',  'Inspeção dimensional e testes de conformidade de peças usinadas.',        TRUE);

-- ------------------------------------------------------------
-- Cargos padrão
-- ------------------------------------------------------------
INSERT INTO cargos_padrao (id, empresa_id, setor_id, cargo_pai_id, nome, cbo, descricao, ativo) VALUES
  ('role-1',                      NULL,                            'sect-1',                    NULL,       'Operador de Prensa',         '7233-10', 'Operar prensas mecânicas e hidráulicas para estampagem de peças metálicas, seguindo as especificações técnicas e procedimentos de segurança.', TRUE),
  ('role-2',                      NULL,                            'sect-1',                    'role-1',   'Auxiliar de Produção',        '7831-05', 'Auxiliar no processo produtivo, realizando atividades de montagem, embalagem, etiquetagem e organização da linha de produção.',              TRUE),
  ('role-3',                      NULL,                            'sect-2',                    NULL,       'Operador de Empilhadeira',    '4141-05', 'Operar empilhadeiras para movimentação de cargas, paletização e organização do armazém ou pátio de expedição.',                            TRUE),
  ('role-4',                      NULL,                            'sect-2',                    'role-3',   'Separador de Pedidos',        '4141-05', 'Realizar a separação (picking) de produtos conforme pedidos de venda, utilizando coletores, carrinhos ou equipamentos de apoio.',           TRUE),
  ('role-5',                      NULL,                            NULL,                         NULL,       'Assistente Administrativo',   '4110-10', 'Executar atividades de suporte administrativo, controles de planilha, atendimento telefônico e gestão de documentos.',                     TRUE),
  ('role-6',                      NULL,                            'sect-3',                    NULL,       'Técnico de Manutenção',       '9112-05', 'Realizar manutenção preventiva e corretiva em máquinas, equipamentos e instalações industriais.',                                           TRUE),
  ('role-7',                      NULL,                            'sect-4',                    NULL,       'Inspetor de Qualidade',       '3115-10', 'Inspecionar matérias-primas, produtos em processo e acabados, garantindo conformidade com especificações técnicas.',                         TRUE),
  ('role-padaria-atendente-balcao','company-padaria-horizonte',   'sector-padaria-atendimento', NULL,       'Atendente de Balcão',         '5244-05', 'Atender clientes no balcão, realizar vendas, operar caixa e organizar exposição de produtos.',                                             TRUE),
  ('role-padaria-auxiliar-producao','company-padaria-horizonte',  'sector-padaria-producao',    NULL,       'Auxiliar de Produção',        '8483-05', 'Auxiliar na produção de pães, bolos e itens de confeitaria, incluindo pesagem, mistura e controle de forno.',                              TRUE),
  ('role-serra-operador-cnc',     'company-metalurgica-serra-clara','sector-serra-usinagem',    NULL,       'Operador de Máquina CNC',     '7323-10', 'Operar tornos e centros de usinagem CNC para fabricação de componentes metálicos conforme especificações técnicas.',                        TRUE);

-- ------------------------------------------------------------
-- EPIs
-- ------------------------------------------------------------
INSERT INTO epis (id, nome, tipo, descricao, obrigatorio_padrao, ativo) VALUES
  ('epi-p-1',      'Protetor Auricular Tipo Plug',            'Proteção auditiva',              'Protetor auditivo de inserção descartável. NRRsf ≥ 20 dB. Exige CA vigente.',                                                                                                       TRUE,  TRUE),
  ('epi-p-2',      'Protetor Auricular Tipo Concha',          'Proteção auditiva',              'Protetor auditivo de abafamento externo, ajustável. Para ambientes com ruído > 85 dB(A).',                                                                                          FALSE, TRUE),
  ('epi-p-3',      'Capacete de Segurança Classe B',          'Proteção da cabeça',             'Capacete com jugular para proteção contra impacto e penetração. Classe B (elétrico). Aba frontal.',                                                                                FALSE, TRUE),
  ('epi-p-4',      'Óculos de Proteção Incolor',              'Proteção dos olhos e face',      'Óculos de segurança com lente incolor e proteção lateral. Resistente a impacto e respingos.',                                                                                      TRUE,  TRUE),
  ('epi-p-5',      'Luva de Raspa de Couro',                  'Proteção dos membros superiores','Luva de raspa para proteção contra cortes, abrasão e calor moderado no manuseio de materiais metálicos.',                                                                          TRUE,  TRUE),
  ('epi-p-6',      'Luva de Malha de Aço',                    'Proteção dos membros superiores','Luva de proteção anticorte nível 5 para manuseio de chapas e peças com bordas cortantes.',                                                                                         FALSE, TRUE),
  ('epi-p-7',      'Botina de Segurança (Biqueira de Aço)',   'Proteção dos membros inferiores','Botina com biqueira de aço e solado antiderrapante. Resistência à compressão de 15 kN.',                                                                                           TRUE,  TRUE),
  ('epi-p-8',      'Avental de Raspa',                        'Proteção do tronco',             'Avental de raspa de couro para proteção contra respingos de material quente e abrasão.',                                                                                           FALSE, TRUE),
  ('epi-p-9',      'Máscara de Proteção Respiratória PFF2',   'Proteção respiratória',          'Máscara PFF2 (N95) para proteção contra particulados e névoas. Eficiência mínima de 94%.',                                                                                         FALSE, TRUE),
  ('epi-p-10',     'Colete Refletivo',                        'Proteção do corpo inteiro',      'Colete de alta visibilidade com faixas refletivas para uso em áreas de circulação de veículos.',                                                                                   FALSE, TRUE),
  ('epi-padaria-1','Avental de Proteção Alimentar',           'Proteção do tronco',             'Avental impermeável, lavável, em PVC ou neoprene, para proteção contra umidade, gordura e calor moderado em ambientes de panificação e confeitaria.',                              TRUE,  TRUE),
  ('epi-padaria-2','Calçado Antiderrapante (uso alimentar)',  'Proteção dos membros inferiores','Calçado fechado com solado antiderrapante, resistente a óleos e gorduras, adequado para pisos úmidos de cozinha industrial e panificação.',                                        TRUE,  TRUE),
  ('epi-padaria-3','Luva Térmica',                            'Proteção dos membros superiores','Luva resistente ao calor para manuseio de assadeiras, formas e produtos quentes em forno industrial. Resistência mínima a 250 °C.',                                               TRUE,  TRUE),
  ('epi-padaria-4','Touca Descartável',                       'Proteção da cabeça',             'Touca sanfonada descartável para cobertura total dos cabelos, exigida em áreas de manipulação de alimentos conforme RDC 216/2004.',                                                TRUE,  TRUE);

-- ------------------------------------------------------------
-- Equipamentos padrão
-- ------------------------------------------------------------
INSERT INTO equipamentos_padrao (id, nome, categoria, descricao, tem_dimensoes, ativo) VALUES
  ('eq-p-1',      'Prensa Hidráulica',                    'Máquina',                      'Prensa para estampagem, conformação e corte de chapas metálicas. Capacidade variável de 50 a 500 ton.',                                                                    TRUE, TRUE),
  ('eq-p-2',      'Prensa Mecânica Excêntrica',           'Máquina',                      'Prensa de acionamento mecânico para estampagem de média velocidade.',                                                                                                       TRUE, TRUE),
  ('eq-p-3',      'Torno Mecânico CNC',                   'Máquina',                      'Torno de controle numérico para usinagem de peças rotativas com alta precisão dimensional.',                                                                                TRUE, TRUE),
  ('eq-p-4',      'Bancada de Trabalho',                  'Bancada / Mesa',               'Bancada metálica de uso geral para montagem, inspeção e trabalhos manuais.',                                                                                               TRUE, TRUE),
  ('eq-p-5',      'Empilhadeira Contrabalançada',         'Veículo',                      'Empilhadeira elétrica para movimentação de paletes e cargas pesadas em armazéns e pátios.',                                                                                TRUE, TRUE),
  ('eq-p-6',      'Paleteira Manual',                     'Equipamento de movimentação',  'Transpalete manual hidráulico para movimentação horizontal de paletes. Capacidade até 2.500 kg.',                                                                          TRUE, TRUE),
  ('eq-p-7',      'Esteira Transportadora',               'Esteira',                      'Esteira de correia para transporte contínuo de peças entre postos de trabalho.',                                                                                           TRUE, TRUE),
  ('eq-p-8',      'Mesa de Inspeção com Iluminação',      'Bancada / Mesa',               'Mesa com iluminação integrada para inspeção visual de peças e componentes.',                                                                                               TRUE, TRUE),
  ('eq-padaria-1','Forno Industrial',                     'Máquina',                      'Forno industrial rotativo ou de lastro para cocção de pães, bolos e massas. Capacidade de 8 a 32 assadeiras por fornada.',                                                TRUE, TRUE),
  ('eq-padaria-2','Masseira',                             'Máquina',                      'Amassadeira espiral elétrica para mistura e desenvolvimento de massas de panificação. Capacidade de 25 a 100 kg de massa.',                                               TRUE, TRUE),
  ('eq-padaria-3','Cilindro de Massa',                    'Máquina',                      'Cilindro elétrico para laminação e homogeneização de massas, utilizado em croissants, folhados e pães especiais.',                                                        TRUE, TRUE),
  ('eq-padaria-4','Bancada de Preparo (panificação)',     'Bancada / Mesa',               'Bancada em aço inox para moldagem, pesagem e acabamento de produtos de panificação e confeitaria. Com ou sem cuba integrada.',                                            TRUE, TRUE),
  ('eq-padaria-5','Balcão Refrigerado',                   'Equipamento de refrigeração',  'Balcão expositor refrigerado para apresentação e conservação de produtos de confeitaria, frios e sobremesas ao cliente.',                                                 TRUE, TRUE),
  ('eq-padaria-6','Carrinho de Transporte de Bandejas',   'Equipamento de movimentação',  'Carrinho aramado em inox para transporte de bandejas entre produção, câmaras de crescimento e forno. Capacidade de 16 a 36 bandejas.',                                   TRUE, TRUE),
  ('eq-serra-1',  'Centro de Usinagem CNC',               'Máquina',                      'Centro de usinagem vertical CNC com troca automática de ferramentas para fresamento, furação e mandrilamento de peças metálicas com alta precisão.',                      TRUE, TRUE),
  ('eq-serra-2',  'Bancada de Inspeção Dimensional',      'Bancada / Mesa',               'Bancada plana em granito ou ferro fundido para verificação dimensional de peças usinadas com instrumentos de medição de precisão.',                                       TRUE, TRUE),
  ('eq-serra-3',  'Carrinho de Transporte de Peças',      'Equipamento de movimentação',  'Carrinho plataforma em aço para movimentação de peças e conjuntos metálicos entre postos de usinagem, inspeção e expedição.',                                            TRUE, TRUE),
  ('eq-serra-4',  'Paquímetro',                           'Instrumento de medição',       'Paquímetro universal em aço inox para medições externas, internas, de profundidade e degrau. Resolução de 0,02 mm ou 0,001 pol.',                                        FALSE,TRUE),
  ('eq-serra-5',  'Micrômetro',                           'Instrumento de medição',       'Micrômetro externo para medição de alta precisão de diâmetros e espessuras. Resolução de 0,001 mm. Com certificado de calibração.',                                      FALSE,TRUE),
  ('eq-serra-6',  'Armário de Ferramentas',               'Mobiliário industrial',        'Armário metálico modular para organização e armazenamento de ferramentas de corte, brocas, insertos e acessórios de usinagem.',                                          TRUE, TRUE);

-- Operações dos equipamentos
INSERT INTO equipamento_operacoes (equipamento_id, operacao, ordem) VALUES
  ('eq-p-1',  'hidráulico',  1),
  ('eq-p-2',  'elétrico',    1),
  ('eq-p-3',  'elétrico',    1),
  ('eq-p-4',  'manual',      1),
  ('eq-p-5',  'elétrico',    1),
  ('eq-p-5',  'hidráulico',  2),
  ('eq-p-6',  'manual',      1),
  ('eq-p-6',  'hidráulico',  2),
  ('eq-p-7',  'elétrico',    1),
  ('eq-p-8',  'elétrico',    1),
  ('eq-padaria-1','elétrico',1),
  ('eq-padaria-2','elétrico',1),
  ('eq-padaria-3','elétrico',1),
  ('eq-padaria-4','manual',  1),
  ('eq-padaria-5','elétrico',1),
  ('eq-padaria-6','manual',  1),
  ('eq-serra-1',  'elétrico',1),
  ('eq-serra-2',  'manual',  1),
  ('eq-serra-3',  'manual',  1),
  ('eq-serra-4',  'manual',  1),
  ('eq-serra-5',  'manual',  1),
  ('eq-serra-6',  'manual',  1);

-- ------------------------------------------------------------
-- Turnos
-- ------------------------------------------------------------
INSERT INTO turnos (id, nome, descricao, ativo) VALUES
  ('shift-1', '6x1',                     '6 dias de trabalho por 1 de folga',  TRUE),
  ('shift-2', '5x2',                     '5 dias de trabalho por 2 de folga',  TRUE),
  ('shift-3', '12x36',                   '12 horas de trabalho por 36 de folga', TRUE),
  ('shift-4', 'Administrativo (8h às 18h)', 'Horário comercial padrão',         TRUE),
  ('shift-5', 'Turno A (06h às 14h)',    'Primeiro turno',                     TRUE),
  ('shift-6', 'Turno B (14h às 22h)',    'Segundo turno',                      TRUE),
  ('shift-7', 'Turno C (22h às 06h)',    'Terceiro turno (noturno)',            TRUE);

-- ------------------------------------------------------------
-- Pausas padrão
-- ------------------------------------------------------------
INSERT INTO pausas_padrao (id, nome, duracao, unidade_duracao, descricao, ativo) VALUES
  ('pause-60min',          '60min.',                          '60', 'minutos', 'Pausa padrão para refeição.',                                                                                                                                                      TRUE),
  ('pause-15min',          '15min.',                          '15', 'minutos', 'Pausa para lanche ou descanso.',                                                                                                                                                   TRUE),
  ('pause-na',             'N/A',                             '0',  'minutos', 'Não se aplica.',                                                                                                                                                                   TRUE),
  ('pause-1',              'DDS – Diálogo Diário de Segurança','10','minutos', 'Reunião diária de segurança no início do turno para discussão de riscos, procedimentos e comunicados.',                                                                            TRUE),
  ('pause-2',              'Refeição',                        '60', 'minutos', 'Intervalo para almoço ou jantar conforme turno. Realizado no refeitório da empresa.',                                                                                              TRUE),
  ('pause-3',              'Coffee Break / Lanche',           '15', 'minutos', 'Pausa intermediária para café e lanche. Realizada no meio do turno.',                                                                                                              TRUE),
  ('pause-4',              'Hidratação e Necessidades Fisiológicas','5','minutos','Pausa curta para hidratação e uso de sanitário conforme necessidade do trabalhador.',                                                                                            TRUE),
  ('pause-5',              'Ginástica Laboral',               '10', 'minutos', 'Exercícios de alongamento e aquecimento realizados no início ou meio do turno, orientados por profissional de saúde.',                                                             TRUE),
  ('pause-6',              'Troca de Turno',                  '15', 'minutos', 'Tempo de passagem de informações entre turnos e troca de EPIs/equipamentos.',                                                                                                     TRUE),
  ('pause-rec-postural',   'Pausa de Recuperação Postural',   '5',  'minutos', 'Pausa curta para alívio de tensão muscular e recuperação postural, realizada a cada 50–60 minutos de trabalho estático ou repetitivo. Inclui microexercícios de mobilidade.',    TRUE),
  ('pause-operacional',    'Pausa Operacional',               '10', 'minutos', 'Pausa técnica vinculada ao fluxo de produção, necessária para preparação, ajuste de máquinas, aguardo de insumos ou reorganização do posto de trabalho.',                         TRUE);

-- ------------------------------------------------------------
-- Perguntas de entrevista com trabalhador
-- ------------------------------------------------------------
INSERT INTO perguntas_entrevista (id, pergunta, categoria, tipo_resposta, obrigatorio, ordem, ativo) VALUES
  ('sq-1',  'Qual é o objetivo do seu trabalho?',                                                                          'Organização do trabalho', 'textarea', TRUE,  1,  TRUE),
  ('sq-2',  'Como você avalia a sensação térmica no seu posto de trabalho?',                                               'Conforto térmico',        'select',   TRUE,  2,  TRUE),
  ('sq-3',  'A iluminação do seu posto de trabalho é adequada para a realização das tarefas?',                             'Iluminação',              'yesno',    TRUE,  3,  TRUE),
  ('sq-4',  'Como você avalia o nível de ruído no seu ambiente de trabalho?',                                              'Acústica',                'select',   TRUE,  4,  TRUE),
  ('sq-5',  'Os equipamentos e ferramentas disponíveis são adequados para a realização das suas tarefas?',                 'Equipamentos',            'textarea',  FALSE, 5,  TRUE),
  ('sq-6',  'Como você avalia o ciclo operacional da sua função (tempo de cada tarefa)?',                                  'Organização do trabalho', 'textarea',  FALSE, 6,  TRUE),
  ('sq-7',  'O layout do seu posto de trabalho facilita a realização das tarefas?',                                        'Ergonomia',               'textarea',  FALSE, 7,  TRUE),
  ('sq-8',  'Quais são as principais dificuldades que você encontra ao realizar seu trabalho?',                            'Ergonomia',               'textarea',  TRUE,  8,  TRUE),
  ('sq-9',  'Você sente pressão de tempo para cumprir suas tarefas?',                                                      'Organização do trabalho', 'yesno',    TRUE,  9,  TRUE),
  ('sq-10', 'Como é o seu relacionamento com colegas e equipe de trabalho?',                                               'Relacionamento',          'textarea',  FALSE, 10, TRUE),
  ('sq-11', 'Sua liderança está aberta a sugestões de melhoria?',                                                          'Relacionamento',          'yesno',    FALSE, 11, TRUE),
  ('sq-12', 'A manutenção dos equipamentos interfere na realização do seu trabalho?',                                      'Equipamentos',            'yesno',    FALSE, 12, TRUE),
  ('sq-13', 'Descreva intercorrências frequentes que afetam o andamento das suas atividades.',                             'Organização do trabalho', 'textarea',  FALSE, 13, TRUE);

-- ------------------------------------------------------------
-- Perguntas de checklist ergonômico
-- ------------------------------------------------------------
INSERT INTO perguntas_checklist (id, texto) VALUES
  ('chk-1',  'A iluminação é adequada para a tarefa executada no posto de trabalho?'),
  ('chk-2',  'O mobiliário (mesa, cadeira, bancada) é ajustável e adequado à estatura do trabalhador?'),
  ('chk-3',  'Os equipamentos e ferramentas estão em bom estado de conservação e manutenção?'),
  ('chk-4',  'O trabalhador adota posturas adequadas durante a realização das tarefas?'),
  ('chk-5',  'Há pausas regulares para recuperação física durante a jornada de trabalho?'),
  ('chk-6',  'O ritmo de trabalho é compatível com a capacidade física do trabalhador?'),
  ('chk-7',  'O trabalhador recebeu treinamento e orientação sobre ergonomia e uso correto dos equipamentos?'),
  ('chk-8',  'O ambiente de trabalho apresenta nível de ruído dentro dos limites toleráveis?'),
  ('chk-9',  'A temperatura e ventilação do ambiente são adequadas para o tipo de atividade realizada?'),
  ('chk-10', 'Os EPIs fornecidos são adequados para as atividades desenvolvidas e estão sendo utilizados corretamente?');

-- ------------------------------------------------------------
-- Classificações de risco (sobrescreve seed de 006 se necessário)
-- ------------------------------------------------------------
INSERT INTO classificacoes_risco (id, nome, pontuacao_minima, pontuacao_maxima, cor, interpretacao) VALUES
  ('risk-1', 'Aceitável / Baixo',      1,  3,  '#10b981', 'Risco tolerável. Situação aceitável. Nenhuma ação corretiva urgente é necessária, porém devem ser mantidos os controles existentes e monitorada periodicamente a condição.'),
  ('risk-2', 'Moderado',               4,  6,  '#f59e0b', 'Investigar o risco e implementar medidas de controle a médio prazo. A exposição ao risco deve ser reduzida. Monitorar a eficácia das medidas adotadas.'),
  ('risk-3', 'Substancial / Alto',     7,  9,  '#f97316', 'Risco elevado que requer ação corretiva em curto prazo. As atividades devem continuar somente com medidas de controle implementadas. Não deve-se iniciar o trabalho até que o risco seja reduzido.'),
  ('risk-4', 'Crítico / Intolerável',  10, 25, '#ef4444', 'Risco intolerável. Paralisar imediatamente a atividade. O trabalho só pode ser retomado após a implementação de medidas de controle que reduzam o risco a nível tolerável ou moderado.')
ON CONFLICT (id) DO UPDATE
  SET nome             = EXCLUDED.nome,
      pontuacao_minima = EXCLUDED.pontuacao_minima,
      pontuacao_maxima = EXCLUDED.pontuacao_maxima,
      cor              = EXCLUDED.cor,
      interpretacao    = EXCLUDED.interpretacao;

-- ------------------------------------------------------------
-- Modelos de métodos científicos
-- ------------------------------------------------------------
INSERT INTO modelos_metodo_cientifico (id, nome, descricao) VALUES
  ('sci-rula',          'RULA',              'Rapid Upper Limb Assessment — avaliação rápida de membros superiores desenvolvida por McAtamney e Corlett (1993). Analisa pescoço, tronco e membros superiores com pontuação de 1 a 7 em quatro níveis de ação.'),
  ('sci-reba',          'REBA',              'Rapid Entire Body Assessment — avaliação de posturas de corpo inteiro em tarefas dinâmicas (Hignett e McAtamney, 2000). Pontuação de 1 a 15 com cinco níveis de risco musculoesquelético.'),
  ('sci-kim',           'KIM',               'Key Indicator Method (Método dos Indicadores-Chave) — método alemão para avaliação de atividades de levantamento, transporte, puxar e empurrar. Classifica o risco em quatro faixas conforme pontuação ponderada.'),
  ('sci-niosh',         'NIOSH',             'Equação Revisada de NIOSH (Waters et al., 1993) — avalia tarefas de levantamento manual calculando o Limite de Peso Recomendado (LPR) e o Índice de Levantamento (IL). IL > 1,0 indica risco aumentado; IL > 3,0 risco muito elevado.'),
  ('sci-checklist-nr17','Checklist NR-17',   'Lista de verificação estruturada baseada nos itens da NR-17 (Ergonomia). Avalia condições de mobiliário, equipamentos, condições ambientais, organização do trabalho e treinamento no posto avaliado.'),
  ('sci-nho11',         'NHO 11 – Iluminância','Norma de Higiene Ocupacional da Fundacentro para medição de iluminância nos ambientes de trabalho. Utiliza luxímetro calibrado e compara a iluminância média medida (Emed) com os valores de referência da ABNT NBR ISO/CIE 8995-1:2013.');

-- ------------------------------------------------------------
-- Modelos de texto de relatório (complementa 006)
-- ------------------------------------------------------------
INSERT INTO modelos_texto_relatorio (id, secao, titulo, texto, ativo) VALUES
  ('rt-1', 'Ergonomia',              'Conceito de Ergonomia – Padrão NR-17',                'A Ergonomia é o conjunto de conhecimentos científicos relativos ao homem e necessários para a concepção de ferramentas, máquinas e dispositivos que possam ser utilizados com o máximo de conforto, segurança e eficiência. Conforme a Associação Brasileira de Ergonomia (ABERGO), trata-se de uma disciplina científica que estuda as interações entre os seres humanos e outros elementos de um sistema, aplicando teoria, princípios, dados e métodos para otimizar o bem-estar humano e o desempenho global do sistema.', TRUE),
  ('rt-2', 'Objetivo',               'Objetivo da AET – Padrão NR-17',                      'Esta Análise Ergonômica do Trabalho (AET) tem como objetivo atender ao disposto na NR-17 (Ergonomia), identificar e avaliar os fatores ergonômicos presentes nos postos de trabalho da {empresa}, propondo melhorias que visem à promoção da saúde, ao conforto, à segurança e ao desempenho dos trabalhadores da função de {funcao}.', TRUE),
  ('rt-3', 'Metodologia',            'Metodologia Padrão – Visita Técnica e Métodos Científicos', 'A metodologia adotada nesta AET compreende: visitas técnicas ao ambiente de trabalho; entrevistas com trabalhadores e gestores; registros fotográficos e filmagens; observação sistemática das atividades; medições de iluminância conforme NHO 11 (Fundacentro); e aplicação de métodos científicos validados (RULA, REBA, NIOSH, OWAS, entre outros) com auxílio de softwares especializados. Todos os dados foram coletados em {data}.', TRUE),
  ('rt-4', 'Descrição do RULA',      'Método RULA – Descrição Padrão',                      'O método RULA (Rapid Upper Limb Assessment) foi desenvolvido por McAtamney e Corlett (1993) para avaliação rápida da exposição dos trabalhadores a fatores de risco para os membros superiores. O método analisa posturas de pescoço, tronco, membros superiores e inferiores, força exercida e tipo de atividade muscular, gerando uma pontuação final que classifica o risco em quatro níveis de ação.', TRUE),
  ('rt-5', 'Descrição do REBA',      'Método REBA – Descrição Padrão',                      'O método REBA (Rapid Entire Body Assessment) foi desenvolvido por Hignett e McAtamney (2000) para avaliação de posturas de corpo inteiro em tarefas dinâmicas e imprevisíveis, comuns em serviços de saúde e indústrias. A pontuação varia de 1 a 15, classificando o risco de lesão musculoesquelética em cinco níveis de ação.', TRUE),
  ('rt-6', 'Descrição do NIOSH',     'Equação de NIOSH – Descrição Padrão',                 'A Equação Revisada de NIOSH (Waters et al., 1993) é um método para avaliar tarefas de levantamento manual de cargas. O método calcula o Limite de Peso Recomendado (LPR) e o Índice de Levantamento (IL). Quando IL > 1,0, indica risco aumentado de lesão lombar para a maioria dos trabalhadores. Quando IL > 3,0, o risco é considerado muito elevado para praticamente todos os trabalhadores.', TRUE),
  ('rt-7', 'Interpretação da iluminação','Iluminância – Interpretação NHO 11 Padrão',       'A medição de iluminância foi realizada conforme os procedimentos técnicos da NHO 11 – Norma de Higiene Ocupacional da Fundacentro, que estabelece critérios para avaliação dos níveis de iluminamento nos ambientes de trabalho. Os valores de referência foram obtidos da ABNT NBR ISO/CIE 8995-1:2013. A interpretação dos resultados considera a iluminância média medida (Emed) comparada ao nível mínimo recomendado para a atividade desenvolvida na {unidade}.', TRUE),
  ('rt-8', 'Conclusão',              'Conclusão Padrão – Recomendações Gerais',              'Com base na análise ergonômica realizada na função de {funcao} da empresa {empresa}, recomenda-se a implementação das medidas propostas no inventário de riscos, priorizando as ações de curto prazo. A reavaliação ergonômica deve ser realizada após a implementação das melhorias, ou no prazo máximo de 12 meses, conforme preconiza a NR-17.', TRUE)
ON CONFLICT (id) DO UPDATE
  SET secao  = EXCLUDED.secao,
      titulo = EXCLUDED.titulo,
      texto  = EXCLUDED.texto,
      ativo  = EXCLUDED.ativo;

-- ------------------------------------------------------------
-- Fatores de risco biomecânico
-- ------------------------------------------------------------
INSERT INTO fatores_risco_biomecanico (id, nome, ativo) VALUES
  ('brf-1',  'Abdução de ombros',                    TRUE),
  ('brf-2',  'Elevação de ombros',                   TRUE),
  ('brf-3',  'Postura estática',                     TRUE),
  ('brf-4',  'Desvio ulnar/radial',                  TRUE),
  ('brf-5',  'Extensão de punho',                    TRUE),
  ('brf-6',  'Uso de pinça',                         TRUE),
  ('brf-7',  'Flexão de tronco',                     TRUE),
  ('brf-8',  'Rotação de tronco',                    TRUE),
  ('brf-9',  'Flexão/rotação cervical',              TRUE),
  ('brf-10', 'Braços elevados',                      TRUE),
  ('brf-11', 'Alcance excessivo',                    TRUE),
  ('brf-12', 'Ortostatismo prolongado',              TRUE),
  ('brf-13', 'Sedentarismo prolongado',              TRUE),
  ('brf-14', 'Alta frequência de movimentos',        TRUE),
  ('brf-15', 'Ciclos curtos',                        TRUE),
  ('brf-16', 'Velocidade excessiva',                 TRUE),
  ('brf-17', 'Metas de produção agressivas',         TRUE),
  ('brf-18', 'Trabalho monótono',                    TRUE),
  ('brf-19', 'Esforço físico intenso',               TRUE),
  ('brf-20', 'Peso excessivo',                       TRUE),
  ('brf-21', 'Carga estática',                       TRUE),
  ('brf-22', 'Vibração de mãos e braços',            TRUE),
  ('brf-23', 'Levantamento de peso frequente',       TRUE),
  ('brf-24', 'Transporte manual por longa distância',TRUE),
  ('brf-25', 'Falta de equipamentos de auxílio',     TRUE),
  ('brf-26', 'Bancada muito alta/baixa',             TRUE),
  ('brf-27', 'Falta de espaço para joelhos',         TRUE),
  ('brf-28', 'Impossibilidade de alternância postural', TRUE),
  ('brf-29', 'Cadeira sem ajustes',                  TRUE),
  ('brf-30', 'Falta de apoio para pés',              TRUE),
  ('brf-31', 'Monitor em altura inadequada',         TRUE),
  ('brf-32', 'Distâncias excessivas no layout',      TRUE);

-- Categorias dos fatores de risco biomecânico
INSERT INTO fator_risco_biomecanico_categorias (fator_id, categoria) VALUES
  ('brf-1',  'Posturas e Alcances'),
  ('brf-2',  'Posturas e Alcances'),
  ('brf-3',  'Posturas e Alcances'),
  ('brf-4',  'Posturas e Alcances'),
  ('brf-5',  'Posturas e Alcances'),
  ('brf-6',  'Posturas e Alcances'),
  ('brf-7',  'Posturas e Alcances'),
  ('brf-8',  'Posturas e Alcances'),
  ('brf-9',  'Posturas e Alcances'),
  ('brf-10', 'Posturas e Alcances'),
  ('brf-11', 'Posturas e Alcances'),
  ('brf-12', 'Posturas e Alcances'),
  ('brf-13', 'Posturas e Alcances'),
  ('brf-14', 'Repetitividade e Ritmo'),
  ('brf-15', 'Repetitividade e Ritmo'),
  ('brf-16', 'Repetitividade e Ritmo'),
  ('brf-17', 'Repetitividade e Ritmo'),
  ('brf-18', 'Repetitividade e Ritmo'),
  ('brf-19', 'Força e Exigência Física'),
  ('brf-20', 'Força e Exigência Física'),
  ('brf-21', 'Força e Exigência Física'),
  ('brf-22', 'Força e Exigência Física'),
  ('brf-23', 'Movimentação Manual de Cargas'),
  ('brf-24', 'Movimentação Manual de Cargas'),
  ('brf-25', 'Movimentação Manual de Cargas'),
  ('brf-26', 'Mobiliário e Posto de Trabalho'),
  ('brf-27', 'Mobiliário e Posto de Trabalho'),
  ('brf-28', 'Mobiliário e Posto de Trabalho'),
  ('brf-29', 'Mobiliário e Posto de Trabalho'),
  ('brf-30', 'Mobiliário e Posto de Trabalho'),
  ('brf-31', 'Mobiliário e Posto de Trabalho'),
  ('brf-32', 'Mobiliário e Posto de Trabalho');

-- ------------------------------------------------------------
-- Parâmetros normativos de iluminância (complementa 006)
-- ------------------------------------------------------------
INSERT INTO parametros_normativos_iluminancia (id, descricao_atividade, lux_minimo, irc_minimo, tolerancia_percentual, razao_uniformidade_max, referencia_normativa, referencia_pagina) VALUES
  (gen_random_uuid(), 'Escritório — Escrita, leitura e processamento de dados',    500, 80, 10, 5, 'ABNT NBR ISO/CIE 8995-1:2013', 'Tabela 5.1'),
  (gen_random_uuid(), 'Escritório — Recepção / hall de entrada',                   300, 80, 10, 5, 'ABNT NBR ISO/CIE 8995-1:2013', 'Tabela 5.1'),
  (gen_random_uuid(), 'Sala de reunião e treinamento',                             500, 80, 10, 5, 'ABNT NBR ISO/CIE 8995-1:2013', 'Tabela 5.1'),
  (gen_random_uuid(), 'Corredor e área de circulação interna',                     100, 40, 10, 5, 'ABNT NBR ISO/CIE 8995-1:2013', 'Tabela 5.1'),
  (gen_random_uuid(), 'Escadas e rampas',                                          150, 40, 10, 5, 'ABNT NBR ISO/CIE 8995-1:2013', 'Tabela 5.1'),
  (gen_random_uuid(), 'Depósito / almoxarifado',                                   100, 40, 10, 5, 'ABNT NBR ISO/CIE 8995-1:2013', 'Tabela 5.1'),
  (gen_random_uuid(), 'Indústria — trabalho grosseiro (sem exigência visual fina)', 200, 60, 10, 5, 'ABNT NBR ISO/CIE 8995-1:2013', 'Tabela 5.2'),
  (gen_random_uuid(), 'Indústria — trabalho médio',                                300, 60, 10, 5, 'ABNT NBR ISO/CIE 8995-1:2013', 'Tabela 5.2'),
  (gen_random_uuid(), 'Indústria — trabalho fino (montagem, ajuste, inspeção)',    500, 80, 10, 5, 'ABNT NBR ISO/CIE 8995-1:2013', 'Tabela 5.2'),
  (gen_random_uuid(), 'Usinagem de precisão',                                      500, 80, 10, 5, 'ABNT NBR ISO/CIE 8995-1:2013', 'Tabela 5.2'),
  (gen_random_uuid(), 'Laboratório — análises gerais',                             500, 80, 10, 5, 'ABNT NBR ISO/CIE 8995-1:2013', 'Tabela 5.3'),
  (gen_random_uuid(), 'Refeitório / copa',                                         200, 80, 10, 5, 'ABNT NBR ISO/CIE 8995-1:2013', 'Tabela 5.1'),
  (gen_random_uuid(), 'Sanitários e vestiários',                                   200, 80, 10, 5, 'ABNT NBR ISO/CIE 8995-1:2013', 'Tabela 5.1')
ON CONFLICT DO NOTHING;

-- ------------------------------------------------------------
-- README: atualizar 006 no README
-- Perguntas de verificação de iluminância e inconsistências
-- ficam como dados de referência (não há tabela de catálogo para elas;
-- são instanciadas por medição em medicao_verificacao_itens
-- e medicao_inconsistencia_itens)
-- ------------------------------------------------------------
