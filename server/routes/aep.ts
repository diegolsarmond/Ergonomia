import { Router } from 'express';
import type { PoolClient } from 'pg';
import { pool } from '../db.js';
import { registrarAuditoria } from '../lib/auditoria.js';

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

// ─── Save AEP project (decompose JSON → relational tables) ──────────────────

async function saveAEP(client: PoolClient, project: any): Promise<void> {
  // 1. Upsert project header
  await client.query(
    `INSERT INTO aep_projetos
       (id, nome_empresa, nome_fantasia, cnpj, endereco, unidade, produto, grau_risco, localizacao,
        intro_ergonomia, intro_objetivo, intro_metodologia,
        nome_avaliador, formacao_avaliador, crefito_avaliador, empresa_avaliador, assinatura_avaliador,
        data, logo_consultoria, logo_empresa, logo_responsavel,
        empresa_id, unidade_id)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18::date,$19,$20,$21,$22,$23)
     ON CONFLICT (id) DO UPDATE SET
       nome_empresa=$2, nome_fantasia=$3, cnpj=$4, endereco=$5, unidade=$6, produto=$7,
       grau_risco=$8, localizacao=$9,
       intro_ergonomia=$10, intro_objetivo=$11, intro_metodologia=$12,
       nome_avaliador=$13, formacao_avaliador=$14, crefito_avaliador=$15, empresa_avaliador=$16,
       assinatura_avaliador=$17, data=$18::date, logo_consultoria=$19, logo_empresa=$20,
       logo_responsavel=$21, empresa_id=$22, unidade_id=$23, atualizado_em=NOW()`,
    [
      uuid(project.id),
      str(project.companyName), str(project.fantasyName), str(project.cnpj),
      str(project.address), str(project.unit), str(project.product),
      str(project.riskDegree), str(project.location),
      str(project.introErgonomia), str(project.introObjetivo), str(project.introMetodologia),
      str(project.evaluatorName), str(project.evaluatorFormation),
      str(project.evaluatorCrefito), str(project.evaluatorCompany), str(project.evaluatorSignatureDataUrl),
      dt(project.date), str(project.consultoriaLogoDataUrl), str(project.companyLogoDataUrl),
      str(project.responsibleLogoDataUrl),
      uuid(project.empresaId), uuid(project.unidadeId),
    ]
  );

  // 2. Determine functions to delete (present in DB but not in payload)
  const { rows: dbFuncs } = await client.query(
    'SELECT id FROM aep_funcoes WHERE projeto_id=$1', [project.id]
  );
  const dbIds = new Set<string>(dbFuncs.map((r: any) => r.id));
  const incomingIds = new Set<string>((project.functions ?? []).map((f: any) => f.id));
  for (const did of dbIds) {
    if (!incomingIds.has(did)) {
      await client.query('DELETE FROM aep_funcoes WHERE id=$1', [did]);
    }
  }

  // 3. Upsert each function and its child tables
  for (let i = 0; i < (project.functions ?? []).length; i++) {
    const f = project.functions[i];
    const aep = f.aep ?? {};
    const ident = aep.identification ?? {};
    const wc = aep.workCharacterization ?? {};
    const wo = wc.workOrganization ?? {};
    const tm = wc.toolsAndMaterials ?? {};
    const bio = aep.biomechanics ?? {};
    const ec = bio.environmentalComfort ?? {};
    const psi = aep.psychosocialAverages ?? {};
    const tr = aep.technicalResponsible ?? {};

    await client.query(
      `INSERT INTO aep_funcoes
         (id, projeto_id, ordem,
          nome_funcao, codigo_posto, unidade_filial, setor_area, funcoes_contempladas,
          atividade_avaliada, num_funcionarios, data_analise,
          descricao_processo, descricao_ciclo_trabalho,
          jornada_trabalho, escala, horas_extras, intervalo_almoco,
          outras_pausas, rodizio_tarefas, dialogos_seguranca,
          descricao_equipamentos, epis_utilizados, outros_materiais, nota_lgpd,
          reclamacao_iluminacao, valor_iluminacao, descricao_iluminacao,
          reclamacao_ruido, valor_ruido, descricao_ruido,
          reclamacao_temperatura, valor_temperatura, descricao_temperatura,
          psi_media_demanda_ritmo, psi_media_autonomia_controle, psi_media_clareza_papel,
          psi_media_apoio_social, psi_media_reconhecimento, psi_media_geral,
          psi_classificacao, psi_interpretacao,
          requer_aet, orientacao_final, justificativa_decisao,
          resp_nome, resp_registro, resp_formacao, resp_empresa, resp_assinatura,
          unidade_id, setor_id)
       VALUES
         ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11::date,$12,$13,$14,$15,$16,$17,$18,$19,
          $20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34,$35,$36,$37,$38,$39,
          $40,$41,$42,$43,$44,$45,$46,$47,$48,$49,$50,$51)
       ON CONFLICT (id) DO UPDATE SET
         projeto_id=$2, ordem=$3, nome_funcao=$4, codigo_posto=$5,
         unidade_filial=$6, setor_area=$7, funcoes_contempladas=$8,
         atividade_avaliada=$9, num_funcionarios=$10,
         data_analise=$11::date, descricao_processo=$12, descricao_ciclo_trabalho=$13,
         jornada_trabalho=$14, escala=$15, horas_extras=$16, intervalo_almoco=$17,
         outras_pausas=$18, rodizio_tarefas=$19, dialogos_seguranca=$20,
         descricao_equipamentos=$21, epis_utilizados=$22, outros_materiais=$23, nota_lgpd=$24,
         reclamacao_iluminacao=$25, valor_iluminacao=$26, descricao_iluminacao=$27,
         reclamacao_ruido=$28, valor_ruido=$29, descricao_ruido=$30,
         reclamacao_temperatura=$31, valor_temperatura=$32, descricao_temperatura=$33,
         psi_media_demanda_ritmo=$34, psi_media_autonomia_controle=$35, psi_media_clareza_papel=$36,
         psi_media_apoio_social=$37, psi_media_reconhecimento=$38, psi_media_geral=$39,
         psi_classificacao=$40, psi_interpretacao=$41,
         requer_aet=$42, orientacao_final=$43, justificativa_decisao=$44,
         resp_nome=$45, resp_registro=$46, resp_formacao=$47, resp_empresa=$48,
         resp_assinatura=$49, unidade_id=$50, setor_id=$51, atualizado_em=NOW()`,
      [
        uuid(f.id), uuid(project.id), i,
        str(f.name) || str(ident.unitBranch),
        str(ident.code),
        str(ident.unitBranch),
        str(ident.sectorArea),
        str(ident.contemplatedFunctions),
        str(ident.evaluatedActivity),
        str(f.numEmployees),
        dt(f.analysisDate),
        str(wc.processDescription),
        str(wc.workCycleDescription),
        str(wo.workday), str(wo.scale), str(wo.overtime), str(wo.lunchBreak),
        str(wo.otherBreaks), str(wo.taskRotation), str(wo.safetyDialogues),
        str(tm.description), str(tm.epis), str(tm.others),
        str(aep.lgpdNote),
        str(ec.lightingComplaint) || '', str(ec.lightingValue), str(ec.lightingDescription),
        str(ec.noiseComplaint) || '', str(ec.noiseValue), str(ec.noiseDescription),
        str(ec.temperatureComplaint) || '', str(ec.temperatureValue), str(ec.temperatureDescription),
        num(psi.demandRhythm), num(psi.autonomyControl), num(psi.roleClarityConflict),
        num(psi.socialSupportLeadership), num(psi.recognitionJusticePsychSafety), num(psi.overall),
        str(aep.psychosocialClassification), str(aep.psychosocialInterpretation),
        Boolean((aep.aetTriggers ?? []).some((t: any) => t.answer === 'Sim') || aep.psychosocialClassification === 'VERMELHO'),
        str(aep.finalGuidance), str(aep.decisionJustification),
        str(tr.name), str(tr.registration), str(tr.formation), str(tr.company), str(tr.signatureDataUrl),
        uuid(ident.unitId), uuid(ident.sectorId),
      ]
    );

    // ── Fotos ──────────────────────────────────────────────────────────────
    await client.query('DELETE FROM aep_funcao_fotos WHERE funcao_id=$1', [f.id]);
    for (let j = 0; j < (aep.photographicRecords ?? []).length; j++) {
      const ph = aep.photographicRecords[j];
      await client.query(
        'INSERT INTO aep_funcao_fotos (id,funcao_id,imagem_url,descricao,ordem) VALUES ($1,$2,$3,$4,$5)',
        [ph.id, f.id, str(ph.imageDataUrl), str(ph.description), j]
      );
    }

    // ── Biomecânica ────────────────────────────────────────────────────────
    await client.query('DELETE FROM aep_funcao_biomecanica WHERE funcao_id=$1', [f.id]);
    const bioCategories: [string, any[]][] = [
      ['postura_e_alcance',          bio.postureAndReach ?? []],
      ['repetitividade_e_ritmo',     bio.repetitivenessAndRhythm ?? []],
      ['forca_e_demanda_fisica',     bio.forceAndPhysicalDemand ?? []],
      ['manuseio_manual_materiais',  bio.manualMaterialHandling ?? []],
      ['moveis_e_posto',             bio.furnitureAndWorkstation ?? []],
    ];
    let bioOrder = 0;
    for (const [categoria, items] of bioCategories) {
      for (const item of items) {
        const rfId = isUUID(str(item.riskFactorId)) ? str(item.riskFactorId) : null;
        await client.query(
          `INSERT INTO aep_funcao_biomecanica
             (funcao_id,categoria,fator_risco_id,fator_risco_texto,avaliacao,observacoes,ordem)
           VALUES ($1,$2,$3,$4,$5,$6,$7)`,
          [f.id, categoria, rfId, str(item.riskFactorId), str(item.assessment), str(item.description), bioOrder++]
        );
      }
    }

    // ── Ferramentas científicas ────────────────────────────────────────────
    await client.query('DELETE FROM aep_funcao_ferramentas_cientificas WHERE funcao_id=$1', [f.id]);
    for (let j = 0; j < (aep.scientificTools ?? []).length; j++) {
      const t = aep.scientificTools[j];
      await client.query(
        `INSERT INTO aep_funcao_ferramentas_cientificas
           (id,funcao_id,nome_ferramenta,resultado,interpretacao,recomendacao,imagem_url,ordem)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [t.id, f.id, str(t.toolName), str(t.result), str(t.interpretation), str(t.recommendation), t.imageDataUrl ?? null, j]
      );
    }

    // ── Medições de iluminância ────────────────────────────────────────────
    // Delete existing measurements (CASCADE removes child rows)
    await client.query('DELETE FROM aep_funcao_iluminancia WHERE funcao_id=$1', [f.id]);
    for (let j = 0; j < (aep.illuminanceMeasurements ?? []).length; j++) {
      const m = aep.illuminanceMeasurements[j];
      const gp = m.gridParameters ?? {};
      const gc = m.gridConfig ?? {};
      const cr = m.calculationResult;
      const er = m.evaluationResult;
      const eq = m.equipmentData ?? {};
      const normId = isUUID(str(m.normativeParameterId)) ? str(m.normativeParameterId) : null;

      await client.query(
        `INSERT INTO aep_funcao_iluminancia
           (id,funcao_id,posto,ambiente,tipo_ambiente,lux_minimo_recomendado,irc_ra,escala,
            parametro_normativo_id,tipo_geometria,grade_n,grade_m,grade_largura,grade_comprimento,
            grade_max_colunas,grid_linhas,grid_colunas,grade_schema_imagem,
            calc_qtd_pontos,calc_media_lux,calc_lux_minimo,calc_lux_maximo,calc_lux_tolerancia,
            calc_media_setenta_pct,calc_razao_uniformidade,calc_valor_area_tarefa,
            aval_status,aval_media_adequada,aval_tolerancia_ok,
            equip_nome,equip_certificado,equip_data_calibracao,equip_cert_imagem,equip_observacoes,
            observacoes,data_medicao,usuario_responsavel,status_formulario,ordem)
         VALUES
           ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,
            $24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34,$35,$36,$37,$38,$39)`,
        [
          m.id, f.id, str(m.posto), str(m.environment), str(m.environmentType),
          num(m.recommendedMinLux), str(m.ircRa), str(m.scale) || 'lux',
          normId,
          str(gp.geometryType) || 'A1', gp.N ?? 4, gp.M ?? 2, num(gp.W), num(gp.L), gp.maxCols ?? 8,
          gc.rows ?? 4, gc.cols ?? 8, str(m.gridSchemaImageDataUrl),
          cr ? (cr.measuredPointsCount ?? null) : null,
          cr ? num(cr.averageLux) : null,
          cr ? num(cr.minLux) : null,
          cr ? num(cr.maxLux) : null,
          cr ? num(cr.toleranceMinLux) : null,
          cr ? num(cr.seventyPercentAverage) : null,
          cr ? num(cr.uniformityRatio) : null,
          cr ? num(cr.taskAreaValue) : null,
          er ? (str(er.status) || null) : null,
          er ? (er.averageIsAdequate ?? null) : null,
          er ? (er.toleranceCheck ?? null) : null,
          str(eq.deviceName), str(eq.certificate), str(eq.calibrationDate),
          str(eq.certificateImageDataUrl), str(eq.observations),
          str(m.observations), str(m.measurementDate), str(m.responsibleUser),
          str(m.formStatus) || 'rascunho', j,
        ]
      );

      // Linhas de medição NHO11
      for (let ri = 0; ri < (m.measurementRows ?? []).length; ri++) {
        const row = m.measurementRows[ri];
        await client.query(
          `INSERT INTO aep_funcao_iluminancia_linhas
             (iluminancia_id,tipo_linha,indice_linha,valores,colunas_ativas,flags_na,ordem)
           VALUES ($1,$2,$3,$4,$5,$6,$7)`,
          [m.id, str(row.rowType), row.index ?? ri, JSON.stringify(row.values ?? []), row.activeCols ?? 0, JSON.stringify(row.naFlags ?? []), ri]
        );
      }

      // Pontos da grade simples
      for (const pt of m.gridPoints ?? []) {
        await client.query(
          `INSERT INTO aep_funcao_iluminancia_pontos (iluminancia_id,linha,coluna,lux,nao_aplicavel)
           VALUES ($1,$2,$3,$4,$5)
           ON CONFLICT (iluminancia_id,linha,coluna) DO UPDATE SET lux=$4,nao_aplicavel=$5`,
          [m.id, pt.row, pt.col, pt.lux ?? null, pt.notApplicable ?? false]
        );
      }

      // Verificação
      for (let vi = 0; vi < (m.verificationItems ?? []).length; vi++) {
        const v = m.verificationItems[vi];
        await client.query(
          `INSERT INTO aep_funcao_iluminancia_verificacao
             (iluminancia_id,item_id,pergunta,resposta,observacoes,ordem)
           VALUES ($1,$2,$3,$4,$5,$6)`,
          [m.id, str(v.id), str(v.question), str(v.answer), str(v.observations), vi]
        );
      }

      // Inconsistências
      for (let ii = 0; ii < (m.inconsistencyItems ?? []).length; ii++) {
        const inc = m.inconsistencyItems[ii];
        await client.query(
          `INSERT INTO aep_funcao_iluminancia_inconsistencias
             (iluminancia_id,item_id,titulo,descricao,encontrado,observacoes,ordem)
           VALUES ($1,$2,$3,$4,$5,$6,$7)`,
          [m.id, str(inc.id), str(inc.title), str(inc.description), inc.found ?? false, str(inc.observations), ii]
        );
      }
    }

    // ── Respostas psicossociais ────────────────────────────────────────────
    await client.query('DELETE FROM aep_funcao_psicossocial WHERE funcao_id=$1', [f.id]);
    for (let j = 0; j < (aep.psychosocialAnswers ?? []).length; j++) {
      const q = aep.psychosocialAnswers[j];
      await client.query(
        `INSERT INTO aep_funcao_psicossocial
           (funcao_id,chave_pergunta,grupo,pergunta,pontuacao,rotulo_escala,invertida,comentarios,ordem)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [f.id, str(q.id), str(q.group), str(q.question), q.score === '' ? null : num(q.score), str(q.scaleLabel), q.inverted ?? false, str(q.comments), j]
      );
    }

    // ── Gatilhos AET ───────────────────────────────────────────────────────
    await client.query('DELETE FROM aep_funcao_gatilhos WHERE funcao_id=$1', [f.id]);
    for (let j = 0; j < (aep.aetTriggers ?? []).length; j++) {
      const t = aep.aetTriggers[j];
      await client.query(
        `INSERT INTO aep_funcao_gatilhos (funcao_id,chave_gatilho,descricao,resposta,ordem)
         VALUES ($1,$2,$3,$4,$5)`,
        [f.id, str(t.id), str(t.description), str(t.answer), j]
      );
    }

    // ── Plano de ação RACI ─────────────────────────────────────────────────
    await client.query('DELETE FROM aep_funcao_acoes_raci WHERE funcao_id=$1', [f.id]);
    for (let j = 0; j < (aep.raciActionPlan ?? []).length; j++) {
      const a = aep.raciActionPlan[j];
      await client.query(
        `INSERT INTO aep_funcao_acoes_raci
           (id,funcao_id,fator_risco,acao,responsavel,aprovador,consultado,informado,prazo,prioridade,status,ordem)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
        [a.id, f.id, str(a.riskFactor), str(a.action), str(a.responsible), str(a.accountable), str(a.consulted), str(a.informed), str(a.deadline), str(a.priority), str(a.status), j]
      );
    }
  }
}

// ─── Load all AEP projects (reassemble relational → JSON) ───────────────────

async function loadAllAEP(client: PoolClient): Promise<any[]> {
  const { rows: projects } = await client.query(`
    SELECT p.*,
      COALESCE(NULLIF(p.nome_empresa,''), e.razao_social)  AS nome_empresa,
      COALESCE(NULLIF(p.nome_fantasia,''), e.nome_fantasia) AS nome_fantasia,
      COALESCE(NULLIF(p.cnpj,''), e.cnpj)                  AS cnpj,
      COALESCE(NULLIF(p.grau_risco,''), e.grau_risco)      AS grau_risco,
      COALESCE(NULLIF(p.unidade,''), u.nome)               AS unidade,
      COALESCE(NULLIF(p.logo_empresa,''), e.logo_url)      AS logo_empresa_resolved
    FROM aep_projetos p
    LEFT JOIN empresas e ON e.id = p.empresa_id
    LEFT JOIN unidades u ON u.id = p.unidade_id
    WHERE p.ativo
    ORDER BY p.criado_em
  `);
  const result: any[] = [];

  for (const p of projects) {
    const { rows: funcoes } = await client.query(
      'SELECT * FROM aep_funcoes WHERE projeto_id=$1 ORDER BY ordem', [p.id]
    );

    const functions: any[] = [];
    for (const f of funcoes) {
      const [
        { rows: fotos },
        { rows: biomecanica },
        { rows: ferramentas },
        { rows: iluminancias },
        { rows: psicossocial },
        { rows: gatilhos },
        { rows: raci },
      ] = await Promise.all([
        client.query('SELECT * FROM aep_funcao_fotos WHERE funcao_id=$1 ORDER BY ordem', [f.id]),
        client.query('SELECT * FROM aep_funcao_biomecanica WHERE funcao_id=$1 ORDER BY categoria,ordem', [f.id]),
        client.query('SELECT * FROM aep_funcao_ferramentas_cientificas WHERE funcao_id=$1 ORDER BY ordem', [f.id]),
        client.query('SELECT * FROM aep_funcao_iluminancia WHERE funcao_id=$1 ORDER BY ordem', [f.id]),
        client.query('SELECT * FROM aep_funcao_psicossocial WHERE funcao_id=$1 ORDER BY ordem', [f.id]),
        client.query('SELECT * FROM aep_funcao_gatilhos WHERE funcao_id=$1 ORDER BY ordem', [f.id]),
        client.query('SELECT * FROM aep_funcao_acoes_raci WHERE funcao_id=$1 ORDER BY ordem', [f.id]),
      ]);

      // Reassemble illuminance measurements
      const illuminanceMeasurements: any[] = [];
      for (const ilum of iluminancias) {
        const [
          { rows: linhas },
          { rows: pontos },
          { rows: verificacao },
          { rows: inconsistencias },
        ] = await Promise.all([
          client.query('SELECT * FROM aep_funcao_iluminancia_linhas WHERE iluminancia_id=$1 ORDER BY ordem', [ilum.id]),
          client.query('SELECT * FROM aep_funcao_iluminancia_pontos WHERE iluminancia_id=$1 ORDER BY linha,coluna', [ilum.id]),
          client.query('SELECT * FROM aep_funcao_iluminancia_verificacao WHERE iluminancia_id=$1 ORDER BY ordem', [ilum.id]),
          client.query('SELECT * FROM aep_funcao_iluminancia_inconsistencias WHERE iluminancia_id=$1 ORDER BY ordem', [ilum.id]),
        ]);

        illuminanceMeasurements.push({
          id: ilum.id,
          posto: ilum.posto ?? '',
          environment: ilum.ambiente ?? '',
          environmentType: ilum.tipo_ambiente ?? '',
          recommendedMinLux: parseFloat(ilum.lux_minimo_recomendado) || 0,
          ircRa: ilum.irc_ra ?? '',
          scale: ilum.escala ?? 'lux',
          normativeParameterId: ilum.parametro_normativo_id ?? '',
          gridParameters: {
            geometryType: ilum.tipo_geometria ?? 'A1',
            N: ilum.grade_n ?? 4,
            M: ilum.grade_m ?? 2,
            W: parseFloat(ilum.grade_largura) || 0,
            L: parseFloat(ilum.grade_comprimento) || 0,
            maxCols: ilum.grade_max_colunas ?? 8,
          },
          measurementRows: linhas.map((l: any) => ({
            id: l.id,
            rowType: l.tipo_linha,
            index: l.indice_linha,
            values: l.valores ?? [],
            activeCols: l.colunas_ativas ?? 0,
            naFlags: l.flags_na ?? [],
          })),
          gridConfig: { rows: ilum.grid_linhas ?? 4, cols: ilum.grid_colunas ?? 8 },
          gridPoints: pontos.map((pt: any) => ({
            row: pt.linha,
            col: pt.coluna,
            lux: pt.lux !== null ? parseFloat(pt.lux) : null,
            notApplicable: pt.nao_aplicavel ?? false,
          })),
          gridSchemaImageDataUrl: ilum.grade_schema_imagem ?? '',
          calculationResult: ilum.calc_media_lux !== null ? {
            measuredPointsCount: ilum.calc_qtd_pontos ?? 0,
            averageLux: parseFloat(ilum.calc_media_lux) || 0,
            minLux: parseFloat(ilum.calc_lux_minimo) || 0,
            maxLux: parseFloat(ilum.calc_lux_maximo) || 0,
            toleranceMinLux: parseFloat(ilum.calc_lux_tolerancia) || 0,
            seventyPercentAverage: parseFloat(ilum.calc_media_setenta_pct) || 0,
            uniformityRatio: parseFloat(ilum.calc_razao_uniformidade) || 0,
            taskAreaValue: parseFloat(ilum.calc_valor_area_tarefa) || 0,
            rowAverages: [],
          } : null,
          evaluationResult: ilum.aval_status ? {
            status: ilum.aval_status ?? '',
            averageIsAdequate: ilum.aval_media_adequada ?? false,
            toleranceCheck: ilum.aval_tolerancia_ok ?? false,
            seventyPercentCheck: false,
            uniformityCheck: false,
            taskAreaCheck: false,
            interpretationText: '',
            issues: [],
          } : null,
          verificationItems: verificacao.map((v: any) => ({
            id: v.item_id,
            question: v.pergunta ?? '',
            answer: v.resposta ?? '',
            observations: v.observacoes ?? '',
          })),
          inconsistencyItems: inconsistencias.map((inc: any) => ({
            id: inc.item_id,
            title: inc.titulo ?? '',
            description: inc.descricao ?? '',
            found: inc.encontrado ?? false,
            observations: inc.observacoes ?? '',
          })),
          equipmentData: {
            deviceName: ilum.equip_nome ?? '',
            certificate: ilum.equip_certificado ?? '',
            calibrationDate: ilum.equip_data_calibracao ?? '',
            certificateImageDataUrl: ilum.equip_cert_imagem ?? '',
            observations: ilum.equip_observacoes ?? '',
          },
          observations: ilum.observacoes ?? '',
          measurementDate: ilum.data_medicao ?? '',
          responsibleUser: ilum.usuario_responsavel ?? '',
          formStatus: ilum.status_formulario ?? 'rascunho',
          createdAt: ilum.criado_em?.toISOString() ?? '',
          updatedAt: ilum.atualizado_em?.toISOString() ?? '',
        });
      }

      const mapBio = (b: any) => ({
        riskFactorId: b.fator_risco_texto ?? b.fator_risco_id ?? '',
        assessment: b.avaliacao ?? '',
        description: b.observacoes ?? '',
      });

      const aep: any = {
        identification: {
          unitBranch: f.unidade_filial ?? '',
          sectorArea: f.setor_area ?? '',
          contemplatedFunctions: f.funcoes_contempladas ?? '',
          evaluatedActivity: f.atividade_avaliada ?? '',
          code: f.codigo_posto ?? '',
          unitId: f.unidade_id ?? null,
          sectorId: f.setor_id ?? null,
        },
        workCharacterization: {
          processDescription: f.descricao_processo ?? '',
          workCycleDescription: f.descricao_ciclo_trabalho ?? '',
          workOrganization: {
            workday: f.jornada_trabalho ?? '',
            scale: f.escala ?? '',
            overtime: f.horas_extras ?? '',
            lunchBreak: f.intervalo_almoco ?? '',
            otherBreaks: f.outras_pausas ?? '',
            taskRotation: f.rodizio_tarefas ?? '',
            safetyDialogues: f.dialogos_seguranca ?? '',
          },
          toolsAndMaterials: {
            description: f.descricao_equipamentos ?? '',
            epis: f.epis_utilizados ?? '',
            others: f.outros_materiais ?? '',
          },
        },
        photographicRecords: fotos.map((ph: any) => ({
          id: ph.id,
          imageDataUrl: ph.imagem_url ?? '',
          description: ph.descricao ?? '',
        })),
        lgpdNote: f.nota_lgpd ?? '',
        biomechanics: {
          postureAndReach:         biomecanica.filter((b: any) => b.categoria === 'postura_e_alcance').map(mapBio),
          repetitivenessAndRhythm: biomecanica.filter((b: any) => b.categoria === 'repetitividade_e_ritmo').map(mapBio),
          forceAndPhysicalDemand:  biomecanica.filter((b: any) => b.categoria === 'forca_e_demanda_fisica').map(mapBio),
          manualMaterialHandling:  biomecanica.filter((b: any) => b.categoria === 'manuseio_manual_materiais').map(mapBio),
          furnitureAndWorkstation: biomecanica.filter((b: any) => b.categoria === 'moveis_e_posto').map(mapBio),
          environmentalComfort: {
            lightingComplaint:    f.reclamacao_iluminacao ?? '',
            lightingValue:        f.valor_iluminacao ?? '',
            lightingDescription:  f.descricao_iluminacao ?? '',
            noiseComplaint:       f.reclamacao_ruido ?? '',
            noiseValue:           f.valor_ruido ?? '',
            noiseDescription:     f.descricao_ruido ?? '',
            temperatureComplaint: f.reclamacao_temperatura ?? '',
            temperatureValue:     f.valor_temperatura ?? '',
            temperatureDescription: f.descricao_temperatura ?? '',
          },
        },
        scientificTools: ferramentas.map((t: any) => ({
          id: t.id,
          toolName: t.nome_ferramenta ?? '',
          result: t.resultado ?? '',
          interpretation: t.interpretacao ?? '',
          recommendation: t.recomendacao ?? '',
          imageDataUrl: t.imagem_url ?? '',
        })),
        illuminanceMeasurements,
        psychosocialAnswers: psicossocial.map((q: any) => ({
          id: q.chave_pergunta,
          group: q.grupo ?? '',
          question: q.pergunta ?? '',
          score: q.pontuacao !== null ? Number(q.pontuacao) : '',
          scaleLabel: q.rotulo_escala ?? '',
          inverted: q.invertida ?? false,
          comments: q.comentarios ?? '',
        })),
        psychosocialAverages: {
          demandRhythm:                     parseFloat(f.psi_media_demanda_ritmo) || 0,
          autonomyControl:                  parseFloat(f.psi_media_autonomia_controle) || 0,
          roleClarityConflict:              parseFloat(f.psi_media_clareza_papel) || 0,
          socialSupportLeadership:          parseFloat(f.psi_media_apoio_social) || 0,
          recognitionJusticePsychSafety:    parseFloat(f.psi_media_reconhecimento) || 0,
          overall:                          parseFloat(f.psi_media_geral) || 0,
        },
        psychosocialClassification: f.psi_classificacao ?? '',
        psychosocialInterpretation: f.psi_interpretacao ?? '',
        aetTriggers: gatilhos.map((t: any) => ({
          id: t.chave_gatilho,
          answer: t.resposta ?? '',
          description: t.descricao ?? '',
        })),
        finalGuidance:       f.orientacao_final ?? '',
        decisionJustification: f.justificativa_decisao ?? '',
        raciActionPlan: raci.map((a: any) => ({
          id: a.id,
          riskFactor: a.fator_risco ?? '',
          action:     a.acao ?? '',
          responsible: a.responsavel ?? '',
          accountable: a.aprovador ?? '',
          consulted:   a.consultado ?? '',
          informed:    a.informado ?? '',
          deadline:    a.prazo ?? '',
          priority:    a.prioridade ?? '',
          status:      a.status ?? '',
        })),
        technicalResponsible: {
          name:             f.resp_nome ?? '',
          registration:     f.resp_registro ?? '',
          formation:        f.resp_formacao ?? '',
          company:          f.resp_empresa ?? '',
          signatureDataUrl: f.resp_assinatura ?? '',
        },
      };

      functions.push({
        id: f.id,
        name: f.nome_funcao ?? '',
        unit: f.unidade_filial ?? '',
        sector: f.setor_area ?? '',
        analysisDate: f.data_analise ? (f.data_analise instanceof Date ? f.data_analise.toISOString().split('T')[0] : String(f.data_analise)) : '',
        numEmployees: f.num_funcionarios ?? '',
        // AET scalar fields (empty for AEP functions)
        demandOrigin: '', objective: '', demandFound: '', marketSituation: '', product: '',
        productionLocation: '', productionDimension: '', productionGoals: '', qualityAnalysis: '',
        qualityEvaluator: '', shifts: '', shiftStart: '', shiftEnd: '', workDays: '',
        overtime: '', pauses: '', taskRotation: '', bathroomDistance: '', bathroomCondition: '',
        hierarchyOrganogram: '', workspaceDescription: '', collabFormation: '', collabTurn: '',
        opinionGender: '', opinionAge: '', opinionTime: '', opinionObjective: '', opinionThermal: '',
        opinionVentilation: '', opinionVentilationDesc: '', opinionLightingSens: '',
        opinionLightingDesc: '', opinionAcoustics: '', opinionEPI: '', opinionEquip: '',
        opinionCycle: '', opinionLayout: '', opinionDifficulties: '', opinionPressure: '',
        opinionRelationship: '', opinionLeadership: '', opinionMaintenanceInfluence: '',
        opinionMaintenanceDelay: '', opinionIntercurrences: '', effortDynamic: '', effortStatic: '',
        timeAnalysis: '', loadCarrying: '', displacement: '', maintenanceDesc: '',
        maintenanceCausesDelay: '', logisticsInfluence: '', logisticsDelay: '', reworkDesc: '',
        reworkWeek: '', reworkNotApplicable: false, usesEquipment: false, usesEPI: false,
        equipmentList: [], epiList: [], equipProblems: '', cyclePrescribed: '', cycleReal: '',
        postureSittingPct: 0, postureStandingPct: 0, postureWalkingPct: 0,
        postureCrouchingPct: 0, postureOtherPct: 0, postureOtherDescription: '', meioAmbiente: '',
        illumination: {
          location: '', date: '', lightingType: '', introduction: '', objective: '',
          justification: '', environmentDescription: '', lightingSystem: '', activities: '',
          criteria: '', measuredValues: '', referenceValue: '', formula: '', resultLux: '',
          interpretation: '', normativeReference: '', modelType: 'SIMPLE_AVERAGE',
          conclusion: '', conclusionText: '', checklist: [], measurementPoints: [], referenceLux: 0,
        },
        scientificMethods: [], images: [], diagnosis: '', riskLevel: '',
        improvements: [], checklistAnswers: [], rulaScore: '', risks: [],
        // AEP structured assessment
        aep,
      });
    }

    result.push({
      id: p.id,
      reportType: 'AEP',
      empresaId: p.empresa_id ?? null,
      unidadeId: p.unidade_id ?? null,
      consultoriaLogoDataUrl: p.logo_consultoria ?? '',
      companyLogoDataUrl:     p.logo_empresa_resolved ?? '',
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
      evaluatorName:            p.nome_avaliador ?? '',
      evaluatorFormation:       p.formacao_avaliador ?? '',
      evaluatorCrefito:         p.crefito_avaliador ?? '',
      evaluatorCompany:         p.empresa_avaliador ?? '',
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
    const data = await loadAllAEP(client);
    res.json(data);
  } catch (err) {
    console.error('GET /api/aep error:', err);
    res.status(500).json({ error: String(err) });
  } finally {
    client.release();
  }
});

router.post('/', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await saveAEP(client, req.body);
    await client.query('COMMIT');
    res.status(201).json(req.body);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('POST /api/aep error:', err);
    res.status(500).json({ error: String(err) });
  } finally {
    client.release();
  }
});

router.put('/:id', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await saveAEP(client, { ...req.body, id: req.params.id });
    await client.query('COMMIT');
    res.json(req.body);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('PUT /api/aep error:', err);
    res.status(500).json({ error: String(err) });
  } finally {
    client.release();
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'UPDATE aep_projetos SET ativo = FALSE WHERE id=$1 AND ativo RETURNING id, nome_empresa',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Projeto AEP não encontrado' });
    await registrarAuditoria(req, 'EXCLUSÃO', 'aep_projetos', req.params.id, `Projeto AEP desativado: ${rows[0].nome_empresa ?? ''}`);
    res.status(204).end();
  } catch (err) {
    console.error('DELETE /api/aep error:', err);
    res.status(500).json({ error: String(err) });
  }
});

export { saveAEP, loadAllAEP };
export default router;
