# Demo Guide

## Goal

Record a short product demo that clearly shows:
- role-aware authentication
- student academic visibility
- faculty grading workflow
- admin access boundaries
- the enrollment business rules and current UI limitation

## Demo Accounts

| Role | Email | Password |
| --- | --- | --- |
| Admin | `aditi.narang@demo-campus.edu` | `Demo@12345` |
| Faculty | `ananya.iyer@demo-campus.edu` | `Demo@12345` |
| Student | `aarav.sharma@demo-campus.edu` | `Demo@12345` |

## Domain Summary

The app models a community-college SIS workflow:
- `users` holds the application profile linked 1:1 with `auth.users`
- `students` and `faculty` are role-specific profiles
- `courses` are academic offerings
- `sections` are scheduled instances of courses in a specific term
- `enrollments` connect students to sections with `enrolled | completed | dropped`
- `gradebook_items` define assessments inside a section
- `gradebook_scores` store per-student assessment scores
- `grades` store final grades for completed enrollments
- `transcripts` and transcript aggregation expose GPA-relevant academic history

## What Each Role Can Do

### Student
- sign in and land on `/student`
- browse the course catalog at `/courses`
- view current and completed enrollments at `/student/enrollments`
- view transcript, grade breakdown, and GPA at `/student/transcript`

### Faculty
- sign in and land on `/faculty`
- view assigned sections and grading progress
- open section gradebooks
- create gradebook items
- enter and batch-submit scores for enrolled students

### Admin
- sign in and land on `/admin`
- access protected admin-only routes
- open `/admin/users` placeholder
- browse shared catalog pages

Important MVP note:
- admin user-management CRUD is not implemented yet
- student enrollment mutation exists in the backend, but there is no catalog-side enroll button in the current UI

## Seeded Demo Relationships

- Faculty `ananya.iyer@demo-campus.edu` teaches:
  - `SPR26-A1` / `CSE101` / section id `00000000-0000-0000-0000-000000003101`
  - `SPR26-A7` / `DSA201` / section id `00000000-0000-0000-0000-000000003107`
- Student `aarav.sharma@demo-campus.edu` already has:
  - completed: `CSE101` (`SPR26-A1`)
  - completed: `PHY101` (`SPR26-A3`)
  - enrolled: `MGT101` (`SPR26-A6`)

This makes `SPR26-A1` the best faculty-to-student demo bridge, because both seeded demo users are connected to it.

## Recommended Video Flow

Target length: 4 to 6 minutes.

### 1. Open With Product Positioning
Say:
"This is a role-based campus management prototype for a community college. The MVP focuses on five workflows: authentication, course browsing, enrollment rules, faculty grade entry, and transcript/GPA visibility."

### 2. Student Role
1. Log in as `aarav.sharma@demo-campus.edu`.
2. Point out that `/` redirects automatically to `/student`.
3. On the dashboard:
   - show GPA summary
   - show enrolled courses
   - show weekly schedule
4. Open `Courses` from the sidebar:
   - explain that the catalog shows course code, title, credits, section term, instructor, room, capacity, and seats remaining
   - explicitly say this page is currently browse-only in the UI
5. Open `Enrollments`:
   - show active vs completed sections
   - show credits attempted
6. Open `Transcript`:
   - show grade breakdown by assessment
   - show weighted percentage, final grade, GPA points, and GPA summary
7. Log out from the header menu.

### 3. Faculty Role
1. Log in as `ananya.iyer@demo-campus.edu`.
2. On `/faculty`:
   - show assigned section count
   - show student count
   - show sections that still need grading
3. Open `Sections`:
   - show the assigned-sections table
   - explain that completion is computed from `gradebook_scores / (students × items)`
4. Open `Gradebook`.
5. Use section `SPR26-A1` if it is not already selected.
6. In the gradebook:
   - show enrolled students
   - show existing items such as Assignment 1, Assignment 2, Midterm, Final
   - edit one of Aarav Sharma's scores to make a visible change
   - click `Submit Scores`
7. Optionally create a new item:
   - enter title
   - set max points
   - set optional due date
   - click `Create Item`
8. Explain the rules:
   - faculty can only access their own sections
   - scores cannot exceed max points
   - faculty can only score students actually enrolled in the section
9. Log out.

### 4. Student Verification
1. Log back in as `aarav.sharma@demo-campus.edu`.
2. Open `Transcript`.
3. Find `CSE101 / SPR26-A1`.
4. Show that the assessment breakdown and computed grade reflect the faculty updates.
5. Explain that GPA is calculated from completed sections only.
6. Log out.

### 5. Admin Role
1. Log in as `aditi.narang@demo-campus.edu`.
2. Show that the app routes the admin user to `/admin`.
3. Open `Users` from the sidebar.
4. Say clearly:
   - this is a reserved placeholder for admin user management
   - the MVP demonstrates admin authorization boundaries more than full admin tooling
5. Open `Courses` to show the shared catalog view is still accessible.
6. End with the architecture/security message:
   - middleware guards routes
   - server actions and APIs enforce role checks
   - database RLS protects the underlying data

## Enrollment Logic

The enrollment mutation is implemented in `POST /api/enrollments`.

When a student enrolls, the system checks:
1. the section exists
2. the student is not already enrolled
3. the section is not full
4. there is no same-term time conflict
5. prerequisites are met if a prerequisite model exists
6. dropped enrollments are reactivated instead of duplicated

Important current limitation:
- the UI does not yet expose an `Enroll` button
- for the video, describe the rule set while showing the `Courses` page
- if you must demonstrate a live enrollment, use the optional API-assisted fallback below

## Optional API-Assisted Enrollment Demo

While logged in as `aarav.sharma@demo-campus.edu`, open the browser console and run:

```js
fetch("/api/enrollments", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    sectionId: "00000000-0000-0000-0000-000000003107",
  }),
})
  .then(async (response) => ({
    status: response.status,
    body: await response.json(),
  }))
  .then(console.log);
```

Expected behavior:
- success returns `{ success: true, enrollmentId }`
- invalid scenarios return machine-readable errors like:
  - `already_enrolled`
  - `section_full`
  - `schedule_conflict`
  - `prerequisite_not_met`

If `SPR26-A7` was already used earlier, switch to another safe section id such as:
- `00000000-0000-0000-0000-000000003102`
- `00000000-0000-0000-0000-000000003104`
- `00000000-0000-0000-0000-000000003105`
- `00000000-0000-0000-0000-000000003108`
- `00000000-0000-0000-0000-000000003109`
- `00000000-0000-0000-0000-000000003110`

## Best Talking Points

- "Authentication is role-aware, and the app redirects each user to the correct workspace."
- "The student experience focuses on visibility: schedule, enrollments, transcript, and GPA."
- "The faculty experience focuses on operational grading: sections, assessment setup, and score submission."
- "The transcript is not hard-coded. It is derived from gradebook scores and mapped to GPA."
- "Security is enforced at three layers: middleware, server-side role checks, and row-level security in Postgres."
- "Enrollment business rules are already implemented, even though the current UI still needs the final enroll action surface."

## What Not To Overclaim

- Do not present the current admin area as full user management. It is a protected placeholder route.
- Do not say student enrollment is fully clickable in the UI. The mutation exists, but the catalog page is still read-only.
