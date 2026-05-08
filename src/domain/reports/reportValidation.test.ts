import { describe, it, expect } from 'vitest';
import { validateReport } from './reportValidation';
import type { AETProject, AETFunction } from '../../types';
import { EMPTY_FUNCTION } from '../../types';

// ── Minimal object factories ─────────────────────────────────────────────────

function makeProject(overrides: Partial<AETProject> = {}): AETProject {
  return {
    id: '1',
    reportType: 'AEP',
    consultoriaLogoDataUrl: '',
    companyLogoDataUrl: '',
    responsibleLogoDataUrl: '',
    evaluatorSignatureDataUrl: '',
    companyName: 'Empresa Teste',
    fantasyName: '',
    cnpj: '00.000.000/0001-00',
    address: '',
    unit: '',
    product: '',
    riskDegree: '',
    location: '',
    introErgonomia: '',
    introObjetivo: '',
    introMetodologia: '',
    evaluatorName: 'Avaliador',
    evaluatorFormation: '',
    evaluatorCrefito: 'CREFITO-3/123',
    evaluatorCompany: '',
    date: '2024-01-01',
    functions: [],
    ...overrides,
  };
}

// Valid AEP function — structured (new path)
function makeAEPFunction(overrides: Partial<AETFunction> = {}): AETFunction {
  return {
    ...EMPTY_FUNCTION,
    id: 'f1',
    name: 'Operador',
    numEmployees: '5',
    ghe: 'GHE-01',
    demandFound: 'Análise concluída',
    conclusion: 'adequada',
    realTask: 'Tarefa real observada',
    // aep comes from EMPTY_FUNCTION (structured path)
    ...overrides,
  };
}

// Legacy AEP function — no structured aep (legacy path)
function makeLegacyAEPFunction(overrides: Partial<AETFunction> = {}): AETFunction {
  return {
    ...EMPTY_FUNCTION,
    id: 'f1',
    name: 'Operador',
    numEmployees: '5',
    ghe: 'GHE-01',
    demandFound: 'Análise concluída',
    conclusion: 'adequada',
    realTask: 'Tarefa real observada',
    aep: undefined,
    ...overrides,
  };
}

// Valid AET function — EMPTY_FUNCTION has demandOrigin, objective, cyclePrescribed set
function makeAETFunction(overrides: Partial<AETFunction> = {}): AETFunction {
  return {
    ...EMPTY_FUNCTION,
    id: 'f1',
    name: 'Operador',
    numEmployees: '5',
    demandFound: 'Análise concluída',
    shifts: 'Turno Diurno',
    pauses: 'Pausa de 15 min',
    cycleReal: 'Operador realiza X a Y ciclos/hora',
    diagnosis: 'Análise ergonômica concluída sem risco imediato.',
    ...overrides,
  };
}

// ── AEP validation (structured path — fn.aep defined) ────────────────────────

describe('validateReport — AEP (structured)', () => {
  it('valid AEP project => isValid true, no errors', () => {
    const result = validateReport(makeProject({ functions: [makeAEPFunction()] }));
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('missing name => error on functions[0].name', () => {
    const result = validateReport(makeProject({ functions: [makeAEPFunction({ name: '' })] }));
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.path === 'functions[0].name')).toBe(true);
  });

  it('no functions => error on functions', () => {
    const result = validateReport(makeProject({ functions: [] }));
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.path === 'functions')).toBe(true);
  });

  it('missing companyName => error on companyName', () => {
    const result = validateReport(makeProject({ companyName: '', functions: [makeAEPFunction()] }));
    expect(result.errors.some(e => e.path === 'companyName')).toBe(true);
  });

  it('no biomechanics assessed => warning (not error)', () => {
    const result = validateReport(makeProject({ functions: [makeAEPFunction()] }));
    // EMPTY_FUNCTION.aep has no assessments filled, so warning expected
    expect(result.isValid).toBe(true);
    expect(result.warnings.some(w => w.path.includes('biomechanics'))).toBe(true);
  });
});

// ── AEP validation (legacy path — fn.aep undefined) ──────────────────────────

describe('validateReport — AEP (legacy)', () => {
  it('valid legacy AEP function => isValid true, no errors', () => {
    const result = validateReport(makeProject({ functions: [makeLegacyAEPFunction()] }));
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('missing GHE => error on functions[0].ghe', () => {
    const result = validateReport(makeProject({ functions: [makeLegacyAEPFunction({ ghe: '' })] }));
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.path === 'functions[0].ghe')).toBe(true);
  });

  it('missing conclusion => error on functions[0].conclusion', () => {
    const result = validateReport(makeProject({ functions: [makeLegacyAEPFunction({ conclusion: '' })] }));
    expect(result.errors.some(e => e.path === 'functions[0].conclusion')).toBe(true);
  });

  it('missing both prescribedTask and cyclePrescribed => error on functions[0].prescribedTask', () => {
    const fn = makeLegacyAEPFunction({ prescribedTask: '', cyclePrescribed: '' });
    const result = validateReport(makeProject({ functions: [fn] }));
    expect(result.errors.some(e => e.path === 'functions[0].prescribedTask')).toBe(true);
  });

  it('cyclePrescribed alone satisfies the prescribed-task requirement', () => {
    const fn = makeLegacyAEPFunction({ prescribedTask: '', cyclePrescribed: 'VIDE PGR' });
    const result = validateReport(makeProject({ functions: [fn] }));
    expect(result.errors.some(e => e.path === 'functions[0].prescribedTask')).toBe(false);
  });

  it('missing both realTask and cycleReal => error on functions[0].realTask', () => {
    const fn = makeLegacyAEPFunction({ realTask: '', cycleReal: '' });
    const result = validateReport(makeProject({ functions: [fn] }));
    expect(result.errors.some(e => e.path === 'functions[0].realTask')).toBe(true);
  });

  it('cycleReal alone satisfies the real-task requirement', () => {
    const fn = makeLegacyAEPFunction({ realTask: '', cycleReal: 'Operador executa ciclo de 3 min' });
    const result = validateReport(makeProject({ functions: [fn] }));
    expect(result.errors.some(e => e.path === 'functions[0].realTask')).toBe(false);
  });

  it('no risks => warning (not error)', () => {
    const fn = makeLegacyAEPFunction({ risks: [] });
    const result = validateReport(makeProject({ functions: [fn] }));
    expect(result.isValid).toBe(true);
    expect(result.warnings.some(w => w.path.includes('risks'))).toBe(true);
  });
});

// ── AET validation ───────────────────────────────────────────────────────────

describe('validateReport — AET', () => {
  it('valid AET project => isValid true, no errors', () => {
    const result = validateReport(makeProject({ reportType: 'AET', functions: [makeAETFunction()] }));
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('missing demandOrigin => error on functions[0].demandOrigin', () => {
    const fn = makeAETFunction({ demandOrigin: '' });
    const result = validateReport(makeProject({ reportType: 'AET', functions: [fn] }));
    expect(result.errors.some(e => e.path === 'functions[0].demandOrigin')).toBe(true);
  });

  it('missing objective => error on functions[0].objective', () => {
    const fn = makeAETFunction({ objective: '' });
    const result = validateReport(makeProject({ reportType: 'AET', functions: [fn] }));
    expect(result.errors.some(e => e.path === 'functions[0].objective')).toBe(true);
  });

  it('missing shifts => error on functions[0].shifts', () => {
    const fn = makeAETFunction({ shifts: '' });
    const result = validateReport(makeProject({ reportType: 'AET', functions: [fn] }));
    expect(result.errors.some(e => e.path === 'functions[0].shifts')).toBe(true);
  });

  it('missing pauses => error on functions[0].pauses', () => {
    const fn = makeAETFunction({ pauses: '' });
    const result = validateReport(makeProject({ reportType: 'AET', functions: [fn] }));
    expect(result.errors.some(e => e.path === 'functions[0].pauses')).toBe(true);
  });

  it('missing cycleReal => error on functions[0].cycleReal', () => {
    const fn = makeAETFunction({ cycleReal: '' });
    const result = validateReport(makeProject({ reportType: 'AET', functions: [fn] }));
    expect(result.errors.some(e => e.path === 'functions[0].cycleReal')).toBe(true);
  });

  it('missing diagnosis => error on functions[0].diagnosis', () => {
    const fn = makeAETFunction({ diagnosis: '' });
    const result = validateReport(makeProject({ reportType: 'AET', functions: [fn] }));
    expect(result.errors.some(e => e.path === 'functions[0].diagnosis')).toBe(true);
  });

  it('missing multiple fields => all corresponding errors present', () => {
    const fn = makeAETFunction({ shifts: '', pauses: '', cycleReal: '', diagnosis: '' });
    const result = validateReport(makeProject({ reportType: 'AET', functions: [fn] }));
    const paths = result.errors.map(e => e.path);
    expect(paths).toContain('functions[0].shifts');
    expect(paths).toContain('functions[0].pauses');
    expect(paths).toContain('functions[0].cycleReal');
    expect(paths).toContain('functions[0].diagnosis');
  });

  it('no scientific methods => warning (not error)', () => {
    const fn = makeAETFunction({ scientificMethods: [] });
    const result = validateReport(makeProject({ reportType: 'AET', functions: [fn] }));
    expect(result.isValid).toBe(true);
    expect(result.warnings.some(w => w.path.includes('scientificMethods'))).toBe(true);
  });

  it('no risks and no improvements => warning on risks (not error)', () => {
    const fn = makeAETFunction({ risks: [], improvements: [] });
    const result = validateReport(makeProject({ reportType: 'AET', functions: [fn] }));
    expect(result.warnings.some(w => w.path.includes('risks'))).toBe(true);
    expect(result.errors.some(e => e.path.includes('risks'))).toBe(false);
  });
});
