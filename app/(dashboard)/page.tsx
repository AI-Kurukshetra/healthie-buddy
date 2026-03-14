import Link from "next/link";
import { getSessionUser } from "@/lib/auth/server";
import { logoutAction } from "@/app/(auth)/actions";

export default async function DashboardPage() {
  const user = await getSessionUser();

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-6 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">
            Signed in as {user?.fullName} ({user?.role})
          </p>
        </div>

        <form action={logoutAction}>
          <button className="rounded-md border border-gray-300 px-3 py-2 text-sm">
            Logout
          </button>
        </form>
      </div>

      <div className="mt-8 grid gap-3">
        <Link href="/dashboard/student" className="rounded-md border p-3 text-sm">
          Student Area
        </Link>
        <Link href="/dashboard/faculty" className="rounded-md border p-3 text-sm">
          Faculty Area
        </Link>
        <Link href="/dashboard/admin" className="rounded-md border p-3 text-sm">
          Admin Area
        </Link>
      </div>
    </main>
  );
}
