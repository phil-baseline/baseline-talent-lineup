import { useState, useRef, useEffect } from 'react';

const CONTACT_EMAIL = 'phil@baselinetalent.xyz';

interface SupportMenuProps {
  onOpenPrivacy: () => void;
}

export function SupportMenu({ onOpenPrivacy }: SupportMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy email:', err);
    }
  };

  return (
    <div ref={menuRef} className="relative">
      {isOpen && (
        <div
          className="absolute bottom-full left-0 mb-2 w-64 bg-surface rounded-lg shadow-xl border border-brown/10 overflow-hidden animate-in slide-in-from-bottom-2 fade-in duration-200"
        >
          <div className="p-4 border-b border-brown/10 flex items-center gap-3">
            <img
              src="./assets/baseline_icon_black.svg"
              alt="Baseline"
              className="w-8 h-8"
            />
            <div>
              <h3 className="font-headline font-semibold text-deep-brown">
                Baseline Talent
              </h3>
              <a
                href="https://baselinetalent.xyz"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-sage hover:underline"
              >
                baselinetalent.xyz
              </a>
            </div>
          </div>

          <div className="p-4 space-y-4">
            <div>
              <p className="text-sm text-deep-brown font-medium">
                Need recruitment help?
              </p>
              <div className="flex items-center gap-2 mt-1">
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="text-sm text-sage hover:text-moss transition-colors"
                >
                  {CONTACT_EMAIL}
                </a>
                <button
                  onClick={handleCopyEmail}
                  className="relative p-1 text-stone hover:text-sage transition-colors rounded"
                  aria-label="Copy email address"
                >
                  {copied ? (
                    <svg className="w-4 h-4 text-moss" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  )}
                  {copied && (
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-deep-brown text-white text-xs rounded whitespace-nowrap animate-in fade-in slide-in-from-bottom-1 duration-150">
                      Copied!
                    </span>
                  )}
                </button>
              </div>
            </div>

            <div>
              <p className="text-sm text-deep-brown font-medium">
                Like Lineup?
              </p>
              <a
                href="https://ko-fi.com/baselinetalent"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-sage hover:text-moss transition-colors inline-flex items-center gap-1.5 mt-1"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.881 8.948c-.773-4.085-4.859-4.593-4.859-4.593H.723c-.604 0-.679.798-.679.798s-.082 7.324-.022 11.822c.164 2.424 2.586 2.672 2.586 2.672s8.267-.023 11.966-.049c2.438-.426 2.683-2.566 2.658-3.734 4.352.24 7.422-2.831 6.649-6.916zm-11.062 3.511c-1.246 1.453-4.011 3.976-4.011 3.976s-.121.119-.31.023c-.076-.057-.108-.09-.108-.09-.443-.441-3.368-3.049-4.034-3.954-.709-.965-1.041-2.7-.091-3.71.951-1.01 3.005-1.086 4.363.407 0 0 1.565-1.782 3.468-.963 1.904.82 1.832 3.011.723 4.311z"/>
                </svg>
                Buy me a coffee
              </a>
            </div>

            <div>
              <p className="text-sm text-deep-brown font-medium">
                Found a bug?
              </p>
              <a
                href={`mailto:${CONTACT_EMAIL}?subject=Lineup%20Feedback&body=Hi%20Phil%2C%0A%0A%5BDescribe%20the%20bug%20or%20feature%20request%20here%5D%0A%0AThanks!`}
                className="text-sm text-sage hover:text-moss transition-colors inline-flex items-center gap-1.5 mt-1"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                Send feedback
              </a>
            </div>
          </div>

          <div className="px-4 py-3 bg-cream/50 border-t border-brown/10">
            <div className="flex items-center justify-center gap-3 text-xs text-stone">
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenPrivacy();
                }}
                className="hover:text-deep-brown transition-colors"
              >
                Privacy
              </button>
              <span className="text-stone/30">·</span>
              <a
                href="https://github.com/phil-baseline/baseline-talent-lineup"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-deep-brown transition-colors"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center justify-center w-10 h-10 rounded-full
          transition-all duration-200
          ${isOpen
            ? 'bg-sage text-white'
            : 'bg-cream text-sage hover:bg-sage/10'
          }
        `}
        aria-label="Support menu"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      </button>
    </div>
  );
}
