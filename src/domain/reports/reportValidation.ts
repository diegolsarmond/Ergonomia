import type { AETProject, AETFunction } from '../../types';
import type { ReportValidationResult, ValidationIssue } from './reportValidationTypes';

function required(
  value: string | undefined | null,
  path: string,
  message: string,
  out: ValidationIssue[],
): void {
  if (!value || value.trim() === '') {
    out.push({ path, message, severity: 'error' });
  }
}

function validateProjectHeader(project: AETProject, errors: ValidationIssue[]): void {
  required(project.companyName,       'companyName',       'Razão social da empresa é obrigatória.',        errors);
  required(project.cnpj,              'cnpj',              'CNPJ é obrigatório.',                           errors);
  required(project.date,              'date',              'Data do relatório é obrigatória.',               errors);
  required(project.evaluatorName,     'evaluatorName',     'Nome do avaliador responsável é obrigatório.',  errors);
  required(project.evaluatorCrefito,  'evaluatorCrefito',  'CREFITO do avaliador é obrigatório.',           errors);
}

function validateAEPFunction(fn: AETFunction, idx: number, errors: ValidationIssue[], warnings: ValidationIssue[]): void {
  const prefix = `functions[${idx}]`;
  const label  = fn.name ? `"${fn.name}"` : `#${idx + 1}`;

  required(fn.name, `${prefix}.name`, `Função ${label}: nome é obrigatório.`, errors);

  if (!fn.numEmployees?.trim()) {
    warnings.push({ path: `${prefix}.numEmployees`, message: `Função ${label}: número de colaboradores não informado.`, severity: 'warning' });
  }

  // Structured AEP assessment validation
  const aep = fn.aep;
  if (aep) {
    const hasActivity = !!(aep.identification.evaluatedActivity?.trim() || fn.demandFound?.trim());
    if (!hasActivity) {
      warnings.push({ path: `${prefix}.aep.identification.evaluatedActivity`, message: `Função ${label}: atividade avaliada não informada.`, severity: 'warning' });
    }

    const hasProcess = !!(aep.workCharacterization.processDescription?.trim() || fn.prescribedTask?.trim());
    if (!hasProcess) {
      warnings.push({ path: `${prefix}.aep.workCharacterization.processDescription`, message: `Função ${label}: descrição do processo não informada.`, severity: 'warning' });
    }

    const allItems = [
      ...aep.biomechanics.postureAndReach,
      ...aep.biomechanics.repetitivenessAndRhythm,
      ...aep.biomechanics.forceAndPhysicalDemand,
      ...aep.biomechanics.manualMaterialHandling,
      ...aep.biomechanics.furnitureAndWorkstation,
    ];
    const hasAnyBiomecAssessment = allItems.some(i => i.assessment !== '');
    if (!hasAnyBiomecAssessment) {
      warnings.push({ path: `${prefix}.aep.biomechanics`, message: `Função ${label}: nenhum item de biomecânica avaliado.`, severity: 'warning' });
    }

    const hasAnyTrigger = aep.aetTriggers.some(t => t.answer !== '');
    if (!hasAnyTrigger) {
      warnings.push({ path: `${prefix}.aep.aetTriggers`, message: `Função ${label}: gatilhos de AET não respondidos.`, severity: 'warning' });
    }
  } else {
    // Legacy AEP validation
    required(fn.ghe,         `${prefix}.ghe`,         `Função ${label}: GHE é obrigatório.`,               errors);
    required(fn.demandFound, `${prefix}.demandFound`,  `Função ${label}: demanda encontrada é obrigatória.`, errors);
    required(fn.conclusion,  `${prefix}.conclusion`,   `Função ${label}: conclusão é obrigatória.`,          errors);

    const hasPrescribed = !!(fn.prescribedTask?.trim() || fn.cyclePrescribed?.trim());
    if (!hasPrescribed) {
      errors.push({ path: `${prefix}.prescribedTask`, message: `Função ${label}: tarefa prescrita ou ciclo prescrito é obrigatório.`, severity: 'error' });
    }
    const hasReal = !!(fn.realTask?.trim() || fn.cycleReal?.trim());
    if (!hasReal) {
      errors.push({ path: `${prefix}.realTask`, message: `Função ${label}: tarefa real ou ciclo real é obrigatório.`, severity: 'error' });
    }
    if (!fn.risks || fn.risks.length === 0) {
      warnings.push({ path: `${prefix}.risks`, message: `Função ${label}: nenhum risco ergonômico cadastrado.`, severity: 'warning' });
    }
  }
}

function validateAETFunction(fn: AETFunction, idx: number, errors: ValidationIssue[], warnings: ValidationIssue[]): void {
  const prefix = `functions[${idx}]`;
  const label  = fn.name ? `"${fn.name}"` : `#${idx + 1}`;

  required(fn.demandOrigin,    `${prefix}.demandOrigin`,    `Função ${label}: origem da demanda é obrigatória.`, errors);
  required(fn.objective,       `${prefix}.objective`,       `Função ${label}: objetivo é obrigatório.`,          errors);
  required(fn.demandFound,     `${prefix}.demandFound`,     `Função ${label}: demanda encontrada é obrigatória.`, errors);
  required(fn.shifts,          `${prefix}.shifts`,          `Função ${label}: turnos são obrigatórios.`,         errors);
  required(fn.pauses,          `${prefix}.pauses`,          `Função ${label}: pausas são obrigatórias.`,         errors);
  required(fn.cyclePrescribed, `${prefix}.cyclePrescribed`, `Função ${label}: ciclo prescrito é obrigatório.`,   errors);
  required(fn.cycleReal,       `${prefix}.cycleReal`,       `Função ${label}: ciclo real é obrigatório.`,        errors);
  required(fn.diagnosis,       `${prefix}.diagnosis`,       `Função ${label}: diagnóstico é obrigatório.`,       errors);

  if (!fn.scientificMethods || fn.scientificMethods.length === 0) {
    warnings.push({
      path: `${prefix}.scientificMethods`,
      message: `Função ${label}: nenhum método científico aplicado.`,
      severity: 'warning',
    });
  }

  const hasRisks       = fn.risks        && fn.risks.length > 0;
  const hasImprovements = fn.improvements && fn.improvements.length > 0;
  if (!hasRisks && !hasImprovements) {
    warnings.push({
      path: `${prefix}.risks`,
      message: `Função ${label}: nenhum risco ou melhoria cadastrado.`,
      severity: 'warning',
    });
  }
}

export function validateReport(project: AETProject): ReportValidationResult {
  const errors:   ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];

  validateProjectHeader(project, errors);

  if (!project.functions || project.functions.length === 0) {
    errors.push({
      path: 'functions',
      message: 'O projeto deve ter pelo menos uma função analisada.',
      severity: 'error',
    });
  } else {
    project.functions.forEach((fn, idx) => {
      if (project.reportType === 'AEP') {
        validateAEPFunction(fn, idx, errors, warnings);
      } else {
        validateAETFunction(fn, idx, errors, warnings);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
