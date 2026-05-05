import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAET } from '../context/AETContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Plus, Eye, ArrowLeft, Trash2, Edit2, Copy, Download, Building2, User, ChevronRight, Printer, AlertTriangle, XCircle, X } from 'lucide-react';
import { validateReport } from '../domain/reports/reportValidation';
import type { ReportValidationResult } from '../domain/reports/reportValidationTypes';

export const ProjectView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getProject, addFunction, deleteFunction, duplicateFunction, exportProjectJSON } = useAET();
  const project = getProject(id!);

  const [isPrinting, setIsPrinting] = useState(false);
  const [validationModal, setValidationModal] = useState<{
    result: ReportValidationResult;
    mode: 'errors' | 'warnings';
  } | null>(null);

  if (!project) return (
    <div className="flex items-center justify-center h-full">
      <p className="text-slate-400 text-lg">Projeto não encontrado</p>
    </div>
  );

  const handleAddFunction = () => {
    navigate(`/project/${project.id}/function/new`);
  };

  const doPrint = () => {
    setIsPrinting(true);
    setTimeout(() => setIsPrinting(false), 5000);
  };

  const handlePrintDirectly = () => {
    const result = validateReport(project);
    if (result.errors.length > 0) {
      setValidationModal({ result, mode: 'errors' });
      return;
    }
    if (result.warnings.length > 0) {
      setValidationModal({ result, mode: 'warnings' });
      return;
    }
    doPrint();
  };

  const handleDuplicate = async (funcId: string) => {
    await duplicateFunction(project.id, funcId);
  };

  const handleExportJSON = () => {
    const json = exportProjectJSON(project.id);
    if (!json) return;
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AET_${project.companyName.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 lg:p-8 xl:p-10">
      {/* ── Breadcrumb ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 mb-6 text-sm text-slate-400">
        <button onClick={() => navigate('/')} className="hover:text-teal-600 transition-colors cursor-pointer">Projetos</button>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-600 font-medium truncate">{project.companyName}</span>
      </div>

      {/* ── Page Header ────────────────────────────────────────────── */}
      <div className="page-header mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center relative z-10 gap-4">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center text-2xl font-bold shrink-0">
              {project.companyName?.charAt(0)?.toUpperCase() || 'P'}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight mb-0.5 truncate">{project.companyName}</h1>
              {project.fantasyName && <p className="text-teal-200 text-sm font-medium truncate">{project.fantasyName}</p>}
              <p className="text-teal-300/70 text-xs mt-1 truncate">
                AET — {project.unit || project.location} — {project.date ? new Date(project.date).toLocaleDateString('pt-BR') : ''}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <Button variant="outline" onClick={handleExportJSON} className="hidden !bg-white/10 !border-white/20 !text-white hover:!bg-white/20 flex-1 sm:flex-none" size="sm">
              <Download className="w-4 h-4" />Exportar
            </Button>
            <Button variant="secondary" onClick={handlePrintDirectly} className="!bg-white !text-teal-700 hover:!bg-teal-50 flex-1 sm:flex-none" size="sm" disabled={isPrinting}>
              <Printer className="w-4 h-4" />{isPrinting ? 'Preparando...' : 'Imprimir'}
            </Button>
            <Button onClick={handleAddFunction} size="sm" className="flex-1 sm:flex-none">
              <Plus className="w-4 h-4" />Função
            </Button>
          </div>
        </div>
      </div>

      {/* ── Info Cards ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-teal-600" />
              Dados da Empresa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <InfoItem label="CNPJ" value={project.cnpj} />
              <InfoItem label="Grau de Risco" value={project.riskDegree} />
            </div>
            <InfoItem label="Endereço" value={project.address} />
            <div className="grid grid-cols-2 gap-3">
              <InfoItem label="Unidade" value={project.unit} />
              <InfoItem label="Produto" value={project.product} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-4 h-4 text-teal-600" />
              Responsável Técnico
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <InfoItem label="Nome" value={project.evaluatorName} />
            <InfoItem label="Registro" value={project.evaluatorCrefito} />
            <InfoItem label="Data" value={project.date ? new Date(project.date).toLocaleDateString('pt-BR') : '-'} />
          </CardContent>
        </Card>
      </div>

      {/* ── Functions ──────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800">
            Funções Analisadas
            <span className="ml-2 stat-badge">{project.functions.length}</span>
          </h2>
        </div>

        {project.functions.length === 0 ? (
          <div className="empty-state">
            <p className="text-slate-500 text-lg font-medium mb-2">Nenhuma função cadastrada</p>
            <p className="text-slate-400 text-sm mb-6">Adicione funções para iniciar a análise ergonômica</p>
            <Button onClick={handleAddFunction} variant="outline">
              <Plus className="w-4 h-4" /> Cadastrar Função
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {project.functions.map((func, idx) => (
              <Card key={func.id} className="function-row !rounded-xl">
                <div className="flex justify-between items-center px-5 py-4">
                  <div className="cursor-pointer flex-1 flex items-center gap-4" onClick={() => navigate(`/project/${project.id}/function/${func.id}`)}>
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-slate-100 to-slate-50 border border-slate-200 flex items-center justify-center text-sm font-bold text-teal-600 shrink-0">
                      {String(idx + 1).padStart(2, '0')}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-slate-800 text-[15px]">{func.name || 'Sem nome'}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {func.sector && `Setor: ${func.sector} • `}
                        {func.numEmployees} colaboradores
                        {func.improvements?.length > 0 && ` • ${func.improvements.length} riscos`}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="sm" onClick={() => handleDuplicate(func.id)} title="Duplicar" className="!rounded-lg">
                      <Copy className="w-4 h-4 text-slate-400 hover:text-blue-500" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => navigate(`/project/${project.id}/function/${func.id}`)} className="!rounded-lg">
                      <Edit2 className="w-4 h-4 text-slate-400 hover:text-teal-600" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => deleteFunction(project.id, func.id)} className="!rounded-lg">
                      <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-500" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Hidden iframe for direct printing */}
      {isPrinting && (
        <iframe
          src={`/project/${project.id}/preview?print=true`}
          style={{ position: 'absolute', width: '0', height: '0', border: 'none' }}
          title="Print Preview"
        />
      )}

      {/* ── Validation modal ───────────────────────────────────────── */}
      {validationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[80vh]">
            {/* Header */}
            <div className={`flex items-center gap-3 px-6 py-4 rounded-t-2xl ${validationModal.mode === 'errors' ? 'bg-red-50 border-b border-red-100' : 'bg-amber-50 border-b border-amber-100'}`}>
              {validationModal.mode === 'errors'
                ? <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                : <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />}
              <div className="flex-1 min-w-0">
                <p className={`font-semibold text-sm ${validationModal.mode === 'errors' ? 'text-red-700' : 'text-amber-700'}`}>
                  {validationModal.mode === 'errors' ? 'Relatório incompleto — impressão bloqueada' : 'Atenção — campos recomendados ausentes'}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {validationModal.mode === 'errors'
                    ? `${validationModal.result.errors.length} pendência(s) obrigatória(s) encontrada(s).`
                    : `${validationModal.result.warnings.length} aviso(s). Você pode continuar mesmo assim.`}
                </p>
              </div>
              <button onClick={() => setValidationModal(null)} className="text-slate-400 hover:text-slate-600 transition-colors shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Issue list */}
            <div className="overflow-y-auto px-6 py-4 space-y-2 flex-1">
              {validationModal.mode === 'errors' && validationModal.result.errors.map((issue, i) => (
                <div key={i} className="flex gap-2.5 items-start">
                  <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-slate-700">{issue.message}</p>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">{issue.path}</p>
                  </div>
                </div>
              ))}
              {validationModal.result.warnings.length > 0 && (
                <>
                  {validationModal.mode === 'errors' && validationModal.result.warnings.length > 0 && (
                    <p className="text-xs text-slate-400 pt-2 font-medium uppercase tracking-wide">Avisos adicionais</p>
                  )}
                  {validationModal.result.warnings.map((issue, i) => (
                    <div key={i} className="flex gap-2.5 items-start">
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-slate-700">{issue.message}</p>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">{issue.path}</p>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2 px-6 py-4 border-t border-slate-100">
              <Button variant="outline" onClick={() => setValidationModal(null)}>
                {validationModal.mode === 'errors' ? 'Fechar' : 'Cancelar'}
              </Button>
              {validationModal.mode === 'warnings' && (
                <Button onClick={() => { setValidationModal(null); doPrint(); }} className="!bg-amber-500 hover:!bg-amber-600 !text-white">
                  Continuar mesmo assim
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const InfoItem = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-[11px] uppercase tracking-wide text-slate-400 font-medium mb-0.5">{label}</p>
    <p className="text-slate-700 font-medium">{value || '-'}</p>
  </div>
);
