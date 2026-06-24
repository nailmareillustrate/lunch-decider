"use client";

import { motion } from "framer-motion";

function Row({
  items,
  reverse = false,
  duration = 38,
}: {
  items: string[];
  reverse?: boolean;
  duration?: number;
}) {
  const doubled = [...items, ...items];
  return (
    <div className="flex w-max">
      <motion.div
        className="flex gap-6 pr-6 text-5xl sm:text-6xl"
        initial={{ x: reverse ? "-50%" : "0%" }}
        animate={{ x: reverse ? "0%" : "-50%" }}
        transition={{ duration, repeat: Infinity, ease: "linear" }}
      >
        {doubled.map((e, i) => (
          <span
            key={i}
            className="select-none grayscale-[0.1] drop-shadow-sm transition-all"
          >
            {e}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

/** Two opposing infinite rows of food emoji with faded edges. */
export function EmojiMarquee({ emojis }: { emojis: string[] }) {
  const unique = Array.from(new Set(emojis)).filter(Boolean);
  const pool = unique.length >= 8 ? unique : [...unique, "🍜", "🍣", "🍔", "🥗", "🍲", "🍱", "🌮", "🍛"];
  const mid = Math.ceil(pool.length / 2);
  const top = pool.slice(0, mid);
  const bottom = pool.slice(mid).concat(top).slice(0, Math.max(6, mid));

  return (
    <div
      className="relative flex flex-col gap-4 overflow-hidden py-2"
      style={{
        maskImage:
          "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
      }}
    >
      <Row items={top} />
      <Row items={bottom} reverse duration={46} />
    </div>
  );
}
