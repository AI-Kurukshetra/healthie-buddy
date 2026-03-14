import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "secondary" | "success" | "warning" | "outline";

const badgeVariants: Record<BadgeVariant, string> = {
  default: "bg-slate-950 text-white",
  secondary: "bg-teal-100 text-teal-800",
  success: "bg-emerald-100 text-emerald-800",
  warning: "bg-amber-100 text-amber-800",
  outline: "border border-slate-200 bg-white text-slate-700",
};

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]",
        badgeVariants[variant],
        className,
      )}
      {...props}
    />
  );
}

export { Badge };
