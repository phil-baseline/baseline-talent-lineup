import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Candidate, Stage } from '../../store/types';
import { Tag } from '../common/Tag';
import { LinkIcon } from '../common/LinkIcon';
import { useStore } from '../../store';

const stageOrder: Stage[] = ['sourced', 'interviewing', 'feedback', 'offer', 'hired'];
const stageLabels: Record<Stage, string> = {
  sourced: 'Sourced',
  interviewing: 'Interviewing',
  feedback: 'Feedback',
  offer: 'Offer',
  hired: 'Hired',
  passed: 'Passed',
};

interface CandidateCardProps {
  candidate: Candidate;
  isDragging?: boolean;
}

function getCardRotation(cardId: string): number {
  const hash = cardId.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0);
  return (hash % 7 - 3) * 0.3;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'today';
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
}


export function CandidateCard({ candidate, isDragging }: CandidateCardProps) {
  const [showStagePicker, setShowStagePicker] = useState(false);
  const selectCandidate = useStore((state) => state.selectCandidate);
  const moveCandidate = useStore((state) => state.moveCandidate);
  const rotation = getCardRotation(candidate.id);

  const currentStageIndex = stageOrder.indexOf(candidate.stage as Stage);
  const canMoveForward = currentStageIndex < stageOrder.length - 1 && candidate.stage !== 'passed';
  const canMoveBack = currentStageIndex > 0 && candidate.stage !== 'passed';

  const handleMoveForward = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (canMoveForward) {
      moveCandidate(candidate.id, stageOrder[currentStageIndex + 1]);
    }
  };

  const handleMoveBack = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (canMoveBack) {
      moveCandidate(candidate.id, stageOrder[currentStageIndex - 1]);
    }
  };

  const handleStageSelect = (e: React.MouseEvent, stage: Stage) => {
    e.stopPropagation();
    moveCandidate(candidate.id, stage);
    setShowStagePicker(false);
  };

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: candidate.id });

  const isBeingDragged = isDragging || isSortableDragging;

  const computedTransform = isBeingDragged
    ? CSS.Transform.toString(transform)
    : `rotate(${rotation}deg) ${transform ? CSS.Transform.toString(transform) : ''}`;

  const style: React.CSSProperties = {
    transform: computedTransform,
    transition,
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't open detail panel if clicking a link
    if ((e.target as HTMLElement).closest('a')) {
      return;
    }
    selectCandidate(candidate.id);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={handleCardClick}
      className={`
        group bg-surface rounded p-4 cursor-grab active:cursor-grabbing
        shadow-[0_2px_8px_rgba(0,0,0,0.04)]
        transition-all duration-200 ease-out
        ${isBeingDragged
          ? 'scale-[1.02] shadow-[0_12px_32px_rgba(0,0,0,0.12)] z-50'
          : 'hover:translate-y-[-2px] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:rotate-0'
        }
      `}
    >
      <h3 className="font-headline font-semibold text-deep-brown text-base">
        {candidate.name}
      </h3>

      {(candidate.title || candidate.company) && (
        <p className="text-sm text-brown mt-0.5">
          {candidate.title && candidate.company
            ? `${candidate.title} at ${candidate.company}`
            : candidate.title || candidate.company}
        </p>
      )}

      <p className="text-xs text-stone mt-1">
        Added {formatDate(candidate.createdAt)}
      </p>

      {candidate.links && candidate.links.length > 0 && (
        <div className="flex items-center gap-2 mt-2">
          {candidate.links.slice(0, 3).map((link, index) => (
            <a
              key={index}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-stone hover:text-sage transition-colors"
              title={link.type}
            >
              <LinkIcon type={link.type} size="sm" />
            </a>
          ))}
          {candidate.links.length > 3 && (
            <span className="text-xs text-stone">+{candidate.links.length - 3}</span>
          )}
        </div>
      )}

      {candidate.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {candidate.tags.slice(0, 3).map((tag) => (
            <Tag key={tag} variant="sage">{tag}</Tag>
          ))}
          {candidate.tags.length > 3 && (
            <span className="text-xs text-stone">+{candidate.tags.length - 3}</span>
          )}
        </div>
      )}

      {candidate.notes && (
        <p className="mt-2 text-sm text-stone italic line-clamp-2">
          "{candidate.notes.substring(0, 80)}{candidate.notes.length > 80 ? '...' : ''}"
        </p>
      )}

      {candidate.resumeData && (
        <div className="mt-2 flex items-center gap-1.5 text-sage">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="text-xs">Resume attached</span>
        </div>
      )}

      {/* Stage navigation - appears on hover */}
      {candidate.stage !== 'passed' && (
        <div className="mt-2 pt-0 max-h-0 overflow-hidden opacity-0 group-hover:max-h-12 group-hover:pt-2 group-hover:mt-3 group-hover:opacity-100 group-hover:border-t group-hover:border-brown/10 transition-all duration-200">
          <div className="flex items-center justify-between gap-2 relative">
            <button
              onClick={handleMoveBack}
              disabled={!canMoveBack}
              className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full transition-colors ${
                canMoveBack
                  ? 'text-stone hover:text-deep-brown hover:bg-cream'
                  : 'text-stone/30 cursor-not-allowed'
              }`}
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowStagePicker(!showStagePicker);
              }}
              className="text-xs text-stone hover:text-deep-brown px-2 py-1 rounded-full hover:bg-cream transition-colors"
            >
              {stageLabels[candidate.stage]}
              <svg className="w-3 h-3 inline ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <button
              onClick={handleMoveForward}
              disabled={!canMoveForward}
              className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full transition-colors ${
                canMoveForward
                  ? 'text-sage hover:text-moss hover:bg-sage/10'
                  : 'text-stone/30 cursor-not-allowed'
              }`}
            >
              Next
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Stage dropdown - opens downward to avoid clipping */}
            {showStagePicker && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-white rounded-lg shadow-lg border border-brown/10 py-1 z-50 min-w-[140px]">
                {stageOrder.map((stage) => (
                  <button
                    key={stage}
                    onClick={(e) => handleStageSelect(e, stage)}
                    className={`w-full text-left px-3 py-1.5 text-sm transition-colors ${
                      candidate.stage === stage
                        ? 'bg-sage/10 text-sage font-medium'
                        : 'text-deep-brown hover:bg-cream'
                    }`}
                  >
                    {stageLabels[stage]}
                  </button>
                ))}
                <div className="border-t border-brown/10 mt-1 pt-1">
                  <button
                    onClick={(e) => handleStageSelect(e, 'passed')}
                    className="w-full text-left px-3 py-1.5 text-sm text-stone hover:bg-red-50 hover:text-red-500 transition-colors"
                  >
                    Pass
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
