import { useRef, useState } from 'react';
import { useStore } from '../../store';
import { Button } from '../common/Button';
import { downloadJson, readFileAsText, requestDirectoryAccess, supportsFileSystemAccess } from '../../lib/fileStorage';

export function ImportExport() {
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const exportData = useStore((state) => state.exportData);
  const importData = useStore((state) => state.importData);
  const setStorageMode = useStore((state) => state.setStorageMode);
  const settings = useStore((state) => state.settings);

  const handleExport = async () => {
    try {
      const data = await exportData();
      const date = new Date().toISOString().split('T')[0];
      downloadJson(data, `lineup-export-${date}.json`);
    } catch (err) {
      setError('Failed to export data');
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setError(null);
    setSuccess(null);

    try {
      const text = await readFileAsText(file);
      const stats = await importData(text);

      // Show success message with what was added
      if (stats.newJobs === 0 && stats.newCandidates === 0) {
        setSuccess('No new data to import (everything already exists)');
      } else {
        const parts = [];
        if (stats.newJobs > 0) parts.push(`${stats.newJobs} job${stats.newJobs === 1 ? '' : 's'}`);
        if (stats.newCandidates > 0) parts.push(`${stats.newCandidates} candidate${stats.newCandidates === 1 ? '' : 's'}`);
        setSuccess(`Added ${parts.join(' and ')}`);
      }

      // Clear success after 5 seconds
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import data');
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSetupFileSystem = async () => {
    setError(null);
    try {
      const handle = await requestDirectoryAccess();
      if (handle) {
        await setStorageMode('filesystem', handle);
      } else {
        setError('Folder access was cancelled or denied');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to access folder: ${message}`);
      console.error('File system access error:', err);
    }
  };

  const handleDisconnectFolder = async () => {
    await setStorageMode('localstorage', undefined);
  };

  return (
    <div className="p-4 space-y-4 border-t border-brown/10">
      <div>
        <h3 className="font-headline font-semibold text-brown text-sm uppercase tracking-wider mb-3">
          Data
        </h3>

        <div className="mb-4">
          <p className="text-xs text-stone mb-2">
            {settings.storageMode === 'filesystem'
              ? 'Saving to local folder'
              : 'Data saved in your browser'}
          </p>
          {supportsFileSystemAccess() ? (
            settings.storageMode === 'filesystem' ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDisconnectFolder}
                className="w-full justify-start text-left text-stone"
              >
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Switch to browser storage
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSetupFileSystem}
                className="w-full justify-start text-left"
              >
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                Use local folder
              </Button>
            )
          ) : (
            <p className="text-xs text-stone/60">
              Use Export below to back up your data
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleExport}
            className="w-full justify-start text-left"
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export data
          </Button>
          {!supportsFileSystemAccess() && (
            <p className="text-xs text-stone/50 pl-6">
              Recommended: export regularly to avoid data loss
            </p>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            className="w-full justify-start text-left"
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            {isImporting ? 'Importing...' : 'Import data'}
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </div>

        {error && (
          <p className="mt-2 text-xs text-red-500">{error}</p>
        )}

        {success && (
          <p className="mt-2 text-xs text-moss font-medium flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {success}
          </p>
        )}
      </div>
    </div>
  );
}
