import type { ReactNode } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Candidate, Stage } from '../../store/types';
import { stageLabels } from '../../lib/stages';
import { CandidateCard } from './CandidateCard';

interface ColumnProps {
  stage: Stage;
  candidates: Candidate[];
  dragDisabled?: boolean;
  showHeading?: boolean;
  empty?: ReactNode;
  onKeyMove?: (candidate: Candidate, step: -1 | 1) => void;
}

export function Column({ stage, candidates, dragDisabled, showHeading = true, empty, onKeyMove }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: stage, disabled: stage === 'passed' });
  const headingId = `col-${stage}`;

  return (
    <section ref={setNodeRef} aria-labelledby={showHeading ? headingId : undefined} className="flex flex-col min-w-0 h-full">
      {showHeading && (
        // The drop target is the current state while dragging, so it gets the red pill.
        <h2
          id={headingId}
          className={`self-start flex items-baseline gap-2 -ml-3 mb-3 px-3 py-1.5 rounded-[22px] text-t1 font-semibold ${
            isOver ? 'bg-accent text-on-accent' : 'text-ink'
          }`}
        >
          {stageLabels[stage]}
          <span className={`font-normal ${isOver ? '' : 'text-muted'}`}>{candidates.length}</span>
        </h2>
      )}

      <ul className="flex-1 flex flex-col gap-5 pb-6">
        <SortableContext items={candidates.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          {candidates.map((candidate) => (
            <CandidateCard
              key={candidate.id}
              candidate={candidate}
              dragDisabled={dragDisabled || stage === 'passed'}
              onKeyMove={stage === 'passed' ? undefined : onKeyMove}
            />
          ))}
        </SortableContext>
        {candidates.length === 0 && empty}
      </ul>
    </section>
  );
}
