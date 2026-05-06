/**
 * Tipos do módulo de Iluminância — baseado na planilha "Ferramenta de Iluminância - MODELO.xlsx"
 * e ABNT NBR ISO/CIE 8995-1:2013.
 */

// ── Tipos de geometria (Figuras A1–A6) ──────────────────────────────────────

export type GeometryType = 'A1' | 'A2' | 'A3' | 'A4' | 'A5' | 'A6';

export const GEOMETRY_LABELS: Record<GeometryType, string> = {
  A1: 'Figura A1 — Área retangular, padrão regular, 2+ fileiras',
  A2: 'Figura A2 — Área retangular, fileira única de luminárias',
  A3: 'Figura A3 — Luminária individual',
  A4: 'Figura A4 — Duas ou mais fileiras, espaçamento irregular',
  A5: 'Figura A5 — Área não-retangular',
  A6: 'Figura A6 — Área de tarefa específica',
};

export type IlluminanceScale = 'lux' | 'NA';
export type IlluminanceStatus = 'Adequado' | 'Inadequado' | '';
export type VerificationAnswer = 'Sim' | 'Não' | 'NA' | '';

// ── Linha de medição na malha ────────────────────────────────────────────────

export type MeasurementRowType = 'r' | 'q' | 'p' | 't';

export interface GridPoint {
  row: number;
  col: number;
  lux: number | null;
  notApplicable: boolean;
}

export interface MeasurementRow {
  id: string;
  rowType: MeasurementRowType;
  index: number;
  values: (number | null)[];
  activeCols: number;
}

// ── Parâmetros da malha ──────────────────────────────────────────────────────

export interface GridParameters {
  geometryType: GeometryType;
  N: number;  // quantidade de luminárias por fila
  M: number;  // número de filas
  W: number;  // largura do recinto (m)
  L: number;  // comprimento do recinto (m)
  maxCols: number; // colunas máximas da tabela
}

// ── Verificação do sistema de iluminação ─────────────────────────────────────

export interface VerificationItem {
  id: string;
  question: string;
  answer: VerificationAnswer;
  observations: string;
}

// ── Inconsistências ──────────────────────────────────────────────────────────

export interface InconsistencyItem {
  id: string;
  title: string;
  description: string;
  found: boolean;
  observations: string;
}

// ── Dados do equipamento/luxímetro ───────────────────────────────────────────

export interface EquipmentData {
  deviceName: string;
  certificate: string;
  calibrationDate: string;
  certificateImageDataUrl: string;
  observations: string;
}

// ── Resultado de cálculos ────────────────────────────────────────────────────

export interface IlluminanceCalculationResult {
  measuredPointsCount: number;
  averageLux: number;
  minLux: number;
  maxLux: number;
  toleranceMinLux: number;
  seventyPercentAverage: number;
  uniformityRatio: number;
  taskAreaValue: number;
  rowAverages: { type: MeasurementRowType; index: number; avg: number }[];
}

export interface IlluminanceEvaluationResult {
  status: IlluminanceStatus;
  averageIsAdequate: boolean;
  toleranceCheck: boolean;
  seventyPercentCheck: boolean;
  uniformityCheck: boolean;
  taskAreaCheck: boolean;
  interpretationText: string;
  issues: string[];
}

// ── Parâmetro normativo (Quadro de Tarefas) ──────────────────────────────────

export interface IlluminanceNormativeParameter {
  id: string;
  activityDescription: string;
  minimumLux: number;
  minimumIRC: number;
  tolerancePercent: number;
  maxUniformityRatio: number;
  normativeNotes: string;
  normativeReference: string;
  pageReference: string;
  active: boolean;
}

// ── Entidade principal: Medição de Iluminância ───────────────────────────────

export interface IlluminanceMeasurement {
  id: string;
  // Ambiente
  posto: string;
  environment: string;
  environmentType: string;
  recommendedMinLux: number;
  ircRa: string;
  scale: IlluminanceScale;
  normativeParameterId: string;
  // Malha (modelo normativo complexo)
  gridParameters: GridParameters;
  measurementRows: MeasurementRow[];
  // Malha (modelo simples para entrada de dados)
  gridConfig: { rows: number; cols: number };
  gridPoints: GridPoint[];
  gridSchemaImageDataUrl: string;
  // Resultados
  calculationResult: IlluminanceCalculationResult | null;
  evaluationResult: IlluminanceEvaluationResult | null;
  // Verificação
  verificationItems: VerificationItem[];
  // Inconsistências
  inconsistencyItems: InconsistencyItem[];
  // Dados do relatório
  equipmentData: EquipmentData;
  // Metadados
  observations: string;
  measurementDate: string;
  responsibleUser: string;
  formStatus: 'rascunho' | 'finalizado';
  createdAt: string;
  updatedAt: string;
}

// ── Constantes: Checklist de Verificação ─────────────────────────────────────

export const VERIFICATION_QUESTIONS: { id: string; question: string }[] = [
  { id: 'v1',  question: 'As áreas de trabalho são bem iluminadas?' },
  { id: 'v2',  question: 'A sinalização de segurança é adequada e visível?' },
  { id: 'v3',  question: 'Os trabalhadores relatam dificuldade visual?' },
  { id: 'v4',  question: 'Há necessidade de iluminação suplementar?' },
  { id: 'v5',  question: 'Existem sombras indesejáveis nos planos de trabalho?' },
  { id: 'v6',  question: 'Foi identificado efeito estroboscópico?' },
  { id: 'v7',  question: 'Foi identificada cintilação (flicker) nas luminárias?' },
  { id: 'v8',  question: 'Há ofuscamento direto ou refletido?' },
  { id: 'v9',  question: 'O contraste no plano de trabalho é adequado?' },
  { id: 'v10', question: 'As luminárias e difusores estão limpos e em bom estado?' },
  { id: 'v11', question: 'A troca de lâmpadas ocorre de forma regular e preventiva?' },
  { id: 'v12', question: 'Existe iluminação de emergência funcional?' },
  { id: 'v13', question: 'São realizadas medições de iluminância regulares?' },
];

// ── Constantes: Inconsistências ──────────────────────────────────────────────

export const INCONSISTENCY_ITEMS: { id: string; title: string; description: string }[] = [
  { id: 'i1', title: 'Efeito estroboscópico',    description: 'Percepção de movimentos intermitentes causados pela frequência da iluminação artificial, podendo causar ilusão de máquinas paradas.' },
  { id: 'i2', title: 'Cintilação (flicker)',      description: 'Variação perceptível da intensidade luminosa das lâmpadas, causando desconforto visual e fadiga.' },
  { id: 'i3', title: 'Iluminação insuficiente',   description: 'Nível de iluminância abaixo do mínimo recomendado para a tarefa, dificultando a visualização e aumentando o risco de erros.' },
  { id: 'i4', title: 'Iluminação irregular',      description: 'Distribuição desigual da iluminação no plano de trabalho, gerando pontos escuros e zonas de sombra.' },
  { id: 'i5', title: 'Iluminação excessiva',      description: 'Nível de iluminância acima do necessário, podendo causar desconforto e desperdício energético.' },
  { id: 'i6', title: 'Excesso de luz natural',    description: 'Entrada excessiva de luz natural sem controle adequado, gerando ofuscamento e variações térmicas.' },
  { id: 'i7', title: 'Brilho excessivo',          description: 'Luminância excessiva no campo visual do trabalhador, causando ofuscamento desconfortável ou inabilitador.' },
  { id: 'i8', title: 'Reflexões veladoras',       description: 'Reflexos em superfícies brilhantes que reduzem a visibilidade da tarefa (telas, papéis, superfícies polidas).' },
  { id: 'i9', title: 'Aparência de cor',          description: 'A temperatura de cor das fontes luminosas é inadequada para o ambiente ou tarefa, afetando a reprodução de cores.' },
];

// ── Factory: gerar linhas de medição por tipo de geometria ───────────────────

export function generateMeasurementRows(params: GridParameters): MeasurementRow[] {
  const rows: MeasurementRow[] = [];
  let id = 0;
  const mkId = () => `mr-${++id}`;
  const cols = params.maxCols;

  switch (params.geometryType) {
    case 'A1': {
      // r: M fileiras de pontos entre luminárias (N+1 pontos por fila, ou cols)
      const rCols = Math.min(2 * (params.N + 1), cols);
      for (let i = 0; i < params.M; i++)
        rows.push({ id: mkId(), rowType: 'r', index: i, values: new Array(cols).fill(null), activeCols: rCols });
      // q: M-1 linhas entre fileiras
      const qCols = Math.min(params.N, cols);
      for (let i = 0; i < Math.max(1, params.M - 1); i++)
        rows.push({ id: mkId(), rowType: 'q', index: i, values: new Array(cols).fill(null), activeCols: qCols });
      // p: 2 linhas (paredes)
      const pCols = Math.min(params.N, cols);
      for (let i = 0; i < 2; i++)
        rows.push({ id: mkId(), rowType: 'p', index: i, values: new Array(cols).fill(null), activeCols: pCols });
      // t: 1 linha de tarefa
      const tCols = Math.min(2 * params.N, cols);
      rows.push({ id: mkId(), rowType: 't', index: 0, values: new Array(cols).fill(null), activeCols: tCols });
      break;
    }
    case 'A2': {
      const rCols = Math.min(2 * params.N, cols);
      rows.push({ id: mkId(), rowType: 'r', index: 0, values: new Array(cols).fill(null), activeCols: rCols });
      for (let i = 0; i < 2; i++)
        rows.push({ id: mkId(), rowType: 'q', index: i, values: new Array(cols).fill(null), activeCols: Math.min(params.N, cols) });
      rows.push({ id: mkId(), rowType: 'p', index: 0, values: new Array(cols).fill(null), activeCols: 2 });
      rows.push({ id: mkId(), rowType: 't', index: 0, values: new Array(cols).fill(null), activeCols: Math.min(params.N, cols) });
      break;
    }
    default: {
      // A3–A6: malha genérica baseada em M×N
      const numR = Math.max(1, params.M);
      const rCols = Math.min(params.N || 4, cols);
      for (let i = 0; i < numR; i++)
        rows.push({ id: mkId(), rowType: 'r', index: i, values: new Array(cols).fill(null), activeCols: rCols });
      rows.push({ id: mkId(), rowType: 'q', index: 0, values: new Array(cols).fill(null), activeCols: Math.min(rCols, cols) });
      rows.push({ id: mkId(), rowType: 'p', index: 0, values: new Array(cols).fill(null), activeCols: 2 });
      rows.push({ id: mkId(), rowType: 't', index: 0, values: new Array(cols).fill(null), activeCols: Math.min(rCols, cols) });
      break;
    }
  }
  return rows;
}

// ── Factory: criar grid de pontos vazio ──────────────────────────────────────

export function createEmptyGridPoints(rows: number, cols: number): Array<{ row: number; col: number; lux: number | null; notApplicable: boolean }> {
  const points = [];
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      points.push({ row: r, col: c, lux: null, notApplicable: false });
  return points;
}

// ── Factory: criar medição vazia ─────────────────────────────────────────────

export function createEmptyIlluminanceMeasurement(id: string): IlluminanceMeasurement {
  const defaultParams: GridParameters = { geometryType: 'A1', N: 4, M: 2, W: 0, L: 0, maxCols: 8 };
  const now = new Date().toISOString();
  return {
    id,
    posto: '',
    environment: '',
    environmentType: '',
    recommendedMinLux: 0,
    ircRa: '',
    scale: 'lux',
    normativeParameterId: '',
    gridParameters: defaultParams,
    measurementRows: generateMeasurementRows(defaultParams),
    gridConfig: { rows: 4, cols: 4 },
    gridPoints: createEmptyGridPoints(4, 4),
    gridSchemaImageDataUrl: '',
    calculationResult: null,
    evaluationResult: null,
    verificationItems: VERIFICATION_QUESTIONS.map(q => ({ id: q.id, question: q.question, answer: '' as VerificationAnswer, observations: '' })),
    inconsistencyItems: INCONSISTENCY_ITEMS.map(i => ({ id: i.id, title: i.title, description: i.description, found: false, observations: '' })),
    equipmentData: { deviceName: '', certificate: '', calibrationDate: '', certificateImageDataUrl: '', observations: '' },
    observations: '',
    measurementDate: new Date().toISOString().split('T')[0],
    responsibleUser: '',
    formStatus: 'rascunho',
    createdAt: now,
    updatedAt: now,
  };
}

// ── Normative defaults ───────────────────────────────────────────────────────

export const DEFAULT_NORMATIVE_PARAMETERS: IlluminanceNormativeParameter[] = [
  { id: 'norm-1',  activityDescription: 'Escritório — Escrita, leitura, processamento de dados', minimumLux: 500, minimumIRC: 80, tolerancePercent: 10, maxUniformityRatio: 5, normativeNotes: 'Área de tarefa contínua de escritório.', normativeReference: 'ABNT NBR ISO/CIE 8995-1:2013', pageReference: 'Tabela 1, p. 14', active: true },
  { id: 'norm-2',  activityDescription: 'Escritório — Recepção e atendimento', minimumLux: 300, minimumIRC: 80, tolerancePercent: 10, maxUniformityRatio: 5, normativeNotes: '', normativeReference: 'ABNT NBR ISO/CIE 8995-1:2013', pageReference: 'Tabela 1, p. 14', active: true },
  { id: 'norm-3',  activityDescription: 'Indústria — Trabalho bruto / montagem simples', minimumLux: 200, minimumIRC: 60, tolerancePercent: 10, maxUniformityRatio: 5, normativeNotes: '', normativeReference: 'ABNT NBR ISO/CIE 8995-1:2013', pageReference: 'Tabela 2, p. 16', active: true },
  { id: 'norm-4',  activityDescription: 'Indústria — Trabalho médio / montagem moderada', minimumLux: 300, minimumIRC: 80, tolerancePercent: 10, maxUniformityRatio: 5, normativeNotes: '', normativeReference: 'ABNT NBR ISO/CIE 8995-1:2013', pageReference: 'Tabela 2, p. 16', active: true },
  { id: 'norm-5',  activityDescription: 'Indústria — Trabalho fino / inspeção', minimumLux: 500, minimumIRC: 80, tolerancePercent: 10, maxUniformityRatio: 5, normativeNotes: 'Área de inspeção de qualidade.', normativeReference: 'ABNT NBR ISO/CIE 8995-1:2013', pageReference: 'Tabela 2, p. 16', active: true },
  { id: 'norm-6',  activityDescription: 'Depósito / Almoxarifado', minimumLux: 100, minimumIRC: 60, tolerancePercent: 10, maxUniformityRatio: 5, normativeNotes: '', normativeReference: 'ABNT NBR ISO/CIE 8995-1:2013', pageReference: 'Tabela 3, p. 18', active: true },
  { id: 'norm-7',  activityDescription: 'Corredores e circulação', minimumLux: 100, minimumIRC: 40, tolerancePercent: 10, maxUniformityRatio: 5, normativeNotes: '', normativeReference: 'ABNT NBR ISO/CIE 8995-1:2013', pageReference: 'Tabela 3, p. 18', active: true },
  { id: 'norm-8',  activityDescription: 'Escadas e rampas', minimumLux: 150, minimumIRC: 40, tolerancePercent: 10, maxUniformityRatio: 5, normativeNotes: '', normativeReference: 'ABNT NBR ISO/CIE 8995-1:2013', pageReference: 'Tabela 3, p. 18', active: true },
  { id: 'norm-9',  activityDescription: 'Refeitório / Copa', minimumLux: 200, minimumIRC: 80, tolerancePercent: 10, maxUniformityRatio: 5, normativeNotes: '', normativeReference: 'ABNT NBR ISO/CIE 8995-1:2013', pageReference: 'Tabela 4, p. 20', active: true },
  { id: 'norm-10', activityDescription: 'Banheiros e vestiários', minimumLux: 200, minimumIRC: 80, tolerancePercent: 10, maxUniformityRatio: 5, normativeNotes: '', normativeReference: 'ABNT NBR ISO/CIE 8995-1:2013', pageReference: 'Tabela 4, p. 20', active: true },
  { id: 'norm-11', activityDescription: 'Sala de reunião / treinamento', minimumLux: 500, minimumIRC: 80, tolerancePercent: 10, maxUniformityRatio: 5, normativeNotes: '', normativeReference: 'ABNT NBR ISO/CIE 8995-1:2013', pageReference: 'Tabela 1, p. 14', active: true },
  { id: 'norm-12', activityDescription: 'Laboratório — Trabalho geral', minimumLux: 500, minimumIRC: 80, tolerancePercent: 10, maxUniformityRatio: 5, normativeNotes: '', normativeReference: 'ABNT NBR ISO/CIE 8995-1:2013', pageReference: 'Tabela 5, p. 22', active: true },
  { id: 'norm-13', activityDescription: '14. Trabalho e processamento em metal — Usinagem de precisão; retificação. Tolerâncias > 0,1 mm', minimumLux: 500, minimumIRC: 60, tolerancePercent: 10, maxUniformityRatio: 5, normativeNotes: '', normativeReference: 'ABNT NBR ISO/CIE 8995-1:2013', pageReference: 'Tabela 14', active: true },
];
