import {
  AETFunction,
  AETIllumination,
  AETProject,
  EMPTY_FUNCTION,
  EMPTY_ILLUMINATION,
  ReportType,
  createEmptyAEPFunctionAssessment,
} from '../types';

// ── Illumination ─────────────────────────────────────────────────────────────

export function normalizeIllumination(raw: any): AETIllumination {
  const base = { ...EMPTY_ILLUMINATION, ...(raw ?? {}) };
  return {
    ...base,
    modelType: base.modelType ?? 'SIMPLE_AVERAGE',
    checklist: Array.isArray(base.checklist) ? base.checklist : [],
    measurementPoints: Array.isArray(base.measurementPoints) ? base.measurementPoints : [],
    referenceLux: typeof base.referenceLux === 'number' ? base.referenceLux : 0,
  };
}

// ── Function ─────────────────────────────────────────────────────────────────

export function normalizeFunction(raw: any): AETFunction {
  const base = { ...EMPTY_FUNCTION, ...(raw ?? {}) };
  return {
    ...base,
    analysisDate: base.analysisDate || new Date().toISOString().split('T')[0],
    // Always arrays
    risks:            Array.isArray(base.risks)            ? base.risks            : [],
    improvements:     Array.isArray(base.improvements)     ? base.improvements     : [],
    scientificMethods: Array.isArray(base.scientificMethods) ? base.scientificMethods : [],
    equipmentList:    Array.isArray(base.equipmentList)    ? base.equipmentList    : [],
    epiList:          Array.isArray(base.epiList)          ? base.epiList          : [],
    images:           Array.isArray(base.images)           ? base.images           : [],
    checklistAnswers: Array.isArray(base.checklistAnswers) ? base.checklistAnswers : [],
    // Nested object
    illumination: normalizeIllumination(base.illumination),
    // AEP fields — ensure they are never undefined
    ghe:                      base.ghe                      ?? '',
    generalConditions:        base.generalConditions        ?? '',
    accessConditions:         base.accessConditions         ?? '',
    workstationOrganization:  base.workstationOrganization  ?? '',
    environmentalConditions:  base.environmentalConditions  ?? '',
    biomechanicalFactors:     base.biomechanicalFactors     ?? '',
    cognitiveFactors:         base.cognitiveFactors         ?? '',
    organizationalFactors:    base.organizationalFactors    ?? '',
    prescribedTask:           base.prescribedTask           ?? '',
    realTask:                 base.realTask                 ?? '',
    conclusion:               base.conclusion               ?? '',
    requiresAET:              base.requiresAET              ?? false,
    requiresAETJustification: base.requiresAETJustification ?? '',
    // Structured AEP assessment — merge with defaults so old functions get the full shape
    aep: (() => {
      const a = base.aep ? { ...createEmptyAEPFunctionAssessment(), ...base.aep } : createEmptyAEPFunctionAssessment();
      
      // Migration: Merge processDescription and workCycleDescription into a single field if needed
      if (a.workCharacterization.workCycleDescription && !a.workCharacterization.processDescription) {
        a.workCharacterization.processDescription = a.workCharacterization.workCycleDescription;
        a.workCharacterization.workCycleDescription = '';
      }

      const bio = a.biomechanics;
      if (!bio.environmentalComfort) {
        bio.environmentalComfort = {
          lightingComplaint: 'Não',
          lightingValue: '',
          lightingDescription: '',
          noiseComplaint: 'Não',
          noiseValue: '',
          noiseDescription: '',
          temperatureComplaint: 'Não',
          temperatureValue: '',
          temperatureDescription: '',
        };
      } else {
        bio.environmentalComfort.lightingComplaint = bio.environmentalComfort.lightingComplaint || 'Não';
        bio.environmentalComfort.noiseComplaint = bio.environmentalComfort.noiseComplaint || 'Não';
        bio.environmentalComfort.temperatureComplaint = bio.environmentalComfort.temperatureComplaint || 'Não';
      }

      const groups = ['postureAndReach', 'repetitivenessAndRhythm', 'forceAndPhysicalDemand', 'manualMaterialHandling', 'furnitureAndWorkstation'] as const;
      groups.forEach(g => {
        if (Array.isArray(bio[g])) {
          bio[g] = bio[g].map((item: any) => ({
            ...item,
            selectedRiskFactors: Array.isArray(item.selectedRiskFactors) ? item.selectedRiskFactors : [],
          }));
        }
      });
      a.illuminanceMeasurements = Array.isArray(a.illuminanceMeasurements) ? a.illuminanceMeasurements : [];
      a.raciActionPlan = Array.isArray(a.raciActionPlan) ? a.raciActionPlan : [];
      a.photographicRecords = Array.isArray(a.photographicRecords) ? a.photographicRecords : [];
      a.psychosocialAnswers = Array.isArray(a.psychosocialAnswers) ? a.psychosocialAnswers : [];
      a.aetTriggers = Array.isArray(a.aetTriggers) ? a.aetTriggers.map((t: any) => ({ ...t, answer: t.answer || 'Não' })) : [];
      return a;
    })(),
  };
}

// ── Project ──────────────────────────────────────────────────────────────────

export function normalizeProject(raw: any): AETProject {
  const p: any = raw ?? {};
  return {
    id:                        p.id                        ?? '',
    reportType:                (p.reportType as ReportType) ?? 'AET',
    consultoriaLogoDataUrl:    p.consultoriaLogoDataUrl    ?? '',
    companyLogoDataUrl:        p.companyLogoDataUrl        ?? '',
    responsibleLogoDataUrl:    p.responsibleLogoDataUrl    ?? '',
    evaluatorSignatureDataUrl: p.evaluatorSignatureDataUrl ?? '',
    companyName:               p.companyName               ?? '',
    fantasyName:               p.fantasyName               ?? '',
    cnpj:                      p.cnpj                      ?? '',
    address:                   p.address                   ?? '',
    unit:                      p.unit                      ?? '',
    product:                   p.product                   ?? '',
    riskDegree:                p.riskDegree                ?? '',
    location:                  p.location                  ?? '',
    introErgonomia:            p.introErgonomia            ?? '',
    introObjetivo:             p.introObjetivo             ?? '',
    introMetodologia:          p.introMetodologia          ?? '',
    evaluatorName:             p.evaluatorName             ?? '',
    evaluatorFormation:        p.evaluatorFormation        ?? '',
    evaluatorCrefito:          p.evaluatorCrefito          ?? '',
    evaluatorCompany:          p.evaluatorCompany          ?? '',
    date:                      p.date                      ?? '',
    functions: Array.isArray(p.functions) ? p.functions.map(normalizeFunction) : [],
  };
}

// ── Load-time migration helper ────────────────────────────────────────────────
// Returns the normalized list and a flag indicating whether any project changed
// (to decide if a resave to localforage is needed without JSON.stringify cost).

export function normalizeProjectsOnLoad(
  stored: any[],
): { projects: AETProject[]; changed: boolean } {
  // Always normalize to ensure nested structures (like biomechanical risk factors)
  // are correctly initialized even if the top-level 'aep' field already exists.
  const projects = stored.map((p: any) => normalizeProject(p));
  
  // We check for changes by comparing stringified versions, or just assume changed for safety
  // since this only happens once on app load.
  return { projects, changed: true };
}
