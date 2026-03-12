import { test, expect } from "@playwright/test";
import { resetDatabaseAndOpenApp } from "./helpers/funcs";

test.describe("App", () => {
  test.beforeEach(async ({ page, request }) => {
    await resetDatabaseAndOpenApp(page, request);
  });

  test("has correct page title", async ({ page }) => {
    await expect(page).toHaveTitle(/Messaging App/);
  });
});
