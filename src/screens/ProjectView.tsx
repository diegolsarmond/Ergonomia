import React, { useState } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { useParams, useNavigate } from 'react-router-dom';
import { useAET } from '../context/AETContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Plus, Eye, ArrowLeft, Trash2, Edit2, Copy, Download, Building2, User, ChevronRight, Printer, AlertTriangle, XCircle, X, AlignLeft } from 'lucide-react';
import { FormGroup, Input, Select, Textarea } from '../components/ui/Forms';
import { validateReport } from '../domain/reports/reportValidation';
import type { ReportValidationResult } from '../domain/reports/reportValidationTypes';
import { useAuth } from '../context/AuthContext';
import { PermissionGuard } from '../components/auth/PermissionGuard';

export const ProjectView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getProject, updateProject, addFunction, deleteFunction, duplicateFunction, exportProjectJSON, companies, units } = useAET();
  const { hasPermission } = useAuth();
  const project = getProject(id!);


  const [validationModal, setValidationModal] = useState<{
    result: ReportValidationResult;
    mode: 'errors' | 'warnings';
  } | null>(null);

  const [isEditIntroModalOpen, setIsEditIntroModalOpen] = useState(false);
  const [introData, setIntroData] = useState({
    introErgonomia: project?.introErgonomia || '',
    introObjetivo: project?.introObjetivo || '',
    introMetodologia: project?.introMetodologia || '',
  });

  const [isEditCompanyModalOpen, setIsEditCompanyModalOpen] = useState(false);
  const [companyData, setCompanyData] = useState({
    empresaId: project?.empresaId || '',
    unidadeId: project?.unidadeId || '',
    companyName: project?.companyName || '',
    fantasyName: project?.fantasyName || '',
    cnpj: project?.cnpj || '',
    address: project?.address || '',
    unit: project?.unit || '',
    product: project?.product || '',
    riskDegree: project?.riskDegree || '',
    location: project?.location || '',
  });

  const [isEditEvaluatorModalOpen, setIsEditEvaluatorModalOpen] = useState(false);
  const [evaluatorData, setEvaluatorData] = useState({
    evaluatorName: project?.evaluatorName || '',
    evaluatorFormation: project?.evaluatorFormation || '',
    evaluatorCrefito: project?.evaluatorCrefito || '',
    evaluatorCompany: project?.evaluatorCompany || '',
    date: project?.date || '',
  });

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'align': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link'],
      ['clean']
    ]
  };

  React.useEffect(() => {
    if (project) {
      setIntroData({
        introErgonomia: project.introErgonomia || '',
        introObjetivo: project.introObjetivo || '',
        introMetodologia: project.introMetodologia || '',
      });
      setCompanyData({
        empresaId: project.empresaId || '',
        unidadeId: project.unidadeId || '',
        companyName: project.companyName || '',
        fantasyName: project.fantasyName || '',
        cnpj: project.cnpj || '',
        address: project.address || '',
        unit: project.unit || '',
        product: project.product || '',
        riskDegree: project.riskDegree || '',
        location: project.location || '',
      });
      setEvaluatorData({
        evaluatorName: project.evaluatorName || '',
        evaluatorFormation: project.evaluatorFormation || '',
        evaluatorCrefito: project.evaluatorCrefito || '',
        evaluatorCompany: project.evaluatorCompany || '',
        date: project.date || '',
      });
    }
  }, [project]);

  const handleSaveIntro = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProject(project!.id, introData);
    setIsEditIntroModalOpen(false);
  };

  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProject(project!.id, companyData);
    setIsEditCompanyModalOpen(false);
  };

  const handleSaveEvaluator = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProject(project!.id, evaluatorData);
    setIsEditEvaluatorModalOpen(false);
  };

  if (!project) return (
    <div className="flex items-center justify-center h-full">
      <p className="text-slate-400 text-lg">Projeto não encontrado</p>
    </div>
  );

  const handleAddFunction = () => {
    navigate(`/project/${project.id}/function/new`);
  };

  const doPrint = () => {
    window.open(`/project/${project.id}/preview?print=true`, '_blank');
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
    a.download = `${project.reportType || 'AET'}_${project.companyName.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 lg:p-8 xl:p-10">
      {/* â”€â”€ Breadcrumb â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="flex items-center gap-2 mb-6 text-sm text-slate-400">
        <button onClick={() => navigate('/')} className="hover:text-teal-600 transition-colors cursor-pointer">Projetos</button>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-600 font-medium truncate">{project.companyName}</span>
      </div>

      {/* â”€â”€ Page Header â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
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
                {project.reportType || 'AET'} — {project.unit || project.location} — {project.date ? new Date(project.date).toLocaleDateString('pt-BR') : ''}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <Button variant="outline" onClick={handleExportJSON} className="hidden !bg-white/10 !border-white/20 !text-white hover:!bg-white/20 flex-1 sm:flex-none" size="sm">
              <Download className="w-4 h-4" />Exportar
            </Button>
            <PermissionGuard permission={project.reportType === 'AEP' ? 'AEP_PRINT' : 'AET_PRINT'}>
              <Button variant="secondary" onClick={handlePrintDirectly} className="!bg-white !text-teal-700 hover:!bg-teal-50 flex-1 sm:flex-none" size="sm">
                <Printer className="w-4 h-4" />Imprimir
              </Button>
            </PermissionGuard>
            <PermissionGuard permission="PROJECTS_EDIT">
              <Button onClick={() => setIsEditIntroModalOpen(true)} variant="outline" className="!bg-white/10 !border-white/20 !text-white hover:!bg-white/20 flex-1 sm:flex-none" size="sm">
                <AlignLeft className="w-4 h-4" /> Textos
              </Button>
            </PermissionGuard>
            <PermissionGuard permission="PROJECTS_EDIT">
              <Button onClick={handleAddFunction} size="sm" className="flex-1 sm:flex-none">
                <Plus className="w-4 h-4" />Função
              </Button>
            </PermissionGuard>
          </div>
        </div>
      </div>

      {/* â”€â”€ Info Cards â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-teal-600" />
                Dados da Empresa
              </span>
              <PermissionGuard permission="PROJECTS_EDIT">
                <Button variant="ghost" size="sm" onClick={() => setIsEditCompanyModalOpen(true)} className="!rounded-lg -mr-1">
                  <Edit2 className="w-3.5 h-3.5 text-slate-400 hover:text-teal-600" />
                </Button>
              </PermissionGuard>
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
            <CardTitle className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2">
                <User className="w-4 h-4 text-teal-600" />
                Responsável Técnico
              </span>
              <PermissionGuard permission="PROJECTS_EDIT">
                <Button variant="ghost" size="sm" onClick={() => setIsEditEvaluatorModalOpen(true)} className="!rounded-lg -mr-1">
                  <Edit2 className="w-3.5 h-3.5 text-slate-400 hover:text-teal-600" />
                </Button>
              </PermissionGuard>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <InfoItem label="Nome" value={project.evaluatorName} />
            <InfoItem label="Registro" value={project.evaluatorCrefito} />
            <InfoItem label="Data" value={project.date ? new Date(project.date).toLocaleDateString('pt-BR') : '-'} />
          </CardContent>
        </Card>
      </div>

      {/* â”€â”€ Functions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
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
            <p className="text-slate-400 text-sm mb-6">Adicione funções para iniciar a análise ergonÃ´mica</p>
            <PermissionGuard permission="PROJECTS_EDIT">
              <Button onClick={handleAddFunction} variant="outline">
                <Plus className="w-4 h-4" /> Cadastrar Função
              </Button>
            </PermissionGuard>
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
                        {func.sector && `Setor: ${func.sector} â€¢ `}
                        {func.numEmployees} colaboradores
                        {func.improvements?.length > 0 && ` â€¢ ${func.improvements.length} riscos`}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <PermissionGuard permission="PROJECTS_EDIT">
                      <Button variant="ghost" size="sm" onClick={() => handleDuplicate(func.id)} title="Duplicar" className="!rounded-lg">
                        <Copy className="w-4 h-4 text-slate-400 hover:text-blue-500" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/project/${project.id}/function/${func.id}`)} className="!rounded-lg">
                        <Edit2 className="w-4 h-4 text-slate-400 hover:text-teal-600" />
                      </Button>
                    </PermissionGuard>
                    <PermissionGuard permission="PROJECTS_DELETE">
                      <Button variant="ghost" size="sm" onClick={() => deleteFunction(project.id, func.id)} className="!rounded-lg">
                        <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-500" />
                      </Button>
                    </PermissionGuard>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>


      {/* â”€â”€ Validation modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {validationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[80vh]">
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

      {isEditCompanyModalOpen && (
        <div className="modal-overlay" onClick={() => setIsEditCompanyModalOpen(false)}>
          <Card className="modal-content w-full max-w-lg max-h-[90vh] overflow-y-auto !rounded-2xl" onClick={e => e.stopPropagation()}>
            <CardHeader className="!bg-gradient-to-r !from-slate-50 !to-slate-100/50">
              <CardTitle className="!text-lg">Editar Dados da Empresa</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveCompany} className="space-y-4">
                <FormGroup label="Empresa cadastrada">
                  <Select
                    value={companyData.empresaId}
                    onChange={e => {
                      const co = companies.find(c => c.id === e.target.value);
                      if (co) {
                        const addr = [co.logradouro, co.numero, co.bairro, co.municipio, co.uf].filter(Boolean).join(', ');
                        setCompanyData(p => ({
                          ...p,
                          empresaId: co.id,
                          unidadeId: '',
                          companyName: co.razaoSocial,
                          fantasyName: co.nomeFantasia,
                          cnpj: co.cnpj,
                          address: addr,
                          product: co.product || p.product,
                          riskDegree: co.riskDegree || p.riskDegree,
                          location: co.productionLocation || p.location,
                        }));
                      } else {
                        setCompanyData(p => ({ ...p, empresaId: '', unidadeId: '' }));
                      }
                    }}
                  >
                    <option value="">— digitar manualmente —</option>
                    {companies.filter(c => c.active).map(c => (
                      <option key={c.id} value={c.id}>{c.razaoSocial}{c.nomeFantasia ? ` (${c.nomeFantasia})` : ''}</option>
                    ))}
                  </Select>
                </FormGroup>

                {companyData.empresaId && (
                  <FormGroup label="Unidade">
                    <Select
                      value={companyData.unidadeId}
                      onChange={e => {
                        const un = units.find(u => u.id === e.target.value);
                        setCompanyData(p => ({
                          ...p,
                          unidadeId: e.target.value,
                          unit: un?.name || p.unit,
                          address: un?.address || p.address,
                          location: un?.productionLocation || p.location,
                        }));
                      }}
                    >
                      <option value="">— sem unidade específica —</option>
                      {units.filter(u => u.companyId === companyData.empresaId).map(u => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                      ))}
                    </Select>
                  </FormGroup>
                )}

                <div className="border-t border-slate-100 pt-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormGroup label="Razão Social" required>
                      <Input value={companyData.companyName} onChange={e => setCompanyData(p => ({ ...p, companyName: e.target.value }))} />
                    </FormGroup>
                    <FormGroup label="Nome Fantasia">
                      <Input value={companyData.fantasyName} onChange={e => setCompanyData(p => ({ ...p, fantasyName: e.target.value }))} />
                    </FormGroup>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormGroup label="CNPJ">
                      <Input value={companyData.cnpj} onChange={e => setCompanyData(p => ({ ...p, cnpj: e.target.value }))} />
                    </FormGroup>
                    <FormGroup label="Grau de Risco">
                      <Select value={companyData.riskDegree} onChange={e => setCompanyData(p => ({ ...p, riskDegree: e.target.value }))}>
                        <option value="">Selecione</option>
                        <option value="1">Grau 1</option>
                        <option value="2">Grau 2</option>
                        <option value="3">Grau 3</option>
                        <option value="4">Grau 4</option>
                      </Select>
                    </FormGroup>
                  </div>
                  <FormGroup label="Endereço">
                    <Input value={companyData.address} onChange={e => setCompanyData(p => ({ ...p, address: e.target.value }))} />
                  </FormGroup>
                  <div className="grid grid-cols-2 gap-4">
                    <FormGroup label="Unidade / Filial">
                      <Input value={companyData.unit} onChange={e => setCompanyData(p => ({ ...p, unit: e.target.value }))} />
                    </FormGroup>
                    <FormGroup label="Localização">
                      <Input value={companyData.location} onChange={e => setCompanyData(p => ({ ...p, location: e.target.value }))} />
                    </FormGroup>
                  </div>
                  <FormGroup label="Produto / Atividade">
                    <Input value={companyData.product} onChange={e => setCompanyData(p => ({ ...p, product: e.target.value }))} />
                  </FormGroup>
                </div>

                <div className="flex justify-end gap-3 mt-2 pt-4 border-t border-slate-100">
                  <Button variant="ghost" type="button" onClick={() => setIsEditCompanyModalOpen(false)}>Cancelar</Button>
                  <Button type="submit">Salvar Alterações</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {isEditEvaluatorModalOpen && (
        <div className="modal-overlay" onClick={() => setIsEditEvaluatorModalOpen(false)}>
          <Card className="modal-content w-full max-w-lg max-h-[90vh] overflow-y-auto !rounded-2xl" onClick={e => e.stopPropagation()}>
            <CardHeader className="!bg-gradient-to-r !from-slate-50 !to-slate-100/50">
              <CardTitle className="!text-lg">Editar Responsável Técnico</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveEvaluator} className="space-y-4">
                <FormGroup label="Nome">
                  <Input value={evaluatorData.evaluatorName} onChange={e => setEvaluatorData(p => ({ ...p, evaluatorName: e.target.value }))} />
                </FormGroup>
                <div className="grid grid-cols-2 gap-4">
                  <FormGroup label="Formação">
                    <Input value={evaluatorData.evaluatorFormation} onChange={e => setEvaluatorData(p => ({ ...p, evaluatorFormation: e.target.value }))} />
                  </FormGroup>
                  <FormGroup label="Registro (CREFITO)">
                    <Input value={evaluatorData.evaluatorCrefito} onChange={e => setEvaluatorData(p => ({ ...p, evaluatorCrefito: e.target.value }))} />
                  </FormGroup>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormGroup label="Empresa / Consultoria">
                    <Input value={evaluatorData.evaluatorCompany} onChange={e => setEvaluatorData(p => ({ ...p, evaluatorCompany: e.target.value }))} />
                  </FormGroup>
                  <FormGroup label="Data do Relatório">
                    <Input type="date" value={evaluatorData.date} onChange={e => setEvaluatorData(p => ({ ...p, date: e.target.value }))} />
                  </FormGroup>
                </div>
                <div className="flex justify-end gap-3 mt-2 pt-4 border-t border-slate-100">
                  <Button variant="ghost" type="button" onClick={() => setIsEditEvaluatorModalOpen(false)}>Cancelar</Button>
                  <Button type="submit">Salvar Alterações</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {isEditIntroModalOpen && (
        <div className="modal-overlay" onClick={() => setIsEditIntroModalOpen(false)}>
          <Card className="modal-content w-full max-w-2xl max-h-[90vh] overflow-y-auto !rounded-2xl" onClick={e => e.stopPropagation()}>
            <CardHeader className="!bg-gradient-to-r !from-slate-50 !to-slate-100/50">
              <CardTitle className="!text-lg">Editar Textos de Introdução</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveIntro} className="space-y-6">
                <FormGroup label="1.1 Ergonomia â€“ texto conceitual">
                  <div className="bg-white rounded-xl overflow-hidden border border-slate-200">
                    <ReactQuill 
                      theme="snow"
                      modules={quillModules}
                      value={introData.introErgonomia} 
                      onChange={val => setIntroData(prev => ({ ...prev, introErgonomia: val }))} 
                      className="min-h-[150px]"
                    />
                  </div>
                </FormGroup>
                <FormGroup label="1.3 Objetivo">
                  <div className="bg-white rounded-xl overflow-hidden border border-slate-200">
                    <ReactQuill 
                      theme="snow"
                      modules={quillModules}
                      value={introData.introObjetivo} 
                      onChange={val => setIntroData(prev => ({ ...prev, introObjetivo: val }))} 
                      className="min-h-[150px]"
                    />
                  </div>
                </FormGroup>
                <FormGroup label="1.4 Metodologia">
                  <div className="bg-white rounded-xl overflow-hidden border border-slate-200">
                    <ReactQuill 
                      theme="snow"
                      modules={quillModules}
                      value={introData.introMetodologia} 
                      onChange={val => setIntroData(prev => ({ ...prev, introMetodologia: val }))} 
                      className="min-h-[150px]"
                    />
                  </div>
                </FormGroup>

                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                  <Button variant="ghost" type="button" onClick={() => setIsEditIntroModalOpen(false)}>Cancelar</Button>
                  <Button type="submit">Salvar Alterações</Button>
                </div>
              </form>
            </CardContent>
          </Card>
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
