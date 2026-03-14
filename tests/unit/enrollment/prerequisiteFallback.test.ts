import { describe, expect, it } from "vitest";
import { isMissingSchemaObjectError } from "@/lib/api/enrollments";

describe("prerequisite schema fallback detection", () => {
  it("treats missing PostgREST schema-cache tables as optional prerequisite config", () => {
    expect(
      isMissingSchemaObjectError({
        code: "PGRST205",
        message: "Could not find the table 'public.course_prerequisites' in the schema cache.",
      }),
    ).toBe(true);
  });

  it("treats missing PostgREST schema-cache columns as optional prerequisite config", () => {
    expect(
      isMissingSchemaObjectError({
        code: "PGRST204",
        message: "Could not find the column 'prerequisite_course_id' in the schema cache.",
      }),
    ).toBe(true);
  });

  it("does not swallow unrelated prerequisite lookup errors", () => {
    expect(
      isMissingSchemaObjectError({
        code: "42501",
        message: "permission denied for table course_prerequisites",
      }),
    ).toBe(false);
  });
});
