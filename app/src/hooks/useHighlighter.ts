import { useState, useCallback, useRef, useEffect } from "react";

type HighlightMode = "manual" | "timer";

export interface HighlightState {
  activeIndex: number;
  mode: HighlightMode;
  isRunning: boolean;
  wpm: number;
  totalWords: number;
}

export interface HighlightActions {
  setActiveIndex: (index: number) => void;
  next: () => void;
  prev: () => void;
  setMode: (mode: HighlightMode) => void;
  toggleRun: () => void;
  start: () => void;
  pause: () => void;
  setWpm: (wpm: number) => void;
  reset: () => void;
  jumpToParagraph: (paragraphStartIndex: number) => void;
}

/**
 * Progressive Highlight Automaton
 * Manages word-by-word traversal with manual and timer-based modes.
 * Implements immediate pause/resume with drift-corrected timing.
 */
export function useHighlighter(totalWords: number): [HighlightState, HighlightActions] {
  const [activeIndex, setActiveIndex] = useState(0);
  const [mode, setModeState] = useState<HighlightMode>("manual");
  const [isRunning, setIsRunning] = useState(false);
  const [wpm, setWpm] = useState(200);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nextTimeRef = useRef<number>(0);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const scheduleNext = useCallback(() => {
    clearTimer();
    const delay = (60 / wpm) * 1000;
    nextTimeRef.current = Date.now() + delay;

    timerRef.current = setTimeout(() => {
      setActiveIndex((prev) => {
        const next = prev + 1;
        if (next >= totalWords) {
          setIsRunning(false);
          return prev;
        }
        return next;
      });

      // Recursive scheduling with drift correction
      if (isRunning) {
        const drift = Date.now() - nextTimeRef.current;
        const correctedDelay = Math.max(0, delay - drift);
        timerRef.current = setTimeout(() => {
          setActiveIndex((prev) => {
            const next = prev + 1;
            if (next >= totalWords) {
              setIsRunning(false);
              return prev;
            }
            return next;
          });
          if (isRunning) scheduleNext();
        }, correctedDelay);
      }
    }, delay);
  }, [wpm, totalWords, isRunning, clearTimer]);

  // Timer effect: start/stop based on isRunning
  useEffect(() => {
    if (mode === "timer" && isRunning) {
      scheduleNext();
    } else {
      clearTimer();
    }
    return () => clearTimer();
  }, [mode, isRunning, scheduleNext, clearTimer]);

  const next = useCallback(() => {
    setActiveIndex((prev) => Math.min(prev + 1, totalWords - 1));
  }, [totalWords]);

  const prev = useCallback(() => {
    setActiveIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  const setMode = useCallback(
    (newMode: HighlightMode) => {
      setModeState(newMode);
      if (newMode === "manual") {
        setIsRunning(false);
        clearTimer();
      }
    },
    [clearTimer]
  );

  const toggleRun = useCallback(() => {
    if (mode !== "timer") {
      setModeState("timer");
    }
    setIsRunning((prev) => !prev);
  }, [mode]);

  const start = useCallback(() => {
    if (mode !== "timer") setModeState("timer");
    setIsRunning(true);
  }, [mode]);

  const pause = useCallback(() => {
    setIsRunning(false);
    clearTimer();
  }, [clearTimer]);

  const reset = useCallback(() => {
    setActiveIndex(0);
    setIsRunning(false);
    clearTimer();
  }, [clearTimer]);

  const jumpToParagraph = useCallback((paragraphStartIndex: number) => {
    setActiveIndex(paragraphStartIndex);
  }, []);

  const state: HighlightState = {
    activeIndex,
    mode,
    isRunning,
    wpm,
    totalWords,
  };

  const actions: HighlightActions = {
    setActiveIndex,
    next,
    prev,
    setMode,
    toggleRun,
    start,
    pause,
    setWpm,
    reset,
    jumpToParagraph,
  };

  return [state, actions];
}
