"use server";

import { requireRole } from "@/lib/auth/server";

export async function studentOnlyAction() {
  await requireRole("student");
}

export async function facultyOnlyAction() {
  await requireRole("faculty");
}

export async function adminOnlyAction() {
  await requireRole("admin");
}
