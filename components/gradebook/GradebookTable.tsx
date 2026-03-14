"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScoreInputCell } from "@/components/gradebook/ScoreInputCell";

type SectionOption = {
  id: string;
  label: string;
};

type GradebookStudent = {
  id: string;
  studentNumber: string;
  fullName: string;
  email: string;
};

type GradebookItem = {
  id: string;
  sectionId: string;
  title: string;
  description: string | null;
  maxPoints: number;
  dueAt: string | null;
};

type GradebookScore = {
  id: string;
  itemId: string;
  studentId: string;
  score: number;
  feedback: string | null;
  gradedAt: string;
};

type GradebookResponse = {
  role: string;
  section: {
    id: string;
    term: string;
    sectionCode: string;
    course: {
      id: string | null;
      code: string;
      title: string;
    };
  };
  items: GradebookItem[];
  students: GradebookStudent[];
  scores: GradebookScore[];
};

type GradebookTableProps = {
  sectionOptions: SectionOption[];
  currentSectionId: string;
};

type DraftMap = Record<string, number | null>;

function keyFor(itemId: string, studentId: string) {
  return `${itemId}:${studentId}`;
}

export function GradebookTable({ sectionOptions, currentSectionId }: GradebookTableProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingScores, setIsSubmittingScores] = useState(false);
  const [isCreatingItem, setIsCreatingItem] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [data, setData] = useState<GradebookResponse | null>(null);
  const [itemTitle, setItemTitle] = useState("");
  const [itemMaxPoints, setItemMaxPoints] = useState("100");
  const [itemDueAt, setItemDueAt] = useState("");
  const [draftScores, setDraftScores] = useState<DraftMap>({});

  const loadGradebook = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const response = await fetch(`/api/sections/${currentSectionId}/gradebook`, {
      method: "GET",
      cache: "no-store",
    });

    const payload = (await response.json().catch(() => null)) as
      | (GradebookResponse & { message?: string })
      | { message?: string }
      | null;

    if (!response.ok) {
      setData(null);
      setDraftScores({});
      setError(payload?.message ?? "Could not load gradebook data.");
      setIsLoading(false);
      return;
    }

    setData(payload as GradebookResponse);
    setDraftScores({});
    setIsLoading(false);
  }, [currentSectionId]);

  useEffect(() => {
    void loadGradebook();
  }, [loadGradebook]);

  const scoreMap = useMemo(() => {
    const map = new Map<string, GradebookScore>();

    for (const row of data?.scores ?? []) {
      map.set(keyFor(row.itemId, row.studentId), row);
    }

    return map;
  }, [data]);

  const pendingDraftKeys = useMemo(() => {
    return Object.keys(draftScores).filter((draftKey) => {
      const nextValue = draftScores[draftKey];
      const existing = scoreMap.get(draftKey);
      const existingValue = existing?.score ?? null;
      return nextValue !== existingValue;
    });
  }, [draftScores, scoreMap]);

  function handleSectionChange(nextSectionId: string) {
    if (!nextSectionId || nextSectionId === currentSectionId) {
      return;
    }

    router.push(`/faculty/sections/${nextSectionId}/gradebook`);
  }

  async function handleCreateItem() {
    const maxPoints = Number(itemMaxPoints);

    if (!itemTitle.trim()) {
      setError("Item title is required.");
      return;
    }

    if (!Number.isFinite(maxPoints) || maxPoints <= 0) {
      setError("Max points must be a positive number.");
      return;
    }

    setIsCreatingItem(true);
    setError(null);
    setSuccess(null);

    const response = await fetch("/api/gradebook/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sectionId: currentSectionId,
        title: itemTitle.trim(),
        maxPoints,
        dueAt: itemDueAt ? new Date(itemDueAt).toISOString() : null,
      }),
    });

    const payload = (await response.json().catch(() => null)) as { message?: string } | null;
    setIsCreatingItem(false);

    if (!response.ok) {
      setError(payload?.message ?? "Could not create gradebook item.");
      return;
    }

    setItemTitle("");
    setItemMaxPoints("100");
    setItemDueAt("");
    setSuccess("Gradebook item created.");
    await loadGradebook();
  }

  function getVisibleScore(itemId: string, studentId: string): number | null {
    const rowKey = keyFor(itemId, studentId);
    if (rowKey in draftScores) {
      return draftScores[rowKey];
    }

    return scoreMap.get(rowKey)?.score ?? null;
  }

  function handleDraftScoreChange(itemId: string, studentId: string, nextScore: number | null) {
    const rowKey = keyFor(itemId, studentId);
    setDraftScores((prev) => ({ ...prev, [rowKey]: nextScore }));
    setError(null);
  }

  async function handleSubmitScores() {
    if (!data || pendingDraftKeys.length === 0) {
      setSuccess("No score changes to submit.");
      return;
    }

    const payloadScores = pendingDraftKeys.map((draftKey) => {
      const [itemId, studentId] = draftKey.split(":");
      return { itemId, studentId, score: draftScores[draftKey] };
    });

    const hasEmptyDraft = payloadScores.some((entry) => entry.score === null);
    if (hasEmptyDraft) {
      setError("Empty score cells cannot be submitted. Enter a valid score for each changed cell.");
      return;
    }

    setIsSubmittingScores(true);
    setError(null);
    setSuccess(null);

    const response = await fetch("/api/gradebook/scores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        scores: payloadScores.map((entry) => ({
          itemId: entry.itemId,
          studentId: entry.studentId,
          score: entry.score as number,
        })),
      }),
    });

    const payload = (await response.json().catch(() => null)) as { message?: string } | null;
    setIsSubmittingScores(false);

    if (!response.ok) {
      setError(payload?.message ?? "Could not submit scores.");
      return;
    }

    setSuccess(`Submitted ${payloadScores.length} score update${payloadScores.length > 1 ? "s" : ""}.`);
    await loadGradebook();
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Section Gradebook</CardTitle>
          <CardDescription>Select one of your assigned sections to manage roster scores.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
          <div className="space-y-2">
            <Label htmlFor="sectionSelect">Section</Label>
            <Select
              id="sectionSelect"
              name="sectionSelect"
              value={currentSectionId}
              onChange={(event) => handleSectionChange(event.target.value)}
            >
              {sectionOptions.map((section) => (
                <option key={section.id} value={section.id}>
                  {section.label}
                </option>
              ))}
            </Select>
            <p className="text-xs text-gray-600">Only sections assigned to your faculty account are shown.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              className="w-auto"
              disabled={isLoading || isSubmittingScores || pendingDraftKeys.length === 0}
              onClick={handleSubmitScores}
              variant="secondary"
            >
              {isSubmittingScores ? "Submitting..." : `Submit Scores (${pendingDraftKeys.length})`}
            </Button>
            <Button
              type="button"
              className="w-auto"
              disabled={isLoading}
              onClick={() => {
                setDraftScores({});
                setError(null);
                setSuccess("Unsaved score edits were discarded.");
              }}
              variant="outline"
            >
              Discard Changes
            </Button>
          </div>
        </CardContent>
      </Card>

      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      ) : null}
      {success ? (
        <p className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">{success}</p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Grade Matrix</CardTitle>
            <CardDescription>
              {isLoading
                ? "Loading gradebook..."
                : `${data?.section.course.code ?? ""} ${data?.section.course.title ?? ""} • ${data?.section.term} • ${data?.section.sectionCode}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm text-gray-600">Loading enrolled students and gradebook items...</p>
            ) : !data || data.items.length === 0 ? (
              <p className="text-sm text-gray-600">No gradebook items yet. Create an item to begin score entry.</p>
            ) : data.students.length === 0 ? (
              <p className="text-sm text-gray-600">No enrolled students found for this section.</p>
            ) : (
              <div className="-mx-2 overflow-x-auto px-2">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-56">Student</TableHead>
                      {data.items.map((item) => (
                        <TableHead key={item.id} className="min-w-32">
                          <div className="space-y-1">
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-700">{item.title}</p>
                            <p className="text-[11px] normal-case tracking-normal text-gray-500">Max: {item.maxPoints}</p>
                          </div>
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.students.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>
                          <p className="font-medium text-gray-900">{student.fullName}</p>
                          <p className="text-xs text-gray-600">
                            {student.studentNumber} · {student.email}
                          </p>
                        </TableCell>
                        {data.items.map((item) => {
                          const scoreKey = keyFor(item.id, student.id);
                          return (
                            <TableCell key={scoreKey}>
                              <ScoreInputCell
                                score={getVisibleScore(item.id, student.id)}
                                maxPoints={item.maxPoints}
                                label={`score-${item.id}-${student.id}`}
                                disabled={isSubmittingScores}
                                onChange={(nextScore) => handleDraftScoreChange(item.id, student.id, nextScore)}
                              />
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Add Gradebook Item</CardTitle>
            <CardDescription>Create assignments, quizzes, or exams for this section.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="itemTitle">Item Title</Label>
              <Input
                id="itemTitle"
                value={itemTitle}
                onChange={(event) => setItemTitle(event.target.value)}
                placeholder="Assignment 1"
              />
              <p className="text-xs text-gray-600">Use clear titles so students can identify each assessment.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="itemMaxPoints">Maximum Points</Label>
              <Input
                id="itemMaxPoints"
                type="number"
                min={1}
                step="0.01"
                value={itemMaxPoints}
                onChange={(event) => setItemMaxPoints(event.target.value)}
              />
              <p className="text-xs text-gray-600">Scores entered in the matrix must stay within this limit.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="itemDueAt">Due Date (optional)</Label>
              <Input id="itemDueAt" type="datetime-local" value={itemDueAt} onChange={(event) => setItemDueAt(event.target.value)} />
              <p className="text-xs text-gray-600">Set a due date to organize grading order.</p>
            </div>

            <Button type="button" disabled={isCreatingItem || isLoading} onClick={handleCreateItem}>
              {isCreatingItem ? "Creating..." : "Create Item"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
