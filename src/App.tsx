import { useEffect, useState } from 'react';
import { useStore } from './store';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar/Sidebar';
import { MobileDrawer } from './components/Sidebar/MobileDrawer';
import { Kanban } from './components/Board/Kanban';
import { DetailPanel } from './components/CandidateDetail/DetailPanel';
import { AddCandidateModal } from './components/CandidateDetail/AddCandidateModal';
import { NewJobDialog } from './components/Sidebar/NewJobDialog';
import { WelcomeModal } from './components/WelcomeModal';

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
        <p className="text-muted">Loading your lineup</p>
      </div>
    );
  }

  return (
    <div className="h-dvh flex flex-col overflow-hidden">
      <Header onMenuClick={() => setIsMobileMenuOpen(true)} />

      {error && (
        <div role="alert" className="flex items-baseline gap-4 px-4 md:px-6 pb-4">
          <p className="text-ink">
            <span className="font-semibold">Something went wrong.</span> {error}
          </p>
          <button type="button" onClick={clearError} className="text-sm font-semibold text-accent hover:underline">
            Dismiss
          </button>
        </div>
      )}

      <div className="flex-1 flex min-h-0">
        <Sidebar />
        <main className="flex-1 min-w-0 flex">
          <Kanban />
        </main>
        {selectedCandidateId && <DetailPanel key={selectedCandidateId} />}
      </div>

      <MobileDrawer isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      <AddCandidateModal />
      <NewJobDialog />
      <WelcomeModal />
    </div>
  );
}

export default App;
