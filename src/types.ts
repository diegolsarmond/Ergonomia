import type { RiskLevel } from './domain/risks/riskTypes';
import type { NHO11MeasurementPoint, NHO11ModelType } from './domain/nho11/nho11Types';
import type { IlluminanceMeasurement } from './domain/illuminance/illuminanceTypes';
export type { RiskLevel, NHO11MeasurementPoint, NHO11ModelType };
export type { IlluminanceMeasurement };

// ── Parameter / System entities ─────────────────────────────────────────────

export interface Company {
  id: string;
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  municipio: string;
  uf: string;
  cep: string;
  product: string;
  marketSituation: string;
  productionLocation: string;
  riskDegree: string;
  logoDataUrl: string;
  active: boolean;
}

export interface Unit {
  id: string;
  companyId: string;
  name: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  city: string;
  uf: string;
  address: string;
  productionLocation: string;
  logoDataUrl: string;
}

export interface Sector {
  id: string;
  companyId: string;
  unitId: string;
  name: string;
  description: string;
  active: boolean;
}

export interface StandardJobRole {
  id: string;
  companyId: string;
  sectorId: string;
  parentRoleId: string;
  name: string;
  cbo: string;
  description: string;
  active: boolean;
  epiIds?: string[];
  equipmentIds?: string[];
}

export interface EPI {
  id: string;
  name: string;
  type: string;
  description: string;
  mandatoryByDefault: boolean;
  active: boolean;
}

export interface StandardEquipment {
  id: string;
  name: string;
  category: string;
  operation: string[];
  description: string;
  hasDimensions: boolean;
  active: boolean;
}

export interface SurveyQuestion {
  id: string;
  question: string;
  category: string;
  responseType: string;
  options?: string[];
  required: boolean;
  order: number;
  active: boolean;
}

export interface StandardPause {
  id: string;
  name: string;
  duration: string;
  durationUnit: string;
  description: string;
  active: boolean;
}

export interface RiskClassification {
  id: string;
  name: string;
  minScore: number;
  maxScore: number;
  color: string;
  interpretation: string;
}

export interface ReportTextTemplate {
  id: string;
  section: string;
  title: string;
  text: string;
  active: boolean;
}

export interface Shift {
  id: string;
  name: string;
  description: string;
  active: boolean;
}

export interface ScientificMethodTemplate {
  id: string;
  name: string;
  description: string;
  imageDataUrls: string[];
}

export interface ChecklistQuestion {
  id: string;
  text: string;
  functionIds: string[];
}

export interface BiomechanicalRiskFactor {
  id: string;
  biomechanicalFactors: string[]; // List of categories it belongs to
  name: string;
  active: boolean;
}

export interface AETImage {
  id: string;
  dataUrl: string;
  caption: string;
  category: 'workplace' | 'bathroom' | 'equipment' | 'posture' | 'method' | 'risk_evidence' | 'other';
}

export interface IlluminationChecklistItem {
  id: string;
  description: string;
  compliant: 'sim' | 'nao' | '';
  recommendedAction: string;
  deadline: string;
  responsible: string;
  observations: string;
}

export interface AETIllumination {
  location: string;
  date: string;
  lightingType: string;
  introduction: string;
  objective: string;
  justification: string;
  environmentDescription: string;
  lightingSystem: string;
  activities: string;
  criteria: string;
  measuredValues: string;
  referenceValue: string;
  formula: string;
  resultLux: string;
  interpretation: string;
  normativeReference: string;
  modelType: NHO11ModelType;
  conclusion: 'adequada' | 'inadequada' | 'não_aplicável' | '';
  conclusionText: string;
  checklist: IlluminationChecklistItem[];
  measurementPoints: NHO11MeasurementPoint[];
  referenceLux: number;
}

export interface AETScientificMethod {
  id: string;
  methodName: string;
  description: string;
  result: string;
  riskClassification: string;
  interpretation: string;
  imageDataUrl: string;
  recommendations: string;
}

export interface AETImprovement {
  id: string;
  photoDataUrl: string;
  hazard: string;
  probability: string;
  severity: string;
  grossRiskLevel: string;
  riskClassification: string;
  riskEvaluation: string;
  actions: string;
  attenuationProbability: string;
  deadline: string;
  responsible: string;
  observations: string;
}

export interface AETEquipmentItem {
  id: string;
  name: string;
  quantity: string;
  dimensions: string;
  principle: 'manual' | 'eletrico' | 'hidraulico' | 'pneumatico' | '';
  condition: string;
  observations: string;
}

export interface AETEPIItem {
  id: string;
  name: string;
  mandatory: boolean;
  occasional: boolean;
  location: string;
  observations: string;
}

export interface ErgonomicRisk {
  id: string;
  agent: string;
  riskFactor: string;
  possibleHealthEffect: string;
  foundSituation: string;
  existingControl: string;
  improvementProposal: string;
  probability: number;
  severity: number;
  score: number;
  riskLevel: RiskLevel;
  normativeReference: string;
  evidenceImageDataUrl?: string;
  responsible?: string;
  deadline?: string;
  status?: string;
}

export interface AETFunction {
  id: string;
  // FK relationships
  unidadeId?: string;
  setorId?: string;
  // 4.1 Cabeçalho
  name: string;
  unit: string;
  sector: string;
  analysisDate: string;
  numEmployees: string;
  // 4.2 Origem da demanda
  demandOrigin: string;
  // 4.3 Objetivo
  objective: string;
  // 4.4 Demanda encontrada
  demandFound: string;
  // 4.5 Análise global
  marketSituation: string;
  product: string;
  productionLocation: string;
  // 4.6 Dimensão da produção
  productionDimension: string;
  productionGoals: string;
  qualityAnalysis: string;
  qualityEvaluator: string;
  // 4.7 Organização do trabalho
  shifts: string;
  shiftStart: string;
  shiftEnd: string;
  workDays: string;
  overtime: string;
  pauses: string;
  taskRotation: string;
  bathroomDistance: string;
  bathroomCondition: string;
  hierarchyOrganogram: string;
  workspaceDescription: string;
  // 4.8 Colaborador
  collabFormation: string;
  collabTurn: string;
  opinionGender: string;
  opinionAge: string;
  opinionTime: string;
  // 4.9 Opinião do trabalhador
  opinionObjective: string;
  opinionThermal: string;
  opinionVentilation: string;
  opinionVentilationDesc: string;
  opinionLightingSens: string;
  opinionLightingDesc: string;
  opinionAcoustics: string;
  opinionEPI: string;
  opinionEquip: string;
  opinionCycle: string;
  opinionLayout: string;
  opinionDifficulties: string;
  opinionPressure: string;
  opinionRelationship: string;
  opinionLeadership: string;
  opinionMaintenanceInfluence: string;
  opinionMaintenanceDelay: string;
  opinionIntercurrences: string;
  // 4.10 Exigências
  effortDynamic: string;
  effortStatic: string;
  // 4.11 Cronoanálise
  timeAnalysis: string;
  // 4.12 Carregamento de peso
  loadCarrying: string;
  // 4.13 Deslocamentos
  displacement: string;
  // 4.14 Manutenções
  maintenanceDesc: string;
  maintenanceCausesDelay: string;
  // 4.15 Logística
  logisticsInfluence: string;
  logisticsDelay: string;
  // 4.16 Retrabalho / refugo
  reworkDesc: string;
  reworkWeek: string;
  reworkNotApplicable: boolean;
  // 4.17 Equipamentos (CRUD)
  usesEquipment: boolean;
  usesEPI: boolean;
  equipmentList: AETEquipmentItem[];
  epiList: AETEPIItem[];
  equipProblems: string;
  // 4.18 Modo operatório
  cyclePrescribed: string;
  cycleReal: string;
  // 4.19 Predominância postural
  postureSittingPct: number;
  postureStandingPct: number;
  postureWalkingPct: number;
  postureCrouchingPct: number;
  postureOtherPct: number;
  postureOtherDescription: string;
  // 4.20 Meio ambiente
  meioAmbiente: string;
  // Assessment
  illumination: AETIllumination;
  scientificMethods: AETScientificMethod[];
  images: AETImage[];
  diagnosis: string;
  riskLevel: string;
  improvements: AETImprovement[];
  checklistAnswers: { questionId: string; answer: 'sim' | 'nao' | 'nao_se_aplica' | '' }[];
  rulaScore?: string;
  risks?: ErgonomicRisk[];
  // AEP-specific fields (optional for backward compatibility)
  ghe?: string;
  generalConditions?: string;
  accessConditions?: string;
  workstationOrganization?: string;
  environmentalConditions?: string;
  biomechanicalFactors?: string;
  cognitiveFactors?: string;
  organizationalFactors?: string;
  prescribedTask?: string;
  realTask?: string;
  conclusion?: string;
  requiresAET?: boolean;
  requiresAETJustification?: string;
  // Structured AEP assessment (planilha AEP 2026)
  aep?: AEPFunctionAssessment;
}

export interface AEPFunctionFields {
  ghe: string;
  generalConditions: string;
  accessConditions: string;
  workstationOrganization: string;
  environmentalConditions: string;
  biomechanicalFactors: string;
  cognitiveFactors: string;
  organizationalFactors: string;
  prescribedTask: string;
  realTask: string;
  conclusion: string;
  requiresAET: boolean;
  requiresAETJustification: string;
}

// ── AEP — Structured Assessment (planilha "AEP 2026 modelo") ─────────────────

export type BiomechanicalAssessment = 'Regular' | 'OK' | 'Atenção' | 'Crítico' | 'N.A.' | '';

export interface BiomechanicalItem {
  riskFactorId: string;
  assessment: BiomechanicalAssessment;
  description: string;
}

export interface EnvironmentalComfortItem {
  lightingComplaint: 'Sim' | 'Não' | '';
  lightingValue: string;
  lightingDescription: string;
  noiseComplaint: 'Sim' | 'Não' | '';
  noiseValue: string;
  noiseDescription: string;
  temperatureComplaint: 'Sim' | 'Não' | '';
  temperatureValue: string;
  temperatureDescription: string;
}

export interface PsychosocialQuestion {
  id: string;
  group: string;
  question: string;
  score: number | '';
  scaleLabel: string;
  inverted: boolean;
  comments: string;
}

export interface AETTrigger {
  id: string;
  answer: 'Sim' | 'Não' | '';
  description: string;
}

export interface RACIAction {
  id: string;
  riskFactor: string;
  action: string;
  responsible: string;
  accountable: string;
  consulted: string;
  informed: string;
  deadline: string;
  priority: 'Baixa' | 'Média' | 'Alta' | 'Crítica' | '';
  status: 'Pendente' | 'Em andamento' | 'Concluído' | 'Cancelado' | '';
  imageDataUrl?: string;
}

export interface ScientificToolItem {
  id: string;
  toolName: string;
  result: string;
  interpretation: string;
  recommendation: string;
  imageDataUrl?: string;
}

export interface PhotoRecord {
  id: string;
  imageDataUrl: string;
  description: string;
}

export interface AEPFunctionAssessment {
  // 1. Identificação
  identification: {
    unitBranch: string;
    sectorArea: string;
    contemplatedFunctions: string;
    evaluatedActivity: string;
    code: string;
    unitId?: string;
    sectorId?: string;
  };

  // 2. Caracterização do Trabalho
  workCharacterization: {
    processDescription: string;
    workCycleDescription: string;
    workOrganization: {
      workday: string;
      scale: string;
      overtime: string;
      lunchBreak: string;
      otherBreaks: string;
      taskRotation: string;
      safetyDialogues: string;
    };
    toolsAndMaterials: {
      description: string;
      epis: string;
      others: string;
    };
  };

  // 3. Registro Fotográfico
  photographicRecords: PhotoRecord[];
  lgpdNote: string;

  // 4. Biomecânica
  biomechanics: {
    postureAndReach: BiomechanicalItem[];
    repetitivenessAndRhythm: BiomechanicalItem[];
    forceAndPhysicalDemand: BiomechanicalItem[];
    manualMaterialHandling: BiomechanicalItem[];
    furnitureAndWorkstation: BiomechanicalItem[];
    environmentalComfort: EnvironmentalComfortItem;
  };

  // 5. Ferramentas Científicas
  scientificTools: ScientificToolItem[];

  // 5b. Medições de Iluminância (malha de medição)
  illuminanceMeasurements: IlluminanceMeasurement[];

  // 6. Psicossocial
  psychosocialAnswers: PsychosocialQuestion[];
  psychosocialAverages: {
    demandRhythm: number;
    autonomyControl: number;
    roleClarityConflict: number;
    socialSupportLeadership: number;
    recognitionJusticePsychSafety: number;
    overall: number;
  };
  psychosocialClassification: 'VERDE' | 'AMARELO' | 'VERMELHO' | '';
  psychosocialInterpretation: string;

  // 7. Classificação de Risco / Gatilhos AET
  aetTriggers: AETTrigger[];
  finalGuidance: string;
  decisionJustification: string;

  // 8. Plano de Ação RACI
  raciActionPlan: RACIAction[];

  // 9. Responsável Técnico
  technicalResponsible: {
    name: string;
    registration: string;
    formation: string;
    company: string;
    signatureDataUrl: string;
  };
}

const LGPD_NOTE =
  'Nota LGPD: As fotografias priorizam o posto de trabalho e a biomecânica da tarefa. Em caso de identificação de indivíduos, os rostos devem ser desfocados para preservar a privacidade e atender à Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018).';

export function createEmptyAEPFunctionAssessment(): AEPFunctionAssessment {
  return {
    identification: {
      unitBranch: '',
      sectorArea: '',
      contemplatedFunctions: '',
      evaluatedActivity: '',
      code: '',
      unitId: '',
      sectorId: '',
    },
    workCharacterization: {
      processDescription: '',
      workCycleDescription: '',
      workOrganization: {
        workday: '',
        scale: '',
        overtime: '',
        lunchBreak: '',
        otherBreaks: '',
        taskRotation: '',
        safetyDialogues: '',
      },
      toolsAndMaterials: {
        description: '',
        epis: '',
        others: '',
      },
    },
    photographicRecords: [],
    lgpdNote: LGPD_NOTE,
    biomechanics: {
      postureAndReach: [{ riskFactorId: '__na__', assessment: 'N.A.' as const, description: '' }],
      repetitivenessAndRhythm: [{ riskFactorId: '__na__', assessment: 'N.A.' as const, description: '' }],
      forceAndPhysicalDemand: [{ riskFactorId: '__na__', assessment: 'N.A.' as const, description: '' }],
      manualMaterialHandling: [{ riskFactorId: '__na__', assessment: 'N.A.' as const, description: '' }],
      furnitureAndWorkstation: [{ riskFactorId: '__na__', assessment: 'N.A.' as const, description: '' }],
      environmentalComfort: {
        lightingComplaint: 'Não',
        lightingValue: '',
        lightingDescription: '',
        noiseComplaint: 'Não',
        noiseValue: '',
        noiseDescription: '',
        temperatureComplaint: 'Não',
        temperatureValue: '',
        temperatureDescription: '',
      },
    },
    scientificTools: [],
    illuminanceMeasurements: [],
    psychosocialAnswers: [
      { id: 'psy-1', group: 'Demandas / Ritmo', question: 'Preciso trabalhar muito rápido para dar conta das minhas tarefas.', score: '', scaleLabel: '1=Nunca · 2=Raramente · 3=Às vezes · 4=Frequentemente · 5=Sempre', inverted: false, comments: '' },
      { id: 'psy-2', group: 'Demandas / Ritmo', question: 'Tenho um volume de trabalho acima do que consigo fazer no tempo disponível.', score: '', scaleLabel: '1=Nunca · 2=Raramente · 3=Às vezes · 4=Frequentemente · 5=Sempre', inverted: false, comments: '' },
      { id: 'psy-3', group: 'Demandas / Ritmo', question: 'Meu trabalho exige esforço emocional frequente (lidar com conflitos, reclamações, pressão).', score: '', scaleLabel: '1=Nunca · 2=Raramente · 3=Às vezes · 4=Frequentemente · 5=Sempre', inverted: false, comments: '' },
      { id: 'psy-4', group: 'Autonomia / Controle', question: 'Tenho liberdade para escolher como executar minhas tarefas.', score: '', scaleLabel: '1=Nunca · 2=Raramente · 3=Às vezes · 4=Frequentemente · 5=Sempre', inverted: true, comments: '' },
      { id: 'psy-5', group: 'Autonomia / Controle', question: 'Consigo influenciar a ordem/prioridade das minhas atividades.', score: '', scaleLabel: '1=Nunca · 2=Raramente · 3=Às vezes · 4=Frequentemente · 5=Sempre', inverted: true, comments: '' },
      { id: 'psy-6', group: 'Clareza / Conflito de Papéis', question: 'Sei exatamente o que é esperado de mim no trabalho.', score: '', scaleLabel: '1=Nunca · 2=Raramente · 3=Às vezes · 4=Frequentemente · 5=Sempre', inverted: true, comments: '' },
      { id: 'psy-7', group: 'Clareza / Conflito de Papéis', question: 'Recebo demandas conflitantes (ex: qualidade vs. velocidade; segurança vs. produção).', score: '', scaleLabel: '1=Nunca · 2=Raramente · 3=Às vezes · 4=Frequentemente · 5=Sempre', inverted: false, comments: '' },
      { id: 'psy-8', group: 'Apoio Social e Liderança', question: 'Posso contar com apoio dos colegas quando preciso.', score: '', scaleLabel: '1=Nunca · 2=Raramente · 3=Às vezes · 4=Frequentemente · 5=Sempre', inverted: true, comments: '' },
      { id: 'psy-9', group: 'Apoio Social e Liderança', question: 'Minha liderança ajuda a resolver obstáculos do trabalho.', score: '', scaleLabel: '1=Nunca · 2=Raramente · 3=Às vezes · 4=Frequentemente · 5=Sempre', inverted: true, comments: '' },
      { id: 'psy-10', group: 'Apoio Social e Liderança', question: 'Sou tratado com respeito no ambiente de trabalho.', score: '', scaleLabel: '1=Nunca · 2=Raramente · 3=Às vezes · 4=Frequentemente · 5=Sempre', inverted: true, comments: '' },
      { id: 'psy-11', group: 'Reconhecimento, Justiça e Segurança Psicológica', question: 'Sinto que meu trabalho é reconhecido de forma justa.', score: '', scaleLabel: '1=Nunca · 2=Raramente · 3=Às vezes · 4=Frequentemente · 5=Sempre', inverted: true, comments: '' },
      { id: 'psy-12', group: 'Reconhecimento, Justiça e Segurança Psicológica', question: 'Tenho receio de falar sobre problemas/erros/riscos sem sofrer punição.', score: '', scaleLabel: '1=Nunca · 2=Raramente · 3=Às vezes · 4=Frequentemente · 5=Sempre', inverted: false, comments: '' },
      { id: 'psy-13', group: 'Reconhecimento, Justiça e Segurança Psicológica', question: 'Já sofri algum tipo de assédio?', score: '', scaleLabel: '1=Nunca · 2=Raramente · 3=Às vezes · 4=Frequentemente · 5=Sempre', inverted: false, comments: '' },
    ],
    psychosocialAverages: {
      demandRhythm: 0,
      autonomyControl: 0,
      roleClarityConflict: 0,
      socialSupportLeadership: 0,
      recognitionJusticePsychSafety: 0,
      overall: 0,
    },
    psychosocialClassification: '',
    psychosocialInterpretation: '',
    aetTriggers: [
      { id: 'trig-1', answer: 'Não', description: 'Suspeita de adoecimento ou queixas osteomusculares recorrentes relacionadas diretamente ao posto de trabalho.' },
      { id: 'trig-2', answer: 'Não', description: 'Movimentação Manual de Cargas (MMC) relevante e frequente, sem a disponibilidade ou uso adequado de auxílios mecânicos ou engenharia.' },
      { id: 'trig-3', answer: 'Não', description: 'Repetitividade de movimentos de alta frequência combinada com restrição de pausas ou ausência de rodízio de tarefas.' },
      { id: 'trig-4', answer: 'Não', description: 'Posturas forçadas ou estáticas sustentadas por tempo prolongado, sem possibilidade de ajustes ou alternância postural.' },
      { id: 'trig-5', answer: 'Não', description: 'Resultado do Bloco Psicossocial classificado como VERMELHO (Alto Risco) persistente, com impacto percebido na saúde ou segurança.' },
      { id: 'trig-6', answer: 'Não', description: 'Mudança significativa no processo de trabalho, layout, equipamentos ou ferramentas que possa ter introduzido novos riscos ergonômicos ou agravado os existentes.' },
      { id: 'trig-7', answer: 'Não', description: 'Existência de não conformidades graves identificadas em auditorias internas ou externas (MPT/MTE) relacionadas à ergonomia do posto.' },
    ],
    finalGuidance: '',
    decisionJustification: '',
    raciActionPlan: [],
    technicalResponsible: {
      name: '',
      registration: '',
      formation: '',
      company: '',
      signatureDataUrl: '',
    },
  };
}

export type ReportType = 'AEP' | 'AET';

export interface AETProject {
  id: string;
  reportType: ReportType;
  // FK relationships
  empresaId?: string;
  unidadeId?: string;
  // Logos
  consultoriaLogoDataUrl: string;
  companyLogoDataUrl: string;
  responsibleLogoDataUrl: string;
  // Empresa (seção 1.2)
  companyName: string;
  fantasyName: string;
  cnpj: string;
  address: string;
  unit: string;
  product: string;
  riskDegree: string;
  location: string;
  // Introdução — textos editáveis (seções 1.1, 1.3, 1.4)
  introErgonomia: string;
  introObjetivo: string;
  introMetodologia: string;
  // Responsável técnico (seção 9)
  evaluatorName: string;
  evaluatorFormation: string;
  evaluatorCrefito: string;
  evaluatorCompany: string;
  evaluatorSignatureDataUrl: string;
  date: string;
  functions: AETFunction[];
}

// ── Default values ──────────────────────────────────────────────────────────

const ERGONOMIA_CONCEPT =
  'A Ergonomia é o conjunto de conhecimentos científicos relativos ao homem e necessários para a concepção de ferramentas, máquinas e dispositivos que possam ser utilizados com o máximo de conforto, segurança e eficiência. Conforme a Associação Brasileira de Ergonomia (ABERGO), trata-se de uma disciplina científica que estuda as interações entre os seres humanos e outros elementos de um sistema.';

// AEP — Análise Ergonômica Preliminar
export const DEFAULT_AEP_INTRO_ERGONOMIA = ERGONOMIA_CONCEPT;

export const DEFAULT_AEP_INTRO_OBJETIVO =
  'Esta AEP tem como objetivo realizar uma avaliação ergonômica preliminar das condições de trabalho nos postos avaliados, identificando os principais fatores de risco ergonômico, priorizando-os por meio de matriz de risco e propondo ações corretivas e preventivas, em conformidade com a NR-17 (Ergonomia) e demais normas aplicáveis.';

export const DEFAULT_AEP_INTRO_METODOLOGIA =
  'A metodologia adotada para esta AEP compreende: visitas técnicas ao ambiente de trabalho; observação direta e registro fotográfico dos postos de trabalho; entrevistas com trabalhadores e gestores; identificação e classificação dos fatores de risco ergonômico; e avaliação por meio da Matriz de Risco (Probabilidade × Gravidade), com elaboração de plano de ação prioritário.';

// AET — Análise Ergonômica do Trabalho
export const DEFAULT_AET_INTRO_ERGONOMIA = ERGONOMIA_CONCEPT;

export const DEFAULT_AET_INTRO_OBJETIVO =
  'Esta AET tem como objetivo atender ao disposto na NR-17 (Ergonomia), identificar e avaliar os fatores ergonômicos presentes nos postos de trabalho, propondo melhorias que visem à promoção da saúde, ao conforto, à segurança e ao desempenho dos trabalhadores.';

export const DEFAULT_AET_INTRO_METODOLOGIA =
  'A metodologia adotada compreende: visitas técnicas ao ambiente de trabalho; entrevistas com trabalhadores e gestores; registros fotográficos e filmagens; observação sistemática das atividades; medições de iluminância conforme NHO 11 (Fundacentro); e aplicação de métodos científicos validados (RULA, REBA, NIOSH, entre outros) com auxílio de softwares especializados.';

// Aliases para compatibilidade — apontam para AET (tipo padrão)
export const DEFAULT_INTRO_ERGONOMIA  = DEFAULT_AET_INTRO_ERGONOMIA;
export const DEFAULT_INTRO_OBJETIVO   = DEFAULT_AET_INTRO_OBJETIVO;
export const DEFAULT_INTRO_METODOLOGIA = DEFAULT_AET_INTRO_METODOLOGIA;

export const EMPTY_ILLUMINATION: AETIllumination = {
  location: '',
  date: '',
  lightingType: '',
  introduction: 'A medição de iluminância foi realizada conforme os procedimentos técnicos da NHO 11 – Norma de Higiene Ocupacional, da Fundacentro, que estabelece critérios para avaliação dos níveis de iluminamento nos ambientes de trabalho.',
  objective: '',
  justification: '',
  environmentDescription: '',
  lightingSystem: '',
  activities: '',
  criteria: '',
  measuredValues: '',
  referenceValue: '',
  formula: 'Emed = Σ(Ei) / n',
  resultLux: '',
  interpretation: '',
  normativeReference: 'NHO 11 – Fundacentro; ABNT NBR ISO/CIE 8995-1:2013',
  modelType: 'SIMPLE_AVERAGE',
  conclusion: '',
  conclusionText: '',
  checklist: [],
  measurementPoints: [],
  referenceLux: 0,
};

export const EMPTY_FUNCTION: AETFunction = {
  id: '',
  unidadeId: '',
  setorId: '',
  name: '',
  unit: '',
  sector: '',
  analysisDate: '',
  numEmployees: '',
  demandOrigin: 'Departamento de Saúde e Segurança Ocupacional – atualização da análise ergonômica e avaliação de possíveis riscos ergonômicos.',
  objective: 'Observar e relatar situações que possam ser ergonomicamente aprimoradas, contribuindo para a melhoria das condições de trabalho e qualidade de vida dos colaboradores.',
  demandFound: '',
  marketSituation: '',
  product: '',
  productionLocation: '',
  productionDimension: '',
  productionGoals: '',
  qualityAnalysis: '',
  qualityEvaluator: '',
  shifts: '',
  shiftStart: '',
  shiftEnd: '',
  workDays: '',
  overtime: '',
  pauses: '',
  taskRotation: '',
  bathroomDistance: '',
  bathroomCondition: '',
  hierarchyOrganogram: '',
  workspaceDescription: '',
  collabFormation: '',
  collabTurn: '',
  opinionGender: '',
  opinionAge: '',
  opinionTime: '',
  opinionObjective: '',
  opinionThermal: '',
  opinionVentilation: '',
  opinionVentilationDesc: '',
  opinionLightingSens: '',
  opinionLightingDesc: '',
  opinionAcoustics: '',
  opinionEPI: '',
  opinionEquip: '',
  opinionCycle: '',
  opinionLayout: '',
  opinionDifficulties: '',
  opinionPressure: '',
  opinionRelationship: '',
  opinionLeadership: '',
  opinionMaintenanceInfluence: '',
  opinionMaintenanceDelay: '',
  opinionIntercurrences: '',
  effortDynamic: '',
  effortStatic: '',
  timeAnalysis: '',
  loadCarrying: '',
  displacement: '',
  maintenanceDesc: '',
  maintenanceCausesDelay: '',
  logisticsInfluence: '',
  logisticsDelay: '',
  reworkDesc: '',
  reworkWeek: '',
  reworkNotApplicable: false,
  usesEquipment: false,
  usesEPI: false,
  equipmentList: [],
  epiList: [],
  equipProblems: '',
  cyclePrescribed: 'VIDE PGR',
  cycleReal: '',
  postureSittingPct: 0,
  postureStandingPct: 0,
  postureWalkingPct: 0,
  postureCrouchingPct: 0,
  postureOtherPct: 0,
  postureOtherDescription: '',
  meioAmbiente: 'Vide LTCAT / Vide PGR',
  illumination: { ...EMPTY_ILLUMINATION },
  scientificMethods: [],
  images: [],
  diagnosis: '',
  riskLevel: '',
  improvements: [],
  checklistAnswers: [],
  rulaScore: '',
  risks: [],
  // AEP fields
  ghe: '',
  generalConditions: '',
  accessConditions: '',
  workstationOrganization: '',
  environmentalConditions: '',
  biomechanicalFactors: '',
  cognitiveFactors: '',
  organizationalFactors: '',
  prescribedTask: '',
  realTask: '',
  conclusion: '',
  requiresAET: false,
  requiresAETJustification: '',
  aep: createEmptyAEPFunctionAssessment(),
};
