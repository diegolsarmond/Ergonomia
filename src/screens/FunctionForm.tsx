import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAET } from '../context/AETContext';
import { Card, CardContent } from '../components/ui/Card';
import { FormGroup, Input, Textarea, Select } from '../components/ui/Forms';
import { Button } from '../components/ui/Button';
import { ArrowLeft, Save } from 'lucide-react';
import { AETFunction } from '../types';

const TABS = [
  'Identificação',
  'Turnos & Ambiente',
  'Colaborador & Opinião',
  'Exigências',
  'Processo & Logística',
  'Equip. & Modo Operatório',
  'Diagnóstico',
  'Melhorias / Inventário'
];

export const FunctionForm = () => {
  const { id, funcId } = useParams<{ id: string; funcId: string }>();
  const { getProject, updateFunction } = useAET();
  const navigate = useNavigate();
  
  const project = getProject(id!);
  const [activeTab, setActiveTab] = useState(0);
  
  const initialData = project?.functions.find(f => f.id === funcId) || {} as AETFunction;
  const [formData, setFormData] = useState<AETFunction>(initialData);

  if (!project || !initialData.id) return <div className="p-8">Função não encontrada.</div>;

  const handleChange = (field: keyof AETFunction, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    await updateFunction(id!, funcId!, formData);
    navigate(`/project/${id}`);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto pb-24">
      <div className="flex justify-between items-center mb-6">
        <Button variant="ghost" onClick={() => navigate(`/project/${id}`)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <Button onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" />
          Salvar Alterações
        </Button>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Editando: {formData.name || 'Nova Função'}
      </h1>

      <div className="flex gap-2 overflow-x-auto mb-6 pb-2">
        {TABS.map((tab, idx) => (
          <button
            key={idx}
            onClick={() => setActiveTab(idx)}
            className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors border ${
              activeTab === idx 
                ? 'bg-teal-600 text-white border-teal-600' 
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="pt-6">
          {activeTab === 0 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormGroup label="Nome da Função">
                  <Input value={formData.name} onChange={e => handleChange('name', e.target.value)} />
                </FormGroup>
                <FormGroup label="Nº de colaboradores">
                  <Input value={formData.numEmployees} onChange={e => handleChange('numEmployees', e.target.value)} />
                </FormGroup>
              </div>
              <FormGroup label="Origem da Demanda">
                <Textarea value={formData.demandOrigin} onChange={e => handleChange('demandOrigin', e.target.value)} />
              </FormGroup>
              <FormGroup label="Objetivo da Análise">
                <Textarea value={formData.objective} onChange={e => handleChange('objective', e.target.value)} />
              </FormGroup>
              <FormGroup label="Demanda Encontrada">
                <Textarea value={formData.demandFound} onChange={e => handleChange('demandFound', e.target.value)} />
              </FormGroup>
            </div>
          )}

          {activeTab === 1 && (
            <div className="space-y-4">
              <FormGroup label="Descrição dos Turnos">
                <Input value={formData.shifts} onChange={e => handleChange('shifts', e.target.value)} />
              </FormGroup>
              <FormGroup label="Horas Extras">
                <Input value={formData.overtime} onChange={e => handleChange('overtime', e.target.value)} />
              </FormGroup>
              <FormGroup label="Pausas Eletivas">
                <Textarea value={formData.pauses} onChange={e => handleChange('pauses', e.target.value)} />
              </FormGroup>
              <FormGroup label="Rodízio de Tarefas">
                <Input value={formData.taskRotation} onChange={e => handleChange('taskRotation', e.target.value)} />
              </FormGroup>
              <FormGroup label="Descrição do Local">
                <Textarea value={formData.workspaceDescription} onChange={e => handleChange('workspaceDescription', e.target.value)} />
              </FormGroup>
            </div>
          )}

          {activeTab === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormGroup label="Formação / Qualificação">
                  <Input value={formData.collabFormation} onChange={e => handleChange('collabFormation', e.target.value)} />
                </FormGroup>
                <FormGroup label="Gênero">
                  <Input value={formData.opinionGender} onChange={e => handleChange('opinionGender', e.target.value)} />
                </FormGroup>
                <FormGroup label="Idade">
                  <Input value={formData.opinionAge} onChange={e => handleChange('opinionAge', e.target.value)} />
                </FormGroup>
                <FormGroup label="Tempo Médio">
                  <Input value={formData.opinionTime} onChange={e => handleChange('opinionTime', e.target.value)} />
                </FormGroup>
              </div>
              <FormGroup label="Objetivo do trabalho (segundo trabalador)">
                <Input value={formData.opinionObjective} onChange={e => handleChange('opinionObjective', e.target.value)} />
              </FormGroup>
              <div className="grid grid-cols-2 gap-4">
                <FormGroup label="Sensação Térmica">
                  <Input value={formData.opinionThermal} onChange={e => handleChange('opinionThermal', e.target.value)} />
                </FormGroup>
                <FormGroup label="Sensação de Iluminância">
                  <Input value={formData.opinionLightingSens} onChange={e => handleChange('opinionLightingSens', e.target.value)} />
                </FormGroup>
                <FormGroup label="Sensação Acústica">
                  <Input value={formData.opinionAcoustics} onChange={e => handleChange('opinionAcoustics', e.target.value)} />
                </FormGroup>
                <FormGroup label="EPI Utilizados">
                  <Input value={formData.opinionEPI} onChange={e => handleChange('opinionEPI', e.target.value)} />
                </FormGroup>
              </div>
              <FormGroup label="Principais aspectos de dificuldades">
                <Textarea value={formData.opinionDifficulties} onChange={e => handleChange('opinionDifficulties', e.target.value)} />
              </FormGroup>
            </div>
          )}

          {activeTab === 3 && (
            <div className="space-y-4">
              <FormGroup label="Esforços Dinâmicos">
                <Textarea value={formData.effortDynamic} onChange={e => handleChange('effortDynamic', e.target.value)} />
              </FormGroup>
              <FormGroup label="Esforços Estáticos">
                <Textarea value={formData.effortStatic} onChange={e => handleChange('effortStatic', e.target.value)} />
              </FormGroup>
              <FormGroup label="Cronoanálise">
                <Textarea value={formData.timeAnalysis} onChange={e => handleChange('timeAnalysis', e.target.value)} />
              </FormGroup>
              <FormGroup label="Carregamento de Peso">
                <Textarea value={formData.loadCarrying} onChange={e => handleChange('loadCarrying', e.target.value)} />
              </FormGroup>
              <FormGroup label="Deslocamentos">
                <Textarea value={formData.displacement} onChange={e => handleChange('displacement', e.target.value)} />
              </FormGroup>
            </div>
          )}

          {activeTab === 4 && (
            <div className="space-y-4">
              <FormGroup label="Como é feito a manutenção?">
                <Textarea value={formData.maintenanceDesc} onChange={e => handleChange('maintenanceDesc', e.target.value)} />
              </FormGroup>
              <FormGroup label="A logística influencia?">
                <Input value={formData.logisticsInfluence} onChange={e => handleChange('logisticsInfluence', e.target.value)} />
              </FormGroup>
              <FormGroup label="Refugo / Retrabalho">
                <Textarea value={formData.reworkDesc} onChange={e => handleChange('reworkDesc', e.target.value)} />
              </FormGroup>
            </div>
          )}

          {activeTab === 5 && (
            <div className="space-y-4">
              <FormGroup label="Materiais e Equipamentos">
                <Textarea value={formData.equipments} onChange={e => handleChange('equipments', e.target.value)} />
              </FormGroup>
              <FormGroup label="Problemas aparentes">
                <Input value={formData.equipProblems} onChange={e => handleChange('equipProblems', e.target.value)} />
              </FormGroup>
              <FormGroup label="Tarefa Prescrita">
                <Textarea value={formData.cyclePrescribed} onChange={e => handleChange('cyclePrescribed', e.target.value)} />
              </FormGroup>
              <FormGroup label="Tarefa Real">
                <Textarea value={formData.cycleReal} onChange={e => handleChange('cycleReal', e.target.value)} className="min-h-[150px]"/>
              </FormGroup>
              <div className="grid grid-cols-2 gap-4">
                 <FormGroup label="Postura Sentada (%)">
                   <Input type="number" max="100" min="0" value={formData.postureSittingPct} onChange={e => handleChange('postureSittingPct', e.target.value)} />
                 </FormGroup>
                 <FormGroup label="Postura de Pé (%)">
                   <Input type="number" max="100" min="0" value={formData.postureStandingPct} onChange={e => handleChange('postureStandingPct', e.target.value)} />
                 </FormGroup>
              </div>
            </div>
          )}

          {activeTab === 6 && (
            <div className="space-y-4">
               <FormGroup label="Diagnóstico">
                 <Textarea value={formData.diagnosis} onChange={e => handleChange('diagnosis', e.target.value)} className="min-h-[200px]" />
               </FormGroup>
               <div className="grid grid-cols-2 gap-4 mt-6">
                 <FormGroup label="Risco Calculado (Ex: Moderado)">
                   <Input value={formData.riskLevel} onChange={e => handleChange('riskLevel', e.target.value)} />
                 </FormGroup>
                 <FormGroup label="RULA (Ex: Amarelo)">
                   <Select value={formData.rulaScore} onChange={e => handleChange('rulaScore', e.target.value)}>
                     <option value="">Selecione...</option>
                     <option value="Verde">Verde (Aceitável)</option>
                     <option value="Amarelo">Amarelo (Investigar)</option>
                     <option value="Vermelho">Vermelho (Mudar Imediatamente)</option>
                   </Select>
                 </FormGroup>
               </div>
            </div>
          )}
          {activeTab === 7 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2 mb-4">Inventário de Risco Ergonômico / Plano de Ação</h3>
              
              {(formData.improvements || []).map((imp, idx) => (
                <div key={imp.id} className="p-4 border rounded-lg bg-gray-50 space-y-4 mb-4 relative">
                  <button 
                    onClick={() => {
                        const newImps = formData.improvements.filter(i => i.id !== imp.id);
                        handleChange('improvements', newImps);
                    }}
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                  >
                    Excluir
                  </button>
                  <p className="font-medium">Melhoria 0{idx + 1}</p>
                  
                  <FormGroup label="Identificação do perigo (O que foi verificado?)">
                    <Textarea 
                      value={imp.hazard} 
                      onChange={e => {
                        const newImps = [...formData.improvements];
                        newImps[idx].hazard = e.target.value;
                        handleChange('improvements', newImps);
                      }} 
                    />
                  </FormGroup>
                  <div className="grid grid-cols-2 gap-4">
                    <FormGroup label="Avaliação de Risco (Ex: 4 - Provável / 8 - Moderado)">
                      <Input 
                        value={imp.riskEvaluation} 
                        onChange={e => {
                          const newImps = [...formData.improvements];
                          newImps[idx].riskEvaluation = e.target.value;
                          handleChange('improvements', newImps);
                        }} 
                      />
                    </FormGroup>
                    <FormGroup label="Medidas de melhoria (Ação recomendada)">
                      <Textarea 
                        value={imp.actions} 
                        onChange={e => {
                          const newImps = [...formData.improvements];
                          newImps[idx].actions = e.target.value;
                          handleChange('improvements', newImps);
                        }} 
                      />
                    </FormGroup>
                  </div>
                </div>
              ))}
              
              <Button 
                type="button" 
                variant="secondary" 
                onClick={() => {
                  const newImp = { id: Math.random().toString(36).substr(2, 9), hazard: '', riskEvaluation: '', probability: '', actions: '' };
                  handleChange('improvements', [...(formData.improvements || []), newImp]);
                }}
              >
                + Adicionar Melhoria
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
