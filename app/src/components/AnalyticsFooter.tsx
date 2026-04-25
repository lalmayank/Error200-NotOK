import type { AnalyticsState } from "@/hooks/useReadingAnalytics";

interface AnalyticsFooterProps {
  state: AnalyticsState;
  isImmersed: boolean;
}

export default function AnalyticsFooter({ state, isImmersed }: AnalyticsFooterProps) {
  const { wordsRead, elapsedSeconds, currentWpm, isTracking } = state;

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div
      className={`shrink-0 z-40 bg-background border-t border-border px-3 sm:px-6 py-2 flex items-center justify-between transition-opacity duration-400 ${isImmersed ? "opacity-10" : "opacity-100"
        }`}
    >
      <div className="flex items-center gap-4 sm:gap-6 font-mono text-xs text-muted-foreground">
        <span aria-label={`Words read: ${wordsRead}`}>
          Words: <strong className="text-foreground">{wordsRead}</strong>
        </span>
        <span aria-label={`Elapsed time: ${formatTime(elapsedSeconds)}`}>
          Time: <strong className="text-foreground">{formatTime(elapsedSeconds)}</strong>
        </span>
        <span aria-label={`Current reading speed: ${currentWpm} words per minute`}>
          WPM: <strong className="text-foreground">{currentWpm}</strong>
        </span>
        {isTracking && (
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-foreground animate-pulse" aria-hidden="true" />
            <span className="text-muted-foreground">Tracking</span>
          </span>
        )}
      </div>

      <div className="hidden sm:block text-xs font-mono text-muted-foreground">
        Lucida v1.0
      </div>
    </div>
  );
}
