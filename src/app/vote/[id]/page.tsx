"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Vote, Users, Link2, Lock, Trophy, Check } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Confetti } from "@/components/confetti";
import { useToast } from "@/components/ui/toast";
import { api } from "@/lib/client";
import { cn } from "@/lib/utils";
import type { VoteSession } from "@/lib/types";

export default function VoteDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { toast } = useToast();
  const [session, setSession] = React.useState<VoteSession | null>(null);
  const [voter, setVoter] = React.useState("");
  const [nameInput, setNameInput] = React.useState("");
  const [myVote, setMyVote] = React.useState<number | null>(null);
  const [notFound, setNotFound] = React.useState(false);

  React.useEffect(() => {
    // Sync identity from localStorage after mount to avoid SSR hydration mismatch.
    const stored = localStorage.getItem("lunch-voter-name");
    const mv = localStorage.getItem(`lunch-vote-${id}`);
    /* eslint-disable react-hooks/set-state-in-effect */
    if (stored) setVoter(stored);
    if (mv) setMyVote(Number(mv));
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [id]);

  const refresh = React.useCallback(() => {
    api
      .getVoteSession(id)
      .then(setSession)
      .catch(() => setNotFound(true));
  }, [id]);

  React.useEffect(() => {
    refresh();
    const t = setInterval(refresh, 3000);
    return () => clearInterval(t);
  }, [refresh]);

  const saveName = () => {
    const n = nameInput.trim();
    if (!n) return;
    localStorage.setItem("lunch-voter-name", n);
    setVoter(n);
  };

  const vote = async (candidateId: number) => {
    if (!session || session.status !== "open") return;
    try {
      const updated = await api.castVote(id, candidateId, voter);
      setSession(updated);
      setMyVote(candidateId);
      localStorage.setItem(`lunch-vote-${id}`, String(candidateId));
      toast("投票成功！", "success");
    } catch (e) {
      toast(e instanceof Error ? e.message : "投票失败", "error");
    }
  };

  const close = async () => {
    if (!confirm("确定结束投票？结束后将无法继续投票。")) return;
    try {
      setSession(await api.closeVoteSession(id));
      toast("投票已结束", "success");
    } catch (e) {
      toast(e instanceof Error ? e.message : "操作失败", "error");
    }
  };

  const share = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      toast("链接已复制，发给小伙伴吧", "success");
    } catch {
      toast(url, "info");
    }
  };

  if (notFound) {
    return (
      <div>
        <PageHeader title="投票不存在" backHref="/vote" />
        <Card className="p-12 text-center text-muted-foreground">
          该投票可能已被删除
        </Card>
      </div>
    );
  }

  if (!session) {
    return (
      <div>
        <PageHeader title="加载中…" backHref="/vote" />
      </div>
    );
  }

  const total = session.candidates.reduce((a, c) => a + c.votes, 0);
  const sorted = [...session.candidates].sort((a, b) => b.votes - a.votes);
  const closed = session.status === "closed";
  const winner = closed && total > 0 ? sorted[0] : null;

  return (
    <div>
      {winner && <Confetti fireKey={`winner-${winner.id}`} />}
      <PageHeader
        title={session.title}
        description={`${session.candidates.length} 个候选 · 共 ${total} 票`}
        icon={<Vote className="size-5" />}
        backHref="/vote"
      />

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <Badge variant={closed ? "secondary" : "accent"}>
          {closed ? "已结束" : "进行中"}
        </Badge>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" size="sm" onClick={share}>
            <Link2 className="size-4" />
            分享链接
          </Button>
          {!closed && (
            <Button variant="outline" size="sm" onClick={close}>
              <Lock className="size-4" />
              结束投票
            </Button>
          )}
        </div>
      </div>

      {!voter && !closed ? (
        <Card className="mx-auto max-w-md p-6">
          <Label>先输入你的名字再投票</Label>
          <div className="mt-2 flex gap-2">
            <Input
              value={nameInput}
              placeholder="你的昵称"
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && saveName()}
            />
            <Button variant="brand" onClick={saveName}>
              确定
            </Button>
          </div>
        </Card>
      ) : null}

      {winner && (
        <Card className="mb-5 border-primary/40 bg-primary/5 p-6 text-center">
          <div className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
            <Trophy className="size-4" />
            投票冠军
          </div>
          <div className="mt-2 text-5xl">{winner.emoji}</div>
          <div className="mt-1 text-2xl font-bold">{winner.name}</div>
          <div className="text-sm text-muted-foreground">{winner.votes} 票</div>
        </Card>
      )}

      <div className="space-y-3">
        {sorted.map((c) => {
          const pct = total > 0 ? Math.round((c.votes / total) * 100) : 0;
          const mine = myVote === c.id;
          return (
            <button
              key={c.id}
              onClick={() => vote(c.id)}
              disabled={closed || !voter}
              className={cn(
                "relative w-full overflow-hidden rounded-xl border p-4 text-left transition-all",
                mine ? "border-primary" : "border-border",
                !closed && voter
                  ? "hover:border-primary hover:shadow-sm"
                  : "cursor-default",
              )}
            >
              <motion.div
                className="absolute inset-y-0 left-0 -z-10 bg-gradient-to-r from-primary/15 to-accent/10"
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.5 }}
              />
              <div className="flex items-center gap-3">
                <span className="text-3xl">{c.emoji}</span>
                <span className="flex-1 font-semibold">{c.name}</span>
                {mine && (
                  <Badge variant="default" className="gap-1">
                    <Check className="size-3" /> 我投了
                  </Badge>
                )}
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Users className="size-3.5" />
                  {c.votes}
                </span>
                <span className="w-10 text-right font-bold tabular-nums">
                  {pct}%
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {!closed && voter && (
        <p className="mt-4 text-center text-sm text-muted-foreground">
          以「{voter}」的身份投票 · 点击其它选项可改票
        </p>
      )}
    </div>
  );
}
