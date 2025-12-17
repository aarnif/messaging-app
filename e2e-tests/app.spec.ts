import { test, expect } from "@playwright/test";
import { signUp } from "./helpers";

test.describe("App", () => {
  test.beforeEach(async ({ page, request }) => {
    await page.goto("http://localhost:5173");
  });

  test("has correct page title", async ({ page }) => {
    await expect(page).toHaveTitle(/Messaging App/);
  });

  test("prevents user creation with invalid username", async ({ page }) => {
    await signUp(page, "u", "password", "password");

    await expect(
      page.getByText("Username must be at least 3 characters long")
    ).toBeVisible();
  });
});
