import React, { useState } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { useParams, useNavigate } from 'react-router-dom';
import { useAET } from '../context/AETContext';
import { auditoriaApi } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Plus, Eye, ArrowLeft, Trash2, Edit2, Copy, Download, Building2, User, ChevronRight, Printer, AlertTriangle, XCircle, X, AlignLeft, Layers } from 'lucide-react';
import { FormGroup, Input, Select, Textarea } from '../components/ui/Forms';
import { validateReport } from '../domain/reports/reportValidation';
import type { ReportValidationResult } from '../domain/reports/reportValidationTypes';
import { useAuth } from '../context/AuthContext';
import { PermissionGuard } from '../components/auth/PermissionGuard';
import { IlluminanceMeasurementPanel } from '../components/IlluminanceMeasurementPanel';
import type { SectorIlluminance, IlluminanceMeasurement, Sector, AETFunction } from '../types';
import { SectorModalForm, EMPTY_SECTOR } from '../components/SharedParameterModals';

export const ProjectView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getProject, fetchProjectDetails, updateProject, addFunction, deleteFunction, duplicateFunction, exportProjectJSON, companies, units, sectors, addSector, refetch } = useAET();
  const { hasPermission } = useAuth();
  const [loadingProject, setLoadingProject] = useState(true);
  
  React.useEffect(() => {
    if (id) {
      setLoadingProject(true);
      fetchProjectDetails(id)
        .catch(err => console.error(err))
        .finally(() => setLoadingProject(false));
    }
  }, [id, fetchProjectDetails]);

  const project = getProject(id!);

  // Empresa vinculada ao projeto
  const matchedCompany = project
    ? companies.find(c =>
        (c.cnpj && project.cnpj && c.cnpj.replace(/\D/g, '') === project.cnpj.replace(/\D/g, '')) ||
        c.razaoSocial === project.companyName ||
        c.nomeFantasia === project.companyName
      )
    : undefined;

  const companySectors = matchedCompany
    ? sectors.filter(s => s.companyId === matchedCompany.id && s.active)
    : [];


  const [validationModal, setValidationModal] = useState<{
    result: ReportValidationResult;
    mode: 'errors' | 'warnings';
  } | null>(null);

  // ── Modal de setores / iluminância ─────────────────────────────────────────
  const [sectorModalOpen, setSectorModalOpen] = useState(false);
  const [selectedSectorId, setSelectedSectorId] = useState<string>('');
  const [sectorIlluminance, setSectorIlluminance] = useState<SectorIlluminance[]>([]);

  React.useEffect(() => {
    if (sectorModalOpen) {
      refetch(true);
    }
  }, [sectorModalOpen, refetch]);

  // Cadastrar novo setor
  const [isNewSectorModalOpen, setIsNewSectorModalOpen] = useState(false);
  const [newSectorForm, setNewSectorForm] = useState<Omit<Sector, 'id'>>({
    companyId: '',
    unitId: '',
    name: '',
    description: '',
    active: true,
  });
  const [isSectorSaving, setIsSectorSaving] = useState(false);
  const [pendingSelectSectorName, setPendingSelectSectorName] = useState<string | null>(null);

  React.useEffect(() => {
    if (pendingSelectSectorName && matchedCompany) {
      const found = sectors.find(s => s.name === pendingSelectSectorName && s.companyId === matchedCompany.id);
      if (found) {
        setSelectedSectorId(found.id);
        setPendingSelectSectorName(null);
      }
    }
  }, [sectors, pendingSelectSectorName, matchedCompany]);

  const handleOpenNewSectorModal = (companyId: string) => {
    setNewSectorForm({
      ...EMPTY_SECTOR,
      companyId,
    });
    setIsNewSectorModalOpen(true);
  };

  const handleSaveSector = async () => {
    if (!newSectorForm.name.trim() || isSectorSaving) return;
    setIsSectorSaving(true);
    try {
      await addSector(newSectorForm);
      setPendingSelectSectorName(newSectorForm.name);
      setIsNewSectorModalOpen(false);
    } catch (err) {
      console.error('Erro ao cadastrar setor:', err);
    } finally {
      setIsSectorSaving(false);
    }
  };

  const [funcSelectionModal, setFuncSelectionModal] = useState(false);
  const [selectedFuncIds, setSelectedFuncIds] = useState<string[]>([]);

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
      setSectorIlluminance(project.sectorIlluminance ?? []);
    }
  }, [project?.id]); // eslint-disable-line react-hooks/exhaustive-deps

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

  if (loadingProject || !project) return (
    <div className="flex items-center justify-center h-full min-h-[50vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-3 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
        <p className="text-slate-400 text-sm font-medium">Carregando detalhes do projeto...</p>
      </div>
    </div>
  );

  const handleAddFunction = () => {
    navigate(`/project/${project.id}/function/new`);
  };

  const doPrint = (funcIds: string[]) => {
    const allIds = project.functions.map(f => f.id);
    const isAll = funcIds.length === allIds.length;
    const url = isAll
      ? `/project/${project.id}/preview?print=true`
      : `/project/${project.id}/preview?print=true&funcoes=${funcIds.join(',')}`;
    window.open(url, '_blank');
  };

  const openFuncSelectionModal = () => {
    setSelectedFuncIds(project.functions.map(f => f.id));
    setFuncSelectionModal(true);
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
    openFuncSelectionModal();
  };

  const handleDuplicate = async (funcId: string) => {
    await duplicateFunction(project.id, funcId);
  };

  const handleExportJSON = () => {
    const json = exportProjectJSON(project.id);
    if (!json) return;
    const tabela = project.reportType === 'AEP' ? 'aep_projetos' : 'aet_projetos';
    const desc = `Exportação JSON do projeto ${project.reportType || 'AET'}: ${project.companyName}`;
    auditoriaApi.registrar('EXPORTAÇÃO', tabela, project.id, desc).catch(() => {});
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.reportType || 'AET'}_${project.companyName.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Group functions by sector name
  const functionsBySector: Record<string, AETFunction[]> = {};
  const matchedFuncIds = new Set<string>();

  companySectors.forEach(sector => {
    const sNameLower = sector.name.trim().toLowerCase();
    const funcs = project.functions.filter(f => (f.sector || '').trim().toLowerCase() === sNameLower);
    functionsBySector[sector.id] = funcs;
    funcs.forEach(f => matchedFuncIds.add(f.id));
  });

  const remainingFuncs = project.functions.filter(f => !matchedFuncIds.has(f.id));

  return (
    <div className="p-6 lg:p-8 xl:p-10">
      {/* â"€â"€ Breadcrumb â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€ */}
      <div className="flex items-center gap-2 mb-6 text-sm text-slate-400">
        <button onClick={() => navigate('/')} className="hover:text-teal-600 transition-colors cursor-pointer">Projetos</button>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-600 font-medium truncate">{project.companyName}</span>
      </div>

      {/* â"€â"€ Page Header â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€ */}
      <div className="page-header mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center relative z-10 gap-4">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            {(project.companyLogoDataUrl || matchedCompany?.logoDataUrl) ? (
              <img
                src={project.companyLogoDataUrl || matchedCompany?.logoDataUrl}
                alt="Logo"
                className="w-14 h-14 rounded-2xl object-contain shrink-0 bg-white p-1 border border-white/20"
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center text-2xl font-bold shrink-0">
                {project.companyName?.charAt(0)?.toUpperCase() || 'P'}
              </div>
            )}
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
          </div>
        </div>
      </div>

      {/* â"€â"€ Info Cards â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€ */}
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

                {/* ── Highlighted Action Panel ───────────────────────────────────────── */}
      <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-6 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-800 mb-1">Estrutura do Projeto</h2>
          <p className="text-xs text-slate-500">Cadastre os setores da empresa e adicione funções para a análise ergonômica.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <PermissionGuard permission="PROJECTS_EDIT">
            <Button
              variant="outline"
              onClick={() => handleOpenNewSectorModal(project.empresaId || matchedCompany?.id || '')}
              disabled={!matchedCompany && !project.empresaId}
              className="!bg-white hover:!bg-slate-50 !text-slate-700 border border-slate-200 px-5 py-2.5 h-auto text-sm font-semibold shadow-sm transition-all flex items-center gap-2 rounded-xl"
            >
              <Plus className="w-4 h-4 text-indigo-600" /> Novo Setor
            </Button>
          </PermissionGuard>

          {project.reportType === 'AEP' && (
            <PermissionGuard permission="PROJECTS_EDIT">
              <Button
                variant="outline"
                onClick={() => setSectorModalOpen(true)}
                className="!bg-white hover:!bg-slate-50 !text-slate-700 border border-slate-200 px-5 py-2.5 h-auto text-sm font-semibold transition-all flex items-center gap-2 rounded-xl"
              >
                <Layers className="w-4 h-4 text-indigo-600" /> Iluminância por Setor
              </Button>
            </PermissionGuard>
          )}

          <PermissionGuard permission="PROJECTS_EDIT">
            <Button
              variant="outline"
              onClick={handleAddFunction}
              className="!bg-white hover:!bg-slate-50 !text-slate-700 border border-slate-200 px-5 py-2.5 h-auto text-sm font-semibold shadow-sm transition-all flex items-center gap-2 rounded-xl"
            >
              <Plus className="w-4 h-4 text-teal-600" /> Nova Função
            </Button>
          </PermissionGuard>
        </div>
      </div>

      {/* ── Functions & Sectors ──────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            Funções e Setores Analisados
            <span className="stat-badge">{project.functions.length}</span>
          </h2>
        </div>

        {companySectors.length === 0 && project.functions.length === 0 ? (
          <div className="empty-state">
            <p className="text-slate-500 text-lg font-medium mb-2">Nenhum setor ou função cadastrada</p>
            <p className="text-slate-400 text-sm mb-6">Cadastre os setores da empresa ou adicione funções para iniciar a análise.</p>
            <div className="flex flex-wrap justify-center gap-3">
              <PermissionGuard permission="PROJECTS_EDIT">
                <Button onClick={() => handleOpenNewSectorModal(project.empresaId || matchedCompany?.id || '')} variant="outline" className="flex items-center gap-1.5">
                  <Plus className="w-4 h-4" /> Cadastrar Setor
                </Button>
              </PermissionGuard>
              <PermissionGuard permission="PROJECTS_EDIT">
                <Button onClick={handleAddFunction} variant="outline" className="flex items-center gap-1.5">
                  <Plus className="w-4 h-4" /> Cadastrar Função
                </Button>
              </PermissionGuard>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {companySectors.map((sector) => {
              const funcs = functionsBySector[sector.id] || [];
              return (
                <div key={sector.id} className="bg-white/60 backdrop-blur-sm p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                        <Layers className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-[15px] font-bold text-slate-800 tracking-wide uppercase truncate">
                          {sector.name}
                        </h3>
                        {sector.description && (
                          <p className="text-xs text-slate-400 font-normal normal-case mt-0.5 truncate">{sector.description}</p>
                        )}
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full shrink-0">
                      {funcs.length} {funcs.length === 1 ? 'função' : 'funções'}
                    </span>
                  </div>

                  {funcs.length === 0 ? (
                    <div className="py-8 text-center border border-dashed border-slate-200/60 rounded-xl bg-slate-50/50">
                      <p className="text-sm text-slate-400">Nenhuma função cadastrada neste setor.</p>
                      <PermissionGuard permission="PROJECTS_EDIT">
                        <button
                          onClick={() => {
                            navigate(`/project/${project.id}/function/new?sector=${encodeURIComponent(sector.name)}`);
                          }}
                          className="mt-2 inline-flex items-center gap-1 text-xs text-teal-600 hover:text-teal-700 font-bold transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" /> Cadastrar Função no Setor
                        </button>
                      </PermissionGuard>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-2.5">
                      {funcs.map((func) => {
                        const globalIdx = project.functions.findIndex(f => f.id === func.id);
                        return (
                          <Card key={func.id} className="function-row !rounded-xl border border-slate-100 hover:border-teal-200 hover:shadow-md hover:shadow-slate-100/50 transition-all bg-white">
                            <div className="flex justify-between items-center px-4 py-3">
                              <div className="cursor-pointer flex-1 flex items-center gap-4 min-w-0" onClick={() => navigate(`/project/${project.id}/function/${func.id}`)}>
                                <div className="w-8.5 h-8.5 rounded-lg bg-gradient-to-br from-slate-100 to-slate-50 border border-slate-200 flex items-center justify-center text-xs font-bold text-teal-600 shrink-0">
                                  {String(globalIdx + 1).padStart(2, '0')}
                                </div>
                                <div className="min-w-0">
                                  <h3 className="font-semibold text-slate-800 text-sm truncate">{func.name || 'Sem nome'}</h3>
                                  <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                                    <span>{func.numEmployees} colaboradores</span>
                                    {func.improvements?.length > 0 && (
                                      <>
                                        <span className="text-slate-300">•</span>
                                        <span className="text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded text-[10px] font-medium">{func.improvements.length} riscos</span>
                                      </>
                                    )}
                                  </p>
                                </div>
                              </div>
                              <div className="flex gap-1 shrink-0 ml-3">
                                <PermissionGuard permission="PROJECTS_EDIT">
                                  <Button variant="ghost" size="sm" onClick={() => handleDuplicate(func.id)} title="Duplicar" className="!rounded-lg !p-1.5">
                                    <Copy className="w-4 h-4 text-slate-400 hover:text-blue-500" />
                                  </Button>
                                  <Button variant="ghost" size="sm" onClick={() => navigate(`/project/${project.id}/function/${func.id}`)} className="!rounded-lg !p-1.5">
                                    <Edit2 className="w-4 h-4 text-slate-400 hover:text-teal-600" />
                                  </Button>
                                </PermissionGuard>
                                <PermissionGuard permission="PROJECTS_DELETE">
                                  <Button variant="ghost" size="sm" onClick={() => deleteFunction(project.id, func.id)} className="!rounded-lg !p-1.5">
                                    <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-500" />
                                  </Button>
                                </PermissionGuard>
                              </div>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {remainingFuncs.length > 0 && (
              <div className="bg-white/60 backdrop-blur-sm p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200/60 flex items-center justify-center text-slate-500 shrink-0">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-[15px] font-bold text-slate-700 tracking-wide uppercase truncate">
                        Outros / Sem Setor
                      </h3>
                      <p className="text-xs text-slate-400 font-normal normal-case mt-0.5">Funções não vinculadas a setores cadastrados no catálogo</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-slate-600 bg-slate-100 border border-slate-200/60 px-3 py-1 rounded-full shrink-0">
                    {remainingFuncs.length} {remainingFuncs.length === 1 ? 'função' : 'funções'}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  {remainingFuncs.map((func) => {
                    const globalIdx = project.functions.findIndex(f => f.id === func.id);
                    return (
                      <Card key={func.id} className="function-row !rounded-xl border border-slate-100 hover:border-teal-200 hover:shadow-md hover:shadow-slate-100/50 transition-all bg-white">
                        <div className="flex justify-between items-center px-4 py-3">
                          <div className="cursor-pointer flex-1 flex items-center gap-4 min-w-0" onClick={() => navigate(`/project/${project.id}/function/${func.id}`)}>
                            <div className="w-8.5 h-8.5 rounded-lg bg-gradient-to-br from-slate-100 to-slate-50 border border-slate-200 flex items-center justify-center text-xs font-bold text-teal-600 shrink-0">
                              {String(globalIdx + 1).padStart(2, '0')}
                            </div>
                            <div className="min-w-0">
                              <h3 className="font-semibold text-slate-800 text-sm truncate">
                                {func.name || 'Sem nome'}
                                {func.sector && (
                                  <span className="ml-2 text-xs font-semibold text-slate-400 bg-slate-100 border border-slate-200/60 px-2 py-0.5 rounded-md">
                                    {func.sector}
                                  </span>
                                )}
                              </h3>
                              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                                <span>{func.numEmployees} colaboradores</span>
                                {func.improvements?.length > 0 && (
                                  <>
                                    <span className="text-slate-300">•</span>
                                    <span className="text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded text-[10px] font-medium">{func.improvements.length} riscos</span>
                                  </>
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-1 shrink-0 ml-3">
                            <PermissionGuard permission="PROJECTS_EDIT">
                              <Button variant="ghost" size="sm" onClick={() => handleDuplicate(func.id)} title="Duplicar" className="!rounded-lg !p-1.5">
                                <Copy className="w-4 h-4 text-slate-400 hover:text-blue-500" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => navigate(`/project/${project.id}/function/${func.id}`)} className="!rounded-lg !p-1.5">
                                <Edit2 className="w-4 h-4 text-slate-400 hover:text-teal-600" />
                              </Button>
                            </PermissionGuard>
                            <PermissionGuard permission="PROJECTS_DELETE">
                              <Button variant="ghost" size="sm" onClick={() => deleteFunction(project.id, func.id)} className="!rounded-lg !p-1.5">
                                <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-500" />
                              </Button>
                            </PermissionGuard>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>


      {/* ── Modal de Setores / Iluminância ─────────────────────────────────── */}
      {sectorModalOpen && (() => {
        const selectedSector = companySectors.find(s => s.id === selectedSectorId);

        const getMeasurements = (sectorId: string) =>
          sectorIlluminance.find(si => si.sectorId === sectorId)?.measurements ?? [];

        const setMeasurements = (sectorId: string, sectorName: string, measurements: IlluminanceMeasurement[]) => {
          setSectorIlluminance(prev => {
            const idx = prev.findIndex(si => si.sectorId === sectorId);
            if (idx >= 0) {
              const updated = [...prev];
              updated[idx] = { sectorId, sectorName, measurements };
              return updated;
            }
            return [...prev, { sectorId, sectorName, measurements }];
          });
        };

        const handleSave = async () => {
          await updateProject(project!.id, { sectorIlluminance });
          setSectorModalOpen(false);
        };

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl flex flex-col h-[95vh] md:h-[90vh] max-h-[95vh]">
              {/* Header */}
              <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100">
                <Layers className="w-5 h-5 text-teal-600 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-slate-800">Setores — Medições de Iluminância</p>
                  <p className="text-xs text-slate-400 mt-0.5">Selecione um setor para registrar as medições de iluminância</p>
                </div>
                <button onClick={() => setSectorModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors shrink-0">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
                {/* Lista de setores */}
                <div className="w-full md:w-64 shrink-0 border-b md:border-b-0 md:border-r border-slate-100 flex flex-col p-3 overflow-hidden">
                  <div className="flex flex-row md:flex-col overflow-x-auto md:overflow-x-hidden md:overflow-y-auto gap-2 md:gap-1 pb-2 md:pb-0 flex-1 scrollbar-thin items-center md:items-stretch">
                    {matchedCompany && hasPermission('PROJECTS_EDIT') && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-none md:w-full md:mb-2 !border-teal-200 !text-teal-700 hover:!bg-teal-50/50 flex items-center justify-center gap-1.5 shrink-0 whitespace-nowrap"
                        onClick={() => handleOpenNewSectorModal(matchedCompany.id)}
                      >
                        <Plus className="w-3.5 h-3.5 text-teal-600" /> Novo Setor
                      </Button>
                    )}
                    {companySectors.length === 0 ? (
                      <p className="text-xs text-slate-400 p-2 text-center w-full">Nenhum setor cadastrado.</p>
                    ) : (
                      companySectors.map(s => (
                        <button
                          key={s.id}
                          onClick={() => setSelectedSectorId(s.id)}
                          className={`flex-none md:w-full text-left px-3 py-2 md:py-2.5 rounded-xl text-sm transition-all whitespace-nowrap md:whitespace-normal ${
                            selectedSectorId === s.id
                              ? 'bg-teal-600 text-white font-medium shadow-md shadow-teal-600/10'
                              : 'text-slate-700 hover:bg-slate-50 border border-slate-100 md:border-0'
                          }`}
                        >
                          <span className="block truncate max-w-[120px] md:max-w-none">{s.name}</span>
                          {getMeasurements(s.id).length > 0 && (
                            <span className={`block text-[10px] mt-0.5 ${selectedSectorId === s.id ? 'text-teal-200' : 'text-teal-500'}`}>
                              {getMeasurements(s.id).length} med.
                            </span>
                          )}
                        </button>
                      ))
                    )}
                  </div>
                </div>

                {/* Painel de iluminância do setor selecionado */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                  {!selectedSector ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3">
                      <Layers className="w-10 h-10 opacity-30" />
                      <p className="text-sm">Selecione um setor à esquerda</p>
                    </div>
                  ) : getMeasurements(selectedSector.id).length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-4">
                      <div className="flex flex-col items-center gap-3 p-6 bg-amber-50 border border-amber-200 rounded-2xl max-w-sm text-center">
                        <AlertTriangle className="w-8 h-8 text-amber-500" />
                        <p className="text-sm font-semibold text-amber-800">Nenhuma medição de iluminância cadastrada</p>
                        <p className="text-xs text-amber-700">
                          O setor <strong>{selectedSector.name}</strong> ainda não possui medições de iluminância registradas.
                        </p>
                      </div>
                      <IlluminanceMeasurementPanel
                        measurements={[]}
                        onChange={measurements => setMeasurements(selectedSector.id, selectedSector.name, measurements)}
                      />
                    </div>
                  ) : (
                    <IlluminanceMeasurementPanel
                      measurements={getMeasurements(selectedSector.id)}
                      onChange={measurements => setMeasurements(selectedSector.id, selectedSector.name, measurements)}
                    />
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-2 px-6 py-4 border-t border-slate-100">
                <Button variant="outline" onClick={() => setSectorModalOpen(false)}>Cancelar</Button>
                <Button onClick={handleSave}>Salvar Iluminância</Button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Seleção de funções para impressão ───────────────────────────────── */}
      {funcSelectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[80vh]">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100">
              <Printer className="w-5 h-5 text-teal-600 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-slate-800">Selecionar funções para impressão</p>
                <p className="text-xs text-slate-400 mt-0.5">Escolha quais funções devem constar no relatório</p>
              </div>
              <button onClick={() => setFuncSelectionModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto px-6 py-4 space-y-1 flex-1">
              <label className="flex items-center gap-3 cursor-pointer px-2 py-2.5 rounded-lg hover:bg-slate-50 transition-colors">
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-teal-600 shrink-0"
                  checked={selectedFuncIds.length === project.functions.length}
                  onChange={e => setSelectedFuncIds(e.target.checked ? project.functions.map(f => f.id) : [])}
                />
                <span className="text-sm font-semibold text-slate-800">Todas as funções</span>
              </label>
              <div className="border-t border-slate-100 pt-1">
                {project.functions.map((func, idx) => (
                  <label key={func.id} className="flex items-center gap-3 cursor-pointer px-2 py-2.5 rounded-lg hover:bg-slate-50 transition-colors">
                    <input
                      type="checkbox"
                      className="w-4 h-4 accent-teal-600 shrink-0"
                      checked={selectedFuncIds.includes(func.id)}
                      onChange={e => setSelectedFuncIds(prev =>
                        e.target.checked ? [...prev, func.id] : prev.filter(id => id !== func.id)
                      )}
                    />
                    <span className="text-xs font-bold text-teal-600 w-5 text-center shrink-0">{idx + 1}</span>
                    <span className="text-sm text-slate-700">{func.name || 'Função sem nome'}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 px-6 py-4 border-t border-slate-100">
              <Button variant="outline" onClick={() => setFuncSelectionModal(false)}>Cancelar</Button>
              <Button
                disabled={selectedFuncIds.length === 0}
                onClick={() => { setFuncSelectionModal(false); doPrint(selectedFuncIds); }}
              >
                <Printer className="w-4 h-4" />Imprimir
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* â"€â"€ Validation modal â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€ */}
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
                <Button onClick={() => { setValidationModal(null); openFuncSelectionModal(); }} className="!bg-amber-500 hover:!bg-amber-600 !text-white">
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
                <FormGroup label="1.1 Ergonomia — texto conceitual">
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

      {matchedCompany && (
        <SectorModalForm
          open={isNewSectorModalOpen}
          onClose={() => setIsNewSectorModalOpen(false)}
          title="Cadastrar Novo Setor"
          form={newSectorForm}
          setForm={setNewSectorForm}
          onSave={handleSaveSector}
          isSaving={isSectorSaving}
          companyUnits={units.filter(u => u.companyId === matchedCompany.id)}
        />
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
