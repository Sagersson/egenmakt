import { useEffect, useState } from 'react';
import { ArrowLeft, ChevronRight, Check, Download, CircleDot, Copy } from 'lucide-react';
import type { ModuleId, ModuleState } from '@/types';
import { useLocalStorage } from '@/hooks/useStorage';
import { usePendingSteps } from '@/hooks/usePendingSteps';
import { MODULES } from '@/data/modules';
import { buildFullSummary } from '@/data/summary';
import { CardStack } from '@/components/CardStack';
import {
  LifeAreasExercise,
  ReframeExercise,
  ExpectationsExercise,
  DecisionExercise,
  ValuesExercise,
  StressRecoveryExercise,
  BoundariesExercise,
  CompassionExercise,
} from '@/components/exercises';

const emptyState: ModuleState = {
  openedAt: null,
  completedAt: null,
};

type AllStates = Record<ModuleId, ModuleState>;

export function ModulesTab() {
  const [rawStates, setStates] = useLocalStorage<Partial<AllStates>>('egenmakt.modules.v2', {
    life_areas: { ...emptyState },
    self_talk: { ...emptyState },
    expectations: { ...emptyState },
    change_process: { ...emptyState },
    values_clarification: { ...emptyState },
    stress_recovery: { ...emptyState },
    relationship_boundaries: { ...emptyState },
    self_compassion: { ...emptyState },
  });

  const states = MODULES.reduce((acc, m) => {
    acc[m.id] = rawStates[m.id] ?? { ...emptyState };
    return acc;
  }, {} as AllStates);

  const [openId, setOpenId] = useState<ModuleId | null>(null);
  const [showExport, setShowExport] = useState(false);
  const { sendStep } = usePendingSteps();

  const update = (id: ModuleId, patch: Partial<ModuleState> | ((p: ModuleState) => ModuleState)) =>
    setStates((prev) => ({
      ...prev,
      [id]: typeof patch === 'function' ? patch(prev[id] ?? { ...emptyState }) : { ...(prev[id] ?? { ...emptyState }), ...patch },
    }));

  const markOpened = (id: ModuleId) =>
    update(id, (p) => (p.openedAt ? p : { ...p, openedAt: Date.now() }));

  const markCompleted = (id: ModuleId) =>
    update(id, (p) => ({ ...p, completedAt: Date.now() }));

  if (openId) {
    const meta = MODULES.find((m) => m.id === openId)!;
    return (
      <ModuleView
        meta={meta}
        state={states[openId]}
        onOpen={() => markOpened(openId)}
        onComplete={() => markCompleted(openId)}
        onUpdate={(patch) => update(openId, patch)}
        onBack={() => setOpenId(null)}
        onExport={() => setShowExport(true)}
        onSendStep={sendStep}
      />
    );
  }

  return (
    <div className="space-y-5 pb-4">
      <header className="pt-1">
        <p className="text-xs uppercase tracking-widest text-sage-700">Självstudier</p>
        <h1 className="mt-1 font-serif text-3xl text-sage-100">Egenmakt — kursmoduler</h1>
        <p className="mt-2 text-sm text-sage-700">
          Åtta korta moduler med teori och praktiska övningar. Dina svar sparas automatiskt.
        </p>
      </header>

      <button
        onClick={() => setShowExport(true)}
        className="btn-ghost w-full border border-white/5 bg-ink-700/60"
      >
        <Download size={16} /> Exportera mina reflektioner
      </button>

      <div className="space-y-3">
        {MODULES.map((meta, idx) => {
          const state = states[meta.id];
          const done = state.completedAt !== null;
          const started = state.openedAt !== null;
          return (
            <button
              key={meta.id}
              onClick={() => setOpenId(meta.id)}
              className="card flex w-full items-center gap-4 text-left transition-all active:scale-[0.99] animate-slide-up"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/5 bg-ink-600/60 text-2xl">
                {meta.emoji}
              </div>
              <div className="flex-1">
                <p className="text-xs uppercase tracking-wider text-sage-700">Modul {idx + 1}</p>
                <h3 className="text-[15px] font-medium text-sage-100">{meta.title}</h3>
                <p className="text-xs text-sage-700">{meta.subtitle}</p>
              </div>
              <div className="flex items-center gap-2">
                {done ? (
                  <span className="chip border border-sage-600/40 bg-sage-500/15 text-sage-300">
                    <Check size={12} /> Klar
                  </span>
                ) : started ? (
                  <span className="chip border border-amber-600/30 bg-amber-500/10 text-amber-300/90">
                    <CircleDot size={12} /> Påbörjad
                  </span>
                ) : (
                  <span className="text-xs text-sage-800">Ny</span>
                )}
                <ChevronRight size={18} className="text-sage-800" />
              </div>
            </button>
          );
        })}
      </div>

      {showExport && (
        <ExportModal
          states={states}
          onClose={() => setShowExport(false)}
        />
      )}
    </div>
  );
}

function ModuleView({
  meta,
  state,
  onOpen,
  onComplete,
  onUpdate,
  onBack,
  onExport,
  onSendStep,
}: {
  meta: (typeof MODULES)[number];
  state: ModuleState;
  onOpen: () => void;
  onComplete: () => void;
  onUpdate: (patch: Partial<ModuleState> | ((p: ModuleState) => ModuleState)) => void;
  onBack: () => void;
  onExport: () => void;
  onSendStep: (text: string, from: string) => void;
}) {
  useEffect(() => {
    if (state.openedAt) return;
    onOpen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-5 pb-4">
      <div className="sticky top-0 z-20 -mx-4 mb-1 flex items-center bg-ink-900/90 px-4 pb-2 pt-3 backdrop-blur-md">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm text-sage-300 transition-colors active:text-sage-100"
        >
          <ArrowLeft size={18} /> Tillbaka till moduler
        </button>
      </div>

      <header className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/5 bg-ink-600/60 text-2xl">
          {meta.emoji}
        </div>
        <div className="flex-1">
          <h1 className="font-serif text-2xl leading-snug text-sage-100">{meta.title}</h1>
          <p className="text-sm text-sage-700">{meta.subtitle}</p>
        </div>
      </header>

      <section>
        <h2 className="mb-3 px-1 text-xs font-medium uppercase tracking-widest text-sage-500">
          Teori
        </h2>
        <CardStack cards={meta.cards} />
      </section>

      <section>
        <h2 className="mb-3 px-1 text-xs font-medium uppercase tracking-widest text-sage-500">
          Övning
        </h2>
        {meta.id === 'life_areas' && <LifeAreasExercise state={state} onUpdate={onUpdate} onSendStep={onSendStep} />}
        {meta.id === 'self_talk' && <ReframeExercise state={state} onUpdate={onUpdate} onSendStep={onSendStep} />}
        {meta.id === 'expectations' && <ExpectationsExercise state={state} onUpdate={onUpdate} onSendStep={onSendStep} />}
        {meta.id === 'change_process' && <DecisionExercise state={state} onUpdate={onUpdate} onSendStep={onSendStep} />}
        {meta.id === 'values_clarification' && <ValuesExercise state={state} onUpdate={onUpdate} onSendStep={onSendStep} />}
        {meta.id === 'stress_recovery' && <StressRecoveryExercise state={state} onUpdate={onUpdate} onSendStep={onSendStep} />}
        {meta.id === 'relationship_boundaries' && <BoundariesExercise state={state} onUpdate={onUpdate} onSendStep={onSendStep} />}
        {meta.id === 'self_compassion' && <CompassionExercise state={state} onUpdate={onUpdate} onSendStep={onSendStep} />}
      </section>

      <div className="space-y-3">
        {state.completedAt ? (
          <div className="flex items-center justify-center gap-2 rounded-xl border border-sage-600/30 bg-sage-500/10 py-3 text-sm text-sage-300">
            <Check size={16} /> Modul klar
          </div>
        ) : (
          <button onClick={onComplete} className="btn-primary w-full">
            Markera modul som klar
          </button>
        )}
        <button
          onClick={onExport}
          className="btn-ghost w-full border border-white/5 bg-ink-700/60"
        >
          <Download size={16} /> Exportera denna moduls svar
        </button>
        <button
          onClick={onBack}
          className="inline-flex w-full items-center justify-center gap-1.5 pt-1 text-sm text-sage-400 transition-colors active:text-sage-200"
        >
          <ArrowLeft size={16} /> Tillbaka till moduler
        </button>
      </div>
    </div>
  );
}

function ExportModal({
  states,
  onClose,
}: {
  states: AllStates;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const fullText = buildFullSummary(states);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  };

  const download = () => {
    const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `egenmakt-reflektioner-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-t-3xl border-t border-white/10 bg-ink-800 p-6 safe-bottom animate-slide-up sm:rounded-3xl sm:border"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-5 hidden h-1 w-10 rounded-full bg-sage-800 sm:block" />
        <h3 className="font-serif text-2xl text-sage-100">Mina reflektioner</h3>
        <p className="mt-1 text-sm text-sage-700">
          Sammanfattning av alla dina sparade svar. Kopiera eller spara som textfil.
        </p>

        <div className="mt-4 max-h-64 overflow-y-auto rounded-xl border border-white/5 bg-ink-900/60 p-4">
          <pre className="whitespace-pre-wrap break-words font-sans text-xs leading-relaxed text-sage-300">
            {fullText.trim() || 'Du har inga sparade svar ännu.'}
          </pre>
        </div>

        <div className="mt-5 flex gap-3">
          <button onClick={onClose} className="btn-ghost flex-1 border border-white/5">
            Stäng
          </button>
          <button onClick={copy} className="btn-ghost flex-1 border border-white/5 bg-ink-700/60">
            {copied ? (
              <>
                <Check size={16} /> Kopierad
              </>
            ) : (
              <>
                <Copy size={16} /> Kopiera
              </>
            )}
          </button>
          <button onClick={download} className="btn-primary flex-1">
            <Download size={16} /> Spara
          </button>
        </div>
      </div>
    </div>
  );
}
