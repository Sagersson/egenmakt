import { useState } from 'react';
import type { TabKey } from '@/types';
import { PlayerProvider } from '@/context/PlayerContext';
import { BottomNav } from '@/components/BottomNav';
import { MiniPlayer } from '@/components/MiniPlayer';
import { HomeTab } from '@/tabs/HomeTab';
import { MapTab } from '@/tabs/MapTab';
import { ModulesTab } from '@/tabs/ModulesTab';
import { MusicTab } from '@/tabs/MusicTab';
import { HistoryTab } from '@/tabs/HistoryTab';
import { SettingsTab } from '@/tabs/SettingsTab';

function AppContent() {
  const [tab, setTab] = useState<TabKey>('home');

  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-md flex-col bg-ink-900 text-sage-100">
      <main className={`flex-1 px-4 pt-3 safe-top ${tab === 'music' ? 'pb-40' : 'pb-24'}`}>
        {tab === 'home' && <HomeTab />}
        {tab === 'map' && <MapTab />}
        {tab === 'modules' && <ModulesTab />}
        {tab === 'music' && <MusicTab />}
        {tab === 'history' && <HistoryTab />}
        {tab === 'settings' && <SettingsTab />}
      </main>
      <MiniPlayer onOpenPlayer={() => setTab('music')} />
      <BottomNav active={tab} onChange={setTab} />
    </div>
  );
}

function App() {
  return (
    <PlayerProvider>
      <AppContent />
    </PlayerProvider>
  );
}

export default App;
