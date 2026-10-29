import { useState } from 'react';
import { useStore } from '../../store';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Textarea } from '../common/Textarea';

export function NewJobDialog() {
  const isOpen = useStore((state) => state.isNewJobOpen);
  const setOpen = useStore((state) => state.setNewJobOpen);
  const createJob = useStore((state) => state.createJob);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const close = () => {
    setTitle('');
    setDescription('');
    setOpen(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={close} title="New job">
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (!title.trim()) return;
          await createJob(title.trim(), description.trim() || undefined);
          close();
        }}
        className="space-y-6"
      >
        <Input
          label="Job title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
          required
        />
        <Textarea
          label="Notes on the role (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
        <div className="flex items-center gap-6 pt-2">
          <Button type="submit">
            Create job
          </Button>
          <Button variant="quiet" onClick={close}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
}
