import React, { useCallback, useEffect, useState } from 'react';
import { Search, RefreshCw, ChevronLeft, ChevronRight, Filter, X } from 'lucide-react';
import { auditoriaApi, type AuditoriaRow } from '../services/api';

// ── Helpers ──────────────────────────────────────────────────────────────────

const ACOES = [
  'CRIAÇÃO', 'EDIÇÃO', 'EXCLUSÃO',
  'INATIVAÇÃO', 'ATIVAÇÃO',
  'BLOQUEIO', 'DESBLOQUEIO',
  'EXPORTAÇÃO', 'IMPRESSÃO',
] as const;

type BadgeConfig = { bg: string; text: string; label: string };

const ACAO_BADGE: Record<string, BadgeConfig> = {
  'CRIAÇÃO':     { bg: '#dcfce7', text: '#166534', label: 'Criação' },
  'EDIÇÃO':      { bg: '#dbeafe', text: '#1e40af', label: 'Edição' },
  'EXCLUSÃO':    { bg: '#fee2e2', text: '#991b1b', label: 'Exclusão' },
  'INATIVAÇÃO':  { bg: '#fef9c3', text: '#854d0e', label: 'Inativação' },
  'ATIVAÇÃO':    { bg: '#d1fae5', text: '#065f46', label: 'Ativação' },
  'BLOQUEIO':    { bg: '#fce7f3', text: '#9d174d', label: 'Bloqueio' },
  'DESBLOQUEIO': { bg: '#ede9fe', text: '#5b21b6', label: 'Desbloqueio' },
  'EXPORTAÇÃO':  { bg: '#ffedd5', text: '#7c2d12', label: 'Exportação' },
  'IMPRESSÃO':   { bg: '#e0f2fe', text: '#0c4a6e', label: 'Impressão' },
};

function AcaoBadge({ acao }: { acao: string }) {
  const cfg = ACAO_BADGE[acao] ?? { bg: '#f3f4f6', text: '#374151', label: acao };
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
      style={{ backgroundColor: cfg.bg, color: cfg.text }}
    >
      {cfg.label}
    </span>
  );
}

function formatDataHora(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}

const PAGE_SIZE = 50;

// ── Componente principal ─────────────────────────────────────────────────────

export const AuditoriaAdmin: React.FC = () => {
  const [rows, setRows]         = useState<AuditoriaRow[]>([]);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [page, setPage]         = useState(0);

  // Filtros
  const [filtroAcao,       setFiltroAcao]       = useState('');
  const [filtroUsuario,    setFiltroUsuario]     = useState('');
  const [filtroDataInicio, setFiltroDataInicio]  = useState('');
  const [filtroDataFim,    setFiltroDataFim]     = useState('');
  const [filtroDescricao,  setFiltroDescricao]   = useState('');

  const fetchData = useCallback(async (p: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await auditoriaApi.list({
        acao:       filtroAcao       || undefined,
        dataInicio: filtroDataInicio || undefined,
        dataFim:    filtroDataFim    || undefined,
        limit:  PAGE_SIZE,
        offset: p * PAGE_SIZE,
      });
      // Filtro de descrição/usuário feito localmente (não tem endpoint específico ainda)
      let filtered = result.rows;
      if (filtroUsuario.trim()) {
        const q = filtroUsuario.trim().toLowerCase();
        filtered = filtered.filter(r => r.usuario_nome.toLowerCase().includes(q));
      }
      if (filtroDescricao.trim()) {
        const q = filtroDescricao.trim().toLowerCase();
        filtered = filtered.filter(r => (r.descricao ?? '').toLowerCase().includes(q));
      }
      setRows(filtered);
      setTotal(result.total);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }, [filtroAcao, filtroUsuario, filtroDataInicio, filtroDataFim, filtroDescricao]);

  useEffect(() => {
    fetchData(page);
  }, [fetchData, page]);

  const handleSearch = () => {
    setPage(0);
    fetchData(0);
  };

  const handleClearFilters = () => {
    setFiltroAcao('');
    setFiltroUsuario('');
    setFiltroDataInicio('');
    setFiltroDataFim('');
    setFiltroDescricao('');
    setPage(0);
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasFilters = filtroAcao || filtroUsuario || filtroDataInicio || filtroDataFim || filtroDescricao;

  return (
    <div className="min-h-screen bg-[var(--color-surface,#f8fafc)] p-4 sm:p-6">

      {/* Cabeçalho */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Painel de Auditoria</h1>
        <p className="text-sm text-slate-500 mt-1">
          Registro de todas as ações realizadas no sistema.
        </p>
      </div>

      {/* Card de filtros */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 mb-5">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-semibold text-slate-600">Filtros</span>
          {hasFilters && (
            <button
              onClick={handleClearFilters}
              className="ml-auto flex items-center gap-1 text-xs text-slate-400 hover:text-red-500 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Limpar filtros
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {/* Ação */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Ação</label>
            <select
              value={filtroAcao}
              onChange={e => setFiltroAcao(e.target.value)}
              className="w-full rounded-lg border border-slate-200 text-sm px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400"
            >
              <option value="">Todas</option>
              {ACOES.map(a => (
                <option key={a} value={a}>{ACAO_BADGE[a]?.label ?? a}</option>
              ))}
            </select>
          </div>

          {/* Usuário */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Usuário</label>
            <input
              type="text"
              placeholder="Nome do usuário..."
              value={filtroUsuario}
              onChange={e => setFiltroUsuario(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              className="w-full rounded-lg border border-slate-200 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400"
            />
          </div>

          {/* Data início */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Data início</label>
            <input
              type="date"
              value={filtroDataInicio}
              onChange={e => setFiltroDataInicio(e.target.value)}
              className="w-full rounded-lg border border-slate-200 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400"
            />
          </div>

          {/* Data fim */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Data fim</label>
            <input
              type="date"
              value={filtroDataFim}
              onChange={e => setFiltroDataFim(e.target.value)}
              className="w-full rounded-lg border border-slate-200 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400"
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Descrição</label>
            <input
              type="text"
              placeholder="Buscar na descrição..."
              value={filtroDescricao}
              onChange={e => setFiltroDescricao(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              className="w-full rounded-lg border border-slate-200 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400"
            />
          </div>
        </div>

        <div className="flex justify-end mt-3 gap-2">
          <button
            onClick={() => fetchData(page)}
            disabled={loading}
            title="Atualizar"
            className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:text-teal-600 hover:border-teal-300 transition-colors disabled:opacity-40"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleSearch}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity disabled:opacity-40"
            style={{ background: '#3D7268' }}
          >
            <Search className="w-4 h-4" />
            Pesquisar
          </button>
        </div>
      </div>

      {/* Resumo */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-slate-500">
          {loading ? 'Carregando...' : `${total.toLocaleString('pt-BR')} registro${total !== 1 ? 's' : ''} encontrado${total !== 1 ? 's' : ''}`}
        </p>
        <p className="text-sm text-slate-400">
          Página {page + 1} de {totalPages}
        </p>
      </div>

      {/* Erro */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-4 text-sm">
          {error}
        </div>
      )}

      {/* Tabela */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Data e Hora</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Usuário</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Ação</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Descrição</th>
              </tr>
            </thead>
            <tbody>
              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-slate-400">
                    Nenhum registro encontrado.
                  </td>
                </tr>
              )}
              {rows.map((row, idx) => (
                <tr
                  key={row.id}
                  className={`border-b border-slate-50 hover:bg-slate-50/60 transition-colors ${idx % 2 === 0 ? '' : 'bg-slate-50/30'}`}
                >
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap font-mono text-xs">
                    {formatDataHora(row.data_hora)}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-700 whitespace-nowrap">
                    {row.usuario_nome}
                  </td>
                  <td className="px-4 py-3">
                    <AcaoBadge acao={row.acao} />
                  </td>
                  <td className="px-4 py-3 text-slate-600 max-w-xs truncate" title={row.descricao ?? ''}>
                    {row.descricao || <span className="text-slate-300 italic">—</span>}
                  </td>
                </tr>
              ))}
              {loading && (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={`sk-${i}`} className="border-b border-slate-50">
                    <td className="px-4 py-3"><div className="h-4 bg-slate-100 rounded animate-pulse w-36" /></td>
                    <td className="px-4 py-3"><div className="h-4 bg-slate-100 rounded animate-pulse w-28" /></td>
                    <td className="px-4 py-3"><div className="h-5 bg-slate-100 rounded-full animate-pulse w-20" /></td>
                    <td className="px-4 py-3"><div className="h-4 bg-slate-100 rounded animate-pulse w-48" /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0 || loading}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => {
                const p = totalPages <= 7 ? i : i === 0 ? 0 : i === 6 ? totalPages - 1 : page - 2 + i;
                const clamped = Math.max(0, Math.min(totalPages - 1, p));
                return (
                  <button
                    key={i}
                    onClick={() => setPage(clamped)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${clamped === page ? 'text-white' : 'text-slate-500 hover:bg-slate-100'}`}
                    style={clamped === page ? { background: '#3D7268' } : {}}
                  >
                    {clamped + 1}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1 || loading}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Próxima
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
