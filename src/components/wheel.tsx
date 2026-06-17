"use client";

import * as React from "react";
import { motion, useAnimationControls } from "framer-motion";
import type { FoodOption } from "@/lib/types";

const SEGMENT_COLORS = [
  "#f97316",
  "#f43f5e",
  "#eab308",
  "#22c55e",
  "#06b6d4",
  "#6366f1",
  "#ec4899",
  "#84cc16",
  "#14b8a6",
  "#a855f7",
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
  const size = 320;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 4;
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
    const next =
      current + ((target - (current % 360)) % 360) + 360 * 6;
    rotation.current = next;
    await controls.start({
      rotate: next,
      transition: { duration: 4.2, ease: [0.16, 1, 0.3, 1] },
    });
    onResult(options[winner]);
  }, [controls, onResult, onSpinStart, options, seg, weightedIndex]);

  React.useImperativeHandle(ref, () => ({ spin }), [spin]);

  return (
    <div className="relative mx-auto" style={{ width: size, height: size + 24 }}>
      {/* Pointer */}
      <div className="absolute left-1/2 top-0 z-20 -translate-x-1/2">
        <div className="size-0 border-x-[14px] border-t-[26px] border-x-transparent border-t-primary drop-shadow" />
      </div>

      <motion.svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        animate={controls}
        className="mt-6 drop-shadow-xl"
        style={{ transformOrigin: "center" }}
      >
        {options.map((o, i) => {
          const start = i * seg;
          const end = (i + 1) * seg;
          const p1 = polar(cx, cy, r, start);
          const p2 = polar(cx, cy, r, end);
          const large = seg > 180 ? 1 : 0;
          const mid = start + seg / 2;
          const label = polar(cx, cy, r * 0.62, mid);
          const color = SEGMENT_COLORS[i % SEGMENT_COLORS.length];
          const path =
            n === 1
              ? `M ${cx} ${cy} m -${r} 0 a ${r} ${r} 0 1 0 ${r * 2} 0 a ${r} ${r} 0 1 0 -${r * 2} 0`
              : `M ${cx} ${cy} L ${p1.x} ${p1.y} A ${r} ${r} 0 ${large} 1 ${p2.x} ${p2.y} Z`;
          return (
            <g key={o.id}>
              <path d={path} fill={color} stroke="white" strokeWidth={2} />
              <text
                x={label.x}
                y={label.y}
                fill="white"
                fontSize={n > 8 ? 11 : 13}
                fontWeight={600}
                textAnchor="middle"
                dominantBaseline="middle"
                transform={`rotate(${mid}, ${label.x}, ${label.y})`}
              >
                {o.emoji} {o.name.length > 6 ? o.name.slice(0, 6) + "…" : o.name}
              </text>
            </g>
          );
        })}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="white" strokeWidth={3} />
      </motion.svg>

      {/* Hub */}
      <button
        onClick={spin}
        disabled={spinning || options.length === 0}
        className="absolute left-1/2 top-[calc(50%+12px)] z-10 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-4 border-white bg-gradient-to-br from-brand-from via-brand-via to-brand-to text-sm font-bold text-white shadow-lg transition-transform active:scale-95 disabled:opacity-70"
      >
        {spinning ? "…" : "GO"}
      </button>
    </div>
  );
});
