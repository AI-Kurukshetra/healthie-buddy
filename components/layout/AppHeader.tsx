"use client";

import { logoutAction } from "@/app/(auth)/actions";
import type { SessionUser } from "@/lib/auth/types";
import { cn } from "@/lib/utils";
import { useAppShell } from "@/components/layout/AppShell";
import { LogoutMenuItem } from "@/components/layout/LogoutMenuItem";
import { getRoleLabel } from "@/components/layout/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";

type AppHeaderProps = {
  user: SessionUser;
};

export function AppHeader({ user }: AppHeaderProps) {
  const { openMobileSidebar } = useAppShell();
  const roleLabel = getRoleLabel(user.role);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/78 backdrop-blur-xl">
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <Button
            aria-label="Open navigation"
            className="lg:hidden"
            size="icon"
            type="button"
            variant="outline"
            onClick={openMobileSidebar}
          >
            <MenuIcon className="h-4 w-4" />
          </Button>

          <div className="min-w-0">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-700">Campus Management</p>
            <p className="truncate text-sm text-slate-500">{roleLabel} workspace</p>
          </div>
        </div>

        <Separator className="hidden h-8 md:block" orientation="vertical" />

        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              buttonVariants({ variant: "outline", size: "default" }),
              "h-12 rounded-2xl px-2 sm:px-3",
            )}
          >
            <Avatar className="h-9 w-9">
              <AvatarFallback>{getInitials(user.fullName)}</AvatarFallback>
            </Avatar>
            <div className="hidden text-left sm:block">
              <p className="max-w-40 truncate text-sm font-semibold text-slate-900">{user.fullName}</p>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{roleLabel}</p>
            </div>
            <ChevronDownIcon className="hidden h-4 w-4 text-slate-500 sm:block" />
          </DropdownMenuTrigger>

          <DropdownMenuContent>
            <DropdownMenuLabel>
              <p className="text-sm font-semibold text-slate-950">{user.fullName}</p>
              <p className="text-sm text-slate-500">{user.email}</p>
              <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-teal-700">{roleLabel}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>Profile</DropdownMenuItem>
            <form action={logoutAction}>
              <LogoutMenuItem />
            </form>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

function getInitials(value: string) {
  return value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <path
        d="M4 7h16M4 12h16M4 17h10"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <path d="M6 9L12 15L18 9" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </svg>
  );
}
