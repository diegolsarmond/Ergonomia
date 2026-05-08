import { describe, it, expect } from 'vitest';
import { calculateNHO11Simple, isNHO11ValidationError } from './nho11Calculator';
import type { NHO11MeasurementPoint } from './nho11Types';

function pts(luxValues: number[]): NHO11MeasurementPoint[] {
  return luxValues.map((lux, i) => ({ id: String(i), label: `P${i + 1}`, lux }));
}

const BASE = { location: '', date: '', environmentType: '', taskType: '' };

describe('calculateNHO11Simple', () => {
  describe('SIMPLE_AVERAGE — required case from spec', () => {
    it('[107,103,102,80] ref=500 => average 98 / inadequada', () => {
      const result = calculateNHO11Simple({ ...BASE, referenceLux: 500, points: pts([107, 103, 102, 80]) });
      expect(isNHO11ValidationError(result)).toBe(false);
      if (!isNHO11ValidationError(result)) {
        expect(result.averageLux).toBe(98);
        expect(result.conclusion).toBe('inadequada');
        expect(result.isAdequateByAverage).toBe(false);
        expect(result.tolerance10Percent).toBe(450);
      }
    });
  });

  describe('adequacy boundary', () => {
    it('average exactly at 90% threshold => adequada', () => {
      // ref=500, threshold=450; three points summing to 1350 → avg=450
      const result = calculateNHO11Simple({ ...BASE, referenceLux: 500, points: pts([450, 450, 450]) });
      if (!isNHO11ValidationError(result)) {
        expect(result.averageLux).toBe(450);
        expect(result.conclusion).toBe('adequada');
        expect(result.isAdequateByAverage).toBe(true);
      }
    });

    it('average one lux below threshold => inadequada', () => {
      const result = calculateNHO11Simple({ ...BASE, referenceLux: 500, points: pts([449, 449, 449]) });
      if (!isNHO11ValidationError(result)) {
        expect(result.conclusion).toBe('inadequada');
      }
    });

    it('[500,510,490] ref=500 => adequada', () => {
      const result = calculateNHO11Simple({ ...BASE, referenceLux: 500, points: pts([500, 510, 490]) });
      if (!isNHO11ValidationError(result)) {
        expect(result.averageLux).toBe(500);
        expect(result.conclusion).toBe('adequada');
      }
    });
  });

  describe('derived metrics', () => {
    it('computes min, max, ratio, 70% average correctly', () => {
      // [200, 400] → avg=300, min=200, max=400, ratio=2.00, 70%=210
      const result = calculateNHO11Simple({ ...BASE, referenceLux: 200, points: pts([200, 400]) });
      if (!isNHO11ValidationError(result)) {
        expect(result.minMeasuredLux).toBe(200);
        expect(result.maxMeasuredLux).toBe(400);
        expect(result.ratioMaxMin).toBe(2);
        expect(result.seventyPercentAverage).toBe(210);
      }
    });

    it('ratioMaxMin is 0 when all points are 0 lux', () => {
      const result = calculateNHO11Simple({ ...BASE, referenceLux: 500, points: pts([0, 0, 0]) });
      if (!isNHO11ValidationError(result)) {
        expect(result.ratioMaxMin).toBe(0);
      }
    });
  });

  describe('OUTDOOR_NOT_APPLICABLE model type', () => {
    it('returns não_aplicável without needing points or referenceLux', () => {
      const result = calculateNHO11Simple({ ...BASE, referenceLux: 0, points: [], modelType: 'OUTDOOR_NOT_APPLICABLE' });
      expect(isNHO11ValidationError(result)).toBe(false);
      if (!isNHO11ValidationError(result)) {
        expect(result.conclusion).toBe('não_aplicável');
        expect(result.isAdequateByAverage).toBe(false);
        expect(result.interpretationText.length).toBeGreaterThan(0);
      }
    });
  });

  describe('unimplemented model types fall back to SIMPLE_AVERAGE formula', () => {
    it('RECTANGULAR_REGULAR_GRID uses same formula until overridden', () => {
      const simple = calculateNHO11Simple({ ...BASE, referenceLux: 300, points: pts([300, 300]), modelType: 'SIMPLE_AVERAGE' });
      const grid   = calculateNHO11Simple({ ...BASE, referenceLux: 300, points: pts([300, 300]), modelType: 'RECTANGULAR_REGULAR_GRID' });
      if (!isNHO11ValidationError(simple) && !isNHO11ValidationError(grid)) {
        expect(grid.averageLux).toBe(simple.averageLux);
        expect(grid.conclusion).toBe(simple.conclusion);
      }
    });
  });

  describe('validation errors', () => {
    it('referenceLux <= 0 => validation_error on referenceLux', () => {
      const result = calculateNHO11Simple({ ...BASE, referenceLux: 0, points: pts([300]) });
      expect(isNHO11ValidationError(result)).toBe(true);
      if (isNHO11ValidationError(result)) {
        expect(result.field).toBe('referenceLux');
      }
    });

    it('empty points array => validation_error on points', () => {
      const result = calculateNHO11Simple({ ...BASE, referenceLux: 300, points: [] });
      expect(isNHO11ValidationError(result)).toBe(true);
      if (isNHO11ValidationError(result)) {
        expect(result.field).toBe('points');
      }
    });

    it('negative lux value => validation_error on lux', () => {
      const result = calculateNHO11Simple({ ...BASE, referenceLux: 300, points: pts([-1, 300]) });
      expect(isNHO11ValidationError(result)).toBe(true);
      if (isNHO11ValidationError(result)) {
        expect(result.field).toBe('lux');
      }
    });

    it('NaN lux value => validation_error on lux', () => {
      const result = calculateNHO11Simple({ ...BASE, referenceLux: 300, points: [{ id: '0', label: 'P1', lux: NaN }] });
      expect(isNHO11ValidationError(result)).toBe(true);
    });
  });
});
