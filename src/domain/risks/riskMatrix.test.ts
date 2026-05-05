import { describe, it, expect } from 'vitest';
import { calculateRiskScore, isValidationError } from './riskMatrix';

describe('calculateRiskScore', () => {
  describe('score and level classification', () => {
    it('(4, 3) => score 12 / ALTO RISCO', () => {
      const result = calculateRiskScore(4, 3);
      expect(isValidationError(result)).toBe(false);
      if (!isValidationError(result)) {
        expect(result.score).toBe(12);
        expect(result.level).toBe('ALTO RISCO');
        expect(result.color).toBe('orange');
      }
    });

    it('(5, 1) => score 5 / MODERADO', () => {
      const result = calculateRiskScore(5, 1);
      expect(isValidationError(result)).toBe(false);
      if (!isValidationError(result)) {
        expect(result.score).toBe(5);
        expect(result.level).toBe('MODERADO');
        expect(result.color).toBe('yellow');
      }
    });

    it('(3, 1) => score 3 / BAIXO', () => {
      const result = calculateRiskScore(3, 1);
      expect(isValidationError(result)).toBe(false);
      if (!isValidationError(result)) {
        expect(result.score).toBe(3);
        expect(result.level).toBe('BAIXO');
        expect(result.color).toBe('green');
      }
    });

    it('(5, 5) => score 25 / CRÍTICO', () => {
      const result = calculateRiskScore(5, 5);
      expect(isValidationError(result)).toBe(false);
      if (!isValidationError(result)) {
        expect(result.score).toBe(25);
        expect(result.level).toBe('CRÍTICO');
        expect(result.color).toBe('red');
      }
    });

    it('boundary score 4 => BAIXO', () => {
      const result = calculateRiskScore(2, 2);
      if (!isValidationError(result)) {
        expect(result.score).toBe(4);
        expect(result.level).toBe('BAIXO');
      }
    });

    it('boundary score 8 => MODERADO', () => {
      const result = calculateRiskScore(4, 2);
      if (!isValidationError(result)) {
        expect(result.score).toBe(8);
        expect(result.level).toBe('MODERADO');
      }
    });

    it('boundary score 15 => ALTO RISCO', () => {
      const result = calculateRiskScore(5, 3);
      if (!isValidationError(result)) {
        expect(result.score).toBe(15);
        expect(result.level).toBe('ALTO RISCO');
      }
    });

    it('preserves input probability and severity in result', () => {
      const result = calculateRiskScore(4, 3);
      if (!isValidationError(result)) {
        expect(result.probability).toBe(4);
        expect(result.severity).toBe(3);
      }
    });
  });

  describe('validation errors', () => {
    it('probability 0 => validation_error on "probability"', () => {
      const result = calculateRiskScore(0, 3);
      expect(isValidationError(result)).toBe(true);
      if (isValidationError(result)) {
        expect(result.kind).toBe('validation_error');
        expect(result.field).toBe('probability');
      }
    });

    it('severity 6 => validation_error on "severity"', () => {
      const result = calculateRiskScore(3, 6);
      expect(isValidationError(result)).toBe(true);
      if (isValidationError(result)) {
        expect(result.field).toBe('severity');
      }
    });

    it('non-integer probability => validation_error', () => {
      const result = calculateRiskScore(1.5, 3);
      expect(isValidationError(result)).toBe(true);
    });

    it('negative probability => validation_error', () => {
      const result = calculateRiskScore(-1, 3);
      expect(isValidationError(result)).toBe(true);
    });

    it('probability validated before severity (first error wins)', () => {
      const result = calculateRiskScore(0, 0);
      if (isValidationError(result)) {
        expect(result.field).toBe('probability');
      }
    });
  });
});
