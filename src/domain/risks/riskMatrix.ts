import type {
  RiskDimension,
  RiskLevel,
  RiskColor,
  RiskResult,
  RiskValidationError,
} from './riskTypes';

const VALID_DIMENSIONS: ReadonlySet<number> = new Set([1, 2, 3, 4, 5]);

function isDimension(n: number): n is RiskDimension {
  return VALID_DIMENSIONS.has(n);
}

function validate(
  value: number,
  field: 'probability' | 'severity',
): RiskValidationError | null {
  if (!Number.isInteger(value) || !isDimension(value)) {
    return {
      kind: 'validation_error',
      message: `"${field}" must be an integer between 1 and 5, got ${value}`,
      field,
      received: value,
    };
  }
  return null;
}

function classifyScore(score: number): { level: RiskLevel; color: RiskColor } {
  if (score <= 4)  return { level: 'BAIXO',      color: 'green'  };
  if (score <= 8)  return { level: 'MODERADO',   color: 'yellow' };
  if (score <= 15) return { level: 'ALTO RISCO', color: 'orange' };
  return             { level: 'CRÍTICO',    color: 'red'    };
}

export function calculateRiskScore(
  probability: number,
  severity: number,
): RiskResult | RiskValidationError {
  const probError = validate(probability, 'probability');
  if (probError) return probError;

  const sevError = validate(severity, 'severity');
  if (sevError) return sevError;

  const p = probability as RiskDimension;
  const s = severity   as RiskDimension;
  const score = p * s;
  const { level, color } = classifyScore(score);

  return { probability: p, severity: s, score, level, color };
}

export function isValidationError(
  result: RiskResult | RiskValidationError,
): result is RiskValidationError {
  return (result as RiskValidationError).kind === 'validation_error';
}
