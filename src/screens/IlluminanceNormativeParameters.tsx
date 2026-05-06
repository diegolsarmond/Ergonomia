/**
 * Tela administrativa para configurar parâmetros normativos de iluminância.
 */
import React, { useState, useEffect } from 'react';
import { useAET } from '../context/AETContext';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { FormGroup, Input, Textarea } from '../components/ui/Forms';
import { Trash2, Edit, Plus, X, Sun, Lightbulb } from 'lucide-react';
import type { IlluminanceNormativeParameter } from '../domain/illuminance/illuminanceTypes';

export const IlluminanceNormativeParameters = () => {
  const {
    illuminanceNormativeParams,
    addIlluminanceNormativeParam,
    updateIlluminanceNormativeParam,
    deleteIlluminanceNormativeParam,
  } = useAET();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    activityDescription: '',
    minimumLux: 0,
    minimumIRC: 0,
    tolerancePercent: 10,
    maxUniformityRatio: 5,
    normativeNotes: '',
    normativeReference: 'ABNT NBR ISO/CIE 8995-1:2013',
    active: true,
  });

  const resetForm = () => {
    setEditingId(null);
    setForm({
      activityDescription: '', minimumLux: 0, minimumIRC: 0,
      tolerancePercent: 10, maxUniformityRatio: 5, normativeNotes: '',
      normativeReference: 'ABNT NBR ISO/CIE 8995-1:2013', active: true,
    });
  };

  const openNew = () => { resetForm(); setModalOpen(true); };
  const openEdit = (p: IlluminanceNormativeParameter) => {
    setEditingId(p.id);
    setForm({
      activityDescription: p.activityDescription,
      minimumLux: p.minimumLux,
      minimumIRC: p.minimumIRC,
      tolerancePercent: p.tolerancePercent,
      maxUniformityRatio: p.maxUniformityRatio,
      normativeNotes: p.normativeNotes,
      normativeReference: p.normativeReference,
      active: p.active,
    });
    setModalOpen(true);
  };
  const closeModal = () => { setModalOpen(false); resetForm(); };

  const handleSave = async () => {
    if (!form.activityDescription.trim()) return;
    if (editingId) {
      await updateIlluminanceNormativeParam(editingId, form);
    } else {
      await addIlluminanceNormativeParam(form);
    }
    closeModal();
  };

  const handleDelete = async (id: string) => {
    await deleteIlluminanceNormativeParam(id);
    setDeletingId(null);
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (deletingId) setDeletingId(null);
        else if (modalOpen) closeModal();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [modalOpen, deletingId]);

  return (
    <div className="p-6 lg:p-8 xl:p-10 pb-24">
      {/* Header */}
      <div className="page-header mb-8">
        <div className="flex justify-between items-center relative z-10">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Parâmetros de Iluminância</h1>
            <p className="text-teal-200 text-sm mt-1">Configuração normativa por tipo de ambiente/atividade</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <Lightbulb className="w-4 h-4 text-teal-200" />
              </div>
              <div>
                <p className="text-xl font-bold">{illuminanceNormativeParams.length}</p>
                <p className="text-[11px] text-teal-200">cadastrados</p>
              </div>
            </div>
            <Button
              size="sm"
              className="!bg-white/15 !text-white hover:!bg-white/25 !shadow-none !border-white/20 !border"
              onClick={openNew}
            >
              <Plus className="w-4 h-4" /> Novo Parâmetro
            </Button>
          </div>
        </div>
      </div>

      {/* List */}
      {illuminanceNormativeParams.length === 0 ? (
        <div className="empty-state">
          <Sun className="w-12 h-12 mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-semibold text-slate-500 mb-1">Nenhum parâmetro cadastrado</h3>
          <p className="text-slate-400 text-sm mb-6">Cadastre parâmetros normativos para utilizar nas medições de iluminância.</p>
          <Button onClick={openNew}><Plus className="w-4 h-4" /> Cadastrar Primeiro Parâmetro</Button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse bg-white rounded-2xl shadow-sm overflow-hidden">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left p-3 font-semibold text-slate-600">Atividade / Ambiente</th>
                <th className="text-center p-3 font-semibold text-slate-600 w-24">Lux Mín</th>
                <th className="text-center p-3 font-semibold text-slate-600 w-20">IRC/Ra</th>
                <th className="text-center p-3 font-semibold text-slate-600 w-24">Tolerância</th>
                <th className="text-center p-3 font-semibold text-slate-600 w-24">Razão Máx</th>
                <th className="text-left p-3 font-semibold text-slate-600">Referência</th>
                <th className="text-center p-3 font-semibold text-slate-600 w-20">Status</th>
                <th className="text-center p-3 font-semibold text-slate-600 w-24">Ações</th>
              </tr>
            </thead>
            <tbody>
              {illuminanceNormativeParams.map(p => (
                <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                  <td className="p-3 text-slate-700 font-medium">{p.activityDescription}</td>
                  <td className="p-3 text-center font-semibold text-amber-700">{p.minimumLux}</td>
                  <td className="p-3 text-center text-slate-600">{p.minimumIRC}</td>
                  <td className="p-3 text-center text-slate-600">{p.tolerancePercent}%</td>
                  <td className="p-3 text-center text-slate-600">{p.maxUniformityRatio}:1</td>
                  <td className="p-3 text-xs text-slate-500">{p.normativeReference}</td>
                  <td className="p-3 text-center">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${p.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      {p.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex justify-center gap-1">
                      <Button variant="ghost" size="sm" className="!rounded-lg" onClick={() => openEdit(p)}>
                        <Edit className="w-4 h-4 text-slate-400" />
                      </Button>
                      <Button variant="ghost" size="sm" className="!rounded-lg" onClick={() => setDeletingId(p.id)}>
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-800">{editingId ? 'Editar Parâmetro' : 'Novo Parâmetro Normativo'}</h2>
              <button onClick={closeModal} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <FormGroup label="Descrição da Atividade / Ambiente" required>
                <Input value={form.activityDescription} onChange={e => setForm(f => ({ ...f, activityDescription: e.target.value }))} placeholder="Ex: Escritório — Escrita, leitura" autoFocus />
              </FormGroup>
              <div className="grid grid-cols-2 gap-4">
                <FormGroup label="Lux Mínimo Recomendado" required>
                  <Input type="number" min={0} value={form.minimumLux || ''} onChange={e => setForm(f => ({ ...f, minimumLux: Number(e.target.value) || 0 }))} />
                </FormGroup>
                <FormGroup label="IRC/Ra Mínimo">
                  <Input type="number" min={0} max={100} value={form.minimumIRC || ''} onChange={e => setForm(f => ({ ...f, minimumIRC: Number(e.target.value) || 0 }))} />
                </FormGroup>
                <FormGroup label="Tolerância (%)">
                  <Input type="number" min={0} max={100} value={form.tolerancePercent} onChange={e => setForm(f => ({ ...f, tolerancePercent: Number(e.target.value) || 0 }))} />
                </FormGroup>
                <FormGroup label="Razão Máx/Mín Permitida">
                  <Input type="number" min={1} step={0.5} value={form.maxUniformityRatio} onChange={e => setForm(f => ({ ...f, maxUniformityRatio: Number(e.target.value) || 1 }))} />
                </FormGroup>
              </div>
              <FormGroup label="Referência Normativa">
                <Input value={form.normativeReference} onChange={e => setForm(f => ({ ...f, normativeReference: e.target.value }))} placeholder="Ex: ABNT NBR ISO/CIE 8995-1:2013" />
              </FormGroup>
              <FormGroup label="Observações Normativas">
                <Textarea value={form.normativeNotes} onChange={e => setForm(f => ({ ...f, normativeNotes: e.target.value }))} rows={3} placeholder="Observações adicionais..." />
              </FormGroup>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} className="rounded" />
                <span className="text-sm text-slate-600">Ativo</span>
              </label>
            </div>
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl">
              <Button variant="ghost" onClick={closeModal}>Cancelar</Button>
              <Button onClick={handleSave} disabled={!form.activityDescription.trim()}>{editingId ? 'Salvar Alterações' : 'Cadastrar'}</Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deletingId && (
        <div className="modal-overlay" onClick={() => setDeletingId(null)}>
          <div className="modal-content bg-white rounded-2xl shadow-2xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-5 h-5 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-1">Excluir Parâmetro?</h3>
              <p className="text-sm text-slate-500 mb-6">Esta ação não pode ser desfeita.</p>
              <div className="flex gap-2 justify-center">
                <Button variant="ghost" onClick={() => setDeletingId(null)}>Cancelar</Button>
                <Button variant="danger" onClick={() => handleDelete(deletingId)}>Excluir</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
