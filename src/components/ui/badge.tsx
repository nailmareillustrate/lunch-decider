import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "default" | "secondary" | "outline" | "accent" | "spicy";

const variants: Record<Variant, string> = {
  default: "bg-primary/12 text-primary border-transparent",
  secondary: "bg-secondary text-secondary-foreground border-transparent",
  outline: "border-border text-muted-foreground",
  accent: "bg-accent/15 text-accent border-transparent",
  spicy: "bg-destructive/12 text-destructive border-transparent",
};

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: Variant }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
