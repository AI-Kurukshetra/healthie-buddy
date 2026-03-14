"use client";

import { useFormStatus } from "react-dom";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export function LogoutMenuItem() {
  const { pending } = useFormStatus();

  return (
    <DropdownMenuItem
      aria-busy={pending}
      className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
      closeOnSelect={false}
      disabled={pending}
      type="submit"
    >
      {pending ? (
        <>
          <LoadingSpinner className="h-4 w-4" />
          <span>Logging out...</span>
        </>
      ) : (
        "Logout"
      )}
    </DropdownMenuItem>
  );
}
