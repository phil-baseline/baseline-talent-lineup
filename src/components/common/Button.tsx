import { type ButtonHTMLAttributes, type ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'text' | 'quiet';
  children: ReactNode;
}

const variants = {
  primary:
    'min-h-11 px-4 rounded-[2px] bg-accent text-paper font-semibold hover:bg-ink disabled:bg-muted disabled:cursor-not-allowed',
  text: 'min-h-11 font-semibold text-accent hover:underline disabled:text-muted disabled:no-underline disabled:cursor-not-allowed',
  quiet: 'min-h-11 text-muted hover:text-ink hover:underline',
};

export function Button({ variant = 'primary', className = '', children, type = 'button', ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 text-sm transition-colors duration-150 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
