import { useStore } from '../store';
import { Button } from './common/Button';
import { Chevron } from './common/Select';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const jobs = useStore((state) => state.jobs);
  const activeJobId = useStore((state) => state.activeJobId);
  const setActiveJob = useStore((state) => state.setActiveJob);
  const setAddCandidateOpen = useStore((state) => state.setAddCandidateOpen);

  const activeJob = jobs.find((j) => j.id === activeJobId);

  return (
    <header className="flex items-center gap-4 md:gap-8 px-4 md:px-6 h-16 md:h-[4.5rem] shrink-0">
      <button
        type="button"
        onClick={onMenuClick}
        className="md:hidden -ml-3 flex h-11 w-11 items-center justify-center rounded-full text-ink"
        aria-label="Open menu"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="2" />
        </svg>
      </button>

      <span className="font-display text-t3 font-[760] [font-stretch:112%] leading-none">Lineup</span>

      {jobs.length > 0 && (
        <div className="relative hidden md:block max-w-80 min-w-0">
          <label htmlFor="job-switcher" className="sr-only">
            Current job
          </label>
          <select
            id="job-switcher"
            value={activeJobId || ''}
            onChange={(e) => setActiveJob(e.target.value)}
            className="w-full appearance-none bg-transparent border-0 rounded-none py-2 pl-0 pr-6 text-t2 font-semibold text-ink underline-2 truncate cursor-pointer"
          >
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title}
                {job.status === 'archived' ? ' (archived)' : ''}
              </option>
            ))}
          </select>
          <Chevron />
        </div>
      )}

      {activeJob && (
        <Button onClick={() => setAddCandidateOpen(true)} className="ml-auto">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="1.8" />
          </svg>
          <span className="md:hidden">Add</span>
          <span className="hidden md:inline">Add candidate</span>
        </Button>
      )}
    </header>
  );
}
