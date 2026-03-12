import { test, expect } from "@playwright/test";
import {
  signUp,
  signIn,
  logout,
  editProfile,
  changePassword,
  assertErrorNotifyAndClose,
} from "./helpers/funcs";
import { user1 } from "./helpers/data";

test.describe("Users", () => {
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

  test.describe("Creation", () => {
    test("prevents user creation with empty fields", async ({ page }) => {
      await signUp(page, "", "", "");
      await assertErrorNotifyAndClose(page, "Please fill all fields");
    });

    test("prevents user creation with invalid username", async ({ page }) => {
      await signUp(page, "u", user1.password, user1.confirmPassword);
      await assertErrorNotifyAndClose(
        page,
        "Username must be at least 3 characters long",
      );
    });

    test("prevents user creation with invalid password", async ({ page }) => {
      await signUp(page, user1.username, "passw", user1.confirmPassword);
      await assertErrorNotifyAndClose(
        page,
        "Password must be at least 6 characters long",
      );
    });

    test("prevents user creation with non-matching passwords", async ({
      page,
    }) => {
      await signUp(page, user1.username, user1.password, "passwor");
      await assertErrorNotifyAndClose(page, "Passwords do not match");
    });

    test("can create a new user", async ({ page }) => {
      await signUp(page, user1.username, user1.password, user1.confirmPassword);
      await expect(
        page.getByText("Select Chat to Start Messaging."),
      ).toBeVisible();
    });

    test("prevents creating duplicate user", async ({ page }) => {
      await signUp(page, user1.username, user1.password, user1.confirmPassword);
      await logout(page);
      await signUp(page, user1.username, user1.password, user1.confirmPassword);
      await assertErrorNotifyAndClose(page, "Username already exists");
    });
  });

  test.describe("Authentication", () => {
    test.beforeEach(async ({ page }) => {
      await signUp(page, user1.username, user1.password, user1.confirmPassword);
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
        page.getByText("Select Chat to Start Messaging."),
      ).toBeVisible();
    });
  });

  test.describe("Editing", () => {
    test.beforeEach(async ({ page }) => {
      await signUp(page, user1.username, user1.password, user1.confirmPassword);
    });

    test("prevents editing with empty profile name", async ({ page }) => {
      await editProfile(page, "");

      await assertErrorNotifyAndClose(
        page,
        "Profile name must be at least three characters long",
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
      await changePassword(page, "wrongPassword", "newPassword", "newPassword");

      await assertErrorNotifyAndClose(page, "Current password does not match");
    });
  });
});
