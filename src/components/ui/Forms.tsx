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
