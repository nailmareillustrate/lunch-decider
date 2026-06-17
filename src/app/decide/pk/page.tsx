"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Swords, Play, RotateCcw } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { FilterPanel, emptyFilter } from "@/components/filter-panel";
import { ResultOverlay } from "@/components/result-overlay";
import { OptionMeta } from "@/components/option-meta";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { useMeta } from "@/components/use-meta";
import { api } from "@/lib/client";
import { shuffle } from "@/lib/utils";
import type { DecisionFilter, FoodOption } from "@/lib/types";

const SIZES = [4, 8, 16];

export default function PkPage() {
  const { toast } = useToast();
  const { categories, tags } = useMeta();
  const [filter, setFilter] = React.useState<DecisionFilter>(emptyFilter);
  const [pool, setPool] = React.useState<FoodOption[]>([]);
  const [size, setSize] = React.useState(8);

  const [current, setCurrent] = React.useState<FoodOption[]>([]);
  const [winners, setWinners] = React.useState<FoodOption[]>([]);
  const [pairIndex, setPairIndex] = React.useState(0);
  const [round, setRound] = React.useState(0);
  const [champion, setChampion] = React.useState<FoodOption | null>(null);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    api.pool(filter).then(setPool).catch((e) => toast(e.message, "error"));
  }, [filter, toast]);

  const started = current.length > 0 || champion !== null;
  const effectiveSize = Math.min(size, pool.length);

  const start = () => {
    if (pool.length < 2) {
      toast("至少需要 2 个候选项", "error");
      return;
    }
    setCurrent(shuffle(pool).slice(0, effectiveSize));
    setWinners([]);
    setPairIndex(0);
    setRound(1);
    setChampion(null);
  };

  const reset = () => {
    setCurrent([]);
    setWinners([]);
    setPairIndex(0);
    setRound(0);
    setChampion(null);
  };

  const finish = async (winner: FoodOption) => {
    setChampion(winner);
    setOpen(true);
    try {
      await api.recordHistory(winner.id, "pk");
    } catch {
      /* ignore */
    }
  };

  const choose = (winner: FoodOption) => {
    const nextWinners = [...winners, winner];
    const nextIndex = pairIndex + 2;

    if (nextIndex >= current.length) {
      // Round complete
      if (nextWinners.length === 1) {
        finish(nextWinners[0]);
        return;
      }
      setCurrent(nextWinners);
      setWinners([]);
      setPairIndex(0);
      setRound((r) => r + 1);
    } else {
      setWinners(nextWinners);
      setPairIndex(nextIndex);
    }
  };

  const a = current[pairIndex];
  const b = current[pairIndex + 1];
  const totalRounds = Math.ceil(Math.log2(Math.max(2, effectiveSize)));

  return (
    <div>
      <PageHeader
        title="PK 淘汰赛"
        description="两两对决，只选更想吃的那个"
        icon={<Swords className="size-5" />}
      />
      <div className="grid gap-6 lg:grid-cols-[20rem_1fr]">
        <FilterPanel
          value={filter}
          onChange={setFilter}
          categories={categories}
          tags={tags}
        />

        <Card className="relative overflow-hidden p-8 sm:p-12">
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-10 size-72 -translate-x-1/2 rounded-full opacity-50 blur-3xl"
            style={{
              background:
                "radial-gradient(circle, color-mix(in oklch, var(--color-primary) 28%, transparent), transparent 70%)",
            }}
          />
          {!started ? (
            <div className="relative flex flex-col items-center gap-8 py-6">
              <div className="text-center">
                <div className="text-6xl">🏆</div>
                <p className="mt-3 text-sm text-muted-foreground">
                  {pool.length} 项候选 · 选个赛制开打
                </p>
              </div>
              <div className="inline-flex rounded-full border border-border/70 bg-muted/40 p-1 backdrop-blur">
                {SIZES.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
                      size === s
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {s} 强
                  </button>
                ))}
              </div>
              <Button
                variant="brand"
                size="lg"
                onClick={start}
                className="h-12 rounded-full px-8 text-base shadow-[0_8px_22px_rgba(0,0,0,0.18)]"
              >
                <Play className="size-5" />
                开始 {effectiveSize} 强淘汰赛
              </Button>
            </div>
          ) : (
            a &&
            b && (
              <div className="relative flex flex-col items-center gap-8">
                <div className="flex items-center gap-2 rounded-full border border-border/70 bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
                  <span>第 {round} / {totalRounds} 轮</span>
                  <span className="text-border">·</span>
                  <span className="tabular-nums">
                    {pairIndex / 2 + 1} / {Math.floor(current.length / 2)} 场
                  </span>
                </div>
                <div className="grid w-full grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-5">
                  <AnimatePresence mode="popLayout">
                    <Contestant key={"a" + a.id} option={a} onPick={() => choose(a)} />
                    <motion.div
                      key="vs"
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="grid size-14 place-items-center rounded-full bg-gradient-to-br from-brand-from via-brand-via to-brand-to text-sm font-bold tracking-wide text-white shadow-[0_6px_16px_rgba(0,0,0,0.25),inset_0_1px_1px_rgba(255,255,255,0.4)] ring-4 ring-white/70 dark:ring-white/12"
                    >
                      VS
                    </motion.div>
                    <Contestant key={"b" + b.id} option={b} onPick={() => choose(b)} />
                  </AnimatePresence>
                </div>
                <Button variant="ghost" size="sm" onClick={reset}>
                  <RotateCcw className="size-4" />
                  重新开始
                </Button>
              </div>
            )
          )}
        </Card>
      </div>

      <ResultOverlay
        option={champion}
        open={open}
        onClose={() => {
          setOpen(false);
          reset();
        }}
        onRetry={() => {
          setOpen(false);
          setTimeout(start, 200);
        }}
        retryLabel="再赛一场"
      />
    </div>
  );
}

function Contestant({
  option,
  onPick,
}: {
  option: FoodOption;
  onPick: () => void;
}) {
  return (
    <motion.button
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85 }}
      whileHover={{ scale: 1.03, y: -4 }}
      whileTap={{ scale: 0.97 }}
      onClick={onPick}
      className="flex flex-col items-center gap-3 rounded-3xl border border-border bg-card p-6 text-center shadow-sm transition-colors hover:border-primary/60 hover:bg-primary/5 sm:p-8"
    >
      <span className="text-6xl drop-shadow-sm sm:text-7xl">{option.emoji}</span>
      <span className="text-lg font-semibold tracking-tight sm:text-xl">
        {option.name}
      </span>
      <OptionMeta option={option} showTags={false} />
    </motion.button>
  );
}
