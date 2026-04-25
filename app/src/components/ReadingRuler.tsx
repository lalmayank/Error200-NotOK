import React, { useEffect, useRef } from "react";

interface ReadingRulerProps {
  activeIndex: number;
  containerRef: React.RefObject<HTMLDivElement | null>;
  isImmersed: boolean;
}

/**
 * Floating vertical accent line that tracks the exact height 
 * and Y-position of the active word for subtle visual grounding.
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
        
        // Calculate exact top relative to the container's scroll position
        const relativeTop = elRect.top - containerRect.top + container.scrollTop;

        // Apply smooth transform and match the active word's height
        ruler.style.transform = `translateY(${relativeTop}px)`;
        ruler.style.height = `${elRect.height}px`;
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
      className="absolute left-0 w-[3px] rounded-r-md pointer-events-none z-20 transition-all duration-150 ease-out bg-primary"
      style={{
        top: 0,
        opacity: isImmersed ? 0.2 : 0.8,
        willChange: "transform, height",
      }}
      aria-hidden="true"
    />
  );
}