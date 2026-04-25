import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import type { HighlightState, HighlightActions } from "@/hooks/useHighlighter";

interface HighlightControlsProps {
  state: HighlightState;
  actions: HighlightActions;
  isImmersed: boolean;
}

export default function HighlightControls({
  state,
  actions,
  isImmersed,
}: HighlightControlsProps) {
  const { activeIndex, mode, isRunning, wpm, totalWords } = state;

  const handleWpmChange = useCallback(
    (value: number[]) => {
      actions.setWpm(value[0]);
    },
    [actions]
  );

  const handleModeToggle = useCallback(() => {
    actions.setMode(mode === "manual" ? "timer" : "manual");
  }, [actions, mode]);

  const handleReset = useCallback(() => {
    actions.reset();
  }, [actions]);

  if (isImmersed) {
    return (
      <div
        className="absolute bottom-0 left-0 right-0 z-30 transition-opacity duration-400"
        style={{ opacity: 0, pointerEvents: "none" }}
        aria-hidden="true"
      />
    );
  }

  return (
    <div className="px-5 py-4 border-t border-border bg-background">
      {/* Mode Toggle */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={handleModeToggle}
            className={`px-3 py-1.5 text-xs font-medium tracking-wider uppercase border transition-colors focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 ${mode === "manual"
                ? "bg-primary text-primary-foreground border-border"
                : "bg-background text-muted-foreground border-border hover:bg-muted"
              }`}
            aria-pressed={mode === "manual"}
            aria-label="Switch to manual mode"
          >
            Manual
          </button>
          <button
            onClick={handleModeToggle}
            className={`px-3 py-1.5 text-xs font-medium tracking-wider uppercase border transition-colors focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 ${mode === "timer"
                ? "bg-primary text-primary-foreground border-border"
                : "bg-background text-muted-foreground border-border hover:bg-muted"
              }`}
            aria-pressed={mode === "timer"}
            aria-label="Switch to timer mode"
          >
            Timer
          </button>
        </div>

        <span className="text-xs font-mono text-muted-foreground">
          {activeIndex + 1} / {totalWords}
        </span>
      </div>

      {/* Manual Controls */}
      {mode === "manual" && (
        <div className="flex gap-2 mb-4">
          <Button
            onClick={actions.prev}
            disabled={activeIndex <= 0}
            className="flex-1 h-10 bg-background border border-border text-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed rounded-none"
            aria-label="Previous word"
          >
            &lt; Prev
          </Button>
          <Button
            onClick={actions.next}
            disabled={activeIndex >= totalWords - 1}
            className="flex-1 h-10 bg-primary text-primary-foreground hover:bg-primary/90 rounded-none"
            aria-label="Next word"
          >
            Next &gt;
          </Button>
        </div>
      )}

      {/* Timer Controls */}
      {mode === "timer" && (
        <div className="mb-4">
          <div className="flex items-center gap-3 mb-3">
            <Button
              onClick={actions.toggleRun}
              className={`flex-1 h-10 rounded-none font-medium tracking-wide ${isRunning
                  ? "bg-background border border-border text-foreground hover:bg-muted"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
                }`}
              aria-label={isRunning ? "Pause reading" : "Start reading"}
            >
              {isRunning ? "Pause" : "Start"}
            </Button>
            <Button
              onClick={handleReset}
              variant="outline"
              className="h-10 px-4 border border-border text-muted-foreground hover:bg-muted rounded-none"
              aria-label="Reset to beginning"
            >
              Reset
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground font-mono w-12 text-right">
              {wpm} WPM
            </span>
            <Slider
              value={[wpm]}
              onValueChange={handleWpmChange}
              min={60}
              max={600}
              step={10}
              className="flex-1"
              aria-label="Words per minute"
            />
          </div>
        </div>
      )}
    </div>
  );
}
