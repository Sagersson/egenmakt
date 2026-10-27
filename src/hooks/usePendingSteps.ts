import { useLocalStorage } from '@/hooks/useStorage';
import { uid } from '@/hooks/useStorage';
import type { MicroStep } from '@/types';

const PENDING_KEY = 'egenmakt.pendingSteps';

export function usePendingSteps() {
  const [pending, setPending] = useLocalStorage<{ text: string; from: string }[]>(PENDING_KEY, []);

  const sendStep = (text: string, from: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setPending((prev) => [...prev, { text: trimmed.slice(0, 140), from }]);
  };

  const drain = (adder: (text: string) => void) => {
    pending.forEach((p) => adder(p.text));
    setPending([]);
  };

  const count = pending.length;
  return { pending, sendStep, drain, count };
}

export function useHapticFeedback() {
  return (pattern: number | number[] = 10) => {
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(pattern);
      }
    } catch {
      /* ignore */
    }
  };
}
