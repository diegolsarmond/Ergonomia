import React, { useState } from 'react';
import { useAET } from '../../context/AETContext';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { FormGroup, Input, Textarea, Select } from '../../components/ui/Forms';
import { EPI } from '../../types';
import { HardHat, Edit, Trash2, CheckCircle, XCircle, Plus, X } from 'lucide-react';

const EPI_TYPES = ['Proteção da cabeça','Proteção dos olhos e face','Proteção auditiva','Proteção respiratória','Proteção dos membros superiores','Proteção dos membros inferiores','Proteção do tronco','Proteção do corpo inteiro','Outros'];

const EMPTY: Omit<EPI, 'id'> = { name: '', type: '', description: '', mandatoryByDefault: false, active: true };

const EPIForm: React.FC<{
  form: Omit<EPI, 'id'>;
  set: (field: keyof Omit<EPI, 'id'>, value: any) => void;
  onSave: () => void;
  onCancel: () => void;
  isEditing: boolean;
}> = ({ form, set, onSave, onCancel, isEditing }) => {
  return (
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
        <Button variant="ghost" onClick={onCancel}>Cancelar</Button>
        <Button onClick={onSave}>{isEditing ? 'Atualizar' : 'Adicionar'}</Button>
      </div>
    </div>
  );
};

export const EPIs = () => {
  const { epis, addEPI, updateEPI, deleteEPI } = useAET();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<EPI, 'id'>>(EMPTY);

  const set = (field: keyof Omit<EPI, 'id'>, value: any) =>
    setForm(f => ({ ...f, [field]: value }));

  const handleSave = async () => {
    const missing: string[] = [];
    if (!form.name.trim()) missing.push('Nome do EPI');

    if (missing.length > 0) {
      alert(`Por favor, preencha os campos obrigatórios:\n- ${missing.join('\n- ')}`);
      return;
    }
    if (editingId) await updateEPI(editingId, form);
    else await addEPI(form);
    closeModal();
  };

  const openNew = () => { setEditingId(null); setForm(EMPTY); setModalOpen(true); };
  const handleEdit = (e: EPI) => { setEditingId(e.id); setForm({ ...e }); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditingId(null); setForm(EMPTY); };

  return (
    <div className="p-6 lg:p-8 xl:p-10 pb-24">
      <div className="page-header mb-8">
        <div className="flex justify-between items-center relative z-10">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">EPIs</h1>
            <p className="text-teal-200 text-sm mt-1">Equipamentos de proteção individual padrão</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <HardHat className="w-4 h-4 text-teal-200" />
              </div>
              <div>
                <p className="text-xl font-bold">{epis.length}</p>
                <p className="text-[11px] text-teal-200">EPIs</p>
              </div>
            </div>
            <Button onClick={openNew} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Novo EPI
            </Button>
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <h2 className="text-base font-semibold text-slate-800 mb-4">EPIs Cadastrados</h2>
          {epis.length === 0 ? (
            <div className="empty-state !py-16">
              <HardHat className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p className="text-slate-400 text-sm mb-4">Nenhum EPI cadastrado.</p>
              <Button onClick={openNew} variant="ghost">
                <Plus className="w-4 h-4 mr-2" />Adicionar EPI
              </Button>
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

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-base font-semibold text-slate-800">
                {editingId ? 'Editar EPI' : 'Novo EPI'}
              </h2>
              <button onClick={closeModal} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>
            <div className="px-6 py-4">
              <EPIForm
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

