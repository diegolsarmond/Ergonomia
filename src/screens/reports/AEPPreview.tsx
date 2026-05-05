import React, { useEffect } from 'react';
import type { AETProject, AETFunction, ErgonomicRisk } from '../../types';
import { DEFAULT_INTRO_ERGONOMIA, DEFAULT_INTRO_OBJETIVO, DEFAULT_INTRO_METODOLOGIA } from '../../types';
import { Field, TocLine, riskLevelColor, ReportToolbar, PDF_STYLES } from './components/ReportCommon';

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

// ── AEP Function Section ─────────────────────────────────────────────────────

const AEPFunctionSection: React.FC<{ func: AETFunction; sectionNum: string }> = ({ func, sectionNum }) => {
  const risks: ErgonomicRisk[] = func.risks || [];

  return (
    <section className="pdf-page px-12 py-10 print:break-before-page">
      <h2>{sectionNum}. {func.name || 'Função sem nome'}</h2>

      {/* ── Identificação ── */}
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

      {/* ── Condições do local ── */}
      {(func.generalConditions || func.accessConditions || func.workstationOrganization) && (
        <>
          <h3>Condições do Local de Trabalho</h3>
          <Field label="Condições Gerais"                 value={func.generalConditions} />
          <Field label="Acesso"                           value={func.accessConditions} />
          <Field label="Organização e Dimensionamento do Posto" value={func.workstationOrganization} />
        </>
      )}

      {/* ── Condições ambientais ── */}
      {func.environmentalConditions && (
        <>
          <h3>Condições Ambientais</h3>
          <Field label="" value={func.environmentalConditions} />
        </>
      )}

      {/* ── Fatores ergonômicos ── */}
      {(func.biomechanicalFactors || func.cognitiveFactors || func.organizationalFactors) && (
        <>
          <h3>Fatores Ergonômicos</h3>
          <Field label="Biomecânicos"    value={func.biomechanicalFactors} />
          <Field label="Cognitivos"      value={func.cognitiveFactors} />
          <Field label="Organizacionais" value={func.organizationalFactors} />
        </>
      )}

      {/* ── Atividade ── */}
      {(func.prescribedTask || func.cyclePrescribed || func.realTask || func.cycleReal) && (
        <>
          <h3>Descrição da Atividade</h3>
          {(func.prescribedTask || func.cyclePrescribed) && (
            <Field label="Tarefa Prescrita" value={func.prescribedTask || func.cyclePrescribed} />
          )}
          {(func.realTask || func.cycleReal) && (
            <Field label="Tarefa Real (Observação Sistemática)" value={func.realTask || func.cycleReal} />
          )}
        </>
      )}

      {/* ── Inventário de riscos ── */}
      {risks.length > 0 ? (
        <>
          <h3>Inventário de Riscos Ergonômicos</h3>
          <table className="mt-2" style={{ fontSize: '0.75rem' }}>
            <thead>
              <tr>
                <th style={{ width: '3%' }}>#</th>
                <th>Agente</th>
                <th>Fator de Risco</th>
                <th>Possível Efeito à Saúde</th>
                <th>Situação Encontrada</th>
                <th>Controle Existente</th>
                <th>Proposta de Melhoria</th>
                <th style={{ width: '4%' }}>P</th>
                <th style={{ width: '4%' }}>G</th>
                <th style={{ width: '5%' }}>Score</th>
                <th style={{ width: '10%' }}>Nível</th>
                <th>Responsável</th>
                <th>Prazo</th>
              </tr>
            </thead>
            <tbody>
              {risks.map((risk, i) => (
                <tr key={risk.id}>
                  <td className="text-center font-medium">{String(i + 1).padStart(2, '0')}</td>
                  <td>{risk.agent}</td>
                  <td>{risk.riskFactor}</td>
                  <td>{risk.possibleHealthEffect}</td>
                  <td>{risk.foundSituation}</td>
                  <td>{risk.existingControl}</td>
                  <td>{risk.improvementProposal}</td>
                  <td className="text-center">{risk.probability}</td>
                  <td className="text-center">{risk.severity}</td>
                  <td className="text-center font-bold">{risk.score}</td>
                  <td>
                    <span style={{
                      display: 'inline-block', padding: '1px 7px', borderRadius: '9999px',
                      fontSize: '0.7rem', fontWeight: 700, color: '#fff',
                      background: riskLevelColor(risk.riskLevel),
                    }}>
                      {risk.riskLevel}
                    </span>
                  </td>
                  <td>{risk.responsible}</td>
                  <td>{risk.deadline ? new Date(risk.deadline + 'T12:00:00').toLocaleDateString('pt-BR') : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* ── Matriz de risco ── */}
          <h3>Matriz de Risco</h3>
          <RiskMatrix risks={risks} />

          {/* ── Evidências fotográficas ── */}
          {risks.some(r => r.evidenceImageDataUrl) && (
            <>
              <h4>Evidências Fotográficas</h4>
              <div className="grid grid-cols-2 gap-4 mt-2">
                {risks.filter(r => r.evidenceImageDataUrl).map((risk) => (
                  <div key={risk.id} className="text-center">
                    <img src={risk.evidenceImageDataUrl} alt={risk.riskFactor}
                      className="w-full h-auto rounded border border-gray-200" />
                    <p className="text-xs text-gray-500 mt-1 font-medium">{risk.riskFactor}</p>
                    <p className="text-xs text-gray-400">{risk.agent}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      ) : (
        <p style={{ fontSize: '0.85rem', color: '#9ca3af', fontStyle: 'italic', marginTop: '8px' }}>
          Nenhum risco ergonômico identificado para esta função.
        </p>
      )}

      {/* ── Conclusão ── */}
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
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('print') === 'true') {
      const timer = setTimeout(() => window.print(), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const monthYear = project.date
    ? new Date(project.date + 'T12:00:00').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    : '';

  const introErgonomia   = project.introErgonomia   || DEFAULT_INTRO_ERGONOMIA;
  const introObjetivo    = project.introObjetivo    || DEFAULT_INTRO_OBJETIVO;
  const introMetodologia = project.introMetodologia || DEFAULT_INTRO_METODOLOGIA;

  const hasAnnexes = project.functions.some(f => f.images?.length > 0);
  const funcCount  = project.functions.length;
  const respNum    = funcCount > 0 ? `${funcCount + 2}` : '3';
  const anexosNum  = funcCount > 0 ? `${funcCount + 3}` : '4';

  return (
    <>
      <ReportToolbar projectId={project.id} />

      <div className="w-full overflow-x-auto print:overflow-visible bg-gray-100 print:bg-transparent">
        <div className="pdf-preview bg-white min-w-[800px] max-w-[210mm] mx-auto my-8 print:my-0 print:min-w-0 print:max-w-none shadow-lg print:shadow-none">

          {/* ══ CAPA ══ */}
          <section className="pdf-page flex flex-col items-center justify-between text-center px-16 py-12 print:break-after-page min-h-[250mm] print:min-h-[240mm]">
            <div className="flex justify-between items-start w-full mb-8">
              {project.consultoriaLogoDataUrl
                ? <img src={project.consultoriaLogoDataUrl} alt="Logo consultoria" className="max-h-20 object-contain" />
                : <div className="h-20 w-40 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400">Logo Consultoria</div>}
              {project.companyLogoDataUrl
                ? <img src={project.companyLogoDataUrl} alt="Logo empresa" className="max-h-20 object-contain" />
                : <div className="h-20 w-40 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400">Logo Empresa</div>}
            </div>

            <div className="flex-1 flex flex-col items-center justify-center gap-4">
              <div className="w-16 h-1 bg-teal-600 rounded-full" />
              <p className="text-sm font-semibold tracking-widest text-teal-700 uppercase">Análise Ergonômica Preliminar</p>
              <h1 className="text-5xl font-extrabold text-gray-900 leading-tight">AEP</h1>
              <div className="w-16 h-1 bg-teal-600 rounded-full" />
              <div className="mt-8 space-y-1.5">
                <p className="text-2xl font-bold text-gray-800">{project.companyName || '—'}</p>
                {project.fantasyName && <p className="text-base text-gray-500">{project.fantasyName}</p>}
                {project.unit        && <p className="text-sm text-gray-500">Unidade: {project.unit}</p>}
                {project.location    && <p className="text-sm text-gray-500">{project.location}</p>}
              </div>
            </div>

            <div className="w-full border-t border-gray-200 pt-6 flex justify-between items-end text-sm text-gray-500">
              <div className="text-left space-y-0.5">
                {project.evaluatorName      && <p className="font-semibold text-gray-700">{project.evaluatorName}</p>}
                {project.evaluatorFormation && <p>{project.evaluatorFormation}</p>}
                {project.evaluatorCrefito   && <p>{project.evaluatorCrefito}</p>}
                {project.evaluatorCompany   && <p>{project.evaluatorCompany}</p>}
              </div>
              <div className="text-right">
                {project.evaluatorSignatureDataUrl && (
                  <img src={project.evaluatorSignatureDataUrl} alt="Assinatura"
                    className="max-h-14 mb-2 ml-auto object-contain" />
                )}
                {monthYear && <p className="capitalize font-medium">{monthYear}</p>}
              </div>
            </div>
          </section>

          {/* ══ SUMÁRIO ══ */}
          <section className="pdf-page px-12 py-16 print:break-after-page">
            <h2>Sumário</h2>
            <div className="space-y-2 mt-4">
              <TocLine num="1" title="Introdução" />
              <TocLine num="1.1" title="Ergonomia" indent />
              <TocLine num="1.2" title="Análise Global da Empresa" indent />
              <TocLine num="1.3" title="Objetivo" indent />
              <TocLine num="1.4" title="Metodologia" indent />
              <TocLine num="2" title="AEP – Análise Ergonômica Preliminar" />
              {project.functions.map((func, idx) => (
                <TocLine key={func.id} num={`2.${idx + 1}`} title={func.name || 'Função sem nome'} indent />
              ))}
              <TocLine num={respNum}    title="Responsabilidade Técnica" />
              {hasAnnexes && <TocLine num={anexosNum} title="Anexos – Registros Fotográficos" />}
            </div>
          </section>

          {/* ══ CONTEÚDO (thead/tfoot para logotipo repetido) ══ */}
          <table className="w-full">
            <thead>
              <tr>
                <td>
                  <div className="flex justify-end mb-4 px-12">
                    {project.companyLogoDataUrl
                      ? <img src={project.companyLogoDataUrl} alt="Logo empresa" className="max-h-12 object-contain" />
                      : <span className="text-xs text-gray-400 font-medium tracking-wide">Logo Cliente</span>}
                  </div>
                </td>
              </tr>
            </thead>
            <tfoot>
              <tr><td><div className="flex justify-between items-center mt-4 px-12" /></td></tr>
            </tfoot>
            <tbody>
              <tr>
                <td className="p-0">

                  {/* ── 1. Introdução ── */}
                  <section className="pdf-page px-12 py-8 print:break-after-page">
                    <h2>1. Introdução</h2>

                    <h3>1.1 Ergonomia</h3>
                    <p className="field-value">{introErgonomia}</p>

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
                    <p className="field-value">{introObjetivo}</p>

                    <h3>1.4 Metodologia</h3>
                    <p className="field-value">{introMetodologia}</p>
                  </section>

                  {/* ── 2. Funções ── */}
                  {project.functions.length === 0 && (
                    <section className="pdf-page px-12 py-8">
                      <h2>2. AEP – Análise Ergonômica Preliminar</h2>
                      <p className="field-value" style={{ color: '#9ca3af', fontStyle: 'italic' }}>
                        Nenhuma função cadastrada.
                      </p>
                    </section>
                  )}
                  {project.functions.map((func, fIdx) => (
                    <AEPFunctionSection key={func.id} func={func} sectionNum={`2.${fIdx + 1}`} />
                  ))}

                  {/* ── Responsabilidade Técnica ── */}
                  <section className="pdf-page px-12 py-14 print:break-before-page">
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
                    <section className="pdf-page px-12 py-14 print:break-before-page">
                      <h2>{anexosNum}. Anexos – Registros Fotográficos</h2>
                      {project.functions.map((func) => {
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
