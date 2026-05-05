import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer } from 'lucide-react';
import type { RiskLevel } from '../../../types';

// ── Color helpers ────────────────────────────────────────────────────────────

/** Free-text matching — used by legacy AET fields (riskClassification, riskLevel strings). */
export function riskColor(classification: string): string {
  const c = (classification || '').toLowerCase();
  if (c.includes('alto') || c.includes('intolerável') || c.includes('grave') || c.includes('vermelho')) return '#dc2626';
  if (c.includes('substancial') || c.includes('laranja')) return '#ea580c';
  if (c.includes('moderado') || c.includes('amarelo')) return '#f59e0b';
  if (c.includes('baixo') || c.includes('tolerável') || c.includes('trivial') || c.includes('verde')) return '#22c55e';
  return '#6b7280';
}

/** Exact match for typed RiskLevel — used by ErgonomicRisk.riskLevel. */
export function riskLevelColor(level: RiskLevel | string): string {
  switch (level) {
    case 'BAIXO':      return '#22c55e';
    case 'MODERADO':   return '#f59e0b';
    case 'ALTO RISCO': return '#ea580c';
    case 'CRÍTICO':    return '#dc2626';
    default:           return '#6b7280';
  }
}

// ── Shared sub-components ────────────────────────────────────────────────────

export const Field = ({ label, value }: { label: string; value: string | number | undefined | null }) => {
  if (value === undefined || value === null || value === '') return null;
  return (
    <div className="field">
      {label && <div className="field-label">{label}</div>}
      <div className="field-value">{value}</div>
    </div>
  );
};

export const TocLine: React.FC<{ num: string; title: string; indent?: boolean }> = ({ num, title, indent }) => (
  <div className={`toc-line text-sm ${indent ? 'pl-6 text-gray-500' : 'font-medium text-gray-700'}`}>
    <span className="shrink-0">{num}. {title}</span>
    <span className="toc-dots" />
  </div>
);

export const PieChart = ({ data }: { data: { label: string; pct: number; color: string }[] }) => {
  let currentAngle = 0;
  const filteredData = data.filter(d => d.pct > 0);
  if (filteredData.length === 0) return null;

  return (
    <div className="flex items-center gap-10">
      <svg viewBox="-1 -1 2 2" className="w-40 h-40 transform -rotate-90">
        {filteredData.map((d, i) => {
          if (d.pct === 100) return <circle key={i} r="1" cx="0" cy="0" fill={d.color} />;
          const startAngle = currentAngle;
          const angle = (d.pct / 100) * Math.PI * 2;
          currentAngle += angle;
          const x1 = Math.cos(startAngle), y1 = Math.sin(startAngle);
          const x2 = Math.cos(currentAngle), y2 = Math.sin(currentAngle);
          const largeArcFlag = d.pct > 50 ? 1 : 0;
          const pathData = `M 0 0 L ${x1} ${y1} A 1 1 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
          return <path key={i} d={pathData} fill={d.color} />;
        })}
      </svg>
      <div className="flex flex-col gap-3">
        {filteredData.map((d, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: d.color }} />
            <span className="text-sm font-medium text-gray-700">{d.label}</span>
            <span className="text-sm font-bold text-gray-900">{d.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const ReportToolbar = ({ projectId }: { projectId: string }) => {
  const navigate = useNavigate();
  return (
    <div className="print:hidden sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-gray-200 px-4 sm:px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
      <button
        onClick={() => navigate(`/project/${projectId}`)}
        className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors self-start sm:self-auto"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="hidden sm:inline">Voltar ao Projeto</span>
        <span className="sm:hidden">Voltar</span>
      </button>
      <button
        onClick={() => window.print()}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition-colors w-full sm:w-auto justify-center"
      >
        <Printer className="w-4 h-4" />
        <span className="hidden sm:inline">Imprimir / PDF</span>
        <span className="sm:hidden">Imprimir</span>
      </button>
    </div>
  );
};

export const PDF_STYLES = `
  @page { size: A4; margin: 20mm 15mm 25mm 15mm; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } .pdf-page { page-break-inside: avoid; } }
  .pdf-preview { font-family: 'Inter', 'Segoe UI', sans-serif; color: #1f2937; line-height: 1.6; }
  .pdf-preview h2 { font-size: 1.25rem; font-weight: 700; color: #0d9488; border-bottom: 2px solid #e5e7eb; padding-bottom: .5rem; margin-bottom: 1.5rem; margin-top: 1.5rem; }
  .pdf-preview h3 { font-size: 1rem; font-weight: 600; color: #374151; padding-top: 1.5rem; margin-top: 0; margin-bottom: .35rem; }
  .pdf-preview h4 { font-size: .9rem; font-weight: 600; color: #6b7280; padding-top: 1rem; margin-top: 0; margin-bottom: .25rem; text-transform: uppercase; letter-spacing: .03em; }
  .pdf-preview .field { margin-bottom: .6rem; }
  .pdf-preview .field-label { font-weight: 600; font-size: .75rem; color: #9ca3af; text-transform: uppercase; letter-spacing: .04em; }
  .pdf-preview .field-value { font-size: .9rem; color: #374151; white-space: pre-wrap; }
  .pdf-preview table { width: 100%; border-collapse: collapse; font-size: .82rem; margin-top: .5rem; }
  .pdf-preview th { background: #f0fdfa; color: #0d9488; font-weight: 600; text-align: left; padding: .45rem .65rem; border: 1px solid #e5e7eb; }
  .pdf-preview td { padding: .45rem .65rem; border: 1px solid #e5e7eb; vertical-align: top; }
  .pdf-preview .toc-line { display: flex; align-items: flex-end; gap: .5rem; padding: .2rem 0; }
  .pdf-preview .toc-dots { flex: 1; border-bottom: 1px dotted #d1d5db; position: relative; top: -3px; }
`;
