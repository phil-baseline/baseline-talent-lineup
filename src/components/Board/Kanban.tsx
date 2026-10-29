import { useMemo, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  pointerWithin,
  type CollisionDetection,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { useStore } from '../../store';
import { useIsMobile } from '../../hooks/useMediaQuery';
import type { Stage, Candidate } from '../../store/types';
import { pipelineStages, shortStageLabels, stageLabels } from '../../lib/stages';
import { Column } from './Column';
import { CardPreview } from './CandidateCard';
import { HiredDialog } from './HiredDialog';
import { Button } from '../common/Button';

// Prefer whatever is under the pointer, so a drop anywhere in a tall column lands there.
const collisionDetection: CollisionDetection = (args) => {
  const hits = pointerWithin(args);
  return hits.length > 0 ? hits : closestCorners(args);
};

export function Kanban() {
  const isMobile = useIsMobile();
  const [activeCandidate, setActiveCandidate] = useState<Candidate | null>(null);
  const [showPassed, setShowPassed] = useState(false);
  const [mobileStage, setMobileStage] = useState<Stage>('sourced');
  const [hiredCandidate, setHiredCandidate] = useState<{ id: string; name: string } | null>(null);

  const candidates = useStore((state) => state.candidates);
  const activeJobId = useStore((state) => state.activeJobId);
  const activeJob = useStore((state) => state.jobs.find((j) => j.id === state.activeJobId));
  const moveCandidate = useStore((state) => state.moveCandidate);
  const setNewJobOpen = useStore((state) => state.setNewJobOpen);
  const setAddCandidateOpen = useStore((state) => state.setAddCandidateOpen);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const jobCandidates = useMemo(() => candidates.filter((c) => c.jobId === activeJobId), [candidates, activeJobId]);

  const byStage = useMemo(() => {
    const groups = {} as Record<Stage, Candidate[]>;
    for (const stage of [...pipelineStages, 'passed' as Stage]) {
      groups[stage] = jobCandidates.filter((c) => c.stage === stage);
    }
    return groups;
  }, [jobCandidates]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveCandidate(candidates.find((c) => c.id === event.active.id) || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCandidate(null);
    if (!over) return;

    const candidate = candidates.find((c) => c.id === active.id);
    const overId = over.id as string;
    const targetStage = pipelineStages.includes(overId as Stage)
      ? (overId as Stage)
      : candidates.find((c) => c.id === overId)?.stage;

    if (!candidate || !targetStage || targetStage === 'passed' || targetStage === candidate.stage) return;
    moveCandidate(candidate.id, targetStage);
    if (targetStage === 'hired') {
      setHiredCandidate({ id: candidate.id, name: candidate.name });
    }
  };

  if (!activeJobId || !activeJob) {
    return (
      <div className="flex-1 px-4 md:px-6 pt-6 md:pt-2">
        <div className="max-w-md">
          <h1 className="font-serif text-[2rem] leading-tight font-semibold mb-3">Start with a job</h1>
          <p className="text-muted mb-6">
            Add the role you are hiring for. Then add candidates and move them through the stages as they progress.
          </p>
          <Button onClick={() => setNewJobOpen(true)}>Create a job</Button>
        </div>
      </div>
    );
  }

  const noCandidates = jobCandidates.length === 0;
  const firstCandidatePrompt = (
    <li className="list-none">
      <p className="text-muted mb-1">No candidates yet.</p>
      <Button variant="text" onClick={() => setAddCandidateOpen(true)}>
        Add your first candidate
      </Button>
    </li>
  );

  if (isMobile) {
    const tabs: Stage[] = [...pipelineStages, 'passed'];
    return (
      <div className="flex-1 min-w-0 overflow-y-auto px-4 pb-10">
        <h1 className="font-serif text-[1.5rem] leading-tight font-semibold mt-2 mb-3">{activeJob.title}</h1>
        <div role="tablist" aria-label="Stages" className="flex flex-wrap gap-x-5 mb-4 -mt-1">
          {tabs.map((stage) => {
            const selected = mobileStage === stage;
            return (
              <button
                key={stage}
                type="button"
                role="tab"
                id={`tab-${stage}`}
                aria-selected={selected}
                aria-controls="stage-panel"
                onClick={() => setMobileStage(stage)}
                className={`min-h-11 text-[0.9375rem] ${selected ? 'text-accent font-semibold underline underline-offset-[0.35em] decoration-2' : 'text-ink'}`}
              >
                {shortStageLabels[stage]} <span className={selected ? '' : 'text-muted'}>{byStage[stage].length}</span>
              </button>
            );
          })}
        </div>
        <div role="tabpanel" id="stage-panel" aria-labelledby={`tab-${mobileStage}`}>
          <DndContext sensors={sensors}>
            <Column
              stage={mobileStage}
              candidates={byStage[mobileStage]}
              dragDisabled
              showHeading={false}
              empty={
                noCandidates && mobileStage === 'sourced' ? (
                  firstCandidatePrompt
                ) : (
                  <li className="list-none text-muted">No one in {stageLabels[mobileStage].toLowerCase()}.</li>
                )
              }
            />
          </DndContext>
        </div>
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={collisionDetection} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex-1 min-w-0 overflow-x-auto overflow-y-hidden">
        <div className="flex h-full gap-6 px-6 pt-2">
          {pipelineStages.map((stage) => (
            <div key={stage} className="flex-1 min-w-40 max-w-64 h-full overflow-y-auto">
              <Column stage={stage} candidates={byStage[stage]} empty={noCandidates && stage === 'sourced' ? firstCandidatePrompt : undefined} />
            </div>
          ))}
          <div className={`${showPassed ? 'flex-1 min-w-40 max-w-64' : 'shrink-0'} h-full overflow-y-auto`}>
            <button
              type="button"
              onClick={() => setShowPassed(!showPassed)}
              aria-expanded={showPassed}
              className="flex items-baseline gap-2 mb-4 font-semibold text-accent hover:underline whitespace-nowrap"
            >
              {showPassed ? 'Hide passed' : 'Passed'}
              <span className="text-sm font-normal">{byStage.passed.length}</span>
            </button>
            {showPassed && <Column stage="passed" candidates={byStage.passed} showHeading={false} empty={<li className="list-none text-muted">No one passed yet.</li>} />}
          </div>
        </div>
      </div>

      <DragOverlay>
        {activeCandidate && (
          <div className="w-56">
            <CardPreview candidate={activeCandidate} />
          </div>
        )}
      </DragOverlay>

      <HiredDialog candidate={hiredCandidate} onClose={() => setHiredCandidate(null)} />
    </DndContext>
  );
}
