import { useState, useCallback, useRef, useEffect } from "react";

export interface TTSState {
  isEnabled: boolean;
  isSpeaking: boolean;
}

export interface TTSActions {
  toggle: () => void;
  speak: (word: string, wpm: number) => void;
  stop: () => void;
}

/**
 * Text-to-Speech Engine
 * Uses the Web Speech API to speak words one at a time,
 * synced with the highlight system. Speed adapts to current WPM.
 *
 * Key design:
 * - Does NOT cancel before speaking — Chrome silently drops utterances
 *   if cancel() is called immediately before speak().
 * - Instead, queues one utterance at a time and lets it finish naturally.
 * - For rapid word changes (timer mode), we allow overlap and
 *   only cancel when explicitly stopped.
 */
export function useTextToSpeech(): [TTSState, TTSActions] {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const enabledRef = useRef(false);

  // Keep ref in sync so callbacks always have latest value
  useEffect(() => {
    enabledRef.current = isEnabled;
  }, [isEnabled]);

  // Initialize synth reference
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      synthRef.current = window.speechSynthesis;
    }
    return () => {
      synthRef.current?.cancel();
    };
  }, []);

  /**
   * Convert WPM to SpeechSynthesis rate.
   * Normal speech ≈ 150 WPM at rate 1.0.
   * Range: 0.1 – 10.
   */
  const wpmToRate = useCallback((wpm: number): number => {
    const rate = wpm / 150;
    return Math.max(0.1, Math.min(rate, 10));
  }, []);

  const stop = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setIsSpeaking(false);
  }, []);

  const speak = useCallback(
    (word: string, wpm: number) => {
      const synth = synthRef.current;
      if (!enabledRef.current || !synth || !word) return;

      // Cancel any queued/in-progress speech, then schedule the new
      // utterance on next tick so Chrome's internal state resets.
      synth.cancel();

      // Use setTimeout(0) to let the cancel() fully flush before
      // we push a new utterance — this is the Chrome workaround.
      setTimeout(() => {
        if (!enabledRef.current) return; // user toggled off in the meantime

        const utterance = new SpeechSynthesisUtterance(word);
        utterance.rate = wpmToRate(wpm);
        utterance.pitch = 1;
        utterance.volume = 1;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = (e) => {
          // "interrupted" is expected when we cancel for next word
          if (e.error !== "interrupted") {
            console.warn("TTS error:", e.error);
          }
          setIsSpeaking(false);
        };

        synth.speak(utterance);
      }, 10);
    },
    [wpmToRate]
  );

  const toggle = useCallback(() => {
    setIsEnabled((prev) => {
      if (prev) {
        synthRef.current?.cancel();
        setIsSpeaking(false);
      } else {
        // Chrome requires a user-gesture-initiated utterance to "unlock"
        // the speech engine. Speak a silent/empty utterance on first enable.
        const synth = synthRef.current;
        if (synth) {
          const unlock = new SpeechSynthesisUtterance("");
          unlock.volume = 0;
          synth.speak(unlock);
        }
      }
      return !prev;
    });
  }, []);

  const state: TTSState = {
    isEnabled,
    isSpeaking,
  };

  const actions: TTSActions = {
    toggle,
    speak,
    stop,
  };

  return [state, actions];
}
