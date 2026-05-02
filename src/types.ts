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
  conclusion: 'adequada' | 'inadequada' | '';
  conclusionText: string;
  checklist: IlluminationChecklistItem[];
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

export interface AETFunction {
  id: string;
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
}

export interface AETProject {
  id: string;
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

export const DEFAULT_INTRO_ERGONOMIA =
  'A Ergonomia é o conjunto de conhecimentos científicos relativos ao homem e necessários para a concepção de ferramentas, máquinas e dispositivos que possam ser utilizados com o máximo de conforto, segurança e eficiência. Conforme a Associação Brasileira de Ergonomia (ABERGO), trata-se de uma disciplina científica que estuda as interações entre os seres humanos e outros elementos de um sistema.';

export const DEFAULT_INTRO_OBJETIVO =
  'Esta AET tem como objetivo atender ao disposto na NR-17 (Ergonomia), identificar e avaliar os fatores ergonômicos presentes nos postos de trabalho, propondo melhorias que visem à promoção da saúde, ao conforto, à segurança e ao desempenho dos trabalhadores.';

export const DEFAULT_INTRO_METODOLOGIA =
  'A metodologia adotada compreende: visitas técnicas ao ambiente de trabalho; entrevistas com trabalhadores e gestores; registros fotográficos e filmagens; observação sistemática das atividades; medições de iluminância conforme NHO 11 (Fundacentro); e aplicação de métodos científicos validados (RULA, REBA, NIOSH, entre outros) com auxílio de softwares especializados.';

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
  conclusion: '',
  conclusionText: '',
  checklist: [],
};

export const EMPTY_FUNCTION: AETFunction = {
  id: '',
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
};
