import { describe, expect, it } from "vitest";
import {
  MyEnrollmentsResponseSchema,
  SectionGradebookResponseSchema,
} from "@/lib/validations/api-contracts";

describe("API contract schemas", () => {
  it("accepts faculty gradebook payloads with Supabase numeric strings and offset timestamps", () => {
    const parsed = SectionGradebookResponseSchema.safeParse({
      role: "faculty",
      section: {
        id: "00000000-0000-0000-0000-000000003101",
        term: "Spring 2026",
        sectionCode: "CS101-A",
        course: {
          id: "00000000-0000-0000-0000-000000002101",
          code: "CS101",
          title: "Introduction to Computing",
        },
      },
      items: [
        {
          id: "00000000-0000-0000-0000-000000005101",
          sectionId: "00000000-0000-0000-0000-000000003101",
          title: "Midterm",
          description: null,
          maxPoints: "100.00",
          dueAt: "2026-03-20T09:00:00+00:00",
        },
      ],
      students: [
        {
          id: "00000000-0000-0000-0000-000000000101",
          studentNumber: "STU-00000000",
          fullName: "Aarav Sharma",
          email: "aarav.sharma@demo-campus.edu",
        },
      ],
      scores: [
        {
          id: "00000000-0000-0000-0000-000000006101",
          itemId: "00000000-0000-0000-0000-000000005101",
          studentId: "00000000-0000-0000-0000-000000000101",
          score: "95.50",
          feedback: null,
          gradedAt: "2026-03-14T09:40:07.81187+00:00",
        },
      ],
    });

    expect(parsed.success).toBe(true);

    if (!parsed.success) {
      return;
    }

    expect(parsed.data.items[0]?.maxPoints).toBe(100);
    expect(parsed.data.scores[0]?.score).toBe(95.5);
  });

  it("accepts enrollment timestamps with timezone offsets", () => {
    const parsed = MyEnrollmentsResponseSchema.safeParse({
      enrollments: [
        {
          id: "00000000-0000-0000-0000-000000004101",
          status: "enrolled",
          enrolledAt: "2026-03-14T09:40:07.81187+00:00",
          section: {
            id: "00000000-0000-0000-0000-000000003101",
            term: "Spring 2026",
            sectionCode: "CS101-A",
            dayOfWeek: 1,
            startTime: "09:00:00",
            endTime: "10:15:00",
            room: "A-201",
            course: {
              id: "00000000-0000-0000-0000-000000002101",
              code: "CS101",
              title: "Introduction to Computing",
              credits: "3.00",
            },
          },
        },
      ],
    });

    expect(parsed.success).toBe(true);

    if (!parsed.success) {
      return;
    }

    expect(parsed.data.enrollments[0]?.section.course.credits).toBe(3);
  });
});
