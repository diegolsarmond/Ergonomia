import React, { useState } from 'react';
import { useAET } from '../../context/AETContext';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { FormGroup, Input, Select } from '../../components/ui/Forms';
import { Unit } from '../../types';
import { MapPin, Edit, Trash2 } from 'lucide-react';

const UF_LIST = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];

const EMPTY: Omit<Unit, 'id'> = {
  companyId: '', name: '',
  cep: '', logradouro: '', numero: '', complemento: '', bairro: '',
  city: '', uf: '', address: '', productionLocation: '', logoDataUrl: '',
};

async function fetchCep(cep: string) {
  const digits = cep.replace(/\D/g, '');
  if (digits.length !== 8) return null;
  try {
    const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
    const data = await res.json();
    return data.erro ? null : data;
  } catch {
    return null;
  }
}

export const Units = () => {
  const { units, addUnit, updateUnit, deleteUnit, companies } = useAET();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Unit, 'id'>>(EMPTY);
  const [copyAddress, setCopyAddress] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [cepError, setCepError] = useState('');

  const set = (field: keyof Omit<Unit, 'id'>, value: string) =>
    setForm(f => ({ ...f, [field]: value }));

  const handleCepChange = async (raw: string) => {
    const masked = raw.replace(/\D/g, '').replace(/^(\d{5})(\d)/, '$1-$2').slice(0, 9);
    set('cep', masked);
    setCepError('');

    const digits = masked.replace(/\D/g, '');
    if (digits.length !== 8) return;

    setCepLoading(true);
    try {
      const data = await fetchCep(digits);
      if (!data) {
        setCepError('CEP não encontrado.');
        return;
      }
      setForm(f => ({
        ...f,
        logradouro: data.logradouro || f.logradouro,
        bairro: data.bairro || f.bairro,
        city: data.localidade || f.city,
        uf: data.uf || f.uf
      }));
    } finally {
      setCepLoading(false);
    }
  };

  const handleSave = async () => {
    const missing: string[] = [];
    if (!form.companyId) missing.push('Empresa');
    if (!form.name.trim()) missing.push('Nome da Unidade');

    if (missing.length > 0) {
      alert(`Por favor, preencha os campos obrigatórios:\n- ${missing.join('\n- ')}`);
      return;
    }

    if (editingId) await updateUnit(editingId, form);
    else await addUnit(form);
    setEditingId(null);
    setForm(EMPTY);
    setCopyAddress(false);
  };

  const handleEdit = (u: Unit) => { setEditingId(u.id); setForm({ ...u }); setCopyAddress(false); };
  const handleCancel = () => { setEditingId(null); setForm(EMPTY); setCopyAddress(false); };

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
                  <Select 
                    value={form.companyId} 
                    onChange={e => {
                      const newCompanyId = e.target.value;
                      set('companyId', newCompanyId);
                      if (copyAddress && newCompanyId) {
                        const company = companies.find(c => c.id === newCompanyId);
                        if (company) {
                          const addressParts = [
                            company.logradouro,
                            company.numero,
                            company.complemento ? `- ${company.complemento}` : '',
                            company.bairro ? `- ${company.bairro}` : ''
                          ].filter(Boolean).join(' ');
                          setForm(f => ({
                            ...f,
                            companyId: newCompanyId,
                            city: company.municipio || '',
                            uf: company.uf || '',
                            cep: company.cep || '',
                            logradouro: company.logradouro || '',
                            numero: company.numero || '',
                            complemento: company.complemento || '',
                            bairro: company.bairro || '',
                            address: addressParts
                          }));
                        }
                      }
                    }}
                  >
                    <option value="">Selecione a empresa</option>
                    {companies.map(c => <option key={c.id} value={c.id}>{c.razaoSocial}</option>)}
                  </Select>
                </FormGroup>
                <FormGroup label="Nome da Unidade" required>
                  <Input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Ex: Unidade Sede, Filial Norte" />
                </FormGroup>

                <div className="flex items-center gap-2 mb-4 mt-2">
                  <input
                    type="checkbox"
                    id="copyCompanyAddress"
                    className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer w-4 h-4"
                    checked={copyAddress}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setCopyAddress(checked);
                      if (checked && form.companyId) {
                        const company = companies.find(c => c.id === form.companyId);
                        if (company) {
                          const addressParts = [
                            company.logradouro,
                            company.numero,
                            company.complemento ? `- ${company.complemento}` : '',
                            company.bairro ? `- ${company.bairro}` : ''
                          ].filter(Boolean).join(' ');
                          
                          setForm(f => ({
                            ...f,
                            city: company.municipio || '',
                            uf: company.uf || '',
                            cep: company.cep || '',
                            logradouro: company.logradouro || '',
                            numero: company.numero || '',
                            complemento: company.complemento || '',
                            bairro: company.bairro || '',
                            address: addressParts
                          }));
                        }
                      }
                    }}
                  />
                  <label htmlFor="copyCompanyAddress" className="text-[13px] font-medium text-slate-600 cursor-pointer">
                    Repetir endereço da empresa
                  </label>
                </div>

                <FormGroup label="CEP">
                  <div className="relative">
                    <Input 
                      value={form.cep} 
                      onChange={e => handleCepChange(e.target.value)} 
                      placeholder="00000-000" 
                      maxLength={9}
                      className={cepError ? 'border-red-400 focus:ring-red-300' : ''}
                    />
                    {cepLoading && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 animate-pulse">buscando...</span>}
                  </div>
                  {cepError && <p className="text-xs text-red-500 mt-1">{cepError}</p>}
                </FormGroup>
                <FormGroup label="Logradouro">
                  <Input value={form.logradouro} onChange={e => set('logradouro', e.target.value)} placeholder="Rua / Avenida" />
                </FormGroup>
                <div className="grid grid-cols-2 gap-3">
                  <FormGroup label="Número">
                    <Input value={form.numero} onChange={e => set('numero', e.target.value)} placeholder="Nº" />
                  </FormGroup>
                  <FormGroup label="Complemento">
                    <Input value={form.complemento} onChange={e => set('complemento', e.target.value)} placeholder="Apto, Sala..." />
                  </FormGroup>
                </div>
                <FormGroup label="Bairro">
                  <Input value={form.bairro} onChange={e => set('bairro', e.target.value)} placeholder="Bairro" />
                </FormGroup>
                <div className="grid grid-cols-2 gap-3">
                  <FormGroup label="UF">
                    <Select value={form.uf} onChange={e => set('uf', e.target.value)}>
                      <option value="">UF</option>
                      {UF_LIST.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                    </Select>
                  </FormGroup>
                  <FormGroup label="Cidade">
                    <Input value={form.city} onChange={e => set('city', e.target.value)} placeholder="Cidade" />
                  </FormGroup>
                </div>
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
                        {(u.logradouro || u.bairro) && (
                          <p className="text-xs text-slate-500 mt-1">
                            {[u.logradouro, u.numero].filter(Boolean).join(', ')}
                            {u.bairro ? ` — ${u.bairro}` : ''}
                          </p>
                        )}
                        {u.cep && <p className="text-xs text-slate-400">CEP {u.cep}</p>}
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
