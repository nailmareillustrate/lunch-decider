"use client";

import * as React from "react";
import { motion } from "framer-motion";

const COLORS = ["#f97316", "#ef4444", "#22c55e", "#eab308", "#3b82f6", "#ec4899"];

interface Piece {
  id: number;
  x: number;
  rotate: number;
  delay: number;
  color: string;
  drift: number;
  duration: number;
}

/** Deterministic PRNG so confetti is stable per render (no impure Math.random). */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashKey(key: number | string): number {
  const s = String(key);
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Fires a one-shot confetti burst whenever `fireKey` changes. */
export function Confetti({ fireKey }: { fireKey: number | string }) {
  const pieces = React.useMemo<Piece[]>(() => {
    const rand = mulberry32(hashKey(fireKey));
    return Array.from({ length: 80 }).map((_, i) => ({
      id: i,
      x: rand() * 100,
      rotate: rand() * 360,
      delay: rand() * 0.25,
      color: COLORS[i % COLORS.length],
      drift: (rand() - 0.5) * 40,
      duration: 2.4 + rand(),
    }));
  }, [fireKey]);

  return (
    <div className="pointer-events-none fixed inset-0 z-90 overflow-hidden">
      {pieces.map((p) => (
        <motion.span
          key={`${fireKey}-${p.id}`}
          initial={{ top: "-10%", left: `${p.x}%`, opacity: 1, rotate: 0 }}
          animate={{
            top: "110%",
            left: `${p.x + p.drift}%`,
            rotate: p.rotate * 3,
            opacity: [1, 1, 0.9, 0],
          }}
          transition={{ duration: p.duration, delay: p.delay, ease: "easeIn" }}
          style={{ backgroundColor: p.color }}
          className="absolute size-2 rounded-[2px]"
        />
      ))}
    </div>
  );
}
