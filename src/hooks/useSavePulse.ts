import { useEffect, useRef, useState } from 'react';
import type { SaveState } from '@/types';

export function useSavePulse(value: unknown): SaveState {
  const [state, setState] = useState<SaveState>('idle');
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setState('saving');
    const t = setTimeout(() => setState('saved'), 450);
    return () => clearTimeout(t);
  }, [value]);
  return state;
}
