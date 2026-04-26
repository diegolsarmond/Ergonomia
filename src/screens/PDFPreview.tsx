import React, { useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAET } from '../context/AETContext';
import { ArrowLeft, Printer, Download } from 'lucide-react';
import { AETFunction, AETImprovement } from '../types';

/**
 * Full-screen PDF-ready preview of an AET project.
 * Renders outside the main Layout so it can occupy the entire viewport.
 */
export const PDFPreview = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getProject } = useAET();
  const project = getProject(id!);
  const previewRef = useRef<HTMLDivElement>(null);

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-500 text-lg">Projeto não encontrado.</p>
      </div>
    );
  }

  const handlePrint = () => window.print();

  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AET_${project.companyName.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const riskColor = (classification: string) => {
    const c = (classification || '').toLowerCase();
    if (c.includes('alto') || c.includes('intolerável') || c.includes('grave')) return '#dc2626';
    if (c.includes('moderado') || c.includes('substancial')) return '#f59e0b';
    if (c.includes('baixo') || c.includes('tolerável') || c.includes('trivial')) return '#22c55e';
    return '#6b7280';
  };

  return (
    <>
      {/* ── Toolbar (hidden when printing) ── */}
      <div className="print:hidden sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <button
          onClick={() => navigate(`/project/${project.id}`)}
          className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar ao Projeto
        </button>
        <div className="flex gap-3">
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4" /> Exportar JSON
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition-colors"
          >
            <Printer className="w-4 h-4" /> Imprimir / PDF
          </button>
        </div>
      </div>

      {/* ── Preview content ── */}
      <div ref={previewRef} className="pdf-preview bg-white max-w-[210mm] mx-auto my-8 print:my-0 print:max-w-none shadow-lg print:shadow-none">
        {/* Cover page */}
        <section className="pdf-page flex flex-col items-center justify-center text-center px-12 py-20 border-b border-gray-100 print:break-after-page">
          {project.companyLogoDataUrl && (
            <img src={project.companyLogoDataUrl} alt="Logo da empresa" className="max-h-24 mb-8 object-contain" />
          )}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Análise Ergonômica do Trabalho
          </h1>
          <p className="text-lg text-teal-700 font-semibold mb-1">{project.companyName}</p>
          {project.fantasyName && <p className="text-sm text-gray-500 mb-6">{project.fantasyName}</p>}
          <div className="text-sm text-gray-500 space-y-1 mt-4">
            {project.cnpj && <p>CNPJ: {project.cnpj}</p>}
            {project.address && <p>{project.address}</p>}
            {project.unit && <p>Unidade: {project.unit}</p>}
          </div>
          <div className="mt-12 text-sm text-gray-500 border-t border-gray-200 pt-6">
            <p className="font-medium text-gray-700">{project.evaluatorName}</p>
            {project.evaluatorCrefito && <p>CREFITO: {project.evaluatorCrefito}</p>}
            {project.date && <p className="mt-1">{new Date(project.date).toLocaleDateString('pt-BR')}</p>}
          </div>
          {project.evaluatorSignatureDataUrl && (
            <img src={project.evaluatorSignatureDataUrl} alt="Assinatura" className="max-h-16 mt-4 object-contain" />
          )}
        </section>

        {/* Functions */}
        {project.functions.map((func, fIdx) => (
          <FunctionSection key={func.id} func={func} index={fIdx} riskColor={riskColor} />
        ))}

        {/* Footer page */}
        <section className="pdf-page px-12 py-16 text-center print:break-before-page">
          <p className="text-sm text-gray-400">
            Documento gerado automaticamente pelo AET System — v2.0
          </p>
          <p className="text-xs text-gray-300 mt-2">
            {new Date().toLocaleDateString('pt-BR')} — {project.companyName}
          </p>
        </section>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .pdf-page { page-break-inside: avoid; }
        }
        .pdf-preview { font-family: 'Inter', 'Segoe UI', sans-serif; color: #1f2937; }
        .pdf-preview h2 { font-size: 1.35rem; font-weight: 700; color: #0d9488; border-bottom: 2px solid #e5e7eb; padding-bottom: .5rem; margin-bottom: 1rem; }
        .pdf-preview h3 { font-size: 1.1rem; font-weight: 600; color: #374151; margin-top: 1.25rem; margin-bottom: .5rem; }
        .pdf-preview .field { margin-bottom: .75rem; }
        .pdf-preview .field-label { font-weight: 600; font-size: .8rem; color: #6b7280; text-transform: uppercase; letter-spacing: .04em; }
        .pdf-preview .field-value { font-size: .95rem; color: #374151; white-space: pre-wrap; }
        .pdf-preview table { width: 100%; border-collapse: collapse; font-size: .85rem; }
        .pdf-preview th { background: #f0fdfa; color: #0d9488; font-weight: 600; text-align: left; padding: .5rem .75rem; border: 1px solid #e5e7eb; }
        .pdf-preview td { padding: .5rem .75rem; border: 1px solid #e5e7eb; vertical-align: top; }
      `}</style>
    </>
  );
};

/* ── Individual field ── */
const Field = ({ label, value }: { label: string; value: string | number | undefined }) => {
  if (!value && value !== 0) return null;
  return (
    <div className="field">
      <div className="field-label">{label}</div>
      <div className="field-value">{value}</div>
    </div>
  );
};

/* ── Function section ── */
interface FunctionSectionProps {
  func: AETFunction;
  index: number;
  riskColor: (c: string) => string;
}

const FunctionSection: React.FC<FunctionSectionProps> = ({ func, index, riskColor }) => (
  <section className="pdf-page px-12 py-10 print:break-before-page">
    <h2>
      {String(index + 1).padStart(2, '0')}. {func.name || 'Função sem nome'}
    </h2>

    {/* Identification */}
    <div className="grid grid-cols-2 gap-x-8">
      <Field label="Setor" value={func.sector} />
      <Field label="Unidade" value={func.unit} />
      <Field label="Nº de Colaboradores" value={func.numEmployees} />
      <Field label="Data da Análise" value={func.analysisDate ? new Date(func.analysisDate).toLocaleDateString('pt-BR') : ''} />
    </div>

    <Field label="Origem da Demanda" value={func.demandOrigin} />
    <Field label="Objetivo" value={func.objective} />
    <Field label="Demanda Encontrada" value={func.demandFound} />

    {/* Work Organisation */}
    {(func.shifts || func.overtime || func.pauses || func.taskRotation) && (
      <>
        <h3>Organização do Trabalho</h3>
        <div className="grid grid-cols-2 gap-x-8">
          <Field label="Turnos" value={func.shifts} />
          <Field label="Horas Extras" value={func.overtime} />
        </div>
        <Field label="Pausas Eletivas" value={func.pauses} />
        <Field label="Rodízio de Tarefas" value={func.taskRotation} />
      </>
    )}

    <Field label="Descrição do Local" value={func.workspaceDescription} />

    {/* Worker profile */}
    {(func.collabFormation || func.opinionGender || func.opinionAge) && (
      <>
        <h3>Perfil do Colaborador</h3>
        <div className="grid grid-cols-3 gap-x-6">
          <Field label="Formação" value={func.collabFormation} />
          <Field label="Gênero" value={func.opinionGender} />
          <Field label="Idade" value={func.opinionAge} />
          <Field label="Tempo Médio" value={func.opinionTime} />
        </div>
      </>
    )}

    {/* Worker opinions */}
    {(func.opinionThermal || func.opinionLightingSens || func.opinionAcoustics || func.opinionEPI) && (
      <>
        <h3>Opinião do Trabalhador</h3>
        <div className="grid grid-cols-2 gap-x-8">
          <Field label="Sensação Térmica" value={func.opinionThermal} />
          <Field label="Iluminância" value={func.opinionLightingSens} />
          <Field label="Acústica" value={func.opinionAcoustics} />
          <Field label="EPI" value={func.opinionEPI} />
        </div>
        <Field label="Dificuldades Relatadas" value={func.opinionDifficulties} />
      </>
    )}

    {/* Physical demands */}
    {(func.effortDynamic || func.effortStatic || func.loadCarrying || func.displacement) && (
      <>
        <h3>Exigências Físicas</h3>
        <Field label="Esforços Dinâmicos" value={func.effortDynamic} />
        <Field label="Esforços Estáticos" value={func.effortStatic} />
        <Field label="Cronoanálise" value={func.timeAnalysis} />
        <Field label="Carregamento de Peso" value={func.loadCarrying} />
        <Field label="Deslocamentos" value={func.displacement} />
      </>
    )}

    {/* Equipment & Operations */}
    {(func.equipments || func.cyclePrescribed || func.cycleReal) && (
      <>
        <h3>Equipamentos &amp; Modo Operatório</h3>
        <Field label="Materiais e Equipamentos" value={func.equipments} />
        <Field label="Problemas Aparentes" value={func.equipProblems} />
        <Field label="Tarefa Prescrita" value={func.cyclePrescribed} />
        <Field label="Tarefa Real" value={func.cycleReal} />
      </>
    )}

    {/* Posture */}
    {(func.postureSittingPct > 0 || func.postureStandingPct > 0) && (
      <>
        <h3>Distribuição Postural</h3>
        <div className="flex gap-4 my-3">
          <PostureBar label="Sentado" pct={func.postureSittingPct} color="#0d9488" />
          <PostureBar label="Em pé" pct={func.postureStandingPct} color="#f59e0b" />
          {func.postureOtherPct > 0 && (
            <PostureBar label={func.postureOtherDescription || 'Outra'} pct={func.postureOtherPct} color="#6366f1" />
          )}
        </div>
      </>
    )}

    {/* Scientific Methods */}
    {func.scientificMethods.length > 0 && (
      <>
        <h3>Metodologias Científicas</h3>
        {func.scientificMethods.map((m) => (
          <div key={m.id} className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
            <p className="font-semibold text-teal-700 mb-1">{m.methodName}</p>
            <Field label="Descrição" value={m.description} />
            <Field label="Resultado" value={m.result} />
            <Field label="Classificação de Risco" value={m.riskClassification} />
            <Field label="Interpretação" value={m.interpretation} />
            <Field label="Recomendações" value={m.recommendations} />
            {m.imageDataUrl && (
              <img src={m.imageDataUrl} alt={m.methodName} className="max-w-full h-auto mt-2 rounded border" />
            )}
          </div>
        ))}
      </>
    )}

    {/* Images */}
    {func.images.length > 0 && (
      <>
        <h3>Registros Fotográficos</h3>
        <div className="grid grid-cols-2 gap-4 my-2">
          {func.images.map((img) => (
            <div key={img.id} className="text-center">
              <img src={img.dataUrl} alt={img.caption} className="w-full h-auto rounded border border-gray-200" />
              {img.caption && <p className="text-xs text-gray-500 mt-1">{img.caption}</p>}
            </div>
          ))}
        </div>
      </>
    )}

    {/* Illumination */}
    {func.illumination.resultLux && (
      <>
        <h3>Avaliação de Iluminância</h3>
        <Field label="Local" value={func.illumination.location} />
        <Field label="Descrição do Ambiente" value={func.illumination.environmentDescription} />
        <Field label="Sistema de Iluminação" value={func.illumination.lightingSystem} />
        <Field label="Valores Medidos" value={func.illumination.measuredValues} />
        <Field label="Resultado (lux)" value={func.illumination.resultLux} />
        <Field label="Interpretação" value={func.illumination.interpretation} />

        {func.illumination.checklist.length > 0 && (
          <table className="mt-3">
            <thead>
              <tr>
                <th>Item</th>
                <th>Conforme?</th>
                <th>Ação Recomendada</th>
                <th>Prazo</th>
              </tr>
            </thead>
            <tbody>
              {func.illumination.checklist.map((c) => (
                <tr key={c.id}>
                  <td>{c.description}</td>
                  <td className="text-center">{c.compliant === 'sim' ? '✔ Sim' : c.compliant === 'nao' ? '✘ Não' : '—'}</td>
                  <td>{c.recommendedAction}</td>
                  <td>{c.deadline}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </>
    )}

    {/* Diagnosis */}
    {func.diagnosis && (
      <>
        <h3>Diagnóstico</h3>
        <Field label="" value={func.diagnosis} />
        {func.riskLevel && (
          <div className="inline-block mt-1 px-3 py-1 rounded-full text-sm font-semibold text-white" style={{ backgroundColor: riskColor(func.riskLevel) }}>
            Risco: {func.riskLevel}
          </div>
        )}
      </>
    )}

    {/* Improvements */}
    {func.improvements.length > 0 && (
      <>
        <h3>Inventário de Risco / Plano de Ação</h3>
        <table className="mt-2">
          <thead>
            <tr>
              <th>#</th>
              <th>Perigo Identificado</th>
              <th>Avaliação</th>
              <th>Ações Recomendadas</th>
            </tr>
          </thead>
          <tbody>
            {func.improvements.map((imp: AETImprovement, i: number) => (
              <tr key={imp.id}>
                <td className="text-center font-medium">{String(i + 1).padStart(2, '0')}</td>
                <td>{imp.hazard}</td>
                <td>{imp.riskEvaluation}</td>
                <td>{imp.actions}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </>
    )}
  </section>
);

/* ── Posture bar ── */
const PostureBar = ({ label, pct, color }: { label: string; pct: number; color: string }) => (
  <div className="flex-1">
    <div className="flex justify-between text-xs mb-1">
      <span className="font-medium text-gray-600">{label}</span>
      <span className="font-semibold" style={{ color }}>{pct}%</span>
    </div>
    <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
    </div>
  </div>
);
