import { type SelectHTMLAttributes, forwardRef, useId } from 'react';
import { fieldClass } from './fieldClass';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, className = '', id, ...props }, ref) => {
    const generated = useId();
    const inputId = id ?? generated;
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-muted">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={inputId}
            className={`${fieldClass} appearance-none pr-7 cursor-pointer ${className}`}
            {...props}
          >
            {options.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <Chevron />
        </div>
      </div>
    );
  }
);

Select.displayName = 'Select';

export function Chevron() {
  return (
    <svg
      className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-ink"
      width="12"
      height="12"
      viewBox="0 0 12 12"
      aria-hidden="true"
    >
      <path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
