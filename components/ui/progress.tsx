import * as React from "react";
import { cn } from "@/lib/utils";

type ProgressProps = React.HTMLAttributes<HTMLDivElement> & {
  value?: number;
};

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, ...props }, ref) => {
    const safeValue = Math.max(0, Math.min(value, 100));

    return (
      <div
        ref={ref}
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={safeValue}
        role="progressbar"
        className={cn("relative h-2.5 w-full overflow-hidden rounded-full bg-slate-200", className)}
        {...props}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 transition-all"
          style={{ width: `${safeValue}%` }}
        />
      </div>
    );
  },
);
Progress.displayName = "Progress";

export { Progress };
