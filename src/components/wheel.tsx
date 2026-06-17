"use client";

import * as React from "react";
import { motion, useAnimationControls } from "framer-motion";
import type { FoodOption } from "@/lib/types";

/* A refined, harmonious palette — vivid but tasteful, Apple-watch-wheel inspired. */
const SEGMENT_COLORS = [
  "#FF9F45",
  "#FF6F61",
  "#FF5C8A",
  "#C77DFF",
  "#7C93FF",
  "#4FC3F7",
  "#2DD4BF",
  "#5BD675",
  "#FFD23F",
  "#FFB05C",
];

function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const a = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

export interface WheelHandle {
  spin: () => void;
}

export const Wheel = React.forwardRef<
  WheelHandle,
  {
    options: FoodOption[];
    onResult: (option: FoodOption) => void;
    onSpinStart?: () => void;
    spinning: boolean;
  }
>(function Wheel({ options, onResult, onSpinStart, spinning }, ref) {
  const controls = useAnimationControls();
  const rotation = React.useRef(0);
  const size = 360;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 6;
  const n = Math.max(options.length, 1);
  const seg = 360 / n;

  const weightedIndex = React.useCallback(() => {
    const total = options.reduce((s, o) => s + Math.max(1, o.weight), 0);
    let x = Math.random() * total;
    for (let i = 0; i < options.length; i++) {
      x -= Math.max(1, options[i].weight);
      if (x <= 0) return i;
    }
    return options.length - 1;
  }, [options]);

  const spin = React.useCallback(async () => {
    if (options.length === 0) return;
    onSpinStart?.();
    const winner = weightedIndex();
    const target =
      360 * 6 - (winner * seg + seg / 2) + (Math.random() - 0.5) * (seg * 0.6);
    const current = rotation.current;
    const next = current + ((target - (current % 360)) % 360) + 360 * 6;
    rotation.current = next;
    await controls.start({
      rotate: next,
      transition: { duration: 4.6, ease: [0.16, 1, 0.3, 1] },
    });
    onResult(options[winner]);
  }, [controls, onResult, onSpinStart, options, seg, weightedIndex]);

  React.useImperativeHandle(ref, () => ({ spin }), [spin]);

  return (
    <div
      className="relative mx-auto"
      style={{ width: size, height: size }}
    >
      {/* Ambient glow behind the wheel */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 rounded-full opacity-70 blur-2xl"
        style={{
          background:
            "radial-gradient(circle at 50% 45%, color-mix(in oklch, var(--color-primary) 35%, transparent), transparent 65%)",
        }}
      />

      {/* Rotating disc */}
      <motion.svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        animate={controls}
        style={{
          transformOrigin: "center",
          filter: "drop-shadow(0 18px 40px rgba(0,0,0,0.18))",
        }}
      >
        <defs>
          <clipPath id="wheel-clip">
            <circle cx={cx} cy={cy} r={r} />
          </clipPath>
        </defs>

        <g clipPath="url(#wheel-clip)">
          {options.map((o, i) => {
            const start = i * seg;
            const end = (i + 1) * seg;
            const p1 = polar(cx, cy, r, start);
            const p2 = polar(cx, cy, r, end);
            const large = seg > 180 ? 1 : 0;
            const mid = start + seg / 2;
            const emojiPos = polar(cx, cy, r * 0.66, mid);
            const color = SEGMENT_COLORS[i % SEGMENT_COLORS.length];
            const path =
              n === 1
                ? `M ${cx} ${cy} m -${r} 0 a ${r} ${r} 0 1 0 ${r * 2} 0 a ${r} ${r} 0 1 0 -${r * 2} 0`
                : `M ${cx} ${cy} L ${p1.x} ${p1.y} A ${r} ${r} 0 ${large} 1 ${p2.x} ${p2.y} Z`;
            return (
              <g key={o.id}>
                <path
                  d={path}
                  fill={color}
                  stroke="rgba(255,255,255,0.6)"
                  strokeWidth={1.5}
                />
                <text
                  x={emojiPos.x}
                  y={emojiPos.y}
                  fontSize={n > 8 ? 26 : 32}
                  textAnchor="middle"
                  dominantBaseline="central"
                  style={{ userSelect: "none" }}
                >
                  {o.emoji}
                </text>
              </g>
            );
          })}
        </g>

        {/* Crisp inner rim */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.85)"
          strokeWidth={3}
        />
      </motion.svg>

      {/* Fixed lighting + rim — stays put while the disc spins underneath */}
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        aria-hidden
        className="pointer-events-none absolute inset-0"
      >
        <defs>
          <radialGradient id="wheel-gloss" cx="50%" cy="30%" r="75%">
            <stop offset="0%" stopColor="white" stopOpacity="0.4" />
            <stop offset="48%" stopColor="white" stopOpacity="0.08" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="wheel-vignette" cx="50%" cy="50%" r="50%">
            <stop offset="82%" stopColor="black" stopOpacity="0" />
            <stop offset="100%" stopColor="black" stopOpacity="0.18" />
          </radialGradient>
        </defs>
        <circle cx={cx} cy={cy} r={r} fill="url(#wheel-gloss)" />
        <circle cx={cx} cy={cy} r={r} fill="url(#wheel-vignette)" />
      </svg>

      {/* Pointer — sleek teardrop at the top, pointing inward */}
      <div className="absolute left-1/2 top-[-6px] z-20 -translate-x-1/2">
        <div
          className="size-7 rotate-45 rounded-[0.45rem] rounded-br-none border border-white/70 bg-gradient-to-br from-brand-from to-brand-to shadow-[0_6px_14px_rgba(0,0,0,0.25)]"
        />
      </div>

      {/* Glassy hub */}
      <button
        onClick={spin}
        disabled={spinning || options.length === 0}
        aria-label="转动转盘"
        className="group absolute left-1/2 top-1/2 z-10 grid size-[4.75rem] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-gradient-to-br from-brand-from via-brand-via to-brand-to text-base font-semibold tracking-wide text-white shadow-[0_8px_22px_rgba(0,0,0,0.28),inset_0_1px_1px_rgba(255,255,255,0.5)] ring-[6px] ring-white/75 transition-all active:scale-95 disabled:opacity-80 dark:ring-white/12"
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-1 rounded-full bg-gradient-to-b from-white/40 to-transparent"
        />
        <span className="relative">{spinning ? "···" : "GO"}</span>
      </button>
    </div>
  );
});
