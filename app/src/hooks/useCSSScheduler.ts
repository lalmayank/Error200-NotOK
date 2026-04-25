import { useCallback, useRef, useEffect } from "react";

/**
 * High-Performance CSS Variable Scheduler
 * Batches all CSS custom property mutations into a single requestAnimationFrame
 * write cycle to prevent layout thrashing on large token corpora.
 */
export function useCSSScheduler() {
  const pendingRef = useRef<Map<string, string>>(new Map());
  const rafRef = useRef<number | null>(null);
  const targetRef = useRef<HTMLElement | null>(null);

  const flush = useCallback(() => {
    rafRef.current = null;
    const target = targetRef.current;
    if (!target) return;

    const pending = pendingRef.current;
    if (pending.size === 0) return;

    // Single write pass: update all pending CSS variables
    pending.forEach((value, key) => {
      target.style.setProperty(key, value);
    });

    pending.clear();
  }, []);

  const schedule = useCallback(
    (key: string, value: string) => {
      pendingRef.current.set(key, value);

      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }

      rafRef.current = requestAnimationFrame(flush);
    },
    [flush]
  );

  const setTarget = useCallback((el: HTMLElement | null) => {
    targetRef.current = el;
  }, []);

  const batchUpdate = useCallback(
    (updates: Record<string, string>) => {
      Object.entries(updates).forEach(([key, value]) => {
        pendingRef.current.set(key, value);
      });

      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }

      rafRef.current = requestAnimationFrame(flush);
    },
    [flush]
  );

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return { schedule, batchUpdate, setTarget };
}
