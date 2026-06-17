"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";

const ROWS = [12, 31, 50, 69, 88];
const STROKE_DURATION = 0.42;
const STROKE_STAGGER = 0.34;
const X_FROM = 6;
const X_TO = 94;

/**
 * Reveals an emoji as if it were being hand-painted: brush strokes sweep
 * across (row by row) and progressively unmask the glyph, with a brush nib
 * tracking the active stroke and an ink wash blooming underneath.
 */
export function DrawInEmoji({
  emoji,
  size = 168,
  maskId,
}: {
  emoji: string;
  size?: number;
  /** Unique per instance so multiple draw-ins don't share an SVG mask. */
  maskId: string;
}) {
  const reduce = useReducedMotion();
  const totalDuration = (ROWS.length - 1) * STROKE_STAGGER + STROKE_DURATION;

  // Zig-zag keyframes for the travelling brush nib (in px), evenly spaced.
  const nib = React.useMemo(() => {
    const left = (X_FROM / 100) * size;
    const right = (X_TO / 100) * size;
    const xs: number[] = [];
    const ys: number[] = [];
    ROWS.forEach((rowPct, i) => {
      const y = (rowPct / 100) * size;
      const ltr = i % 2 === 0;
      xs.push(ltr ? left : right, ltr ? right : left);
      ys.push(y, y);
    });
    return { xs, ys };
  }, [size]);

  if (reduce) {
    return (
      <div
        className="grid place-items-center"
        style={{ width: size, height: size, fontSize: size * 0.72 }}
      >
        {emoji}
      </div>
    );
  }

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Ink wash bloom behind the glyph */}
      <motion.div
        aria-hidden
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "radial-gradient(circle, color-mix(in oklch, var(--color-primary) 30%, transparent), transparent 68%)",
          filter: "blur(8px)",
        }}
        initial={{ scale: 0.3, opacity: 0 }}
        animate={{ scale: [0.3, 1.1, 1], opacity: [0, 0.9, 0.55] }}
        transition={{ duration: totalDuration * 0.9, ease: "easeOut" }}
      />

      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        className="absolute inset-0"
      >
        <defs>
          <mask id={maskId} maskUnits="userSpaceOnUse">
            <rect x="0" y="0" width="100" height="100" fill="black" />
            {ROWS.map((y, i) => {
              const ltr = i % 2 === 0;
              return (
                <motion.path
                  key={i}
                  d={`M ${ltr ? X_FROM : X_TO} ${y} L ${ltr ? X_TO : X_FROM} ${y}`}
                  stroke="white"
                  strokeWidth={24}
                  strokeLinecap="round"
                  fill="none"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{
                    duration: STROKE_DURATION,
                    delay: i * STROKE_STAGGER,
                    ease: "easeInOut",
                  }}
                />
              );
            })}
          </mask>
        </defs>
        <text
          x="50"
          y="54"
          fontSize="72"
          textAnchor="middle"
          dominantBaseline="central"
          mask={`url(#${maskId})`}
        >
          {emoji}
        </text>
      </svg>

      {/* Travelling brush nib */}
      <motion.div
        aria-hidden
        className="absolute"
        style={{ left: 0, top: 0 }}
        initial={{ x: nib.xs[0], y: nib.ys[0], opacity: 0 }}
        animate={{
          x: nib.xs,
          y: nib.ys,
          opacity: [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
        }}
        transition={{ duration: totalDuration, ease: "linear" }}
      >
        <div className="-translate-x-1/2 -translate-y-1/2">
          <div className="size-3.5 rotate-45 rounded-[3px] bg-gradient-to-br from-brand-from to-brand-to shadow-[0_0_12px_3px_color-mix(in_oklch,var(--color-primary)_55%,transparent)]" />
        </div>
      </motion.div>
    </div>
  );
}
