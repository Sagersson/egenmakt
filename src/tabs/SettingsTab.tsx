import { useRef, useState } from 'react';
import { Settings, Download, Upload, Check, AlertTriangle } from 'lucide-react';

const ALL_KEYS = [
  'egenmakt.today',
  'egenmakt.history',
  'egenmakt.modules.v2',
  'egenmakt.goals',
  'egenmakt.goals.active',
  'egenmakt.pendingSteps',
];

export function SettingsTab() {
  const [status, setStatus] = useState<'idle' | 'exported' | 'imported' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const exportBackup = () => {
    try {
      const data: Record<string, unknown> = {};
      for (const key of ALL_KEYS) {
        const raw = localStorage.getItem(key);
        if (raw !== null) {
          data[key] = JSON.parse(raw);
        }
      }
      const blob = new Blob([JSON.stringify({ app: 'egenmakt', version: 1, exportedAt: new Date().toISOString(), data }, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `egenmakt-sakerhetskopia-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setStatus('exported');
      setTimeout(() => setStatus('idle'), 2500);
    } catch {
      setStatus('error');
      setErrorMsg('Kunde inte skapa säkerhetskopian.');
    }
  };

  const importBackup = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        if (!parsed || typeof parsed !== 'object' || !parsed.data) {
          setStatus('error');
          setErrorMsg('Filen verkar inte vara en giltig Egenmakt-säkerhetskopia.');
          return;
        }
        for (const key of ALL_KEYS) {
          if (parsed.data[key] !== undefined) {
            localStorage.setItem(key, JSON.stringify(parsed.data[key]));
          }
        }
        setStatus('imported');
        setErrorMsg('');
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      } catch {
        setStatus('error');
        setErrorMsg('Kunde inte läsa filen. Kontrollera att det är en giltig JSON-fil.');
      }
    };
    reader.onerror = () => {
      setStatus('error');
      setErrorMsg('Kunde inte läsa filen.');
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-5 pb-4">
      <header className="pt-1">
        <p className="text-xs uppercase tracking-widest text-sage-700">Inställningar</p>
        <h1 className="mt-1 font-serif text-3xl text-sage-100">Data & säkerhet</h1>
        <p className="mt-2 text-sm text-sage-700">
          All din data sparas lokalt i din webbläsare. Skapa en säkerhetskopia regelbundet, eller återställ från en tidigare kopia.
        </p>
      </header>

      <section className="card animate-slide-up space-y-4">
        <div className="flex items-center gap-2 text-sage-300">
          <Settings size={18} />
          <h2 className="text-sm font-medium uppercase tracking-wider">Säkerhetskopiering</h2>
        </div>

        <button onClick={exportBackup} className="btn-primary w-full">
          <Download size={16} /> Exportera säkerhetskopia
        </button>

        <button
          onClick={() => fileRef.current?.click()}
          className="btn-ghost w-full border border-white/5 bg-ink-700/60"
        >
          <Upload size={16} /> Importera säkerhetskopia
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) importBackup(file);
            e.target.value = '';
          }}
        />

        {status === 'exported' && (
          <div className="flex items-center gap-2 rounded-xl border border-sage-600/30 bg-sage-500/10 px-4 py-3 text-sm text-sage-300">
            <Check size={16} /> Säkerhetskopian laddades ner.
          </div>
        )}
        {status === 'imported' && (
          <div className="flex items-center gap-2 rounded-xl border border-sage-600/30 bg-sage-500/10 px-4 py-3 text-sm text-sage-300">
            <Check size={16} /> Säkerhetskopian lästes in. Appen uppdateras…
          </div>
        )}
        {status === 'error' && (
          <div className="flex items-center gap-2 rounded-xl border border-rose-600/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
            <AlertTriangle size={16} /> {errorMsg}
          </div>
        )}

        <p className="text-xs leading-relaxed text-sage-700">
          Importen ersätter all nuvarande data i appen med innehållet från filen. Säkerhetskopiera först om du är osäker.
        </p>
      </section>
    </div>
  );
}
