import React, { useState } from 'react';
import { useAET } from '../../context/AETContext';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { FormGroup, Input, Textarea, Select } from '../../components/ui/Forms';
import { StandardJobRole } from '../../types';
import { Briefcase, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';

const EMPTY: Omit<StandardJobRole, 'id'> = { name: '', cbo: '', description: '', active: true };

export const JobRoles = () => {
  const { jobRoles, addJobRole, updateJobRole, deleteJobRole } = useAET();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<StandardJobRole, 'id'>>(EMPTY);

  const set = (field: keyof Omit<StandardJobRole, 'id'>, value: any) =>
    setForm(f => ({ ...f, [field]: value }));

  const handleSave = async () => {
    if (!form.name.trim()) return;
    if (editingId) await updateJobRole(editingId, form);
    else await addJobRole(form);
    setEditingId(null);
    setForm(EMPTY);
  };

  const handleEdit = (r: StandardJobRole) => { setEditingId(r.id); setForm({ ...r }); };
  const handleCancel = () => { setEditingId(null); setForm(EMPTY); };

  return (
    <div className="p-6 lg:p-8 xl:p-10 pb-24">
      <div className="page-header mb-8">
        <div className="flex justify-between items-center relative z-10">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Funções Padrão</h1>
            <p className="text-teal-200 text-sm mt-1">Cadastro de funções reutilizáveis</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-teal-200" />
            </div>
            <div>
              <p className="text-xl font-bold">{jobRoles.length}</p>
              <p className="text-[11px] text-teal-200">funções</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <div className="xl:col-span-2">
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-base font-semibold text-slate-800 mb-4">
                {editingId ? 'Editar Função' : 'Nova Função'}
              </h2>
              <div className="space-y-1">
                <FormGroup label="Nome da Função" required>
                  <Input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Ex: Operador de Produção" />
                </FormGroup>
                <FormGroup label="CBO">
                  <Input value={form.cbo} onChange={e => set('cbo', e.target.value)} placeholder="Código CBO (opcional)" />
                </FormGroup>
                <FormGroup label="Descrição Padrão">
                  <Textarea value={form.description} onChange={e => set('description', e.target.value)} placeholder="Descreva resumidamente as atribuições da função" />
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
              <h2 className="text-base font-semibold text-slate-800 mb-4">Funções Cadastradas</h2>
              {jobRoles.length === 0 ? (
                <div className="empty-state !py-10">
                  <Briefcase className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                  <p className="text-slate-400 text-sm">Nenhuma função cadastrada.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {jobRoles.map(r => (
                    <div key={r.id} className="border border-slate-200 rounded-xl p-4 flex justify-between items-start hover:border-slate-300 transition-colors bg-white">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-slate-800 text-sm">{r.name}</p>
                          {r.active
                            ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            : <XCircle className="w-3.5 h-3.5 text-slate-300 shrink-0" />}
                        </div>
                        {r.cbo && <span className="stat-badge !text-[11px] !px-2 !py-0.5 mt-1 inline-block">CBO {r.cbo}</span>}
                        {r.description && <p className="text-xs text-slate-400 mt-1 line-clamp-2">{r.description}</p>}
                      </div>
                      <div className="flex gap-1 ml-3 shrink-0">
                        <Button variant="ghost" size="sm" className="!rounded-lg" onClick={() => handleEdit(r)}>
                          <Edit className="w-4 h-4 text-slate-400" />
                        </Button>
                        <Button variant="ghost" size="sm" className="!rounded-lg" onClick={() => deleteJobRole(r.id)}>
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
