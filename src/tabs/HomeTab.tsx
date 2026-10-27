import { useMemo, useState, useEffect } from 'react';
import { Sparkles, ListChecks, Trash2, Sunrise, Plus, Share2, Check, ArrowRight } from 'lucide-react';
import type { DailyData, MicroStep } from '@/types';
import { useDailyLocalStorage, uid } from '@/hooks/useStorage';
import { useDailyArchiver } from '@/hooks/useHistory';
import { usePendingSteps, useHapticFeedback } from '@/hooks/usePendingSteps';
import { quoteOfDay } from '@/data/quotes';
import { Checkbox, AutoTextarea } from '@/components/ui';

const emptyDay = (): DailyData => ({ date: '', intention: '', steps: [] });

export function HomeTab() {
  const [day, setDay, dateKey] = useDailyLocalStorage<DailyData>('egenmakt.today', emptyDay);
  const { pending, drain, count } = usePendingSteps();
  const haptic = useHapticFeedback();

  useDailyArchiver(day, dateKey);

  useEffect(() => {
    if (count > 0) {
      drain((text) => addStep(text));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  const quote = useMemo(() => quoteOfDay(dateKey), [dateKey]);

  const remaining = day.steps.filter((s) => !s.done).length;
  const total = day.steps.length;

  const addStep = (text: string) =>
    setDay((p) => ({ ...p, steps: [...p.steps, { id: uid(), text, done: false }] }));

  const toggleStep = (id: string) => {
    const step = day.steps.find((s) => s.id === id);
    if (step && !step.done) haptic(15);
    setDay((p) => ({
      ...p,
      steps: p.steps.map((s) => (s.id === id ? { ...s, done: !s.done } : s)),
    }));
  };

  const removeStep = (id: string) =>
    setDay((p) => ({ ...p, steps: p.steps.filter((s) => s.id !== id) }));

  const clearDone = () => setDay((p) => ({ ...p, steps: p.steps.filter((s) => !s.done) }));

  const clearAll = () => setDay((p) => ({ ...p, steps: [] }));

  const updateStep = (id: string, text: string) =>
    setDay((p) => ({ ...p, steps: p.steps.map((s) => (s.id === id ? { ...s, text } : s)) }));

  return (
    <div className="space-y-5 pb-4">
      <Header dateKey={dateKey} />

      {count > 0 && (
        <div className="card flex items-center justify-between gap-3 border-sage-600/30 bg-sage-500/5 animate-slide-up">
          <p className="text-sm text-sage-300">
            {count > 1 ? `${count} mikrosteg väntar` : 'Ett mikrosteg väntar'} från modulerna
          </p>
          <button onClick={() => drain(addStep)} className="btn-primary px-3 py-2 text-sm">
            Lägg till <ArrowRight size={14} />
          </button>
        </div>
      )}

      <section className="card-elevated animate-slide-up">
        <div className="mb-3 flex items-center gap-2 text-sage-300">
          <Sunrise size={18} />
          <h2 className="text-sm font-medium uppercase tracking-wider">Dagens intention</h2>
        </div>
        <p className="mb-3 font-serif text-xl leading-snug text-sage-100">
          Vad ligger inom min kontroll idag?
        </p>
        <AutoTextarea
          value={day.intention}
          onChange={(intention) => setDay((p) => ({ ...p, intention }))}
          placeholder="Skriv vad du vill ge plats åt idag…"
          minRows={3}
        />
      </section>

      <section className="card animate-slide-up" style={{ animationDelay: '60ms' }}>
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sage-300">
            <ListChecks size={18} />
            <h2 className="text-sm font-medium uppercase tracking-wider">Dagens 3 mikrosteg</h2>
          </div>
          {total > 0 && (
            <div className="flex items-center gap-2 text-xs text-sage-700">
              <span>{total - remaining} av {total} klara</span>
              {remaining < total && (
                <button onClick={clearDone} className="btn-ghost px-2 py-1 text-xs">
                  Rensa klara
                </button>
              )}
            </div>
          )}
        </div>

        <StepList steps={day.steps} onToggle={toggleStep} onRemove={removeStep} onEdit={updateStep} />

        {day.steps.length < 5 ? (
          <InlineAdd onAdd={addStep} />
        ) : (
          <p className="mt-3 text-center text-xs text-sage-700">Bra jobbat — fokusera på de fem stegen.</p>
        )}

        {day.steps.length > 0 && (
          <button
            onClick={clearAll}
            className="mt-3 inline-flex items-center gap-1.5 text-xs text-sage-700 transition-colors active:text-sage-400"
          >
            <Trash2 size={12} /> Rensa alla
          </button>
        )}
      </section>

      <section
        className="card animate-slide-up overflow-hidden text-center"
        style={{ animationDelay: '120ms' }}
      >
        <div className="mx-auto mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-sage-500/10 text-sage-400">
          <Sparkles size={16} />
        </div>
        <p className="font-serif text-[17px] italic leading-relaxed text-sage-100">
          {quote.text}
        </p>
        <p className="mt-3 text-xs uppercase tracking-widest text-sage-700">— {quote.author}</p>
      </section>
    </div>
  );
}

function Header({ dateKey }: { dateKey: string }) {
  const pretty = useMemo(() => {
    const d = new Date(dateKey + 'T00:00:00');
    return d.toLocaleDateString('sv-SE', { weekday: 'long', day: 'numeric', month: 'long' });
  }, [dateKey]);

  const [copied, setCopied] = useState(false);

  const share = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  };

  return (
    <header className="flex items-end justify-between pt-1">
      <div>
        <p className="text-xs uppercase tracking-widest text-sage-700">{pretty}</p>
        <h1 className="mt-1 font-serif text-3xl text-sage-100">Egenmakt</h1>
      </div>
      <button
        onClick={share}
        aria-label="Dela"
        className="inline-flex h-9 items-center gap-1.5 rounded-full border border-sage-700/40 bg-ink-600/50 px-3 text-xs font-medium text-sage-300 transition-all active:scale-95"
      >
        {copied ? (
          <>
            <Check size={14} /> Kopierad
          </>
        ) : (
          <>
            <Share2 size={14} /> Dela
          </>
        )}
      </button>
    </header>
  );
}

function StepList({
  steps,
  onToggle,
  onRemove,
  onEdit,
}: {
  steps: MicroStep[];
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  onEdit: (id: string, text: string) => void;
}) {
  if (steps.length === 0) {
    return (
      <p className="py-3 text-sm text-sage-700">
        Tre små handlingar du har makten att utföra idag. Lägg till dem nedan.
      </p>
    );
  }
  return (
    <ul className="space-y-1.5">
      {steps.map((step) => (
        <StepRow
          key={step.id}
          step={step}
          onToggle={() => onToggle(step.id)}
          onRemove={() => onRemove(step.id)}
          onEdit={(t) => onEdit(step.id, t)}
        />
      ))}
    </ul>
  );
}

function StepRow({
  step,
  onToggle,
  onRemove,
  onEdit,
}: {
  step: MicroStep;
  onToggle: () => void;
  onRemove: () => void;
  onEdit: (t: string) => void;
}) {
  return (
    <li className="group flex items-center gap-3 rounded-xl px-1 py-2 transition-colors active:bg-white/5">
      <Checkbox checked={step.done} onToggle={onToggle} />
      <input
        value={step.text}
        onChange={(e) => onEdit(e.target.value.slice(0, 140))}
        className={`flex-1 bg-transparent text-[15px] transition-all ${
          step.done ? 'text-sage-700 line-through' : 'text-sage-100'
        }`}
      />
      <button
        onClick={onRemove}
        aria-label="Ta bort"
        className="text-sage-800 opacity-0 transition-opacity group-active:opacity-100"
      >
        <Trash2 size={14} />
      </button>
    </li>
  );
}

function InlineAdd({ onAdd }: { onAdd: (text: string) => void }) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const input = (e.currentTarget.elements.namedItem('step') as HTMLInputElement);
        const v = input.value.trim();
        if (!v) return;
        onAdd(v);
        input.value = '';
      }}
      className="mt-3 flex items-center gap-2"
    >
      <input
        name="step"
        placeholder="Lägg till ett mikrosteg…"
        maxLength={140}
        className="flex-1 rounded-xl border border-white/5 bg-ink-600/60 px-3.5 py-2.5 text-sm text-sage-100 placeholder:text-sage-700 focus:border-sage-600/60"
      />
      <button
        type="submit"
        aria-label="Lägg till"
        className="flex h-10 w-10 items-center justify-center rounded-xl bg-sage-500/15 text-sage-300 transition-all active:scale-90"
      >
        <Plus size={18} />
      </button>
    </form>
  );
}
