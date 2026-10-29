import { useStore } from '../../store';

interface JobListProps {
  onPick?: () => void;
}

export function JobList({ onPick }: JobListProps) {
  const jobs = useStore((state) => state.jobs);
  const candidates = useStore((state) => state.candidates);
  const activeJobId = useStore((state) => state.activeJobId);
  const setActiveJob = useStore((state) => state.setActiveJob);
  const deleteJob = useStore((state) => state.deleteJob);
  const setNewJobOpen = useStore((state) => state.setNewJobOpen);

  const activeCount = (jobId: string) =>
    candidates.filter((c) => c.jobId === jobId && c.stage !== 'passed').length;

  return (
    <section aria-labelledby="jobs-heading">
      <h2 id="jobs-heading" className="text-sm font-semibold text-muted mb-2">
        Jobs
      </h2>

      {jobs.length > 0 && (
        <ul className="-mx-1">
          {jobs.map((job) => {
            const isActive = activeJobId === job.id;
            return (
              <li key={job.id} className="group flex items-center">
                <button
                  type="button"
                  onClick={() => {
                    setActiveJob(job.id);
                    onPick?.();
                  }}
                  aria-current={isActive ? 'true' : undefined}
                  className={`flex-1 min-w-0 min-h-11 md:min-h-10 px-1 py-1.5 flex items-center gap-3 text-left hover:underline ${
                    isActive ? 'text-accent font-semibold' : 'text-ink'
                  }`}
                >
                  <span className="min-w-0 break-words leading-snug">{job.title}</span>
                  {job.status === 'archived' && <span className="text-sm text-muted font-normal">archived</span>}
                  <span className="ml-auto text-sm text-muted font-normal">{activeCount(job.id)}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Delete "${job.title}" and all its candidates? This cannot be undone.`)) {
                      deleteJob(job.id);
                    }
                  }}
                  className="flex h-11 w-9 shrink-0 items-center justify-center text-muted hover:text-ink md:opacity-0 md:group-hover:opacity-100 md:focus:opacity-100"
                  aria-label={`Delete ${job.title}`}
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.6 8.5h5.8l.6-8.5" stroke="currentColor" strokeWidth="1.4" />
                  </svg>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <button
        type="button"
        onClick={() => {
          setNewJobOpen(true);
          onPick?.();
        }}
        className="mt-1 min-h-11 text-sm font-semibold text-accent hover:underline"
      >
        New job
      </button>
    </section>
  );
}
