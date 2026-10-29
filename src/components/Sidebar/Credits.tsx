interface CreditsProps {
  onOpenPrivacy: () => void;
}

const linkClass = 'block py-1 text-muted hover:text-ink hover:underline';

export function Credits({ onOpenPrivacy }: CreditsProps) {
  return (
    <div className="text-sm">
      <p className="mb-1 text-muted">
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
      <a href="https://ko-fi.com/baselinetalent" target="_blank" rel="noopener noreferrer" className={linkClass}>
        Buy Phil a coffee
      </a>
      <a
        href="https://github.com/phil-baseline/baseline-talent-lineup"
        target="_blank"
        rel="noopener noreferrer"
        className={linkClass}
      >
        Source code
      </a>
      <button type="button" onClick={onOpenPrivacy} className={linkClass}>
        Privacy
      </button>
    </div>
  );
}
