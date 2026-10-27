import { useCallback, useEffect, useState } from 'react';

export function todayKey(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

/**
 * useLocalStorage — persisted state with cross-tab sync and SSR safety.
 * On read failure or parse error, returns initial.
 */
export function useLocalStorage<T>(key: string, initial: T): [T, (v: T | ((p: T) => T)) => void] {
  const [state, setState] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return initial;
      return JSON.parse(raw) as T;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {
      /* ignore quota / private mode */
    }
  }, [key, state]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== key) return;
      try {
        setState(e.newValue === null ? initial : (JSON.parse(e.newValue) as T));
      } catch {
        /* ignore */
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const set = useCallback((v: T | ((p: T) => T)) => {
    setState((prev) => (typeof v === 'function' ? (v as (p: T) => T)(prev) : v));
  }, []);

  return [state, set];
}

/**
 * useDailyLocalStorage — like useLocalStorage, but resets to `initial`
 * automatically when the calendar day changes. The stored value is wrapped
 * with a date stamp; on read, if the stamp differs from today, initial is
 * returned (and the effect writes the fresh initial).
 */
export function useDailyLocalStorage<T>(
  key: string,
  initial: T | ((d: string) => T)
): [T, (v: T | ((p: T) => T)) => void, string] {
  const today = todayKey();
  const makeInitial = useCallback(
    (d: string): T => (typeof initial === 'function' ? (initial as (d: string) => T)(d) : initial),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const [state, setState] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return makeInitial(today);
      const parsed = JSON.parse(raw) as { date: string; value: T };
      if (parsed.date !== today) return makeInitial(today);
      return parsed.value;
    } catch {
      return makeInitial(today);
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify({ date: today, value: state }));
    } catch {
      /* ignore */
    }
  }, [key, state, today]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== key) return;
      try {
        const parsed = e.newValue === null ? null : (JSON.parse(e.newValue) as { date: string; value: T });
        if (!parsed || parsed.date !== todayKey()) return;
        setState(parsed.value);
      } catch {
        /* ignore */
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [key]);

  // Auto-reset at midnight if app stays open
  useEffect(() => {
    const interval = setInterval(() => {
      if (todayKey() !== today) {
        setState(makeInitial(todayKey()));
      }
    }, 60_000);
    return () => clearInterval(interval);
  }, [today, makeInitial]);

  const set = useCallback((v: T | ((p: T) => T)) => {
    setState((prev) => (typeof v === 'function' ? (v as (p: T) => T)(prev) : v));
  }, []);

  return [state, set, today];
}
