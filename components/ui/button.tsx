import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "default" | "secondary" | "outline" | "ghost" | "destructive";
type ButtonSize = "default" | "sm" | "lg" | "icon";

type ButtonProps = React.ComponentProps<"button"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function buttonVariants({
  variant = "default",
  size = "default",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}) {
  return cn(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/40 focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
    variant === "default" && "bg-slate-950 text-white shadow-sm hover:bg-slate-800",
    variant === "secondary" && "bg-teal-600 text-white shadow-sm hover:bg-teal-500",
    variant === "outline" && "border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50",
    variant === "ghost" && "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
    variant === "destructive" && "bg-rose-600 text-white shadow-sm hover:bg-rose-500",
    size === "default" && "h-10 px-4 py-2",
    size === "sm" && "h-9 px-3 text-xs",
    size === "lg" && "h-11 px-5 text-sm",
    size === "icon" && "h-10 w-10",
    className,
  );
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, size = "default", type = "button", variant = "default", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={buttonVariants({ variant, size, className })}
      {...props}
    />
  ),
);
Button.displayName = "Button";

export { Button };
