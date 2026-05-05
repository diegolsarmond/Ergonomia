import { describe, it, expect } from 'vitest';
import { createMockAEPProject, createMockAETProject } from './mockData';
import { validateReport } from '../domain/reports/reportValidation';
import { calculateNHO11Simple, isNHO11ValidationError } from '../domain/nho11/nho11Calculator';
import { calculateRiskScore, isValidationError } from '../domain/risks/riskMatrix';

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
