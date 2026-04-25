import React, { useCallback, useEffect, useRef, memo, useState } from "react";
import type { TokenizedParagraph, TokenWord } from "@/hooks/useTokenization";

interface ReadingPaneProps {
  paragraphs: TokenizedParagraph[];
  activeIndex: number;
  onWordClick: (index: number) => void;
  isImmersed: boolean;
  immersionActiveParagraph: number;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

// Memoized individual word component for zero-latency re-rendering
const WordToken = memo(function WordToken({
  word,
  isActive,
  wasActive,
  onClick,
}: {
  word: TokenWord;
  isActive: boolean;
  wasActive: boolean;
  onClick: () => void;
}) {
  return (
    <span
      data-token-index={word.index}
      onClick={onClick}
      className={`lucida-word-token select-none ${isActive ? "is-active" : ""} ${wasActive ? "was-active" : ""
        }`}
      aria-label={isActive ? `Current word: ${word.text}` : undefined}
      role={isActive ? "mark" : undefined}
    >
      {word.text}
    </span>
  );
});

// Memoized paragraph component
const ParagraphBlock = memo(function ParagraphBlock({
  paragraph,
  activeIndex,
  wasActiveIndex,
  onWordClick,
  paragraphOpacity,
}: {
  paragraph: TokenizedParagraph;
  activeIndex: number;
  wasActiveIndex: number;
  onWordClick: (index: number) => void;
  paragraphOpacity: number;
}) {
  return (
    <p
      className="lucida-paragraph transition-opacity duration-300"
      style={{ opacity: paragraphOpacity }}
    >
      {paragraph.words.map((word) => (
        <React.Fragment key={word.index}>
          <WordToken
            word={word}
            isActive={word.index === activeIndex}
            wasActive={word.index === wasActiveIndex}
            onClick={() => onWordClick(word.index)}
          />
          <span aria-hidden="true"> </span>
        </React.Fragment>
      ))}
    </p>
  );
});

export default function ReadingPane({
  paragraphs,
  activeIndex,
  onWordClick,
  isImmersed,
  immersionActiveParagraph,
  containerRef,
}: ReadingPaneProps) {
  const [wasActiveIndex, setWasActiveIndex] = useState(-1);
  const prevActiveRef = useRef(-1);

  // Track previously active word for the "was-active" trail effect
  useEffect(() => {
    if (activeIndex !== prevActiveRef.current) {
      setWasActiveIndex(prevActiveRef.current);
      prevActiveRef.current = activeIndex;
    }
  }, [activeIndex]);

  // Auto-scroll to center the active word
  useEffect(() => {
    if (!containerRef.current || activeIndex < 0) return;

    const activeEl = containerRef.current.querySelector(
      `[data-token-index="${activeIndex}"]`
    ) as HTMLElement | null;

    if (activeEl) {
      activeEl.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "nearest",
      });
    }
  }, [activeIndex]);

  const handleWordClick = useCallback(
    (index: number) => {
      onWordClick(index);
    },
    [onWordClick]
  );

  return (
    <div className="max-w-[var(--reader-column-width)] mx-auto px-4 sm:px-8 py-10 sm:py-12">
      {paragraphs.length === 0 ? (
        <div className="flex items-center justify-center h-full min-h-[300px]">
          <p className="text-muted-foreground text-lg text-center">
            Paste text in the Source pane and click Rehydrate to begin reading.
          </p>
        </div>
      ) : (
        paragraphs.map((paragraph) => {
          // In immersion mode, dim all paragraphs except the active one
          const isActiveParagraph = paragraph.id === immersionActiveParagraph;
          const paragraphOpacity = isImmersed
            ? isActiveParagraph
              ? 1
              : 0.2
            : 1;

          return (
            <ParagraphBlock
              key={paragraph.id}
              paragraph={paragraph}
              activeIndex={activeIndex}
              wasActiveIndex={wasActiveIndex}
              onWordClick={handleWordClick}
              paragraphOpacity={paragraphOpacity}
            />
          );
        })
      )}
    </div>
  );
}
