import { test, expect } from "@playwright/test";
import {
  resetDatabaseAndOpenApp,
  createUserViaApi,
  loginViaApi,
  addContactsViaApi,
  createChatViaApi,
  signIn,
  openAppearanceSettings,
} from "./helpers/funcs";
import { user1, user2 } from "./helpers/data";

test.describe("Settings", () => {
  test.beforeEach(async ({ page, request }) => {
    await resetDatabaseAndOpenApp(page, request);
    await createUserViaApi(request, user1);
    await signIn(page, user1.username, user1.password);
  });

  test("can toggle dark mode", async ({ page }) => {
    await openAppearanceSettings(page);

    const htmlElement = page.locator("html");
    await expect(htmlElement).not.toHaveClass(/dark/);

    await page.getByTestId("toggle-dark-mode").click();
    await expect(htmlElement).toHaveClass(/dark/);

    await page.getByTestId("toggle-dark-mode").click();
    await expect(htmlElement).not.toHaveClass(/dark/);
  });

  test("can toggle 24 hour clock", async ({ page, request }) => {
    await loginViaApi(request, user1.username, user1.password);
    await createUserViaApi(request, user2);
    await addContactsViaApi(request, ["2"]);
    await createChatViaApi(request, ["2"], "Hello World!", null, null);

    await openAppearanceSettings(page);
    await page.getByTestId("toggle-clock-mode").click();
    await page.getByTestId("chats-nav-item").click();

    await expect(page.getByText(/AM|PM/)).toBeVisible();

    await openAppearanceSettings(page);
    await page.getByTestId("toggle-clock-mode").click();
    await page.getByTestId("chats-nav-item").click();

    await expect(page.getByText(/AM|PM/)).not.toBeVisible();
  });
});
