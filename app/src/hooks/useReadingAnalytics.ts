import { useState, useCallback, useRef, useEffect } from "react";

export interface AnalyticsState {
  wordsRead: number;
  elapsedSeconds: number;
  currentWpm: number;
  isTracking: boolean;
}

export interface AnalyticsActions {
  startTracking: () => void;
  stopTracking: () => void;
  updateWordsRead: (words: number) => void;
  reset: () => void;
}

/**
 * Reading Analytics Engine
 * Session-based WPM estimator derived from word count and elapsed time.
 * Tracks only active reading time (pauses excluded).
 */
export function useReadingAnalytics(): [AnalyticsState, AnalyticsActions] {
  const [wordsRead, setWordsRead] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isTracking, setIsTracking] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const accumulatedRef = useRef<number>(0);

  const tick = useCallback(() => {
    const now = Date.now();
    const delta = (now - startTimeRef.current) / 1000;
    accumulatedRef.current += delta;
    startTimeRef.current = now;
    setElapsedSeconds(Math.round(accumulatedRef.current));
  }, []);

  const startTracking = useCallback(() => {
    if (isTracking) return;
    setIsTracking(true);
    startTimeRef.current = Date.now();
    intervalRef.current = setInterval(tick, 1000);
  }, [isTracking, tick]);

  const stopTracking = useCallback(() => {
    if (!isTracking) return;
    setIsTracking(false);
    tick(); // flush remaining time
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [isTracking, tick]);

  const updateWordsRead = useCallback((words: number) => {
    setWordsRead(words);
  }, []);

  const reset = useCallback(() => {
    setWordsRead(0);
    setElapsedSeconds(0);
    setIsTracking(false);
    accumulatedRef.current = 0;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const currentWpm =
    elapsedSeconds > 0 ? Math.round((wordsRead / elapsedSeconds) * 60) : 0;

  const state: AnalyticsState = {
    wordsRead,
    elapsedSeconds,
    currentWpm,
    isTracking,
  };

  const actions: AnalyticsActions = {
    startTracking,
    stopTracking,
    updateWordsRead,
    reset,
  };

  return [state, actions];
}
