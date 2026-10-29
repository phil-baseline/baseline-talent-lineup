import { useRef, useState } from 'react';
import { useStore } from '../../store';
import { downloadJson, readFileAsText, requestDirectoryAccess, supportsFileSystemAccess } from '../../lib/fileStorage';

const actionClass = 'block min-h-11 md:min-h-9 text-left text-ink hover:underline disabled:text-muted';

export function ImportExport() {
  const [isImporting, setIsImporting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const exportData = useStore((state) => state.exportData);
  const importData = useStore((state) => state.importData);
  const setStorageMode = useStore((state) => state.setStorageMode);
  const settings = useStore((state) => state.settings);
  const isFolder = settings.storageMode === 'filesystem';

  const handleExport = async () => {
    try {
      const data = await exportData();
      const date = new Date().toISOString().split('T')[0];
      downloadJson(data, `lineup-export-${date}.json`);
    } catch {
      setMessage('Export failed. Try again.');
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsImporting(true);
    setMessage(null);
    try {
      const stats = await importData(await readFileAsText(file));
      if (stats.newJobs === 0 && stats.newCandidates === 0) {
        setMessage('Nothing new to import.');
      } else {
        const parts = [];
        if (stats.newJobs > 0) parts.push(`${stats.newJobs} job${stats.newJobs === 1 ? '' : 's'}`);
        if (stats.newCandidates > 0) parts.push(`${stats.newCandidates} candidate${stats.newCandidates === 1 ? '' : 's'}`);
        setMessage(`Imported ${parts.join(' and ')}.`);
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Import failed. Check the file and try again.');
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSetupFileSystem = async () => {
    setMessage(null);
    try {
      const handle = await requestDirectoryAccess();
      if (handle) {
        await setStorageMode('filesystem', handle);
      } else {
        setMessage('Folder access was cancelled.');
      }
    } catch (err) {
      setMessage(`Could not open that folder. ${err instanceof Error ? err.message : ''}`);
      console.error('File system access error:', err);
    }
  };

  return (
    <section aria-labelledby="data-heading">
      <h2 id="data-heading" className="text-sm font-semibold text-muted mb-1">
        Data
      </h2>
      <p className="text-sm text-muted mb-1">
        {isFolder ? 'Saved to a folder on this computer.' : 'Saved in this browser. Export to keep a backup.'}
      </p>

      {supportsFileSystemAccess() &&
        (isFolder ? (
          <button type="button" onClick={() => setStorageMode('localstorage', undefined)} className={actionClass}>
            Switch to browser storage
          </button>
        ) : (
          <button type="button" onClick={handleSetupFileSystem} className={actionClass}>
            Use a local folder
          </button>
        ))}
      <button type="button" onClick={handleExport} className={actionClass}>
        Export
      </button>
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={isImporting}
        className={actionClass}
      >
        {isImporting ? 'Importing' : 'Import'}
      </button>
      <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} className="hidden" />

      {message && (
        <p role="status" className="mt-1 text-sm text-ink">
          {message}
        </p>
      )}
    </section>
  );
}
