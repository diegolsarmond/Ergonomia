import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAET } from '../context/AETContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { FormGroup, Input, Textarea } from '../components/ui/Forms';
import { Plus, Trash2, Upload, Building2, FolderOpen, Calendar, MapPin, Hash } from 'lucide-react';
import {
  DEFAULT_AEP_INTRO_ERGONOMIA, DEFAULT_AEP_INTRO_OBJETIVO, DEFAULT_AEP_INTRO_METODOLOGIA,
  DEFAULT_AET_INTRO_ERGONOMIA, DEFAULT_AET_INTRO_OBJETIVO, DEFAULT_AET_INTRO_METODOLOGIA,
  ReportType,
} from '../types';

export const Dashboard = () => {
  const { projects, companies, units, loading, addProject, deleteProject, importProjectJSON } = useAET();
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const importRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    reportType: 'AET' as ReportType,
    companyName: '', fantasyName: '', cnpj: '', address: '', unit: '', product: '',
    riskDegree: '', location: '',
    evaluatorName: '', evaluatorFormation: '', evaluatorCrefito: '', evaluatorCompany: '',
    date: new Date().toISOString().split('T')[0],
    consultoriaLogoDataUrl: '', companyLogoDataUrl: '', responsibleLogoDataUrl: '', evaluatorSignatureDataUrl: '',
    introErgonomia: DEFAULT_AET_INTRO_ERGONOMIA,
    introObjetivo: DEFAULT_AET_INTRO_OBJETIVO,
    introMetodologia: DEFAULT_AET_INTRO_METODOLOGIA,
  });
  const f = (field: string, value: string) => setFormData(prev => ({ ...prev, [field]: value }));

  const ALL_DEFAULTS = [
    DEFAULT_AEP_INTRO_ERGONOMIA, DEFAULT_AEP_INTRO_OBJETIVO, DEFAULT_AEP_INTRO_METODOLOGIA,
    DEFAULT_AET_INTRO_ERGONOMIA, DEFAULT_AET_INTRO_OBJETIVO, DEFAULT_AET_INTRO_METODOLOGIA,
  ];

  const handleReportTypeChange = (newType: ReportType) => {
    const isDefault = (v: string) => ALL_DEFAULTS.includes(v);
    const ergDefault   = newType === 'AEP' ? DEFAULT_AEP_INTRO_ERGONOMIA   : DEFAULT_AET_INTRO_ERGONOMIA;
    const objDefault   = newType === 'AEP' ? DEFAULT_AEP_INTRO_OBJETIVO     : DEFAULT_AET_INTRO_OBJETIVO;
    const metaDefault  = newType === 'AEP' ? DEFAULT_AEP_INTRO_METODOLOGIA  : DEFAULT_AET_INTRO_METODOLOGIA;
    setFormData(prev => ({
      ...prev,
      reportType:      newType,
      introErgonomia:  isDefault(prev.introErgonomia)  ? ergDefault  : prev.introErgonomia,
      introObjetivo:   isDefault(prev.introObjetivo)   ? objDefault  : prev.introObjetivo,
      introMetodologia: isDefault(prev.introMetodologia) ? metaDefault : prev.introMetodologia,
    }));
  };

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

  return (
    <div className="p-6 lg:p-8 xl:p-10">
      {/* ── Page Header ──────────────────────────────────────────── */}
      <div className="page-header mb-8">
        <div className="flex justify-between items-center relative z-10">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Projetos Ergonômicos</h1>
            <p className="text-teal-200 text-sm mt-1">AEP · AET</p>
          </div>
          <div className="flex gap-3">

            <Button onClick={() => setIsModalOpen(true)} className="!bg-teal-600 !text-white hover:!bg-teal-700 !shadow-lg !shadow-teal-900/20">
              <Plus className="w-5 h-5" />Novo Projeto
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-6 mt-5 relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <FolderOpen className="w-4 h-4 text-teal-200" />
            </div>
            <div>
              <p className="text-xl font-bold">{projects.length}</p>
              <p className="text-[11px] text-teal-200">projetos</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <Hash className="w-4 h-4 text-teal-200" />
            </div>
            <div>
              <p className="text-xl font-bold">{projects.reduce((sum, p) => sum + p.functions.length, 0)}</p>
              <p className="text-[11px] text-teal-200">funções</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Projects Grid ────────────────────────────────────────── */}
      {projects.length === 0 ? (
        <div className="empty-state">
          <Building2 className="w-14 h-14 mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500 text-lg font-medium mb-2">Nenhum projeto encontrado</p>
          <p className="text-slate-400 text-sm mb-6">Crie seu primeiro projeto para começar</p>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="w-5 h-5" /> Criar Primeiro Projeto
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
          {projects.map((project) => (
            <Card key={project.id} className="card-interactive group" onClick={() => navigate(`/project/${project.id}`)}>
              <CardContent className="!p-5">
                {/* Company Logo / Initial */}
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm shadow-sm shadow-teal-500/20">
                    {project.companyName?.charAt(0)?.toUpperCase() || 'P'}
                  </div>
                  <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => { e.stopPropagation(); deleteProject(project.id); }}>
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </Button>
                </div>

                <h3 className="font-semibold text-slate-800 text-[15px] mb-1 truncate">{project.companyName}</h3>
                {project.fantasyName && <p className="text-xs text-teal-600 font-medium mb-3">{project.fantasyName}</p>}

                <div className="space-y-1.5 mb-4">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{project.location || 'Local não definido'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{project.date ? new Date(project.date).toLocaleDateString('pt-BR') : '-'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <span className="stat-badge">
                    {project.functions.length} funções
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      (project.reportType || 'AET') === 'AEP'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-teal-100 text-teal-700'
                    }`}>
                      {project.reportType || 'AET'}
                    </span>
                    <span className="text-[11px] text-slate-400">CNPJ: {project.cnpj || '-'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ── Modal ─────────────────────────────────────────────────── */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <Card className="modal-content w-full max-w-2xl max-h-[90vh] overflow-y-auto !rounded-2xl" onClick={e => e.stopPropagation()}>
            <CardHeader className="!bg-gradient-to-r !from-slate-50 !to-slate-100/50">
              <CardTitle className="!text-lg">Novo Projeto</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="space-y-4">
                <FormGroup label="Tipo de Relatório" required>
                  <select
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 bg-white transition-all duration-200 hover:border-slate-300"
                    value={formData.reportType}
                    onChange={e => handleReportTypeChange(e.target.value as ReportType)}
                    required
                  >
                    <option value="AET">AET – Análise Ergonômica do Trabalho</option>
                    <option value="AEP">AEP – Análise Ergonômica Preliminar</option>
                  </select>
                </FormGroup>

                {/* Cliente pré-preenchido */}
                <FormGroup label="Selecionar Cliente Cadastrado">
                  <select
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 bg-white transition-all duration-200 hover:border-slate-300"
                    onChange={(e) => {
                      const client = companies.find(c => c.id === e.target.value);
                      setSelectedCompanyId(e.target.value || '');
                      if (client) setFormData(prev => ({ 
                        ...prev, 
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

                <div className="section-title !mt-4">Empresa</div>
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
                                  unit: u.name,
                                  address: u.address || `${u.logradouro}${u.numero ? ', ' + u.numero : ''}${u.bairro ? ' - ' + u.bairro : ''}`,
                                  location: (u.city || u.uf) ? `${u.city || ''}${u.uf ? ' - ' + u.uf : ''}` : prev.location,
                                }));
                              } else {
                                f('unit', '');
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

                <div className="section-title">Responsável Técnico</div>
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
                    <Input value={formData.evaluatorCompany} onChange={e => f('evaluatorCompany', e.target.value)} />
                  </FormGroup>
                </div>
                <FormGroup label="Data da Análise">
                  <Input type="date" value={formData.date} onChange={e => f('date', e.target.value)} />
                </FormGroup>

                <div className="section-title">Textos de Introdução (editáveis)</div>
                <FormGroup label="1.1 Ergonomia – texto conceitual">
                  <Textarea value={formData.introErgonomia} onChange={e => f('introErgonomia', e.target.value)} rows={3} />
                </FormGroup>
                <FormGroup label="1.3 Objetivo">
                  <Textarea value={formData.introObjetivo} onChange={e => f('introObjetivo', e.target.value)} rows={3} />
                </FormGroup>
                <FormGroup label="1.4 Metodologia">
                  <Textarea value={formData.introMetodologia} onChange={e => f('introMetodologia', e.target.value)} rows={3} />
                </FormGroup>

                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                  <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                  <Button type="submit">Criar Projeto</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
