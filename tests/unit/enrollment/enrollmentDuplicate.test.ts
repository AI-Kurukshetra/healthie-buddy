import { describe, expect, it } from "vitest";
import { isDuplicateEnrollment } from "@/lib/enrollment/rules";

describe("enrollment duplicate rules", () => {
  it("returns false for dropped enrollment status", () => {
    expect(isDuplicateEnrollment("dropped")).toBe(false);
  });

  it("returns true for enrolled status", () => {
    expect(isDuplicateEnrollment("enrolled")).toBe(true);
  });

  it("returns true for completed status", () => {
    expect(isDuplicateEnrollment("completed")).toBe(true);
  });

  it("returns false when there is no existing status", () => {
    expect(isDuplicateEnrollment(undefined)).toBe(false);
  });
});
