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

        <div className="p-4 border-t border-brown/10">
          <div className="flex flex-col items-center gap-3">
            <span className="text-xs text-stone/70 italic tracking-wide">
              from the baseline workshop
            </span>
            <SupportMenu onOpenPrivacy={() => setShowPrivacy(true)} />
          </div>
        </div>
      </aside>

      <PrivacyPolicy isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} />
    </>
  );
}
