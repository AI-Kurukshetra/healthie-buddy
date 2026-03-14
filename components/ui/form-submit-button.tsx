"use client";

import type { ComponentProps, ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

type FormSubmitButtonProps = Omit<ComponentProps<typeof Button>, "children"> & {
  children: ReactNode;
  pendingLabel: string;
};

export function FormSubmitButton({
  children,
  disabled,
  pendingLabel,
  ...props
}: FormSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button
      aria-busy={pending}
      disabled={pending || disabled}
      type="submit"
      {...props}
    >
      {pending ? (
        <>
          <LoadingSpinner className="h-4 w-4" />
          <span>{pendingLabel}</span>
        </>
      ) : (
        children
      )}
    </Button>
  );
}
