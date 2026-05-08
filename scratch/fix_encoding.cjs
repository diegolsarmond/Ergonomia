const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'src');

const mapping = {
  'Ã§': 'ç',
  'Ã£': 'ã',
  'Ã³': 'ó',
  'Ãµ': 'õ',
  'Ã©': 'é',
  'Ãª': 'ê',
  'Ã¡': 'á',
  'Ã¢': 'â',
  'Ã­': 'í',
  'Ãº': 'ú',
  'Ã ': 'Á', // Ã and space? Wait. Let's do exact words if possible.
  'Ã‡': 'Ç',
  'Ãƒ': 'Ã', // Wait, Ãƒ is Ã in UTF-8
  'Ã‰': 'É',
  'Ã“': 'Ó',
  'â€”': '—',
  'â‰¡': '≡'
};

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk(dir);

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  
  // Specific word fixes
  const wordMapping = {
    'ObrigatÃ³ri': 'Obrigatóri',
    'padrÃ£o': 'padrão',
    'DescriÃ§Ã£o': 'Descrição',
    'descriÃ§Ã£o': 'descrição',
    'NÃ£o': 'Não',
    'nÃ£o': 'não',
    'MÃ¡quina': 'Máquina',
    'VeÃ­culo': 'Veículo',
    'movimentaÃ§Ã£o': 'movimentação',
    'elÃ©trico': 'elétrico',
    'hidrÃ¡ulico': 'hidráulico',
    'pneumÃ¡tico': 'pneumático',
    'caracterÃ­sticas': 'características',
    'dimensÃµes': 'dimensões',
    'opÃ§Ãµes': 'opções',
    'seleÃ§Ã£o': 'seleção',
    'mÃºltipla': 'múltipla',
    'Ãºnica': 'única',
    'Ã rea': 'Área',
    'tÃ©rmico': 'térmico',
    'IluminaÃ§Ã£o': 'Iluminação',
    'AcÃºstica': 'Acústica',
    'OrganizaÃ§Ã£o': 'Organização',
    'AvaliaÃ§Ã£o': 'Avaliação',
    'avaliaÃ§Ã£o': 'avaliação',
    'ConcluÃ­do': 'Concluído',
    'concluÃ­do': 'concluído',
    'pendÃªncia': 'pendência',
    'vocÃª': 'você',
    'nÃ­vel': 'nível',
    'ruÃ­do': 'ruído',
    'posiÃ§Ã£o': 'posição',
    'PosiÃ§Ã£o': 'Posição',
    'QuestionÃ¡rio': 'Questionário',
    'usuÃ¡rio': 'usuário',
    'UsuÃ¡rio': 'Usuário',
    'MÃ³dulo': 'Módulo',
    'mÃ³dulo': 'módulo',
    'relatÃ³rio': 'relatório',
    'RelatÃ³rio': 'Relatório',
    'ConfiguraÃ§Ãµes': 'Configurações',
    'configuraÃ§Ãµes': 'configurações',
    'AÃ§Ã£o': 'Ação',
    'aÃ§Ã£o': 'ação',
    'aÃ§Ãµes': 'ações',
    'AÃ§Ãµes': 'Ações',
    'exclusÃ£o': 'exclusão',
    'ExclusÃ£o': 'Exclusão',
    'atuaÃ§Ã£o': 'atuação',
    'AtuaÃ§Ã£o': 'Atuação',
    'ProteÃ§Ã£o': 'Proteção',
    'cabeÃ§a': 'cabeça',
    'respiratÃ³ria': 'respiratória',
    'SecÃ§Ã£o': 'Secção',
    'secÃ§Ã£o': 'secção',
    'MÃºltipla': 'Múltipla',
    'Ãštimo': 'Útimo',
    'Ãºltimo': 'último',
    'MÃ¡xima': 'Máxima',
    'mÃ¡xima': 'máxima',
    'MÃ­nima': 'Mínima',
    'mÃ­nima': 'mínima',
    'mÃ©dia': 'média',
    'MÃ©dia': 'Média',
    'TrÃªs': 'Três',
    'trÃªs': 'três',
    'SÃ£o': 'São',
    'sÃ£o': 'são',
    'FÃ­sico': 'Físico',
    'fÃ­sico': 'físico',
    'QuÃ­mico': 'Químico',
    'quÃ­mico': 'químico',
    'BiolÃ³gico': 'Biológico',
    'biolÃ³gico': 'biológico',
    'MecÃ¢nico': 'Mecânico',
    'mecÃ¢nico': 'mecânico',
    'ErgonÃ´mico': 'Ergonômico',
    'ergonÃ´mico': 'ergonômico',
    'AvaliaÃ§Ãµes': 'Avaliações',
    'avaliaÃ§Ãµes': 'avaliações',
    'RecomendaÃ§Ãµes': 'Recomendações',
    'recomendaÃ§Ãµes': 'recomendações',
    'InspeÃ§Ã£o': 'Inspeção',
    'inspeÃ§Ã£o': 'inspeção',
    'situaÃ§Ã£o': 'situação',
    'SituaÃ§Ã£o': 'Situação',
    'situaÃ§Ãµes': 'situações',
    'SituaÃ§Ãµes': 'Situações',
    'pÃ©': 'pé',
    'PÃ©': 'Pé',
    'mÃ£o': 'mão',
    'MÃ£o': 'Mão',
    'mÃ£os': 'mãos',
    'MÃ£os': 'Mãos',
    'braÃ§o': 'braço',
    'BraÃ§o': 'Braço',
    'braÃ§os': 'braços',
    'BraÃ§os': 'Braços',
    'PadrÃ£o': 'Padrão',
    'ObrigatÃ³ria': 'Obrigatória',
    'ObrigatÃ³rio': 'Obrigatório',
    'obrigatÃ³rios': 'obrigatórios',
    'obrigatÃ³rias': 'obrigatórias',
    'â€”': '—',
    'â‰¡': '≡'
  };

  for (const [key, val] of Object.entries(wordMapping)) {
    if (content.includes(key)) {
      content = content.split(key).join(val);
      changed = true;
    }
  }

  // Also catch generic ones not caught by words
  for (const [key, val] of Object.entries(mapping)) {
    if (content.includes(key)) {
      content = content.split(key).join(val);
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Fixed encoding in ${file}`);
  }
});
console.log('Done!');
