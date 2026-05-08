import type {
  NHO11CalculationInput,
  NHO11CalculationResult,
  NHO11ModelType,
  NHO11Result,
  NHO11ValidationError,
} from './nho11Types';

// ── Type guard ───────────────────────────────────────────────────────────────

export function isNHO11ValidationError(result: NHO11Result): result is NHO11ValidationError {
  return (result as NHO11ValidationError).kind === 'nho11_validation_error';
}

// ── Validation helper ────────────────────────────────────────────────────────

function err(field: NHO11ValidationError['field'], message: string): NHO11ValidationError {
  return { kind: 'nho11_validation_error', field, message };
}

// ── Not-applicable result ────────────────────────────────────────────────────

function notApplicableResult(): NHO11CalculationResult {
  return {
    averageLux: 0,
    tolerance10Percent: 0,
    seventyPercentAverage: 0,
    minMeasuredLux: 0,
    maxMeasuredLux: 0,
    ratioMaxMin: 0,
    isAdequateByAverage: false,
    conclusion: 'não_aplicável',
    interpretationText:
      'A metodologia de medição NHO 11 – Fundacentro não é aplicável para ambientes externos. ' +
      'A iluminância neste tipo de ambiente é variável e dependente de condições climáticas e ' +
      'sazonais, não sendo possível estabelecer um valor de referência fixo para avaliação de adequação.',
  };
}

// ── Core formulas ────────────────────────────────────────────────────────────
// Each formula receives validated lux values and referenceLux and returns the
// numeric metrics. Add new implementations here as model types are supported.

type ComputedMetrics = Omit<NHO11CalculationResult, 'conclusion' | 'interpretationText'>;

function computeSimpleAverage(luxValues: number[], referenceLux: number): ComputedMetrics {
  const sum = luxValues.reduce((acc, l) => acc + l, 0);
  const averageLux           = round2(sum / luxValues.length);
  const tolerance10Percent   = round2(referenceLux * 0.9);
  const seventyPercentAverage = round2(averageLux * 0.7);
  const minMeasuredLux       = Math.min(...luxValues);
  const maxMeasuredLux       = Math.max(...luxValues);
  const ratioMaxMin          = minMeasuredLux > 0 ? round2(maxMeasuredLux / minMeasuredLux) : 0;
  const isAdequateByAverage  = averageLux >= tolerance10Percent;
  return { averageLux, tolerance10Percent, seventyPercentAverage, minMeasuredLux, maxMeasuredLux, ratioMaxMin, isAdequateByAverage };
}

// ── Formula dispatch ─────────────────────────────────────────────────────────
// Maps model types to their formula. Types not yet implemented fall back to
// SIMPLE_AVERAGE until a dedicated formula is added.

type FormulaFn = (luxValues: number[], referenceLux: number) => ComputedMetrics;

const FORMULA_DISPATCH: Partial<Record<NHO11ModelType, FormulaFn>> = {
  SIMPLE_AVERAGE: computeSimpleAverage,
  // Future:
  // RECTANGULAR_REGULAR_GRID: computeRectangularRegularGrid,
  // RECTANGULAR_SINGLE_LINE:  computeRectangularSingleLine,
  // CENTRAL_LUMINAIRE:        computeCentralLuminaire,
};

function resolveFormula(modelType: NHO11ModelType): FormulaFn {
  return FORMULA_DISPATCH[modelType] ?? computeSimpleAverage;
}

// ── Main calculation ─────────────────────────────────────────────────────────

/**
 * Cálculo conforme NHO 11 (Fundacentro).
 * O modelo é selecionado via `input.modelType` (padrão: SIMPLE_AVERAGE).
 * OUTDOOR_NOT_APPLICABLE retorna conclusão "não_aplicável" sem exigir pontos.
 */
export function calculateNHO11Simple(input: NHO11CalculationInput): NHO11Result {
  const modelType = input.modelType ?? 'SIMPLE_AVERAGE';

  if (modelType === 'OUTDOOR_NOT_APPLICABLE') {
    return notApplicableResult();
  }

  if (input.referenceLux <= 0) {
    return err('referenceLux', 'Valor de referência deve ser maior que zero.');
  }

  const { points, referenceLux } = input;

  if (points.length === 0) {
    return err('points', 'É necessário ao menos um ponto de medição.');
  }

  for (const p of points) {
    if (!Number.isFinite(p.lux) || p.lux < 0) {
      return err('lux', `Ponto "${p.label || p.id}": valor de iluminância inválido (${p.lux}).`);
    }
  }

  const luxValues = points.map(p => p.lux);
  const computed  = resolveFormula(modelType)(luxValues, referenceLux);
  const { averageLux, tolerance10Percent, isAdequateByAverage } = computed;

  const conclusion: NHO11CalculationResult['conclusion'] = isAdequateByAverage ? 'adequada' : 'inadequada';

  const interpretationText = isAdequateByAverage
    ? `A iluminância média medida (${averageLux} lux) é igual ou superior ao limite mínimo de ` +
      `${tolerance10Percent} lux (90 % do valor de referência de ${referenceLux} lux). ` +
      `A iluminação do ambiente está adequada segundo os critérios da NHO 11 – Fundacentro.`
    : `A iluminância média medida (${averageLux} lux) está abaixo do limite mínimo de ` +
      `${tolerance10Percent} lux (90 % do valor de referência de ${referenceLux} lux). ` +
      `A iluminação do ambiente está inadequada e requer intervenção segundo os critérios da NHO 11 – Fundacentro.`;

  return { ...computed, conclusion, interpretationText };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
