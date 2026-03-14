import { beforeEach, describe, expect, it, vi } from "vitest";

type RedirectSignal = Error & {
  location?: string;
};

function createRedirectSignal(location: string): RedirectSignal {
  const error = new Error("NEXT_REDIRECT") as RedirectSignal;
  error.location = location;
  return error;
}

const { redirectMock, createClientMock, createAdminClientMock } = vi.hoisted(() => ({
  redirectMock: vi.fn((location: string) => {
    throw createRedirectSignal(location);
  }),
  createClientMock: vi.fn(),
  createAdminClientMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: createClientMock,
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: createAdminClientMock,
}));

import { loginAction, logoutAction, registerAction } from "@/app/(auth)/actions";

describe("auth actions", () => {
  beforeEach(() => {
    redirectMock.mockClear();
    createClientMock.mockReset();
    createAdminClientMock.mockReset();
  });

  it("redirects invalid login payloads before calling Supabase", async () => {
    const formData = new FormData();
    formData.set("email", "");
    formData.set("password", "");

    await expect(loginAction(formData)).rejects.toMatchObject({
      location: "/login?error=invalid_input",
    });
    expect(createClientMock).not.toHaveBeenCalled();
  });

  it("redirects invalid register payloads before calling Supabase", async () => {
    const formData = new FormData();
    formData.set("fullName", "Demo User");
    formData.set("email", "demo@example.com");
    formData.set("password", "Demo@12345");
    formData.set("role", "observer");

    await expect(registerAction(formData)).rejects.toMatchObject({
      location: "/register?error=invalid_input",
    });
    expect(createClientMock).not.toHaveBeenCalled();
    expect(createAdminClientMock).not.toHaveBeenCalled();
  });

  it("signs out and redirects to login", async () => {
    const signOutMock = vi.fn().mockResolvedValue({ error: null });
    createClientMock.mockResolvedValue({
      auth: {
        signOut: signOutMock,
      },
    });

    await expect(logoutAction()).rejects.toMatchObject({
      location: "/login",
    });
    expect(createClientMock).toHaveBeenCalledTimes(1);
    expect(signOutMock).toHaveBeenCalledTimes(1);
  });
});
