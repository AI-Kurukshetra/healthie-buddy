import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
        <CardTitle className="text-xl">Assigned Sections</CardTitle>
        <CardDescription>Sections you are teaching with roster size and gradebook completion.</CardDescription>
      </CardHeader>
      <CardContent>
        {sections.length === 0 ? (
          <p className="text-sm text-gray-600">No assigned sections found.</p>
        ) : (
          <div className="-mx-2 overflow-x-auto px-2">
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
                      <p className="font-medium text-gray-900">
                        {section.courseCode} {section.courseTitle}
                      </p>
                      <p className="text-xs text-gray-600">
                        {section.term} • {section.sectionCode}
                      </p>
                    </TableCell>
                    <TableCell className="text-sm text-gray-700">{section.enrolledStudents}</TableCell>
                    <TableCell className="text-sm text-gray-700">{section.gradebookItems}</TableCell>
                    <TableCell>
                      <p className="text-sm font-medium text-gray-900">{section.completionLabel}</p>
                      <p className="text-xs text-gray-600">{section.completionPercent.toFixed(0)}% scored</p>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/faculty/sections/${section.sectionId}/gradebook`}
                        className="rounded-md border border-gray-300 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50"
                      >
                        Open Gradebook
                      </Link>
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
