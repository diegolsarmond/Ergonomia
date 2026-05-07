import React, { useState } from 'react';
import { useAET } from '../../context/AETContext';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { FormGroup, Input, Select } from '../../components/ui/Forms';
import { BiomechanicalRiskFactor } from '../../types';
import { AlertTriangle, Edit, Trash2, CheckCircle, XCircle, Plus, X } from 'lucide-react';
import { BIOMECHANICAL_FACTORS } from '../../data/biomechanicalFactors';

const EMPTY: Omit<BiomechanicalRiskFactor, 'id'> = { name: '', biomechanicalFactors: [], active: true };

const RiskFactorForm: React.FC<{
  form: Omit<BiomechanicalRiskFactor, 'id'>;
  set: (field: keyof Omit<BiomechanicalRiskFactor, 'id'>, value: any) => void;
  onSave: () => void;
  onCancel: () => void;
  isEditing: boolean;
}> = ({ form, set, onSave, onCancel, isEditing }) => {
  return (
    <div className="space-y-1">
      <FormGroup label="Nome do Fator de Risco" required>
        <Input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Ex: Esforço físico intenso, Repetitividade" />
      </FormGroup>
      <FormGroup label="Itens Biomecânicos Vinculados" required>
        <div className="flex flex-wrap gap-2 mb-2">
          {BIOMECHANICAL_FACTORS.map(opt => {
            const selected = form.biomechanicalFactors?.includes(opt);
            return (
              <label key={opt} className={`flex items-center gap-2 px-3 py-1.5 border rounded-xl text-sm transition-all cursor-pointer ${selected ? 'bg-teal-50 border-teal-200 text-teal-700 font-medium' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                <input 
                  type="checkbox"
                  checked={selected}
                  onChange={() => {
                    const nxt = selected 
                      ? form.biomechanicalFactors.filter(v => v !== opt)
                      : [...form.biomechanicalFactors, opt];
                    set('biomechanicalFactors', nxt);
                  }}
                  className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                />
                {opt}
              </label>
            );
          })}
        </div>
        {form.biomechanicalFactors?.length === 0 && <p className="text-[10px] text-red-500 mt-1">Selecione ao menos um item.</p>}
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

export const BiomechanicalRiskFactors = () => {
  const { biomechanicalRiskFactors, addBiomechanicalRiskFactor, updateBiomechanicalRiskFactor, deleteBiomechanicalRiskFactor } = useAET();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<BiomechanicalRiskFactor, 'id'>>(EMPTY);

  const set = (field: keyof Omit<BiomechanicalRiskFactor, 'id'>, value: any) =>
    setForm(f => ({ ...f, [field]: value }));

  const handleSave = async () => {
    const missing: string[] = [];
    if (form.biomechanicalFactors.length === 0) missing.push('Itens Biomecânicos');
    if (!form.name.trim()) missing.push('Nome do Fator de Risco');

    if (missing.length > 0) {
      alert(`Por favor, preencha os campos obrigatórios:\n- ${missing.join('\n- ')}`);
      return;
    }
    if (editingId) await updateBiomechanicalRiskFactor(editingId, form);
    else await addBiomechanicalRiskFactor(form);
    closeModal();
  };

  const openNew = () => { setEditingId(null); setForm(EMPTY); setModalOpen(true); };
  const handleEdit = (f: BiomechanicalRiskFactor) => { setEditingId(f.id); setForm({ ...f }); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditingId(null); setForm(EMPTY); };

  return (
    <div className="p-6 lg:p-8 xl:p-10 pb-24">
      <div className="page-header mb-8">
        <div className="flex justify-between items-center relative z-10">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Fatores de Risco Biomecânicos</h1>
            <p className="text-teal-200 text-sm mt-1">Configuração de fatores de risco vinculados aos itens da biomecânica</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-teal-200" />
              </div>
              <div>
                <p className="text-xl font-bold">{biomechanicalRiskFactors.length}</p>
                <p className="text-[11px] text-teal-200">Fatores</p>
              </div>
            </div>
            <Button onClick={openNew} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Novo Fator
            </Button>
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <h2 className="text-base font-semibold text-slate-800 mb-4">Fatores de Risco Cadastrados</h2>
          {biomechanicalRiskFactors.length === 0 ? (
            <div className="empty-state !py-16">
              <AlertTriangle className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p className="text-slate-400 text-sm mb-4">Nenhum fator de risco cadastrado.</p>
              <Button onClick={openNew} variant="ghost">
                <Plus className="w-4 h-4 mr-2" />Adicionar Fator
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {biomechanicalRiskFactors.map(f => (
                <div key={f.id} className="border border-slate-200 rounded-xl p-4 flex justify-between items-start hover:border-slate-300 transition-colors bg-white">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-slate-800 text-sm">{f.name}</p>
                      {f.active
                        ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        : <XCircle className="w-3.5 h-3.5 text-slate-300 shrink-0" />}
                    </div>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1 italic">Vínculos: {f.biomechanicalFactors?.join(', ') || 'Sem vínculo'}</p>
                  </div>
                  <div className="flex gap-1 ml-3 shrink-0">
                    <Button variant="ghost" size="sm" className="!rounded-lg" onClick={() => handleEdit(f)}>
                      <Edit className="w-4 h-4 text-slate-400" />
                    </Button>
                    <Button variant="ghost" size="sm" className="!rounded-lg" onClick={() => deleteBiomechanicalRiskFactor(f.id)}>
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
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-base font-semibold text-slate-800">
                {editingId ? 'Editar Fator' : 'Novo Fator'}
              </h2>
              <button onClick={closeModal} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>
            <div className="px-6 py-4">
              <RiskFactorForm
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
