import { describe, expect, it } from "vitest";
import { UpsertGradebookScoreSchema, UpsertGradebookScoresBatchSchema } from "@/lib/validations/gradebook";
import { POST } from "@/app/api/gradebook/scores/route";

describe("grade submission validation", () => {
  it("rejects negative scores in single payload schema", () => {
    const parsed = UpsertGradebookScoreSchema.safeParse({
      itemId: "f7f4bb4b-4540-4ad5-8a1f-1f72d8f87c11",
      studentId: "7f0f4bc2-8b8c-4be0-9e2a-9f8da30a1310",
      score: -1,
    });

    expect(parsed.success).toBe(false);
  });

  it("rejects negative scores in batch payload schema", () => {
    const parsed = UpsertGradebookScoresBatchSchema.safeParse({
      scores: [
        {
          itemId: "f7f4bb4b-4540-4ad5-8a1f-1f72d8f87c11",
          studentId: "7f0f4bc2-8b8c-4be0-9e2a-9f8da30a1310",
          score: -10,
        },
      ],
    });

    expect(parsed.success).toBe(false);
  });

  it("returns invalid_input for malformed request payload", async () => {
    const request = new Request("http://localhost/api/gradebook/scores", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ score: "not-a-number" }),
    });

    const response = await POST(request);
    const json = (await response.json()) as { error: string; message: string };

    expect(response.status).toBe(400);
    expect(json.error).toBe("invalid_input");
  });
});
