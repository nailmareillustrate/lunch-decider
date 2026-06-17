import { getDb } from "./db";
import {
  type DecisionFilter,
  type DecisionMode,
  type FoodOption,
  type HistoryEntry,
  type OptionInput,
  type Source,
  type VoteCandidate,
  type VoteSession,
  type VoteSessionInput,
} from "./types";

interface OptionRow {
  id: number;
  name: string;
  emoji: string;
  description: string;
  category: string;
  price: number;
  spicy: number;
  source: string;
  tags: string;
  image_url: string | null;
  active: number;
  weight: number;
  created_at: string;
}

function mapOption(r: OptionRow): FoodOption {
  let tags: string[] = [];
  try {
    tags = JSON.parse(r.tags) as string[];
  } catch {
    tags = [];
  }
  return {
    id: r.id,
    name: r.name,
    emoji: r.emoji,
    description: r.description,
    category: r.category,
    price: r.price,
    spicy: r.spicy,
    source: r.source as Source,
    tags,
    imageUrl: r.image_url,
    active: r.active === 1,
    weight: r.weight,
    createdAt: r.created_at,
  };
}

export function listOptions(includeInactive = true): FoodOption[] {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT * FROM options ${includeInactive ? "" : "WHERE active = 1"} ORDER BY created_at DESC, id DESC`,
    )
    .all() as OptionRow[];
  return rows.map(mapOption);
}

export function getOption(id: number): FoodOption | null {
  const db = getDb();
  const row = db.prepare("SELECT * FROM options WHERE id = ?").get(id) as
    | OptionRow
    | undefined;
  return row ? mapOption(row) : null;
}

export function createOption(input: OptionInput): FoodOption {
  const db = getDb();
  const info = db
    .prepare(
      `INSERT INTO options (name, emoji, description, category, price, spicy, source, tags, image_url, active, weight)
       VALUES (@name, @emoji, @description, @category, @price, @spicy, @source, @tags, @image_url, @active, @weight)`,
    )
    .run({
      name: input.name,
      emoji: input.emoji || "🍽️",
      description: input.description,
      category: input.category,
      price: input.price,
      spicy: input.spicy,
      source: input.source,
      tags: JSON.stringify(input.tags),
      image_url: input.imageUrl || null,
      active: input.active ? 1 : 0,
      weight: input.weight,
    });
  return getOption(Number(info.lastInsertRowid))!;
}

export function updateOption(id: number, input: OptionInput): FoodOption | null {
  const db = getDb();
  const existing = getOption(id);
  if (!existing) return null;
  db.prepare(
    `UPDATE options SET name=@name, emoji=@emoji, description=@description,
       category=@category, price=@price, spicy=@spicy, source=@source,
       tags=@tags, image_url=@image_url, active=@active, weight=@weight
     WHERE id=@id`,
  ).run({
    id,
    name: input.name,
    emoji: input.emoji || "🍽️",
    description: input.description,
    category: input.category,
    price: input.price,
    spicy: input.spicy,
    source: input.source,
    tags: JSON.stringify(input.tags),
    image_url: input.imageUrl || null,
    active: input.active ? 1 : 0,
    weight: input.weight,
  });
  return getOption(id);
}

export function deleteOption(id: number): boolean {
  const db = getDb();
  const info = db.prepare("DELETE FROM options WHERE id = ?").run(id);
  return info.changes > 0;
}

export function listCategories(): string[] {
  const db = getDb();
  const rows = db
    .prepare("SELECT DISTINCT category FROM options ORDER BY category")
    .all() as { category: string }[];
  return rows.map((r) => r.category);
}

export function listTags(): string[] {
  const set = new Set<string>();
  for (const o of listOptions()) for (const t of o.tags) set.add(t);
  return [...set].sort();
}

function recentOptionIds(limit: number): Set<number> {
  if (limit <= 0) return new Set();
  const db = getDb();
  const rows = db
    .prepare("SELECT DISTINCT option_id FROM history ORDER BY decided_at DESC LIMIT ?")
    .all(limit) as { option_id: number }[];
  return new Set(rows.map((r) => r.option_id));
}

export function filterOptions(filter: DecisionFilter): FoodOption[] {
  let options = listOptions(false);

  if (filter.categories.length > 0) {
    const set = new Set(filter.categories);
    options = options.filter((o) => set.has(o.category));
  }
  if (filter.sources.length > 0) {
    const set = new Set<Source>(filter.sources);
    options = options.filter((o) => set.has(o.source) || o.source === "either");
  }
  if (filter.maxPrice !== undefined) {
    options = options.filter((o) => o.price <= filter.maxPrice!);
  }
  if (filter.maxSpicy !== undefined) {
    options = options.filter((o) => o.spicy <= filter.maxSpicy!);
  }
  if (filter.tags.length > 0) {
    const set = new Set(filter.tags);
    options = options.filter((o) => o.tags.some((t) => set.has(t)));
  }
  if (filter.excludeRecent) {
    const recent = recentOptionIds(filter.recentWindow);
    const trimmed = options.filter((o) => !recent.has(o.id));
    // Don't filter everything away — fall back if exclusion empties the pool.
    if (trimmed.length > 0) options = trimmed;
  }
  return options;
}

function weightedPick(options: FoodOption[]): FoodOption | null {
  if (options.length === 0) return null;
  const total = options.reduce((s, o) => s + Math.max(1, o.weight), 0);
  let r = Math.random() * total;
  for (const o of options) {
    r -= Math.max(1, o.weight);
    if (r <= 0) return o;
  }
  return options[options.length - 1];
}

export function decide(filter: DecisionFilter): FoodOption | null {
  return weightedPick(filterOptions(filter));
}

/* ------------------------------- History ------------------------------- */

interface HistoryRow {
  id: number;
  option_id: number;
  mode: string;
  note: string | null;
  decided_at: string;
  name: string;
  emoji: string;
}

export function recordHistory(
  optionId: number,
  mode: DecisionMode,
  note?: string,
): void {
  const db = getDb();
  db.prepare(
    "INSERT INTO history (option_id, mode, note) VALUES (?, ?, ?)",
  ).run(optionId, mode, note ?? null);
}

export function listHistory(limit = 100): HistoryEntry[] {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT h.id, h.option_id, h.mode, h.note, h.decided_at, o.name, o.emoji
       FROM history h JOIN options o ON o.id = h.option_id
       ORDER BY h.decided_at DESC, h.id DESC LIMIT ?`,
    )
    .all(limit) as HistoryRow[];
  return rows.map((r) => ({
    id: r.id,
    optionId: r.option_id,
    optionName: r.name,
    optionEmoji: r.emoji,
    mode: r.mode as DecisionMode,
    note: r.note,
    decidedAt: r.decided_at,
  }));
}

export function clearHistory(): void {
  getDb().prepare("DELETE FROM history").run();
}

export interface OptionStat {
  optionId: number;
  name: string;
  emoji: string;
  count: number;
}

export function topPicks(limit = 5): OptionStat[] {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT o.id AS optionId, o.name, o.emoji, COUNT(h.id) AS count
       FROM history h JOIN options o ON o.id = h.option_id
       GROUP BY h.option_id ORDER BY count DESC LIMIT ?`,
    )
    .all(limit) as OptionStat[];
  return rows;
}

/* -------------------------------- Voting -------------------------------- */

function shortId(): string {
  return Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-3);
}

export function createVoteSession(input: VoteSessionInput): VoteSession {
  const db = getDb();
  const id = shortId();
  const tx = db.transaction(() => {
    db.prepare(
      "INSERT INTO vote_sessions (id, title) VALUES (?, ?)",
    ).run(id, input.title);
    const insert = db.prepare(
      "INSERT INTO vote_candidates (session_id, option_id, name, emoji) VALUES (?, ?, ?, ?)",
    );
    for (const c of input.candidates) {
      insert.run(id, c.optionId, c.name, c.emoji || "🍽️");
    }
  });
  tx();
  return getVoteSession(id)!;
}

interface CandidateRow {
  id: number;
  session_id: string;
  option_id: number | null;
  name: string;
  emoji: string;
  votes: number;
}

export function getVoteSession(id: string): VoteSession | null {
  const db = getDb();
  const session = db
    .prepare("SELECT * FROM vote_sessions WHERE id = ?")
    .get(id) as
    | { id: string; title: string; status: string; created_at: string }
    | undefined;
  if (!session) return null;
  const candidates = db
    .prepare(
      `SELECT c.id, c.session_id, c.option_id, c.name, c.emoji,
              (SELECT COUNT(*) FROM votes v WHERE v.candidate_id = c.id) AS votes
       FROM vote_candidates c WHERE c.session_id = ? ORDER BY c.id`,
    )
    .all(id) as CandidateRow[];
  return {
    id: session.id,
    title: session.title,
    status: session.status as "open" | "closed",
    createdAt: session.created_at,
    candidates: candidates.map(
      (c): VoteCandidate => ({
        id: c.id,
        sessionId: c.session_id,
        optionId: c.option_id,
        name: c.name,
        emoji: c.emoji,
        votes: c.votes,
      }),
    ),
  };
}

export function listVoteSessions(limit = 30): VoteSession[] {
  const db = getDb();
  const rows = db
    .prepare("SELECT id FROM vote_sessions ORDER BY created_at DESC LIMIT ?")
    .all(limit) as { id: string }[];
  return rows.map((r) => getVoteSession(r.id)!).filter(Boolean);
}

export type CastVoteResult =
  | { ok: true; session: VoteSession }
  | { ok: false; error: string };

export function castVote(
  sessionId: string,
  candidateId: number,
  voter: string,
): CastVoteResult {
  const db = getDb();
  const session = getVoteSession(sessionId);
  if (!session) return { ok: false, error: "投票不存在" };
  if (session.status !== "open") return { ok: false, error: "投票已结束" };
  if (!session.candidates.some((c) => c.id === candidateId))
    return { ok: false, error: "候选项无效" };

  db.prepare(
    `INSERT INTO votes (session_id, candidate_id, voter) VALUES (?, ?, ?)
     ON CONFLICT(session_id, voter) DO UPDATE SET candidate_id = excluded.candidate_id, created_at = datetime('now')`,
  ).run(sessionId, candidateId, voter);
  return { ok: true, session: getVoteSession(sessionId)! };
}

export function closeVoteSession(id: string): VoteSession | null {
  const db = getDb();
  db.prepare("UPDATE vote_sessions SET status = 'closed' WHERE id = ?").run(id);
  return getVoteSession(id);
}
