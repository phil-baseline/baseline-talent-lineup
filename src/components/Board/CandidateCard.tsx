import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Candidate } from '../../store/types';
import { useStore } from '../../store';
import { formatAge } from '../../lib/stages';

interface CandidateCardProps {
  candidate: Candidate;
  dragDisabled?: boolean;
}

function roleLine(candidate: Candidate) {
  return candidate.title && candidate.company
    ? `${candidate.title} at ${candidate.company}`
    : candidate.title || candidate.company;
}

// What the drag overlay shows: same text, no interactivity.
export function CardPreview({ candidate }: { candidate: Candidate }) {
  const role = roleLine(candidate);
  return (
    <div className="bg-paper py-1 cursor-grabbing">
      <p className="font-serif text-[1.0625rem] font-semibold leading-snug">{candidate.name}</p>
      {role && <p className="text-sm text-muted leading-snug mt-0.5">{role}</p>}
      <p className="text-[0.8125rem] text-muted mt-1">Added {formatAge(candidate.createdAt)}</p>
    </div>
  );
}

export function CandidateCard({ candidate, dragDisabled }: CandidateCardProps) {
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
      className={`list-none bg-paper ${isDragging ? 'opacity-0' : ''}`}
    >
      {/* Pointer drag only. Keyboard users open the candidate and change Stage there. */}
      <div
        {...listeners}
        onClick={() => selectCandidate(candidate.id)}
        className={`group py-1 ${dragDisabled ? 'cursor-pointer' : 'cursor-grab active:cursor-grabbing'}`}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            selectCandidate(candidate.id);
          }}
          aria-pressed={isSelected}
          className={`block text-left font-serif text-[1.0625rem] font-semibold leading-snug group-hover:underline ${
            isSelected ? 'text-accent' : 'text-ink'
          }`}
        >
          {candidate.name}
        </button>
        {role && <p className="text-sm text-muted leading-snug mt-0.5">{role}</p>}
        <p className="text-[0.8125rem] text-muted mt-1">Added {formatAge(candidate.createdAt)}</p>
      </div>
    </li>
  );
}
