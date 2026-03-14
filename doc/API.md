# API Reference

## Conventions

- Authentication uses the Supabase SSR session cookie. There is no separate bearer-token layer in the MVP.
- All route handlers live under `app/api/*`.
- Request and response contracts are validated with Zod.
- Error responses use the shared envelope below:

```ts
type ApiErrorBody = {
  error: string;
  message: string;
};
```

- All ids use the shared Postgres-compatible UUID validator `DbUuidSchema`.

## Auth Surface

Authentication is handled with Server Actions, not `app/api/auth/*` REST endpoints.

| Entry Point | Location | Request Shape | Result |
| --- | --- | --- | --- |
| Login | `app/(auth)/actions.ts#loginAction` | `FormData { email, password }` | Calls `supabase.auth.signInWithPassword`, redirects to `/` on success |
| Register | `app/(auth)/actions.ts#registerAction` | `FormData { fullName, email, password, role }` | Calls `supabase.auth.signUp`, provisions role-linked profile rows, redirects to role home or `/login?registered=1` |
| Logout | `app/(auth)/actions.ts#logoutAction` | none | Calls `supabase.auth.signOut`, redirects to `/login` |

## Catalog Endpoints

### `GET /api/courses`
- Method: `GET`
- Auth requirements: any authenticated user
- Request schema: none
- Response schema: `CoursesResponseSchema`

```ts
{
  courses: Array<{
    id: uuid;
    code: string;
    title: string;
    description: string | null;
    credits: number;
  }>;
}
```

### `GET /api/courses/:id/sections`
- Method: `GET`
- Auth requirements: any authenticated user
- Request schema:

```ts
CourseIdParamSchema = {
  id: uuid;
}
```

- Response schema: `CourseSectionsResponseSchema`

```ts
{
  course: {
    id: uuid;
    code: string;
    title: string;
  };
  sections: Array<{
    id: uuid;
    term: string;
    sectionCode: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    room: string | null;
    capacity: number;
    instructorName: string | null;
  }>;
}
```

## Enrollment Endpoints

### `POST /api/enrollments`
- Method: `POST`
- Auth requirements: authenticated `student`
- Request schema:

```ts
CreateEnrollmentSchema = {
  sectionId: uuid;
}
```

- Response schema: `EnrollmentMutationResponseSchema`

```ts
// success
{
  success: true;
  enrollmentId: uuid;
}

// conflict or validation outcome
{
  error: string;
  message: string;
  missingPrerequisiteCourseIds?: uuid[];
}
```

- Notes:
  - Enforces duplicate enrollment, capacity, schedule conflict, prerequisite, and re-enrollment rules.

### `GET /api/enrollments/my`
- Method: `GET`
- Auth requirements: authenticated `student`
- Request schema: none
- Response schema: `MyEnrollmentsResponseSchema`

```ts
{
  enrollments: Array<{
    id: uuid;
    status: "enrolled" | "completed" | "dropped";
    enrolledAt: string;
    section: {
      id: uuid;
      term: string;
      sectionCode: string;
      dayOfWeek: number;
      startTime: string;
      endTime: string;
      room: string | null;
      course: {
        id: uuid;
        code: string;
        title: string;
        credits: number;
      };
    };
  }>;
}
```

## Gradebook Endpoints

### `GET /api/sections/:sectionId/gradebook`
- Method: `GET`
- Auth requirements:
  - `faculty` must own the section
  - `student` must be enrolled in the section
- Request schema:

```ts
SectionIdParamSchema = {
  sectionId: uuid;
}
```

- Response schema: `FacultySectionGradebookResponseSchema | StudentSectionGradebookResponseSchema`

```ts
// faculty
{
  role: "faculty";
  section: {
    id: uuid;
    term: string;
    sectionCode: string;
    course: {
      id: uuid | null;
      code: string;
      title: string;
    };
  };
  items: Array<{
    id: uuid | null;
    sectionId: uuid;
    title: string;
    description: string | null;
    maxPoints: number;
    dueAt: string | null;
  }>;
  students: Array<{
    id: uuid;
    studentNumber: string;
    fullName: string;
    email: string;
  }>;
  scores: Array<{
    id: uuid | null;
    itemId: uuid;
    studentId: uuid;
    score: number;
    feedback: string | null;
    gradedAt: string;
  }>;
}

// student
{
  role: "student";
  section: { ... };
  items: Array<...>;
  scores: Array<...>;
}
```

### `POST /api/gradebook/items`
- Method: `POST`
- Auth requirements: authenticated `faculty` for their own section
- Request schema:

```ts
CreateGradebookItemSchema = {
  sectionId: uuid;
  title: string;
  description?: string | null;
  maxPoints: number;
  dueAt?: string | null;
}
```

- Response schema: `CreateGradebookItemResponseSchema`

```ts
{
  item: {
    id: uuid | null;
    sectionId: uuid;
    title: string;
    description: string | null;
    maxPoints: number;
    dueAt: string | null;
  };
}
```

### `POST /api/gradebook/scores`
- Method: `POST`
- Auth requirements: authenticated `faculty` for the underlying section
- Request schema:

```ts
// single-row mode
UpsertGradebookScoreSchema = {
  itemId: uuid;
  studentId: uuid;
  score: number;
  feedback?: string | null;
}

// batch mode
UpsertGradebookScoresBatchSchema = {
  scores: UpsertGradebookScoreSchema[];
}
```

- Response schema: `GradebookScoresResponseSchema`

```ts
{
  scores: Array<{
    id: uuid | null;
    itemId: uuid;
    studentId: uuid;
    score: number;
    feedback: string | null;
    gradedAt: string;
  }>;
}
```

- Notes:
  - The route accepts both single-score and batch-score payloads.
  - Ownership, enrollment, and max-score validation are enforced per score row.

## Dashboard Summary Endpoints

### `GET /api/students/me`
- Method: `GET`
- Auth requirements: authenticated `student`
- Request schema: none
- Response schema: `StudentMeResponseSchema`

```ts
{
  student: {
    id: uuid;
    userId: uuid;
    email: string;
    fullName: string;
    studentNumber: string;
    programName: string | null;
    enrollmentYear: number | null;
  };
  summary: {
    enrolledSections: number;
    completedSections: number;
    creditsAttempted: number;
    creditsCompleted: number;
    gpa: number;
  };
}
```

### `GET /api/faculty/me`
- Method: `GET`
- Auth requirements: authenticated `faculty`
- Request schema: none
- Response schema: `FacultyMeResponseSchema`

```ts
{
  faculty: {
    id: uuid;
    userId: uuid;
    email: string;
    fullName: string;
    employeeNumber: string;
    departmentName: string | null;
  };
  summary: {
    assignedSections: number;
    enrolledStudents: number;
    gradebookItems: number;
    scoredCells: number;
    completionPercent: number;
  };
}
```

## Grades & Transcript Endpoints

### `GET /api/grades`
- Method: `GET`
- Auth requirements:
  - authenticated `student` receives student grade view
  - authenticated `faculty` receives owned-section grade view
  - `admin` is rejected with `403 forbidden`
- Request schema: none
- Response schema:

```ts
StudentGradesResponseSchema | FacultyGradesResponseSchema
```

```ts
// student
{
  role: "student";
  grades: Array<{
    enrollmentId: uuid;
    sectionId: uuid;
    sectionCode: string;
    term: string;
    status: "enrolled" | "completed";
    courseId: uuid;
    courseCode: string;
    courseTitle: string;
    credits: number;
    finalGrade: string | null;
    gradePoints: number | null;
    weightedPercentage: number | null;
    breakdown: Array<{
      itemId: uuid;
      title: string;
      maxPoints: number;
      score: number | null;
      percentage: number | null;
    }>;
  }>;
}

// faculty adds student identity per record
{
  role: "faculty";
  grades: Array<{
    ...studentGradeFields;
    student: {
      id: uuid;
      studentNumber: string;
      fullName: string;
      email: string;
    };
  }>;
}
```

### `GET /api/transcripts/me`
- Method: `GET`
- Auth requirements: authenticated `student`
- Request schema: none
- Response schema: `TranscriptMeResponseSchema`

```ts
{
  courses: Array<{
    enrollmentId: uuid;
    sectionId: uuid;
    sectionCode: string;
    status: "enrolled" | "completed";
    term: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    room: string | null;
    courseId: uuid;
    courseCode: string;
    courseTitle: string;
    credits: number;
    weightedPercentage: number | null;
    finalGrade: string | null;
    gradePoints: number | null;
    hasGradebookItems: boolean;
    breakdown: Array<{
      itemId: uuid;
      title: string;
      maxPoints: number;
      score: number | null;
      percentage: number | null;
    }>;
  }>;
  credits_attempted: number;
  credits_completed: number;
  gpa: number;
}
```

## Endpoint Summary

| Method | Path | Auth |
| --- | --- | --- |
| `GET` | `/api/courses` | Authenticated |
| `GET` | `/api/courses/:id/sections` | Authenticated |
| `POST` | `/api/enrollments` | Student |
| `GET` | `/api/enrollments/my` | Student |
| `GET` | `/api/students/me` | Student |
| `GET` | `/api/faculty/me` | Faculty |
| `GET` | `/api/grades` | Student or Faculty |
| `GET` | `/api/transcripts/me` | Student |
| `GET` | `/api/sections/:sectionId/gradebook` | Faculty owner or enrolled student |
| `POST` | `/api/gradebook/items` | Faculty |
| `POST` | `/api/gradebook/scores` | Faculty |
