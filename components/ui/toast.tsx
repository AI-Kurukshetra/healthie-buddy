"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type ToastVariant = "default" | "success" | "destructive";

type ToastInput = {
  title: string;
  description?: string;
  duration?: number;
  variant?: ToastVariant;
};

type ToastRecord = ToastInput & {
  id: string;
};

type ToastContextValue = {
  toast: (input: ToastInput) => string;
  dismiss: (id: string) => void;
};

const ToastContext = React.createContext<ToastContextValue | null>(null);

function toastId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastRecord[]>([]);
  const timeoutRef = React.useRef<Map<string, number>>(new Map());

  const dismiss = React.useCallback((id: string) => {
    const timeout = timeoutRef.current.get(id);
    if (timeout) {
      window.clearTimeout(timeout);
      timeoutRef.current.delete(id);
    }

    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const toast = React.useCallback(
    ({ duration = 3600, variant = "default", ...input }: ToastInput) => {
      const id = toastId();

      setToasts((current) => [...current, { id, variant, duration, ...input }]);

      const timeout = window.setTimeout(() => {
        dismiss(id);
      }, duration);

      timeoutRef.current.set(id, timeout);

      return id;
    },
    [dismiss],
  );

  React.useEffect(() => {
    const activeTimeouts = timeoutRef.current;

    return () => {
      for (const timeout of activeTimeouts.values()) {
        window.clearTimeout(timeout);
      }
    };
  }, []);

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[200] flex w-full max-w-sm flex-col gap-3">
        {toasts.map((toastItem) => (
          <div
            key={toastItem.id}
            aria-live="polite"
            className={cn(
              "pointer-events-auto rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur-xl transition-all",
              toastItem.variant === "success" &&
                "border-emerald-200 bg-emerald-50/95 text-emerald-900",
              toastItem.variant === "destructive" &&
                "border-rose-200 bg-rose-50/95 text-rose-900",
              toastItem.variant === "default" &&
                "border-slate-200 bg-white/95 text-slate-900",
            )}
            role={toastItem.variant === "destructive" ? "alert" : "status"}
          >
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{toastItem.title}</p>
                {toastItem.description ? (
                  <p className="mt-1 text-sm opacity-80">{toastItem.description}</p>
                ) : null}
              </div>
              <button
                aria-label="Dismiss notification"
                className="rounded-lg p-1 opacity-70 transition hover:bg-black/5 hover:opacity-100"
                type="button"
                onClick={() => dismiss(toastItem.id)}
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within ToastProvider.");
  }

  return context;
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <path
        d="M6 6L18 18M6 18L18 6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}
