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
        description="设定口味、价格、就餐方式，让算法帮你随机抽一个"
        icon={<Shuffle className="size-5" />}
      />
      <div className="grid gap-6 lg:grid-cols-[20rem_1fr]">
        <FilterPanel
          value={filter}
          onChange={setFilter}
          categories={categories}
          tags={tags}
        />
        <Card className="flex flex-col items-center justify-center gap-6 p-10">
          <p className="text-sm text-muted-foreground">
            符合条件的候选：
            <span className="font-semibold text-foreground">{pool.length}</span> 项
          </p>
          <div className="grid min-h-44 w-full max-w-sm place-items-center rounded-2xl border border-dashed border-border bg-muted/40 p-6">
            <AnimatePresence mode="popLayout">
              {preview ? (
                <motion.div
                  key={preview.id + (rolling ? "-r" : "-f")}
                  initial={{ opacity: 0, y: 12, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -12, scale: 0.9 }}
                  transition={{ duration: 0.12 }}
                  className="text-center"
                >
                  <div className="text-6xl">{preview.emoji}</div>
                  <div className="mt-3 text-2xl font-bold">{preview.name}</div>
                  <div className="mt-3 flex justify-center">
                    <OptionMeta option={preview} showTags={false} />
                  </div>
                </motion.div>
              ) : (
                <p className="text-center text-muted-foreground">
                  点击下方按钮开始
                </p>
              )}
            </AnimatePresence>
          </div>
          <Button variant="brand" size="lg" onClick={roll} disabled={rolling}>
            <Dices className={rolling ? "size-5 animate-spin" : "size-5"} />
            {rolling ? "抽取中…" : "随机抽一个"}
          </Button>
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
