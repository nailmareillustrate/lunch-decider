"use client";

import * as React from "react";
import { CircleDot, RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { FilterPanel, emptyFilter } from "@/components/filter-panel";
import { Wheel, type WheelHandle } from "@/components/wheel";
import { ResultOverlay } from "@/components/result-overlay";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { useMeta } from "@/components/use-meta";
import { api } from "@/lib/client";
import { shuffle } from "@/lib/utils";
import type { DecisionFilter, FoodOption } from "@/lib/types";

const MAX_SEGMENTS = 10;

export default function WheelPage() {
  const { toast } = useToast();
  const { categories, tags } = useMeta();
  const [filter, setFilter] = React.useState<DecisionFilter>(emptyFilter);
  const [pool, setPool] = React.useState<FoodOption[]>([]);
  const [displayed, setDisplayed] = React.useState<FoodOption[]>([]);
  const [spinning, setSpinning] = React.useState(false);
  const [result, setResult] = React.useState<FoodOption | null>(null);
  const [open, setOpen] = React.useState(false);
  const wheelRef = React.useRef<WheelHandle>(null);

  const resample = React.useCallback((src: FoodOption[]) => {
    setDisplayed(
      src.length <= MAX_SEGMENTS ? src : shuffle(src).slice(0, MAX_SEGMENTS),
    );
  }, []);

  React.useEffect(() => {
    api
      .pool(filter)
      .then((opts) => {
        setPool(opts);
        resample(opts);
      })
      .catch((e) => toast(e.message, "error"));
  }, [filter, resample, toast]);

  const handleResult = async (option: FoodOption) => {
    setSpinning(false);
    setResult(option);
    setOpen(true);
    try {
      await api.recordHistory(option.id, "wheel");
    } catch {
      /* non-blocking */
    }
  };

  return (
    <div>
      <PageHeader
        title="幸运大转盘"
        description="轻点中心，把午餐交给命运"
        icon={<CircleDot className="size-5" />}
      />
      <div className="grid gap-6 lg:grid-cols-[20rem_1fr]">
        <FilterPanel
          value={filter}
          onChange={setFilter}
          categories={categories}
          tags={tags}
        />
        <Card className="relative flex flex-col items-center justify-center gap-8 overflow-hidden p-10 sm:p-14">
          {pool.length === 0 ? (
            <p className="py-24 text-center text-muted-foreground">
              没有符合条件的选项，放宽筛选条件试试～
            </p>
          ) : (
            <>
              <Wheel
                ref={wheelRef}
                options={displayed}
                spinning={spinning}
                onSpinStart={() => setSpinning(true)}
                onResult={handleResult}
              />
              <div className="flex items-center gap-1.5 rounded-full border border-border/70 bg-muted/40 px-1.5 py-1 text-xs text-muted-foreground backdrop-blur">
                <span className="px-2 tabular-nums">
                  {pool.length > MAX_SEGMENTS
                    ? `${displayed.length} / ${pool.length} 项`
                    : `${displayed.length} 项`}
                </span>
                {pool.length > MAX_SEGMENTS && (
                  <button
                    onClick={() => resample(pool)}
                    disabled={spinning}
                    className="inline-flex items-center gap-1 rounded-full bg-card px-2.5 py-1 font-medium text-foreground shadow-sm transition-colors hover:text-primary disabled:opacity-50"
                  >
                    <RefreshCw className="size-3.5" />
                    换一批
                  </button>
                )}
              </div>
            </>
          )}
        </Card>
      </div>
      <ResultOverlay
        option={result}
        open={open}
        onClose={() => setOpen(false)}
        onRetry={() => {
          setOpen(false);
          setTimeout(() => wheelRef.current?.spin(), 250);
        }}
        retryLabel="再转一次"
      />
    </div>
  );
}
