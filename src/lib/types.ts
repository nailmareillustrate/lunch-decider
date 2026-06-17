import { z } from "zod";

export const SOURCES = ["dine_in", "takeout", "either"] as const;
export type Source = (typeof SOURCES)[number];

export const SOURCE_LABELS: Record<Source, string> = {
  dine_in: "堂食",
  takeout: "外卖",
  either: "皆可",
};

export const DECISION_MODES = [
  "wheel",
  "random",
  "pk",
  "vote",
  "mood",
  "manual",
] as const;
export type DecisionMode = (typeof DECISION_MODES)[number];

export const MODE_LABELS: Record<DecisionMode, string> = {
  wheel: "转盘",
  random: "随机",
  pk: "PK 淘汰赛",
  vote: "投票",
  mood: "心情筛选",
  manual: "手动",
};

export interface FoodOption {
  id: number;
  name: string;
  emoji: string;
  description: string;
  category: string;
  price: number; // 1..3
  spicy: number; // 0..3
  source: Source;
  tags: string[];
  imageUrl: string | null;
  active: boolean;
  weight: number; // selection weight, default 1
  createdAt: string;
}

export interface HistoryEntry {
  id: number;
  optionId: number;
  optionName: string;
  optionEmoji: string;
  mode: DecisionMode;
  note: string | null;
  decidedAt: string;
}

export interface VoteSession {
  id: string;
  title: string;
  status: "open" | "closed";
  createdAt: string;
  candidates: VoteCandidate[];
}

export interface VoteCandidate {
  id: number;
  sessionId: string;
  optionId: number | null;
  name: string;
  emoji: string;
  votes: number;
}

/* ----------------------------- Zod schemas ----------------------------- */

export const optionInputSchema = z.object({
  name: z.string().trim().min(1, "名称必填").max(60),
  emoji: z.string().trim().max(8).default("🍽️"),
  description: z.string().trim().max(280).default(""),
  category: z.string().trim().min(1).max(40),
  price: z.coerce.number().int().min(1).max(3).default(2),
  spicy: z.coerce.number().int().min(0).max(3).default(0),
  source: z.enum(SOURCES).default("either"),
  tags: z.array(z.string().trim().min(1).max(20)).max(12).default([]),
  imageUrl: z.string().trim().url().or(z.literal("")).nullable().default(null),
  active: z.boolean().default(true),
  weight: z.coerce.number().int().min(1).max(10).default(1),
});
export type OptionInput = z.infer<typeof optionInputSchema>;

export const filterSchema = z.object({
  categories: z.array(z.string()).default([]),
  sources: z.array(z.enum(SOURCES)).default([]),
  maxPrice: z.coerce.number().int().min(1).max(3).optional(),
  maxSpicy: z.coerce.number().int().min(0).max(3).optional(),
  tags: z.array(z.string()).default([]),
  excludeRecent: z.coerce.boolean().default(false),
  recentWindow: z.coerce.number().int().min(0).max(50).default(5),
});
export type DecisionFilter = z.infer<typeof filterSchema>;

export const voteSessionInputSchema = z.object({
  title: z.string().trim().min(1).max(80).default("午餐投票"),
  candidates: z
    .array(
      z.object({
        optionId: z.number().int().nullable().default(null),
        name: z.string().trim().min(1).max(60),
        emoji: z.string().trim().max(8).default("🍽️"),
      }),
    )
    .min(2, "至少需要 2 个候选项")
    .max(12),
});
export type VoteSessionInput = z.infer<typeof voteSessionInputSchema>;
