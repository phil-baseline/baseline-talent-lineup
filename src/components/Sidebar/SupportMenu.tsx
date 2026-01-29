import { useState, useRef, useEffect } from 'react';

const CONTACT_EMAIL = 'phil@baselinetalent.xyz';

interface SupportMenuProps {
  onOpenPrivacy: () => void;
}

export function SupportMenu({ onOpenPrivacy }: SupportMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
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

  return (
    <div ref={menuRef} className="relative">
      {isOpen && (
        <div
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-72 bg-surface rounded-xl shadow-2xl border border-brown/10 overflow-hidden animate-in slide-in-from-bottom-2 fade-in duration-200"
        >
          {/* Header with logo */}
          <a
            href="https://baselinetalent.xyz"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-5 bg-gradient-to-br from-cream to-surface hover:from-sage/10 hover:to-cream transition-all duration-300 group"
          >
            <div className="w-10 h-10 rounded-lg bg-deep-brown/5 flex items-center justify-center group-hover:bg-sage/20 transition-colors">
              <img
                src="./assets/baseline_icon_black.svg"
                alt=""
                className="w-6 h-6 opacity-80 group-hover:opacity-100 transition-opacity"
              />
            </div>
            <div>
              <h3 className="font-headline font-semibold text-deep-brown text-lg leading-tight">
                Baseline Talent
              </h3>
              <span className="text-xs text-stone group-hover:text-sage transition-colors">
                baselinetalent.xyz →
              </span>
            </div>
          </a>

          {/* Action links */}
          <div className="p-4 space-y-1 border-t border-brown/5">
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-deep-brown/80 hover:bg-cream hover:text-deep-brown transition-all group"
            >
              <div className="w-8 h-8 rounded-full bg-sage/10 flex items-center justify-center group-hover:bg-sage/20 transition-colors">
                <svg className="w-4 h-4 text-sage" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <span className="text-sm font-medium">Get in touch</span>
                <p className="text-xs text-stone">Recruitment help & questions</p>
              </div>
            </a>

            <a
              href="https://ko-fi.com/baselinetalent"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-deep-brown/80 hover:bg-cream hover:text-deep-brown transition-all group"
            >
              <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
                <svg className="w-4 h-4 text-amber-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.881 8.948c-.773-4.085-4.859-4.593-4.859-4.593H.723c-.604 0-.679.798-.679.798s-.082 7.324-.022 11.822c.164 2.424 2.586 2.672 2.586 2.672s8.267-.023 11.966-.049c2.438-.426 2.683-2.566 2.658-3.734 4.352.24 7.422-2.831 6.649-6.916zm-11.062 3.511c-1.246 1.453-4.011 3.976-4.011 3.976s-.121.119-.31.023c-.076-.057-.108-.09-.108-.09-.443-.441-3.368-3.049-4.034-3.954-.709-.965-1.041-2.7-.091-3.71.951-1.01 3.005-1.086 4.363.407 0 0 1.565-1.782 3.468-.963 1.904.82 1.832 3.011.723 4.311z"/>
                </svg>
              </div>
              <div className="flex-1">
                <span className="text-sm font-medium">Buy me a coffee</span>
                <p className="text-xs text-stone">Support Lineup's development</p>
              </div>
            </a>

            <a
              href={`mailto:${CONTACT_EMAIL}?subject=Lineup%20Feedback&body=Hi%20Phil%2C%0A%0A%5BDescribe%20the%20bug%20or%20feature%20request%20here%5D%0A%0AThanks!`}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-deep-brown/80 hover:bg-cream hover:text-deep-brown transition-all group"
            >
              <div className="w-8 h-8 rounded-full bg-moss/10 flex items-center justify-center group-hover:bg-moss/20 transition-colors">
                <svg className="w-4 h-4 text-moss" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
              </div>
              <div className="flex-1">
                <span className="text-sm font-medium">Send feedback</span>
                <p className="text-xs text-stone">Report bugs or request features</p>
              </div>
            </a>
          </div>

          {/* Footer links */}
          <div className="px-5 py-3 bg-cream/30 border-t border-brown/5">
            <div className="flex items-center justify-between text-xs text-stone">
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenPrivacy();
                }}
                className="hover:text-deep-brown transition-colors"
              >
                Privacy Policy
              </button>
              <a
                href="https://github.com/phil-baseline/baseline-talent-lineup"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-deep-brown transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                </svg>
                View on GitHub
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Trigger button - clean diamond icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          group relative p-2.5 rounded-full
          transition-all duration-300 ease-out
          ${isOpen
            ? 'bg-sage shadow-lg scale-105'
            : 'bg-cream/80 hover:bg-cream hover:shadow-md hover:scale-105'
          }
        `}
        aria-label="Support menu"
      >
        <img
          src="./assets/baseline_icon_black.svg"
          alt=""
          className={`w-5 h-5 transition-all duration-300 ${
            isOpen
              ? 'brightness-0 invert'
              : 'opacity-60 group-hover:opacity-100'
          }`}
        />

        {/* Subtle pulse ring on hover when closed */}
        {!isOpen && (
          <span className="absolute inset-0 rounded-full border-2 border-sage/0 group-hover:border-sage/20 transition-all duration-300" />
        )}
      </button>
    </div>
  );
}
