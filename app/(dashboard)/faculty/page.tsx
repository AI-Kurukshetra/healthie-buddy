import { requireRole } from "@/lib/auth/server";
import { facultyOnlyAction } from "../actions";

export default async function FacultyPage() {
  const user = await requireRole("faculty");

  return (
    <main className="mx-auto min-h-screen w-full max-w-2xl px-6 py-10">
      <h1 className="text-2xl font-semibold">Faculty Area</h1>
      <p className="mt-2 text-sm text-gray-600">
        Route and action access is restricted to faculty role. Welcome{" "}
        {user.fullName}.
      </p>

      <form action={facultyOnlyAction} className="mt-6">
        <button className="rounded-md bg-black px-4 py-2 text-sm text-white">
          Run faculty action
        </button>
      </form>
    </main>
  );
}
