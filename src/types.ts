export interface AETImprovement {
  id: string;
  hazard: string;
  riskEvaluation: string;
  probability: string;
  actions: string;
}

export interface AETFunction {
  id: string;
  name: string;
  numEmployees: string;
  demandOrigin: string;
  objective: string;
  demandFound: string;
  
  // Turnos & Pausas
  shifts: string;
  overtime: string;
  pauses: string;
  taskRotation: string;
  workspaceDescription: string;
  
  // Colaborador
  collabFormation: string;
  collabTurn: string;
  opinionGender: string;
  opinionAge: string;
  opinionTime: string;
  opinionObjective: string;
  opinionThermal: string;
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

  // Exigências
  effortDynamic: string;
  effortStatic: string;
  timeAnalysis: string;
  loadCarrying: string;
  displacement: string;

  // Processo
  maintenanceDesc: string;
  logisticsInfluence: string;
  logisticsDelay: string;
  reworkDesc: string;
  reworkWeek: string;

  // Equipamentos
  equipments: string;
  equipPrinciple: string;
  equipProblems: string;

  // Modo Operatório
  cyclePrescribed: string;
  cycleReal: string;
  postureSittingPct: number;
  postureStandingPct: number;

  // Iluminação (NHO11)
  illuminationLux: string;
  illuminationComplies: boolean;
  
  // RULA
  rulaScore: string;
  rulaInterpretation: string;

  // Diagnóstico
  diagnosis: string;

  // Matriz de Risco (resumo)
  riskLevel: string; 

  improvements: AETImprovement[];
}

export interface AETProject {
  id: string;
  companyName: string;
  cnpj: string;
  address: string;
  product: string;
  riskDegree: string;
  location: string;
  evaluatorName: string;
  evaluatorCrefito: string;
  date: string;
  functions: AETFunction[];
}
