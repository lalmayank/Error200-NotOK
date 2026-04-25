import { useState, useCallback, useRef, useEffect, useMemo } from "react";
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
import type { ReaderSettings } from "@/hooks/useURLPersistence";
import { useIsMobile } from "@/hooks/use-mobile";

const BG_MAP: Record<string, string> = {
  white: "#FFFFFF",
  cream: "#FDFBF7",
  "pale-blue": "#F0F4F8",
  yellow: "#FEF9E7",
  "soft-mint": "#F0F9F4",
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

  // Load settings from URL or defaults
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
    // Sensible defaults for layout on mobile.
    setIsSidebarOpen(!isMobile);
    if (isMobile) setActivePane("reader");
  }, [isMobile]);

  const totalWords = useMemo(() => {
    return paragraphs.reduce((sum, p) => sum + p.words.length, 0);
  }, [paragraphs]);

  const [highlightState, highlightActions] = useHighlighter(totalWords);
  const [analyticsState, analyticsActions] = useReadingAnalytics();

  // Compute active paragraph for immersion mode
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

  // tRPC mutations for cloud sync
  const createPresetMutation = trpc.preset.create.useMutation();

  // Apply CSS variables via rAF scheduler whenever settings change
  useEffect(() => {
    const updates = {
      "--reader-font": FONT_MAP[settings.font] || FONT_MAP.Inter,
      "--reader-letter-spacing": `${settings.letterSpacing}em`,
      "--reader-word-spacing": `${settings.wordSpacing}em`,
      "--reader-line-height": `${settings.lineHeight}`,
      "--reader-paragraph-spacing": `${settings.paragraphSpacing}em`,
      "--reader-column-width": `${settings.columnWidth}ch`,
      "--reader-bg": BG_MAP[settings.backgroundTint] || BG_MAP.cream,
    };
    batchUpdate(updates);

    // Also persist to URL
    serialize(settings);
  }, [settings, batchUpdate, serialize]);

  // Set the reading pane as the CSS variable target
  useEffect(() => {
    if (readingPaneRef.current) {
      setTarget(readingPaneRef.current);
    }
  }, [setTarget]);

  // Analytics tracking
  useEffect(() => {
    analyticsActions.updateWordsRead(highlightState.activeIndex);
  }, [highlightState.activeIndex, analyticsActions]);

  useEffect(() => {
    if (highlightState.isRunning) {
      analyticsActions.startTracking();
    } else {
      analyticsActions.stopTracking();
    }
  }, [highlightState.isRunning, analyticsActions]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if typing in an input
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
          if (highlightState.mode === "manual") {
            highlightActions.next();
          }
          break;
        case "ArrowLeft":
        case "ArrowUp":
          e.preventDefault();
          if (highlightState.mode === "manual") {
            highlightActions.prev();
          }
          break;
        case " ":
          e.preventDefault();
          if (highlightState.mode === "timer") {
            highlightActions.toggleRun();
          } else {
            highlightActions.next();
          }
          break;
        case "Escape":
          e.preventDefault();
          setIsImmersed((prev) => !prev);
          break;
        case "i":
        case "I":
          if (!e.ctrlKey && !e.metaKey && !e.altKey) {
            setIsImmersed((prev) => !prev);
          }
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
          font: s.font as "Inter" | "OpenDyslexic" | "Lexie Readable" | "Georgia" | "System",
          letterSpacing: s.letterSpacing,
          wordSpacing: s.wordSpacing,
          lineHeight: s.lineHeight,
          columnWidth: s.columnWidth,
          backgroundTint: s.backgroundTint as "cream" | "pale-blue" | "yellow" | "soft-mint" | "white",
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
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-background text-foreground">
      {/* Header */}
      <header
        className={`shrink-0 h-14 border-b border-border flex items-center justify-between px-4 sm:px-6 bg-background z-50 transition-opacity duration-400 ${isImmersed ? "opacity-10" : "opacity-100"
          }`}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsSidebarOpen((p) => !p)}
            className="px-2 py-1 text-xs font-medium tracking-wider uppercase border border-border bg-background text-foreground hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
            aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            aria-pressed={isSidebarOpen}
          >
            {isSidebarOpen ? "Hide" : "Show"}
          </button>

          <h1 className="text-lg font-medium tracking-tight">
            Project Lucida
          </h1>
          <span className="hidden sm:inline text-xs text-muted-foreground font-mono tracking-wide">
            Adaptive Reading Environment
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Mobile Pane Switcher */}
          {isMobile && !isImmersed && (
            <div className="flex items-center gap-2" role="tablist" aria-label="Pane switcher">
              <button
                onClick={() => setActivePane("source")}
                className={`px-3 py-1.5 text-xs font-medium tracking-wider uppercase border transition-colors focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 ${activePane === "source"
                    ? "bg-primary text-primary-foreground border-border"
                    : "bg-background text-muted-foreground border-border hover:bg-muted"
                  }`}
                role="tab"
                aria-selected={activePane === "source"}
                aria-label="Show source text"
              >
                Source
              </button>
              <button
                onClick={() => setActivePane("reader")}
                className={`px-3 py-1.5 text-xs font-medium tracking-wider uppercase border transition-colors focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 ${activePane === "reader"
                    ? "bg-primary text-primary-foreground border-border"
                    : "bg-background text-muted-foreground border-border hover:bg-muted"
                  }`}
                role="tab"
                aria-selected={activePane === "reader"}
                aria-label="Show reading pane"
              >
                Reader
              </button>
            </div>
          )}

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="px-3 py-1.5 text-xs font-medium tracking-wider uppercase border border-border bg-background text-foreground hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
            aria-label="Toggle light and dark mode"
          >
            {theme === "dark" ? "Light" : "Dark"}
          </button>

          {/* Immersion Toggle */}
          <button
            onClick={() => setIsImmersed((p) => !p)}
            className={`px-3 py-1.5 text-xs font-medium tracking-wider uppercase border transition-colors focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 ${isImmersed
                ? "bg-primary text-primary-foreground border-border"
                : "bg-background text-muted-foreground border-border hover:bg-muted"
              }`}
            aria-pressed={isImmersed}
            aria-label="Toggle immersion mode"
          >
            {isImmersed ? "Exit Immersion" : "Immersion"}
          </button>

          {/* Auth */}
          {user ? (
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline text-xs text-muted-foreground">{user.name || "User"}</span>
              <a
                href="/api/oauth/logout"
                className="text-xs text-muted-foreground hover:text-foreground underline focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
              >
                Log out
              </a>
            </div>
          ) : (
            <a
              href="/login"
              className="text-xs text-muted-foreground hover:text-foreground underline focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
            >
              Log in
            </a>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar: Typography + Presets + Highlight */}
        <div
          className={
            isMobile
              ? `fixed top-14 bottom-0 left-0 z-50 w-[320px] max-w-[85vw] border-r border-border bg-muted transition-transform duration-300 ${isImmersed || !isSidebarOpen ? "-translate-x-full" : "translate-x-0"
              }`
              : `shrink-0 w-80 border-r border-border bg-muted transition-all duration-300 ${isImmersed || !isSidebarOpen ? "w-0 opacity-0 overflow-hidden" : "w-80 opacity-100"
              }`
          }
          aria-hidden={isImmersed || (!isSidebarOpen && !isMobile)}
        >
          <div className="h-full flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto">
              <ControlPanel
                settings={settings}
                onSettingsChange={handleSettingsChange}
                isImmersed={isImmersed}
              />
              <PresetManager
                presets={presets}
                currentSettings={settings}
                onSavePreset={handleSavePreset}
                onDeletePreset={deletePreset}
                onLoadPreset={handleLoadPreset}
                isImmersed={isImmersed}
              />
            </div>
            <HighlightControls
              state={highlightState}
              actions={highlightActions}
              isImmersed={isImmersed}
            />
          </div>
        </div>

        {/* Center: Capture + Reading Panes */}
        <div className="flex-1 flex overflow-hidden">
          {/* Capture Pane */}
          <div
            className={
              isMobile
                ? `${activePane === "source" && !isImmersed ? "flex-1" : "hidden"}`
                : `shrink-0 transition-all duration-300 ${isImmersed ? "w-0 opacity-0 overflow-hidden" : "w-1/2 opacity-100"
                }`
            }
          >
            <CapturePane onRehydrate={handleRehydrate} isImmersed={isImmersed} />
          </div>

          {/* Reading Pane */}
          <div
            className={
              isMobile
                ? `${activePane === "reader" ? "flex-1" : "hidden"} relative overflow-hidden`
                : "flex-1 relative overflow-hidden"
            }
          >
            <div
              ref={readingPaneRef}
              className="lucida-reading-pane h-full overflow-y-auto relative"
              role="region"
              aria-label="Reading area"
              aria-live="polite"
              aria-atomic="false"
            >
              <ReadingPane
                paragraphs={paragraphs}
                activeIndex={highlightState.activeIndex}
                onWordClick={handleWordClick}
                isImmersed={isImmersed}
                immersionActiveParagraph={activeParagraphId}
                containerRef={readingPaneRef}
              />

              {/* Gutter marker (not over text) */}
              <ReadingRuler
                activeIndex={highlightState.activeIndex}
                containerRef={readingPaneRef}
                isImmersed={isImmersed}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Footer */}
      <AnalyticsFooter state={analyticsState} isImmersed={isImmersed} />
    </div>
  );
}
