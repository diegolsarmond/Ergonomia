import React, { useState, useRef, useEffect } from 'react';
import { useAET } from '../../context/AETContext';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { FormGroup, Input, Textarea, Select } from '../../components/ui/Forms';
import { StandardJobRole } from '../../types';
import { Briefcase, Edit, Trash2, CheckCircle, XCircle, Plus, X, Shield, Wrench } from 'lucide-react';

const EMPTY: Omit<StandardJobRole, 'id'> = {
  companyId: '', sectorId: '', parentRoleId: '', name: '', cbo: '', description: '', active: true,
  epiIds: [], equipmentIds: [],
};

// ── Inline multi-select dropdown ─────────────────────────────────────────────

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

  const toggle = (id: string) => {
    onChange(selectedIds.includes(id) ? selectedIds.filter(x => x !== id) : [...selectedIds, id]);
  };

  return (
    <FormGroup label={label}>
      {/* Selected chips */}
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
              {filtered.length === 0 && (
                <li className="px-3 py-2 text-xs text-slate-400">Nenhum item encontrado.</li>
              )}
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

// ── Form ─────────────────────────────────────────────────────────────────────

const JobRoleForm: React.FC<{
  form: Omit<StandardJobRole, 'id'>;
  set: (field: keyof Omit<StandardJobRole, 'id'>, value: any) => void;
  onSave: () => void;
  onCancel: () => void;
  isEditing: boolean;
}> = ({ form, set, onSave, onCancel, isEditing }) => {
  const { epis, equipment } = useAET();

  return (
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
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="ghost" onClick={onCancel}>Cancelar</Button>
        <Button onClick={onSave}>{isEditing ? 'Atualizar' : 'Adicionar'}</Button>
      </div>
    </div>
  );
};

// ── Screen ────────────────────────────────────────────────────────────────────

export const JobRoles = () => {
  const { jobRoles, addJobRole, updateJobRole, deleteJobRole, epis, equipment } = useAET();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<StandardJobRole, 'id'>>(EMPTY);

  const set = (field: keyof Omit<StandardJobRole, 'id'>, value: any) =>
    setForm(f => ({ ...f, [field]: value }));

  const handleSave = async () => {
    if (!form.name.trim()) {
      alert('Por favor, preencha o Nome da Função.');
      return;
    }
    if (editingId) await updateJobRole(editingId, form);
    else await addJobRole(form);
    closeModal();
  };

  const openNew = () => { setEditingId(null); setForm(EMPTY); setModalOpen(true); };
  const handleEdit = (r: StandardJobRole) => { setEditingId(r.id); setForm({ ...r, epiIds: r.epiIds ?? [], equipmentIds: r.equipmentIds ?? [] }); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditingId(null); setForm(EMPTY); };

  return (
    <div className="p-6 lg:p-8 xl:p-10 pb-24">
      <div className="page-header mb-8">
        <div className="flex justify-between items-center relative z-10">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Funções Padrão</h1>
            <p className="text-teal-200 text-sm mt-1">Cadastro de funções reutilizáveis</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <Briefcase className="w-4 h-4 text-teal-200" />
              </div>
              <div>
                <p className="text-xl font-bold">{jobRoles.length}</p>
                <p className="text-[11px] text-teal-200">funções</p>
              </div>
            </div>
            <Button onClick={openNew} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Nova Função
            </Button>
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <h2 className="text-base font-semibold text-slate-800 mb-4">Funções Cadastradas</h2>
          {jobRoles.length === 0 ? (
            <div className="empty-state !py-16">
              <Briefcase className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p className="text-slate-400 text-sm mb-4">Nenhuma função cadastrada.</p>
              <Button onClick={openNew} variant="ghost">
                <Plus className="w-4 h-4 mr-2" />Adicionar função
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {jobRoles.map(r => {
                const roleEpis = epis.filter(e => r.epiIds?.includes(e.id));
                const roleEquip = equipment.filter(e => r.equipmentIds?.includes(e.id));
                return (
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
                      {(roleEpis.length > 0 || roleEquip.length > 0) && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {roleEpis.map(e => (
                            <span key={e.id} className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 border border-amber-200 rounded text-[11px] text-amber-700">
                              <Shield className="w-2.5 h-2.5" />{e.name}
                            </span>
                          ))}
                          {roleEquip.map(e => (
                            <span key={e.id} className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 border border-blue-200 rounded text-[11px] text-blue-700">
                              <Wrench className="w-2.5 h-2.5" />{e.name}
                            </span>
                          ))}
                        </div>
                      )}
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
                );
              })}
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
                {editingId ? 'Editar Função' : 'Nova Função'}
              </h2>
              <button onClick={closeModal} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>
            <div className="px-6 py-4">
              <JobRoleForm
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
