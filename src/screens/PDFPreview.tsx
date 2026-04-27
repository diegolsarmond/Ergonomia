import React, { useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAET } from '../context/AETContext';
import { ArrowLeft, Printer } from 'lucide-react';
import { AETFunction, AETImprovement, AETEquipmentItem, AETEPIItem, DEFAULT_INTRO_ERGONOMIA, DEFAULT_INTRO_OBJETIVO, DEFAULT_INTRO_METODOLOGIA } from '../types';

export const PDFPreview = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getProject } = useAET();
  const project = getProject(id!);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('print') === 'true') {
      const timer = setTimeout(() => {
        window.print();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-500 text-lg">Projeto não encontrado.</p>
      </div>
    );
  }

  const handlePrint = () => window.print();

  const riskColor = (classification: string) => {
    const c = (classification || '').toLowerCase();
    if (c.includes('alto') || c.includes('intolerável') || c.includes('grave') || c.includes('vermelho')) return '#dc2626';
    if (c.includes('substancial') || c.includes('laranja')) return '#ea580c';
    if (c.includes('moderado') || c.includes('amarelo')) return '#f59e0b';
    if (c.includes('baixo') || c.includes('tolerável') || c.includes('trivial') || c.includes('verde')) return '#22c55e';
    return '#6b7280';
  };

  const monthYear = project.date
    ? new Date(project.date + 'T12:00:00').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    : '';

  const introErgonomia = project.introErgonomia || DEFAULT_INTRO_ERGONOMIA;
  const introObjetivo = project.introObjetivo || DEFAULT_INTRO_OBJETIVO;
  const introMetodologia = project.introMetodologia || DEFAULT_INTRO_METODOLOGIA;

  return (
    <>
      {/* ── Toolbar ── */}
      <div className="print:hidden sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-gray-200 px-4 sm:px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
        <button
          onClick={() => navigate(`/project/${project.id}`)}
          className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors self-start sm:self-auto"
        >
          <ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">Voltar ao Projeto</span><span className="sm:hidden">Voltar</span>
        </button>
        <div className="flex gap-3 w-full sm:w-auto justify-end">

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition-colors w-full sm:w-auto justify-center"
          >
            <Printer className="w-4 h-4" /> <span className="hidden sm:inline">Imprimir / PDF</span><span className="sm:hidden">Imprimir</span>
          </button>
        </div>
      </div>

      {/* ── Document ── */}
      <div className="w-full overflow-x-auto print:overflow-visible bg-gray-100 print:bg-transparent">
        <div ref={previewRef} className="pdf-preview bg-white min-w-[800px] max-w-[210mm] mx-auto my-8 print:my-0 print:min-w-0 print:max-w-none shadow-lg print:shadow-none">

        {/* ═══════════════════════════════════════════════════════════════
            CAPA
        ═══════════════════════════════════════════════════════════════ */}
        <section className="pdf-page flex flex-col items-center justify-between text-center px-16 py-12 print:break-after-page min-h-[250mm] print:min-h-[240mm]">
          {/* Logos topo */}
          <div className="flex justify-between items-start w-full mb-8">
            {project.consultoriaLogoDataUrl
              ? <img src={project.consultoriaLogoDataUrl} alt="Logo consultoria" className="max-h-20 object-contain" />
              : <div className="h-20 w-40 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400">Logo Consultoria</div>
            }
            {project.companyLogoDataUrl
              ? <img src={project.companyLogoDataUrl} alt="Logo empresa" className="max-h-20 object-contain" />
              : <div className="h-20 w-40 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400">Logo Empresa</div>
            }
          </div>

          {/* Título central */}
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-1 bg-teal-600 rounded-full" />
            <p className="text-sm font-semibold tracking-widest text-teal-700 uppercase">Análise Ergonômica do Trabalho</p>
            <h1 className="text-4xl font-extrabold text-gray-900 leading-tight">AET</h1>
            <div className="w-16 h-1 bg-teal-600 rounded-full" />
            <div className="mt-6 space-y-1">
              <p className="text-xl font-bold text-gray-800">{project.companyName}</p>
              {project.fantasyName && <p className="text-base text-gray-500">{project.fantasyName}</p>}
              {project.unit && <p className="text-sm text-gray-500">Unidade: {project.unit}</p>}
              {project.location && <p className="text-sm text-gray-500">{project.location}</p>}
            </div>
          </div>

          {/* Rodapé da capa */}
          <div className="w-full border-t border-gray-200 pt-6 flex justify-between items-end text-sm text-gray-500">
            <div className="text-left">
              {project.evaluatorName && <p className="font-semibold text-gray-700">{project.evaluatorName}</p>}
              {project.evaluatorFormation && <p>{project.evaluatorFormation}</p>}
              {project.evaluatorCrefito && <p>{project.evaluatorCrefito}</p>}
              {project.evaluatorCompany && <p>{project.evaluatorCompany}</p>}
            </div>
            <div className="text-right">
              {project.evaluatorSignatureDataUrl && (
                <img src={project.evaluatorSignatureDataUrl} alt="Assinatura" className="max-h-14 mb-2 ml-auto object-contain" />
              )}
              {monthYear && <p className="capitalize">{monthYear}</p>}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            SUMÁRIO
        ═══════════════════════════════════════════════════════════════ */}
        <section className="pdf-page px-12 py-16 print:break-after-page">
          <h2>Sumário</h2>
          <div className="space-y-2 mt-4">
            <TocLine num="1" title="Introdução" />
            <TocLine num="1.1" title="Ergonomia" indent />
            <TocLine num="1.2" title="Análise Global da Empresa" indent />
            <TocLine num="1.3" title="Objetivo" indent />
            <TocLine num="1.4" title="Metodologia" indent />
            <TocLine num="2" title="AET – ANÁLISE ERGONÔMICA DO TRABALHO" />
            {project.functions.map((func, idx) => (
              <TocLine key={func.id} num={`2.${idx + 1}`} title={func.name || 'Função sem nome'} indent />
            ))}
            <TocLine num="3" title="Responsabilidade Técnica" />
            <TocLine num="4" title="Anexos" />
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            1. INTRODUÇÃO
        ═══════════════════════════════════════════════════════════════ */}
        <section className="pdf-page px-12 py-14 print:break-after-page">
          <h2>1. Introdução</h2>

          <h3>1.1 Ergonomia</h3>
          <p className="field-value">{introErgonomia}</p>

          <h3>1.2 Análise Global da Empresa</h3>
          <div className="grid grid-cols-2 gap-x-8 mt-2">
            <Field label="Razão Social" value={project.companyName} />
            <Field label="Nome Fantasia" value={project.fantasyName} />
            <Field label="CNPJ" value={project.cnpj} />
            <Field label="Grau de Risco" value={project.riskDegree} />
            <Field label="Endereço" value={project.address} />
            <Field label="Unidade" value={project.unit} />
            <Field label="Produto / Atividade" value={project.product} />
            <Field label="Local de Produção" value={project.location} />
          </div>

          <h3>1.3 Objetivo</h3>
          <p className="field-value">{introObjetivo}</p>

          <h3>1.4 Metodologia</h3>
          <p className="field-value">{introMetodologia}</p>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            SEÇÕES DE FUNÇÃO
        ═══════════════════════════════════════════════════════════════ */}
        {project.functions.map((func, fIdx) => (
          <FunctionSection
            key={func.id}
            func={func}
            index={fIdx}
            sectionNum={`2.${fIdx + 1}`}
            riskColor={riskColor}
          />
        ))}

        {/* ═══════════════════════════════════════════════════════════════
            RESPONSABILIDADE TÉCNICA
        ═══════════════════════════════════════════════════════════════ */}
        <section className="pdf-page px-12 py-14 print:break-before-page">
          <h2>3. Responsabilidade Técnica</h2>
          <div className="mt-6 border rounded-lg p-8 bg-gray-50 max-w-md">
            <Field label="Nome" value={project.evaluatorName} />
            <Field label="Formação" value={project.evaluatorFormation} />
            <Field label="Registro Profissional" value={project.evaluatorCrefito} />
            <Field label="Empresa" value={project.evaluatorCompany} />
            <Field label="Data" value={project.date ? new Date(project.date + 'T12:00:00').toLocaleDateString('pt-BR') : ''} />
            {project.evaluatorSignatureDataUrl && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <p className="field-label">Assinatura</p>
                <img src={project.evaluatorSignatureDataUrl} alt="Assinatura" className="max-h-20 mt-2 object-contain" />
              </div>
            )}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            ANEXOS
        ═══════════════════════════════════════════════════════════════ */}
        {project.functions.some((f) => f.images?.length > 0) && (
          <section className="pdf-page px-12 py-14 print:break-before-page">
            <h2>4. Anexos – Registros Fotográficos</h2>
            {project.functions.map((func) => {
              if (!func.images?.length) return null;
              return (
                <div key={func.id} className="mt-6">
                  <h3>{func.name}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {func.images.map((img) => (
                      <div key={img.id} className="text-center">
                        <img src={img.dataUrl} alt={img.caption} className="w-full h-auto rounded border border-gray-200" />
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
        </div>
      </div>

      {/* ── Print styles ── */}
      <style>{`
        @page {
          size: A4;
          margin: 20mm 15mm 25mm 15mm;
        }
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .pdf-page { page-break-inside: avoid; }
        }
        .pdf-preview { font-family: 'Inter', 'Segoe UI', sans-serif; color: #1f2937; line-height: 1.6; }
        .pdf-preview h2 { font-size: 1.25rem; font-weight: 700; color: #0d9488; border-bottom: 2px solid #e5e7eb; padding-bottom: .5rem; margin-bottom: 1.5rem; padding-top: 2rem; margin-top: 0; }
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
      `}</style>
    </>
  );
};

// ── Reusable sub-components ──────────────────────────────────────────────────

const Field = ({ label, value }: { label: string; value: string | number | undefined | null }) => {
  if (value === undefined || value === null || value === '') return null;
  return (
    <div className="field">
      {label && <div className="field-label">{label}</div>}
      <div className="field-value">{value}</div>
    </div>
  );
};

const TocLine = ({ num, title, indent }: { num: string; title: string; indent?: boolean; [key: string]: any }) => (
  <div className={`toc-line text-sm ${indent ? 'pl-6 text-gray-500' : 'font-medium text-gray-700'}`}>
    <span className="shrink-0">{num}. {title}</span>
    <span className="toc-dots" />
  </div>
);

const PostureBar = ({ label, pct, color }: { label: string; pct: number; color: string }) => (
  <div className="flex-1">
    <div className="flex justify-between text-xs mb-1">
      <span className="font-medium text-gray-600">{label}</span>
      <span className="font-semibold" style={{ color }}>{pct}%</span>
    </div>
    <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
    </div>
  </div>
);

// ── Function Section ─────────────────────────────────────────────────────────

interface FunctionSectionProps {
  func: AETFunction;
  index: number;
  sectionNum: string;
  riskColor: (c: string) => string;
}

const FunctionSection: React.FC<FunctionSectionProps> = ({ func, sectionNum, riskColor }) => (
  <section className="pdf-page px-12 py-10 print:break-before-page">

    {/* 4.1 Cabeçalho */}
    <h2>{sectionNum}. {func.name || 'Função sem nome'}</h2>
    <table className="mb-4">
      <tbody>
        <tr>
          <th style={{ width: '25%' }}>Função</th>
          <td>{func.name}</td>
          <th style={{ width: '25%' }}>Nº de Colaboradores</th>
          <td>{func.numEmployees}</td>
        </tr>
        <tr>
          <th>Setor</th>
          <td>{func.sector}</td>
          <th>Unidade</th>
          <td>{func.unit}</td>
        </tr>
        <tr>
          <th>Data da Análise</th>
          <td>{func.analysisDate ? new Date(func.analysisDate + 'T12:00:00').toLocaleDateString('pt-BR') : ''}</td>
          <th>Status</th>
          <td>{func.demandFound}</td>
        </tr>
      </tbody>
    </table>

    {/* 4.2 Origem */}
    <Field label="4.2 Origem da Demanda" value={func.demandOrigin} />

    {/* 4.3 Objetivo */}
    <Field label="4.3 Objetivo da Análise" value={func.objective} />

    {/* 4.5 Análise global */}
    {(func.marketSituation || func.product || func.productionLocation) && (
      <>
        <h3>4.5 Análise Global da Empresa</h3>
        <div className="grid grid-cols-2 gap-x-8">
          <Field label="Situação de Mercado" value={func.marketSituation} />
          <Field label="Produto" value={func.product} />
          <Field label="Local de Produção" value={func.productionLocation} />
        </div>
      </>
    )}

    {/* 4.6 Dimensão da produção */}
    {(func.productionDimension || func.productionGoals || func.qualityAnalysis) && (
      <>
        <h3>4.6 Dimensão da Produção / Atividade Realizada</h3>
        <Field label="Descrição da atividade" value={func.productionDimension} />
        <div className="grid grid-cols-2 gap-x-8">
          <Field label="Metas" value={func.productionGoals} />
          <Field label="Quem avalia o trabalho" value={func.qualityEvaluator} />
        </div>
        <Field label="Controle de qualidade" value={func.qualityAnalysis} />
      </>
    )}

    {/* 4.7 Organização do trabalho */}
    {(func.shifts || func.overtime || func.pauses || func.taskRotation) && (
      <>
        <h3>4.7 Organização do Trabalho</h3>
        <div className="grid grid-cols-2 gap-x-8">
          <Field label="Turnos" value={func.shifts} />
          <Field label="Horário" value={func.shiftStart && func.shiftEnd ? `${func.shiftStart} às ${func.shiftEnd}` : (func.shiftStart || func.shiftEnd || '')} />
          <Field label="Dias da semana" value={func.workDays} />
          <Field label="Horas Extras" value={func.overtime} />
        </div>
        <Field label="Pausas Eletivas" value={func.pauses} />
        <Field label="Rodízio de Tarefas" value={func.taskRotation} />
        <Field label="Hierarquia" value={func.hierarchyOrganogram} />
        <div className="grid grid-cols-2 gap-x-8">
          <Field label="Distância do banheiro" value={func.bathroomDistance} />
          <Field label="Condição sanitária" value={func.bathroomCondition} />
        </div>
        <Field label="Descrição do Local" value={func.workspaceDescription} />
      </>
    )}

    {/* 4.8 Colaborador */}
    {(func.collabFormation || func.opinionGender || func.opinionAge) && (
      <>
        <h3>4.8 Colaborador</h3>
        <div className="grid grid-cols-3 gap-x-6">
          <Field label="Formação" value={func.collabFormation} />
          <Field label="Turno entrevistado" value={func.collabTurn} />
          <Field label="Gênero" value={func.opinionGender} />
          <Field label="Faixa Etária" value={func.opinionAge} />
          <Field label="Tempo Médio na Empresa" value={func.opinionTime} />
        </div>
      </>
    )}

    {/* 4.9 Opinião do trabalhador */}
    {(func.opinionObjective || func.opinionThermal || func.opinionLightingSens || func.opinionAcoustics) && (
      <>
        <h3>4.9 Opinião do Trabalhador</h3>
        <div className="grid grid-cols-2 gap-x-8">
          <Field label="Objetivo do trabalho" value={func.opinionObjective} />
          <Field label="Sensação Térmica" value={func.opinionThermal} />
          <Field label="Ventilação" value={func.opinionVentilation} />
          <Field label="Descrição da ventilação" value={func.opinionVentilationDesc} />
          <Field label="Sensação de Iluminância" value={func.opinionLightingSens} />
          <Field label="Descrição da iluminação" value={func.opinionLightingDesc} />
          <Field label="Sensação Acústica" value={func.opinionAcoustics} />
          <Field label="EPIs utilizados" value={func.opinionEPI} />
          <Field label="Opinião sobre equipamentos" value={func.opinionEquip} />
          <Field label="Ciclo operacional" value={func.opinionCycle} />
          <Field label="Layout" value={func.opinionLayout} />
          <Field label="Pressão temporal" value={func.opinionPressure} />
          <Field label="Relacionamento com colegas" value={func.opinionRelationship} />
          <Field label="Abertura da liderança" value={func.opinionLeadership} />
          <Field label="Influência da manutenção" value={func.opinionMaintenanceInfluence} />
        </div>
        <Field label="Dificuldades na tarefa" value={func.opinionDifficulties} />
        <Field label="Intercorrências" value={func.opinionIntercurrences} />
      </>
    )}

    {/* 4.10 Exigências */}
    {(func.effortDynamic || func.effortStatic) && (
      <>
        <h3>4.10 Exigências do Trabalho</h3>
        <Field label="Esforços Dinâmicos" value={func.effortDynamic} />
        <Field label="Esforços Estáticos" value={func.effortStatic} />
      </>
    )}

    {/* 4.11 Cronoanálise */}
    {func.timeAnalysis && (
      <>
        <h3>4.11 Cronoanálise</h3>
        <Field label="" value={func.timeAnalysis} />
      </>
    )}

    {/* 4.12 Carregamento */}
    {func.loadCarrying && (
      <>
        <h3>4.12 Carregamento de Peso</h3>
        <Field label="" value={func.loadCarrying} />
      </>
    )}

    {/* 4.13 Deslocamentos */}
    {func.displacement && (
      <>
        <h3>4.13 Deslocamentos</h3>
        <Field label="Deambulação diária estimada" value={func.displacement} />
      </>
    )}

    {/* 4.14 Manutenção */}
    {func.maintenanceDesc && (
      <>
        <h3>4.14 Manutenção</h3>
        <Field label="Como é feita" value={func.maintenanceDesc} />
        <Field label="Causa atraso no ciclo?" value={func.maintenanceCausesDelay} />
      </>
    )}

    {/* 4.15 Logística */}
    {func.logisticsInfluence && (
      <>
        <h3>4.15 Logística</h3>
        <Field label="Influencia a atividade?" value={func.logisticsInfluence} />
        <Field label="Como causa atraso" value={func.logisticsDelay} />
      </>
    )}

    {/* 4.16 Retrabalho */}
    <h3>4.16 Retrabalho / Refugo</h3>
    {func.reworkNotApplicable
      ? <p className="field-value italic text-gray-400">Não se aplica.</p>
      : (
        <div className="grid grid-cols-2 gap-x-8">
          <Field label="Contexto" value={func.reworkDesc} />
          <Field label="Frequência semanal" value={func.reworkWeek} />
        </div>
      )
    }

    {/* 4.17 Equipamentos */}
    {((func.equipmentList?.length || 0) > 0 || func.equipProblems) && (
      <>
        <h3>4.17 Equipamentos e Materiais</h3>
        {(func.equipmentList || []).length > 0 && (
          <table>
            <thead>
              <tr>
                <th>Equipamento</th>
                <th>Qtd</th>
                <th>Dimensões</th>
                <th>Funcionamento</th>
                <th>Condição</th>
                <th>Observações</th>
              </tr>
            </thead>
            <tbody>
              {(func.equipmentList || []).map((eq: AETEquipmentItem) => (
                <tr key={eq.id}>
                  <td>{eq.name}</td>
                  <td>{eq.quantity}</td>
                  <td>{eq.dimensions}</td>
                  <td style={{ textTransform: 'capitalize' }}>{eq.principle}</td>
                  <td>{eq.condition}</td>
                  <td>{eq.observations}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <Field label="Problemas aparentes" value={func.equipProblems} />
      </>
    )}

    {/* EPIs */}
    {(func.epiList?.length || 0) > 0 && (
      <>
        <h4>EPIs Utilizados</h4>
        <table>
          <thead>
            <tr>
              <th>EPI</th>
              <th>Obrigatório</th>
              <th>Eventual</th>
              <th>Local de uso</th>
              <th>Observações</th>
            </tr>
          </thead>
          <tbody>
            {(func.epiList || []).map((epi: AETEPIItem) => (
              <tr key={epi.id}>
                <td>{epi.name}</td>
                <td className="text-center">{epi.mandatory ? '✔' : '—'}</td>
                <td className="text-center">{epi.occasional ? '✔' : '—'}</td>
                <td>{epi.location}</td>
                <td>{epi.observations}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </>
    )}

    {/* 4.18 Modo operatório */}
    {(func.cyclePrescribed || func.cycleReal) && (
      <>
        <h3>4.18 Modo Operatório / Ciclo Operacional</h3>
        <Field label="Tarefa Prescrita" value={func.cyclePrescribed} />
        <Field label="Observação sistemática (tarefa real)" value={func.cycleReal} />
      </>
    )}

    {/* 4.19 Predominância postural */}
    {(func.postureSittingPct > 0 || func.postureStandingPct > 0 || func.postureWalkingPct > 0) && (
      <>
        <h3>4.19 Predominância Postural</h3>
        <div className="flex gap-4 my-3 flex-wrap">
          {func.postureSittingPct > 0 && <PostureBar label="Sentado" pct={func.postureSittingPct} color="#0d9488" />}
          {func.postureStandingPct > 0 && <PostureBar label="Em pé" pct={func.postureStandingPct} color="#f59e0b" />}
          {func.postureWalkingPct > 0 && <PostureBar label="Andando" pct={func.postureWalkingPct} color="#6366f1" />}
          {func.postureCrouchingPct > 0 && <PostureBar label="Agachado" pct={func.postureCrouchingPct} color="#ec4899" />}
          {func.postureOtherPct > 0 && <PostureBar label={func.postureOtherDescription || 'Outro'} pct={func.postureOtherPct} color="#64748b" />}
        </div>
      </>
    )}

    {/* 4.20 Meio ambiente */}
    {func.meioAmbiente && (
      <>
        <h3>4.20 Meio Ambiente de Trabalho</h3>
        <Field label="" value={func.meioAmbiente} />
      </>
    )}

    {/* ── Iluminação NHO 11 ── */}
    {func.illumination.resultLux && (
      <>
        <h3>Relatório de Medição de Iluminação – NHO 11</h3>
        <div className="grid grid-cols-2 gap-x-8">
          <Field label="Local" value={func.illumination.location} />
          <Field label="Data" value={func.illumination.date ? new Date(func.illumination.date + 'T12:00:00').toLocaleDateString('pt-BR') : ''} />
          <Field label="Tipo de Iluminação" value={func.illumination.lightingType} />
        </div>
        <Field label="Introdução" value={func.illumination.introduction} />
        <Field label="Objetivo" value={func.illumination.objective} />
        <Field label="Justificativa" value={func.illumination.justification} />
        <Field label="Descrição do Ambiente" value={func.illumination.environmentDescription} />
        <Field label="Sistema de Iluminação" value={func.illumination.lightingSystem} />
        <Field label="Atividades / Tarefas" value={func.illumination.activities} />
        <Field label="Critérios e Procedimentos" value={func.illumination.criteria} />
        <Field label="Fórmula de Cálculo" value={func.illumination.formula} />
        <div className="grid grid-cols-3 gap-x-8">
          <Field label="Valores Medidos" value={func.illumination.measuredValues} />
          <Field label="Resultado (lux)" value={func.illumination.resultLux} />
          <Field label="Valor de Referência" value={func.illumination.referenceValue} />
        </div>
        <Field label="Interpretação dos Resultados" value={func.illumination.interpretation} />
        <Field label="Referência Normativa" value={func.illumination.normativeReference} />
        {func.illumination.conclusion && (
          <div className="inline-flex items-center gap-2 mt-1 px-4 py-1.5 rounded-full text-sm font-semibold text-white"
            style={{ backgroundColor: func.illumination.conclusion === 'adequada' ? '#22c55e' : '#dc2626' }}>
            Conclusão: Iluminação {func.illumination.conclusion === 'adequada' ? 'Adequada' : 'Inadequada'}
          </div>
        )}
        <Field label="" value={func.illumination.conclusionText} />

        {func.illumination.checklist.length > 0 && (
          <>
            <h4>Checklist de Iluminação</h4>
            <table>
              <thead>
                <tr>
                  <th>Descrição</th>
                  <th style={{ width: '7%' }}>Sim</th>
                  <th style={{ width: '7%' }}>Não</th>
                  <th>Ação Recomendada</th>
                  <th>Prazo</th>
                  <th>Responsável</th>
                  <th>Observações</th>
                </tr>
              </thead>
              <tbody>
                {func.illumination.checklist.map((c) => (
                  <tr key={c.id}>
                    <td>{c.description}</td>
                    <td className="text-center">{c.compliant === 'sim' ? '✔' : ''}</td>
                    <td className="text-center">{c.compliant === 'nao' ? '✘' : ''}</td>
                    <td>{c.recommendedAction}</td>
                    <td>{c.deadline}</td>
                    <td>{c.responsible}</td>
                    <td>{c.observations}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </>
    )}

    {/* ── Métodos Científicos ── */}
    {func.scientificMethods.length > 0 && (
      <>
        <h3>Métodos Científicos</h3>
        {func.scientificMethods.map((m) => (
          <div key={m.id} className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
            <p className="font-semibold text-teal-700 mb-2">{m.methodName}</p>
            <div className="grid grid-cols-2 gap-x-8">
              <Field label="Resultado" value={m.result} />
              <Field label="Classificação de Risco" value={m.riskClassification} />
            </div>
            {m.riskClassification && (
              <div className="inline-block my-1 px-3 py-1 rounded-full text-xs font-semibold text-white"
                style={{ backgroundColor: riskColor(m.riskClassification) }}>
                {m.riskClassification}
              </div>
            )}
            <Field label="Descrição" value={m.description} />
            <Field label="Interpretação" value={m.interpretation} />
            <Field label="Recomendações" value={m.recommendations} />
            {m.imageDataUrl && (
              <img src={m.imageDataUrl} alt={m.methodName} className="max-w-full h-auto mt-2 rounded border" />
            )}
          </div>
        ))}
      </>
    )}

    {/* ── Diagnóstico ── */}
    {func.diagnosis && (
      <>
        <h3>Diagnóstico</h3>
        <Field label="" value={func.diagnosis} />
        {func.riskLevel && (
          <div className="inline-block mt-1 px-3 py-1 rounded-full text-sm font-semibold text-white"
            style={{ backgroundColor: riskColor(func.riskLevel) }}>
            Nível de Risco: {func.riskLevel}
          </div>
        )}
        {func.rulaScore && (
          <div className="inline-block mt-1 ml-2 px-3 py-1 rounded-full text-sm font-semibold text-white"
            style={{ backgroundColor: riskColor(func.rulaScore) }}>
            RULA: {func.rulaScore}
          </div>
        )}
      </>
    )}

    {/* ── Propostas de melhoria / Inventário de risco ── */}
    {func.improvements.length > 0 && (
      <>
        <h3>Propostas de Melhorias – Inventário de Risco Ergonômico</h3>
        <table className="mt-2">
          <thead>
            <tr>
              <th style={{ width: '4%' }}>#</th>
              <th>Perigo Identificado</th>
              <th>Probabilidade</th>
              <th>Severidade</th>
              <th>Pontuação</th>
              <th>Classificação</th>
              <th>Medidas de Melhoria</th>
              <th>Responsável</th>
              <th>Prazo</th>
              <th>Atenuação</th>
            </tr>
          </thead>
          <tbody>
            {func.improvements.map((imp: AETImprovement, i: number) => (
              <tr key={imp.id}>
                <td className="text-center font-medium">{String(i + 1).padStart(2, '0')}</td>
                <td>{imp.hazard}</td>
                <td>{imp.probability}</td>
                <td>{imp.severity}</td>
                <td>{imp.grossRiskLevel}</td>
                <td>
                  {imp.riskClassification && (
                    <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold text-white"
                      style={{ backgroundColor: riskColor(imp.riskClassification) }}>
                      {imp.riskClassification}
                    </span>
                  )}
                </td>
                <td>{imp.actions}</td>
                <td>{imp.responsible}</td>
                <td>{imp.deadline ? new Date(imp.deadline + 'T12:00:00').toLocaleDateString('pt-BR') : ''}</td>
                <td>{imp.attenuationProbability}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </>
    )}
  </section>
);
