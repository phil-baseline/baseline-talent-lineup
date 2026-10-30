import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Candidate } from '../../store/types';
import { useStore } from '../../store';
import { formatAge } from '../../lib/stages';

export const MOVE_HINT_ID = 'card-move-hint';

interface CandidateCardProps {
  candidate: Candidate;
  dragDisabled?: boolean;
  onKeyMove?: (candidate: Candidate, step: -1 | 1) => void;
}

function roleLine(candidate: Candidate) {
  return candidate.title && candidate.company
    ? `${candidate.title} at ${candidate.company}`
    : candidate.title || candidate.company;
}

const nameClass = 'font-display text-t2 font-[640] leading-snug';

// What the drag overlay shows: same text, no interactivity.
export function CardPreview({ candidate }: { candidate: Candidate }) {
  const role = roleLine(candidate);
  return (
    <div className="bg-paper py-1 cursor-grabbing">
      <p className={nameClass}>{candidate.name}</p>
      {role && <p className="text-t1 text-muted leading-snug mt-0.5">{role}</p>}
      <p className="text-t1 text-muted mt-1">Added {formatAge(candidate.createdAt)}</p>
    </div>
  );
}

export function CandidateCard({ candidate, dragDisabled, onKeyMove }: CandidateCardProps) {
  const selectCandidate = useStore((state) => state.selectCandidate);
  const isSelected = useStore((state) => state.selectedCandidateId === candidate.id);

  const { listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: candidate.id,
    disabled: dragDisabled,
  });

  const role = roleLine(candidate);

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`list-none bg-paper ${isDragging ? 'invisible' : ''}`}
    >
      {/* Pointer drag on the whole card. Keyboard: arrow keys on the name move stages. */}
      <div
        {...listeners}
        onClick={() => selectCandidate(candidate.id)}
        className={`py-1 ${dragDisabled ? 'cursor-pointer' : 'cursor-grab active:cursor-grabbing'}`}
      >
        <button
          type="button"
          data-card-id={candidate.id}
          onClick={(e) => {
            e.stopPropagation();
            selectCandidate(candidate.id);
          }}
          onKeyDown={(e) => {
            if (!onKeyMove || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
            if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
              e.preventDefault();
              onKeyMove(candidate, e.key === 'ArrowRight' ? 1 : -1);
            }
          }}
          aria-pressed={isSelected}
          aria-describedby={onKeyMove ? MOVE_HINT_ID : undefined}
          className={`block text-left text-ink origin-[0_60%] ${nameClass} ${
            isSelected ? 'underline decoration-accent decoration-[3px] underline-offset-[0.22em]' : ''
          }`}
        >
          {candidate.name}
        </button>
        {role && <p className="text-t1 text-muted leading-snug mt-0.5">{role}</p>}
        <p className="text-t1 text-muted mt-1">Added {formatAge(candidate.createdAt)}</p>
      </div>
    </li>
  );
}
