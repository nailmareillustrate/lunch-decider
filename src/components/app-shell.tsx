"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  UtensilsCrossed,
  Vote,
  History,
  Settings2,
  Moon,
  Sun,
  Home,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeProvider, useTheme } from "@/components/theme-provider";
import { ToastProvider } from "@/components/ui/toast";

const NAV = [
  { href: "/", label: "首页", icon: Home },
  { href: "/vote", label: "投票", icon: Vote },
  { href: "/history", label: "历史", icon: History },
  { href: "/manage", label: "管理", icon: Settings2 },
] as const;

function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      aria-label="切换主题"
      className="relative grid size-10 place-items-center rounded-lg border border-border bg-card/60 text-foreground transition-colors hover:bg-muted"
    >
      {theme === "dark" ? (
        <Moon className="size-5" />
      ) : (
        <Sun className="size-5" />
      )}
    </button>
  );
}

function Header() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-brand-from via-brand-via to-brand-to text-white shadow-md shadow-primary/30">
            <UtensilsCrossed className="size-5" />
          </span>
          <span className="text-base font-semibold tracking-tight">
            今天吃什么
          </span>
        </Link>

        <nav className="ml-auto flex items-center gap-1">
          {NAV.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 -z-10 rounded-lg bg-muted"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <Icon className="size-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            );
          })}
          <span className="mx-1 h-6 w-px bg-border" />
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <div className="app-aurora flex min-h-dvh flex-col">
          <Header />
          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
            {children}
          </main>
          <footer className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
            今天吃什么 · 用多种方式终结你的选择困难症 🍜
          </footer>
        </div>
      </ToastProvider>
    </ThemeProvider>
  );
}
