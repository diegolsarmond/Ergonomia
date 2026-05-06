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
import type { IlluminanceNormativeParameter } from '../domain/illuminance/illuminanceTypes';
import {
  createEmptyIlluminanceMeasurement,
  createEmptyGridPoints,
} from '../domain/illuminance/illuminanceTypes';
import { calculateAndEvaluateFromGridPoints } from '../domain/illuminance/illuminanceCalculator';

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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sun className="w-5 h-5 text-amber-500" />
          <h3 className="text-sm font-semibold text-slate-700">Medições de Iluminância</h3>
          <span className="text-xs text-slate-400">({measurements.length})</span>
        </div>
        <Button variant="ghost" onClick={addMeasurement} className="border border-dashed border-amber-400 text-amber-600 hover:bg-amber-50">
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
  // ── Auto-calculate on changes ─────────────────────────────────────────────

  const selectedNorm = useMemo(
    () => normativeParams.find(n => n.id === m.normativeParameterId) ?? null,
    [normativeParams, m.normativeParameterId]
  );

  const { calculation, evaluation } = useMemo(
    () => calculateAndEvaluateFromGridPoints(m.gridPoints, m.recommendedMinLux, selectedNorm),
    [m.gridPoints, m.recommendedMinLux, selectedNorm]
  );

  // Sync calculated results into measurement whenever they change
  useEffect(() => {
    const calcChanged = JSON.stringify(calculation) !== JSON.stringify(m.calculationResult);
    const evalChanged = JSON.stringify(evaluation) !== JSON.stringify(m.evaluationResult);
    if (calcChanged || evalChanged) {
      onUpdate({ calculationResult: calculation, evaluationResult: evaluation });
    }
  }, [calculation, evaluation]);

  // ── Grid resize ───────────────────────────────────────────────────────────

  const handleGridResize = (rows: number, cols: number) => {
    const r = Math.max(1, Math.min(20, rows));
    const c = Math.max(1, Math.min(20, cols));
    onUpdate({
      gridConfig: { rows: r, cols: c },
      gridPoints: createEmptyGridPoints(r, c),
    });
  };

  // ── Grid point update ─────────────────────────────────────────────────────

  const updatePoint = (row: number, col: number, lux: number | null, notApplicable: boolean) => {
    const newPoints = m.gridPoints.map(p =>
      p.row === row && p.col === col ? { ...p, lux, notApplicable } : p
    );
    onUpdate({ gridPoints: newPoints });
  };

  // ── Apply normative param ─────────────────────────────────────────────────

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

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-slate-50 to-amber-50/30 hover:from-slate-100 hover:to-amber-50/50 transition-all cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center">
            <Sun className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-slate-700">
              Medição {index + 1}{m.environment ? ` — ${m.environment}` : ''}
            </p>
            <p className="text-[11px] text-slate-400">
              {m.environmentType || 'Tipo não definido'} · {m.gridConfig.rows}×{m.gridConfig.cols} pontos
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
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
          <div className="grid grid-cols-2 gap-4">
            <FormGroup label="Ambiente" required>
              <Input value={m.environment} onChange={e => onUpdate({ environment: e.target.value })} placeholder="Ex: Escritório Administrativo" />
            </FormGroup>
            <FormGroup label="Tipo de Ambiente / Atividade">
              <Select
                value={m.normativeParameterId}
                onChange={e => handleNormativeSelect(e.target.value)}
              >
                <option value="">Selecione ou digite manualmente...</option>
                {normativeParams.filter(n => n.active).map(n => (
                  <option key={n.id} value={n.id}>{n.activityDescription} ({n.minimumLux} lux)</option>
                ))}
              </Select>
            </FormGroup>
          </div>
          <div className="grid grid-cols-3 gap-4">
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
            </div>
            <div className="flex items-center gap-4 mb-3">
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-500">Linhas:</label>
                <input type="number" min={1} max={20} value={m.gridConfig.rows}
                  onChange={e => handleGridResize(Number(e.target.value), m.gridConfig.cols)}
                  className="w-16 rounded-lg border border-slate-200 px-2 py-1 text-sm text-center focus:border-teal-500 focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-500">Colunas:</label>
                <input type="number" min={1} max={20} value={m.gridConfig.cols}
                  onChange={e => handleGridResize(m.gridConfig.rows, Number(e.target.value))}
                  className="w-16 rounded-lg border border-slate-200 px-2 py-1 text-sm text-center focus:border-teal-500 focus:outline-none"
                />
              </div>
              <span className="text-xs text-slate-400">({m.gridConfig.rows * m.gridConfig.cols} pontos)</span>
            </div>

            {/* Grid table */}
            <div className="overflow-x-auto">
              <table className="border-collapse text-sm">
                <thead>
                  <tr>
                    <th className="p-1.5 text-xs text-slate-400 font-medium"></th>
                    {Array.from({ length: m.gridConfig.cols }, (_, c) => (
                      <th key={c} className="p-1.5 text-xs text-slate-500 font-medium text-center min-w-[72px]">c{c + 1}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: m.gridConfig.rows }, (_, r) => (
                    <tr key={r}>
                      <td className="p-1.5 text-xs text-slate-500 font-medium">r{r + 1}</td>
                      {Array.from({ length: m.gridConfig.cols }, (_, c) => {
                        const point = m.gridPoints.find(p => p.row === r && p.col === c);
                        const isNA = point?.notApplicable ?? false;
                        const val = point?.lux;
                        const isBelowThreshold = calculation && val !== null && !isNA && calculation.seventyPercentAverage > 0 && val < calculation.seventyPercentAverage;
                        return (
                          <td key={c} className="p-0.5">
                            <div className="relative">
                              <input
                                type="number"
                                min={0}
                                value={isNA ? '' : (val ?? '')}
                                disabled={isNA}
                                onChange={e => {
                                  const v = e.target.value === '' ? null : Number(e.target.value);
                                  updatePoint(r, c, v, false);
                                }}
                                placeholder={isNA ? 'N/A' : '—'}
                                className={`w-full rounded-lg border px-2 py-1.5 text-xs text-center focus:outline-none focus:ring-1 transition-colors ${
                                  isNA ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                                    : isBelowThreshold ? 'bg-red-50 border-red-300 text-red-700 focus:ring-red-400'
                                    : 'border-slate-200 focus:border-teal-500 focus:ring-teal-400'
                                }`}
                              />
                              <button
                                type="button"
                                onClick={() => updatePoint(r, c, null, !isNA)}
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5">
              Clique no botão "—" no canto de cada célula para marcar/desmarcar como N/A. Pontos em vermelho estão abaixo de 70% da média.
            </p>
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
                <MetricCard label="Pontos Medidos" value={calculation.measuredPointsCount} unit={`de ${calculation.totalPointsCount}`} />
                <MetricCard label="Iluminância Média (Emed)" value={calculation.averageLux} highlight />
                <MetricCard label="Menor Valor" value={calculation.minLux} warning={!evaluation?.allPointsAboveMinimum} />
                <MetricCard label="Maior Valor" value={calculation.maxLux} />
                <MetricCard label="70% da Média" value={calculation.seventyPercentAverage} />
                <MetricCard label={`Tolerância (${selectedNorm?.tolerancePercent ?? 10}%)`} value={calculation.toleranceMinLux} />
                <MetricCard label="Uniformidade (máx/mín)" value={`${calculation.uniformityRatioMaxMin}:1`} unit="" warning={!evaluation?.uniformityIsAdequate} />
                <MetricCard label="Uniformidade (mín/méd)" value={calculation.uniformityRatioMinAvg} unit="" />
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
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = ev => onUpdate({ gridSchemaImageDataUrl: ev.target?.result as string });
                      reader.readAsDataURL(file);
                      e.target.value = '';
                    }}
                  />
                </label>
                {m.gridSchemaImageDataUrl && (
                  <button
                    type="button"
                    onClick={() => onUpdate({ gridSchemaImageDataUrl: '' })}
                    className="text-xs text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                  >
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
