import React, { useState } from 'react';
import { useAET } from '../../context/AETContext';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { FormGroup, Input, Textarea, Select } from '../../components/ui/Forms';
import { Company } from '../../types';
import { Building2, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';

const EMPTY: Omit<Company, 'id'> = {
  razaoSocial: '', nomeFantasia: '', cnpj: '', address: '', product: '',
  riskDegree: '', logoDataUrl: '', active: true,
};

export const Companies = () => {
  const { companies, addCompany, updateCompany, deleteCompany } = useAET();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Company, 'id'>>(EMPTY);

  const set = (field: keyof Omit<Company, 'id'>, value: any) =>
    setForm(f => ({ ...f, [field]: value }));

  const handleSave = async () => {
    if (!form.razaoSocial.trim()) return;
    if (editingId) await updateCompany(editingId, form);
    else await addCompany(form);
    setEditingId(null);
    setForm(EMPTY);
  };

  const handleEdit = (c: Company) => { setEditingId(c.id); setForm({ ...c }); };
  const handleCancel = () => { setEditingId(null); setForm(EMPTY); };

  return (
    <div className="p-6 lg:p-8 xl:p-10 pb-24">
      <div className="page-header mb-8">
        <div className="flex justify-between items-center relative z-10">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Empresas</h1>
            <p className="text-teal-200 text-sm mt-1">Cadastro de empresas clientes</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-teal-200" />
            </div>
            <div>
              <p className="text-xl font-bold">{companies.length}</p>
              <p className="text-[11px] text-teal-200">empresas</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <div className="xl:col-span-2">
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-base font-semibold text-slate-800 mb-4">
                {editingId ? 'Editar Empresa' : 'Nova Empresa'}
              </h2>
              <div className="space-y-1">
                <FormGroup label="Razão Social" required>
                  <Input value={form.razaoSocial} onChange={e => set('razaoSocial', e.target.value)} placeholder="Razão Social Ltda" />
                </FormGroup>
                <FormGroup label="Nome Fantasia">
                  <Input value={form.nomeFantasia} onChange={e => set('nomeFantasia', e.target.value)} placeholder="Nome Fantasia" />
                </FormGroup>
                <FormGroup label="CNPJ">
                  <Input value={form.cnpj} onChange={e => set('cnpj', e.target.value)} placeholder="00.000.000/0000-00" />
                </FormGroup>
                <FormGroup label="Endereço">
                  <Input value={form.address} onChange={e => set('address', e.target.value)} placeholder="Rua, número, bairro, cidade/UF" />
                </FormGroup>
                <FormGroup label="Produto / Atividade">
                  <Input value={form.product} onChange={e => set('product', e.target.value)} placeholder="Descreva o produto ou atividade principal" />
                </FormGroup>
                <FormGroup label="Grau de Risco">
                  <Select value={form.riskDegree} onChange={e => set('riskDegree', e.target.value)}>
                    <option value="">Selecione</option>
                    <option value="1">Grau 1</option>
                    <option value="2">Grau 2</option>
                    <option value="3">Grau 3</option>
                    <option value="4">Grau 4</option>
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
              <h2 className="text-base font-semibold text-slate-800 mb-4">Empresas Cadastradas</h2>
              {companies.length === 0 ? (
                <div className="empty-state !py-10">
                  <Building2 className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                  <p className="text-slate-400 text-sm">Nenhuma empresa cadastrada.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {companies.map(c => (
                    <div key={c.id} className="border border-slate-200 rounded-xl p-4 flex justify-between items-start hover:border-slate-300 transition-colors bg-white">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-slate-800 text-sm">{c.razaoSocial}</p>
                          {c.active
                            ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            : <XCircle className="w-3.5 h-3.5 text-slate-300 shrink-0" />}
                        </div>
                        {c.nomeFantasia && <p className="text-xs text-slate-500 mt-0.5">{c.nomeFantasia}</p>}
                        <div className="flex flex-wrap gap-2 mt-1.5">
                          {c.cnpj && <span className="stat-badge !text-[11px] !px-2 !py-0.5">{c.cnpj}</span>}
                          {c.riskDegree && <span className="stat-badge !text-[11px] !px-2 !py-0.5">Grau {c.riskDegree}</span>}
                        </div>
                      </div>
                      <div className="flex gap-1 ml-3 shrink-0">
                        <Button variant="ghost" size="sm" className="!rounded-lg" onClick={() => handleEdit(c)}>
                          <Edit className="w-4 h-4 text-slate-400" />
                        </Button>
                        <Button variant="ghost" size="sm" className="!rounded-lg" onClick={() => deleteCompany(c.id)}>
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
