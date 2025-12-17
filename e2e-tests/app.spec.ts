import { test, expect } from "@playwright/test";
import { signUp, logout } from "./helpers/funcs";
import { user1 } from "./helpers/data";

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

    test("prevents creating duplicate user", async ({ page, request }) => {
      await signUp(page, user1.username, user1.password, user1.confirmPassword);
      await logout(page);
      await signUp(page, user1.username, user1.password, user1.confirmPassword);

      await expect(page.getByText("Username already exists")).toBeVisible();
    });
  });

  test.describe("User Sign In", () => {
    test("prevents sign in with empty credentials", async ({ page }) => {
      await signUp(page, user1.username, user1.password, user1.confirmPassword);
      await logout(page);
      await page.getByRole("button", { name: "Sign In" }).click();

      await expect(page.getByText("Please fill all fields.")).toBeVisible();
    });
  });
});
