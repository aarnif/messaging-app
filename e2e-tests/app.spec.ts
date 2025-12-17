import { test, expect } from "@playwright/test";

test.describe("App", () => {
  test.beforeEach(async ({ page, request }) => {
    await page.goto("http://localhost:5173");
  });

  test("has correct page title", async ({ page }) => {
    await expect(page).toHaveTitle(/Messaging App/);
  });

  test("prevents user creation with invalid username", async ({ page }) => {
    await page.getByText("Sign Up").click();

    await page.getByRole("textbox", { name: "Username" }).fill("u");
    await page
      .getByRole("textbox", { name: "Password", exact: true })
      .fill("password");

    await page
      .getByRole("textbox", { name: "Confirm Password" })
      .fill("password");

    await page.getByRole("button", { name: "Sign Up" }).click();

    await expect(
      page.getByText("Username must be at least 3 characters long")
    ).toBeVisible();
  });
});
