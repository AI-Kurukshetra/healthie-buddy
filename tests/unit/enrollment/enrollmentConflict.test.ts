import { describe, expect, it } from "vitest";
import {
  findMissingPrerequisites,
  hasScheduleConflict,
  type EnrollmentWithSchedule,
} from "@/lib/enrollment/rules";

describe("enrollment schedule conflict rules", () => {
  it("returns false when existing enrollments do not overlap", () => {
    const existing: EnrollmentWithSchedule[] = [
      {
        status: "enrolled",
        sections: {
          term: "Fall 2026",
          day_of_week: 1,
          start_time: "08:00:00",
          end_time: "09:00:00",
          course_id: "course-a",
        },
      },
    ];

    const hasConflict = hasScheduleConflict(
      {
        term: "Fall 2026",
        day_of_week: 1,
        start_time: "09:30:00",
        end_time: "10:30:00",
      },
      existing,
    );

    expect(hasConflict).toBe(false);
  });

  it("returns true when an existing enrollment overlaps in same term/day", () => {
    const existing: EnrollmentWithSchedule[] = [
      {
        status: "completed",
        sections: {
          term: "Fall 2026",
          day_of_week: 3,
          start_time: "10:00:00",
          end_time: "11:00:00",
          course_id: "course-b",
        },
      },
    ];

    const hasConflict = hasScheduleConflict(
      {
        term: "Fall 2026",
        day_of_week: 3,
        start_time: "10:30:00",
        end_time: "11:30:00",
      },
      existing,
    );

    expect(hasConflict).toBe(true);
  });
});

describe("enrollment prerequisite rules", () => {
  it("returns an empty list when all prerequisites are completed", () => {
    const missing = findMissingPrerequisites(["c1", "c2"], new Set(["c1", "c2", "c3"]));
    expect(missing).toEqual([]);
  });

  it("returns missing prerequisite ids when requirements are not met", () => {
    const missing = findMissingPrerequisites(["c1", "c2", "c3"], new Set(["c2"]));
    expect(missing).toEqual(["c1", "c3"]);
  });
});
