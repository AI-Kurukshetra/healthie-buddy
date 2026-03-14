export const APP_ROLES = ["student", "faculty", "admin"] as const;

export type AppRole = (typeof APP_ROLES)[number];

export type SessionUser = {
  id: string;
  email: string;
  fullName: string;
  role: AppRole;
};

export function isAppRole(value: string): value is AppRole {
  return APP_ROLES.includes(value as AppRole);
}
