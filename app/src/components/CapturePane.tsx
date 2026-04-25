import React, { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface CapturePaneProps {
  onRehydrate: (text: string) => void;
  isImmersed: boolean;
}

export default function CapturePane({ onRehydrate, isImmersed }: CapturePaneProps) {
  const [text, setText] = useState(
    "Cadence is a high-performance adaptive reading environment. Paste your own text here, then click Rehydrate to transform it into an individually tokenized reading experience. Every word becomes independently addressable, allowing for granular highlighting, precise typographic control, and cognitive accessibility support."
  );
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleRehydrate = useCallback(() => {
    onRehydrate(text);
  }, [text, onRehydrate]);

  const handleClear = useCallback(() => {
    setText("");
    textareaRef.current?.focus();
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        handleRehydrate();
      }
    },
    [handleRehydrate]
  );

  if (isImmersed) {
    return (
      <div
        className="h-full flex flex-col transition-opacity duration-400"
        style={{ opacity: 0, pointerEvents: "none" }}
        aria-hidden="true"
      />
    );
  }

  return (
    <div className="h-full flex flex-col bg-background border-r border-border">
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-border">
        <h2 className="text-sm font-medium tracking-widest uppercase text-muted-foreground">
          Source Text
        </h2>
        <span className="text-xs text-muted-foreground font-mono">{text.length} chars</span>
      </div>

      <div className="flex-1 p-4 sm:p-6">
        <Textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Paste your text here to begin..."
          className="w-full h-full resize-none border border-border bg-background text-foreground placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 rounded-none text-base leading-relaxed p-4"
          aria-label="Text capture area. Paste or type your reading material here."
        />
      </div>

      <div className="px-4 sm:px-6 py-4 border-t border-border flex gap-3">
        <Button
          onClick={handleRehydrate}
          className="flex-1 h-12 bg-primary text-primary-foreground hover:bg-primary/90 font-medium tracking-wide uppercase text-sm rounded-none border-0"
          aria-label="Rehydrate text into reading pane"
        >
          Rehydrate Text
        </Button>
        <Button
          onClick={handleClear}
          variant="outline"
          className="h-12 px-6 border border-border text-muted-foreground hover:bg-muted rounded-none"
          aria-label="Clear source text"
        >
          Clear
        </Button>
      </div>
    </div>
  );
}
