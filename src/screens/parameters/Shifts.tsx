import React, { useState } from 'react';
import { useAET } from '../../context/AETContext';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { FormGroup, Input, Textarea, Select } from '../../components/ui/Forms';
import { Shift } from '../../types';
import { Clock, Edit, Trash2, CheckCircle, XCircle, Plus, X } from 'lucide-react';

const EMPTY: Omit<Shift, 'id'> = { name: '', description: '', active: true };

const ShiftForm: React.FC<{
  form: Omit<Shift, 'id'>;
  set: (field: keyof Omit<Shift, 'id'>, value: any) => void;
  onSave: () => void;
  onCancel: () => void;
  isEditing: boolean;
}> = ({ form, set, onSave, onCancel, isEditing }) => {
  return (
    <div className="space-y-1">
      <FormGroup label="Nome do Turno" required>
        <Input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Ex: Turno Diurno, 12x36" />
      </FormGroup>
      <FormGroup label="Descrição">
        <Textarea value={form.description} onChange={e => set('description', e.target.value)} placeholder="Detalhes do turno, horários, etc." />
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

export const Shifts = () => {
  const { shifts, addShift, updateShift, deleteShift } = useAET();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Shift, 'id'>>(EMPTY);

  const set = (field: keyof Omit<Shift, 'id'>, value: any) =>
    setForm(f => ({ ...f, [field]: value }));

  const handleSave = async () => {
    const missing: string[] = [];
    if (!form.name.trim()) missing.push('Nome do Turno');

    if (missing.length > 0) {
      alert(`Por favor, preencha os campos obrigatórios:\n- ${missing.join('\n- ')}`);
      return;
    }
    if (editingId) await updateShift(editingId, form);
    else await addShift(form);
    closeModal();
  };

  const openNew = () => { setEditingId(null); setForm(EMPTY); setModalOpen(true); };
  const handleEdit = (s: Shift) => { setEditingId(s.id); setForm({ ...s }); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditingId(null); setForm(EMPTY); };

  return (
    <div className="p-6 lg:p-8 xl:p-10 pb-24">
      <div className="page-header mb-8">
        <div className="flex justify-between items-center relative z-10">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Turnos</h1>
            <p className="text-teal-200 text-sm mt-1">Configuração de turnos de trabalho</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <Clock className="w-4 h-4 text-teal-200" />
              </div>
              <div>
                <p className="text-xl font-bold">{shifts.length}</p>
                <p className="text-[11px] text-teal-200">Turnos</p>
              </div>
            </div>
            <Button onClick={openNew} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Novo Turno
            </Button>
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <h2 className="text-base font-semibold text-slate-800 mb-4">Turnos Cadastrados</h2>
          {shifts.length === 0 ? (
            <div className="empty-state !py-16">
              <Clock className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p className="text-slate-400 text-sm mb-4">Nenhum turno cadastrado.</p>
              <Button onClick={openNew} variant="ghost">
                <Plus className="w-4 h-4 mr-2" />Adicionar Turno
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {shifts.map(s => (
                <div key={s.id} className="border border-slate-200 rounded-xl p-4 flex justify-between items-start hover:border-slate-300 transition-colors bg-white">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-slate-800 text-sm">{s.name}</p>
                      {s.active
                        ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        : <XCircle className="w-3.5 h-3.5 text-slate-300 shrink-0" />}
                    </div>
                    {s.description && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{s.description}</p>
                    )}
                  </div>
                  <div className="flex gap-1 ml-3 shrink-0">
                    <Button variant="ghost" size="sm" className="!rounded-lg" onClick={() => handleEdit(s)}>
                      <Edit className="w-4 h-4 text-slate-400" />
                    </Button>
                    <Button variant="ghost" size="sm" className="!rounded-lg" onClick={() => deleteShift(s.id)}>
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
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-base font-semibold text-slate-800">
                {editingId ? 'Editar Turno' : 'Novo Turno'}
              </h2>
              <button onClick={closeModal} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>
            <div className="px-6 py-4">
              <ShiftForm
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
