import { useState } from 'react';
import { useStore } from '../../store';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Textarea } from '../common/Textarea';

export function JobList() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newJobTitle, setNewJobTitle] = useState('');
  const [newJobDescription, setNewJobDescription] = useState('');

  const jobs = useStore((state) => state.jobs);
  const activeJobId = useStore((state) => state.activeJobId);
  const setActiveJob = useStore((state) => state.setActiveJob);
  const createJob = useStore((state) => state.createJob);
  const deleteJob = useStore((state) => state.deleteJob);

  const handleCreateJob = async () => {
    if (!newJobTitle.trim()) return;

    await createJob(newJobTitle.trim(), newJobDescription.trim() || undefined);
    setNewJobTitle('');
    setNewJobDescription('');
    setIsCreateModalOpen(false);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-brown/10">
        <h2 className="font-headline font-semibold text-brown text-sm uppercase tracking-wider">
          Jobs
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {jobs.length === 0 ? (
          <div className="text-center py-8 px-4">
            <p className="text-sm text-stone">No jobs yet</p>
            <p className="text-xs text-stone/70 mt-1">
              Create your first job to start tracking candidates
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {jobs.map((job) => (
              <button
                key={job.id}
                onClick={() => setActiveJob(job.id)}
                className={`
                  w-full text-left px-3 py-2.5 rounded-lg
                  transition-all duration-150
                  group flex items-center justify-between
                  ${activeJobId === job.id
                    ? 'bg-sage/10 text-sage'
                    : 'text-deep-brown hover:bg-cream'
                  }
                `}
              >
                <span className="font-medium text-sm truncate">{job.title}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Delete "${job.title}"? This will remove all candidates for this job.`)) {
                      deleteJob(job.id);
                    }
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 text-stone hover:text-red-500 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-brown/10">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setIsCreateModalOpen(true)}
          className="w-full"
        >
          <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Job
        </Button>
      </div>

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Job"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCreateJob();
          }}
          className="space-y-4"
        >
          <Input
            label="Job Title"
            value={newJobTitle}
            onChange={(e) => setNewJobTitle(e.target.value)}
            placeholder="e.g., Senior Software Engineer"
            autoFocus
          />
          <Textarea
            label="Description (optional)"
            value={newJobDescription}
            onChange={(e) => setNewJobDescription(e.target.value)}
            placeholder="Brief description of the role..."
            rows={3}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!newJobTitle.trim()}>
              Create Job
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
