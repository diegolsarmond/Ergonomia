import type {
  NHO11CalculationInput,
  NHO11CalculationResult,
  NHO11Result,
  NHO11ValidationError,
} from './nho11Types';

// ── Type guard ───────────────────────────────────────────────────────────────

export function isNHO11ValidationError(result: NHO11Result): result is NHO11ValidationError {
  return (result as NHO11ValidationError).kind === 'nho11_validation_error';
}

// ── Validation helpers ───────────────────────────────────────────────────────

function err(field: NHO11ValidationError['field'], message: string): NHO11ValidationError {
  return { kind: 'nho11_validation_error', field, message };
}

// ── Main calculation ─────────────────────────────────────────────────────────

/**
 * Cálculo simplificado conforme NHO 11 (Fundacentro).
 * Fórmula: E_med = Σ(Ei) / n
 * Adequação: E_med >= referenceLux × 0,9 (tolerância de 10 %)
 */
export function calculateNHO11Simple(input: NHO11CalculationInput): NHO11Result {
  if (input.referenceLux <= 0) {
    return err('referenceLux', 'Valor de referência deve ser maior que zero.');
  }

  const { points, referenceLux } = input;

  if (points.length === 0) {
    return err('points', 'É necessário ao menos um ponto de medição.');
  }

  for (const p of points) {
    if (!Number.isFinite(p.lux) || p.lux < 0) {
      return err(
        'lux',
        `Ponto "${p.label || p.id}": valor de iluminância inválido (${p.lux}).`,
      );
    }
  }

  const luxValues = points.map(p => p.lux);

  const sum = luxValues.reduce((acc, l) => acc + l, 0);
  const averageLux = round2(sum / luxValues.length);

  const tolerance10Percent  = round2(referenceLux * 0.9);
  const seventyPercentAverage = round2(averageLux * 0.7);

  const minMeasuredLux = Math.min(...luxValues);
  const maxMeasuredLux = Math.max(...luxValues);
  const ratioMaxMin    = minMeasuredLux > 0
    ? round2(maxMeasuredLux / minMeasuredLux)
    : 0;

  const isAdequateByAverage = averageLux >= tolerance10Percent;
  const conclusion: NHO11CalculationResult['conclusion'] = isAdequateByAverage
    ? 'adequada'
    : 'inadequada';

  const interpretationText = isAdequateByAverage
    ? `A iluminância média medida (${averageLux} lux) é igual ou superior ao limite mínimo de ` +
      `${tolerance10Percent} lux (90 % do valor de referência de ${referenceLux} lux). ` +
      `A iluminação do ambiente está adequada segundo os critérios da NHO 11 – Fundacentro.`
    : `A iluminância média medida (${averageLux} lux) está abaixo do limite mínimo de ` +
      `${tolerance10Percent} lux (90 % do valor de referência de ${referenceLux} lux). ` +
      `A iluminação do ambiente está inadequada e requer intervenção segundo os critérios da NHO 11 – Fundacentro.`;

  return {
    averageLux,
    tolerance10Percent,
    seventyPercentAverage,
    minMeasuredLux,
    maxMeasuredLux,
    ratioMaxMin,
    isAdequateByAverage,
    conclusion,
    interpretationText,
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
