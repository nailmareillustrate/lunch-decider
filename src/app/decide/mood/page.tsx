"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { HeartHandshake, Dices } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { ResultOverlay } from "@/components/result-overlay";
import { OptionMeta } from "@/components/option-meta";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { api } from "@/lib/client";
import type { DecisionFilter, FoodOption } from "@/lib/types";

interface Mood {
  key: string;
  emoji: string;
  label: string;
  desc: string;
  filter: Partial<DecisionFilter>;
  accent: string;
}

const MOODS: Mood[] = [
  {
    key: "spicy",
    emoji: "🌶️",
    label: "无辣不欢",
    desc: "今天就想被辣到出汗",
    filter: { tags: ["辣", "酸辣", "重口"] },
    accent: "from-rose-400 to-red-500",
  },
  {
    key: "light",
    emoji: "🍵",
    label: "清淡养胃",
    desc: "肠胃友好，温柔一点",
    filter: { maxSpicy: 0, tags: ["清淡", "养胃", "低卡", "健康"] },
    accent: "from-emerald-400 to-teal-500",
  },
  {
    key: "carb",
    emoji: "🍚",
    label: "碳水快乐",
    desc: "米饭面条管够",
    filter: { tags: ["米饭", "面", "粉", "面包"] },
    accent: "from-amber-400 to-orange-500",
  },
  {
    key: "healthy",
    emoji: "🥗",
    label: "健康轻食",
    desc: "减脂期也能安心吃",
    filter: { categories: ["健康轻食"], maxSpicy: 1 },
    accent: "from-lime-400 to-green-500",
  },
  {
    key: "meat",
    emoji: "🥩",
    label: "大口吃肉",
    desc: "无肉不欢补充能量",
    filter: { tags: ["牛肉", "鸡肉", "烤肉", "炸鸡", "腊味"] },
    accent: "from-orange-500 to-rose-600",
  },
  {
    key: "fast",
    emoji: "⚡",
    label: "快速解决",
    desc: "时间紧，越快越好",
    filter: { tags: ["快", "实惠"] },
    accent: "from-sky-400 to-blue-500",
  },
  {
    key: "party",
    emoji: "🎉",
    label: "朋友聚餐",
    desc: "适合多人分享",
    filter: { tags: ["聚餐", "分享"] },
    accent: "from-fuchsia-400 to-pink-500",
  },
  {
    key: "budget",
    emoji: "💰",
    label: "省钱模式",
    desc: "钱包友好，实惠为王",
    filter: { maxPrice: 1 },
    accent: "from-indigo-400 to-violet-500",
  },
];

export default function MoodPage() {
  const { toast } = useToast();
  const [active, setActive] = React.useState<Mood | null>(null);
  const [matches, setMatches] = React.useState<FoodOption[]>([]);
  const [result, setResult] = React.useState<FoodOption | null>(null);
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const selectMood = async (mood: Mood) => {
    setActive(mood);
    setLoading(true);
    try {
      setMatches(await api.pool(mood.filter));
    } catch (e) {
      toast(e instanceof Error ? e.message : "出错了", "error");
    } finally {
      setLoading(false);
    }
  };

  const pick = async () => {
    if (!active) return;
    try {
      const option = await api.decide(active.filter, "mood");
      setResult(option);
      setOpen(true);
    } catch (e) {
      toast(e instanceof Error ? e.message : "出错了", "error");
    }
  };

  return (
    <div>
      <PageHeader
        title="心情筛选"
        description="先告诉我你现在的心情，我来帮你缩小范围"
        icon={<HeartHandshake className="size-5" />}
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {MOODS.map((m) => (
          <motion.button
            key={m.key}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => selectMood(m)}
            className={`relative overflow-hidden rounded-2xl border p-4 text-left transition-colors ${
              active?.key === m.key
                ? "border-primary bg-primary/5"
                : "border-border bg-card hover:bg-muted/50"
            }`}
          >
            <div
              className={`mb-2 grid size-11 place-items-center rounded-xl bg-gradient-to-br ${m.accent} text-2xl shadow`}
            >
              {m.emoji}
            </div>
            <div className="font-semibold">{m.label}</div>
            <div className="text-xs text-muted-foreground">{m.desc}</div>
          </motion.button>
        ))}
      </div>

      {active && (
        <Card className="mt-8 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">
              {active.emoji} {active.label}
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                {matches.length} 个匹配
              </span>
            </h2>
            <Button
              variant="brand"
              onClick={pick}
              disabled={loading || matches.length === 0}
            >
              <Dices className="size-4" />
              帮我定一个
            </Button>
          </div>
          {matches.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              {loading ? "加载中…" : "这个心情下还没有匹配的美食，去管理页添加吧"}
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {matches.map((o) => (
                <div
                  key={o.id}
                  className="flex items-start gap-3 rounded-xl border border-border bg-card/50 p-3"
                >
                  <span className="text-3xl">{o.emoji}</span>
                  <div className="min-w-0">
                    <div className="font-medium">{o.name}</div>
                    <div className="mt-1">
                      <OptionMeta option={o} showTags={false} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      <ResultOverlay
        option={result}
        open={open}
        onClose={() => setOpen(false)}
        onRetry={pick}
      />
    </div>
  );
}
