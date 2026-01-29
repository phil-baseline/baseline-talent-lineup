import { useState, useRef, useEffect } from 'react';

const CONTACT_EMAIL = 'phil@baselinetalent.xyz';

interface SupportMenuProps {
  onOpenPrivacy: () => void;
}

export function SupportMenu({ onOpenPrivacy }: SupportMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState<'help' | 'bug' | null>(null);
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

  const handleCopyEmail = async (source: 'help' | 'bug') => {
    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL);
      setCopied(source);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy email:', err);
    }
  };

  return (
    <div ref={menuRef} className="relative">
      {isOpen && (
        <div
          className="absolute bottom-full left-0 mb-3 w-64 bg-surface rounded-xl shadow-2xl border border-brown/10 overflow-hidden animate-in slide-in-from-bottom-2 fade-in duration-200"
        >
          {/* Header */}
          <a
            href="https://baselinetalent.xyz"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 bg-gradient-to-br from-cream to-surface hover:from-sage/10 hover:to-cream transition-all duration-300 group"
          >
            <div className="w-9 h-9 rounded-lg bg-deep-brown/5 flex items-center justify-center group-hover:bg-sage/20 transition-colors">
              <img
                src="./assets/baseline_icon_black.svg"
                alt=""
                className="w-5 h-5 opacity-80 group-hover:opacity-100 transition-opacity"
              />
            </div>
            <div>
              <h3 className="font-headline font-semibold text-deep-brown leading-tight">
                Baseline Talent
              </h3>
              <span className="text-xs text-stone group-hover:text-sage transition-colors">
                baselinetalent.xyz →
              </span>
            </div>
          </a>

          {/* CTAs */}
          <div className="p-4 space-y-4 border-t border-brown/5">
            {/* Need help */}
            <div>
              <p className="text-sm text-deep-brown font-medium leading-snug">
                Need recruitment help?
                <span className="text-stone font-normal"> (or someone to vent to)</span>
              </p>
              <button
                onClick={() => handleCopyEmail('help')}
                className="mt-1.5 text-sm text-sage hover:text-moss transition-colors flex items-center gap-1.5 group"
              >
                <span>{CONTACT_EMAIL}</span>
                {copied === 'help' ? (
                  <span className="text-xs text-moss">✓ copied</span>
                ) : (
                  <svg className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>
            </div>

            {/* Digging Lineup */}
            <div>
              <p className="text-sm text-deep-brown font-medium">
                Digging Lineup?
              </p>
              <a
                href="https://ko-fi.com/baselinetalent"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1.5 text-sm text-sage hover:text-moss transition-colors inline-flex items-center gap-1.5"
              >
                <svg className="w-4 h-4 text-amber-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.881 8.948c-.773-4.085-4.859-4.593-4.859-4.593H.723c-.604 0-.679.798-.679.798s-.082 7.324-.022 11.822c.164 2.424 2.586 2.672 2.586 2.672s8.267-.023 11.966-.049c2.438-.426 2.683-2.566 2.658-3.734 4.352.24 7.422-2.831 6.649-6.916zm-11.062 3.511c-1.246 1.453-4.011 3.976-4.011 3.976s-.121.119-.31.023c-.076-.057-.108-.09-.108-.09-.443-.441-3.368-3.049-4.034-3.954-.709-.965-1.041-2.7-.091-3.71.951-1.01 3.005-1.086 4.363.407 0 0 1.565-1.782 3.468-.963 1.904.82 1.832 3.011.723 4.311z"/>
                </svg>
                <span>Buy Phil a coffee</span>
              </a>
            </div>

            {/* Found a bug */}
            <div>
              <p className="text-sm text-deep-brown font-medium">
                Found a bug?
              </p>
              <button
                onClick={() => handleCopyEmail('bug')}
                className="mt-1.5 text-sm text-sage hover:text-moss transition-colors flex items-center gap-1.5 group"
              >
                <span>{CONTACT_EMAIL}</span>
                {copied === 'bug' ? (
                  <span className="text-xs text-moss">✓ copied</span>
                ) : (
                  <svg className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 bg-cream/30 border-t border-brown/5">
            <div className="flex items-center justify-between text-xs text-stone">
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenPrivacy();
                }}
                className="hover:text-deep-brown transition-colors"
              >
                Privacy
              </button>
              <a
                href="https://github.com/phil-baseline/baseline-talent-lineup"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-deep-brown transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                </svg>
                GitHub
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          group relative p-2.5 rounded-full
          transition-all duration-300 ease-out
          ${isOpen
            ? 'bg-sage shadow-lg scale-105'
            : 'bg-cream hover:bg-sage/20 hover:shadow-md hover:scale-105 ring-2 ring-sage/20'
          }
        `}
        aria-label="Support menu"
      >
        <img
          src="./assets/baseline_icon_black.svg"
          alt=""
          className={`w-5 h-5 transition-all duration-500 ease-out ${
            isOpen
              ? 'brightness-0 invert rotate-180'
              : 'group-hover:rotate-12'
          }`}
        />
        {!isOpen && (
          <span className="absolute inset-0 rounded-full border-2 border-sage/0 group-hover:border-sage/30 transition-all duration-300" />
        )}
      </button>
    </div>
  );
}
