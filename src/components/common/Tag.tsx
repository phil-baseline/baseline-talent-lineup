import { type ReactNode } from 'react';

interface TagProps {
  children: ReactNode;
  onRemove?: () => void;
  variant?: 'sage' | 'moss' | 'brown';
}

export function Tag({ children, onRemove, variant = 'sage' }: TagProps) {
  const variants = {
    sage: 'bg-stage-applied text-sage',
    moss: 'bg-stage-interview text-moss',
    brown: 'bg-stage-screening text-brown',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}
    >
      {children}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-0.5 hover:text-deep-brown transition-colors"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </span>
  );
}
