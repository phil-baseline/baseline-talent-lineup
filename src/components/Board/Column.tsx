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
}

export function Column({ stage, candidates, dragDisabled, showHeading = true, empty }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: stage, disabled: stage === 'passed' });
  const headingId = `col-${stage}`;

  return (
    <section ref={setNodeRef} aria-labelledby={showHeading ? headingId : undefined} className="flex flex-col min-w-0 h-full">
      {showHeading && (
        <h2 id={headingId} className={`flex items-baseline gap-2 mb-4 font-semibold ${isOver ? 'text-accent' : 'text-ink'}`}>
          {stageLabels[stage]}
          <span className="text-sm font-normal text-muted">{candidates.length}</span>
        </h2>
      )}

      <ul className="flex-1 flex flex-col gap-5 pb-6">
        <SortableContext items={candidates.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          {candidates.map((candidate) => (
            <CandidateCard key={candidate.id} candidate={candidate} dragDisabled={dragDisabled || stage === 'passed'} />
          ))}
        </SortableContext>
        {candidates.length === 0 && empty}
      </ul>
    </section>
  );
}
