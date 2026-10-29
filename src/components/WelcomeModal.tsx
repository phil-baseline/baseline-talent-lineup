import { useEffect, useState } from 'react';
import { Button } from './common/Button';

const STORAGE_KEY = 'lineup_welcome_dismissed';

function wasDismissed() {
  try {
    return localStorage.getItem(STORAGE_KEY) !== null;
  } catch {
    return false;
  }
}

export function WelcomeModal() {
  const [isVisible, setIsVisible] = useState(() => !wasDismissed());

  const dismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, 'true');
    } catch {
      // Storage blocked: the welcome shows again next visit, which is fine.
    }
    setIsVisible(false);
  };

  useEffect(() => {
    if (!isVisible) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 z-[60] overflow-y-auto bg-paper"
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-title"
    >
      <div className="mx-auto max-w-xl px-4 sm:px-8 py-16 sm:py-24">
        <h1 id="welcome-title" className="font-serif text-[2.75rem] sm:text-[3.5rem] leading-none font-bold mb-8">
          Lineup
        </h1>
        <p className="font-serif text-[1.375rem] leading-snug font-semibold mb-6">
          A simple applicant tracker. Add a job, add candidates, and move them through the stages on a board.
        </p>
        <p className="text-muted mb-3">
          It is free and open source. It runs in your browser, with no account. Your data stays on your machine.
        </p>
        <p className="text-muted mb-10">
          Export now and then to keep a backup, or save to a folder on your computer.
        </p>
        <Button onClick={dismiss} autoFocus>
          Get started
        </Button>
        <p className="mt-12 text-sm text-muted">
          Made by{' '}
          <a
            href="https://www.linkedin.com/in/phil-mosher"
            target="_blank"
            rel="noopener noreferrer"
            className="text-ink underline hover:text-accent"
          >
            Phil Mosher
          </a>
        </p>
      </div>
    </div>
  );
}
