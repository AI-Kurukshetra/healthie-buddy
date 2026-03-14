import * as React from "react";
import { cn } from "@/lib/utils";

const Select = React.forwardRef<HTMLSelectElement, React.ComponentProps<"select">>(
  ({ className, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        "flex h-11 w-full rounded-lg border border-slate-200 bg-white/95 px-3 py-2 text-sm text-slate-900 shadow-sm",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/40",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  ),
);
Select.displayName = "Select";

export { Select };
