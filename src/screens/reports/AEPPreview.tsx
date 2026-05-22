import React, { useEffect, useRef } from 'react';
import type { AETProject, AETFunction, ErgonomicRisk, BiomechanicalItem, IlluminanceMeasurement } from '../../types';
import { DEFAULT_AEP_INTRO_ERGONOMIA, DEFAULT_AEP_INTRO_OBJETIVO, DEFAULT_AEP_INTRO_METODOLOGIA } from '../../types';
import { Field, TocLine, riskLevelColor, ReportToolbar, PDF_STYLES, CoverPage, PageFooter, useSectionPages, PALETTE, noBreakHyphen } from './components/ReportCommon';
import { useAET } from '../../context/AETContext';
import { auditoriaApi } from '../../services/api';

// ── Risk Matrix ──────────────────────────────────────────────────────────────

function matrixCellStyle(p: number, g: number): { background: string; color: string } {
  const score = p * g;
  if (score <= 4)  return { background: '#dcfce7', color: '#14532d' };
  if (score <= 8)  return { background: '#fef9c3', color: '#713f12' };
  if (score <= 15) return { background: '#ffedd5', color: '#7c2d12' };
  return               { background: '#fee2e2', color: '#7f1d1d' };
}

const MATRIX_LEGEND = [
  { label: 'BAIXO (1–4)',       bg: '#dcfce7', text: '#14532d' },
  { label: 'MODERADO (5–8)',    bg: '#fef9c3', text: '#713f12' },
  { label: 'ALTO RISCO (9–15)', bg: '#ffedd5', text: '#7c2d12' },
  { label: 'CRÍTICO (16–25)',   bg: '#fee2e2', text: '#7f1d1d' },
];

const RiskMatrix: React.FC<{ risks: ErgonomicRisk[] }> = ({ risks }) => {
  const countMap = new Map<string, number>();
  risks.forEach(r => {
    const key = `${r.probability}-${r.severity}`;
    countMap.set(key, (countMap.get(key) || 0) + 1);
  });

  const cellBase: React.CSSProperties = {
    border: '1px solid #e5e7eb',
    padding: '6px 8px',
    textAlign: 'center',
    fontSize: '0.78rem',
    minWidth: '52px',
  };

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '32px', marginTop: '12px' }}>
      {/* Matrix */}
      <div>
        <table style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ ...cellBase, background: '#f9fafb', fontWeight: 600, color: '#6b7280', fontSize: '0.7rem' }}>P \ G</th>
              {[1, 2, 3, 4, 5].map(g => (
                <th key={g} style={{ ...cellBase, background: '#f0fdfa', color: '#0d9488', fontWeight: 700 }}>G={g}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[5, 4, 3, 2, 1].map(p => (
              <tr key={p}>
                <td style={{ ...cellBase, background: '#f0fdfa', color: '#0d9488', fontWeight: 700 }}>P={p}</td>
                {[1, 2, 3, 4, 5].map(g => {
                  const score = p * g;
                  const { background, color } = matrixCellStyle(p, g);
                  const count = countMap.get(`${p}-${g}`) || 0;
                  return (
                    <td key={g} style={{ ...cellBase, background, position: 'relative' }}>
                      <span style={{ color, fontWeight: 700 }}>{score}</span>
                      {count > 0 && (
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          marginLeft: '4px', width: '17px', height: '17px',
                          background: '#1d4ed8', color: '#fff', borderRadius: '50%',
                          fontSize: '0.6rem', fontWeight: 700, verticalAlign: 'middle',
                        }}>
                          {count}
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        <p style={{ fontSize: '0.68rem', color: '#9ca3af', textAlign: 'center', marginTop: '4px' }}>
          G = Gravidade · P = Probabilidade · Score = P × G
        </p>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.78rem' }}>
        <p style={{ fontWeight: 600, color: '#374151', marginBottom: '4px' }}>Legenda</p>
        {MATRIX_LEGEND.map(item => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '36px', height: '18px', background: item.bg, border: '1px solid #d1d5db', borderRadius: '3px', flexShrink: 0 }} />
            <span style={{ color: '#374151' }}>{item.label}</span>
          </div>
        ))}
        {risks.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
            <div style={{ width: '17px', height: '17px', background: '#1d4ed8', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.6rem', fontWeight: 700, flexShrink: 0 }}>N</div>
            <span style={{ color: '#374151' }}>Qty de riscos na célula</span>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Helpers ──────────────────────────────────────────────────────────────────

const assessColor: Record<string, { bg: string; color: string }> = {
  'OK':      { bg: '#dcfce7', color: '#14532d' },
  'Atenção': { bg: '#fef9c3', color: '#713f12' },
  'Crítico': { bg: '#fee2e2', color: '#7f1d1d' },
  'N.A.':    { bg: '#cbd5e1', color: '#1e293b' },
};

const psyClassifColor: Record<string, { bg: string; color: string }> = {
  VERDE:    { bg: '#dcfce7', color: '#14532d' },
  AMARELO:  { bg: '#fef9c3', color: '#713f12' },
  LARANJA:  { bg: '#ffedd5', color: '#7c2d12' },
  VERMELHO: { bg: '#fee2e2', color: '#7f1d1d' },
};

const BiomecTable: React.FC<{
  title: string;
  items: BiomechanicalItem[];
  riskFactorsCatalog: any[];
}> = ({ title, items, riskFactorsCatalog }) => {
  if (items.length === 0) return null;

  const isGroupNA = items.length === 1 && items[0].riskFactorId === '__na__';
  const visibleItems = items.filter(i => i.riskFactorId !== '__na__');

  return (
  <>
    <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      {title}
      {isGroupNA && (
        <span style={{ display: 'inline-block', padding: '1px 10px', borderRadius: '9999px', fontWeight: 700, fontSize: '0.65rem', background: assessColor['N.A.'].bg, color: assessColor['N.A.'].color }}>
          N.A.
        </span>
      )}
    </h4>
    {!isGroupNA && visibleItems.length > 0 && (
      <table style={{ fontSize: '0.72rem' }}>
        <thead>
          <tr>
            <th style={{ width: '12%' }}>Avaliação</th>
            <th style={{ width: '30%' }}>Fatores de Risco</th>
            <th>Descrição / Observação</th>
          </tr>
        </thead>
        <tbody>
          {visibleItems.map((item, i) => {
            const ac = item.assessment ? assessColor[item.assessment] : null;
            const rf = riskFactorsCatalog.find(r => r.id === item.riskFactorId);
            const name = rf?.name ?? item.riskFactorId;

            return (
              <tr key={i}>
                <td style={{ textAlign: 'center' }}>
                  {item.assessment ? (
                    <span style={{ display: 'inline-block', padding: '1px 8px', borderRadius: '9999px', fontWeight: 700, fontSize: '0.65rem', background: ac?.bg, color: ac?.color }}>
                      {item.assessment}
                    </span>
                  ) : '—'}
                </td>
                <td>{name}</td>
                <td>{item.description || '—'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    )}
  </>
  );
};

// ── Illuminance Measurement Section ─────────────────────────────────────────

// Row type labels for the measurement grid
const HATCH_BG = 'repeating-linear-gradient(45deg, #e5e7eb 0, #e5e7eb 2px, #f9fafb 2px, #f9fafb 8px)';

const IlluminanceSection: React.FC<{ measurements: IlluminanceMeasurement[] }> = ({ measurements }) => {
  if (!measurements || measurements.length === 0) return null;

  return (
    <>
      <h4>Medições de Iluminância</h4>
      {measurements.map((m, idx) => {
        const calc  = m.calculationResult;
        const eval_ = m.evaluationResult;

        const situacaoColor = eval_?.status === 'Adequado'
          ? { bg: '#dcfce7', color: '#14532d', label: 'Adequado' }
          : eval_?.status === 'Inadequado'
          ? { bg: '#fee2e2', color: '#7f1d1d', label: 'Abaixo do recomendado' }
          : { bg: '#f1f5f9', color: '#64748b', label: '—' };

        // Use measurementRows (normative model) with fallback to gridPoints
        const GRID_COLS = 8;
        const mRows = m.measurementRows ?? [];
        const hasMRows = mRows.length > 0 && mRows.some(r =>
          r.values.some((v: number | null) => v !== null) || r.naFlags?.some((f: boolean) => f)
        );

        // Compute row average locally (same logic as panel), ignoring N/A flags
        const calcRowAvg = (row: typeof mRows[number]): number | null => {
          const vals = row.values.filter((v: number | null, i: number) =>
            v !== null && !(row.naFlags?.[i] ?? false)
          ) as number[];
          return vals.length > 0 ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : null;
        };

        // Fallback: simple gridPoints
        const gRows = m.gridConfig?.rows ?? 4;
        const gCols = m.gridConfig?.cols ?? 8;
        const hasGrid = !hasMRows && m.gridPoints?.some(p => p.lux !== null && !p.notApplicable);

        // Column widths: label + 8 data + avg + param(N/M)
        const totalMCols = 1 + GRID_COLS + 2;
        const labelW = `${Math.round(100 / totalMCols * 1.4)}%`;
        const dataW  = `${Math.round(100 / totalMCols * 0.85)}%`;
        const sumW   = `${Math.round(100 / totalMCols * 1.0)}%`;
        const totalGCols = 1 + gCols;
        const gLabelW = `${Math.round(100 / totalGCols * 1.4)}%`;
        const gDataW  = `${Math.round(100 / totalGCols * 0.9)}%`;

        // Summary label and param per row type (matching panel)
        const ROW_SUMMARY: Record<string, { avg: string; param?: string; paramVal?: number }> = {
          r: { avg: 'R', param: 'N', paramVal: m.gridParameters?.N },
          q: { avg: 'Q', param: 'M', paramVal: m.gridParameters?.M },
          p: { avg: 'P' },
          t: { avg: 'T' },
        };

        const foundIssues  = m.inconsistencyItems?.filter(i => i.found) ?? [];
        const failedChecks = m.verificationItems?.filter(v => v.answer === 'Sim') ?? [];

        const lmin = m.recommendedMinLux ?? 0;
        const tolerance10 = lmin > 0 ? Math.round(lmin * 0.9) : null;

        return (
          <div key={m.id} style={{ marginBottom: '28px', borderTop: idx > 0 ? `2px solid ${PALETTE.border}` : undefined, paddingTop: idx > 0 ? '20px' : undefined }}>

            {/* Title */}
            <p style={{ fontWeight: 700, fontSize: '0.9rem', color: PALETTE.dark, marginBottom: '6px' }}>
              Posto {idx + 1} - {m.posto || m.environment || `Medição ${idx + 1}`}
            </p>

            {/* ── Tabela 1: parâmetros (= header do modelo) ── */}
            <table style={{ fontSize: '0.75rem', marginBottom: '6px' }}>
              <tbody>
                <tr>
                  <th style={{ width: '28%' }}>Lux Mínimo Recomendado</th>
                  <td style={{ textAlign: 'center', fontWeight: 700 }}>{lmin || '—'}</td>
                  <th style={{ width: '10%' }}>IRC/Ra</th>
                  <td style={{ textAlign: 'center' }}>{m.ircRa || '—'}</td>
                  <th style={{ width: '22%' }}>Escala de Iluminância</th>
                  <td style={{ textAlign: 'center' }}>{m.scale === 'NA' ? 'NA' : (m.scale || '—')}</td>
                </tr>
                {(m.equipmentData?.deviceName || m.measurementDate) && (
                  <tr>
                    <th>Luxímetro</th>
                    <td>{m.equipmentData?.deviceName || '—'}</td>
                    <th>Calibração</th>
                    <td>{m.equipmentData?.calibrationDate || '—'}</td>
                    <th>Data / Responsável</th>
                    <td style={{ fontSize: '0.68rem' }}>
                      {m.measurementDate ? new Date(m.measurementDate + 'T12:00:00').toLocaleDateString('pt-BR') : '—'}
                      {m.responsibleUser ? ` · ${m.responsibleUser}` : ''}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* ── Parâmetros N / M ── */}
            {m.gridParameters && (
              <p style={{ fontSize: '0.7rem', color: PALETTE.muted, marginBottom: '4px' }}>
                N = quantidade de luminárias por fila ({m.gridParameters.N}) &nbsp;·&nbsp; M = número de filas ({m.gridParameters.M})
                {m.gridParameters.W ? ` &nbsp;·&nbsp; W = ${m.gridParameters.W} m` : ''}
                {m.gridParameters.L ? ` &nbsp;·&nbsp; L = ${m.gridParameters.L} m` : ''}
              </p>
            )}

            {/* ── Malha normativa (measurementRows) ── */}
            {hasMRows && (
              <table style={{ fontSize: '0.68rem', marginBottom: '8px', tableLayout: 'fixed', width: '100%', borderCollapse: 'collapse' }}>
                <colgroup>
                  <col style={{ width: labelW }} />
                  {Array.from({ length: GRID_COLS }, (_, c) => <col key={c} style={{ width: dataW }} />)}
                  <col style={{ width: sumW }} />
                  <col style={{ width: sumW }} />
                </colgroup>
                <tbody>
                  {mRows.map((row: typeof mRows[number]) => {
                    const summary = ROW_SUMMARY[row.rowType] ?? { avg: row.rowType.toUpperCase() };
                    const colPrefix = row.rowType;
                    const avg = calcRowAvg(row);
                    const thStyle: React.CSSProperties = {
                      textAlign: 'center', background: '#1e293b', color: '#fff',
                      fontWeight: 600, padding: '3px 2px', border: '1px solid #334155',
                    };
                    const tdStyle: React.CSSProperties = {
                      textAlign: 'center', padding: '3px 2px', border: '1px solid #e2e8f0',
                    };
                    return (
                      <React.Fragment key={row.id}>
                        {/* Header row for this measurement row */}
                        <tr>
                          <th style={thStyle}></th>
                          {Array.from({ length: GRID_COLS }, (_, c) => (
                            <th key={c} style={thStyle}>{colPrefix}{c + 1}</th>
                          ))}
                          <th style={thStyle}>{summary.avg}</th>
                          <th style={thStyle}>{'param' in summary ? summary.param : ''}</th>
                        </tr>
                        {/* Data row */}
                        <tr>
                          <td style={{ ...tdStyle, fontWeight: 600, color: PALETTE.primary, background: PALETTE.light }}></td>
                          {Array.from({ length: GRID_COLS }, (_, c) => {
                            const na = row.naFlags?.[c] ?? false;
                            const val = row.values[c];
                            return (
                              <td key={c} style={{
                                ...tdStyle,
                                background: na ? HATCH_BG : undefined,
                                color: na ? '#9ca3af' : 'inherit',
                              }}>
                                {na ? 'N.A.' : (val !== null && val !== undefined ? val : '')}
                              </td>
                            );
                          })}
                          <td style={{ ...tdStyle, fontWeight: 700, color: '#2563eb' }}>
                            {avg ?? '—'}
                          </td>
                          <td style={{ ...tdStyle, fontWeight: 700, color: PALETTE.dark }}>
                            {'paramVal' in summary ? summary.paramVal ?? '' : ''}
                          </td>
                        </tr>
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            )}

            {/* ── Malha simples (gridPoints fallback) ── */}
            {hasGrid && (
              <table style={{ fontSize: '0.68rem', marginBottom: '8px', tableLayout: 'fixed', width: '100%' }}>
                <colgroup>
                  <col style={{ width: gLabelW }} />
                  {Array.from({ length: gCols }, (_, c) => <col key={c} style={{ width: gDataW }} />)}
                </colgroup>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'center' }}>Linha</th>
                    {Array.from({ length: gCols }, (_, c) => (
                      <th key={c} style={{ textAlign: 'center' }}>p{c + 1}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: gRows }, (_, r) => (
                    <tr key={r}>
                      <td style={{ textAlign: 'center', fontWeight: 600, color: PALETTE.primary, background: PALETTE.light }}>{r + 1}</td>
                      {Array.from({ length: gCols }, (_, c) => {
                        const pt = m.gridPoints.find(p => p.row === r && p.col === c);
                        return (
                          <td key={c} style={{ textAlign: 'center', background: pt?.notApplicable ? HATCH_BG : undefined, color: pt?.notApplicable ? '#9ca3af' : 'inherit' }}>
                            {pt?.notApplicable ? 'N.A.' : (pt?.lux !== null && pt?.lux !== undefined ? pt.lux : '')}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* ── Tabela de resultados (= modelo proposto) ── */}
            {calc && (
              <table style={{ fontSize: '0.75rem', marginBottom: '8px' }}>
                <tbody>
                  <tr>
                    <td style={{ width: '52%', fontWeight: 600 }}>Iluminância Média (IM), calculada em função da área definida</td>
                    <td style={{ textAlign: 'center', fontWeight: 700, width: '10%' }}>{Math.round(calc.averageLux)}</td>
                    <td style={{ fontWeight: 600, width: '12%' }}>Situação:</td>
                    <td style={{ background: situacaoColor.bg, color: situacaoColor.color, fontWeight: 700, textAlign: 'center' }}>
                      {situacaoColor.label}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600 }}>10% Tolerância</td>
                    <td style={{ textAlign: 'center', fontWeight: 700 }}>{tolerance10 ?? Math.round(calc.toleranceMinLux)}</td>
                    <td style={{ fontWeight: 600 }}>Normativa</td>
                    <td style={{ color: PALETTE.muted, fontStyle: 'italic', fontSize: '0.7rem' }}>
                      {eval_?.toleranceCheck ? 'Conforme' : 'Cálculo conforme orientação'}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600 }}>70% Iluminância Média</td>
                    <td style={{ textAlign: 'center', fontWeight: 700 }}>{Math.round(calc.seventyPercentAverage)}</td>
                    <td style={{ fontWeight: 600 }}>Normativa</td>
                    <td style={{ color: PALETTE.muted, fontStyle: 'italic', fontSize: '0.7rem' }}>
                      {eval_?.seventyPercentCheck ? 'Conforme' : 'Cálculo conforme orientação'}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600 }}>Relação 5:1</td>
                    <td style={{ textAlign: 'center', fontWeight: 700 }}>{Math.round(calc.uniformityRatio)}</td>
                    <td style={{ fontWeight: 600 }}>Normativa</td>
                    <td style={{ color: PALETTE.muted, fontStyle: 'italic', fontSize: '0.7rem' }}>
                      {eval_?.uniformityCheck ? 'Conforme' : 'Cálculo conforme orientação'}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600 }}>Áreas de tarefa de trabalho contínuo</td>
                    <td style={{ textAlign: 'center', fontWeight: 700 }}>{Math.round(calc.taskAreaValue)}</td>
                    <td style={{ fontWeight: 600 }}>Normativa</td>
                    <td style={{ color: PALETTE.muted, fontStyle: 'italic', fontSize: '0.7rem' }}>
                      {eval_?.taskAreaCheck ? 'Conforme' : 'Exigência mínima normativa'}
                    </td>
                  </tr>
                </tbody>
              </table>
            )}

            {/* ── Figura da geometria ── */}
            {m.gridSchemaImageDataUrl && (
              <div style={{ marginTop: '8px', textAlign: 'center' }}>
                <p style={{ fontSize: '0.7rem', color: PALETTE.muted, marginBottom: '4px', fontStyle: 'italic' }}>
                  Figura {m.gridParameters?.geometryType} — {m.environment || 'Ambiente de trabalho'}
                </p>
                <img src={m.gridSchemaImageDataUrl} alt="Esquema da malha"
                  style={{ maxWidth: '260px', borderRadius: '4px', border: `1px solid ${PALETTE.border}` }} />
              </div>
            )}

            {/* ── Inconsistências / Verificação ── */}
            {foundIssues.length > 0 && (
              <div style={{ marginTop: '8px' }}>
                <p style={{ fontSize: '0.72rem', fontWeight: 600, color: PALETTE.muted, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '3px' }}>Inconsistências Identificadas</p>
                <table style={{ fontSize: '0.72rem' }}>
                  <thead><tr><th>Inconsistência</th><th>Observações</th></tr></thead>
                  <tbody>{foundIssues.map(i => <tr key={i.id}><td>{i.title}</td><td>{i.observations || '—'}</td></tr>)}</tbody>
                </table>
              </div>
            )}
            {failedChecks.length > 0 && (
              <div style={{ marginTop: '8px' }}>
                <p style={{ fontSize: '0.72rem', fontWeight: 600, color: PALETTE.muted, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '3px' }}>Verificação — Itens com Ocorrência</p>
                <table style={{ fontSize: '0.72rem' }}>
                  <thead><tr><th>Item</th><th>Observações</th></tr></thead>
                  <tbody>{failedChecks.map(v => <tr key={v.id}><td>{v.question}</td><td>{v.observations || '—'}</td></tr>)}</tbody>
                </table>
              </div>
            )}

            {m.observations && <Field label="Observações" value={m.observations} />}
          </div>
        );
      })}
    </>
  );
};

// ── AEP Function Section ─────────────────────────────────────────────────────

const AEPFunctionSection: React.FC<{
  func: AETFunction;
  sectionNum: string;
  riskFactorsCatalog: any[];
}> = ({ func, sectionNum, riskFactorsCatalog }) => {
  const risks: ErgonomicRisk[] = func.risks || [];
  const aep = func.aep;

  // ── NEW structured AEP rendering ────────────────────────────────────────
  if (aep) {
    const ident = aep.identification;
    const work  = aep.workCharacterization;
    const bio   = aep.biomechanics;
    const env   = bio.environmentalComfort;
    const psy   = aep.psychosocialAnswers;
    const trigs = aep.aetTriggers;
    const resp  = aep.technicalResponsible;
    const raci  = aep.raciActionPlan;

    // Compute from triggers/psychosocial (same logic as form), falling back to stored flag
    const effectiveRequiresAET =
      func.requiresAET ||
      trigs.some((t: any) => t.answer === 'Sim') ||
      aep.psychosocialClassification === 'VERMELHO';

    return (
      <section className="px-12 py-10 print:break-before-page">
        <h2>{sectionNum}. {func.name || 'Função sem nome'}</h2>

        {/* 1. Identificação */}
        <h3>1. Identificação</h3>
        <table className="mb-4">
          <tbody>
            <tr>
              <th style={{ width: '22%' }}>Função / Cargo</th>
              <td>{func.name}</td>
              <th style={{ width: '22%' }}>Código</th>
              <td>{ident.code || '—'}</td>
            </tr>
            <tr>
              <th>Unidade / Filial</th>
              <td>{ident.unitBranch || func.unit || '—'}</td>
              <th>Setor / Área</th>
              <td>{ident.sectorArea || func.sector || '—'}</td>
            </tr>
            <tr>
              <th>Funções Contempladas</th>
              <td colSpan={3}>{ident.contemplatedFunctions || '—'}</td>
            </tr>
            <tr>
              <th>Atividade Avaliada</th>
              <td colSpan={3}>{ident.evaluatedActivity || func.demandFound || '—'}</td>
            </tr>
            <tr>
              <th>Nº de Colaboradores</th>
              <td>{func.numEmployees || '—'}</td>
              <th>Data da Análise</th>
              <td>{func.analysisDate ? new Date(func.analysisDate + 'T12:00:00').toLocaleDateString('pt-BR') : '—'}</td>
            </tr>
          </tbody>
        </table>

        {/* 2. Caracterização do Trabalho */}
        {(work.processDescription || work.workCycleDescription) && (
          <>
            <h3 style={{ marginTop: '32px' }}>2. Caracterização do Trabalho</h3>
            <h4>2.1 Descrição</h4>
            <Field label="Descrição do Processo e Ciclo de Trabalho" value={work.processDescription || work.workCycleDescription} />

            <h4>2.2 Organização do Trabalho</h4>
            <table style={{ fontSize: '0.75rem' }}>
              <tbody>
                <tr><th style={{ width: '25%' }}>Jornada</th><td>{work.workOrganization.workday || '—'}</td><th style={{ width: '25%' }}>Escala / Turno</th><td>{work.workOrganization.scale || '—'}</td></tr>
                <tr><th>Horas Extras</th><td>{work.workOrganization.overtime || '—'}</td><th>Intervalo Refeição</th><td>{work.workOrganization.lunchBreak || '—'}</td></tr>
                <tr><th>Outras Pausas</th><td>{work.workOrganization.otherBreaks || '—'}</td><th>Rodízio de Tarefas</th><td>{work.workOrganization.taskRotation || '—'}</td></tr>
                <tr><th>Diálogos de Segurança</th><td colSpan={3}>{work.workOrganization.safetyDialogues || '—'}</td></tr>
              </tbody>
            </table>

            <h4>2.3 Ferramentas e Materiais</h4>
            <Field label="Ferramentas / Materiais" value={work.toolsAndMaterials.description} />
            <Field label="EPIs" value={work.toolsAndMaterials.epis} />
            {work.toolsAndMaterials.others && <Field label="Outros" value={work.toolsAndMaterials.others} />}
          </>
        )}

        {/* 3. Registro Fotográfico */}
        {aep.photographicRecords.length > 0 && (
          <>
            <h3 style={{ marginTop: '32px' }}>3. Registro Fotográfico</h3>
            <p style={{ fontSize: '0.7rem', color: '#6b7280', fontStyle: 'italic', marginBottom: '12px' }}>{aep.lgpdNote}</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {aep.photographicRecords.map((photo, i) => (
                <div key={photo.id} style={{ textAlign: 'center' }}>
                  {photo.imageDataUrl && (
                    <img src={photo.imageDataUrl} alt={photo.description || `Foto ${i + 1}`}
                      style={{ width: '100%', height: 'auto', borderRadius: '6px', border: '1px solid #e5e7eb' }} />
                  )}
                  {photo.description && <p style={{ fontSize: '0.72rem', color: '#6b7280', marginTop: '4px' }}>{photo.description}</p>}
                </div>
              ))}
            </div>
          </>
        )}

        {/* 4. Biomecânica */}
        <h3 style={{ marginTop: '32px' }}>4. Biomecânica</h3>
        <BiomecTable title="Posturas e Alcances"           items={bio.postureAndReach}           riskFactorsCatalog={riskFactorsCatalog} />
        <BiomecTable title="Repetitividade e Ritmo"         items={bio.repetitivenessAndRhythm}     riskFactorsCatalog={riskFactorsCatalog} />
        <BiomecTable title="Força e Exigência Física"       items={bio.forceAndPhysicalDemand}      riskFactorsCatalog={riskFactorsCatalog} />
        <BiomecTable title="Movimentação Manual de Cargas"  items={bio.manualMaterialHandling}      riskFactorsCatalog={riskFactorsCatalog} />
        <BiomecTable title="Mobiliário e Posto de Trabalho" items={bio.furnitureAndWorkstation}      riskFactorsCatalog={riskFactorsCatalog} />

        <h4>4.6 Conforto Ambiental</h4>
        <table style={{ fontSize: '0.72rem' }}>
          <thead><tr><th>Fator</th><th>Queixa</th><th>Valor Medido</th><th>Descrição</th></tr></thead>
          <tbody>
            <tr><td>Iluminação</td><td>{env.lightingComplaint || '—'}</td><td>{env.lightingValue || '—'}</td><td>{env.lightingDescription || '—'}</td></tr>
            <tr><td>Ruído</td><td>{env.noiseComplaint || '—'}</td><td>{env.noiseValue || '—'}</td><td>{env.noiseDescription || '—'}</td></tr>
            <tr><td>Temperatura</td><td>{env.temperatureComplaint || '—'}</td><td>{env.temperatureValue || '—'}</td><td>{env.temperatureDescription || '—'}</td></tr>
          </tbody>
        </table>

        {/* 5. Ferramentas Científicas */}
        {(aep.scientificTools.length > 0 || (aep.illuminanceMeasurements?.length ?? 0) > 0) && (
          <h3 style={{ marginTop: '32px' }}>5. Ferramentas Científicas</h3>
        )}
        {aep.scientificTools.map((tool, i) => (
          <div key={tool.id} style={{ marginBottom: '12px' }}>
            <p style={{ fontWeight: 600, fontSize: '0.85rem', color: PALETTE.dark }}>{i + 1}. {tool.toolName}</p>
            <Field label="Resultado" value={tool.result} />
            <Field label="Interpretação" value={tool.interpretation} />
            <Field label="Recomendação" value={tool.recommendation} />
            {tool.imageDataUrl && (
              <img src={tool.imageDataUrl} alt={tool.toolName}
                style={{ maxWidth: '280px', marginTop: '6px', borderRadius: '4px', border: `1px solid ${PALETTE.border}` }} />
            )}
          </div>
        ))}
        <IlluminanceSection measurements={aep.illuminanceMeasurements ?? []} />

        {/* 6. Psicossocial */}
        {psy.some((q: any) => q.score !== '') && (() => {
          const psyGroups = Array.from(new Set(psy.map((q: any) => q.group)));
          return (
            <>
              <h3 style={{ marginTop: '32px' }}>6. Avaliação Psicossocial</h3>

              {/* Legenda */}
              <p style={{ fontSize: '0.68rem', color: '#6b7280', marginBottom: '10px', fontStyle: 'italic' }}>
                Escala: <strong>1</strong> = Nunca &nbsp;·&nbsp; <strong>2</strong> = Raramente &nbsp;·&nbsp; <strong>3</strong> = Às vezes &nbsp;·&nbsp; <strong>4</strong> = Frequentemente &nbsp;·&nbsp; <strong>5</strong> = Sempre
              </p>

              {psyGroups.map(groupName => {
                const groupItems = psy.filter((q: any) => q.group === groupName);
                return (
                  <div key={groupName} style={{ marginBottom: '12px' }}>
                    <p style={{ fontSize: '0.72rem', fontWeight: 700, color: PALETTE.primary, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>
                      {groupName}
                    </p>
                    <table style={{ fontSize: '0.68rem' }}>
                      <thead>
                        <tr>
                          <th>Fator Psicossocial</th>
                          <th style={{ width: '8%', textAlign: 'center' }}>Pontuação</th>
                          <th style={{ width: '22%' }}>Observações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {groupItems.map((q: any) => (
                          <tr key={q.id}>
                            <td>{q.question}{q.inverted ? <em style={{ color: '#0d9488', fontSize: '0.62rem' }}> (invertida)</em> : ''}</td>
                            <td style={{ textAlign: 'center', fontWeight: 700 }}>{q.score !== '' ? String(q.score) : '—'}</td>
                            <td>{q.comments || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })}

              {aep.psychosocialClassification && (
                <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>
                    Média Geral: {aep.psychosocialAverages.overall.toFixed(2)}
                  </span>
                  <span style={{
                    display: 'inline-block', padding: '2px 14px', borderRadius: '9999px', fontWeight: 700, fontSize: '0.78rem',
                    background: psyClassifColor[aep.psychosocialClassification]?.bg,
                    color: psyClassifColor[aep.psychosocialClassification]?.color,
                  }}>
                    {aep.psychosocialClassification}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: '#6b7280', fontStyle: 'italic' }}>{aep.psychosocialInterpretation}</span>
                </div>
              )}
            </>
          );
        })()}

        {/* 7. Classificação de Risco / Gatilhos AET */}
        {trigs.some(t => t.answer !== '') && (
          <>
            <h3 style={{ marginTop: '32px' }}>7. Classificação de Risco — Gatilhos para AET</h3>
            <table style={{ fontSize: '0.72rem' }}>
              <thead><tr><th style={{ width: '5%' }}>#</th><th>Gatilho</th><th style={{ width: '10%' }}>Resposta</th></tr></thead>
              <tbody>
                {trigs.map((t, i) => (
                  <tr key={t.id} style={{ background: t.answer === 'Sim' ? '#fef2f2' : '' }}>
                    <td style={{ textAlign: 'center' }}>{i + 1}</td>
                    <td>{t.description}</td>
                    <td style={{ textAlign: 'center', fontWeight: 700, color: t.answer === 'Sim' ? '#dc2626' : t.answer === 'Não' ? '#16a34a' : '#6b7280' }}>
                      {t.answer || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '5px 14px', borderRadius: '9999px',
                background: effectiveRequiresAET ? '#dc2626' : '#22c55e', color: '#fff',
                fontSize: '0.82rem', fontWeight: 600,
              }}>
                {effectiveRequiresAET ? 'Requer AET' : 'Não requer AET'}
              </span>
            </div>
            {aep.finalGuidance && (
              <div className="field" style={{ marginTop: '12px' }}>
                <div className="field-label">Orientação Final</div>
                <div className="field-value" dangerouslySetInnerHTML={{ __html: noBreakHyphen(aep.finalGuidance) }} />
              </div>
            )}
            {aep.decisionJustification && (
              <div className="field">
                <div className="field-label">Justificativa da Decisão</div>
                <div className="field-value" dangerouslySetInnerHTML={{ __html: noBreakHyphen(aep.decisionJustification) }} />
              </div>
            )}
          </>
        )}

        {/* 8. Plano de Ação RACI */}
        {raci.length > 0 && (
          <>
            <h3 style={{ marginTop: '32px' }}>8. Plano de Ação RACI</h3>
            <table style={{ fontSize: '0.66rem' }}>
              <thead>
                <tr>
                  <th>Fator de Risco</th>
                  <th>Ação</th>
                  <th style={{ width: '7%' }}>R</th>
                  <th style={{ width: '7%' }}>A</th>
                  <th style={{ width: '7%' }}>C</th>
                  <th style={{ width: '7%' }}>I</th>
                  <th style={{ width: '9%' }}>Prazo</th>
                  <th style={{ width: '7%' }}>Prio.</th>
                  <th style={{ width: '9%' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {raci.map(a => (
                  <tr key={a.id}>
                    <td>{a.riskFactor}</td>
                    <td>{a.action}</td>
                    <td>{a.responsible}</td>
                    <td>{a.accountable}</td>
                    <td>{a.consulted}</td>
                    <td>{a.informed}</td>
                    <td>{a.deadline ? new Date(a.deadline + 'T12:00:00').toLocaleDateString('pt-BR') : '—'}</td>
                    <td style={{ fontWeight: 700, color: a.priority === 'Crítica' ? '#dc2626' : a.priority === 'Alta' ? '#ea580c' : a.priority === 'Média' ? '#d97706' : '#16a34a' }}>{a.priority || '—'}</td>
                    <td>{a.status || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {/* Legacy risk matrix if risks exist */}
        {risks.length > 0 && (
          <>
            <h3>Inventário de Riscos Ergonômicos</h3>
            <table className="mt-2" style={{ fontSize: '0.68rem' }}>
              <thead>
                <tr>
                  <th style={{ width: '3%' }}>#</th><th>Agente</th><th>Fator de Risco</th>
                  <th>Efeito à Saúde</th><th>Situação</th><th>Controle</th><th>Melhoria</th>
                  <th style={{ width: '3%' }}>P</th><th style={{ width: '3%' }}>G</th>
                  <th style={{ width: '4%' }}>Score</th><th style={{ width: '9%' }}>Nível</th>
                  <th>Ref.</th><th>Responsável</th><th>Prazo</th>
                </tr>
              </thead>
              <tbody>
                {risks.map((risk, i) => (
                  <tr key={risk.id}>
                    <td className="text-center font-medium">{String(i + 1).padStart(2, '0')}</td>
                    <td>{risk.agent}</td><td>{risk.riskFactor}</td><td>{risk.possibleHealthEffect}</td>
                    <td>{risk.foundSituation}</td><td>{risk.existingControl}</td><td>{risk.improvementProposal}</td>
                    <td className="text-center">{risk.probability}</td><td className="text-center">{risk.severity}</td>
                    <td className="text-center font-bold">{risk.score}</td>
                    <td><span style={{ display: 'inline-block', padding: '1px 7px', borderRadius: '9999px', fontSize: '0.65rem', fontWeight: 700, color: '#fff', background: riskLevelColor(risk.riskLevel) }}>{risk.riskLevel}</span></td>
                    <td>{risk.normativeReference}</td><td>{risk.responsible}</td>
                    <td>{risk.deadline ? new Date(risk.deadline + 'T12:00:00').toLocaleDateString('pt-BR') : ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <h3>Matriz de Risco</h3>
            <RiskMatrix risks={risks} />
          </>
        )}

      </section>
    );
  }

  // ── LEGACY fallback (funções sem aep estruturado) ────────────────────────
  return (
    <section className="px-12 py-10 print:break-before-page">
      <h2>{sectionNum}. {func.name || 'Função sem nome'}</h2>

      <table className="mb-6">
        <tbody>
          <tr>
            <th style={{ width: '22%' }}>Função / Cargo</th>
            <td>{func.name}</td>
            <th style={{ width: '22%' }}>Nº de Colaboradores</th>
            <td>{func.numEmployees}</td>
          </tr>
          <tr>
            <th>Setor</th>
            <td>{func.sector}</td>
            <th>Unidade</th>
            <td>{func.unit}</td>
          </tr>
          <tr>
            <th>GHE</th>
            <td colSpan={3}>{func.ghe}</td>
          </tr>
          <tr>
            <th>Data da Análise</th>
            <td>{func.analysisDate ? new Date(func.analysisDate + 'T12:00:00').toLocaleDateString('pt-BR') : '—'}</td>
            <th>Demanda Encontrada</th>
            <td>{func.demandFound}</td>
          </tr>
        </tbody>
      </table>

      {(func.generalConditions || func.accessConditions || func.workstationOrganization) && (
        <>
          <h3>Condições do Local de Trabalho</h3>
          <Field label="Condições Gerais" value={func.generalConditions} />
          <Field label="Acesso" value={func.accessConditions} />
          <Field label="Organização e Dimensionamento do Posto" value={func.workstationOrganization} />
        </>
      )}
      {func.environmentalConditions && (
        <>
          <h3>Condições Ambientais</h3>
          <Field label="" value={func.environmentalConditions} />
        </>
      )}
      {(func.biomechanicalFactors || func.cognitiveFactors || func.organizationalFactors) && (
        <>
          <h3>Fatores Ergonômicos</h3>
          <Field label="Biomecânicos"    value={func.biomechanicalFactors} />
          <Field label="Cognitivos"      value={func.cognitiveFactors} />
          <Field label="Organizacionais" value={func.organizationalFactors} />
        </>
      )}
      {(func.prescribedTask || func.cyclePrescribed || func.realTask || func.cycleReal) && (
        <>
          <h3>Descrição da Atividade</h3>
          {(func.prescribedTask || func.cyclePrescribed) && (
            <Field label="Tarefa Prescrita" value={func.prescribedTask || func.cyclePrescribed} />
          )}
          {(func.realTask || func.cycleReal) && (
            <Field label="Tarefa Real" value={func.realTask || func.cycleReal} />
          )}
        </>
      )}
      {risks.length > 0 && (
        <>
          <h3>Inventário de Riscos Ergonômicos</h3>
          <table className="mt-2" style={{ fontSize: '0.68rem' }}>
            <thead>
              <tr>
                <th style={{ width: '3%' }}>#</th><th>Agente</th><th>Fator de Risco</th>
                <th>Efeito à Saúde</th><th>Situação</th><th>Controle</th><th>Melhoria</th>
                <th style={{ width: '3%' }}>P</th><th style={{ width: '3%' }}>G</th>
                <th style={{ width: '4%' }}>Score</th><th style={{ width: '9%' }}>Nível</th>
                <th>Ref.</th><th>Responsável</th><th>Prazo</th>
              </tr>
            </thead>
            <tbody>
              {risks.map((risk, i) => (
                <tr key={risk.id}>
                  <td className="text-center font-medium">{String(i + 1).padStart(2, '0')}</td>
                  <td>{risk.agent}</td><td>{risk.riskFactor}</td><td>{risk.possibleHealthEffect}</td>
                  <td>{risk.foundSituation}</td><td>{risk.existingControl}</td><td>{risk.improvementProposal}</td>
                  <td className="text-center">{risk.probability}</td><td className="text-center">{risk.severity}</td>
                  <td className="text-center font-bold">{risk.score}</td>
                  <td><span style={{ display: 'inline-block', padding: '1px 7px', borderRadius: '9999px', fontSize: '0.65rem', fontWeight: 700, color: '#fff', background: riskLevelColor(risk.riskLevel) }}>{risk.riskLevel}</span></td>
                  <td>{risk.normativeReference}</td><td>{risk.responsible}</td>
                  <td>{risk.deadline ? new Date(risk.deadline + 'T12:00:00').toLocaleDateString('pt-BR') : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <h3>Matriz de Risco</h3>
          <RiskMatrix risks={risks} />
        </>
      )}
      <>
        <h3>Conclusão</h3>
        {func.conclusion
          ? <Field label="" value={func.conclusion} />
          : <p style={{ fontSize: '0.85rem', color: '#9ca3af', fontStyle: 'italic' }}>—</p>
        }
        <div style={{ marginTop: '12px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '6px 16px', borderRadius: '9999px',
            background: func.requiresAET ? '#dc2626' : '#22c55e',
            color: '#fff', fontSize: '0.85rem', fontWeight: 600,
          }}>
            {func.requiresAET ? 'Requer AET' : 'Não requer AET'}
          </div>
        </div>
        {func.requiresAET && func.requiresAETJustification && (
          <Field label="Justificativa para AET" value={func.requiresAETJustification} />
        )}
      </>
    </section>
  );
};

// ── AEPPreview ───────────────────────────────────────────────────────────────

export const AEPPreview: React.FC<{ project: AETProject }> = ({ project }) => {
  const { biomechanicalRiskFactors } = useAET();
  const auditFiredRef = React.useRef(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('print') === 'true') {
      if (!auditFiredRef.current) {
        auditFiredRef.current = true;
        const desc = `Impressão/PDF do projeto AEP: ${project.companyName || project.id}`;
        auditoriaApi.registrar('IMPRESSÃO', 'aep_projetos', project.id, desc).catch(() => {});
      }
      const timer = setTimeout(() => window.print(), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const monthYear = project.date
    ? new Date(project.date + 'T12:00:00').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    : '';

  const introErgonomia   = project.introErgonomia   || DEFAULT_AEP_INTRO_ERGONOMIA;
  const introObjetivo    = project.introObjetivo    || DEFAULT_AEP_INTRO_OBJETIVO;
  const introMetodologia = project.introMetodologia || DEFAULT_AEP_INTRO_METODOLOGIA;

  const funcoesParam = new URLSearchParams(window.location.search).get('funcoes');
  const filteredFunctions = funcoesParam
    ? project.functions.filter(f => funcoesParam.split(',').includes(f.id))
    : project.functions;

  const hasAnnexes = filteredFunctions.some(f => f.images?.length > 0);
  const funcCount  = filteredFunctions.length;
  const respNum    = funcCount > 0 ? `${funcCount + 2}` : '3';
  const anexosNum  = funcCount > 0 ? `${funcCount + 3}` : '4';

  const containerRef = useRef<HTMLDivElement>(null);
  const sectionIds = [
    'aep-intro',
    ...filteredFunctions.map(f => `aep-func-${f.id}`),
    'aep-resp',
    'aep-anexos',
  ];
  const pages = useSectionPages(containerRef, sectionIds, [project]);

  return (
    <>
      <ReportToolbar projectId={project.id} reportType="AEP" projectName={project.companyName} />

      <div className="w-full overflow-x-auto print:overflow-visible bg-gray-100 print:bg-transparent">
        <div ref={containerRef} className="pdf-preview bg-white min-w-[800px] max-w-[210mm] mx-auto my-8 print:my-0 print:min-w-0 print:max-w-none print:w-full shadow-lg print:shadow-none">

          {/* ══ CAPA ══ */}
          <CoverPage
            titleLines={['AVALIAÇÃO', 'ERGONÔMICA', 'PRELIMINAR']}
            companyLogoDataUrl={project.companyLogoDataUrl}
            consultoriaLogoDataUrl={project.consultoriaLogoDataUrl}
            companyName={project.companyName || ''}
            monthYear={monthYear}
          />

          {/* ══ CONTEÚDO (thead/tfoot para cabeçalho e rodapé repetidos, inclui Sumário) ══ */}
          <table className="w-full" style={{ border: 'none' }}>
            <thead>
              <tr>
                <td style={{ border: 'none', padding: 0 }}>
                  {project.companyLogoDataUrl && (
                    <div className="pdf-repeat-logo hidden justify-end px-12 pt-2 pb-2">
                      <img
                        src={project.companyLogoDataUrl}
                        alt="Logo empresa"
                        style={{ maxHeight: '18mm', maxWidth: '60mm', objectFit: 'contain', display: 'block' }}
                      />
                    </div>
                  )}
                </td>
              </tr>
            </thead>
            <tfoot>
              <tr>
                <td style={{ border: 'none', padding: 0 }}>
                  <PageFooter consultoriaLogoDataUrl={project.consultoriaLogoDataUrl} />
                </td>
              </tr>
            </tfoot>
            <tbody>
              <tr>
                <td className="p-0" style={{ border: 'none' }}>

                  {/* ── Sumário ── */}
                  <section className="pdf-page px-12 py-16 print:break-after-page">
                    <h2>Sumário</h2>
                    <div className="space-y-2 mt-4">
                      <TocLine num="1" title="Introdução" page={pages['aep-intro']} />
                      <TocLine num="1.1" title="Ergonomia" indent page={pages['aep-intro']} />
                      <TocLine num="1.2" title="Análise Global da Empresa" indent page={pages['aep-intro']} />
                      <TocLine num="1.3" title="Objetivo" indent page={pages['aep-intro']} />
                      <TocLine num="1.4" title="Metodologia" indent page={pages['aep-intro']} />
                      <TocLine num="2" title="AEP – Análise Ergonômica Preliminar" page={pages[`aep-func-${filteredFunctions[0]?.id}`]} />
                      {filteredFunctions.map((func, idx) => (
                        <TocLine key={func.id} num={`2.${idx + 1}`} title={func.name || 'Função sem nome'} indent page={pages[`aep-func-${func.id}`]} />
                      ))}
                      <TocLine num={respNum}    title="Responsabilidade Técnica" page={pages['aep-resp']} />
                      {hasAnnexes && <TocLine num={anexosNum} title="Anexos – Registros Fotográficos" page={pages['aep-anexos']} />}
                    </div>
                  </section>

                  {/* ── 1. Introdução ── */}
                  <section id="aep-intro" className="pdf-page px-12 py-8 print:break-after-page">
                    <h2>1. Introdução</h2>

                    <h3>1.1 Ergonomia</h3>
                    <div className="field-value text-slate-700" dangerouslySetInnerHTML={{ __html: noBreakHyphen(introErgonomia) }} />

                    <h3>1.2 Análise Global da Empresa</h3>
                    <div className="grid grid-cols-2 gap-x-8 mt-2">
                      <Field label="Razão Social"          value={project.companyName} />
                      <Field label="Nome Fantasia"         value={project.fantasyName} />
                      <Field label="CNPJ"                  value={project.cnpj} />
                      <Field label="Grau de Risco"         value={project.riskDegree} />
                      <Field label="Endereço"              value={project.address} />
                      <Field label="Unidade"               value={project.unit} />
                      <Field label="Produto / Atividade"   value={project.product} />
                      <Field label="Local de Produção"     value={project.location} />
                    </div>

                    <h3>1.3 Objetivo</h3>
                    <div className="field-value text-slate-700" dangerouslySetInnerHTML={{ __html: noBreakHyphen(introObjetivo) }} />

                    <h3>1.4 Metodologia</h3>
                    <div className="field-value text-slate-700" dangerouslySetInnerHTML={{ __html: noBreakHyphen(introMetodologia) }} />
                  </section>

                  {/* ── 2. Funções ── */}
                  {filteredFunctions.length === 0 && (
                    <section className="pdf-page px-12 py-8">
                      <h2>2. AEP – Análise Ergonômica Preliminar</h2>
                      <p className="field-value" style={{ color: '#9ca3af', fontStyle: 'italic' }}>
                        Nenhuma função cadastrada.
                      </p>
                    </section>
                  )}
                  {filteredFunctions.map((func, fIdx) => (
                    <div key={func.id} id={`aep-func-${func.id}`}>
                      <AEPFunctionSection func={func} sectionNum={`2.${fIdx + 1}`} riskFactorsCatalog={biomechanicalRiskFactors} />
                    </div>
                  ))}

                  {/* ── Responsabilidade Técnica ── */}
                  <section id="aep-resp" className="pdf-page px-12 py-14 print:break-before-page">
                    <h2>{respNum}. Responsabilidade Técnica</h2>
                    <div className="mt-16 flex flex-col items-center justify-center">
                      <div className="flex flex-col items-center w-full max-w-sm text-center">
                        {project.evaluatorSignatureDataUrl && (
                          <img src={project.evaluatorSignatureDataUrl} alt="Assinatura"
                            className="max-h-20 mb-4 object-contain" />
                        )}
                        {!project.evaluatorSignatureDataUrl && (
                          <div className="h-20 mb-4" />
                        )}
                        <div className="w-full border-t border-black mb-3" />
                        <p className="font-medium text-gray-900 mb-1">Responsável técnico pela avaliação</p>
                        {project.evaluatorName      && <p className="text-gray-800 mb-0.5">{project.evaluatorName}</p>}
                        {project.evaluatorFormation && <p className="text-gray-600 mb-0.5 text-sm">{project.evaluatorFormation}</p>}
                        {project.evaluatorCompany   && <p className="text-gray-600 mb-0.5 text-sm">{project.evaluatorCompany}</p>}
                        {project.evaluatorCrefito   && <p className="text-gray-600 text-sm">{project.evaluatorCrefito}</p>}
                      </div>
                    </div>
                    {monthYear && (
                      <p className="text-center text-sm text-gray-500 mt-12 capitalize">{monthYear}</p>
                    )}
                  </section>

                  {/* ── Anexos ── */}
                  {hasAnnexes && (
                    <section id="aep-anexos" className="pdf-page px-12 py-14 print:break-before-page">
                      <h2>{anexosNum}. Anexos – Registros Fotográficos</h2>
                      {filteredFunctions.map((func) => {
                        if (!func.images?.length) return null;
                        return (
                          <div key={func.id} className="mt-6">
                            <h3>{func.name}</h3>
                            <div className="grid grid-cols-2 gap-4">
                              {func.images.map((img) => (
                                <div key={img.id} className="text-center">
                                  <img src={img.dataUrl} alt={img.caption}
                                    className="w-full h-auto rounded border border-gray-200" />
                                  {img.caption && <p className="text-xs text-gray-500 mt-1">{img.caption}</p>}
                                  <p className="text-xs text-gray-400 italic">{img.category}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </section>
                  )}

                </td>
              </tr>
            </tbody>
          </table>

        </div>
      </div>

      <style>{PDF_STYLES}</style>
    </>
  );
};
