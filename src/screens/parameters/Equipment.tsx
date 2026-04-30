import React, { useState } from 'react';
import { useAET } from '../../context/AETContext';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { FormGroup, Input, Textarea, Select } from '../../components/ui/Forms';
import { StandardEquipment } from '../../types';
import { Wrench, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';

const CATEGORIES = ['Máquina','Ferramenta manual','Veículo','Bancada / Mesa','Esteira','Equipamento de movimentação','Outro'];
const OPERATIONS = ['manual','elétrico','hidráulico','pneumático'];

const EMPTY: Omit<StandardEquipment, 'id'> = {
  name: '', category: '', operation: [], description: '', hasDimensions: false, active: true,
};

export const Equipment = () => {
  const { equipment, addEquipment, updateEquipment, deleteEquipment } = useAET();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<StandardEquipment, 'id'>>(EMPTY);

  const set = (field: keyof Omit<StandardEquipment, 'id'>, value: any) =>
    setForm(f => ({ ...f, [field]: value }));

  const toggleOp = (op: string) =>
    setForm(f => ({
      ...f,
      operation: f.operation.includes(op) ? f.operation.filter(o => o !== op) : [...f.operation, op],
    }));

  const handleSave = async () => {
    const missing: string[] = [];
    if (!form.name.trim()) missing.push('Nome');

    if (missing.length > 0) {
      alert(`Por favor, preencha os campos obrigatórios:\n- ${missing.join('\n- ')}`);
      return;
    }
    if (editingId) await updateEquipment(editingId, form);
    else await addEquipment(form);
    setEditingId(null);
    setForm(EMPTY);
  };

  const handleEdit = (e: StandardEquipment) => { setEditingId(e.id); setForm({ ...e }); };
  const handleCancel = () => { setEditingId(null); setForm(EMPTY); };

  return (
    <div className="p-6 lg:p-8 xl:p-10 pb-24">
      <div className="page-header mb-8">
        <div className="flex justify-between items-center relative z-10">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Equipamentos e Ferramentas</h1>
            <p className="text-teal-200 text-sm mt-1">Cadastro de equipamentos padrão</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <Wrench className="w-4 h-4 text-teal-200" />
            </div>
            <div>
              <p className="text-xl font-bold">{equipment.length}</p>
              <p className="text-[11px] text-teal-200">equipamentos</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <div className="xl:col-span-2">
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-base font-semibold text-slate-800 mb-4">
                {editingId ? 'Editar Equipamento' : 'Novo Equipamento'}
              </h2>
              <div className="space-y-1">
                <FormGroup label="Nome" required>
                  <Input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Ex: Serra circular, Empilhadeira" />
                </FormGroup>
                <FormGroup label="Categoria">
                  <Select value={form.category} onChange={e => set('category', e.target.value)}>
                    <option value="">Selecione</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </Select>
                </FormGroup>
                <FormGroup label="Tipo de Funcionamento">
                  <div className="flex flex-wrap gap-2 mt-1">
                    {OPERATIONS.map(op => (
                      <label key={op} className="flex items-center gap-1.5 text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.operation.includes(op)}
                          onChange={() => toggleOp(op)}
                          className="rounded text-teal-600 border-slate-300 focus:ring-teal-500"
                        />
                        <span className="text-slate-700 capitalize">{op}</span>
                      </label>
                    ))}
                  </div>
                </FormGroup>
                <FormGroup label="Descrição Padrão">
                  <Textarea value={form.description} onChange={e => set('description', e.target.value)} placeholder="Descreva características gerais" />
                </FormGroup>
                <FormGroup label="Possui dimensões?">
                  <Select value={form.hasDimensions ? 'true' : 'false'} onChange={e => set('hasDimensions', e.target.value === 'true')}>
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
              <h2 className="text-base font-semibold text-slate-800 mb-4">Equipamentos Cadastrados</h2>
              {equipment.length === 0 ? (
                <div className="empty-state !py-10">
                  <Wrench className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                  <p className="text-slate-400 text-sm">Nenhum equipamento cadastrado.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {equipment.map(e => (
                    <div key={e.id} className="border border-slate-200 rounded-xl p-4 flex justify-between items-start hover:border-slate-300 transition-colors bg-white">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-slate-800 text-sm">{e.name}</p>
                          {e.active
                            ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            : <XCircle className="w-3.5 h-3.5 text-slate-300 shrink-0" />}
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {e.category && <span className="stat-badge !text-[11px] !px-2 !py-0.5">{e.category}</span>}
                          {e.operation.map(op => (
                            <span key={op} className="stat-badge !text-[11px] !px-2 !py-0.5 capitalize">{op}</span>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-1 ml-3 shrink-0">
                        <Button variant="ghost" size="sm" className="!rounded-lg" onClick={() => handleEdit(e)}>
                          <Edit className="w-4 h-4 text-slate-400" />
                        </Button>
                        <Button variant="ghost" size="sm" className="!rounded-lg" onClick={() => deleteEquipment(e.id)}>
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
