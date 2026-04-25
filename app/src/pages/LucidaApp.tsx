import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { Upload, Loader2, Home, BookOpen } from "lucide-react";
import { extractTextFromPDF } from "@/lib/pdfParser";
import { useTheme } from "next-themes";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import CapturePane from "@/components/CapturePane";
import ReadingPane from "@/components/ReadingPane";
import ControlPanel from "@/components/ControlPanel";
import HighlightControls from "@/components/HighlightControls";
import ReadingRuler from "@/components/ReadingRuler";
import PresetManager from "@/components/PresetManager";
import AnalyticsFooter from "@/components/AnalyticsFooter";
import { useTokenization } from "@/hooks/useTokenization";
import { useCSSScheduler } from "@/hooks/useCSSScheduler";
import { useHighlighter } from "@/hooks/useHighlighter";
import { useReadingAnalytics } from "@/hooks/useReadingAnalytics";
import { useURLPersistence } from "@/hooks/useURLPersistence";
import { usePresets } from "@/hooks/usePresets";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import type { ReaderSettings } from "@/hooks/useURLPersistence";
import { useIsMobile } from "@/hooks/use-mobile";

const BG_MAP: Record<string, string> = {
  white: "#FFFFFF",
  cream: "#FDFBF7",
  "pale-blue": "#F0F4F8",
  yellow: "#FEF9E7",
  "soft-mint": "#F0F9F4",
};

// Added Dark Mode equivalents for the tints
const DARK_BG_MAP: Record<string, string> = {
  white: "#020617", // slate-950
  cream: "#121110",
  "pale-blue": "#0A111A",
  yellow: "#14130B",
  "soft-mint": "#0A120E",
};

const FONT_MAP: Record<string, string> = {
  Inter: "'Inter', system-ui, sans-serif",
  OpenDyslexic: "'OpenDyslexic', sans-serif",
  "Lexie Readable": "'Lexie Readable', sans-serif",
  Georgia: "Georgia, 'Times New Roman', serif",
  System: "system-ui, -apple-system, sans-serif",
};

export default function LucidaApp() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const isMobile = useIsMobile();
  const { tokenize } = useTokenization();
  const { batchUpdate, setTarget } = useCSSScheduler();
  const { serialize, loadFromURL, DEFAULT_SETTINGS } = useURLPersistence();
  const { presets, savePreset, deletePreset } = usePresets();
  const [isExtracting, setIsExtracting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [ttsState, ttsActions] = useTextToSpeech();

  const initialSettings = useMemo(() => {
    const urlSettings = loadFromURL();
    return urlSettings || DEFAULT_SETTINGS;
  }, [loadFromURL, DEFAULT_SETTINGS]);

  const [settings, setSettings] = useState<ReaderSettings>(initialSettings);
  const [paragraphs, setParagraphs] = useState<ReturnType<typeof tokenize>>([]);
  const [isImmersed, setIsImmersed] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activePane, setActivePane] = useState<"source" | "reader">("reader");
  const readingPaneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsSidebarOpen(!isMobile);
    if (isMobile) setActivePane("reader");
  }, [isMobile]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsExtracting(true);
    try {
      const text = await extractTextFromPDF(file);
      
      // Feed the extracted text directly into your existing rehydrate function
      handleRehydrate(text);
      
      // Automatically switch to the reader pane
      setActivePane("reader");
      
      // If on mobile, close the sidebar so they can start reading immediately
      if (isMobile) setIsSidebarOpen(false);
      
    } catch (error) {
      console.error("Failed to parse PDF:", error);
      alert("Could not extract text from this PDF. It might be an image-based scan.");
    } finally {
      setIsExtracting(false);
      // Reset the file input so the user can upload the same file again if needed
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const totalWords = useMemo(() => {
    return paragraphs.reduce((sum, p) => sum + p.words.length, 0);
  }, [paragraphs]);

  const [highlightState, highlightActions] = useHighlighter(totalWords);
  const [analyticsState, analyticsActions] = useReadingAnalytics();

  const activeParagraphId = useMemo(() => {
    let idx = 0;
    for (const p of paragraphs) {
      const endIdx = idx + p.words.length;
      if (highlightState.activeIndex >= idx && highlightState.activeIndex < endIdx) {
        return p.id;
      }
      idx = endIdx;
    }
    return 0;
  }, [paragraphs, highlightState.activeIndex]);

  const createPresetMutation = trpc.preset.create.useMutation();

  // Helper to resolve the correct background color based on theme
  const currentBgColor = theme === "dark" 
    ? (DARK_BG_MAP[settings.backgroundTint] || DARK_BG_MAP.cream)
    : (BG_MAP[settings.backgroundTint] || BG_MAP.cream);

  useEffect(() => {
    const updates = {
      "--reader-font": FONT_MAP[settings.font] || FONT_MAP.Inter,
      "--reader-font-size": `${settings.fontSize || 1.5}rem`, // Added Font Size
      "--reader-letter-spacing": `${settings.letterSpacing}em`,
      "--reader-word-spacing": `${settings.wordSpacing}em`,
      "--reader-line-height": `${settings.lineHeight}`,
      "--reader-paragraph-spacing": `${settings.paragraphSpacing}em`,
      "--reader-column-width": `${settings.columnWidth}ch`,
      "--reader-bg": currentBgColor, 
    };
    batchUpdate(updates);
    serialize(settings);
  }, [settings, batchUpdate, serialize, currentBgColor]);

  // Apply CSS variables globally so the whole page tints properly
  useEffect(() => {
    setTarget(document.documentElement);
  }, [setTarget]);

  useEffect(() => {
    analyticsActions.updateWordsRead(highlightState.activeIndex);
  }, [highlightState.activeIndex, analyticsActions]);

  // TTS: speak the current word when highlight advances
  useEffect(() => {
    if (!ttsState.isEnabled || highlightState.activeIndex < 0) return;
    // Find the current word text from paragraphs
    let wordText = "";
    let idx = 0;
    for (const p of paragraphs) {
      for (const w of p.words) {
        if (idx === highlightState.activeIndex) {
          wordText = w.text;
          break;
        }
        idx++;
      }
      if (wordText) break;
    }
    if (wordText) {
      ttsActions.speak(wordText, highlightState.wpm);
    }
  }, [highlightState.activeIndex, ttsState.isEnabled, paragraphs, ttsActions, highlightState.wpm]);

  // Stop TTS when highlight transitions from running → paused
  const wasRunningRef = useRef(false);
  useEffect(() => {
    if (wasRunningRef.current && !highlightState.isRunning && ttsState.isEnabled) {
      ttsActions.stop();
    }
    wasRunningRef.current = highlightState.isRunning;
  }, [highlightState.isRunning, ttsState.isEnabled, ttsActions]);

  useEffect(() => {
    if (highlightState.isRunning) {
      analyticsActions.startTracking();
    } else {
      analyticsActions.stopTracking();
    }
  }, [highlightState.isRunning, analyticsActions]);

  // Keyboard shortcuts (unchanged)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      switch (e.key) {
        case "ArrowRight":
        case "ArrowDown":
          e.preventDefault();
          if (highlightState.mode === "manual") highlightActions.next();
          break;
        case "ArrowLeft":
        case "ArrowUp":
          e.preventDefault();
          if (highlightState.mode === "manual") highlightActions.prev();
          break;
        case " ":
          e.preventDefault();
          if (highlightState.mode === "timer") highlightActions.toggleRun();
          else highlightActions.next();
          break;
        case "Escape":
          e.preventDefault();
          setIsImmersed((prev) => !prev);
          break;
        case "i":
        case "I":
          if (!e.ctrlKey && !e.metaKey && !e.altKey) setIsImmersed((prev) => !prev);
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [highlightState.mode, highlightActions]);

  const handleRehydrate = useCallback(
    (text: string) => {
      const tokens = tokenize(text);
      setParagraphs(tokens);
      highlightActions.reset();
      analyticsActions.reset();
    },
    [tokenize, highlightActions, analyticsActions]
  );

  const handleSettingsChange = useCallback(
    (partial: Partial<ReaderSettings>) => {
      setSettings((prev) => ({ ...prev, ...partial }));
    },
    []
  );

  const handleWordClick = useCallback(
    (index: number) => {
      highlightActions.setActiveIndex(index);
    },
    [highlightActions]
  );

  const handleSavePreset = useCallback(
    (name: string, s: ReaderSettings) => {
      const preset = savePreset(name, s);
      if (user) {
        createPresetMutation.mutate({
          name: preset.name,
          font: s.font as any,
          letterSpacing: s.letterSpacing,
          wordSpacing: s.wordSpacing,
          lineHeight: s.lineHeight,
          columnWidth: s.columnWidth,
          backgroundTint: s.backgroundTint as any,
          wpm: s.wpm,
        });
      }
    },
    [savePreset, user, createPresetMutation]
  );

  const handleLoadPreset = useCallback(
    (s: ReaderSettings) => {
      setSettings(s);
      if (s.mode === "timer" || s.mode === "manual") {
        highlightActions.setMode(s.mode as "manual" | "timer");
      }
    },
    [highlightActions]
  );

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  return (
    // Apply the background color variable directly to the root container
    <div 
      className="h-screen w-screen flex flex-col overflow-hidden text-foreground transition-colors duration-300"
      style={{ backgroundColor: "var(--reader-bg)" }}
    >
      {/* Header */}
      <header
        className={`shrink-0 h-14 border-b border-slate-200/60 dark:border-slate-800/60 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl flex items-center justify-between px-4 sm:px-6 z-50 transition-all duration-400 ${
          isImmersed ? "opacity-10" : "opacity-100"
        }`}
      >
        <div className="flex items-center gap-3">
          {/* Home Nav Link */}
          <a
            href="/"
            className="flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950 border border-indigo-100 dark:border-indigo-900 text-indigo-500 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900 hover:text-indigo-600 dark:hover:text-indigo-300 hover:-translate-y-0.5 transition-all duration-200"
            aria-label="Go to Home page"
            title="Home"
          >
            <Home className="w-4 h-4" />
          </a>

          <button
            onClick={() => setIsSidebarOpen((p) => !p)}
            className="px-3 py-1.5 text-[10px] font-semibold tracking-widest uppercase rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 bg-white/80 dark:bg-slate-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:-translate-y-0.5 shadow-[0px_2px_0px_#e2e8f0] dark:shadow-[0px_2px_0px_#1e293b] active:translate-y-0.5 active:shadow-[0px_0px_0px_#e2e8f0] dark:active:shadow-[0px_0px_0px_#1e293b] focus-visible:outline-2 focus-visible:outline-indigo-400 focus-visible:outline-offset-2 transition-all duration-200"
            aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            aria-pressed={isSidebarOpen}
          >
            {isSidebarOpen ? "Hide" : "Show"}
          </button>

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center">
              <BookOpen className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h1 className="text-lg font-bold tracking-tight text-slate-800 dark:text-slate-200">Cadence</h1>
          </div>
          <span className="hidden sm:inline text-[10px] text-indigo-400 dark:text-indigo-500 font-mono tracking-widest uppercase font-semibold">
            Workspace
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Mobile Pane Switcher */}
          {isMobile && !isImmersed && (
            <div className="flex items-center gap-1 bg-indigo-50/60 dark:bg-indigo-950/40 p-1 rounded-xl border border-indigo-100 dark:border-indigo-900" role="tablist" aria-label="Pane switcher">
              <button
                onClick={() => setActivePane("source")}
                className={`px-3 py-1 text-[10px] font-semibold tracking-widest uppercase rounded-lg transition-all duration-200 focus-visible:outline-2 focus-visible:outline-indigo-400 focus-visible:outline-offset-2 ${
                  activePane === "source"
                    ? "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 shadow-[0px_2px_0px_#e2e8f0] dark:shadow-[0px_2px_0px_#1e293b] border border-indigo-100 dark:border-indigo-800"
                    : "text-slate-400 dark:text-slate-500 hover:text-indigo-500"
                }`}
                role="tab"
                aria-selected={activePane === "source"}
              >
                Source
              </button>
              <button
                onClick={() => setActivePane("reader")}
                className={`px-3 py-1 text-[10px] font-semibold tracking-widest uppercase rounded-lg transition-all duration-200 focus-visible:outline-2 focus-visible:outline-indigo-400 focus-visible:outline-offset-2 ${
                  activePane === "reader"
                    ? "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 shadow-[0px_2px_0px_#e2e8f0] dark:shadow-[0px_2px_0px_#1e293b] border border-indigo-100 dark:border-indigo-800"
                    : "text-slate-400 dark:text-slate-500 hover:text-indigo-500"
                }`}
                role="tab"
                aria-selected={activePane === "reader"}
              >
                Reader
              </button>
            </div>
          )}

          <button
            onClick={toggleTheme}
            className="px-3 py-1.5 text-[10px] font-semibold tracking-widest uppercase rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 bg-white/80 dark:bg-slate-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:-translate-y-0.5 shadow-[0px_2px_0px_#e2e8f0] dark:shadow-[0px_2px_0px_#1e293b] active:translate-y-0.5 active:shadow-[0px_0px_0px_#e2e8f0] transition-all duration-200"
          >
            {theme === "dark" ? "Light" : "Dark"}
          </button>

          <button
            onClick={() => setIsImmersed((p) => !p)}
            className={`px-3 py-1.5 text-[10px] font-semibold tracking-widest uppercase rounded-xl border transition-all duration-200 ${
              isImmersed
                ? "bg-indigo-600 text-white border-indigo-600 shadow-[0px_3px_0px_#4338ca]"
                : "text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:-translate-y-0.5 shadow-[0px_2px_0px_#e2e8f0] dark:shadow-[0px_2px_0px_#1e293b] active:translate-y-0.5 active:shadow-[0px_0px_0px_#e2e8f0]"
            }`}
          >
            {isImmersed ? "Exit Immersion" : "Immersion"}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div
          className={
            isMobile
              ? `fixed top-14 bottom-0 left-0 z-50 w-[320px] max-w-[85vw] border-r border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/90 backdrop-blur-xl transition-transform duration-300 ${
                  isImmersed || !isSidebarOpen ? "-translate-x-full" : "translate-x-0"
                }`
              : `shrink-0 w-80 border-r border-slate-200 dark:border-slate-800 bg-stone-50/80 dark:bg-slate-900 backdrop-blur-xl transition-all duration-300 ${
                  isImmersed || !isSidebarOpen ? "w-0 opacity-0 overflow-hidden" : "w-80 opacity-100"
                }`
          }
          aria-hidden={isImmersed || (!isSidebarOpen && !isMobile)}
        >
          <div className="h-full flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              
              {/* Document Import Section */}
              <div className="px-5 py-4 border-b border-slate-200/50 dark:border-slate-800/50 bg-white/40 dark:bg-slate-900/40">
                <input
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isExtracting}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-[11px] font-semibold tracking-wider uppercase rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:-translate-y-0.5 shadow-[0px_2px_0px_#e2e8f0] dark:shadow-[0px_2px_0px_#1e293b] active:translate-y-0.5 active:shadow-[0px_0px_0px_#e2e8f0] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  {isExtracting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                      <span className="text-indigo-500">Extracting text...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 text-indigo-300 dark:text-indigo-600 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors duration-200" />
                      <span>Upload PDF</span>
                    </>
                  )}
                </button>
              </div>

              <ControlPanel settings={settings} onSettingsChange={handleSettingsChange} isImmersed={isImmersed} />
              <PresetManager
                presets={presets}
                currentSettings={settings}
                onSavePreset={handleSavePreset}
                onDeletePreset={deletePreset}
                onLoadPreset={handleLoadPreset}
                isImmersed={isImmersed}
              />
            </div>
            <HighlightControls state={highlightState} actions={highlightActions} isImmersed={isImmersed} ttsState={ttsState} ttsActions={ttsActions} />
          </div>
        </div>

        {/* Center Panes */}
        <div className="flex-1 flex overflow-hidden">
          <div
            className={
              isMobile
                ? `${activePane === "source" && !isImmersed ? "flex-1" : "hidden"}`
                : isImmersed ? "hidden" : "shrink-0 w-[420px] opacity-100 transition-all duration-300"
            }
          >
            <CapturePane onRehydrate={handleRehydrate} isImmersed={isImmersed} />
          </div>

          <div
            className={
              isMobile
                ? `${activePane === "reader" ? "flex-1" : "hidden"} relative overflow-hidden`
                : "flex-1 relative overflow-hidden"
            }
          >
            {/* Workspace canvas background */}
            <div className="absolute inset-0 bg-slate-100 dark:bg-slate-950 transition-colors duration-300" />
            <div
              ref={readingPaneRef}
              className="lucida-reading-pane h-full overflow-y-auto relative"
              style={{ fontSize: "var(--reader-font-size)", backgroundColor: "transparent" }}
              role="region"
            >
              <ReadingPane
                paragraphs={paragraphs}
                activeIndex={highlightState.activeIndex}
                onWordClick={handleWordClick}
                isImmersed={isImmersed}
                immersionActiveParagraph={activeParagraphId}
                containerRef={readingPaneRef}
              />
              <ReadingRuler activeIndex={highlightState.activeIndex} containerRef={readingPaneRef} isImmersed={isImmersed} />
            </div>
          </div>
        </div>
      </div>
      <AnalyticsFooter state={analyticsState} isImmersed={isImmersed} />
    </div>
  );
}