import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionCard, type SectionView } from "@/components/courses/SectionCard";

export type CourseCatalogItem = {
  id: string;
  code: string;
  title: string;
  credits: number;
  sections: SectionView[];
};

type CourseCatalogProps = {
  userName: string;
  courses: CourseCatalogItem[];
};

export function CourseCatalog({ userName, courses }: CourseCatalogProps) {
  return (
    <main className="mx-auto min-h-screen w-full max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8">
      <header className="space-y-3">
        <h1 className="text-2xl font-semibold sm:text-3xl">Course Catalog</h1>
        <p className="text-sm text-gray-600">Browse published courses, section schedules, and seat availability. Welcome {userName}.</p>
      </header>

      <section className="mt-6 space-y-6">
        {courses.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-sm text-gray-600">No courses are currently available.</CardContent>
          </Card>
        ) : (
          courses.map((course) => (
            <Card key={course.id}>
              <CardHeader className="space-y-2">
                <CardTitle className="text-xl">
                  {course.code} · {course.title}
                </CardTitle>
                <CardDescription>Credits: {course.credits}</CardDescription>
              </CardHeader>
              <CardContent>
                {course.sections.length === 0 ? (
                  <p className="text-sm text-gray-600">No sections are currently published for this course.</p>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {course.sections.map((section) => (
                      <SectionCard key={section.id} section={section} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </section>

      <div className="mt-8">
        <Link href="/dashboard" className="inline-flex items-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
          Back to dashboard
        </Link>
      </div>
    </main>
  );
}
