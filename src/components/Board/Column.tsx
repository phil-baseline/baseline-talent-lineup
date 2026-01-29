import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Candidate, Stage } from '../../store/types';
import { CandidateCard } from './CandidateCard';

interface ColumnProps {
  stage: Stage;
  candidates: Candidate[];
}

const stageConfig: Record<Stage, { title: string; bgClass: string }> = {
  sourced: { title: 'Sourced', bgClass: 'bg-stage-applied' },
  interviewing: { title: 'Interviewing', bgClass: 'bg-stage-screening' },
  feedback: { title: 'Awaiting Feedback', bgClass: 'bg-stage-interview' },
  offer: { title: 'Offer', bgClass: 'bg-stage-decision' },
  hired: { title: 'Hired', bgClass: 'bg-emerald-100' },
  passed: { title: 'Passed', bgClass: 'bg-stone/10' },
};

export function Column({ stage, candidates }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage,
  });

  const config = stageConfig[stage];

  return (
    <div
      ref={setNodeRef}
      className={`
        flex flex-col min-w-[280px] w-[280px] h-full
        rounded-lg ${config.bgClass}
        transition-all duration-100
        ${isOver ? 'ring-2 ring-sage ring-opacity-50' : ''}
      `}
    >
      <div className="px-4 py-3 border-b border-brown/10">
        <h2 className="font-headline font-medium text-brown text-lg">
          {config.title}
        </h2>
        <p className="text-xs text-stone mt-0.5">
          {candidates.length} candidate{candidates.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        <SortableContext items={candidates.map(c => c.id)} strategy={verticalListSortingStrategy}>
          {candidates.map((candidate) => (
            <CandidateCard key={candidate.id} candidate={candidate} />
          ))}
        </SortableContext>

        {candidates.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <svg
              className="w-8 h-8 text-sage/40 mb-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            <p className="font-headline text-sm text-stone/70">No one here yet</p>
            <p className="text-xs text-stone/50 mt-1">Drag a candidate over</p>
          </div>
        )}
      </div>
    </div>
  );
}
