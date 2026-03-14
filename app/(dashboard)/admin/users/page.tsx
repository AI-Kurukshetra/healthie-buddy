import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/server";
import { AppLink } from "@/components/ui/app-link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Admin Users | Campus Management",
  description: "Admin-facing user management placeholder.",
};

export default async function AdminUsersPage() {
  await requireRole("admin");

  return (
    <section className="space-y-8">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <Badge variant="secondary">Users</Badge>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">User administration</h1>
            <p className="max-w-2xl text-sm text-slate-500">
              This placeholder reserves the admin user-management surface inside the shared dashboard shell.
            </p>
          </div>
        </div>
        <AppLink className={buttonVariants({ variant: "outline" })} href="/admin">
          Back to Admin Dashboard
        </AppLink>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>User management placeholder</CardTitle>
          <CardDescription>Admin user maintenance is out of scope for the current MVP, but the route and layout are now in place.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500">
            Keep this route for future administrative tools such as role assignment, account activation, and institution-wide roster views.
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
