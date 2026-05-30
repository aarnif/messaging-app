import { test, expect } from "@playwright/test";
import { resetDatabaseAndOpenApp } from "./helpers/funcs";

test.describe("App", () => {
  test.beforeEach(async ({ page, request }) => {
    await resetDatabaseAndOpenApp(page, request);
  });

  test("has correct page title", async ({ page }) => {
    await expect(page).toHaveTitle(/Messaging App/);
  });

  test("displays 404 page for invalid route and allows navigation back", async ({
    page,
  }) => {
    await page.goto("http://localhost:5173/invalid-route");

    await expect(page.getByText("404")).toBeVisible();
    await expect(page.getByText("Page Not Found")).toBeVisible();

    await page.getByRole("button", { name: "Go Back", exact: true }).click();

    await expect(page).toHaveTitle(/Messaging App/);
  });
});
