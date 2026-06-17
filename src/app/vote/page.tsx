"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Vote, Plus, Users, ChevronRight, Check } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { api } from "@/lib/client";
import { cn } from "@/lib/utils";
import type { FoodOption, VoteSession } from "@/lib/types";

export default function VotePage() {
  const { toast } = useToast();
  const router = useRouter();
  const [sessions, setSessions] = React.useState<VoteSession[]>([]);
  const [open, setOpen] = React.useState(false);

  const load = React.useCallback(() => {
    api.listVoteSessions().then(setSessions).catch((e) => toast(e.message, "error"));
  }, [toast]);

  React.useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <PageHeader
        title="多人投票"
        description="发起一个投票，把链接发给同事朋友，少数服从多数"
        icon={<Vote className="size-5" />}
      />

      <div className="mb-5 flex justify-end">
        <Button variant="brand" onClick={() => setOpen(true)}>
          <Plus className="size-4" />
          发起投票
        </Button>
      </div>

      {sessions.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground">
          还没有投票，点击「发起投票」创建第一个
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {sessions.map((s) => {
            const total = s.candidates.reduce((a, c) => a + c.votes, 0);
            return (
              <Link key={s.id} href={`/vote/${s.id}`}>
                <Card className="group flex items-center justify-between p-5 transition-all hover:-translate-y-0.5 hover:shadow-md">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate font-semibold">{s.title}</h3>
                      <Badge variant={s.status === "open" ? "accent" : "secondary"}>
                        {s.status === "open" ? "进行中" : "已结束"}
                      </Badge>
                    </div>
                    <p className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                      <span>{s.candidates.length} 个候选</span>
                      <span className="flex items-center gap-1">
                        <Users className="size-3.5" />
                        {total} 票
                      </span>
                    </p>
                  </div>
                  <ChevronRight className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      <CreateVoteDialog
        open={open}
        onClose={() => setOpen(false)}
        onCreated={(id) => router.push(`/vote/${id}`)}
      />
    </div>
  );
}

function CreateVoteDialog({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (id: string) => void;
}) {
  const { toast } = useToast();
  const [title, setTitle] = React.useState("今天午餐投票");
  const [options, setOptions] = React.useState<FoodOption[]>([]);
  const [selected, setSelected] = React.useState<Set<number>>(new Set());
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (open) api.listOptions(true).then(setOptions).catch(() => {});
  }, [open]);

  const toggle = (id: number) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const create = async () => {
    const candidates = options
      .filter((o) => selected.has(o.id))
      .map((o) => ({ optionId: o.id, name: o.name, emoji: o.emoji }));
    if (candidates.length < 2) {
      toast("至少选择 2 个候选项", "error");
      return;
    }
    setSubmitting(true);
    try {
      const session = await api.createVoteSession({ title, candidates });
      onClose();
      setSelected(new Set());
      onCreated(session.id);
    } catch (e) {
      toast(e instanceof Error ? e.message : "创建失败", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="发起投票"
      description="选择候选美食，生成投票链接分享给大家"
    >
      <div className="space-y-4">
        <div>
          <Label>投票标题</Label>
          <Input
            className="mt-1.5"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div>
          <Label>
            选择候选项
            <span className="ml-2 text-muted-foreground">已选 {selected.size}</span>
          </Label>
          <div className="mt-2 grid max-h-64 grid-cols-2 gap-2 overflow-y-auto pr-1">
            {options.map((o) => {
              const active = selected.has(o.id);
              return (
                <button
                  key={o.id}
                  onClick={() => toggle(o.id)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-all",
                    active
                      ? "border-primary bg-primary/8"
                      : "border-border bg-card/60 hover:bg-muted",
                  )}
                >
                  <span className="text-xl">{o.emoji}</span>
                  <span className="flex-1 truncate">{o.name}</span>
                  {active && <Check className="size-4 text-primary" />}
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            取消
          </Button>
          <Button
            variant="brand"
            className="flex-1"
            onClick={create}
            disabled={submitting}
          >
            {submitting ? "创建中…" : "创建并分享"}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
