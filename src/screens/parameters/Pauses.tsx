import React, { useState } from 'react';
import { useAET } from '../../context/AETContext';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { FormGroup, Input, Textarea, Select } from '../../components/ui/Forms';
import { StandardPause } from '../../types';
import { Coffee, Edit, Trash2, CheckCircle, XCircle, Plus, X } from 'lucide-react';

const DURATION_UNITS = ['minutos', 'horas'];

const EMPTY: Omit<StandardPause, 'id'> = {
  name: '', duration: '', durationUnit: 'minutos', description: '', active: true,
};

const PauseForm: React.FC<{
  form: Omit<StandardPause, 'id'>;
  set: (field: keyof Omit<StandardPause, 'id'>, value: any) => void;
  onSave: () => void;
  onCancel: () => void;
  isEditing: boolean;
}> = ({ form, set, onSave, onCancel, isEditing }) => {
  return (
    <div className="space-y-1">
      <FormGroup label="Nome da Pausa" required>
        <Input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Ex: DDS, Refeição, Café, Hidratação" />
      </FormGroup>
      <div className="grid grid-cols-2 gap-3">
        <FormGroup label="Duração padrão">
          <Input type="number" value={form.duration} onChange={e => set('duration', e.target.value)} placeholder="15" min="0" />
        </FormGroup>
        <FormGroup label="Unidade">
          <Select value={form.durationUnit} onChange={e => set('durationUnit', e.target.value)}>
            {DURATION_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
          </Select>
        </FormGroup>
      </div>
      <FormGroup label="Descrição">
        <Textarea value={form.description} onChange={e => set('description', e.target.value)} placeholder="Descreva quando e como a pausa é realizada" />
      </FormGroup>
      <FormGroup label="Status">
        <Select value={form.active ? 'true' : 'false'} onChange={e => set('active', e.target.value === 'true')}>
          <option value="true">Ativo</option>
          <option value="false">Inativo</option>
        </Select>
      </FormGroup>
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="ghost" onClick={onCancel}>Cancelar</Button>
        <Button onClick={onSave}>{isEditing ? 'Atualizar' : 'Adicionar'}</Button>
      </div>
    </div>
  );
};

export const Pauses = () => {
  const { pauses, addPause, updatePause, deletePause } = useAET();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<StandardPause, 'id'>>(EMPTY);

  const set = (field: keyof Omit<StandardPause, 'id'>, value: any) =>
    setForm(f => ({ ...f, [field]: value }));

  const handleSave = async () => {
    const missing: string[] = [];
    if (!form.name.trim()) missing.push('Nome da Pausa');

    if (missing.length > 0) {
      alert(`Por favor, preencha os campos obrigatórios:\n- ${missing.join('\n- ')}`);
      return;
    }
    if (editingId) await updatePause(editingId, form);
    else await addPause(form);
    closeModal();
  };

  const openNew = () => { setEditingId(null); setForm(EMPTY); setModalOpen(true); };
  const handleEdit = (p: StandardPause) => { setEditingId(p.id); setForm({ ...p }); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditingId(null); setForm(EMPTY); };

  return (
    <div className="p-6 lg:p-8 xl:p-10 pb-24">
      <div className="page-header mb-8">
        <div className="flex justify-between items-center relative z-10">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Pausas Padrão</h1>
            <p className="text-teal-200 text-sm mt-1">Tipos de pausa reutilizáveis nas análises</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <Coffee className="w-4 h-4 text-teal-200" />
              </div>
              <div>
                <p className="text-xl font-bold">{pauses.length}</p>
                <p className="text-[11px] text-teal-200">pausas</p>
              </div>
            </div>
            <Button onClick={openNew} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Nova Pausa
            </Button>
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <h2 className="text-base font-semibold text-slate-800 mb-4">Pausas Cadastradas</h2>
          {pauses.length === 0 ? (
            <div className="empty-state !py-16">
              <Coffee className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p className="text-slate-400 text-sm mb-4">Nenhuma pausa cadastrada.</p>
              <Button onClick={openNew} variant="ghost">
                <Plus className="w-4 h-4 mr-2" />Adicionar Pausa
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {pauses.map(p => (
                <div key={p.id} className="border border-slate-200 rounded-xl p-4 flex justify-between items-start hover:border-slate-300 transition-colors bg-white">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-slate-800 text-sm">{p.name}</p>
                      {p.active
                        ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        : <XCircle className="w-3.5 h-3.5 text-slate-300 shrink-0" />}
                    </div>
                    {p.duration && (
                      <span className="stat-badge !text-[11px] !px-2 !py-0.5 mt-1.5 inline-block">
                        {p.duration} {p.durationUnit}
                      </span>
                    )}
                    {p.description && <p className="text-xs text-slate-400 mt-1 line-clamp-2">{p.description}</p>}
                  </div>
                  <div className="flex gap-1 ml-3 shrink-0">
                    <Button variant="ghost" size="sm" className="!rounded-lg" onClick={() => handleEdit(p)}>
                      <Edit className="w-4 h-4 text-slate-400" />
                    </Button>
                    <Button variant="ghost" size="sm" className="!rounded-lg" onClick={() => deletePause(p.id)}>
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
                {editingId ? 'Editar Pausa' : 'Nova Pausa'}
              </h2>
              <button onClick={closeModal} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>
            <div className="px-6 py-4">
              <PauseForm
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
