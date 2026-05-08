import React, { useEffect, useRef } from 'react';
import type { AETProject, AETFunction, AETImprovement, AETEquipmentItem, AETEPIItem, ErgonomicRisk } from '../../types';
import { DEFAULT_AET_INTRO_ERGONOMIA, DEFAULT_AET_INTRO_OBJETIVO, DEFAULT_AET_INTRO_METODOLOGIA } from '../../types';
import { Field, TocLine, PieChart, riskColor, riskLevelColor, ReportToolbar, PDF_STYLES, CoverPage, useSectionPages } from './components/ReportCommon';

// ── AET Function Section ─────────────────────────────────────────────────────

interface FunctionSectionProps {
  func: AETFunction;
  sectionNum: string;
}

const FunctionSection: React.FC<FunctionSectionProps> = ({ func, sectionNum }) => (
  <section className="px-12 py-10 print:break-before-page">

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

    <Field label="4.2 Origem da Demanda" value={func.demandOrigin} />
    <Field label="4.3 Objetivo da Análise" value={func.objective} />

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

    {(func.effortDynamic || func.effortStatic) && (
      <>
        <h3>4.10 Exigências do Trabalho</h3>
        <Field label="Esforços Dinâmicos" value={func.effortDynamic} />
        <Field label="Esforços Estáticos" value={func.effortStatic} />
      </>
    )}

    {func.timeAnalysis && (
      <>
        <h3>4.11 Cronoanálise</h3>
        <Field label="" value={func.timeAnalysis} />
      </>
    )}

    {func.loadCarrying && (
      <>
        <h3>4.12 Carregamento de Peso</h3>
        <Field label="" value={func.loadCarrying} />
      </>
    )}

    {func.displacement && (
      <>
        <h3>4.13 Deslocamentos</h3>
        <Field label="Deambulação diária estimada" value={func.displacement} />
      </>
    )}

    {func.maintenanceDesc && (
      <>
        <h3>4.14 Manutenção</h3>
        <Field label="Como é feita" value={func.maintenanceDesc} />
        <Field label="Causa atraso no ciclo?" value={func.maintenanceCausesDelay} />
      </>
    )}

    {func.logisticsInfluence && (
      <>
        <h3>4.15 Logística</h3>
        <Field label="Influencia a atividade?" value={func.logisticsInfluence} />
        <Field label="Como causa atraso" value={func.logisticsDelay} />
      </>
    )}

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

    {((func.equipmentList?.length || 0) > 0 || func.equipProblems) && (
      <>
        <h3>4.17 Equipamentos e Materiais</h3>
        {(func.equipmentList || []).length > 0 && (
          <table>
            <thead>
              <tr>
                <th>Equipamento</th><th>Qtd</th><th>Dimensões</th>
                <th>Funcionamento</th><th>Condição</th><th>Observações</th>
              </tr>
            </thead>
            <tbody>
              {(func.equipmentList || []).map((eq: AETEquipmentItem) => (
                <tr key={eq.id}>
                  <td>{eq.name}</td><td>{eq.quantity}</td><td>{eq.dimensions}</td>
                  <td style={{ textTransform: 'capitalize' }}>{eq.principle}</td>
                  <td>{eq.condition}</td><td>{eq.observations}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <Field label="Problemas aparentes" value={func.equipProblems} />
      </>
    )}

    {(func.epiList?.length || 0) > 0 && (
      <>
        <h4>EPIs Utilizados</h4>
        <table>
          <thead>
            <tr>
              <th>EPI</th><th>Obrigatório</th><th>Eventual</th>
              <th>Local de uso</th><th>Observações</th>
            </tr>
          </thead>
          <tbody>
            {(func.epiList || []).map((epi: AETEPIItem) => (
              <tr key={epi.id}>
                <td>{epi.name}</td>
                <td className="text-center">{epi.mandatory ? '✔' : '—'}</td>
                <td className="text-center">{epi.occasional ? '✔' : '—'}</td>
                <td>{epi.location}</td><td>{epi.observations}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </>
    )}

    {(func.cyclePrescribed || func.cycleReal) && (
      <>
        <h3>4.18 Modo Operatório / Ciclo Operacional</h3>
        <Field label="Tarefa Prescrita" value={func.cyclePrescribed} />
        <Field label="Observação sistemática (tarefa real)" value={func.cycleReal} />
      </>
    )}

    {(func.postureSittingPct > 0 || func.postureStandingPct > 0 || func.postureWalkingPct > 0) && (
      <>
        <h3>4.19 Predominância Postural</h3>
        <div className="my-6">
          <PieChart data={[
            { label: 'Sentado',  pct: func.postureSittingPct  || 0, color: '#0d9488' },
            { label: 'Em pé',   pct: func.postureStandingPct  || 0, color: '#f59e0b' },
            { label: 'Andando', pct: func.postureWalkingPct   || 0, color: '#6366f1' },
            { label: 'Agachado',pct: func.postureCrouchingPct || 0, color: '#ec4899' },
            { label: func.postureOtherDescription || 'Outro', pct: func.postureOtherPct || 0, color: '#64748b' },
          ]} />
        </div>
      </>
    )}

    {func.meioAmbiente && (
      <>
        <h3>4.20 Meio Ambiente de Trabalho</h3>
        <Field label="" value={func.meioAmbiente} />
      </>
    )}

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
                  <th>Descrição</th><th style={{ width: '7%' }}>Sim</th><th style={{ width: '7%' }}>Não</th>
                  <th>Ação Recomendada</th><th>Prazo</th><th>Responsável</th><th>Observações</th>
                </tr>
              </thead>
              <tbody>
                {func.illumination.checklist.map((c) => (
                  <tr key={c.id}>
                    <td>{c.description}</td>
                    <td className="text-center">{c.compliant === 'sim' ? '✔' : ''}</td>
                    <td className="text-center">{c.compliant === 'nao' ? '✘' : ''}</td>
                    <td>{c.recommendedAction}</td><td>{c.deadline}</td>
                    <td>{c.responsible}</td><td>{c.observations}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </>
    )}

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

    {(func.risks && func.risks.length > 0) ? (
      <>
        <h3>Propostas de Melhorias – Inventário de Risco Ergonômico</h3>
        <table className="mt-2" style={{ fontSize: '0.72rem' }}>
          <thead>
            <tr>
              <th style={{ width: '3%' }}>#</th>
              <th>Agente</th>
              <th>Fator de Risco</th>
              <th>Possível Agravo</th>
              <th>Situação Encontrada</th>
              <th>Controle Existente</th>
              <th>Proposta de Melhoria</th>
              <th style={{ width: '3%' }}>P</th>
              <th style={{ width: '3%' }}>G</th>
              <th style={{ width: '4%' }}>Score</th>
              <th style={{ width: '9%' }}>Nível</th>
              <th>Ref. Normativa</th>
              <th>Responsável</th>
              <th>Prazo</th>
            </tr>
          </thead>
          <tbody>
            {func.risks.map((risk: ErgonomicRisk, i: number) => (
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
                  <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold text-white"
                    style={{ backgroundColor: riskLevelColor(risk.riskLevel) }}>
                    {risk.riskLevel}
                  </span>
                </td>
                <td>{risk.normativeReference}</td>
                <td>{risk.responsible ?? ''}</td>
                <td>{risk.deadline ? new Date(risk.deadline + 'T12:00:00').toLocaleDateString('pt-BR') : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </>
    ) : func.improvements.length > 0 ? (
      <>
        <h3>Propostas de Melhorias – Inventário de Risco Ergonômico</h3>
        <table className="mt-2">
          <thead>
            <tr>
              <th style={{ width: '4%' }}>#</th>
              <th>Perigo Identificado</th><th>Probabilidade</th><th>Severidade</th>
              <th>Pontuação</th><th>Classificação</th><th>Medidas de Melhoria</th>
              <th>Responsável</th><th>Prazo</th><th>Atenuação</th>
            </tr>
          </thead>
          <tbody>
            {func.improvements.map((imp: AETImprovement, i: number) => (
              <tr key={imp.id}>
                <td className="text-center font-medium">{String(i + 1).padStart(2, '0')}</td>
                <td>{imp.hazard}</td><td>{imp.probability}</td><td>{imp.severity}</td>
                <td>{imp.grossRiskLevel}</td>
                <td>
                  {imp.riskClassification && (
                    <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold text-white"
                      style={{ backgroundColor: riskColor(imp.riskClassification) }}>
                      {imp.riskClassification}
                    </span>
                  )}
                </td>
                <td>{imp.actions}</td><td>{imp.responsible}</td>
                <td>{imp.deadline ? new Date(imp.deadline + 'T12:00:00').toLocaleDateString('pt-BR') : ''}</td>
                <td>{imp.attenuationProbability}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </>
    ) : null}
  </section>
);

// ── AETPreview ───────────────────────────────────────────────────────────────

export const AETPreview: React.FC<{ project: AETProject }> = ({ project }) => {
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

  const introErgonomia   = project.introErgonomia   || DEFAULT_AET_INTRO_ERGONOMIA;
  const introObjetivo    = project.introObjetivo    || DEFAULT_AET_INTRO_OBJETIVO;
  const introMetodologia = project.introMetodologia || DEFAULT_AET_INTRO_METODOLOGIA;

  const containerRef = useRef<HTMLDivElement>(null);
  const sectionIds = [
    'aet-intro',
    ...project.functions.map(f => `aet-func-${f.id}`),
    'aet-resp',
    'aet-anexos',
  ];
  const pages = useSectionPages(containerRef, sectionIds, [project]);

  return (
    <>
      <ReportToolbar projectId={project.id} />

      <div className="w-full overflow-x-auto print:overflow-visible bg-gray-100 print:bg-transparent">
        <div ref={containerRef} className="pdf-preview bg-white min-w-[800px] max-w-[210mm] mx-auto my-8 print:my-0 print:min-w-0 print:max-w-none print:w-full shadow-lg print:shadow-none">

          {/* ── Capa ── */}
          <CoverPage
            titleLines={['ANÁLISE', 'ERGONÔMICA', 'DO TRABALHO']}
            companyLogoDataUrl={project.companyLogoDataUrl}
            consultoriaLogoDataUrl={project.consultoriaLogoDataUrl}
            companyName={project.companyName || ''}
            monthYear={monthYear}
          />

          {/* ── Sumário ── */}
          <section className="pdf-page px-12 py-16 print:break-after-page">
            <h2>Sumário</h2>
            <div className="space-y-2 mt-4">
              <TocLine num="1" title="Introdução" page={pages['aet-intro']} />
              <TocLine num="1.1" title="Ergonomia" indent page={pages['aet-intro']} />
              <TocLine num="1.2" title="Análise Global da Empresa" indent page={pages['aet-intro']} />
              <TocLine num="1.3" title="Objetivo" indent page={pages['aet-intro']} />
              <TocLine num="1.4" title="Metodologia" indent page={pages['aet-intro']} />
              <TocLine num="2" title="AET – ANÁLISE ERGONÔMICA DO TRABALHO" page={pages[`aet-func-${project.functions[0]?.id}`]} />
              {project.functions.map((func, idx) => (
                <TocLine key={func.id} num={`2.${idx + 1}`} title={func.name || 'Função sem nome'} indent page={pages[`aet-func-${func.id}`]} />
              ))}
              <TocLine num="3" title="Responsabilidade Técnica" page={pages['aet-resp']} />
              <TocLine num="4" title="Anexos" page={pages['aet-anexos']} />
            </div>
          </section>

          {/* ── Cabeçalho / Rodapé repetidos ── */}
          <table className="w-full" style={{ border: 'none' }}>
            <thead>
              <tr>
                <td style={{ border: 'none', padding: 0 }}>
                  <div className="pdf-repeat-logo hidden justify-end mb-2 px-12" style={{ marginTop: '-5mm' }}>
                    {project.companyLogoDataUrl
                      ? <img src={project.companyLogoDataUrl} alt="Logo empresa" style={{ maxHeight: '48px', objectFit: 'contain', display: 'block' }} />
                      : <span className="text-xs text-gray-400 font-medium tracking-wide">Logo Cliente</span>}
                  </div>
                </td>
              </tr>
            </thead>
            <tfoot><tr><td style={{ border: 'none' }}><div className="flex justify-between items-center mt-4 px-12" /></td></tr></tfoot>
            <tbody>
              <tr>
                <td className="p-0" style={{ border: 'none' }}>

                  {/* ── 1. Introdução ── */}
                  <section id="aet-intro" className="pdf-page px-12 py-8 print:break-after-page">
                    <h2>1. Introdução</h2>
                    <h3>1.1 Ergonomia</h3>
                    <div className="field-value text-slate-700" dangerouslySetInnerHTML={{ __html: introErgonomia }} />
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
                    <div className="field-value text-slate-700" dangerouslySetInnerHTML={{ __html: introObjetivo }} />
                    <h3>1.4 Metodologia</h3>
                    <div className="field-value text-slate-700" dangerouslySetInnerHTML={{ __html: introMetodologia }} />
                  </section>

                  {/* ── Funções ── */}
                  {project.functions.map((func, fIdx) => (
                    <div key={func.id} id={`aet-func-${func.id}`}>
                      <FunctionSection func={func} sectionNum={`2.${fIdx + 1}`} />
                    </div>
                  ))}

                  {/* ── 3. Responsabilidade Técnica ── */}
                  <section id="aet-resp" className="pdf-page px-12 py-14 print:break-before-page">
                    <h2>3. Responsabilidade Técnica</h2>
                    <div className="mt-16 flex flex-col items-center justify-center">
                      <div className="flex flex-col items-center w-full max-w-sm text-center">
                        {project.evaluatorSignatureDataUrl && (
                          <img src={project.evaluatorSignatureDataUrl} alt="Assinatura" className="max-h-20 mb-2 object-contain" />
                        )}
                        <div className="w-full border-t border-black mb-3" />
                        <p className="font-medium text-gray-900 mb-1">Responsável técnico pela avaliação</p>
                        {project.evaluatorName      && <p className="text-gray-800 mb-1">{project.evaluatorName}</p>}
                        {project.evaluatorFormation && <p className="text-gray-800 mb-1">{project.evaluatorFormation}</p>}
                        {project.evaluatorCompany   && <p className="text-gray-800 mb-1">{project.evaluatorCompany}</p>}
                        {project.evaluatorCrefito   && <p className="text-gray-800">{project.evaluatorCrefito}</p>}
                      </div>
                    </div>
                  </section>

                  {/* ── 4. Anexos ── */}
                  {project.functions.some((f) => f.images?.length > 0) && (
                    <section id="aet-anexos" className="pdf-page px-12 py-14 print:break-before-page">
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
