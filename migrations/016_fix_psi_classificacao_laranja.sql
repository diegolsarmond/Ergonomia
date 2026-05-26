-- Remove check constraint de psi_classificacao para permitir qualquer valor
ALTER TABLE aep_funcoes
  DROP CONSTRAINT IF EXISTS aep_funcoes_psi_classificacao_check;
