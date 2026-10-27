import { useMemo, useState } from 'react';
import {
  Plus,
  Trash2,
  Flag,
  Target,
  HandHeart,
  Cloud,
  ChevronRight,
  X,
  Check,
  Circle,
} from 'lucide-react';
import type { ControlLevel, Goal, MapPoint } from '@/types';
import { useLocalStorage, uid } from '@/hooks/useStorage';

const LEVEL_META: {
  key: ControlLevel;
  label: string;
  hint: string;
  Icon: typeof Target;
  accent: string;
  chip: string;
}[] = [
  {
    key: 'in_control',
    label: 'Inom min kontroll',
    hint: 'Vad jag gör',
    Icon: Target,
    accent: 'text-sage-300',
    chip: 'bg-sage-500/15 text-sage-300 border-sage-600/30',
  },
  {
    key: 'can_influence',
    label: 'Kan påverka',
    hint: 'Vad jag kan försöka ändra',
    Icon: HandHeart,
    accent: 'text-amber-300/90',
    chip: 'bg-amber-500/10 text-amber-300/90 border-amber-600/30',
  },
  {
    key: 'out_of_control',
    label: 'Utom min kontroll',
    hint: 'Vad jag behöver släppa',
    Icon: Cloud,
    accent: 'text-slate-300/80',
    chip: 'bg-slate-500/10 text-slate-300/80 border-slate-500/30',
  },
];

const STARTER_GOAL: Goal = {
  id: 'starter',
  title: 'Skapa mer tid för återhämtning',
  points: [
    { id: uid(), text: 'Stäng av notiser efter kl. 20', level: 'in_control' },
    { id: uid(), text: 'Be om en promenadpaus på lunchen', level: 'can_influence' },
    { id: uid(), text: 'Andras kalenderbokningar', level: 'out_of_control' },
  ],
  createdAt: Date.now(),
};

export function MapTab() {
  const [goals, setGoals] = useLocalStorage<Goal[]>('egenmakt.goals', [STARTER_GOAL]);
  const [activeId, setActiveId] = useLocalStorage<string>('egenmakt.goals.active', goals[0]?.id ?? '');
  const [showNewGoal, setShowNewGoal] = useState(false);

  const active = goals.find((g) => g.id === activeId) ?? goals[0];

  const addGoal = (title: string) => {
    const g: Goal = { id: uid(), title, points: [], createdAt: Date.now() };
    setGoals((prev) => [...prev, g]);
    setActiveId(g.id);
    setShowNewGoal(false);
  };

  const deleteGoal = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
    if (activeId === id) {
      const rest = goals.filter((g) => g.id !== id);
      setActiveId(rest[0]?.id ?? '');
    }
  };

  const renameGoal = (id: string, title: string) =>
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, title } : g)));

  const addPoint = (level: ControlLevel, text: string) => {
    if (!active) return;
    setGoals((prev) =>
      prev.map((g) =>
        g.id === active.id ? { ...g, points: [...g.points, { id: uid(), text, level }] } : g
      )
    );
  };

  const removePoint = (pointId: string) => {
    if (!active) return;
    setGoals((prev) =>
      prev.map((g) =>
        g.id === active.id ? { ...g, points: g.points.filter((p) => p.id !== pointId) } : g
      )
    );
  };

  const toggleReleased = (pointId: string) => {
    if (!active) return;
    setGoals((prev) =>
      prev.map((g) =>
        g.id === active.id
          ? {
              ...g,
              points: g.points.map((p) =>
                p.id === pointId ? { ...p, released: !p.released } : p
              ),
            }
          : g
      )
    );
  };

  const stats = useMemo(() => {
    if (!active) return { in: 0, can: 0, out: 0 };
    return {
      in: active.points.filter((p) => p.level === 'in_control').length,
      can: active.points.filter((p) => p.level === 'can_influence').length,
      out: active.points.filter((p) => p.level === 'out_of_control').length,
    };
  }, [active]);

  return (
    <div className="space-y-5 pb-4">
      <header className="flex items-end justify-between pt-1">
        <div>
          <p className="text-xs uppercase tracking-widest text-sage-700">Förändringskartan</p>
          <h1 className="mt-1 font-serif text-3xl text-sage-100">Mål & steg</h1>
        </div>
        <button
          onClick={() => setShowNewGoal(true)}
          className="btn-ghost border border-white/5 bg-ink-700/60"
        >
          <Plus size={16} /> Nytt mål
        </button>
      </header>

      {active && (
        <>
          <GoalSelector
            goals={goals}
            activeId={active.id}
            onSelect={setActiveId}
            onRename={renameGoal}
            onDelete={deleteGoal}
          />

          <section className="card-elevated animate-slide-up">
            <div className="mb-1 flex items-center gap-2 text-sage-400">
              <Flag size={16} />
              <span className="text-xs uppercase tracking-widest">Aktivt förändringsmål</span>
            </div>
            <h2 className="font-serif text-2xl leading-snug text-sage-100">{active.title}</h2>
            <div className="mt-4 flex gap-2 text-xs">
              <span className="chip border bg-sage-500/10 text-sage-300">{stats.in} inom</span>
              <span className="chip border border-amber-600/30 bg-amber-500/10 text-amber-300/90">
                {stats.can} påverka
              </span>
              <span className="chip border border-slate-500/30 bg-slate-500/10 text-slate-300/80">
                {stats.out} släppa
              </span>
            </div>
          </section>

          <div className="space-y-4">
            {LEVEL_META.map((meta, idx) => (
              <Column
                key={meta.key}
                meta={meta}
                points={active.points.filter((p) => p.level === meta.key)}
                onAdd={(t) => addPoint(meta.key, t)}
                onRemove={removePoint}
                onToggleReleased={toggleReleased}
                delay={idx * 60}
              />
            ))}
          </div>
        </>
      )}

      {goals.length === 0 && (
        <div className="card text-center text-sage-700">
          <p className="mb-3">Du har inget mål ännu.</p>
          <button onClick={() => setShowNewGoal(true)} className="btn-primary">
            <Plus size={16} /> Skapa ditt första mål
          </button>
        </div>
      )}

      {showNewGoal && (
        <NewGoalModal onClose={() => setShowNewGoal(false)} onCreate={addGoal} />
      )}
    </div>
  );
}

function GoalSelector({
  goals,
  activeId,
  onSelect,
  onRename,
  onDelete,
}: {
  goals: Goal[];
  activeId: string;
  onSelect: (id: string) => void;
  onRename: (id: string, t: string) => void;
  onDelete: (id: string) => void;
}) {
  const [editId, setEditId] = useState<string | null>(null);

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none]">
      {goals.map((g) => {
        const isActive = g.id === activeId;
        const isEditing = editId === g.id;
        return (
          <div
            key={g.id}
            className={`group shrink-0 rounded-xl border px-3.5 py-2 transition-all ${
              isActive
                ? 'border-sage-600/50 bg-sage-500/10'
                : 'border-white/5 bg-ink-700/60'
            }`}
          >
            {isEditing ? (
              <input
                autoFocus
                value={g.title}
                onChange={(e) => onRename(g.id, e.target.value.slice(0, 80))}
                onBlur={() => setEditId(null)}
                onKeyDown={(e) => e.key === 'Enter' && setEditId(null)}
                className="w-48 bg-transparent text-sm text-sage-100"
              />
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onSelect(g.id)}
                  className={`text-sm ${isActive ? 'text-sage-200' : 'text-sage-700'}`}
                >
                  {g.title}
                </button>
                <button
                  onClick={() => setEditId(g.id)}
                  className="text-sage-800 transition-colors active:text-sage-400"
                  aria-label="Byt namn"
                >
                  <ChevronRight size={14} />
                </button>
                <button
                  onClick={() => onDelete(g.id)}
                  className="text-sage-800 transition-colors active:text-rose-400"
                  aria-label="Ta bort mål"
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function Column({
  meta,
  points,
  onAdd,
  onRemove,
  onToggleReleased,
  delay,
}: {
  meta: (typeof LEVEL_META)[number];
  points: MapPoint[];
  onAdd: (t: string) => void;
  onRemove: (id: string) => void;
  onToggleReleased: (id: string) => void;
  delay: number;
}) {
  const { Icon } = meta;
  return (
    <section
      className="card animate-slide-up space-y-3"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/5 bg-ink-600/60 ${meta.accent}`}>
          <Icon size={18} />
        </div>
        <div className="flex-1">
          <h3 className="text-[15px] font-medium text-sage-100">{meta.label}</h3>
          <p className="text-xs text-sage-700">{meta.hint}</p>
        </div>
      </div>

      {points.length > 0 && (
        <ul className="space-y-1.5">
          {points.map((p) => (
            <PointRow
              key={p.id}
              point={p}
              level={meta.key}
              onRemove={() => onRemove(p.id)}
              onToggleReleased={() => onToggleReleased(p.id)}
            />
          ))}
        </ul>
      )}

      <ColumnAdd onAdd={onAdd} placeholder="Lägg till en punkt…" />
    </section>
  );
}

function PointRow({
  point,
  level,
  onRemove,
  onToggleReleased,
}: {
  point: MapPoint;
  level: ControlLevel;
  onRemove: () => void;
  onToggleReleased: () => void;
}) {
  const canRelease = level === 'out_of_control';
  return (
    <li className="group flex items-center gap-3 rounded-xl border border-white/5 bg-ink-600/40 px-3 py-2.5">
      <span
        className={`h-1.5 w-1.5 shrink-0 rounded-full ${
          canRelease ? 'bg-slate-500' : level === 'in_control' ? 'bg-sage-400' : 'bg-amber-400/80'
        }`}
      />
      <span
        className={`flex-1 text-sm transition-all ${
          point.released ? 'text-sage-800 line-through' : 'text-sage-100'
        }`}
      >
        {point.text}
      </span>

      {canRelease && (
        <button
          onClick={onToggleReleased}
          aria-label={point.released ? 'Ta tillbaka' : 'Markera som släppt'}
          className={`flex h-7 w-7 items-center justify-center rounded-full transition-all active:scale-90 ${
            point.released
              ? 'bg-slate-500/20 text-slate-300'
              : 'text-slate-600 active:text-slate-300'
          }`}
        >
          {point.released ? <Check size={14} /> : <Circle size={14} />}
        </button>
      )}

      <button
        onClick={onRemove}
        aria-label="Ta bort"
        className="text-sage-800 transition-colors active:text-rose-400"
      >
        <Trash2 size={14} />
      </button>
    </li>
  );
}

function ColumnAdd({ onAdd, placeholder }: { onAdd: (t: string) => void; placeholder: string }) {
  const [text, setText] = useState('');
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const v = text.trim();
        if (!v) return;
        onAdd(v);
        setText('');
      }}
      className="flex items-center gap-2"
    >
      <input
        value={text}
        onChange={(e) => setText(e.target.value.slice(0, 120))}
        placeholder={placeholder}
        className="flex-1 rounded-xl border border-white/5 bg-ink-600/60 px-3 py-2 text-sm text-sage-100 placeholder:text-sage-700 focus:border-sage-600/60"
      />
      <button
        type="submit"
        disabled={!text.trim()}
        aria-label="Lägg till"
        className="flex h-9 w-9 items-center justify-center rounded-xl bg-sage-500/15 text-sage-300 transition-all active:scale-90 disabled:opacity-30"
      >
        <Plus size={16} />
      </button>
    </form>
  );
}

function NewGoalModal({ onClose, onCreate }: { onClose: () => void; onCreate: (t: string) => void }) {
  const [title, setTitle] = useState('');
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-t-3xl border-t border-white/10 bg-ink-800 p-6 safe-bottom animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-sage-800" />
        <h3 className="font-serif text-2xl text-sage-100">Nytt förändringsmål</h3>
        <p className="mt-1 text-sm text-sage-700">Vad vill du förändra i ditt liv just nu?</p>
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value.slice(0, 80))}
          placeholder="t.ex. Skapa mer tid för återhämtning"
          className="mt-5 w-full rounded-xl border border-white/5 bg-ink-600/60 px-4 py-3 text-[15px] text-sage-100 placeholder:text-sage-700 focus:border-sage-600/60"
        />
        <div className="mt-5 flex gap-3">
          <button onClick={onClose} className="btn-ghost flex-1 border border-white/5">
            Avbryt
          </button>
          <button
            onClick={() => {
              const v = title.trim();
              if (v) onCreate(v);
            }}
            disabled={!title.trim()}
            className="btn-primary flex-1 disabled:opacity-40"
          >
            Skapa mål
          </button>
        </div>
      </div>
    </div>
  );
}
