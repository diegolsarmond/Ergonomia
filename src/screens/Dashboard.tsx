import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAET } from '../context/AETContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { FormGroup, Input, Textarea } from '../components/ui/Forms';
import { Plus, Trash2, Upload, Building2, FolderOpen, Calendar, MapPin, Hash } from 'lucide-react';
import { MOCK_CLIENTS } from '../data/mockClients';
import { DEFAULT_INTRO_ERGONOMIA, DEFAULT_INTRO_OBJETIVO, DEFAULT_INTRO_METODOLOGIA } from '../types';

export const Dashboard = () => {
  const { projects, loading, addProject, deleteProject, importProjectJSON } = useAET();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const importRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    companyName: '', fantasyName: '', cnpj: '', address: '', unit: '', product: '',
    riskDegree: '', location: '',
    evaluatorName: '', evaluatorFormation: '', evaluatorCrefito: '', evaluatorCompany: '',
    date: new Date().toISOString().split('T')[0],
    consultoriaLogoDataUrl: '', companyLogoDataUrl: '', responsibleLogoDataUrl: '', evaluatorSignatureDataUrl: '',
    introErgonomia: DEFAULT_INTRO_ERGONOMIA,
    introObjetivo: DEFAULT_INTRO_OBJETIVO,
    introMetodologia: DEFAULT_INTRO_METODOLOGIA,
  });
  const f = (field: string, value: string) => setFormData(prev => ({ ...prev, [field]: value }));

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
            <h1 className="text-2xl font-bold tracking-tight">Projetos AET</h1>
            <p className="text-teal-200 text-sm mt-1">Análise Ergonômica do Trabalho</p>
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
                  <span className="text-[11px] text-slate-400">CNPJ: {project.cnpj || '-'}</span>
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
              <CardTitle className="!text-lg">Novo Projeto AET</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="space-y-4">
                {/* Cliente pré-preenchido */}
                <FormGroup label="Selecionar Cliente Cadastrado">
                  <select
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 bg-white transition-all duration-200 hover:border-slate-300"
                    onChange={(e) => {
                      const client = MOCK_CLIENTS.find(c => c.id === e.target.value);
                      if (client) setFormData(prev => ({ ...prev, companyName: client.companyName, fantasyName: client.fantasyName, cnpj: client.cnpj, address: client.address }));
                    }}
                    defaultValue=""
                  >
                    <option value="" disabled>-- Selecione um cliente --</option>
                    {MOCK_CLIENTS.map(client => (
                      <option key={client.id} value={client.id}>{client.companyName}</option>
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
                  <FormGroup label="Unidade / Local de Produção" required>
                    <Input value={formData.unit} onChange={e => f('unit', e.target.value)} required />
                  </FormGroup>
                  <FormGroup label="Produto / Atividade" required>
                    <Input value={formData.product} onChange={e => f('product', e.target.value)} required />
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
