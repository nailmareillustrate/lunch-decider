import Link from "next/link";
import {
  CircleDot,
  Shuffle,
  Swords,
  Vote,
  HeartHandshake,
  BarChart3,
  Settings2,
  ArrowRight,
} from "lucide-react";
import { QuickPick } from "@/components/quick-pick";
import { listOptions, listCategories } from "@/lib/repo";

export const dynamic = "force-dynamic";

const MODES = [
  {
    href: "/decide/wheel",
    title: "幸运大转盘",
    desc: "转一转，把选择权交给命运",
    icon: CircleDot,
    accent: "from-orange-400 to-rose-500",
  },
  {
    href: "/decide/random",
    title: "随机推荐",
    desc: "按口味、价格、距离一键随机",
    icon: Shuffle,
    accent: "from-amber-400 to-orange-500",
  },
  {
    href: "/decide/pk",
    title: "PK 淘汰赛",
    desc: "两两对决，选出最想吃的那个",
    icon: Swords,
    accent: "from-rose-400 to-red-500",
  },
  {
    href: "/vote",
    title: "多人投票",
    desc: "团队点餐，少数服从多数",
    icon: Vote,
    accent: "from-emerald-400 to-teal-500",
  },
  {
    href: "/decide/mood",
    title: "心情筛选",
    desc: "今天想吃辣的？清淡的？随心选",
    icon: HeartHandshake,
    accent: "from-fuchsia-400 to-pink-500",
  },
  {
    href: "/history",
    title: "历史与统计",
    desc: "回顾吃过什么，发现你的口味",
    icon: BarChart3,
    accent: "from-sky-400 to-indigo-500",
  },
] as const;

export default function Home() {
  const options = listOptions(false);
  const categories = listCategories();

  return (
    <div className="space-y-12">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-border bg-card/50 px-6 py-14 text-center shadow-sm sm:px-10 sm:py-20">
        <div className="pointer-events-none absolute -right-10 -top-10 text-[10rem] opacity-10 sm:text-[14rem]">
          🍜
        </div>
        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-4 py-1.5 text-sm text-muted-foreground backdrop-blur">
            🥢 已收录 {options.length} 种美食 · {categories.length} 个分类
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl text-balance text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl">
            今天中午
            <span className="bg-gradient-to-r from-brand-from via-brand-via to-brand-to bg-clip-text text-transparent">
              吃什么？
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-base text-muted-foreground sm:text-lg">
            选择困难症的终极解药。转盘、随机、PK、投票、心情筛选，
            <br className="hidden sm:block" />
            总有一种方式帮你做决定。
          </p>
          <div className="mt-8 flex justify-center">
            <QuickPick />
          </div>
        </div>
      </section>

      {/* Mode grid */}
      <section>
        <div className="mb-5 flex items-end justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight">选一种决策方式</h2>
            <p className="text-sm text-muted-foreground">六种玩法，总有一款治好你</p>
          </div>
          <Link
            href="/manage"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card/60 px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <Settings2 className="size-4" />
            管理菜单
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MODES.map((m) => {
            const Icon = m.icon;
            return (
              <Link
                key={m.href}
                href={m.href}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                <div
                  className={`grid size-12 place-items-center rounded-xl bg-gradient-to-br ${m.accent} text-white shadow-md`}
                >
                  <Icon className="size-6" />
                </div>
                <h3 className="mt-4 text-lg font-semibold tracking-tight">
                  {m.title}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">{m.desc}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                  开始 <ArrowRight className="size-4" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
