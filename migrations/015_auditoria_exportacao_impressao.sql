-- ============================================================
-- MIGRAÇÃO 015 — Novos tipos de ação na auditoria
-- Adiciona EXPORTAÇÃO e IMPRESSÃO ao CHECK constraint.
-- ============================================================

ALTER TABLE auditoria DROP CONSTRAINT IF EXISTS auditoria_acao_check;

ALTER TABLE auditoria
  ADD CONSTRAINT auditoria_acao_check
  CHECK (acao IN (
    'CRIAÇÃO','EDIÇÃO','EXCLUSÃO',
    'INATIVAÇÃO','ATIVAÇÃO',
    'BLOQUEIO','DESBLOQUEIO',
    'EXPORTAÇÃO','IMPRESSÃO'
  ));
