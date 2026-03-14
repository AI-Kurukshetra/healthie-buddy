import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AppLink } from "@/components/ui/app-link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import type { AppRole } from "@/lib/auth/types";
import { SectionCard } from "@/components/courses/SectionCard";
import type { CourseCatalogItem } from "@/components/courses/types";

type CourseCatalogProps = {
  homeHref: string;
  homeLabel: string;
  userName: string;
  courses: CourseCatalogItem[];
  viewerRole: AppRole;
  canEnroll: boolean;
};

export function CourseCatalog({ homeHref, homeLabel, userName, courses, viewerRole, canEnroll }: CourseCatalogProps) {
  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <Badge variant="secondary">Course Catalog</Badge>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Published courses and live section availability</h1>
            <p className="max-w-3xl text-sm text-slate-500">
              Browse published courses, section schedules, and seat availability. Welcome {userName}.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <AppLink className={buttonVariants({ variant: "secondary" })} href={homeHref}>
            {homeLabel}
          </AppLink>
        </div>
      </header>

      {viewerRole === "student" ? (
        <Card>
          <CardContent className="flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-950">
                {canEnroll
                  ? "Live student enrollment is now available from each section card."
                  : "Enrollment actions are unavailable until your student profile is restored."}
              </p>
              <p className="text-sm text-slate-500">
                {canEnroll
                  ? "The frontend uses the existing enrollment API and enforces capacity, conflict, duplicate, and prerequisite rules."
                  : "You can still browse the catalog, but enrollment requires a valid student record."}
              </p>
            </div>
            <Badge variant="secondary">Student Action</Badge>
          </CardContent>
        </Card>
      ) : null}

      <section className="space-y-6">
        {courses.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-sm text-slate-500">No courses are currently available.</CardContent>
          </Card>
        ) : (
          courses.map((course) => (
            <Card key={course.id}>
              <CardHeader className="gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-2xl">
                    {course.code} · {course.title}
                  </CardTitle>
                  <CardDescription>{course.sections.length} published section(s)</CardDescription>
                </div>
                <Badge variant="outline">Credits: {course.credits}</Badge>
              </CardHeader>
              <CardContent>
                {course.sections.length === 0 ? (
                  <p className="text-sm text-slate-500">No sections are currently published for this course.</p>
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
    </div>
  );
}
