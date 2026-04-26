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
  introduction: string;
  objective: string;
  justification: string;
  environmentDescription: string;
  lightingSystem: string;
  activities: string;
  criteria: string;
  measuredValues: string;
  resultLux: string;
  interpretation: string;
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

export interface AETFunction {
  id: string;
  name: string;
  unit: string;
  sector: string;
  analysisDate: string;
  numEmployees: string;
  demandOrigin: string;
  objective: string;
  demandFound: string;
  marketSituation: string;
  product: string;
  productionLocation: string;
  productionDimension: string;
  qualityAnalysis: string;
  shifts: string;
  overtime: string;
  pauses: string;
  taskRotation: string;
  hierarchyOrganogram: string;
  workspaceDescription: string;
  collabFormation: string;
  collabTurn: string;
  opinionGender: string;
  opinionAge: string;
  opinionTime: string;
  opinionObjective: string;
  opinionThermal: string;
  opinionVentilation: string;
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
  effortDynamic: string;
  effortStatic: string;
  timeAnalysis: string;
  loadCarrying: string;
  displacement: string;
  maintenanceDesc: string;
  logisticsInfluence: string;
  logisticsDelay: string;
  reworkDesc: string;
  reworkWeek: string;
  equipments: string;
  equipPrinciple: string;
  equipProblems: string;
  cyclePrescribed: string;
  cycleReal: string;
  postureSittingPct: number;
  postureStandingPct: number;
  postureOtherPct: number;
  postureOtherDescription: string;
  illumination: AETIllumination;
  scientificMethods: AETScientificMethod[];
  images: AETImage[];
  diagnosis: string;
  riskLevel: string;
  improvements: AETImprovement[];
}

export interface AETProject {
  id: string;
  companyName: string;
  fantasyName: string;
  cnpj: string;
  address: string;
  unit: string;
  product: string;
  riskDegree: string;
  location: string;
  companyLogoDataUrl: string;
  responsibleLogoDataUrl: string;
  evaluatorName: string;
  evaluatorCrefito: string;
  evaluatorSignatureDataUrl: string;
  date: string;
  functions: AETFunction[];
}

export const EMPTY_ILLUMINATION: AETIllumination = {
  location: '', date: '', introduction: 'A medição de iluminância foi realizada conforme os procedimentos técnicos da NHO 11 – Norma de Higiene Ocupacional, da Fundacentro, que estabelece critérios para avaliação dos níveis de iluminamento nos ambientes de trabalho.',
  objective: '', justification: '', environmentDescription: '', lightingSystem: '', activities: '', criteria: '', measuredValues: '', resultLux: '', interpretation: '', checklist: []
};

export const EMPTY_FUNCTION: AETFunction = {
  id: '', name: '', unit: '', sector: '', analysisDate: '', numEmployees: '', demandOrigin: '', objective: '', demandFound: '', marketSituation: '', product: '', productionLocation: '', productionDimension: '', qualityAnalysis: '',
  shifts: '', overtime: '', pauses: '', taskRotation: '', hierarchyOrganogram: '', workspaceDescription: '',
  collabFormation: '', collabTurn: '', opinionGender: '', opinionAge: '', opinionTime: '', opinionObjective: '', opinionThermal: '', opinionVentilation: '', opinionLightingSens: '', opinionLightingDesc: '', opinionAcoustics: '', opinionEPI: '', opinionEquip: '', opinionCycle: '', opinionLayout: '', opinionDifficulties: '', opinionPressure: '', opinionRelationship: '', opinionLeadership: '', opinionMaintenanceInfluence: '', opinionMaintenanceDelay: '', opinionIntercurrences: '',
  effortDynamic: '', effortStatic: '', timeAnalysis: '', loadCarrying: '', displacement: '',
  maintenanceDesc: '', logisticsInfluence: '', logisticsDelay: '', reworkDesc: '', reworkWeek: '',
  equipments: '', equipPrinciple: '', equipProblems: '',
  cyclePrescribed: '', cycleReal: '', postureSittingPct: 50, postureStandingPct: 50, postureOtherPct: 0, postureOtherDescription: '',
  illumination: { ...EMPTY_ILLUMINATION },
  scientificMethods: [], images: [], diagnosis: '', riskLevel: '', improvements: []
};
