import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAET } from '../../context/AETContext';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { FormGroup, Input, Select } from '../../components/ui/Forms';
import { Company } from '../../types';
import { Building2, Edit, Trash2, CheckCircle, XCircle, ChevronRight, Plus, X, Search, Loader2 } from 'lucide-react';

const UF_LIST = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];

const EMPTY: Omit<Company, 'id'> = {
  razaoSocial: '', nomeFantasia: '', cnpj: '',
  logradouro: '', numero: '', complemento: '', bairro: '', municipio: '', uf: '', cep: '',
  product: '', riskDegree: '', logoDataUrl: '', active: true,
};

function formatCnpj(raw: string) {
  const d = raw.replace(/\D/g, '').slice(0, 14);
  return d
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
}

function formatCep(raw: string) {
  const d = raw.replace(/\D/g, '').slice(0, 8);
  return d.replace(/^(\d{5})(\d)/, '$1-$2');
}

const CompanyForm: React.FC<{
  form: Omit<Company, 'id'>;
  set: (field: keyof Omit<Company, 'id'>, value: any) => void;
  onSave: () => void;
  onCancel: () => void;
  isEditing: boolean;
}> = ({ form, set, onSave, onCancel, isEditing }) => {
  const [cnpjLoading, setCnpjLoading] = useState(false);
  const [cnpjError, setCnpjError] = useState('');
  const cnpjDigits = form.cnpj.replace(/\D/g, '');

  const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCnpjError('');
    set('cnpj', formatCnpj(e.target.value));
  };

  const fetchCnpj = async () => {
    if (cnpjDigits.length !== 14) { setCnpjError('CNPJ deve ter 14 dígitos.'); return; }
    setCnpjLoading(true);
    setCnpjError('');
    try {
      const res = await fetch(`https://kitana.opencnpj.com/cnpj/${cnpjDigits}`);
      const json = await res.json();
      if (!json.success || !json.data) { setCnpjError('CNPJ não encontrado.'); return; }
      const d = json.data;
      set('razaoSocial', d.razaoSocial ?? '');
      set('nomeFantasia', d.nomeFantasia ?? '');
      set('logradouro', d.logradouro ?? '');
      set('numero', d.numero ?? '');
      set('complemento', d.complemento ?? '');
      set('bairro', d.bairro ?? '');
      set('municipio', d.municipio ?? '');
      set('uf', d.uf ?? '');
      set('cep', d.cep ?? '');
      set('product', d.cnaes?.[0]?.descricao ?? '');
    } catch {
      setCnpjError('Erro ao consultar CNPJ. Tente novamente.');
    } finally {
      setCnpjLoading(false);
    }
  };

  return (
    <div className="space-y-1">
      {/* CNPJ */}
      <FormGroup label="CNPJ" required>
        <div className="flex gap-2">
          <Input
            value={form.cnpj}
            onChange={handleCnpjChange}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), fetchCnpj())}
            placeholder="00.000.000/0000-00"
            className="flex-1"
          />
          <button
            type="button"
            onClick={fetchCnpj}
            disabled={cnpjLoading || cnpjDigits.length !== 14}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
          >
            {cnpjLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Buscar
          </button>
        </div>
        {cnpjError && <p className="text-xs text-red-500 mt-1">{cnpjError}</p>}
      </FormGroup>

      <FormGroup label="Razão Social" required>
        <Input value={form.razaoSocial} onChange={e => set('razaoSocial', e.target.value)} placeholder="Razão Social Ltda" />
      </FormGroup>
      <FormGroup label="Nome Fantasia">
        <Input value={form.nomeFantasia} onChange={e => set('nomeFantasia', e.target.value)} placeholder="Nome Fantasia" />
      </FormGroup>

      {/* Endereço separado */}
      <FormGroup label="Logradouro">
        <Input value={form.logradouro} onChange={e => set('logradouro', e.target.value)} placeholder="Rua / Avenida / Travessa" />
      </FormGroup>
      <div className="grid grid-cols-3 gap-2">
        <FormGroup label="Número">
          <Input value={form.numero} onChange={e => set('numero', e.target.value)} placeholder="Nº" />
        </FormGroup>
        <FormGroup label="Complemento">
          <Input value={form.complemento} onChange={e => set('complemento', e.target.value)} placeholder="Apto, Sala, Bloco..." />
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
      <FormGroup label="CEP">
        <Input value={form.cep} onChange={e => set('cep', formatCep(e.target.value))} placeholder="00000-000" />
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

export const Companies = () => {
  const { companies, addCompany, updateCompany, deleteCompany } = useAET();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Company, 'id'>>(EMPTY);

  const set = (field: keyof Omit<Company, 'id'>, value: any) =>
    setForm(f => ({ ...f, [field]: value }));

  const handleSave = async () => {
    if (!form.razaoSocial.trim()) return;
    if (editingId) await updateCompany(editingId, form);
    else await addCompany(form);
    closeModal();
  };

  const openNew = () => { setEditingId(null); setForm(EMPTY); setModalOpen(true); };
  const handleEdit = (c: Company) => { setEditingId(c.id); setForm({ ...c }); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditingId(null); setForm(EMPTY); };

  const cityLine = (c: Company) =>
    [c.municipio, c.uf].filter(Boolean).join(' / ');

  return (
    <div className="p-6 lg:p-8 xl:p-10 pb-24">
      <div className="page-header mb-8">
        <div className="flex justify-between items-center relative z-10">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Empresas</h1>
            <p className="text-teal-200 text-sm mt-1">Cadastro de empresas clientes</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-teal-200" />
              </div>
              <div>
                <p className="text-xl font-bold">{companies.length}</p>
                <p className="text-[11px] text-teal-200">empresas</p>
              </div>
            </div>
            <Button onClick={openNew} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Nova Empresa
            </Button>
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <h2 className="text-base font-semibold text-slate-800 mb-4">Empresas Cadastradas</h2>
          {companies.length === 0 ? (
            <div className="empty-state !py-16">
              <Building2 className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p className="text-slate-400 text-sm mb-4">Nenhuma empresa cadastrada.</p>
              <Button onClick={openNew} variant="ghost">
                <Plus className="w-4 h-4 mr-2" />Adicionar empresa
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {companies.map(c => (
                <div
                  key={c.id}
                  className="border border-slate-200 rounded-xl p-4 flex justify-between items-start hover:border-teal-300 hover:bg-teal-50/30 transition-colors bg-white cursor-pointer"
                  onClick={() => navigate(`/parameters/companies/${c.id}`)}
                >
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
                      {cityLine(c) && <span className="stat-badge !text-[11px] !px-2 !py-0.5">{cityLine(c)}</span>}
                      {c.riskDegree && <span className="stat-badge !text-[11px] !px-2 !py-0.5">Grau {c.riskDegree}</span>}
                    </div>
                  </div>
                  <div className="flex gap-1 ml-3 shrink-0" onClick={e => e.stopPropagation()}>
                    <Button variant="ghost" size="sm" className="!rounded-lg" onClick={() => handleEdit(c)}>
                      <Edit className="w-4 h-4 text-slate-400" />
                    </Button>
                    <Button variant="ghost" size="sm" className="!rounded-lg" onClick={() => deleteCompany(c.id)}>
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </Button>
                    <Button variant="ghost" size="sm" className="!rounded-lg" onClick={() => navigate(`/parameters/companies/${c.id}`)}>
                      <ChevronRight className="w-4 h-4 text-teal-500" />
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
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-base font-semibold text-slate-800">
                {editingId ? 'Editar Empresa' : 'Nova Empresa'}
              </h2>
              <button onClick={closeModal} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>
            <div className="px-6 py-4">
              <CompanyForm
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
