export type SectionSchedule = {
  term: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  course_id: string;
};

export type EnrollmentWithSchedule = {
  status: "enrolled" | "dropped" | "completed";
  sections: SectionSchedule | SectionSchedule[] | null;
};

export type TargetSectionSchedule = {
  term: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
};

export function getSingle<T>(value: T | T[] | null): T | null {
  if (!value) {
    return null;
  }

  return Array.isArray(value) ? (value[0] ?? null) : value;
}

export function hasScheduleConflict(
  target: TargetSectionSchedule,
  existing: EnrollmentWithSchedule[],
): boolean {
  for (const enrollment of existing) {
    const section = getSingle(enrollment.sections);
    if (!section) {
      continue;
    }

    if (section.term !== target.term || section.day_of_week !== target.day_of_week) {
      continue;
    }

    const overlaps = section.start_time < target.end_time && target.start_time < section.end_time;
    if (overlaps) {
      return true;
    }
  }

  return false;
}

export function isSectionFull(enrolledCount: number, capacity: number): boolean {
  return enrolledCount >= capacity;
}

export function isDuplicateEnrollment(status: string | null | undefined): boolean {
  return Boolean(status && status !== "dropped");
}

export function findMissingPrerequisites(
  prerequisiteCourseIds: string[],
  completedCourseIds: Set<string>,
): string[] {
  return prerequisiteCourseIds.filter((courseId) => !completedCourseIds.has(courseId));
}
