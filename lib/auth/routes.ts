import type { AppRole } from "@/lib/auth/types";

export function homePathForRole(role: AppRole): string {
  if (role === "student") {
    return "/student";
  }

  if (role === "faculty") {
    return "/faculty";
  }

  return "/admin";
}

export function mapLegacyDashboardPath(pathname: string): string | null {
  if (pathname === "/dashboard") {
    return null;
  }

  if (pathname.startsWith("/dashboard/student")) {
    return pathname.replace("/dashboard/student", "/student");
  }

  if (pathname.startsWith("/dashboard/faculty")) {
    return pathname.replace("/dashboard/faculty", "/faculty");
  }

  if (pathname.startsWith("/dashboard/admin")) {
    return pathname.replace("/dashboard/admin", "/admin");
  }

  if (pathname.startsWith("/dashboard/courses")) {
    return pathname.replace("/dashboard/courses", "/courses");
  }

  return null;
}
