import React, { useState } from 'react';
import { useAET } from '../../context/AETContext';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { FormGroup, Input, Select } from '../../components/ui/Forms';
import { Unit } from '../../types';
import { MapPin, Edit, Trash2 } from 'lucide-react';

const UF_LIST = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];

const EMPTY: Omit<Unit, 'id'> = {
  companyId: '', name: '', city: '', uf: '', address: '', productionLocation: '', logoDataUrl: '',
};

export const Units = () => {
  const { units, addUnit, updateUnit, deleteUnit, companies } = useAET();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Unit, 'id'>>(EMPTY);

  const set = (field: keyof Omit<Unit, 'id'>, value: string) =>
    setForm(f => ({ ...f, [field]: value }));

  const handleSave = async () => {
    if (!form.name.trim()) return;
    if (editingId) await updateUnit(editingId, form);
    else await addUnit(form);
    setEditingId(null);
    setForm(EMPTY);
  };

  const handleEdit = (u: Unit) => { setEditingId(u.id); setForm({ ...u }); };
  const handleCancel = () => { setEditingId(null); setForm(EMPTY); };

  const companyName = (id: string) => companies.find(c => c.id === id)?.razaoSocial ?? '—';

  return (
    <div className="p-6 lg:p-8 xl:p-10 pb-24">
      <div className="page-header mb-8">
        <div className="flex justify-between items-center relative z-10">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Unidades</h1>
            <p className="text-teal-200 text-sm mt-1">Cadastro de unidades por empresa</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <MapPin className="w-4 h-4 text-teal-200" />
            </div>
            <div>
              <p className="text-xl font-bold">{units.length}</p>
              <p className="text-[11px] text-teal-200">unidades</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <div className="xl:col-span-2">
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-base font-semibold text-slate-800 mb-4">
                {editingId ? 'Editar Unidade' : 'Nova Unidade'}
              </h2>
              <div className="space-y-1">
                <FormGroup label="Empresa" required>
                  <Select value={form.companyId} onChange={e => set('companyId', e.target.value)}>
                    <option value="">Selecione a empresa</option>
                    {companies.map(c => <option key={c.id} value={c.id}>{c.razaoSocial}</option>)}
                  </Select>
                </FormGroup>
                <FormGroup label="Nome da Unidade" required>
                  <Input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Ex: Unidade Sede, Filial Norte" />
                </FormGroup>
                <div className="grid grid-cols-2 gap-3">
                  <FormGroup label="Cidade">
                    <Input value={form.city} onChange={e => set('city', e.target.value)} placeholder="Cidade" />
                  </FormGroup>
                  <FormGroup label="UF">
                    <Select value={form.uf} onChange={e => set('uf', e.target.value)}>
                      <option value="">UF</option>
                      {UF_LIST.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                    </Select>
                  </FormGroup>
                </div>
                <FormGroup label="Endereço">
                  <Input value={form.address} onChange={e => set('address', e.target.value)} placeholder="Rua, número, bairro" />
                </FormGroup>
                <FormGroup label="Local de Produção">
                  <Input value={form.productionLocation} onChange={e => set('productionLocation', e.target.value)} placeholder="Ex: Galpão A, Setor Administrativo" />
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
              <h2 className="text-base font-semibold text-slate-800 mb-4">Unidades Cadastradas</h2>
              {units.length === 0 ? (
                <div className="empty-state !py-10">
                  <MapPin className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                  <p className="text-slate-400 text-sm">Nenhuma unidade cadastrada.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {units.map(u => (
                    <div key={u.id} className="border border-slate-200 rounded-xl p-4 flex justify-between items-start hover:border-slate-300 transition-colors bg-white">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-slate-800 text-sm">{u.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{companyName(u.companyId)}</p>
                        {(u.city || u.uf) && (
                          <span className="stat-badge !text-[11px] !px-2 !py-0.5 mt-1.5 inline-block">
                            {[u.city, u.uf].filter(Boolean).join(' / ')}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-1 ml-3 shrink-0">
                        <Button variant="ghost" size="sm" className="!rounded-lg" onClick={() => handleEdit(u)}>
                          <Edit className="w-4 h-4 text-slate-400" />
                        </Button>
                        <Button variant="ghost" size="sm" className="!rounded-lg" onClick={() => deleteUnit(u.id)}>
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
