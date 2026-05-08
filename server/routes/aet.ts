import { Router } from 'express';
import type { PoolClient } from 'pg';
import { pool } from '../db.js';

const router = Router();

// ─── Helpers ────────────────────────────────────────────────────────────────

function str(v: unknown): string {
  return (v as string) ?? '';
}

function num(v: unknown): number | null {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return isNaN(n) ? null : n;
}

function dt(v: unknown): string | null {
  if (!v) return null;
  const s = String(v);
  return s.includes('T') ? s.split('T')[0] : s || null;
}

function isUUID(s: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
}

function uuid(v: unknown): string | null {
  if (!v) return null;
  const s = String(v);
  return isUUID(s) ? s : null;
}

// ─── Save AET project (decompose JSON → relational tables) ──────────────────

async function saveAET(client: PoolClient, project: any): Promise<void> {
  // 1. Upsert project header
  await client.query(
    `INSERT INTO aet_projetos
       (id, intro_ergonomia, intro_objetivo, intro_metodologia,
        nome_avaliador, formacao_avaliador, crefito_avaliador, empresa_avaliador, assinatura_avaliador,
        data, logo_consultoria, logo_empresa, logo_responsavel,
        empresa_id, unidade_id)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::date,$11,$12,$13,$14,$15)
     ON CONFLICT (id) DO UPDATE SET
       intro_ergonomia=$2, intro_objetivo=$3, intro_metodologia=$4,
       nome_avaliador=$5, formacao_avaliador=$6, crefito_avaliador=$7, empresa_avaliador=$8,
       assinatura_avaliador=$9, data=$10::date, logo_consultoria=$11, logo_empresa=$12,
       logo_responsavel=$13, empresa_id=$14, unidade_id=$15, atualizado_em=NOW()`,
    [
      project.id,
      str(project.introErgonomia), str(project.introObjetivo), str(project.introMetodologia),
      str(project.evaluatorName), str(project.evaluatorFormation),
      str(project.evaluatorCrefito), str(project.evaluatorCompany), str(project.evaluatorSignatureDataUrl),
      dt(project.date), str(project.consultoriaLogoDataUrl), str(project.companyLogoDataUrl),
      str(project.responsibleLogoDataUrl),
      uuid(project.empresaId), uuid(project.unidadeId),
    ]
  );

  // 2. Determine functions to delete
  const { rows: dbFuncs } = await client.query(
    'SELECT id FROM aet_funcoes WHERE projeto_id=$1', [project.id]
  );
  const dbIds = new Set<string>(dbFuncs.map((r: any) => r.id));
  const incomingIds = new Set<string>((project.functions ?? []).map((f: any) => f.id));
  for (const did of dbIds) {
    if (!incomingIds.has(did)) {
      await client.query('DELETE FROM aet_funcoes WHERE id=$1', [did]);
    }
  }

  // 3. Upsert each function and its child tables
  for (let i = 0; i < (project.functions ?? []).length; i++) {
    const f = project.functions[i];
    const ilum = f.illumination ?? {};

    await client.query(
      `INSERT INTO aet_funcoes
         (id, projeto_id, ordem,
          nome_funcao, unidade, setor, data_analise, num_funcionarios,
          origem_demanda, objetivo, demanda_encontrada,
          situacao_mercado, produto, local_producao,
          dimensao_producao, metas_producao, analise_qualidade, avaliador_qualidade,
          turnos, inicio_turno, fim_turno, dias_trabalho, horas_extras, pausas,
          rodizio_tarefas, distancia_banheiro, condicao_banheiro, organograma_hierarquia, descricao_posto,
          formacao_colaborador, turno_colaborador, opiniao_genero, opiniao_idade, opiniao_tempo,
          opiniao_objetivo, opiniao_termico, opiniao_ventilacao, opiniao_ventilacao_desc,
          opiniao_iluminacao_sens, opiniao_iluminacao_desc, opiniao_acustica, opiniao_epi,
          opiniao_equipamento, opiniao_ciclo, opiniao_layout, opiniao_dificuldades, opiniao_pressao,
          opiniao_relacionamento, opiniao_lideranca, opiniao_manutencao_influencia, opiniao_manutencao_atraso,
          opiniao_intercorrencias,
          esforco_dinamico, esforco_estatico, cronoanalise, carregamento_carga, deslocamento,
          manutencao_desc, manutencao_causa_atraso, logistica_influencia, logistica_atraso,
          retrabalho_desc, retrabalho_semana, retrabalho_nao_aplicavel,
          usa_equipamento, usa_epi, problemas_equipamento,
          ciclo_prescrito, ciclo_real,
          postura_sentado_pct, postura_em_pe_pct, postura_caminhando_pct,
          postura_agachado_pct, postura_outro_pct, postura_outro_descricao,
          meio_ambiente, diagnostico, nivel_risco, pontuacao_rula,
          ilum_local, ilum_data, ilum_tipo_iluminacao, ilum_introducao, ilum_objetivo,
          ilum_justificativa, ilum_descricao_ambiente, ilum_sistema_iluminacao, ilum_atividades,
          ilum_criterios, ilum_valores_medidos, ilum_valor_referencia, ilum_formula,
          ilum_resultado_lux, ilum_interpretacao, ilum_referencia_normativa, ilum_tipo_modelo,
          ilum_conclusao, ilum_texto_conclusao, ilum_lux_referencia,
          unidade_id, setor_id)
       VALUES
         ($1,$2,$3,$4,$5,$6,$7::date,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,
          $24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34,$35,$36,$37,$38,$39,$40,$41,$42,$43,$44,$45,
          $46,$47,$48,$49,$50,$51,$52,$53,$54,$55,$56,$57,$58,$59,$60,$61,$62,$63,$64,$65,$66,$67,
          $68,$69,$70,$71,$72,$73,$74,$75,$76,$77,$78,$79,$80,$81,$82,$83,$84,$85,$86,$87,$88,$89,
          $90,$91,$92,$93,$94,$95,$96,$97,$98,$99,$100,$101)
       ON CONFLICT (id) DO UPDATE SET
         projeto_id=$2, ordem=$3, nome_funcao=$4, unidade=$5, setor=$6, data_analise=$7::date,
         num_funcionarios=$8, origem_demanda=$9, objetivo=$10, demanda_encontrada=$11,
         situacao_mercado=$12, produto=$13, local_producao=$14, dimensao_producao=$15,
         metas_producao=$16, analise_qualidade=$17, avaliador_qualidade=$18,
         turnos=$19, inicio_turno=$20, fim_turno=$21, dias_trabalho=$22, horas_extras=$23, pausas=$24,
         rodizio_tarefas=$25, distancia_banheiro=$26, condicao_banheiro=$27,
         organograma_hierarquia=$28, descricao_posto=$29,
         formacao_colaborador=$30, turno_colaborador=$31, opiniao_genero=$32, opiniao_idade=$33, opiniao_tempo=$34,
         opiniao_objetivo=$35, opiniao_termico=$36, opiniao_ventilacao=$37, opiniao_ventilacao_desc=$38,
         opiniao_iluminacao_sens=$39, opiniao_iluminacao_desc=$40, opiniao_acustica=$41, opiniao_epi=$42,
         opiniao_equipamento=$43, opiniao_ciclo=$44, opiniao_layout=$45, opiniao_dificuldades=$46,
         opiniao_pressao=$47, opiniao_relacionamento=$48, opiniao_lideranca=$49,
         opiniao_manutencao_influencia=$50, opiniao_manutencao_atraso=$51, opiniao_intercorrencias=$52,
         esforco_dinamico=$53, esforco_estatico=$54, cronoanalise=$55, carregamento_carga=$56,
         deslocamento=$57, manutencao_desc=$58, manutencao_causa_atraso=$59,
         logistica_influencia=$60, logistica_atraso=$61, retrabalho_desc=$62, retrabalho_semana=$63,
         retrabalho_nao_aplicavel=$64, usa_equipamento=$65, usa_epi=$66, problemas_equipamento=$67,
         ciclo_prescrito=$68, ciclo_real=$69,
         postura_sentado_pct=$70, postura_em_pe_pct=$71, postura_caminhando_pct=$72,
         postura_agachado_pct=$73, postura_outro_pct=$74, postura_outro_descricao=$75,
         meio_ambiente=$76, diagnostico=$77, nivel_risco=$78, pontuacao_rula=$79,
         ilum_local=$80, ilum_data=$81, ilum_tipo_iluminacao=$82, ilum_introducao=$83, ilum_objetivo=$84,
         ilum_justificativa=$85, ilum_descricao_ambiente=$86, ilum_sistema_iluminacao=$87, ilum_atividades=$88,
         ilum_criterios=$89, ilum_valores_medidos=$90, ilum_valor_referencia=$91, ilum_formula=$92,
         ilum_resultado_lux=$93, ilum_interpretacao=$94, ilum_referencia_normativa=$95, ilum_tipo_modelo=$96,
         ilum_conclusao=$97, ilum_texto_conclusao=$98, ilum_lux_referencia=$99,
         unidade_id=$100, setor_id=$101, atualizado_em=NOW()`,
      [
        // $1–$8
        f.id, project.id, i,
        str(f.name), str(f.unit), str(f.sector), dt(f.analysisDate), str(f.numEmployees),
        // $9–$18
        str(f.demandOrigin), str(f.objective), str(f.demandFound),
        str(f.marketSituation), str(f.product), str(f.productionLocation),
        str(f.productionDimension), str(f.productionGoals), str(f.qualityAnalysis), str(f.qualityEvaluator),
        // $19–$29
        str(f.shifts), str(f.shiftStart), str(f.shiftEnd), str(f.workDays), str(f.overtime), str(f.pauses),
        str(f.taskRotation), str(f.bathroomDistance), str(f.bathroomCondition),
        str(f.hierarchyOrganogram), str(f.workspaceDescription),
        // $30–$34
        str(f.collabFormation), str(f.collabTurn), str(f.opinionGender), str(f.opinionAge), str(f.opinionTime),
        // $35–$52 (worker opinions)
        str(f.opinionObjective), str(f.opinionThermal), str(f.opinionVentilation), str(f.opinionVentilationDesc),
        str(f.opinionLightingSens), str(f.opinionLightingDesc), str(f.opinionAcoustics), str(f.opinionEPI),
        str(f.opinionEquip), str(f.opinionCycle), str(f.opinionLayout), str(f.opinionDifficulties),
        str(f.opinionPressure), str(f.opinionRelationship), str(f.opinionLeadership),
        str(f.opinionMaintenanceInfluence), str(f.opinionMaintenanceDelay), str(f.opinionIntercurrences),
        // $53–$67
        str(f.effortDynamic), str(f.effortStatic), str(f.timeAnalysis), str(f.loadCarrying), str(f.displacement),
        str(f.maintenanceDesc), str(f.maintenanceCausesDelay),
        str(f.logisticsInfluence), str(f.logisticsDelay),
        str(f.reworkDesc), str(f.reworkWeek), f.reworkNotApplicable ?? false,
        f.usesEquipment ?? false, f.usesEPI ?? false, str(f.equipProblems),
        // $68–$79
        str(f.cyclePrescribed), str(f.cycleReal),
        num(f.postureSittingPct) ?? 0, num(f.postureStandingPct) ?? 0, num(f.postureWalkingPct) ?? 0,
        num(f.postureCrouchingPct) ?? 0, num(f.postureOtherPct) ?? 0, str(f.postureOtherDescription),
        str(f.meioAmbiente), str(f.diagnosis), str(f.riskLevel), str(f.rulaScore),
        // $80–$99 (illumination scalar fields)
        str(ilum.location), str(ilum.date), str(ilum.lightingType), str(ilum.introduction),
        str(ilum.objective), str(ilum.justification), str(ilum.environmentDescription),
        str(ilum.lightingSystem), str(ilum.activities), str(ilum.criteria), str(ilum.measuredValues),
        str(ilum.referenceValue), str(ilum.formula), str(ilum.resultLux), str(ilum.interpretation),
        str(ilum.normativeReference), str(ilum.modelType),
        str(ilum.conclusion) || '', str(ilum.conclusionText), num(ilum.referenceLux) ?? 0,
        // $100–$101 (FK relationships)
        uuid(f.unidadeId), uuid(f.setorId),
      ]
    );

    // ── Equipamentos ───────────────────────────────────────────────────────
    await client.query('DELETE FROM aet_funcao_equipamentos WHERE funcao_id=$1', [f.id]);
    for (let j = 0; j < (f.equipmentList ?? []).length; j++) {
      const e = f.equipmentList[j];
      await client.query(
        `INSERT INTO aet_funcao_equipamentos (id,funcao_id,nome,quantidade,dimensoes,principio,condicao,observacoes,ordem)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [e.id, f.id, str(e.name), str(e.quantity), str(e.dimensions), str(e.principle), str(e.condition), str(e.observations), j]
      );
    }

    // ── EPIs ───────────────────────────────────────────────────────────────
    await client.query('DELETE FROM aet_funcao_epis WHERE funcao_id=$1', [f.id]);
    for (let j = 0; j < (f.epiList ?? []).length; j++) {
      const e = f.epiList[j];
      await client.query(
        `INSERT INTO aet_funcao_epis (id,funcao_id,nome,obrigatorio,eventual,local,observacoes,ordem)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [e.id, f.id, str(e.name), e.mandatory ?? false, e.occasional ?? false, str(e.location), str(e.observations), j]
      );
    }

    // ── Métodos científicos ────────────────────────────────────────────────
    await client.query('DELETE FROM aet_funcao_metodos_cientificos WHERE funcao_id=$1', [f.id]);
    for (let j = 0; j < (f.scientificMethods ?? []).length; j++) {
      const m = f.scientificMethods[j];
      const modelId = isUUID(str(m.modelId)) ? str(m.modelId) : null;
      await client.query(
        `INSERT INTO aet_funcao_metodos_cientificos
           (id,funcao_id,modelo_id,nome_metodo,descricao,resultado,classificacao_risco,interpretacao,imagem_url,recomendacoes,ordem)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
        [m.id, f.id, modelId, str(m.methodName), str(m.description), str(m.result), str(m.riskClassification), str(m.interpretation), m.imageDataUrl ?? null, str(m.recommendations), j]
      );
    }

    // ── Pontos de iluminância NHO11 ────────────────────────────────────────
    await client.query('DELETE FROM aet_funcao_iluminancia_pontos WHERE funcao_id=$1', [f.id]);
    for (let j = 0; j < (ilum.measurementPoints ?? []).length; j++) {
      const pt = ilum.measurementPoints[j];
      await client.query(
        'INSERT INTO aet_funcao_iluminancia_pontos (id,funcao_id,rotulo,lux,ordem) VALUES ($1,$2,$3,$4,$5)',
        [pt.id ?? undefined, f.id, str(pt.label), num(pt.lux), j]
      );
    }

    // ── Checklist de iluminação ────────────────────────────────────────────
    await client.query('DELETE FROM aet_funcao_iluminancia_checklist WHERE funcao_id=$1', [f.id]);
    for (let j = 0; j < (ilum.checklist ?? []).length; j++) {
      const c = ilum.checklist[j];
      await client.query(
        `INSERT INTO aet_funcao_iluminancia_checklist
           (id,funcao_id,descricao,conforme,acao_recomendada,prazo,responsavel,observacoes,ordem)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [c.id, f.id, str(c.description), str(c.compliant), str(c.recommendedAction), str(c.deadline), str(c.responsible), str(c.observations), j]
      );
    }

    // ── Imagens ────────────────────────────────────────────────────────────
    await client.query('DELETE FROM aet_funcao_imagens WHERE funcao_id=$1', [f.id]);
    for (let j = 0; j < (f.images ?? []).length; j++) {
      const img = f.images[j];
      await client.query(
        'INSERT INTO aet_funcao_imagens (id,funcao_id,categoria,imagem_url,legenda,ordem) VALUES ($1,$2,$3,$4,$5,$6)',
        [img.id, f.id, str(img.category), str(img.dataUrl), str(img.caption), j]
      );
    }

    // ── Riscos ergonômicos ─────────────────────────────────────────────────
    await client.query('DELETE FROM aet_funcao_riscos WHERE funcao_id=$1', [f.id]);
    for (let j = 0; j < (f.risks ?? []).length; j++) {
      const r = f.risks[j];
      const prob = num(r.probability);
      const grav = num(r.severity);
      await client.query(
        `INSERT INTO aet_funcao_riscos
           (id,funcao_id,agente,fator_risco,efeito_saude,situacao_encontrada,controle_existente,
            proposta_melhoria,probabilidade,gravidade,nivel_risco,referencia_normativa,
            imagem_evidencia_url,responsavel,prazo,status,ordem)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)`,
        [r.id, f.id, str(r.agent), str(r.riskFactor), str(r.possibleHealthEffect),
         str(r.foundSituation), str(r.existingControl), str(r.improvementProposal),
         prob, grav, str(r.riskLevel), str(r.normativeReference),
         r.evidenceImageDataUrl ?? null, str(r.responsible), str(r.deadline), str(r.status), j]
      );
    }

    // ── Melhorias ──────────────────────────────────────────────────────────
    await client.query('DELETE FROM aet_funcao_melhorias WHERE funcao_id=$1', [f.id]);
    for (let j = 0; j < (f.improvements ?? []).length; j++) {
      const m = f.improvements[j];
      await client.query(
        `INSERT INTO aet_funcao_melhorias
           (id,funcao_id,foto_url,perigo,probabilidade,gravidade,nivel_risco_bruto,classificacao_risco,
            avaliacao_risco,acoes,probabilidade_atenuacao,prazo,responsavel,observacoes,ordem)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
        [m.id, f.id, m.photoDataUrl ?? null, str(m.hazard), str(m.probability), str(m.severity),
         str(m.grossRiskLevel), str(m.riskClassification), str(m.riskEvaluation), str(m.actions),
         str(m.attenuationProbability), str(m.deadline), str(m.responsible), str(m.observations), j]
      );
    }

    // ── Respostas do checklist ─────────────────────────────────────────────
    await client.query('DELETE FROM aet_funcao_checklist WHERE funcao_id=$1', [f.id]);
    for (const ca of f.checklistAnswers ?? []) {
      const qId = isUUID(str(ca.questionId)) ? str(ca.questionId) : null;
      if (!qId) continue;
      await client.query(
        `INSERT INTO aet_funcao_checklist (funcao_id,pergunta_id,pergunta_id_str,resposta)
         VALUES ($1,$2,$3,$4)
         ON CONFLICT (funcao_id,pergunta_id) DO UPDATE SET resposta=$4`,
        [f.id, qId, str(ca.questionId), str(ca.answer)]
      );
    }
  }
}

// ─── Load all AET projects (reassemble relational → JSON) ───────────────────

async function loadAllAET(client: PoolClient): Promise<any[]> {
  const { rows: projects } = await client.query('SELECT * FROM aet_projetos ORDER BY criado_em');
  const result: any[] = [];

  for (const p of projects) {
    const { rows: funcoes } = await client.query(
      'SELECT * FROM aet_funcoes WHERE projeto_id=$1 ORDER BY ordem', [p.id]
    );

    const functions: any[] = [];
    for (const f of funcoes) {
      const [
        { rows: equipamentos },
        { rows: epis },
        { rows: metodos },
        { rows: ilumPontos },
        { rows: ilumChecklist },
        { rows: imagens },
        { rows: riscos },
        { rows: melhorias },
        { rows: checklistResp },
      ] = await Promise.all([
        client.query('SELECT * FROM aet_funcao_equipamentos WHERE funcao_id=$1 ORDER BY ordem', [f.id]),
        client.query('SELECT * FROM aet_funcao_epis WHERE funcao_id=$1 ORDER BY ordem', [f.id]),
        client.query('SELECT * FROM aet_funcao_metodos_cientificos WHERE funcao_id=$1 ORDER BY ordem', [f.id]),
        client.query('SELECT * FROM aet_funcao_iluminancia_pontos WHERE funcao_id=$1 ORDER BY ordem', [f.id]),
        client.query('SELECT * FROM aet_funcao_iluminancia_checklist WHERE funcao_id=$1 ORDER BY ordem', [f.id]),
        client.query('SELECT * FROM aet_funcao_imagens WHERE funcao_id=$1 ORDER BY ordem', [f.id]),
        client.query('SELECT * FROM aet_funcao_riscos WHERE funcao_id=$1 ORDER BY ordem', [f.id]),
        client.query('SELECT * FROM aet_funcao_melhorias WHERE funcao_id=$1 ORDER BY ordem', [f.id]),
        client.query('SELECT * FROM aet_funcao_checklist WHERE funcao_id=$1', [f.id]),
      ]);

      functions.push({
        id: f.id,
        unidadeId: f.unidade_id ?? null,
        setorId: f.setor_id ?? null,
        name: f.nome_funcao ?? '',
        unit: f.unidade ?? '',
        sector: f.setor ?? '',
        analysisDate: f.data_analise ? (f.data_analise instanceof Date ? f.data_analise.toISOString().split('T')[0] : String(f.data_analise)) : '',
        numEmployees: f.num_funcionarios ?? '',
        demandOrigin: f.origem_demanda ?? '',
        objective: f.objetivo ?? '',
        demandFound: f.demanda_encontrada ?? '',
        marketSituation: f.situacao_mercado ?? '',
        product: f.produto ?? '',
        productionLocation: f.local_producao ?? '',
        productionDimension: f.dimensao_producao ?? '',
        productionGoals: f.metas_producao ?? '',
        qualityAnalysis: f.analise_qualidade ?? '',
        qualityEvaluator: f.avaliador_qualidade ?? '',
        shifts: f.turnos ?? '',
        shiftStart: f.inicio_turno ?? '',
        shiftEnd: f.fim_turno ?? '',
        workDays: f.dias_trabalho ?? '',
        overtime: f.horas_extras ?? '',
        pauses: f.pausas ?? '',
        taskRotation: f.rodizio_tarefas ?? '',
        bathroomDistance: f.distancia_banheiro ?? '',
        bathroomCondition: f.condicao_banheiro ?? '',
        hierarchyOrganogram: f.organograma_hierarquia ?? '',
        workspaceDescription: f.descricao_posto ?? '',
        collabFormation: f.formacao_colaborador ?? '',
        collabTurn: f.turno_colaborador ?? '',
        opinionGender: f.opiniao_genero ?? '',
        opinionAge: f.opiniao_idade ?? '',
        opinionTime: f.opiniao_tempo ?? '',
        opinionObjective: f.opiniao_objetivo ?? '',
        opinionThermal: f.opiniao_termico ?? '',
        opinionVentilation: f.opiniao_ventilacao ?? '',
        opinionVentilationDesc: f.opiniao_ventilacao_desc ?? '',
        opinionLightingSens: f.opiniao_iluminacao_sens ?? '',
        opinionLightingDesc: f.opiniao_iluminacao_desc ?? '',
        opinionAcoustics: f.opiniao_acustica ?? '',
        opinionEPI: f.opiniao_epi ?? '',
        opinionEquip: f.opiniao_equipamento ?? '',
        opinionCycle: f.opiniao_ciclo ?? '',
        opinionLayout: f.opiniao_layout ?? '',
        opinionDifficulties: f.opiniao_dificuldades ?? '',
        opinionPressure: f.opiniao_pressao ?? '',
        opinionRelationship: f.opiniao_relacionamento ?? '',
        opinionLeadership: f.opiniao_lideranca ?? '',
        opinionMaintenanceInfluence: f.opiniao_manutencao_influencia ?? '',
        opinionMaintenanceDelay: f.opiniao_manutencao_atraso ?? '',
        opinionIntercurrences: f.opiniao_intercorrencias ?? '',
        effortDynamic: f.esforco_dinamico ?? '',
        effortStatic: f.esforco_estatico ?? '',
        timeAnalysis: f.cronoanalise ?? '',
        loadCarrying: f.carregamento_carga ?? '',
        displacement: f.deslocamento ?? '',
        maintenanceDesc: f.manutencao_desc ?? '',
        maintenanceCausesDelay: f.manutencao_causa_atraso ?? '',
        logisticsInfluence: f.logistica_influencia ?? '',
        logisticsDelay: f.logistica_atraso ?? '',
        reworkDesc: f.retrabalho_desc ?? '',
        reworkWeek: f.retrabalho_semana ?? '',
        reworkNotApplicable: f.retrabalho_nao_aplicavel ?? false,
        usesEquipment: f.usa_equipamento ?? false,
        usesEPI: f.usa_epi ?? false,
        equipmentList: equipamentos.map((e: any) => ({
          id: e.id,
          name: e.nome ?? '',
          quantity: e.quantidade ?? '',
          dimensions: e.dimensoes ?? '',
          principle: e.principio ?? '',
          condition: e.condicao ?? '',
          observations: e.observacoes ?? '',
        })),
        epiList: epis.map((e: any) => ({
          id: e.id,
          name: e.nome ?? '',
          mandatory: e.obrigatorio ?? false,
          occasional: e.eventual ?? false,
          location: e.local ?? '',
          observations: e.observacoes ?? '',
        })),
        equipProblems: f.problemas_equipamento ?? '',
        cyclePrescribed: f.ciclo_prescrito ?? '',
        cycleReal: f.ciclo_real ?? '',
        postureSittingPct:    parseFloat(f.postura_sentado_pct) || 0,
        postureStandingPct:   parseFloat(f.postura_em_pe_pct) || 0,
        postureWalkingPct:    parseFloat(f.postura_caminhando_pct) || 0,
        postureCrouchingPct:  parseFloat(f.postura_agachado_pct) || 0,
        postureOtherPct:      parseFloat(f.postura_outro_pct) || 0,
        postureOtherDescription: f.postura_outro_descricao ?? '',
        meioAmbiente: f.meio_ambiente ?? '',
        illumination: {
          location:             f.ilum_local ?? '',
          date:                 f.ilum_data ?? '',
          lightingType:         f.ilum_tipo_iluminacao ?? '',
          introduction:         f.ilum_introducao ?? '',
          objective:            f.ilum_objetivo ?? '',
          justification:        f.ilum_justificativa ?? '',
          environmentDescription: f.ilum_descricao_ambiente ?? '',
          lightingSystem:       f.ilum_sistema_iluminacao ?? '',
          activities:           f.ilum_atividades ?? '',
          criteria:             f.ilum_criterios ?? '',
          measuredValues:       f.ilum_valores_medidos ?? '',
          referenceValue:       f.ilum_valor_referencia ?? '',
          formula:              f.ilum_formula ?? '',
          resultLux:            f.ilum_resultado_lux ?? '',
          interpretation:       f.ilum_interpretacao ?? '',
          normativeReference:   f.ilum_referencia_normativa ?? '',
          modelType:            f.ilum_tipo_modelo ?? 'SIMPLE_AVERAGE',
          conclusion:           f.ilum_conclusao ?? '',
          conclusionText:       f.ilum_texto_conclusao ?? '',
          checklist: ilumChecklist.map((c: any) => ({
            id: c.id,
            description: c.descricao ?? '',
            compliant: c.conforme ?? '',
            recommendedAction: c.acao_recomendada ?? '',
            deadline: c.prazo ?? '',
            responsible: c.responsavel ?? '',
            observations: c.observacoes ?? '',
          })),
          measurementPoints: ilumPontos.map((pt: any) => ({
            id: pt.id,
            label: pt.rotulo ?? '',
            lux: pt.lux !== null ? parseFloat(pt.lux) : null,
          })),
          referenceLux: parseFloat(f.ilum_lux_referencia) || 0,
        },
        scientificMethods: metodos.map((m: any) => ({
          id: m.id,
          methodName: m.nome_metodo ?? '',
          description: m.descricao ?? '',
          result: m.resultado ?? '',
          riskClassification: m.classificacao_risco ?? '',
          interpretation: m.interpretacao ?? '',
          imageDataUrl: m.imagem_url ?? '',
          recommendations: m.recomendacoes ?? '',
        })),
        images: imagens.map((img: any) => ({
          id: img.id,
          dataUrl: img.imagem_url ?? '',
          caption: img.legenda ?? '',
          category: img.categoria ?? 'other',
        })),
        diagnosis: f.diagnostico ?? '',
        riskLevel: f.nivel_risco ?? '',
        improvements: melhorias.map((m: any) => ({
          id: m.id,
          photoDataUrl: m.foto_url ?? '',
          hazard: m.perigo ?? '',
          probability: m.probabilidade ?? '',
          severity: m.gravidade ?? '',
          grossRiskLevel: m.nivel_risco_bruto ?? '',
          riskClassification: m.classificacao_risco ?? '',
          riskEvaluation: m.avaliacao_risco ?? '',
          actions: m.acoes ?? '',
          attenuationProbability: m.probabilidade_atenuacao ?? '',
          deadline: m.prazo ?? '',
          responsible: m.responsavel ?? '',
          observations: m.observacoes ?? '',
        })),
        checklistAnswers: checklistResp.map((ca: any) => ({
          questionId: ca.pergunta_id_str ?? ca.pergunta_id ?? '',
          answer: ca.resposta ?? '',
        })),
        rulaScore: f.pontuacao_rula ?? '',
        risks: riscos.map((r: any) => ({
          id: r.id,
          agent: r.agente ?? '',
          riskFactor: r.fator_risco ?? '',
          possibleHealthEffect: r.efeito_saude ?? '',
          foundSituation: r.situacao_encontrada ?? '',
          existingControl: r.controle_existente ?? '',
          improvementProposal: r.proposta_melhoria ?? '',
          probability: r.probabilidade ?? 1,
          severity: r.gravidade ?? 1,
          score: r.pontuacao ?? 1,
          riskLevel: r.nivel_risco ?? '',
          normativeReference: r.referencia_normativa ?? '',
          evidenceImageDataUrl: r.imagem_evidencia_url ?? '',
          responsible: r.responsavel ?? '',
          deadline: r.prazo ?? '',
          status: r.status ?? '',
        })),
        aep: null,
      });
    }

    result.push({
      id: p.id,
      reportType: 'AET',
      empresaId: p.empresa_id ?? null,
      unidadeId: p.unidade_id ?? null,
      consultoriaLogoDataUrl: p.logo_consultoria ?? '',
      companyLogoDataUrl:     p.logo_empresa ?? '',
      responsibleLogoDataUrl: p.logo_responsavel ?? '',
      companyName:  p.nome_empresa ?? '',
      fantasyName:  p.nome_fantasia ?? '',
      cnpj:         p.cnpj ?? '',
      address:      p.endereco ?? '',
      unit:         p.unidade ?? '',
      product:      p.produto ?? '',
      riskDegree:   p.grau_risco ?? '',
      location:     p.localizacao ?? '',
      introErgonomia:   p.intro_ergonomia ?? '',
      introObjetivo:    p.intro_objetivo ?? '',
      introMetodologia: p.intro_metodologia ?? '',
      evaluatorName:             p.nome_avaliador ?? '',
      evaluatorFormation:        p.formacao_avaliador ?? '',
      evaluatorCrefito:          p.crefito_avaliador ?? '',
      evaluatorCompany:          p.empresa_avaliador ?? '',
      evaluatorSignatureDataUrl: p.assinatura_avaliador ?? '',
      date: p.data ? (p.data instanceof Date ? p.data.toISOString().split('T')[0] : String(p.data)) : '',
      functions,
    });
  }

  return result;
}

// ─── Routes ─────────────────────────────────────────────────────────────────

router.get('/', async (_req, res) => {
  const client = await pool.connect();
  try {
    const data = await loadAllAET(client);
    res.json(data);
  } catch (err) {
    console.error('GET /api/aet error:', err);
    res.status(500).json({ error: String(err) });
  } finally {
    client.release();
  }
});

router.post('/', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await saveAET(client, req.body);
    await client.query('COMMIT');
    res.status(201).json(req.body);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('POST /api/aet error:', err);
    res.status(500).json({ error: String(err) });
  } finally {
    client.release();
  }
});

router.put('/:id', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await saveAET(client, { ...req.body, id: req.params.id });
    await client.query('COMMIT');
    res.json(req.body);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('PUT /api/aet error:', err);
    res.status(500).json({ error: String(err) });
  } finally {
    client.release();
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM aet_projetos WHERE id=$1', [req.params.id]);
    res.status(204).end();
  } catch (err) {
    console.error('DELETE /api/aet error:', err);
    res.status(500).json({ error: String(err) });
  }
});

export { saveAET, loadAllAET };
export default router;
