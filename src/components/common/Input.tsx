import { type InputHTMLAttributes, forwardRef, useId } from 'react';
import { fieldClass } from './fieldClass';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, className = '', id, ...props }, ref) => {
    const generated = useId();
    const inputId = id ?? generated;
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-muted">
            {label}
          </label>
        )}
        <input ref={ref} id={inputId} className={`${fieldClass} ${className}`} {...props} />
        {hint && <p className="mt-1 text-sm text-muted">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
