import React, { useState } from 'react';
import { useAET } from '../../context/AETContext';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { FormGroup, Input, Textarea, Select } from '../../components/ui/Forms';
import { ReportTextTemplate } from '../../types';
import { FileText, Edit, Trash2, CheckCircle, XCircle, Plus, X } from 'lucide-react';

const SECTIONS = [
  'Introdução','Ergonomia','Objetivo','Metodologia','Descrição do RULA','Descrição do REBA',
  'Descrição do NIOSH','Diagnóstico base','Interpretação da iluminação','Conclusão','Outro',
];

const EMPTY: Omit<ReportTextTemplate, 'id'> = {
  section: '', title: '', text: '', active: true,
};

const ReportTextForm: React.FC<{
  form: Omit<ReportTextTemplate, 'id'>;
  set: (field: keyof Omit<ReportTextTemplate, 'id'>, value: any) => void;
  onSave: () => void;
  onCancel: () => void;
  isEditing: boolean;
}> = ({ form, set, onSave, onCancel, isEditing }) => (
  <div className="space-y-1">
    <FormGroup label="Seção do Relatório">
      <Select value={form.section} onChange={e => set('section', e.target.value)}>
        <option value="">Selecione</option>
        {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
      </Select>
    </FormGroup>
    <FormGroup label="Título" required>
      <Input value={form.title} onChange={e => set('title', e.target.value)} placeholder="Ex: Introdução padrão NR-17" />
    </FormGroup>
    <FormGroup label="Texto Padrão" required>
      <Textarea
        value={form.text}
        onChange={e => set('text', e.target.value)}
        placeholder="Escreva o texto padrão. Use {empresa}, {unidade}, {funcao} para variáveis."
        className="min-h-[160px]"
      />
    </FormGroup>
    <p className="text-[11px] text-slate-400">
      Variáveis disponíveis: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-600">{'{empresa}'}</code>{' '}
      <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-600">{'{unidade}'}</code>{' '}
      <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-600">{'{funcao}'}</code>{' '}
      <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-600">{'{data}'}</code>
    </p>
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

export const ReportTexts = () => {
  const { reportTexts, addReportText, updateReportText, deleteReportText } = useAET();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<ReportTextTemplate, 'id'>>(EMPTY);

  const set = (field: keyof Omit<ReportTextTemplate, 'id'>, value: any) =>
    setForm(f => ({ ...f, [field]: value }));

  const handleSave = async () => {
    const missing: string[] = [];
    if (!form.title.trim()) missing.push('Título');
    if (!form.text.trim()) missing.push('Texto Padrão');
    if (missing.length > 0) {
      alert(`Por favor, preencha os campos obrigatórios:\n- ${missing.join('\n- ')}`);
      return;
    }
    if (editingId) await updateReportText(editingId, form);
    else await addReportText(form);
    closeModal();
  };

  const openNew = () => { setEditingId(null); setForm(EMPTY); setModalOpen(true); };
  const handleEdit = (t: ReportTextTemplate) => { setEditingId(t.id); setForm({ ...t }); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditingId(null); setForm(EMPTY); };

  return (
    <div className="p-6 lg:p-8 xl:p-10 pb-24">
      <div className="page-header mb-8">
        <div className="flex justify-between items-center relative z-10">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Textos Padrão do Relatório</h1>
            <p className="text-teal-200 text-sm mt-1">Templates reutilizáveis por seção do relatório</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <FileText className="w-4 h-4 text-teal-200" />
              </div>
              <div>
                <p className="text-xl font-bold">{reportTexts.length}</p>
                <p className="text-[11px] text-teal-200">textos</p>
              </div>
            </div>
            <Button onClick={openNew} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Novo Texto
            </Button>
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <h2 className="text-base font-semibold text-slate-800 mb-4">Textos Cadastrados</h2>
          {reportTexts.length === 0 ? (
            <div className="empty-state !py-16">
              <FileText className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p className="text-slate-400 text-sm mb-4">Nenhum texto padrão cadastrado.</p>
              <Button onClick={openNew} variant="ghost">
                <Plus className="w-4 h-4 mr-2" />Adicionar texto
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {reportTexts.map(t => (
                <div key={t.id} className="border border-slate-200 rounded-xl p-4 flex justify-between items-start hover:border-slate-300 transition-colors bg-white">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-slate-800 text-sm">{t.title}</p>
                      {t.active
                        ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        : <XCircle className="w-3.5 h-3.5 text-slate-300 shrink-0" />}
                    </div>
                    {t.section && <span className="stat-badge !text-[11px] !px-2 !py-0.5 mt-1 inline-block">{t.section}</span>}
                    <p className="text-xs text-slate-400 mt-1.5 line-clamp-2">{t.text}</p>
                  </div>
                  <div className="flex gap-1 ml-3 shrink-0">
                    <Button variant="ghost" size="sm" className="!rounded-lg" onClick={() => handleEdit(t)}>
                      <Edit className="w-4 h-4 text-slate-400" />
                    </Button>
                    <Button variant="ghost" size="sm" className="!rounded-lg" onClick={() => deleteReportText(t.id)}>
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
                {editingId ? 'Editar Texto Padrão' : 'Novo Texto Padrão'}
              </h2>
              <button onClick={closeModal} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>
            <div className="px-6 py-4">
              <ReportTextForm
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
