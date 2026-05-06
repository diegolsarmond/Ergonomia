import { describe, it, expect } from 'vitest';
import { calculateIlluminanceMetrics, evaluateIlluminanceResult, calculateAndEvaluate, rowAverage, extractValidValues } from './illuminanceCalculator';
import { generateMeasurementRows, createEmptyIlluminanceMeasurement } from './illuminanceTypes';
import type { MeasurementRow, IlluminanceNormativeParameter, GridParameters } from './illuminanceTypes';

function mkRow(type: 'r'|'q'|'p'|'t', idx: number, values: (number|null)[], active?: number): MeasurementRow {
  return { id: `test-${type}-${idx}`, rowType: type, index: idx, values: [...values, ...new Array(8 - values.length).fill(null)], activeCols: active ?? values.length };
}
function mkNorm(overrides: Partial<IlluminanceNormativeParameter> = {}): IlluminanceNormativeParameter {
  return { id: 'n1', activityDescription: 'Test', minimumLux: 500, minimumIRC: 80, tolerancePercent: 10, maxUniformityRatio: 5, normativeNotes: '', normativeReference: '', pageReference: '', active: true, ...overrides };
}

describe('rowAverage', () => {
  it('averages valid values within activeCols', () => {
    const r = mkRow('r', 0, [100, 200, 300], 3);
    expect(rowAverage(r)).toBe(200);
  });
  it('returns null for empty row', () => {
    const r = mkRow('r', 0, [null, null], 2);
    expect(rowAverage(r)).toBeNull();
  });
});

describe('extractValidValues', () => {
  it('extracts only active cols', () => {
    const r = mkRow('r', 0, [10, 20, 30], 2); // only first 2 active
    expect(extractValidValues([r])).toEqual([10, 20]);
  });
});

describe('calculateIlluminanceMetrics', () => {
  it('returns null for empty data', () => {
    expect(calculateIlluminanceMetrics([], 500)).toBeNull();
  });
  it('calculates average, min, max correctly', () => {
    const rows = [mkRow('r', 0, [640, 729, 786, 712, 835, 832, 900, 955], 8)];
    const r = calculateIlluminanceMetrics(rows, 500)!;
    expect(r.averageLux).toBe(798.63);
    expect(r.minLux).toBe(640);
    expect(r.maxLux).toBe(955);
    expect(r.measuredPointsCount).toBe(8);
  });
  it('calculates tolerance (10%)', () => {
    const rows = [mkRow('r', 0, [500], 1)];
    const r = calculateIlluminanceMetrics(rows, 500, 10)!;
    expect(r.toleranceMinLux).toBe(450);
  });
  it('calculates 70% of average', () => {
    const rows = [mkRow('r', 0, [1000], 1)];
    const r = calculateIlluminanceMetrics(rows, 500)!;
    expect(r.seventyPercentAverage).toBe(700);
  });
  it('calculates uniformity ratio', () => {
    const rows = [mkRow('r', 0, [100, 500], 2)];
    const r = calculateIlluminanceMetrics(rows, 500)!;
    expect(r.uniformityRatio).toBe(5);
  });
  it('calculates task area value from t-rows', () => {
    const rows = [mkRow('r', 0, [500], 1), mkRow('t', 0, [741, 913], 2)];
    const r = calculateIlluminanceMetrics(rows, 500)!;
    expect(r.taskAreaValue).toBe(827);
  });
});

describe('evaluateIlluminanceResult', () => {
  it('Adequado when all criteria met', () => {
    const rows = [mkRow('r', 0, [500, 510, 490], 3)];
    const c = calculateIlluminanceMetrics(rows, 500, 10)!;
    const e = evaluateIlluminanceResult(c, mkNorm(), 500);
    expect(e.status).toBe('Adequado');
    expect(e.issues).toHaveLength(0);
  });
  it('Inadequado when average below minimum', () => {
    const rows = [mkRow('r', 0, [100, 100, 100], 3)];
    const c = calculateIlluminanceMetrics(rows, 500, 10)!;
    const e = evaluateIlluminanceResult(c, mkNorm(), 500);
    expect(e.status).toBe('Inadequado');
    expect(e.averageIsAdequate).toBe(false);
  });
  it('Inadequado when uniformity exceeds limit', () => {
    const rows = [mkRow('r', 0, [100, 600], 2)];
    const c = calculateIlluminanceMetrics(rows, 300, 10)!;
    const e = evaluateIlluminanceResult(c, mkNorm({ minimumLux: 300 }), 300);
    expect(e.uniformityCheck).toBe(false);
  });
  it('checks task area >= 200 lux', () => {
    const rows = [mkRow('r', 0, [500], 1), mkRow('t', 0, [150], 1)];
    const c = calculateIlluminanceMetrics(rows, 500, 10)!;
    const e = evaluateIlluminanceResult(c, mkNorm(), 500);
    expect(e.taskAreaCheck).toBe(false);
  });
  it('spreadsheet scenario: A1 adequate', () => {
    const rows = [
      mkRow('r', 0, [640, 729, 786, 712, 835, 832, 900, 955], 8),
      mkRow('q', 0, [834, 709, 771, 800], 4),
      mkRow('p', 0, [933, 706], 2),
      mkRow('t', 0, [741, 913, 1105, 1045], 4),
    ];
    const c = calculateIlluminanceMetrics(rows, 500, 10)!;
    const e = evaluateIlluminanceResult(c, mkNorm(), 500);
    expect(e.status).toBe('Adequado');
    expect(c.averageLux).toBeGreaterThan(500);
  });
});

describe('calculateAndEvaluate', () => {
  it('returns nulls for no data', () => {
    const { calculation, evaluation } = calculateAndEvaluate([], 500, null);
    expect(calculation).toBeNull();
    expect(evaluation).toBeNull();
  });
  it('returns both for valid data', () => {
    const rows = [mkRow('r', 0, [500, 510], 2)];
    const { calculation, evaluation } = calculateAndEvaluate(rows, 500, mkNorm());
    expect(calculation).not.toBeNull();
    expect(evaluation!.status).toBe('Adequado');
  });
});

describe('generateMeasurementRows', () => {
  it('generates A1 rows with correct types', () => {
    const params: GridParameters = { geometryType: 'A1', N: 4, M: 2, W: 10, L: 8, maxCols: 8 };
    const rows = generateMeasurementRows(params);
    expect(rows.filter(r => r.rowType === 'r').length).toBe(2);
    expect(rows.filter(r => r.rowType === 'q').length).toBeGreaterThanOrEqual(1);
    expect(rows.filter(r => r.rowType === 'p').length).toBe(2);
    expect(rows.filter(r => r.rowType === 't').length).toBe(1);
  });
  it('generates A2 rows', () => {
    const params: GridParameters = { geometryType: 'A2', N: 3, M: 1, W: 5, L: 4, maxCols: 8 };
    const rows = generateMeasurementRows(params);
    expect(rows.filter(r => r.rowType === 'r').length).toBe(1);
  });
});

describe('createEmptyIlluminanceMeasurement', () => {
  it('creates with default grid', () => {
    const m = createEmptyIlluminanceMeasurement('test-1');
    expect(m.id).toBe('test-1');
    expect(m.measurementRows.length).toBeGreaterThan(0);
    expect(m.verificationItems.length).toBe(13);
    expect(m.inconsistencyItems.length).toBe(9);
  });
});
