import React, { useEffect } from 'react';
import type { AETProject, AETFunction, ErgonomicRisk, BiomechanicalItem } from '../../types';
import { DEFAULT_AEP_INTRO_ERGONOMIA, DEFAULT_AEP_INTRO_OBJETIVO, DEFAULT_AEP_INTRO_METODOLOGIA } from '../../types';
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

// ── Helpers ──────────────────────────────────────────────────────────────────

const assessColor: Record<string, { bg: string; color: string }> = {
  'OK':      { bg: '#dcfce7', color: '#14532d' },
  'Atenção': { bg: '#fef9c3', color: '#713f12' },
  'Crítico': { bg: '#fee2e2', color: '#7f1d1d' },
  'N.A.':    { bg: '#f1f5f9', color: '#64748b' },
};

const psyClassifColor: Record<string, { bg: string; color: string }> = {
  VERDE:    { bg: '#dcfce7', color: '#14532d' },
  AMARELO:  { bg: '#fef9c3', color: '#713f12' },
  VERMELHO: { bg: '#fee2e2', color: '#7f1d1d' },
};

const BiomecTable: React.FC<{ title: string; items: BiomechanicalItem[] }> = ({ title, items }) => (
  <>
    <h4 style={{ marginTop: '16px', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>{title}</h4>
    <table style={{ fontSize: '0.72rem' }}>
      <thead>
        <tr>
          <th style={{ width: '40%' }}>Fator de Risco</th>
          <th style={{ width: '12%' }}>Avaliação</th>
          <th>Descrição / Observação</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item, i) => {
          const ac = item.assessment ? assessColor[item.assessment] : null;
          return (
            <tr key={i}>
              <td>{item.factor}</td>
              <td style={{ textAlign: 'center' }}>
                {item.assessment ? (
                  <span style={{ display: 'inline-block', padding: '1px 8px', borderRadius: '9999px', fontWeight: 700, fontSize: '0.65rem', background: ac?.bg, color: ac?.color }}>
                    {item.assessment}
                  </span>
                ) : '—'}
              </td>
              <td>{item.description || '—'}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </>
);

// ── AEP Function Section ─────────────────────────────────────────────────────

const AEPFunctionSection: React.FC<{ func: AETFunction; sectionNum: string }> = ({ func, sectionNum }) => {
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

    return (
      <section className="pdf-page px-12 py-10 print:break-before-page">
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
            <h3>2. Caracterização do Trabalho</h3>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginTop: '8px' }}>2.1 Descrição do Processo e Ciclo de Trabalho</h4>
            <Field label="Processo" value={work.processDescription} />
            <Field label="Ciclo de Trabalho" value={work.workCycleDescription} />

            <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginTop: '12px' }}>2.2 Organização do Trabalho</h4>
            <table style={{ fontSize: '0.75rem' }}>
              <tbody>
                <tr><th style={{ width: '25%' }}>Jornada</th><td>{work.workOrganization.workday || '—'}</td><th style={{ width: '25%' }}>Escala / Turno</th><td>{work.workOrganization.scale || '—'}</td></tr>
                <tr><th>Horas Extras</th><td>{work.workOrganization.overtime || '—'}</td><th>Intervalo Refeição</th><td>{work.workOrganization.lunchBreak || '—'}</td></tr>
                <tr><th>Outras Pausas</th><td>{work.workOrganization.otherBreaks || '—'}</td><th>Rodízio de Tarefas</th><td>{work.workOrganization.taskRotation || '—'}</td></tr>
                <tr><th>Diálogos de Segurança</th><td colSpan={3}>{work.workOrganization.safetyDialogues || '—'}</td></tr>
              </tbody>
            </table>

            <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginTop: '12px' }}>2.3 Ferramentas e Materiais</h4>
            <Field label="Ferramentas / Materiais" value={work.toolsAndMaterials.description} />
            <Field label="EPIs" value={work.toolsAndMaterials.epis} />
            {work.toolsAndMaterials.others && <Field label="Outros" value={work.toolsAndMaterials.others} />}
          </>
        )}

        {/* 3. Registro Fotográfico */}
        {aep.photographicRecords.length > 0 && (
          <>
            <h3>3. Registro Fotográfico</h3>
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
        <h3>4. Biomecânica</h3>
        <BiomecTable title="4.1 Posturas e Alcances"          items={bio.postureAndReach} />
        <BiomecTable title="4.2 Repetitividade e Ritmo"        items={bio.repetitivenessAndRhythm} />
        <BiomecTable title="4.3 Força e Exigência Física"      items={bio.forceAndPhysicalDemand} />
        <BiomecTable title="4.4 Movimentação Manual de Cargas" items={bio.manualMaterialHandling} />
        <BiomecTable title="4.5 Mobiliário e Posto de Trabalho" items={bio.furnitureAndWorkstation} />

        <h4 style={{ marginTop: '16px', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>4.6 Conforto Ambiental</h4>
        <table style={{ fontSize: '0.72rem' }}>
          <thead><tr><th>Fator</th><th>Queixa</th><th>Valor Medido</th><th>Descrição</th></tr></thead>
          <tbody>
            <tr><td>Iluminação</td><td>{env.lightingComplaint || '—'}</td><td>{env.lightingValue || '—'}</td><td>{env.lightingDescription || '—'}</td></tr>
            <tr><td>Ruído</td><td>{env.noiseComplaint || '—'}</td><td>{env.noiseValue || '—'}</td><td>{env.noiseDescription || '—'}</td></tr>
            <tr><td>Temperatura</td><td>{env.temperatureComplaint || '—'}</td><td>{env.temperatureValue || '—'}</td><td>{env.temperatureDescription || '—'}</td></tr>
          </tbody>
        </table>

        {/* 5. Ferramentas Científicas */}
        {aep.scientificTools.length > 0 && (
          <>
            <h3>5. Ferramentas Científicas</h3>
            {aep.scientificTools.map((tool, i) => (
              <div key={tool.id} style={{ marginBottom: '12px' }}>
                <p style={{ fontWeight: 600, fontSize: '0.85rem', color: '#374151' }}>{i + 1}. {tool.toolName}</p>
                <Field label="Resultado" value={tool.result} />
                <Field label="Interpretação" value={tool.interpretation} />
                <Field label="Recomendação" value={tool.recommendation} />
                {tool.imageDataUrl && (
                  <img src={tool.imageDataUrl} alt={tool.toolName}
                    style={{ maxWidth: '280px', marginTop: '6px', borderRadius: '4px', border: '1px solid #e5e7eb' }} />
                )}
              </div>
            ))}
          </>
        )}

        {/* 6. Psicossocial */}
        {psy.some(q => q.score !== '') && (
          <>
            <h3>6. Avaliação Psicossocial</h3>
            <table style={{ fontSize: '0.68rem' }}>
              <thead>
                <tr>
                  <th style={{ width: '22%' }}>Grupo</th>
                  <th>Fator Psicossocial</th>
                  <th style={{ width: '8%' }}>Pontuação</th>
                  <th style={{ width: '20%' }}>Observações</th>
                </tr>
              </thead>
              <tbody>
                {psy.map(q => (
                  <tr key={q.id}>
                    <td>{q.group}</td>
                    <td>{q.question}{q.inverted ? ' (invertida)' : ''}</td>
                    <td style={{ textAlign: 'center' }}>{q.score !== '' ? String(q.score) : '—'}</td>
                    <td>{q.comments || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
        )}

        {/* 7. Classificação de Risco / Gatilhos AET */}
        {trigs.some(t => t.answer !== '') && (
          <>
            <h3>7. Classificação de Risco — Gatilhos para AET</h3>
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
                background: func.requiresAET ? '#dc2626' : '#22c55e', color: '#fff',
                fontSize: '0.82rem', fontWeight: 600,
              }}>
                {func.requiresAET ? 'Requer AET' : 'Não requer AET'}
              </span>
            </div>
            {aep.finalGuidance && <Field label="Orientação Final" value={aep.finalGuidance} />}
            {aep.decisionJustification && <Field label="Justificativa da Decisão" value={aep.decisionJustification} />}
          </>
        )}

        {/* 8. Plano de Ação RACI */}
        {raci.length > 0 && (
          <>
            <h3>8. Plano de Ação RACI</h3>
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

        {/* 9. Responsável Técnico (por função) */}
        {(resp.name || resp.registration) && (
          <>
            <h3>9. Responsável Técnico</h3>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px' }}>
              {resp.signatureDataUrl && (
                <img src={resp.signatureDataUrl} alt="Assinatura" style={{ maxHeight: '60px', marginBottom: '8px' }} />
              )}
              <div style={{ borderTop: '1px solid #000', width: '220px', paddingTop: '6px', textAlign: 'center' }}>
                {resp.name       && <p style={{ fontWeight: 600, fontSize: '0.85rem' }}>{resp.name}</p>}
                {resp.formation  && <p style={{ fontSize: '0.78rem', color: '#4b5563' }}>{resp.formation}</p>}
                {resp.company    && <p style={{ fontSize: '0.78rem', color: '#4b5563' }}>{resp.company}</p>}
                {resp.registration && <p style={{ fontSize: '0.78rem', color: '#4b5563' }}>{resp.registration}</p>}
              </div>
            </div>
          </>
        )}
      </section>
    );
  }

  // ── LEGACY fallback (funções sem aep estruturado) ────────────────────────
  return (
    <section className="pdf-page px-12 py-10 print:break-before-page">
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

  const introErgonomia   = project.introErgonomia   || DEFAULT_AEP_INTRO_ERGONOMIA;
  const introObjetivo    = project.introObjetivo    || DEFAULT_AEP_INTRO_OBJETIVO;
  const introMetodologia = project.introMetodologia || DEFAULT_AEP_INTRO_METODOLOGIA;

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
