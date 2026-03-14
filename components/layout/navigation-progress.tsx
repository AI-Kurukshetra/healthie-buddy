"use client";

import * as React from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

type NavigationProgressContextValue = {
  startNavigation: () => void;
};

const NavigationProgressContext = React.createContext<NavigationProgressContextValue | null>(null);

export function NavigationProgressProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchKey = searchParams.toString();
  const [isVisible, setIsVisible] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const intervalRef = React.useRef<number | null>(null);
  const hideTimeoutRef = React.useRef<number | null>(null);
  const failSafeTimeoutRef = React.useRef<number | null>(null);
  const hasHydratedRef = React.useRef(false);
  const hasStartedRef = React.useRef(false);

  const clearTimers = React.useCallback(() => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (hideTimeoutRef.current !== null) {
      window.clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }

    if (failSafeTimeoutRef.current !== null) {
      window.clearTimeout(failSafeTimeoutRef.current);
      failSafeTimeoutRef.current = null;
    }
  }, []);

  const completeNavigation = React.useCallback(() => {
    if (!hasStartedRef.current) {
      return;
    }

    hasStartedRef.current = false;
    clearTimers();
    setIsVisible(true);
    setProgress(100);

    hideTimeoutRef.current = window.setTimeout(() => {
      setIsVisible(false);
      setProgress(0);
    }, 220);
  }, [clearTimers]);

  const startNavigation = React.useCallback(() => {
    hasStartedRef.current = true;
    clearTimers();
    setIsVisible(true);
    setProgress((current) => (current > 0 ? current : 16));

    intervalRef.current = window.setInterval(() => {
      setProgress((current) => {
        if (current >= 92) {
          return current;
        }

        return Math.min(current + Math.max((100 - current) * 0.08, 3), 92);
      });
    }, 120);

    failSafeTimeoutRef.current = window.setTimeout(() => {
      completeNavigation();
    }, 8000);
  }, [clearTimers, completeNavigation]);

  React.useEffect(() => {
    if (!hasHydratedRef.current) {
      hasHydratedRef.current = true;
      return;
    }

    completeNavigation();
  }, [pathname, searchKey, completeNavigation]);

  React.useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

  return (
    <NavigationProgressContext.Provider value={{ startNavigation }}>
      {children}
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none fixed inset-x-0 top-0 z-[210] h-1 transition-opacity duration-200",
          isVisible ? "opacity-100" : "opacity-0",
        )}
      >
        <div
          className="h-full origin-left bg-gradient-to-r from-teal-500 via-sky-500 to-teal-300 shadow-[0_0_18px_rgba(20,184,166,0.45)] transition-transform duration-150 ease-out"
          style={{ transform: `scaleX(${progress / 100})` }}
        />
      </div>
    </NavigationProgressContext.Provider>
  );
}

export function useNavigationProgress() {
  const context = React.useContext(NavigationProgressContext);

  if (!context) {
    throw new Error("useNavigationProgress must be used within NavigationProgressProvider.");
  }

  return context;
}
