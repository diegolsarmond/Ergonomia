import React, { useRef, useState, useEffect } from 'react';
import { useAET } from '../context/AETContext';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { FormGroup, Input, Textarea } from '../components/ui/Forms';
import { ScientificMethodTemplate } from '../types';
import { Trash2, Edit, Upload, X, Plus, FlaskConical, ImageIcon } from 'lucide-react';

export const ScientificMethodsParameters = () => {
  const {
    scientificMethodTemplates,
    addScientificMethodTemplate,
    updateScientificMethodTemplate,
    deleteScientificMethodTemplate,
  } = useAET();

  // ── Modal state ────────────────────────────────────────────────────────────
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageDataUrls, setImageDataUrls] = useState<string[]>([]);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // ── Confirm-delete state ───────────────────────────────────────────────────
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setImageDataUrls([]);
  };

  const openNewModal = () => {
    resetForm();
    setModalOpen(true);
  };

  const openEditModal = (t: ScientificMethodTemplate) => {
    setEditingId(t.id);
    setName(t.name);
    setDescription(t.description);
    setImageDataUrls(t.imageDataUrls || []);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    resetForm();
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    if (editingId) {
      await updateScientificMethodTemplate(editingId, { name, description, imageDataUrls });
    } else {
      await addScientificMethodTemplate({ name, description, imageDataUrls });
    }
    closeModal();
  };

  const handleDelete = async (id: string) => {
    await deleteScientificMethodTemplate(id);
    setDeletingId(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        setImageDataUrls((prev) => [...prev, dataUrl]);
      };
      reader.readAsDataURL(file);
    }

    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  const removeImage = (index: number) => {
    setImageDataUrls((prev) => prev.filter((_, i) => i !== index));
  };

  // Close modal on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (deletingId) setDeletingId(null);
        else if (modalOpen) closeModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modalOpen, deletingId]);

  return (
    <div className="p-6 lg:p-8 xl:p-10 pb-24">
      {/* ── Page Header ──────────────────────────────────────────── */}
      <div className="page-header mb-8">
        <div className="flex justify-between items-center relative z-10">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Métodos Científicos</h1>
            <p className="text-teal-200 text-sm mt-1">Parâmetros de métodos utilizados nas análises</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <FlaskConical className="w-4 h-4 text-teal-200" />
              </div>
              <div>
                <p className="text-xl font-bold">{scientificMethodTemplates.length}</p>
                <p className="text-[11px] text-teal-200">cadastrados</p>
              </div>
            </div>
            <Button
              size="sm"
              className="!bg-white/15 !text-white hover:!bg-white/25 !shadow-none !border-white/20 !border"
              onClick={openNewModal}
            >
              <Plus className="w-4 h-4" />
              Novo Método
            </Button>
          </div>
        </div>
      </div>

      {/* ── List ──────────────────────────────────────────────────── */}
      {scientificMethodTemplates.length === 0 ? (
        <div className="empty-state">
          <FlaskConical className="w-12 h-12 mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-semibold text-slate-500 mb-1">Nenhum método cadastrado</h3>
          <p className="text-slate-400 text-sm mb-6">
            Cadastre métodos científicos para utilizá-los nas análises ergonômicas.
          </p>
          <Button onClick={openNewModal}>
            <Plus className="w-4 h-4" />
            Cadastrar Primeiro Método
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {scientificMethodTemplates.map((t) => (
            <Card key={t.id} className="group flex flex-col">
              <CardContent className="!p-0 flex flex-col flex-1">
                {/* Thumbnail area */}
                {(t.imageDataUrls || []).length > 0 ? (
                  <div className="relative h-40 bg-slate-50 rounded-t-2xl overflow-hidden border-b border-slate-100">
                    <img
                      src={t.imageDataUrls[0]}
                      alt={t.name}
                      className="w-full h-full object-contain p-2"
                    />
                    {t.imageDataUrls.length > 1 && (
                      <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[11px] px-2 py-0.5 rounded-full flex items-center gap-1">
                        <ImageIcon className="w-3 h-3" />
                        {t.imageDataUrls.length}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-32 bg-gradient-to-br from-slate-50 to-slate-100 rounded-t-2xl flex items-center justify-center border-b border-slate-100">
                    <FlaskConical className="w-10 h-10 text-slate-200" />
                  </div>
                )}

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-semibold text-slate-800 text-[15px] mb-1.5">{t.name}</h3>
                  {t.description ? (
                    <p className="text-sm text-slate-500 line-clamp-3 flex-1">{t.description}</p>
                  ) : (
                    <p className="text-sm text-slate-400 italic flex-1">Sem descrição</p>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                    {(t.imageDataUrls || []).length > 0 ? (
                      <span className="stat-badge !text-[11px] !px-2 !py-0.5">
                        {t.imageDataUrls.length} imagem(ns)
                      </span>
                    ) : (
                      <span />
                    )}
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="!rounded-lg"
                        onClick={() => openEditModal(t)}
                      >
                        <Edit className="w-4 h-4 text-slate-400" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="!rounded-lg"
                        onClick={() => setDeletingId(t.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ── Create / Edit Modal ──────────────────────────────────── */}
      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div
            className="modal-content bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-800">
                {editingId ? 'Editar Método Científico' : 'Novo Método Científico'}
              </h2>
              <button
                onClick={closeModal}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-5">
              <FormGroup label="Nome do Método" required>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: RULA, REBA, NIOSH..."
                  autoFocus
                />
              </FormGroup>

              <FormGroup label="Descrição / Fundamentação Teórica">
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  placeholder="Descreva o método, sua fundamentação e como é aplicado..."
                />
              </FormGroup>

              {/* ── Image upload ──────────────────────────────────── */}
              <div>
                <label className="block text-[13px] font-medium text-slate-600 mb-2">
                  Imagens Ilustrativas
                </label>

                {imageDataUrls.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
                    {imageDataUrls.map((url, idx) => (
                      <div
                        key={idx}
                        className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-50"
                      >
                        <img
                          src={url}
                          alt={`Imagem ${idx + 1}`}
                          className="w-full h-28 object-contain p-1"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute top-1.5 right-1.5 bg-white/90 rounded-full p-1 shadow-sm text-red-500 hover:text-red-700 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 bg-black/40 text-white text-[10px] text-center py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          {idx + 1} / {imageDataUrls.length}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-slate-200 rounded-xl text-sm text-slate-400 hover:border-teal-400 hover:text-teal-600 transition-colors w-full justify-center cursor-pointer"
                >
                  {imageDataUrls.length === 0 ? (
                    <>
                      <Upload className="w-4 h-4" />
                      Carregar Imagens
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Adicionar mais imagens
                    </>
                  )}
                </button>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageChange}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl">
              <Button variant="ghost" onClick={closeModal}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={!name.trim()}>
                {editingId ? 'Salvar Alterações' : 'Cadastrar Método'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ────────────────────────────── */}
      {deletingId && (
        <div className="modal-overlay" onClick={() => setDeletingId(null)}>
          <div
            className="modal-content bg-white rounded-2xl shadow-2xl w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-5 h-5 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-1">Excluir Método?</h3>
              <p className="text-sm text-slate-500 mb-6">
                Esta ação não pode ser desfeita. O método será removido permanentemente.
              </p>
              <div className="flex gap-2 justify-center">
                <Button variant="ghost" onClick={() => setDeletingId(null)}>
                  Cancelar
                </Button>
                <Button variant="danger" onClick={() => handleDelete(deletingId)}>
                  Excluir
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
