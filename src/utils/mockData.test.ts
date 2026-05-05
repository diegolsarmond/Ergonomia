import { describe, it, expect } from 'vitest';
import { createMockAEPProject, createMockAETProject } from './mockData';
import { MOCK_COMPANIES, MOCK_UNITS, MOCK_SECTORS, MOCK_JOB_ROLES } from './mockParameterData';
import { validateReport } from '../domain/reports/reportValidation';
import { calculateNHO11Simple, isNHO11ValidationError } from '../domain/nho11/nho11Calculator';
import { calculateRiskScore, isValidationError } from '../domain/risks/riskMatrix';

// ── Catalog — Empresas ───────────────────────────────────────────────────────

describe('mock catalog — companies', () => {
  it('Padaria Horizonte Azul Ltda. exists in MOCK_COMPANIES', () => {
    const c = MOCK_COMPANIES.find(x => x.id === 'company-padaria-horizonte');
    expect(c).toBeDefined();
    expect(c?.razaoSocial).toBe('Padaria Horizonte Azul Ltda.');
  });

  it('Metalúrgica Serra Clara S.A. exists in MOCK_COMPANIES', () => {
    const c = MOCK_COMPANIES.find(x => x.id === 'company-metalurgica-serra-clara');
    expect(c).toBeDefined();
    expect(c?.razaoSocial).toBe('Metalúrgica Serra Clara S.A.');
  });
});

// ── Catalog — Unidades ───────────────────────────────────────────────────────

describe('mock catalog — units', () => {
  it('Loja Matriz is linked to Padaria Horizonte', () => {
    const u = MOCK_UNITS.find(x => x.id === 'unit-padaria-matriz');
    expect(u).toBeDefined();
    expect(u?.name).toBe('Loja Matriz');
    expect(u?.companyId).toBe('company-padaria-horizonte');
  });

  it('Planta Contagem is linked to Metalúrgica Serra Clara', () => {
    const u = MOCK_UNITS.find(x => x.id === 'unit-serra-clara-contagem');
    expect(u).toBeDefined();
    expect(u?.name).toBe('Planta Contagem');
    expect(u?.companyId).toBe('company-metalurgica-serra-clara');
  });
});

// ── Catalog — Setores ────────────────────────────────────────────────────────

describe('mock catalog — sectors', () => {
  it('Atendimento ao Balcão is linked to Padaria Horizonte', () => {
    const s = MOCK_SECTORS.find(x => x.id === 'sector-padaria-atendimento');
    expect(s).toBeDefined();
    expect(s?.name).toBe('Atendimento ao Balcão');
    expect(s?.companyId).toBe('company-padaria-horizonte');
  });

  it('Produção is linked to Padaria Horizonte', () => {
    const s = MOCK_SECTORS.find(x => x.id === 'sector-padaria-producao');
    expect(s).toBeDefined();
    expect(s?.name).toBe('Produção');
    expect(s?.companyId).toBe('company-padaria-horizonte');
  });

  it('Usinagem is linked to Metalúrgica Serra Clara', () => {
    const s = MOCK_SECTORS.find(x => x.id === 'sector-serra-usinagem');
    expect(s).toBeDefined();
    expect(s?.name).toBe('Usinagem');
    expect(s?.companyId).toBe('company-metalurgica-serra-clara');
  });
});

// ── Catalog — Funções/Cargos ─────────────────────────────────────────────────

describe('mock catalog — job roles', () => {
  it('Atendente de Balcão is linked to sector Atendimento ao Balcão', () => {
    const r = MOCK_JOB_ROLES.find(x => x.id === 'role-padaria-atendente-balcao');
    expect(r).toBeDefined();
    expect(r?.name).toBe('Atendente de Balcão');
    expect(r?.sectorId).toBe('sector-padaria-atendimento');
    expect(r?.companyId).toBe('company-padaria-horizonte');
  });

  it('Auxiliar de Produção is linked to sector Produção', () => {
    const r = MOCK_JOB_ROLES.find(x => x.id === 'role-padaria-auxiliar-producao');
    expect(r).toBeDefined();
    expect(r?.name).toBe('Auxiliar de Produção');
    expect(r?.sectorId).toBe('sector-padaria-producao');
    expect(r?.companyId).toBe('company-padaria-horizonte');
  });

  it('Operador de Máquina CNC is linked to sector Usinagem', () => {
    const r = MOCK_JOB_ROLES.find(x => x.id === 'role-serra-operador-cnc');
    expect(r).toBeDefined();
    expect(r?.name).toBe('Operador de Máquina CNC');
    expect(r?.sectorId).toBe('sector-serra-usinagem');
    expect(r?.companyId).toBe('company-metalurgica-serra-clara');
  });
});

// ── Projects derive data from catalog ────────────────────────────────────────

describe('mock projects — derive data from catalog', () => {
  it('AEP project companyName and cnpj match Padaria Horizonte catalog entry', () => {
    const padaria = MOCK_COMPANIES.find(c => c.id === 'company-padaria-horizonte')!;
    const project = createMockAEPProject();
    expect(project.companyName).toBe(padaria.razaoSocial);
    expect(project.cnpj).toBe(padaria.cnpj);
  });

  it('AET project companyName and cnpj match Metalúrgica Serra Clara catalog entry', () => {
    const metalurgica = MOCK_COMPANIES.find(c => c.id === 'company-metalurgica-serra-clara')!;
    const project = createMockAETProject();
    expect(project.companyName).toBe(metalurgica.razaoSocial);
    expect(project.cnpj).toBe(metalurgica.cnpj);
  });
});

// ── Project structure ────────────────────────────────────────────────────────

describe('mock projects — structure', () => {
  it('createMockAEPProject returns reportType AEP', () => {
    expect(createMockAEPProject().reportType).toBe('AEP');
  });

  it('createMockAETProject returns reportType AET', () => {
    expect(createMockAETProject().reportType).toBe('AET');
  });

  it('AEP project has at least 2 functions', () => {
    expect(createMockAEPProject().functions.length).toBeGreaterThanOrEqual(2);
  });

  it('AET project has at least 1 function', () => {
    expect(createMockAETProject().functions.length).toBeGreaterThanOrEqual(1);
  });

  it('AEP project has distinct company from AET project', () => {
    const aep = createMockAEPProject();
    const aet = createMockAETProject();
    expect(aep.companyName).not.toBe(aet.companyName);
  });
});

// ── validateReport — no errors ───────────────────────────────────────────────

describe('mock projects — validateReport', () => {
  it('AEP project passes validation without errors', () => {
    const result = validateReport(createMockAEPProject());
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('AET project passes validation without errors', () => {
    const result = validateReport(createMockAETProject());
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});

// ── Risk scores ──────────────────────────────────────────────────────────────

describe('mock projects — risk scores are correct', () => {
  it('AEP function risks have calculated scores matching probability × severity', () => {
    const project = createMockAEPProject();
    for (const fn of project.functions) {
      for (const risk of fn.risks ?? []) {
        const calc = calculateRiskScore(risk.probability, risk.severity);
        expect(isValidationError(calc)).toBe(false);
        if (!isValidationError(calc)) {
          expect(risk.score).toBe(calc.score);
          expect(risk.riskLevel).toBe(calc.level);
        }
      }
    }
  });

  it('AET function risks have calculated scores matching probability × severity', () => {
    const project = createMockAETProject();
    for (const fn of project.functions) {
      for (const risk of fn.risks ?? []) {
        const calc = calculateRiskScore(risk.probability, risk.severity);
        expect(isValidationError(calc)).toBe(false);
        if (!isValidationError(calc)) {
          expect(risk.score).toBe(calc.score);
          expect(risk.riskLevel).toBe(calc.level);
        }
      }
    }
  });
});

// ── NHO 11 — AET illumination ────────────────────────────────────────────────

describe('mock AET project — NHO 11 illumination', () => {
  it('measurement points [520,485,510,475,495] ref=500 → average 497 / adequada', () => {
    const project = createMockAETProject();
    const fn = project.functions[0];
    const { measurementPoints, referenceLux, modelType } = fn.illumination;

    const result = calculateNHO11Simple({
      location: fn.illumination.location,
      date: fn.illumination.date,
      environmentType: '',
      taskType: '',
      referenceLux,
      points: measurementPoints,
      modelType,
    });

    expect(isNHO11ValidationError(result)).toBe(false);
    if (!isNHO11ValidationError(result)) {
      expect(result.averageLux).toBe(497);
      expect(result.conclusion).toBe('adequada');
      expect(result.tolerance10Percent).toBe(450);
    }
  });

  it('stored resultLux matches calculator average', () => {
    const fn = createMockAETProject().functions[0];
    const { measurementPoints, referenceLux, modelType, resultLux } = fn.illumination;

    const result = calculateNHO11Simple({
      location: '',
      date: '',
      environmentType: '',
      taskType: '',
      referenceLux,
      points: measurementPoints,
      modelType,
    });

    if (!isNHO11ValidationError(result)) {
      expect(resultLux).toBe(String(result.averageLux));
    }
  });

  it('stored conclusion matches calculator conclusion', () => {
    const fn = createMockAETProject().functions[0];
    const { measurementPoints, referenceLux, modelType, conclusion } = fn.illumination;

    const result = calculateNHO11Simple({
      location: '',
      date: '',
      environmentType: '',
      taskType: '',
      referenceLux,
      points: measurementPoints,
      modelType,
    });

    if (!isNHO11ValidationError(result)) {
      expect(conclusion).toBe(result.conclusion);
    }
  });
});
