import type { Job, Candidate, Settings } from '../store/types';

const STORAGE_KEY = 'lineup-data';

interface StorageData {
  jobs: Job[];
  candidates: Candidate[];
  settings: Partial<Settings>;
}

let directoryHandle: FileSystemDirectoryHandle | null = null;

declare global {
  interface Window {
    showDirectoryPicker?: (options?: {
      mode?: 'read' | 'readwrite';
      startIn?: 'desktop' | 'documents' | 'downloads' | 'music' | 'pictures' | 'videos';
    }) => Promise<FileSystemDirectoryHandle>;
  }
}

export function supportsFileSystemAccess(): boolean {
  return typeof window !== 'undefined' && 'showDirectoryPicker' in window;
}

export async function requestDirectoryAccess(): Promise<FileSystemDirectoryHandle | null> {
  if (!supportsFileSystemAccess() || !window.showDirectoryPicker) {
    return null;
  }

  try {
    const handle = await window.showDirectoryPicker({
      mode: 'readwrite',
      startIn: 'documents',
    });
    directoryHandle = handle;
    return handle;
  } catch (err) {
    if ((err as Error).name !== 'AbortError') {
      console.error('Failed to get directory access:', err);
    }
    return null;
  }
}

export async function initializeStorage(handle: FileSystemDirectoryHandle): Promise<void> {
  directoryHandle = handle;

  try {
    await handle.getDirectoryHandle('lineup-data', { create: true });
  } catch (err) {
    console.error('Failed to initialize storage directory:', err);
  }
}

async function getDataDirectory(): Promise<FileSystemDirectoryHandle | null> {
  if (!directoryHandle) return null;

  try {
    return await directoryHandle.getDirectoryHandle('lineup-data', { create: true });
  } catch {
    return null;
  }
}

async function readJsonFile<T>(dirHandle: FileSystemDirectoryHandle, filename: string): Promise<T | null> {
  try {
    const fileHandle = await dirHandle.getFileHandle(filename);
    const file = await fileHandle.getFile();
    const text = await file.text();
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function writeJsonFile(dirHandle: FileSystemDirectoryHandle, filename: string, data: unknown): Promise<void> {
  const fileHandle = await dirHandle.getFileHandle(filename, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(JSON.stringify(data, null, 2));
  await writable.close();
}

export async function loadFromStorage(): Promise<StorageData | null> {
  // Try filesystem first
  const dataDir = await getDataDirectory();
  if (dataDir) {
    try {
      const jobs = await readJsonFile<Job[]>(dataDir, 'jobs.json') || [];
      const candidates = await readJsonFile<Candidate[]>(dataDir, 'candidates.json') || [];
      const settings = await readJsonFile<Partial<Settings>>(dataDir, 'settings.json') || {};

      return { jobs, candidates, settings };
    } catch (err) {
      console.error('Failed to load from filesystem:', err);
    }
  }

  // Fallback to localStorage
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Failed to load from localStorage:', err);
  }

  return null;
}

export async function saveToStorage(data: StorageData): Promise<void> {
  // Try filesystem first
  const dataDir = await getDataDirectory();
  if (dataDir) {
    try {
      await writeJsonFile(dataDir, 'jobs.json', data.jobs);
      await writeJsonFile(dataDir, 'candidates.json', data.candidates);
      await writeJsonFile(dataDir, 'settings.json', {
        customTags: data.settings.customTags,
      });
      return;
    } catch (err) {
      console.error('Failed to save to filesystem:', err);
    }
  }

  // Fallback to localStorage
  try {
    const storableData = {
      ...data,
      settings: {
        customTags: data.settings.customTags,
        storageMode: data.settings.storageMode,
      },
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storableData));
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }
}

export function downloadJson(data: string, filename: string): void {
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

async function getResumesDirectory(): Promise<FileSystemDirectoryHandle | null> {
  const dataDir = await getDataDirectory();
  if (!dataDir) return null;

  try {
    return await dataDir.getDirectoryHandle('resumes', { create: true });
  } catch {
    return null;
  }
}

export async function saveResumeFile(candidateId: string, file: File): Promise<string | null> {
  const resumesDir = await getResumesDirectory();
  if (!resumesDir) return null;

  try {
    // Create a safe filename: candidateId-originalname.pdf
    const safeOriginalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${candidateId}-${safeOriginalName}`;

    const fileHandle = await resumesDir.getFileHandle(filename, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(file);
    await writable.close();

    return filename;
  } catch (err) {
    console.error('Failed to save resume file:', err);
    return null;
  }
}

export function isFilesystemMode(): boolean {
  return directoryHandle !== null;
}
