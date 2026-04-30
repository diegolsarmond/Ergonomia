import React, { useState } from 'react';
import { useAET } from '../../context/AETContext';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { FormGroup, Input, Textarea } from '../../components/ui/Forms';
import { RiskClassification } from '../../types';
import { AlertTriangle, Edit, Trash2 } from 'lucide-react';

const EMPTY: Omit<RiskClassification, 'id'> = {
  name: '', minScore: 0, maxScore: 0, color: '#10b981', interpretation: '',
};

export const RiskClassifications = () => {
  const { riskClassifications, addRiskClassification, updateRiskClassification, deleteRiskClassification } = useAET();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<RiskClassification, 'id'>>(EMPTY);

  const set = (field: keyof Omit<RiskClassification, 'id'>, value: any) =>
    setForm(f => ({ ...f, [field]: value }));

  const handleSave = async () => {
    const missing: string[] = [];
    if (!form.name.trim()) missing.push('Nome da Classificação');

    if (missing.length > 0) {
      alert(`Por favor, preencha os campos obrigatórios:\n- ${missing.join('\n- ')}`);
      return;
    }
    if (editingId) await updateRiskClassification(editingId, form);
    else await addRiskClassification(form);
    setEditingId(null);
    setForm(EMPTY);
  };

  const handleEdit = (r: RiskClassification) => { setEditingId(r.id); setForm({ ...r }); };
  const handleCancel = () => { setEditingId(null); setForm(EMPTY); };

  const sorted = [...riskClassifications].sort((a, b) => a.minScore - b.minScore);

  return (
    <div className="p-6 lg:p-8 xl:p-10 pb-24">
      <div className="page-header mb-8">
        <div className="flex justify-between items-center relative z-10">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Classificação de Risco</h1>
            <p className="text-teal-200 text-sm mt-1">Escalas de pontuação e cores para os riscos</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-teal-200" />
            </div>
            <div>
              <p className="text-xl font-bold">{riskClassifications.length}</p>
              <p className="text-[11px] text-teal-200">níveis</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <div className="xl:col-span-2">
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-base font-semibold text-slate-800 mb-4">
                {editingId ? 'Editar Nível' : 'Novo Nível de Risco'}
              </h2>
              <div className="space-y-1">
                <FormGroup label="Nome da Classificação" required>
                  <Input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Ex: Baixo, Moderado, Alto, Crítico" />
                </FormGroup>
                <div className="grid grid-cols-2 gap-3">
                  <FormGroup label="Pontuação mínima">
                    <Input type="number" value={form.minScore} onChange={e => set('minScore', parseFloat(e.target.value) || 0)} />
                  </FormGroup>
                  <FormGroup label="Pontuação máxima">
                    <Input type="number" value={form.maxScore} onChange={e => set('maxScore', parseFloat(e.target.value) || 0)} />
                  </FormGroup>
                </div>
                <FormGroup label="Cor">
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={form.color}
                      onChange={e => set('color', e.target.value)}
                      className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer p-0.5"
                    />
                    <Input
                      value={form.color}
                      onChange={e => set('color', e.target.value)}
                      placeholder="#10b981"
                      className="font-mono text-sm"
                    />
                  </div>
                </FormGroup>
                <FormGroup label="Interpretação padrão">
                  <Textarea value={form.interpretation} onChange={e => set('interpretation', e.target.value)} placeholder="Descreva o que este nível de risco significa" />
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
              <h2 className="text-base font-semibold text-slate-800 mb-4">Níveis de Risco Cadastrados</h2>
              {riskClassifications.length === 0 ? (
                <div className="empty-state !py-10">
                  <AlertTriangle className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                  <p className="text-slate-400 text-sm">Nenhuma classificação cadastrada.</p>
                  <p className="text-slate-400 text-xs mt-1">Exemplos: Baixo, Moderado, Alto, Crítico</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sorted.map(r => (
                    <div key={r.id} className="border border-slate-200 rounded-xl p-4 flex justify-between items-start hover:border-slate-300 transition-colors bg-white">
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div
                          className="w-4 h-full min-h-[36px] rounded-md shrink-0"
                          style={{ backgroundColor: r.color }}
                        />
                        <div className="min-w-0">
                          <p className="font-medium text-slate-800 text-sm">{r.name}</p>
                          <span className="stat-badge !text-[11px] !px-2 !py-0.5 mt-1 inline-block">
                            {r.minScore} – {r.maxScore} pts
                          </span>
                          {r.interpretation && <p className="text-xs text-slate-400 mt-1 line-clamp-2">{r.interpretation}</p>}
                        </div>
                      </div>
                      <div className="flex gap-1 ml-3 shrink-0">
                        <Button variant="ghost" size="sm" className="!rounded-lg" onClick={() => handleEdit(r)}>
                          <Edit className="w-4 h-4 text-slate-400" />
                        </Button>
                        <Button variant="ghost" size="sm" className="!rounded-lg" onClick={() => deleteRiskClassification(r.id)}>
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
