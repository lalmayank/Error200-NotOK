import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { Upload, Loader2 } from "lucide-react";
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
  white: "#09090B", // Tailwind background
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
{/* Header (Glass) */}
      <header
        className={`shrink-0 h-14 border-b border-border/30 bg-background/40 backdrop-blur-xl flex items-center justify-between px-4 sm:px-6 z-50 transition-all duration-400 ${
          isImmersed ? "opacity-10" : "opacity-100"
        }`}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsSidebarOpen((p) => !p)}
            className="px-2 py-1 text-xs font-medium tracking-wider uppercase border border-border/50 rounded-md text-foreground hover:bg-foreground/10 focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 transition-colors"
            aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            aria-pressed={isSidebarOpen}
          >
            {isSidebarOpen ? "Hide" : "Show"}
          </button>

          <h1 className="text-lg font-semibold tracking-tight">Cadence</h1>
          <span className="hidden sm:inline text-xs text-muted-foreground font-mono tracking-wide opacity-70">
            Adaptive Reading Environment
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Mobile Pane Switcher */}
          {isMobile && !isImmersed && (
            <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-lg" role="tablist" aria-label="Pane switcher">
              <button
                onClick={() => setActivePane("source")}
                className={`px-3 py-1 text-xs font-medium tracking-wider uppercase rounded-md transition-colors focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 ${
                  activePane === "source"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                role="tab"
                aria-selected={activePane === "source"}
              >
                Source
              </button>
              <button
                onClick={() => setActivePane("reader")}
                className={`px-3 py-1 text-xs font-medium tracking-wider uppercase rounded-md transition-colors focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 ${
                  activePane === "reader"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
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
            className="px-3 py-1.5 text-xs font-medium tracking-wider uppercase border border-border/50 rounded-md text-foreground hover:bg-foreground/10 transition-colors"
          >
            {theme === "dark" ? "Light" : "Dark"}
          </button>

          <button
            onClick={() => setIsImmersed((p) => !p)}
            className={`px-3 py-1.5 text-xs font-medium tracking-wider uppercase border rounded-md transition-colors ${
              isImmersed
                ? "bg-primary text-primary-foreground border-primary/50 shadow-md shadow-primary/20"
                : "text-foreground border-border/50 hover:bg-foreground/10"
            }`}
          >
            {isImmersed ? "Exit Immersion" : "Immersion"}
          </button>

          {/* Auth */}
          {user ? (
            <div className="flex items-center gap-3 ml-2">
              <span className="hidden sm:inline text-xs font-medium">{user.name || "User"}</span>
              <a href="/api/oauth/logout" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Log out
              </a>
            </div>
          ) : (
            <a href="/login" className="text-xs font-medium text-muted-foreground hover:text-foreground ml-2 transition-colors">
              Log in
            </a>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        {/* Sidebar (Glass) */}
        <div
          className={
            isMobile
              ? `fixed top-14 bottom-0 left-0 z-50 w-[320px] max-w-[85vw] border-r border-border/30 bg-muted/40 backdrop-blur-2xl transition-transform duration-300 ${
                  isImmersed || !isSidebarOpen ? "-translate-x-full" : "translate-x-0"
                }`
              : `shrink-0 w-80 border-r border-border/30 bg-muted/30 backdrop-blur-2xl transition-all duration-300 ${
                  isImmersed || !isSidebarOpen ? "w-0 opacity-0 overflow-hidden" : "w-80 opacity-100"
                }`
          }
          aria-hidden={isImmersed || (!isSidebarOpen && !isMobile)}
        >
          <div className="h-full flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              
              {/* Document Import Section */}
              <div className="px-5 py-4 border-b border-border/30 bg-muted/10">
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
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg border border-border/50 bg-background/50 hover:bg-background/80 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  {isExtracting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      <span>Extracting text...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
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
            <div
              ref={readingPaneRef}
              className="lucida-reading-pane h-full overflow-y-auto relative"
              style={{ fontSize: "var(--reader-font-size)" }} // Apply new font size here
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