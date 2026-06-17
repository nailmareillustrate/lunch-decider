"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { History as HistoryIcon, Trophy, Trash2, Clock } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { api } from "@/lib/client";
import { MODE_LABELS, type HistoryEntry } from "@/lib/types";
import type { OptionStat } from "@/lib/repo";

function formatTime(s: string): string {
  const d = new Date(s.replace(" ", "T") + "Z");
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function HistoryPage() {
  const { toast } = useToast();
  const [history, setHistory] = React.useState<HistoryEntry[]>([]);
  const [topPicks, setTopPicks] = React.useState<OptionStat[]>([]);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(() => {
    api
      .history()
      .then((d) => {
        setHistory(d.history);
        setTopPicks(d.topPicks);
      })
      .catch((e) => toast(e.message, "error"))
      .finally(() => setLoading(false));
  }, [toast]);

  React.useEffect(() => {
    load();
  }, [load]);

  const clear = async () => {
    if (!confirm("确定清空所有历史记录？此操作不可撤销。")) return;
    try {
      await api.clearHistory();
      setHistory([]);
      setTopPicks([]);
      toast("历史记录已清空", "success");
    } catch (e) {
      toast(e instanceof Error ? e.message : "出错了", "error");
    }
  };

  const maxCount = topPicks[0]?.count ?? 1;

  return (
    <div>
      <PageHeader
        title="历史与统计"
        description="回顾你做过的每一个午餐决定，发现自己的口味偏好"
        icon={<HistoryIcon className="size-5" />}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="size-5 text-primary" />
              最常吃 TOP
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topPicks.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                还没有记录，去做几个决定吧～
              </p>
            ) : (
              topPicks.map((p, i) => (
                <div key={p.optionId} className="flex items-center gap-3">
                  <span className="w-5 text-center text-sm font-bold text-muted-foreground">
                    {i + 1}
                  </span>
                  <span className="text-2xl">{p.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="truncate font-medium">{p.name}</span>
                      <span className="text-muted-foreground">{p.count} 次</span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(p.count / maxCount) * 100}%` }}
                        transition={{ duration: 0.6, delay: i * 0.05 }}
                        className="h-full rounded-full bg-gradient-to-r from-brand-from to-brand-to"
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="size-5 text-primary" />
              时间线
              <span className="text-sm font-normal text-muted-foreground">
                {history.length} 条
              </span>
            </CardTitle>
            {history.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clear}>
                <Trash2 className="size-4" />
                清空
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                加载中…
              </p>
            ) : history.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                还没有历史记录
              </p>
            ) : (
              <ul className="max-h-[28rem] space-y-1 overflow-y-auto pr-1">
                {history.map((h) => (
                  <li
                    key={h.id}
                    className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-muted/50"
                  >
                    <span className="text-2xl">{h.optionEmoji}</span>
                    <span className="flex-1 truncate font-medium">
                      {h.optionName}
                    </span>
                    <Badge variant="secondary">{MODE_LABELS[h.mode]}</Badge>
                    <span className="w-24 text-right text-xs text-muted-foreground">
                      {formatTime(h.decidedAt)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
