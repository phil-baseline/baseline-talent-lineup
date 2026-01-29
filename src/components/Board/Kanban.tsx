import { useMemo, useState, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useStore } from '../../store';
import type { Stage, Candidate } from '../../store/types';
import { Column } from './Column';
import { CandidateCard } from './CandidateCard';
import { Confetti } from '../common/Confetti';

const stages: Stage[] = ['sourced', 'interviewing', 'feedback', 'offer', 'hired'];

export function Kanban() {
  const [activeCandidate, setActiveCandidate] = useState<Candidate | null>(null);
  const [showPassed, setShowPassed] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [hiredCandidate, setHiredCandidate] = useState<{ id: string; name: string } | null>(null);
  const [showCloseoutModal, setShowCloseoutModal] = useState(false);

  const candidates = useStore((state) => state.candidates);
  const activeJobId = useStore((state) => state.activeJobId);
  const jobs = useStore((state) => state.jobs);
  const moveCandidate = useStore((state) => state.moveCandidate);
  const selectCandidate = useStore((state) => state.selectCandidate);
  const archiveJob = useStore((state) => state.archiveJob);
  const deleteJob = useStore((state) => state.deleteJob);

  const activeJob = jobs.find((j) => j.id === activeJobId);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const jobCandidates = useMemo(
    () => candidates.filter((c) => c.jobId === activeJobId),
    [candidates, activeJobId]
  );

  const passedCandidates = useMemo(
    () => jobCandidates.filter((c) => c.stage === 'passed'),
    [jobCandidates]
  );

  const triggerHiredCelebration = useCallback((candidateId: string, candidateName: string) => {
    setHiredCandidate({ id: candidateId, name: candidateName });
    setShowConfetti(true);
    setTimeout(() => {
      setShowConfetti(false);
      // Show the closeout modal after celebration
      setTimeout(() => {
        setShowCloseoutModal(true);
      }, 500);
    }, 3500);
  }, []);

  const candidatesByStage = useMemo(() => {
    return stages.reduce(
      (acc, stage) => {
        acc[stage] = jobCandidates.filter((c) => c.stage === stage);
        return acc;
      },
      {} as Record<Stage, Candidate[]>
    );
  }, [jobCandidates]);

  const handleDragStart = (event: DragStartEvent) => {
    const candidate = candidates.find((c) => c.id === event.active.id);
    setActiveCandidate(candidate || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveCandidate(null);

    if (!over) return;

    const candidateId = active.id as string;
    const overId = over.id as string;
    const candidate = candidates.find((c) => c.id === candidateId);

    let targetStage: Stage | null = null;

    if (stages.includes(overId as Stage)) {
      targetStage = overId as Stage;
    } else {
      const overCandidate = candidates.find((c) => c.id === overId);
      if (overCandidate) {
        targetStage = overCandidate.stage;
      }
    }

    if (targetStage) {
      moveCandidate(candidateId, targetStage);

      // Celebrate when someone is hired!
      if (targetStage === 'hired' && candidate && candidate.stage !== 'hired') {
        triggerHiredCelebration(candidate.id, candidate.name);
      }
    }
  };

  if (!activeJobId) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <svg
            className="w-16 h-16 text-sage/30 mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          <h2 className="font-headline text-xl text-stone">No job selected</h2>
          <p className="text-stone/70 mt-1">Create a job to start tracking candidates</p>
        </div>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex-1 overflow-x-auto p-6 flex flex-col">
        <div className="flex gap-4 flex-1 min-h-[500px]">
          {stages.map((stage) => (
            <Column key={stage} stage={stage} candidates={candidatesByStage[stage]} />
          ))}
        </div>

        {/* Passed candidates section */}
        {passedCandidates.length > 0 && (
          <div className="mt-4 pt-4 border-t border-brown/10">
            <button
              onClick={() => setShowPassed(!showPassed)}
              className="flex items-center gap-2 text-sm text-stone hover:text-brown transition-colors group"
            >
              <svg
                className={`w-4 h-4 transition-transform ${showPassed ? 'rotate-90' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span>
                {passedCandidates.length} passed candidate{passedCandidates.length !== 1 ? 's' : ''}
              </span>
              <span className="text-stone/50 text-xs group-hover:text-stone/70">
                {showPassed ? 'click to hide' : 'click to view'}
              </span>
            </button>

            {showPassed && (
              <div className="mt-3 flex flex-wrap gap-3">
                {passedCandidates.map((candidate) => (
                  <div
                    key={candidate.id}
                    onClick={() => selectCandidate(candidate.id)}
                    className="bg-surface/60 border border-brown/10 rounded px-3 py-2 cursor-pointer hover:bg-surface hover:border-brown/20 transition-all group/card"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-headline text-sm text-stone group-hover/card:text-deep-brown">
                        {candidate.name}
                      </span>
                      {candidate.company && (
                        <span className="text-xs text-stone/60">
                          {candidate.company}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <DragOverlay>
        {activeCandidate && (
          <div className="w-[256px]">
            <CandidateCard candidate={activeCandidate} isDragging />
          </div>
        )}
      </DragOverlay>

      {/* Hired celebration */}
      {showConfetti && <Confetti />}
      {hiredCandidate && !showCloseoutModal && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl px-8 py-6 shadow-2xl animate-in zoom-in duration-300">
            <div className="text-center">
              <div className="text-4xl mb-2">🎉</div>
              <h2 className="font-headline text-2xl font-semibold text-deep-brown">
                {hiredCandidate.name} is hired!
              </h2>
              <p className="text-stone mt-1">Congratulations on the new team member</p>
            </div>
          </div>
        </div>
      )}

      {/* Job closeout modal */}
      {showCloseoutModal && hiredCandidate && activeJob && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl animate-in zoom-in duration-200">
            <div className="text-center mb-6">
              <div className="text-3xl mb-3">🎯</div>
              <h2 className="font-headline text-xl font-semibold text-deep-brown">
                Role Filled!
              </h2>
              <p className="text-stone mt-2">
                <span className="font-medium text-deep-brown">{hiredCandidate.name}</span> has been hired for{' '}
                <span className="font-medium text-deep-brown">{activeJob.title}</span>
              </p>
              <p className="text-sm text-stone/70 mt-1">
                What would you like to do with this role?
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={async () => {
                  await archiveJob(activeJobId!, hiredCandidate.id);
                  setShowCloseoutModal(false);
                  setHiredCandidate(null);
                }}
                className="w-full py-3 px-4 bg-sage text-white rounded-full font-medium hover:bg-moss transition-colors"
              >
                Archive Role
                <span className="block text-xs font-normal opacity-80 mt-0.5">
                  Keep for records, remove from active view
                </span>
              </button>

              <button
                onClick={() => {
                  setShowCloseoutModal(false);
                  setHiredCandidate(null);
                }}
                className="w-full py-3 px-4 bg-cream text-deep-brown rounded-full font-medium hover:bg-brown/10 transition-colors"
              >
                Keep Role Open
                <span className="block text-xs font-normal opacity-70 mt-0.5">
                  Continue tracking other candidates
                </span>
              </button>

              <button
                onClick={async () => {
                  if (confirm('Delete this role and all its candidates? This cannot be undone.')) {
                    await deleteJob(activeJobId!);
                    setShowCloseoutModal(false);
                    setHiredCandidate(null);
                  }
                }}
                className="w-full py-2 text-sm text-stone hover:text-red-500 transition-colors"
              >
                Delete Role Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </DndContext>
  );
}
