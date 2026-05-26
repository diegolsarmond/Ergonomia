import React, { useState, useRef, useEffect } from 'react';
import { Modal } from './ui/Modal';
import { FormGroup, Input, Textarea, Select } from './ui/Forms';
import { OcupacaoAutocomplete } from './OcupacaoAutocomplete';
import { Company, Unit, Sector, StandardJobRole } from '../types';

export const UF_LIST = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];

export type IbgeMunicipio = { id: number; nome: string };

export async function fetchMunicipios(uf: string): Promise<string[]> {
  if (!uf) return [];
  const res = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios?orderBy=nome`);
  const data: IbgeMunicipio[] = await res.json();
  return data.map(m => m.nome);
}

export async function fetchCep(cep: string): Promise<{ logradouro: string; bairro: string; localidade: string; uf: string; erro?: boolean } | null> {
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

export const CityAutocomplete: React.FC<{
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

export const EMPTY_UNIT: Omit<Unit, 'id'> = {
  companyId: '', name: '',
  cep: '', logradouro: '', numero: '', complemento: '', bairro: '',
  city: '', uf: '', address: '', productionLocation: '', logoDataUrl: '',
};

export const EMPTY_SECTOR: Omit<Sector, 'id'> = { companyId: '', unitId: '', name: '', description: '', active: true };

export const EMPTY_ROLE: Omit<StandardJobRole, 'id'> = { companyId: '', sectorId: '', parentRoleId: '', name: '', cbo: '', description: '', active: true };

// Components
export const UnitModalForm: React.FC<{
  open: boolean;
  onClose: () => void;
  title: string;
  form: Omit<Unit, 'id'>;
  setForm: React.Dispatch<React.SetStateAction<Omit<Unit, 'id'>>>;
  onSave: () => void;
  isSaving?: boolean;
  companyAddress?: { cep: string; logradouro: string; numero: string; complemento: string; bairro: string; municipio: string; uf: string; };
}> = ({ open, onClose, title, form, setForm, onSave, isSaving, companyAddress }) => {
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

  useEffect(() => {
    if (open && form.uf) loadCities(form.uf);
    if (!open) { setCopyAddress(false); setCepError(''); }
  }, [open, form.uf]);

  const handleCopyCompanyAddress = async () => {
    if (!companyAddress) return;
    const uf = companyAddress.uf;
    setForm(f => ({ ...f, cep: companyAddress.cep || '', logradouro: companyAddress.logradouro || '', numero: companyAddress.numero || '', complemento: companyAddress.complemento || '', bairro: companyAddress.bairro || '', city: companyAddress.municipio || '', uf }));
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

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="space-y-2">
        <FormGroup label="Nome da Unidade" required>
          <Input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Ex: Unidade Sede, Filial Norte" />
        </FormGroup>

        {companyAddress && (
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
                  if (!companyAddress.logradouro && !companyAddress.municipio) {
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
        )}

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
          <button type="button" className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50" onClick={onClose}>Cancelar</button>
          <button type="button" className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700" onClick={onSave} disabled={isSaving}>Salvar</button>
        </div>
      </div>
    </Modal>
  );
};

export const SectorModalForm: React.FC<{
  open: boolean;
  onClose: () => void;
  title: string;
  form: Omit<Sector, 'id'>;
  setForm: React.Dispatch<React.SetStateAction<Omit<Sector, 'id'>>>;
  onSave: () => void;
  isSaving?: boolean;
  companyUnits: Unit[];
}> = ({ open, onClose, title, form, setForm, onSave, isSaving, companyUnits }) => {
  const set = (field: keyof Omit<Sector, 'id'>, value: any) => setForm(f => ({ ...f, [field]: value }));

  return (
    <Modal open={open} onClose={onClose} title={title}>
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
          <button type="button" className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50" onClick={onClose}>Cancelar</button>
          <button type="button" className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700" onClick={onSave} disabled={isSaving}>Salvar</button>
        </div>
      </div>
    </Modal>
  );
};

export const JobRoleModalForm: React.FC<{
  open: boolean;
  onClose: () => void;
  title: string;
  form: Omit<StandardJobRole, 'id'>;
  setForm: React.Dispatch<React.SetStateAction<Omit<StandardJobRole, 'id'>>>;
  onSave: () => void;
  isSaving?: boolean;
  companySectors: Sector[];
  companyRoles: StandardJobRole[];
  editingId?: string | null;
}> = ({ open, onClose, title, form, setForm, onSave, isSaving, companySectors, companyRoles, editingId }) => {
  const set = (field: keyof Omit<StandardJobRole, 'id'>, value: any) => setForm(f => ({ ...f, [field]: value }));
  const parentOptions = companyRoles.filter(r => {
    if (r.id === editingId) return false;
    if (form.sectorId) return r.sectorId === form.sectorId;
    return true;
  });

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="space-y-2">
        <FormGroup label="Nome da Função" required>
          <OcupacaoAutocomplete
            value={form.name}
            onChange={val => set('name', val)}
            onSelectOcupacao={o => {
              set('name', o.descricao);
              set('cbo', o.codigo);
            }}
            className="flex w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 hover:border-slate-300"
            placeholder="Ex: Operador de Produção"
          />
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
        <FormGroup label="Status">
          <Select value={form.active ? 'true' : 'false'} onChange={e => set('active', e.target.value === 'true')}>
            <option value="true">Ativo</option>
            <option value="false">Inativo</option>
          </Select>
        </FormGroup>
        <div className="flex justify-end gap-2 pt-3">
          <button type="button" className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50" onClick={onClose}>Cancelar</button>
          <button type="button" className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700" onClick={onSave} disabled={isSaving}>Salvar</button>
        </div>
      </div>
    </Modal>
  );
};
