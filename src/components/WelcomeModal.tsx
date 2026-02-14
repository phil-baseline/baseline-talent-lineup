import { useState, useEffect } from 'react';

const STORAGE_KEY = 'lineup_welcome_dismissed';

export function WelcomeModal() {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (!dismissed) {
      // Small delay so the app loads first, then the modal fades in
      const timer = setTimeout(() => setIsVisible(true), 400);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismiss = () => {
    setIsClosing(true);
    setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, 'true');
      setIsVisible(false);
    }, 250);
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300 ${
        isClosing ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-deep-brown/40 backdrop-blur-sm"
        onClick={dismiss}
      />

      {/* Modal */}
      <div
        className={`relative w-full max-w-lg bg-surface rounded-2xl shadow-2xl border border-brown/10 overflow-hidden transition-all duration-300 ${
          isClosing
            ? 'scale-95 opacity-0 translate-y-2'
            : 'scale-100 opacity-100 translate-y-0'
        }`}
      >
        {/* Top accent stripe */}
        <div className="h-1 bg-gradient-to-r from-sage via-moss to-sage" />

        <div className="px-8 pt-8 pb-6">
          {/* Icon + Title */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sage/20 to-moss/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-moss" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
              </svg>
            </div>
            <h2 className="text-2xl font-headline font-semibold text-deep-brown">
              Welcome to Lineup
            </h2>
          </div>

          {/* Body */}
          <p className="text-stone leading-relaxed mb-4">
            Lineup is the applicant tracking system built by{' '}
            <a
              href="https://baselinetalent.xyz"
              className="text-sage font-medium hover:text-moss transition-colors underline underline-offset-2"
            >
              Baseline Talent
            </a>
            . It's how we manage every candidate pipeline — from first resume to signed offer.
          </p>

          <div className="space-y-3 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-lg bg-sage/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3.5 h-3.5 text-sage" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a9 9 0 01-9 9m0-18v.75" />
                </svg>
              </div>
              <p className="text-sm text-stone">
                <span className="font-medium text-deep-brown">Kanban pipeline</span> — drag candidates through stages as they progress
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-lg bg-sage/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3.5 h-3.5 text-sage" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm text-stone">
                <span className="font-medium text-deep-brown">Activity timeline</span> — every note, status change, and touchpoint in one place
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-lg bg-sage/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3.5 h-3.5 text-sage" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
              </div>
              <p className="text-sm text-stone">
                <span className="font-medium text-deep-brown">Multi-role tracking</span> — switch between open positions from the header
              </p>
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={dismiss}
            className="w-full py-3 px-6 bg-sage text-white font-medium rounded-xl hover:bg-moss transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-sage focus:ring-offset-2"
          >
            Got it, let's go
          </button>

          <p className="text-xs text-stone/60 text-center mt-3">
            Built with care in Canada
          </p>
        </div>
      </div>
    </div>
  );
}
