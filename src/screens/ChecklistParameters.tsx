import React, { useState } from 'react';
import { useAET } from '../context/AETContext';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { FormGroup, Input } from '../components/ui/Forms';
import { ChecklistQuestion } from '../types';
import { Trash2, Edit } from 'lucide-react';

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
    <div className="p-8 max-w-6xl mx-auto pb-24">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Parâmetros: Checklist</h1>

      <Card className="mb-8">
        <CardContent className="pt-6">
          <h2 className="text-lg font-semibold mb-4">{editingId ? 'Editar Pergunta' : 'Nova Pergunta'}</h2>
          
          <div className="space-y-4">
            <FormGroup label="Texto da Pergunta" required>
              <Input 
                value={text} 
                onChange={e => setText(e.target.value)} 
                placeholder="Ex: O colaborador possui pausas adequadas?"
              />
            </FormGroup>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Vincular às Funções</label>
              <div className="max-h-48 overflow-y-auto border rounded-md p-2 space-y-2">
                {allFunctions.length === 0 && <p className="text-sm text-gray-500">Nenhuma função cadastrada.</p>}
                {allFunctions.map(fn => (
                  <label key={fn.id} className="flex items-center space-x-2 text-sm cursor-pointer hover:bg-gray-50 p-1 rounded">
                    <input 
                      type="checkbox" 
                      checked={selectedFunctions.includes(fn.id)}
                      onChange={() => toggleFunction(fn.id)}
                      className="rounded text-teal-600"
                    />
                    <span>{fn.name} <span className="text-gray-400">({fn.projectName})</span></span>
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

      <Card>
        <CardContent className="pt-6">
          <h2 className="text-lg font-semibold mb-4">Perguntas Cadastradas</h2>
          {checklistQuestions.length === 0 ? (
            <p className="text-gray-500 text-sm">Nenhuma pergunta cadastrada.</p>
          ) : (
            <div className="space-y-4">
              {checklistQuestions.map(q => (
                <div key={q.id} className="border rounded-lg p-4 flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">{q.text}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Vinculada a {q.functionIds?.length || 0} funções
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" className="p-2" onClick={() => handleEdit(q)}>
                      <Edit className="w-4 h-4 text-gray-600" />
                    </Button>
                    <Button variant="ghost" className="p-2 hover:text-red-600" onClick={() => deleteChecklistQuestion(q.id)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
