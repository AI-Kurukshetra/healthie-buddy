"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { type AppRole, isAppRole } from "@/lib/auth/types";

function getField(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

async function getRoleIdByCode(role: AppRole) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("roles")
    .select("id")
    .eq("code", role)
    .single<{ id: string }>();

  if (error || !data?.id) {
    throw new Error("Role is not configured.");
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
  const roleId = await getRoleIdByCode(roleInput);

  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  });

  if (signUpError || !authData.user?.id) {
    redirect("/register?error=signup_failed");
  }

  const userId = authData.user.id;

  const { error: userInsertError } = await supabase.from("users").insert({
    id: userId,
    role_id: roleId,
    email,
    full_name: fullName,
  });

  if (userInsertError) {
    redirect("/register?error=user_profile_failed");
  }

  if (roleInput === "student") {
    const { error } = await supabase.from("students").insert({
      user_id: userId,
      student_number: roleIdentifier("STU", userId),
    });

    if (error) {
      redirect("/register?error=student_profile_failed");
    }
  }

  if (roleInput === "faculty") {
    const { error } = await supabase.from("faculty").insert({
      user_id: userId,
      employee_number: roleIdentifier("FAC", userId),
    });

    if (error) {
      redirect("/register?error=faculty_profile_failed");
    }
  }

  redirect("/dashboard");
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
