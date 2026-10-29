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
        <h1 id="welcome-title" className="font-display text-[3rem] sm:text-[4rem] font-[760] [font-stretch:112%] leading-none mb-8">
          Lineup
        </h1>
        <p className="text-t3 leading-[1.45] mb-6">
          A simple applicant tracker. Add a job, add candidates, and move them through the stages on a board.
        </p>
        <p className="text-t2 text-muted mb-3">
          It is free and open source. It runs in your browser, with no account. Your data stays on your machine.
        </p>
        <p className="text-t2 text-muted mb-10">
          Export now and then to keep a backup, or save to a folder on your computer.
        </p>
        <Button onClick={dismiss} autoFocus>
          Get started
        </Button>
        <p className="mt-12 text-t1 text-muted">
          Made by{' '}
          <a
            href="https://www.linkedin.com/in/phil-mosher"
            target="_blank"
            rel="noopener noreferrer"
            className="text-ink"
          >
            Phil Mosher
          </a>
        </p>
      </div>
    </div>
  );
}
