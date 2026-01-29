export type Stage = 'sourced' | 'interviewing' | 'feedback' | 'offer' | 'hired' | 'passed';

export type Source = 'linkedin' | 'referral' | 'job-board' | 'website' | 'other';

export type JobStatus = 'active' | 'archived' | 'closed';

export interface CandidateLink {
  type: 'linkedin' | 'github' | 'portfolio' | 'other';
  url: string;
  label?: string;
}

export interface Candidate {
  id: string;
  jobId: string;
  name: string;
  email?: string;
  phone?: string;
  title?: string;
  company?: string;
  links: CandidateLink[];
  stage: Stage;
  stageEnteredAt: string;
  source: Source;
  sourceDetail?: string;
  notes: string;
  tags: string[];
  resumeData?: string;
  resumeFilename?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Job {
  id: string;
  title: string;
  description?: string;
  status: JobStatus;
  hiredCandidateId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Settings {
  storageMode: 'filesystem' | 'localstorage';
  directoryHandle?: FileSystemDirectoryHandle;
  customTags: string[];
}

export interface AppState {
  jobs: Job[];
  candidates: Candidate[];
  settings: Settings;
  activeJobId: string | null;
  selectedCandidateId: string | null;
  isLoading: boolean;
  error: string | null;
}
