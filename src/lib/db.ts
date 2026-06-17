import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

/**
 * Singleton SQLite connection. We cache it on globalThis so the Next.js dev
 * server doesn't open a new handle on every hot reload.
 */
declare global {
  var __lunchDb: Database.Database | undefined;
}

function resolveDbPath(): string {
  const dir = process.env.LUNCH_DB_DIR ?? path.join(process.cwd(), "data");
  fs.mkdirSync(dir, { recursive: true });
  return path.join(dir, "lunch.sqlite");
}

function migrate(db: Database.Database) {
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  db.exec(`
    CREATE TABLE IF NOT EXISTS options (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT NOT NULL,
      emoji       TEXT NOT NULL DEFAULT '🍽️',
      description TEXT NOT NULL DEFAULT '',
      category    TEXT NOT NULL,
      price       INTEGER NOT NULL DEFAULT 2,
      spicy       INTEGER NOT NULL DEFAULT 0,
      source      TEXT NOT NULL DEFAULT 'either',
      tags        TEXT NOT NULL DEFAULT '[]',
      image_url   TEXT,
      active      INTEGER NOT NULL DEFAULT 1,
      weight      INTEGER NOT NULL DEFAULT 1,
      created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS history (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      option_id   INTEGER NOT NULL REFERENCES options(id) ON DELETE CASCADE,
      mode        TEXT NOT NULL,
      note        TEXT,
      decided_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS vote_sessions (
      id          TEXT PRIMARY KEY,
      title       TEXT NOT NULL,
      status      TEXT NOT NULL DEFAULT 'open',
      created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS vote_candidates (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id  TEXT NOT NULL REFERENCES vote_sessions(id) ON DELETE CASCADE,
      option_id   INTEGER REFERENCES options(id) ON DELETE SET NULL,
      name        TEXT NOT NULL,
      emoji       TEXT NOT NULL DEFAULT '🍽️'
    );

    CREATE TABLE IF NOT EXISTS votes (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id   TEXT NOT NULL REFERENCES vote_sessions(id) ON DELETE CASCADE,
      candidate_id INTEGER NOT NULL REFERENCES vote_candidates(id) ON DELETE CASCADE,
      voter        TEXT NOT NULL,
      created_at   TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(session_id, voter)
    );

    CREATE INDEX IF NOT EXISTS idx_history_option ON history(option_id);
    CREATE INDEX IF NOT EXISTS idx_candidates_session ON vote_candidates(session_id);
    CREATE INDEX IF NOT EXISTS idx_votes_session ON votes(session_id);
  `);
}

interface SeedRow {
  name: string;
  emoji: string;
  description: string;
  category: string;
  price: number;
  spicy: number;
  source: string;
  tags: string[];
  weight?: number;
}

const SEED: SeedRow[] = [
  { name: "黄焖鸡米饭", emoji: "🍗", description: "下饭神器，量大管饱", category: "中式快餐", price: 2, spicy: 1, source: "either", tags: ["米饭", "鸡肉", "下饭"] },
  { name: "兰州牛肉面", emoji: "🍜", description: "一清二白三红四绿五黄", category: "面食", price: 1, spicy: 1, source: "dine_in", tags: ["面", "牛肉", "汤"] },
  { name: "麦当劳", emoji: "🍔", description: "快速、稳定、不会出错", category: "西式快餐", price: 2, spicy: 0, source: "either", tags: ["汉堡", "薯条", "快"] },
  { name: "沙县小吃", emoji: "🥟", description: "国民食堂，啥都有", category: "中式快餐", price: 1, spicy: 0, source: "either", tags: ["馄饨", "拌面", "实惠"] },
  { name: "日式寿司", emoji: "🍣", description: "清爽不油腻", category: "日料", price: 3, spicy: 0, source: "either", tags: ["生鱼", "清淡", "精致"] },
  { name: "麻辣香锅", emoji: "🌶️", description: "自选食材，麻辣过瘾", category: "川菜", price: 2, spicy: 3, source: "dine_in", tags: ["辣", "自选", "重口"] },
  { name: "轻食沙拉", emoji: "🥗", description: "健康低卡，减脂首选", category: "健康轻食", price: 2, spicy: 0, source: "takeout", tags: ["健康", "低卡", "蔬菜"] },
  { name: "韩式炸鸡", emoji: "🍗", description: "外酥里嫩配啤酒", category: "韩餐", price: 3, spicy: 1, source: "takeout", tags: ["炸鸡", "重口", "聚餐"] },
  { name: "螺蛳粉", emoji: "🍲", description: "闻起来臭吃起来香", category: "面食", price: 2, spicy: 2, source: "either", tags: ["粉", "酸辣", "重口"] },
  { name: "盖浇饭", emoji: "🍛", description: "经典工作日午餐", category: "中式快餐", price: 1, spicy: 1, source: "either", tags: ["米饭", "实惠", "快"] },
  { name: "麻辣烫", emoji: "🥘", description: "自选菜，按需取量", category: "川菜", price: 2, spicy: 2, source: "either", tags: ["辣", "自选", "汤"] },
  { name: "披萨", emoji: "🍕", description: "适合多人分享", category: "西式快餐", price: 3, spicy: 0, source: "takeout", tags: ["芝士", "聚餐", "分享"] },
  { name: "泰式冬阴功", emoji: "🦐", description: "酸辣开胃东南亚风味", category: "东南亚", price: 3, spicy: 2, source: "dine_in", tags: ["酸辣", "海鲜", "异域"] },
  { name: "煲仔饭", emoji: "🍚", description: "锅巴香脆，腊味十足", category: "粤菜", price: 2, spicy: 0, source: "dine_in", tags: ["米饭", "腊味", "锅巴"] },
  { name: "重庆小面", emoji: "🍜", description: "麻辣鲜香，一碗满足", category: "面食", price: 1, spicy: 3, source: "either", tags: ["面", "辣", "快"] },
  { name: "日式拉面", emoji: "🍜", description: "浓汤厚味，叉烧溏心蛋", category: "日料", price: 3, spicy: 0, source: "dine_in", tags: ["面", "汤", "叉烧"] },
  { name: "粥铺套餐", emoji: "🥣", description: "暖胃清淡，肠胃友好", category: "健康轻食", price: 1, spicy: 0, source: "either", tags: ["粥", "清淡", "养胃"] },
  { name: "烤肉饭", emoji: "🥩", description: "照烧风味，肉香四溢", category: "日料", price: 2, spicy: 0, source: "takeout", tags: ["米饭", "烤肉", "照烧"] },
  { name: "酸菜鱼", emoji: "🐟", description: "酸辣鲜嫩，鱼片滑嫩", category: "川菜", price: 3, spicy: 2, source: "dine_in", tags: ["鱼", "酸辣", "聚餐"] },
  { name: "三明治", emoji: "🥪", description: "随手带走，方便快捷", category: "健康轻食", price: 1, spicy: 0, source: "takeout", tags: ["面包", "快", "轻食"] },
];

function seedIfEmpty(db: Database.Database) {
  const count = db.prepare("SELECT COUNT(*) AS c FROM options").get() as {
    c: number;
  };
  if (count.c > 0) return;

  const insert = db.prepare(`
    INSERT INTO options (name, emoji, description, category, price, spicy, source, tags, weight)
    VALUES (@name, @emoji, @description, @category, @price, @spicy, @source, @tags, @weight)
  `);
  const tx = db.transaction((rows: SeedRow[]) => {
    for (const r of rows) {
      insert.run({
        ...r,
        tags: JSON.stringify(r.tags),
        weight: r.weight ?? 1,
      });
    }
  });
  tx(SEED);
}

export function getDb(): Database.Database {
  if (global.__lunchDb) return global.__lunchDb;
  const db = new Database(resolveDbPath());
  migrate(db);
  seedIfEmpty(db);
  global.__lunchDb = db;
  return db;
}
