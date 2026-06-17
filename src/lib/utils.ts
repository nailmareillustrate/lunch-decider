import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function shuffle<T>(arr: readonly T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const PRICE_LABELS = ["", "¥", "¥¥", "¥¥¥"] as const;
export function priceLabel(level: number): string {
  return PRICE_LABELS[Math.max(0, Math.min(3, level))] ?? "¥";
}

export function classNames(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(" ");
}
