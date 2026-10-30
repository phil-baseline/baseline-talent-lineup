import { type ButtonHTMLAttributes, type ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'text' | 'quiet';
  children: ReactNode;
}

// primary: the red pill, dark text on red (never white). One per screen.
// text: an underlined action in the text colour. quiet: the same in muted.
const variants = {
  primary:
    'min-h-11 px-5 rounded-full bg-accent text-on-accent font-semibold disabled:bg-muted disabled:text-paper disabled:cursor-not-allowed',
  text: 'min-h-11 font-semibold text-ink underline-2 disabled:text-muted disabled:no-underline disabled:cursor-not-allowed',
  quiet: 'min-h-11 text-muted underline-2 hover:text-ink',
};

export function Button({ variant = 'primary', className = '', children, type = 'button', ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 text-t1 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
