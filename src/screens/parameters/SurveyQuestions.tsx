import React, { useState } from 'react';
import { useAET } from '../../context/AETContext';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { FormGroup, Input, Select } from '../../components/ui/Forms';
import { SurveyQuestion } from '../../types';
import { MessageSquare, Edit, Trash2, CheckCircle, XCircle, GripVertical } from 'lucide-react';

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
  question: '', category: '', responseType: 'text', required: false, order: 0, active: true,
};

export const SurveyQuestions = () => {
  const { surveyQuestions, addSurveyQuestion, updateSurveyQuestion, deleteSurveyQuestion } = useAET();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<SurveyQuestion, 'id'>>(EMPTY);

  const set = (field: keyof Omit<SurveyQuestion, 'id'>, value: any) =>
    setForm(f => ({ ...f, [field]: value }));

  const handleSave = async () => {
    if (!form.question.trim()) return;
    const order = form.order || surveyQuestions.length + 1;
    if (editingId) await updateSurveyQuestion(editingId, { ...form, order });
    else await addSurveyQuestion({ ...form, order });
    setEditingId(null);
    setForm(EMPTY);
  };

  const handleEdit = (q: SurveyQuestion) => { setEditingId(q.id); setForm({ ...q }); };
  const handleCancel = () => { setEditingId(null); setForm(EMPTY); };

  const sorted = [...surveyQuestions].sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div className="p-6 lg:p-8 xl:p-10 pb-24">
      <div className="page-header mb-8">
        <div className="flex justify-between items-center relative z-10">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Perguntas do Questionário</h1>
            <p className="text-teal-200 text-sm mt-1">Perguntas para a entrevista com o trabalhador</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-teal-200" />
            </div>
            <div>
              <p className="text-xl font-bold">{surveyQuestions.length}</p>
              <p className="text-[11px] text-teal-200">perguntas</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <div className="xl:col-span-2">
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-base font-semibold text-slate-800 mb-4">
                {editingId ? 'Editar Pergunta' : 'Nova Pergunta'}
              </h2>
              <div className="space-y-1">
                <FormGroup label="Pergunta" required>
                  <Input value={form.question} onChange={e => set('question', e.target.value)} placeholder="Ex: Como você avalia o nível de ruído?" />
                </FormGroup>
                <FormGroup label="Categoria">
                  <Select value={form.category} onChange={e => set('category', e.target.value)}>
                    <option value="">Selecione</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </Select>
                </FormGroup>
                <FormGroup label="Tipo de Resposta">
                  <Select value={form.responseType} onChange={e => set('responseType', e.target.value)}>
                    {RESPONSE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </Select>
                </FormGroup>
                <FormGroup label="Ordem">
                  <Input type="number" value={form.order || ''} onChange={e => set('order', parseInt(e.target.value) || 0)} placeholder="Posição na lista" />
                </FormGroup>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={form.required} onChange={e => set('required', e.target.checked)} className="rounded text-teal-600 border-slate-300 focus:ring-teal-500" />
                    <span className="text-slate-700">Obrigatória</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={form.active} onChange={e => set('active', e.target.checked)} className="rounded text-teal-600 border-slate-300 focus:ring-teal-500" />
                    <span className="text-slate-700">Ativa</span>
                  </label>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  {editingId && <Button variant="ghost" onClick={handleCancel}>Cancelar</Button>}
                  <Button onClick={handleSave}>{editingId ? 'Atualizar' : 'Adicionar'}</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="xl:col-span-3">
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-base font-semibold text-slate-800 mb-4">Perguntas Cadastradas</h2>
              {surveyQuestions.length === 0 ? (
                <div className="empty-state !py-10">
                  <MessageSquare className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                  <p className="text-slate-400 text-sm">Nenhuma pergunta cadastrada.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sorted.map(q => (
                    <div key={q.id} className="border border-slate-200 rounded-xl p-4 flex justify-between items-start hover:border-slate-300 transition-colors bg-white">
                      <div className="flex gap-2 min-w-0 flex-1">
                        <GripVertical className="w-4 h-4 text-slate-300 mt-0.5 shrink-0" />
                        <div className="min-w-0">
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
                          </div>
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
        </div>
      </div>
    </div>
  );
};
