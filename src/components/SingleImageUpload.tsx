import React, { useRef } from 'react';
import { Upload, X } from 'lucide-react';

interface Props {
  value: string;
  onChange: (dataUrl: string) => void;
  label?: string;
}

export const SingleImageUpload: React.FC<Props> = ({ value, onChange, label }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onChange(ev.target?.result as string);
    reader.readAsDataURL(file);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-teal-50 text-teal-700 rounded-lg border border-teal-200 hover:bg-teal-100 transition-colors text-sm font-medium"
        >
          <Upload className="w-4 h-4" /> {label ?? 'Adicionar Imagem'}
        </button>
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="inline-flex items-center gap-1 px-3 py-2 text-red-600 text-sm hover:bg-red-50 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" /> Remover
          </button>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
      {value && (
        <img src={value} alt={label ?? 'imagem'} className="max-h-48 rounded-lg border border-gray-200 object-contain" />
      )}
    </div>
  );
};
