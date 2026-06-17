"use client";

import * as React from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import {
  SOURCES,
  SOURCE_LABELS,
  type DecisionFilter,
  type Source,
} from "@/lib/types";

export const emptyFilter: DecisionFilter = {
  categories: [],
  sources: [],
  maxPrice: undefined,
  maxSpicy: undefined,
  tags: [],
  excludeRecent: false,
  recentWindow: 5,
};

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-sm font-medium transition-all active:scale-95",
        active
          ? "border-transparent bg-primary text-primary-foreground shadow-sm"
          : "border-border bg-card/60 text-muted-foreground hover:text-foreground hover:bg-muted",
      )}
    >
      {children}
    </button>
  );
}

function toggle<T>(arr: T[], v: T): T[] {
  return arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
}

export function FilterPanel({
  value,
  onChange,
  categories,
  tags,
}: {
  value: DecisionFilter;
  onChange: (f: DecisionFilter) => void;
  categories: string[];
  tags: string[];
}) {
  const set = (patch: Partial<DecisionFilter>) =>
    onChange({ ...value, ...patch });

  const activeCount =
    value.categories.length +
    value.sources.length +
    value.tags.length +
    (value.maxPrice ? 1 : 0) +
    (value.maxSpicy !== undefined ? 1 : 0) +
    (value.excludeRecent ? 1 : 0);

  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold">
          <SlidersHorizontal className="size-4 text-primary" />
          筛选条件
          {activeCount > 0 && (
            <span className="rounded-full bg-primary/12 px-2 py-0.5 text-xs text-primary">
              {activeCount}
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <button
            onClick={() => onChange(emptyFilter)}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <X className="size-3" /> 清除
          </button>
        )}
      </div>

      <div className="space-y-5">
        {categories.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              分类
            </p>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <Chip
                  key={c}
                  active={value.categories.includes(c)}
                  onClick={() => set({ categories: toggle(value.categories, c) })}
                >
                  {c}
                </Chip>
              ))}
            </div>
          </div>
        )}

        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">就餐方式</p>
          <div className="flex flex-wrap gap-2">
            {SOURCES.filter((s) => s !== "either").map((s) => (
              <Chip
                key={s}
                active={value.sources.includes(s)}
                onClick={() => set({ sources: toggle(value.sources, s as Source) })}
              >
                {SOURCE_LABELS[s]}
              </Chip>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-5">
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              价格上限
            </p>
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3].map((p) => (
                <Chip
                  key={p}
                  active={value.maxPrice === p}
                  onClick={() =>
                    set({ maxPrice: value.maxPrice === p ? undefined : p })
                  }
                >
                  {"¥".repeat(p)}
                </Chip>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              辣度上限
            </p>
            <div className="flex flex-wrap gap-2">
              {[0, 1, 2, 3].map((p) => (
                <Chip
                  key={p}
                  active={value.maxSpicy === p}
                  onClick={() =>
                    set({ maxSpicy: value.maxSpicy === p ? undefined : p })
                  }
                >
                  {p === 0 ? "不辣" : "🌶️".repeat(p)}
                </Chip>
              ))}
            </div>
          </div>
        </div>

        {tags.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">标签</p>
            <div className="flex flex-wrap gap-2">
              {tags.map((t) => (
                <Chip
                  key={t}
                  active={value.tags.includes(t)}
                  onClick={() => set({ tags: toggle(value.tags, t) })}
                >
                  #{t}
                </Chip>
              ))}
            </div>
          </div>
        )}

        <label className="flex cursor-pointer items-center justify-between rounded-lg border border-border bg-card/40 px-4 py-3">
          <span className="text-sm">
            <span className="font-medium">避开最近吃过的</span>
            <span className="ml-2 text-muted-foreground">
              最近 {value.recentWindow} 次
            </span>
          </span>
          <input
            type="checkbox"
            checked={value.excludeRecent}
            onChange={(e) => set({ excludeRecent: e.target.checked })}
            className="size-5 accent-[var(--color-primary)]"
          />
        </label>
      </div>
    </Card>
  );
}
