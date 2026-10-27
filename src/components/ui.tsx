import { useEffect, useRef, useState } from 'react';
import { Check } from 'lucide-react';
import type { SaveState } from '@/types';

export function SaveIndicator({ state }: { state: SaveState }) {
  const [show, setShow] = useState(false);
  const prev = useRef<SaveState>('idle');

  useEffect(() => {
    if (state === 'saved' && prev.current !== 'saved') {
      setShow(true);
      const t = setTimeout(() => setShow(false), 1800);
      prev.current = state;
      return () => clearTimeout(t);
    }
    prev.current = state;
  }, [state]);

  if (!show) return null;
  return (
    <span className="inline-flex animate-pop items-center gap-1.5 rounded-full bg-sage-500/15 px-2.5 py-1 text-xs font-medium text-sage-300">
      <Check size={12} /> Sparat
    </span>
  );
}

type Props = {
  checked: boolean;
  onToggle: () => void;
  size?: number;
};

export function Checkbox({ checked, onToggle, size = 24 }: Props) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={checked}
      aria-label={checked ? 'Avbocka' : 'Bocka av'}
      className="shrink-0 rounded-full border transition-all active:scale-90"
      style={{
        width: size,
        height: size,
        borderColor: checked ? '#7fa088' : '#324535',
        backgroundColor: checked ? '#7fa088' : 'transparent',
      }}
    >
      <span
        className="flex h-full w-full items-center justify-center text-ink-900 transition-opacity"
        style={{ opacity: checked ? 1 : 0 }}
      >
        <Check size={size * 0.6} strokeWidth={3} />
      </span>
    </button>
  );
}

type TextInputProps = {
  onAdd: (text: string) => void;
  placeholder?: string;
  buttonText?: string;
  maxLength?: number;
};

export function AddRow({ onAdd, placeholder, buttonText = 'Lägg till', maxLength = 140 }: TextInputProps) {
  const [text, setText] = useState('');
  const ref = useRef<HTMLInputElement>(null);

  const submit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setText('');
    requestAnimationFrame(() => ref.current?.focus());
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="flex items-center gap-2"
    >
      <input
        ref={ref}
        value={text}
        onChange={(e) => setText(e.target.value.slice(0, maxLength))}
        placeholder={placeholder}
        className="flex-1 rounded-xl border border-white/5 bg-ink-600/60 px-3.5 py-2.5 text-sm text-sage-100 placeholder:text-sage-700 focus:border-sage-600/60"
      />
      <button
        type="submit"
        disabled={!text.trim()}
        className="rounded-xl bg-sage-500/90 px-3.5 py-2.5 text-sm font-medium text-ink-900 transition-all active:scale-95 disabled:opacity-40"
      >
        {buttonText}
      </button>
    </form>
  );
}

type TextareaProps = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  maxLength?: number;
  className?: string;
  minRows?: number;
};

export function AutoTextarea({
  value,
  onChange,
  placeholder,
  maxLength = 600,
  className = '',
  minRows = 2,
}: TextareaProps) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.max(el.scrollHeight, minRows * 24 + 16)}px`;
  }, [value, minRows]);

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
      placeholder={placeholder}
      className={`w-full rounded-xl border border-white/5 bg-ink-600/50 px-4 py-3 text-[15px] leading-relaxed text-sage-100 placeholder:text-sage-700 focus:border-sage-600/60 ${className}`}
    />
  );
}
