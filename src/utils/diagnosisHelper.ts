import { AETFunction } from '../types';

export function generateDiagnosis(func: AETFunction): string {
  const parts: string[] = [];
  parts.push(`A análise ergonômica da função de ${func.name || '[Nome da Função]'}${func.sector ? `, no setor de ${func.sector}` : ''}, identificou os seguintes aspectos relevantes:\n`);

  // Postura
  const dominantPosture = func.postureSittingPct > func.postureStandingPct ? 'sentada' : 'em pé';
  const dominantPct = Math.max(func.postureSittingPct, func.postureStandingPct);
  parts.push(`1. POSTURA: Predominância postural ${dominantPosture} (${dominantPct}% do tempo).${func.postureOtherPct > 0 ? ` Outras posturas representam ${func.postureOtherPct}% (${func.postureOtherDescription || 'não especificado'}).` : ''}`);

  // Illumination
  if (func.illumination?.resultLux) {
    const lux = parseFloat(func.illumination.resultLux);
    const status = lux >= 300 ? 'atendem' : 'NÃO atendem';
    parts.push(`\n2. ILUMINAÇÃO: Os valores medidos (${func.illumination.resultLux}) ${status} ao mínimo recomendado de 300 lux pela NBR 8995-1.`);
  }

  // Scientific Methods
  if (func.scientificMethods?.length > 0) {
    const methodSummary = func.scientificMethods.map(m => `${m.methodName}: ${m.result} (${m.riskClassification})`).join('; ');
    parts.push(`\n3. MÉTODOS CIENTÍFICOS: ${methodSummary}.`);
  }

  // Improvements count
  if (func.improvements?.length > 0) {
    const classifications = func.improvements.map(i => i.riskClassification).filter(Boolean);
    parts.push(`\n4. RISCOS IDENTIFICADOS: Foram identificados ${func.improvements.length} riscos no inventário ergonômico${classifications.length > 0 ? `, com classificações: ${[...new Set(classifications)].join(', ')}` : ''}.`);
  }

  // Effort
  if (func.effortDynamic || func.effortStatic) {
    parts.push(`\n5. ESFORÇOS: ${func.effortDynamic ? 'Dinâmicos identificados. ' : ''}${func.effortStatic ? 'Estáticos identificados.' : ''}`);
  }

  parts.push(`\nCONCLUSÃO: Recomenda-se atenção aos aspectos identificados, com prioridade para os riscos classificados como alto e moderado. As medidas de melhoria propostas no inventário de risco ergonômico devem ser implementadas conforme os prazos estabelecidos.`);

  return parts.join('');
}
