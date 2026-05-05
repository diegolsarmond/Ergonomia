// ── Measurement point ────────────────────────────────────────────────────────

export interface NHO11MeasurementPoint {
  id: string;
  label: string;
  lux: number;
}

// ── Calculation input ────────────────────────────────────────────────────────

export interface NHO11CalculationInput {
  location: string;
  date: string;
  environmentType: string;
  taskType: string;
  referenceLux: number;
  points: NHO11MeasurementPoint[];
}

// ── Calculation result ───────────────────────────────────────────────────────

export interface NHO11CalculationResult {
  /** E_med = Σ(Ei) / n */
  averageLux: number;
  /** 90 % do valor de referência — limiar mínimo de adequação */
  tolerance10Percent: number;
  /** 70 % da média medida — indicador de uniformidade */
  seventyPercentAverage: number;
  minMeasuredLux: number;
  maxMeasuredLux: number;
  /** Razão max/min — mede a uniformidade da iluminância no plano */
  ratioMaxMin: number;
  isAdequateByAverage: boolean;
  conclusion: 'adequada' | 'inadequada';
  interpretationText: string;
}

// ── Validation error (Railway-oriented) ─────────────────────────────────────

export type NHO11ValidationField = 'points' | 'referenceLux' | 'lux';

export interface NHO11ValidationError {
  kind: 'nho11_validation_error';
  field: NHO11ValidationField;
  message: string;
}

export type NHO11Result = NHO11CalculationResult | NHO11ValidationError;
