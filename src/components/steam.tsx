"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";

interface Wisp {
  id: number;
  x: number;
  delay: number;
  duration: number;
  drift: number;
  scale: number;
  width: number;
}

/** Rising, wavering steam wisps — layered above a hot dish. */
export function Steam({
  active = true,
  className,
}: {
  active?: boolean;
  className?: string;
}) {
  const reduce = useReducedMotion();

  const wisps = React.useMemo<Wisp[]>(
    () => [
      { id: 0, x: -22, delay: 0.0, duration: 3.0, drift: -10, scale: 1.0, width: 26 },
      { id: 1, x: 0, delay: 0.5, duration: 3.4, drift: 8, scale: 1.15, width: 30 },
      { id: 2, x: 22, delay: 1.0, duration: 3.1, drift: 12, scale: 0.95, width: 24 },
      { id: 3, x: -10, delay: 1.6, duration: 3.6, drift: -6, scale: 1.05, width: 22 },
    ],
    [],
  );

  if (!active || reduce) return null;

  return (
    <div
      aria-hidden
      className={
        "pointer-events-none absolute bottom-full left-1/2 h-32 w-40 -translate-x-1/2 " +
        (className ?? "")
      }
    >
      {wisps.map((w) => (
        <motion.span
          key={w.id}
          className="absolute bottom-0 rounded-full"
          style={{
            left: `calc(50% + ${w.x}px)`,
            width: w.width,
            height: w.width * 2.4,
            background:
              "linear-gradient(to top, rgba(255,255,255,0) 0%, rgba(255,255,255,0.55) 45%, rgba(255,255,255,0) 100%)",
            filter: "blur(7px)",
          }}
          initial={{ y: 10, opacity: 0, scaleY: 0.6, x: 0 }}
          animate={{
            y: [-4, -120],
            x: [0, w.drift, w.drift * 0.4, w.drift * 1.4],
            opacity: [0, 0.7, 0.5, 0],
            scaleY: [0.7, 1.1, 1.3, 1.5],
            scaleX: [0.9, 1.1, 0.85, 1.2],
          }}
          transition={{
            duration: w.duration,
            delay: w.delay,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}
