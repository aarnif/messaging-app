import { test, expect } from "@playwright/test";
import {
  resetDatabaseAndOpenApp,
  signUp,
  logout,
  addContacts,
  createPrivateChat,
  openAppearanceSettings,
} from "./helpers/funcs";
import { user1, user2 } from "./helpers/data";

test.describe("Settings", () => {
  test.beforeEach(async ({ page, request }) => {
    await resetDatabaseAndOpenApp(page, request);

    await signUp(page, user1.username, user1.password, user1.confirmPassword);
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

  test("can toggle 24 hour clock", async ({ page }) => {
    await logout(page);
    await signUp(page, user2.username, user2.password, user2.confirmPassword);

    await expect(
      page.getByText("Select Chat to Start Messaging."),
    ).toBeVisible();

    await addContacts(page, [user1]);
    await page.getByTestId("chats-nav-item").click();
    await createPrivateChat(page, user1, "Hello World!");

    await expect(page.getByText(/AM|PM/)).not.toBeVisible();

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
