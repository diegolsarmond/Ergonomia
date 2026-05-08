import React from 'react';

export const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className = '', ...props }, ref) => (
    <label
      ref={ref}
      className={`block text-[13px] font-medium text-slate-600 mb-1.5 ${className}`}
      {...props}
    />
  )
);
Label.displayName = 'Label';

const inputClasses = "flex w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 hover:border-slate-300";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className = '', ...props }, ref) => (
    <input ref={ref} className={`${inputClasses} ${className}`} {...props} />
  )
);
Input.displayName = 'Input';

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className = '', ...props }, ref) => (
    <textarea
      ref={ref}
      className={`${inputClasses} min-h-[80px] resize-none ${className}`}
      {...props}
    />
  )
);
Textarea.displayName = 'Textarea';

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className = '', children, ...props }, ref) => (
    <select ref={ref} className={`${inputClasses} appearance-none bg-[url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")] bg-no-repeat bg-[position:right_12px_center] pr-10 ${className}`} {...props}>
      {children}
    </select>
  )
);
Select.displayName = 'Select';

export const Checkbox = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className = '', ...props }, ref) => (
    <input
      type="checkbox"
      ref={ref}
      className={`w-4 h-4 rounded text-teal-600 border-slate-300 focus:ring-teal-500 cursor-pointer transition-all ${className}`}
      {...props}
    />
  )
);
Checkbox.displayName = 'Checkbox';

export const FormGroup = ({ label, htmlFor, children, required }: { label: string; htmlFor?: string; children: React.ReactNode; required?: boolean }) => (
  <div className="mb-4">
    <Label htmlFor={htmlFor}>{label} {required && <span className="text-red-400 ml-0.5">*</span>}</Label>
    {children}
  </div>
);

export const Combobox = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { options: { id: string | number; name: string }[], listId: string }>(
  ({ className = '', options, listId, ...props }, ref) => (
    <div className="relative">
      <input
        ref={ref}
        list={listId}
        className={`${inputClasses} appearance-none bg-[url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")] bg-no-repeat bg-[position:right_12px_center] pr-10 ${className}`}
        {...props}
      />
      <datalist id={listId}>
        {options.map((opt) => (
          <option key={opt.id} value={opt.name} />
        ))}
      </datalist>
    </div>
  )
);
Combobox.displayName = 'Combobox';
export const Toggle = ({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) => (
  <label className="flex items-center cursor-pointer select-none group">
    <div className="relative">
      <input type="checkbox" className="sr-only" checked={checked} onChange={e => onChange(e.target.checked)} />
      <div className={`block w-10 h-6 rounded-full transition-colors ${checked ? 'bg-teal-500' : 'bg-slate-300'}`} />
      <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform transform ${checked ? 'translate-x-4' : ''}`} />
    </div>
    {label && <span className="ml-3 text-sm text-slate-600 font-medium group-hover:text-slate-800 transition-colors">{label}</span>}
  </label>
);
Toggle.displayName = 'Toggle';

import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const QUILL_MODULES = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'align': [] }],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ['link'],
    ['clean']
  ]
};

export const RichText = ({ value, onChange, placeholder, className = "" }: { value: string; onChange: (v: string) => void; placeholder?: string; className?: string }) => (
  <div className={`bg-white rounded-xl overflow-hidden border border-slate-200 focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-500/20 transition-all ${className}`}>
    <ReactQuill 
      theme="snow"
      modules={QUILL_MODULES}
      value={value} 
      onChange={onChange} 
      placeholder={placeholder}
      className="min-h-[120px]"
    />
  </div>
);
RichText.displayName = 'RichText';

