-- ============================================================
-- MIGRAÇÃO 007 — Dados mock do catálogo do sistema
-- Script idempotente: pode ser executado múltiplas vezes sem erro.
-- IDs derivados via md5(string)::uuid para consistência com o código TS.
-- ============================================================

-- ------------------------------------------------------------
-- Empresas
-- ------------------------------------------------------------
INSERT INTO empresas (id, razao_social, nome_fantasia, cnpj, logradouro, numero, complemento, bairro, municipio, uf, cep, produto, grau_risco, ativo) VALUES
  (md5('comp-1')::uuid,                         'Metalúrgica São Paulo Ltda',            'MetalSP',                             '12.345.678/0001-90', 'Rua das Indústrias',  '1500', '',                   'Distrito Industrial',     'Guarulhos',      'SP', '07220-000', 'Peças automotivas estampadas em aço carbono para sistemas de suspensão',               '3', TRUE),
  (md5('comp-2')::uuid,                         'Distribuidora Alimentícia Norte Ltda',   'AlimNorte',                          '98.765.432/0001-10', 'Av. Comercial',       '3200', '',                   'Parque Industrial Norte', 'Manaus',         'AM', '69075-000', 'Distribuição e armazenamento de alimentos secos e frios',                             '2', TRUE),
  (md5('comp-3')::uuid,                         'Construtora Horizonte S.A.',             'Horizonte',                          '45.678.901/0001-23', 'Av. das Construções', '500',  'Centro Empresarial', 'Centro',                  'Belo Horizonte', 'MG', '30130-110', 'Construção civil, obras de infraestrutura e serviços de engenharia',                  '4', TRUE),
  (md5('company-padaria-horizonte')::uuid,      'Padaria Horizonte Azul Ltda.',            'Padaria Horizonte Azul',             '11.222.333/0001-44', 'Rua das Palmeiras',   '250',  '',                   'Boa Vista',               'Recife',         'PE', '50000-000', 'Panificação, confeitaria e atendimento ao público',                                   '2', TRUE),
  (md5('company-metalurgica-serra-clara')::uuid,'Metalúrgica Serra Clara S.A.',            'Serra Clara Componentes Industriais', '55.666.777/0001-88', 'Avenida Industrial',  '1450', '',                   'Cinco',                   'Contagem',       'MG', '32000-000', 'Fabricação de componentes metálicos para máquinas industriais',                        '3', TRUE)
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------
-- Unidades
-- ------------------------------------------------------------
INSERT INTO unidades (id, empresa_id, nome, cep, logradouro, numero, complemento, bairro, cidade, uf, endereco, local_producao) VALUES
  (md5('unit-1')::uuid,                    md5('comp-1')::uuid,                          'Unidade Guarulhos',             '',          'Rua das Indústrias',  '1500', '', 'Distrito Industrial',     'Guarulhos',      'SP', 'Rua das Indústrias, 1500 - Distrito Industrial',    'Galpão principal – Linhas 1, 2 e 3'),
  (md5('unit-2')::uuid,                    md5('comp-1')::uuid,                          'Filial Campinas',               '',          'Rod. Dom Pedro I',    'km 68','', 'Parque Industrial',       'Campinas',       'SP', 'Rod. Dom Pedro I, km 68 - Parque Industrial',       'Galpão B – Linha de usinagem'),
  (md5('unit-3')::uuid,                    md5('comp-2')::uuid,                          'Centro de Distribuição Manaus', '',          'Av. Comercial',       '3200', '', 'Parque Industrial Norte', 'Manaus',         'AM', 'Av. Comercial, 3200 - Parque Industrial Norte',     'Armazém geral + câmara fria'),
  (md5('unit-4')::uuid,                    md5('comp-3')::uuid,                          'Sede BH',                       '',          'Av. das Construções', '500',  '', 'Centro Empresarial',      'Belo Horizonte', 'MG', 'Av. das Construções, 500 - Centro Empresarial',    'Escritório + canteiro de obras ativo'),
  (md5('unit-padaria-matriz')::uuid,       md5('company-padaria-horizonte')::uuid,       'Loja Matriz',                   '50000-000', 'Rua das Palmeiras',   '250',  '', 'Boa Vista',               'Recife',         'PE', 'Rua das Palmeiras, 250 - Boa Vista',                'Área de panificação, balcão de atendimento, salão de consumo e estoque.'),
  (md5('unit-serra-clara-contagem')::uuid, md5('company-metalurgica-serra-clara')::uuid, 'Planta Contagem',               '32000-000', 'Avenida Industrial',  '1450', '', 'Cinco',                   'Contagem',       'MG', 'Avenida Industrial, 1450 - Cinco',                  'Usinagem, montagem, almoxarifado e administrativo técnico.')
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------
-- Setores
-- ------------------------------------------------------------
INSERT INTO setores (id, empresa_id, unidade_id, nome, descricao, ativo) VALUES
  (md5('sect-1')::uuid,                    md5('comp-1')::uuid,                          md5('unit-1')::uuid,                    'Estamparia',            'Produção de peças via prensas hidráulicas e mecânicas',                   TRUE),
  (md5('sect-2')::uuid,                    md5('comp-1')::uuid,                          md5('unit-1')::uuid,                    'Embalagem e Expedição', 'Embalagem, etiquetagem e expedição de peças acabadas',                    TRUE),
  (md5('sect-3')::uuid,                    md5('comp-1')::uuid,                          md5('unit-1')::uuid,                    'Manutenção',            'Manutenção preventiva e corretiva de máquinas e instalações',             TRUE),
  (md5('sect-4')::uuid,                    md5('comp-1')::uuid,                          md5('unit-1')::uuid,                    'Controle de Qualidade', 'Inspeção dimensional e testes de conformidade de peças',                  TRUE),
  (md5('sect-5')::uuid,                    md5('comp-1')::uuid,                          md5('unit-2')::uuid,                    'Usinagem',              'Torneamento, fresamento e furação de peças metálicas',                    TRUE),
  (md5('sect-6')::uuid,                    md5('comp-2')::uuid,                          md5('unit-3')::uuid,                    'Recebimento',           'Recebimento, conferência e entrada de mercadorias',                       TRUE),
  (md5('sect-7')::uuid,                    md5('comp-2')::uuid,                          md5('unit-3')::uuid,                    'Separação e Picking',   'Separação de pedidos e preparação para entrega',                          TRUE),
  (md5('sect-8')::uuid,                    md5('comp-3')::uuid,                          md5('unit-4')::uuid,                    'Administrativo',        'Suporte administrativo, financeiro e RH',                                 TRUE),
  (md5('sector-padaria-atendimento')::uuid,md5('company-padaria-horizonte')::uuid,       md5('unit-padaria-matriz')::uuid,       'Atendimento ao Balcão', 'Atendimento a clientes, caixa e venda de produtos de panificação e confeitaria.', TRUE),
  (md5('sector-padaria-producao')::uuid,   md5('company-padaria-horizonte')::uuid,       md5('unit-padaria-matriz')::uuid,       'Produção',              'Produção de pães, bolos e demais itens de panificação e confeitaria.',   TRUE),
  (md5('sector-serra-usinagem')::uuid,     md5('company-metalurgica-serra-clara')::uuid, md5('unit-serra-clara-contagem')::uuid, 'Usinagem',              'Torneamento, fresamento e usinagem CNC de componentes metálicos.',        TRUE),
  (md5('sector-serra-qualidade')::uuid,    md5('company-metalurgica-serra-clara')::uuid, md5('unit-serra-clara-contagem')::uuid, 'Controle de Qualidade', 'Inspeção dimensional e testes de conformidade de peças usinadas.',        TRUE)
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------
-- Cargos padrão
-- ------------------------------------------------------------
INSERT INTO cargos_padrao (id, empresa_id, setor_id, cargo_pai_id, nome, cbo, descricao, ativo) VALUES
  (md5('role-1')::uuid,                        NULL,                                          md5('sect-1')::uuid,                    NULL,                 'Operador de Prensa',        '7233-10', 'Operar prensas mecânicas e hidráulicas para estampagem de peças metálicas, seguindo as especificações técnicas e procedimentos de segurança.', TRUE),
  (md5('role-2')::uuid,                        NULL,                                          md5('sect-1')::uuid,                    md5('role-1')::uuid,  'Auxiliar de Produção',       '7831-05', 'Auxiliar no processo produtivo, realizando atividades de montagem, embalagem, etiquetagem e organização da linha de produção.',              TRUE),
  (md5('role-3')::uuid,                        NULL,                                          md5('sect-2')::uuid,                    NULL,                 'Operador de Empilhadeira',   '4141-05', 'Operar empilhadeiras para movimentação de cargas, paletização e organização do armazém ou pátio de expedição.',                            TRUE),
  (md5('role-4')::uuid,                        NULL,                                          md5('sect-2')::uuid,                    md5('role-3')::uuid,  'Separador de Pedidos',       '4141-05', 'Realizar a separação (picking) de produtos conforme pedidos de venda, utilizando coletores, carrinhos ou equipamentos de apoio.',           TRUE),
  (md5('role-5')::uuid,                        NULL,                                          NULL,                                   NULL,                 'Assistente Administrativo',  '4110-10', 'Executar atividades de suporte administrativo, controles de planilha, atendimento telefônico e gestão de documentos.',                     TRUE),
  (md5('role-6')::uuid,                        NULL,                                          md5('sect-3')::uuid,                    NULL,                 'Técnico de Manutenção',      '9112-05', 'Realizar manutenção preventiva e corretiva em máquinas, equipamentos e instalações industriais.',                                           TRUE),
  (md5('role-7')::uuid,                        NULL,                                          md5('sect-4')::uuid,                    NULL,                 'Inspetor de Qualidade',      '3115-10', 'Inspecionar matérias-primas, produtos em processo e acabados, garantindo conformidade com especificações técnicas.',                         TRUE),
  (md5('role-padaria-atendente-balcao')::uuid,  md5('company-padaria-horizonte')::uuid,       md5('sector-padaria-atendimento')::uuid,NULL,                 'Atendente de Balcão',        '5244-05', 'Atender clientes no balcão, realizar vendas, operar caixa e organizar exposição de produtos.',                                             TRUE),
  (md5('role-padaria-auxiliar-producao')::uuid, md5('company-padaria-horizonte')::uuid,       md5('sector-padaria-producao')::uuid,   NULL,                 'Auxiliar de Produção',       '8483-05', 'Auxiliar na produção de pães, bolos e itens de confeitaria, incluindo pesagem, mistura e controle de forno.',                              TRUE),
  (md5('role-serra-operador-cnc')::uuid,        md5('company-metalurgica-serra-clara')::uuid, md5('sector-serra-usinagem')::uuid,     NULL,                 'Operador de Máquina CNC',    '7323-10', 'Operar tornos e centros de usinagem CNC para fabricação de componentes metálicos conforme especificações técnicas.',                        TRUE)
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------
-- EPIs
-- ------------------------------------------------------------
INSERT INTO epis (id, nome, tipo, descricao, obrigatorio_padrao, ativo) VALUES
  (md5('epi-p-1')::uuid,       'Protetor Auricular Tipo Plug',           'Proteção auditiva',               'Protetor auditivo de inserção descartável. NRRsf ≥ 20 dB. Exige CA vigente.',                                                                                                       TRUE,  TRUE),
  (md5('epi-p-2')::uuid,       'Protetor Auricular Tipo Concha',         'Proteção auditiva',               'Protetor auditivo de abafamento externo, ajustável. Para ambientes com ruído > 85 dB(A).',                                                                                          FALSE, TRUE),
  (md5('epi-p-3')::uuid,       'Capacete de Segurança Classe B',         'Proteção da cabeça',              'Capacete com jugular para proteção contra impacto e penetração. Classe B (elétrico). Aba frontal.',                                                                                FALSE, TRUE),
  (md5('epi-p-4')::uuid,       'Óculos de Proteção Incolor',             'Proteção dos olhos e face',       'Óculos de segurança com lente incolor e proteção lateral. Resistente a impacto e respingos.',                                                                                      TRUE,  TRUE),
  (md5('epi-p-5')::uuid,       'Luva de Raspa de Couro',                 'Proteção dos membros superiores', 'Luva de raspa para proteção contra cortes, abrasão e calor moderado no manuseio de materiais metálicos.',                                                                          TRUE,  TRUE),
  (md5('epi-p-6')::uuid,       'Luva de Malha de Aço',                   'Proteção dos membros superiores', 'Luva de proteção anticorte nível 5 para manuseio de chapas e peças com bordas cortantes.',                                                                                         FALSE, TRUE),
  (md5('epi-p-7')::uuid,       'Botina de Segurança (Biqueira de Aço)',  'Proteção dos membros inferiores', 'Botina com biqueira de aço e solado antiderrapante. Resistência à compressão de 15 kN.',                                                                                           TRUE,  TRUE),
  (md5('epi-p-8')::uuid,       'Avental de Raspa',                       'Proteção do tronco',              'Avental de raspa de couro para proteção contra respingos de material quente e abrasão.',                                                                                           FALSE, TRUE),
  (md5('epi-p-9')::uuid,       'Máscara de Proteção Respiratória PFF2',  'Proteção respiratória',           'Máscara PFF2 (N95) para proteção contra particulados e névoas. Eficiência mínima de 94%.',                                                                                         FALSE, TRUE),
  (md5('epi-p-10')::uuid,      'Colete Refletivo',                       'Proteção do corpo inteiro',       'Colete de alta visibilidade com faixas refletivas para uso em áreas de circulação de veículos.',                                                                                   FALSE, TRUE),
  (md5('epi-padaria-1')::uuid, 'Avental de Proteção Alimentar',          'Proteção do tronco',              'Avental impermeável, lavável, em PVC ou neoprene, para proteção contra umidade, gordura e calor moderado em ambientes de panificação e confeitaria.',                              TRUE,  TRUE),
  (md5('epi-padaria-2')::uuid, 'Calçado Antiderrapante (uso alimentar)', 'Proteção dos membros inferiores', 'Calçado fechado com solado antiderrapante, resistente a óleos e gorduras, adequado para pisos úmidos de cozinha industrial e panificação.',                                        TRUE,  TRUE),
  (md5('epi-padaria-3')::uuid, 'Luva Térmica',                           'Proteção dos membros superiores', 'Luva resistente ao calor para manuseio de assadeiras, formas e produtos quentes em forno industrial. Resistência mínima a 250 °C.',                                               TRUE,  TRUE),
  (md5('epi-padaria-4')::uuid, 'Touca Descartável',                      'Proteção da cabeça',              'Touca sanfonada descartável para cobertura total dos cabelos, exigida em áreas de manipulação de alimentos conforme RDC 216/2004.',                                                TRUE,  TRUE)
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------
-- Equipamentos padrão
-- ------------------------------------------------------------
INSERT INTO equipamentos_padrao (id, nome, categoria, descricao, tem_dimensoes, ativo) VALUES
  (md5('eq-p-1')::uuid,       'Prensa Hidráulica',                   'Máquina',                     'Prensa para estampagem, conformação e corte de chapas metálicas. Capacidade variável de 50 a 500 ton.',                                                                    TRUE, TRUE),
  (md5('eq-p-2')::uuid,       'Prensa Mecânica Excêntrica',          'Máquina',                     'Prensa de acionamento mecânico para estampagem de média velocidade.',                                                                                                       TRUE, TRUE),
  (md5('eq-p-3')::uuid,       'Torno Mecânico CNC',                  'Máquina',                     'Torno de controle numérico para usinagem de peças rotativas com alta precisão dimensional.',                                                                                TRUE, TRUE),
  (md5('eq-p-4')::uuid,       'Bancada de Trabalho',                 'Bancada / Mesa',              'Bancada metálica de uso geral para montagem, inspeção e trabalhos manuais.',                                                                                               TRUE, TRUE),
  (md5('eq-p-5')::uuid,       'Empilhadeira Contrabalançada',        'Veículo',                     'Empilhadeira elétrica para movimentação de paletes e cargas pesadas em armazéns e pátios.',                                                                                TRUE, TRUE),
  (md5('eq-p-6')::uuid,       'Paleteira Manual',                    'Equipamento de movimentação', 'Transpalete manual hidráulico para movimentação horizontal de paletes. Capacidade até 2.500 kg.',                                                                          TRUE, TRUE),
  (md5('eq-p-7')::uuid,       'Esteira Transportadora',              'Esteira',                     'Esteira de correia para transporte contínuo de peças entre postos de trabalho.',                                                                                           TRUE, TRUE),
  (md5('eq-p-8')::uuid,       'Mesa de Inspeção com Iluminação',     'Bancada / Mesa',              'Mesa com iluminação integrada para inspeção visual de peças e componentes.',                                                                                               TRUE, TRUE),
  (md5('eq-padaria-1')::uuid, 'Forno Industrial',                    'Máquina',                     'Forno industrial rotativo ou de lastro para cocção de pães, bolos e massas. Capacidade de 8 a 32 assadeiras por fornada.',                                                TRUE, TRUE),
  (md5('eq-padaria-2')::uuid, 'Masseira',                            'Máquina',                     'Amassadeira espiral elétrica para mistura e desenvolvimento de massas de panificação. Capacidade de 25 a 100 kg de massa.',                                               TRUE, TRUE),
  (md5('eq-padaria-3')::uuid, 'Cilindro de Massa',                   'Máquina',                     'Cilindro elétrico para laminação e homogeneização de massas, utilizado em croissants, folhados e pães especiais.',                                                        TRUE, TRUE),
  (md5('eq-padaria-4')::uuid, 'Bancada de Preparo (panificação)',    'Bancada / Mesa',              'Bancada em aço inox para moldagem, pesagem e acabamento de produtos de panificação e confeitaria. Com ou sem cuba integrada.',                                            TRUE, TRUE),
  (md5('eq-padaria-5')::uuid, 'Balcão Refrigerado',                  'Equipamento de refrigeração', 'Balcão expositor refrigerado para apresentação e conservação de produtos de confeitaria, frios e sobremesas ao cliente.',                                                 TRUE, TRUE),
  (md5('eq-padaria-6')::uuid, 'Carrinho de Transporte de Bandejas',  'Equipamento de movimentação', 'Carrinho aramado em inox para transporte de bandejas entre produção, câmaras de crescimento e forno. Capacidade de 16 a 36 bandejas.',                                   TRUE, TRUE),
  (md5('eq-serra-1')::uuid,   'Centro de Usinagem CNC',              'Máquina',                     'Centro de usinagem vertical CNC com troca automática de ferramentas para fresamento, furação e mandrilamento de peças metálicas com alta precisão.',                      TRUE, TRUE),
  (md5('eq-serra-2')::uuid,   'Bancada de Inspeção Dimensional',     'Bancada / Mesa',              'Bancada plana em granito ou ferro fundido para verificação dimensional de peças usinadas com instrumentos de medição de precisão.',                                       TRUE, TRUE),
  (md5('eq-serra-3')::uuid,   'Carrinho de Transporte de Peças',     'Equipamento de movimentação', 'Carrinho plataforma em aço para movimentação de peças e conjuntos metálicos entre postos de usinagem, inspeção e expedição.',                                            TRUE, TRUE),
  (md5('eq-serra-4')::uuid,   'Paquímetro',                          'Instrumento de medição',      'Paquímetro universal em aço inox para medições externas, internas, de profundidade e degrau. Resolução de 0,02 mm ou 0,001 pol.',                                        FALSE,TRUE),
  (md5('eq-serra-5')::uuid,   'Micrômetro',                          'Instrumento de medição',      'Micrômetro externo para medição de alta precisão de diâmetros e espessuras. Resolução de 0,001 mm. Com certificado de calibração.',                                      FALSE,TRUE),
  (md5('eq-serra-6')::uuid,   'Armário de Ferramentas',              'Mobiliário industrial',       'Armário metálico modular para organização e armazenamento de ferramentas de corte, brocas, insertos e acessórios de usinagem.',                                          TRUE, TRUE)
ON CONFLICT (id) DO NOTHING;

-- Operações dos equipamentos (sem PK explícita — usa id serial; idempotência via DELETE+INSERT)
DELETE FROM equipamento_operacoes WHERE equipamento_id IN (
  md5('eq-p-1')::uuid, md5('eq-p-2')::uuid, md5('eq-p-3')::uuid, md5('eq-p-4')::uuid,
  md5('eq-p-5')::uuid, md5('eq-p-6')::uuid, md5('eq-p-7')::uuid, md5('eq-p-8')::uuid,
  md5('eq-padaria-1')::uuid, md5('eq-padaria-2')::uuid, md5('eq-padaria-3')::uuid,
  md5('eq-padaria-4')::uuid, md5('eq-padaria-5')::uuid, md5('eq-padaria-6')::uuid,
  md5('eq-serra-1')::uuid, md5('eq-serra-2')::uuid, md5('eq-serra-3')::uuid,
  md5('eq-serra-4')::uuid, md5('eq-serra-5')::uuid, md5('eq-serra-6')::uuid
);
INSERT INTO equipamento_operacoes (equipamento_id, operacao, ordem) VALUES
  (md5('eq-p-1')::uuid,       'hidráulico', 1),
  (md5('eq-p-2')::uuid,       'elétrico',   1),
  (md5('eq-p-3')::uuid,       'elétrico',   1),
  (md5('eq-p-4')::uuid,       'manual',     1),
  (md5('eq-p-5')::uuid,       'elétrico',   1),
  (md5('eq-p-5')::uuid,       'hidráulico', 2),
  (md5('eq-p-6')::uuid,       'manual',     1),
  (md5('eq-p-6')::uuid,       'hidráulico', 2),
  (md5('eq-p-7')::uuid,       'elétrico',   1),
  (md5('eq-p-8')::uuid,       'elétrico',   1),
  (md5('eq-padaria-1')::uuid, 'elétrico',   1),
  (md5('eq-padaria-2')::uuid, 'elétrico',   1),
  (md5('eq-padaria-3')::uuid, 'elétrico',   1),
  (md5('eq-padaria-4')::uuid, 'manual',     1),
  (md5('eq-padaria-5')::uuid, 'elétrico',   1),
  (md5('eq-padaria-6')::uuid, 'manual',     1),
  (md5('eq-serra-1')::uuid,   'elétrico',   1),
  (md5('eq-serra-2')::uuid,   'manual',     1),
  (md5('eq-serra-3')::uuid,   'manual',     1),
  (md5('eq-serra-4')::uuid,   'manual',     1),
  (md5('eq-serra-5')::uuid,   'manual',     1),
  (md5('eq-serra-6')::uuid,   'manual',     1);

-- ------------------------------------------------------------
-- Turnos
-- ------------------------------------------------------------
INSERT INTO turnos (id, nome, descricao, ativo) VALUES
  (md5('shift-1')::uuid, '6x1',                        '6 dias de trabalho por 1 de folga',   TRUE),
  (md5('shift-2')::uuid, '5x2',                        '5 dias de trabalho por 2 de folga',   TRUE),
  (md5('shift-3')::uuid, '12x36',                      '12 horas de trabalho por 36 de folga',TRUE),
  (md5('shift-4')::uuid, 'Administrativo (8h às 18h)', 'Horário comercial padrão',            TRUE),
  (md5('shift-5')::uuid, 'Turno A (06h às 14h)',       'Primeiro turno',                      TRUE),
  (md5('shift-6')::uuid, 'Turno B (14h às 22h)',       'Segundo turno',                       TRUE),
  (md5('shift-7')::uuid, 'Turno C (22h às 06h)',       'Terceiro turno (noturno)',             TRUE)
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------
-- Pausas padrão
-- ------------------------------------------------------------
INSERT INTO pausas_padrao (id, nome, duracao, unidade_duracao, descricao, ativo) VALUES
  (md5('pause-60min')::uuid,       '60min.',                             '60', 'minutos', 'Pausa padrão para refeição.',                                                                                                                                                   TRUE),
  (md5('pause-15min')::uuid,       '15min.',                             '15', 'minutos', 'Pausa para lanche ou descanso.',                                                                                                                                                TRUE),
  (md5('pause-na')::uuid,          'N/A',                                '0',  'minutos', 'Não se aplica.',                                                                                                                                                                TRUE),
  (md5('pause-1')::uuid,           'DDS – Diálogo Diário de Segurança',  '10', 'minutos', 'Reunião diária de segurança no início do turno para discussão de riscos, procedimentos e comunicados.',                                                                         TRUE),
  (md5('pause-2')::uuid,           'Refeição',                           '60', 'minutos', 'Intervalo para almoço ou jantar conforme turno. Realizado no refeitório da empresa.',                                                                                           TRUE),
  (md5('pause-3')::uuid,           'Coffee Break / Lanche',              '15', 'minutos', 'Pausa intermediária para café e lanche. Realizada no meio do turno.',                                                                                                           TRUE),
  (md5('pause-4')::uuid,           'Hidratação e Necessidades Fisiológicas','5','minutos', 'Pausa curta para hidratação e uso de sanitário conforme necessidade do trabalhador.',                                                                                           TRUE),
  (md5('pause-5')::uuid,           'Ginástica Laboral',                  '10', 'minutos', 'Exercícios de alongamento e aquecimento realizados no início ou meio do turno, orientados por profissional de saúde.',                                                          TRUE),
  (md5('pause-6')::uuid,           'Troca de Turno',                     '15', 'minutos', 'Tempo de passagem de informações entre turnos e troca de EPIs/equipamentos.',                                                                                                  TRUE),
  (md5('pause-rec-postural')::uuid,'Pausa de Recuperação Postural',      '5',  'minutos', 'Pausa curta para alívio de tensão muscular e recuperação postural, realizada a cada 50–60 minutos de trabalho estático ou repetitivo. Inclui microexercícios de mobilidade.', TRUE),
  (md5('pause-operacional')::uuid, 'Pausa Operacional',                  '10', 'minutos', 'Pausa técnica vinculada ao fluxo de produção, necessária para preparação, ajuste de máquinas, aguardo de insumos ou reorganização do posto de trabalho.',                      TRUE)
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------
-- Perguntas de entrevista
-- ------------------------------------------------------------
INSERT INTO perguntas_entrevista (id, pergunta, categoria, tipo_resposta, obrigatorio, ordem, ativo) VALUES
  (md5('sq-1')::uuid,  'Qual é o objetivo do seu trabalho?',                                                                         'Organização do trabalho', 'textarea', TRUE,  1,  TRUE),
  (md5('sq-2')::uuid,  'Como você avalia a sensação térmica no seu posto de trabalho?',                                              'Conforto térmico',        'select',   TRUE,  2,  TRUE),
  (md5('sq-3')::uuid,  'A iluminação do seu posto de trabalho é adequada para a realização das tarefas?',                            'Iluminação',              'yesno',    TRUE,  3,  TRUE),
  (md5('sq-4')::uuid,  'Como você avalia o nível de ruído no seu ambiente de trabalho?',                                             'Acústica',                'select',   TRUE,  4,  TRUE),
  (md5('sq-5')::uuid,  'Os equipamentos e ferramentas disponíveis são adequados para a realização das suas tarefas?',                'Equipamentos',            'textarea',  FALSE, 5,  TRUE),
  (md5('sq-6')::uuid,  'Como você avalia o ciclo operacional da sua função (tempo de cada tarefa)?',                                 'Organização do trabalho', 'textarea',  FALSE, 6,  TRUE),
  (md5('sq-7')::uuid,  'O layout do seu posto de trabalho facilita a realização das tarefas?',                                       'Ergonomia',               'textarea',  FALSE, 7,  TRUE),
  (md5('sq-8')::uuid,  'Quais são as principais dificuldades que você encontra ao realizar seu trabalho?',                           'Ergonomia',               'textarea',  TRUE,  8,  TRUE),
  (md5('sq-9')::uuid,  'Você sente pressão de tempo para cumprir suas tarefas?',                                                     'Organização do trabalho', 'yesno',    TRUE,  9,  TRUE),
  (md5('sq-10')::uuid, 'Como é o seu relacionamento com colegas e equipe de trabalho?',                                              'Relacionamento',          'textarea',  FALSE, 10, TRUE),
  (md5('sq-11')::uuid, 'Sua liderança está aberta a sugestões de melhoria?',                                                         'Relacionamento',          'yesno',    FALSE, 11, TRUE),
  (md5('sq-12')::uuid, 'A manutenção dos equipamentos interfere na realização do seu trabalho?',                                     'Equipamentos',            'yesno',    FALSE, 12, TRUE),
  (md5('sq-13')::uuid, 'Descreva intercorrências frequentes que afetam o andamento das suas atividades.',                            'Organização do trabalho', 'textarea',  FALSE, 13, TRUE)
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------
-- Perguntas de checklist ergonômico
-- ------------------------------------------------------------
INSERT INTO perguntas_checklist (id, texto) VALUES
  (md5('chk-1')::uuid,  'A iluminação é adequada para a tarefa executada no posto de trabalho?'),
  (md5('chk-2')::uuid,  'O mobiliário (mesa, cadeira, bancada) é ajustável e adequado à estatura do trabalhador?'),
  (md5('chk-3')::uuid,  'Os equipamentos e ferramentas estão em bom estado de conservação e manutenção?'),
  (md5('chk-4')::uuid,  'O trabalhador adota posturas adequadas durante a realização das tarefas?'),
  (md5('chk-5')::uuid,  'Há pausas regulares para recuperação física durante a jornada de trabalho?'),
  (md5('chk-6')::uuid,  'O ritmo de trabalho é compatível com a capacidade física do trabalhador?'),
  (md5('chk-7')::uuid,  'O trabalhador recebeu treinamento e orientação sobre ergonomia e uso correto dos equipamentos?'),
  (md5('chk-8')::uuid,  'O ambiente de trabalho apresenta nível de ruído dentro dos limites toleráveis?'),
  (md5('chk-9')::uuid,  'A temperatura e ventilação do ambiente são adequadas para o tipo de atividade realizada?'),
  (md5('chk-10')::uuid, 'Os EPIs fornecidos são adequados para as atividades desenvolvidas e estão sendo utilizados corretamente?')
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------
-- Classificações de risco
-- ------------------------------------------------------------
INSERT INTO classificacoes_risco (id, nome, pontuacao_minima, pontuacao_maxima, cor, interpretacao) VALUES
  (md5('risk-1')::uuid, 'Aceitável / Baixo',     1,  3,  '#10b981', 'Risco tolerável. Situação aceitável. Nenhuma ação corretiva urgente é necessária, porém devem ser mantidos os controles existentes e monitorada periodicamente a condição.'),
  (md5('risk-2')::uuid, 'Moderado',              4,  6,  '#f59e0b', 'Investigar o risco e implementar medidas de controle a médio prazo. A exposição ao risco deve ser reduzida. Monitorar a eficácia das medidas adotadas.'),
  (md5('risk-3')::uuid, 'Substancial / Alto',    7,  9,  '#f97316', 'Risco elevado que requer ação corretiva em curto prazo. As atividades devem continuar somente com medidas de controle implementadas. Não deve-se iniciar o trabalho até que o risco seja reduzido.'),
  (md5('risk-4')::uuid, 'Crítico / Intolerável', 10, 25, '#ef4444', 'Risco intolerável. Paralisar imediatamente a atividade. O trabalho só pode ser retomado após a implementação de medidas de controle que reduzam o risco a nível tolerável ou moderado.')
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------
-- Modelos de métodos científicos
-- ------------------------------------------------------------
INSERT INTO modelos_metodo_cientifico (id, nome, descricao) VALUES
  (md5('sci-rula')::uuid,           'RULA',               'Rapid Upper Limb Assessment — avaliação rápida de membros superiores desenvolvida por McAtamney e Corlett (1993). Analisa pescoço, tronco e membros superiores com pontuação de 1 a 7 em quatro níveis de ação.'),
  (md5('sci-reba')::uuid,           'REBA',               'Rapid Entire Body Assessment — avaliação de posturas de corpo inteiro em tarefas dinâmicas (Hignett e McAtamney, 2000). Pontuação de 1 a 15 com cinco níveis de risco musculoesquelético.'),
  (md5('sci-kim')::uuid,            'KIM',                'Key Indicator Method (Método dos Indicadores-Chave) — método alemão para avaliação de atividades de levantamento, transporte, puxar e empurrar. Classifica o risco em quatro faixas conforme pontuação ponderada.'),
  (md5('sci-niosh')::uuid,          'NIOSH',              'Equação Revisada de NIOSH (Waters et al., 1993) — avalia tarefas de levantamento manual calculando o Limite de Peso Recomendado (LPR) e o Índice de Levantamento (IL). IL > 1,0 indica risco aumentado; IL > 3,0 risco muito elevado.'),
  (md5('sci-checklist-nr17')::uuid, 'Checklist NR-17',    'Lista de verificação estruturada baseada nos itens da NR-17 (Ergonomia). Avalia condições de mobiliário, equipamentos, condições ambientais, organização do trabalho e treinamento no posto avaliado.'),
  (md5('sci-nho11')::uuid,          'NHO 11 – Iluminância','Norma de Higiene Ocupacional da Fundacentro para medição de iluminância nos ambientes de trabalho. Utiliza luxímetro calibrado e compara a iluminância média medida (Emed) com os valores de referência da ABNT NBR ISO/CIE 8995-1:2013.')
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------
-- Modelos de texto de relatório
-- ------------------------------------------------------------
INSERT INTO modelos_texto_relatorio (id, secao, titulo, texto, ativo) VALUES
  (md5('rt-1')::uuid, 'Ergonomia',                 'Conceito de Ergonomia – Padrão NR-17',                     'A Ergonomia é o conjunto de conhecimentos científicos relativos ao homem e necessários para a concepção de ferramentas, máquinas e dispositivos que possam ser utilizados com o máximo de conforto, segurança e eficiência. Conforme a Associação Brasileira de Ergonomia (ABERGO), trata-se de uma disciplina científica que estuda as interações entre os seres humanos e outros elementos de um sistema, aplicando teoria, princípios, dados e métodos para otimizar o bem-estar humano e o desempenho global do sistema.', TRUE),
  (md5('rt-2')::uuid, 'Objetivo',                  'Objetivo da AET – Padrão NR-17',                           'Esta Análise Ergonômica do Trabalho (AET) tem como objetivo atender ao disposto na NR-17 (Ergonomia), identificar e avaliar os fatores ergonômicos presentes nos postos de trabalho da {empresa}, propondo melhorias que visem à promoção da saúde, ao conforto, à segurança e ao desempenho dos trabalhadores da função de {funcao}.', TRUE),
  (md5('rt-3')::uuid, 'Metodologia',               'Metodologia Padrão – Visita Técnica e Métodos Científicos', 'A metodologia adotada nesta AET compreende: visitas técnicas ao ambiente de trabalho; entrevistas com trabalhadores e gestores; registros fotográficos e filmagens; observação sistemática das atividades; medições de iluminância conforme NHO 11 (Fundacentro); e aplicação de métodos científicos validados (RULA, REBA, NIOSH, OWAS, entre outros) com auxílio de softwares especializados. Todos os dados foram coletados em {data}.', TRUE),
  (md5('rt-4')::uuid, 'Descrição do RULA',         'Método RULA – Descrição Padrão',                           'O método RULA (Rapid Upper Limb Assessment) foi desenvolvido por McAtamney e Corlett (1993) para avaliação rápida da exposição dos trabalhadores a fatores de risco para os membros superiores. O método analisa posturas de pescoço, tronco, membros superiores e inferiores, força exercida e tipo de atividade muscular, gerando uma pontuação final que classifica o risco em quatro níveis de ação.', TRUE),
  (md5('rt-5')::uuid, 'Descrição do REBA',         'Método REBA – Descrição Padrão',                           'O método REBA (Rapid Entire Body Assessment) foi desenvolvido por Hignett e McAtamney (2000) para avaliação de posturas de corpo inteiro em tarefas dinâmicas e imprevisíveis, comuns em serviços de saúde e indústrias. A pontuação varia de 1 a 15, classificando o risco de lesão musculoesquelética em cinco níveis de ação.', TRUE),
  (md5('rt-6')::uuid, 'Descrição do NIOSH',        'Equação de NIOSH – Descrição Padrão',                      'A Equação Revisada de NIOSH (Waters et al., 1993) é um método para avaliar tarefas de levantamento manual de cargas. O método calcula o Limite de Peso Recomendado (LPR) e o Índice de Levantamento (IL). Quando IL > 1,0, indica risco aumentado de lesão lombar para a maioria dos trabalhadores. Quando IL > 3,0, o risco é considerado muito elevado para praticamente todos os trabalhadores.', TRUE),
  (md5('rt-7')::uuid, 'Interpretação da iluminação','Iluminância – Interpretação NHO 11 Padrão',               'A medição de iluminância foi realizada conforme os procedimentos técnicos da NHO 11 – Norma de Higiene Ocupacional da Fundacentro, que estabelece critérios para avaliação dos níveis de iluminamento nos ambientes de trabalho. Os valores de referência foram obtidos da ABNT NBR ISO/CIE 8995-1:2013. A interpretação dos resultados considera a iluminância média medida (Emed) comparada ao nível mínimo recomendado para a atividade desenvolvida na {unidade}.', TRUE),
  (md5('rt-8')::uuid, 'Conclusão',                 'Conclusão Padrão – Recomendações Gerais',                  'Com base na análise ergonômica realizada na função de {funcao} da empresa {empresa}, recomenda-se a implementação das medidas propostas no inventário de riscos, priorizando as ações de curto prazo. A reavaliação ergonômica deve ser realizada após a implementação das melhorias, ou no prazo máximo de 12 meses, conforme preconiza a NR-17.', TRUE)
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------
-- Fatores de risco biomecânico
-- ------------------------------------------------------------
INSERT INTO fatores_risco_biomecanico (id, nome, ativo) VALUES
  (md5('brf-1')::uuid,  'Abdução de ombros',                      TRUE),
  (md5('brf-2')::uuid,  'Elevação de ombros',                     TRUE),
  (md5('brf-3')::uuid,  'Postura estática',                       TRUE),
  (md5('brf-4')::uuid,  'Desvio ulnar/radial',                    TRUE),
  (md5('brf-5')::uuid,  'Extensão de punho',                      TRUE),
  (md5('brf-6')::uuid,  'Uso de pinça',                           TRUE),
  (md5('brf-7')::uuid,  'Flexão de tronco',                       TRUE),
  (md5('brf-8')::uuid,  'Rotação de tronco',                      TRUE),
  (md5('brf-9')::uuid,  'Flexão/rotação cervical',                TRUE),
  (md5('brf-10')::uuid, 'Braços elevados',                        TRUE),
  (md5('brf-11')::uuid, 'Alcance excessivo',                      TRUE),
  (md5('brf-12')::uuid, 'Ortostatismo prolongado',                TRUE),
  (md5('brf-13')::uuid, 'Sedentarismo prolongado',                TRUE),
  (md5('brf-14')::uuid, 'Alta frequência de movimentos',          TRUE),
  (md5('brf-15')::uuid, 'Ciclos curtos',                          TRUE),
  (md5('brf-16')::uuid, 'Velocidade excessiva',                   TRUE),
  (md5('brf-17')::uuid, 'Metas de produção agressivas',           TRUE),
  (md5('brf-18')::uuid, 'Trabalho monótono',                      TRUE),
  (md5('brf-19')::uuid, 'Esforço físico intenso',                 TRUE),
  (md5('brf-20')::uuid, 'Peso excessivo',                         TRUE),
  (md5('brf-21')::uuid, 'Carga estática',                         TRUE),
  (md5('brf-22')::uuid, 'Vibração de mãos e braços',              TRUE),
  (md5('brf-23')::uuid, 'Levantamento de peso frequente',         TRUE),
  (md5('brf-24')::uuid, 'Transporte manual por longa distância',  TRUE),
  (md5('brf-25')::uuid, 'Falta de equipamentos de auxílio',       TRUE),
  (md5('brf-26')::uuid, 'Bancada muito alta/baixa',               TRUE),
  (md5('brf-27')::uuid, 'Falta de espaço para joelhos',           TRUE),
  (md5('brf-28')::uuid, 'Impossibilidade de alternância postural',TRUE),
  (md5('brf-29')::uuid, 'Cadeira sem ajustes',                    TRUE),
  (md5('brf-30')::uuid, 'Falta de apoio para pés',                TRUE),
  (md5('brf-31')::uuid, 'Monitor em altura inadequada',           TRUE),
  (md5('brf-32')::uuid, 'Distâncias excessivas no layout',        TRUE)
ON CONFLICT (id) DO NOTHING;

-- Categorias (PK composta: fator_id + categoria)
INSERT INTO fator_risco_biomecanico_categorias (fator_id, categoria) VALUES
  (md5('brf-1')::uuid,  'Posturas e Alcances'),
  (md5('brf-2')::uuid,  'Posturas e Alcances'),
  (md5('brf-3')::uuid,  'Posturas e Alcances'),
  (md5('brf-4')::uuid,  'Posturas e Alcances'),
  (md5('brf-5')::uuid,  'Posturas e Alcances'),
  (md5('brf-6')::uuid,  'Posturas e Alcances'),
  (md5('brf-7')::uuid,  'Posturas e Alcances'),
  (md5('brf-8')::uuid,  'Posturas e Alcances'),
  (md5('brf-9')::uuid,  'Posturas e Alcances'),
  (md5('brf-10')::uuid, 'Posturas e Alcances'),
  (md5('brf-11')::uuid, 'Posturas e Alcances'),
  (md5('brf-12')::uuid, 'Posturas e Alcances'),
  (md5('brf-13')::uuid, 'Posturas e Alcances'),
  (md5('brf-14')::uuid, 'Repetitividade e Ritmo'),
  (md5('brf-15')::uuid, 'Repetitividade e Ritmo'),
  (md5('brf-16')::uuid, 'Repetitividade e Ritmo'),
  (md5('brf-17')::uuid, 'Repetitividade e Ritmo'),
  (md5('brf-18')::uuid, 'Repetitividade e Ritmo'),
  (md5('brf-19')::uuid, 'Força e Exigência Física'),
  (md5('brf-20')::uuid, 'Força e Exigência Física'),
  (md5('brf-21')::uuid, 'Força e Exigência Física'),
  (md5('brf-22')::uuid, 'Força e Exigência Física'),
  (md5('brf-23')::uuid, 'Movimentação Manual de Cargas'),
  (md5('brf-24')::uuid, 'Movimentação Manual de Cargas'),
  (md5('brf-25')::uuid, 'Movimentação Manual de Cargas'),
  (md5('brf-26')::uuid, 'Mobiliário e Posto de Trabalho'),
  (md5('brf-27')::uuid, 'Mobiliário e Posto de Trabalho'),
  (md5('brf-28')::uuid, 'Mobiliário e Posto de Trabalho'),
  (md5('brf-29')::uuid, 'Mobiliário e Posto de Trabalho'),
  (md5('brf-30')::uuid, 'Mobiliário e Posto de Trabalho'),
  (md5('brf-31')::uuid, 'Mobiliário e Posto de Trabalho'),
  (md5('brf-32')::uuid, 'Mobiliário e Posto de Trabalho')
ON CONFLICT (fator_id, categoria) DO NOTHING;

-- ------------------------------------------------------------
-- Parâmetros normativos de iluminância
-- (sem id fixo — gerado automaticamente; sem risco de duplicata em re-run
--  pois não há unique constraint em descricao_atividade)
-- ------------------------------------------------------------
INSERT INTO parametros_normativos_iluminancia (descricao_atividade, lux_minimo, irc_minimo, tolerancia_percentual, razao_uniformidade_max, referencia_normativa, referencia_pagina)
SELECT v.descricao_atividade, v.lux_minimo, v.irc_minimo, v.tolerancia_percentual, v.razao_uniformidade_max, v.referencia_normativa, v.referencia_pagina
FROM (VALUES
  ('Escritório — Escrita, leitura e processamento de dados',       500, 80, 10.0, 5.0, 'ABNT NBR ISO/CIE 8995-1:2013', 'Tabela 5.1'),
  ('Escritório — Recepção / hall de entrada',                      300, 80, 10.0, 5.0, 'ABNT NBR ISO/CIE 8995-1:2013', 'Tabela 5.1'),
  ('Sala de reunião e treinamento',                                500, 80, 10.0, 5.0, 'ABNT NBR ISO/CIE 8995-1:2013', 'Tabela 5.1'),
  ('Corredor e área de circulação interna',                        100, 40, 10.0, 5.0, 'ABNT NBR ISO/CIE 8995-1:2013', 'Tabela 5.1'),
  ('Escadas e rampas',                                             150, 40, 10.0, 5.0, 'ABNT NBR ISO/CIE 8995-1:2013', 'Tabela 5.1'),
  ('Depósito / almoxarifado',                                      100, 40, 10.0, 5.0, 'ABNT NBR ISO/CIE 8995-1:2013', 'Tabela 5.1'),
  ('Indústria — trabalho grosseiro (sem exigência visual fina)',    200, 60, 10.0, 5.0, 'ABNT NBR ISO/CIE 8995-1:2013', 'Tabela 5.2'),
  ('Indústria — trabalho médio',                                   300, 60, 10.0, 5.0, 'ABNT NBR ISO/CIE 8995-1:2013', 'Tabela 5.2'),
  ('Indústria — trabalho fino (montagem, ajuste, inspeção)',       500, 80, 10.0, 5.0, 'ABNT NBR ISO/CIE 8995-1:2013', 'Tabela 5.2'),
  ('Usinagem de precisão',                                         500, 80, 10.0, 5.0, 'ABNT NBR ISO/CIE 8995-1:2013', 'Tabela 5.2'),
  ('Laboratório — análises gerais',                                500, 80, 10.0, 5.0, 'ABNT NBR ISO/CIE 8995-1:2013', 'Tabela 5.3'),
  ('Refeitório / copa',                                            200, 80, 10.0, 5.0, 'ABNT NBR ISO/CIE 8995-1:2013', 'Tabela 5.1'),
  ('Sanitários e vestiários',                                      200, 80, 10.0, 5.0, 'ABNT NBR ISO/CIE 8995-1:2013', 'Tabela 5.1')
) AS v(descricao_atividade, lux_minimo, irc_minimo, tolerancia_percentual, razao_uniformidade_max, referencia_normativa, referencia_pagina)
WHERE NOT EXISTS (
  SELECT 1 FROM parametros_normativos_iluminancia p
  WHERE p.descricao_atividade = v.descricao_atividade
);
