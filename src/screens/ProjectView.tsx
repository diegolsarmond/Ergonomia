import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAET } from '../context/AETContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Plus, Printer, ArrowLeft, Trash2, Edit2 } from 'lucide-react';

export const ProjectView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getProject, addFunction, deleteFunction } = useAET();
  const project = getProject(id!);

  if (!project) return <div className="p-8 text-center">Projeto não encontrado</div>;

  const handleAddFunction = async () => {
    const newFuncId = await addFunction(project.id, { name: 'Nova Função' });
    navigate(`/project/${project.id}/function/${newFuncId}`);
  };

  const handlePrint = () => {
    if (window.self !== window.top) {
      alert("Por favor, abra o aplicativo em uma nova guia para imprimir. Existe um botão 'Abrir em uma nova aba' no canto superior direito da pré-visualização.");
    } else {
      window.print();
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto print:p-0 print:max-w-none">
      <div className="print:hidden">
        <Button variant="ghost" className="mb-6" onClick={() => navigate('/')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar aos Projetos
        </Button>

        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{project.companyName}</h1>
            <p className="text-gray-500">AET - {project.location} - {new Date(project.date).toLocaleDateString('pt-BR')}</p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={handlePrint} className="print:hidden">
              <Printer className="w-4 h-4 mr-2" />
              Imprimir Relatório
            </Button>
            <Button onClick={handleAddFunction} className="print:hidden">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Função
            </Button>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
           <Card>
             <CardHeader><CardTitle>Detalhes da Empresa</CardTitle></CardHeader>
             <CardContent className="space-y-2">
               <p><strong>CNPJ:</strong> {project.cnpj}</p>
               <p><strong>Endereço:</strong> {project.address}</p>
               <p><strong>Produto:</strong> {project.product}</p>
               <p><strong>Grau de Risco:</strong> {project.riskDegree}</p>
             </CardContent>
           </Card>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Funções Analisadas</h2>
          {project.functions.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
              <p className="text-gray-500 mb-4">Nenhuma função cadastrada.</p>
              <Button onClick={handleAddFunction} variant="outline">Cadastrar Função</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {project.functions.map((func) => (
                <Card key={func.id} className="flex justify-between items-center">
                  <div className="px-6 py-4 flex-1 cursor-pointer" onClick={() => navigate(`/project/${project.id}/function/${func.id}`)}>
                    <h3 className="font-medium text-lg text-teal-700">{func.name || 'Sem nome'}</h3>
                    <p className="text-sm text-gray-500">{func.numEmployees} colaboradores • Turnos: {func.shifts}</p>
                  </div>
                  <div className="px-6 py-4 flex gap-2">
                    <Button variant="ghost" onClick={() => navigate(`/project/${project.id}/function/${func.id}`)}>
                      <Edit2 className="w-4 h-4 text-gray-500" />
                    </Button>
                    <Button variant="ghost" onClick={() => deleteFunction(project.id, func.id)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* PRINT VIEW */}
      <div className="hidden print:block space-y-12">
         {/* COVER PAGE */}
         <div className="min-h-screen flex flex-col justify-center items-center text-center page-break-after">
            <h1 className="text-4xl font-bold text-teal-700 mb-16">ANÁLISE ERGONÔMICA DO TRABALHO – AET</h1>
            <h2 className="text-3xl font-bold mb-4">{project.companyName}</h2>
            <h3 className="text-2xl font-semibold text-teal-600 mb-16">UNIDADE: {project.location}</h3>
            <p className="text-xl">{new Date(project.date).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</p>
         </div>

         {/* INTRO */}
         <div className="page-break-after">
           <h2 className="text-2xl font-bold mb-6">1. INTRODUÇÃO</h2>
           <h3 className="text-xl font-semibold mb-4">1.1 Análise global da empresa</h3>
           <p className="mb-2"><strong>CNPJ:</strong> {project.cnpj}</p>
           <p className="mb-2"><strong>Razão Social:</strong> {project.companyName}</p>
           <p className="mb-2"><strong>Endereço:</strong> {project.address}</p>
           <p className="mb-2"><strong>Produto:</strong> {project.product}</p>
           <p className="mb-2"><strong>Grau de Risco:</strong> {project.riskDegree}</p>
           <p className="mb-2"><strong>Local de produção:</strong> {project.location}</p>
         </div>

         {/* FUNCTIONS */}
         {project.functions.map((func, index) => (
           <div key={func.id} className="page-break-after">
             <h2 className="text-xl font-bold mb-4 bg-teal-700 text-white p-2">
               2.{index + 1} Função: {func.name}
             </h2>
             <div className="grid grid-cols-2 mb-4 border border-gray-300">
               <div className="p-2 border-r border-gray-300 bg-gray-100 font-semibold">Função</div>
               <div className="p-2 bg-gray-100 font-semibold">Nº de colaboradores</div>
               <div className="p-2 border-r border-gray-300 border-t">{func.name}</div>
               <div className="p-2 border-t border-gray-300">{func.numEmployees}</div>
             </div>
             
             <h3 className="font-bold mt-6 mb-2 uppercase">Origem da Demanda</h3>
             <p>{func.demandOrigin || '-'}</p>

             <h3 className="font-bold mt-6 mb-2 uppercase">Objetivo da Análise</h3>
             <p>{func.objective || '-'}</p>

             <h3 className="font-bold mt-6 mb-2 uppercase">Demanda Encontrada</h3>
             <p>{func.demandFound || '-'}</p>

             <div className="mt-8">
               <p><strong>Descrição dos turnos:</strong> {func.shifts}</p>
               <p><strong>Horas extras:</strong> {func.overtime}</p>
               <p><strong>Pausas eletivas:</strong> {func.pauses}</p>
               <p><strong>Rodízio de tarefas:</strong> {func.taskRotation}</p>
               <p><strong>Descrição do local onde foi feita a análise:</strong> {func.workspaceDescription}</p>
             </div>
             
             <h3 className="font-bold mt-8 mb-4 uppercase text-center">Colaborador</h3>
             <p><strong>Formação / qualificação:</strong> {func.collabFormation}</p>
             <p><strong>O turno onde o trabalhador foi entrevistado:</strong> {func.collabTurn}</p>

             <h3 className="font-bold mt-8 mb-4 uppercase text-center">Opinião do Trabalhador</h3>
             <ul className="space-y-2 list-disc pl-5">
               <li><strong>Gênero:</strong> {func.opinionGender}</li>
               <li><strong>Idade:</strong> {func.opinionAge}</li>
               <li><strong>Tempo médio na empresa:</strong> {func.opinionTime}</li>
               <li><strong>Objetivo do trabalho:</strong> {func.opinionObjective}</li>
               <li><strong>Sensação térmica:</strong> {func.opinionThermal}</li>
               <li><strong>Sensação de iluminância:</strong> {func.opinionLightingSens}</li>
               <li><strong>Sensação acústica:</strong> {func.opinionAcoustics}</li>
               <li><strong>EPI utilizado:</strong> {func.opinionEPI}</li>
               <li><strong>Opinião sobre equipamentos:</strong> {func.opinionEquip}</li>
               <li><strong>Opinião sobre layout:</strong> {func.opinionLayout}</li>
               <li><strong>Dificuldades na tarefa:</strong> {func.opinionDifficulties}</li>
               <li><strong>Pressão temporal:</strong> {func.opinionPressure}</li>
             </ul>

             <h3 className="font-bold mt-8 mb-4 uppercase text-center">Exigências do Trabalho</h3>
             <p><strong>Esforços dinâmicos:</strong> {func.effortDynamic}</p>
             <p><strong>Esforços estáticos:</strong> {func.effortStatic}</p>

             <h3 className="font-bold mt-8 mb-4 uppercase text-center">Modo Operatório (Tarefa Real)</h3>
             <p className="whitespace-pre-wrap">{func.cycleReal}</p>

             <h3 className="font-bold mt-8 mb-4 uppercase text-center">Diagnóstico</h3>
             <p className="whitespace-pre-wrap">{func.diagnosis}</p>

             {func.improvements && func.improvements.length > 0 && (
               <div className="mt-8 page-break-before">
                  <h3 className="font-bold mb-4 uppercase text-center text-xl bg-teal-600 text-white p-2">Inventário de Risco Ergonômico</h3>
                  {func.improvements.map((imp, idx) => (
                     <div key={imp.id} className="border border-gray-400 mb-6 text-sm">
                       <div className="grid grid-cols-4 bg-gray-200 border-b border-gray-400 font-bold text-center">
                         <div className="p-2 border-r border-gray-400 col-span-2">Identificação do Perigo</div>
                         <div className="p-2 border-r border-gray-400">Avaliação do Risco Bruto</div>
                         <div className="p-2">Medidas de Melhoria</div>
                       </div>
                       <div className="grid grid-cols-4 min-h-[100px]">
                         <div className="p-4 border-r border-gray-400 col-span-2 flex items-center justify-center">
                            <span className="mr-4 font-bold text-lg text-gray-400">{String(idx + 1).padStart(2, '0')}</span>
                            <p className="whitespace-pre-wrap w-full">{imp.hazard}</p>
                         </div>
                         <div className="p-4 border-r border-gray-400 flex items-center justify-center text-center">
                            <p className="whitespace-pre-wrap">{imp.riskEvaluation}</p>
                         </div>
                         <div className="p-4 flex items-center justify-start">
                            <p className="whitespace-pre-wrap">{imp.actions}</p>
                         </div>
                       </div>
                     </div>
                  ))}
               </div>
             )}
           </div>
         ))}
      </div>

    </div>
  );
};
