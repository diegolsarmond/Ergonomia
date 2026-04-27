import React, { useState } from 'react';
import { useAET } from '../context/AETContext';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { FormGroup, Input } from '../components/ui/Forms';
import { ChecklistQuestion } from '../types';
import { Trash2, Edit, ListChecks } from 'lucide-react';

export const ChecklistParameters = () => {
  const { projects, checklistQuestions, addChecklistQuestion, updateChecklistQuestion, deleteChecklistQuestion } = useAET();
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [selectedFunctions, setSelectedFunctions] = useState<string[]>([]);

  const allFunctions = projects.flatMap(p => p.functions.map(f => ({ ...f, projectName: p.companyName })));

  const handleSave = async () => {
    if (!text.trim()) return;

    if (editingId) {
      await updateChecklistQuestion(editingId, { text, functionIds: selectedFunctions });
    } else {
      await addChecklistQuestion({ text, functionIds: selectedFunctions });
    }

    setEditingId(null);
    setText('');
    setSelectedFunctions([]);
  };

  const handleEdit = (q: ChecklistQuestion) => {
    setEditingId(q.id);
    setText(q.text);
    setSelectedFunctions(q.functionIds || []);
  };

  const toggleFunction = (fnId: string) => {
    setSelectedFunctions(prev => 
      prev.includes(fnId) ? prev.filter(id => id !== fnId) : [...prev, fnId]
    );
  };

  return (
    <div className="p-6 lg:p-8 xl:p-10 pb-24">
      {/* ── Page Header ──────────────────────────────────────────── */}
      <div className="page-header mb-8">
        <div className="flex justify-between items-center relative z-10">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Checklist</h1>
            <p className="text-teal-200 text-sm mt-1">Parâmetros de verificação por função</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <ListChecks className="w-4 h-4 text-teal-200" />
            </div>
            <div>
              <p className="text-xl font-bold">{checklistQuestions.length}</p>
              <p className="text-[11px] text-teal-200">perguntas</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Form ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <div className="xl:col-span-2">
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-base font-semibold text-slate-800 mb-4">{editingId ? 'Editar Pergunta' : 'Nova Pergunta'}</h2>
              
              <div className="space-y-4">
                <FormGroup label="Texto da Pergunta" required>
                  <Input 
                    value={text} 
                    onChange={e => setText(e.target.value)} 
                    placeholder="Ex: O colaborador possui pausas adequadas?"
                  />
                </FormGroup>

                <div>
                  <label className="block text-[13px] font-medium text-slate-600 mb-2">Vincular às Funções</label>
                  <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl p-2.5 space-y-1.5 bg-slate-50/50">
                    {allFunctions.length === 0 && <p className="text-sm text-slate-400 p-2">Nenhuma função cadastrada.</p>}
                    {allFunctions.map(fn => (
                      <label key={fn.id} className="flex items-center space-x-2.5 text-sm cursor-pointer hover:bg-white p-2 rounded-lg transition-colors">
                        <input 
                          type="checkbox" 
                          checked={selectedFunctions.includes(fn.id)}
                          onChange={() => toggleFunction(fn.id)}
                          className="rounded text-teal-600 border-slate-300 focus:ring-teal-500"
                        />
                        <span className="text-slate-700">{fn.name} <span className="text-slate-400">({fn.projectName})</span></span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  {editingId && (
                    <Button variant="ghost" onClick={() => { setEditingId(null); setText(''); setSelectedFunctions([]); }}>
                      Cancelar
                    </Button>
                  )}
                  <Button onClick={handleSave}>
                    {editingId ? 'Atualizar Pergunta' : 'Adicionar Pergunta'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── List ────────────────────────────────────────────────── */}
        <div className="xl:col-span-3">
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-base font-semibold text-slate-800 mb-4">Perguntas Cadastradas</h2>
              {checklistQuestions.length === 0 ? (
                <div className="empty-state !py-10">
                  <ListChecks className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                  <p className="text-slate-400 text-sm">Nenhuma pergunta cadastrada.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {checklistQuestions.map(q => (
                    <div key={q.id} className="border border-slate-200 rounded-xl p-4 flex justify-between items-start hover:border-slate-300 transition-colors bg-white">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-slate-800 text-sm">{q.text}</p>
                        <p className="text-xs text-slate-400 mt-1.5">
                          <span className="stat-badge !text-[11px] !px-2 !py-0.5">
                            {q.functionIds?.length || 0} funções vinculadas
                          </span>
                        </p>
                      </div>
                      <div className="flex gap-1 ml-3 shrink-0">
                        <Button variant="ghost" size="sm" className="!rounded-lg" onClick={() => handleEdit(q)}>
                          <Edit className="w-4 h-4 text-slate-400" />
                        </Button>
                        <Button variant="ghost" size="sm" className="!rounded-lg" onClick={() => deleteChecklistQuestion(q.id)}>
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
