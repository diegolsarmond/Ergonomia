import React, { useState } from 'react';
import { useAET } from '../../context/AETContext';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { FormGroup, Input, Select } from '../../components/ui/Forms';
import { SurveyQuestion } from '../../types';
import { MessageSquare, Edit, Trash2, CheckCircle, XCircle, GripVertical, Plus, X } from 'lucide-react';

const CATEGORIES = ['Conforto térmico','Iluminação','Acústica','Organização do trabalho','Equipamentos','Ergonomia','Relacionamento','Outro'];
const RESPONSE_TYPES = [
  { value: 'text', label: 'Texto curto' },
  { value: 'textarea', label: 'Área de texto' },
  { value: 'yesno', label: 'Sim / Não' },
  { value: 'select', label: 'Seleção única' },
  { value: 'multiselect', label: 'Múltipla escolha' },
  { value: 'scale', label: 'Escala 1 a 5' },
];

const EMPTY: Omit<SurveyQuestion, 'id'> = {
  question: '', category: '', responseType: 'text', options: [], required: false, order: 0, active: true,
};

// ── Sub-form: opções de múltipla escolha / seleção única ─────────────────────
const OptionsEditor: React.FC<{
  options: string[];
  onChange: (options: string[]) => void;
}> = ({ options, onChange }) => {
  const [newOption, setNewOption] = useState('');

  const addOption = () => {
    const trimmed = newOption.trim();
    if (!trimmed || options.includes(trimmed)) return;
    onChange([...options, trimmed]);
    setNewOption('');
  };

  const removeOption = (idx: number) => {
    onChange(options.filter((_, i) => i !== idx));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { e.preventDefault(); addOption(); }
  };

  return (
    <div className="rounded-xl border border-teal-200 bg-teal-50/40 p-4 space-y-3">
      <p className="text-[13px] font-semibold text-teal-800 flex items-center gap-1.5">
        <span className="w-4 h-4 rounded bg-teal-500 text-white flex items-center justify-center text-[10px] font-bold">≡</span>
        Opções de resposta
      </p>

      {/* Lista de opções existentes */}
      {options.length > 0 ? (
        <div className="space-y-1.5">
          {options.map((opt, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-1.5 group"
            >
              <GripVertical className="w-3.5 h-3.5 text-slate-300 shrink-0" />
              <span className="flex-1 text-sm text-slate-700">{opt}</span>
              <button
                type="button"
                onClick={() => removeOption(idx)}
                className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-slate-400 italic">Nenhuma opção adicionada ainda.</p>
      )}

      {/* Input para nova opção */}
      <div className="flex gap-2">
        <Input
          value={newOption}
          onChange={e => setNewOption(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Digite uma opção e pressione Enter ou +"
          className="flex-1 !text-sm"
        />
        <button
          type="button"
          onClick={addOption}
          disabled={!newOption.trim()}
          className="flex items-center gap-1 px-3 py-2 rounded-lg border border-teal-300 text-teal-700 bg-white hover:bg-teal-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm font-medium shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          Add
        </button>
      </div>
    </div>
  );
};

// ── Formulário principal ──────────────────────────────────────────────────────
const SurveyQuestionForm: React.FC<{
  form: Omit<SurveyQuestion, 'id'>;
  set: (field: keyof Omit<SurveyQuestion, 'id'>, value: any) => void;
  onSave: () => void;
  onCancel: () => void;
  isEditing: boolean;
}> = ({ form, set, onSave, onCancel, isEditing }) => {
  const showOptions = form.responseType === 'multiselect' || form.responseType === 'select';

  return (
    <div className="space-y-1">
      <FormGroup label="Pergunta" required>
        <Input
          value={form.question}
          onChange={e => set('question', e.target.value)}
          placeholder="Ex: Como você avalia o nível de ruído?"
          autoFocus
        />
      </FormGroup>

      <FormGroup label="Categoria">
        <Select value={form.category} onChange={e => set('category', e.target.value)}>
          <option value="">Selecione</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </Select>
      </FormGroup>

      <FormGroup label="Tipo de Resposta">
        <Select
          value={form.responseType}
          onChange={e => {
            set('responseType', e.target.value);
            // Limpa opções ao trocar para tipo que não as suporta
            if (e.target.value !== 'multiselect' && e.target.value !== 'select') {
              set('options', []);
            }
          }}
        >
          {RESPONSE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </Select>
      </FormGroup>

      {/* Editor de opções — exibido somente para multipla escolha / seleção única */}
      {showOptions && (
        <div className="pt-1">
          <OptionsEditor
            options={form.options || []}
            onChange={opts => set('options', opts)}
          />
        </div>
      )}

      <FormGroup label="Ordem">
        <Input
          type="number"
          value={form.order || ''}
          onChange={e => set('order', parseInt(e.target.value) || 0)}
          placeholder="Posição na lista"
        />
      </FormGroup>

      <div className="flex gap-4 py-1">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={form.required}
            onChange={e => set('required', e.target.checked)}
            className="rounded text-teal-600 border-slate-300 focus:ring-teal-500"
          />
          <span className="text-slate-700">Obrigatória</span>
        </label>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={form.active}
            onChange={e => set('active', e.target.checked)}
            className="rounded text-teal-600 border-slate-300 focus:ring-teal-500"
          />
          <span className="text-slate-700">Ativa</span>
        </label>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="ghost" onClick={onCancel}>Cancelar</Button>
        <Button onClick={onSave}>{isEditing ? 'Atualizar' : 'Adicionar'}</Button>
      </div>
    </div>
  );
};

// ── Tela principal ────────────────────────────────────────────────────────────
export const SurveyQuestions = () => {
  const { surveyQuestions, addSurveyQuestion, updateSurveyQuestion, deleteSurveyQuestion } = useAET();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<SurveyQuestion, 'id'>>(EMPTY);

  const set = (field: keyof Omit<SurveyQuestion, 'id'>, value: any) =>
    setForm(f => ({ ...f, [field]: value }));

  const handleSave = async () => {
    const missing: string[] = [];
    if (!form.question.trim()) missing.push('Pergunta');
    if (missing.length > 0) {
      alert(`Por favor, preencha os campos obrigatórios:\n- ${missing.join('\n- ')}`);
      return;
    }
    const order = form.order || surveyQuestions.length + 1;
    if (editingId) await updateSurveyQuestion(editingId, { ...form, order });
    else await addSurveyQuestion({ ...form, order });
    closeModal();
  };

  const openNew = () => { setEditingId(null); setForm(EMPTY); setModalOpen(true); };
  const handleEdit = (q: SurveyQuestion) => { setEditingId(q.id); setForm({ ...q, options: q.options || [] }); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditingId(null); setForm(EMPTY); };

  const sorted = [...surveyQuestions].sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div className="p-6 lg:p-8 xl:p-10 pb-24">
      <div className="page-header mb-8">
        <div className="flex justify-between items-center relative z-10">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Perguntas do Questionário</h1>
            <p className="text-teal-200 text-sm mt-1">Perguntas para a entrevista com o trabalhador</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-teal-200" />
              </div>
              <div>
                <p className="text-xl font-bold">{surveyQuestions.length}</p>
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

      <Card>
        <CardContent className="pt-6">
          <h2 className="text-base font-semibold text-slate-800 mb-4">Perguntas Cadastradas</h2>
          {surveyQuestions.length === 0 ? (
            <div className="empty-state !py-16">
              <MessageSquare className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p className="text-slate-400 text-sm mb-4">Nenhuma pergunta cadastrada.</p>
              <Button onClick={openNew} variant="ghost">
                <Plus className="w-4 h-4 mr-2" />Adicionar pergunta
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {sorted.map(q => (
                <div key={q.id} className="border border-slate-200 rounded-xl p-4 flex justify-between items-start hover:border-slate-300 transition-colors bg-white">
                  <div className="flex gap-2 min-w-0 flex-1">
                    <GripVertical className="w-4 h-4 text-slate-300 mt-0.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono text-slate-400">#{q.order || '—'}</span>
                        <p className="font-medium text-slate-800 text-sm">{q.question}</p>
                        {q.active
                          ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          : <XCircle className="w-3.5 h-3.5 text-slate-300 shrink-0" />}
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {q.category && <span className="stat-badge !text-[11px] !px-2 !py-0.5">{q.category}</span>}
                        <span className="stat-badge !text-[11px] !px-2 !py-0.5">
                          {RESPONSE_TYPES.find(t => t.value === q.responseType)?.label ?? q.responseType}
                        </span>
                        {q.required && <span className="stat-badge !text-[11px] !px-2 !py-0.5 !bg-amber-50 !text-amber-700 !border-amber-200">Obrigatória</span>}
                        {(q.options?.length ?? 0) > 0 && (
                          <span className="stat-badge !text-[11px] !px-2 !py-0.5 !bg-teal-50 !text-teal-700 !border-teal-200">
                            {q.options!.length} opções
                          </span>
                        )}
                      </div>
                      {/* Prévia das opções */}
                      {(q.options?.length ?? 0) > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {q.options!.map((opt, i) => (
                            <span key={i} className="text-[11px] bg-slate-100 text-slate-600 rounded-md px-2 py-0.5 border border-slate-200">
                              {opt}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 ml-3 shrink-0">
                    <Button variant="ghost" size="sm" className="!rounded-lg" onClick={() => handleEdit(q)}>
                      <Edit className="w-4 h-4 text-slate-400" />
                    </Button>
                    <Button variant="ghost" size="sm" className="!rounded-lg" onClick={() => deleteSurveyQuestion(q.id)}>
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
              <SurveyQuestionForm
                form={form}
                set={set}
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
