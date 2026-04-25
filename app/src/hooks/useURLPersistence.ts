import { useCallback, useEffect, useRef } from "react";

export interface ReaderSettings {
  font: string;
  fontSize: number;
  letterSpacing: number;
  wordSpacing: number;
  lineHeight: number;
  paragraphSpacing: number;
  columnWidth: number;
  backgroundTint: string;
  wpm: number;
  mode: string;
}

const DEFAULT_SETTINGS: ReaderSettings = {
  font: "Inter",
  fontSize: 1.5,
  letterSpacing: 0,
  wordSpacing: 0.25,
  lineHeight: 1.6,
  paragraphSpacing: 1.5,
  columnWidth: 65,
  backgroundTint: "cream",
  wpm: 200,
  mode: "manual",
};

/**
 * URL Persistence Engine
 * Serializes current settings into URL hash for shareable configurations.
 * Deserializes on load to restore state.
 */
export function useURLPersistence() {
  const hasLoadedRef = useRef(false);

  const serialize = useCallback((settings: ReaderSettings) => {
    try {
      const json = JSON.stringify(settings);
      const encoded = btoa(json);
      window.location.hash = encoded;
    } catch {
      // Ignore encoding errors
    }
  }, []);

  const deserialize = useCallback((): ReaderSettings | null => {
    try {
      const hash = window.location.hash.slice(1);
      if (!hash) return null;
      const json = atob(hash);
      const parsed = JSON.parse(json);
      return { ...DEFAULT_SETTINGS, ...parsed };
    } catch {
      return null;
    }
  }, []);

  const loadFromURL = useCallback((): ReaderSettings | null => {
    if (hasLoadedRef.current) return null;
    hasLoadedRef.current = true;
    return deserialize();
  }, [deserialize]);

  useEffect(() => {
    const handleHashChange = () => {
      hasLoadedRef.current = false;
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  return { serialize, deserialize, loadFromURL, DEFAULT_SETTINGS };
}
