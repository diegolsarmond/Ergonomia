import React, { useState } from 'react';
import { useAET } from '../../context/AETContext';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { FormGroup, Input, Textarea, Select } from '../../components/ui/Forms';
import { StandardPause } from '../../types';
import { Coffee, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';

const DURATION_UNITS = ['minutos','horas'];

const EMPTY: Omit<StandardPause, 'id'> = {
  name: '', duration: '', durationUnit: 'minutos', description: '', active: true,
};

export const Pauses = () => {
  const { pauses, addPause, updatePause, deletePause } = useAET();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<StandardPause, 'id'>>(EMPTY);

  const set = (field: keyof Omit<StandardPause, 'id'>, value: any) =>
    setForm(f => ({ ...f, [field]: value }));

  const handleSave = async () => {
    if (!form.name.trim()) return;
    if (editingId) await updatePause(editingId, form);
    else await addPause(form);
    setEditingId(null);
    setForm(EMPTY);
  };

  const handleEdit = (p: StandardPause) => { setEditingId(p.id); setForm({ ...p }); };
  const handleCancel = () => { setEditingId(null); setForm(EMPTY); };

  return (
    <div className="p-6 lg:p-8 xl:p-10 pb-24">
      <div className="page-header mb-8">
        <div className="flex justify-between items-center relative z-10">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Pausas Padrão</h1>
            <p className="text-teal-200 text-sm mt-1">Tipos de pausa reutilizáveis nas análises</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <Coffee className="w-4 h-4 text-teal-200" />
            </div>
            <div>
              <p className="text-xl font-bold">{pauses.length}</p>
              <p className="text-[11px] text-teal-200">pausas</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <div className="xl:col-span-2">
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-base font-semibold text-slate-800 mb-4">
                {editingId ? 'Editar Pausa' : 'Nova Pausa'}
              </h2>
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
              <h2 className="text-base font-semibold text-slate-800 mb-4">Pausas Cadastradas</h2>
              {pauses.length === 0 ? (
                <div className="empty-state !py-10">
                  <Coffee className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                  <p className="text-slate-400 text-sm">Nenhuma pausa cadastrada.</p>
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
        </div>
      </div>
    </div>
  );
};
