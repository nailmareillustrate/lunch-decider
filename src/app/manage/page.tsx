"use client";

import * as React from "react";
import { Settings2, Plus, Pencil, Trash2, Search, EyeOff } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { OptionForm } from "@/components/option-form";
import { OptionMeta } from "@/components/option-meta";
import { useToast } from "@/components/ui/toast";
import { useMeta } from "@/components/use-meta";
import { api } from "@/lib/client";
import { cn } from "@/lib/utils";
import type { FoodOption, OptionInput } from "@/lib/types";

export default function ManagePage() {
  const { toast } = useToast();
  const { categories, reload: reloadMeta } = useMeta();
  const [options, setOptions] = React.useState<FoodOption[]>([]);
  const [query, setQuery] = React.useState("");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<FoodOption | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  const load = React.useCallback(() => {
    api.listOptions().then(setOptions).catch((e) => toast(e.message, "error"));
  }, [toast]);

  React.useEffect(() => {
    load();
  }, [load]);

  const filtered = options.filter((o) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      o.name.toLowerCase().includes(q) ||
      o.category.toLowerCase().includes(q) ||
      o.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };
  const openEdit = (o: FoodOption) => {
    setEditing(o);
    setDialogOpen(true);
  };

  const save = async (input: OptionInput) => {
    setSubmitting(true);
    try {
      if (editing) {
        await api.updateOption(editing.id, input);
        toast("已更新", "success");
      } else {
        await api.createOption(input);
        toast("已添加", "success");
      }
      setDialogOpen(false);
      load();
      reloadMeta();
    } catch (e) {
      toast(e instanceof Error ? e.message : "保存失败", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (o: FoodOption) => {
    if (!confirm(`确定删除「${o.name}」？`)) return;
    try {
      await api.deleteOption(o.id);
      toast("已删除", "success");
      load();
      reloadMeta();
    } catch (e) {
      toast(e instanceof Error ? e.message : "删除失败", "error");
    }
  };

  const toggleActive = async (o: FoodOption) => {
    try {
      await api.updateOption(o.id, { ...o, active: !o.active });
      load();
    } catch (e) {
      toast(e instanceof Error ? e.message : "操作失败", "error");
    }
  };

  return (
    <div>
      <PageHeader
        title="管理菜单"
        description="增删改你的美食库，所有决策都从这里取材"
        icon={<Settings2 className="size-5" />}
      />

      <div className="mb-5 flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="搜索名称、分类或标签…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Button variant="brand" onClick={openCreate}>
          <Plus className="size-4" />
          添加美食
        </Button>
      </div>

      {filtered.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground">
          {options.length === 0 ? "还没有任何美食，点击右上角添加" : "没有匹配的结果"}
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((o) => (
            <Card
              key={o.id}
              className={cn(
                "group relative flex flex-col p-4 transition-all hover:shadow-md",
                !o.active && "opacity-60",
              )}
            >
              <div className="flex items-start gap-3">
                <span className="text-4xl">{o.emoji}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h3 className="truncate font-semibold">{o.name}</h3>
                    {!o.active && (
                      <EyeOff className="size-3.5 shrink-0 text-muted-foreground" />
                    )}
                  </div>
                  {o.description && (
                    <p className="line-clamp-1 text-xs text-muted-foreground">
                      {o.description}
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-3">
                <OptionMeta option={o} />
              </div>
              <div className="mt-4 flex items-center justify-between gap-2 border-t border-border/60 pt-3">
                <button
                  onClick={() => toggleActive(o)}
                  className="text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  {o.active ? "停用" : "启用"}
                </button>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(o)}>
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => remove(o)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={editing ? "编辑美食" : "添加美食"}
        description={editing ? `修改「${editing.name}」的信息` : "把一个新选项加入你的美食库"}
      >
        <OptionForm
          key={editing?.id ?? "new"}
          initial={editing ?? undefined}
          categories={categories}
          onSubmit={save}
          onCancel={() => setDialogOpen(false)}
          submitting={submitting}
        />
      </Dialog>
    </div>
  );
}
