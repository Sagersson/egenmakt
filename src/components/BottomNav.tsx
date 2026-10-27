import { Home, Map, BookOpen, History, Settings, Music } from 'lucide-react';
import type { TabKey } from '@/types';

const TABS: { key: TabKey; label: string; Icon: typeof Home }[] = [
  { key: 'home', label: 'Hem', Icon: Home },
  { key: 'map', label: 'Kartan', Icon: Map },
  { key: 'modules', label: 'Moduler', Icon: BookOpen },
  { key: 'music', label: 'Fokus', Icon: Music },
  { key: 'history', label: 'Historik', Icon: History },
  { key: 'settings', label: 'Inställningar', Icon: Settings },
];

type Props = {
  active: TabKey;
  onChange: (tab: TabKey) => void;
};

export function BottomNav({ active, onChange }: Props) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t border-white/5 bg-ink-800/95 backdrop-blur-xl safe-bottom"
      role="tablist"
      aria-label="Huvudnavigering"
    >
      <div className="mx-auto flex max-w-md items-stretch justify-around px-0.5">
        {TABS.map(({ key, label, Icon }) => {
          const isActive = active === key;
          return (
            <button
              key={key}
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(key)}
              className="group relative flex flex-1 flex-col items-center gap-1 py-2.5 transition-colors"
            >
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-full transition-all duration-300 ${
                  isActive ? 'bg-sage-500/15 text-sage-300' : 'text-sage-700 group-active:text-sage-400'
                }`}
              >
                <Icon size={18} strokeWidth={isActive ? 2.4 : 2} />
              </span>
              <span
                className={`text-[9px] font-medium tracking-wide transition-colors ${
                  isActive ? 'text-sage-200' : 'text-sage-700 group-active:text-sage-500'
                }`}
              >
                {label}
              </span>
              <span
                className={`absolute -top-px h-0.5 w-6 rounded-full bg-sage-400 transition-all duration-300 ${
                  isActive ? 'opacity-100' : 'opacity-0'
                }`}
              />
            </button>
          );
        })}
      </div>
    </nav>
  );
}
