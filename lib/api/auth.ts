import type { SupabaseClient } from "@supabase/supabase-js";
import { isAppRole, type AppRole } from "@/lib/auth/types";

type RoleRow = {
  code: string;
};

type UserRow = {
  role_id: string;
};

type StudentRow = {
  id: string;
};

type FacultyRow = {
  id: string;
};

export type AuthError = {
  status: number;
  error: string;
  message: string;
};

export type AuthenticatedContext = {
  userId: string;
  role: AppRole;
};

export type StudentContext = {
  userId: string;
  studentId: string;
};

export type FacultyContext = {
  userId: string;
  facultyId: string;
};

async function resolveRole(supabase: SupabaseClient, userId: string): Promise<AppRole | null> {
  const { data: userRow, error: userRowError } = await supabase
    .from("users")
    .select("role_id")
    .eq("id", userId)
    .maybeSingle<UserRow>();

  if (userRowError || !userRow?.role_id) {
    return null;
  }

  const { data: roleRow, error: roleError } = await supabase
    .from("roles")
    .select("code")
    .eq("id", userRow.role_id)
    .maybeSingle<RoleRow>();

  if (roleError || !roleRow?.code || !isAppRole(roleRow.code)) {
    return null;
  }

  return roleRow.code;
}

export async function requireAuthenticatedContext(
  supabase: SupabaseClient,
): Promise<{ data: AuthenticatedContext | null; error: AuthError | null }> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user?.id) {
    return {
      data: null,
      error: {
        status: 401,
        error: "unauthenticated",
        message: "You must be signed in.",
      },
    };
  }

  const role = await resolveRole(supabase, user.id);
  if (!role) {
    return {
      data: null,
      error: {
        status: 403,
        error: "forbidden",
        message: "User role is not configured.",
      },
    };
  }

  return {
    data: { userId: user.id, role },
    error: null,
  };
}

export async function requireStudentContext(
  supabase: SupabaseClient,
): Promise<{ data: StudentContext | null; error: AuthError | null }> {
  const { data: authContext, error: authError } = await requireAuthenticatedContext(supabase);

  if (authError || !authContext) {
    return { data: null, error: authError };
  }

  if (authContext.role !== "student") {
    return {
      data: null,
      error: {
        status: 403,
        error: "forbidden",
        message: "Student role is required.",
      },
    };
  }

  const { data: studentRow, error: studentError } = await supabase
    .from("students")
    .select("id")
    .eq("user_id", authContext.userId)
    .maybeSingle<StudentRow>();

  if (studentError || !studentRow?.id) {
    return {
      data: null,
      error: {
        status: 403,
        error: "forbidden",
        message: "Student profile is missing.",
      },
    };
  }

  return {
    data: { userId: authContext.userId, studentId: studentRow.id },
    error: null,
  };
}

export async function requireFacultyContext(
  supabase: SupabaseClient,
): Promise<{ data: FacultyContext | null; error: AuthError | null }> {
  const { data: authContext, error: authError } = await requireAuthenticatedContext(supabase);

  if (authError || !authContext) {
    return { data: null, error: authError };
  }

  if (authContext.role !== "faculty") {
    return {
      data: null,
      error: {
        status: 403,
        error: "forbidden",
        message: "Faculty role is required.",
      },
    };
  }

  const { data: facultyRow, error: facultyError } = await supabase
    .from("faculty")
    .select("id")
    .eq("user_id", authContext.userId)
    .maybeSingle<FacultyRow>();

  if (facultyError || !facultyRow?.id) {
    return {
      data: null,
      error: {
        status: 403,
        error: "forbidden",
        message: "Faculty profile is missing.",
      },
    };
  }

  return {
    data: { userId: authContext.userId, facultyId: facultyRow.id },
    error: null,
  };
}
