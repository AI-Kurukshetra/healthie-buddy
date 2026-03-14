"use client";

import * as React from "react";

type AppShellContextValue = {
  isMobileSidebarOpen: boolean;
  closeMobileSidebar: () => void;
  openMobileSidebar: () => void;
  toggleMobileSidebar: () => void;
};

const AppShellContext = React.createContext<AppShellContextValue | null>(null);

export function useAppShell() {
  const context = React.useContext(AppShellContext);

  if (!context) {
    throw new Error("AppShell components must be used within AppShell.");
  }

  return context;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false);

  const value = React.useMemo(
    () => ({
      isMobileSidebarOpen,
      closeMobileSidebar: () => setIsMobileSidebarOpen(false),
      openMobileSidebar: () => setIsMobileSidebarOpen(true),
      toggleMobileSidebar: () => setIsMobileSidebarOpen((current) => !current),
    }),
    [isMobileSidebarOpen],
  );

  return (
    <AppShellContext.Provider value={value}>
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.14),_transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.16),_transparent_30%),linear-gradient(180deg,_#f8fafc_0%,_#f1f5f9_100%)]">
        <div className="relative flex min-h-screen w-full">{children}</div>
      </div>
    </AppShellContext.Provider>
  );
}
