import { requireRole } from "@/lib/auth/server";
import { adminOnlyAction } from "../actions";
import { AppLink } from "@/components/ui/app-link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormSubmitButton } from "@/components/ui/form-submit-button";

export default async function AdminPage() {
  const user = await requireRole("admin");

  return (
    <section className="space-y-8">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <Badge variant="secondary">Admin Dashboard</Badge>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Control center</h1>
            <p className="max-w-2xl text-sm text-slate-500">
              Route and action access is restricted to admin role. Welcome {user.fullName}.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <AppLink className={buttonVariants({ variant: "outline" })} href="/courses">
            Courses
          </AppLink>
          <AppLink className={buttonVariants({ variant: "secondary" })} href="/admin/users">
            Users
          </AppLink>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Admin action check</CardTitle>
          <CardDescription>Run the protected server action to confirm admin authorization remains intact.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-4">
          <form action={adminOnlyAction}>
            <FormSubmitButton pendingLabel="Running...">Run admin action</FormSubmitButton>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
