import * as React from "react";
import { cn } from "@/lib/utils";

type Variant =
  | "default"
  | "brand"
  | "secondary"
  | "outline"
  | "ghost"
  | "destructive";
type Size = "sm" | "md" | "lg" | "icon";

const variants: Record<Variant, string> = {
  default:
    "bg-primary text-primary-foreground shadow-sm hover:brightness-105 active:brightness-95",
  brand:
    "bg-gradient-to-br from-brand-from via-brand-via to-brand-to text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 active:scale-[0.98]",
  secondary:
    "bg-secondary text-secondary-foreground hover:brightness-[0.97] active:brightness-95",
  outline:
    "border border-border bg-card/60 hover:bg-muted text-foreground backdrop-blur",
  ghost: "hover:bg-muted text-foreground",
  destructive:
    "bg-destructive text-destructive-foreground shadow-sm hover:brightness-105",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3 text-sm rounded-md gap-1.5",
  md: "h-11 px-5 text-sm rounded-lg gap-2",
  lg: "h-13 px-7 text-base rounded-xl gap-2",
  icon: "h-10 w-10 rounded-lg",
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-medium whitespace-nowrap transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none",
          variants[variant],
          sizes[size],
          className,
        )}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
