import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { NextResponse } from "next/server";

const AUTH_ROUTES = ["/login", "/register"];
const PROTECTED_PREFIXES = ["/dashboard"];

const ROLE_ROUTE_PREFIX: Record<string, string[]> = {
  student: ["/dashboard/student"],
  faculty: ["/dashboard/faculty"],
  admin: ["/dashboard/admin"],
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

  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));
  const isProtectedRoute = PROTECTED_PREFIXES.some((route) =>
    pathname.startsWith(route),
  );

  if (!user && isProtectedRoute) {
    return redirectTo(request, "/login");
  }

  if (user && isAuthRoute) {
    return redirectTo(request, "/dashboard");
  }

  const needsRoleGuard = Object.values(ROLE_ROUTE_PREFIX)
    .flat()
    .some((prefix) => pathname.startsWith(prefix));

  if (user && needsRoleGuard) {
    const { data: userRow } = await supabase
      .from("users")
      .select("role_id")
      .eq("id", user.id)
      .maybeSingle<{ role_id: string }>();

    if (!userRow?.role_id) {
      return redirectTo(request, "/forbidden");
    }

    const { data: roleRow } = await supabase
      .from("roles")
      .select("code")
      .eq("id", userRow.role_id)
      .maybeSingle<{ code: string }>();

    const roleCode = roleRow?.code;
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
