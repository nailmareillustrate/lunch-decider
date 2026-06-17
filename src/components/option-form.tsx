"use client";

import * as React from "react";
import { Input, Textarea, Select, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  SOURCES,
  SOURCE_LABELS,
  type FoodOption,
  type OptionInput,
} from "@/lib/types";

const EMPTY: OptionInput = {
  name: "",
  emoji: "🍽️",
  description: "",
  category: "",
  price: 2,
  spicy: 0,
  source: "either",
  tags: [],
  imageUrl: null,
  active: true,
  weight: 1,
};

function Segmented({
  options,
  value,
  onChange,
}: {
  options: { value: number; label: string }[];
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex gap-2">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
            value === o.value
              ? "border-transparent bg-primary text-primary-foreground"
              : "border-border bg-card/60 text-muted-foreground hover:bg-muted"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function OptionForm({
  initial,
  categories,
  onSubmit,
  onCancel,
  submitting,
}: {
  initial?: FoodOption;
  categories: string[];
  onSubmit: (input: OptionInput) => void;
  onCancel: () => void;
  submitting: boolean;
}) {
  const [form, setForm] = React.useState<OptionInput>(() =>
    initial
      ? {
          name: initial.name,
          emoji: initial.emoji,
          description: initial.description,
          category: initial.category,
          price: initial.price,
          spicy: initial.spicy,
          source: initial.source,
          tags: initial.tags,
          imageUrl: initial.imageUrl,
          active: initial.active,
          weight: initial.weight,
        }
      : EMPTY,
  );
  const [tagText, setTagText] = React.useState(
    (initial?.tags ?? []).join(" "),
  );

  const set = <K extends keyof OptionInput>(k: K, v: OptionInput[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const tags = tagText
      .split(/[\s,，、]+/)
      .map((t) => t.trim())
      .filter(Boolean)
      .slice(0, 12);
    onSubmit({ ...form, tags, imageUrl: form.imageUrl || null });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-[5rem_1fr] gap-3">
        <div>
          <Label>图标</Label>
          <Input
            className="mt-1.5 text-center text-xl"
            value={form.emoji}
            maxLength={4}
            onChange={(e) => set("emoji", e.target.value)}
          />
        </div>
        <div>
          <Label>名称 *</Label>
          <Input
            className="mt-1.5"
            value={form.name}
            required
            placeholder="例如：黄焖鸡米饭"
            onChange={(e) => set("name", e.target.value)}
          />
        </div>
      </div>

      <div>
        <Label>分类 *</Label>
        <Input
          className="mt-1.5"
          value={form.category}
          required
          list="category-options"
          placeholder="例如：中式快餐"
          onChange={(e) => set("category", e.target.value)}
        />
        <datalist id="category-options">
          {categories.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </div>

      <div>
        <Label>描述</Label>
        <Textarea
          className="mt-1.5"
          value={form.description}
          placeholder="一句话介绍这道菜的特点"
          onChange={(e) => set("description", e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>价格</Label>
          <div className="mt-1.5">
            <Segmented
              value={form.price}
              onChange={(v) => set("price", v)}
              options={[
                { value: 1, label: "¥" },
                { value: 2, label: "¥¥" },
                { value: 3, label: "¥¥¥" },
              ]}
            />
          </div>
        </div>
        <div>
          <Label>辣度</Label>
          <div className="mt-1.5">
            <Segmented
              value={form.spicy}
              onChange={(v) => set("spicy", v)}
              options={[
                { value: 0, label: "不辣" },
                { value: 1, label: "🌶️" },
                { value: 2, label: "🌶️🌶️" },
                { value: 3, label: "🌶️🌶️🌶️" },
              ]}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>就餐方式</Label>
          <Select
            className="mt-1.5"
            value={form.source}
            onChange={(e) =>
              set("source", e.target.value as OptionInput["source"])
            }
          >
            {SOURCES.map((s) => (
              <option key={s} value={s}>
                {SOURCE_LABELS[s]}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label>权重（越大越容易被选中）</Label>
          <Input
            className="mt-1.5"
            type="number"
            min={1}
            max={10}
            value={form.weight}
            onChange={(e) => set("weight", Number(e.target.value) || 1)}
          />
        </div>
      </div>

      <div>
        <Label>标签（空格或逗号分隔）</Label>
        <Input
          className="mt-1.5"
          value={tagText}
          placeholder="例如：米饭 下饭 鸡肉"
          onChange={(e) => setTagText(e.target.value)}
        />
      </div>

      <div>
        <Label>图片链接（可选）</Label>
        <Input
          className="mt-1.5"
          value={form.imageUrl ?? ""}
          placeholder="https://..."
          onChange={(e) => set("imageUrl", e.target.value || null)}
        />
      </div>

      <label className="flex cursor-pointer items-center justify-between rounded-lg border border-border bg-card/40 px-4 py-3">
        <span className="text-sm font-medium">启用（参与随机/转盘等抽选）</span>
        <input
          type="checkbox"
          checked={form.active}
          onChange={(e) => set("active", e.target.checked)}
          className="size-5 accent-[var(--color-primary)]"
        />
      </label>

      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={onCancel}
        >
          取消
        </Button>
        <Button type="submit" variant="brand" className="flex-1" disabled={submitting}>
          {submitting ? "保存中…" : "保存"}
        </Button>
      </div>
    </form>
  );
}
