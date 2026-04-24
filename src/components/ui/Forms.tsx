import React from 'react';

export const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className = '', ...props }, ref) => (
    <label
      ref={ref}
      className={`block text-sm font-medium text-gray-700 mb-1 ${className}`}
      {...props}
    />
  )
);
Label.displayName = 'Label';

const inputClasses = "flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-colors";

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
      className={`${inputClasses} min-h-[80px] ${className}`}
      {...props}
    />
  )
);
Textarea.displayName = 'Textarea';

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className = '', children, ...props }, ref) => (
    <select ref={ref} className={`${inputClasses} appearance-none ${className}`} {...props}>
      {children}
    </select>
  )
);
Select.displayName = 'Select';

export const FormGroup = ({ label, htmlFor, children, required }: { label: string; htmlFor?: string; children: React.ReactNode; required?: boolean }) => (
  <div className="mb-4">
    <Label htmlFor={htmlFor}>{label} {required && <span className="text-red-500">*</span>}</Label>
    {children}
  </div>
);
