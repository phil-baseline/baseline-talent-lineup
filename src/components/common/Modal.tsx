import { type ReactNode, useEffect, useId } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'default' | 'wide';
}

const sizeClasses = {
  default: 'max-w-xl',
  wide: 'max-w-6xl',
};

// A full-screen sheet on the page background: no scrim, no box, no shadow.
export function Modal({ isOpen, onClose, title, children, size = 'default' }: ModalProps) {
  const titleId = useId();

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-paper"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div className={`mx-auto w-full ${sizeClasses[size]} px-4 sm:px-8 pt-6 pb-16`}>
        <div className="flex items-start justify-between gap-4 mb-8">
          <h2 id={titleId} className="display text-[1.75rem] leading-tight pt-1">
            {title}
          </h2>
          <CloseButton onClick={onClose} />
        </div>
        {children}
      </div>
    </div>
  );
}

export function CloseButton({ onClick, label = 'Close' }: { onClick: () => void; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="-mr-3 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="2" />
      </svg>
    </button>
  );
}
