import { describe, expect, it } from "vitest";
import { getStudentTranscriptAggregate } from "@/lib/api/transcripts";

type QueryResult = { data: unknown; error: unknown };

function createSupabaseMock(results: Record<string, QueryResult>) {
  return {
    from(table: string) {
      const result = results[table] ?? { data: [], error: null };
      const chain = {
        select() {
          return chain;
        },
        eq() {
          return chain;
        },
        in() {
          return chain;
        },
        order() {
          return chain;
        },
        then(onFulfilled: (value: QueryResult) => unknown, onRejected?: (reason: unknown) => unknown) {
          return Promise.resolve(result).then(onFulfilled, onRejected);
        },
      };

      return chain;
    },
  };
}

describe("GPA calculation", () => {
  it("aggregates gradebook scores and computes weighted GPA from completed sections", async () => {
    const supabase = createSupabaseMock({
      enrollments: {
        data: [
          {
            id: "enr-completed",
            status: "completed",
            enrolled_at: "2026-01-01T00:00:00Z",
            sections: {
              id: "sec-1",
              term: "2026 Spring",
              section_code: "SEC-A",
              day_of_week: 1,
              start_time: "09:00:00",
              end_time: "10:00:00",
              room: "R1",
              courses: {
                id: "course-1",
                code: "MTH101",
                title: "Calculus I",
                credits: 3,
              },
            },
          },
          {
            id: "enr-enrolled",
            status: "enrolled",
            enrolled_at: "2026-01-02T00:00:00Z",
            sections: {
              id: "sec-2",
              term: "2026 Spring",
              section_code: "SEC-B",
              day_of_week: 2,
              start_time: "10:00:00",
              end_time: "11:00:00",
              room: "R2",
              courses: {
                id: "course-2",
                code: "PHY101",
                title: "Physics I",
                credits: 4,
              },
            },
          },
        ],
        error: null,
      },
      gradebook_items: {
        data: [
          { id: "item-1", section_id: "sec-1", title: "Midterm", max_points: 50 },
          { id: "item-2", section_id: "sec-1", title: "Final", max_points: 50 },
          { id: "item-3", section_id: "sec-2", title: "Quiz", max_points: 100 },
        ],
        error: null,
      },
      gradebook_scores: {
        data: [
          { item_id: "item-1", score: 40 },
          { item_id: "item-2", score: 45 },
          { item_id: "item-3", score: 90 },
        ],
        error: null,
      },
      grades: {
        data: [],
        error: null,
      },
    });

    const { data, error } = await getStudentTranscriptAggregate(supabase as never, "student-1");

    expect(error).toBeNull();
    expect(data).not.toBeNull();

    expect(data?.credits_attempted).toBe(7);
    expect(data?.credits_completed).toBe(3);
    expect(data?.gpa).toBe(3);

    const completed = data?.courses.find((course) => course.enrollmentId === "enr-completed");
    expect(completed?.weightedPercentage).toBe(85);
    expect(completed?.finalGrade).toBe("B");
    expect(completed?.gradePoints).toBe(3);
    expect(completed?.breakdown).toHaveLength(2);
  });

  it("falls back to grades table when gradebook scores are not available", async () => {
    const supabase = createSupabaseMock({
      enrollments: {
        data: [
          {
            id: "enr-1",
            status: "completed",
            enrolled_at: "2026-01-01T00:00:00Z",
            sections: {
              id: "sec-1",
              term: "2026 Spring",
              section_code: "SEC-A",
              day_of_week: 1,
              start_time: "09:00:00",
              end_time: "10:00:00",
              room: "R1",
              courses: {
                id: "course-1",
                code: "ENG101",
                title: "English",
                credits: 4,
              },
            },
          },
        ],
        error: null,
      },
      gradebook_items: {
        data: [],
        error: null,
      },
      gradebook_scores: {
        data: [],
        error: null,
      },
      grades: {
        data: [{ enrollment_id: "enr-1", letter_grade: "A-", grade_points: 3.7 }],
        error: null,
      },
    });

    const { data, error } = await getStudentTranscriptAggregate(supabase as never, "student-1");

    expect(error).toBeNull();
    expect(data?.gpa).toBe(3.7);
    expect(data?.credits_attempted).toBe(4);
    expect(data?.credits_completed).toBe(4);
    expect(data?.courses[0]?.finalGrade).toBe("A-");
    expect(data?.courses[0]?.gradePoints).toBe(3.7);
  });
});
