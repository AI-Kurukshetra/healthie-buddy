import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { NextResponse } from "next/server";
import { isAppRole } from "@/lib/auth/types";
import { homePathForRole, mapLegacyDashboardPath } from "@/lib/auth/routes";

const AUTH_ROUTES = ["/login", "/register"];
const PROTECTED_PREFIXES = ["/student", "/faculty", "/admin", "/courses"];

const ROLE_ROUTE_PREFIX: Record<string, string[]> = {
  student: ["/student"],
  faculty: ["/faculty"],
  admin: ["/admin"],
};

function redirectTo(request: NextRequest, pathname: string) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = "";
  return NextResponse.redirect(url);
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const { response, supabase, user } = await updateSession(request);

  async function getRoleCode(userId: string): Promise<string | null> {
    const { data: userRow, error: userError } = await supabase
      .from("users")
      .select("role_id")
      .eq("id", userId)
      .maybeSingle<{ role_id: string }>();

    if (userError) {
      console.error("middleware:getRoleCode users lookup failed", {
        code: userError.code,
        message: userError.message,
        details: userError.details,
        hint: userError.hint,
        userId,
        pathname,
      });
      return null;
    }

    if (!userRow?.role_id) {
      return null;
    }

    const { data: roleRow, error: roleError } = await supabase
      .from("roles")
      .select("code")
      .eq("id", userRow.role_id)
      .maybeSingle<{ code: string }>();

    if (roleError) {
      console.error("middleware:getRoleCode roles lookup failed", {
        code: roleError.code,
        message: roleError.message,
        details: roleError.details,
        hint: roleError.hint,
        userId,
        roleId: userRow.role_id,
        pathname,
      });
      return null;
    }

    return roleRow?.code ?? null;
  }

  if (pathname.startsWith("/dashboard")) {
    if (!user) {
      return redirectTo(request, "/login");
    }

    const roleCode = await getRoleCode(user.id);
    if (!roleCode || !isAppRole(roleCode)) {
      return redirectTo(request, "/forbidden");
    }

    if (pathname === "/dashboard") {
      return redirectTo(request, homePathForRole(roleCode));
    }

    const mappedPath = mapLegacyDashboardPath(pathname);
    if (mappedPath) {
      return redirectTo(request, mappedPath);
    }

    return redirectTo(request, homePathForRole(roleCode));
  }

  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));
  const isProtectedRoute = PROTECTED_PREFIXES.some((route) =>
    pathname.startsWith(route),
  );

  if (!user && isProtectedRoute) {
    return redirectTo(request, "/login");
  }

  if (user && isAuthRoute) {
    const roleCode = await getRoleCode(user.id);
    if (roleCode && isAppRole(roleCode)) {
      return redirectTo(request, homePathForRole(roleCode));
    }

    return response;
  }

  const needsRoleGuard = Object.values(ROLE_ROUTE_PREFIX)
    .flat()
    .some((prefix) => pathname.startsWith(prefix));

  if (user && needsRoleGuard) {
    const roleCode = await getRoleCode(user.id);
    if (!roleCode) {
      return redirectTo(request, "/forbidden");
    }

    const allowedPrefixes = ROLE_ROUTE_PREFIX[roleCode] ?? [];
    const allowed = allowedPrefixes.some((prefix) => pathname.startsWith(prefix));
    if (!allowed) {
      return redirectTo(request, "/forbidden");
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
