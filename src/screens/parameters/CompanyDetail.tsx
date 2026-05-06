import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAET } from '../../context/AETContext';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { FormGroup, Input, Textarea, Select } from '../../components/ui/Forms';
import { Company, Unit, Sector, StandardJobRole } from '../../types';
import {
  Building2, MapPin, Layers, Briefcase,
  Edit, Trash2, ChevronLeft, CheckCircle, XCircle, Save, X,
  List, GitBranch, Plus, Shield, Wrench,
} from 'lucide-react';

// ── CatalogMultiSelect (reutilizado em FuncoesTab) ────────────────────────────

interface CatalogItem { id: string; name: string; active: boolean; }

function CatalogMultiSelect({
  label, icon, items, selectedIds, onChange,
}: {
  label: string;
  icon: React.ReactNode;
  items: CatalogItem[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const active = items.filter(i => i.active);
  const filtered = active.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));
  const selectedItems = items.filter(i => selectedIds.includes(i.id));
  const toggle = (id: string) =>
    onChange(selectedIds.includes(id) ? selectedIds.filter(x => x !== id) : [...selectedIds, id]);

  return (
    <FormGroup label={label}>
      {selectedItems.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {selectedItems.map(item => (
            <span key={item.id} className="inline-flex items-center gap-1 px-2.5 py-1 bg-teal-50 border border-teal-200 rounded-lg text-xs text-teal-700 font-medium">
              {item.name}
              <button type="button" onClick={() => toggle(item.id)} className="hover:text-teal-900 leading-none">×</button>
            </span>
          ))}
        </div>
      )}
      <div ref={ref} className="relative">
        <button
          type="button"
          onClick={() => { setOpen(o => !o); setSearch(''); }}
          className="w-full flex items-center justify-between px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-500 hover:border-teal-400 hover:text-teal-600 transition-colors bg-white"
        >
          <span className="flex items-center gap-2">{icon} Selecionar {label.toLowerCase()}...</span>
          <Plus className="w-4 h-4" />
        </button>
        {open && (
          <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
            <div className="p-2 border-b border-slate-100">
              <input
                autoFocus
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Pesquisar..."
                className="w-full px-2.5 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-teal-400"
              />
            </div>
            <ul className="max-h-44 overflow-y-auto">
              {filtered.length === 0 && <li className="px-3 py-2 text-xs text-slate-400">Nenhum item encontrado.</li>}
              {filtered.map(item => {
                const isSel = selectedIds.includes(item.id);
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => toggle(item.id)}
                      className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 transition-colors ${isSel ? 'bg-teal-50 text-teal-700' : 'text-slate-700 hover:bg-slate-50'}`}
                    >
                      <span className={`w-4 h-4 shrink-0 rounded border flex items-center justify-center text-xs ${isSel ? 'bg-teal-500 border-teal-500 text-white' : 'border-slate-300'}`}>
                        {isSel && '✓'}
                      </span>
                      {item.name}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </FormGroup>
  );
}

const UF_LIST = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];

type Tab = 'dados' | 'unidades' | 'setores' | 'funcoes';

// ── Dados da Empresa ─────────────────────────────────────────────────────────

const CompanyForm: React.FC<{ company: Company; onSave: (data: Omit<Company, 'id'>) => void }> = ({ company, onSave }) => {
  const [form, setForm] = useState<Omit<Company, 'id'>>({ ...company });
  const [editing, setEditing] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [cepError, setCepError] = useState('');
  const set = (field: keyof Omit<Company, 'id'>, value: any) => setForm(f => ({ ...f, [field]: value }));

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
        municipio: data.localidade || f.municipio,
        uf: data.uf || f.uf
      }));
    } finally {
      setCepLoading(false);
    }
  };

  const handleSave = () => { 
    const missing: string[] = [];
    if (!form.razaoSocial.trim()) missing.push('Razão Social');
    if (!form.cnpj.trim()) missing.push('CNPJ');

    if (missing.length > 0) {
      alert(`Por favor, preencha os campos obrigatórios:\n- ${missing.join('\n- ')}`);
      return;
    }

    onSave(form); 
    setEditing(false); 
  };
  const handleCancel = () => { setForm({ ...company }); setEditing(false); };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-base font-semibold text-slate-800">Dados da Empresa</h2>
          {!editing
            ? <Button variant="ghost" size="sm" onClick={() => setEditing(true)}><Edit className="w-4 h-4 mr-1.5" />Editar</Button>
            : (
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={handleCancel}><X className="w-4 h-4 mr-1" />Cancelar</Button>
                <Button size="sm" onClick={handleSave}><Save className="w-4 h-4 mr-1.5" />Salvar</Button>
              </div>
            )
          }
        </div>

        {!editing ? (
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <DataItem label="Razão Social" value={company.razaoSocial} />
            <DataItem label="Logo" value={company.logoDataUrl ? <img src={company.logoDataUrl} alt="Logo" className="w-12 h-12 object-contain border border-slate-200 rounded-lg bg-slate-50 mt-1" /> : ''} />
            <DataItem label="Nome Fantasia" value={company.nomeFantasia} />
            <DataItem label="CNPJ" value={company.cnpj} />
            <DataItem label="Logradouro" value={[company.logradouro, company.numero].filter(Boolean).join(', ')} />
            <DataItem label="Complemento" value={company.complemento} />
            <DataItem label="Bairro" value={company.bairro} />
            <DataItem label="Município / UF" value={[company.municipio, company.uf].filter(Boolean).join(' / ')} />
            <DataItem label="CEP" value={company.cep} />
            <DataItem label="Produto / Atividade" value={company.product} />
            <DataItem label="Situação de Mercado" value={company.marketSituation} />
            <DataItem label="Local de Produção" value={company.productionLocation} />
            <DataItem label="Grau de Risco" value={company.riskDegree ? `Grau ${company.riskDegree}` : ''} />
            <DataItem label="Status" value={company.active ? 'Ativo' : 'Inativo'} />
          </dl>
        ) : (
          <div className="space-y-1">
            <FormGroup label="Logo da Empresa">
              <div className="flex items-center gap-4">
                {form.logoDataUrl && (
                  <img src={form.logoDataUrl} alt="Logo" className="w-12 h-12 object-contain border border-slate-200 rounded-lg bg-slate-50 shrink-0" />
                )}
                <div className="flex-1">
                  <Input 
                    type="file" 
                    accept="image/*"
                    className="!p-1.5 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 cursor-pointer text-xs"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          set('logoDataUrl', reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  {form.logoDataUrl && (
                    <button 
                      type="button" 
                      onClick={() => set('logoDataUrl', '')}
                      className="text-xs text-red-500 mt-1.5 hover:underline block"
                    >
                      Remover Logo
                    </button>
                  )}
                </div>
              </div>
            </FormGroup>
            <FormGroup label="Razão Social" required>
              <Input value={form.razaoSocial} onChange={e => set('razaoSocial', e.target.value)} />
            </FormGroup>
            <FormGroup label="Nome Fantasia">
              <Input value={form.nomeFantasia} onChange={e => set('nomeFantasia', e.target.value)} />
            </FormGroup>
            <FormGroup label="CNPJ" required>
              <Input value={form.cnpj} onChange={e => set('cnpj', e.target.value)} placeholder="00.000.000/0000-00" />
            </FormGroup>
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
            <div className="grid grid-cols-3 gap-2">
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
            <div className="grid grid-cols-3 gap-2">
              <FormGroup label="Município">
                <Input value={form.municipio} onChange={e => set('municipio', e.target.value)} placeholder="Cidade" />
              </FormGroup>
              <FormGroup label="UF">
                <Select value={form.uf} onChange={e => set('uf', e.target.value)}>
                  <option value="">UF</option>
                  {UF_LIST.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                </Select>
              </FormGroup>
            </div>

            <FormGroup label="Produto / Atividade">
              <Input value={form.product} onChange={e => set('product', e.target.value)} />
            </FormGroup>
            <FormGroup label="Situação de Mercado">
              <Input value={form.marketSituation} onChange={e => set('marketSituation', e.target.value)} placeholder="Ex: Empresa fornecedora com demanda crescente" />
            </FormGroup>
            <FormGroup label="Local de Produção">
              <Input value={form.productionLocation} onChange={e => set('productionLocation', e.target.value)} placeholder="Ex: Galpão principal – Linha 1" />
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
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const DataItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div>
    <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</dt>
    <dd className="mt-0.5 text-slate-700">{value || <span className="text-slate-300 italic">—</span>}</dd>
  </div>
);

// ── Unidades ─────────────────────────────────────────────────────────────────

// ── CityAutocomplete ─────────────────────────────────────────────────────────

const CityAutocomplete: React.FC<{
  cities: string[];
  value: string;
  loading: boolean;
  disabled: boolean;
  onChange: (city: string) => void;
}> = ({ cities, value, loading, disabled, onChange }) => {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => { setQuery(value); }, [value]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = query.trim()
    ? cities.filter(c => c.toLowerCase().includes(query.toLowerCase()))
    : cities;

  const handleSelect = (city: string) => { onChange(city); setQuery(city); setOpen(false); };

  const placeholder = loading ? 'Carregando...' : disabled ? 'Selecione a UF' : 'Pesquisar cidade...';

  return (
    <div ref={ref} className="relative">
      <input
        className="flex h-9 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
        value={query}
        placeholder={placeholder}
        disabled={disabled || loading}
        onChange={e => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => { if (!disabled && !loading) setOpen(true); }}
      />
      {open && filtered.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full max-h-52 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg text-sm">
          {filtered.map(c => (
            <li
              key={c}
              className={`px-3 py-2 cursor-pointer hover:bg-teal-50 hover:text-teal-700 ${c === value ? 'bg-teal-50 text-teal-700 font-medium' : 'text-slate-700'}`}
              onMouseDown={() => handleSelect(c)}
            >
              {c}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const EMPTY_UNIT: Omit<Unit, 'id'> = {
  companyId: '', name: '',
  cep: '', logradouro: '', numero: '', complemento: '', bairro: '',
  city: '', uf: '', address: '', productionLocation: '', logoDataUrl: '',
};

type IbgeMunicipio = { id: number; nome: string };

async function fetchMunicipios(uf: string): Promise<string[]> {
  if (!uf) return [];
  const res = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios?orderBy=nome`);
  const data: IbgeMunicipio[] = await res.json();
  return data.map(m => m.nome);
}

async function fetchCep(cep: string): Promise<{ logradouro: string; bairro: string; localidade: string; uf: string; erro?: boolean } | null> {
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

const UnitsTab: React.FC<{ companyId: string; company: Company }> = ({ companyId, company }) => {
  const { units, addUnit, updateUnit, deleteUnit } = useAET();
  const companyUnits = units.filter(u => u.companyId === companyId);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Unit, 'id'>>({ ...EMPTY_UNIT, companyId });
  const [cities, setCities] = useState<string[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);
  const [cepError, setCepError] = useState('');
  const [copyAddress, setCopyAddress] = useState(false);
  const set = (field: keyof Omit<Unit, 'id'>, value: string) => setForm(f => ({ ...f, [field]: value }));

  const loadCities = async (uf: string) => {
    if (!uf) { setCities([]); return; }
    setLoadingCities(true);
    try { setCities(await fetchMunicipios(uf)); } finally { setLoadingCities(false); }
  };

  const handleCopyCompanyAddress = async () => {
    const uf = company.uf;
    setForm(f => ({ ...f, cep: company.cep || '', logradouro: company.logradouro || '', numero: company.numero || '', complemento: company.complemento || '', bairro: company.bairro || '', city: company.municipio || '', uf }));
    setCepError('');
    if (uf) await loadCities(uf);
  };

  const handleUfChange = async (uf: string) => {
    setForm(f => ({ ...f, uf, city: '' }));
    await loadCities(uf);
  };

  const handleCepChange = async (raw: string) => {
    const masked = raw.replace(/\D/g, '').replace(/^(\d{5})(\d)/, '$1-$2').slice(0, 9);
    setCepError('');
    setForm(f => ({ ...f, cep: masked }));
    const digits = masked.replace(/\D/g, '');
    if (digits.length !== 8) return;
    setLoadingCep(true);
    try {
      const data = await fetchCep(digits);
      if (!data) { setCepError('CEP não encontrado.'); return; }
      setForm(f => ({ ...f, logradouro: data.logradouro || f.logradouro, bairro: data.bairro || f.bairro, city: data.localidade, uf: data.uf }));
      await loadCities(data.uf);
    } finally {
      setLoadingCep(false);
    }
  };

  const openNew = () => { setEditingId(null); setForm({ ...EMPTY_UNIT, companyId }); setCities([]); setCepError(''); setCopyAddress(false); setModalOpen(true); };
  const openEdit = async (u: Unit) => { setEditingId(u.id); setForm({ ...u }); setCepError(''); setCopyAddress(false); if (u.uf) await loadCities(u.uf); setModalOpen(true); };
  const handleClose = () => { setModalOpen(false); setEditingId(null); setForm({ ...EMPTY_UNIT, companyId }); setCities([]); setCepError(''); setCopyAddress(false); };

  const handleSave = async () => {
    const missing: string[] = [];
    if (!form.name.trim()) missing.push('Nome da Unidade');

    if (missing.length > 0) {
      alert(`Por favor, preencha os campos obrigatórios:\n- ${missing.join('\n- ')}`);
      return;
    }

    if (editingId) await updateUnit(editingId, form);
    else await addUnit({ ...form, companyId });
    handleClose();
  };

  return (
    <>
      <Modal open={modalOpen} onClose={handleClose} title={editingId ? 'Editar Unidade' : 'Nova Unidade'}>
        <div className="space-y-2">
          <FormGroup label="Nome da Unidade" required>
            <Input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Ex: Unidade Sede, Filial Norte" />
          </FormGroup>

          <div className="flex items-center gap-2 mb-2">
            <input
              type="checkbox"
              id="copyCompanyAddressModal"
              className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer w-4 h-4"
              checked={copyAddress}
              onChange={(e) => {
                const checked = e.target.checked;
                setCopyAddress(checked);
                if (checked) {
                  if (!company.logradouro && !company.municipio) {
                    alert('A empresa não possui endereço cadastrado.');
                    setCopyAddress(false);
                    return;
                  }
                  handleCopyCompanyAddress();
                } else {
                  setForm(f => ({ ...f, cep: '', logradouro: '', numero: '', complemento: '', bairro: '', city: '', uf: '' }));
                  setCities([]); 
                  setCepError('');
                }
              }}
            />
            <label htmlFor="copyCompanyAddressModal" className="text-[13px] font-medium text-slate-600 cursor-pointer">
              Repetir endereço da empresa
            </label>
          </div>

          <FormGroup label="CEP">
            <div className="relative">
              <Input value={form.cep} onChange={e => handleCepChange(e.target.value)} placeholder="00000-000" maxLength={9} className={cepError ? 'border-red-400 focus:ring-red-300' : ''} />
              {loadingCep && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 animate-pulse">buscando...</span>}
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
              <Select value={form.uf} onChange={e => handleUfChange(e.target.value)}>
                <option value="">UF</option>
                {UF_LIST.map(uf => <option key={uf} value={uf}>{uf}</option>)}
              </Select>
            </FormGroup>
            <FormGroup label="Cidade">
              <CityAutocomplete cities={cities} value={form.city} loading={loadingCities} disabled={!form.uf} onChange={city => set('city', city)} />
            </FormGroup>
          </div>

          <FormGroup label="Local de Produção">
            <Input value={form.productionLocation} onChange={e => set('productionLocation', e.target.value)} placeholder="Ex: Galpão A, Setor Administrativo" />
          </FormGroup>

          <div className="flex justify-end gap-2 pt-3">
            <Button variant="ghost" onClick={handleClose}>Cancelar</Button>
            <Button onClick={handleSave}>{editingId ? 'Atualizar' : 'Adicionar'}</Button>
          </div>
        </div>
      </Modal>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-slate-800">Unidades Cadastradas</h2>
            <Button size="sm" onClick={openNew}>+ Nova Unidade</Button>
          </div>
          {companyUnits.length === 0 ? (
            <div className="empty-state !py-10">
              <MapPin className="w-10 h-10 mx-auto text-slate-300 mb-3" />
              <p className="text-slate-400 text-sm">Nenhuma unidade cadastrada para esta empresa.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {companyUnits.map(u => (
                <div key={u.id} className="border border-slate-200 rounded-xl p-4 flex justify-between items-start hover:border-slate-300 transition-colors bg-white">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-800 text-sm">{u.name}</p>
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
                    <Button variant="ghost" size="sm" className="!rounded-lg" onClick={() => openEdit(u)}>
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
    </>

  );
};

// ── Setores ──────────────────────────────────────────────────────────────────

const EMPTY_SECTOR: Omit<Sector, 'id'> = { companyId: '', unitId: '', name: '', description: '', active: true };

const SetoresTab: React.FC<{ companyId: string }> = ({ companyId }) => {
  const { sectors, addSector, updateSector, deleteSector, units } = useAET();
  const companyUnits = units.filter(u => u.companyId === companyId);
  const companySectors = sectors.filter(s => s.companyId === companyId);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Sector, 'id'>>({ ...EMPTY_SECTOR, companyId });
  const set = (field: keyof Omit<Sector, 'id'>, value: any) => setForm(f => ({ ...f, [field]: value }));
  const unitName = (id: string) => units.find(u => u.id === id)?.name ?? '—';

  const openNew = () => { setEditingId(null); setForm({ ...EMPTY_SECTOR, companyId }); setModalOpen(true); };
  const openEdit = (s: Sector) => { setEditingId(s.id); setForm({ ...s }); setModalOpen(true); };
  const handleClose = () => { setModalOpen(false); setEditingId(null); setForm({ ...EMPTY_SECTOR, companyId }); };

  const handleSave = async () => {
    const missing: string[] = [];
    if (!form.name.trim()) missing.push('Nome do Setor');

    if (missing.length > 0) {
      alert(`Por favor, preencha os campos obrigatórios:\n- ${missing.join('\n- ')}`);
      return;
    }

    if (editingId) await updateSector(editingId, form);
    else await addSector({ ...form, companyId });
    handleClose();
  };

  return (
    <>
      <Modal open={modalOpen} onClose={handleClose} title={editingId ? 'Editar Setor' : 'Novo Setor'}>
        <div className="space-y-2">
          <FormGroup label="Unidade">
            <Select value={form.unitId} onChange={e => set('unitId', e.target.value)}>
              <option value="">Selecione a unidade</option>
              {companyUnits.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
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
          <div className="flex justify-end gap-2 pt-3">
            <Button variant="ghost" onClick={handleClose}>Cancelar</Button>
            <Button onClick={handleSave}>{editingId ? 'Atualizar' : 'Adicionar'}</Button>
          </div>
        </div>
      </Modal>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-slate-800">Setores Cadastrados</h2>
            <Button size="sm" onClick={openNew}>+ Novo Setor</Button>
          </div>
          {companySectors.length === 0 ? (
            <div className="empty-state !py-10">
              <Layers className="w-10 h-10 mx-auto text-slate-300 mb-3" />
              <p className="text-slate-400 text-sm">Nenhum setor cadastrado para esta empresa.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {companySectors.map(s => (
                <div key={s.id} className="border border-slate-200 rounded-xl p-4 flex justify-between items-start hover:border-slate-300 transition-colors bg-white">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-slate-800 text-sm">{s.name}</p>
                      {s.active ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> : <XCircle className="w-3.5 h-3.5 text-slate-300 shrink-0" />}
                    </div>
                    {s.unitId && <p className="text-xs text-slate-500 mt-0.5">{unitName(s.unitId)}</p>}
                    {s.description && <p className="text-xs text-slate-400 mt-1 line-clamp-1">{s.description}</p>}
                  </div>
                  <div className="flex gap-1 ml-3 shrink-0">
                    <Button variant="ghost" size="sm" className="!rounded-lg" onClick={() => openEdit(s)}>
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
    </>
  );
};

// ── OrgChart ─────────────────────────────────────────────────────────────────

interface RoleNode extends StandardJobRole {
  children: RoleNode[];
}

function buildTree(roles: StandardJobRole[]): RoleNode[] {
  const map = new Map<string, RoleNode>();
  roles.forEach(r => map.set(r.id, { ...r, children: [] }));
  const roots: RoleNode[] = [];
  map.forEach(node => {
    if (node.parentRoleId && map.has(node.parentRoleId)) {
      map.get(node.parentRoleId)!.children.push(node);
    } else {
      roots.push(node);
    }
  });
  return roots;
}

const OrgNode: React.FC<{
  node: RoleNode;
  sectorName: (id: string) => string;
  onEdit: (r: StandardJobRole) => void;
  onDelete: (id: string) => void;
  isLast: boolean;
}> = ({ node, sectorName, onEdit, onDelete, isLast }) => (
  <div className="flex flex-col items-start">
    {/* connector vertical */}
    <div className="flex items-start">
      {/* card */}
      <div className="group relative bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm hover:border-teal-300 hover:shadow-md transition-all min-w-[180px] max-w-[240px]">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-semibold text-slate-800 text-sm leading-snug">{node.name}</p>
            {node.cbo && <p className="text-[11px] text-slate-400 mt-0.5">CBO {node.cbo}</p>}
            {node.sectorId && (
              <span className="inline-block mt-1 text-[10px] font-medium bg-violet-50 text-violet-600 border border-violet-200 rounded-full px-2 py-0.5">
                {sectorName(node.sectorId)}
              </span>
            )}
          </div>
          <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <button onClick={() => onEdit(node)} className="p-1 rounded-md hover:bg-slate-100">
              <Edit className="w-3.5 h-3.5 text-slate-400" />
            </button>
            <button onClick={() => onDelete(node.id)} className="p-1 rounded-md hover:bg-red-50">
              <Trash2 className="w-3.5 h-3.5 text-red-400" />
            </button>
          </div>
        </div>
        {!node.active && <XCircle className="absolute -top-1.5 -right-1.5 w-4 h-4 text-slate-300 bg-white rounded-full" />}
      </div>
    </div>

    {/* children */}
    {node.children.length > 0 && (
      <div className="ml-6 mt-0 flex flex-col">
        {node.children.map((child, i) => (
          <div key={child.id} className="flex items-start">
            {/* L-shaped connector */}
            <div className="flex flex-col items-center mr-0" style={{ width: 24 }}>
              <div className="w-px bg-slate-200" style={{ height: 20 }} />
              <div className="flex items-center w-full">
                <div className="w-px bg-slate-200" style={{ height: i === node.children.length - 1 ? 12 : '100%', alignSelf: 'flex-start' }} />
                <div className="h-px bg-slate-200 flex-1" />
              </div>
              {i < node.children.length - 1 && <div className="w-px bg-slate-200 flex-1" />}
            </div>
            <div className="mt-4 mb-2">
              <OrgNode node={child} sectorName={sectorName} onEdit={onEdit} onDelete={onDelete} isLast={i === node.children.length - 1} />
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

const OrgChart: React.FC<{
  roles: StandardJobRole[];
  sectorName: (id: string) => string;
  onEdit: (r: StandardJobRole) => void;
  onDelete: (id: string) => void;
}> = ({ roles, sectorName, onEdit, onDelete }) => {
  const trees = buildTree(roles);

  if (roles.length === 0) return (
    <div className="empty-state !py-10">
      <Briefcase className="w-10 h-10 mx-auto text-slate-300 mb-3" />
      <p className="text-slate-400 text-sm">Nenhuma função cadastrada para esta empresa.</p>
    </div>
  );

  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex flex-wrap gap-8 p-4">
        {trees.map((root, i) => (
          <OrgNode key={root.id} node={root} sectorName={sectorName} onEdit={onEdit} onDelete={onDelete} isLast={i === trees.length - 1} />
        ))}
      </div>
    </div>
  );
};

// ── Funções Padrão ───────────────────────────────────────────────────────────

const EMPTY_ROLE: Omit<StandardJobRole, 'id'> = { companyId: '', sectorId: '', parentRoleId: '', name: '', cbo: '', description: '', active: true, epiIds: [], equipmentIds: [] };

const FuncoesTab: React.FC<{ companyId: string }> = ({ companyId }) => {
  const { jobRoles, addJobRole, updateJobRole, deleteJobRole, sectors, epis, equipment } = useAET();
  const companyRoles = jobRoles.filter(r => r.companyId === companyId);
  const companySectors = sectors.filter(s => s.companyId === companyId);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<StandardJobRole, 'id'>>({ ...EMPTY_ROLE, companyId });
  const [viewMode, setViewMode] = useState<'list' | 'org'>('list');
  const set = (field: keyof Omit<StandardJobRole, 'id'>, value: any) => setForm(f => ({ ...f, [field]: value }));

  const openNew = () => { setEditingId(null); setForm({ ...EMPTY_ROLE, companyId }); setModalOpen(true); };
  const openEdit = (r: StandardJobRole) => { setEditingId(r.id); setForm({ ...r, epiIds: r.epiIds ?? [], equipmentIds: r.equipmentIds ?? [] }); setModalOpen(true); };
  const handleClose = () => { setModalOpen(false); setEditingId(null); setForm({ ...EMPTY_ROLE, companyId }); };

  const handleSave = async () => {
    const missing: string[] = [];
    if (!form.name.trim()) missing.push('Nome da Função');

    if (missing.length > 0) {
      alert(`Por favor, preencha os campos obrigatórios:\n- ${missing.join('\n- ')}`);
      return;
    }

    if (editingId) await updateJobRole(editingId, form);
    else await addJobRole({ ...form, companyId });
    handleClose();
  };

  const sectorName = (id: string) => companySectors.find(s => s.id === id)?.name ?? '—';
  const roleName = (id: string) => companyRoles.find(r => r.id === id)?.name ?? '—';
  const parentOptions = companyRoles.filter(r => {
    if (r.id === editingId) return false;
    if (form.sectorId) return r.sectorId === form.sectorId;
    return true;
  });

  const ancestorChain = (roleId: string): string[] => {
    const chain: string[] = [];
    let current = companyRoles.find(r => r.id === roleId);
    const visited = new Set<string>();
    while (current?.parentRoleId && !visited.has(current.parentRoleId)) {
      visited.add(current.parentRoleId);
      const parent = companyRoles.find(r => r.id === current!.parentRoleId);
      if (!parent) break;
      chain.unshift(parent.name);
      current = parent;
    }
    return chain;
  };

  return (
    <>
      <Modal open={modalOpen} onClose={handleClose} title={editingId ? 'Editar Função' : 'Nova Função'}>
        <div className="space-y-2">
          <FormGroup label="Nome da Função" required>
            <Input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Ex: Operador de Produção" />
          </FormGroup>
          <FormGroup label="CBO">
            <Input value={form.cbo} onChange={e => set('cbo', e.target.value)} placeholder="Código CBO (opcional)" />
          </FormGroup>
          <div className="grid grid-cols-2 gap-3">
            <FormGroup label="Setor">
              <Select value={form.sectorId} onChange={e => {
                const newSectorId = e.target.value;
                setForm(f => {
                  const updated = { ...f, sectorId: newSectorId };
                  if (f.parentRoleId) {
                    const parentRole = companyRoles.find(r => r.id === f.parentRoleId);
                    if (parentRole && newSectorId && parentRole.sectorId !== newSectorId) {
                      updated.parentRoleId = '';
                    }
                  }
                  return updated;
                });
              }}>
                <option value="">Nenhum</option>
                {companySectors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </Select>
            </FormGroup>
            <FormGroup label="Subordinada a">
              <Select value={form.parentRoleId} onChange={e => set('parentRoleId', e.target.value)}>
                <option value="">Nenhuma</option>
                {parentOptions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </Select>
            </FormGroup>
          </div>
          <FormGroup label="Descrição Padrão">
            <Textarea value={form.description} onChange={e => set('description', e.target.value)} placeholder="Descreva resumidamente as atribuições da função" />
          </FormGroup>

          <CatalogMultiSelect
            label="EPIs vinculados"
            icon={<Shield className="w-3.5 h-3.5" />}
            items={epis}
            selectedIds={form.epiIds ?? []}
            onChange={ids => set('epiIds', ids)}
          />

          <CatalogMultiSelect
            label="Equipamentos vinculados"
            icon={<Wrench className="w-3.5 h-3.5" />}
            items={equipment}
            selectedIds={form.equipmentIds ?? []}
            onChange={ids => set('equipmentIds', ids)}
          />

          <FormGroup label="Status">
            <Select value={form.active ? 'true' : 'false'} onChange={e => set('active', e.target.value === 'true')}>
              <option value="true">Ativo</option>
              <option value="false">Inativo</option>
            </Select>
          </FormGroup>
          <div className="flex justify-end gap-2 pt-3">
            <Button variant="ghost" onClick={handleClose}>Cancelar</Button>
            <Button onClick={handleSave}>{editingId ? 'Atualizar' : 'Adicionar'}</Button>
          </div>
        </div>
      </Modal>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-slate-800">Funções Cadastradas</h2>
            <div className="flex items-center gap-2">
              {/* view toggle */}
              <div className="flex items-center bg-slate-100 rounded-lg p-0.5 gap-0.5">
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${viewMode === 'list' ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <List className="w-3.5 h-3.5" />Lista
                </button>
                <button
                  onClick={() => setViewMode('org')}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${viewMode === 'org' ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <GitBranch className="w-3.5 h-3.5" />Organograma
                </button>
              </div>
              <Button size="sm" onClick={openNew}>+ Nova Função</Button>
            </div>
          </div>

          {viewMode === 'list' ? (
            companyRoles.length === 0 ? (
              <div className="empty-state !py-10">
                <Briefcase className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                <p className="text-slate-400 text-sm">Nenhuma função cadastrada para esta empresa.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {companyRoles.map(r => (
                  <div key={r.id} className="border border-slate-200 rounded-xl p-4 flex justify-between items-start hover:border-slate-300 transition-colors bg-white">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-slate-800 text-sm">{r.name}</p>
                        {r.active ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> : <XCircle className="w-3.5 h-3.5 text-slate-300 shrink-0" />}
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {r.cbo && <span className="stat-badge !text-[11px] !px-2 !py-0.5">CBO {r.cbo}</span>}
                        {r.sectorId && <span className="stat-badge !text-[11px] !px-2 !py-0.5 !bg-violet-50 !text-violet-600 !border-violet-200">{sectorName(r.sectorId)}</span>}
                        {r.parentRoleId && (() => { const chain = ancestorChain(r.id); return chain.length > 0 && <span className="stat-badge !text-[11px] !px-2 !py-0.5 !bg-amber-50 !text-amber-600 !border-amber-200">↳ {chain.join(' › ')}</span>; })()}
                      </div>
                      {r.description && <p className="text-xs text-slate-400 mt-1 line-clamp-2">{r.description}</p>}
                      {((r.epiIds?.length ?? 0) > 0 || (r.equipmentIds?.length ?? 0) > 0) && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {(r.epiIds ?? []).map(id => { const e = epis.find(x => x.id === id); return e ? (
                            <span key={id} className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 border border-amber-200 rounded text-[11px] text-amber-700">
                              <Shield className="w-2.5 h-2.5" />{e.name}
                            </span>
                          ) : null; })}
                          {(r.equipmentIds ?? []).map(id => { const e = equipment.find(x => x.id === id); return e ? (
                            <span key={id} className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 border border-blue-200 rounded text-[11px] text-blue-700">
                              <Wrench className="w-2.5 h-2.5" />{e.name}
                            </span>
                          ) : null; })}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1 ml-3 shrink-0">
                      <Button variant="ghost" size="sm" className="!rounded-lg" onClick={() => openEdit(r)}>
                        <Edit className="w-4 h-4 text-slate-400" />
                      </Button>
                      <Button variant="ghost" size="sm" className="!rounded-lg" onClick={() => deleteJobRole(r.id)}>
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            <OrgChart roles={companyRoles} sectorName={sectorName} onEdit={openEdit} onDelete={deleteJobRole} />
          )}
        </CardContent>
      </Card>
    </>
  );
};

// ── CompanyDetail (página principal) ─────────────────────────────────────────

export const CompanyDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { companies, updateCompany } = useAET();
  const [activeTab, setActiveTab] = useState<Tab>('dados');

  const company = companies.find(c => c.id === id);

  if (!company) {
    return (
      <div className="p-10 text-center text-slate-400">
        <Building2 className="w-12 h-12 mx-auto mb-4 text-slate-300" />
        <p>Empresa não encontrada.</p>
        <Button className="mt-4" variant="ghost" onClick={() => navigate('/parameters/companies')}>
          <ChevronLeft className="w-4 h-4 mr-1" />Voltar
        </Button>
      </div>
    );
  }

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: 'dados', label: 'Dados da Empresa', icon: Building2 },
    { key: 'unidades', label: 'Unidades', icon: MapPin },
    { key: 'setores', label: 'Setores', icon: Layers },
    { key: 'funcoes', label: 'Funções Padrão', icon: Briefcase },
  ];

  return (
    <div className="p-6 lg:p-8 xl:p-10 pb-24">
      {/* Header */}
      <div className="page-header mb-8">
        <div className="flex items-start gap-4 relative z-10">
          <button
            onClick={() => navigate('/parameters/companies')}
            className="mt-1 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-white" />
          </button>
          <div className="flex-1">
            <p className="text-teal-200 text-xs font-medium uppercase tracking-wide mb-1">Empresas / Detalhe</p>
            <h1 className="text-2xl font-bold tracking-tight">{company.razaoSocial}</h1>
            {company.nomeFantasia && <p className="text-teal-200 text-sm mt-0.5">{company.nomeFantasia}</p>}
          </div>
          <div className="flex items-center gap-2">
            {company.active
              ? <span className="flex items-center gap-1.5 text-emerald-300 text-xs font-medium"><CheckCircle className="w-3.5 h-3.5" />Ativa</span>
              : <span className="flex items-center gap-1.5 text-slate-400 text-xs font-medium"><XCircle className="w-3.5 h-3.5" />Inativa</span>
            }
            {company.riskDegree && (
              <span className="bg-white/10 text-white text-xs font-semibold px-3 py-1 rounded-full">
                Grau {company.riskDegree}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-slate-200 overflow-x-auto">
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === t.key
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {activeTab === 'dados' && (
        <CompanyForm
          company={company}
          onSave={data => updateCompany(company.id, data)}
        />
      )}
      {activeTab === 'unidades' && <UnitsTab companyId={company.id} company={company} />}
      {activeTab === 'setores' && <SetoresTab companyId={company.id} />}
      {activeTab === 'funcoes' && <FuncoesTab companyId={company.id} />}
    </div>
  );
};
