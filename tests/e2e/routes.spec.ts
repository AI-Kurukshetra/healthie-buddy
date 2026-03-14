import { expect, test } from "@playwright/test";

test.describe("Auth and route guards", () => {
  test("login page renders role selector", async ({ page }) => {
    await page.goto("/login");

    await expect(page.getByRole("heading", { name: "Login" })).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();

    const roleSelect = page.getByLabel("Role");
    await expect(roleSelect).toBeVisible();
    await expect(roleSelect.locator('option[value="student"]')).toHaveText("Student");
    await expect(roleSelect.locator('option[value="faculty"]')).toHaveText("Faculty");
    await expect(roleSelect.locator('option[value="admin"]')).toHaveText("Admin");
  });

  test("register page renders required fields and role options", async ({ page }) => {
    await page.goto("/register");

    await expect(page.getByRole("heading", { name: "Register" })).toBeVisible();
    await expect(page.getByLabel("Full name")).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();

    const roleSelect = page.getByLabel("Role");
    await expect(roleSelect).toBeVisible();
    await expect(roleSelect.locator('option[value="student"]')).toHaveText("Student");
    await expect(roleSelect.locator('option[value="faculty"]')).toHaveText("Faculty");
    await expect(roleSelect.locator('option[value="admin"]')).toHaveText("Admin");
  });

  test("auth cross-links work", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("link", { name: "Create account" }).click();
    await expect(page).toHaveURL(/\/register$/);

    await page.getByRole("link", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/login$/);
  });

  test.describe("unauthenticated guards", () => {
    const guardedPaths = [
      "/",
      "/dashboard",
      "/dashboard/student",
      "/dashboard/faculty",
      "/dashboard/admin",
    ];

    for (const path of guardedPaths) {
      test(`redirects ${path} to /login`, async ({ page }) => {
        await page.goto(path);
        await expect(page).toHaveURL(/\/login$/);
      });
    }
  });

  test("direct /forbidden path is not routable (special 403 boundary file)", async ({
    page,
  }) => {
    await page.goto("/forbidden");
    await expect(page.getByRole("heading", { name: "404" })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "This page could not be found." }),
    ).toBeVisible();
  });
});
