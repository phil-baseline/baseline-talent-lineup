import type { CandidateLink } from '../store/types';

export const sourceOptions = [
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'referral', label: 'Referral' },
  { value: 'job-board', label: 'Job Board' },
  { value: 'website', label: 'Website' },
  { value: 'other', label: 'Other' },
];

export function getLinkType(url: string): CandidateLink['type'] {
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.includes('linkedin.com')) return 'linkedin';
  if (lowerUrl.includes('github.com')) return 'github';
  if (
    lowerUrl.includes('portfolio') ||
    lowerUrl.includes('behance') ||
    lowerUrl.includes('dribbble') ||
    lowerUrl.includes('.dev') ||
    lowerUrl.includes('.design')
  ) {
    return 'portfolio';
  }
  return 'other';
}

export function normalizeUrl(url: string): string {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return 'https://' + url;
  }
  return url;
}

export function createLink(url: string): CandidateLink {
  const fullUrl = normalizeUrl(url.trim());
  return { type: getLinkType(fullUrl), url: fullUrl };
}
