import { test, expect } from "@playwright/test";
import {
  signUp,
  signIn,
  signUpMultipleUsers,
  logout,
  addContacts,
  blockContact,
  sendMessage,
  createPrivateChat,
  createGroupChat,
  editGroupChat,
  editProfile,
  changePassword,
  openAppearanceSettings,
  assertErrorNotifyAndClose,
} from "./helpers/funcs";
import { user1, user2, user3, user4 } from "./helpers/data";

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

  test.describe("Users", () => {
    test.describe("Creation", () => {
      test("prevents user creation with empty fields", async ({ page }) => {
        await signUp(page, "", "", "");
        await assertErrorNotifyAndClose(page, "Please fill all fields");
      });

      test("prevents user creation with invalid username", async ({ page }) => {
        await signUp(page, "u", user1.password, user1.confirmPassword);
        await assertErrorNotifyAndClose(
          page,
          "Username must be at least 3 characters long"
        );
      });

      test("prevents user creation with invalid password", async ({ page }) => {
        await signUp(page, user1.username, "passw", user1.confirmPassword);
        await assertErrorNotifyAndClose(
          page,
          "Password must be at least 6 characters long"
        );
      });

      test("prevents user creation with non-matching passwords", async ({
        page,
      }) => {
        await signUp(page, user1.username, user1.password, "passwor");
        await assertErrorNotifyAndClose(page, "Passwords do not match");
      });

      test("can create a new user", async ({ page }) => {
        await signUp(
          page,
          user1.username,
          user1.password,
          user1.confirmPassword
        );
        await expect(
          page.getByText("Select Chat to Start Messaging.")
        ).toBeVisible();
      });

      test("prevents creating duplicate user", async ({ page }) => {
        await signUp(
          page,
          user1.username,
          user1.password,
          user1.confirmPassword
        );
        await logout(page);
        await signUp(
          page,
          user1.username,
          user1.password,
          user1.confirmPassword
        );
        await assertErrorNotifyAndClose(page, "Username already exists");
      });
    });

    test.describe("Authentication", () => {
      test.beforeEach(async ({ page }) => {
        await signUp(
          page,
          user1.username,
          user1.password,
          user1.confirmPassword
        );
        await logout(page);
      });

      test("prevents sign in with empty credentials", async ({ page }) => {
        await page.getByRole("button", { name: "Sign In" }).click();
        await assertErrorNotifyAndClose(page, "Please fill all fields.");
      });

      test("prevents sign in with invalid username", async ({ page }) => {
        await signIn(page, "invalid", user1.password);
        await assertErrorNotifyAndClose(page, "Invalid username or password");
      });

      test("prevents sign in with invalid password", async ({ page }) => {
        await signIn(page, user1.username, "invalid");
        await assertErrorNotifyAndClose(page, "Invalid username or password");
      });

      test("can sign in with valid credentials", async ({ page }) => {
        await signIn(page, user1.username, user1.password);
        await expect(
          page.getByText("Select Chat to Start Messaging.")
        ).toBeVisible();
      });
    });

    test.describe("Editing", () => {
      test.beforeEach(async ({ page }) => {
        await signUp(
          page,
          user1.username,
          user1.password,
          user1.confirmPassword
        );
      });

      test("prevents editing with empty profile name", async ({ page }) => {
        await editProfile(page, "");

        await assertErrorNotifyAndClose(
          page,
          "Profile name must be at least three characters long"
        );
      });

      test("can edit profile info", async ({ page }) => {
        await editProfile(page, "New Name", "Hi! I am using this app!");

        await expect(page.getByText("New Name")).toBeVisible();
        await expect(page.getByText("Hi! I am using this app!")).toBeVisible();
      });

      test("prevents sending empty change password info", async ({ page }) => {
        await changePassword(page, "", "", "");

        await assertErrorNotifyAndClose(page, "Please fill all fields.");
      });

      test("prevents change password with non-matching passwords", async ({
        page,
      }) => {
        await changePassword(page, user1.password, "newPassword", "newPasswor");

        await assertErrorNotifyAndClose(page, "Passwords do not match");
      });

      test("prevents change password with wrong current password", async ({
        page,
      }) => {
        await changePassword(
          page,
          "wrongPassword",
          "newPassword",
          "newPassword"
        );

        await assertErrorNotifyAndClose(
          page,
          "Current password does not match"
        );
      });
    });
  });

  test.describe("Contacts", () => {
    test.beforeEach(async ({ page }) => {
      await signUpMultipleUsers(page, [user1, user2, user3]);
      await signIn(page, user1.username, user1.password);

      await expect(
        page.getByText("Select Chat to Start Messaging.")
      ).toBeVisible();
    });

    test("can add a contact", async ({ page }) => {
      await addContacts(page, [user2]);

      await expect(
        page.getByRole("link", { name: new RegExp(user2.name) })
      ).toBeVisible();
    });

    test("can add several contacts", async ({ page }) => {
      const users = [user2, user3];
      await addContacts(page, users);

      for (const user of users) {
        await expect(
          page.getByRole("link", { name: new RegExp(user.name) })
        ).toBeVisible();
      }
    });

    test("can search contacts by name", async ({ page }) => {
      await addContacts(page, [user2, user3]);

      await page
        .getByPlaceholder("Search by name or username...")
        .fill(user2.name);

      await expect(
        page.getByRole("link", { name: new RegExp(user2.name) })
      ).toBeVisible();
      await expect(
        page.getByRole("link", { name: new RegExp(user3.name) })
      ).not.toBeVisible();
    });

    test("can search contacts by username", async ({ page }) => {
      await addContacts(page, [user2, user3]);

      await page
        .getByPlaceholder("Search by name or username...")
        .fill(user3.username);

      await expect(
        page.getByRole("link", { name: new RegExp(user3.name) })
      ).toBeVisible();
      await expect(
        page.getByRole("link", { name: new RegExp(user2.name) })
      ).not.toBeVisible();
    });

    test("shows no contacts found message when search has no results", async ({
      page,
    }) => {
      await addContacts(page, [user2, user3]);

      await page
        .getByPlaceholder("Search by name or username...")
        .fill("nonexistent");

      await expect(page.getByText("No contacts found.")).toBeVisible();
      await expect(
        page.getByRole("link", { name: new RegExp(user2.name) })
      ).not.toBeVisible();
      await expect(
        page.getByRole("link", { name: new RegExp(user3.name) })
      ).not.toBeVisible();
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
      await page.getByRole("link", { name: user2.username }).click();
      await page.getByRole("button", { name: "Remove Contact" }).click();
      await page.getByRole("button", { name: "Remove", exact: true }).click();

      await expect(page.getByText("No contacts found.")).toBeVisible();
    });
  });

  test.describe("Chats", () => {
    test.beforeEach(async ({ page }) => {
      await signUpMultipleUsers(page, [user1, user2, user3, user4]);
      await signIn(page, user1.username, user1.password);

      await expect(
        page.getByText("Select Chat to Start Messaging.")
      ).toBeVisible();

      await addContacts(page, [user2, user3, user4]);
      await page.getByTestId("chats-nav-item").click();
    });

    test.describe("Filtering", () => {
      test.beforeEach(async ({ page }) => {
        await createPrivateChat(page, user2, "Hello World!");
        await createGroupChat(
          page,
          "New Group Chat",
          "New Group Chat Description",
          [user3, user4],
          "Hello World!"
        );
      });

      test("can search private chats by name", async ({ page }) => {
        await page
          .getByPlaceholder("Search by title or description...")
          .fill(user2.name);

        await expect(
          page.getByRole("link", { name: new RegExp(user2.name) })
        ).toBeVisible();
        await expect(
          page.getByRole("link", { name: "New Group Chat" })
        ).not.toBeVisible();
      });

      test("can search group chats by name", async ({ page }) => {
        await page
          .getByPlaceholder("Search by title or description...")
          .fill("New Group Chat");

        await expect(
          page.getByRole("link", { name: "New Group Chat" })
        ).toBeVisible();
        await expect(
          page.getByRole("link", { name: new RegExp(user2.name) })
        ).not.toBeVisible();
      });

      test("can search group chats by description", async ({ page }) => {
        await page
          .getByPlaceholder("Search by title or description...")
          .fill("New Group Chat Description");

        await expect(
          page.getByRole("link", { name: "New Group Chat" })
        ).toBeVisible();
        await expect(
          page.getByRole("link", { name: new RegExp(user2.name) })
        ).not.toBeVisible();
      });
    });

    test.describe("Creation", () => {
      test("prevents creation without contact", async ({ page }) => {
        await createPrivateChat(page);

        await assertErrorNotifyAndClose(
          page,
          "Please select a contact to create a chat with"
        );
      });

      test("prevents creation with a contact that has blocked user", async ({
        page,
      }) => {
        await logout(page);
        await signIn(page, user2.username, user2.password);
        await addContacts(page, [user1]);
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
          "Chat name must be at least three characters long"
        );
      });

      test("prevents creation without members", async ({ page }) => {
        await createGroupChat(
          page,
          "New Group Chat",
          "New Group Chat Description",
          []
        );

        await assertErrorNotifyAndClose(
          page,
          "Chat must have at least two members"
        );
      });

      test("prevents creation with one additional member", async ({ page }) => {
        await createGroupChat(
          page,
          "New Group Chat",
          "New Group Chat Description",
          [user2]
        );

        await assertErrorNotifyAndClose(
          page,
          "Chat must have at least two members"
        );
      });

      test("can create a group chat", async ({ page }) => {
        await createGroupChat(
          page,
          "New Group Chat",
          "New Group Chat Description",
          [user2, user3],
          "Hello World!"
        );

        await expect(
          page.getByRole("link", { name: "New Group Chat" })
        ).toBeVisible();
        await expect(page.getByText("User1: Hello World!")).toBeVisible();
      });
    });

    test.describe("Messages", () => {
      test.beforeEach(async ({ page }) => {
        await createGroupChat(
          page,
          "New Group Chat",
          "New Group Chat Description",
          [user2, user3],
          "Hello World!"
        );

        await expect(
          page.getByRole("link", { name: "New Group Chat" })
        ).toBeVisible();
        await expect(page.getByText("User1: Hello World!")).toBeVisible();
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
            unreadCount
          );

          await page
            .getByRole("link", { name: new RegExp("New Group Chat") })
            .click();

          await expect(
            page.getByTestId("unread-messages-badge")
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
    });

    test.describe("Editing", () => {
      test.beforeEach(async ({ page }) => {
        await createGroupChat(
          page,
          "New Group Chat",
          "New Group Chat Description",
          [user2, user3],
          "Hello World!"
        );
      });

      test("prevents editing with empty chat name", async ({ page }) => {
        await expect(
          page.getByRole("link", { name: "New Group Chat" })
        ).toBeVisible();
        await expect(page.getByText("User1: Hello World!")).toBeVisible();

        await editGroupChat(page, "", "", [user2, user3]);

        await assertErrorNotifyAndClose(
          page,
          "Chat name must be at least three characters long"
        );
      });

      test("can edit group chat details", async ({ page }) => {
        await expect(
          page.getByRole("link", { name: "New Group Chat" })
        ).toBeVisible();
        await expect(page.getByText("User1: Hello World!")).toBeVisible();

        await editGroupChat(
          page,
          "Edited Group Chat Name",
          "Edited Group Chat Description",
          [user2, user3]
        );

        await expect(page.getByTestId("chat-info-name")).toHaveText(
          "Edited Group Chat Name"
        );

        await expect(
          page.getByText("Edited Group Chat Description")
        ).toBeVisible();

        await expect(page.getByText("3 members")).toBeVisible();
      });

      test("can add chat members", async ({ page }) => {
        await expect(
          page.getByRole("link", { name: "New Group Chat" })
        ).toBeVisible();
        await expect(page.getByText("User1: Hello World!")).toBeVisible();

        await editGroupChat(
          page,
          "New Group Chat",
          "New Group Chat Description",
          [user2, user3, user4]
        );

        await expect(page.getByTestId("chat-info-name")).toHaveText(
          "New Group Chat"
        );

        await expect(
          page.getByText("New Group Chat Description")
        ).toBeVisible();

        await expect(page.getByText("4 members")).toBeVisible();
      });

      test("can remove chat members", async ({ page }) => {
        await expect(
          page.getByRole("link", { name: "New Group Chat" })
        ).toBeVisible();
        await expect(page.getByText("User1: Hello World!")).toBeVisible();

        await editGroupChat(
          page,
          "New Group Chat",
          "New Group Chat Description",
          [user2]
        );

        await expect(page.getByTestId("chat-info-name")).toHaveText(
          "New Group Chat"
        );

        await expect(
          page.getByText("New Group Chat Description")
        ).toBeVisible();

        await expect(page.getByText("2 members")).toBeVisible();
      });
    });
  });

  test.describe("Settings", () => {
    test.beforeEach(async ({ page }) => {
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
        page.getByText("Select Chat to Start Messaging.")
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
});
