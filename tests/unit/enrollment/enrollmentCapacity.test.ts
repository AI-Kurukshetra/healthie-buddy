import { describe, expect, it } from "vitest";
import { isSectionFull } from "@/lib/enrollment/rules";

describe("enrollment capacity rules", () => {
  it("returns false when seats are still available", () => {
    expect(isSectionFull(18, 20)).toBe(false);
  });

  it("returns true when enrolled count reaches capacity", () => {
    expect(isSectionFull(20, 20)).toBe(true);
  });

  it("returns true when enrolled count exceeds capacity", () => {
    expect(isSectionFull(21, 20)).toBe(true);
  });
});
