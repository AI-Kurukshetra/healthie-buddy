"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/components/ui/toast";
import type { SectionEnrollmentStatus } from "@/components/courses/types";

type EnrollmentButtonProps = {
  sectionId: string;
  sectionCode: string;
  enrollmentStatus: SectionEnrollmentStatus;
  seatsRemaining: number;
};

type EnrollmentMutationResponse =
  | {
      success?: true;
      enrollmentId?: string;
      error?: string;
      message?: string;
      missingPrerequisiteCourseIds?: string[];
    }
  | null;

const ENROLLMENT_ERROR_MESSAGE: Record<string, string> = {
  already_enrolled: "You are already enrolled in this section.",
  section_full: "This section is full.",
  schedule_conflict: "This section conflicts with one of your current or completed sections.",
  prerequisite_not_met: "You do not meet the prerequisite requirements for this section.",
  invalid_input: "The selected section could not be enrolled.",
  enrollment_failed: "Enrollment failed. Please try again.",
};

export function EnrollmentButton({
  sectionId,
  sectionCode,
  enrollmentStatus,
  seatsRemaining,
}: EnrollmentButtonProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localStatus, setLocalStatus] = useState<SectionEnrollmentStatus>(enrollmentStatus);

  useEffect(() => {
    setLocalStatus(enrollmentStatus);
  }, [enrollmentStatus]);

  const effectiveStatus = localStatus;

  if (effectiveStatus === "completed") {
    return (
      <Button className="w-full" disabled variant="outline">
        Completed
      </Button>
    );
  }

  if (effectiveStatus === "enrolled") {
    return (
      <Button className="w-full" disabled variant="secondary">
        Enrolled
      </Button>
    );
  }

  if (seatsRemaining <= 0) {
    return (
      <Button className="w-full" disabled variant="outline">
        Section Full
      </Button>
    );
  }

  const actionLabel = effectiveStatus === "dropped" ? "Re-enroll" : "Enroll";

  async function handleEnroll() {
    setIsSubmitting(true);

    const response = await fetch("/api/enrollments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sectionId }),
    });

    const payload = (await response.json().catch(() => null)) as EnrollmentMutationResponse;
    setIsSubmitting(false);

    if (!response.ok) {
      const errorCode = payload?.error;
      const message = (errorCode ? ENROLLMENT_ERROR_MESSAGE[errorCode] : null) ?? payload?.message ?? "Enrollment failed. Please try again.";

      if (errorCode === "already_enrolled") {
        setLocalStatus("enrolled");
        router.refresh();
      }

      toast({
        title: "Enrollment not completed",
        description: message,
        variant: "destructive",
      });
      return;
    }

    setLocalStatus("enrolled");
    toast({
      title: effectiveStatus === "dropped" ? "Enrollment restored" : "Enrollment confirmed",
      description:
        effectiveStatus === "dropped"
          ? `You have been re-enrolled in ${sectionCode}.`
          : `You are now enrolled in ${sectionCode}.`,
      variant: "success",
    });
    router.refresh();
  }

  return (
    <Button className="w-full" disabled={isSubmitting} onClick={handleEnroll} variant="secondary">
      {isSubmitting ? (
        <>
          <LoadingSpinner className="h-4 w-4" />
          <span>{effectiveStatus === "dropped" ? "Re-enrolling..." : "Enrolling..."}</span>
        </>
      ) : (
        actionLabel
      )}
    </Button>
  );
}
