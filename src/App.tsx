import { useEffect, useState } from 'react';
import { useStore } from './store';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar/Sidebar';
import { MobileDrawer } from './components/Sidebar/MobileDrawer';
import { Kanban } from './components/Board/Kanban';
import { DetailPanel } from './components/CandidateDetail/DetailPanel';

function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const initialize = useStore((state) => state.initialize);
  const isLoading = useStore((state) => state.isLoading);
  const error = useStore((state) => state.error);
  const selectedCandidateId = useStore((state) => state.selectedCandidateId);
  const clearError = useStore((state) => state.clearError);

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="app-background" />
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-sage border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-stone">Loading your lineup...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="app-background" />

      {error && (
        <div className="fixed top-4 right-4 z-50 bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg flex items-start gap-3 max-w-md">
          <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1">
            <p className="text-sm text-red-800">{error}</p>
          </div>
          <button
            onClick={clearError}
            className="text-red-500 hover:text-red-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <Header onMenuClick={() => setIsMobileMenuOpen(true)} />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-hidden flex">
          <Kanban />
        </main>
      </div>

      {selectedCandidateId && <DetailPanel />}

      <MobileDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </div>
  );
}

export default App;
