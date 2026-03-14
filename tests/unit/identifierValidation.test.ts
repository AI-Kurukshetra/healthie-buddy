import { describe, expect, it } from "vitest";
import { DbUuidSchema } from "@/lib/validations/identifiers";

describe("DbUuidSchema", () => {
  it("accepts deterministic seed uuids used by Postgres demo data", () => {
    const result = DbUuidSchema.safeParse(
      "00000000-0000-0000-0000-000000003107",
    );

    expect(result.success).toBe(true);
  });

  it("accepts RFC-style uuids too", () => {
    const result = DbUuidSchema.safeParse(
      "550e8400-e29b-41d4-a716-446655440000",
    );

    expect(result.success).toBe(true);
  });

  it("rejects malformed ids", () => {
    const result = DbUuidSchema.safeParse("section-3107");

    expect(result.success).toBe(false);
  });
});
