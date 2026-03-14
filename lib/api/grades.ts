import type { SupabaseClient } from "@supabase/supabase-js";
import type { z } from "zod";
import { getStudentTranscriptAggregate } from "@/lib/api/transcripts";
import {
  FacultyGradesResponseSchema,
  StudentGradesResponseSchema,
} from "@/lib/validations/dashboard-api";

type StudentGradeResponse = z.infer<typeof StudentGradesResponseSchema>;
type FacultyGradeResponse = z.infer<typeof FacultyGradesResponseSchema>;

type SectionCourseRow = {
  id: string;
  term: string;
  section_code: string;
  course_id: string;
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
};

type EnrollmentForFacultyRow = {
  id: string;
  status: "enrolled" | "completed" | "dropped";
  student_id: string;
  section_id: string;
  sections: SectionCourseRow | SectionCourseRow[] | null;
  students:
    | {
        id: string;
        student_number: string;
        users:
          | {
              full_name: string;
              email: string;
            }
          | {
              full_name: string;
              email: string;
            }[]
          | null;
      }
    | {
        id: string;
        student_number: string;
        users:
          | {
              full_name: string;
              email: string;
            }
          | {
              full_name: string;
              email: string;
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
  student_id: string;
  score: number;
};

type GradeRow = {
  enrollment_id: string;
  letter_grade: string;
  grade_points: number;
};

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
  if (percentage >= 93) return { finalGrade: "A", gradePoints: 4.0 };
  if (percentage >= 90) return { finalGrade: "A-", gradePoints: 3.7 };
  if (percentage >= 87) return { finalGrade: "B+", gradePoints: 3.3 };
  if (percentage >= 83) return { finalGrade: "B", gradePoints: 3.0 };
  if (percentage >= 80) return { finalGrade: "B-", gradePoints: 2.7 };
  if (percentage >= 77) return { finalGrade: "C+", gradePoints: 2.3 };
  if (percentage >= 73) return { finalGrade: "C", gradePoints: 2.0 };
  if (percentage >= 70) return { finalGrade: "C-", gradePoints: 1.7 };
  if (percentage >= 65) return { finalGrade: "D", gradePoints: 1.0 };
  return { finalGrade: "F", gradePoints: 0 };
}

export async function getStudentGrades(
  supabase: SupabaseClient,
  studentId: string,
): Promise<{ data: StudentGradeResponse | null; error: string | null }> {
  const { data: transcriptData, error: transcriptError } = await getStudentTranscriptAggregate(supabase, studentId);

  if (transcriptError || !transcriptData) {
    return { data: null, error: transcriptError ?? "Could not load student grades." };
  }

  const grades: StudentGradeResponse["grades"] = transcriptData.courses.map((course) => ({
    enrollmentId: course.enrollmentId,
    sectionId: course.sectionId,
    sectionCode: course.sectionCode,
    term: course.term,
    status: course.status,
    courseId: course.courseId,
    courseCode: course.courseCode,
    courseTitle: course.courseTitle,
    credits: course.credits,
    finalGrade: course.finalGrade,
    gradePoints: course.gradePoints,
    weightedPercentage: course.weightedPercentage,
    breakdown: course.breakdown,
  }));

  return { data: { role: "student", grades }, error: null };
}

export async function getFacultyGrades(
  supabase: SupabaseClient,
  facultyId: string,
): Promise<{ data: FacultyGradeResponse | null; error: string | null }> {
  const { data: enrollmentRows, error: enrollmentError } = await supabase
    .from("enrollments")
    .select(
      "id,status,student_id,section_id,sections!inner(id,term,section_code,course_id,courses!inner(id,code,title,credits),faculty_id),students!inner(id,student_number,users!inner(full_name,email))",
    )
    .eq("sections.faculty_id", facultyId)
    .in("status", ["enrolled", "completed"])
    .order("created_at", { ascending: false });

  if (enrollmentError) {
    return { data: null, error: "Could not fetch faculty grade enrollments." };
  }

  const enrollments = (enrollmentRows ?? []) as EnrollmentForFacultyRow[];

  if (enrollments.length === 0) {
    return { data: { role: "faculty", grades: [] }, error: null };
  }

  const sectionIds = Array.from(new Set(enrollments.map((row) => row.section_id)));
  const enrollmentIds = enrollments.map((row) => row.id);
  const studentIds = Array.from(new Set(enrollments.map((row) => row.student_id)));

  const { data: itemRows, error: itemError } = await supabase
    .from("gradebook_items")
    .select("id,section_id,title,max_points")
    .in("section_id", sectionIds);

  if (itemError) {
    return { data: null, error: "Could not fetch gradebook items." };
  }

  const gradebookItems = (itemRows ?? []) as GradebookItemRow[];
  const itemIds = gradebookItems.map((item) => item.id);

  const { data: scoreRows, error: scoreError } = itemIds.length
    ? await supabase
        .from("gradebook_scores")
        .select("item_id,student_id,score")
        .in("item_id", itemIds)
        .in("student_id", studentIds)
    : { data: [], error: null };

  if (scoreError) {
    return { data: null, error: "Could not fetch gradebook scores." };
  }

  const { data: gradeRows, error: gradeError } = await supabase
    .from("grades")
    .select("enrollment_id,letter_grade,grade_points")
    .in("enrollment_id", enrollmentIds);

  if (gradeError) {
    return { data: null, error: "Could not fetch grade rows." };
  }

  const scores = (scoreRows ?? []) as GradebookScoreRow[];
  const grades = (gradeRows ?? []) as GradeRow[];

  const itemsBySection = new Map<string, GradebookItemRow[]>();
  for (const item of gradebookItems) {
    const current = itemsBySection.get(item.section_id) ?? [];
    current.push(item);
    itemsBySection.set(item.section_id, current);
  }

  const scoreByItemAndStudent = new Map<string, number>();
  for (const score of scores) {
    scoreByItemAndStudent.set(`${score.item_id}:${score.student_id}`, score.score);
  }

  const gradeByEnrollment = new Map<string, GradeRow>();
  for (const grade of grades) {
    gradeByEnrollment.set(grade.enrollment_id, grade);
  }

  const normalizedGrades: FacultyGradeResponse["grades"] = [];

  for (const enrollment of enrollments) {
    if (enrollment.status !== "enrolled" && enrollment.status !== "completed") {
      continue;
    }

    const section = asSingle(enrollment.sections);
    const course = asSingle(section?.courses ?? null);
    const student = asSingle(enrollment.students);
    const studentUser = asSingle(student?.users ?? null);

    if (!section?.id || !course?.id || !student?.id || !studentUser?.email) {
      continue;
    }

    const sectionItems = itemsBySection.get(section.id) ?? [];
    const breakdown = sectionItems.map((item) => {
      const score = scoreByItemAndStudent.get(`${item.id}:${student.id}`) ?? null;
      const percentage = score === null || item.max_points <= 0 ? null : round2((score / item.max_points) * 100);

      return {
        itemId: item.id,
        title: item.title,
        maxPoints: item.max_points,
        score,
        percentage,
      };
    });

    const scoredItems = breakdown.filter((item) => item.score !== null);
    const totalScore = scoredItems.reduce((sum, item) => sum + (item.score ?? 0), 0);
    const totalMax = scoredItems.reduce((sum, item) => sum + item.maxPoints, 0);

    let weightedPercentage: number | null = null;
    let finalGrade: string | null = null;
    let gradePoints: number | null = null;

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

    normalizedGrades.push({
      enrollmentId: enrollment.id,
      sectionId: section.id,
      sectionCode: section.section_code,
      term: section.term,
      status: enrollment.status,
      courseId: course.id,
      courseCode: course.code,
      courseTitle: course.title,
      credits: toNumber(course.credits),
      finalGrade,
      gradePoints,
      weightedPercentage,
      breakdown,
      student: {
        id: student.id,
        studentNumber: student.student_number,
        fullName: studentUser.full_name,
        email: studentUser.email,
      },
    });
  }

  return { data: { role: "faculty", grades: normalizedGrades }, error: null };
}
