import type { ReactNode } from "react";
import { requireUser } from "@/lib/auth/server";
import { AppHeader } from "@/components/layout/AppHeader";
import { AppShell } from "@/components/layout/AppShell";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { getRoleNavigation } from "@/components/layout/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireUser();
  const navigation = getRoleNavigation(user.role);

  return (
    <AppShell>
      <AppSidebar navigation={navigation} user={user} />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col lg:pl-72">
        <AppHeader user={user} />
        <main className="flex-1 px-4 pb-10 pt-6 sm:px-6 lg:px-8 lg:pt-8">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </AppShell>
  );
}
