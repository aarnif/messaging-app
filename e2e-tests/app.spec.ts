import { test, expect } from "@playwright/test";
import {
  signUp,
  signIn,
  logout,
  addContacts,
  blockContact,
  openPrivateChatModal,
  openGroupChatModal,
} from "./helpers/funcs";
import { user1, user2, user3 } from "./helpers/data";

test.describe("App", () => {
  test.beforeEach(async ({ page, request }) => {
    await request.post("http://localhost:4000/", {
      data: {
        query: `
        mutation Mutation {
          resetDatabase
        }
      `,
      },
    });
    await page.goto("http://localhost:5173");
  });

  test("has correct page title", async ({ page }) => {
    await expect(page).toHaveTitle(/Messaging App/);
  });

  test.describe("User Creation", () => {
    test("prevents user creation with empty fields", async ({ page }) => {
      await signUp(page, "", "", "");

      await expect(page.getByText("Please fill all fields")).toBeVisible();
    });

    test("prevents user creation with invalid username", async ({ page }) => {
      await signUp(page, "u", user1.password, user1.confirmPassword);

      await expect(
        page.getByText("Username must be at least 3 characters long")
      ).toBeVisible();
    });

    test("prevents user creation with invalid password", async ({ page }) => {
      await signUp(page, user1.username, "passw", user1.confirmPassword);

      await expect(
        page.getByText("Password must be at least 6 characters long")
      ).toBeVisible();
    });

    test("prevents user creation with non-matching passwords", async ({
      page,
    }) => {
      await signUp(page, user1.username, user1.password, "passwor");

      await expect(page.getByText("Passwords do not match")).toBeVisible();
    });

    test("can create a new user", async ({ page }) => {
      await signUp(page, user1.username, user1.password, user1.confirmPassword);
      await expect(
        page.getByText("Select Chat to Start Messaging.")
      ).toBeVisible();
    });

    test("prevents creating duplicate user", async ({ page }) => {
      await signUp(page, user1.username, user1.password, user1.confirmPassword);
      await logout(page);
      await signUp(page, user1.username, user1.password, user1.confirmPassword);

      await expect(page.getByText("Username already exists")).toBeVisible();
    });
  });

  test.describe("User Sign In", () => {
    test.beforeEach(async ({ page }) => {
      await signUp(page, user1.username, user1.password, user1.confirmPassword);
      await logout(page);
    });

    test("prevents sign in with empty credentials", async ({ page }) => {
      await page.getByRole("button", { name: "Sign In" }).click();

      await expect(page.getByText("Please fill all fields.")).toBeVisible();
    });

    test("prevents sign in with invalid username", async ({ page }) => {
      await signIn(page, "invalid", user1.password);

      await expect(
        page.getByText("Invalid username or password")
      ).toBeVisible();
    });

    test("prevents sign in with invalid password", async ({ page }) => {
      await signIn(page, user1.username, "invalid");

      await expect(
        page.getByText("Invalid username or password")
      ).toBeVisible();
    });

    test("can sign in with valid credentials", async ({ page }) => {
      await signIn(page, user1.username, user1.password);

      await expect(
        page.getByText("Select Chat to Start Messaging.")
      ).toBeVisible();
    });
  });

  test.describe("Contacts", () => {
    test.beforeEach(async ({ page }) => {
      for (const user of [user1, user2, user3]) {
        await signUp(page, user.username, user.password, user.confirmPassword);
        await logout(page);
      }

      await signIn(page, user1.username, user1.password);

      await expect(
        page.getByText("Select Chat to Start Messaging.")
      ).toBeVisible();
    });

    test("can add a contact", async ({ page }) => {
      await addContacts(page, [user2]);

      await expect(page.getByText(/User2/)).toBeVisible();
      await expect(page.getByText(/@user2/)).toBeVisible();
    });

    test("can add several contacts", async ({ page }) => {
      const users = [user2, user3];
      await addContacts(page, users);

      for (const user of users) {
        await expect(page.getByText(new RegExp(user.username))).toBeVisible();
        await expect(
          page.getByText(new RegExp(`@${user.username}`))
        ).toBeVisible();
      }
    });

    test("can toggle block a contact", async ({ page }) => {
      await addContacts(page, [user2]);

      await page.getByRole("link", { name: user2.username }).click();
      await blockContact(page);

      await page.getByRole("button", { name: "Unblock Contact" }).click();
      await page.getByRole("button", { name: "Unblock", exact: true }).click();

      await expect(
        page.getByText("You have blocked the contact.")
      ).not.toBeVisible();
    });

    test("can remove a contact", async ({ page }) => {
      await addContacts(page, [user2]);

      await page.pause();

      await page.getByRole("link", { name: user2.username }).click();
      await page.getByRole("button", { name: "Remove Contact" }).click();
      await page.getByRole("button", { name: "Remove", exact: true }).click();

      await expect(page.getByText("No contacts found.")).toBeVisible();
    });
  });

  test.describe("Chats", () => {
    test.beforeEach(async ({ page }) => {
      for (const user of [user1, user2, user3]) {
        await signUp(page, user.username, user.password, user.confirmPassword);
        await logout(page);
      }

      await signIn(page, user1.username, user1.password);

      await expect(
        page.getByText("Select Chat to Start Messaging.")
      ).toBeVisible();
      await addContacts(page, [user2, user3]);
      await page.getByTestId("chats-nav-item").click();
    });

    test("prevents private chat creation without contact", async ({ page }) => {
      await openPrivateChatModal(page);

      await page.getByTestId("create-chat-button").click();

      await expect(
        page.getByText("Please select a contact to create a chat with")
      ).toBeVisible();
    });

    test("prevents private chat creation with a contact that has blocked user", async ({
      page,
    }) => {
      await logout(page);
      await signIn(page, user2.username, user2.password);

      await addContacts(page, [user1]);

      await page.getByRole("link", { name: user1.username }).click();
      await blockContact(page);

      await logout(page);
      await signIn(page, user1.username, user1.password);

      await openPrivateChatModal(page);

      await page.getByRole("button", { name: user2.username }).click();
      await page.getByTestId("create-chat-button").click();

      await expect(page.getByText("Contact has blocked you.")).toBeVisible();
    });

    test("can create a private chat", async ({ page }) => {
      await openPrivateChatModal(page);

      await page.getByRole("button", { name: user2.username }).click();
      await page.getByTestId("create-chat-button").click();
      await page.getByTestId("message-input").fill("Hello World!");
      await page.getByTestId("send-message-button").click();

      await expect(page.getByText("User1: Hello World!")).toBeVisible();
    });

    test("prevents group chat creation without name", async ({ page }) => {
      await openGroupChatModal(page);

      await page.getByTestId("create-chat-button").click();

      await expect(
        page.getByText("Chat name must be at least three characters long")
      ).toBeVisible();
    });

    test("prevents group chat creation without members", async ({ page }) => {
      await openGroupChatModal(page);

      await page
        .getByRole("textbox", { name: "Name", exact: true })
        .fill("New Group Chat");

      await page.getByTestId("create-chat-button").click();

      await expect(
        page.getByText("Chat must have at least two members")
      ).toBeVisible();
    });

    test("prevents group chat creation with one additional member", async ({
      page,
    }) => {
      await openGroupChatModal(page);

      await page
        .getByRole("textbox", { name: "Name", exact: true })
        .fill("New Group Chat");

      await page.getByRole("button", { name: user2.username }).click();
      await page.getByTestId("create-chat-button").click();

      await expect(
        page.getByText("Chat must have at least two members")
      ).toBeVisible();
    });

    test("can create a group chat", async ({ page }) => {
      await openGroupChatModal(page);

      await page
        .getByRole("textbox", { name: "Name", exact: true })
        .fill("New Group Chat");

      await page.getByRole("button", { name: user2.username }).click();
      await page.getByRole("button", { name: user3.username }).click();

      await page.getByTestId("create-chat-button").click();
      await page.getByTestId("message-input").fill("Hello World!");
      await page.getByTestId("send-message-button").click();

      await expect(page.getByText("New Group Chat")).toBeVisible();
      await expect(page.getByText("User1: Hello World!")).toBeVisible();
    });
  });
});
