import { Plus, Trash2, Send, Check, ArrowUp, ArrowDown } from 'lucide-react';
import { useState } from 'react';
import type {
  ModuleState,
  LifeArea,
  ExpectationItem,
  DecisionField,
  BoundaryEntry,
  CompassionEntry,
} from '@/types';
import { uid } from '@/hooks/useStorage';
import { AutoTextarea, SaveIndicator } from '@/components/ui';
import { useSavePulse } from '@/hooks/useSavePulse';

type UpdateFn = (patch: Partial<ModuleState> | ((p: ModuleState) => ModuleState)) => void;
type SendStepFn = (text: string, from: string) => void;

function SendToDayButton({ text, from, onSend }: { text: string; from: string; onSend: SendStepFn }) {
  const [sent, setSent] = useState(false);
  if (!text.trim()) return null;
  return (
    <button
      onClick={() => {
        onSend(text, from);
        setSent(true);
        setTimeout(() => setSent(false), 1800);
      }}
      className="inline-flex items-center gap-1.5 rounded-lg border border-sage-600/30 bg-sage-500/10 px-2.5 py-1.5 text-xs font-medium text-sage-300 transition-all active:scale-95"
    >
      {sent ? (
        <>
          <Check size={13} /> Skickat
        </>
      ) : (
        <>
          <Send size={13} /> Till dagens fokus
        </>
      )}
    </button>
  );
}

const DEFAULT_LIFE_AREAS: LifeArea[] = [
  { key: 'relations', label: 'Relationer', rating: 5 },
  { key: 'health', label: 'Hälsa', rating: 5 },
  { key: 'economy', label: 'Ekonomi', rating: 5 },
  { key: 'routine', label: 'Vardagsstruktur', rating: 5 },
  { key: 'growth', label: 'Personlig utveckling', rating: 5 },
];

/* ============ Module 1: Life areas ============ */

export function LifeAreasExercise({ state, onUpdate, onSendStep }: { state: ModuleState; onUpdate: UpdateFn; onSendStep?: SendStepFn }) {
  const areas = state.lifeAreas ?? DEFAULT_LIFE_AREAS;
  const focus = state.lifeFocus ?? '';
  const saveState = useSavePulse(`${areas.map((a) => a.rating).join('-')}|${focus}`);

  const setRating = (key: string, rating: number) =>
    onUpdate((p) => ({
      ...p,
      lifeAreas: (p.lifeAreas ?? DEFAULT_LIFE_AREAS).map((a) =>
        a.key === key ? { ...a, rating } : a
      ),
    }));

  const avg = Math.round((areas.reduce((s, a) => s + a.rating, 0) / areas.length) * 10) / 10;

  return (
    <section className="card animate-slide-up space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium uppercase tracking-wider text-sage-300">Övning: Mitt nuläge</h3>
        <SaveIndicator state={saveState} />
      </div>
      <p className="text-sm text-sage-700">
        Dra reglagen för att betygsätta hur nöjd du är med varje område just nu (1–10).
      </p>

      <div className="space-y-4">
        {areas.map((area) => (
          <div key={area.key}>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-sm text-sage-100">{area.label}</label>
              <span className="text-sm font-medium text-sage-300">{area.rating}</span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              value={area.rating}
              onChange={(e) => setRating(area.key, Number(e.target.value))}
              style={{ ['--val' as string]: `${((area.rating - 1) / 9) * 100}%` }}
              className="egenmakt-slider w-full"
            />
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-white/5 bg-ink-600/40 px-4 py-2.5 text-center text-sm text-sage-400">
        Snitt: <span className="font-medium text-sage-200">{avg}</span> av 10
      </div>

      <div>
        <label className="mb-2 block text-sm text-sage-100">
          Vilket område behöver mest uppmärksamhet just nu?
        </label>
        <AutoTextarea
          value={focus}
          onChange={(v) => onUpdate({ lifeFocus: v })}
          placeholder="Skriv en kort mening…"
          minRows={2}
        />
        {onSendStep && focus.trim() && (
          <div className="mt-2">
            <SendToDayButton text={`Ge extra uppmärksamhet åt: ${focus.trim()}`} from="Livshjulet" onSend={onSendStep} />
          </div>
        )}
      </div>
    </section>
  );
}

/* ============ Module 2: Reframe ============ */

export function ReframeExercise({ state, onUpdate, onSendStep }: { state: ModuleState; onUpdate: UpdateFn; onSendStep?: SendStepFn }) {
  const reframes = state.reframes ?? [];
  const saveState = useSavePulse(reframes);

  const add = () =>
    onUpdate((p) => ({
      ...p,
      reframes: [...(p.reframes ?? []), { id: uid(), critic: '', mentor: '' }],
    }));

  const update = (id: string, field: 'critic' | 'mentor', value: string) =>
    onUpdate((p) => ({
      ...p,
      reframes: (p.reframes ?? []).map((r) => (r.id === id ? { ...r, [field]: value } : r)),
    }));

  const remove = (id: string) =>
    onUpdate((p) => ({ ...p, reframes: (p.reframes ?? []).filter((r) => r.id !== id) }));

  return (
    <section className="card animate-slide-up space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium uppercase tracking-wider text-sage-300">Övning: Omformulera tanken</h3>
        <SaveIndicator state={saveState} />
      </div>
      <p className="text-sm text-sage-700">
        Skriv vad den inre kritikern säger — och omformulera det till ett stöttande, realistiskt råd.
      </p>

      {reframes.length === 0 && (
        <button onClick={add} className="btn-primary w-full">
          <Plus size={16} /> Starta första omformuleringen
        </button>
      )}

      <div className="space-y-3">
        {reframes.map((r, i) => (
          <div key={r.id} className="rounded-xl border border-white/5 bg-ink-600/40 p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-sage-700">Rad {i + 1}</span>
              <button
                onClick={() => remove(r.id)}
                aria-label="Ta bort"
                className="text-sage-800 active:text-rose-400"
              >
                <Trash2 size={14} />
              </button>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs text-rose-300/80">Den inre kritikern</label>
                <AutoTextarea
                  value={r.critic}
                  onChange={(v) => update(r.id, 'critic', v)}
                  placeholder="t.ex. Jag är hopplös på att be om hjälp."
                  minRows={2}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-sage-300">Den inre mentorn</label>
                <AutoTextarea
                  value={r.mentor}
                  onChange={(v) => update(r.id, 'mentor', v)}
                  placeholder="t.ex. Det har varit svårt för mig att be om hjälp. Jag kan öva på att ställa en liten fråga nästa vecka."
                  minRows={2}
                />
                {onSendStep && r.mentor.trim() && (
                  <div className="mt-2">
                    <SendToDayButton text={r.mentor.trim()} from="Omformulera tanken" onSend={onSendStep} />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {reframes.length > 0 && (
        <button onClick={add} className="btn-ghost w-full border border-white/5 bg-ink-700/60">
          <Plus size={16} /> Lägg till en till
        </button>
      )}
    </section>
  );
}

/* ============ Module 3: Expectations ============ */

export function ExpectationsExercise({ state, onUpdate, onSendStep }: { state: ModuleState; onUpdate: UpdateFn; onSendStep?: SendStepFn }) {
  const items = state.expectations ?? [];
  const noTemplate = state.noTemplate ?? '';
  const saveState = useSavePulse(`${items.map((i) => i.text).join('|')}|${noTemplate}`);

  const add = (kind: 'duty' | 'will') =>
    onUpdate((p) => ({
      ...p,
      expectations: [...(p.expectations ?? []), { id: uid(), text: '', kind }],
    }));

  const update = (id: string, text: string) =>
    onUpdate((p) => ({
      ...p,
      expectations: (p.expectations ?? []).map((it) => (it.id === id ? { ...it, text } : it)),
    }));

  const remove = (id: string) =>
    onUpdate((p) => ({ ...p, expectations: (p.expectations ?? []).filter((it) => it.id !== id) }));

  const duty = items.filter((i) => i.kind === 'duty');
  const will = items.filter((i) => i.kind === 'will');

  return (
    <section className="card animate-slide-up space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium uppercase tracking-wider text-sage-300">Övning: Förväntningsfiltret</h3>
        <SaveIndicator state={saveState} />
      </div>
      <p className="text-sm text-sage-700">
        Skriv 2–3 saker du gör av plikt och 2–3 saker du gör av egen vilja.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-amber-600/20 bg-amber-500/5 p-3">
          <div className="mb-2 flex items-center justify-between">
            <h4 className="text-xs font-medium uppercase tracking-wider text-amber-300/90">Av plikt</h4>
            <button
              onClick={() => add('duty')}
              aria-label="Lägg till plikt"
              className="text-amber-300/80 active:scale-90"
            >
              <Plus size={16} />
            </button>
          </div>
          <div className="space-y-2">
            {duty.length === 0 && <p className="text-xs text-sage-800">Inget här ännu</p>}
            {duty.map((it) => (
              <ExpectationRow
                key={it.id}
                item={it}
                onChange={(v) => update(it.id, v)}
                onRemove={() => remove(it.id)}
              />
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-sage-600/20 bg-sage-500/5 p-3">
          <div className="mb-2 flex items-center justify-between">
            <h4 className="text-xs font-medium uppercase tracking-wider text-sage-300">Av egen vilja</h4>
            <button
              onClick={() => add('will')}
              aria-label="Lägg till vilja"
              className="text-sage-300 active:scale-90"
            >
              <Plus size={16} />
            </button>
          </div>
          <div className="space-y-2">
            {will.length === 0 && <p className="text-xs text-sage-800">Inget här ännu</p>}
            {will.map((it) => (
              <ExpectationRow
                key={it.id}
                item={it}
                onChange={(v) => update(it.id, v)}
                onRemove={() => remove(it.id)}
              />
            ))}
          </div>
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm text-sage-100">
          Formulera ditt eget tydliga "nej"
        </label>
        <AutoTextarea
          value={noTemplate}
          onChange={(v) => onUpdate({ noTemplate: v })}
          placeholder="t.ex. Tack för att du frågar — just nu har jag inte utrymme för det, men jag hör gärna nästa vecka."
          minRows={2}
        />
        {onSendStep && noTemplate.trim() && (
          <div className="mt-2">
            <SendToDayButton text={`Öva på mitt nej: ${noTemplate.trim()}`} from="Förväntningsfiltret" onSend={onSendStep} />
          </div>
        )}
      </div>
    </section>
  );
}

function ExpectationRow({
  item,
  onChange,
  onRemove,
}: {
  item: ExpectationItem;
  onChange: (v: string) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-start gap-2">
      <input
        value={item.text}
        onChange={(e) => onChange(e.target.value.slice(0, 120))}
        placeholder="Skriv här…"
        className="flex-1 rounded-lg border border-white/5 bg-ink-600/60 px-2.5 py-2 text-sm text-sage-100 placeholder:text-sage-700 focus:border-sage-600/60"
      />
      <button
        onClick={onRemove}
        aria-label="Ta bort"
        className="mt-1 text-sage-800 active:text-rose-400"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}

/* ============ Module 4: Decision balance ============ */

const DECISION_FIELDS: { key: DecisionField; label: string; hint: string; tone: string }[] = [
  {
    key: 'stay_pros',
    label: 'Fördelar med att stanna',
    hint: 'Vad vinner du på att läget förblir som det är?',
    tone: 'border-amber-600/20 bg-amber-500/5',
  },
  {
    key: 'stay_cons',
    label: 'Nackdelar med att stanna',
    hint: 'Vad kostar det dig om inget förändras?',
    tone: 'border-rose-600/20 bg-rose-500/5',
  },
  {
    key: 'change_pros',
    label: 'Fördelar med förändring',
    hint: 'Vad vinner du på att genomföra förändringen?',
    tone: 'border-sage-600/20 bg-sage-500/5',
  },
  {
    key: 'change_cons',
    label: 'Utmaningar med förändring',
    hint: 'Vad är svårt eller obekvämt med att förändras?',
    tone: 'border-slate-500/20 bg-slate-500/5',
  },
];

export function DecisionExercise({ state, onUpdate, onSendStep }: { state: ModuleState; onUpdate: UpdateFn; onSendStep?: SendStepFn }) {
  const decision = state.decision ?? {};
  const goal = state.decisionGoal ?? '';
  const saveState = useSavePulse(`${Object.values(decision).join('|')}|${goal}`);

  return (
    <section className="card animate-slide-up space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium uppercase tracking-wider text-sage-300">Övning: Beslutsbalansen</h3>
        <SaveIndicator state={saveState} />
      </div>
      <p className="text-sm text-sage-700">
        Fyll i de fyra fälten för att se din ambivalens tydligt — det gör valet lättare.
      </p>

      <div>
        <label className="mb-2 block text-sm text-sage-100">
          Vilken förändring funderar du på?
        </label>
        <AutoTextarea
          value={goal}
          onChange={(v) => onUpdate({ decisionGoal: v })}
          placeholder="t.ex. Börja säga nej till extrauppgifter på jobbet"
          minRows={1}
        />
        {onSendStep && goal.trim() && (
          <div className="mt-2">
            <SendToDayButton text={`Nästa steg: ${goal.trim()}`} from="Beslutsbalansen" onSend={onSendStep} />
          </div>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {DECISION_FIELDS.map((f) => (
          <div key={f.key} className={`rounded-xl border p-3 ${f.tone}`}>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-sage-200">
              {f.label}
            </label>
            <p className="mb-2 text-xs text-sage-700">{f.hint}</p>
            <AutoTextarea
              value={decision[f.key] ?? ''}
              onChange={(v) => onUpdate((p) => ({ ...p, decision: { ...p.decision, [f.key]: v } }))}
              placeholder="Skriv här…"
              minRows={3}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

/* ============ Module 5: Values clarification ============ */

const VALUE_SUGGESTIONS = [
  'Ärlighet',
  'Mod',
  'Närhet',
  'Kreativitet',
  'Trygghet',
  'Frihet',
  'Ansvar',
  'Glädje',
  'Lärande',
  'Rättvisa',
  'Lojalitet',
  'Stillhet',
];

export function ValuesExercise({ state, onUpdate, onSendStep }: { state: ModuleState; onUpdate: UpdateFn; onSendStep?: SendStepFn }) {
  const ranked = state.valuesRanked ?? [];
  const actions = state.valuesActions ?? '';
  const saveState = useSavePulse(`${ranked.join('|')}|${actions}`);

  const addValue = (v: string) => {
    const trimmed = v.trim();
    if (!trimmed || ranked.includes(trimmed)) return;
    onUpdate((p) => ({ ...p, valuesRanked: [...(p.valuesRanked ?? []), trimmed] }));
  };

  const removeValue = (v: string) =>
    onUpdate((p) => ({ ...p, valuesRanked: (p.valuesRanked ?? []).filter((x) => x !== v) }));

  const move = (index: number, dir: -1 | 1) => {
    const newIndex = index + dir;
    if (newIndex < 0 || newIndex >= ranked.length) return;
    const next = [...ranked];
    [next[index], next[newIndex]] = [next[newIndex], next[index]];
    onUpdate((p) => ({ ...p, valuesRanked: next }));
  };

  const [customValue, setCustomValue] = useState('');

  return (
    <section className="card animate-slide-up space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium uppercase tracking-wider text-sage-300">Övning: Värderingskompassen</h3>
        <SaveIndicator state={saveState} />
      </div>
      <p className="text-sm text-sage-700">
        Välj de 3–5 värderingar som känns mest centrala för dig just nu. Ordna dem i prioritetsordning.
      </p>

      <div className="flex flex-wrap gap-2">
        {VALUE_SUGGESTIONS.filter((v) => !ranked.includes(v)).map((v) => (
          <button
            key={v}
            onClick={() => addValue(v)}
            className="rounded-full border border-white/5 bg-ink-600/60 px-3 py-1.5 text-xs text-sage-300 transition-all active:scale-95"
          >
            <Plus size={11} className="mr-1 inline" /> {v}
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (customValue.trim()) {
            addValue(customValue);
            setCustomValue('');
          }
        }}
        className="flex items-center gap-2"
      >
        <input
          value={customValue}
          onChange={(e) => setCustomValue(e.target.value.slice(0, 40))}
          placeholder="Lägg till egen värdering…"
          className="flex-1 rounded-xl border border-white/5 bg-ink-600/60 px-3.5 py-2.5 text-sm text-sage-100 placeholder:text-sage-700 focus:border-sage-600/60"
        />
        <button
          type="submit"
          aria-label="Lägg till"
          disabled={!customValue.trim()}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-sage-500/15 text-sage-300 transition-all active:scale-90 disabled:opacity-30"
        >
          <Plus size={18} />
        </button>
      </form>

      {ranked.length > 0 && (
        <div className="space-y-1.5">
          {ranked.map((v, i) => (
            <div key={v} className="flex items-center gap-2 rounded-xl border border-white/5 bg-ink-600/40 px-3 py-2.5">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sage-500/15 text-xs font-bold text-sage-300">
                {i + 1}
              </span>
              <span className="flex-1 text-sm text-sage-100">{v}</span>
              <button onClick={() => move(i, -1)} disabled={i === 0} aria-label="Flytta upp" className="text-sage-600 active:text-sage-300 disabled:opacity-20">
                <ArrowUp size={15} />
              </button>
              <button onClick={() => move(i, 1)} disabled={i === ranked.length - 1} aria-label="Flytta ner" className="text-sage-600 active:text-sage-300 disabled:opacity-20">
                <ArrowDown size={15} />
              </button>
              <button onClick={() => removeValue(v)} aria-label="Ta bort" className="text-sage-800 active:text-rose-400">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div>
        <label className="mb-2 block text-sm text-sage-100">
          Vad kan du göra idag för att leva efter din viktigaste värdering?
        </label>
        <AutoTextarea
          value={actions}
          onChange={(v) => onUpdate({ valuesActions: v })}
          placeholder="t.ex. Om ärlighet är viktigast: berätta vad jag faktiskt tycker i nästa möte"
          minRows={2}
        />
        {onSendStep && actions.trim() && (
          <div className="mt-2">
            <SendToDayButton text={actions.trim()} from="Värderingskompassen" onSend={onSendStep} />
          </div>
        )}
      </div>
    </section>
  );
}

/* ============ Module 6: Stress & recovery ============ */

export function StressRecoveryExercise({ state, onUpdate, onSendStep }: { state: ModuleState; onUpdate: UpdateFn; onSendStep?: SendStepFn }) {
  const sources = state.energySources ?? [];
  const drains = state.energyDrains ?? [];
  const recoveryPlan = state.recoveryPlan ?? '';
  const saveState = useSavePulse(`${sources.join('|')}|${drains.join('|')}|${recoveryPlan}`);

  const [sourceInput, setSourceInput] = useState('');
  const [drainInput, setDrainInput] = useState('');

  const addSource = (v: string) => {
    const trimmed = v.trim();
    if (!trimmed) return;
    onUpdate((p) => ({ ...p, energySources: [...(p.energySources ?? []), trimmed] }));
    setSourceInput('');
  };
  const removeSource = (i: number) =>
    onUpdate((p) => ({ ...p, energySources: (p.energySources ?? []).filter((_, idx) => idx !== i) }));

  const addDrain = (v: string) => {
    const trimmed = v.trim();
    if (!trimmed) return;
    onUpdate((p) => ({ ...p, energyDrains: [...(p.energyDrains ?? []), trimmed] }));
    setDrainInput('');
  };
  const removeDrain = (i: number) =>
    onUpdate((p) => ({ ...p, energyDrains: (p.energyDrains ?? []).filter((_, idx) => idx !== i) }));

  return (
    <section className="card animate-slide-up space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium uppercase tracking-wider text-sage-300">Övning: Energibalansen</h3>
        <SaveIndicator state={saveState} />
      </div>
      <p className="text-sm text-sage-700">
        Kartlägg vad som fyller och tömmer din energi — och skapa en plan för bättre återhämtning.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-sage-600/20 bg-sage-500/5 p-3">
          <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-sage-300">Energikällor</h4>
          <div className="space-y-1.5">
            {sources.length === 0 && <p className="text-xs text-sage-800">Inget här ännu</p>}
            {sources.map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="flex-1 text-sm text-sage-200">{s}</span>
                <button onClick={() => removeSource(i)} aria-label="Ta bort" className="text-sage-800 active:text-rose-400">
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
          <form
            onSubmit={(e) => { e.preventDefault(); addSource(sourceInput); }}
            className="mt-2 flex items-center gap-1.5"
          >
            <input
              value={sourceInput}
              onChange={(e) => setSourceInput(e.target.value.slice(0, 80))}
              placeholder="t.ex. promenad, ett samtal…"
              className="flex-1 rounded-lg border border-white/5 bg-ink-600/60 px-2.5 py-2 text-xs text-sage-100 placeholder:text-sage-700 focus:border-sage-600/60"
            />
            <button type="submit" aria-label="Lägg till" disabled={!sourceInput.trim()} className="text-sage-300 active:scale-90 disabled:opacity-30">
              <Plus size={15} />
            </button>
          </form>
        </div>

        <div className="rounded-xl border border-rose-600/20 bg-rose-500/5 p-3">
          <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-rose-300/80">Energigissar</h4>
          <div className="space-y-1.5">
            {drains.length === 0 && <p className="text-xs text-sage-800">Inget här ännu</p>}
            {drains.map((d, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="flex-1 text-sm text-rose-200/80">{d}</span>
                <button onClick={() => removeDrain(i)} aria-label="Ta bort" className="text-sage-800 active:text-rose-400">
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
          <form
            onSubmit={(e) => { e.preventDefault(); addDrain(drainInput); }}
            className="mt-2 flex items-center gap-1.5"
          >
            <input
              value={drainInput}
              onChange={(e) => setDrainInput(e.target.value.slice(0, 80))}
              placeholder="t.ex. skärm tid på kvällen…"
              className="flex-1 rounded-lg border border-white/5 bg-ink-600/60 px-2.5 py-2 text-xs text-sage-100 placeholder:text-sage-700 focus:border-rose-600/40"
            />
            <button type="submit" aria-label="Lägg till" disabled={!drainInput.trim()} className="text-rose-300/80 active:scale-90 disabled:opacity-30">
              <Plus size={15} />
            </button>
          </form>
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm text-sage-100">
          Vilken energikälla vill du ge mer plats denna vecka?
        </label>
        <AutoTextarea
          value={recoveryPlan}
          onChange={(v) => onUpdate({ recoveryPlan: v })}
          placeholder="t.ex. Ta en 20-minuters promenad tre kvällar denna vecka"
          minRows={2}
        />
        {onSendStep && recoveryPlan.trim() && (
          <div className="mt-2">
            <SendToDayButton text={recoveryPlan.trim()} from="Energibalansen" onSend={onSendStep} />
          </div>
        )}
      </div>
    </section>
  );
}

/* ============ Module 7: Relationship boundaries ============ */

export function BoundariesExercise({ state, onUpdate, onSendStep }: { state: ModuleState; onUpdate: UpdateFn; onSendStep?: SendStepFn }) {
  const entries = state.boundaryEntries ?? [];
  const saveState = useSavePulse(entries);

  const add = () =>
    onUpdate((p) => ({
      ...p,
      boundaryEntries: [...(p.boundaryEntries ?? []), { id: uid(), situation: '', boundary: '' }],
    }));

  const update = (id: string, field: 'situation' | 'boundary', value: string) =>
    onUpdate((p) => ({
      ...p,
      boundaryEntries: (p.boundaryEntries ?? []).map((e) => (e.id === id ? { ...e, [field]: value } : e)),
    }));

  const remove = (id: string) =>
    onUpdate((p) => ({ ...p, boundaryEntries: (p.boundaryEntries ?? []).filter((e) => e.id !== id) }));

  return (
    <section className="card animate-slide-up space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium uppercase tracking-wider text-sage-300">Övning: Tydliga gränser</h3>
        <SaveIndicator state={saveState} />
      </div>
      <p className="text-sm text-sage-700">
        Beskriv en situation där du behöver en tydligare gräns — och formulera hur du kan sätta den.
      </p>

      {entries.length === 0 && (
        <button onClick={add} className="btn-primary w-full">
          <Plus size={16} /> Starta första gränsen
        </button>
      )}

      <div className="space-y-3">
        {entries.map((e, i) => (
          <div key={e.id} className="rounded-xl border border-white/5 bg-ink-600/40 p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-sage-700">Situation {i + 1}</span>
              <button onClick={() => remove(e.id)} aria-label="Ta bort" className="text-sage-800 active:text-rose-400">
                <Trash2 size={14} />
              </button>
            </div>
            <div className="space-y-2">
              <div>
                <label className="mb-1 block text-xs text-amber-300/80">Situationen</label>
                <AutoTextarea
                  value={e.situation}
                  onChange={(v) => update(e.id, 'situation', v)}
                  placeholder="t.ex. Min chef ringer mig på kvällar och helger"
                  minRows={2}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-sage-300">Min gräns</label>
                <AutoTextarea
                  value={e.boundary}
                  onChange={(v) => update(e.id, 'boundary', v)}
                  placeholder="t.ex. Jag svarar inte på arbetssamtal efter kl. 18 eller på helger"
                  minRows={2}
                />
                {onSendStep && e.boundary.trim() && (
                  <div className="mt-2">
                    <SendToDayButton text={`Sätta gräns: ${e.boundary.trim()}`} from="Tydliga gränser" onSend={onSendStep} />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {entries.length > 0 && (
        <button onClick={add} className="btn-ghost w-full border border-white/5 bg-ink-700/60">
          <Plus size={16} /> Lägg till en till
        </button>
      )}
    </section>
  );
}

/* ============ Module 8: Self-compassion ============ */

export function CompassionExercise({ state, onUpdate, onSendStep }: { state: ModuleState; onUpdate: UpdateFn; onSendStep?: SendStepFn }) {
  const entries = state.compassionEntries ?? [];
  const letter = state.compassionLetter ?? '';
  const saveState = useSavePulse(`${entries.map((e) => e.struggle + e.kindResponse).join('|')}|${letter}`);

  const add = () =>
    onUpdate((p) => ({
      ...p,
      compassionEntries: [...(p.compassionEntries ?? []), { id: uid(), struggle: '', kindResponse: '' }],
    }));

  const update = (id: string, field: 'struggle' | 'kindResponse', value: string) =>
    onUpdate((p) => ({
      ...p,
      compassionEntries: (p.compassionEntries ?? []).map((e) => (e.id === id ? { ...e, [field]: value } : e)),
    }));

  const remove = (id: string) =>
    onUpdate((p) => ({ ...p, compassionEntries: (p.compassionEntries ?? []).filter((e) => e.id !== id) }));

  return (
    <section className="card animate-slide-up space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium uppercase tracking-wider text-sage-300">Övning: Vänligare mot dig själv</h3>
        <SaveIndicator state={saveState} />
      </div>
      <p className="text-sm text-sage-700">
        Skriv vad du är hård mot dig själv för — och formulera ett svar du skulle ge en vän i samma situation.
      </p>

      {entries.length === 0 && (
        <button onClick={add} className="btn-primary w-full">
          <Plus size={16} /> Starta första övningen
        </button>
      )}

      <div className="space-y-3">
        {entries.map((e, i) => (
          <div key={e.id} className="rounded-xl border border-white/5 bg-ink-600/40 p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-sage-700">Rad {i + 1}</span>
              <button onClick={() => remove(e.id)} aria-label="Ta bort" className="text-sage-800 active:text-rose-400">
                <Trash2 size={14} />
              </button>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs text-rose-300/80">Jag är hård mot mig själv för…</label>
                <AutoTextarea
                  value={e.struggle}
                  onChange={(v) => update(e.id, 'struggle', v)}
                  placeholder="t.ex. att jag inte orkar träna efter jobbet"
                  minRows={2}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-sage-300">Vad jag skulle säga till en vän</label>
                <AutoTextarea
                  value={e.kindResponse}
                  onChange={(v) => update(e.id, 'kindResponse', v)}
                  placeholder="t.ex. Det är okej att vara trött. Du gör vad du kan och det räcker."
                  minRows={2}
                />
                {onSendStep && e.kindResponse.trim() && (
                  <div className="mt-2">
                    <SendToDayButton text={e.kindResponse.trim()} from="Självmedkänsla" onSend={onSendStep} />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {entries.length > 0 && (
        <button onClick={add} className="btn-ghost w-full border border-white/5 bg-ink-700/60">
          <Plus size={16} /> Lägg till en till
        </button>
      )}

      <div>
        <label className="mb-2 block text-sm text-sage-100">
          Skriv en kort vänlig hälsning till dig själv — som du skulle skriva till någon du bryr dig om
        </label>
        <AutoTextarea
          value={letter}
          onChange={(v) => onUpdate({ compassionLetter: v })}
          placeholder="t.ex. Kära jag, jag vet att det är svårt just nu. Du gör ditt bästa och det är tillräckligt."
          minRows={3}
        />
        {onSendStep && letter.trim() && (
          <div className="mt-2">
            <SendToDayButton text={`Påminn mig: ${letter.trim()}`} from="Självmedkänsla" onSend={onSendStep} />
          </div>
        )}
      </div>
    </section>
  );
}
