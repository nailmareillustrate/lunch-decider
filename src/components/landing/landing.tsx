"use client";

import * as React from "react";
import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform, useReducedMotion, type MotionValue } from "framer-motion";
import {
  CircleDot,
  Shuffle,
  Swords,
  Vote,
  HeartHandshake,
  BarChart3,
  ChevronDown,
  Settings2,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { QuickPick } from "@/components/quick-pick";
import { EmojiMarquee } from "@/components/landing/emoji-marquee";
import { ScrollScene, type SceneMode } from "@/components/landing/scroll-scene";
import { TiltCard } from "@/components/landing/tilt-card";

const MODES: SceneMode[] = [
  {
    href: "/decide/wheel",
    title: "幸运大转盘",
    tagline: "转一转，命运说了算",
    desc: "玻璃质感的转盘，轻点中心，指针落定即是今天的答案。",
    icon: CircleDot,
    emoji: "🎡",
    accent: "from-orange-400 to-rose-500",
  },
  {
    href: "/decide/random",
    title: "随机推荐",
    tagline: "一键随机，拒绝纠结",
    desc: "按口味、价格、就餐方式缩小范围，剩下的交给手气。",
    icon: Shuffle,
    emoji: "🎲",
    accent: "from-amber-400 to-orange-500",
  },
  {
    href: "/decide/pk",
    title: "PK 淘汰赛",
    tagline: "两两对决，王者胜出",
    desc: "4/8/16 强淘汰赛，每次只选更想吃的那个，决出唯一冠军。",
    icon: Swords,
    emoji: "🥊",
    accent: "from-rose-400 to-red-500",
  },
  {
    href: "/vote",
    title: "多人投票",
    tagline: "人多？投票定胜负",
    desc: "创建投票房间，分享链接，团队点餐少数服从多数。",
    icon: Vote,
    emoji: "🗳️",
    accent: "from-emerald-400 to-teal-500",
  },
  {
    href: "/decide/mood",
    title: "心情筛选",
    tagline: "跟着心情，按需筛选",
    desc: "无辣不欢、清淡养胃、大口吃肉……选一种心情，剩下交给我。",
    icon: HeartHandshake,
    emoji: "😋",
    accent: "from-fuchsia-400 to-pink-500",
  },
  {
    href: "/history",
    title: "历史与统计",
    tagline: "越用越懂你的口味",
    desc: "回顾吃过什么，TOP 榜单与时间线，发现你的隐藏偏好。",
    icon: BarChart3,
    emoji: "📊",
    accent: "from-sky-400 to-indigo-500",
  },
];

function FloatEmoji({
  emoji,
  className,
  depth,
  mx,
  my,
}: {
  emoji: string;
  className: string;
  depth: number;
  mx: MotionValue<number>;
  my: MotionValue<number>;
}) {
  const x = useTransform(mx, [0, 1], [depth, -depth]);
  const y = useTransform(my, [0, 1], [depth, -depth]);
  return (
    <motion.span
      aria-hidden
      style={{ x, y }}
      className={`pointer-events-none absolute select-none blur-[1px] ${className}`}
    >
      {emoji}
    </motion.span>
  );
}

function Hero({
  optionCount,
  categoryCount,
  floatEmojis,
}: {
  optionCount: number;
  categoryCount: number;
  floatEmojis: string[];
}) {
  const reduce = useReducedMotion();
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const sx = useSpring(mx, { stiffness: 120, damping: 30 });
  const sy = useSpring(my, { stiffness: 120, damping: 30 });

  const glow = useMotionTemplate`radial-gradient(36rem 36rem at calc(${sx} * 100%) calc(${sy} * 100%), color-mix(in oklch, var(--color-primary) 26%, transparent), transparent 60%)`;

  const onMove = (e: React.PointerEvent<HTMLElement>) => {
    if (reduce) return;
    const rect = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - rect.left) / rect.width);
    my.set((e.clientY - rect.top) / rect.height);
  };

  const title = "今天中午吃什么";
  const float = floatEmojis.slice(0, 6);

  return (
    <section
      onPointerMove={onMove}
      className="relative flex min-h-[calc(100dvh-4rem)] flex-col items-center justify-center overflow-hidden px-6 text-center"
    >
      <motion.div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{ background: glow }}
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-20 opacity-[0.04]"
        style={{
          backgroundImage:
            "radial-gradient(currentColor 1px, transparent 1px)",
          backgroundSize: "26px 26px",
        }}
      />

      {/* Parallax floating emojis */}
      {float[0] && <FloatEmoji emoji={float[0]} mx={sx} my={sy} depth={28} className="left-[12%] top-[22%] text-6xl" />}
      {float[1] && <FloatEmoji emoji={float[1]} mx={sx} my={sy} depth={48} className="right-[14%] top-[18%] text-7xl" />}
      {float[2] && <FloatEmoji emoji={float[2]} mx={sx} my={sy} depth={36} className="left-[18%] bottom-[20%] text-5xl" />}
      {float[3] && <FloatEmoji emoji={float[3]} mx={sx} my={sy} depth={60} className="right-[16%] bottom-[16%] text-6xl" />}
      {float[4] && <FloatEmoji emoji={float[4]} mx={sx} my={sy} depth={20} className="left-[44%] top-[10%] text-4xl" />}
      {float[5] && <FloatEmoji emoji={float[5]} mx={sx} my={sy} depth={70} className="right-[40%] bottom-[10%] text-5xl" />}

      <motion.span
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-4 py-1.5 text-sm text-muted-foreground backdrop-blur"
      >
        🥢 已收录 {optionCount} 种美食 · {categoryCount} 个分类
      </motion.span>

      <h1 className="mt-7 max-w-4xl text-5xl font-black leading-[1.05] tracking-tight sm:text-7xl md:text-8xl">
        <span className="sr-only">{title}</span>
        <span aria-hidden className="flex flex-wrap justify-center gap-x-3">
          {title.split("").map((ch, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 40, rotateX: -60 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{
                delay: 0.15 + i * 0.05,
                type: "spring",
                stiffness: 220,
                damping: 18,
              }}
              className="inline-block"
            >
              {ch}
            </motion.span>
          ))}
        </span>
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="mt-2 block bg-gradient-to-r from-brand-from via-brand-via to-brand-to bg-clip-text text-transparent"
        >
          让选择，成为一种享受
        </motion.span>
      </h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.6 }}
        className="mt-6 max-w-xl text-pretty text-base text-muted-foreground sm:text-lg"
      >
        选择困难症的终极解药。转盘、随机、PK、投票、心情筛选——
        总有一种方式，替你优雅地做出决定。
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.05, duration: 0.6 }}
        className="mt-9"
      >
        <QuickPick />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 8, 0] }}
        transition={{
          opacity: { delay: 1.4 },
          y: { repeat: Infinity, duration: 1.8, ease: "easeInOut" },
        }}
        className="absolute bottom-8 flex flex-col items-center gap-1 text-xs text-muted-foreground"
      >
        向下滚动探索
        <ChevronDown className="size-4" />
      </motion.div>
    </section>
  );
}

export function Landing({
  optionCount,
  categoryCount,
  emojis,
}: {
  optionCount: number;
  categoryCount: number;
  emojis: string[];
}) {
  return (
    <div className="w-[100vw] ml-[calc(50%-50vw)] -mt-8 -mb-8 overflow-x-clip sm:-mt-10 sm:-mb-10">
      <Hero
        optionCount={optionCount}
        categoryCount={categoryCount}
        floatEmojis={emojis}
      />

      {/* Marquee band */}
      <section className="border-y border-border/60 bg-card/30 py-10 backdrop-blur-sm">
        <EmojiMarquee emojis={emojis} />
      </section>

      {/* Scroll-driven storytelling */}
      <ScrollScene modes={MODES} />

      {/* Interactive tilt grid */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              选一种决策方式
            </h2>
            <p className="mt-2 text-muted-foreground">
              六种玩法，治好你的纠结
            </p>
          </div>
          <Link
            href="/manage"
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/60 px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <Settings2 className="size-4" />
            管理菜单
          </Link>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" style={{ perspective: 1000 }}>
          {MODES.map((m) => {
            const Icon = m.icon;
            return (
              <TiltCard
                key={m.href}
                className="group relative overflow-hidden rounded-3xl border border-border bg-card p-7 shadow-sm transition-shadow hover:shadow-2xl"
              >
                <Link href={m.href} className="block" style={{ transform: "translateZ(40px)" }}>
                  <div className="flex items-center justify-between">
                    <div
                      className={`grid size-14 place-items-center rounded-2xl bg-gradient-to-br ${m.accent} text-white shadow-lg`}
                      style={{ boxShadow: "inset 0 1px 1px rgba(255,255,255,0.4)" }}
                    >
                      <Icon className="size-7" />
                    </div>
                    <span className="text-4xl opacity-90 transition-transform duration-300 group-hover:scale-110">
                      {m.emoji}
                    </span>
                  </div>
                  <h3 className="mt-5 text-xl font-bold tracking-tight">
                    {m.title}
                  </h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    {m.tagline}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                    开始
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              </TiltCard>
            );
          })}
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-from via-brand-via to-brand-to opacity-90" />
        <div
          aria-hidden
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />
        <div className="relative mx-auto flex max-w-3xl flex-col items-center px-6 py-28 text-center text-white">
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-black tracking-tight drop-shadow-sm sm:text-6xl"
          >
            别再纠结了。
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-4 max-w-md text-lg text-white/85"
          >
            一次点击，立刻拥有今天的午餐答案。
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-9"
          >
            <QuickPick />
          </motion.div>
        </div>
      </section>
    </div>
  );
}
