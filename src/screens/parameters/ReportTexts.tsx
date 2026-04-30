import React, { useState } from 'react';
import { useAET } from '../../context/AETContext';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { FormGroup, Input, Textarea, Select } from '../../components/ui/Forms';
import { ReportTextTemplate } from '../../types';
import { FileText, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';

const SECTIONS = [
  'Introdução','Ergonomia','Objetivo','Metodologia','Descrição do RULA','Descrição do REBA',
  'Descrição do NIOSH','Diagnóstico base','Interpretação da iluminação','Conclusão','Outro',
];

const EMPTY: Omit<ReportTextTemplate, 'id'> = {
  section: '', title: '', text: '', active: true,
};

export const ReportTexts = () => {
  const { reportTexts, addReportText, updateReportText, deleteReportText } = useAET();
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
    setEditingId(null);
    setForm(EMPTY);
  };

  const handleEdit = (t: ReportTextTemplate) => { setEditingId(t.id); setForm({ ...t }); };
  const handleCancel = () => { setEditingId(null); setForm(EMPTY); };

  return (
    <div className="p-6 lg:p-8 xl:p-10 pb-24">
      <div className="page-header mb-8">
        <div className="flex justify-between items-center relative z-10">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Textos Padrão do Relatório</h1>
            <p className="text-teal-200 text-sm mt-1">Templates reutilizáveis por seção do relatório</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <FileText className="w-4 h-4 text-teal-200" />
            </div>
            <div>
              <p className="text-xl font-bold">{reportTexts.length}</p>
              <p className="text-[11px] text-teal-200">textos</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <div className="xl:col-span-2">
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-base font-semibold text-slate-800 mb-4">
                {editingId ? 'Editar Texto' : 'Novo Texto Padrão'}
              </h2>
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
              <h2 className="text-base font-semibold text-slate-800 mb-4">Textos Cadastrados</h2>
              {reportTexts.length === 0 ? (
                <div className="empty-state !py-10">
                  <FileText className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                  <p className="text-slate-400 text-sm">Nenhum texto padrão cadastrado.</p>
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
        </div>
      </div>
    </div>
  );
};
