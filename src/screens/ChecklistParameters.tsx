import React, { useState } from 'react';
import { useAET } from '../context/AETContext';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { FormGroup, Input } from '../components/ui/Forms';
import { ChecklistQuestion } from '../types';
import { Trash2, Edit, ListChecks, Plus, X } from 'lucide-react';

const ChecklistForm: React.FC<{
  text: string;
  setText: (v: string) => void;
  selectedFunctions: string[];
  toggleFunction: (id: string) => void;
  allFunctions: any[];
  onSave: () => void;
  onCancel: () => void;
  isEditing: boolean;
}> = ({ text, setText, selectedFunctions, toggleFunction, allFunctions, onSave, onCancel, isEditing }) => (
  <div className="space-y-4">
    <FormGroup label="Texto da Pergunta" required>
      <Input
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Ex: O colaborador possui pausas adequadas?"
        autoFocus
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
      <Button variant="ghost" onClick={onCancel}>Cancelar</Button>
      <Button onClick={onSave}>{isEditing ? 'Atualizar Pergunta' : 'Adicionar Pergunta'}</Button>
    </div>
  </div>
);

export const ChecklistParameters = () => {
  const { projects, checklistQuestions, addChecklistQuestion, updateChecklistQuestion, deleteChecklistQuestion } = useAET();

  const [modalOpen, setModalOpen] = useState(false);
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
    closeModal();
  };

  const openNew = () => { setEditingId(null); setText(''); setSelectedFunctions([]); setModalOpen(true); };

  const handleEdit = (q: ChecklistQuestion) => {
    setEditingId(q.id);
    setText(q.text);
    setSelectedFunctions(q.functionIds || []);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setText('');
    setSelectedFunctions([]);
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
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <ListChecks className="w-4 h-4 text-teal-200" />
              </div>
              <div>
                <p className="text-xl font-bold">{checklistQuestions.length}</p>
                <p className="text-[11px] text-teal-200">perguntas</p>
              </div>
            </div>
            <Button onClick={openNew} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Nova Pergunta
            </Button>
          </div>
        </div>
      </div>

      {/* ── List ────────────────────────────────────────────────── */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-base font-semibold text-slate-800 mb-4">Perguntas Cadastradas</h2>
          {checklistQuestions.length === 0 ? (
            <div className="empty-state !py-16">
              <ListChecks className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p className="text-slate-400 text-sm mb-4">Nenhuma pergunta cadastrada.</p>
              <Button onClick={openNew} variant="ghost">
                <Plus className="w-4 h-4 mr-2" />Adicionar pergunta
              </Button>
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

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-base font-semibold text-slate-800">
                {editingId ? 'Editar Pergunta' : 'Nova Pergunta'}
              </h2>
              <button onClick={closeModal} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>
            <div className="px-6 py-4">
              <ChecklistForm
                text={text}
                setText={setText}
                selectedFunctions={selectedFunctions}
                toggleFunction={toggleFunction}
                allFunctions={allFunctions}
                onSave={handleSave}
                onCancel={closeModal}
                isEditing={!!editingId}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
