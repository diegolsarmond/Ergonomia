import {
  Company, Unit, Sector, StandardJobRole, EPI, StandardEquipment,
  SurveyQuestion, StandardPause, RiskClassification, ReportTextTemplate,
} from '../types';

export const MOCK_COMPANIES: Company[] = [
  {
    id: 'comp-1',
    razaoSocial: 'Metalúrgica São Paulo Ltda',
    nomeFantasia: 'MetalSP',
    cnpj: '12.345.678/0001-90',
    logradouro: 'Rua das Indústrias',
    numero: '1500',
    complemento: '',
    bairro: 'Distrito Industrial',
    municipio: 'Guarulhos',
    uf: 'SP',
    cep: '07220-000',
    product: 'Peças automotivas estampadas em aço carbono para sistemas de suspensão',
    riskDegree: '3',
    logoDataUrl: '',
    active: true,
  },
  {
    id: 'comp-2',
    razaoSocial: 'Distribuidora Alimentícia Norte Ltda',
    nomeFantasia: 'AlimNorte',
    cnpj: '98.765.432/0001-10',
    logradouro: 'Av. Comercial',
    numero: '3200',
    complemento: '',
    bairro: 'Parque Industrial Norte',
    municipio: 'Manaus',
    uf: 'AM',
    cep: '69075-000',
    product: 'Distribuição e armazenamento de alimentos secos e frios',
    riskDegree: '2',
    logoDataUrl: '',
    active: true,
  },
  {
    id: 'comp-3',
    razaoSocial: 'Construtora Horizonte S.A.',
    nomeFantasia: 'Horizonte',
    cnpj: '45.678.901/0001-23',
    logradouro: 'Av. das Construções',
    numero: '500',
    complemento: 'Centro Empresarial',
    bairro: 'Centro',
    municipio: 'Belo Horizonte',
    uf: 'MG',
    cep: '30130-110',
    product: 'Construção civil, obras de infraestrutura e serviços de engenharia',
    riskDegree: '4',
    logoDataUrl: '',
    active: true,
  },
];

export const MOCK_UNITS: Unit[] = [
  {
    id: 'unit-1',
    companyId: 'comp-1',
    name: 'Unidade Guarulhos',
    cep: '', logradouro: 'Rua das Indústrias', numero: '1500', complemento: '', bairro: 'Distrito Industrial',
    city: 'Guarulhos', uf: 'SP', address: 'Rua das Indústrias, 1500 - Distrito Industrial',
    productionLocation: 'Galpão principal – Linhas 1, 2 e 3', logoDataUrl: '',
  },
  {
    id: 'unit-2', companyId: 'comp-1',
    name: 'Filial Campinas',
    cep: '', logradouro: 'Rod. Dom Pedro I', numero: 'km 68', complemento: '', bairro: 'Parque Industrial',
    city: 'Campinas', uf: 'SP', address: 'Rod. Dom Pedro I, km 68 - Parque Industrial',
    productionLocation: 'Galpão B – Linha de usinagem', logoDataUrl: '',
  },
  {
    id: 'unit-3', companyId: 'comp-2',
    name: 'Centro de Distribuição Manaus',
    cep: '', logradouro: 'Av. Comercial', numero: '3200', complemento: '', bairro: 'Parque Industrial Norte',
    city: 'Manaus', uf: 'AM', address: 'Av. Comercial, 3200 - Parque Industrial Norte',
    productionLocation: 'Armazém geral + câmara fria', logoDataUrl: '',
  },
  {
    id: 'unit-4', companyId: 'comp-3',
    name: 'Sede BH',
    cep: '', logradouro: 'Av. das Construções', numero: '500', complemento: '', bairro: 'Centro Empresarial',
    city: 'Belo Horizonte', uf: 'MG', address: 'Av. das Construções, 500 - Centro Empresarial',
    productionLocation: 'Escritório + canteiro de obras ativo', logoDataUrl: '',
  },
];

export const MOCK_SECTORS: Sector[] = [
  { id: 'sect-1', companyId: 'comp-1', unitId: 'unit-1', name: 'Estamparia', description: 'Produção de peças via prensas hidráulicas e mecânicas', active: true },
  { id: 'sect-2', companyId: 'comp-1', unitId: 'unit-1', name: 'Embalagem e Expedição', description: 'Embalagem, etiquetagem e expedição de peças acabadas', active: true },
  { id: 'sect-3', companyId: 'comp-1', unitId: 'unit-1', name: 'Manutenção', description: 'Manutenção preventiva e corretiva de máquinas e instalações', active: true },
  { id: 'sect-4', companyId: 'comp-1', unitId: 'unit-1', name: 'Controle de Qualidade', description: 'Inspeção dimensional e testes de conformidade de peças', active: true },
  { id: 'sect-5', companyId: 'comp-1', unitId: 'unit-2', name: 'Usinagem', description: 'Torneamento, fresamento e furação de peças metálicas', active: true },
  { id: 'sect-6', companyId: 'comp-2', unitId: 'unit-3', name: 'Recebimento', description: 'Recebimento, conferência e entrada de mercadorias', active: true },
  { id: 'sect-7', companyId: 'comp-2', unitId: 'unit-3', name: 'Separação e Picking', description: 'Separação de pedidos e preparação para entrega', active: true },
  { id: 'sect-8', companyId: 'comp-3', unitId: 'unit-4', name: 'Administrativo', description: 'Suporte administrativo, financeiro e RH', active: true },
];

export const MOCK_JOB_ROLES: StandardJobRole[] = [
  { id: 'role-1', companyId: '', sectorId: 'sect-1', parentRoleId: '', name: 'Operador de Prensa', cbo: '7233-10', description: 'Operar prensas mecânicas e hidráulicas para estampagem de peças metálicas, seguindo as especificações técnicas e procedimentos de segurança.', active: true },
  { id: 'role-2', companyId: '', sectorId: 'sect-1', parentRoleId: 'role-1', name: 'Auxiliar de Produção', cbo: '7831-05', description: 'Auxiliar no processo produtivo, realizando atividades de montagem, embalagem, etiquetagem e organização da linha de produção.', active: true },
  { id: 'role-3', companyId: '', sectorId: 'sect-2', parentRoleId: '', name: 'Operador de Empilhadeira', cbo: '4141-05', description: 'Operar empilhadeiras para movimentação de cargas, paletização e organização do armazém ou pátio de expedição.', active: true },
  { id: 'role-4', companyId: '', sectorId: 'sect-2', parentRoleId: 'role-3', name: 'Separador de Pedidos', cbo: '4141-05', description: 'Realizar a separação (picking) de produtos conforme pedidos de venda, utilizando coletores, carrinhos ou equipamentos de apoio.', active: true },
  { id: 'role-5', companyId: '', sectorId: '', parentRoleId: '', name: 'Assistente Administrativo', cbo: '4110-10', description: 'Executar atividades de suporte administrativo, controles de planilha, atendimento telefônico e gestão de documentos.', active: true },
  { id: 'role-6', companyId: '', sectorId: 'sect-3', parentRoleId: '', name: 'Técnico de Manutenção', cbo: '9112-05', description: 'Realizar manutenção preventiva e corretiva em máquinas, equipamentos e instalações industriais.', active: true },
  { id: 'role-7', companyId: '', sectorId: 'sect-4', parentRoleId: '', name: 'Inspetor de Qualidade', cbo: '3115-10', description: 'Inspecionar matérias-primas, produtos em processo e acabados, garantindo conformidade com especificações técnicas.', active: true },
];

export const MOCK_EPIS: EPI[] = [
  { id: 'epi-p-1', name: 'Protetor Auricular Tipo Plug', type: 'Proteção auditiva', description: 'Protetor auditivo de inserção descartável. NRRsf ≥ 20 dB. Exige CA vigente.', mandatoryByDefault: true, active: true },
  { id: 'epi-p-2', name: 'Protetor Auricular Tipo Concha', type: 'Proteção auditiva', description: 'Protetor auditivo de abafamento externo, ajustável. Para ambientes com ruído > 85 dB(A).', mandatoryByDefault: false, active: true },
  { id: 'epi-p-3', name: 'Capacete de Segurança Classe B', type: 'Proteção da cabeça', description: 'Capacete com jugular para proteção contra impacto e penetração. Classe B (elétrico). Aba frontal.', mandatoryByDefault: false, active: true },
  { id: 'epi-p-4', name: 'Óculos de Proteção Incolor', type: 'Proteção dos olhos e face', description: 'Óculos de segurança com lente incolor e proteção lateral. Resistente a impacto e respingos.', mandatoryByDefault: true, active: true },
  { id: 'epi-p-5', name: 'Luva de Raspa de Couro', type: 'Proteção dos membros superiores', description: 'Luva de raspa para proteção contra cortes, abrasão e calor moderado no manuseio de materiais metálicos.', mandatoryByDefault: true, active: true },
  { id: 'epi-p-6', name: 'Luva de Malha de Aço', type: 'Proteção dos membros superiores', description: 'Luva de proteção anticorte nível 5 para manuseio de chapas e peças com bordas cortantes.', mandatoryByDefault: false, active: true },
  { id: 'epi-p-7', name: 'Botina de Segurança (Biqueira de Aço)', type: 'Proteção dos membros inferiores', description: 'Botina com biqueira de aço e solado antiderrapante. Resistência à compressão de 15 kN.', mandatoryByDefault: true, active: true },
  { id: 'epi-p-8', name: 'Avental de Raspa', type: 'Proteção do tronco', description: 'Avental de raspa de couro para proteção contra respingos de material quente e abrasão.', mandatoryByDefault: false, active: true },
  { id: 'epi-p-9', name: 'Máscara de Proteção Respiratória PFF2', type: 'Proteção respiratória', description: 'Máscara PFF2 (N95) para proteção contra particulados e névoas. Eficiência mínima de 94%.', mandatoryByDefault: false, active: true },
  { id: 'epi-p-10', name: 'Colete Refletivo', type: 'Proteção do corpo inteiro', description: 'Colete de alta visibilidade com faixas refletivas para uso em áreas de circulação de veículos.', mandatoryByDefault: false, active: true },
];

export const MOCK_EQUIPMENT: StandardEquipment[] = [
  { id: 'eq-p-1', name: 'Prensa Hidráulica', category: 'Máquina', operation: ['hidráulico'], description: 'Prensa para estampagem, conformação e corte de chapas metálicas. Capacidade variável de 50 a 500 ton.', hasDimensions: true, active: true },
  { id: 'eq-p-2', name: 'Prensa Mecânica Excêntrica', category: 'Máquina', operation: ['elétrico'], description: 'Prensa de acionamento mecânico para estampagem de média velocidade.', hasDimensions: true, active: true },
  { id: 'eq-p-3', name: 'Torno Mecânico CNC', category: 'Máquina', operation: ['elétrico'], description: 'Torno de controle numérico para usinagem de peças rotativas com alta precisão dimensional.', hasDimensions: true, active: true },
  { id: 'eq-p-4', name: 'Bancada de Trabalho', category: 'Bancada / Mesa', operation: ['manual'], description: 'Bancada metálica de uso geral para montagem, inspeção e trabalhos manuais.', hasDimensions: true, active: true },
  { id: 'eq-p-5', name: 'Empilhadeira Contrabalançada', category: 'Veículo', operation: ['elétrico', 'hidráulico'], description: 'Empilhadeira elétrica para movimentação de paletes e cargas pesadas em armazéns e pátios.', hasDimensions: true, active: true },
  { id: 'eq-p-6', name: 'Paleteira Manual', category: 'Equipamento de movimentação', operation: ['manual', 'hidráulico'], description: 'Transpalete manual hidráulico para movimentação horizontal de paletes. Capacidade até 2.500 kg.', hasDimensions: true, active: true },
  { id: 'eq-p-7', name: 'Esteira Transportadora', category: 'Esteira', operation: ['elétrico'], description: 'Esteira de correia para transporte contínuo de peças entre postos de trabalho.', hasDimensions: true, active: true },
  { id: 'eq-p-8', name: 'Mesa de Inspeção com Iluminação', category: 'Bancada / Mesa', operation: ['elétrico'], description: 'Mesa com iluminação integrada para inspeção visual de peças e componentes.', hasDimensions: true, active: true },
];

export const MOCK_SURVEY_QUESTIONS: SurveyQuestion[] = [
  { id: 'sq-1', question: 'Qual é o objetivo do seu trabalho?', category: 'Organização do trabalho', responseType: 'textarea', required: true, order: 1, active: true },
  { id: 'sq-2', question: 'Como você avalia a sensação térmica no seu posto de trabalho?', category: 'Conforto térmico', responseType: 'select', required: true, order: 2, active: true },
  { id: 'sq-3', question: 'A iluminação do seu posto de trabalho é adequada para a realização das tarefas?', category: 'Iluminação', responseType: 'yesno', required: true, order: 3, active: true },
  { id: 'sq-4', question: 'Como você avalia o nível de ruído no seu ambiente de trabalho?', category: 'Acústica', responseType: 'select', required: true, order: 4, active: true },
  { id: 'sq-5', question: 'Os equipamentos e ferramentas disponíveis são adequados para a realização das suas tarefas?', category: 'Equipamentos', responseType: 'textarea', required: false, order: 5, active: true },
  { id: 'sq-6', question: 'Como você avalia o ciclo operacional da sua função (tempo de cada tarefa)?', category: 'Organização do trabalho', responseType: 'textarea', required: false, order: 6, active: true },
  { id: 'sq-7', question: 'O layout do seu posto de trabalho facilita a realização das tarefas?', category: 'Ergonomia', responseType: 'textarea', required: false, order: 7, active: true },
  { id: 'sq-8', question: 'Quais são as principais dificuldades que você encontra ao realizar seu trabalho?', category: 'Ergonomia', responseType: 'textarea', required: true, order: 8, active: true },
  { id: 'sq-9', question: 'Você sente pressão de tempo para cumprir suas tarefas?', category: 'Organização do trabalho', responseType: 'yesno', required: true, order: 9, active: true },
  { id: 'sq-10', question: 'Como é o seu relacionamento com colegas e equipe de trabalho?', category: 'Relacionamento', responseType: 'textarea', required: false, order: 10, active: true },
  { id: 'sq-11', question: 'Sua liderança está aberta a sugestões de melhoria?', category: 'Relacionamento', responseType: 'yesno', required: false, order: 11, active: true },
  { id: 'sq-12', question: 'A manutenção dos equipamentos interfere na realização do seu trabalho?', category: 'Equipamentos', responseType: 'yesno', required: false, order: 12, active: true },
  { id: 'sq-13', question: 'Descreva intercorrências frequentes que afetam o andamento das suas atividades.', category: 'Organização do trabalho', responseType: 'textarea', required: false, order: 13, active: true },
];

export const MOCK_PAUSES: StandardPause[] = [
  { id: 'pause-1', name: 'DDS – Diálogo Diário de Segurança', duration: '10', durationUnit: 'minutos', description: 'Reunião diária de segurança no início do turno para discussão de riscos, procedimentos e comunicados.', active: true },
  { id: 'pause-2', name: 'Refeição', duration: '60', durationUnit: 'minutos', description: 'Intervalo para almoço ou jantar conforme turno. Realizado no refeitório da empresa.', active: true },
  { id: 'pause-3', name: 'Coffee Break / Lanche', duration: '15', durationUnit: 'minutos', description: 'Pausa intermediária para café e lanche. Realizada no meio do turno.', active: true },
  { id: 'pause-4', name: 'Hidratação e Necessidades Fisiológicas', duration: '5', durationUnit: 'minutos', description: 'Pausa curta para hidratação e uso de sanitário conforme necessidade do trabalhador.', active: true },
  { id: 'pause-5', name: 'Ginástica Laboral', duration: '10', durationUnit: 'minutos', description: 'Exercícios de alongamento e aquecimento realizados no início ou meio do turno, orientados por profissional de saúde.', active: true },
  { id: 'pause-6', name: 'Troca de Turno', duration: '15', durationUnit: 'minutos', description: 'Tempo de passagem de informações entre turnos e troca de EPIs/equipamentos.', active: true },
];

export const MOCK_RISK_CLASSIFICATIONS: RiskClassification[] = [
  { id: 'risk-1', name: 'Aceitável / Baixo', minScore: 1, maxScore: 3, color: '#10b981', interpretation: 'Risco tolerável. Situação aceitável. Nenhuma ação corretiva urgente é necessária, porém devem ser mantidos os controles existentes e monitorada periodicamente a condição.' },
  { id: 'risk-2', name: 'Moderado', minScore: 4, maxScore: 6, color: '#f59e0b', interpretation: 'Investigar o risco e implementar medidas de controle a médio prazo. A exposição ao risco deve ser reduzida. Monitorar a eficácia das medidas adotadas.' },
  { id: 'risk-3', name: 'Substancial / Alto', minScore: 7, maxScore: 9, color: '#f97316', interpretation: 'Risco elevado que requer ação corretiva em curto prazo. As atividades devem continuar somente com medidas de controle implementadas. Não deve-se iniciar o trabalho até que o risco seja reduzido.' },
  { id: 'risk-4', name: 'Crítico / Intolerável', minScore: 10, maxScore: 25, color: '#ef4444', interpretation: 'Risco intolerável. Paralisar imediatamente a atividade. O trabalho só pode ser retomado após a implementação de medidas de controle que reduzam o risco a nível tolerável ou moderado.' },
];

export const MOCK_REPORT_TEXTS: ReportTextTemplate[] = [
  {
    id: 'rt-1',
    section: 'Ergonomia',
    title: 'Conceito de Ergonomia – Padrão NR-17',
    text: 'A Ergonomia é o conjunto de conhecimentos científicos relativos ao homem e necessários para a concepção de ferramentas, máquinas e dispositivos que possam ser utilizados com o máximo de conforto, segurança e eficiência. Conforme a Associação Brasileira de Ergonomia (ABERGO), trata-se de uma disciplina científica que estuda as interações entre os seres humanos e outros elementos de um sistema, aplicando teoria, princípios, dados e métodos para otimizar o bem-estar humano e o desempenho global do sistema.',
    active: true,
  },
  {
    id: 'rt-2',
    section: 'Objetivo',
    title: 'Objetivo da AET – Padrão NR-17',
    text: 'Esta Análise Ergonômica do Trabalho (AET) tem como objetivo atender ao disposto na NR-17 (Ergonomia), identificar e avaliar os fatores ergonômicos presentes nos postos de trabalho da {empresa}, propondo melhorias que visem à promoção da saúde, ao conforto, à segurança e ao desempenho dos trabalhadores da função de {funcao}.',
    active: true,
  },
  {
    id: 'rt-3',
    section: 'Metodologia',
    title: 'Metodologia Padrão – Visita Técnica e Métodos Científicos',
    text: 'A metodologia adotada nesta AET compreende: visitas técnicas ao ambiente de trabalho; entrevistas com trabalhadores e gestores; registros fotográficos e filmagens; observação sistemática das atividades; medições de iluminância conforme NHO 11 (Fundacentro); e aplicação de métodos científicos validados (RULA, REBA, NIOSH, OWAS, entre outros) com auxílio de softwares especializados. Todos os dados foram coletados em {data}.',
    active: true,
  },
  {
    id: 'rt-4',
    section: 'Descrição do RULA',
    title: 'Método RULA – Descrição Padrão',
    text: 'O método RULA (Rapid Upper Limb Assessment) foi desenvolvido por McAtamney e Corlett (1993) para avaliação rápida da exposição dos trabalhadores a fatores de risco para os membros superiores. O método analisa posturas de pescoço, tronco, membros superiores e inferiores, força exercida e tipo de atividade muscular, gerando uma pontuação final que classifica o risco em quatro níveis de ação.',
    active: true,
  },
  {
    id: 'rt-5',
    section: 'Descrição do REBA',
    title: 'Método REBA – Descrição Padrão',
    text: 'O método REBA (Rapid Entire Body Assessment) foi desenvolvido por Hignett e McAtamney (2000) para avaliação de posturas de corpo inteiro em tarefas dinâmicas e imprevisíveis, comuns em serviços de saúde e indústrias. A pontuação varia de 1 a 15, classificando o risco de lesão musculoesquelética em cinco níveis de ação.',
    active: true,
  },
  {
    id: 'rt-6',
    section: 'Descrição do NIOSH',
    title: 'Equação de NIOSH – Descrição Padrão',
    text: 'A Equação Revisada de NIOSH (Waters et al., 1993) é um método para avaliar tarefas de levantamento manual de cargas. O método calcula o Limite de Peso Recomendado (LPR) e o Índice de Levantamento (IL). Quando IL > 1,0, indica risco aumentado de lesão lombar para a maioria dos trabalhadores. Quando IL > 3,0, o risco é considerado muito elevado para praticamente todos os trabalhadores.',
    active: true,
  },
  {
    id: 'rt-7',
    section: 'Interpretação da iluminação',
    title: 'Iluminância – Interpretação NHO 11 Padrão',
    text: 'A medição de iluminância foi realizada conforme os procedimentos técnicos da NHO 11 – Norma de Higiene Ocupacional da Fundacentro, que estabelece critérios para avaliação dos níveis de iluminamento nos ambientes de trabalho. Os valores de referência foram obtidos da ABNT NBR ISO/CIE 8995-1:2013. A interpretação dos resultados considera a iluminância média medida (Emed) comparada ao nível mínimo recomendado para a atividade desenvolvida na {unidade}.',
    active: true,
  },
  {
    id: 'rt-8',
    section: 'Conclusão',
    title: 'Conclusão Padrão – Recomendações Gerais',
    text: 'Com base na análise ergonômica realizada na função de {funcao} da empresa {empresa}, recomenda-se a implementação das medidas propostas no inventário de riscos, priorizando as ações de curto prazo. A reavaliação ergonômica deve ser realizada após a implementação das melhorias, ou no prazo máximo de 12 meses, conforme preconiza a NR-17.',
    active: true,
  },
];
