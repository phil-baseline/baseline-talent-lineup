interface CreditsProps {
  onOpenPrivacy: () => void;
}

const linkClass = 'block w-fit py-1.5 text-muted underline-2 hover:text-ink origin-[0_60%]';

export function Credits({ onOpenPrivacy }: CreditsProps) {
  return (
    <div className="text-t1">
      <p className="mb-1 text-muted">
        Made by{' '}
        <a
          href="https://www.linkedin.com/in/phil-mosher"
          target="_blank"
          rel="noopener noreferrer"
          className="text-ink origin-[0_60%]"
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
