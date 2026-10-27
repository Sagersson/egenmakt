import { useMemo } from 'react';
import { Calendar, CheckCircle2, Circle, Inbox } from 'lucide-react';
import { useHistory } from '@/hooks/useHistory';

export function HistoryTab() {
  const [history] = useHistory();

  const sorted = useMemo(() => [...history].sort((a, b) => b.date.localeCompare(a.date)), [history]);

  return (
    <div className="space-y-5 pb-4">
      <header className="pt-1">
        <p className="text-xs uppercase tracking-widest text-sage-700">Tidlinje</p>
        <h1 className="mt-1 font-serif text-3xl text-sage-100">Din historik</h1>
        <p className="mt-2 text-sm text-sage-700">
          En automatiskt sparad tidslinje över dina dagliga intentioner och avklarade mikrosteg.
        </p>
      </header>

      {sorted.length === 0 ? (
        <div className="card mt-4 flex flex-col items-center gap-3 py-10 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sage-500/10 text-sage-500">
            <Inbox size={24} />
          </div>
          <p className="text-sm text-sage-600">
            Inga sparade dagar ännu. Din historik byggs automatiskt när du använder appen.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((entry, idx) => (
            <HistoryCard key={entry.date} entry={entry} delay={idx * 50} />
          ))}
        </div>
      )}
    </div>
  );
}

function HistoryCard({ entry, delay }: { entry: HistoryEntryLike; delay: number }) {
  const pretty = useMemo(() => {
    const d = new Date(entry.date + 'T00:00:00');
    return d.toLocaleDateString('sv-SE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }, [entry.date]);

  return (
    <section
      className="card animate-slide-up space-y-3"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center gap-2 text-sage-500">
        <Calendar size={15} />
        <span className="text-xs font-medium uppercase tracking-wider">{pretty}</span>
      </div>

      {entry.intention ? (
        <p className="font-serif text-[16px] leading-snug text-sage-100">{entry.intention}</p>
      ) : (
        <p className="text-sm italic text-sage-700">Ingen intention sparat denna dag.</p>
      )}

      {entry.completedSteps.length > 0 ? (
        <div className="space-y-1.5">
          <p className="text-xs uppercase tracking-wider text-sage-600">
            Avklarade steg ({entry.completedSteps.length}
            {entry.totalSteps > 0 ? ` av ${entry.totalSteps}` : ''})
          </p>
          <ul className="space-y-1">
            {entry.completedSteps.map((step, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-sage-300">
                <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-sage-500" />
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-sm text-sage-700">
          <Circle size={14} className="text-sage-800" />
          <span>Inga avklarade steg denna dag.</span>
        </div>
      )}
    </section>
  );
}

type HistoryEntryLike = {
  date: string;
  intention: string;
  completedSteps: string[];
  totalSteps: number;
};
