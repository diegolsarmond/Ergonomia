import { v4 as uuidv4 } from 'uuid';
import type { ErgonomicRisk } from '../../types';
import { calculateRiskScore, isValidationError } from './riskMatrix';

type PartialRiskInput = Partial<Omit<ErgonomicRisk, 'id' | 'score' | 'riskLevel'>>;

export function createEmptyErgonomicRisk(overrides: PartialRiskInput = {}): ErgonomicRisk {
  const probability = overrides.probability ?? 1;
  const severity    = overrides.severity    ?? 1;

  const result = calculateRiskScore(probability, severity);

  if (isValidationError(result)) {
    throw new Error(
      `createEmptyErgonomicRisk: ${result.message}`,
    );
  }

  return {
    id:                   uuidv4(),
    agent:                '',
    riskFactor:           '',
    possibleHealthEffect: '',
    foundSituation:       '',
    existingControl:      '',
    improvementProposal:  '',
    normativeReference:   '',
    evidenceImageDataUrl: undefined,
    responsible:          undefined,
    deadline:             undefined,
    status:               undefined,
    ...overrides,
    probability:          result.probability,
    severity:             result.severity,
    score:                result.score,
    riskLevel:            result.level,
  };
}
