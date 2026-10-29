import { useEffect, useState } from 'react';
import { JobList } from './JobList';
import { ImportExport } from './ImportExport';
import { Credits } from './Credits';
import { PrivacyPolicy } from '../PrivacyPolicy';
import { CloseButton } from '../common/Modal';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

// On phones the menu is a full-screen sheet on the page background.
export function MobileDrawer({ isOpen, onClose }: MobileDrawerProps) {
  const [showPrivacy, setShowPrivacy] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 overflow-y-auto bg-paper md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
        >
          <div className="flex items-center justify-between px-4 h-16">
            <span className="font-display text-t3 font-[760] [font-stretch:112%] leading-none">Lineup</span>
            <CloseButton onClick={onClose} label="Close menu" />
          </div>
          <div className="flex flex-col gap-10 px-4 pt-2 pb-10">
            <JobList onPick={onClose} />
            <ImportExport />
            <Credits onOpenPrivacy={() => setShowPrivacy(true)} />
          </div>
        </div>
      )}
      <PrivacyPolicy isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} />
    </>
  );
}
