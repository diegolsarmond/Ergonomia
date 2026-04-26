import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAET } from '../context/AETContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { FormGroup, Input } from '../components/ui/Forms';
import { Plus, Trash2, Edit2, Upload, Download, Building2 } from 'lucide-react';
import { MOCK_CLIENTS } from '../data/mockClients';

export const Dashboard = () => {
  const { projects, loading, addProject, deleteProject, importProjectJSON } = useAET();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const importRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    companyName: '', fantasyName: '', cnpj: '', address: '', unit: '', product: '',
    riskDegree: '', location: '', evaluatorName: '', evaluatorCrefito: '', date: new Date().toISOString().split('T')[0],
    companyLogoDataUrl: '', responsibleLogoDataUrl: '', evaluatorSignatureDataUrl: '',
  });

  if (loading) return <div className="p-8 text-center text-gray-500">Carregando...</div>;

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
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projetos AET</h1>
          <p className="text-gray-500 text-sm mt-1">Análise Ergonômica do Trabalho</p>
        </div>
        <div className="flex gap-3">
          <input ref={importRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
          <Button variant="outline" onClick={() => importRef.current?.click()}>
            <Upload className="w-4 h-4 mr-2" />Importar JSON
          </Button>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="w-5 h-5 mr-2" />Novo Projeto
          </Button>
        </div>
      </div>

      {projects.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Building2 className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 mb-4">Nenhum projeto encontrado.</p>
            <Button onClick={() => setIsModalOpen(true)}>+ Criar Primeiro Projeto</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card key={project.id} className="hover:shadow-lg transition-all hover:-translate-y-0.5 cursor-pointer" onClick={() => navigate(`/project/${project.id}`)}>
              <CardHeader>
                <CardTitle className="truncate">{project.companyName}</CardTitle>
              </CardHeader>
              <CardContent>
                {project.fantasyName && <p className="text-xs text-teal-600 font-medium mb-2">{project.fantasyName}</p>}
                <p className="text-sm text-gray-600 mb-1">📍 {project.location || 'Local não definido'}</p>
                <p className="text-sm text-gray-600 mb-1">📋 CNPJ: {project.cnpj || '-'}</p>
                <p className="text-sm text-gray-600 mb-4">📅 {project.date ? new Date(project.date).toLocaleDateString('pt-BR') : '-'}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs bg-teal-50 text-teal-700 px-2 py-1 rounded-full font-medium">
                    {project.functions.length} funções
                  </span>
                  <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); deleteProject(project.id); }}>
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setIsModalOpen(false)}>
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <CardHeader><CardTitle>Novo Projeto AET</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="space-y-4">
                <FormGroup label="Selecionar Cliente Cadastrado">
                  <select 
                    className="w-full rounded-md border border-gray-300 p-2 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                    onChange={(e) => {
                      const client = MOCK_CLIENTS.find(c => c.id === e.target.value);
                      if (client) {
                        setFormData(prev => ({
                          ...prev,
                          companyName: client.companyName,
                          fantasyName: client.fantasyName,
                          cnpj: client.cnpj,
                          address: client.address
                        }));
                      }
                    }}
                    defaultValue=""
                  >
                    <option value="" disabled>-- Selecione um cliente --</option>
                    {MOCK_CLIENTS.map(client => (
                      <option key={client.id} value={client.id}>{client.companyName}</option>
                    ))}
                  </select>
                </FormGroup>
                <div className="grid grid-cols-2 gap-4">
                  <FormGroup label="Razão Social" required>
                    <Input value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} required />
                  </FormGroup>
                  <FormGroup label="Nome Fantasia">
                    <Input value={formData.fantasyName} onChange={e => setFormData({...formData, fantasyName: e.target.value})} />
                  </FormGroup>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormGroup label="CNPJ" required>
                    <Input value={formData.cnpj} onChange={e => setFormData({...formData, cnpj: e.target.value})} required placeholder="00.000.000/0000-00" />
                  </FormGroup>
                  <FormGroup label="Grau de Risco">
                    <Input value={formData.riskDegree} onChange={e => setFormData({...formData, riskDegree: e.target.value})} placeholder="1 a 4" />
                  </FormGroup>
                </div>
                <FormGroup label="Endereço Completo" required>
                  <Input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} required />
                </FormGroup>
                <div className="grid grid-cols-2 gap-4">
                  <FormGroup label="Unidade / Local de Produção" required>
                    <Input value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} required />
                  </FormGroup>
                  <FormGroup label="Produto / Atividade Principal" required>
                    <Input value={formData.product} onChange={e => setFormData({...formData, product: e.target.value})} required />
                  </FormGroup>
                </div>
                <FormGroup label="Local">
                  <Input value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="Cidade - UF" />
                </FormGroup>
                <div className="grid grid-cols-2 gap-4">
                  <FormGroup label="Responsável Técnico" required>
                    <Input value={formData.evaluatorName} onChange={e => setFormData({...formData, evaluatorName: e.target.value})} required />
                  </FormGroup>
                  <FormGroup label="Registro Profissional" required>
                    <Input value={formData.evaluatorCrefito} onChange={e => setFormData({...formData, evaluatorCrefito: e.target.value})} required />
                  </FormGroup>
                </div>
                <FormGroup label="Data da Análise">
                  <Input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                </FormGroup>
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
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
