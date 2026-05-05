export type RiskScore = number;

export type RiskLevel = 'BAIXO' | 'MODERADO' | 'ALTO RISCO' | 'CRÍTICO';

export type RiskColor = 'green' | 'yellow' | 'orange' | 'red';

/** Integer 1–5 */
export type RiskDimension = 1 | 2 | 3 | 4 | 5;

export interface RiskResult {
  probability: RiskDimension;
  severity: RiskDimension;
  score: RiskScore;
  level: RiskLevel;
  color: RiskColor;
}

export interface RiskValidationError {
  kind: 'validation_error';
  message: string;
  field: 'probability' | 'severity';
  received: number;
}
