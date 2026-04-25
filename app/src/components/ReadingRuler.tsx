import React, { useEffect, useRef } from "react";

interface ReadingRulerProps {
  activeIndex: number;
  containerRef: React.RefObject<HTMLDivElement | null>;
  isImmersed: boolean;
}

/**
 * Floating horizontal text ruler that tracks scroll position
 * for visual grounding during reading.
 */
export default function ReadingRuler({
  activeIndex,
  containerRef,
  isImmersed,
}: ReadingRulerProps) {
  const rulerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const updateRuler = () => {
      const container = containerRef.current;
      const ruler = rulerRef.current;
      if (!container || !ruler) return;

      const activeEl = container.querySelector(
        `[data-token-index="${activeIndex}"]`
      ) as HTMLElement | null;

      if (activeEl) {
        const containerRect = container.getBoundingClientRect();
        const elRect = activeEl.getBoundingClientRect();
        const relativeTop = elRect.top - containerRect.top + container.scrollTop;
        const lineY = relativeTop + elRect.height / 2;

        ruler.style.transform = `translateY(${lineY}px)`;
      }

      rafRef.current = null;
    };

    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = requestAnimationFrame(updateRuler);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [activeIndex, containerRef]);

  return (
    <div
      ref={rulerRef}
      className="absolute left-3 w-8 h-[6px] pointer-events-none z-20 transition-transform duration-75"
      style={{
        top: 0,
        opacity: isImmersed ? 0.3 : 1,
        willChange: "transform",
        backgroundColor: "var(--reader-ruler)",
      }}
      aria-hidden="true"
    />
  );
}
