"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

type DropdownMenuContextValue = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  menuRef: React.RefObject<HTMLDivElement | null>;
};

const DropdownMenuContext = React.createContext<DropdownMenuContextValue | null>(null);

function useDropdownMenuContext() {
  const context = React.useContext(DropdownMenuContext);

  if (!context) {
    throw new Error("DropdownMenu components must be used within DropdownMenu.");
  }

  return context;
}

function DropdownMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen, menuRef }}>
      <div ref={menuRef} className="relative inline-flex">
        {children}
      </div>
    </DropdownMenuContext.Provider>
  );
}

const DropdownMenuTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, onClick, type = "button", ...props }, ref) => {
    const { open, setOpen } = useDropdownMenuContext();

    return (
      <button
        ref={ref}
        aria-expanded={open}
        aria-haspopup="menu"
        className={className}
        type={type}
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented) {
            setOpen((current) => !current);
          }
        }}
        {...props}
      />
    );
  },
);
DropdownMenuTrigger.displayName = "DropdownMenuTrigger";

type DropdownMenuContentProps = React.HTMLAttributes<HTMLDivElement> & {
  align?: "start" | "end";
};

const DropdownMenuContent = React.forwardRef<HTMLDivElement, DropdownMenuContentProps>(
  ({ align = "end", className, ...props }, ref) => {
    const { open } = useDropdownMenuContext();

    if (!open) {
      return null;
    }

    return (
      <div
        ref={ref}
        role="menu"
        className={cn(
          "absolute top-full z-50 mt-2 min-w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white/95 p-1 shadow-2xl backdrop-blur-xl",
          align === "end" ? "right-0" : "left-0",
          className,
        )}
        {...props}
      />
    );
  },
);
DropdownMenuContent.displayName = "DropdownMenuContent";

const DropdownMenuLabel = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("px-3 py-2", className)} {...props} />
  ),
);
DropdownMenuLabel.displayName = "DropdownMenuLabel";

type DropdownMenuItemProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  closeOnSelect?: boolean;
};

const DropdownMenuItem = React.forwardRef<HTMLButtonElement, DropdownMenuItemProps>(
  ({ className, closeOnSelect = true, onClick, type = "button", ...props }, ref) => {
    const { setOpen } = useDropdownMenuContext();

    return (
      <button
        ref={ref}
        className={cn(
          "flex w-full items-center rounded-xl px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-950",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        type={type}
        onClick={(event) => {
          onClick?.(event);
          if (closeOnSelect && !event.defaultPrevented) {
            setOpen(false);
          }
        }}
        {...props}
      />
    );
  },
);
DropdownMenuItem.displayName = "DropdownMenuItem";

function DropdownMenuSeparator({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <Separator className={cn("my-1", className)} {...props} />;
}

export {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
};
