import { useState } from 'react';
import { JobList } from './JobList';
import { ImportExport } from './ImportExport';
import { SupportMenu } from './SupportMenu';
import { PrivacyPolicy } from '../PrivacyPolicy';

export function Sidebar() {
  const [showPrivacy, setShowPrivacy] = useState(false);

  return (
    <>
      <aside className="w-60 bg-surface border-r border-brown/10 flex flex-col h-full">
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto">
            <JobList />
          </div>
          <ImportExport />
        </div>

        <div className="p-4 border-t border-brown/10 flex items-center justify-between">
          <SupportMenu onOpenPrivacy={() => setShowPrivacy(true)} />
          <a
            href="https://baselinetalent.xyz"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-stone hover:text-deep-brown transition-colors"
          >
            A Baseline Talent tool
            <img
              src="./assets/baseline_icon_black.svg"
              alt=""
              className="w-3.5 h-3.5 opacity-50"
            />
          </a>
        </div>
      </aside>

      <PrivacyPolicy isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} />
    </>
  );
}
