'use client';

import { useLayoutEffect, useRef } from 'react';

interface ProjectionWordProps {
  /** The word to fill the screen with. */
  text: string;
  /** Upper bound before fitting, as a viewport-width percentage. */
  maxVw?: number;
  /** Fraction of the container the word is allowed to occupy. */
  fill?: number;
  className?: string;
}

/**
 * Renders a word as large as will fit on one line.
 *
 * A clamp() alone cannot do this: glyph widths vary enough between words
 * (WWWW is nearly twice the width of IIII at the same size) that any fixed
 * characters-to-size constant either clips the wide ones or wastes space on
 * the narrow ones. So this starts from a generous size and scales down by the
 * measured overflow ratio, which is exact in one pass.
 */
export function ProjectionWord({
  text,
  maxVw = 16,
  fill = 0.94,
  className = '',
}: ProjectionWordProps) {
  const boxRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const box = boxRef.current;
    const span = textRef.current;
    if (!box || !span) return;

    const fit = () => {
      // Clear any previous correction so we always measure the base size.
      span.style.fontSize = '';
      const available = box.clientWidth * fill;
      const measured = span.getBoundingClientRect().width;
      if (measured > available && measured > 0) {
        const base = parseFloat(getComputedStyle(span).fontSize);
        span.style.fontSize = `${(base * available) / measured}px`;
      }
    };

    fit();

    // Re-fit when the projector resolution or window changes.
    const observer = new ResizeObserver(fit);
    observer.observe(box);
    return () => observer.disconnect();
  }, [text, maxVw, fill]);

  return (
    <div ref={boxRef} className="w-full overflow-hidden text-center">
      <span
        ref={textRef}
        className={`inline-block leading-none font-black tracking-[0.08em] whitespace-nowrap ${className}`}
        style={{ fontSize: `clamp(2.5rem, ${maxVw}vw, 16rem)` }}
      >
        {text}
      </span>
    </div>
  );
}
