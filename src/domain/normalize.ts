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
    aep: base.aep
      ? {
          ...createEmptyAEPFunctionAssessment(),
          ...base.aep,
          illuminanceMeasurements: Array.isArray(base.aep?.illuminanceMeasurements) ? base.aep.illuminanceMeasurements : [],
        }
      : createEmptyAEPFunctionAssessment(),
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
  let changed = false;
  const projects = stored.map((p: any) => {
    const needsUpdate =
      !p.reportType ||
      !Array.isArray(p.functions) ||
      (p.functions as any[]).some(
        (f: any) =>
          !f.illumination ||
          !Array.isArray(f.illumination?.measurementPoints) ||
          typeof f.illumination?.referenceLux !== 'number' ||
          !f.illumination?.modelType ||
          !Array.isArray(f.risks) ||
          f.ghe === undefined ||
          f.aep === undefined,
      );
    if (needsUpdate) {
      changed = true;
      return normalizeProject(p);
    }
    return p as AETProject;
  });
  return { projects, changed };
}
