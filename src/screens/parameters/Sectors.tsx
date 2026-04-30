import React, { useState } from 'react';
import { useAET } from '../../context/AETContext';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { FormGroup, Input, Textarea, Select } from '../../components/ui/Forms';
import { Sector } from '../../types';
import { Layers, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';

const EMPTY: Omit<Sector, 'id'> = {
  companyId: '', unitId: '', name: '', description: '', active: true,
};

export const Sectors = () => {
  const { sectors, addSector, updateSector, deleteSector, companies, units } = useAET();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Sector, 'id'>>(EMPTY);

  const set = (field: keyof Omit<Sector, 'id'>, value: any) =>
    setForm(f => ({ ...f, [field]: value }));

  const filteredUnits = units.filter(u => !form.companyId || u.companyId === form.companyId);

  const handleSave = async () => {
    const missing: string[] = [];
    if (!form.name.trim()) missing.push('Nome do Setor');

    if (missing.length > 0) {
      alert(`Por favor, preencha os campos obrigatórios:\n- ${missing.join('\n- ')}`);
      return;
    }

    if (editingId) await updateSector(editingId, form);
    else await addSector(form);
    setEditingId(null);
    setForm(EMPTY);
  };

  const handleEdit = (s: Sector) => { setEditingId(s.id); setForm({ ...s }); };
  const handleCancel = () => { setEditingId(null); setForm(EMPTY); };

  const companyName = (id: string) => companies.find(c => c.id === id)?.razaoSocial ?? '—';
  const unitName = (id: string) => units.find(u => u.id === id)?.name ?? '—';

  return (
    <div className="p-6 lg:p-8 xl:p-10 pb-24">
      <div className="page-header mb-8">
        <div className="flex justify-between items-center relative z-10">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Setores</h1>
            <p className="text-teal-200 text-sm mt-1">Cadastro de setores por unidade</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <Layers className="w-4 h-4 text-teal-200" />
            </div>
            <div>
              <p className="text-xl font-bold">{sectors.length}</p>
              <p className="text-[11px] text-teal-200">setores</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <div className="xl:col-span-2">
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-base font-semibold text-slate-800 mb-4">
                {editingId ? 'Editar Setor' : 'Novo Setor'}
              </h2>
              <div className="space-y-1">
                <FormGroup label="Empresa">
                  <Select value={form.companyId} onChange={e => set('companyId', e.target.value)}>
                    <option value="">Selecione a empresa</option>
                    {companies.map(c => <option key={c.id} value={c.id}>{c.razaoSocial}</option>)}
                  </Select>
                </FormGroup>
                <FormGroup label="Unidade">
                  <Select value={form.unitId} onChange={e => set('unitId', e.target.value)}>
                    <option value="">Selecione a unidade</option>
                    {filteredUnits.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </Select>
                </FormGroup>
                <FormGroup label="Nome do Setor" required>
                  <Input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Ex: Produção, Expedição, Administrativo" />
                </FormGroup>
                <FormGroup label="Descrição">
                  <Textarea value={form.description} onChange={e => set('description', e.target.value)} placeholder="Descreva brevemente o setor" />
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
              <h2 className="text-base font-semibold text-slate-800 mb-4">Setores Cadastrados</h2>
              {sectors.length === 0 ? (
                <div className="empty-state !py-10">
                  <Layers className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                  <p className="text-slate-400 text-sm">Nenhum setor cadastrado.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sectors.map(s => (
                    <div key={s.id} className="border border-slate-200 rounded-xl p-4 flex justify-between items-start hover:border-slate-300 transition-colors bg-white">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-slate-800 text-sm">{s.name}</p>
                          {s.active
                            ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            : <XCircle className="w-3.5 h-3.5 text-slate-300 shrink-0" />}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {companyName(s.companyId)}{s.unitId ? ` › ${unitName(s.unitId)}` : ''}
                        </p>
                        {s.description && <p className="text-xs text-slate-400 mt-1 line-clamp-1">{s.description}</p>}
                      </div>
                      <div className="flex gap-1 ml-3 shrink-0">
                        <Button variant="ghost" size="sm" className="!rounded-lg" onClick={() => handleEdit(s)}>
                          <Edit className="w-4 h-4 text-slate-400" />
                        </Button>
                        <Button variant="ghost" size="sm" className="!rounded-lg" onClick={() => deleteSector(s.id)}>
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
