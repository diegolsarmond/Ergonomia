/**
 * Cálculos de iluminância — baseado na planilha "Ferramenta de Iluminância - MODELO.xlsx"
 */
import type {
  MeasurementRow, IlluminanceCalculationResult, IlluminanceEvaluationResult,
  IlluminanceNormativeParameter, IlluminanceStatus, GridParameters, GridPoint,
} from './illuminanceTypes';

function round2(n: number): number { return Math.round(n * 100) / 100; }

/** Extrai todos os valores numéricos válidos de um conjunto de linhas de medição */
export function extractValidValues(rows: MeasurementRow[]): number[] {
  const vals: number[] = [];
  for (const row of rows) {
    for (let c = 0; c < row.activeCols; c++) {
      if (row.naFlags?.[c]) continue;
      const v = row.values[c];
      if (v !== null && v !== undefined && !isNaN(v)) vals.push(v);
    }
  }
  return vals;
}

/** Calcula a média de uma linha de medição */
export function rowAverage(row: MeasurementRow): number | null {
  const vals: number[] = [];
  for (let c = 0; c < row.activeCols; c++) {
    if (row.naFlags?.[c]) continue;
    const v = row.values[c];
    if (v !== null && v !== undefined && !isNaN(v)) vals.push(v);
  }
  return vals.length > 0 ? round2(vals.reduce((a, b) => a + b, 0) / vals.length) : null;
}

/**
 * Iluminância Média (IM) calculada pela fórmula de cada geometria.
 *
 * Mapeamento Excel → variáveis:
 *   J17 = R (média linha r)   K17 = N (luminárias/fila)
 *   J19 = Q (média linha q)   K19 = M (número de filas)
 *   J21 = P (média linha p)   K21 = W (usado em A6)
 *   J23 = T (média linha t)   K23 = L (usado em A6)
 */
export function calculateIMByGeometry(
  geometry: string,
  R: number, Q: number, P: number, T: number,
  N: number, M: number,
  W = 0, L = 0,
): number | null {
  switch (geometry) {
    case 'A1':
      // =((R*(N-1)*(M-1) + Q*(N-1) + T*(M-1) + P) / (N*M))
      if (N === 0 || M === 0) return null;
      return round2((R * (N - 1) * (M - 1) + Q * (N - 1) + T * (M - 1) + P) / (N * M));

    case 'A2':
      // =P
      return round2(P);

    case 'A3':
      // =(Q*(N-1) + P) / N
      if (N === 0) return null;
      return round2((Q * (N - 1) + P) / N);

    case 'A4':
      // =(R*N*(M-1) + Q*N + T*(M-1) + P) / (M*(N+1))
      if (M === 0) return null;
      return round2((R * N * (M - 1) + Q * N + T * (M - 1) + P) / (M * (N + 1)));

    case 'A5':
      // =(Q*N + P) / (N+1)
      return round2((Q * N + P) / (N + 1));

    case 'A6':
      // =((R*(L-8)-(L-8)) + (8*Q*(L-8)) + (8*T*(W-8)) + 64*P) / (W*L)
      // K21=W, K23=L — dimensões da malha do teto luminoso (> 8)
      if (W === 0 || L === 0) return null;
      return round2(
        ((R * (L - 8) - (L - 8)) + (8 * Q * (L - 8)) + (8 * T * (W - 8)) + 64 * P) / (W * L)
      );

    default:
      return null;
  }
}

/** Calcula métricas a partir da malha de medição */
export function calculateIlluminanceMetrics(
  rows: MeasurementRow[],
  recommendedMinLux: number,
  tolerancePercent: number = 10,
  gridParams?: GridParameters,
): IlluminanceCalculationResult | null {
  const allValues = extractValidValues(rows);
  if (allValues.length === 0) return null;

  const sum = allValues.reduce((a, b) => a + b, 0);
  const minLux = Math.min(...allValues);
  const maxLux = Math.max(...allValues);
  const toleranceMinLux = round2(recommendedMinLux * (1 - tolerancePercent / 100));
  const uniformityRatio = minLux > 0 ? round2(maxLux / minLux) : 0;

  // Médias por tipo de linha (R, Q, P, T)
  const rowAverages = rows.map(r => ({
    type: r.rowType,
    index: r.index,
    avg: rowAverage(r) ?? 0,
  })).filter(ra => ra.avg > 0);

  const getAvg = (type: string) => rowAverages.find(ra => ra.type === type)?.avg ?? 0;
  const R = getAvg('r');
  const Q = getAvg('q');
  const P = getAvg('p');
  const T = getAvg('t');

  // IM calculada pela fórmula da geometria; fallback: média simples
  const geometryIM = gridParams
    ? calculateIMByGeometry(
        gridParams.geometryType,
        R, Q, P, T,
        gridParams.N, gridParams.M,
        gridParams.W, gridParams.L,
      )
    : null;

  const averageLux = geometryIM ?? round2(sum / allValues.length);
  const seventyPercentAverage = round2(averageLux * 0.7);

  // Área de tarefa (linha t)
  const tRows = rows.filter(r => r.rowType === 't');
  const tValues = extractValidValues(tRows);
  const taskAreaValue = tValues.length > 0
    ? round2(tValues.reduce((a, b) => a + b, 0) / tValues.length)
    : 0;

  return {
    measuredPointsCount: allValues.length,
    averageLux, minLux, maxLux,
    toleranceMinLux, seventyPercentAverage,
    uniformityRatio, taskAreaValue, rowAverages,
  };
}

/** Avalia os resultados contra os parâmetros normativos */
export function evaluateIlluminanceResult(
  calc: IlluminanceCalculationResult,
  normParam: IlluminanceNormativeParameter | null,
  recommendedMinLux: number,
): IlluminanceEvaluationResult {
  const issues: string[] = [];
  const minLux = normParam?.minimumLux ?? recommendedMinLux;
  const tolerancePct = normParam?.tolerancePercent ?? 10;
  const maxRatio = normParam?.maxUniformityRatio ?? 5;
  const toleranceThreshold = round2(minLux * (1 - tolerancePct / 100));

  const averageIsAdequate = calc.averageLux >= minLux;
  if (!averageIsAdequate)
    issues.push(`Iluminância média (${calc.averageLux} lux) abaixo do mínimo recomendado (${minLux} lux).`);

  const toleranceCheck = calc.averageLux >= toleranceThreshold;
  if (!toleranceCheck)
    issues.push(`Iluminância média (${calc.averageLux} lux) abaixo do limiar com tolerância de ${tolerancePct}% (${toleranceThreshold} lux).`);

  const seventyPctCheck = calc.minLux >= calc.seventyPercentAverage;
  if (!seventyPctCheck)
    issues.push(`Valor mínimo medido (${calc.minLux} lux) abaixo de 70% da média (${calc.seventyPercentAverage} lux).`);

  const uniformityCheck = calc.uniformityRatio <= maxRatio || calc.uniformityRatio === 0;
  if (!uniformityCheck)
    issues.push(`Relação de uniformidade (${calc.uniformityRatio}:1) excede o limite de ${maxRatio}:1.`);

  const taskAreaCheck = calc.taskAreaValue === 0 || calc.taskAreaValue >= 200;
  if (!taskAreaCheck)
    issues.push(`Área de tarefa (${calc.taskAreaValue} lux) abaixo de 200 lux.`);

  const status: IlluminanceStatus = issues.length === 0 ? 'Adequado' : 'Inadequado';
  const interpretationText = status === 'Adequado'
    ? `A iluminância média (${calc.averageLux} lux) atende ao mínimo recomendado de ${minLux} lux. Todos os critérios normativos foram satisfeitos.`
    : `A iluminância média (${calc.averageLux} lux) apresenta não-conformidades: ${issues.join(' ')}`;

  return {
    status, averageIsAdequate, toleranceCheck,
    seventyPercentCheck: seventyPctCheck, uniformityCheck, taskAreaCheck,
    interpretationText, issues,
  };
}

/** Calcula e avalia em uma única chamada */
export function calculateAndEvaluate(
  rows: MeasurementRow[],
  recommendedMinLux: number,
  normParam: IlluminanceNormativeParameter | null,
  gridParams?: GridParameters,
): { calculation: IlluminanceCalculationResult | null; evaluation: IlluminanceEvaluationResult | null } {
  const tolerancePct = normParam?.tolerancePercent ?? 10;
  const calculation = calculateIlluminanceMetrics(rows, recommendedMinLux, tolerancePct, gridParams);
  if (!calculation) return { calculation: null, evaluation: null };
  const evaluation = evaluateIlluminanceResult(calculation, normParam, recommendedMinLux);
  return { calculation, evaluation };
}

/** Variante que aceita o modelo de malha plana (gridPoints) */
export function calculateAndEvaluateFromGridPoints(
  points: GridPoint[],
  recommendedMinLux: number,
  normParam: IlluminanceNormativeParameter | null,
): { calculation: IlluminanceCalculationResult | null; evaluation: IlluminanceEvaluationResult | null } {
  const validValues = points
    .filter(p => !p.notApplicable && p.lux !== null)
    .map(p => p.lux as number);
  if (validValues.length === 0) return { calculation: null, evaluation: null };
  const tolerancePct = normParam?.tolerancePercent ?? 10;
  const sum = validValues.reduce((a, b) => a + b, 0);
  const averageLux = round2(sum / validValues.length);
  const minLux = Math.min(...validValues);
  const maxLux = Math.max(...validValues);
  const toleranceMinLux = round2(recommendedMinLux * (1 - tolerancePct / 100));
  const seventyPercentAverage = round2(averageLux * 0.7);
  const uniformityRatio = minLux > 0 ? round2(maxLux / minLux) : 0;
  const calculation: IlluminanceCalculationResult = {
    averageLux, minLux, maxLux, uniformityRatio,
    toleranceMinLux, seventyPercentAverage,
    measuredPointsCount: validValues.length,
    rowAverages: [],
    taskAreaValue: 0,
  };
  const evaluation = evaluateIlluminanceResult(calculation, normParam, recommendedMinLux);
  return { calculation, evaluation };
}
