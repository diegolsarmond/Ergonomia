import React, { useState } from 'react';
import { useAET } from '../../context/AETContext';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { FormGroup, Input, Textarea, Select } from '../../components/ui/Forms';
import { StandardJobRole } from '../../types';
import { Briefcase, Edit, Trash2, CheckCircle, XCircle, Plus, X } from 'lucide-react';

const EMPTY: Omit<StandardJobRole, 'id'> = {
  companyId: '', sectorId: '', parentRoleId: '', name: '', cbo: '', description: '', active: true,
};

const JobRoleForm: React.FC<{
  form: Omit<StandardJobRole, 'id'>;
  set: (field: keyof Omit<StandardJobRole, 'id'>, value: any) => void;
  onSave: () => void;
  onCancel: () => void;
  isEditing: boolean;
}> = ({ form, set, onSave, onCancel, isEditing }) => (
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
      <Button variant="ghost" onClick={onCancel}>Cancelar</Button>
      <Button onClick={onSave}>{isEditing ? 'Atualizar' : 'Adicionar'}</Button>
    </div>
  </div>
);

export const JobRoles = () => {
  const { jobRoles, addJobRole, updateJobRole, deleteJobRole } = useAET();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<StandardJobRole, 'id'>>(EMPTY);

  const set = (field: keyof Omit<StandardJobRole, 'id'>, value: any) =>
    setForm(f => ({ ...f, [field]: value }));

  const handleSave = async () => {
    const missing: string[] = [];
    if (!form.name.trim()) missing.push('Nome da Função');
    if (missing.length > 0) {
      alert(`Por favor, preencha os campos obrigatórios:\n- ${missing.join('\n- ')}`);
      return;
    }
    if (editingId) await updateJobRole(editingId, form);
    else await addJobRole(form);
    closeModal();
  };

  const openNew = () => { setEditingId(null); setForm(EMPTY); setModalOpen(true); };
  const handleEdit = (r: StandardJobRole) => { setEditingId(r.id); setForm({ ...r }); setModalOpen(true); };
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
