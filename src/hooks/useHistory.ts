import { useEffect, useRef } from 'react';
import { useLocalStorage } from '@/hooks/useStorage';
import type { DailyData, HistoryEntry } from '@/types';

export function useHistory() {
  const [history, setHistory] = useLocalStorage<HistoryEntry[]>('egenmakt.history', []);
  return [history, setHistory] as const;
}

export function useDailyArchiver(day: DailyData, dateKey: string) {
  const [, setHistory] = useHistory();
  const prevSnapshot = useRef('');

  useEffect(() => {
    const completedSteps = day.steps.filter((s) => s.done).map((s) => s.text);
    const snapshot = `${dateKey}|${day.intention}|${completedSteps.join(';')}|${day.steps.length}`;

    if (snapshot === prevSnapshot.current) return;
    prevSnapshot.current = snapshot;

    if (!day.intention && day.steps.length === 0) return;

    setHistory((prev) => {
      const existing = prev.find((e) => e.date === dateKey);
      const entry: HistoryEntry = {
        date: dateKey,
        intention: day.intention,
        completedSteps,
        totalSteps: day.steps.length,
      };
      if (existing) {
        return prev.map((e) => (e.date === dateKey ? entry : e));
      }
      return [...prev, entry].sort((a, b) => b.date.localeCompare(a.date));
    });
  }, [day, dateKey, setHistory]);
}
