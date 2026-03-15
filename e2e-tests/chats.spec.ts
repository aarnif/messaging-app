import { test, expect } from "@playwright/test";
import {
  resetDatabaseAndOpenApp,
  createUserViaApi,
  loginViaApi,
  addContactsViaApi,
  createChatViaApi,
  signIn,
  logout,
  addContacts,
  blockContact,
  sendMessage,
  createPrivateChat,
  createGroupChat,
  editGroupChat,
  assertErrorNotifyAndClose,
} from "./helpers/funcs";
import { user1, user2, user3, user4 } from "./helpers/data";

test.describe("Chats", () => {
  test.beforeEach(async ({ page, request }) => {
    await resetDatabaseAndOpenApp(page, request);

    await createUserViaApi(request, user1);
    await createUserViaApi(request, user2);
    await createUserViaApi(request, user3);
    await createUserViaApi(request, user4);
    await signIn(page, user1.username, user1.password);

    await expect(
      page.getByText("Select Chat to Start Messaging."),
    ).toBeVisible();

    await loginViaApi(request, user1.username, user1.password);
    await addContactsViaApi(request, ["2", "3", "4"]);
    await page.getByTestId("chats-nav-item").click();
  });

  test.describe("Creation", () => {
    test("prevents creation without contact", async ({ page }) => {
      await createPrivateChat(page);

      await assertErrorNotifyAndClose(
        page,
        "Please select a contact to create a chat with",
      );
    });

    test("prevents creation with a contact that has blocked user", async ({
      page,
      request,
    }) => {
      await loginViaApi(request, user2.username, user2.password);
      await addContactsViaApi(request, ["1"]);

      await logout(page);
      await signIn(page, user2.username, user2.password);
      await page.getByTestId("contacts-nav-item").click();
      await page.getByRole("link", { name: user1.username }).click();
      await blockContact(page);

      await logout(page);
      await signIn(page, user1.username, user1.password);
      await createPrivateChat(page, user2);

      await assertErrorNotifyAndClose(page, "Contact has blocked you.");
    });

    test("can create a private chat", async ({ page }) => {
      await createPrivateChat(page, user2, "Hello World!");

      await expect(page.getByText("User1: Hello World!")).toBeVisible();
    });

    test("prevents creation without name", async ({ page }) => {
      await createGroupChat(page, "", "New Group Chat Description", []);

      await assertErrorNotifyAndClose(
        page,
        "Chat name must be at least three characters long",
      );
    });

    test("prevents creation without members", async ({ page }) => {
      await createGroupChat(
        page,
        "New Group Chat",
        "New Group Chat Description",
        [],
      );

      await assertErrorNotifyAndClose(
        page,
        "Chat must have at least two members",
      );
    });

    test("prevents creation with one additional member", async ({ page }) => {
      await createGroupChat(
        page,
        "New Group Chat",
        "New Group Chat Description",
        [user2],
      );

      await assertErrorNotifyAndClose(
        page,
        "Chat must have at least two members",
      );
    });

    test("can create a group chat", async ({ page }) => {
      await createGroupChat(
        page,
        "New Group Chat",
        "New Group Chat Description",
        [user2, user3],
        "Hello World!",
      );

      await expect(
        page.getByRole("link", { name: "New Group Chat" }),
      ).toBeVisible();
      await expect(page.getByText("User1: Hello World!")).toBeVisible();
    });
  });

  test.describe("Filtering", () => {
    test.beforeEach(async ({ page, request }) => {
      await loginViaApi(request, user1.username, user1.password);
      await createChatViaApi(request, ["2"], "Hello World!", null, null);
      await createChatViaApi(
        request,
        ["3", "4"],
        "Hello World!",
        "New Group Chat",
        "New Group Chat Description",
      );
    });
    test("can search private chats by name", async ({ page }) => {
      await page
        .getByPlaceholder("Search by title or description...")
        .fill(user2.name);

      await expect(
        page.getByRole("link", { name: new RegExp(user2.name) }),
      ).toBeVisible();
      await expect(
        page.getByRole("link", { name: "New Group Chat" }),
      ).not.toBeVisible();
    });

    test("can search group chats by name", async ({ page }) => {
      await page
        .getByPlaceholder("Search by title or description...")
        .fill("New Group Chat");

      await expect(
        page.getByRole("link", { name: "New Group Chat" }),
      ).toBeVisible();
      await expect(
        page.getByRole("link", { name: new RegExp(user2.name) }),
      ).not.toBeVisible();
    });

    test("can search group chats by description", async ({ page }) => {
      await page
        .getByPlaceholder("Search by title or description...")
        .fill("New Group Chat Description");

      await expect(
        page.getByRole("link", { name: "New Group Chat" }),
      ).toBeVisible();
      await expect(
        page.getByRole("link", { name: new RegExp(user2.name) }),
      ).not.toBeVisible();
    });
  });

  test.describe("Messages", () => {
    test.beforeEach(async ({ page, request }) => {
      await loginViaApi(request, user1.username, user1.password);
      await createChatViaApi(
        request,
        ["2", "3"],
        "Hello World!",
        "New Group Chat",
        "New Group Chat Description",
      );

      await expect(
        page.getByRole("link", { name: "New Group Chat" }),
      ).toBeVisible();
      await expect(page.getByText("User1: Hello World!")).toBeVisible();
      await page.getByRole("link", { name: "New Group Chat" }).click();
    });

    test("prevents sending an empty message to existing chat", async ({
      page,
    }) => {
      await sendMessage(page, "");
      await expect(page.getByText("User1: Hello World!")).toBeVisible();
    });

    test("can send a message to existing chat", async ({ page }) => {
      await sendMessage(page, "Another message.");
      await expect(page.getByText("User1: Another message.")).toBeVisible();
    });

    test("marks chat as read when opened", async ({ page }) => {
      const testCases = [
        { user: user2, unreadCount: "1", message: "Message from user2" },
        { user: user3, unreadCount: "2", message: "Message from user3" },
      ];

      for (const { user, unreadCount, message } of testCases) {
        await logout(page);
        await signIn(page, user.username, user.password);

        await expect(page.getByTestId("unread-messages-badge")).toBeVisible();
        await expect(page.getByTestId("unread-messages-badge")).toHaveText(
          unreadCount,
        );

        await page
          .getByRole("link", { name: new RegExp("New Group Chat") })
          .click();

        await expect(
          page.getByTestId("unread-messages-badge"),
        ).not.toBeVisible();

        await sendMessage(page, message);
      }
    });

    test("can open edit mode for own message", async ({ page }) => {
      await page.getByTestId("current-user-message").hover();
      await page.getByTestId("message-menu-button").click();
      await page.getByRole("button", { name: "Edit" }).click();

      const editMessageInput = page.getByTestId("edit-message-input");

      await expect(editMessageInput).toBeVisible();
      await expect(editMessageInput).toHaveValue("Hello World!");
    });

    test("can cancel editing message", async ({ page }) => {
      await page.pause();
      await page.getByTestId("current-user-message").hover();
      await page.getByTestId("message-menu-button").click();
      await page.getByRole("button", { name: "Edit" }).click();

      const editMessageInput = page.getByTestId("edit-message-input");
      await editMessageInput.fill("Edited message");

      await page.getByTestId("cancel-edit-message-button").click();

      await expect(editMessageInput).not.toBeVisible();
      await expect(
        page.getByTestId("current-user-message").getByText("Hello World!"),
      ).toBeVisible();
    });

    test("can edit a message", async ({ page }) => {
      await page.pause();
      await page.getByTestId("current-user-message").hover();
      await page.getByTestId("message-menu-button").click();
      await page.getByRole("button", { name: "Edit" }).click();

      const editMessageInput = page.getByTestId("edit-message-input");
      await editMessageInput.fill("Edited message");

      await page.getByTestId("submit-edit-message-button").click();

      await expect(editMessageInput).not.toBeVisible();
      await expect(
        page.getByTestId("current-user-message").getByText("Edited message"),
      ).toBeVisible();
    });

    test("can open delete confirm modal for own message", async ({ page }) => {
      await page.getByTestId("current-user-message").hover();
      await page.getByTestId("message-menu-button").click();
      await page.getByRole("button", { name: "Delete" }).click();

      await expect(page.getByText("Delete Message?")).toBeVisible();
      await expect(
        page.getByText("Are you sure you want to delete the message?"),
      ).toBeVisible();
    });

    test("can cancel deleting message", async ({ page }) => {
      await page.getByTestId("current-user-message").hover();
      await page.getByTestId("message-menu-button").click();
      await page.getByRole("button", { name: "Delete" }).click();

      await expect(page.getByText("Delete Message?")).toBeVisible();
      await expect(
        page.getByText("Are you sure you want to delete the message?"),
      ).toBeVisible();

      await page.getByRole("button", { name: "Cancel" }).click();

      await expect(page.getByText("Delete Message?")).not.toBeVisible();
      await expect(
        page.getByTestId("current-user-message").getByText("Hello World!"),
      ).toBeVisible();
    });

    test("can delete a message", async ({ page }) => {
      await page.getByTestId("current-user-message").hover();
      await page.getByTestId("message-menu-button").click();
      await page.getByRole("button", { name: "Delete" }).click();

      await expect(page.getByText("Delete Message?")).toBeVisible();
      await expect(
        page.getByText("Are you sure you want to delete the message?"),
      ).toBeVisible();

      await page.getByRole("button", { name: "Delete" }).click();

      await expect(page.getByText("Delete Message?")).not.toBeVisible();
      await expect(
        page
          .getByTestId("current-user-message")
          .getByText("This message was deleted."),
      ).toBeVisible();
    });

    test("cannot delete another user's message", async ({ page }) => {
      await page.pause();
      await logout(page);
      await signIn(page, user2.username, user2.password);
      await page
        .getByRole("link", { name: new RegExp("New Group Chat") })
        .click();

      await page.getByTestId("contact-message").hover();

      await expect(page.getByTestId("message-menu-button")).not.toBeVisible();
    });
  });

  test.describe("Editing", () => {
    test.beforeEach(async ({ page, request }) => {
      await loginViaApi(request, user1.username, user1.password);
      await createChatViaApi(
        request,
        ["2", "3"],
        "Hello World!",
        "New Group Chat",
        "New Group Chat Description",
      );
      await expect(
        page.getByRole("link", { name: "New Group Chat" }),
      ).toBeVisible();
      await expect(page.getByText("User1: Hello World!")).toBeVisible();
      await page.getByRole("link", { name: "New Group Chat" }).click();
    });

    test("prevents editing with empty chat name", async ({ page }) => {
      await editGroupChat(page, "", "", [user2, user3]);

      await assertErrorNotifyAndClose(
        page,
        "Chat name must be at least three characters long",
      );
    });

    test("can edit group chat details", async ({ page }) => {
      await editGroupChat(
        page,
        "Edited Group Chat Name",
        "Edited Group Chat Description",
        [user2, user3],
      );

      await expect(page.getByTestId("chat-info-name")).toHaveText(
        "Edited Group Chat Name",
      );

      await expect(
        page.getByText("Edited Group Chat Description"),
      ).toBeVisible();

      await expect(page.getByText("3 members")).toBeVisible();
    });

    test("can add chat members", async ({ page }) => {
      await editGroupChat(
        page,
        "New Group Chat",
        "New Group Chat Description",
        [user2, user3, user4],
      );

      await expect(page.getByTestId("chat-info-name")).toHaveText(
        "New Group Chat",
      );

      await expect(page.getByText("New Group Chat Description")).toBeVisible();

      await expect(page.getByText("4 members")).toBeVisible();
    });

    test("can remove chat members", async ({ page }) => {
      await editGroupChat(
        page,
        "New Group Chat",
        "New Group Chat Description",
        [user2],
      );

      await expect(page.getByTestId("chat-info-name")).toHaveText(
        "New Group Chat",
      );

      await expect(page.getByText("New Group Chat Description")).toBeVisible();

      await expect(page.getByText("2 members")).toBeVisible();
    });
  });
});
