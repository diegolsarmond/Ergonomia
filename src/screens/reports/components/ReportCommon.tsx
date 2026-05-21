import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer } from 'lucide-react';
import { auditoriaApi } from '../../../services/api';
import type { RiskLevel } from '../../../types';
import logo3 from '../../../assets/images/logo_3.png';

// ── Palette ──────────────────────────────────────────────────────────────────
export const PALETTE = {
  primary:   '#3D7268',
  dark:      '#2A5249',
  light:     '#E8F2F0',
  border:    '#BDD0CD',
  muted:     '#6B9B95',
  coverLine: '#9DBDB8',
};

// ── Color helpers ────────────────────────────────────────────────────────────

export function riskColor(classification: string): string {
  const c = (classification || '').toLowerCase();
  if (c.includes('alto') || c.includes('intolerável') || c.includes('grave') || c.includes('vermelho')) return '#dc2626';
  if (c.includes('substancial') || c.includes('laranja')) return '#ea580c';
  if (c.includes('moderado') || c.includes('amarelo')) return '#f59e0b';
  if (c.includes('baixo') || c.includes('tolerável') || c.includes('trivial') || c.includes('verde')) return '#22c55e';
  return '#6b7280';
}

export function riskLevelColor(level: RiskLevel | string): string {
  switch (level) {
    case 'BAIXO':      return '#22c55e';
    case 'MODERADO':   return '#f59e0b';
    case 'ALTO RISCO': return '#ea580c';
    case 'CRÍTICO':    return '#dc2626';
    default:           return '#6b7280';
  }
}

// ── useSectionPages ──────────────────────────────────────────────────────────
// Calculates which PDF page each section starts on by measuring DOM positions.

export function useSectionPages(
  containerRef: React.RefObject<HTMLElement | null>,
  sectionIds: string[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  deps: any[],
): Record<string, number> {
  const [pages, setPages] = React.useState<Record<string, number>>({});

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Recalculate after a paint so layout is stable
    const id = requestAnimationFrame(() => {
      const pageHeight = container.clientWidth * (297 / 210);
      const containerTop = container.getBoundingClientRect().top + window.scrollY;

      const result: Record<string, number> = {};
      for (const sid of sectionIds) {
        const el = document.getElementById(sid);
        if (el) {
          const elTop = el.getBoundingClientRect().top + window.scrollY - containerTop;
          result[sid] = Math.max(1, Math.floor(elTop / pageHeight) + 1);
        }
      }
      setPages(result);
    });
    return () => cancelAnimationFrame(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return pages;
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

export const TocLine: React.FC<{ num: string; title: string; indent?: boolean; page?: number }> = ({ num, title, indent, page }) => (
  <div className={`toc-line text-sm ${indent ? 'pl-6 text-gray-500' : 'font-medium'}`}
    style={{ color: indent ? '#6B9B95' : PALETTE.dark }}>
    <span className="shrink-0">{num}. {title}</span>
    <span className="toc-dots" />
    <span className="toc-page">{page ?? '—'}</span>
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
            <span className="text-sm font-medium" style={{ color: PALETTE.dark }}>{d.label}</span>
            <span className="text-sm font-bold" style={{ color: PALETTE.dark }}>{d.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

interface ReportToolbarProps {
  projectId: string;
  reportType?: 'AET' | 'AEP';
  projectName?: string;
}

export const ReportToolbar: React.FC<ReportToolbarProps> = ({ projectId, reportType, projectName }) => {
  const navigate = useNavigate();

  const handlePrint = async () => {
    const tabela = reportType === 'AEP' ? 'aep_projetos' : 'aet_projetos';
    const desc = `Impressão/PDF do projeto ${reportType ?? ''}: ${projectName ?? projectId}`;
    try {
      await auditoriaApi.registrar('IMPRESSÃO', tabela, projectId, desc);
    } catch {
      // falha silenciosa — não bloqueia a impressão
    }
    window.print();
  };

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
        onClick={handlePrint}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg text-white hover:opacity-90 transition-opacity w-full sm:w-auto justify-center"
        style={{ background: PALETTE.primary }}
      >
        <Printer className="w-4 h-4" />
        <span className="hidden sm:inline">Imprimir / PDF</span>
        <span className="sm:hidden">Imprimir</span>
      </button>
    </div>
  );
};

export const getPdfStyles = (footerLogoUrl?: string) => `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  @page { size: A4; margin: 20mm 15mm 22mm 15mm; }
  @page :first { margin: 0; }
  @page {
    ${footerLogoUrl ? `@bottom-left { content: url("${footerLogoUrl}"); vertical-align: middle; }` : ''}
    @bottom-right {
      content: "Página " counter(page) " / " counter(pages);
      font-family: 'Inter', 'Segoe UI', sans-serif;
      font-size: 8pt;
      color: #6b7280;
      vertical-align: middle;
    }
  }
  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .pdf-page { page-break-inside: avoid; }
    thead { display: table-header-group; }
    tfoot { display: table-footer-group; }
    .pdf-repeat-logo { display: flex !important; }
    .pdf-repeat-logo img { max-height: 18mm; max-width: 60mm; object-fit: contain; display: block; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .pdf-footer { display: flex !important; }
    .pdf-footer img { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
`;

/** @deprecated use getPdfStyles() */
export const PDF_STYLES = getPdfStyles() + `
  .pdf-preview { font-family: 'Inter', 'Segoe UI', sans-serif; color: #1E3530; line-height: 1.6; font-size: 1rem; }
  .pdf-preview :not(.pdf-cover) > h2 { font-size: 1.25rem; font-weight: 700; color: ${PALETTE.primary}; border-bottom: 2px solid ${PALETTE.border}; padding-bottom: .5rem; margin-top: 2rem; margin-bottom: 1.2rem; text-transform: uppercase; letter-spacing: .06em; }
  .pdf-preview :not(.pdf-cover) > h3 { font-size: 1.05rem; font-weight: 700; color: ${PALETTE.dark}; border-left: 3px solid ${PALETTE.primary}; padding-left: .55rem; margin-top: 1.5rem; margin-bottom: .5rem; }
  .pdf-preview :not(.pdf-cover) > h4 { font-size: .92rem; font-weight: 600; color: ${PALETTE.muted}; margin-top: 1rem; margin-bottom: .4rem; text-transform: uppercase; letter-spacing: .05em; }
  .pdf-preview .field { margin-bottom: .6rem; }
  .pdf-preview .field-label { font-weight: 600; font-size: .82rem; color: ${PALETTE.muted}; text-transform: uppercase; letter-spacing: .04em; }
  .pdf-preview .field-value { font-size: 1rem; color: #2A3D3A; white-space: pre-wrap; word-wrap: break-word; word-break: break-word; }
  .pdf-preview .field-value p { margin-bottom: 0.5rem; }
  .pdf-preview .ql-align-center { text-align: center; }
  .pdf-preview .ql-align-right { text-align: right; }
  .pdf-preview .ql-align-justify { text-align: justify; }
  .pdf-preview :not(.pdf-cover) table { width: 100%; border-collapse: collapse; font-size: .92rem; margin-top: .5rem; }
  .pdf-preview :not(.pdf-cover) th { background: ${PALETTE.light}; color: ${PALETTE.dark}; font-weight: 600; text-align: left; padding: .45rem .65rem; border: 1px solid ${PALETTE.border}; }
  .pdf-preview :not(.pdf-cover) td { padding: .45rem .65rem; border: 1px solid #D4E4E1; vertical-align: top; }
  .pdf-preview .toc-line { display: flex; align-items: flex-end; gap: .4rem; padding: .25rem 0; }
  .pdf-preview .toc-dots { flex: 1; border-bottom: 1px dotted ${PALETTE.border}; position: relative; top: -3px; }
  .pdf-preview .toc-page { font-size: .82rem; font-weight: 700; color: ${PALETTE.primary}; min-width: 1.5rem; text-align: right; flex-shrink: 0; }
  .pdf-cover { container-type: inline-size; width: 100%; aspect-ratio: 210 / 297; }
  @media print { .pdf-cover { width: 100% !important; height: 100vh !important; aspect-ratio: auto !important; page-break-after: always; } }
`;

// ── CoverPage ────────────────────────────────────────────────────────────────

interface CoverPageProps {
  titleLines: string[];
  companyLogoDataUrl?: string;
  consultoriaLogoDataUrl?: string;
  companyName: string;
  monthYear: string;
}

export const CoverPage: React.FC<CoverPageProps> = ({
  titleLines,
  companyLogoDataUrl,
  consultoriaLogoDataUrl,
  companyName,
  monthYear,
}) => (
  <section
    className="pdf-cover relative overflow-hidden print:break-after-page"
    style={{ fontFamily: "'Montserrat', 'Segoe UI', sans-serif", color: PALETTE.primary, background: '#fdfdfd' }}
  >
    {/* Top-right block */}
    <div style={{ position: 'absolute', top: 0, right: 0, width: '50%', height: '8%', background: PALETTE.primary }} />
    {/* Right vertical stripe — para acima da área do nome da empresa */}
    <div style={{ position: 'absolute', top: '8%', bottom: '55%', right: 0, width: '11%', background: PALETTE.primary }} />
    {/* Left vertical guide */}
    <div style={{ position: 'absolute', top: 0, bottom: 0, left: '6%', width: '1px', background: PALETTE.coverLine }} />
    {/* Top horizontal guide */}
    <div style={{ position: 'absolute', top: '8%', left: 0, right: '50%', height: '1px', background: PALETTE.coverLine }} />

    {/* Client logo */}
    <div style={{ position: 'absolute', top: '3%', left: '7.5%', width: '19cqw' }}>
      {companyLogoDataUrl
        ? <img src={companyLogoDataUrl} alt="Logomarca do Cliente" style={{ width: '100%', height: 'auto', objectFit: 'contain' }} />
        : <div style={{ width: '100%', aspectRatio: '2 / 1', background: PALETTE.light, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.55rem', color: PALETTE.muted }}>Logo Empresa</div>
      }
    </div>

    {/* Report title */}
    <div style={{ position: 'absolute', top: '18%', left: '6%', right: '11%', display: 'flex', justifyContent: 'center' }}>
      <h1 style={{ textAlign: 'center', fontWeight: 700, fontSize: '5.2cqw', lineHeight: 1.35, letterSpacing: '0.18em', color: PALETTE.primary, margin: 0 }}>
        {titleLines.map((line, i) => (
          <React.Fragment key={i}>{line}{i < titleLines.length - 1 && <br />}</React.Fragment>
        ))}
      </h1>
    </div>

    {/* Company name */}
    <div style={{ position: 'absolute', top: '45%', bottom: '33%', left: '17%', right: '11%', display: 'flex', alignItems: 'center' }}>
      <div style={{ position: 'relative', height: '100%', width: '2px', background: PALETTE.coverLine, marginRight: '4cqw' }}>
        <div style={{ position: 'absolute', left: '-3px', top: 0, width: '8px', height: '8px', background: PALETTE.coverLine }} />
        <div style={{ position: 'absolute', left: '-3px', bottom: 0, width: '8px', height: '8px', background: PALETTE.coverLine }} />
      </div>
      <h2 style={{ fontSize: '3.5cqw', fontWeight: 700, letterSpacing: '0.2em', color: PALETTE.primary, margin: 0, wordBreak: 'break-word', overflowWrap: 'break-word', whiteSpace: 'pre-wrap' }}>
        {companyName || 'EMPRESA CLIENTE'}
      </h2>
    </div>

    {/* Month / Year */}
    <div style={{ position: 'absolute', bottom: '18%', left: '6%', right: '11%', display: 'flex', justifyContent: 'center', fontWeight: 700, fontSize: '2.4cqw', letterSpacing: '0.2em', color: PALETTE.primary, textTransform: 'uppercase' }}>
      {monthYear || 'MÊS E ANO'}
    </div>

    {/* Bottom guide line — largura total pois a faixa não vai até o rodapé */}
    <div style={{ position: 'absolute', bottom: '6%', left: 0, right: 0, height: '1px', background: PALETTE.coverLine }} />

    {/* Consultoria logo / Ergominas brand */}
    <div style={{ position: 'absolute', bottom: '4.5%', left: '6%', right: '11%', display: 'flex', flexDirection: 'column', alignItems: 'center', pointerEvents: 'none' }}>
      {consultoriaLogoDataUrl
        ? <img src={consultoriaLogoDataUrl} alt="Logo consultoria" style={{ maxHeight: '30px', objectFit: 'contain' }} />
        : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5cqw' }}>
            <img src={logo3} alt="Ergominas" style={{ height: '4.5cqw', objectFit: 'contain', display: 'block' }} />
            <span style={{ fontWeight: 900, fontSize: '2.8cqw', letterSpacing: '0.1em', color: PALETTE.primary, transform: 'translateY(0.3cqw)' }}>ERGOMINAS</span>
          </div>
        )
      }
    </div>

    {/* Website URL */}
    <div style={{ position: 'absolute', bottom: '2%', left: '6%', right: '11%', display: 'flex', justifyContent: 'center', fontWeight: 500, fontSize: '1cqw', letterSpacing: '0.35em', color: PALETTE.primary }}>
      WWW.ERGOMINAS.COM.BR
    </div>
  </section>
);

// ── PageFooter ────────────────────────────────────────────────────────────────
// Rodapé repetido em todas as páginas do PDF (via <tfoot>), idêntico ao da capa.

interface PageFooterProps {
  consultoriaLogoDataUrl?: string;
}

export const PageFooter: React.FC<PageFooterProps> = ({ consultoriaLogoDataUrl }) => (
  <div
    className="pdf-footer hidden"
    style={{
      fontFamily: "'Montserrat', 'Segoe UI', sans-serif",
      borderTop: `1px solid ${PALETTE.coverLine}`,
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3mm 0 2mm',
      gap: '2px',
      width: '100%',
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
      {consultoriaLogoDataUrl
        ? <img src={consultoriaLogoDataUrl} alt="Logo consultoria" style={{ maxHeight: '20px', objectFit: 'contain', display: 'block' }} />
        : (
          <>
            <img src={logo3} alt="Ergominas" style={{ height: '18px', objectFit: 'contain', display: 'block' }} />
            <span style={{ fontWeight: 900, fontSize: '8pt', letterSpacing: '0.1em', color: PALETTE.primary }}>ERGOMINAS</span>
          </>
        )
      }
    </div>
    <span style={{ fontWeight: 500, fontSize: '5.5pt', letterSpacing: '0.3em', color: PALETTE.primary, textTransform: 'uppercase' }}>
      WWW.ERGOMINAS.COM.BR
    </span>
  </div>
);
