import React, { useState } from 'react';
import { useAET } from '../../context/AETContext';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { FormGroup, Input, Textarea, Select } from '../../components/ui/Forms';
import { EPI } from '../../types';
import { HardHat, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';

const EPI_TYPES = ['Proteção da cabeça','Proteção dos olhos e face','Proteção auditiva','Proteção respiratória','Proteção dos membros superiores','Proteção dos membros inferiores','Proteção do tronco','Proteção do corpo inteiro','Outros'];

const EMPTY: Omit<EPI, 'id'> = { name: '', type: '', description: '', mandatoryByDefault: false, active: true };

export const EPIs = () => {
  const { epis, addEPI, updateEPI, deleteEPI } = useAET();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<EPI, 'id'>>(EMPTY);

  const set = (field: keyof Omit<EPI, 'id'>, value: any) =>
    setForm(f => ({ ...f, [field]: value }));

  const handleSave = async () => {
    if (!form.name.trim()) return;
    if (editingId) await updateEPI(editingId, form);
    else await addEPI(form);
    setEditingId(null);
    setForm(EMPTY);
  };

  const handleEdit = (e: EPI) => { setEditingId(e.id); setForm({ ...e }); };
  const handleCancel = () => { setEditingId(null); setForm(EMPTY); };

  return (
    <div className="p-6 lg:p-8 xl:p-10 pb-24">
      <div className="page-header mb-8">
        <div className="flex justify-between items-center relative z-10">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">EPIs</h1>
            <p className="text-teal-200 text-sm mt-1">Equipamentos de proteção individual padrão</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <HardHat className="w-4 h-4 text-teal-200" />
            </div>
            <div>
              <p className="text-xl font-bold">{epis.length}</p>
              <p className="text-[11px] text-teal-200">EPIs</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <div className="xl:col-span-2">
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-base font-semibold text-slate-800 mb-4">
                {editingId ? 'Editar EPI' : 'Novo EPI'}
              </h2>
              <div className="space-y-1">
                <FormGroup label="Nome do EPI" required>
                  <Input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Ex: Protetor Auricular, Botina de Segurança" />
                </FormGroup>
                <FormGroup label="Tipo">
                  <Select value={form.type} onChange={e => set('type', e.target.value)}>
                    <option value="">Selecione</option>
                    {EPI_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </Select>
                </FormGroup>
                <FormGroup label="Descrição">
                  <Textarea value={form.description} onChange={e => set('description', e.target.value)} placeholder="Descrição e especificações do EPI" />
                </FormGroup>
                <FormGroup label="Obrigatório por padrão?">
                  <Select value={form.mandatoryByDefault ? 'true' : 'false'} onChange={e => set('mandatoryByDefault', e.target.value === 'true')}>
                    <option value="false">Não</option>
                    <option value="true">Sim</option>
                  </Select>
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
              <h2 className="text-base font-semibold text-slate-800 mb-4">EPIs Cadastrados</h2>
              {epis.length === 0 ? (
                <div className="empty-state !py-10">
                  <HardHat className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                  <p className="text-slate-400 text-sm">Nenhum EPI cadastrado.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {epis.map(e => (
                    <div key={e.id} className="border border-slate-200 rounded-xl p-4 flex justify-between items-start hover:border-slate-300 transition-colors bg-white">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-slate-800 text-sm">{e.name}</p>
                          {e.active
                            ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            : <XCircle className="w-3.5 h-3.5 text-slate-300 shrink-0" />}
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {e.type && <span className="stat-badge !text-[11px] !px-2 !py-0.5">{e.type}</span>}
                          {e.mandatoryByDefault && <span className="stat-badge !text-[11px] !px-2 !py-0.5 !bg-amber-50 !text-amber-700 !border-amber-200">Obrigatório</span>}
                        </div>
                      </div>
                      <div className="flex gap-1 ml-3 shrink-0">
                        <Button variant="ghost" size="sm" className="!rounded-lg" onClick={() => handleEdit(e)}>
                          <Edit className="w-4 h-4 text-slate-400" />
                        </Button>
                        <Button variant="ghost" size="sm" className="!rounded-lg" onClick={() => deleteEPI(e.id)}>
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
