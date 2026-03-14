import { test, expect } from "@playwright/test";
import {
  resetDatabaseAndOpenApp,
  createUserViaApi,
  loginViaApi,
  addContactsViaApi,
  signIn,
  addContacts,
  blockContact,
} from "./helpers/funcs";
import { user1, user2, user3 } from "./helpers/data";

test.describe("Contacts", () => {
  test.beforeEach(async ({ page, request }) => {
    await resetDatabaseAndOpenApp(page, request);

    await createUserViaApi(request, user1);
    await createUserViaApi(request, user2);
    await createUserViaApi(request, user3);
    await signIn(page, user1.username, user1.password);

    await expect(
      page.getByText("Select Chat to Start Messaging."),
    ).toBeVisible();
  });

  test("can add a contact", async ({ page }) => {
    await addContacts(page, [user2]);

    await expect(
      page.getByRole("link", { name: new RegExp(user2.name) }),
    ).toBeVisible();
  });

  test("can add several contacts", async ({ page }) => {
    const users = [user2, user3];
    await addContacts(page, users);

    for (const user of users) {
      await expect(
        page.getByRole("link", { name: new RegExp(user.name) }),
      ).toBeVisible();
    }
  });

  test("can search contacts by name", async ({ page, request }) => {
    await loginViaApi(request, user1.username, user1.password);
    await addContactsViaApi(request, ["2", "3"]);
    await page.getByTestId("contacts-nav-item").click();

    await page
      .getByPlaceholder("Search by name or username...")
      .fill(user2.name);

    await expect(
      page.getByRole("link", { name: new RegExp(user2.name) }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: new RegExp(user3.name) }),
    ).not.toBeVisible();
  });

  test("can search contacts by username", async ({ page, request }) => {
    await loginViaApi(request, user1.username, user1.password);
    await addContactsViaApi(request, ["2", "3"]);
    await page.getByTestId("contacts-nav-item").click();

    await page
      .getByPlaceholder("Search by name or username...")
      .fill(user3.username);

    await expect(
      page.getByRole("link", { name: new RegExp(user3.name) }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: new RegExp(user2.name) }),
    ).not.toBeVisible();
  });

  test("shows no contacts found message when search has no results", async ({
    page,
    request,
  }) => {
    await loginViaApi(request, user1.username, user1.password);
    await addContactsViaApi(request, ["2", "3"]);
    await page.getByTestId("contacts-nav-item").click();

    await page
      .getByPlaceholder("Search by name or username...")
      .fill("nonexistent");

    await expect(page.getByText("No contacts found.")).toBeVisible();
    await expect(
      page.getByRole("link", { name: new RegExp(user2.name) }),
    ).not.toBeVisible();
    await expect(
      page.getByRole("link", { name: new RegExp(user3.name) }),
    ).not.toBeVisible();
  });

  test("can toggle block a contact", async ({ page, request }) => {
    await loginViaApi(request, user1.username, user1.password);
    await addContactsViaApi(request, ["2"]);
    await page.getByTestId("contacts-nav-item").click();

    await page.getByRole("link", { name: user2.username }).click();
    await blockContact(page);

    await page.getByRole("button", { name: "Unblock Contact" }).click();
    await page.getByRole("button", { name: "Unblock", exact: true }).click();

    await expect(
      page.getByText("You have blocked the contact."),
    ).not.toBeVisible();
  });

  test("can remove a contact", async ({ page, request }) => {
    await loginViaApi(request, user1.username, user1.password);
    await addContactsViaApi(request, ["2"]);
    await page.getByTestId("contacts-nav-item").click();

    await page.getByRole("link", { name: user2.username }).click();
    await page.getByRole("button", { name: "Remove Contact" }).click();
    await page.getByRole("button", { name: "Remove", exact: true }).click();

    await expect(page.getByText("No contacts found.")).toBeVisible();
  });
});
