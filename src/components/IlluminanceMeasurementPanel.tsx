/**
 * Painel de medição de iluminância com malha interativa.
 *
 * Permite ao usuário:
 * - Configurar dimensões da malha (linhas × colunas)
 * - Inserir valores de lux em cada ponto
 * - Marcar pontos como N/A
 * - Selecionar tipo de ambiente e parâmetro normativo
 * - Visualizar cálculos automáticos e resultado da avaliação
 */
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Card, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { FormGroup, Input, Textarea, Select } from './ui/Forms';
import {
  Plus, Trash2, Grid3X3, Calculator, CheckCircle2, XCircle,
  AlertTriangle, Sun, Save, ChevronDown, ChevronUp, Copy,
} from 'lucide-react';
import { useAET } from '../context/AETContext';
import type { IlluminanceMeasurement } from '../types';
import type { IlluminanceNormativeParameter, MeasurementRowType } from '../domain/illuminance/illuminanceTypes';
import {
  createEmptyIlluminanceMeasurement,
  generateFixedRows,
  GEOMETRY_LABELS,
} from '../domain/illuminance/illuminanceTypes';
import { calculateAndEvaluate } from '../domain/illuminance/illuminanceCalculator';

const MAX_COLS = 8;

// ── Sub-components ───────────────────────────────────────────────────────────

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const colors: Record<string, string> = {
    'Adequado': 'bg-emerald-100 text-emerald-800 border-emerald-300',
    'Inadequado': 'bg-red-100 text-red-800 border-red-300',
    'Atenção/Revisar': 'bg-amber-100 text-amber-800 border-amber-300',
  };
  const icons: Record<string, React.ReactNode> = {
    'Adequado': <CheckCircle2 className="w-4 h-4" />,
    'Inadequado': <XCircle className="w-4 h-4" />,
    'Atenção/Revisar': <AlertTriangle className="w-4 h-4" />,
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold border ${colors[status] || 'bg-slate-100 text-slate-600 border-slate-300'}`}>
      {icons[status]} {status || '—'}
    </span>
  );
};

const MetricCard: React.FC<{ label: string; value: string | number; unit?: string; highlight?: boolean; warning?: boolean }> = ({ label, value, unit = 'lux', highlight, warning }) => (
  <div className={`p-3 rounded-xl border ${warning ? 'bg-red-50 border-red-200' : highlight ? 'bg-teal-50 border-teal-200' : 'bg-slate-50 border-slate-200'}`}>
    <p className="text-[11px] text-slate-500 font-medium mb-0.5">{label}</p>
    <p className={`text-lg font-bold ${warning ? 'text-red-700' : highlight ? 'text-teal-700' : 'text-slate-800'}`}>
      {value} <span className="text-xs font-normal text-slate-400">{unit}</span>
    </p>
  </div>
);

// ── Main Component ───────────────────────────────────────────────────────────

interface Props {
  measurements: IlluminanceMeasurement[];
  onChange: (measurements: IlluminanceMeasurement[]) => void;
}

export const IlluminanceMeasurementPanel: React.FC<Props> = ({ measurements, onChange }) => {
  const { illuminanceNormativeParams } = useAET();
  const [expandedId, setExpandedId] = useState<string | null>(
    measurements.length > 0 ? measurements[0].id : null
  );

  // ── CRUD ──────────────────────────────────────────────────────────────────

  const addMeasurement = () => {
    const newMeasurement = createEmptyIlluminanceMeasurement(uuidv4());
    const updated = [...measurements, newMeasurement];
    onChange(updated);
    setExpandedId(newMeasurement.id);
  };

  const removeMeasurement = (id: string) => {
    onChange(measurements.filter(m => m.id !== id));
    if (expandedId === id) setExpandedId(null);
  };

  const updateMeasurement = useCallback((id: string, patch: Partial<IlluminanceMeasurement>) => {
    onChange(measurements.map(m => m.id === id ? { ...m, ...patch, updatedAt: new Date().toISOString() } : m));
  }, [measurements, onChange]);

  const duplicateMeasurement = (id: string) => {
    const src = measurements.find(m => m.id === id);
    if (!src) return;
    const dup: IlluminanceMeasurement = {
      ...JSON.parse(JSON.stringify(src)),
      id: uuidv4(),
      environment: `${src.environment} (Cópia)`,
      formStatus: 'rascunho',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      changeHistory: [],
    };
    onChange([...measurements, dup]);
    setExpandedId(dup.id);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Sun className="w-5 h-5 text-amber-500" />
          <h3 className="text-sm font-semibold text-slate-700">Medições de Iluminância</h3>
          <span className="text-xs text-slate-400">({measurements.length})</span>
        </div>
        <Button variant="ghost" onClick={addMeasurement} className="border border-dashed border-amber-400 text-amber-600 hover:bg-amber-50 w-full sm:w-auto">
          <Plus className="w-4 h-4" /> Nova Medição
        </Button>
      </div>

      {measurements.length === 0 && (
        <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
          <Sun className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-400">Nenhuma medição de iluminância cadastrada.</p>
          <p className="text-xs text-slate-400 mt-1">Clique em "Nova Medição" para adicionar.</p>
        </div>
      )}

      {measurements.map((m, idx) => (
        <MeasurementCard
          key={m.id}
          measurement={m}
          index={idx}
          expanded={expandedId === m.id}
          onToggle={() => setExpandedId(expandedId === m.id ? null : m.id)}
          onUpdate={(patch) => updateMeasurement(m.id, patch)}
          onRemove={() => removeMeasurement(m.id)}
          onDuplicate={() => duplicateMeasurement(m.id)}
          normativeParams={illuminanceNormativeParams}
        />
      ))}
    </div>
  );
};

// ── Individual Measurement Card ──────────────────────────────────────────────

interface MeasurementCardProps {
  measurement: IlluminanceMeasurement;
  index: number;
  expanded: boolean;
  onToggle: () => void;
  onUpdate: (patch: Partial<IlluminanceMeasurement>) => void;
  onRemove: () => void;
  onDuplicate: () => void;
  normativeParams: IlluminanceNormativeParameter[];
}

const MeasurementCard: React.FC<MeasurementCardProps> = ({
  measurement: m, index, expanded, onToggle, onUpdate, onRemove, onDuplicate, normativeParams,
}) => {
  const N = m.gridParameters.N;
  const M = m.gridParameters.M;

  // ── Calculation ───────────────────────────────────────────────────────────

  const selectedNorm = useMemo(
    () => normativeParams.find(n => n.id === m.normativeParameterId) ?? null,
    [normativeParams, m.normativeParameterId]
  );

  const { calculation, evaluation } = useMemo(
    () => calculateAndEvaluate(m.measurementRows, m.recommendedMinLux, selectedNorm, m.gridParameters),
    [m.measurementRows, m.recommendedMinLux, selectedNorm, m.gridParameters]
  );

  useEffect(() => {
    const calcChanged = JSON.stringify(calculation) !== JSON.stringify(m.calculationResult);
    const evalChanged = JSON.stringify(evaluation) !== JSON.stringify(m.evaluationResult);
    if (calcChanged || evalChanged) onUpdate({ calculationResult: calculation, evaluationResult: evaluation });
  }, [calculation, evaluation]);

  // ── Helpers ───────────────────────────────────────────────────────────────

  const getRow = (type: MeasurementRowType) => m.measurementRows.find(r => r.rowType === type);

  const rowAvg = (type: MeasurementRowType): number | null => {
    const row = getRow(type);
    if (!row) return null;
    const vals = row.values.filter((v, i): v is number =>
      v !== null && !(row.naFlags?.[i] ?? false)
    );
    return vals.length > 0 ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : null;
  };

  const updateCell = (type: MeasurementRowType, col: number, value: number | null) => {
    onUpdate({
      measurementRows: m.measurementRows.map(row =>
        row.rowType !== type ? row
          : { ...row, values: row.values.map((v, i) => i === col ? value : v) }
      ),
    });
  };

  const toggleNA = (type: MeasurementRowType, col: number) => {
    onUpdate({
      measurementRows: m.measurementRows.map(row => {
        if (row.rowType !== type) return row;
        const flags = [...(row.naFlags ?? new Array(MAX_COLS).fill(false))];
        flags[col] = !flags[col];
        const values = row.values.map((v, i) => (i === col && flags[col] ? null : v));
        return { ...row, naFlags: flags, values };
      }),
    });
  };

  const handleNormativeSelect = (normId: string) => {
    const norm = normativeParams.find(n => n.id === normId);
    onUpdate({
      normativeParameterId: normId,
      environmentType: norm?.activityDescription ?? m.environmentType,
      recommendedMinLux: norm?.minimumLux ?? m.recommendedMinLux,
      ircRa: norm ? String(norm.minimumIRC) : m.ircRa,
    });
  };

  const statusLabel = evaluation?.status || (m.formStatus === 'rascunho' ? 'Rascunho' : '');

  // ── Grid row renderer (inline — keeps input focus across re-renders) ───────

  const renderGridRow = (
    type: MeasurementRowType,
    label: string,
    summaryLabel: string,
    paramLabel?: string,
    paramValue?: number,
    onParamChange?: (v: number) => void,
  ) => {
    const row = getRow(type);
    const avg = rowAvg(type);
    return (
      <React.Fragment key={type}>
        {/* Label row */}
        <tr className="bg-slate-700 text-white">
          {Array.from({ length: MAX_COLS }, (_, c) => (
            <td key={c} className="px-2 py-1 text-center text-xs font-semibold border border-slate-600">
              {label}{c + 1}
            </td>
          ))}
          <td className="px-3 py-1 text-center text-xs font-bold border border-slate-600 bg-slate-600 min-w-[56px]">{summaryLabel}</td>
          <td className="px-3 py-1 text-center text-xs font-bold border border-slate-600 bg-slate-600 min-w-[56px]">{paramLabel ?? ''}</td>
        </tr>
        {/* Value row */}
        <tr className="bg-white">
          {Array.from({ length: MAX_COLS }, (_, c) => {
            const val = row?.values[c] ?? null;
            const isNA = row?.naFlags?.[c] ?? false;
            const below = !isNA && calculation && val !== null
              && calculation.seventyPercentAverage > 0
              && val < calculation.seventyPercentAverage;
            return (
              <td key={c} className="p-0.5 border border-slate-200">
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    value={isNA ? '' : (val ?? '')}
                    disabled={isNA}
                    onChange={e => updateCell(type, c, e.target.value === '' ? null : Number(e.target.value))}
                    placeholder={isNA ? 'N/A' : '—'}
                    className={`w-full min-w-[60px] rounded border-0 px-2 py-1.5 text-xs text-center focus:outline-none focus:ring-1 transition-colors ${
                      isNA   ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : below ? 'bg-red-50 text-red-700 focus:ring-red-400'
                              : 'bg-white focus:ring-teal-400'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => toggleNA(type, c)}
                    title={isNA ? 'Tornar aplicável' : 'Marcar como N/A'}
                    className={`absolute -top-1 -right-1 w-4 h-4 rounded-full text-[8px] font-bold flex items-center justify-center transition-colors cursor-pointer ${
                      isNA ? 'bg-slate-400 text-white' : 'bg-slate-200 text-slate-400 hover:bg-amber-300 hover:text-amber-800'
                    }`}
                  >
                    {isNA ? '✕' : '—'}
                  </button>
                </div>
              </td>
            );
          })}
          <td className="px-3 py-1.5 text-center text-sm font-bold text-blue-700 border border-slate-200 bg-slate-50">
            {avg ?? '—'}
          </td>
          <td className="p-0.5 border border-slate-200 bg-slate-50">
            {onParamChange ? (
              <input
                type="number"
                min={1}
                value={paramValue ?? ''}
                onChange={e => onParamChange(Number(e.target.value) || 1)}
                className="w-full text-center text-sm font-bold text-slate-700 bg-transparent focus:outline-none focus:ring-1 focus:ring-teal-400 rounded"
              />
            ) : null}
          </td>
        </tr>
      </React.Fragment>
    );
  };

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-3 bg-gradient-to-r from-slate-50 to-amber-50/30 hover:from-slate-100 hover:to-amber-50/50 transition-all cursor-pointer"
      >
        <div className="flex items-center gap-3 text-left w-full sm:w-auto">
          <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
            <Sun className="w-4 h-4 text-amber-600" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-700 truncate">
              Medição {index + 1}{m.environment ? ` — ${m.environment}` : ''}
            </p>
            <p className="text-[11px] text-slate-400">
              {m.environmentType || 'Tipo não definido'} · N={N} · M={M}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto mt-2 sm:mt-0">
          {statusLabel && <StatusBadge status={statusLabel} />}
          {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </button>

      {/* Body */}
      {expanded && (
        <div className="p-4 space-y-5 border-t border-slate-100">
          {/* Actions bar */}
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={onDuplicate} className="text-slate-500">
              <Copy className="w-3.5 h-3.5" /> Duplicar
            </Button>
            <Button variant="ghost" size="sm" onClick={onRemove} className="text-red-500">
              <Trash2 className="w-3.5 h-3.5" /> Remover
            </Button>
          </div>

          {/* ── Dados gerais ── */}
          <FormGroup label="Ambiente" required>
            <Input value={m.environment} onChange={e => onUpdate({ environment: e.target.value })} placeholder="Ex: Escritório Administrativo" />
          </FormGroup>

          {/* ── Geometria do ambiente ── */}
          <FormGroup label="Configuração do ambiente (define fórmula do IM)" required>
            <Select
              value={m.gridParameters.geometryType}
              onChange={e => onUpdate({ gridParameters: { ...m.gridParameters, geometryType: e.target.value as any } })}
            >
              {(Object.entries(GEOMETRY_LABELS) as [string, string][]).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </Select>
          </FormGroup>

          <FormGroup label="Tipo de Ambiente / Atividade">
            <Select value={m.normativeParameterId} onChange={e => handleNormativeSelect(e.target.value)}>
              <option value="">Selecione ou digite manualmente...</option>
              {normativeParams.filter(n => n.active).map(n => (
                <option key={n.id} value={n.id}>{n.activityDescription} ({n.minimumLux} lux)</option>
              ))}
            </Select>
          </FormGroup>

          {m.gridParameters.geometryType === 'A6' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormGroup label="W — Pontos na largura (> 8)">
                <Input type="number" min={9} value={m.gridParameters.W || ''} onChange={e => onUpdate({ gridParameters: { ...m.gridParameters, W: Number(e.target.value) || 0 } })} placeholder="Ex: 16" />
              </FormGroup>
              <FormGroup label="L — Pontos no comprimento (> 8)">
                <Input type="number" min={9} value={m.gridParameters.L || ''} onChange={e => onUpdate({ gridParameters: { ...m.gridParameters, L: Number(e.target.value) || 0 } })} placeholder="Ex: 16" />
              </FormGroup>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormGroup label="Lux Mínimo Recomendado" required>
              <Input type="number" min={0} value={m.recommendedMinLux || ''} onChange={e => onUpdate({ recommendedMinLux: Number(e.target.value) || 0 })} placeholder="Ex: 500" />
            </FormGroup>
            <FormGroup label="IRC/Ra">
              <Input value={m.ircRa} onChange={e => onUpdate({ ircRa: e.target.value })} placeholder="Ex: 80" />
            </FormGroup>
            <FormGroup label="Data da Medição">
              <Input type="date" value={m.measurementDate} onChange={e => onUpdate({ measurementDate: e.target.value })} />
            </FormGroup>
          </div>

          {/* ── Malha de medição ── */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Grid3X3 className="w-4 h-4 text-slate-500" />
              <h4 className="text-sm font-semibold text-slate-700">Malha de Medição</h4>
              {calculation && <span className="text-[10px] bg-teal-50 text-teal-600 px-2 py-0.5 rounded-full font-medium">Vermelho = abaixo de 70% da média · "—" marca N/A</span>}
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto text-teal-700 border border-teal-300 hover:bg-teal-50"
                onClick={() => {
                  onUpdate({
                    measurementRows: m.measurementRows.map(row => {
                      const flags: boolean[] = [...(row.naFlags ?? new Array<boolean>(MAX_COLS).fill(false))];
                      const values = row.values.map((v: number | null, i: number) => {
                        if (v === null && !flags[i]) { flags[i] = true; }
                        return v;
                      });
                      return { ...row, values, naFlags: flags };
                    }),
                  });
                }}
              >
                <Save className="w-3.5 h-3.5" /> Salvar Malha
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="border-collapse text-sm">
                <tbody>
                  {renderGridRow('r', 'r', 'R', 'N', N, (v) => {
                    const n = Math.min(Math.max(1, v), MAX_COLS);
                    const newRows = generateFixedRows(n).map(nr => {
                      const old = getRow(nr.rowType);
                      return old ? { ...nr, values: old.values.slice(), naFlags: old.naFlags?.slice() } : nr;
                    });
                    onUpdate({ gridParameters: { ...m.gridParameters, N: n }, measurementRows: newRows });
                  })}
                  {renderGridRow('q', 'q', 'Q', 'M', M, (v) =>
                    onUpdate({ gridParameters: { ...m.gridParameters, M: Math.max(1, v) } })
                  )}
                  {renderGridRow('p', 'p', 'P')}
                  {renderGridRow('t', 't', 'T')}
                </tbody>
              </table>
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5">N = luminárias/fila · M = número de filas</p>
          </div>

          {/* ── Cálculos automáticos ── */}
          {calculation && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Calculator className="w-4 h-4 text-teal-500" />
                <h4 className="text-sm font-semibold text-slate-700">Cálculos Automáticos</h4>
                <span className="text-[10px] bg-teal-50 text-teal-600 px-2 py-0.5 rounded-full font-medium">AUTO</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <MetricCard label="Pontos Medidos" value={calculation.measuredPointsCount} unit="pts" />
                <MetricCard label="Iluminância Média (Emed)" value={calculation.averageLux} highlight />
                <MetricCard label="Menor Valor" value={calculation.minLux} warning={!evaluation?.seventyPercentCheck} />
                <MetricCard label="Maior Valor" value={calculation.maxLux} />
                <MetricCard label="70% da Média" value={calculation.seventyPercentAverage} />
                <MetricCard label={`Tolerância (${selectedNorm?.tolerancePercent ?? 10}%)`} value={calculation.toleranceMinLux} />
                <MetricCard label="Uniformidade (máx/mín)" value={`${calculation.uniformityRatio}:1`} unit="" warning={!evaluation?.uniformityCheck} />
                <MetricCard label="Área de Tarefa (T)" value={calculation.taskAreaValue || '—'} unit={calculation.taskAreaValue ? 'lux' : ''} />
              </div>
            </div>
          )}

          {/* ── Resultado da avaliação ── */}
          {evaluation && (
            <div className={`p-4 rounded-xl border-2 ${
              evaluation.status === 'Adequado' ? 'bg-emerald-50/50 border-emerald-200'
                : evaluation.status === 'Inadequado' ? 'bg-red-50/50 border-red-200'
                : 'bg-amber-50/50 border-amber-200'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-slate-700">Situação Final</h4>
                <StatusBadge status={evaluation.status} />
              </div>
              <p className="text-sm text-slate-600 mb-2">{evaluation.interpretationText}</p>
              {evaluation.issues.length > 0 && (
                <ul className="space-y-1">
                  {evaluation.issues.map((issue, i) => (
                    <li key={i} className="text-xs text-red-600 flex items-start gap-1.5">
                      <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
                      {issue}
                    </li>
                  ))}
                </ul>
              )}
              {selectedNorm?.normativeNotes && (
                <p className="text-xs text-slate-500 mt-2 italic">Obs.: {selectedNorm.normativeNotes}</p>
              )}
            </div>
          )}

          {/* ── Imagem/esquema ── */}
          <FormGroup label="Imagem/Esquema da Malha de Medição (opcional)">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <label className="inline-flex items-center gap-2 px-4 py-2 bg-teal-50 text-teal-700 rounded-lg border border-teal-200 hover:bg-teal-100 transition-colors text-sm font-medium cursor-pointer">
                  <Sun className="w-4 h-4" /> {m.gridSchemaImageDataUrl ? 'Trocar Imagem' : 'Adicionar Imagem'}
                  <input type="file" accept="image/*" className="hidden" onChange={e => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = ev => onUpdate({ gridSchemaImageDataUrl: ev.target?.result as string });
                    reader.readAsDataURL(file);
                    e.target.value = '';
                  }} />
                </label>
                {m.gridSchemaImageDataUrl && (
                  <button type="button" onClick={() => onUpdate({ gridSchemaImageDataUrl: '' })} className="text-xs text-red-500 hover:text-red-700 transition-colors cursor-pointer">
                    Remover
                  </button>
                )}
              </div>
              {m.gridSchemaImageDataUrl && (
                <img src={m.gridSchemaImageDataUrl} alt="Esquema da malha" className="max-h-48 rounded-lg border border-slate-200 object-contain" />
              )}
            </div>
          </FormGroup>

          {/* ── Observações ── */}
          <FormGroup label="Observações">
            <Textarea value={m.observations} onChange={e => onUpdate({ observations: e.target.value })} rows={3} placeholder="Observações adicionais sobre a medição..." />
          </FormGroup>

          {/* ── Status do formulário ── */}
          <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
            <span className="text-xs text-slate-500">Status:</span>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name={`status-${m.id}`} checked={m.formStatus === 'rascunho'} onChange={() => onUpdate({ formStatus: 'rascunho' })} />
              <span className="text-xs text-slate-600">Rascunho</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name={`status-${m.id}`} checked={m.formStatus === 'finalizado'} onChange={() => onUpdate({ formStatus: 'finalizado' })} />
              <span className="text-xs text-slate-600">Finalizado</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};
