"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastKind = "success" | "error" | "info";
interface Toast {
  id: number;
  message: string;
  kind: ToastKind;
}

interface ToastCtx {
  toast: (message: string, kind?: ToastKind) => void;
}

const Ctx = React.createContext<ToastCtx | null>(null);

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
} as const;

const accents: Record<ToastKind, string> = {
  success: "text-accent",
  error: "text-destructive",
  info: "text-primary",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);
  const counter = React.useRef(0);

  const toast = React.useCallback(
    (message: string, kind: ToastKind = "info") => {
      const id = ++counter.current;
      setToasts((t) => [...t, { id, message, kind }]);
      setTimeout(() => {
        setToasts((t) => t.filter((x) => x.id !== id));
      }, 3200);
    },
    [],
  );

  const dismiss = (id: number) =>
    setToasts((t) => t.filter((x) => x.id !== id));

  return (
    <Ctx.Provider value={{ toast }}>
      {children}
      <div className="pointer-events-none fixed bottom-5 right-5 z-100 flex w-[min(92vw,22rem)] flex-col gap-2">
        <AnimatePresence>
          {toasts.map((t) => {
            const Icon = icons[t.kind];
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: 24, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 32, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
                className="pointer-events-auto flex items-start gap-3 rounded-xl border border-border bg-card/95 p-3.5 shadow-lg backdrop-blur"
              >
                <Icon className={cn("mt-0.5 size-5 shrink-0", accents[t.kind])} />
                <p className="flex-1 text-sm leading-snug">{t.message}</p>
                <button
                  onClick={() => dismiss(t.id)}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                  aria-label="关闭"
                >
                  <X className="size-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </Ctx.Provider>
  );
}

export function useToast() {
  const ctx = React.useContext(Ctx);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
