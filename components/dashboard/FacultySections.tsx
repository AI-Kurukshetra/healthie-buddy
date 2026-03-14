import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AppLink } from "@/components/ui/app-link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export type FacultySectionView = {
  sectionId: string;
  term: string;
  sectionCode: string;
  courseCode: string;
  courseTitle: string;
  enrolledStudents: number;
  gradebookItems: number;
  completionPercent: number;
  completionLabel: string;
};

type FacultySectionsProps = {
  sections: FacultySectionView[];
};

export function FacultySections({ sections }: FacultySectionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Assigned Sections</CardTitle>
        <CardDescription>Sections you are teaching with roster size and gradebook completion.</CardDescription>
      </CardHeader>
      <CardContent>
        {sections.length === 0 ? (
          <p className="text-sm text-slate-500">No assigned sections found.</p>
        ) : (
          <div className="-mx-1 overflow-x-auto px-1">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-56">Section</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Gradebook Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sections.map((section) => (
                  <TableRow key={section.sectionId}>
                    <TableCell>
                      <div className="space-y-2">
                        <p className="font-medium text-slate-950">
                          {section.courseCode} {section.courseTitle}
                        </p>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="outline">{section.term}</Badge>
                          <Badge variant="secondary">{section.sectionCode}</Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">{section.enrolledStudents}</TableCell>
                    <TableCell className="text-sm text-slate-600">{section.gradebookItems}</TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-medium text-slate-900">{section.completionLabel}</p>
                          <Badge variant={section.completionPercent >= 100 ? "success" : "warning"}>
                            {section.completionPercent.toFixed(0)}%
                          </Badge>
                        </div>
                        <Progress value={section.completionPercent} />
                      </div>
                    </TableCell>
                    <TableCell>
                      <AppLink
                        className={buttonVariants({ size: "sm", variant: "outline" })}
                        href={`/faculty/sections/${section.sectionId}/gradebook`}
                      >
                        Open Gradebook
                      </AppLink>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
