import { useStore } from '../../store';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';

interface HiredDialogProps {
  candidate: { id: string; name: string } | null;
  onClose: () => void;
}

export function HiredDialog({ candidate, onClose }: HiredDialogProps) {
  const activeJobId = useStore((state) => state.activeJobId);
  const activeJob = useStore((state) => state.jobs.find((j) => j.id === state.activeJobId));
  const archiveJob = useStore((state) => state.archiveJob);
  const deleteJob = useStore((state) => state.deleteJob);

  if (!candidate || !activeJob || !activeJobId) return null;

  return (
    <Modal isOpen onClose={onClose} title={`${candidate.name} is hired`}>
      <p className="text-muted mb-8">
        What do you want to do with the {activeJob.title} job? Archiving keeps the record and moves it out of the way.
      </p>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <Button
          onClick={async () => {
            await archiveJob(activeJobId, candidate.id);
            onClose();
          }}
        >
          Archive the job
        </Button>
        <Button variant="text" onClick={onClose}>
          Keep it open
        </Button>
        <Button
          variant="quiet"
          onClick={async () => {
            if (confirm('Delete this job and all its candidates? This cannot be undone.')) {
              await deleteJob(activeJobId);
              onClose();
            }
          }}
        >
          Delete the job
        </Button>
      </div>
    </Modal>
  );
}
