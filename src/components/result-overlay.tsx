"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, RotateCcw, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OptionMeta } from "@/components/option-meta";
import { Confetti } from "@/components/confetti";
import type { FoodOption } from "@/lib/types";

export function ResultOverlay({
  option,
  open,
  onClose,
  onRetry,
  retryLabel = "再来一次",
}: {
  option: FoodOption | null;
  open: boolean;
  onClose: () => void;
  onRetry?: () => void;
  retryLabel?: string;
}) {
  return (
    <AnimatePresence>
      {open && option && (
        <>
          <Confetti fireKey={option.id} />
          <motion.div
            className="fixed inset-0 z-95 grid place-items-center bg-black/50 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 10 }}
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
              className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card p-8 text-center shadow-2xl"
            >
              <button
                onClick={onClose}
                className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
                aria-label="关闭"
              >
                <X className="size-5" />
              </button>
              <div className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-primary/12 px-3 py-1 text-xs font-medium text-primary">
                <Sparkles className="size-3.5" />
                就决定是你了！
              </div>
              <motion.div
                className="my-4 text-7xl"
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 12, delay: 0.1 }}
              >
                {option.emoji}
              </motion.div>
              <h2 className="text-3xl font-bold tracking-tight">{option.name}</h2>
              {option.description && (
                <p className="mx-auto mt-2 max-w-xs text-sm text-muted-foreground">
                  {option.description}
                </p>
              )}
              <div className="mt-4 flex justify-center">
                <OptionMeta option={option} />
              </div>
              <div className="mt-7 flex gap-3">
                {onRetry && (
                  <Button
                    variant="outline"
                    size="lg"
                    className="flex-1"
                    onClick={onRetry}
                  >
                    <RotateCcw className="size-4" />
                    {retryLabel}
                  </Button>
                )}
                <Button
                  variant="brand"
                  size="lg"
                  className="flex-1"
                  onClick={onClose}
                >
                  <Check className="size-4" />
                  就这个！
                </Button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
