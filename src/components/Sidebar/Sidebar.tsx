import { useState } from 'react';
import { JobList } from './JobList';
import { ImportExport } from './ImportExport';
import { Credits } from './Credits';
import { PrivacyPolicy } from '../PrivacyPolicy';

export function Sidebar() {
  const [showPrivacy, setShowPrivacy] = useState(false);

  return (
    <>
      <aside className="hidden md:flex w-64 shrink-0 flex-col gap-10 overflow-y-auto pl-6 pr-4 pt-2 pb-6">
        <JobList />
        <ImportExport />
        <div className="mt-auto">
          <Credits onOpenPrivacy={() => setShowPrivacy(true)} />
        </div>
      </aside>
      <PrivacyPolicy isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} />
    </>
  );
}
