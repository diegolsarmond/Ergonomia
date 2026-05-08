// ── Model type ────────────────────────────────────────────────────────────────

/**
 * Tipos de modelo de medição conforme NHO 11 – Fundacentro.
 * Cada tipo define como os pontos são distribuídos e como E_med é calculado.
 * SIMPLE_AVERAGE é o comportamento padrão (Σ(Ei)/n).
 */
export type NHO11ModelType =
  | 'SIMPLE_AVERAGE'
  | 'RECTANGULAR_REGULAR_GRID'
  | 'RECTANGULAR_SINGLE_LINE'
  | 'CENTRAL_LUMINAIRE'
  | 'OUTDOOR_NOT_APPLICABLE';

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
  /** Defaults to SIMPLE_AVERAGE when omitted */
  modelType?: NHO11ModelType;
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
  conclusion: 'adequada' | 'inadequada' | 'não_aplicável';
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
