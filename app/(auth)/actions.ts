"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { type AppRole, isAppRole } from "@/lib/auth/types";
import type { SupabaseClient } from "@supabase/supabase-js";

function getField(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

type RoleLookupClient = SupabaseClient;

async function getRoleIdByCode(supabase: RoleLookupClient, role: AppRole) {
  const { data, error } = await supabase
    .from("roles")
    .select("id")
    .eq("code", role)
    .maybeSingle<{ id: string }>();

  if (error || !data?.id) {
    return null;
  }

  return data.id;
}

function roleIdentifier(prefix: string, userId: string) {
  return `${prefix}-${userId.slice(0, 8).toUpperCase()}`;
}

export async function registerAction(formData: FormData) {
  const fullName = getField(formData, "fullName");
  const email = getField(formData, "email");
  const password = getField(formData, "password");
  const roleInput = getField(formData, "role");

  if (!fullName || !email || !password || !isAppRole(roleInput)) {
    redirect("/register?error=invalid_input");
  }

  const supabase = await createClient();

  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  });

  if (signUpError || !authData.user?.id) {
    const errorCode = signUpError?.code ?? "unknown";
    const errorMessage = signUpError?.message ?? "No user id returned from signup.";
    console.error("registerAction: signup failed", {
      code: errorCode,
      message: errorMessage,
      status: signUpError?.status,
    });

    const params = new URLSearchParams({
      error: "signup_failed",
      error_code: errorCode,
      error_message: errorMessage,
    });

    redirect(`/register?${params.toString()}`);
  }

  // Supabase can return a user-like payload for existing emails without creating a new account.
  if (Array.isArray(authData.user.identities) && authData.user.identities.length === 0) {
    redirect("/register?error=email_in_use");
  }

  const privilegedSupabase = createAdminClient();
  const dbClient = privilegedSupabase ?? supabase;

  const roleId = await getRoleIdByCode(dbClient, roleInput);
  if (!roleId) {
    redirect("/register?error=role_not_configured");
  }
  const userId = authData.user.id;

  const { error: userInsertError } = await dbClient.from("users").upsert(
    {
      id: userId,
      role_id: roleId,
      email,
      full_name: fullName,
    },
    { onConflict: "id" },
  );

  if (userInsertError) {
    redirect("/register?error=user_profile_failed");
  }

  if (roleInput === "student") {
    const { error } = await dbClient.from("students").upsert(
      {
        user_id: userId,
        student_number: roleIdentifier("STU", userId),
      },
      { onConflict: "user_id" },
    );

    if (error) {
      redirect("/register?error=student_profile_failed");
    }
  }

  if (roleInput === "faculty") {
    const { error } = await dbClient.from("faculty").upsert(
      {
        user_id: userId,
        employee_number: roleIdentifier("FAC", userId),
      },
      { onConflict: "user_id" },
    );

    if (error) {
      redirect("/register?error=faculty_profile_failed");
    }
  }

  const hasSession = Boolean(authData.session);
  redirect(hasSession ? "/dashboard" : "/login?registered=1");
}

export async function loginAction(formData: FormData) {
  const email = getField(formData, "email");
  const password = getField(formData, "password");

  if (!email || !password) {
    redirect("/login?error=invalid_input");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect("/login?error=invalid_credentials");
  }

  redirect("/dashboard");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
