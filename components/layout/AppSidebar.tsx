"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { SessionUser } from "@/lib/auth/types";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { AppNavItem } from "@/components/layout/navigation";
import { getRoleLabel, isNavItemActive } from "@/components/layout/navigation";
import { useAppShell } from "@/components/layout/AppShell";

type AppSidebarProps = {
  navigation: AppNavItem[];
  user: SessionUser;
};

function AppLogo() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-sm font-semibold uppercase tracking-[0.2em] text-white shadow-lg shadow-slate-950/20">
        CM
      </div>
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-700">Campus Management</p>
        <p className="text-sm text-slate-500">Academic workspace</p>
      </div>
    </div>
  );
}

export function AppSidebar({ navigation, user }: AppSidebarProps) {
  const pathname = usePathname();
  const { closeMobileSidebar, isMobileSidebarOpen } = useAppShell();
  const roleLabel = getRoleLabel(user.role);

  return (
    <>
      <div
        aria-hidden="true"
        className={cn(
          "fixed inset-0 z-40 bg-slate-950/35 backdrop-blur-sm transition-opacity lg:hidden",
          isMobileSidebarOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={closeMobileSidebar}
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200/80 bg-white/92 px-5 py-5 shadow-2xl backdrop-blur-xl transition-transform",
          isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0",
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <AppLogo />
          <Button
            aria-label="Close navigation"
            className="lg:hidden"
            size="icon"
            type="button"
            variant="ghost"
            onClick={closeMobileSidebar}
          >
            <CloseIcon className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">{user.fullName}</p>
              <p className="text-sm text-slate-500">{user.email}</p>
            </div>
            <Badge variant="secondary">{roleLabel}</Badge>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="space-y-3">
          <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Workspace</p>
          <nav className="space-y-1">
            {navigation.map((item) => {
              const isActive = isNavItemActive(pathname, item);

              return (
                <Link
                  key={item.href}
                  className={buttonVariants({
                    className: cn(
                      "w-full justify-start rounded-xl px-4",
                      isActive && "bg-slate-950 text-white hover:bg-slate-900",
                    ),
                    variant: isActive ? "default" : "ghost",
                  })}
                  href={item.href}
                  onClick={closeMobileSidebar}
                >
                  <SidebarDot active={isActive} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 p-4">
          <p className="text-sm font-semibold text-slate-900">Demo Campus Hub</p>
          <p className="mt-2 text-sm text-slate-500">
            Use the sidebar to move across your role workspace without losing context.
          </p>
        </div>
      </aside>
    </>
  );
}

function SidebarDot({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        "h-2.5 w-2.5 rounded-full transition-colors",
        active ? "bg-teal-300" : "bg-slate-300",
      )}
    />
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <path d="M6 6L18 18M6 18L18 6" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </svg>
  );
}
