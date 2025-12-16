import { test, expect } from "@playwright/test";

test.describe("App", () => {
  test("has correct page title", async ({ page }) => {
    await page.goto("http://localhost:5173");
    await expect(page).toHaveTitle(/Messaging App/);
  });
});
