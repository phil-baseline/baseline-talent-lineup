import { useEffect, useState } from 'react';
import { useStore } from '../../store';
import { JobList } from './JobList';
import { ImportExport } from './ImportExport';
import { SupportMenu } from './SupportMenu';
import { PrivacyPolicy } from '../PrivacyPolicy';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileDrawer({ isOpen, onClose }: MobileDrawerProps) {
  const activeJob = useStore((state) => state.jobs.find((j) => j.id === state.activeJobId));
  const [showPrivacy, setShowPrivacy] = useState(false);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close drawer on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40 md:hidden"
        onClick={onClose}
      />

      {/* Drawer */}
      <aside
        className={`fixed left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-surface z-50 md:hidden drawer-enter shadow-2xl flex flex-col`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between p-4 border-b border-brown/10">
          <h2 className="font-headline text-lg font-semibold text-deep-brown">
            {activeJob?.title || 'Select a Job'}
          </h2>
          <button
            onClick={onClose}
            className="mobile-touch-target flex items-center justify-center p-2 -mr-2 text-deep-brown hover:bg-cream/50 rounded-lg transition-colors"
            aria-label="Close menu"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          <JobList />
        </div>

        {/* Footer section */}
        <div className="border-t border-brown/10">
          <ImportExport />
          <div className="p-4">
            <div className="flex flex-col items-center gap-3">
              <span className="text-xs text-stone/70 italic tracking-wide">
                from the baseline workshop
              </span>
              <SupportMenu onOpenPrivacy={() => setShowPrivacy(true)} />
            </div>
          </div>
        </div>
      </aside>

      <PrivacyPolicy isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} />
    </>
  );
}
