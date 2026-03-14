import Link from "next/link";
import { requireRole } from "@/lib/auth/server";
import { facultyOnlyAction } from "../actions";
import { createClient } from "@/lib/supabase/server";

type FacultyRow = {
  id: string;
};

type SectionRow = {
  id: string;
  term: string;
  section_code: string;
  courses:
    | {
        code: string;
        title: string;
      }
    | {
        code: string;
        title: string;
      }[]
    | null;
};

function getSingle<T>(value: T | T[] | null): T | null {
  if (!value) {
    return null;
  }

  return Array.isArray(value) ? (value[0] ?? null) : value;
}

export default async function FacultyPage() {
  const user = await requireRole("faculty");
  const supabase = await createClient();

  const { data: facultyRow } = await supabase
    .from("faculty")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle<FacultyRow>();

  const { data: sectionRows } = facultyRow?.id
    ? await supabase
        .from("sections")
        .select("id,term,section_code,courses!inner(code,title)")
        .eq("faculty_id", facultyRow.id)
        .order("term", { ascending: true })
        .order("section_code", { ascending: true })
    : { data: [] as SectionRow[] };

  const sections = (sectionRows ?? []) as SectionRow[];

  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl space-y-6 px-6 py-10">
      <h1 className="text-2xl font-semibold">Faculty Area</h1>
      <p className="mt-2 text-sm text-gray-600">
        Route and action access is restricted to faculty role. Welcome{" "}
        {user.fullName}.
      </p>

      <section className="space-y-3 rounded-md border border-gray-200 p-4">
        <h2 className="text-lg font-semibold">Your Sections</h2>
        {sections.length === 0 ? (
          <p className="text-sm text-gray-600">No assigned sections found.</p>
        ) : (
          <div className="grid gap-2">
            {sections.map((section) => {
              const course = getSingle(section.courses);

              return (
                <Link
                  key={section.id}
                  href={`/dashboard/faculty/sections/${section.id}/gradebook`}
                  className="rounded-md border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
                >
                  {section.term} • {section.section_code} • {course?.code ?? ""}{" "}
                  {course?.title ?? ""}
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <form action={facultyOnlyAction} className="mt-6">
        <button className="rounded-md bg-black px-4 py-2 text-sm text-white">
          Run faculty action
        </button>
      </form>
    </main>
  );
}
