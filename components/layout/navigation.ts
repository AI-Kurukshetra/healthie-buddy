import type { AppRole } from "@/lib/auth/types";

export type AppNavItem = {
  label: string;
  href: string;
  matchPrefixes?: string[];
};

const ROLE_NAVIGATION: Record<AppRole, AppNavItem[]> = {
  student: [
    { label: "Dashboard", href: "/student" },
    { label: "Courses", href: "/courses" },
    { label: "Enrollments", href: "/student/enrollments" },
    { label: "Transcript", href: "/student/transcript" },
  ],
  faculty: [
    { label: "Dashboard", href: "/faculty" },
    { label: "Sections", href: "/faculty/sections" },
    { label: "Gradebook", href: "/faculty/gradebook", matchPrefixes: ["/faculty/gradebook", "/faculty/sections/"] },
  ],
  admin: [
    { label: "Dashboard", href: "/admin" },
    { label: "Courses", href: "/courses" },
    { label: "Users", href: "/admin/users" },
  ],
};

const ROLE_LABELS: Record<AppRole, string> = {
  student: "Student",
  faculty: "Faculty",
  admin: "Admin",
};

export function getRoleNavigation(role: AppRole): AppNavItem[] {
  return ROLE_NAVIGATION[role];
}

export function getRoleLabel(role: AppRole): string {
  return ROLE_LABELS[role];
}

export function isNavItemActive(pathname: string, item: AppNavItem) {
  if (item.matchPrefixes?.some((prefix) => pathname.startsWith(prefix))) {
    return true;
  }

  return pathname === item.href;
}
