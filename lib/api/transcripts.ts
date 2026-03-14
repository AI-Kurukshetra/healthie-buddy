import type { SupabaseClient } from "@supabase/supabase-js";

type EnrollmentWithSectionRow = {
  id: string;
  status: "enrolled" | "completed" | "dropped";
  enrolled_at: string;
  sections:
    | {
        id: string;
        term: string;
        section_code: string;
        day_of_week: number;
        start_time: string;
        end_time: string;
        room: string | null;
        courses:
          | {
              id: string;
              code: string;
              title: string;
              credits: number | string;
            }
          | {
              id: string;
              code: string;
              title: string;
              credits: number | string;
            }[]
          | null;
      }
    | {
        id: string;
        term: string;
        section_code: string;
        day_of_week: number;
        start_time: string;
        end_time: string;
        room: string | null;
        courses:
          | {
              id: string;
              code: string;
              title: string;
              credits: number | string;
            }
          | {
              id: string;
              code: string;
              title: string;
              credits: number | string;
            }[]
          | null;
      }[]
    | null;
};

type GradebookItemRow = {
  id: string;
  section_id: string;
  title: string;
  max_points: number;
};

type GradebookScoreRow = {
  item_id: string;
  score: number;
};

type GradeRow = {
  enrollment_id: string;
  letter_grade: string;
  grade_points: number;
};

export type TranscriptCourseBreakdown = {
  itemId: string;
  title: string;
  maxPoints: number;
  score: number | null;
  percentage: number | null;
};

export type TranscriptCourse = {
  enrollmentId: string;
  sectionId: string;
  sectionCode: string;
  status: "enrolled" | "completed";
  term: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  room: string | null;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  credits: number;
  weightedPercentage: number | null;
  finalGrade: string | null;
  gradePoints: number | null;
  hasGradebookItems: boolean;
  breakdown: TranscriptCourseBreakdown[];
};

export type StudentTranscriptAggregate = {
  courses: TranscriptCourse[];
  credits_attempted: number;
  credits_completed: number;
  gpa: number;
};

type GradePointScale = {
  minPercentage: number;
  letter: string;
  points: number;
};

const GRADE_SCALE: GradePointScale[] = [
  { minPercentage: 93, letter: "A", points: 4.0 },
  { minPercentage: 90, letter: "A-", points: 3.7 },
  { minPercentage: 87, letter: "B+", points: 3.3 },
  { minPercentage: 83, letter: "B", points: 3.0 },
  { minPercentage: 80, letter: "B-", points: 2.7 },
  { minPercentage: 77, letter: "C+", points: 2.3 },
  { minPercentage: 73, letter: "C", points: 2.0 },
  { minPercentage: 70, letter: "C-", points: 1.7 },
  { minPercentage: 65, letter: "D", points: 1.0 },
  { minPercentage: 0, letter: "F", points: 0 },
];

function isTranscriptStatus(status: EnrollmentWithSectionRow["status"]): status is "enrolled" | "completed" {
  return status === "enrolled" || status === "completed";
}

function asSingle<T>(value: T | T[] | null): T | null {
  if (!value) {
    return null;
  }

  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function toNumber(value: number | string): number {
  const parsed = typeof value === "string" ? Number(value) : value;
  return Number.isFinite(parsed) ? parsed : 0;
}

function toGradeFromPercentage(percentage: number): { finalGrade: string; gradePoints: number } {
  for (const band of GRADE_SCALE) {
    if (percentage >= band.minPercentage) {
      return { finalGrade: band.letter, gradePoints: band.points };
    }
  }

  return { finalGrade: "F", gradePoints: 0 };
}

export async function getStudentTranscriptAggregate(
  supabase: SupabaseClient,
  studentId: string,
): Promise<{ data: StudentTranscriptAggregate | null; error: string | null }> {
  const { data: enrollmentData, error: enrollmentError } = await supabase
    .from("enrollments")
    .select(
      "id,status,enrolled_at,sections!inner(id,term,section_code,day_of_week,start_time,end_time,room,courses!inner(id,code,title,credits))",
    )
    .eq("student_id", studentId)
    .in("status", ["enrolled", "completed"])
    .order("enrolled_at", { ascending: false });

  if (enrollmentError) {
    return { data: null, error: "Could not fetch student enrollments." };
  }

  const enrollments = (enrollmentData ?? []) as EnrollmentWithSectionRow[];
  if (enrollments.length === 0) {
    return {
      data: {
        courses: [],
        credits_attempted: 0,
        credits_completed: 0,
        gpa: 0,
      },
      error: null,
    };
  }

  const sectionIds = Array.from(
    new Set(
      enrollments
        .map((enrollment) => asSingle(enrollment.sections)?.id)
        .filter((value): value is string => Boolean(value)),
    ),
  );

  const enrollmentIds = enrollments.map((enrollment) => enrollment.id);

  const { data: gradebookItemsData, error: gradebookItemsError } = sectionIds.length
    ? await supabase
        .from("gradebook_items")
        .select("id,section_id,title,max_points")
        .in("section_id", sectionIds)
    : { data: [], error: null };

  if (gradebookItemsError) {
    return { data: null, error: "Could not fetch gradebook items." };
  }

  const gradebookItems = (gradebookItemsData ?? []) as GradebookItemRow[];
  const itemIds = gradebookItems.map((item) => item.id);

  const { data: gradebookScoresData, error: gradebookScoresError } = itemIds.length
    ? await supabase
        .from("gradebook_scores")
        .select("item_id,score")
        .eq("student_id", studentId)
        .in("item_id", itemIds)
    : { data: [], error: null };

  if (gradebookScoresError) {
    return { data: null, error: "Could not fetch gradebook scores." };
  }

  const { data: gradesData, error: gradesError } = enrollmentIds.length
    ? await supabase
        .from("grades")
        .select("enrollment_id,letter_grade,grade_points")
        .in("enrollment_id", enrollmentIds)
    : { data: [], error: null };

  if (gradesError) {
    return { data: null, error: "Could not fetch grade rows." };
  }

  const gradebookScores = (gradebookScoresData ?? []) as GradebookScoreRow[];
  const grades = (gradesData ?? []) as GradeRow[];

  const itemsBySection = new Map<string, GradebookItemRow[]>();
  for (const item of gradebookItems) {
    const existing = itemsBySection.get(item.section_id) ?? [];
    existing.push(item);
    itemsBySection.set(item.section_id, existing);
  }

  const scoreByItem = new Map<string, number>();
  for (const score of gradebookScores) {
    scoreByItem.set(score.item_id, score.score);
  }

  const gradeByEnrollment = new Map<string, GradeRow>();
  for (const grade of grades) {
    gradeByEnrollment.set(grade.enrollment_id, grade);
  }

  const courses: TranscriptCourse[] = [];
  let creditsAttempted = 0;
  let creditsCompleted = 0;
  let totalQualityPoints = 0;
  let totalGpaCredits = 0;

  for (const enrollment of enrollments) {
    const section = asSingle(enrollment.sections);
    const course = asSingle(section?.courses ?? null);

    if (!section?.id || !course?.id) {
      continue;
    }

    const credits = toNumber(course.credits);
    creditsAttempted += credits;

    const sectionItems = itemsBySection.get(section.id) ?? [];
    const breakdown: TranscriptCourseBreakdown[] = sectionItems.map((item) => {
      const score = scoreByItem.get(item.id) ?? null;
      const percentage = score === null || item.max_points <= 0 ? null : round2((score / item.max_points) * 100);

      return {
        itemId: item.id,
        title: item.title,
        maxPoints: item.max_points,
        score,
        percentage,
      };
    });

    let weightedPercentage: number | null = null;
    let finalGrade: string | null = null;
    let gradePoints: number | null = null;

    const scoredBreakdown = breakdown.filter((item) => item.score !== null);
    const totalScore = scoredBreakdown.reduce((sum, item) => sum + (item.score ?? 0), 0);
    const totalMax = scoredBreakdown.reduce((sum, item) => sum + item.maxPoints, 0);

    if (totalMax > 0) {
      weightedPercentage = round2((totalScore / totalMax) * 100);
      const mapped = toGradeFromPercentage(weightedPercentage);
      finalGrade = mapped.finalGrade;
      gradePoints = mapped.gradePoints;
    } else {
      const gradeRow = gradeByEnrollment.get(enrollment.id);
      if (gradeRow) {
        finalGrade = gradeRow.letter_grade;
        gradePoints = gradeRow.grade_points;
      }
    }

    if (enrollment.status === "completed") {
      if ((gradePoints ?? 0) > 0) {
        creditsCompleted += credits;
      }

      if (gradePoints !== null) {
        totalQualityPoints += gradePoints * credits;
        totalGpaCredits += credits;
      }
    }

    if (!isTranscriptStatus(enrollment.status)) {
      continue;
    }

    courses.push({
      enrollmentId: enrollment.id,
      sectionId: section.id,
      sectionCode: section.section_code,
      status: enrollment.status,
      term: section.term,
      dayOfWeek: section.day_of_week,
      startTime: section.start_time,
      endTime: section.end_time,
      room: section.room,
      courseId: course.id,
      courseCode: course.code,
      courseTitle: course.title,
      credits,
      weightedPercentage,
      finalGrade,
      gradePoints,
      hasGradebookItems: sectionItems.length > 0,
      breakdown,
    });
  }

  const gpa = totalGpaCredits > 0 ? round2(totalQualityPoints / totalGpaCredits) : 0;

  courses.sort((a, b) => {
    if (a.term !== b.term) {
      return a.term.localeCompare(b.term);
    }

    if (a.dayOfWeek !== b.dayOfWeek) {
      return a.dayOfWeek - b.dayOfWeek;
    }

    return a.startTime.localeCompare(b.startTime);
  });

  return {
    data: {
      courses,
      credits_attempted: round2(creditsAttempted),
      credits_completed: round2(creditsCompleted),
      gpa,
    },
    error: null,
  };
}
