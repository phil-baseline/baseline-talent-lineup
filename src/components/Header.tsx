import { useState } from 'react';
import { useStore } from '../store';
import { Button } from './common/Button';
import { AddCandidateModal } from './CandidateDetail/AddCandidateModal';
import { useIsMobile } from '../hooks/useMediaQuery';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const isMobile = useIsMobile();

  const jobs = useStore((state) => state.jobs);
  const activeJobId = useStore((state) => state.activeJobId);
  const setActiveJob = useStore((state) => state.setActiveJob);

  const activeJob = jobs.find((j) => j.id === activeJobId);

  return (
    <>
      <header className={`${isMobile ? 'h-14 px-4' : 'h-16 px-6'} bg-surface border-b border-brown/10 flex items-center justify-between`}>
        <div className="flex items-center gap-4">
          {isMobile && (
            <button
              onClick={onMenuClick}
              className="mobile-touch-target flex items-center justify-center p-2 -ml-2 text-deep-brown hover:bg-cream/50 rounded-lg transition-colors"
              aria-label="Open menu"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}

          <h1 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-headline font-semibold text-deep-brown`}>
            Lineup
          </h1>

          {!isMobile && jobs.length > 0 && (
            <div className="relative">
              <select
                value={activeJobId || ''}
                onChange={(e) => setActiveJob(e.target.value)}
                className="appearance-none bg-cream/50 border border-brown/20 rounded-lg px-4 py-2 pr-10 text-sm font-medium text-deep-brown focus:outline-none focus:ring-2 focus:ring-sage cursor-pointer"
              >
                {jobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.title}
                  </option>
                ))}
              </select>
              <svg
                className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone pointer-events-none"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          {!isMobile && activeJob && (
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search candidates..."
                className="w-64 px-4 py-2 pl-10 bg-cream/50 border border-brown/20 rounded-lg text-sm text-deep-brown placeholder:text-stone/60 focus:outline-none focus:ring-2 focus:ring-sage"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          )}

          {activeJob && (
            <Button onClick={() => setIsAddModalOpen(true)}>
              <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {!isMobile && 'Add Candidate'}
            </Button>
          )}
        </div>
      </header>

      <AddCandidateModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </>
  );
}
