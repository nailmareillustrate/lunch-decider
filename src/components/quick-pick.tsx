"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Dices } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResultOverlay } from "@/components/result-overlay";
import { useToast } from "@/components/ui/toast";
import { api } from "@/lib/client";
import type { FoodOption } from "@/lib/types";

export function QuickPick() {
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<FoodOption | null>(null);
  const [open, setOpen] = React.useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const option = await api.decide({}, "random");
      setResult(option);
      setOpen(true);
    } catch (e) {
      toast(e instanceof Error ? e.message : "出错了", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button
          variant="brand"
          size="lg"
          className="h-14 px-8 text-base"
          onClick={run}
          disabled={loading}
        >
          <Dices className={loading ? "size-5 animate-spin" : "size-5"} />
          {loading ? "正在帮你选…" : "手气不错，随便给我来一个"}
        </Button>
      </motion.div>
      <ResultOverlay
        option={result}
        open={open}
        onClose={() => setOpen(false)}
        onRetry={run}
      />
    </>
  );
}
