"use client";

import * as React from "react";
import Link from "next/link";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  type MotionValue,
} from "framer-motion";
import { ArrowRight, type LucideIcon } from "lucide-react";

export interface SceneMode {
  href: string;
  title: string;
  desc: string;
  tagline: string;
  icon: LucideIcon;
  emoji: string;
  accent: string;
}

function Stage({
  mode,
  index,
  total,
  progress,
}: {
  mode: SceneMode;
  index: number;
  total: number;
  progress: MotionValue<number>;
}) {
  const unit = 1 / total;
  const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
  const start = index * unit;
  const end = (index + 1) * unit;
  const fade = unit * 0.4;
  const mid = (start + end) / 2;

  // Breakpoints kept strictly increasing and clamped within [0, 1].
  const a = clamp01(start - fade);
  const b = clamp01(start + fade);
  const c = clamp01(end - fade);
  const d = clamp01(end + fade);

  const opacity = useTransform(progress, [a, b, c, d], [0, 1, 1, 0]);
  const y = useTransform(progress, [a, d], [60, -60]);
  const scale = useTransform(progress, [a, mid, d], [0.86, 1, 0.86]);
  const Icon = mode.icon;

  return (
    <motion.div
      style={{ opacity }}
      className="absolute inset-0 grid place-items-center"
    >
      <div className="mx-auto grid w-full max-w-5xl items-center gap-8 px-6 md:grid-cols-2">
        {/* Visual */}
        <motion.div style={{ scale }} className="relative mx-auto">
          <div
            className={`absolute inset-0 -z-10 rounded-full bg-gradient-to-br ${mode.accent} opacity-40 blur-3xl`}
          />
          <div
            className={`relative grid size-56 place-items-center rounded-[2.25rem] bg-gradient-to-br ${mode.accent} shadow-2xl sm:size-72`}
            style={{ boxShadow: "inset 0 2px 2px rgba(255,255,255,0.4)" }}
          >
            <span className="absolute text-8xl opacity-90 drop-shadow-lg sm:text-9xl">
              {mode.emoji}
            </span>
            <Icon className="absolute -bottom-4 -right-4 size-14 rounded-2xl bg-card p-3 text-foreground shadow-xl" />
          </div>
        </motion.div>

        {/* Copy */}
        <motion.div style={{ y }} className="text-center md:text-left">
          <span className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">
            0{index + 1}
          </span>
          <h3 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">
            {mode.title}
          </h3>
          <p className="mt-3 text-lg text-muted-foreground">{mode.tagline}</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground/80 md:mx-0">
            {mode.desc}
          </p>
          <Link
            href={mode.href}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background transition-transform hover:scale-105"
          >
            进入{mode.title}
            <ArrowRight className="size-4" />
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}

export function ScrollScene({ modes }: { modes: SceneMode[] }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const barScale = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
  });

  return (
    <div
      ref={ref}
      style={{ height: `${modes.length * 80 + 40}vh` }}
      className="relative"
    >
      <div className="sticky top-0 flex h-dvh flex-col overflow-hidden">
        <div className="pointer-events-none absolute left-1/2 top-10 z-10 -translate-x-1/2 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            六种玩法 · 一个都不将就
          </p>
        </div>
        <div className="relative flex-1">
          {modes.map((m, i) => (
            <Stage
              key={m.href}
              mode={m}
              index={i}
              total={modes.length}
              progress={scrollYProgress}
            />
          ))}
        </div>
        {/* Scroll progress rail */}
        <div className="absolute bottom-10 left-1/2 h-1 w-40 -translate-x-1/2 overflow-hidden rounded-full bg-border">
          <motion.div
            style={{ scaleX: barScale, transformOrigin: "left" }}
            className="h-full w-full bg-gradient-to-r from-brand-from via-brand-via to-brand-to"
          />
        </div>
      </div>
    </div>
  );
}
