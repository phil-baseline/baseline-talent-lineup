import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { AppState, Job, Candidate, Stage, Source, CandidateLink } from './types';
import { loadFromStorage, saveToStorage, initializeStorage, saveResumeFile, isFilesystemMode } from '../lib/fileStorage';

interface AppActions {
  // Initialization
  initialize: () => Promise<void>;
  setStorageMode: (mode: 'filesystem' | 'localstorage', handle?: FileSystemDirectoryHandle) => Promise<void>;

  // Jobs
  createJob: (title: string, description?: string) => Promise<Job>;
  updateJob: (id: string, updates: Partial<Omit<Job, 'id' | 'createdAt'>>) => Promise<void>;
  deleteJob: (id: string) => Promise<void>;
  archiveJob: (id: string, hiredCandidateId?: string) => Promise<void>;
  setActiveJob: (id: string | null) => void;

  // Candidates
  createCandidate: (data: {
    name: string;
    email?: string;
    phone?: string;
    title?: string;
    company?: string;
    links?: CandidateLink[];
    source: Source;
    sourceDetail?: string;
    notes?: string;
    tags?: string[];
    resumeData?: string;
    resumeFile?: File;
  }) => Promise<Candidate>;
  updateCandidate: (id: string, updates: Partial<Omit<Candidate, 'id' | 'jobId' | 'createdAt'>>) => Promise<void>;
  deleteCandidate: (id: string) => Promise<void>;
  moveCandidate: (id: string, newStage: Stage) => Promise<void>;
  selectCandidate: (id: string | null) => void;

  // Tags
  addCustomTag: (tag: string) => Promise<void>;

  // Import/Export
  exportData: () => Promise<string>;
  importData: (jsonData: string) => Promise<{ newJobs: number; newCandidates: number }>;

  // Error handling
  clearError: () => void;
}

type Store = AppState & AppActions;

export const useStore = create<Store>((set, get) => ({
  // Initial state
  jobs: [],
  candidates: [],
  settings: {
    storageMode: 'localstorage',
    customTags: [],
  },
  activeJobId: null,
  selectedCandidateId: null,
  isLoading: true,
  error: null,

  // Initialization
  initialize: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await loadFromStorage();
      if (data) {
        set({
          jobs: data.jobs || [],
          candidates: data.candidates || [],
          settings: { ...get().settings, ...data.settings },
          activeJobId: data.jobs?.[0]?.id || null,
        });
      }
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to load data' });
    } finally {
      set({ isLoading: false });
    }
  },

  setStorageMode: async (mode, handle) => {
    const newSettings = { ...get().settings, storageMode: mode, directoryHandle: handle };
    set({ settings: newSettings });

    if (mode === 'filesystem' && handle) {
      await initializeStorage(handle);
    }

    await saveToStorage({
      jobs: get().jobs,
      candidates: get().candidates,
      settings: newSettings,
    });
  },

  // Jobs
  createJob: async (title, description) => {
    const job: Job = {
      id: uuidv4(),
      title,
      description,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const jobs = [...get().jobs, job];
    set({ jobs, activeJobId: job.id });

    await saveToStorage({
      jobs,
      candidates: get().candidates,
      settings: get().settings,
    });

    return job;
  },

  updateJob: async (id, updates) => {
    const jobs = get().jobs.map(job =>
      job.id === id
        ? { ...job, ...updates, updatedAt: new Date().toISOString() }
        : job
    );
    set({ jobs });

    await saveToStorage({
      jobs,
      candidates: get().candidates,
      settings: get().settings,
    });
  },

  deleteJob: async (id) => {
    const jobs = get().jobs.filter(job => job.id !== id);
    const candidates = get().candidates.filter(c => c.jobId !== id);
    const activeJobId = get().activeJobId === id ? (jobs[0]?.id || null) : get().activeJobId;

    set({ jobs, candidates, activeJobId });

    await saveToStorage({
      jobs,
      candidates,
      settings: get().settings,
    });
  },

  archiveJob: async (id, hiredCandidateId) => {
    const jobs = get().jobs.map(job =>
      job.id === id
        ? {
            ...job,
            status: 'archived' as const,
            hiredCandidateId,
            updatedAt: new Date().toISOString(),
          }
        : job
    );

    // Move to next active job if this one was active
    const activeJobId = get().activeJobId === id
      ? (jobs.find(j => j.status === 'active')?.id || null)
      : get().activeJobId;

    set({ jobs, activeJobId });

    await saveToStorage({
      jobs,
      candidates: get().candidates,
      settings: get().settings,
    });
  },

  setActiveJob: (id) => {
    set({ activeJobId: id, selectedCandidateId: null });
  },

  // Candidates
  createCandidate: async (data) => {
    const activeJobId = get().activeJobId;
    if (!activeJobId) {
      throw new Error('No active job selected');
    }

    const candidateId = uuidv4();

    // Save resume file if in filesystem mode and file is provided
    let resumeFilename: string | undefined;
    if (data.resumeFile && isFilesystemMode()) {
      resumeFilename = await saveResumeFile(candidateId, data.resumeFile) || undefined;
    }

    const candidate: Candidate = {
      id: candidateId,
      jobId: activeJobId,
      name: data.name,
      email: data.email,
      phone: data.phone,
      title: data.title,
      company: data.company,
      links: data.links || [],
      stage: 'sourced',
      stageEnteredAt: new Date().toISOString(),
      source: data.source,
      sourceDetail: data.sourceDetail,
      notes: data.notes || '',
      tags: data.tags || [],
      resumeData: data.resumeData,
      resumeFilename,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const candidates = [...get().candidates, candidate];
    set({ candidates });

    await saveToStorage({
      jobs: get().jobs,
      candidates,
      settings: get().settings,
    });

    return candidate;
  },

  updateCandidate: async (id, updates) => {
    const candidates = get().candidates.map(candidate =>
      candidate.id === id
        ? { ...candidate, ...updates, updatedAt: new Date().toISOString() }
        : candidate
    );
    set({ candidates });

    await saveToStorage({
      jobs: get().jobs,
      candidates,
      settings: get().settings,
    });
  },

  deleteCandidate: async (id) => {
    const candidates = get().candidates.filter(c => c.id !== id);
    const selectedCandidateId = get().selectedCandidateId === id ? null : get().selectedCandidateId;

    set({ candidates, selectedCandidateId });

    await saveToStorage({
      jobs: get().jobs,
      candidates,
      settings: get().settings,
    });
  },

  moveCandidate: async (id, newStage) => {
    const candidates = get().candidates.map(candidate =>
      candidate.id === id
        ? {
            ...candidate,
            stage: newStage,
            stageEnteredAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
        : candidate
    );
    set({ candidates });

    await saveToStorage({
      jobs: get().jobs,
      candidates,
      settings: get().settings,
    });
  },

  selectCandidate: (id) => {
    set({ selectedCandidateId: id });
  },

  // Tags
  addCustomTag: async (tag) => {
    const settings = get().settings;
    if (!settings.customTags.includes(tag)) {
      const newSettings = {
        ...settings,
        customTags: [...settings.customTags, tag],
      };
      set({ settings: newSettings });

      await saveToStorage({
        jobs: get().jobs,
        candidates: get().candidates,
        settings: newSettings,
      });
    }
  },

  // Import/Export
  exportData: async () => {
    const data = {
      jobs: get().jobs,
      candidates: get().candidates,
      settings: {
        customTags: get().settings.customTags,
      },
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  },

  importData: async (jsonData) => {
    try {
      const data = JSON.parse(jsonData);

      if (!data.jobs || !data.candidates) {
        throw new Error('Invalid data format');
      }

      const existingJobs = get().jobs;
      const existingCandidates = get().candidates;
      const existingTags = get().settings.customTags;

      // Merge jobs - only add new ones (by ID)
      const existingJobIds = new Set(existingJobs.map(j => j.id));
      const newJobs = data.jobs.filter((j: Job) => !existingJobIds.has(j.id));
      const mergedJobs = [...existingJobs, ...newJobs];

      // Merge candidates - only add new ones (by ID)
      const existingCandidateIds = new Set(existingCandidates.map(c => c.id));
      const newCandidates = data.candidates.filter((c: Candidate) => !existingCandidateIds.has(c.id));
      const mergedCandidates = [...existingCandidates, ...newCandidates];

      // Merge custom tags
      const importedTags = data.settings?.customTags || [];
      const mergedTags = [...new Set([...existingTags, ...importedTags])];

      set({
        jobs: mergedJobs,
        candidates: mergedCandidates,
        settings: {
          ...get().settings,
          customTags: mergedTags,
        },
        activeJobId: get().activeJobId || mergedJobs[0]?.id || null,
      });

      await saveToStorage({
        jobs: mergedJobs,
        candidates: mergedCandidates,
        settings: get().settings,
      });

      // Return stats for feedback
      return { newJobs: newJobs.length, newCandidates: newCandidates.length };
    } catch (err) {
      throw new Error('Failed to import data: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  },

  // Error handling
  clearError: () => set({ error: null }),
}));
