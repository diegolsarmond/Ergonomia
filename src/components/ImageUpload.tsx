import React, { useRef } from 'react';
import { AETImage } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface Props {
  images: AETImage[];
  onChange: (images: AETImage[]) => void;
  category?: AETImage['category'];
}

const CATEGORY_LABELS: Record<AETImage['category'], string> = {
  workplace: 'Posto de Trabalho',
  bathroom: 'Banheiros/Refeitórios',
  equipment: 'Equipamentos',
  posture: 'Posturas',
  method: 'Métodos Científicos',
  risk_evidence: 'Evidências de Risco',
  other: 'Outras',
};

export const ImageUpload: React.FC<Props> = ({ images, onChange, category }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files as unknown as File[]).forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const newImg: AETImage = {
          id: uuidv4(),
          dataUrl: ev.target?.result as string,
          caption: file.name.replace(/\.[^/.]+$/, ''),
          category: category || 'other',
        };
        onChange([...images, newImg]);
      };
      reader.readAsDataURL(file);
    });
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleRemove = (id: string) => onChange(images.filter(img => img.id !== id));

  const handleCaptionChange = (id: string, caption: string) =>
    onChange(images.map(img => img.id === id ? { ...img, caption } : img));

  const handleCategoryChange = (id: string, cat: AETImage['category']) =>
    onChange(images.map(img => img.id === id ? { ...img, category: cat } : img));

  const filtered = category ? images.filter(img => img.category === category) : images;

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-teal-50 text-teal-700 rounded-lg border border-teal-200 hover:bg-teal-100 transition-colors text-sm font-medium"
        >
          <Upload className="w-4 h-4" /> Adicionar Imagem
        </button>
        <span className="text-xs text-gray-500">{filtered.length} imagem(ns)</span>
      </div>
      <input ref={inputRef} type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />
      
      {filtered.length === 0 && (
        <div className="flex flex-col items-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
          <ImageIcon className="w-10 h-10 mb-2" />
          <p className="text-sm">Nenhuma imagem adicionada</p>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {filtered.map(img => (
          <div key={img.id} className="relative group border rounded-lg overflow-hidden bg-gray-50">
            <img src={img.dataUrl} alt={img.caption} className="w-full h-40 object-cover" />
            <button
              type="button"
              onClick={() => handleRemove(img.id)}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3 h-3" />
            </button>
            <div className="p-2 space-y-1">
              <input
                type="text" value={img.caption}
                onChange={e => handleCaptionChange(img.id, e.target.value)}
                className="w-full text-xs border border-gray-200 rounded px-2 py-1"
                placeholder="Legenda..."
              />
              {!category && (
                <select
                  value={img.category}
                  onChange={e => handleCategoryChange(img.id, e.target.value as AETImage['category'])}
                  className="w-full text-xs border border-gray-200 rounded px-2 py-1"
                >
                  {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
