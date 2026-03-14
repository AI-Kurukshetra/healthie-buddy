import { forbidden, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { type AppRole, isAppRole, type SessionUser } from "./types";

type UserRow = {
  id: string;
  email: string;
  full_name: string;
  role_id: string;
};

type RoleRow = {
  code: string;
};

export async function getSessionUser(): Promise<SessionUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) {
    return null;
  }

  const { data: userRow, error: userError } = await supabase
    .from("users")
    .select("id,email,full_name,role_id")
    .eq("id", user.id)
    .maybeSingle<UserRow>();

  if (userError) {
    console.error("getSessionUser: users lookup failed", {
      code: userError.code,
      message: userError.message,
      details: userError.details,
      hint: userError.hint,
      userId: user.id,
    });
    return null;
  }

  if (!userRow) {
    return null;
  }

  const { data: roleRow, error: roleError } = await supabase
    .from("roles")
    .select("code")
    .eq("id", userRow.role_id)
    .maybeSingle<RoleRow>();

  if (roleError) {
    console.error("getSessionUser: roles lookup failed", {
      code: roleError.code,
      message: roleError.message,
      details: roleError.details,
      hint: roleError.hint,
      userId: user.id,
      roleId: userRow.role_id,
    });
    return null;
  }

  if (!roleRow?.code || !isAppRole(roleRow.code)) {
    return null;
  }

  return {
    id: userRow.id,
    email: userRow.email,
    fullName: userRow.full_name,
    role: roleRow.code,
  };
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

export async function requireRole(
  allowedRoles: AppRole | AppRole[],
): Promise<SessionUser> {
  const user = await requireUser();
  const allowed = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  if (!allowed.includes(user.role)) {
    forbidden();
  }
  return user;
}
