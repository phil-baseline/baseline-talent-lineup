import type { Stage } from '../store/types';

export const pipelineStages: Stage[] = ['sourced', 'interviewing', 'feedback', 'offer', 'hired'];

export const stageLabels: Record<Stage, string> = {
  sourced: 'Sourced',
  interviewing: 'Interviewing',
  feedback: 'Awaiting feedback',
  offer: 'Offer',
  hired: 'Hired',
  passed: 'Passed',
};

export const shortStageLabels: Record<Stage, string> = {
  ...stageLabels,
  feedback: 'Feedback',
};

export function formatAge(dateString: string): string {
  const diffDays = Math.floor((Date.now() - new Date(dateString).getTime()) / 86_400_000);
  if (diffDays <= 0) return 'today';
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 14) return '1 week ago';
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 60) return '1 month ago';
  return `${Math.floor(diffDays / 30)} months ago`;
}
