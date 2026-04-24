import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAET } from '../context/AETContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { FormGroup, Input } from '../components/ui/Forms';
import { Plus, Trash2, Edit2 } from 'lucide-react';

export const Dashboard = () => {
  const { projects, loading, addProject, deleteProject } = useAET();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    cnpj: '',
    address: '',
    product: '',
    riskDegree: '',
    location: '',
    evaluatorName: '',
    evaluatorCrefito: '',
    date: new Date().toISOString().split('T')[0],
  });

  if (loading) return <div className="p-8 text-center text-gray-500">Caregando...</div>;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = await addProject(formData);
    setIsModalOpen(false);
    navigate(`/project/${id}`);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Projetos AET</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-5 h-5 mr-2" />
          Novo Projeto
        </Button>
      </div>

      {projects.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <p className="text-gray-500 mb-4 pb-6">Nenhum projeto encontrado. Crie um novo para começar.</p>
            <Button onClick={() => setIsModalOpen(true)}>+ Criar Primeiro Projeto</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card key={project.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="truncate">{project.companyName}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-2">Local: {project.location}</p>
                <p className="text-sm text-gray-600 mb-4">Data: {new Date(project.date).toLocaleDateString('pt-BR')}</p>
                <p className="text-sm text-gray-500 mb-6">
                  {project.functions.length} funções analisadas
                </p>
                
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={() => deleteProject(project.id)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => navigate(`/project/${project.id}`)}>
                    <Edit2 className="w-4 h-4 mr-2" />
                    Abrir
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-xl">
            <CardHeader>
              <CardTitle>Novo Projeto AET</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="space-y-4">
                <FormGroup label="Razão Social" required>
                  <Input 
                    value={formData.companyName} 
                    onChange={e => setFormData({...formData, companyName: e.target.value})} 
                    required 
                  />
                </FormGroup>
                <div className="grid grid-cols-2 gap-4">
                  <FormGroup label="CNPJ">
                    <Input 
                      value={formData.cnpj} 
                      onChange={e => setFormData({...formData, cnpj: e.target.value})} 
                    />
                  </FormGroup>
                  <FormGroup label="Grau de Risco">
                    <Input 
                      value={formData.riskDegree} 
                      onChange={e => setFormData({...formData, riskDegree: e.target.value})} 
                    />
                  </FormGroup>
                </div>
                <FormGroup label="Endereço">
                  <Input 
                    value={formData.address} 
                    onChange={e => setFormData({...formData, address: e.target.value})} 
                  />
                </FormGroup>
                <div className="grid grid-cols-2 gap-4">
                  <FormGroup label="Produto">
                    <Input 
                      value={formData.product} 
                      onChange={e => setFormData({...formData, product: e.target.value})} 
                    />
                  </FormGroup>
                  <FormGroup label="Local de Produção">
                    <Input 
                      value={formData.location} 
                      onChange={e => setFormData({...formData, location: e.target.value})} 
                    />
                  </FormGroup>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormGroup label="Avaliador (Nome)">
                    <Input 
                      value={formData.evaluatorName} 
                      onChange={e => setFormData({...formData, evaluatorName: e.target.value})} 
                    />
                  </FormGroup>
                  <FormGroup label="CREFITO / Registro">
                    <Input 
                      value={formData.evaluatorCrefito} 
                      onChange={e => setFormData({...formData, evaluatorCrefito: e.target.value})} 
                    />
                  </FormGroup>
                </div>
                
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
