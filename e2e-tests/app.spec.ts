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
        await expect(page.getByText("Please fill all fields")).toBeVisible();
        await page.getByTestId("close-notify-message").click();
        await expect(
          page.getByText("Please fill all fields")
        ).not.toBeVisible();
      });

      test("prevents user creation with invalid username", async ({ page }) => {
        await signUp(page, "u", user1.password, user1.confirmPassword);
        await expect(
          page.getByText("Username must be at least 3 characters long")
        ).toBeVisible();
        await page.getByTestId("close-notify-message").click();
        await expect(
          page.getByText("Username must be at least 3 characters long")
        ).not.toBeVisible();
      });

      test("prevents user creation with invalid password", async ({ page }) => {
        await signUp(page, user1.username, "passw", user1.confirmPassword);
        await expect(
          page.getByText("Password must be at least 6 characters long")
        ).toBeVisible();
        await page.getByTestId("close-notify-message").click();
        await expect(
          page.getByText("Password must be at least 6 characters long")
        ).not.toBeVisible();
      });

      test("prevents user creation with non-matching passwords", async ({
        page,
      }) => {
        await signUp(page, user1.username, user1.password, "passwor");
        await expect(page.getByText("Passwords do not match")).toBeVisible();
        await page.getByTestId("close-notify-message").click();
        await expect(
          page.getByText("Passwords do not match")
        ).not.toBeVisible();
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
        await expect(page.getByText("Username already exists")).toBeVisible();
        await page.getByTestId("close-notify-message").click();
        await expect(
          page.getByText("Username already exists")
        ).not.toBeVisible();
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
        await expect(page.getByText("Please fill all fields.")).toBeVisible();
        await page.getByTestId("close-notify-message").click();
        await expect(
          page.getByText("Please fill all fields.")
        ).not.toBeVisible();
      });

      test("prevents sign in with invalid username", async ({ page }) => {
        await signIn(page, "invalid", user1.password);
        await expect(
          page.getByText("Invalid username or password")
        ).toBeVisible();
        await page.getByTestId("close-notify-message").click();
        await expect(
          page.getByText("Invalid username or password")
        ).not.toBeVisible();
      });

      test("prevents sign in with invalid password", async ({ page }) => {
        await signIn(page, user1.username, "invalid");
        await expect(
          page.getByText("Invalid username or password")
        ).toBeVisible();
        await page.getByTestId("close-notify-message").click();
        await expect(
          page.getByText("Invalid username or password")
        ).not.toBeVisible();
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

        await expect(
          page.getByText("Profile name must be at least three characters long")
        ).toBeVisible();
        await page.getByTestId("close-notify-message").click();
        await expect(
          page.getByText("Profile name must be at least three characters long")
        ).not.toBeVisible();
      });

      test("can edit profile info", async ({ page }) => {
        await editProfile(page, "New Name", "Hi! I am using this app!");

        await expect(page.getByText("New Name")).toBeVisible();
        await expect(page.getByText("Hi! I am using this app!")).toBeVisible();
      });

      test("prevents sending empty change password info", async ({ page }) => {
        await changePassword(page, "", "", "");

        await expect(page.getByText("Please fill all fields.")).toBeVisible();
        await page.getByTestId("close-notify-message").click();
        await expect(
          page.getByText("Please fill all fields.")
        ).not.toBeVisible();
      });

      test("prevents change password with non-matching passwords", async ({
        page,
      }) => {
        await changePassword(page, user1.password, "newPassword", "newPasswor");

        await expect(page.getByText("Passwords do not match")).toBeVisible();
        await page.getByTestId("close-notify-message").click();
        await expect(
          page.getByText("Passwords do not match")
        ).not.toBeVisible();
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

        await expect(
          page.getByText("Current password does not match")
        ).toBeVisible();
        await page.getByTestId("close-notify-message").click();
        await expect(
          page.getByText("Current password does not match")
        ).not.toBeVisible();
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

    test.describe("Creation", () => {
      test("prevents creation without contact", async ({ page }) => {
        await createPrivateChat(page);

        await expect(
          page.getByText("Please select a contact to create a chat with")
        ).toBeVisible();
        await page.getByTestId("close-notify-message").click();
        await expect(
          page.getByText("Please select a contact to create a chat with")
        ).not.toBeVisible();
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

        await expect(page.getByText("Contact has blocked you.")).toBeVisible();
        await page.getByTestId("close-notify-message").click();
        await expect(
          page.getByText("Contact has blocked you.")
        ).not.toBeVisible();
      });

      test("can create a private chat", async ({ page }) => {
        await createPrivateChat(page, user2, "Hello World!");

        await expect(page.getByText("User1: Hello World!")).toBeVisible();
      });

      test("prevents creation without name", async ({ page }) => {
        await createGroupChat(page, "", "New Group Chat Description", []);

        await expect(
          page.getByText("Chat name must be at least three characters long")
        ).toBeVisible();
        await page.getByTestId("close-notify-message").click();
        await expect(
          page.getByText("Chat name must be at least three characters long")
        ).not.toBeVisible();
      });

      test("prevents creation without members", async ({ page }) => {
        await createGroupChat(
          page,
          "New Group Chat",
          "New Group Chat Description",
          []
        );

        await expect(
          page.getByText("Chat must have at least two members")
        ).toBeVisible();
        await page.getByTestId("close-notify-message").click();
        await expect(
          page.getByText("Chat must have at least two members")
        ).not.toBeVisible();
      });

      test("prevents creation with one additional member", async ({ page }) => {
        await createGroupChat(
          page,
          "New Group Chat",
          "New Group Chat Description",
          [user2]
        );

        await expect(
          page.getByText("Chat must have at least two members")
        ).toBeVisible();
        await page.getByTestId("close-notify-message").click();
        await expect(
          page.getByText("Chat must have at least two members")
        ).not.toBeVisible();
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
      test("prevents sending an empty message to existing chat", async ({
        page,
      }) => {
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

        await sendMessage(page, "");
        await expect(page.getByText("User1: Hello World!")).toBeVisible();
      });

      test("can send a message to existing chat", async ({ page }) => {
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

        await sendMessage(page, "Another message.");
        await expect(page.getByText("User1: Another message.")).toBeVisible();
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

        await expect(
          page.getByText("Chat name must be at least three characters long")
        ).toBeVisible();
        await page.getByTestId("close-notify-message").click();
        await expect(
          page.getByText("Chat name must be at least three characters long")
        ).not.toBeVisible();
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
      for (const user of [user1, user2]) {
        await signUp(page, user.username, user.password, user.confirmPassword);
        await logout(page);
      }
      await signIn(page, user1.username, user1.password);

      await expect(
        page.getByText("Select Chat to Start Messaging.")
      ).toBeVisible();

      await addContacts(page, [user2]);
      await page.getByTestId("chats-nav-item").click();
      await createPrivateChat(page, user2, "Hello World!");

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
