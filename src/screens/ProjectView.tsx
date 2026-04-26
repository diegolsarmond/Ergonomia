import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAET } from '../context/AETContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Plus, Eye, ArrowLeft, Trash2, Edit2, Copy, Download } from 'lucide-react';

export const ProjectView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getProject, addFunction, deleteFunction, duplicateFunction, exportProjectJSON } = useAET();
  const project = getProject(id!);

  if (!project) return <div className="p-8 text-center">Projeto não encontrado</div>;

  const handleAddFunction = async () => {
    const newFuncId = await addFunction(project.id, { name: 'Nova Função' });
    navigate(`/project/${project.id}/function/${newFuncId}`);
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
    <div className="p-8 max-w-6xl mx-auto">
      <Button variant="ghost" className="mb-6" onClick={() => navigate('/')}>
        <ArrowLeft className="w-4 h-4 mr-2" />Voltar aos Projetos
      </Button>

      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">{project.companyName}</h1>
          {project.fantasyName && <p className="text-teal-600 font-medium text-sm mb-1">{project.fantasyName}</p>}
          <p className="text-gray-500 text-sm">AET — {project.unit || project.location} — {project.date ? new Date(project.date).toLocaleDateString('pt-BR') : ''}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleExportJSON}>
            <Download className="w-4 h-4 mr-2" />Exportar JSON
          </Button>
          <Button variant="secondary" onClick={() => navigate(`/project/${project.id}/preview`)}>
            <Eye className="w-4 h-4 mr-2" />Visualizar PDF
          </Button>
          <Button onClick={handleAddFunction}>
            <Plus className="w-4 h-4 mr-2" />Adicionar Função
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader><CardTitle>Dados da Empresa</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><strong>CNPJ:</strong> {project.cnpj}</p>
            <p><strong>Endereço:</strong> {project.address}</p>
            <p><strong>Unidade:</strong> {project.unit}</p>
            <p><strong>Produto:</strong> {project.product}</p>
            <p><strong>Grau de Risco:</strong> {project.riskDegree}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Responsável Técnico</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><strong>Nome:</strong> {project.evaluatorName}</p>
            <p><strong>Registro:</strong> {project.evaluatorCrefito}</p>
            <p><strong>Data:</strong> {project.date ? new Date(project.date).toLocaleDateString('pt-BR') : '-'}</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Funções Analisadas ({project.functions.length})</h2>
        {project.functions.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
            <p className="text-gray-500 mb-4">Nenhuma função cadastrada.</p>
            <Button onClick={handleAddFunction} variant="outline">Cadastrar Função</Button>
          </div>
        ) : (
          <div className="space-y-3">
            {project.functions.map((func) => (
              <Card key={func.id} className="hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center px-6 py-4">
                  <div className="cursor-pointer flex-1" onClick={() => navigate(`/project/${project.id}/function/${func.id}`)}>
                    <h3 className="font-semibold text-lg text-teal-700">{func.name || 'Sem nome'}</h3>
                    <p className="text-sm text-gray-500">
                      {func.sector && `Setor: ${func.sector} • `}
                      {func.numEmployees} colaboradores
                      {func.improvements?.length > 0 && ` • ${func.improvements.length} riscos`}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleDuplicate(func.id)} title="Duplicar">
                      <Copy className="w-4 h-4 text-blue-500" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => navigate(`/project/${project.id}/function/${func.id}`)}>
                      <Edit2 className="w-4 h-4 text-gray-500" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => deleteFunction(project.id, func.id)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
