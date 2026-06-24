"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shuffle, Dices } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { FilterPanel, emptyFilter } from "@/components/filter-panel";
import { ResultOverlay } from "@/components/result-overlay";
import { OptionMeta } from "@/components/option-meta";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { useMeta } from "@/components/use-meta";
import { api } from "@/lib/client";
import type { DecisionFilter, FoodOption } from "@/lib/types";

export default function RandomPage() {
  const { toast } = useToast();
  const { categories, tags } = useMeta();
  const [filter, setFilter] = React.useState<DecisionFilter>(emptyFilter);
  const [pool, setPool] = React.useState<FoodOption[]>([]);
  const [rolling, setRolling] = React.useState(false);
  const [preview, setPreview] = React.useState<FoodOption | null>(null);
  const [result, setResult] = React.useState<FoodOption | null>(null);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    api
      .pool(filter)
      .then(setPool)
      .catch((e) => toast(e.message, "error"));
  }, [filter, toast]);

  const roll = async () => {
    if (pool.length === 0) {
      toast("没有符合条件的选项，放宽筛选条件试试", "error");
      return;
    }
    setRolling(true);
    // Slot-machine shuffle animation before committing to the API result.
    const start = Date.now();
    const interval = setInterval(() => {
      setPreview(pool[Math.floor(Math.random() * pool.length)]);
    }, 70);
    try {
      const option = await api.decide(filter, "random");
      const elapsed = Date.now() - start;
      setTimeout(
        () => {
          clearInterval(interval);
          setPreview(option);
          setResult(option);
          setOpen(true);
          setRolling(false);
        },
        Math.max(0, 900 - elapsed),
      );
    } catch (e) {
      clearInterval(interval);
      setRolling(false);
      toast(e instanceof Error ? e.message : "出错了", "error");
    }
  };

  return (
    <div>
      <PageHeader
        title="随机推荐"
        description="按口味缩小范围，剩下的交给手气"
        icon={<Shuffle className="size-5" />}
      />
      <div className="grid gap-6 lg:grid-cols-[20rem_1fr]">
        <FilterPanel
          value={filter}
          onChange={setFilter}
          categories={categories}
          tags={tags}
        />
        <Card className="relative flex flex-col items-center justify-center gap-8 overflow-hidden p-10 sm:p-14">
          {/* Ambient glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-24 size-64 -translate-x-1/2 rounded-full opacity-60 blur-3xl"
            style={{
              background:
                "radial-gradient(circle, color-mix(in oklch, var(--color-primary) 32%, transparent), transparent 70%)",
            }}
          />
          <div className="relative grid min-h-52 w-full max-w-sm place-items-center">
            <AnimatePresence mode="popLayout">
              {preview ? (
                <motion.div
                  key={preview.id + (rolling ? "-r" : "-f")}
                  initial={{ opacity: 0, y: 12, scale: 0.92 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -12, scale: 0.92 }}
                  transition={{ duration: 0.12 }}
                  className="text-center"
                >
                  <div className="text-8xl drop-shadow-sm">{preview.emoji}</div>
                  <div className="mt-4 text-3xl font-bold tracking-tight">
                    {preview.name}
                  </div>
                  {!rolling && (
                    <div className="mt-3 flex justify-center">
                      <OptionMeta option={preview} showTags={false} />
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center"
                >
                  <div className="text-7xl opacity-25">🍽️</div>
                  <p className="mt-4 text-sm text-muted-foreground">
                    轻点下方，开抽今天的午餐
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="relative flex flex-col items-center gap-4">
            <Button
              variant="brand"
              size="lg"
              onClick={roll}
              disabled={rolling}
              className="h-12 rounded-full px-8 text-base shadow-[0_8px_22px_rgba(0,0,0,0.18)]"
            >
              <Dices className={rolling ? "size-5 animate-spin" : "size-5"} />
              {rolling ? "抽取中…" : "随机抽一个"}
            </Button>
            <span className="rounded-full border border-border/70 bg-muted/40 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
              {pool.length} 项候选
            </span>
          </div>
        </Card>
      </div>
      <ResultOverlay
        option={result}
        open={open}
        onClose={() => setOpen(false)}
        onRetry={() => {
          setOpen(false);
          setTimeout(roll, 200);
        }}
      />
    </div>
  );
}
