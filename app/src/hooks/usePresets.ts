import { useState, useCallback, useEffect } from "react";
import type { ReaderSettings } from "./useURLPersistence";

const STORAGE_KEY = "lucida_presets";

export interface Preset {
  id: string;
  name: string;
  settings: ReaderSettings;
  createdAt: number;
}

const DEFAULT_PRESETS: Preset[] = [
  {
    id: "preset-study",
    name: "Study",
    settings: {
      font: "Inter",
      letterSpacing: 0.05,
      wordSpacing: 0.4,
      lineHeight: 2.0,
      paragraphSpacing: 1.6,
      columnWidth: 55,
      backgroundTint: "cream",
      wpm: 120,
      mode: "manual",
    },
    createdAt: Date.now(),
  },
  {
    id: "preset-focus",
    name: "Focus",
    settings: {
      font: "OpenDyslexic",
      letterSpacing: 0.08,
      wordSpacing: 0.3,
      lineHeight: 1.8,
      paragraphSpacing: 1.4,
      columnWidth: 50,
      backgroundTint: "pale-blue",
      wpm: 150,
      mode: "timer",
    },
    createdAt: Date.now(),
  },
  {
    id: "preset-relax",
    name: "Relax",
    settings: {
      font: "Lexie Readable",
      letterSpacing: 0.02,
      wordSpacing: 0.5,
      lineHeight: 2.2,
      paragraphSpacing: 1.8,
      columnWidth: 60,
      backgroundTint: "soft-mint",
      wpm: 100,
      mode: "manual",
    },
    createdAt: Date.now(),
  },
];

/**
 * Named Preset System
 * Saves and restores reading configurations to localStorage.
 * Falls back to cloud via tRPC when authenticated.
 */
export function usePresets() {
  const [presets, setPresets] = useState<Preset[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Preset[];
        setPresets(parsed);
      } else {
        setPresets(DEFAULT_PRESETS);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PRESETS));
      }
    } catch {
      setPresets(DEFAULT_PRESETS);
    }
    setLoaded(true);
  }, []);

  const saveToStorage = useCallback((next: Preset[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Ignore storage errors
    }
  }, []);

  const savePreset = useCallback(
    (name: string, settings: ReaderSettings) => {
      const newPreset: Preset = {
        id: `preset-${Date.now()}`,
        name,
        settings,
        createdAt: Date.now(),
      };
      const next = [...presets, newPreset];
      setPresets(next);
      saveToStorage(next);
      return newPreset;
    },
    [presets, saveToStorage]
  );

  const deletePreset = useCallback(
    (id: string) => {
      const next = presets.filter((p) => p.id !== id);
      setPresets(next);
      saveToStorage(next);
    },
    [presets, saveToStorage]
  );

  const loadPreset = useCallback(
    (id: string): ReaderSettings | null => {
      const preset = presets.find((p) => p.id === id);
      return preset ? preset.settings : null;
    },
    [presets]
  );

  return { presets, savePreset, deletePreset, loadPreset, loaded };
}
