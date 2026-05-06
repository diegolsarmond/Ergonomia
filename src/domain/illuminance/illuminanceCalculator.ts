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
      const v = row.values[c];
      if (v !== null && v !== undefined && !isNaN(v)) vals.push(v);
    }
  }
  return vals;
}

/** Calcula a média de uma linha de medição (R na planilha) */
export function rowAverage(row: MeasurementRow): number | null {
  const vals: number[] = [];
  for (let c = 0; c < row.activeCols; c++) {
    const v = row.values[c];
    if (v !== null && v !== undefined && !isNaN(v)) vals.push(v);
  }
  return vals.length > 0 ? round2(vals.reduce((a, b) => a + b, 0) / vals.length) : null;
}

/** Calcula métricas a partir da malha de medição */
export function calculateIlluminanceMetrics(
  rows: MeasurementRow[],
  recommendedMinLux: number,
  tolerancePercent: number = 10,
): IlluminanceCalculationResult | null {
  const allValues = extractValidValues(rows);
  if (allValues.length === 0) return null;

  const sum = allValues.reduce((a, b) => a + b, 0);
  const averageLux = round2(sum / allValues.length);
  const minLux = Math.min(...allValues);
  const maxLux = Math.max(...allValues);
  const toleranceMinLux = round2(recommendedMinLux * (1 - tolerancePercent / 100));
  const seventyPercentAverage = round2(averageLux * 0.7);
  const uniformityRatio = minLux > 0 ? round2(maxLux / minLux) : 0;

  // Valor da área de tarefa (t-rows)
  const tRows = rows.filter(r => r.rowType === 't');
  const tValues = extractValidValues(tRows);
  const taskAreaValue = tValues.length > 0 ? round2(tValues.reduce((a, b) => a + b, 0) / tValues.length) : 0;

  // Médias por linha
  const rowAverages = rows.map(r => ({
    type: r.rowType,
    index: r.index,
    avg: rowAverage(r) ?? 0,
  })).filter(ra => ra.avg > 0);

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

  // 1. Média vs mínimo recomendado
  const averageIsAdequate = calc.averageLux >= minLux;
  if (!averageIsAdequate) {
    issues.push(`Iluminância média (${calc.averageLux} lux) abaixo do mínimo recomendado (${minLux} lux).`);
  }

  // 2. 10% Tolerância
  const toleranceCheck = calc.averageLux >= toleranceThreshold;
  if (!toleranceCheck) {
    issues.push(`Iluminância média (${calc.averageLux} lux) abaixo do limiar com tolerância de ${tolerancePct}% (${toleranceThreshold} lux).`);
  }

  // 3. 70% da iluminância média
  const seventyPctCheck = calc.minLux >= calc.seventyPercentAverage;
  if (!seventyPctCheck) {
    issues.push(`Valor mínimo medido (${calc.minLux} lux) abaixo de 70% da média (${calc.seventyPercentAverage} lux).`);
  }

  // 4. Relação 5:1
  const uniformityCheck = calc.uniformityRatio <= maxRatio || calc.uniformityRatio === 0;
  if (!uniformityCheck) {
    issues.push(`Relação de uniformidade (${calc.uniformityRatio}:1) excede o limite de ${maxRatio}:1.`);
  }

  // 5. Área de tarefa de trabalho contínuo (≥ 200 lux)
  const taskAreaCheck = calc.taskAreaValue === 0 || calc.taskAreaValue >= 200;
  if (!taskAreaCheck) {
    issues.push(`Área de tarefa de trabalho contínuo (${calc.taskAreaValue} lux) abaixo de 200 lux.`);
  }

  // Status final
  const status: IlluminanceStatus = issues.length === 0 ? 'Adequado' : 'Inadequado';

  const interpretationText = status === 'Adequado'
    ? `A iluminância média medida (${calc.averageLux} lux) atende ao valor mínimo recomendado de ${minLux} lux. Todos os critérios normativos foram satisfeitos. Situação: Adequado.`
    : `A iluminância média medida (${calc.averageLux} lux) apresenta não-conformidades: ${issues.join(' ')} Situação: Inadequado.`;

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
): { calculation: IlluminanceCalculationResult | null; evaluation: IlluminanceEvaluationResult | null } {
  const tolerancePct = normParam?.tolerancePercent ?? 10;
  const calculation = calculateIlluminanceMetrics(rows, recommendedMinLux, tolerancePct);
  if (!calculation) return { calculation: null, evaluation: null };
  const evaluation = evaluateIlluminanceResult(calculation, normParam, recommendedMinLux);
  return { calculation, evaluation };
}

/** Variante que aceita o modelo de malha plana (gridPoints) usado no painel de entrada */
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
