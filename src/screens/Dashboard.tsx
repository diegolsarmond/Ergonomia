import React, { useState, useRef } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { useNavigate } from 'react-router-dom';
import { useAET } from '../context/AETContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { FormGroup, Input, Textarea } from '../components/ui/Forms';
import { Plus, Trash2, Building2, FolderOpen, Calendar, MapPin, Hash, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PermissionGuard } from '../components/auth/PermissionGuard';
import {
  DEFAULT_AEP_INTRO_ERGONOMIA, DEFAULT_AEP_INTRO_OBJETIVO, DEFAULT_AEP_INTRO_METODOLOGIA,
  DEFAULT_AET_INTRO_ERGONOMIA, DEFAULT_AET_INTRO_OBJETIVO, DEFAULT_AET_INTRO_METODOLOGIA,
  ReportType,
} from '../types';

interface Props {
  reportType: ReportType;
}

export const Dashboard: React.FC<Props> = ({ reportType }) => {
  const { projects, companies, units, loading, addProject, deleteProject, importProjectJSON } = useAET();
  const { hasPermission, currentUser } = useAuth();
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'Empresa' | 'Responsável' | 'Textos de Introdução'>('Empresa');
  const [currentPage, setCurrentPage] = useState(1);
  const importRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [reportType, searchQuery]);

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

  const introDefaults = (type: ReportType) => ({
    introErgonomia:   type === 'AEP' ? DEFAULT_AEP_INTRO_ERGONOMIA   : DEFAULT_AET_INTRO_ERGONOMIA,
    introObjetivo:    type === 'AEP' ? DEFAULT_AEP_INTRO_OBJETIVO     : DEFAULT_AET_INTRO_OBJETIVO,
    introMetodologia: type === 'AEP' ? DEFAULT_AEP_INTRO_METODOLOGIA  : DEFAULT_AET_INTRO_METODOLOGIA,
  });

  const [formData, setFormData] = useState(() => ({
    reportType,
    empresaId: '', unidadeId: '',
    companyName: '', fantasyName: '', cnpj: '', address: '', unit: '', product: '',
    riskDegree: '', location: '',
    evaluatorName: currentUser?.name ?? '', evaluatorFormation: currentUser?.formation ?? '', evaluatorCrefito: currentUser?.crefito ?? '', evaluatorCompany: 'Ergominas',
    date: new Date().toISOString().split('T')[0],
    consultoriaLogoDataUrl: '', companyLogoDataUrl: '', responsibleLogoDataUrl: '', evaluatorSignatureDataUrl: '',
    ...introDefaults(reportType),
  }));

  const f = (field: string, value: string) => setFormData(prev => ({ ...prev, [field]: value }));

  const ALL_DEFAULTS = [
    DEFAULT_AEP_INTRO_ERGONOMIA, DEFAULT_AEP_INTRO_OBJETIVO, DEFAULT_AEP_INTRO_METODOLOGIA,
    DEFAULT_AET_INTRO_ERGONOMIA, DEFAULT_AET_INTRO_OBJETIVO, DEFAULT_AET_INTRO_METODOLOGIA,
  ];



  const openNewProjectModal = () => {
    setFormData(prev => ({
      ...prev,
      reportType,
      ...introDefaults(reportType),
      evaluatorName: currentUser?.name ?? '',
      evaluatorFormation: currentUser?.formation ?? '',
      evaluatorCrefito: currentUser?.crefito ?? '',
      evaluatorCompany: 'Ergominas',
    }));
    setSelectedCompanyId('');
    setActiveTab('Empresa');
    setIsModalOpen(true);
  };

  const typeProjects = projects.filter(p => (p.reportType || 'AET') === reportType);
  const filteredProjects = searchQuery.trim()
    ? typeProjects.filter(p =>
        p.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.fantasyName?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : typeProjects;

  const isAEP = reportType === 'AEP';
  const title    = isAEP ? 'Projetos AEP' : 'Projetos AET';
  const subtitle = isAEP ? 'Análise Ergonômica Preliminar' : 'Análise Ergonômica do Trabalho';
  const btnClass = isAEP
    ? '!bg-amber-500 !text-white hover:!bg-amber-600 !shadow-lg !shadow-amber-900/20'
    : '!bg-teal-600 !text-white hover:!bg-teal-700 !shadow-lg !shadow-teal-900/20';
  const emptyLabel = isAEP ? 'Nenhum projeto AEP encontrado' : 'Nenhum projeto AET encontrado';

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-3 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
        <p className="text-slate-400 text-sm font-medium">Carregando projetos...</p>
      </div>
    </div>
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = await addProject(formData as any);
    setIsModalOpen(false);
    navigate(`/project/${id}`);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const id = await importProjectJSON(ev.target?.result as string);
      if (id) navigate(`/project/${id}`);
      else alert('Erro ao importar. Verifique o formato do arquivo.');
    };
    reader.readAsText(file);
    if (importRef.current) importRef.current.value = '';
  };

  const itemsPerPage = 20;
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const renderProjectRow = (project: typeof projects[number]) => (
    <tr 
      key={project.id} 
      onClick={() => navigate(`/project/${project.id}`)}
      className="group border-b border-slate-100 hover:bg-slate-50/70 transition-colors cursor-pointer"
    >
      <td className="py-4 pl-4 pr-3 text-sm font-medium text-slate-900 max-w-[200px] truncate">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm shadow-teal-500/10">
            {project.companyName?.charAt(0)?.toUpperCase() || 'P'}
          </div>
          <div>
            <div className="font-semibold text-slate-800 text-[14px] truncate">{project.companyName}</div>
            {project.fantasyName && <div className="text-[11px] text-teal-600 font-medium truncate">{project.fantasyName}</div>}
          </div>
        </div>
      </td>
      <td className="py-4 px-3 text-sm text-slate-500 hidden sm:table-cell">
        <span className="text-slate-600">{project.cnpj || '-'}</span>
      </td>
      <td className="py-4 px-3 text-sm text-slate-500 hidden md:table-cell">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-slate-400 animate-pulse" />
          <span className="truncate">{project.location || 'Local não definido'}</span>
        </div>
      </td>
      <td className="py-4 px-3 text-sm text-slate-500 hidden lg:table-cell">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>{project.date ? new Date(project.date).toLocaleDateString('pt-BR') : '-'}</span>
        </div>
      </td>
      <td className="py-4 px-3 text-sm text-slate-500">
        <span className="stat-badge">{project.functions.length} funções</span>
      </td>
      <td className="py-4 pl-3 pr-4 text-right text-sm font-medium">
        <div className="flex items-center justify-end gap-2">
          <PermissionGuard permission="PROJECTS_DELETE">
            <Button 
              variant="ghost" 
              size="sm" 
              className="opacity-0 group-hover:opacity-100 transition-opacity !p-1.5 hover:!bg-red-50" 
              onClick={(e) => { 
                e.stopPropagation(); 
                if (confirm('Deseja realmente excluir este projeto?')) {
                  deleteProject(project.id); 
                }
              }}
            >
              <Trash2 className="w-4 h-4 text-red-400 hover:text-red-600" />
            </Button>
          </PermissionGuard>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="p-6 lg:p-8 xl:p-10">
      {/* ── Page Header ──────────────────────────────────────────── */}
      <div className="page-header mb-8">
        <div className="flex justify-between items-center relative z-10">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            <p className="text-teal-200 text-sm mt-1">{subtitle}</p>
          </div>
          <PermissionGuard permission={isAEP ? 'AEP_CREATE' : 'AET_CREATE'}>
            <Button onClick={openNewProjectModal} className={btnClass}>
              <Plus className="w-5 h-5" /> Novo Projeto {reportType}
            </Button>
          </PermissionGuard>
        </div>

        {/* Stats */}
        <div className="flex gap-6 mt-5 relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <FolderOpen className="w-4 h-4 text-teal-200" />
            </div>
            <div>
              <p className="text-xl font-bold">{typeProjects.length}</p>
              <p className="text-[11px] text-teal-200">projetos</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <Hash className="w-4 h-4 text-teal-200" />
            </div>
            <div>
              <p className="text-xl font-bold">{typeProjects.reduce((sum, p) => sum + p.functions.length, 0)}</p>
              <p className="text-[11px] text-teal-200">funções</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Busca ────────────────────────────────────────────────── */}
      {typeProjects.length > 0 && (
        <div className="relative mb-6 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por empresa..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
          />
        </div>
      )}

      {/* ── Projects List ────────────────────────────────────────── */}
      {typeProjects.length === 0 ? (
        <div className="empty-state">
          <Building2 className="w-14 h-14 mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500 text-lg font-medium mb-2">{emptyLabel}</p>
          <p className="text-slate-400 text-sm mb-6">Crie seu primeiro projeto para começar</p>
          <PermissionGuard permission={isAEP ? 'AEP_CREATE' : 'AET_CREATE'}>
            <Button onClick={openNewProjectModal} className={btnClass}>
              <Plus className="w-5 h-5" /> Criar Primeiro Projeto {reportType}
            </Button>
          </PermissionGuard>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="empty-state">
          <Search className="w-10 h-10 mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500 text-sm font-medium">Nenhuma empresa encontrada para "{searchQuery}"</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/75 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3.5 pl-4 pr-3">Empresa</th>
                    <th className="py-3.5 px-3 hidden sm:table-cell">CNPJ</th>
                    <th className="py-3.5 px-3 hidden md:table-cell">Localização</th>
                    <th className="py-3.5 px-3 hidden lg:table-cell">Data da Análise</th>
                    <th className="py-3.5 px-3">Funções</th>
                    <th className="py-3.5 pl-3 pr-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {paginatedProjects.map(renderProjectRow)}
                </tbody>
              </table>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-200 bg-white px-4 py-3 sm:px-6 mt-4 rounded-xl shadow-sm border">
              <div className="flex flex-1 justify-between sm:hidden">
                <Button
                  variant="outline"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                >
                  Próximo
                </Button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-slate-700">
                    Exibindo <span className="font-semibold">{Math.min((currentPage - 1) * itemsPerPage + 1, filteredProjects.length)}</span> a{' '}
                    <span className="font-semibold">{Math.min(currentPage * itemsPerPage, filteredProjects.length)}</span> de{' '}
                    <span className="font-semibold">{filteredProjects.length}</span> resultados
                  </p>
                </div>
                <div>
                  <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center rounded-l-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed bg-white"
                    >
                      <span className="sr-only">Anterior</span>
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                      </svg>
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        aria-current={currentPage === page ? 'page' : undefined}
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20 ${
                          currentPage === page
                            ? 'z-10 bg-teal-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600'
                            : 'text-slate-900 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:outline-offset-0 bg-white'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center rounded-r-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed bg-white"
                    >
                      <span className="sr-only">Próximo</span>
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <Card className="modal-content w-full max-w-2xl max-h-[90vh] overflow-y-auto !rounded-2xl" onClick={e => e.stopPropagation()}>
            <CardHeader className="!bg-gradient-to-r !from-slate-50 !to-slate-100/50 pb-0">
              <CardTitle className="!text-lg px-2">Novo Projeto</CardTitle>
              <div className="flex gap-4 px-2 mt-4 border-b border-slate-200">
                {['Empresa', 'Responsável', 'Textos de Introdução'].map(tab => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab as any)}
                    className={`pb-3 text-sm font-medium transition-colors relative ${
                      activeTab === tab
                        ? 'text-teal-600'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {tab}
                    {activeTab === tab && (
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-teal-500 rounded-t-full" />
                    )}
                  </button>
                ))}
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleCreate} className="space-y-4">
                {activeTab === 'Empresa' && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <FormGroup label="Tipo de Relatório">
                      <Input 
                        value={formData.reportType === 'AEP' ? 'AEP – Análise Ergonômica Preliminar' : 'AET – Análise Ergonômica do Trabalho'} 
                        disabled 
                        className="bg-slate-50 text-slate-500 font-medium cursor-not-allowed"
                      />
                    </FormGroup>

                    <FormGroup label="Selecionar Cliente Cadastrado">
                      <select
                        className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 bg-white transition-all duration-200 hover:border-slate-300"
                        onChange={(e) => {
                          const client = companies.find(c => c.id === e.target.value);
                          setSelectedCompanyId(e.target.value || '');
                          if (client) setFormData(prev => ({
                            ...prev,
                            empresaId: client.id,
                            unidadeId: '',
                            companyName: client.razaoSocial,
                            fantasyName: client.nomeFantasia,
                            cnpj: client.cnpj,
                            address: `${client.logradouro}${client.numero ? ', ' + client.numero : ''}${client.bairro ? ' - ' + client.bairro : ''}`,
                            location: `${client.municipio}${client.uf ? ' - ' + client.uf : ''}`,
                            riskDegree: client.riskDegree || '',
                            product: client.product || '',
                            companyLogoDataUrl: client.logoDataUrl || '',
                            unit: '',
                          }));
                        }}
                        defaultValue=""
                      >
                        <option value="" disabled>-- Selecione um cliente --</option>
                        {companies.map(client => (
                          <option key={client.id} value={client.id}>{client.razaoSocial || 'Empresa sem Razão Social'}</option>
                        ))}
                      </select>
                    </FormGroup>

                    <div className="section-title !mt-4">Dados da Empresa</div>
                    <div className="grid grid-cols-2 gap-4">
                      <FormGroup label="Razão Social" required>
                        <Input value={formData.companyName} onChange={e => f('companyName', e.target.value)} required />
                      </FormGroup>
                      <FormGroup label="Nome Fantasia">
                        <Input value={formData.fantasyName} onChange={e => f('fantasyName', e.target.value)} />
                      </FormGroup>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FormGroup label="CNPJ" required>
                        <Input value={formData.cnpj} onChange={e => f('cnpj', e.target.value)} required placeholder="00.000.000/0000-00" />
                      </FormGroup>
                      <FormGroup label="Grau de Risco">
                        <Input value={formData.riskDegree} onChange={e => f('riskDegree', e.target.value)} placeholder="1, 2, 3 ou 4" />
                      </FormGroup>
                    </div>
                    <FormGroup label="Endereço Completo" required>
                      <Input value={formData.address} onChange={e => f('address', e.target.value)} required />
                    </FormGroup>
                    <div className="grid grid-cols-2 gap-4">
                      <FormGroup label="Unidade / Local de Produção">
                        {(() => {
                          const companyUnits = selectedCompanyId
                            ? units.filter(u => u.companyId === selectedCompanyId)
                            : [];
                          if (companyUnits.length > 0) {
                            return (
                              <select
                                className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 bg-white transition-all duration-200 hover:border-slate-300"
                                value={units.find(u => u.name === formData.unit && u.companyId === selectedCompanyId)?.id ?? ''}
                                onChange={e => {
                                  const u = companyUnits.find(u => u.id === e.target.value);
                                  if (u) {
                                    setFormData(prev => ({
                                      ...prev,
                                      unidadeId: u.id,
                                      unit: u.name,
                                      address: u.address || `${u.logradouro}${u.numero ? ', ' + u.numero : ''}${u.bairro ? ' - ' + u.bairro : ''}`,
                                      location: (u.city || u.uf) ? `${u.city || ''}${u.uf ? ' - ' + u.uf : ''}` : prev.location,
                                    }));
                                  } else {
                                    setFormData(prev => ({ ...prev, unidadeId: '', unit: '' }));
                                  }
                                }}
                              >
                                <option value="">-- Selecione uma unidade --</option>
                                {companyUnits.map(u => (
                                  <option key={u.id} value={u.id}>{u.name}</option>
                                ))}
                                <option value="other">-- Outra unidade (digitar) --</option>
                              </select>
                            );
                          }
                          return <Input value={formData.unit} onChange={e => f('unit', e.target.value)} placeholder={selectedCompanyId ? 'Nenhuma unidade cadastrada' : 'Selecione uma empresa primeiro'} />;
                        })()}
                      </FormGroup>
                      <FormGroup label="Produto / Atividade">
                        <Input value={formData.product} onChange={e => f('product', e.target.value)} />
                      </FormGroup>
                    </div>
                    <FormGroup label="Local (Cidade – UF)">
                      <Input value={formData.location} onChange={e => f('location', e.target.value)} placeholder="Ex: São Paulo – SP" />
                    </FormGroup>
                  </div>
                )}

                {activeTab === 'Responsável' && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="grid grid-cols-2 gap-4">
                      <FormGroup label="Nome" required>
                        <Input value={formData.evaluatorName} onChange={e => f('evaluatorName', e.target.value)} required />
                      </FormGroup>
                      <FormGroup label="Registro Profissional (CREFITO/CRP/etc.)" required>
                        <Input value={formData.evaluatorCrefito} onChange={e => f('evaluatorCrefito', e.target.value)} required />
                      </FormGroup>
                      <FormGroup label="Formação">
                        <Input value={formData.evaluatorFormation} onChange={e => f('evaluatorFormation', e.target.value)} placeholder="Ex: Fisioterapeuta" />
                      </FormGroup>
                      <FormGroup label="Empresa / Consultoria">
                        <Input value={formData.evaluatorCompany} readOnly className="bg-slate-50 text-slate-500 cursor-not-allowed" />
                      </FormGroup>
                    </div>
                    <FormGroup label="Data da Análise">
                      <Input type="date" value={formData.date} onChange={e => f('date', e.target.value)} />
                    </FormGroup>
                  </div>
                )}

                {activeTab === 'Textos de Introdução' && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <FormGroup label="1.1 Ergonomia – texto conceitual">
                      <div className="bg-white rounded-xl overflow-hidden border border-slate-200">
                        <ReactQuill 
                          theme="snow"
                          modules={quillModules}
                          value={formData.introErgonomia} 
                          onChange={val => f('introErgonomia', val)} 
                          className="min-h-[150px]"
                        />
                      </div>
                    </FormGroup>
                    <FormGroup label="1.3 Objetivo">
                      <div className="bg-white rounded-xl overflow-hidden border border-slate-200">
                        <ReactQuill 
                          theme="snow"
                          modules={quillModules}
                          value={formData.introObjetivo} 
                          onChange={val => f('introObjetivo', val)} 
                          className="min-h-[150px]"
                        />
                      </div>
                    </FormGroup>
                    <FormGroup label="1.4 Metodologia">
                      <div className="bg-white rounded-xl overflow-hidden border border-slate-200">
                        <ReactQuill 
                          theme="snow"
                          modules={quillModules}
                          value={formData.introMetodologia} 
                          onChange={val => f('introMetodologia', val)} 
                          className="min-h-[150px]"
                        />
                      </div>
                    </FormGroup>
                  </div>
                )}

                <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-100">
                  <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                  
                  <div className="flex gap-3">
                    {activeTab === 'Empresa' && (
                      <Button type="button" onClick={() => setActiveTab('Responsável')}>Próximo</Button>
                    )}
                    {activeTab === 'Responsável' && (
                      <>
                        <Button variant="outline" type="button" onClick={() => setActiveTab('Empresa')}>Voltar</Button>
                        <Button type="button" onClick={() => setActiveTab('Textos de Introdução')}>Próximo</Button>
                      </>
                    )}
                    {activeTab === 'Textos de Introdução' && (
                      <>
                        <Button variant="outline" type="button" onClick={() => setActiveTab('Responsável')}>Voltar</Button>
                        <Button type="submit">Criar Projeto</Button>
                      </>
                    )}
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
